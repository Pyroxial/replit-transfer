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

type FallbackTransform = {
  zoom: number;
  panX: number;
  panY: number;
  rotation: number;
};

const defaultFallbackTransform: FallbackTransform = {
  zoom: 1,
  panX: 0,
  panY: 0,
  rotation: 0,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function fallbackAssembly(
  canvas: HTMLCanvasElement,
  month: number,
  view: ViewMode,
  transform: FallbackTransform,
  visibleLayers: Record<string, boolean>,
) {
  const context = canvas.getContext('2d');
  if (!context) return;

  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(canvas.clientWidth, 1);
  const height = Math.max(canvas.clientHeight, 1);
  const pixelWidth = Math.round(width * ratio);
  const pixelHeight = Math.round(height * ratio);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);

  const progress = month / 18;
  const gap = 154 - progress * 50;
  const scale = Math.min(width / 360, height / 550) * transform.zoom;
  const cx = width / 2 + transform.panX;
  const cy = height / 2 + transform.panY;

  context.save();
  context.translate(cx, cy);
  context.rotate(view === 'section' ? transform.rotation * 0.25 : transform.rotation);
  context.scale(scale, scale);

  const roundedRect = (
    x: number,
    y: number,
    rectangleWidth: number,
    rectangleHeight: number,
    radius: number,
  ) => {
    context.beginPath();
    context.roundRect(x, y, rectangleWidth, rectangleHeight, radius);
  };

  if (visibleLayers['Structural shell']) {
    context.save();
    context.globalAlpha = Math.max(0.25, 1 - progress * 0.7);
    context.strokeStyle = '#55d9d1';
    context.lineWidth = 24;
    context.setLineDash([3, 8]);
    roundedRect(-88, -gap / 2 - 18, 176, gap + 36, 26);
    context.stroke();
    context.restore();
  }

  if (visibleLayers['Hydrophobic seal']) {
    context.save();
    context.globalAlpha = Math.max(0.28, 1 - progress * 0.72);
    context.strokeStyle = '#e5c56d';
    context.lineWidth = 8;
    roundedRect(-75, -gap / 2 - 10, 150, gap + 20, 18);
    context.stroke();
    context.restore();
  }

  if (visibleLayers['Regenerating matrix']) {
    const matrixGradient = context.createLinearGradient(-50, 0, 50, 0);
    matrixGradient.addColorStop(0, progress > 0.35 ? '#4abf91' : '#c9795d');
    matrixGradient.addColorStop(0.5, progress > 0.35 ? '#a4e39e' : '#f0a46d');
    matrixGradient.addColorStop(1, progress > 0.35 ? '#47a980' : '#b66659');
    context.globalAlpha = 0.45 + progress * 0.44;
    context.fillStyle = matrixGradient;
    roundedRect(-51, -gap / 2 - 3, 102, gap + 6, 14);
    context.fill();
  }

  if (visibleLayers['Vascularized fibula graft']) {
    context.globalAlpha = 0.98;
    const graftGradient = context.createLinearGradient(-31, 0, 31, 0);
    graftGradient.addColorStop(0, '#8e4f45');
    graftGradient.addColorStop(0.45, '#f28e68');
    graftGradient.addColorStop(1, '#a9574b');
    context.fillStyle = graftGradient;
    roundedRect(-32, -gap / 2 - 3, 64, gap + 6, 12);
    context.fill();

    context.strokeStyle = '#f06f66';
    context.lineWidth = 3.5;
    context.beginPath();
    context.moveTo(-17, -gap / 2 - 12);
    context.bezierCurveTo(8, -gap * 0.18, -7, gap * 0.2, 19, gap / 2 + 13);
    context.stroke();
    context.fillStyle = '#ff8c75';
    context.beginPath();
    context.arc(-17, -gap / 2 - 12, 5, 0, Math.PI * 2);
    context.fill();
  }

  if (visibleLayers['Structural shell']) {
    context.save();
    context.globalAlpha = 0.94;
    context.fillStyle = '#aa684c';
    [-1, 1].forEach((side) => {
      const y = side * (gap / 2 + 5);
      roundedRect(-82, y - 9, 164, 18, 7);
      context.fill();
      context.fillStyle = '#df9b68';
      for (let index = 0; index < 5; index += 1) {
        context.fillRect(-62 + index * 30, side < 0 ? y - 14 : y - 1, 16, 7);
      }
      context.fillStyle = '#aa684c';
    });
    context.restore();
  }

  const drawBone = (top: boolean) => {
    const y = top ? -gap / 2 - 146 : gap / 2;
    const depth = top ? -12 : 12;
    context.save();
    context.translate(depth, 0);
    const gradient = context.createLinearGradient(-78, 0, 78, 0);
    gradient.addColorStop(0, '#774a3c');
    gradient.addColorStop(0.38, '#f2b77f');
    gradient.addColorStop(1, '#a9654c');
    context.fillStyle = gradient;
    roundedRect(-78, y, 156, 146, 22);
    context.fill();
    context.fillStyle = 'rgba(37, 25, 27, .42)';
    context.fillRect(-55, top ? y + 116 : y + 8, 110, 24);
    context.fillStyle = 'rgba(255, 215, 161, .28)';
    context.fillRect(-62, top ? y + 8 : y + 114, 124, 5);
    context.restore();
  };

  drawBone(true);
  drawBone(false);

  if (month > 0 && month < 8 && visibleLayers['Structural shell']) {
    context.save();
    context.globalAlpha = 0.7 * (1 - Math.abs(month - 3) / 7);
    context.strokeStyle = '#73e1d7';
    context.lineWidth = 2;
    for (let index = 0; index < 5; index += 1) {
      const y = -gap / 2 + 23 + (index * (gap - 46)) / 4;
      context.beginPath();
      context.moveTo(-105, y);
      context.lineTo(-83, y);
      context.moveTo(83, y);
      context.lineTo(105, y);
      context.stroke();
    }
    context.restore();
  }

  if (view === 'section') {
    context.save();
    context.globalAlpha = 0.88;
    context.fillStyle = '#d5f5ef';
    context.font = '600 10px ui-monospace, SFMono-Regular, Menlo, monospace';
    context.fillText('SECTION / LAYERS EXPOSED', 108, -gap / 2 - 32);
    context.restore();
  }

  context.restore();
}

