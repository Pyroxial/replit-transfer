import { BookOpen, CircleHelp, Download, Eye, EyeOff, Info, Menu, Radio, ScanLine, Settings2, ShieldAlert, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { LoadTransferChart } from '@/components/bbreu/LoadTransferChart';
import { RegenerationViewport } from '@/components/bbreu/RegenerationViewport';
import { TelemetryPanel } from '@/components/bbreu/TelemetryPanel';
import { Timeline } from '@/components/bbreu/Timeline';
import { getPhase, getTelemetry, type ViewMode } from '@/components/bbreu/types';

const layers = [
  { name: 'Host bone ends', note: 'White native bone', color: '#f1f4ed' },
  { name: 'Vascularized fibula graft', note: 'White graft with red vessels', color: '#e96b64' },
  { name: 'Regenerating matrix', note: 'Light-gray radial bone growth from graft', color: '#cbd3d1' },
  { name: 'Structural shell', note: 'Thinner blue outer encasing', color: '#5bd7d0' },
  { name: 'Hydrophobic seal', note: 'Outer barrier layer', color: '#e5c56d' },
];

const legendItems = [
  { name: 'Original bone / bone ends', note: 'White native bone on both sides of the gap', colors: ['#f7f8f2', '#d6ddd6'] },
  { name: 'Vascularized fibula graft', note: 'White biological graft with red vascular markings', colors: ['#f7f8f2', '#e96b64'] },
  { name: 'Vessel pathway', note: 'Red line showing blood-vessel continuity through the graft', colors: ['#e96b64'] },
  { name: 'Regenerating bone', note: 'Light-gray matrix grows sideways from the graft and fills the gap by M18', colors: ['#cbd3d1'] },
  { name: 'MA-HA hydrogel', note: 'Cyan inner layer surrounding the graft', colors: ['#55d9d1'] },
  { name: 'Structural shell', note: 'Turquoise biodegradable encasing around the construct', colors: ['#67d9d0'] },
  { name: 'Hydrophobic seal', note: 'Gold outer fluid barrier around the encasing', colors: ['#e5c56d'] },
  { name: 'Step-bevel joints', note: 'White-gray interlocking interfaces where graft meets host bone', colors: ['#b9c8c1'] },
];

export default function Home() {
  const [month, setMonth] = useState(6);
  const [view, setView] = useState<ViewMode>('perspective');
  const [inspectorTab, setInspectorTab] = useState<'readout' | 'layers' | 'legend'>('readout');
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>(() => Object.fromEntries(layers.map((layer) => [layer.name, true])));
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const telemetry = getTelemetry(month);
  const phase = getPhase(month);

  const updateMonth = useCallback((value: number) => setMonth(value), []);
  const announce = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(''), 2600);
  };

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#0b1119]">
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#0b1119]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between px-4 md:px-7">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/35 bg-cyan-300/10 text-cyan-200">
              <ScanLine size={20} strokeWidth={1.6} />
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-orange-300" />
            </div>
            <div>
              <p className="mono text-[9px] uppercase tracking-[.28em] text-cyan-300/75">Research console</p>
              <h1 className="mt-0.5 text-[14px] font-bold tracking-[-.02em] text-slate-100 md:text-[15px]">BBREU <span className="font-normal text-slate-500">/</span> Regeneration Visualizer</h1>
            </div>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            <button type="button" data-testid="button-header-method" onClick={() => announce('Methods reference is included in the educational protocol.') } className="flex items-center gap-2 rounded-md px-3 py-2 text-[11px] text-slate-400 transition-colors hover:bg-slate-800/70 hover:text-slate-100"><BookOpen size={14} /> method</button>
            <button type="button" data-testid="button-header-help" onClick={() => announce('Drag to orbit. Use the timeline to inspect material state.') } className="flex items-center gap-2 rounded-md px-3 py-2 text-[11px] text-slate-400 transition-colors hover:bg-slate-800/70 hover:text-slate-100"><CircleHelp size={14} /> controls</button>
            <button type="button" data-testid="button-header-settings" onClick={() => announce('Console settings are fixed to the BBREU reference model.') } className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-800/70 hover:text-slate-100"><Settings2 size={15} /></button>
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-2.5 py-1.5 mono text-[9px] uppercase tracking-wider text-emerald-300 sm:flex"><Radio size={11} /> local model</span>
            <button type="button" aria-label="Open menu" data-testid="button-open-menu" onClick={() => setMenuOpen((value) => !value)} className="rounded-md border border-slate-700/70 p-2 text-slate-400 hover:text-slate-100 md:hidden"><Menu size={16} /></button>
          </div>
          {menuOpen && <div className="absolute right-4 top-[58px] z-50 w-44 rounded-lg border border-slate-700 bg-[#111b27] p-1.5 shadow-2xl md:hidden"><button type="button" data-testid="button-mobile-method" onClick={() => { announce('Methods reference is included in the educational protocol.'); setMenuOpen(false); }} className="block w-full rounded px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800">Methods reference</button><button type="button" data-testid="button-mobile-help" onClick={() => { announce('Drag to orbit. Use the timeline to inspect material state.'); setMenuOpen(false); }} className="block w-full rounded px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800">Interaction guide</button></div>}
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 pb-10 pt-5 md:px-7 md:pt-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div className="animate-enter">
            <div className="mb-2 flex items-center gap-2">
              <span className="mono text-[10px] uppercase tracking-[.2em] text-slate-500">Protocol BBREU-18</span>
              <span className="h-1 w-1 rounded-full bg-slate-600" />
              <span className="mono text-[10px] uppercase tracking-[.2em]" style={{ color: phase.color }}>{phase.name} phase</span>
            </div>
            <h2 className="max-w-3xl text-[clamp(1.65rem,3.2vw,2.85rem)] font-semibold leading-[1.08] tracking-[-.055em] text-slate-100">Inspect the construct as it becomes bone.</h2>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-500 md:text-sm">An interactive educational model of biodegradable barrier-assisted bone regeneration, tuned for surgical research review.</p>
          </div>
          <button type="button" data-testid="button-export-readout" onClick={() => announce(`Readout ready: month ${month}, ${telemetry.boneFusion.toFixed(1)}% fusion.`)} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-[11px] text-slate-300 transition-all hover:border-cyan-300/40 hover:bg-cyan-300/5 hover:text-cyan-100"><Download size={14} /> export readout</button>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0 space-y-4">
            <RegenerationViewport month={month} view={view} onViewChange={setView} visibleLayers={visibleLayers} />
            <Timeline month={month} onMonthChange={updateMonth} />
          </div>
          <aside className="space-y-4">
            <section className="glass-panel overflow-hidden rounded-xl animate-enter" style={{ animationDelay: '100ms' }}>
              <div className="flex border-b border-slate-800/80">
                <button type="button" data-testid="button-inspector-readout" onClick={() => setInspectorTab('readout')} className={`flex-1 px-3 py-3 mono text-[10px] uppercase tracking-wider transition-colors ${inspectorTab === 'readout' ? 'border-b border-cyan-300 text-cyan-200' : 'text-slate-500 hover:text-slate-300'}`}>readout</button>
                <button type="button" data-testid="button-inspector-layers" onClick={() => setInspectorTab('layers')} className={`flex-1 px-3 py-3 mono text-[10px] uppercase tracking-wider transition-colors ${inspectorTab === 'layers' ? 'border-b border-cyan-300 text-cyan-200' : 'text-slate-500 hover:text-slate-300'}`}>layers</button>
                <button type="button" data-testid="button-inspector-legend" onClick={() => setInspectorTab('legend')} className={`flex-1 px-3 py-3 mono text-[10px] uppercase tracking-wider transition-colors ${inspectorTab === 'legend' ? 'border-b border-cyan-300 text-cyan-200' : 'text-slate-500 hover:text-slate-300'}`}>legend</button>
              </div>
              {inspectorTab === 'readout' ? <div className="p-4">
                <div className="mb-4 flex items-center justify-between"><span className="mono text-[10px] uppercase tracking-[.18em] text-slate-500">Current slice</span><span className="mono text-sm text-orange-200">M{String(month).padStart(2, '0')}</span></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-slate-800/45 p-3"><p className="mono text-[9px] text-slate-500">model scale</p><p className="mt-1 mono text-[13px] text-slate-200">1 : 1.8</p></div>
                  <div className="rounded-lg bg-slate-800/45 p-3"><p className="mono text-[9px] text-slate-500">defect span</p><p className="mt-1 mono text-[13px] text-slate-200">42.0 mm</p></div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-3"><span className="text-[11px] text-slate-500">Matrix confidence</span><span className="mono text-[11px] text-emerald-300">high / 0.91</span></div>
              </div> : inspectorTab === 'layers' ? <div className="p-4">
                <div className="mb-3 flex items-center justify-between"><span className="mono text-[10px] uppercase tracking-[.18em] text-slate-500">Assembly layers</span><span className="mono text-[9px] text-slate-600">5 visible</span></div>
                <div className="space-y-1">
                  {layers.map((layer) => <button type="button" key={layer.name} data-testid={`button-toggle-layer-${layer.name.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setVisibleLayers((current) => ({ ...current, [layer.name]: !current[layer.name] }))} className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left transition-colors hover:bg-slate-800/70"><span className="flex items-center gap-2.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: layer.color }} /><span><span className={`block text-[11px] ${visibleLayers[layer.name] ? 'text-slate-200' : 'text-slate-600 line-through'}`}>{layer.name}</span><span className="block text-[9px] text-slate-600">{layer.note}</span></span></span>{visibleLayers[layer.name] ? <Eye size={13} className="text-slate-500" /> : <EyeOff size={13} className="text-slate-700" />}</button>)}
                </div>
              </div> : <div className="p-4">
                <div className="mb-3">
                  <span className="mono text-[10px] uppercase tracking-[.18em] text-slate-500">Current model interpretation</span>
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-600">Color key only — anatomy and mechanics can be revised from your explanation.</p>
                </div>
                <div className="space-y-2.5">
                  {legendItems.map((item) => <div key={item.name} className="flex items-start gap-2.5">
                    <span
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border border-white/10"
                      style={{ background: item.colors.length > 1 ? `linear-gradient(90deg, ${item.colors[0]} 0 50%, ${item.colors[1]} 50% 100%)` : item.colors[0] }}
                    />
                    <span><span className="block text-[11px] text-slate-200">{item.name}</span><span className="block text-[9px] leading-relaxed text-slate-600">{item.note}</span></span>
                  </div>)}
                </div>
              </div>}
            </section>
            <TelemetryPanel data={telemetry} />
          </aside>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
          <LoadTransferChart month={month} />
          <section className="glass-panel rounded-xl p-4 animate-enter" style={{ animationDelay: '380ms' }}>
            <div className="mb-3 flex items-center gap-2"><Info size={14} className="text-cyan-300" /><p className="mono text-[10px] uppercase tracking-[.18em] text-slate-500">Educational protocol</p></div>
            <p className="text-[11px] leading-relaxed text-slate-400">BBREU combines a vascularized fibula graft with a temporary hydrogel scaffold, structural shell, and hydrophobic seal. Explore how the modeled interface changes over time.</p>
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-orange-300/15 bg-orange-300/5 p-2.5"><ShieldAlert size={14} className="mt-0.5 shrink-0 text-orange-300" /><p className="text-[10px] leading-relaxed text-orange-100/70">Educational visualization only. This console is not clinical guidance and does not replace surgical planning or professional judgment.</p></div>
          </section>
        </div>
      </div>
      {notice && <div role="status" data-testid="status-console-notice" className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-lg border border-cyan-300/25 bg-[#132331]/95 px-4 py-3 text-xs text-cyan-100 shadow-2xl backdrop-blur"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />{notice}<button type="button" aria-label="Dismiss notice" data-testid="button-dismiss-notice" onClick={() => setNotice('')} className="ml-2 text-slate-500 hover:text-slate-200"><X size={13} /></button></div>}
    </main>
  );
}