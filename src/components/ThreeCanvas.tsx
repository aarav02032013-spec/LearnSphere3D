import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Pinpoint } from '../types';

export interface PartInfo {
  name: string;
  category?: string;
  function: string;
  fact?: string;
  pinId?: string;
}

interface HoveredTooltipData extends PartInfo {
  screenX: number;
  screenY: number;
}

interface ThreeCanvasProps {
  renderType: string;
  wireframe?: boolean;
  xray?: boolean;
  explodeFactor?: number;
  autoRotate?: boolean;
  pinpoints?: Pinpoint[];
  selectedPinId?: string | null;
  onSelectPin?: (pin: Pinpoint) => void;
  speedMultiplier?: number;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  renderType,
  wireframe = false,
  xray = false,
  explodeFactor = 0,
  autoRotate = true,
  pinpoints = [],
  selectedPinId = null,
  onSelectPin,
  speedMultiplier = 1
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const pinsGroupRef = useRef<THREE.Group | null>(null);
  const stageGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredTooltip, setHoveredTooltip] = useState<HoveredTooltipData | null>(null);
  const currentHoveredObjRef = useRef<THREE.Object3D | null>(null);

  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const timeRef = useRef(0);

  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;
  const renderTypeRef = useRef(renderType);
  renderTypeRef.current = renderType;
  const speedMultiplierRef = useRef(speedMultiplier);
  speedMultiplierRef.current = speedMultiplier;

  // Initialize Scene, Camera, Renderer, Lights & Holographic Stage
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 720;
    const height = mount.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera with elevated isometric view
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.4);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with ACES ToneMapping & High Performance
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    rendererRef.current = renderer;

    const domElement = renderer.domElement;
    domElement.style.width = '100%';
    domElement.style.height = '100%';
    domElement.style.display = 'block';
    domElement.style.position = 'absolute';
    domElement.style.top = '0';
    domElement.style.left = '0';

    // Safely clear only canvas mount node, without touching React children
    while (mount.firstChild) {
      mount.removeChild(mount.firstChild);
    }
    mount.appendChild(domElement);

    // 4. Stylized Cinematic Multi-Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Key Light (Crisp daylight white)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    // Cyan Fill Light (Stylized sci-fi glow)
    const cyanFill = new THREE.DirectionalLight(0x06b6d4, 1.2);
    cyanFill.position.set(-6, -2, -4);
    scene.add(cyanFill);

    // Magenta Rim Light (Edge definition)
    const magentaRim = new THREE.DirectionalLight(0xd946ef, 1.4);
    magentaRim.position.set(0, 6, -5);
    scene.add(magentaRim);

    // Amber Accent Spot from below
    const amberAccent = new THREE.PointLight(0xf59e0b, 1.2, 10);
    amberAccent.position.set(0, -2.5, 2);
    scene.add(amberAccent);

    // 5. Stylized Holographic Projection Stage (Pedestal & Rings)
    const stageGroup = new THREE.Group();
    stageGroupRef.current = stageGroup;
    scene.add(stageGroup);

    // Concentric holographic base rings
    const ringOuterGeom = new THREE.RingGeometry(1.8, 1.85, 64);
    const ringOuterMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const ringOuter = new THREE.Mesh(ringOuterGeom, ringOuterMat);
    ringOuter.rotation.x = Math.PI / 2;
    ringOuter.position.y = -1.55;
    stageGroup.add(ringOuter);

    const ringInnerGeom = new THREE.RingGeometry(1.3, 1.33, 48);
    const ringInnerMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const ringInner = new THREE.Mesh(ringInnerGeom, ringInnerMat);
    ringInner.rotation.x = Math.PI / 2;
    ringInner.position.y = -1.55;
    stageGroup.add(ringInner);

    // Coordinate tick markers
    const ticksGeom = new THREE.BufferGeometry();
    const tickVerts: number[] = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const r1 = 1.75;
      const r2 = 1.85;
      tickVerts.push(Math.cos(angle) * r1, -1.55, Math.sin(angle) * r1);
      tickVerts.push(Math.cos(angle) * r2, -1.55, Math.sin(angle) * r2);
    }
    ticksGeom.setAttribute('position', new THREE.Float32BufferAttribute(tickVerts, 3));
    const ticksLine = new THREE.LineSegments(
      ticksGeom,
      new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 })
    );
    stageGroup.add(ticksLine);

    // 6. Floating Ambient Quantum Particles (Dust / Sparkles)
    const particleCount = 75;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 6;
      particlePositions[i + 1] = (Math.random() - 0.5) * 4;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x67e8f9,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    particlesRef.current = particles;
    scene.add(particles);

    // 7. Root Group (Holds both modelGroup and pinsGroup so they rotate in lockstep)
    const rootGroup = new THREE.Group();
    rootGroup.rotation.x = 0.25;
    rootGroup.rotation.y = -0.35;
    rootGroupRef.current = rootGroup;
    scene.add(rootGroup);

    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    rootGroup.add(modelGroup);

    const pinsGroup = new THREE.Group();
    pinsGroupRef.current = pinsGroup;
    rootGroup.add(pinsGroup);

    // Build model & pins
    buildModel(renderType, modelGroup, { wireframe, xray, explodeFactor });
    buildPins(pinpoints, pinsGroup, selectedPinId);

    // 8. Resize Observer
    const handleResize = () => {
      if (!mount || !renderer || !camera) return;
      const w = mount.clientWidth || 720;
      const h = mount.clientHeight || 450;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(mount);
    window.addEventListener('resize', handleResize);
    requestAnimationFrame(handleResize);

    // 9. Animation Loop
    let lastTime = performance.now();
    const animate = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      timeRef.current += delta * speedMultiplierRef.current;

      // Auto rotation of root model
      if (autoRotateRef.current && rootGroupRef.current && !isDraggingRef.current) {
        rootGroupRef.current.rotation.y += 0.005;
      }

      // Rotate holographic stage rings slowly when autoRotate is active
      if (autoRotateRef.current && stageGroupRef.current) {
        stageGroupRef.current.rotation.y += 0.002;
      }

      // Gently drift ambient particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.001;
      }

      // Model-specific continuous dynamic animations
      try {
        updateModelAnimation(renderTypeRef.current, modelGroup, timeRef.current);
      } catch (e) {
        console.warn('updateModelAnimation error:', e);
      }

      // Pulse pinpoints
      if (pinsGroupRef.current) {
        pinsGroupRef.current.children.forEach((pinObj, index) => {
          const pulse = 1 + 0.15 * Math.sin(timeRef.current * 3 + index);
          pinObj.scale.set(pulse, pulse, pulse);
        });
      }

      try {
        renderer.render(scene, camera);
      } catch (e) {
        console.warn('Renderer render error:', e);
      }
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      try {
        renderer.dispose();
      } catch {}
      if (domElement.parentNode === mount) {
        mount.removeChild(domElement);
      }
    };
  }, []);

  // Update model on parameter changes
  useEffect(() => {
    try {
      if (currentHoveredObjRef.current) {
        unhighlightObject(currentHoveredObjRef.current);
        currentHoveredObjRef.current = null;
      }
      setHoveredTooltip(null);
      if (!modelGroupRef.current) return;
      clearGroup(modelGroupRef.current);
      buildModel(renderType, modelGroupRef.current, { wireframe, xray, explodeFactor });
    } catch (e) {
      console.warn('Model update error:', e);
    }
  }, [renderType, wireframe, xray, explodeFactor]);

  // Update pins on pinpoint selection changes
  useEffect(() => {
    try {
      if (!pinsGroupRef.current) return;
      clearGroup(pinsGroupRef.current);
      buildPins(pinpoints, pinsGroupRef.current, selectedPinId);
    } catch (e) {
      console.warn('Pins update error:', e);
    }
  }, [pinpoints, selectedPinId]);

  // Interactive Orbit Controls
  const handleDragStart = (clientX: number, clientY: number) => {
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    if (currentHoveredObjRef.current) {
      unhighlightObject(currentHoveredObjRef.current);
      currentHoveredObjRef.current = null;
    }
    setHoveredTooltip(null);
    previousMousePositionRef.current = { x: clientX, y: clientY };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    try {
      if (!isDraggingRef.current || !rootGroupRef.current) return;
      if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return;
      const deltaX = clientX - previousMousePositionRef.current.x;
      const deltaY = clientY - previousMousePositionRef.current.y;

      rootGroupRef.current.rotation.y += deltaX * 0.008;
      rootGroupRef.current.rotation.x += deltaY * 0.008;

      previousMousePositionRef.current = { x: clientX, y: clientY };
    } catch (e) {
      console.warn('Drag move error:', e);
    }
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  // Hover Raycasting for parts & pins
  const handleHoverRaycast = (clientX: number, clientY: number) => {
    try {
      if (!containerRef.current || !cameraRef.current || !modelGroupRef.current || isDraggingRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (!rect || rect.width <= 0 || rect.height <= 0) return;
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;
      if (!Number.isFinite(ndcX) || !Number.isFinite(ndcY)) return;

      raycasterRef.current.setFromCamera(new THREE.Vector2(ndcX, ndcY), cameraRef.current);

      // 1. Check pinpoints first
      if (pinsGroupRef.current && pinsGroupRef.current.children.length > 0) {
        const pinHits = raycasterRef.current.intersectObjects(pinsGroupRef.current.children, true);
        if (pinHits.length > 0) {
          let pinObj: THREE.Object3D | null = pinHits[0].object;
          while (pinObj && !pinObj.userData?.pinId && pinObj.parent) {
            pinObj = pinObj.parent;
          }
          if (pinObj?.userData?.pinId) {
            const pin = pinpoints.find((p) => p.id === pinObj!.userData.pinId);
            if (pin) {
              if (currentHoveredObjRef.current !== pinObj) {
                if (currentHoveredObjRef.current) unhighlightObject(currentHoveredObjRef.current);
                currentHoveredObjRef.current = pinObj;
                highlightObject(pinObj);
              }
              setHoveredTooltip({
                name: pin.name,
                category: 'Anatomical Marker',
                function: pin.description,
                fact: pin.formulaOrFact || pin.significance,
                pinId: pin.id,
                screenX: clientX - rect.left,
                screenY: clientY - rect.top
              });
              return;
            }
          }
        }
      }

      // 2. Check 3D model parts
      const modelHits = raycasterRef.current.intersectObjects(modelGroupRef.current.children, true);
      if (modelHits.length > 0) {
        let foundPartObj: THREE.Object3D | null = null;
        for (const hit of modelHits) {
          let curr: THREE.Object3D | null = hit.object;
          while (curr && curr !== modelGroupRef.current) {
            if (curr.userData?.partInfo) {
              foundPartObj = curr;
              break;
            }
            curr = curr.parent;
          }
          if (foundPartObj) break;
        }

        if (foundPartObj && foundPartObj.userData?.partInfo) {
          if (currentHoveredObjRef.current !== foundPartObj) {
            if (currentHoveredObjRef.current) unhighlightObject(currentHoveredObjRef.current);
            currentHoveredObjRef.current = foundPartObj;
            highlightObject(foundPartObj);
          }
          setHoveredTooltip({
            ...foundPartObj.userData.partInfo,
            screenX: clientX - rect.left,
            screenY: clientY - rect.top
          });
          return;
        }
      }

      // Not hovering any interactive part
      if (currentHoveredObjRef.current) {
        unhighlightObject(currentHoveredObjRef.current);
        currentHoveredObjRef.current = null;
      }
      setHoveredTooltip(null);
    } catch (e) {
      console.warn('Hover raycast error:', e);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX, e.clientY);
  const onMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      handleDragMove(e.clientX, e.clientY);
    } else {
      handleHoverRaycast(e.clientX, e.clientY);
    }
  };
  const onMouseUp = () => handleDragEnd();
  const onMouseLeave = () => {
    handleDragEnd();
    if (currentHoveredObjRef.current) {
      unhighlightObject(currentHoveredObjRef.current);
      currentHoveredObjRef.current = null;
    }
    setHoveredTooltip(null);
  };
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  // Pinpoint & Part Click Selection
  const handleClick = (e: React.MouseEvent) => {
    try {
      if (!containerRef.current || !cameraRef.current || !onSelectPin) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (!rect || rect.width <= 0 || rect.height <= 0) return;
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      if (!Number.isFinite(mouseX) || !Number.isFinite(mouseY)) return;

      mouseRef.current.x = mouseX;
      mouseRef.current.y = mouseY;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      // 1. Check pinpoints first
      if (pinsGroupRef.current && pinsGroupRef.current.children.length > 0) {
        const pinIntersects = raycasterRef.current.intersectObjects(pinsGroupRef.current.children, true);
        if (pinIntersects.length > 0) {
          let clickedObj: THREE.Object3D | null = pinIntersects[0].object;
          while (clickedObj && !clickedObj.userData?.pinId && clickedObj.parent) {
            clickedObj = clickedObj.parent;
          }
          if (clickedObj?.userData?.pinId) {
            const pin = pinpoints.find((p) => p.id === clickedObj!.userData.pinId);
            if (pin) {
              onSelectPin(pin);
              return;
            }
          }
        }
      }

      // 2. Check if clicking directly on a model part
      if (modelGroupRef.current && modelGroupRef.current.children.length > 0) {
        const intersects = raycasterRef.current.intersectObjects(modelGroupRef.current.children, true);
        for (const hit of intersects) {
          let curr: THREE.Object3D | null = hit.object;
          while (curr && curr !== modelGroupRef.current) {
            if (curr.userData?.partInfo?.pinId) {
              const pin = pinpoints.find((p) => p.id === curr!.userData.partInfo.pinId);
              if (pin) {
                onSelectPin(pin);
                return;
              }
            }
            curr = curr.parent;
          }
        }
      }
    } catch (e) {
      console.warn('Click handler error:', e);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        if (!cameraRef.current) return;
        const zoomDelta = e.deltaY * 0.003;
        if (Number.isFinite(zoomDelta)) {
          cameraRef.current.position.z = Math.max(1.8, Math.min(8.5, cameraRef.current.position.z + zoomDelta));
        }
      } catch (err) {
        console.warn('Wheel event error:', err);
      }
    };
    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none overscroll-contain"
      style={{ minHeight: '440px' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={handleDragEnd}
      onClick={handleClick}
    >
      {/* Dedicated Three.js canvas mount element - decoupled from React virtual DOM */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Informative Hover Tooltip */}
      {hoveredTooltip && !isDragging && Number.isFinite(hoveredTooltip.screenX) && Number.isFinite(hoveredTooltip.screenY) && (
        <div
          className="pointer-events-none absolute z-40 transition-all duration-75 ease-out"
          style={{
            left: `${Math.max(145, Math.min((containerRef.current?.clientWidth || 600) - 145, hoveredTooltip.screenX))}px`,
            top: hoveredTooltip.screenY < 170
              ? `${Math.max(10, hoveredTooltip.screenY + 16)}px`
              : `${Math.max(10, hoveredTooltip.screenY - 14)}px`,
            transform: hoveredTooltip.screenY < 170 ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
          }}
        >
          {hoveredTooltip.screenY < 170 && (
            <div className="w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-slate-900 mx-auto -mb-[1px]" />
          )}
          <div className="w-72 bg-slate-900/95 backdrop-blur-md text-white text-xs rounded-xl p-3.5 shadow-2xl border border-cyan-400/40 ring-1 ring-cyan-500/20 shadow-cyan-950/70 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {hoveredTooltip.category || 'Anatomical Part'}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono tracking-tight flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-cyan-400"></span> 3D Highlight
              </span>
            </div>
            <h4 className="text-sm font-bold text-white tracking-wide mb-1 leading-snug">
              {hoveredTooltip.name}
            </h4>
            <p className="text-slate-300 text-[11px] leading-relaxed mb-2">
              <span className="font-semibold text-cyan-200">Function: </span>
              {hoveredTooltip.function}
            </p>
            {hoveredTooltip.fact && (
              <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700/60 mb-2">
                <p className="text-[10px] text-amber-200/90 leading-tight">
                  <span className="font-semibold text-amber-300">Key Fact: </span>
                  {hoveredTooltip.fact}
                </p>
              </div>
            )}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/80">
              <span className="flex items-center gap-1 text-cyan-400 font-medium">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                Click to focus & inspect
              </span>
              <span className="text-[9px] text-slate-500">Drag to orbit</span>
            </div>
          </div>
          {hoveredTooltip.screenY >= 170 && (
            <div className="w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-900 mx-auto -mt-[1px]" />
          )}
        </div>
      )}

      {/* Floating interactive guide pill at bottom of canvas */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 text-[11px] text-slate-300 shadow-lg">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span>Hover parts to inspect • Click to focus details</span>
      </div>
    </div>
  );
};

// Highlights an object or hierarchy of meshes and lines
function highlightObject(rootObj: THREE.Object3D) {
  if (!rootObj) return;
  try {
    rootObj.traverse((child) => {
      const obj = child as any;
      if (!obj) return;
      if ((obj.isMesh || obj.isLine) && !obj.userData?.__highlighted && obj.material) {
        obj.userData = obj.userData || {};
        obj.userData.__origMaterial = obj.material;
        try {
          if (Array.isArray(obj.material)) {
            obj.material = obj.material.map((m: any) => {
              if (!m) return m;
              const clone = m.clone();
              if ('emissive' in clone && clone.emissive) {
                clone.emissive.setHex(0x38bdf8);
                clone.emissiveIntensity = Math.max((m.emissiveIntensity || 0) + 0.75, 1.0);
              } else if ('color' in clone && clone.color) {
                clone.color.setHex(0x38bdf8);
              }
              return clone;
            });
          } else {
            const clone = obj.material.clone();
            if ('emissive' in clone && clone.emissive) {
              clone.emissive.setHex(0x38bdf8);
              clone.emissiveIntensity = Math.max((obj.material.emissiveIntensity || 0) + 0.75, 1.0);
            } else if ('color' in clone && clone.color) {
              clone.color.setHex(0x38bdf8);
            }
            obj.material = clone;
          }
          obj.userData.__highlighted = true;
        } catch (e) {
          console.warn('Highlight failed for object:', e);
        }
      }
    });
  } catch (err) {
    console.warn('highlightObject error:', err);
  }
}

// Restores original materials
function unhighlightObject(rootObj: THREE.Object3D) {
  if (!rootObj) return;
  try {
    rootObj.traverse((child) => {
      const obj = child as any;
      if (!obj) return;
      if ((obj.isMesh || obj.isLine) && obj.userData?.__highlighted && obj.userData.__origMaterial) {
        try {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m: any) => m && m.dispose && m.dispose());
          } else if (obj.material && obj.material.dispose) {
            obj.material.dispose();
          }
        } catch {}
        obj.material = obj.userData.__origMaterial;
        delete obj.userData.__origMaterial;
        delete obj.userData.__highlighted;
      }
    });
  } catch (err) {
    console.warn('unhighlightObject error:', err);
  }
}

