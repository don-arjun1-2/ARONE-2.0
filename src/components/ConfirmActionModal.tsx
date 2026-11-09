import React from 'react';
import { AlertTriangle, Check, X, ShieldAlert } from 'lucide-react';

export interface ConfirmationRequest {
  title: string;
  description: string;
  impactLevel: 'low' | 'medium' | 'high';
  actionLabel: string;
  payloadDetails?: Record<string, string>;
  onConfirm: () => void;
  onCancel: () => void;
}

interface ConfirmActionModalProps {
  request: ConfirmationRequest | null;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({ request }) => {
  if (!request) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-cyan-500/40 bg-[#060c20] p-6 shadow-[0_0_50px_rgba(0,229,255,0.2)] text-slate-100">
        {/* Holographic Header Bar */}
        <div className="flex items-center gap-3 pb-4 border-b border-cyan-900/60">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            {request.impactLevel === 'high' ? (
              <ShieldAlert className="w-5 h-5 text-amber-400 animate-pulse" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-cyan-400" />
            )}
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest uppercase text-cyan-400">
              Protocol Authorization Required
            </div>
            <h3 className="text-base font-semibold text-slate-100">{request.title}</h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-3">
          <p className="text-sm text-slate-300 leading-relaxed">{request.description}</p>

          {request.payloadDetails && Object.keys(request.payloadDetails).length > 0 && (
            <div className="rounded-xl border border-cyan-950 bg-black/40 p-3 space-y-1.5 font-mono text-xs">
              {Object.entries(request.payloadDetails).map(([key, val]) => (
                <div key={key} className="flex justify-between items-start gap-4">
                  <span className="text-cyan-400/80 shrink-0 capitalize">{key}:</span>
                  <span className="text-slate-200 text-right truncate">{val}</span>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-300/90 flex items-start gap-2">
            <span className="font-semibold shrink-0">Note:</span>
            <span>
              This operation executes directly via your authenticated Google Workspace session.
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-cyan-950/60">
          <button
            type="button"
            onClick={request.onCancel}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Abort Directive</span>
          </button>
          <button
            type="button"
            onClick={request.onConfirm}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all hover:scale-[1.02]"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{request.actionLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
