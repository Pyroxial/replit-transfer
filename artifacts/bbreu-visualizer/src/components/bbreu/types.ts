export type ViewMode = 'perspective' | 'section';

export type Phase = {
  name: string;
  range: string;
  description: string;
  color: string;
};

export type TelemetryData = {
  radialForce: number;
  hydrogelMass: number;
  barrierIntegrity: number;
  boneFusion: number;
};

export const phases: Phase[] = [
  { name: 'Clamp', range: 'M0–1', description: 'Interlocking joints stabilize the construct under initial load.', color: '#f39a62' },
  { name: 'Hydration', range: 'M1–3', description: 'Hydrogel swells and establishes the permissive regeneration space.', color: '#5bd7d0' },
  { name: 'Degradation', range: 'M3–9', description: 'Structural shell slowly yields as mineralized matrix bridges the defect.', color: '#e6c36f' },
  { name: 'Resorption', range: 'M9–18', description: 'Temporary materials resorb while native bone assumes load transfer.', color: '#95a7b3' },
];

export function getPhase(month: number): Phase {
  if (month <= 1) return phases[0];
  if (month <= 3) return phases[1];
  if (month <= 9) return phases[2];
  return phases[3];
}

export function getTelemetry(month: number): TelemetryData {
  const t = month / 18;
  const hydration = Math.min(1, Math.max(0, (month - 0.4) / 2.6));
  const fusion = Math.max(0, Math.min(1, (month - 2) / 13.5));
  return {
    radialForce: 42.8 - 29.4 * Math.pow(t, 0.74),
    hydrogelMass: 184 - 142 * Math.pow(Math.max(0, (month - 1) / 17), 1.08) + hydration * 12,
    barrierIntegrity: 99.1 - 69.5 * Math.pow(t, 1.38),
    boneFusion: fusion * 100,
  };
}