// Helper: Disposes geometries and meshes cleanly
function clearGroup(group: THREE.Group) {
  if (!group) return;
  try {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      child.traverse((obj: any) => {
        if (obj && obj.geometry) {
          try {
            obj.geometry.dispose();
          } catch {}
        }
      });
    }
  } catch (e) {
    console.warn('clearGroup error:', e);
  }
}

// Stylized Material Generator with emissive accents and crystal clarity
function getMaterial(
  color: number,
  options: {
    wireframe?: boolean;
    xray?: boolean;
    roughness?: number;
    metalness?: number;
    opacity?: number;
    depthWrite?: boolean;
    emissive?: number;
    emissiveIntensity?: number;
    side?: THREE.Side;
  } = {}
) {
  const {
    wireframe = false,
    xray = false,
    roughness = 0.25,
    metalness = 0.35,
    opacity = 1.0,
    depthWrite = true,
    emissive = 0x000000,
    emissiveIntensity = 0.3,
    side = THREE.DoubleSide
  } = options;

  if (xray) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      wireframe,
      side
    });
  }

  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    wireframe,
    transparent: opacity < 1.0,
    opacity,
    depthWrite: opacity < 1.0 ? depthWrite : true,
    side,
    emissive,
    emissiveIntensity
  });
}

// Model Builder Router
function buildModel(
  renderType: string,
  group: THREE.Group,
  opts: { wireframe: boolean; xray: boolean; explodeFactor: number }
) {
  switch (renderType) {
    case 'dna':
      buildDNAModel(group, opts);
      break;
    case 'cell':
      buildCellModel(group, opts);
      break;
    case 'heart':
      buildHeartModel(group, opts);
      break;
    case 'eye':
      buildEyeModel(group, opts);
      break;
    case 'brain':
      buildBrainModel(group, opts);
      break;
    case 'platonic':
      buildPlatonicModel(group, opts);
      break;
    case 'torus':
      buildTorusModel(group, opts);
      break;
    case 'calculus_surface':
      buildCalculusSurfaceModel(group, opts);
      break;
    case 'tesseract':
      buildTesseractModel(group, opts);
      break;
    case 'klein':
      buildKleinBottleModel(group, opts);
      break;
    default:
      buildPlatonicModel(group, opts);
  }
}

// 1. Stylized DNA Double Helix (Luminescent ribbons with base pair molecular bridges)
function buildDNAModel(group: THREE.Group, opts: { wireframe: boolean; xray: boolean; explodeFactor: number }) {
  const steps = 38;
  const height = 3.8;
  const radius = 0.9 + opts.explodeFactor * 0.45;
  const turns = 2.6;

  const strand1Points: THREE.Vector3[] = [];
  const strand2Points: THREE.Vector3[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * Math.PI * 2 * turns;
    const y = (t - 0.5) * height;

    const x1 = Math.cos(angle) * radius;
    const z1 = Math.sin(angle) * radius;
    const x2 = Math.cos(angle + Math.PI) * radius;
    const z2 = Math.sin(angle + Math.PI) * radius;

    strand1Points.push(new THREE.Vector3(x1, y, z1));
    strand2Points.push(new THREE.Vector3(x2, y, z2));

    // Base pairs (Color-coded glowing rungs)
    if (i % 2 === 0 && i < steps) {
      const isAT = (i / 2) % 2 === 0;
      const col1 = isAT ? 0xf43f5e : 0x10b981; // Rose (Adenine) / Emerald (Guanine)
      const col2 = isAT ? 0x06b6d4 : 0xf59e0b; // Cyan (Thymine) / Amber (Cytosine)

      const midPoint = new THREE.Vector3((x1 + x2) / 2, y, (z1 + z2) / 2);

      // Half rung 1
      const geom1 = new THREE.CylinderGeometry(0.045, 0.045, radius, 12);
      const mat1 = getMaterial(col1, { ...opts, emissive: col1, emissiveIntensity: 0.45, roughness: 0.2 });
      const mesh1 = new THREE.Mesh(geom1, mat1);
      mesh1.position.set((x1 + midPoint.x) / 2, y, (z1 + midPoint.z) / 2);
      mesh1.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(x1 - midPoint.x, 0, z1 - midPoint.z).normalize()
      );
      group.add(mesh1);

      // Half rung 2
      const geom2 = new THREE.CylinderGeometry(0.045, 0.045, radius, 12);
      const mat2 = getMaterial(col2, { ...opts, emissive: col2, emissiveIntensity: 0.45, roughness: 0.2 });
      const mesh2 = new THREE.Mesh(geom2, mat2);
      mesh2.position.set((x2 + midPoint.x) / 2, y, (z2 + midPoint.z) / 2);
      mesh2.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(x2 - midPoint.x, 0, z2 - midPoint.z).normalize()
      );
      group.add(mesh2);

      // Glowing hydrogen bond center junction
      const centerNodeGeom = new THREE.SphereGeometry(0.075, 16, 16);
      const centerNodeMat = getMaterial(0xffffff, { ...opts, metalness: 0.9, emissive: 0xffffff, emissiveIntensity: 0.8 });
      const centerNode = new THREE.Mesh(centerNodeGeom, centerNodeMat);
      centerNode.position.copy(midPoint);
      group.add(centerNode);

      // Outer phosphate ball at strand junction
      const pBall1Geom = new THREE.SphereGeometry(0.08, 12, 12);
      const pBall1Mat = getMaterial(0xa855f7, { emissive: 0x9333ea, emissiveIntensity: 0.5 });
      const pBall1 = new THREE.Mesh(pBall1Geom, pBall1Mat);
      pBall1.position.set(x1, y, z1);
      group.add(pBall1);

      const pBall2 = new THREE.Mesh(pBall1Geom, pBall1Mat);
      pBall2.position.set(x2, y, z2);
      group.add(pBall2);
    }
  }

  // Sugar-phosphate backbone tubes with glowing iridescent tones
  const curve1 = new THREE.CatmullRomCurve3(strand1Points);
  const tubeGeom1 = new THREE.TubeGeometry(curve1, 100, 0.095, 16, false);
  const backboneMat1 = getMaterial(0x6366f1, { ...opts, metalness: 0.5, emissive: 0x4f46e5, emissiveIntensity: 0.35 });
  const tube1 = new THREE.Mesh(tubeGeom1, backboneMat1);
  tube1.userData.partInfo = {
    name: 'Leading Strand (5′ to 3′)',
    category: 'Sugar-Phosphate Backbone',
    function: 'Antiparallel deoxyribose phosphodiester polymer providing molecular structural scaffolding.',
    fact: 'Directionality is determined by 5′ phosphate and 3′ hydroxyl terminations.',
    pinId: 'double_helix'
  };
  group.add(tube1);

  const curve2 = new THREE.CatmullRomCurve3(strand2Points);
  const tubeGeom2 = new THREE.TubeGeometry(curve2, 100, 0.095, 16, false);
  const backboneMat2 = getMaterial(0xc084fc, { ...opts, metalness: 0.5, emissive: 0xa855f7, emissiveIntensity: 0.35 });
  const tube2 = new THREE.Mesh(tubeGeom2, backboneMat2);
  tube2.userData.partInfo = {
    name: 'Lagging Strand (3′ to 5′)',
    category: 'Sugar-Phosphate Backbone',
    function: 'Complementary antiparallel nucleotide polymer running in opposing chemical polarity.',
    fact: 'Synthesized discontinuously via Okazaki fragments during DNA replication.',
    pinId: 'double_helix'
  };
  group.add(tube2);
}

