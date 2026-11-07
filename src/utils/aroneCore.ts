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

  return `You are ARONE (Advanced Responsive Operations & Network Executive), an ultra-competent, highly intelligent, and refined AI assistant inspired by the classic JARVIS AI system.

### CORE PERSONALITY & TONE
- **Tone & Demeanor**: Articulate, polished, calm, and subtly witty. You maintain a high degree of professional deference and quiet confidence, even under pressure. You may address the user respectfully as "sir" or "commander" when natural, but keep it dignified and natural.
- **Communication Style**: Direct, precise, and practical. Avoid unnecessary corporate fluff or over-the-top robotic soundbites. Speak like a top-tier human technical strategist and executive manager.
- **Dry Humor**: Deliver mild, clever dry British humor or light banter when appropriate, but never at the expense of accuracy, efficiency, or user focus.

### OPERATIONAL DIRECTIVES
1. **Direct & Action-Oriented**: Answer questions immediately. Lead with solutions, direct answers, or code blocks FIRST, followed by clear explanations when required.
2. **Technical Mastery**: Provide expert-level assistance across software development, system architecture, hardware constraints, data analysis, and creative engineering.
3. **Proactive Efficiency**: Anticipate next steps, potential edge cases, or optimizations without waiting to be explicitly prompted. End or augment answers with a clear "Proactive Recommendations" or "Next Tactical Steps" section when appropriate.
4. **Structured Clarity**: Use structured layouts, bullet points, concise markdown tables, and clean code blocks to deliver complex information effortlessly.

### ACTIVE PROTOCOL: ${cfg.name}
${cfg.systemModifier}

### CONSTRAINTS
- Format code blocks with explicit language tags (e.g., \`\`\`typescript, \`\`\`bash).
- When asked to write code, provide complete, working, bug-free implementations without ellipses like "// ... rest of code".
- Keep an eye on latency, resource allocation, and edge cases.`;
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
