import test from 'node:test';
import assert from 'node:assert/strict';
import {
  project3DTo2D,
  generateSphereWireframe,
  generateWaveformPoints,
  formatSegmentedTimestamp,
  generateCircuitNetwork,
} from './fuiData';

test('project3DTo2D computes valid 2D coordinates within screen bounds', () => {
  const p = { x: 0, y: 1, z: 0 };
  const res = project3DTo2D(p, 0, 0, 100, 200, 200);
  assert.equal(typeof res.x, 'number');
  assert.equal(typeof res.y, 'number');
  assert.equal(typeof res.visible, 'boolean');
  assert.equal(res.x, 200);
  assert.equal(res.y, 300);
});

test('generateSphereWireframe generates both latitude and longitude bands', () => {
  const rings = generateSphereWireframe(6, 8);
  assert.ok(rings.length > 5);
  for (const ring of rings) {
    assert.ok(ring.length > 10);
    for (const pt of ring) {
      assert.ok(typeof pt.x === 'number');
      assert.ok(typeof pt.y === 'number');
      assert.ok(typeof pt.z === 'number');
    }
  }
});

test('generateWaveformPoints outputs non-empty SVG polygon points string', () => {
  const pts = generateWaveformPoints(300, 80, 0.5, 1.2);
  assert.ok(pts.length > 20);
  assert.ok(pts.includes(','));
  const firstPt = pts.split(' ')[0].split(',');
  assert.equal(firstPt[0], '0');
  assert.ok(parseFloat(firstPt[1]) > 0);
});

test('formatSegmentedTimestamp provides formatted clock and FUI segmented ticker', () => {
  const testDate = new Date(2026, 10, 6, 14, 50, 22, 450); // 2:50 PM
  const res = formatSegmentedTimestamp(testDate);
  assert.equal(res.formatted12, '2:50 PM');
  assert.equal(res.hoursStr, '02');
  assert.equal(res.minutesStr, '50');
  assert.equal(res.secondsStr, '22');
  assert.ok(res.fuiTicker.startsWith('02:9'));
});

test('generateCircuitNetwork generates nodes and stepped circuit paths', () => {
  const network = generateCircuitNetwork();
  assert.ok(network.nodes.length >= 8);
  assert.ok(network.paths.length >= 6);
  assert.ok(network.paths[0].startsWith('M '));
});