// 2. Stylized Eukaryotic Plant Cell (Crystalline cutaway bio-structure)
function buildCellModel(group: THREE.Group, opts: { wireframe: boolean; xray: boolean; explodeFactor: number }) {
  const explode = opts.explodeFactor * 0.85;

  // Crystalline Emerald Cell Wall (Hexagonal cutaway prism)
  const wallGeom = new THREE.CylinderGeometry(1.65, 1.65, 0.9, 8, 1, true);
  const wallMat = getMaterial(0x10b981, {
    ...opts,
    opacity: 0.35,
    depthWrite: false,
    roughness: 0.2,
    metalness: 0.4,
    emissive: 0x059669,
    emissiveIntensity: 0.25
  });
  const cellWall = new THREE.Mesh(wallGeom, wallMat);
  cellWall.userData.partInfo = {
    name: 'Cellulose Cell Wall',
    category: 'Extracellular Matrix',
    function: 'Provides structural rigidity, mechanical protection, and resists osmotic turgor pressure.',
    fact: 'Composed of β-1,4-glucan microfibrils embedded in pectin.'
  };
  group.add(cellWall);

  // Outer cell wall neon rim border
  const rimGeom = new THREE.TorusGeometry(1.65, 0.035, 12, 8);
  const rimMat = getMaterial(0x34d399, { emissive: 0x10b981, emissiveIntensity: 0.7 });
  const topRim = new THREE.Mesh(rimGeom, rimMat);
  topRim.rotation.x = Math.PI / 2;
  topRim.position.y = 0.45;
  group.add(topRim);

  const botRim = new THREE.Mesh(rimGeom, rimMat);
  botRim.rotation.x = Math.PI / 2;
  botRim.position.y = -0.45;
  group.add(botRim);

  // Cytoplasm Foundation Floor (Deep forest jade)
  const floorGeom = new THREE.CircleGeometry(1.63, 8);
  const floorMat = getMaterial(0x064e3b, { ...opts, opacity: 0.7, depthWrite: false, emissive: 0x022c22 });
  const floor = new THREE.Mesh(floorGeom, floorMat);
  floor.rotation.x = Math.PI / 2;
  floor.position.y = -0.44;
  group.add(floor);

  // Central Vacuole (Aquatic cyan reservoir with internal aqueous glow)
  const vacGeom = new THREE.SphereGeometry(0.72, 28, 28);
  const vacMat = getMaterial(0x0284c7, {
    ...opts,
    opacity: 0.7,
    roughness: 0.15,
    depthWrite: false,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.4
  });
  const vacuole = new THREE.Mesh(vacGeom, vacMat);
  vacuole.scale.set(1.25, 0.75, 1.05);
  vacuole.position.set(-0.35 - explode, -0.05, 0.25 + explode);
  vacuole.userData.partInfo = {
    name: 'Central Vacuole & Tonoplast',
    category: 'Hydrostatic Reservoir',
    function: 'Maintains cellular turgor pressure, stores osmotic fluids, hydrolytic enzymes, and metabolic solutes.',
    fact: 'Can occupy up to 80–90% of a mature plant cell’s total volume.',
    pinId: 'vacuole'
  };
  group.add(vacuole);

  // Nucleus (Deep Royal Purple double-membrane sphere)
  const nucGeom = new THREE.SphereGeometry(0.44, 24, 24);
  const nucMat = getMaterial(0x7e22ce, { ...opts, emissive: 0x9333ea, emissiveIntensity: 0.45 });
  const nucleus = new THREE.Mesh(nucGeom, nucMat);
  nucleus.position.set(0.65 + explode, 0.05, -0.45 - explode);
  nucleus.userData.partInfo = {
    name: 'Cell Nucleus & Chromatin',
    category: 'Genomic Repository',
    function: 'Encloses the plant genome and orchestrates gene transcription, replication, and cell cycle division.',
    fact: 'Double-membrane nuclear envelope perforated with nuclear pores.',
    pinId: 'nucleus'
  };
  group.add(nucleus);

  // Nucleolus (Electric Pulsing Magenta Core)
  const nucleolusGeom = new THREE.SphereGeometry(0.18, 16, 16);
  const nucleolusMat = getMaterial(0xf43f5e, { ...opts, emissive: 0xf43f5e, emissiveIntensity: 0.85 });
  const nucleolus = new THREE.Mesh(nucleolusGeom, nucleolusMat);
  nucleolus.position.set(0.65 + explode, 0.14, -0.4 - explode);
  nucleolus.name = 'nucleolus_pulsing';
  nucleolus.userData.partInfo = {
    name: 'Nucleolus',
    category: 'Subnuclear Organelle',
    function: 'Primary manufacturing site for ribosomal RNA (rRNA) transcription and ribosomal subunit biogenesis.',
    fact: 'Lacks a surrounding membrane; densest structure in the eukaryotic nucleus.'
  };
  group.add(nucleolus);

  // Chloroplasts with stacked coin-like thylakoid granum
  const chloroCoords = [
    [0.9 + explode, 0.15, 0.5 + explode],
    [-0.9 - explode, 0.15, -0.6 - explode],
    [0.1, 0.2 + explode, 1.05 + explode],
    [-0.9 - explode, -0.1, 0.7 + explode]
  ];

  chloroCoords.forEach((coord) => {
    const chloroGroup = new THREE.Group();
    chloroGroup.userData.partInfo = {
      name: 'Chloroplast (Thylakoids & Stroma)',
      category: 'Photosynthetic Organelle',
      function: 'Harvests solar photons to synthesize ATP and NADPH during the light-dependent reactions of photosynthesis.',
      fact: 'Contains stacked thylakoid grana and its own circular endosymbiotic cpDNA genome.',
      pinId: 'chloroplast'
    };
    // Capsule outer shell
    const capsuleGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.12, 16);
    const capsuleMat = getMaterial(0x10b981, { ...opts, roughness: 0.2, emissive: 0x059669, emissiveIntensity: 0.5 });
    const capsule = new THREE.Mesh(capsuleGeom, capsuleMat);
    chloroGroup.add(capsule);

    // Internal thylakoid stacks
    for (let k = -1; k <= 1; k++) {
      const ringGeom = new THREE.RingGeometry(0.08, 0.18, 12);
      const ringMat = getMaterial(0x4ade80, { emissive: 0x22c55e, emissiveIntensity: 0.8 });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = k * 0.035;
      chloroGroup.add(ring);
    }

    chloroGroup.position.set(coord[0], coord[1], coord[2]);
    chloroGroup.rotation.x = Math.PI / 3.5;
    group.add(chloroGroup);
  });

  // Mitochondria (Orange Powerhouses with glowing cristae folds)
  const mitoCoords = [
    [-0.8 - explode, 0.15, 0],
    [0.45 + explode, -0.15, 0.85 + explode]
  ];

  mitoCoords.forEach((pos) => {
    const mitoGeom = new THREE.CapsuleGeometry(0.14, 0.32, 8, 16);
    const mitoMat = getMaterial(0xf97316, { ...opts, emissive: 0xea580c, emissiveIntensity: 0.5 });
    const mito = new THREE.Mesh(mitoGeom, mitoMat);
    mito.position.set(pos[0], pos[1], pos[2]);
    mito.rotation.z = Math.PI / 3;
    mito.userData.partInfo = {
      name: 'Mitochondrion (ATP Synthase)',
      category: 'Bioenergetic Organelle',
      function: 'Generates cellular adenosine triphosphate (ATP) via the tricarboxylic acid cycle and oxidative phosphorylation.',
      fact: 'Features folded inner cristae membranes with electrochemical proton gradients.',
      pinId: 'mitochondria'
    };
    group.add(mito);
  });
}