export function RegenerationViewport({
  month,
  view,
  onViewChange,
  visibleLayers,
}: RegenerationViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<any>(null);
  const fallbackModeRef = useRef(false);
  const fallbackTransformRef = useRef<FallbackTransform>({ ...defaultFallbackTransform });
  const pointerRef = useRef<{
    x: number;
    y: number;
    mode: 'rotate' | 'pan';
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const three = window.THREE;

    if (!three) {
      fallbackModeRef.current = true;
      fallbackAssembly(canvas, month, view, fallbackTransformRef.current, visibleLayers);
      return;
    }

    const scene = new three.Scene();
    const camera = new three.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(
      view === 'section' ? 0 : 5.8,
      view === 'section' ? 0.4 : 2.2,
      view === 'section' ? 10.5 : 7.6,
    );

    let renderer: any;
    try {
      renderer = new three.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      fallbackModeRef.current = true;
      fallbackAssembly(canvas, month, view, fallbackTransformRef.current, visibleLayers);
      return;
    }
    fallbackModeRef.current = false;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = three.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    scene.add(new three.HemisphereLight(0x9ed3dd, 0x14202b, 2.3));
    const key = new three.DirectionalLight(0xffc9a0, 3.8);
    key.position.set(-4, 6, 5);
    scene.add(key);
    const rim = new three.PointLight(0x49d8cb, 6, 13);
    rim.position.set(3, 0, 2);
    scene.add(rim);

    const group = new three.Group();
    const progress = month / 18;
    const gap = 1.78 - progress * 0.62;
    const sliceStart = view === 'section' ? -Math.PI / 2 : 0;
    const sliceLength = view === 'section' ? Math.PI : Math.PI * 2;
    const boneOpen = view === 'section';
    const boneMaterial = new three.MeshStandardMaterial({
      color: 0xd99065,
      roughness: 0.72,
      metalness: 0.04,
      side: three.DoubleSide,
    });
    const boneHighlight = new three.MeshStandardMaterial({
      color: 0xf1b67e,
      roughness: 0.8,
      metalness: 0.03,
      side: three.DoubleSide,
    });
    const upper = new three.Mesh(
      new three.CylinderGeometry(1.17, 1.38, 2.7, 16, 1, boneOpen, sliceStart, sliceLength),
      boneMaterial,
    );
    upper.name = 'Host bone ends';
    upper.position.y = gap / 2 + 1.35;
    group.add(upper);
    const lower = new three.Mesh(
      new three.CylinderGeometry(1.38, 1.17, 2.7, 16, 1, boneOpen, sliceStart, sliceLength),
      boneHighlight,
    );
    lower.name = 'Host bone ends';
    lower.position.y = -gap / 2 - 1.35;
    lower.rotation.y = 0.18;
    group.add(lower);

    const shellOpacity = Math.max(0.12, 1 - progress * 0.7);
    const shell = new three.Mesh(
      new three.CylinderGeometry(1.02, 1.02, gap + 1.1, 20, 1, true, sliceStart, sliceLength),
      new three.MeshPhysicalMaterial({
        color: 0x67d9d0,
        transparent: true,
        opacity: shellOpacity * 0.31,
        roughness: 0.18,
        transmission: 0.12,
        side: three.DoubleSide,
      }),
    );
    shell.name = 'Structural shell';
    group.add(shell);
    const barrier = new three.Mesh(
      new three.CylinderGeometry(0.84, 0.84, gap + 0.86, 20, 1, true, sliceStart, sliceLength),
      new three.MeshStandardMaterial({
        color: 0xe4c06e,
        transparent: true,
        opacity: shellOpacity * 0.42,
        roughness: 0.3,
        side: three.DoubleSide,
      }),
    );
    barrier.name = 'Hydrophobic seal';
    group.add(barrier);
    const matrix = new three.Mesh(
      new three.CylinderGeometry(0.67, 0.67, gap + 0.48, 18, 1, boneOpen, sliceStart, sliceLength),
      new three.MeshStandardMaterial({
        color: progress > 0.35 ? 0x75d39f : 0xeb9e6e,
        transparent: true,
        opacity: 0.38 + progress * 0.42,
        roughness: 0.72,
        side: three.DoubleSide,
      }),
    );
    matrix.name = 'Regenerating matrix';
    group.add(matrix);
    const graft = new three.Mesh(
      new three.CylinderGeometry(0.48, 0.48, gap + 0.58, 16, 1, boneOpen, sliceStart, sliceLength),
      new three.MeshStandardMaterial({ color: 0xead6af, roughness: 0.78, side: three.DoubleSide }),
    );
    graft.name = 'Vascularized fibula graft';
    graft.position.z = 0.03;
    group.add(graft);
    const vessel = new three.Mesh(
      new three.TorusGeometry(0.57, 0.035, 7, 48),
      new three.MeshBasicMaterial({ color: 0xe96b64 }),
    );
    vessel.name = 'Vascularized fibula graft';
    vessel.rotation.x = Math.PI / 2;
    vessel.position.y = 0;
    group.add(vessel);
    const vesselCore = new three.Mesh(
      new three.CylinderGeometry(0.045, 0.045, gap + 0.55, 8, 1, boneOpen, sliceStart, sliceLength),
      new three.MeshBasicMaterial({ color: 0xf2756a }),
    );
    vesselCore.name = 'Vascularized fibula graft';
    vesselCore.position.x = 0.25;
    group.add(vesselCore);

    const jointMaterial = new three.MeshStandardMaterial({
      color: 0xb26d4d,
      roughness: 0.56,
      metalness: 0.06,
    });
    [-1, 1].forEach((side) => {
      const joint = new three.Mesh(new three.BoxGeometry(1.42, 0.23, 1.08), jointMaterial);
      joint.name = 'Structural shell';
      joint.position.set(0, side * (gap / 2 + 0.18), 0);
      joint.rotation.y = side * 0.13;
      group.add(joint);
    });
    group.traverse((object: any) => {
      if (object.name && visibleLayers[object.name] === false) object.visible = false;
    });
    scene.add(group);

    const OrbitControls = three.OrbitControls;
    if (OrbitControls) {
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.07;
      controls.enablePan = true;
      controls.screenSpacePanning = true;
      controls.panSpeed = 0.75;
      controls.rotateSpeed = 0.7;
      controls.zoomSpeed = 0.9;
      controls.minDistance = 3.2;
      controls.maxDistance = 16;
      controls.target.set(0, 0, 0);
      controlsRef.current = controls;
    }

    const resize = () => {
      const width = canvas.clientWidth || 600;
      const height = canvas.clientHeight || 500;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    let animationFrame = 0;
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      vessel.scale.set(1, 1 + Math.sin(Date.now() / 170) * 0.08, 1);
      group.rotation.y += view === 'section' ? 0.0005 : 0.001;
      if (controlsRef.current) controlsRef.current.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      controlsRef.current?.dispose?.();
      renderer.dispose();
      scene.traverse((object: any) => {
        object.geometry?.dispose?.();
        object.material?.dispose?.();
      });
      controlsRef.current = null;
    };
  }, [month, view, visibleLayers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.style.touchAction = 'none';

    const redraw = () => {
      if (fallbackModeRef.current) {
        fallbackAssembly(canvas, month, view, fallbackTransformRef.current, visibleLayers);
      }
    };
    const onWheel = (event: WheelEvent) => {
      if (!fallbackModeRef.current) return;
      event.preventDefault();
      fallbackTransformRef.current.zoom = clamp(
        fallbackTransformRef.current.zoom * Math.exp(-event.deltaY * 0.001),
        0.55,
        3.2,
      );
      redraw();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!fallbackModeRef.current) return;
      canvas.setPointerCapture(event.pointerId);
      pointerRef.current = {
        x: event.clientX,
        y: event.clientY,
        mode: event.shiftKey ? 'pan' : 'rotate',
      };
    };
    const onPointerMove = (event: PointerEvent) => {
      const pointer = pointerRef.current;
      if (!fallbackModeRef.current || !pointer) return;
      const deltaX = event.clientX - pointer.x;
      const deltaY = event.clientY - pointer.y;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (pointer.mode === 'rotate') {
        fallbackTransformRef.current.rotation = clamp(
          fallbackTransformRef.current.rotation + deltaX * 0.008,
          -0.62,
          0.62,
        );
        fallbackTransformRef.current.panY += deltaY * 0.35;
      } else {
        fallbackTransformRef.current.panX += deltaX;
        fallbackTransformRef.current.panY += deltaY;
      }
      redraw();
    };
    const onPointerUp = (event: PointerEvent) => {
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      pointerRef.current = null;
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    return () => {
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      pointerRef.current = null;
    };
  }, [month, view, visibleLayers]);

  const resetView = () => {
    if (controlsRef.current?.reset) {
      controlsRef.current.reset();
      return;
    }
    fallbackTransformRef.current = { ...defaultFallbackTransform };
    const canvas = canvasRef.current;
    if (canvas) {
      fallbackAssembly(canvas, month, view, fallbackTransformRef.current, visibleLayers);
    }
  };

  return (
    <section className="glass-panel relative min-h-[470px] overflow-hidden rounded-xl md:min-h-[550px] animate-enter">
      <div className="instrument-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(72,205,194,.13),transparent_65%)]" />
      <canvas
        ref={canvasRef}
        className="relative z-10 h-[470px] w-full cursor-grab touch-none active:cursor-grabbing md:h-[550px]"
        data-testid="canvas-regeneration-assembly"
      />
      <div className="pointer-events-none absolute left-4 top-4 z-20">
        <p className="mono text-[9px] uppercase tracking-[.24em] text-slate-500">Live assembly / orbital view</p>
        <p className="mt-1 text-xs text-slate-300">
          BBREU construct <span className="text-slate-600">·</span> 01
        </p>
      </div>
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-slate-700/70 bg-[#111b27]/90 p-1.5 backdrop-blur">
          <button
            type="button"
            data-testid="button-perspective-view"
            onClick={() => onViewChange('perspective')}
            className={`rounded-md px-3 py-1.5 mono text-[10px] uppercase tracking-wider transition-all ${
              view === 'perspective' ? 'bg-cyan-300/15 text-cyan-200' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            3D perspective
          </button>
          <button
            type="button"
            data-testid="button-section-view"
            onClick={() => onViewChange('section')}
            className={`rounded-md px-3 py-1.5 mono text-[10px] uppercase tracking-wider transition-all ${
              view === 'section' ? 'bg-cyan-300/15 text-cyan-200' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            vertical section
          </button>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-label="Reset orbital view"
            data-testid="button-reset-orbit"
            onClick={resetView}
            className="rounded-md border border-slate-700/70 bg-[#111b27]/90 p-2 text-slate-400 backdrop-blur transition-colors hover:text-cyan-200"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            aria-label="Expand visualization"
            data-testid="button-expand-visualization"
            onClick={() => canvasRef.current?.requestFullscreen?.()}
            className="rounded-md border border-slate-700/70 bg-[#111b27]/90 p-2 text-slate-400 backdrop-blur transition-colors hover:text-cyan-200"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
      <div className="pointer-events-none absolute right-4 top-4 z-20 text-right">
        <div className="flex items-center justify-end gap-1.5 mono text-[9px] uppercase tracking-wider text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> model active
        </div>
        <p className="mt-1 mono text-[9px] text-slate-600">drag to inspect · wheel to zoom</p>
      </div>
    </section>
  );
}