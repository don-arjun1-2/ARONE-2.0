import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROTOCOL_CONFIGS,
  computeTelemetry,
  buildAroneSystemPrompt,
  parseAroneResponse,
  ACOUSTIC_CUES,
  type ProtocolMode,
} from './aroneCore';

test('protocol configurations are defined for all modes', () => {
  const modes: ProtocolMode[] = ['STRATEGIC', 'TECHNICAL', 'DIAGNOSTIC', 'PROTOTYPE'];
  for (const mode of modes) {
    const cfg = PROTOCOL_CONFIGS[mode];
    assert.ok(cfg, `Protocol ${mode} should exist`);
    assert.equal(cfg.id, mode);
    assert.ok(cfg.name.length > 0);
    assert.ok(cfg.systemModifier.length > 0);
  }
});

test('computeTelemetry returns valid metrics and health boundaries', () => {
  const telemetry = computeTelemetry(1700000000000);
  assert.ok(telemetry.neuralLatency >= 8 && telemetry.neuralLatency <= 25);
  assert.ok(telemetry.coreTemperature >= 35 && telemetry.coreTemperature <= 45);
  assert.equal(telemetry.invariantsTotal, 16);
  assert.equal(telemetry.invariantsPassing, 16);
  assert.ok(telemetry.metrics.length >= 4);
  assert.ok(['nominal', 'elevated', 'critical'].includes(telemetry.status));
});

test('buildAroneSystemPrompt includes conversational JARVIS-style partner directives', () => {
  const prompt = buildAroneSystemPrompt('TECHNICAL');
  assert.ok(prompt.includes('ARONE'));
  assert.ok(prompt.includes('Talk Like a Human Friend'));
  assert.ok(prompt.includes('Dynamic Responses'));
  assert.ok(prompt.includes('Short & Real'));
  assert.ok(prompt.includes('Super Friendly & Casual'));
  assert.ok(prompt.includes('Greeting & Addressing'));
  assert.ok(prompt.includes('No Raw Markdown Noise'));
  assert.ok(prompt.includes('Focus on Innovation & Creativity'));
  assert.ok(prompt.includes('Make Life Simple & Effortless'));
  assert.ok(prompt.includes('Proactive Brainstorming'));
});

test('parseAroneResponse accurately extracts code blocks and proactive recommendations', () => {
  const sampleResponse = `
Here is the optimized connection pool implementation:

\`\`\`typescript
export const pool = new DatabasePool({ max: 20 });
\`\`\`

### Recommended Next Steps
- Verify socket timeout thresholds under peak load
- Enable heartbeat probes every 15 seconds
- Benchmark memory footprint with synthetic load
`;

  const parsed = parseAroneResponse(sampleResponse);
  assert.equal(parsed.hasCodeBlock, true);
  assert.equal(parsed.codeBlocks.length, 1);
  assert.equal(parsed.codeBlocks[0].language, 'typescript');
  assert.ok(parsed.codeBlocks[0].code.includes('DatabasePool'));
  assert.equal(parsed.proactiveSteps.length, 3);
  assert.ok(parsed.proactiveSteps[0].includes('socket timeout'));
});

test('acoustic cues contain valid audio frequencies for synthesis', () => {
  assert.ok(ACOUSTIC_CUES.affirmative.frequencies.length > 0);
  assert.ok(ACOUSTIC_CUES.processing.duration > 0);
  assert.ok(ACOUSTIC_CUES.chime.frequencies.every(f => f > 100));
});