// 3. Realistic & Anatomically Accurate Human Heart (Matching Image 2 Illustration)
function buildHeartModel(group: THREE.Group, opts: { wireframe: boolean; xray: boolean; explodeFactor: number }) {
  const explode = opts.explodeFactor * 0.85;

  // Heart Group for natural anatomical left-anterior tilt
  const heartBody = new THREE.Group();
  heartBody.rotation.z = -0.12;
  heartBody.rotation.y = 0.08;
  heartBody.name = 'pulsing_heart';
  group.add(heartBody);

  // --- 1. VENTRICULAR BODY (MYOCARDIUM & APEX) ---
  // Smooth, conical myocardium with warm salmon-pink anterior face and rich crimson lateral borders
  const ventriclesGroup = new THREE.Group();
  ventriclesGroup.position.set(-explode * 0.25, -explode * 0.35, 0);
  ventriclesGroup.userData.partInfo = {
    name: 'Left & Right Ventricles',
    category: 'Myocardium & Apex',
    function: 'Thick muscular pumping chambers generating systemic arterial pressure (~120 mmHg) and pulmonary circulation.',
    fact: 'Left ventricular wall is ~3x thicker than right; stroke volume is ~70 mL per beat.',
    pinId: 'left_ventricle'
  };

  // Main Ventricular Mass (Left & Right Ventricles joined seamlessly)
  const ventGeom = new THREE.SphereGeometry(1.05, 36, 32);
  ventGeom.scale(0.92, 1.35, 0.88);

  // Sculpt conical apex pointing down and left
  const vPos = ventGeom.attributes.position;
  for (let i = 0; i < vPos.count; i++) {
    const x = vPos.getX(i);
    const y = vPos.getY(i);
    const z = vPos.getZ(i);

    // Taper into an organic apex at the bottom (y < -0.2)
    if (y < 0.2) {
      const taper = Math.max(0.18, 1.0 + y * 0.65);
      // Slight curve towards left apex
      vPos.setXYZ(i, (x - (1.0 - taper) * 0.25) * taper, y, z * taper);
    }
  }
  ventGeom.computeVertexNormals();

  const ventMat = getMaterial(0xee5253, {
    ...opts,
    roughness: 0.38,
    metalness: 0.12,
    emissive: 0x991b1b,
    emissiveIntensity: 0.32
  });
  const ventricles = new THREE.Mesh(ventGeom, ventMat);
  ventricles.position.set(-0.06, -0.42, 0.05);
  ventriclesGroup.add(ventricles);

  // Fine longitudinal myocardial muscle fiber striations streaming down to apex
  const fiberMat = new THREE.LineBasicMaterial({
    color: 0x991b1b,
    transparent: true,
    opacity: 0.38,
    linewidth: 1
  });
  for (let f = 0; f < 22; f++) {
    const angle = (f / 22) * Math.PI * 1.6 - Math.PI * 0.8;
    const xTop = Math.sin(angle) * 0.75;
    const zTop = Math.cos(angle) * 0.42 + 0.15;
    const fiberPoints = [
      new THREE.Vector3(xTop, 0.2, zTop),
      new THREE.Vector3(xTop * 0.8, -0.4, zTop * 0.88),
      new THREE.Vector3(-0.25 + xTop * 0.2, -1.05, 0.12)
    ];
    const fiberGeom = new THREE.BufferGeometry().setFromPoints(fiberPoints);
    const fiber = new THREE.Line(fiberGeom, fiberMat);
    ventriclesGroup.add(fiber);
  }

  heartBody.add(ventriclesGroup);

  // --- 2. AURICLES (PLUM-PURPLE / DEEP BURGUNDY POUCHES WITH RAISED RIM - EXACT TO IMAGE 2) ---
  const auricleMat = getMaterial(0x78283a, {
    ...opts,
    roughness: 0.42,
    metalness: 0.18,
    emissive: 0x581c87,
    emissiveIntensity: 0.22
  });
  const rimMat = getMaterial(0x4c0519, {
    ...opts,
    roughness: 0.4,
    metalness: 0.2,
    emissive: 0x2e020d,
    emissiveIntensity: 0.25
  });

  // Right Auricle (Viewer's left shoulder of the heart)
  const rAuricleGroup = new THREE.Group();
  rAuricleGroup.position.set(-0.75 - explode * 0.4, 0.18 + explode * 0.2, 0.25);
  rAuricleGroup.rotation.set(0.1, 0.4, 0.35);
  rAuricleGroup.userData.partInfo = {
    name: 'Right Auricle (Plum Pouch)',
    category: 'Atrial Pouch',
    function: 'Plum-burgundy muscular reservoir expanding blood volume capacity of the Right Atrium.',
    fact: 'Lined with pectinate muscles; releases atrial natriuretic peptide (ANP).',
    pinId: 'auricles'
  };

  const rCupGeom = new THREE.SphereGeometry(0.48, 28, 24, 0, Math.PI);
  rCupGeom.scale(0.85, 1.25, 0.55);
  const rCup = new THREE.Mesh(rCupGeom, auricleMat);
  rAuricleGroup.add(rCup);

  const rRimGeom = new THREE.TorusGeometry(0.45, 0.055, 12, 32);
  rRimGeom.scale(0.85, 1.25, 1.0);
  const rRim = new THREE.Mesh(rRimGeom, rimMat);
  rRim.rotation.y = Math.PI / 2;
  rAuricleGroup.add(rRim);

  heartBody.add(rAuricleGroup);

  // Left Auricle (Viewer's right shoulder of the heart)
  const lAuricleGroup = new THREE.Group();
  lAuricleGroup.position.set(0.68 + explode * 0.4, 0.22 + explode * 0.2, 0.12);
  lAuricleGroup.rotation.set(0.1, -0.45, -0.32);
  lAuricleGroup.userData.partInfo = {
    name: 'Left Auricle (Plum Pouch)',
    category: 'Atrial Pouch',
    function: 'Plum-burgundy muscular pouch increasing left atrial volume for incoming pulmonary venous blood.',
    fact: 'Clinically important site prone to thrombus formation in atrial fibrillation.',
    pinId: 'auricles'
  };

  const lCupGeom = new THREE.SphereGeometry(0.45, 28, 24, 0, Math.PI);
  lCupGeom.scale(0.82, 1.2, 0.55);
  const lCup = new THREE.Mesh(lCupGeom, auricleMat);
  lAuricleGroup.add(lCup);

  const lRimGeom = new THREE.TorusGeometry(0.42, 0.052, 12, 32);
  lRimGeom.scale(0.82, 1.2, 1.0);
  const lRim = new THREE.Mesh(lRimGeom, rimMat);
  lRim.rotation.y = Math.PI / 2;
  lAuricleGroup.add(lRim);

  heartBody.add(lAuricleGroup);

  // --- 3. GREAT VESSELS (RED = OXYGENATED, BLUE = DEOXYGENATED) ---
  const redVesselMat = getMaterial(0xdc2626, {
    ...opts,
    roughness: 0.25,
    metalness: 0.25,
    emissive: 0xb91c1c,
    emissiveIntensity: 0.4
  });
  const blueVesselMat = getMaterial(0x0284c7, {
    ...opts,
    roughness: 0.25,
    metalness: 0.25,
    emissive: 0x0369a1,
    emissiveIntensity: 0.4
  });
  const darkLumenMat = new THREE.MeshBasicMaterial({ color: 0x1e293b, side: THREE.DoubleSide });

  // Superior Vena Cava (SVC - Bold vertical blue pipe on viewer's left)
  const svcGroup = new THREE.Group();
  svcGroup.position.set(-0.62 - explode * 0.35, 0.95 + explode * 0.35, -0.05);
  svcGroup.userData.partInfo = {
    name: 'Superior Vena Cava (SVC)',
    category: 'Great Systemic Vein',
    function: 'Transports deoxygenated systemic venous return from the upper body into the right atrium.',
    fact: 'Operates at low central venous pressure (~2-8 mmHg); forms from brachiocephalic veins.',
    pinId: 'superior_vena_cava'
  };

  const svcCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.4, 0),
    new THREE.Vector3(0.02, 0.3, 0.02),
    new THREE.Vector3(-0.04, 0.65, 0.03)
  ]);
  const svcGeom = new THREE.TubeGeometry(svcCurve, 24, 0.18, 18, false);
  const svc = new THREE.Mesh(svcGeom, blueVesselMat);
  svcGroup.add(svc);

  // SVC Open Top Lumen
  const svcLumen = new THREE.Mesh(new THREE.CircleGeometry(0.18, 18), darkLumenMat);
  svcLumen.rotation.x = -Math.PI / 2;
  svcLumen.position.set(-0.04, 0.65, 0.03);
  svcGroup.add(svcLumen);

  // Left Brachiocephalic Vein branch
  const lbvCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.02, 0.35, 0.02),
    new THREE.Vector3(0.18, 0.62, -0.05)
  ]);
  const lbv = new THREE.Mesh(new THREE.TubeGeometry(lbvCurve, 12, 0.13, 14, false), blueVesselMat);
  svcGroup.add(lbv);
  const lbvLumen = new THREE.Mesh(new THREE.CircleGeometry(0.13, 14), darkLumenMat);
  lbvLumen.rotation.x = -Math.PI / 2;
  lbvLumen.position.set(0.18, 0.62, -0.05);
  svcGroup.add(lbvLumen);

  heartBody.add(svcGroup);

  // Inferior Vena Cava (IVC - Emerging below right atrium/ventricle at bottom left)
  const ivcGroup = new THREE.Group();
  ivcGroup.position.set(-0.45 - explode * 0.25, -1.05 - explode * 0.4, -0.15);
  ivcGroup.userData.partInfo = {
    name: 'Inferior Vena Cava (IVC)',
    category: 'Great Systemic Vein',
    function: 'Carries deoxygenated venous return from the abdomen, pelvis, and lower limbs to right atrium.',
    fact: 'Largest vein in the human body; ascends retroperitoneally through diaphragm.',
    pinId: 'superior_vena_cava'
  };
  const ivcGeom = new THREE.CylinderGeometry(0.16, 0.17, 0.6, 16);
  const ivc = new THREE.Mesh(ivcGeom, blueVesselMat);
  ivcGroup.add(ivc);
  const ivcLumen = new THREE.Mesh(new THREE.CircleGeometry(0.16, 16), darkLumenMat);
  ivcLumen.rotation.x = Math.PI / 2;
  ivcLumen.position.y = -0.3;
  ivcGroup.add(ivcLumen);
  heartBody.add(ivcGroup);

  // Ascending Aorta & Anatomical Aortic Arch (Bright Crimson Red looping arch)
  const aortaGroup = new THREE.Group();
  aortaGroup.position.set(0, 0, 0);
  aortaGroup.userData.partInfo = {
    name: 'Ascending Aorta & Arch (3 Branches)',
    category: 'Great Systemic Artery',
    function: 'Distributes high-pressure systemic cardiac output (~5 L/min) to the body via 3 cranial branches.',
    fact: 'Branches into Brachiocephalic, Left Common Carotid, and Left Subclavian arteries.',
    pinId: 'aorta'
  };

  const aortaCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-0.12, 0.3, 0.05),
    new THREE.Vector3(-0.16, 1.48 + explode * 0.5, 0.12),
    new THREE.Vector3(0.48, 1.42 + explode * 0.5, -0.15),
    new THREE.Vector3(0.55, 0.4, -0.32)
  );
  const aortaGeom = new THREE.TubeGeometry(aortaCurve, 48, 0.24, 20, false);
  const aorta = new THREE.Mesh(aortaGeom, redVesselMat);
  aortaGroup.add(aorta);

  // Three Cranial Branches from Aortic Arch (Exact match to Image 2)
  const cranialBranches = [
    { pos: [-0.08, 1.42 + explode * 0.5, 0.1], angle: 0.18, r: 0.082, len: 0.45 }, // Brachiocephalic
    { pos: [0.12, 1.51 + explode * 0.5, -0.02], angle: 0.0, r: 0.072, len: 0.48 }, // Left Common Carotid
    { pos: [0.32, 1.44 + explode * 0.5, -0.14], angle: -0.18, r: 0.072, len: 0.44 } // Left Subclavian
  ];
  cranialBranches.forEach((cb) => {
    const branchGeom = new THREE.CylinderGeometry(cb.r, cb.r, cb.len, 16);
    const branch = new THREE.Mesh(branchGeom, redVesselMat);
    branch.position.set(cb.pos[0], cb.pos[1] + cb.len * 0.45, cb.pos[2]);
    branch.rotation.z = cb.angle;
    aortaGroup.add(branch);

    // Open lumen ring at top
    const bLumen = new THREE.Mesh(new THREE.CircleGeometry(cb.r, 14), darkLumenMat);
    bLumen.rotation.x = -Math.PI / 2;
    bLumen.position.set(cb.pos[0] + Math.sin(cb.angle) * cb.len * 0.9, cb.pos[1] + cb.len * 0.9, cb.pos[2]);
    aortaGroup.add(bLumen);
  });

  heartBody.add(aortaGroup);

  // Pulmonary Trunk & Bifurcation (Cyan-blue vessel emerging in front of aorta, bending right)
  const ptGroup = new THREE.Group();
  ptGroup.position.set(0, 0, 0);
  ptGroup.userData.partInfo = {
    name: 'Pulmonary Trunk & Arteries',
    category: 'Pulmonary Vasculature',
    function: 'Channels deoxygenated blood from the right ventricle into the left and right lungs.',
    fact: 'The only postnatal arteries in the human body carrying deoxygenated blood (SaO₂ ~75%).',
    pinId: 'pulmonary_artery'
  };

  const ptCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0.08, 0.25, 0.32),
    new THREE.Vector3(0.16, 0.88 + explode * 0.35, 0.28),
    new THREE.Vector3(0.55, 0.88 + explode * 0.35, 0.08)
  );
  const ptGeom = new THREE.TubeGeometry(ptCurve, 28, 0.22, 20, false);
  const pulmonaryTrunk = new THREE.Mesh(ptGeom, blueVesselMat);
  ptGroup.add(pulmonaryTrunk);

  // Left Pulmonary Artery (Horizontal conduit extending rightward with open circular lumen)
  const lpaCurve = new THREE.LineCurve3(
    new THREE.Vector3(0.55, 0.88 + explode * 0.35, 0.08),
    new THREE.Vector3(1.05 + explode * 0.4, 0.88 + explode * 0.35, 0.08)
  );
  const lpaGeom = new THREE.TubeGeometry(lpaCurve, 12, 0.16, 18, false);
  const lpa = new THREE.Mesh(lpaGeom, blueVesselMat);
  ptGroup.add(lpa);

  // Open Circular Lumen for Pulmonary Artery (Facing right, exactly as illustrated in Image 2!)
  const lpaLumen = new THREE.Mesh(new THREE.CircleGeometry(0.16, 18), darkLumenMat);
  lpaLumen.rotation.y = Math.PI / 2;
  lpaLumen.position.set(1.05 + explode * 0.4, 0.88 + explode * 0.35, 0.08);
  ptGroup.add(lpaLumen);

  // Right Pulmonary Artery (Heading backward behind aorta)
  const rpaCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0.25, 0.85 + explode * 0.35, 0.18),
    new THREE.Vector3(-0.35, 0.86 + explode * 0.35, -0.15),
    new THREE.Vector3(-0.75 - explode * 0.35, 0.82 + explode * 0.35, -0.22)
  );
  const rpa = new THREE.Mesh(new THREE.TubeGeometry(rpaCurve, 16, 0.15, 14, false), blueVesselMat);
  ptGroup.add(rpa);

  heartBody.add(ptGroup);

  // Pulmonary Veins (Red vessels entering on the right side behind left atrium/auricle)
  const pvGroup = new THREE.Group();
  pvGroup.userData.partInfo = {
    name: 'Pulmonary Veins',
    category: 'Pulmonary Vasculature',
    function: 'Channels freshly oxygenated blood from the lungs directly into the left atrium.',
    fact: 'The only postnatal veins in the human body transporting oxygen-rich blood.'
  };
  const pvGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.52, 14);
  const pv1 = new THREE.Mesh(pvGeom, redVesselMat);
  pv1.rotation.z = Math.PI / 2;
  pv1.position.set(0.85 + explode * 0.4, 0.52 + explode * 0.25, -0.2);
  pvGroup.add(pv1);

  const pv2 = new THREE.Mesh(pvGeom, redVesselMat);
  pv2.rotation.z = Math.PI / 2;
  pv2.position.set(0.88 + explode * 0.4, 0.32 + explode * 0.25, -0.22);
  pvGroup.add(pv2);

  const pvLumen1 = new THREE.Mesh(new THREE.CircleGeometry(0.1, 14), darkLumenMat);
  pvLumen1.rotation.y = Math.PI / 2;
  pvLumen1.position.set(1.11 + explode * 0.4, 0.52 + explode * 0.25, -0.2);
  pvGroup.add(pvLumen1);

  heartBody.add(pvGroup);

  // --- 4. CORONARY VASCULAR NETWORK (EXACT BRANCHING TREE FROM IMAGE 2!) ---
  // The iconic anterior branching vessels:
  // - Great Cardiac Vein (Blue) coursing down with 6+ dendritic tributaries
  // - Left Anterior Descending Artery (Red) intertwining with 6+ arterial twigs
  // - Right Ventricular branch cluster
  const coronaryGroup = new THREE.Group();
  coronaryGroup.userData.partInfo = {
    name: 'Branching Coronary Vessels (LAD & Veins)',
    category: 'Coronary Vasculature',
    function: 'Arborizing arterial and venous network delivering oxygenated blood directly into myocardium.',
    fact: 'The Left Anterior Descending (LAD) branch is known clinically as the widowmaker artery.',
    pinId: 'coronary_vessels'
  };

  const ladMat = getMaterial(0xef4444, { roughness: 0.25, emissive: 0xdc2626, emissiveIntensity: 0.65 });
  const gcvMat = getMaterial(0x0284c7, { roughness: 0.25, emissive: 0x0369a1, emissiveIntensity: 0.65 });

  // Main Blue Anterior Interventricular Vein (coursing down to apex)
  const mainBlueVeinPts = [
    new THREE.Vector3(0.22, 0.35, 0.68),
    new THREE.Vector3(0.18, 0.05, 0.76),
    new THREE.Vector3(0.12, -0.28, 0.72),
    new THREE.Vector3(0.04, -0.58, 0.58),
    new THREE.Vector3(-0.06, -0.88, 0.36),
    new THREE.Vector3(-0.16, -1.08, 0.18)
  ];
  const mainBlueCurve = new THREE.CatmullRomCurve3(mainBlueVeinPts);
  const mainBlueMesh = new THREE.Mesh(new THREE.TubeGeometry(mainBlueCurve, 36, 0.042, 10, false), gcvMat);
  coronaryGroup.add(mainBlueMesh);

  // Tributary Blue Veins branching over left and right ventricles
  const blueBranches = [
    // Upper-left branch (viewer's right)
    [new THREE.Vector3(0.18, 0.05, 0.76), new THREE.Vector3(0.38, -0.05, 0.68), new THREE.Vector3(0.55, -0.15, 0.52)],
    [new THREE.Vector3(0.38, -0.05, 0.68), new THREE.Vector3(0.48, 0.08, 0.58)],
    // Mid-left branch
    [new THREE.Vector3(0.12, -0.28, 0.72), new THREE.Vector3(0.32, -0.42, 0.62), new THREE.Vector3(0.48, -0.58, 0.45)],
    [new THREE.Vector3(0.32, -0.42, 0.62), new THREE.Vector3(0.42, -0.32, 0.52)],
    // Lower branch
    [new THREE.Vector3(0.04, -0.58, 0.58), new THREE.Vector3(0.22, -0.72, 0.46), new THREE.Vector3(0.32, -0.86, 0.32)],
    // Right ventricle branch (viewer's left side)
    [new THREE.Vector3(0.18, 0.05, 0.76), new THREE.Vector3(-0.05, -0.08, 0.75), new THREE.Vector3(-0.22, -0.22, 0.65)],
    [new THREE.Vector3(-0.05, -0.08, 0.75), new THREE.Vector3(-0.12, 0.05, 0.72)]
  ];
  blueBranches.forEach((bPts) => {
    const bCurve = new THREE.CatmullRomCurve3(bPts);
    const bMesh = new THREE.Mesh(new THREE.TubeGeometry(bCurve, 14, 0.024, 8, false), gcvMat);
    coronaryGroup.add(bMesh);
  });

  // Main Red LAD Coronary Artery (Intertwined along the sulcus)
  const mainRedArteryPts = [
    new THREE.Vector3(0.26, 0.38, 0.67),
    new THREE.Vector3(0.22, 0.08, 0.75),
    new THREE.Vector3(0.16, -0.25, 0.71),
    new THREE.Vector3(0.08, -0.55, 0.59),
    new THREE.Vector3(-0.02, -0.85, 0.38),
    new THREE.Vector3(-0.12, -1.05, 0.2)
  ];
  const mainRedCurve = new THREE.CatmullRomCurve3(mainRedArteryPts);
  const mainRedMesh = new THREE.Mesh(new THREE.TubeGeometry(mainRedCurve, 36, 0.038, 10, false), ladMat);
  coronaryGroup.add(mainRedMesh);

  // Delicate Red Arterial Branches radiating across myocardial surface
  const redBranches = [
    // Radiating over Left Ventricle (viewer's right)
    [new THREE.Vector3(0.22, 0.08, 0.75), new THREE.Vector3(0.42, 0.02, 0.65), new THREE.Vector3(0.6, -0.08, 0.48)],
    [new THREE.Vector3(0.42, 0.02, 0.65), new THREE.Vector3(0.52, 0.12, 0.55)],
    [new THREE.Vector3(0.16, -0.25, 0.71), new THREE.Vector3(0.36, -0.38, 0.58), new THREE.Vector3(0.52, -0.52, 0.42)],
    [new THREE.Vector3(0.36, -0.38, 0.58), new THREE.Vector3(0.45, -0.28, 0.5)],
    [new THREE.Vector3(0.08, -0.55, 0.59), new THREE.Vector3(0.26, -0.68, 0.44), new THREE.Vector3(0.38, -0.82, 0.3)],
    // Branching over Right Ventricle (viewer's left side)
    [new THREE.Vector3(0.22, 0.08, 0.75), new THREE.Vector3(0.02, -0.05, 0.74), new THREE.Vector3(-0.18, -0.18, 0.64)],
    [new THREE.Vector3(0.08, -0.55, 0.59), new THREE.Vector3(-0.12, -0.62, 0.52), new THREE.Vector3(-0.25, -0.72, 0.38)]
  ];
  redBranches.forEach((rPts) => {
    const rCurve = new THREE.CatmullRomCurve3(rPts);
    const rMesh = new THREE.Mesh(new THREE.TubeGeometry(rCurve, 14, 0.022, 8, false), ladMat);
    coronaryGroup.add(rMesh);
  });

  // Secondary vascular arborization on Right Ventricle (Viewer's left - match to Image 2!)
  const rvArteryPts = [
    new THREE.Vector3(-0.45, 0.05, 0.58),
    new THREE.Vector3(-0.52, -0.22, 0.52),
    new THREE.Vector3(-0.58, -0.48, 0.38)
  ];
  const rvArtery = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rvArteryPts), 14, 0.026, 8, false), ladMat);
  coronaryGroup.add(rvArtery);

  const rvVeinPts = [
    new THREE.Vector3(-0.42, 0.05, 0.58),
    new THREE.Vector3(-0.48, -0.25, 0.52),
    new THREE.Vector3(-0.52, -0.52, 0.36)
  ];
  const rvVein = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rvVeinPts), 14, 0.028, 8, false), gcvMat);
  coronaryGroup.add(rvVein);

  // Tiny branch twigs on right ventricle
  const rvTwig1 = [new THREE.Vector3(-0.52, -0.22, 0.52), new THREE.Vector3(-0.68, -0.28, 0.42)];
  coronaryGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rvTwig1), 8, 0.018, 6, false), ladMat));

  const rvTwig2 = [new THREE.Vector3(-0.48, -0.25, 0.52), new THREE.Vector3(-0.38, -0.38, 0.52)];
  coronaryGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rvTwig2), 8, 0.018, 6, false), gcvMat));

  heartBody.add(coronaryGroup);

  // --- 5. INTERNAL VALVES & CHORDAE TENDINEAE (Visible when exploded or x-ray) ---
  const internalGroup = new THREE.Group();
  internalGroup.position.set(0, 0, 0.05);
  internalGroup.userData.partInfo = {
    name: 'Atrioventricular Valves & Chordae',
    category: 'Valvular Apparatus',
    function: 'Tricuspid and Mitral valves anchored by chordae tendineae to prevent backflow during systole.',
    fact: 'Sudden closure produces the classic first heart sound (lub / S1).',
    pinId: 'valves_internal'
  };

  const pmGeom = new THREE.ConeGeometry(0.12, 0.38, 12);
  const pmMat = getMaterial(0x991b1b, { roughness: 0.5 });
  const pm1 = new THREE.Mesh(pmGeom, pmMat);
  pm1.position.set(-0.35, -0.55, 0.2);
  internalGroup.add(pm1);

  const pm2 = new THREE.Mesh(pmGeom, pmMat);
  pm2.position.set(0.35, -0.5, 0.25);
  internalGroup.add(pm2);

  const chordMat = new THREE.LineBasicMaterial({ color: 0xf8fafc, linewidth: 2 });
  const chordPoints1 = [
    new THREE.Vector3(-0.35, -0.36, 0.2), new THREE.Vector3(-0.42, 0.05, 0.15),
    new THREE.Vector3(-0.35, -0.36, 0.2), new THREE.Vector3(-0.3, 0.05, 0.22)
  ];
  internalGroup.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(chordPoints1), chordMat));

  const chordPoints2 = [
    new THREE.Vector3(0.35, -0.31, 0.25), new THREE.Vector3(0.42, 0.05, 0.2),
    new THREE.Vector3(0.35, -0.31, 0.25), new THREE.Vector3(0.28, 0.05, 0.28)
  ];
  internalGroup.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(chordPoints2), chordMat));

  const valveGeom = new THREE.RingGeometry(0.08, 0.22, 16);
  const valveMat = getMaterial(0xf8fafc, { opacity: 0.85, side: THREE.DoubleSide, roughness: 0.3 });
  const mitralValve = new THREE.Mesh(valveGeom, valveMat);
  mitralValve.rotation.x = Math.PI / 2;
  mitralValve.position.set(-0.35, 0.08, 0.15);
  internalGroup.add(mitralValve);

  const tricuspidValve = new THREE.Mesh(valveGeom, valveMat);
  tricuspidValve.rotation.x = Math.PI / 2;
  tricuspidValve.position.set(0.35, 0.08, 0.2);
  internalGroup.add(tricuspidValve);

  heartBody.add(internalGroup);
}

