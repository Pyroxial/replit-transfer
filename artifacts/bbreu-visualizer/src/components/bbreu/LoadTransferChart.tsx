import { useMemo } from 'react';

type LoadTransferChartProps = { month: number };

export function LoadTransferChart({ month }: LoadTransferChartProps) {
  const curves = useMemo(() => {
    const native: string[] = [];
    const implant: string[] = [];
    for (let i = 0; i <= 60; i += 1) {
      const x = 26 + (i / 60) * 340;
      const nativeY = 87 - (i / 60) * (22 + (month / 18) * 38) - Math.sin(i / 8) * 2;
      const implantY = 98 - (i / 60) * (56 - (month / 18) * 32) - Math.sin(i / 7) * 3;
      native.push(`${x.toFixed(1)},${nativeY.toFixed(1)}`);
      implant.push(`${x.toFixed(1)},${implantY.toFixed(1)}`);
    }
    return { native: native.join(' '), implant: implant.join(' ') };
  }, [month]);

  return (
    <section className="glass-panel min-h-[220px] rounded-xl p-4 md:p-5 animate-enter" style={{ animationDelay: '320ms' }}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[.22em] text-slate-500">Load transfer</p>
          <h2 className="mt-1 text-sm font-semibold text-slate-100">Axial stress distribution</h2>
        </div>
        <div className="flex gap-3 mono text-[9px] uppercase tracking-wider text-slate-500">
          <span className="flex items-center gap-1.5"><i className="h-px w-3 bg-cyan-300" /> implant</span>
          <span className="flex items-center gap-1.5"><i className="h-px w-3 bg-orange-300" /> native bone</span>
        </div>
      </div>
      <svg viewBox="0 0 390 128" className="h-[128px] w-full overflow-visible" role="img" aria-label="Chart comparing implant and native bone load transfer">
        {[24, 48, 72, 96].map((y) => <line key={y} x1="26" x2="366" y1={y} y2={y} stroke="rgba(131,157,174,.13)" strokeDasharray="2 4" />)}
        <line x1="26" x2="366" y1="106" y2="106" stroke="rgba(131,157,174,.28)" />
        <polyline points={curves.native} fill="none" stroke="#f39a62" strokeWidth="1.6" strokeDasharray="4 3" className="animate-trace" />
        <polyline points={curves.implant} fill="none" stroke="#5bd7d0" strokeWidth="2" className="animate-trace" />
        <text x="8" y="28" fill="#617483" fontSize="8" className="mono">100%</text>
        <text x="12" y="108" fill="#617483" fontSize="8" className="mono">0</text>
        <text x="24" y="121" fill="#617483" fontSize="8" className="mono">proximal</text>
        <text x="322" y="121" fill="#617483" fontSize="8" className="mono">distal</text>
      </svg>
      <p className="mt-1 text-[10px] leading-relaxed text-slate-500">As the construct resorbs, load transfers progressively to the regenerating native bone matrix.</p>
    </section>
  );
}