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
  tilt: number;
};

const defaultFallbackTransform: FallbackTransform = {
  zoom: 1,
  panX: 0,
  panY: 0,
  rotation: 0,
  tilt: 0,
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
  const gap = 230;
  const scale = Math.min(width / 360, height / 550) * transform.zoom;
  const cx = width / 2 + transform.panX;
  const cy = height / 2 + transform.panY;

  context.save();
  context.translate(cx, cy);
  context.rotate(view === 'section' ? transform.rotation * 0.25 : transform.rotation);
  context.scale(scale * (view === 'section' ? -1 : 1), scale);

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
    context.lineWidth = 10;
    context.setLineDash([3, 8]);
    roundedRect(-64, -gap / 2 - 10, 128, gap + 20, 18);
    context.stroke();
    context.restore();
  }

  if (visibleLayers['Hydrophobic seal']) {
    context.save();
    context.globalAlpha = Math.max(0.28, 1 - progress * 0.72);
    context.strokeStyle = '#e5c56d';
    context.lineWidth = 6;
    roundedRect(-59, -gap / 2 - 8, 118, gap + 16, 15);
    context.stroke();
    context.restore();
  }

  if (visibleLayers['Regenerating matrix']) {
    const matrixGradient = context.createLinearGradient(-50, 0, 50, 0);
    matrixGradient.addColorStop(0, '#a7b5b5');
    matrixGradient.addColorStop(0.5, '#e4e9e4');
    matrixGradient.addColorStop(1, '#9baaaa');
    context.globalAlpha = 0.2 + progress * 0.72;
    context.fillStyle = matrixGradient;
    const matrixHalfWidth = 32 + progress * 34;
    roundedRect(-matrixHalfWidth, -gap / 2 - 3, matrixHalfWidth * 2, gap + 6, 14);
    context.fill();
  }

  if (visibleLayers['Vascularized fibula graft']) {
    context.globalAlpha = 0.98;
    const graftGradient = context.createLinearGradient(-31, 0, 31, 0);
    graftGradient.addColorStop(0, '#b83c4d');
    graftGradient.addColorStop(0.28, '#df525a');
    graftGradient.addColorStop(0.4, '#ef7770');
    graftGradient.addColorStop(0.5, '#f4f4ed');
    graftGradient.addColorStop(0.6, '#ffffff');
    graftGradient.addColorStop(0.72, '#ef7770');
    graftGradient.addColorStop(1, '#c74350');
    context.fillStyle = graftGradient;
    roundedRect(-32, -gap / 2 - 3, 64, gap + 6, 12);
    context.fill();

    context.strokeStyle = '#f06f66';
    context.lineWidth = 5;
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
    context.fillStyle = '#e7eee7';
    [-1, 1].forEach((side) => {
      const y = side * (gap / 2 + 5);
      roundedRect(-64, y - 8, 128, 16, 7);
      context.fill();
      context.fillStyle = '#b9c8c1';
      for (let index = 0; index < 5; index += 1) {
        context.fillRect(-50 + index * 24, side < 0 ? y - 12 : y - 1, 13, 6);
      }
      context.fillStyle = '#e7eee7';
    });
    context.restore();
  }

  const drawBone = (top: boolean) => {
    const y = top ? -gap / 2 - 80 : gap / 2;
    const depth = top ? -12 : 12;
    context.save();
    context.translate(depth, 0);
    const gradient = context.createLinearGradient(-78, 0, 78, 0);
    gradient.addColorStop(0, '#d6ddd6');
    gradient.addColorStop(0.38, '#ffffff');
    gradient.addColorStop(1, '#e9eee8');
    context.fillStyle = gradient;
    roundedRect(-66, y, 132, 80, 16);
    context.fill();
    context.fillStyle = 'rgba(94, 113, 111, .28)';
    context.fillRect(-45, top ? y + 64 : y + 8, 90, 14);
    context.fillStyle = 'rgba(255, 255, 255, .62)';
    context.fillRect(-50, top ? y + 8 : y + 62, 100, 5);
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

  // Repaint the translucent boundaries last so the encasing remains visible
  // over the denser matrix and graft layers in the 2D fallback.
  if (visibleLayers['Hydrophobic seal']) {
    context.save();
    context.globalAlpha = Math.max(0.42, 1 - progress * 0.5);
    context.strokeStyle = '#e5c56d';
    context.lineWidth = 6;
    roundedRect(-59, -gap / 2 - 8, 118, gap + 16, 15);
    context.stroke();
    context.restore();
  }
  if (visibleLayers['Structural shell']) {
    context.save();
    context.globalAlpha = Math.max(0.34, 1 - progress * 0.55);
    context.strokeStyle = '#55d9d1';
    context.lineWidth = 10;
    context.setLineDash([3, 8]);
    roundedRect(-64, -gap / 2 - 10, 128, gap + 20, 18);
    context.stroke();
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
    camera.position.set(0, view === 'section' ? 0.35 : 0.25, view === 'section' ? 10.5 : 8.6);

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
    const gap = 3;
    const isSection = view === 'section';
    const sliceStart = isSection ? -Math.PI / 2 : 0;
    const sliceLength = isSection ? Math.PI : Math.PI * 2;
    const layerOpenEnded = !isSection;
    const boneMaterial = new three.MeshStandardMaterial({
      color: 0xf1f4ed,
      roughness: 0.72,
      metalness: 0.04,
      side: three.DoubleSide,
    });
    const boneHighlight = new three.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0.03,
      side: three.DoubleSide,
    });
    const addSectionCutFaces = (
      radius: number,
      height: number,
      centerY: number,
      centerZ: number,
      material: any,
      name: string,
      renderOrder: number,
      rotationY = 0,
    ) => {
      if (!isSection) return;
      [sliceStart, sliceStart + sliceLength].forEach((angle) => {
        const face = new three.Mesh(
          new three.PlaneGeometry(radius, height),
          material.clone(),
        );
        face.name = name;
        face.position.set(
          Math.sin(angle + rotationY) * radius / 2,
          centerY,
          Math.cos(angle + rotationY) * radius / 2 + centerZ,
        );
        face.rotation.y = angle + rotationY - Math.PI / 2;
        face.renderOrder = renderOrder + 1;
        group.add(face);
      });
    };
    const upper = new three.Mesh(
      new three.CylinderGeometry(0.88, 1.02, 1.47, 16, 1, false, sliceStart, sliceLength),
      boneMaterial,
    );
    upper.name = 'Host bone ends';
    upper.position.y = gap / 2 + 0.735;
    group.add(upper);
    addSectionCutFaces(1.02, 1.47, upper.position.y, 0, boneMaterial, 'Host bone ends', 0);
    const lower = new three.Mesh(
      new three.CylinderGeometry(1.02, 0.88, 1.47, 16, 1, false, sliceStart, sliceLength),
      boneHighlight,
    );
    lower.name = 'Host bone ends';
    lower.position.y = -gap / 2 - 0.735;
    lower.rotation.y = 0.18;
    group.add(lower);
    addSectionCutFaces(1.02, 1.47, lower.position.y, 0, boneHighlight, 'Host bone ends', 0, lower.rotation.y);

    const shellOpacity = Math.max(0.12, 1 - progress * 0.7);
    const shell = new three.Mesh(
      new three.CylinderGeometry(0.96, 0.96, gap + 0.62, 20, 1, layerOpenEnded, sliceStart, sliceLength),
      new three.MeshPhysicalMaterial({
        color: 0x67d9d0,
        transparent: true,
        opacity: shellOpacity * 0.31,
        roughness: 0.18,
        transmission: 0.12,
        depthWrite: false,
        side: three.DoubleSide,
      }),
    );
    shell.name = 'Structural shell';
    shell.renderOrder = 60;
    group.add(shell);
    addSectionCutFaces(0.96, gap + 0.62, 0, 0, shell.material, 'Structural shell', 60);
    const barrier = new three.Mesh(
      new three.CylinderGeometry(0.86, 0.86, gap + 0.5, 20, 1, layerOpenEnded, sliceStart, sliceLength),
      new three.MeshStandardMaterial({
        color: 0xe4c06e,
        transparent: true,
        opacity: shellOpacity * 0.42,
        roughness: 0.3,
        depthWrite: false,
        side: three.DoubleSide,
      }),
    );
    barrier.name = 'Hydrophobic seal';
    barrier.renderOrder = 50;
    group.add(barrier);
    addSectionCutFaces(0.86, gap + 0.5, 0, 0, barrier.material, 'Hydrophobic seal', 50);
    const matrixRadius = 0.48 + progress * 0.54;
    const matrix = new three.Mesh(
      new three.CylinderGeometry(matrixRadius, matrixRadius, gap + 0.28, 18, 1, false, sliceStart, sliceLength),
      new three.MeshStandardMaterial({
        color: 0xcbd3d1,
        transparent: true,
        opacity: 0.2 + progress * 0.72,
        roughness: 0.72,
        depthWrite: false,
        side: three.DoubleSide,
      }),
    );
    matrix.name = 'Regenerating matrix';
    matrix.renderOrder = 10;
    group.add(matrix);
    addSectionCutFaces(matrixRadius, gap + 0.28, 0, 0, matrix.material, 'Regenerating matrix', 10);
    const graft = new three.Mesh(
      new three.CylinderGeometry(0.48, 0.48, gap + 0.34, 16, 1, false, sliceStart, sliceLength),
      new three.MeshStandardMaterial({ color: 0xf4f4ed, roughness: 0.78, side: three.DoubleSide }),
    );
    graft.name = 'Vascularized fibula graft';
    graft.position.z = 0.03;
    graft.renderOrder = 20;
    group.add(graft);
    addSectionCutFaces(0.48, gap + 0.34, 0, graft.position.z, graft.material, 'Vascularized fibula graft', 20);
    const graftVascularHalf = new three.Mesh(
      new three.CylinderGeometry(0.485, 0.485, gap + 0.36, 16, 1, false, sliceStart, sliceLength),
      new three.MeshStandardMaterial({ color: 0xe96b64, roughness: 0.7, side: three.DoubleSide }),
    );
    graftVascularHalf.name = 'Vascularized fibula graft';
    graftVascularHalf.position.z = 0.04;
    graftVascularHalf.renderOrder = 30;
    group.add(graftVascularHalf);
    addSectionCutFaces(0.485, gap + 0.36, 0, graftVascularHalf.position.z, graftVascularHalf.material, 'Vascularized fibula graft', 30);
    const vessel = new three.Mesh(
      new three.TorusGeometry(0.57, 0.035, 7, 48, sliceLength),
      new three.MeshBasicMaterial({ color: 0xe96b64 }),
    );
    vessel.name = 'Vascularized fibula graft';
    vessel.rotation.x = Math.PI / 2;
    vessel.position.y = 0;
    vessel.renderOrder = 40;
    group.add(vessel);
    const vesselCore = new three.Mesh(
      new three.CylinderGeometry(0.06, 0.06, gap + 0.4, 8, 1, false, sliceStart, sliceLength),
      new three.MeshBasicMaterial({ color: 0xf2756a }),
    );
    vesselCore.name = 'Vascularized fibula graft';
    vesselCore.position.set(0.25, 0, 0.5);
    vesselCore.renderOrder = 40;
    group.add(vesselCore);
    addSectionCutFaces(0.06, gap + 0.4, 0, vesselCore.position.z, vesselCore.material, 'Vascularized fibula graft', 40);

    const jointMaterial = new three.MeshStandardMaterial({
      color: 0xe7eee7,
      roughness: 0.56,
      metalness: 0.02,
    });
    [-1, 1].forEach((side) => {
      const joint = new three.Mesh(new three.BoxGeometry(1.28, 0.23, 0.96), jointMaterial);
      joint.name = 'Structural shell';
      joint.position.set(0, side * (gap / 2 + 0.18), 0);
      joint.rotation.y = side * 0.13;
      group.add(joint);
    });
    group.traverse((object: any) => {
      if (object.name && visibleLayers[object.name] === false) object.visible = false;
    });
    scene.add(group);

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
      const transform = fallbackTransformRef.current;
      group.position.x = transform.panX * 0.005;
      group.position.y = -transform.panY * 0.005;
      group.rotation.y = (view === 'section' ? Math.PI : 0) + transform.rotation;
      group.rotation.x = transform.tilt;
      group.scale.x = 1;
      camera.position.x = 0;
      camera.position.y = view === 'section' ? 0.35 : 0.25;
      camera.position.z = (view === 'section' ? 10.5 : 8.6) / transform.zoom;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      renderer.dispose();
      scene.traverse((object: any) => {
        object.geometry?.dispose?.();
        object.material?.dispose?.();
      });
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
      event.preventDefault();
      fallbackTransformRef.current.zoom = clamp(
        fallbackTransformRef.current.zoom * Math.exp(-event.deltaY * 0.001),
        0.65,
        2.5,
      );
      redraw();
    };
    const onPointerDown = (event: PointerEvent) => {
      canvas.setPointerCapture(event.pointerId);
      pointerRef.current = {
        x: event.clientX,
        y: event.clientY,
        mode: event.shiftKey ? 'pan' : 'rotate',
      };
    };
    const onPointerMove = (event: PointerEvent) => {
      const pointer = pointerRef.current;
      if (!pointer) return;
      const deltaX = event.clientX - pointer.x;
      const deltaY = event.clientY - pointer.y;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (pointer.mode === 'rotate') {
        fallbackTransformRef.current.rotation += deltaX * 0.008;
        if (fallbackModeRef.current) {
          fallbackTransformRef.current.panY += deltaY * 0.35;
        } else {
          fallbackTransformRef.current.tilt = clamp(
            fallbackTransformRef.current.tilt + deltaY * 0.006,
            -0.5,
            0.5,
          );
        }
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
        <p className="mt-1 mono text-[9px] text-slate-600">drag rotate · shift-drag move · wheel zoom</p>
      </div>
    </section>
  );
}