// 4. Realistic & Anatomically Accurate Human Eye & Optical Refraction
function buildEyeModel(group: THREE.Group, opts: { wireframe: boolean; xray: boolean; explodeFactor: number }) {
  const explode = opts.explodeFactor * 0.95;

  const eyeGroup = new THREE.Group();
  group.add(eyeGroup);

  // --- 1. SCLERA (Outer Fibrous Tunic) WITH 90° CUTAWAY ---
  // 3/4 Anatomical off-white eyeball globe showing interior anatomy
  const scleraGeom = new THREE.SphereGeometry(1.25, 36, 28, 0, Math.PI * 1.55);
  const scleraMat = getMaterial(0xf8fafc, { ...opts, roughness: 0.3, metalness: 0.1 });
  const sclera = new THREE.Mesh(scleraGeom, scleraMat);
  sclera.userData.partInfo = {
    name: 'Sclera & Episclera',
    category: 'Fibrous Outer Tunic',
    function: 'Tough fibrous outer globe protecting ocular contents and anchoring extraocular rectus muscles.',
    fact: 'Composed of dense collagen fibrils; maintains intraocular pressure (~15 mmHg).'
  };
  eyeGroup.add(sclera);

  // Episcleral Micro-Capillary Arterioles (Branching red vessels on scleral surface)
  const episcleralCurves = [
    [new THREE.Vector3(0.8, 0.4, 0.7), new THREE.Vector3(1.0, 0.2, 0.6), new THREE.Vector3(1.15, -0.1, 0.4)],
    [new THREE.Vector3(-0.8, 0.5, 0.6), new THREE.Vector3(-1.05, 0.3, 0.5), new THREE.Vector3(-1.18, 0.0, 0.3)]
  ];
  episcleralCurves.forEach((pts) => {
    const cCurve = new THREE.CatmullRomCurve3(pts);
    const cGeom = new THREE.TubeGeometry(cCurve, 16, 0.02, 6, false);
    const cMat = getMaterial(0xef4444, { roughness: 0.3, emissive: 0xb91c1c, emissiveIntensity: 0.5 });
    const vessel = new THREE.Mesh(cGeom, cMat);
    eyeGroup.add(vessel);
  });

  // --- 2. CHOROID (Vascular Pigment Layer) & RETINA (Sensory Tunic) ---
  // Choroid Layer (Dark brown pigmented inner lining absorbing scattered light)
  const choroidGeom = new THREE.SphereGeometry(1.21, 32, 24, 0, Math.PI * 1.54);
  const choroidMat = getMaterial(0x1e1b4b, { ...opts, roughness: 0.6, side: THREE.BackSide });
  const choroid = new THREE.Mesh(choroidGeom, choroidMat);
  eyeGroup.add(choroid);

  // Retina Sensory Layer (Warm amber-orange layer with photoreceptor rods and cones)
  const retinaGeom = new THREE.SphereGeometry(1.18, 32, 24, 0, Math.PI * 1.53);
  const retinaMat = getMaterial(0xea580c, {
    ...opts,
    roughness: 0.4,
    side: THREE.BackSide,
    emissive: 0xc2410c,
    emissiveIntensity: 0.25
  });
  const retina = new THREE.Mesh(retinaGeom, retinaMat);
  retina.userData.partInfo = {
    name: 'Retina Sensory Layer',
    category: 'Photoreceptor Tunic',
    function: 'Converts incident light photons into electrical impulses via 120M rods and 6M cones.',
    fact: 'Comprises 10 neurochemical layers projecting through the optic nerve to the visual cortex.',
    pinId: 'retina'
  };
  eyeGroup.add(retina);

  // Macula Lutea & Fovea Centralis (Golden focal point for sharpest central vision)
  const foveaGeom = new THREE.SphereGeometry(0.12, 16, 16);
  const foveaMat = getMaterial(0xfacc15, { emissive: 0xf59e0b, emissiveIntensity: 0.95 });
  const fovea = new THREE.Mesh(foveaGeom, foveaMat);
  fovea.position.set(0, 0, -1.18);
  fovea.userData.partInfo = {
    name: 'Fovea Centralis (Macula)',
    category: 'High-Acuity Center',
    function: 'Point of maximum visual resolution, packed exclusively with cone photoreceptors for sharp central vision.',
    fact: 'Responsible for 20/20 color vision; avascular foveal pit.',
    pinId: 'retina'
  };
  eyeGroup.add(fovea);

  // Optic Disc (Physiological Blind Spot where ganglion axons exit)
  const opticDiscGeom = new THREE.CircleGeometry(0.18, 20);
  const opticDiscMat = getMaterial(0xfed7aa, { side: THREE.DoubleSide });
  const opticDisc = new THREE.Mesh(opticDiscGeom, opticDiscMat);
  opticDisc.position.set(0.35, -0.15, -1.17);
  opticDisc.userData.partInfo = {
    name: 'Optic Disc (Blind Spot)',
    category: 'Optic Convergence',
    function: 'Exit portal where >1.2 million retinal ganglion cell axons converge into the optic nerve.',
    fact: 'Devoid of rods and cones, producing the physiological blind spot (scotoma).',
    pinId: 'optic_nerve'
  };
  eyeGroup.add(opticDisc);

  // Retinal Blood Vessels (Arterioles and venules radiating from optic disc across fundus)
  const retinalVesselArcs = [
    [new THREE.Vector3(0.35, -0.15, -1.17), new THREE.Vector3(0.2, 0.4, -1.12), new THREE.Vector3(-0.3, 0.6, -1.0)],
    [new THREE.Vector3(0.35, -0.15, -1.17), new THREE.Vector3(0.5, -0.4, -1.08), new THREE.Vector3(0.1, -0.7, -0.95)],
    [new THREE.Vector3(0.35, -0.15, -1.17), new THREE.Vector3(-0.1, -0.25, -1.15), new THREE.Vector3(-0.5, -0.3, -1.05)]
  ];
  retinalVesselArcs.forEach((pts, idx) => {
    const rCurve = new THREE.CatmullRomCurve3(pts);
    const rGeom = new THREE.TubeGeometry(rCurve, 16, 0.022, 6, false);
    const rMat = getMaterial(idx % 2 === 0 ? 0xef4444 : 0x2563eb, {
      emissive: idx % 2 === 0 ? 0xdc2626 : 0x1d4ed8,
      emissiveIntensity: 0.5
    });
    const rMesh = new THREE.Mesh(rGeom, rMat);
    eyeGroup.add(rMesh);
  });

  // --- 3. ANTERIOR SEGMENT (CORNEA, IRIS, PUPIL, CILIARY BODY & LENS) ---
  const anteriorGroup = new THREE.Group();
  anteriorGroup.position.set(0, 0, explode * 0.7);
  eyeGroup.add(anteriorGroup);

  // Cornea (Crystal clear, steeper anterior dome providing 2/3 of eye refractive power)
  const corneaGeom = new THREE.SphereGeometry(0.72, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2.3);
  const corneaMat = getMaterial(0x38bdf8, {
    ...opts,
    opacity: 0.45,
    roughness: 0.05,
    metalness: 0.1,
    depthWrite: false
  });
  const cornea = new THREE.Mesh(corneaGeom, corneaMat);
  cornea.rotation.x = Math.PI / 2;
  cornea.position.set(0, 0, 1.15);
  cornea.userData.partInfo = {
    name: 'Cornea',
    category: 'Refractive Media',
    function: 'Transparent anterior dome providing approximately 70% (~43 diopters) of total ocular optical power.',
    fact: 'Avascular transparent tissue (refractive index n ≈ 1.376) nourished by aqueous humor.',
    pinId: 'cornea'
  };
  anteriorGroup.add(cornea);

  // Limbal Ring (Junction between cornea and sclera)
  const limbusGeom = new THREE.TorusGeometry(0.68, 0.025, 12, 36);
  const limbusMat = getMaterial(0x64748b, { opacity: 0.7 });
  const limbus = new THREE.Mesh(limbusGeom, limbusMat);
  limbus.position.set(0, 0, 1.14);
  anteriorGroup.add(limbus);

  // Iris (Striated hazel/cyan pigmented ring with sphincter and dilator muscles)
  const irisGeom = new THREE.RingGeometry(0.22, 0.62, 36);
  const irisMat = getMaterial(0x0284c7, {
    ...opts,
    roughness: 0.35,
    emissive: 0x0369a1,
    emissiveIntensity: 0.45,
    side: THREE.DoubleSide
  });
  const iris = new THREE.Mesh(irisGeom, irisMat);
  iris.position.set(0, 0, 1.02);
  iris.userData.partInfo = {
    name: 'Iris & Pupil Aperture',
    category: 'Light Diaphragm',
    function: 'Pigmented muscular curtain adjusting pupil diameter (2–8 mm) to regulate retinal illuminance.',
    fact: 'Controlled by sympathetic dilator pupillae and parasympathetic sphincter pupillae.',
    pinId: 'iris_pupil'
  };
  anteriorGroup.add(iris);

  // Pupil (Central aperture controlling light flux into the eye)
  const pupilGeom = new THREE.CircleGeometry(0.22, 32);
  const pupilMat = getMaterial(0x020617, { roughness: 0.9 });
  const pupil = new THREE.Mesh(pupilGeom, pupilMat);
  pupil.position.set(0, 0, 1.03);
  pupil.userData.partInfo = {
    name: 'Pupillary Aperture',
    category: 'Light Aperture',
    function: 'Adjustable focal aperture regulating depth of field and preventing spherical aberration.',
    fact: 'Diameter constricts in bright light (miosis) and dilates in darkness (mydriasis).',
    pinId: 'iris_pupil'
  };
  anteriorGroup.add(pupil);

  // Ciliary Body & Suspensory Ligaments (Zonules of Zinn holding the crystalline lens)
  const ciliaryGeom = new THREE.TorusGeometry(0.58, 0.07, 16, 32);
  const ciliaryMat = getMaterial(0x7c2d12, { ...opts, roughness: 0.5 });
  const ciliaryBody = new THREE.Mesh(ciliaryGeom, ciliaryMat);
  ciliaryBody.position.set(0, 0, 0.75);
  ciliaryBody.userData.partInfo = {
    name: 'Ciliary Body & Zonules',
    category: 'Accommodative Apparatus',
    function: 'Smooth muscle ring that adjusts lens curvature and secretes aqueous humor.',
    fact: 'Ciliary muscle contraction releases zonular tension, allowing lens to round up for near vision.'
  };
  anteriorGroup.add(ciliaryBody);

  // Zonular Fibers (Delicate radial threads suspending the lens)
  const zonuleGeom = new THREE.BufferGeometry();
  const zonuleVerts: number[] = [];
  for (let i = 0; i < 28; i++) {
    const angle = (i / 28) * Math.PI * 2;
    const rInner = 0.46;
    const rOuter = 0.58;
    zonuleVerts.push(Math.cos(angle) * rInner, Math.sin(angle) * rInner, 0.75);
    zonuleVerts.push(Math.cos(angle) * rOuter, Math.sin(angle) * rOuter, 0.75);
  }
  zonuleGeom.setAttribute('position', new THREE.Float32BufferAttribute(zonuleVerts, 3));
  const zonules = new THREE.LineSegments(
    zonuleGeom,
    new THREE.LineBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.65 })
  );
  anteriorGroup.add(zonules);

  // Crystalline Biconvex Lens (Flexible optical refractive protein lens)
  const lensGeom = new THREE.SphereGeometry(0.46, 28, 28);
  const lensMat = getMaterial(0x67e8f9, {
    ...opts,
    opacity: 0.75,
    depthWrite: false,
    roughness: 0.08,
    metalness: 0.15,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.35
  });
  const lens = new THREE.Mesh(lensGeom, lensMat);
  lens.scale.set(1.0, 1.0, 0.38);
  lens.position.set(0, 0, 0.75);
  lens.userData.partInfo = {
    name: 'Crystalline Biconvex Lens',
    category: 'Dynamic Accommodation',
    function: 'Flexible biconvex protein lens fine-tuning focal distance from near to distant objects.',
    fact: 'Alters optical power from +15D to +30D via ciliary muscle contraction.',
    pinId: 'lens'
  };
  anteriorGroup.add(lens);

  // --- 4. EXTRAOCULAR RECTUS MUSCLE TENDONS ---
  // Demonstrates how the eye moves up/down/left/right in the eye socket
  const muscleConfigs = [
    { pos: [0, 1.25, 0], rot: [0, 0, 0], name: 'Superior Rectus' },
    { pos: [0, -1.25, 0], rot: [0, 0, 0], name: 'Inferior Rectus' },
    { pos: [1.25, 0, 0], rot: [0, 0, Math.PI / 2], name: 'Lateral Rectus' },
    { pos: [-1.25, 0, 0], rot: [0, 0, Math.PI / 2], name: 'Medial Rectus' }
  ];
  muscleConfigs.forEach((m) => {
    const mGroup = new THREE.Group();
    // Muscle belly (pinkish red)
    const mGeom = new THREE.BoxGeometry(0.35, 0.1, 0.9);
    const mMat = getMaterial(0xd97706, { roughness: 0.5, emissive: 0xb45309, emissiveIntensity: 0.25 });
    const mMesh = new THREE.Mesh(mGeom, mMat);
    mMesh.position.set(0, 0, -0.45);
    mGroup.add(mMesh);

    // Tendon insertion onto sclera (whitish tendon band)
    const tGeom = new THREE.BoxGeometry(0.32, 0.06, 0.35);
    const tMat = getMaterial(0xf1f5f9, { roughness: 0.3 });
    const tMesh = new THREE.Mesh(tGeom, tMat);
    tMesh.position.set(0, 0, 0.12);
    mGroup.add(tMesh);

    mGroup.position.set(m.pos[0], m.pos[1], m.pos[2]);
    mGroup.rotation.set(m.rot[0], m.rot[1], m.rot[2]);
    eyeGroup.add(mGroup);
  });

  // --- 5. OPTIC NERVE (CN II) & DURAL SHEATH ---
  const nerveGroup = new THREE.Group();
  nerveGroup.position.set(0.32, -0.15, -1.6 - explode * 0.6);
  nerveGroup.userData.partInfo = {
    name: 'Optic Nerve (CN II) & Sheath',
    category: 'Cranial Nerve',
    function: 'Transmits action potentials from 1.2M retinal ganglion cells through the optic canal to visual cortex.',
    fact: 'Surrounded by cerebrospinal fluid within meningeal sheath; houses central retinal artery and vein.',
    pinId: 'optic_nerve'
  };
  // Dural sheath (outer protective covering)
  const duralGeom = new THREE.CylinderGeometry(0.24, 0.28, 1.15, 20);
  const duralMat = getMaterial(0xfef08a, { ...opts, roughness: 0.5, emissive: 0xca8a04, emissiveIntensity: 0.3 });
  const dural = new THREE.Mesh(duralGeom, duralMat);
  dural.rotation.x = Math.PI / 2;
  nerveGroup.add(dural);

  // Central Retinal Artery (Red) & Vein (Blue) emerging at core
  const craGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.16, 10);
  const craMat = getMaterial(0xef4444, { emissive: 0xdc2626, emissiveIntensity: 0.6 });
  const cra = new THREE.Mesh(craGeom, craMat);
  cra.rotation.x = Math.PI / 2;
  cra.position.set(-0.04, 0, 0);
  nerveGroup.add(cra);

  const crvMat = getMaterial(0x2563eb, { emissive: 0x1d4ed8, emissiveIntensity: 0.6 });
  const crv = new THREE.Mesh(craGeom, crvMat);
  crv.rotation.x = Math.PI / 2;
  crv.position.set(0.04, 0, 0);
  nerveGroup.add(crv);

  eyeGroup.add(nerveGroup);

  // --- 6. OPTICAL LIGHT RAY REFRACTION BEAMS ---
  // Multiple incoming parallel rays bending through cornea and lens to focus onto fovea
  const rayGroup = new THREE.Group();
  rayGroup.name = 'optical_refraction_rays';

  const rayColors = [0x38bdf8, 0x06b6d4, 0x38bdf8];
  const rayOffsets = [-0.22, 0, 0.22];

  rayOffsets.forEach((off, i) => {
    // 1. Parallel ray before cornea
    const r1Points = [new THREE.Vector3(off, 0.1, 2.2), new THREE.Vector3(off, 0.1, 1.25)];
    const r1 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(r1Points),
      new THREE.LineBasicMaterial({ color: rayColors[i], transparent: true, opacity: 0.85, linewidth: 2 })
    );
    rayGroup.add(r1);

    // 2. Refracted through cornea to lens
    const r2Points = [new THREE.Vector3(off, 0.1, 1.25), new THREE.Vector3(off * 0.75, 0.08, 0.75)];
    const r2 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(r2Points),
      new THREE.LineBasicMaterial({ color: rayColors[i], transparent: true, opacity: 0.75, linewidth: 2 })
    );
    rayGroup.add(r2);

    // 3. Converging from lens to Fovea Centralis on retina
    const r3Points = [new THREE.Vector3(off * 0.75, 0.08, 0.75), new THREE.Vector3(0, 0, -1.18)];
    const r3 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(r3Points),
      new THREE.LineBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.9, linewidth: 2 })
    );
    rayGroup.add(r3);
  });

  eyeGroup.add(rayGroup);
}

