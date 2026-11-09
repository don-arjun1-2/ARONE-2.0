/**
 * Google Workspace APIs (Calendar & Gmail) client-side utility.
 * Direct authenticated calls using the in-memory OAuth Bearer token.
 */

export interface CalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
  status?: string;
}

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailMessageItem {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
  unread: boolean;
}

/**
 * Fetch upcoming calendar events from Google Calendar API
 */
export async function fetchCalendarEvents(
  token: string,
  maxResults = 10
): Promise<CalendarEventItem[]> {
  const now = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
    now
  )}&singleEvents=true&orderBy=startTime&maxResults=${maxResults}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Calendar API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    id: item.id,
    summary: item.summary || '(Untitled Event)',
    description: item.description,
    location: item.location,
    start: item.start || {},
    end: item.end || {},
    htmlLink: item.htmlLink,
    status: item.status,
  }));
}

/**
 * Schedule a new event on primary calendar (Requires explicit user confirmation before calling)
 */
export async function createCalendarEvent(
  token: string,
  event: {
    summary: string;
    description?: string;
    location?: string;
    startIso: string;
    endIso: string;
  }
): Promise<CalendarEventItem> {
  const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
  const payload = {
    summary: event.summary,
    description: event.description || '',
    location: event.location || '',
    start: {
      dateTime: event.startIso,
    },
    end: {
      dateTime: event.endIso,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create calendar event (${res.status}): ${err}`);
  }

  return await res.json();
}

/**
 * Delete a calendar event (Requires explicit user confirmation before calling)
 */
export async function deleteCalendarEvent(token: string, eventId: string): Promise<void> {
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(
    eventId
  )}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok && res.status !== 404) {
    const err = await res.text();
    throw new Error(`Failed to delete calendar event (${res.status}): ${err}`);
  }
}

/**
 * Fetch recent Gmail messages (metadata + snippets)
 */
export async function fetchRecentGmailMessages(
  token: string,
  maxResults = 10,
  query = ''
): Promise<GmailMessageItem[]> {
  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}${
    query ? `&q=${encodeURIComponent(query)}` : ''
  }`;

  const listRes = await fetch(listUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!listRes.ok) {
    const err = await listRes.text();
    throw new Error(`Gmail API list error (${listRes.status}): ${err}`);
  }

  const listData = await listRes.json();
  const messages: any[] = listData.messages || [];

  if (messages.length === 0) {
    return [];
  }

  // Fetch details for up to 10 messages in parallel
  const detailPromises = messages.slice(0, 10).map(async (msg) => {
    try {
      const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`;
      const res = await fetch(detailUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) return null;
      const data = await res.json();
      const headers: GmailHeader[] = data.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      const labelIds: string[] = data.labelIds || [];
      const isUnread = labelIds.includes('UNREAD');

      return {
        id: data.id,
        threadId: data.threadId,
        snippet: data.snippet || '',
        subject: getHeader('Subject') || '(No Subject)',
        from: getHeader('From') || '(Unknown Sender)',
        date: getHeader('Date') || '',
        unread: isUnread,
      } as GmailMessageItem;
    } catch {
      return null;
    }
  });

  const results = await Promise.all(detailPromises);
  return results.filter((item): item is GmailMessageItem => item !== null);
}

/**
 * Helper to encode unicode string to base64url
 */
function base64UrlEncode(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Send an email via Gmail API (Requires explicit user confirmation before calling)
 */
export async function sendGmailMessage(
  token: string,
  email: {
    to: string;
    subject: string;
    body: string;
  }
): Promise<{ id: string; threadId: string }> {
  // Construct RFC 2822 email format
  const rfcEmail = [
    `To: ${email.to}`,
    `Subject: ${email.subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    email.body,
  ].join('\r\n');

  const raw = base64UrlEncode(rfcEmail);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to send email (${res.status}): ${err}`);
  }

  return await res.json();
}

/**
 * Synthesize today's workspace data for ARONE executive context
 */
export function buildWorkspaceContextSummary(
  events: CalendarEventItem[],
  emails: GmailMessageItem[]
): string {
  const parts: string[] = [];

  parts.push(`--- GOOGLE CALENDAR (${events.length} UPCOMING EVENTS) ---`);
  if (events.length === 0) {
    parts.push('No upcoming events scheduled on primary calendar.');
  } else {
    events.slice(0, 5).forEach((ev, i) => {
      const timeStr = ev.start.dateTime
        ? new Date(ev.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : ev.start.date || 'All Day';
      parts.push(
        `${i + 1}. [${timeStr}] ${ev.summary}${ev.location ? ` @ ${ev.location}` : ''}`
      );
    });
  }

  const unreadEmails = emails.filter((e) => e.unread);
  parts.push(`\n--- GMAIL INBOX (${unreadEmails.length} UNREAD / ${emails.length} RECENT) ---`);
  if (emails.length === 0) {
    parts.push('No recent emails retrieved.');
  } else {
    emails.slice(0, 5).forEach((em, i) => {
      parts.push(
        `${i + 1}. [${em.unread ? 'UNREAD' : 'READ'}] From: ${em.from} | Subject: "${em.subject}" | Preview: "${em.snippet.slice(
          0,
          80
        )}..."`
      );
    });
  }

  return parts.join('\n');
}
