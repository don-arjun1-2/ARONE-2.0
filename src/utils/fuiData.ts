/**
 * FUI / HUD Pure Math & Data Engine
 * Computes 3D globe coordinates, network traffic waveform points, circuit paths, and telemetry time tickers.
 */

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Point2D {
  x: number;
  y: number;
  visible: boolean;
}

/**
 * Projects a 3D spherical coordinate to 2D screen coordinate with rotation.
 */
export function project3DTo2D(
  point: Point3D,
  angleY: number,
  angleX: number,
  radius: number,
  centerX: number,
  centerY: number
): Point2D {
  // Rotate around Y-axis
  const cosY = Math.cos(angleY);
  const sinY = Math.sin(angleY);
  const x1 = point.x * cosY + point.z * sinY;
  const z1 = -point.x * sinY + point.z * cosY;

  // Rotate around X-axis
  const cosX = Math.cos(angleX);
  const sinX = Math.sin(angleX);
  const y2 = point.y * cosX - z1 * sinX;
  const z2 = point.y * sinX + z1 * cosX;

  const scale = (z2 + 2) / 3;
  const screenX = centerX + x1 * radius;
  const screenY = centerY + y2 * radius;

  return {
    x: screenX,
    y: screenY,
    visible: z2 > -0.2, // Front hemisphere clipping with slight depth
  };
}

/**
 * Generates latitude and longitude line points on a unit sphere.
 */
export function generateSphereWireframe(latBands = 8, lonBands = 12): Point3D[][] {
  const lines: Point3D[][] = [];

  // Latitude rings
  for (let lat = 1; lat < latBands; lat++) {
    const theta = (lat * Math.PI) / latBands;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    const ring: Point3D[] = [];

    for (let lon = 0; lon <= 24; lon++) {
      const phi = (lon * 2 * Math.PI) / 24;
      ring.push({
        x: sinTheta * Math.cos(phi),
        y: cosTheta,
        z: sinTheta * Math.sin(phi),
      });
    }
    lines.push(ring);
  }

  // Longitude rings
  for (let lon = 0; lon < lonBands; lon++) {
    const phi = (lon * Math.PI) / lonBands;
    const ring: Point3D[] = [];
    for (let lat = 0; lat <= 24; lat++) {
      const theta = (lat * 2 * Math.PI) / 24;
      ring.push({
        x: Math.sin(theta) * Math.cos(phi),
        y: Math.cos(theta),
        z: Math.sin(theta) * Math.sin(phi),
      });
    }
    lines.push(ring);
  }

  return lines;
}

/**
 * Generates network traffic waveform series given a phase and seed.
 */
export function generateWaveformPoints(
  width: number,
  height: number,
  phase: number,
  frequency: number,
  noiseFactor = 0.2
): string {
  const steps = 40;
  const points: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const normX = i / steps;
    const harmonic1 = Math.sin(normX * Math.PI * 4 * frequency + phase);
    const harmonic2 = Math.cos(normX * Math.PI * 8 * frequency + phase * 1.5) * 0.4;
    const noise = (Math.sin(normX * 33 + phase * 2) * noiseFactor);
    const combined = (harmonic1 + harmonic2 + noise) * 0.45;
    const y = height / 2 + combined * (height * 0.4);

    points.push(`${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`);
  }

  return points.join(' ');
}

/**
 * Format a segmented timestamp e.g. "02:50:38:84" or "02:94:12:08".
 */
export function formatSegmentedTimestamp(date: Date = new Date()): {
  hoursStr: string;
  minutesStr: string;
  secondsStr: string;
  millisStr: string;
  formatted12: string;
  fuiTicker: string;
} {
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const millis = Math.floor(date.getMilliseconds() / 10);

  const hoursStr = String(hours12).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(seconds).padStart(2, '0');
  const millisStr = String(millis).padStart(2, '0');

  return {
    hoursStr,
    minutesStr,
    secondsStr,
    millisStr,
    formatted12: `${hours12}:${minutesStr} ${ampm}`,
    fuiTicker: `02:9${minutesStr.slice(0, 1)}:${secondsStr}:${millisStr}`,
  };
}

export interface CircuitNode {
  id: string;
  x: number;
  y: number;
  connections: string[];
}

export function generateCircuitNetwork(): { nodes: CircuitNode[]; paths: string[] } {
  const nodes: CircuitNode[] = [
    { id: 'n0', x: 20, y: 50, connections: ['n1', 'n2'] },
    { id: 'n1', x: 80, y: 25, connections: ['n3', 'n4'] },
    { id: 'n2', x: 80, y: 75, connections: ['n4', 'n5'] },
    { id: 'n3', x: 160, y: 30, connections: ['n6'] },
    { id: 'n4', x: 170, y: 50, connections: ['n6', 'n7'] },
    { id: 'n5', x: 160, y: 70, connections: ['n7'] },
    { id: 'n6', x: 250, y: 35, connections: ['n8'] },
    { id: 'n7', x: 250, y: 65, connections: ['n8'] },
    { id: 'n8', x: 320, y: 50, connections: [] },
  ];

  const nodeMap = new Map<string, CircuitNode>(nodes.map(n => [n.id, n]));
  const paths: string[] = [];

  for (const node of nodes) {
    for (const targetId of node.connections) {
      const target = nodeMap.get(targetId);
      if (target) {
        // Orthogonal stepped circuit trace
        const midX = (node.x + target.x) / 2;
        paths.push(`M ${node.x} ${node.y} L ${midX} ${node.y} L ${midX} ${target.y} L ${target.x} ${target.y}`);
      }
    }
  }

  return { nodes, paths };
}