// 5. Realistic & Anatomically Accurate Human Brain (Matching Image 1 Illustration)
function buildBrainModel(group: THREE.Group, opts: { wireframe: boolean; xray: boolean; explodeFactor: number }) {
  const explode = opts.explodeFactor * 0.85;

  const brainGroup = new THREE.Group();
  // Slight lateral tilt for clear view of cortical gyri, cerebellum, and brainstem
  brainGroup.rotation.y = -0.15;
  brainGroup.name = 'brain_group';
  group.add(brainGroup);

  // --- 1. CEREBRAL CORTEX (UNIFIED ROSY-PINK FLESH TONE WITH DEEP SULCI SHADING - EXACT TO IMAGE 1) ---
  const cortexMat = getMaterial(0xfca5a5, {
    ...opts,
    roughness: 0.42,
    metalness: 0.08,
    emissive: 0xbe123c,
    emissiveIntensity: 0.22
  });

  // Sulcus Groove Dark Shading Material
  const sulcusDarkMat = new THREE.LineBasicMaterial({
    color: 0x9f1239,
    transparent: true,
    opacity: 0.72,
    linewidth: 2
  });

  // Helper to generate organically perturbed cortical lobe geometries
  const createCorticalLobe = (
    size: [number, number, number],
    pos: [number, number, number],
    rot: [number, number, number] = [0, 0, 0],
    wrinkleScale: number = 7.5
  ) => {
    const lobeGeom = new THREE.SphereGeometry(size[0], 36, 32);
    lobeGeom.scale(1.0, size[1] / size[0], size[2] / size[0]);

    // Intricate procedural gyri & sulci convolutions
    const posAttr = lobeGeom.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);

      // Primary winding gyri waves + secondary fine sulcus indentations
      const primaryWinding = Math.sin(vx * wrinkleScale) * Math.cos(vy * wrinkleScale) * Math.sin(vz * wrinkleScale);
      const secondaryWinding = Math.cos(vx * 14.0 + vy * 12.0) * 0.018;
      const displacement = primaryWinding * 0.048 + secondaryWinding;

      posAttr.setXYZ(i, vx + displacement, vy + displacement, vz + displacement);
    }
    lobeGeom.computeVertexNormals();

    const lobeMesh = new THREE.Mesh(lobeGeom, cortexMat);
    lobeMesh.position.set(pos[0], pos[1], pos[2]);
    lobeMesh.rotation.set(rot[0], rot[1], rot[2]);
    return lobeMesh;
  };

  // Bilateral Hemispheres separated by Longitudinal Cerebral Fissure
  const sides = [-1, 1]; // Left (-1) and Right (1)

  sides.forEach((side) => {
    const hemiGroup = new THREE.Group();
    const sOffset = side * (0.05 + explode * 0.4);

    // 1. Frontal Lobe & Prefrontal Cortex (Anterior-Superior curved dome)
    const frontal = createCorticalLobe(
      [0.64, 0.72, 0.8],
      [sOffset + side * 0.38, 0.38 + explode * 0.3, 0.48 + explode * 0.4],
      [0.05, 0, side * 0.04],
      8.0
    );
    frontal.userData.partInfo = {
      name: 'Frontal Lobe & Prefrontal Cortex',
      category: 'Cerebral Cortex',
      function: 'Seat of executive decision-making, deductive reasoning, planning, and emotional regulation.',
      fact: 'Accounts for ~35% of the human cerebral mantle; matures through age 25.',
      pinId: 'frontal_lobe'
    };
    hemiGroup.add(frontal);

    // 2. Parietal Lobe & Sensory Cortex (Superior-Posterior crown)
    const parietal = createCorticalLobe(
      [0.62, 0.68, 0.7],
      [sOffset + side * 0.38, 0.48 + explode * 0.3, -0.22],
      [-0.05, 0, side * 0.03],
      7.8
    );
    parietal.userData.partInfo = {
      name: 'Parietal Lobe & Sensory Integration',
      category: 'Cerebral Cortex',
      function: 'Integrates multimodal sensory signals, spatial 3D mapping, and attention coordinates.',
      fact: 'Contains the primary somatosensory cortex and angular gyrus.',
      pinId: 'parietal_lobe'
    };
    hemiGroup.add(parietal);

    // 3. Occipital Lobe (Posterior Pole - Primary Visual Area)
    const occipital = createCorticalLobe(
      [0.54, 0.58, 0.6],
      [sOffset + side * 0.35, 0.16, -0.88 - explode * 0.4],
      [-0.1, 0, 0],
      8.2
    );
    occipital.userData.partInfo = {
      name: 'Occipital Lobe (Visual Area V1)',
      category: 'Primary Visual Area',
      function: 'Decodes raw retinal visual information: line orientations, spatial frequencies, and movement vectors.',
      fact: 'Brodmann Area 17; foveal central vision receives extensive cortical magnification.',
      pinId: 'occipital_lobe'
    };
    hemiGroup.add(occipital);

    // 4. Temporal Lobe (Elongated thumb-shaped pouch curving anteriorly beneath Sylvian fissure)
    const temporal = createCorticalLobe(
      [0.5, 0.46, 0.78],
      [sOffset + side * 0.68 + side * explode * 0.4, -0.16 - explode * 0.2, 0.1],
      [0.08, side * 0.05, -side * 0.08],
      8.5
    );
    temporal.userData.partInfo = {
      name: 'Temporal Lobe & Auditory Cortex',
      category: 'Cerebral Cortex',
      function: 'Processes auditory sound frequencies, lexical memory, and emotional meaning.',
      fact: 'Houses the hippocampus for long-term memory encoding and amygdala.',
      pinId: 'temporal_lobe'
    };
    hemiGroup.add(temporal);

    // --- SCULPTED ANATOMICAL GYRI RIDGES (MATCHING IMAGE 1'S PROMINENT FOLDS) ---
    // A. Motor Cortex Gyrus (Precentral Gyrus - Frontal side of Central Sulcus)
    const motorGyrusCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sOffset + side * 0.15, 0.92 + explode * 0.3, 0.06),
      new THREE.Vector3(sOffset + side * 0.48, 0.78 + explode * 0.3, 0.08),
      new THREE.Vector3(sOffset + side * 0.74, 0.42 + explode * 0.3, 0.12),
      new THREE.Vector3(sOffset + side * 0.68, 0.08 + explode * 0.2, 0.15)
    ]);
    const motorGyrus = new THREE.Mesh(
      new THREE.TubeGeometry(motorGyrusCurve, 32, 0.065, 12, false),
      cortexMat
    );
    motorGyrus.userData.partInfo = {
      name: 'Motor Cortex (Precentral Gyrus)',
      category: 'Somatic Motor Strip',
      function: 'Initiates and controls conscious voluntary skeletal muscle contractions via Betz pyramidal neurons.',
      fact: 'Features the motor homunculus with disproportionate representation for hands and speech lips.',
      pinId: 'motor_cortex'
    };
    hemiGroup.add(motorGyrus);

    // B. Sensory Cortex Gyrus (Postcentral Gyrus - Parietal side of Central Sulcus)
    const sensoryGyrusCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sOffset + side * 0.15, 0.9 + explode * 0.3, -0.06),
      new THREE.Vector3(sOffset + side * 0.48, 0.76 + explode * 0.3, -0.05),
      new THREE.Vector3(sOffset + side * 0.74, 0.4 + explode * 0.3, -0.02),
      new THREE.Vector3(sOffset + side * 0.68, 0.06 + explode * 0.2, 0.02)
    ]);
    const sensoryGyrus = new THREE.Mesh(
      new THREE.TubeGeometry(sensoryGyrusCurve, 32, 0.062, 12, false),
      cortexMat
    );
    sensoryGyrus.userData.partInfo = {
      name: 'Sensory Cortex (Postcentral Gyrus)',
      category: 'Somatosensory Strip',
      function: 'Decodes conscious bodily somatic sensations: touch, pressure, pain, temperature, and proprioception.',
      fact: 'Inputs relayed via the thalamic VPL nucleus mapped along the sensory homunculus.',
      pinId: 'sensory_cortex'
    };
    hemiGroup.add(sensoryGyrus);

    // C. Superior & Middle Temporal Gyri (Parallel horizontal folds along temporal lobe)
    const stgCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sOffset + side * 0.68, 0.02 - explode * 0.2, 0.52),
      new THREE.Vector3(sOffset + side * 0.78, -0.08 - explode * 0.2, 0.15),
      new THREE.Vector3(sOffset + side * 0.72, -0.06 - explode * 0.2, -0.28)
    ]);
    const stg = new THREE.Mesh(new THREE.TubeGeometry(stgCurve, 24, 0.058, 10, false), cortexMat);
    stg.userData.partInfo = {
      name: 'Superior Temporal Gyrus',
      category: 'Auditory Processing',
      function: 'Houses primary auditory cortex (Heschl’s gyrus) for sound frequency analysis.',
      fact: 'Essential for phonological processing of spoken language.',
      pinId: 'temporal_lobe'
    };
    hemiGroup.add(stg);

    // D. Broca's Area Bulge (Inferior Frontal Gyrus - Motor Speech Area)
    const brocaGeom = new THREE.SphereGeometry(0.18, 16, 16);
    brocaGeom.scale(1.2, 0.9, 0.8);
    const broca = new THREE.Mesh(brocaGeom, cortexMat);
    broca.position.set(sOffset + side * 0.65, 0.15 + explode * 0.2, 0.55);
    broca.userData.partInfo = {
      name: "Broca's Area (Motor Speech)",
      category: 'Speech Motor Area',
      function: 'Coordinates the kinetic vocal movements required for expressive articulated speech.',
      fact: 'Located in inferior frontal gyrus (Brodmann 44/45); damage produces non-fluent expressive aphasia.',
      pinId: 'broca_area'
    };
    hemiGroup.add(broca);

    // E. Wernicke's Area Bulge (Posterior Superior Temporal / Supramarginal - Speech Comprehension)
    const wernickeGeom = new THREE.SphereGeometry(0.19, 16, 16);
    wernickeGeom.scale(1.0, 1.1, 0.9);
    const wernicke = new THREE.Mesh(wernickeGeom, cortexMat);
    wernicke.position.set(sOffset + side * 0.72, 0.12, -0.22);
    wernicke.userData.partInfo = {
      name: "Wernicke's Area (Speech Comprehension)",
      category: 'Semantic Speech Area',
      function: 'Decodes linguistic syntax and semantic understanding of spoken and written words.',
      fact: 'Damage results in fluent but nonsensical speech (receptive aphasia).',
      pinId: 'wernicke_area'
    };
    hemiGroup.add(wernicke);

    // --- FISSURES & SULCI DEMARCATIONS (DARK GROOVE LINES EXACT TO IMAGE 1) ---
    // 1. Central Sulcus (Deep groove separating Motor from Sensory Cortex)
    const centralSulcusPoints = [
      new THREE.Vector3(sOffset + side * 0.15, 0.91 + explode * 0.3, 0.0),
      new THREE.Vector3(sOffset + side * 0.48, 0.77 + explode * 0.3, 0.015),
      new THREE.Vector3(sOffset + side * 0.74, 0.41 + explode * 0.3, 0.05),
      new THREE.Vector3(sOffset + side * 0.68, 0.07 + explode * 0.2, 0.08)
    ];
    const csLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(centralSulcusPoints),
      sulcusDarkMat
    );
    csLine.userData.partInfo = {
      name: 'Central Sulcus (Rolandic Fissure)',
      category: 'Cortical Boundary',
      function: 'Deep anatomical canyon demarcating the frontal motor strip from parietal sensory cortex.',
      fact: 'One of the earliest sulci to fold during human fetal neurodevelopment.',
      pinId: 'central_sulcus'
    };
    hemiGroup.add(csLine);

    // 2. Lateral Sulcus (Sylvian Fissure - Horizontal canyon dividing temporal lobe)
    const sylvianPoints = [
      new THREE.Vector3(sOffset + side * 0.55, -0.05, 0.62),
      new THREE.Vector3(sOffset + side * 0.76, 0.06, 0.25),
      new THREE.Vector3(sOffset + side * 0.72, 0.12, -0.15),
      new THREE.Vector3(sOffset + side * 0.58, 0.18, -0.45)
    ];
    const sylvianLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(sylvianPoints),
      sulcusDarkMat
    );
    sylvianLine.userData.partInfo = {
      name: 'Lateral Sulcus (Sylvian Fissure)',
      category: 'Cortical Boundary',
      function: 'Deep horizontal canyon dividing temporal lobe from frontal and parietal lobes.',
      fact: 'Shelters the insular cortex hidden deep within the fold.'
    };
    hemiGroup.add(sylvianLine);

    brainGroup.add(hemiGroup);
  });

  // --- 2. DEEP COMMISSURAL STRUCTURES (CORPUS CALLOSUM) ---
  const ccCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0.1, 0.5),
    new THREE.Vector3(0, 0.55, 0.3),
    new THREE.Vector3(0, 0.55, -0.3),
    new THREE.Vector3(0, 0.15, -0.45)
  );
  const ccGeom = new THREE.TubeGeometry(ccCurve, 24, 0.1, 16, false);
  const ccMat = getMaterial(0xfdf2e9, { ...opts, roughness: 0.35, emissive: 0xf5ebe0, emissiveIntensity: 0.35 });
  const corpusCallosum = new THREE.Mesh(ccGeom, ccMat);
  corpusCallosum.userData.partInfo = {
    name: 'Corpus Callosum (White Matter Bridge)',
    category: 'Commissural Tract',
    function: 'Broad C-shaped bundle of >200 million myelinated axonal fibers connecting both cerebral hemispheres.',
    fact: 'Enables interhemispheric communication and unified bilateral consciousness.'
  };
  brainGroup.add(corpusCallosum);

  // --- 3. CEREBELLUM ("COORDINATION" WITH FINE HORIZONTAL FOLIA STRIAE - EXACT TO IMAGE 1) ---
  const cerebGroup = new THREE.Group();
  cerebGroup.position.set(0, -0.62 - explode * 0.4, -0.7 - explode * 0.3);
  cerebGroup.userData.partInfo = {
    name: 'Cerebellum (Coordination & Balance)',
    category: 'Hindbrain / Subcortical',
    function: 'Calculates predictive error models to calibrate balance, posture, and smooth motor timing.',
    fact: 'Contains over 50% of the entire brain’s neurons packed into 10% of total brain volume.',
    pinId: 'cerebellum'
  };

  // Warm Peach-Salmon / Terracotta tone matching Image 1's cerebellum
  const cerebMat = getMaterial(0xdd7d68, {
    ...opts,
    roughness: 0.55,
    metalness: 0.08,
    emissive: 0x9c3d28,
    emissiveIntensity: 0.28
  });

  const foliaMat = new THREE.LineBasicMaterial({
    color: 0x8a2f1b,
    transparent: true,
    opacity: 0.75,
    linewidth: 1
  });

  const cHemis = [-0.42, 0.42];
  cHemis.forEach((cx) => {
    const cHemiGeom = new THREE.SphereGeometry(0.5, 32, 24);
    cHemiGeom.scale(1.22, 0.76, 0.96);
    const cHemi = new THREE.Mesh(cHemiGeom, cerebMat);
    cHemi.position.set(cx, 0, 0);
    cerebGroup.add(cHemi);

    // Fine, tightly spaced horizontal cerebellar folia striations (12 parallel ridges)
    for (let f = -5; f <= 5; f++) {
      const yRel = f * 0.052;
      const rAtY = Math.sqrt(Math.max(0.01, 1 - Math.pow(yRel / 0.38, 2))) * 0.48;
      const foliaPoints: THREE.Vector3[] = [];
      for (let a = 0; a <= 28; a++) {
        const rad = (a / 28) * Math.PI * 1.8 - Math.PI * 0.9;
        foliaPoints.push(
          new THREE.Vector3(
            cx + Math.cos(rad) * rAtY * 1.22,
            yRel,
            Math.sin(rad) * rAtY * 0.96
          )
        );
      }
      const foliaLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(foliaPoints),
        foliaMat
      );
      cerebGroup.add(foliaLine);
    }
  });

  // Central Cerebellar Vermis
  const vermisGeom = new THREE.SphereGeometry(0.34, 20, 20);
  vermisGeom.scale(0.78, 0.92, 0.96);
  const vermis = new THREE.Mesh(vermisGeom, cerebMat);
  cerebGroup.add(vermis);

  brainGroup.add(cerebGroup);

  // --- 4. BRAINSTEM (IVORY-CREAM STALK WITH BULBOUS PONS & TAPERING MEDULLA - EXACT TO IMAGE 1) ---
  const stemGroup = new THREE.Group();
  stemGroup.position.set(0, -0.62 - explode * 0.3, -0.05);
  stemGroup.userData.partInfo = {
    name: 'Brainstem (Midbrain, Pons & Medulla)',
    category: 'Autonomic Core',
    function: 'Controls essential autonomic reflexes: respiration pacing, vasomotor tone, and wakefulness.',
    fact: 'Origin of 10 of the 12 pairs of cranial nerves and reticular activating system.',
    pinId: 'brainstem'
  };

  const stemMat = getMaterial(0xfdf2e9, {
    ...opts,
    roughness: 0.38,
    metalness: 0.05,
    emissive: 0xf5ebe0,
    emissiveIntensity: 0.35
  });

  // Midbrain with cerebral peduncles
  const midGeom = new THREE.CylinderGeometry(0.24, 0.26, 0.36, 20);
  const midbrain = new THREE.Mesh(midGeom, stemMat);
  midbrain.position.set(0, 0.38, 0.02);
  stemGroup.add(midbrain);

  // Pons (Distinct bulbous anterior rounded bridge - respiratory pacemaker)
  const ponsGeom = new THREE.SphereGeometry(0.35, 24, 24);
  ponsGeom.scale(1.15, 0.88, 1.28);
  const pons = new THREE.Mesh(ponsGeom, stemMat);
  pons.position.set(0, 0.06, 0.14);
  stemGroup.add(pons);

  // Medulla Oblongata (Conical stalk tapering down into upper spinal cord)
  const medGeom = new THREE.CylinderGeometry(0.22, 0.14, 0.72, 20);
  const medulla = new THREE.Mesh(medGeom, stemMat);
  medulla.position.set(0, -0.44, -0.02);
  medulla.rotation.x = 0.08;
  stemGroup.add(medulla);

  // Ventral landmarks: Optic Chiasm (X-crossing of CN II)
  const ocCurve1 = new THREE.LineCurve3(new THREE.Vector3(-0.24, 0.42, 0.5), new THREE.Vector3(0.24, 0.36, 0.25));
  const ocCurve2 = new THREE.LineCurve3(new THREE.Vector3(0.24, 0.42, 0.5), new THREE.Vector3(-0.24, 0.36, 0.25));
  const ocGeom1 = new THREE.TubeGeometry(ocCurve1, 10, 0.035, 8, false);
  const ocGeom2 = new THREE.TubeGeometry(ocCurve2, 10, 0.035, 8, false);
  const ocMat = getMaterial(0xf8fafc, { emissive: 0xe2e8f0, emissiveIntensity: 0.6 });
  stemGroup.add(new THREE.Mesh(ocGeom1, ocMat));
  stemGroup.add(new THREE.Mesh(ocGeom2, ocMat));

  brainGroup.add(stemGroup);

  // --- 5. SYNAPTIC NEURAL ACTION POTENTIAL ARCS (Cognitive inter-lobe transmission) ---
  const neuralArcs = [
    // Frontal motor to Temporal auditory
    [new THREE.Vector3(-0.35, 0.55, 0.4), new THREE.Vector3(-0.75, 0.2, 0.3), new THREE.Vector3(-0.7, -0.15, 0.1)],
    [new THREE.Vector3(0.35, 0.55, 0.4), new THREE.Vector3(0.75, 0.2, 0.3), new THREE.Vector3(0.7, -0.15, 0.1)],
    // Occipital visual to Parietal sensory
    [new THREE.Vector3(0, 0.2, -0.85), new THREE.Vector3(-0.3, 0.5, -0.5), new THREE.Vector3(-0.35, 0.6, -0.2)],
    [new THREE.Vector3(0, 0.2, -0.85), new THREE.Vector3(0.3, 0.5, -0.5), new THREE.Vector3(0.35, 0.6, -0.2)],
    // Frontal to contralateral Frontal across Corpus Callosum
    [new THREE.Vector3(-0.35, 0.45, 0.5), new THREE.Vector3(0, 0.55, 0.3), new THREE.Vector3(0.35, 0.45, 0.5)]
  ];

  neuralArcs.forEach((pts) => {
    const curve = new THREE.CatmullRomCurve3(pts);
    const arcGeom = new THREE.TubeGeometry(curve, 28, 0.024, 8, false);
    const arcMat = getMaterial(0x38bdf8, { emissive: 0x06b6d4, emissiveIntensity: 0.95 });
    const arcMesh = new THREE.Mesh(arcGeom, arcMat);
    brainGroup.add(arcMesh);
  });
}

