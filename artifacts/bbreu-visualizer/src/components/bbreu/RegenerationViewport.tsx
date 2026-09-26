import { Maximize2, RotateCcw } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { ViewMode } from './types';

declare global {
  interface Window {
    THREE?: any;
  }
}

type RegenerationViewportProps = {
  month: number;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  visibleLayers: Record<string, boolean>;
};

function fallbackAssembly(canvas: HTMLCanvasElement, month: number, view: ViewMode) {
  const context = canvas.getContext('2d');
  if (!context) return;
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth * ratio;
  const height = canvas.clientHeight * ratio;
  canvas.width = width;
  canvas.height = height;
  context.clearRect(0, 0, width, height);
  const scale = Math.min(width, height) / 530;
  const cx = width / 2;
  const gap = (view === 'section' ? 86 : 112) - month * 2.2;
  const topY = height / 2 - gap / 2;
  const bottomY = height / 2 + gap / 2;
  context.save();
  context.translate(cx, height / 2);
  context.scale(scale, scale);
  const bone = (y: number, flip: boolean) => {
    context.save();
    context.translate(0, y - height / 2 / scale);
    if (flip) context.scale(1, -1);
    const gradient = context.createLinearGradient(-90, 0, 90, 0);
    gradient.addColorStop(0, '#8b5e45'); gradient.addColorStop(.42, '#f2bb86'); gradient.addColorStop(1, '#b87855');
    context.fillStyle = gradient;
    context.beginPath(); context.roundRect(-100, -130, 200, 130, 22); context.fill();
    context.fillStyle = 'rgba(35,24,24,.35)'; context.fillRect(-72, -20, 144, 22);
    context.restore();
  };
  bone(topY - height / 2 / scale, false);
  bone(bottomY - height / 2 / scale, true);
  const materialAlpha = Math.max(.22, 1 - month / 25);
  context.globalAlpha = materialAlpha;
  context.strokeStyle = '#55d9d1'; context.lineWidth = 20; context.setLineDash([2, 8]);
  context.strokeRect(-74, -gap / (2 * scale) - 40, 148, gap / scale + 80);
  context.setLineDash([]);
  context.strokeStyle = '#e5c56d'; context.lineWidth = 5; context.strokeRect(-64, -gap / (2 * scale) - 28, 128, gap / scale + 56);
  context.fillStyle = '#ec986c'; context.globalAlpha = .7;
  context.fillRect(-43, -gap / (2 * scale) - 12, 86, gap / scale + 24);
  context.globalAlpha = 1; context.strokeStyle = '#f06f66'; context.lineWidth = 3;
  context.beginPath(); context.moveTo(-29, -gap / (2 * scale) - 30); context.bezierCurveTo(-3, 0, 19, 16, 32, gap / (2 * scale) + 30); context.stroke();
  context.restore();
}

