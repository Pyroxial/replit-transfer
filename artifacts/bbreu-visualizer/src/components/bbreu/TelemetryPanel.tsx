import { Activity, CircleDot, Droplets, ShieldCheck } from 'lucide-react';
import type { TelemetryData } from './types';

type TelemetryPanelProps = { data: TelemetryData };

const metrics = [
  { key: 'radialForce', label: 'Inward radial force', unit: 'N', icon: Activity, color: '#f39a62', min: 0, max: 50, digits: 1 },
  { key: 'hydrogelMass', label: 'Hydrogel mass', unit: 'mg', icon: Droplets, color: '#5bd7d0', min: 0, max: 200, digits: 0 },
  { key: 'barrierIntegrity', label: 'Barrier integrity', unit: '%', icon: ShieldCheck, color: '#e6c36f', min: 0, max: 100, digits: 1 },
  { key: 'boneFusion', label: 'Bone fusion', unit: '%', icon: CircleDot, color: '#95d9aa', min: 0, max: 100, digits: 1 },
] as const;

export function TelemetryPanel({ data }: TelemetryPanelProps) {
  return (
    <section className="glass-panel rounded-xl p-4 animate-enter" style={{ animationDelay: '80ms' }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="mono text-[10px] uppercase tracking-[.22em] text-slate-500">Live telemetry</p>
          <h2 className="mt-1 text-sm font-semibold text-slate-100">Construct readout</h2>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-2 py-1 mono text-[9px] uppercase tracking-wider text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> streaming
        </span>
      </div>
      <div className="space-y-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const value = data[metric.key];
          const width = Math.max(4, ((value - metric.min) / (metric.max - metric.min)) * 100);
          return (
            <div key={metric.key} data-testid={`telemetry-${metric.key}`}>
              <div className="mb-1.5 flex items-end justify-between gap-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Icon size={13} style={{ color: metric.color }} strokeWidth={1.8} />
                  <span>{metric.label}</span>
                </div>
                <div className="mono text-[13px] font-medium text-slate-100">
                  {value.toFixed(metric.digits)} <span className="text-[10px] text-slate-500">{metric.unit}</span>
                </div>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-slate-800/80">
                <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${width}%`, background: metric.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}