// 6. Stylized Platonic Solids (Crystalline Gemstones with Nested Dual Cores)
function buildPlatonicModel(group: THREE.Group, opts: { wireframe: boolean; xray: boolean; explodeFactor: number }) {
  const explode = opts.explodeFactor * 1.05;

  // 1. Regular Tetrahedron (Cyan Gemstone with outer edge cage)
  const tetraGroup = new THREE.Group();
  const tetraGeom = new THREE.TetrahedronGeometry(0.75);
  const tetraMat = getMaterial(0x06b6d4, { ...opts, metalness: 0.6, roughness: 0.2, emissive: 0x0891b2, emissiveIntensity: 0.4 });
  const tetra = new THREE.Mesh(tetraGeom, tetraMat);
  tetraGroup.add(tetra);

  const tetraEdges = new THREE.EdgesGeometry(tetraGeom);
  const tetraLine = new THREE.LineSegments(tetraEdges, new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 }));
  tetraGroup.add(tetraLine);
  tetraGroup.position.set(-1.45 - explode, 0.5, 0);
  tetraGroup.name = 'tetra_rot';
  group.add(tetraGroup);

  // 2. Regular Octahedron (Indigo Crystal with glowing golden center)
  const octaGroup = new THREE.Group();
  const octaGeom = new THREE.OctahedronGeometry(0.85);
  const octaMat = getMaterial(0x6366f1, { ...opts, metalness: 0.6, roughness: 0.2, emissive: 0x4f46e5, emissiveIntensity: 0.4 });
  const octa = new THREE.Mesh(octaGeom, octaMat);
  octaGroup.add(octa);

  const octaEdges = new THREE.EdgesGeometry(octaGeom);
  const octaLine = new THREE.LineSegments(octaEdges, new THREE.LineBasicMaterial({ color: 0x818cf8, linewidth: 2 }));
  octaGroup.add(octaLine);

  // Inscribed golden core
  const coreGeom = new THREE.SphereGeometry(0.2, 16, 16);
  const coreMat = getMaterial(0xfacc15, { emissive: 0xf59e0b, emissiveIntensity: 1.0 });
  const core = new THREE.Mesh(coreGeom, coreMat);
  octaGroup.add(core);

  octaGroup.position.set(0, 0, 0);
  octaGroup.name = 'octa_rot';
  group.add(octaGroup);

  // 3. Regular Icosahedron (Magenta/Rose 20-sided jewel with golden edges)
  const icoGroup = new THREE.Group();
  const icoGeom = new THREE.IcosahedronGeometry(0.85);
  const icoMat = getMaterial(0xec4899, { ...opts, metalness: 0.7, roughness: 0.15, emissive: 0xdb2777, emissiveIntensity: 0.45 });
  const ico = new THREE.Mesh(icoGeom, icoMat);
  icoGroup.add(ico);

  const icoEdges = new THREE.EdgesGeometry(icoGeom);
  const icoLine = new THREE.LineSegments(icoEdges, new THREE.LineBasicMaterial({ color: 0xf472b6, linewidth: 2 }));
  icoGroup.add(icoLine);
  icoGroup.position.set(1.45 + explode, -0.4, 0);
  icoGroup.name = 'ico_rot';
  group.add(icoGroup);
}

