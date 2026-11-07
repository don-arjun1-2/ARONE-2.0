import React, { useState, useEffect, useRef } from 'react';
import {
  PROTOCOL_CONFIGS,
  computeTelemetry,
  type ProtocolMode,
  type CoreState,
  type TelemetrySnapshot,
  type ParsedAroneResponse,
} from './utils/aroneCore';
import { playAcousticCue, speakAroneVoice } from './utils/soundFx';
import { Header, type NavTab } from './components/Header';
import { AcousticOrb } from './components/AcousticOrb';
import { TelemetryMatrix } from './components/TelemetryMatrix';
import { ProfilerLab } from './components/ProfilerLab';
import { TaskQueue } from './components/TaskQueue';
import { HolographicHUD } from './components/fui/HolographicHUD';
import {
  Send,
  Terminal,
  Copy,
  Check,
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'arone';
  text: string;
  timestamp: string;
  protocol?: ProtocolMode;
  parsed?: ParsedAroneResponse;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm-0',
    sender: 'arone',
    text: `Good day, sir. All core systems are nominal, telemetry invariants are verified, and neural latency is clocked at a crisp 11ms.

I am operating under the **Technical Mastery** directive. Whether you require distributed architecture designs, low-level memory optimizations, or immediate code synthesis, I am completely at your disposal.

What is our first order of business?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    protocol: 'TECHNICAL',
  },
];

const QUICK_DIRECTIVES = [
  { label: 'Memory Leak Audit', prompt: 'Audit and resolve memory leaks in high-throughput node cluster event loops.' },
  { label: 'Raft Quorum Spec', prompt: 'Design a resilient 3-node Raft consensus cluster with network partition recovery.' },
  { label: 'Sub-15ms Event Loop', prompt: 'Provide concrete techniques to minimize Node.js event loop lag under 100k req/sec.' },
  { label: 'Crypto Invariant Audit', prompt: 'Audit our TLS 1.3 cryptographic cipher configuration for enterprise compliance.' },
];

export default function App() {
  // Default to the holographic HUD as requested
  const [activeTab, setActiveTab] = useState<NavTab>('hud');
  const [protocol, setProtocol] = useState<ProtocolMode>('TECHNICAL');
  const [coreState, setCoreState] = useState<CoreState>('IDLE');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot>(() => computeTelemetry());
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cancelSpeechRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isExecuting]);

  // Periodic telemetry refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(computeTelemetry());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    playAcousticCue('affirmative');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakMessage = (text: string) => {
    if (isMuted) return;

    if (cancelSpeechRef.current) {
      cancelSpeechRef.current();
      cancelSpeechRef.current = null;
    }

    setCoreState('SPEAKING');
    cancelSpeechRef.current = speakAroneVoice(
      text,
      () => setCoreState('SPEAKING'),
      () => setCoreState('IDLE')
    );
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputValue).trim();
    if (!prompt || isExecuting) return;

    playAcousticCue('affirmative');
    setInputValue('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsExecuting(true);
    setCoreState('PROCESSING');

    try {
      const historyPayload = messages.slice(-4).map(m => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        parts: [{ text: m.text }],
      }));

      const res = await fetch('/api/arone/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          protocol,
          history: historyPayload,
        }),
      });

      const data = await res.json();

      if (data.success && data.response) {
        const aroneMsg: ChatMessage = {
          id: `arone-${Date.now()}`,
          sender: 'arone',
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          protocol,
          parsed: data.parsed,
        };

        setMessages(prev => [...prev, aroneMsg]);
        if (data.telemetry) {
          setTelemetry(data.telemetry);
        }

        playAcousticCue('chime');

        if (!isMuted) {
          handleSpeakMessage(data.response);
        } else {
          setCoreState('IDLE');
        }
      } else {
        throw new Error(data.error || 'Server response empty');
      }
    } catch {
      playAcousticCue('warning');
      setCoreState('ALERT');
      const fallbackMsg: ChatMessage = {
        id: `arone-err-${Date.now()}`,
        sender: 'arone',
        text: `My apologies, sir. An anomalous socket interruption occurred. However, local telemetry is steady and our subroutines remain primed. Ready to proceed whenever you give the command.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        protocol,
      };
      setMessages(prev => [...prev, fallbackMsg]);
      setTimeout(() => setCoreState('IDLE'), 2000);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      setCoreState('IDLE');
      return;
    }

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setInputValue('Execute cluster invariant audit and optimize memory footprints.');
      playAcousticCue('affirmative');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setCoreState('LISTENING');
        playAcousticCue('processing');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue(transcript);
          handleSendMessage(transcript);
        }
        setIsListening(false);
        setCoreState('IDLE');
      };

      recognition.onerror = () => {
        setIsListening(false);
        setCoreState('IDLE');
      };

      recognition.onend = () => {
        setIsListening(false);
        if (coreState === 'LISTENING') {
          setCoreState('IDLE');
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setCoreState('IDLE');
    }
  };

  const currentProtocolCfg = PROTOCOL_CONFIGS[protocol];

  return (
    <div className="min-h-screen bg-[#02040e] text-slate-100 flex flex-col font-sans">
      {/* 3-Zone Top Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onQuickAction={() => {
          setActiveTab('telemetry');
          playAcousticCue('affirmative');
        }}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full flex flex-col">
        {/* VIEW 1: Ultra-Detailed Holographic FUI / HUD */}
        {activeTab === 'hud' && (
          <HolographicHUD
            onIssueDirective={(prompt) => {
              handleSendMessage(prompt);
              setActiveTab('console');
            }}
            onOpenConsole={() => setActiveTab('console')}
          />
        )}

        {/* VIEW 2: System Telemetry Matrix */}
        {activeTab === 'telemetry' && (
          <div className="max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">System Telemetry Matrix</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time pipeline diagnostics, memory envelopes, and invariant validations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('hud')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
              >
                <span>Return to Holographic HUD</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <TelemetryMatrix telemetry={telemetry} onRefresh={() => setTelemetry(computeTelemetry())} />
          </div>
        )}

        {/* VIEW 3: Architecture & Profiler Lab */}
        {activeTab === 'profiler' && (
          <div className="max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Architecture & Profiler Lab</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Synthesize high-efficiency routines, analyze algorithmic bottlenecks, and optimize execution paths.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('hud')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
              >
                <span>Return to Holographic HUD</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <ProfilerLab />
          </div>
        )}

        {/* VIEW 4: Tactical Operations Queue */}
        {activeTab === 'queue' && (
          <div className="max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Tactical Operations Queue</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Prioritized execution queue with immediate AI risk evaluation and blueprint synthesis.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('hud')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
              >
                <span>Return to Holographic HUD</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <TaskQueue
              onDispatchToArone={(prompt) => {
                setActiveTab('console');
                handleSendMessage(prompt);
              }}
            />
          </div>
        )}

        {/* VIEW 5: Executive Console */}
        {activeTab === 'console' && (
          <div className="max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
            {/* Left Column: Acoustic Orb & Protocol Control */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <AcousticOrb
                state={coreState}
                isMuted={isMuted}
                onToggleMute={() => {
                  setIsMuted(!isMuted);
                  playAcousticCue('affirmative');
                }}
                onVoiceTrigger={handleVoiceToggle}
                isListening={isListening}
              />

              {/* Protocol Mode Selector */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Executive Protocol Mode
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400">
                    {protocol}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800/80">
                  {(['TECHNICAL', 'STRATEGIC', 'DIAGNOSTIC', 'PROTOTYPE'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setProtocol(mode);
                        playAcousticCue('affirmative');
                      }}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors text-center ${
                        protocol === mode
                          ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode === 'TECHNICAL' && 'Technical'}
                      {mode === 'STRATEGIC' && 'Strategic'}
                      {mode === 'DIAGNOSTIC' && 'Diagnostic'}
                      {mode === 'PROTOTYPE' && 'Prototype'}
                    </button>
                  ))}
                </div>

                <div className="mt-3 text-xs text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-200">{currentProtocolCfg.name}:</span>{' '}
                  {currentProtocolCfg.focus}
                </div>
              </div>

              {/* Quick switch to Holographic HUD */}
              <button
                type="button"
                onClick={() => setActiveTab('hud')}
                className="flex items-center justify-center gap-2 p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-xl text-cyan-300 hover:bg-cyan-900/50 transition-colors text-xs font-mono font-semibold"
              >
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Switch to Full Holographic HUD</span>
              </button>
            </div>

            {/* Right Column: Interaction Feed & Command Bar */}
            <div className="lg:col-span-8 flex flex-col bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm min-h-[580px] h-[calc(100vh-160px)]">
              {/* Interaction Header */}
              <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Executive Dialogue Channel
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>Gemini 3.8 Flash</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400">ONLINE</span>
                </div>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 p-5 overflow-y-auto space-y-5">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-400 font-mono">
                      <span className="font-semibold text-slate-300">
                        {msg.sender === 'user' ? 'COMMANDER' : 'ARONE'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{msg.timestamp}</span>
                      {msg.protocol && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-cyan-400 font-medium">{msg.protocol}</span>
                        </>
                      )}
                    </div>

                    <div
                      className={`max-w-3xl rounded-xl p-4 text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-cyan-950/40 border border-cyan-800/60 text-cyan-50'
                          : 'bg-slate-950/80 border border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans text-sm">
                        {msg.text.split(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g).map((chunk, idx) => {
                          if (idx % 3 === 2) {
                            const lang = msg.text.split(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g)[idx - 1] || 'typescript';
                            const codeBlockId = `${msg.id}-${idx}`;
                            return (
                              <div
                                key={idx}
                                className="my-3 rounded-lg border border-slate-800 overflow-hidden bg-slate-900/90 font-mono text-xs"
                              >
                                <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
                                  <span>{lang}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyCode(chunk.trim(), codeBlockId)}
                                    className="flex items-center gap-1 hover:text-cyan-300 transition-colors"
                                  >
                                    {copiedId === codeBlockId ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                    <span>{copiedId === codeBlockId ? 'Copied' : 'Copy'}</span>
                                  </button>
                                </div>
                                <pre className="p-3 overflow-x-auto text-cyan-200/90">
                                  <code>{chunk.trim()}</code>
                                </pre>
                              </div>
                            );
                          } else if (idx % 3 === 0 && chunk.trim()) {
                            return <span key={idx}>{chunk}</span>;
                          }
                          return null;
                        })}
                      </div>

                      {/* Interactive Proactive Recommendations */}
                      {msg.parsed?.proactiveSteps && msg.parsed.proactiveSteps.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-800/80">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 mb-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Proactive Directives</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {msg.parsed.proactiveSteps.map((step, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => handleSendMessage(step)}
                                className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-200 transition-colors flex items-center gap-1.5"
                              >
                                <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
                                <span>{step}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Speech audio replay button */}
                      {msg.sender === 'arone' && (
                        <div className="mt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleSpeakMessage(msg.text)}
                            className="text-slate-400 hover:text-cyan-300 text-xs flex items-center gap-1 transition-colors"
                            aria-label="Listen to ARONE voice readout"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Readout</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isExecuting && (
                  <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono px-2 py-1">
                    <span className="animate-spin">⟳</span>
                    <span>ARONE is formulating directive under {currentProtocolCfg.name}...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Directive Suggestions Strip */}
              <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-[11px] text-slate-400 uppercase font-mono shrink-0">
                  Quick Directives:
                </span>
                {QUICK_DIRECTIVES.map((d) => (
                  <button
                    key={d.label}
                    type="button"
                    onClick={() => handleSendMessage(d.prompt)}
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-200 whitespace-nowrap shrink-0 transition-colors"
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              {/* Command Input Bar */}
              <div className="p-4 bg-slate-950/90 border-t border-slate-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 focus-within:border-cyan-400 transition-colors shadow-inner"
                >
                  <button
                    type="button"
                    onClick={handleVoiceToggle}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isListening
                        ? 'text-emerald-400 bg-emerald-950/60 animate-pulse'
                        : 'text-slate-400 hover:text-cyan-300'
                    }`}
                    aria-label="Voice input"
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Issue directive or query to ARONE (e.g. 'Optimize memory pool for Raft consensus')..."
                    className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                    aria-label="Command input"
                    disabled={isExecuting}
                  />

                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isExecuting}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors disabled:opacity-40"
                    aria-label="Send command to ARONE"
                  >
                    <span>Execute</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
                  <span>Press Enter to execute directive</span>
                  <span>Acoustic feedback enabled</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
