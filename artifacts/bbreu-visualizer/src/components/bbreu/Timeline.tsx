import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getPhase } from './types';

type TimelineProps = { month: number; onMonthChange: (month: number) => void };

export function Timeline({ month, onMonthChange }: TimelineProps) {
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);
  const phase = getPhase(month);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = window.setInterval(() => {
      onMonthChange(month >= 18 ? 0 : Math.min(18, month + 1));
    }, 1250);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [playing, month, onMonthChange]);

  return (
    <section className="glass-panel rounded-xl p-4 md:p-5 animate-enter" style={{ animationDelay: '240ms' }}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[.22em] text-slate-500">Healing timeline</p>
          <div className="mt-1 flex items-baseline gap-3">
            <h2 className="text-sm font-semibold text-slate-100">Biomaterial state</h2>
            <span className="mono text-[10px] uppercase tracking-wider" style={{ color: phase.color }}>{phase.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Previous month" data-testid="button-previous-month" onClick={() => onMonthChange(Math.max(0, month - 1))} className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-700/60 hover:text-slate-100">
            <ChevronLeft size={15} />
          </button>
          <button type="button" aria-label={playing ? 'Pause timeline' : 'Play timeline'} data-testid="button-play-timeline" onClick={() => setPlaying((value) => !value)} className="flex h-8 w-8 items-center justify-center rounded-md border border-cyan-300/25 bg-cyan-300/10 text-cyan-200 transition-all hover:bg-cyan-300/20">
            {playing ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" className="translate-x-px" />}
          </button>
          <button type="button" aria-label="Next month" data-testid="button-next-month" onClick={() => onMonthChange(Math.min(18, month + 1))} className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-700/60 hover:text-slate-100">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
      <div className="relative px-1">
        <div className="absolute left-2 right-2 top-[9px] h-px bg-slate-700" />
        <div className="absolute left-2 top-[9px] h-px bg-cyan-300 transition-[width] duration-500" style={{ width: `calc(${(month / 18) * 100}% - 4px)` }} />
        <input aria-label="Healing timeline month" data-testid="input-healing-month" type="range" min="0" max="18" step="1" value={month} onChange={(event) => { setPlaying(false); onMonthChange(Number(event.target.value)); }} className="timeline-range relative z-10 w-full cursor-pointer appearance-none bg-transparent" />
        <div className="mt-1 flex justify-between mono text-[9px] text-slate-600">
          {[0, 3, 6, 9, 12, 15, 18].map((tick) => <span key={tick} className={tick === month ? 'text-cyan-200' : ''}>{tick === 0 ? 'M0' : `M${tick}`}</span>)}
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-2 border-t border-slate-800/80 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="mono text-3xl font-medium tracking-[-.08em] text-slate-100">M{String(month).padStart(2, '0')}</span>
          <span className="text-[11px] text-slate-500">of 18 months</span>
        </div>
        <p className="max-w-[520px] text-[11px] leading-relaxed text-slate-400">{phase.description}</p>
      </div>
    </section>
  );
}