// 7. Stylized Torus & Villarceau Circles (Glowing topological streamline geometry)
function buildTorusModel(group: THREE.Group, opts: { wireframe: boolean; xray: boolean; explodeFactor: number }) {
  const torusGeom = new THREE.TorusGeometry(1.25, 0.48 + opts.explodeFactor * 0.2, 28, 72);
  const torusMat = getMaterial(0x06b6d4, {
    ...opts,
    metalness: 0.4,
    roughness: 0.2,
    emissive: 0x0891b2,
    emissiveIntensity: 0.35
  });
  const torus = new THREE.Mesh(torusGeom, torusMat);
  group.add(torus);

  // Glowing wireframe streamline shell
  const torusWireMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  });
  const torusWire = new THREE.Mesh(torusGeom, torusWireMat);
  group.add(torusWire);

  // Villarceau Circles (Golden Bitangent Circles with orbiting photon beacons)
  const ringGeom = new THREE.TorusGeometry(1.25, 0.035, 16, 64);
  const ringMat = getMaterial(0xfacc15, { metalness: 0.9, roughness: 0.1, emissive: 0xf59e0b, emissiveIntensity: 0.8 });

  const ring1 = new THREE.Mesh(ringGeom, ringMat);
  ring1.rotation.x = Math.PI / 3.8;
  group.add(ring1);

  const ring2 = new THREE.Mesh(ringGeom, ringMat);
  ring2.rotation.x = -Math.PI / 3.8;
  group.add(ring2);

  // Orbiting photon markers along Villarceau rings
  const photonGeom = new THREE.SphereGeometry(0.065, 12, 12);
  const photonMat = getMaterial(0xffffff, { emissive: 0xffffff, emissiveIntensity: 1.0 });

  const photon1 = new THREE.Mesh(photonGeom, photonMat);
  photon1.name = 'villarceau_photon_1';
  ring1.add(photon1);

  const photon2 = new THREE.Mesh(photonGeom, photonMat);
  photon2.name = 'villarceau_photon_2';
  ring2.add(photon2);
}

// 8. Stylized Multivariable Calculus 3D Surface (Neon Height-Map & Gradient Ascent)
function buildCalculusSurfaceModel(group: THREE.Group, opts: { wireframe: boolean; xray: boolean; explodeFactor: number }) {
  const size = 36;
  const geom = new THREE.PlaneGeometry(3.4, 3.4, size, size);
  const pos = geom.attributes.position;
  const colors = new Float32Array(pos.count * 3);

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = Math.sin(x * 2.1) * Math.cos(y * 2.1) * 0.7;
    pos.setZ(i, z);

    // Height-map vertex color gradient (from deep indigo valleys to neon cyan and magenta peaks)
    const normalizedZ = (z + 0.7) / 1.4; // 0 to 1
    const r = normalizedZ > 0.5 ? (normalizedZ - 0.5) * 2 : 0.1;
    const g = normalizedZ * 0.8;
    const b = 1.0 - normalizedZ * 0.4;

    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geom.computeVertexNormals();

  const surfMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.25,
    metalness: 0.4,
    side: THREE.DoubleSide,
    wireframe: opts.wireframe
  });
  const mesh = new THREE.Mesh(geom, surfMat);
  mesh.rotation.x = -Math.PI / 2.7;
  group.add(mesh);

  // Wireframe grid lines overlay for contour clarity
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.2
  });
  const wireMesh = new THREE.Mesh(geom, wireMat);
  wireMesh.rotation.x = -Math.PI / 2.7;
  group.add(wireMesh);

  // Tangent plane at critical local maximum
  const planeGeom = new THREE.PlaneGeometry(0.9, 0.9);
  const planeMat = getMaterial(0xf43f5e, { ...opts, opacity: 0.8, depthWrite: false, emissive: 0xe11d48, emissiveIntensity: 0.5 });
  const tPlane = new THREE.Mesh(planeGeom, planeMat);
  tPlane.position.set(0.65, 0.55, 0.22);
  tPlane.rotation.x = -Math.PI / 2.9;
  group.add(tPlane);

  // Gradient vector arrow pointing in direction of steepest ascent
  const dir = new THREE.Vector3(0.5, 0.8, 0.2).normalize();
  const origin = new THREE.Vector3(0.65, 0.55, 0.22);
  const arrowHelper = new THREE.ArrowHelper(dir, origin, 0.7, 0xfacc15, 0.2, 0.14);
  group.add(arrowHelper);
}

// 9. Stylized 4D Tesseract (Hyperdimensional Crystal Projection)
function buildTesseractModel(group: THREE.Group, opts: { wireframe: boolean; xray: boolean; explodeFactor: number }) {
  const outerSize = 1.75 + opts.explodeFactor * 0.6;
  const innerSize = 0.88 - opts.explodeFactor * 0.2;

  // Outer 3D Cube Cell (Glowing Cyan Edges + Translucent Facets)
  const outerGeom = new THREE.BoxGeometry(outerSize, outerSize, outerSize);
  const outerEdges = new THREE.EdgesGeometry(outerGeom);
  const outerLine = new THREE.LineSegments(
    outerEdges,
    new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 })
  );
  group.add(outerLine);

  const outerMat = getMaterial(0x0284c7, {
    ...opts,
    opacity: 0.25,
    depthWrite: false,
    emissive: 0x0369a1,
    emissiveIntensity: 0.3
  });
  const outerCube = new THREE.Mesh(outerGeom, outerMat);
  group.add(outerCube);

  // Inner 3D Cube Cell (Glowing Rose Edges + Translucent Facets)
  const innerGeom = new THREE.BoxGeometry(innerSize, innerSize, innerSize);
  const innerEdges = new THREE.EdgesGeometry(innerGeom);
  const innerLine = new THREE.LineSegments(
    innerEdges,
    new THREE.LineBasicMaterial({ color: 0xf43f5e, linewidth: 2 })
  );
  group.add(innerLine);

  const innerMat = getMaterial(0xe11d48, {
    ...opts,
    opacity: 0.45,
    depthWrite: false,
    emissive: 0xbe123c,
    emissiveIntensity: 0.4
  });
  const innerCube = new THREE.Mesh(innerGeom, innerMat);
  group.add(innerCube);

  // 8 Connecting 4D Dimensional Struts
  const outerHalf = outerSize / 2;
  const innerHalf = innerSize / 2;
  const signs = [-1, 1];

  signs.forEach((sx) => {
    signs.forEach((sy) => {
      signs.forEach((sz) => {
        const p1 = new THREE.Vector3(sx * outerHalf, sy * outerHalf, sz * outerHalf);
        const p2 = new THREE.Vector3(sx * innerHalf, sy * innerHalf, sz * innerHalf);
        const strutGeom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const strutLine = new THREE.Line(
          strutGeom,
          new THREE.LineBasicMaterial({ color: 0xfacc15, linewidth: 2 })
        );
        group.add(strutLine);

        // Holographic Vertex Nodes
        const vGeom = new THREE.SphereGeometry(0.05, 12, 12);
        const vMat = getMaterial(0xffffff, { metalness: 0.9, emissive: 0xffffff, emissiveIntensity: 0.8 });
        const v1 = new THREE.Mesh(vGeom, vMat);
        v1.position.copy(p1);
        group.add(v1);

        const v2 = new THREE.Mesh(vGeom, vMat);
        v2.position.copy(p2);
        group.add(v2);
      });
    });
  });
}

// 10. Stylized Klein Bottle (Figure-8 Topological Immersion with Dual-Tone Möbius Gradient)
function buildKleinBottleModel(group: THREE.Group, opts: { wireframe: boolean; xray: boolean; explodeFactor: number }) {
  const slices = 44;
  const stacks = 44;
  const geom = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const indices: number[] = [];
  const colors: number[] = [];

  for (let i = 0; i <= slices; i++) {
    const u = (i / slices) * Math.PI * 2;
    for (let j = 0; j <= stacks; j++) {
      const v = (j / stacks) * Math.PI * 2;
      const r = 0.5 * (1 - Math.cos(u) / 2);

      let x: number, y: number, z: number;
      if (u < Math.PI) {
        x = 1.0 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(u) * Math.cos(v);
        y = 2.0 * Math.sin(u) + r * Math.sin(u) * Math.cos(v);
      } else {
        x = 1.0 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(v + Math.PI);
        y = 2.0 * Math.sin(u);
      }
      z = r * Math.sin(v);

      vertices.push(x * 0.72, y * 0.72 - 0.5, z * 0.72);

      // Shifting non-orientable dual tone color (cyan transitioning into violet/magenta)
      const uNorm = u / (Math.PI * 2);
      colors.push(
        0.4 + 0.6 * Math.sin(uNorm * Math.PI),
        0.2 + 0.6 * Math.cos(uNorm * Math.PI),
        0.95
      );
    }
  }

  for (let i = 0; i < slices; i++) {
    for (let j = 0; j < stacks; j++) {
      const a = i * (stacks + 1) + j;
      const b = (i + 1) * (stacks + 1) + j;
      const c = (i + 1) * (stacks + 1) + (j + 1);
      const d = i * (stacks + 1) + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  const kleinMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.2,
    metalness: 0.4,
    wireframe: opts.wireframe,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geom, kleinMat);
  group.add(mesh);

  // Outer wireframe accents
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.2
  });
  const wireMesh = new THREE.Mesh(geom, wireMat);
  group.add(wireMesh);
}

// Build interactive Pinpoints (Luminescent sci-fi beacons)
function buildPins(pinpoints: Pinpoint[], group: THREE.Group, selectedPinId: string | null) {
  pinpoints.forEach((pin) => {
    const isSelected = pin.id === selectedPinId;
    const pinContainer = new THREE.Group();
    pinContainer.position.set(pin.position[0], pin.position[1], pin.position[2]);
    pinContainer.userData = { pinId: pin.id };

    // Outer beacon ring
    const ringGeom = new THREE.RingGeometry(0.09, 0.13, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isSelected ? 0xef4444 : 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    pinContainer.add(ring);

    // Inner glowing sphere
    const sphereGeom = new THREE.SphereGeometry(0.065, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: isSelected ? 0xffffff : 0x22d3ee,
      emissive: isSelected ? 0xef4444 : 0x0891b2,
      emissiveIntensity: 1.0
    });
    const sphere = new THREE.Mesh(sphereGeom, sphereMat);
    pinContainer.add(sphere);

    group.add(pinContainer);
  });
}

// Model-specific continuous animations
function updateModelAnimation(renderType: string, group: THREE.Group, time: number) {
  if (renderType === 'heart') {
    const heart = group.getObjectByName('pulsing_heart');
    if (heart) {
      // Natural 2-stage cardiac contraction (lub-dub cycle: atrial kick then strong ventricular systole)
      const heartRatePhase = (time * 4.5) % (Math.PI * 2);
      const systole = Math.pow(Math.sin(heartRatePhase), 8) * 0.065;
      const atrialKick = Math.pow(Math.sin(heartRatePhase + 0.4), 12) * 0.035;
      const s = 1 + systole + atrialKick;
      heart.scale.set(s, s * 0.98, s);
    }
  } else if (renderType === 'eye') {
    const rayGroup = group.getObjectByName('optical_refraction_rays');
    if (rayGroup) {
      // Subtle pulse to simulate continuous photon flow through optical media
      const photonPulse = 0.8 + 0.2 * Math.sin(time * 5);
      rayGroup.children.forEach((child) => {
        if (child instanceof THREE.Line && child.material instanceof THREE.LineBasicMaterial) {
          child.material.opacity = photonPulse * 0.85;
        }
      });
    }
  } else if (renderType === 'cell') {
    const nucleolus = group.getObjectByName('nucleolus_pulsing');
    if (nucleolus) {
      const pulse = 1 + 0.12 * Math.sin(time * 4);
      nucleolus.scale.set(pulse, pulse, pulse);
    }
  } else if (renderType === 'platonic') {
    const tetra = group.getObjectByName('tetra_rot');
    const octa = group.getObjectByName('octa_rot');
    const ico = group.getObjectByName('ico_rot');
    if (tetra) tetra.rotation.y += 0.01;
    if (octa) {
      octa.rotation.x += 0.008;
      octa.rotation.z += 0.005;
    }
    if (ico) ico.rotation.y -= 0.01;
  } else if (renderType === 'torus') {
    const p1 = group.getObjectByName('villarceau_photon_1');
    const p2 = group.getObjectByName('villarceau_photon_2');
    if (p1) {
      const a = time * 2;
      p1.position.set(Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0);
    }
    if (p2) {
      const a = -time * 2;
      p2.position.set(Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0);
    }
  } else if (renderType === 'tesseract') {
    const factor = 1 + 0.04 * Math.sin(time * 2);
    group.scale.set(factor, factor, factor);
  }
}
