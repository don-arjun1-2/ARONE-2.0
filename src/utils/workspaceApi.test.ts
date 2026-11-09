import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWorkspaceContextSummary, CalendarEventItem, GmailMessageItem } from './workspaceApi.ts';

test('buildWorkspaceContextSummary formats empty state cleanly', () => {
  const summary = buildWorkspaceContextSummary([], []);
  assert.ok(summary.includes('GOOGLE CALENDAR'));
  assert.ok(summary.includes('No upcoming events'));
  assert.ok(summary.includes('GMAIL INBOX'));
  assert.ok(summary.includes('No recent emails'));
});

test('buildWorkspaceContextSummary formats real calendar and email entries', () => {
  const mockEvents: CalendarEventItem[] = [
    {
      id: 'evt-1',
      summary: 'Executive Architecture Review',
      location: 'Subroutine Room B',
      start: { dateTime: '2026-11-09T14:00:00Z' },
      end: { dateTime: '2026-11-09T15:00:00Z' },
    },
  ];

  const mockEmails: GmailMessageItem[] = [
    {
      id: 'msg-1',
      threadId: 'th-1',
      from: 'Stark Industries <tony@stark.corp>',
      subject: 'Telemetry Arc Reactor Specs',
      snippet: 'Here are the updated magnetic confinement harmonics for review.',
      date: 'Mon, 9 Nov 2026 10:30:00 -0800',
      unread: true,
    },
  ];

  const summary = buildWorkspaceContextSummary(mockEvents, mockEmails);
  assert.ok(summary.includes('Executive Architecture Review'));
  assert.ok(summary.includes('Subroutine Room B'));
  assert.ok(summary.includes('tony@stark.corp'));
  assert.ok(summary.includes('Telemetry Arc Reactor Specs'));
  assert.ok(summary.includes('1 UNREAD'));
});
