import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  Calendar,
  Mail,
  Send,
  Plus,
  Trash2,
  RefreshCw,
  LogOut,
  Sparkles,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  CalendarEventItem,
  GmailMessageItem,
  createCalendarEvent,
  deleteCalendarEvent,
  sendGmailMessage,
} from '../utils/workspaceApi.ts';
import { ConfirmationRequest } from './ConfirmActionModal.tsx';
import { playAcousticCue } from '../utils/soundFx.ts';

interface WorkspaceHubProps {
  user: User | null;
  accessToken: string | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  events: CalendarEventItem[];
  emails: GmailMessageItem[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onRequestConfirm: (req: ConfirmationRequest) => void;
  onTriggerAroneBriefing: () => void;
}

export const WorkspaceHub: React.FC<WorkspaceHubProps> = ({
  user,
  accessToken,
  onSignIn,
  onSignOut,
  events,
  emails,
  isLoading,
  onRefresh,
  onRequestConfirm,
  onTriggerAroneBriefing,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'gmail'>('calendar');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modal / form states for creating events and sending emails
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    summary: '',
    location: '',
    description: '',
    startDate: new Date().toISOString().slice(0, 10),
    startTime: '10:00',
    endTime: '11:00',
  });

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    body: '',
  });

  const handleSignInClick = async () => {
    setIsSigningIn(true);
    try {
      await onSignIn();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        console.warn('Sign-in status:', err?.message || err);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    const startIso = new Date(`${eventForm.startDate}T${eventForm.startTime}:00`).toISOString();
    const endIso = new Date(`${eventForm.startDate}T${eventForm.endTime}:00`).toISOString();

    onRequestConfirm({
      title: 'Schedule Calendar Event',
      description: `Create new event "${eventForm.summary}" in your primary Google Calendar?`,
      impactLevel: 'low',
      actionLabel: 'Confirm & Schedule',
      payloadDetails: {
        event: eventForm.summary,
        start: `${eventForm.startDate} at ${eventForm.startTime}`,
        end: `${eventForm.startDate} at ${eventForm.endTime}`,
        location: eventForm.location || 'N/A',
      },
      onConfirm: async () => {
        try {
          await createCalendarEvent(accessToken, {
            summary: eventForm.summary,
            location: eventForm.location,
            description: eventForm.description,
            startIso,
            endIso,
          });
          setShowEventModal(false);
          setEventForm({
            summary: '',
            location: '',
            description: '',
            startDate: new Date().toISOString().slice(0, 10),
            startTime: '10:00',
            endTime: '11:00',
          });
          setActionNotice('Calendar event scheduled successfully, boss.');
          playAcousticCue('affirmative');
          await onRefresh();
        } catch (err: any) {
          setActionNotice(`Failed to schedule event: ${err.message}`);
        }
      },
      onCancel: () => {
        playAcousticCue('standby');
      },
    });
  };

  const handleDeleteEventClick = (event: CalendarEventItem) => {
    if (!accessToken) return;

    onRequestConfirm({
      title: 'Delete Calendar Event',
      description: `Are you sure you wish to permanently remove "${event.summary}" from your calendar?`,
      impactLevel: 'medium',
      actionLabel: 'Confirm Delete',
      payloadDetails: {
        event: event.summary,
        id: event.id,
      },
      onConfirm: async () => {
        try {
          await deleteCalendarEvent(accessToken, event.id);
          setActionNotice(`Event "${event.summary}" removed, boss.`);
          playAcousticCue('affirmative');
          await onRefresh();
        } catch (err: any) {
          setActionNotice(`Failed to delete event: ${err.message}`);
        }
      },
      onCancel: () => {
        playAcousticCue('standby');
      },
    });
  };

  const handleSendEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    onRequestConfirm({
      title: 'Dispatch Email Message',
      description: `Send an email message on your behalf from your authenticated Gmail account?`,
      impactLevel: 'medium',
      actionLabel: 'Authorize & Send',
      payloadDetails: {
        recipient: emailForm.to,
        subject: emailForm.subject,
        preview: emailForm.body.slice(0, 60) + '...',
      },
      onConfirm: async () => {
        try {
          await sendGmailMessage(accessToken, emailForm);
          setShowEmailModal(false);
          setEmailForm({ to: '', subject: '', body: '' });
          setActionNotice(`Email sent to ${emailForm.to}, boss.`);
          playAcousticCue('affirmative');
          await onRefresh();
        } catch (err: any) {
          setActionNotice(`Failed to dispatch email: ${err.message}`);
        }
      },
      onCancel: () => {
        playAcousticCue('standby');
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Authentication Bar */}
      <div className="rounded-2xl border border-cyan-500/30 bg-[#040816]/95 backdrop-blur-md p-6 shadow-[0_0_30px_rgba(0,229,255,0.12)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
                WORKSPACE PROTOCOL LINK
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-100 mt-1">
              Google Workspace Command Bridge
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Unified real-time schedule intelligence and correspondence dispatch.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-cyan-950/40 border border-cyan-800/60 rounded-xl px-4 py-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-xs font-bold text-cyan-300">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    (user.displayName || user.email || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-200">
                    {user.displayName || 'Executive User'}
                  </div>
                  <div className="text-[11px] font-mono text-cyan-400/90 truncate max-w-[180px]">
                    {user.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="ml-2 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                  title="Sign out of Google Workspace"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Official Google Sign-In Button as required by skill guidelines */
              <button
                type="button"
                onClick={handleSignInClick}
                disabled={isSigningIn}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-medium text-xs shadow-md transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            )}

            {user && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2.5 rounded-xl border border-cyan-800/80 bg-cyan-950/40 text-cyan-400 hover:bg-cyan-900/50 transition-colors"
                title="Refresh Workspace Data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Action notification toast */}
        {actionNotice && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-cyan-500/40 bg-cyan-950/60 px-4 py-2.5 text-xs text-cyan-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionNotice(null)}
              className="text-cyan-400/80 hover:text-cyan-200 text-xs ml-4"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {!user ? (
        /* Unauthenticated Callout */
        <div className="rounded-2xl border border-cyan-950 bg-[#030612]/80 p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-semibold text-slate-100">
              Workspace Integration On Standby
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect with your Google account to empower ARONE with live schedule visibility and
              email intelligence. ARONE will proactively query your calendar and inbox to summarize
              your agenda and draft communications, with your explicit authorization.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignInClick}
            disabled={isSigningIn}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.25)] transition-all"
          >
            <span>Authorize Google Workspace Session</span>
          </button>
        </div>
      ) : (
        /* Authenticated Workspace Hub */
        <div className="space-y-6">
          {/* Sub Navigation & Quick Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-950/80 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeSubTab === 'calendar'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-cyan-950/30'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Google Calendar</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-400">
                  {events.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('gmail')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeSubTab === 'gmail'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-cyan-950/30'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Gmail Inbox</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-400">
                  {emails.filter((e) => e.unread).length} new
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onTriggerAroneBriefing}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/40 shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Executive Briefing</span>
              </button>

              {activeSubTab === 'calendar' ? (
                <button
                  type="button"
                  onClick={() => setShowEventModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Schedule Event</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowEmailModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Compose Dispatch</span>
                </button>
              )}
            </div>
          </div>

          {/* Sub Tab: Calendar View */}
          {activeSubTab === 'calendar' && (
            <div className="space-y-4">
              {events.length === 0 ? (
                <div className="rounded-xl border border-cyan-950 bg-black/40 p-8 text-center space-y-2">
                  <Clock className="w-8 h-8 text-cyan-500/40 mx-auto" />
                  <p className="text-sm font-medium text-slate-300">
                    No upcoming events found on primary calendar.
                  </p>
                  <p className="text-xs text-slate-500">
                    Your schedule is clear, boss. Use "Schedule Event" above to create an entry.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((evt) => {
                    const timeDisplay = evt.start.dateTime
                      ? `${new Date(evt.start.dateTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} - ${
                          evt.end.dateTime
                            ? new Date(evt.end.dateTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''
                        }`
                      : evt.start.date || 'All Day';

                    return (
                      <div
                        key={evt.id}
                        className="rounded-xl border border-cyan-900/50 bg-[#050b1d]/80 p-4 space-y-2.5 hover:border-cyan-500/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">
                            {evt.summary}
                          </h4>
                          <button
                            type="button"
                            onClick={() => handleDeleteEventClick(evt)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                            title="Delete Event (Requires Confirmation)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{timeDisplay}</span>
                        </div>

                        {evt.location && (
                          <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                            <span>{evt.location}</span>
                          </div>
                        )}

                        {evt.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 pt-1 border-t border-cyan-950/60">
                            {evt.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Sub Tab: Gmail Inbox */}
          {activeSubTab === 'gmail' && (
            <div className="space-y-3">
              {emails.length === 0 ? (
                <div className="rounded-xl border border-cyan-950 bg-black/40 p-8 text-center space-y-2">
                  <Mail className="w-8 h-8 text-cyan-500/40 mx-auto" />
                  <p className="text-sm font-medium text-slate-300">
                    No recent email messages retrieved.
                  </p>
                  <p className="text-xs text-slate-500">
                    Your inbox communications are up to date, sir.
                  </p>
                </div>
              ) : (
                emails.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-xl border p-4 transition-colors ${
                      msg.unread
                        ? 'border-cyan-500/50 bg-[#061026]/90 shadow-[0_0_15px_rgba(0,229,255,0.06)]'
                        : 'border-cyan-950/60 bg-[#030612]/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        {msg.unread && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-200 truncate max-w-xs">
                          {msg.from}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">{msg.date}</span>
                    </div>

                    <h4 className="text-sm font-medium text-slate-100 mt-1">{msg.subject}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {msg.snippet}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal: Schedule Event Form */}
      {showEventModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        >
          <div className="w-full max-w-md rounded-2xl border border-cyan-500/40 bg-[#060c20] p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
              <h3 className="text-base font-semibold text-slate-100">Schedule Calendar Event</h3>
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-cyan-400 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Systems Architecture Sync"
                  value={eventForm.summary}
                  onChange={(e) => setEventForm({ ...eventForm, summary: e.target.value })}
                  className="w-full rounded-lg border border-cyan-900 bg-black/50 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-cyan-400 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={eventForm.startDate}
                    onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                    className="w-full rounded-lg border border-cyan-900 bg-black/50 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="block text-xs font-mono text-cyan-400 mb-1">Start</label>
                    <input
                      type="time"
                      required
                      value={eventForm.startTime}
                      onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                      className="w-full rounded-lg border border-cyan-900 bg-black/50 px-2 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-cyan-400 mb-1">End</label>
                    <input
                      type="time"
                      required
                      value={eventForm.endTime}
                      onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                      className="w-full rounded-lg border border-cyan-900 bg-black/50 px-2 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-cyan-400 mb-1">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Google Meet or Conference Room 4B"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  className="w-full rounded-lg border border-cyan-900 bg-black/50 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-cyan-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Agenda notes..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full rounded-lg border border-cyan-900 bg-black/50 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-md transition-colors"
                >
                  Proceed to Authorization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Compose Email Form */}
      {showEmailModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        >
          <div className="w-full max-w-md rounded-2xl border border-cyan-500/40 bg-[#060c20] p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
              <h3 className="text-base font-semibold text-slate-100">
                Compose Gmail Correspondence
              </h3>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendEmailSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-cyan-400 mb-1">Recipient *</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@domain.com"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                  className="w-full rounded-lg border border-cyan-900 bg-black/50 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-cyan-400 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="Executive Briefing Update"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="w-full rounded-lg border border-cyan-900 bg-black/50 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-cyan-400 mb-1">Message Body *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Directive details..."
                  value={emailForm.body}
                  onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                  className="w-full rounded-lg border border-cyan-900 bg-black/50 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-md transition-colors"
                >
                  Review Directive Authorization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