export function RegenerationViewport({ month, view, onViewChange, visibleLayers }: RegenerationViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const three = window.THREE;
    if (!three) {
      fallbackAssembly(canvas, month, view);
      return;
    }
    const scene = new three.Scene();
    const camera = new three.PerspectiveCamera(31, 1, 0.1, 100);
    camera.position.set(view === 'section' ? 0 : 5.2, 2.1, view === 'section' ? 7.2 : 5.7);
    let renderer: any;
    try {
      renderer = new three.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      fallbackAssembly(canvas, month, view);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = three.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    scene.add(new three.HemisphereLight(0x9ed3dd, 0x14202b, 2.3));
    const key = new three.DirectionalLight(0xffc9a0, 3.8);
    key.position.set(-4, 6, 5); scene.add(key);
    const rim = new three.PointLight(0x49d8cb, 6, 13); rim.position.set(3, 0, 2); scene.add(rim);

    const group = new three.Group();
    const progress = month / 18;
    const gap = 1.78 - progress * 0.62;
    const boneMaterial = new three.MeshStandardMaterial({ color: 0xd99065, roughness: .72, metalness: .04 });
    const boneHighlight = new three.MeshStandardMaterial({ color: 0xf1b67e, roughness: .8, metalness: .03 });
    const upper = new three.Mesh(new three.CylinderGeometry(1.17, 1.38, 2.7, 12), boneMaterial);
    upper.name = 'Host bone ends';
    upper.position.y = gap / 2 + 1.35; group.add(upper);
    const lower = new three.Mesh(new three.CylinderGeometry(1.38, 1.17, 2.7, 12), boneHighlight);
    lower.name = 'Host bone ends';
    lower.position.y = -gap / 2 - 1.35; lower.rotation.y = .18; group.add(lower);
    const shellOpacity = Math.max(.12, 1 - progress * .7);
    const shell = new three.Mesh(
      new three.CylinderGeometry(1.02, 1.02, gap + 1.1, 16, 1, true),
      new three.MeshPhysicalMaterial({ color: 0x67d9d0, transparent: true, opacity: shellOpacity * .31, roughness: .18, transmission: .12, side: three.DoubleSide }),
    );
    shell.name = 'Structural shell'; group.add(shell);
    const barrier = new three.Mesh(
      new three.CylinderGeometry(.84, .84, gap + .86, 16, 1, true),
      new three.MeshStandardMaterial({ color: 0xe4c06e, transparent: true, opacity: shellOpacity * .42, roughness: .3, side: three.DoubleSide }),
    );
    barrier.name = 'Hydrophobic seal'; group.add(barrier);
    const matrix = new three.Mesh(
      new three.CylinderGeometry(.67, .67, gap + .48, 14),
      new three.MeshStandardMaterial({ color: 0xeb9e6e, transparent: true, opacity: .38 + progress * .42, roughness: .72 }),
    );
    matrix.name = 'Regenerating matrix'; group.add(matrix);
    const graft = new three.Mesh(new three.CylinderGeometry(.48, .48, gap + .58, 12), new three.MeshStandardMaterial({ color: 0xead6af, roughness: .78 }));
    graft.name = 'Vascularized fibula graft'; graft.position.z = .03; group.add(graft);
    const vessel = new three.Mesh(new three.TorusGeometry(.57, .035, 7, 48), new three.MeshBasicMaterial({ color: 0xe96b64 }));
    vessel.name = 'Vascularized fibula graft'; vessel.rotation.x = Math.PI / 2; vessel.position.y = 0; group.add(vessel);
    const vesselCore = new three.Mesh(new three.CylinderGeometry(.045, .045, gap + .55, 8), new three.MeshBasicMaterial({ color: 0xf2756a }));
    vesselCore.name = 'Vascularized fibula graft'; vesselCore.position.x = .25; group.add(vesselCore);
    const jointMaterial = new three.MeshStandardMaterial({ color: 0xb26d4d, roughness: .56, metalness: .06 });
    [-1, 1].forEach((side) => {
      const joint = new three.Mesh(new three.BoxGeometry(1.42, .23, 1.08), jointMaterial);
      joint.name = 'Structural shell';
      joint.position.set(0, side * (gap / 2 + .18), 0);
      joint.rotation.y = side * .13;
      group.add(joint);
    });
    group.traverse((object: any) => {
      if (object.name && visibleLayers[object.name] === false) object.visible = false;
    });
    scene.add(group);

    const OrbitControls = three.OrbitControls;
    if (OrbitControls) {
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; controls.dampingFactor = .07; controls.enablePan = false;
      controls.minDistance = 3.5; controls.maxDistance = 9;
      controls.target.set(0, 0, 0); controlsRef.current = controls;
    }
    const resize = () => {
      const width = canvas.clientWidth || 600;
      const height = canvas.clientHeight || 500;
      renderer.setSize(width, height, false);
      camera.aspect = width / height; camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    let animationFrame = 0;
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      vessel.scale.set(1, 1 + Math.sin(Date.now() / 170) * .08, 1);
      group.rotation.y += view === 'section' ? .001 : .002;
      if (controlsRef.current) controlsRef.current.update();
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      controlsRef.current?.dispose?.();
      renderer.dispose();
      scene.traverse((object: any) => { object.geometry?.dispose?.(); object.material?.dispose?.(); });
      controlsRef.current = null;
    };
  }, [month, view, visibleLayers]);

  return (
    <section className="glass-panel relative min-h-[470px] overflow-hidden rounded-xl md:min-h-[550px] animate-enter">
      <div className="instrument-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(72,205,194,.13),transparent_65%)]" />
      <canvas ref={canvasRef} className="relative z-10 h-[470px] w-full cursor-grab active:cursor-grabbing md:h-[550px]" data-testid="canvas-regeneration-assembly" />
      <div className="pointer-events-none absolute left-4 top-4 z-20">
        <p className="mono text-[9px] uppercase tracking-[.24em] text-slate-500">Live assembly / orbital view</p>
        <p className="mt-1 text-xs text-slate-300">BBREU construct <span className="text-slate-600">·</span> 01</p>
      </div>
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-slate-700/70 bg-[#111b27]/90 p-1.5 backdrop-blur">
          <button type="button" data-testid="button-perspective-view" onClick={() => onViewChange('perspective')} className={`rounded-md px-3 py-1.5 mono text-[10px] uppercase tracking-wider transition-all ${view === 'perspective' ? 'bg-cyan-300/15 text-cyan-200' : 'text-slate-500 hover:text-slate-300'}`}>3D perspective</button>
          <button type="button" data-testid="button-section-view" onClick={() => onViewChange('section')} className={`rounded-md px-3 py-1.5 mono text-[10px] uppercase tracking-wider transition-all ${view === 'section' ? 'bg-cyan-300/15 text-cyan-200' : 'text-slate-500 hover:text-slate-300'}`}>vertical section</button>
        </div>
        <div className="flex gap-1.5">
          <button type="button" aria-label="Reset orbital view" data-testid="button-reset-orbit" onClick={() => controlsRef.current?.reset?.()} className="rounded-md border border-slate-700/70 bg-[#111b27]/90 p-2 text-slate-400 backdrop-blur transition-colors hover:text-cyan-200"><RotateCcw size={14} /></button>
          <button type="button" aria-label="Expand visualization" data-testid="button-expand-visualization" onClick={() => canvasRef.current?.requestFullscreen?.()} className="rounded-md border border-slate-700/70 bg-[#111b27]/90 p-2 text-slate-400 backdrop-blur transition-colors hover:text-cyan-200"><Maximize2 size={14} /></button>
        </div>
      </div>
      <div className="pointer-events-none absolute right-4 top-4 z-20 text-right">
        <div className="flex items-center justify-end gap-1.5 mono text-[9px] uppercase tracking-wider text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> model active</div>
        <p className="mt-1 mono text-[9px] text-slate-600">orbit controls enabled</p>
      </div>
    </section>
  );
}