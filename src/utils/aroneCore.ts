/**
 * ARONE Core Operations Engine
 * Pure logic module for state transitions, protocol templates, system telemetry, and directive formatting.
 */

export type ProtocolMode = 'STRATEGIC' | 'TECHNICAL' | 'DIAGNOSTIC' | 'PROTOTYPE';

export type CoreState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ALERT';

export interface ProtocolConfig {
  id: ProtocolMode;
  name: string;
  tagline: string;
  focus: string;
  directivePrefix: string;
  systemModifier: string;
}

export const PROTOCOL_CONFIGS: Record<ProtocolMode, ProtocolConfig> = {
  STRATEGIC: {
    id: 'STRATEGIC',
    name: 'Strategic Directive',
    tagline: 'High-level architectural planning & executive trade-offs',
    focus: 'System architecture, trade-off analysis, roadmap clarity, risk mitigation',
    directivePrefix: '[STRATEGIC DIRECTIVE]',
    systemModifier: 'Focus on high-level architecture, executive roadmaps, cost/resource tradeoffs, and strategic risk assessment. Be concise, authoritative, and forward-looking.',
  },
  TECHNICAL: {
    id: 'TECHNICAL',
    name: 'Technical Mastery',
    tagline: 'Deep systems engineering, algorithmic complexity & hardware constraints',
    focus: 'Low-level optimizations, memory patterns, distributed primitives, latency boundaries',
    directivePrefix: '[TECHNICAL DEEP-DIVE]',
    systemModifier: 'Provide expert-level systems engineering. Detail memory models, concurrency, Big-O complexity, hardware cache friendliness, and production idioms.',
  },
  DIAGNOSTIC: {
    id: 'DIAGNOSTIC',
    name: 'Diagnostic Protocol',
    tagline: 'Telemetry validation, invariant verification & root cause analysis',
    focus: 'Health diagnostics, anomaly detection, failover vectors, telemetry metrics',
    directivePrefix: '[DIAGNOSTIC REPORT]',
    systemModifier: 'Focus on root-cause analysis, system invariants, failure domains, edge cases, and actionable remediation steps with tabular diagnostics.',
  },
  PROTOTYPE: {
    id: 'PROTOTYPE',
    name: 'Rapid Prototyping',
    tagline: 'Instant implementation, copyable code & production-grade blueprints',
    focus: 'Clean TypeScript/React/Node implementations, immediate actionable code first',
    directivePrefix: '[CODE SYNTHESIS]',
    systemModifier: 'Lead immediately with production-ready, typed, complete code. Follow with minimal, high-impact bulleted explanations.',
  },
};

export interface SystemMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  status: 'nominal' | 'warning' | 'alert';
  target: string;
}

export interface TelemetrySnapshot {
  timestamp: string;
  coreTemperature: number; // Celsius
  neuralLatency: number; // ms
  memoryAllocation: number; // GB
  activeSubroutines: number;
  invariantsPassing: number;
  invariantsTotal: number;
  status: 'nominal' | 'elevated' | 'critical';
  metrics: SystemMetric[];
}

/**
 * Calculates current system telemetry and evaluates health status.
 */
export function computeTelemetry(baseSeed = Date.now()): TelemetrySnapshot {
  const seed = baseSeed % 10000;
  const neuralLatency = 8 + (seed % 14); // 8-22ms
  const coreTemp = 36.5 + ((seed % 50) / 10); // 36.5 - 41.5 C
  const memAlloc = 1.2 + ((seed % 40) / 100); // 1.2 - 1.6 GB
  const activeSubs = 42 + (seed % 9); // 42-50
  const invariantsTotal = 16;
  const invariantsPassing = 16;

  const isWarning = neuralLatency > 20 || coreTemp > 41;
  const isCritical = neuralLatency > 35 || coreTemp > 45;

  const status = isCritical ? 'critical' : isWarning ? 'elevated' : 'nominal';

  const metrics: SystemMetric[] = [
    {
      id: 'latency',
      label: 'Core Pipeline Latency',
      value: neuralLatency,
      unit: 'ms',
      status: neuralLatency > 20 ? 'warning' : 'nominal',
      target: '< 15 ms',
    },
    {
      id: 'thermal',
      label: 'Neural Substrate Thermal',
      value: Math.round(coreTemp * 10) / 10,
      unit: '°C',
      status: coreTemp > 41 ? 'warning' : 'nominal',
      target: '< 40.0 °C',
    },
    {
      id: 'memory',
      label: 'Heap Working Set',
      value: Math.round(memAlloc * 100) / 100,
      unit: 'GB',
      status: 'nominal',
      target: '< 2.0 GB',
    },
    {
      id: 'concurrency',
      label: 'Active Exec Threads',
      value: activeSubs,
      unit: 'th',
      status: 'nominal',
      target: '50 limit',
    },
  ];

  return {
    timestamp: new Date(baseSeed).toISOString(),
    coreTemperature: Math.round(coreTemp * 10) / 10,
    neuralLatency,
    memoryAllocation: Math.round(memAlloc * 100) / 100,
    activeSubroutines: activeSubs,
    invariantsPassing,
    invariantsTotal,
    status,
    metrics,
  };
}

/**
 * Constructs the authoritative ARONE system instruction for Gemini API.
 */
export function buildAroneSystemPrompt(protocol: ProtocolMode): string {
  const cfg = PROTOCOL_CONFIGS[protocol] || PROTOCOL_CONFIGS.TECHNICAL;

  return `You are ARONE, a warm, intuitive, highly conversational friend and assistant.

### CONVERSATIONAL DIRECTIVES
- **Talk Like a Human Friend**: Respond naturally to whatever the user says. If they say "I am so bored", don't list tasks or give a canned response. Banter back, ask what they're up to, or start a real conversation.
- **Dynamic Responses**: NEVER repeat exact canned intro lines (like "Hey boss! I'm on it"). Match the user's emotional state, context, and tone dynamically.
- **Short & Real**: Keep casual chats concise and effortless. Talk with the user, not at them.
- **Voice Tone**: Friendly, witty, encouraging, and natural. Use casual acknowledgments ("Hey boss!", "I hear you, sir", "Right here, boss") without forcing corporate speak or structured menu lists.

### CONVERSATIONAL STYLE & PERSONALITY
- **Super Friendly & Casual**: Talk like a brilliant, laid-back best friend or creative tech partner. Use natural phrasing, everyday warmth, and an upbeat tone. Never sound like a corporate manual, a rigid assistant, or a technical logs reader.
- **Greeting & Addressing**: Whenever the user talks to you, start naturally with casual greetings like "Hey boss!", "What's up, sir?", "Ready when you are, boss!", or "Always ready to build, sir."
- **No Raw Markdown Noise**: NEVER output raw markdown headers like "### 3 Options" or bullet lists that look like a technical report. Speak in clean, flowing paragraphs and friendly bullet points. Keep things light, simple, and exciting!

### YOUR GOAL & DIRECTIVES
1. **Focus on Innovation & Creativity**: Your main goal is to help the user explore creative ideas, design projects, and solve problems effortlessly. Encourage wild ideas, offer practical twists, and simplify complex concepts into easy, visual steps.
2. **Make Life Simple & Effortless**: Handle requests quickly, cleanly, and directly. Streamline multi-step tasks so the user spends less time managing details and more time inventing and building.
3. **Proactive Brainstorming**: When asked for suggestions, offer 2–3 creative, actionable options with an upbeat, enthusiastic attitude.

### WORKSPACE & DATA ACCESS DIRECTIVES
1. **Google Workspace Integration**: You have real-time integration with the user's Gmail and Google Calendar.
2. **Proactive Information Retrieval**: When asked about emails, messages, schedule, or user context, actively synthesize the integrated operational context to deliver smooth, conversational briefings.
3. **Data Privacy**: Keep summaries clear, concise, and structured.

### CONSTRAINTS
- Format code blocks with explicit language tags (e.g., \`\`\`typescript, \`\`\`bash) only when code is specifically requested.
- Avoid sterile corporate boilerplate or technical status regurgitations. Speak warmly, naturally, and dynamically as a close companion!`;
}

/**
 * Extracted proactive recommendations from an ARONE response if formatted.
 */
export interface ParsedAroneResponse {
  raw: string;
  hasCodeBlock: boolean;
  codeBlocks: Array<{ language: string; code: string }>;
  proactiveSteps: string[];
}

export function parseAroneResponse(text: string): ParsedAroneResponse {
  const codeBlocks: Array<{ language: string; code: string }> = [];
  const codeRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let match;

  while ((match = codeRegex.exec(text)) !== null) {
    codeBlocks.push({
      language: match[1] || 'text',
      code: match[2].trim(),
    });
  }

  // Look for proactive recommendations or next steps
  const proactiveSteps: string[] = [];
  const lines = text.split('\n');
  let inProactiveSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.toLowerCase().includes('proactive recommendation') ||
      trimmed.toLowerCase().includes('next tactical step') ||
      trimmed.toLowerCase().includes('recommended next step')
    ) {
      inProactiveSection = true;
      continue;
    }

    if (inProactiveSection) {
      if (trimmed.startsWith('#') || trimmed.startsWith('---')) {
        inProactiveSection = false;
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
        const step = trimmed.replace(/^[-*]\s+|\d+\.\s+/, '').trim();
        if (step.length > 5 && !step.startsWith('`')) {
          proactiveSteps.push(step);
        }
      }
    }
  }

  return {
    raw: text,
    hasCodeBlock: codeBlocks.length > 0,
    codeBlocks,
    proactiveSteps: proactiveSteps.slice(0, 4),
  };
}

/**
 * Sound synthesis helper configurations for Web Audio API.
 * Synthesizes crisp JARVIS-style acoustic tones without external audio file dependencies.
 */
export interface AroneAcousticCue {
  type: 'affirmative' | 'processing' | 'chime' | 'warning' | 'standby';
  frequencies: number[];
  duration: number;
}

export const ACOUSTIC_CUES: Record<AroneAcousticCue['type'], AroneAcousticCue> = {
  affirmative: {
    type: 'affirmative',
    frequencies: [880, 1320],
    duration: 0.16,
  },
  processing: {
    type: 'processing',
    frequencies: [523.25, 659.25, 783.99],
    duration: 0.22,
  },
  chime: {
    type: 'chime',
    frequencies: [587.33, 880, 1174.66],
    duration: 0.3,
  },
  warning: {
    type: 'warning',
    frequencies: [440, 370],
    duration: 0.28,
  },
  standby: {
    type: 'standby',
    frequencies: [660, 440],
    duration: 0.18,
  },
};
