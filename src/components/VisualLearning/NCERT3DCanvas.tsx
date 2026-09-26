import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Pinpoint } from '../../types';

export interface NCERTPartInfo {
  name: string;
  category?: string;
  function: string;
  fact?: string;
  pinId?: string;
}

interface HoveredTooltipData extends NCERTPartInfo {
  screenX: number;
  screenY: number;
}

interface NCERT3DCanvasProps {
  renderType: string;
  wireframe?: boolean;
  xray?: boolean;
  explodeFactor?: number;
  autoRotate?: boolean;
  pinpoints?: Pinpoint[];
  selectedPinId?: string | null;
  onSelectPin?: (pin: Pinpoint) => void;
  speedMultiplier?: number;
  unitCellType?: 'SC' | 'BCC' | 'FCC';
  quizMode?: boolean;
}

export const NCERT3DCanvas: React.FC<NCERT3DCanvasProps> = ({
  renderType,
  wireframe = false,
  xray = false,
  explodeFactor = 0,
  autoRotate = true,
  pinpoints = [],
  selectedPinId = null,
  onSelectPin,
  speedMultiplier = 1,
  unitCellType = 'BCC',
  quizMode = false
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

  // Initialize WebGL Scene
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 700;
    const height = mount.clientHeight || 460;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.6, 4.3);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    rendererRef.current = renderer;

    const domElement = renderer.domElement;
    domElement.style.width = '100%';
    domElement.style.height = '100%';
    domElement.style.display = 'block';
    domElement.style.position = 'absolute';
    domElement.style.top = '0';
    domElement.style.left = '0';

    while (mount.firstChild) mount.removeChild(mount.firstChild);
    mount.appendChild(domElement);

    // Dynamic Lighting Setup with Hemisphere Fill & Specular Accents
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x090d16, 0.95);
    scene.add(hemiLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.4);
    dirLight1.position.set(5, 7, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xc084fc, 1.8);
    dirLight2.position.set(-5, -2, -4);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x22d3ee, 2.0, 16);
    pointLight.position.set(0, 3, 2.5);
    scene.add(pointLight);

    // Realistic Stage: Soft Floor Contact Shadow & Holographic Grid
    const stageGroup = new THREE.Group();
    stageGroupRef.current = stageGroup;
    scene.add(stageGroup);

    // Soft grounded contact shadow disc
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x020617, transparent: true, opacity: 0.7 });
    const shadowMesh = new THREE.Mesh(new THREE.CircleGeometry(2.4, 32), shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.56;
    stageGroup.add(shadowMesh);

    const stageGrid = new THREE.PolarGridHelper(3.4, 16, 8, 48, 0x06b6d4, 0x1e293b);
    stageGrid.position.y = -1.55;
    stageGroup.add(stageGrid);

    const ringGeom = new THREE.RingGeometry(3.2, 3.28, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
    const stageRing = new THREE.Mesh(ringGeom, ringMat);
    stageRing.rotation.x = Math.PI / 2;
    stageRing.position.y = -1.54;
    stageGroup.add(stageRing);

    // Root Container Group
    const rootGroup = new THREE.Group();
    rootGroup.rotation.x = 0.22;
    rootGroup.rotation.y = -0.32;
    rootGroupRef.current = rootGroup;
    scene.add(rootGroup);

    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    rootGroup.add(modelGroup);

    const pinsGroup = new THREE.Group();
    pinsGroupRef.current = pinsGroup;
    rootGroup.add(pinsGroup);

    // Build Model & Pins
    buildNCERTModel(renderType, modelGroup, { wireframe, xray, explodeFactor, unitCellType });
    buildNCERTPins(pinpoints, pinsGroup, selectedPinId);

    // Resize Handler
    const handleResize = () => {
      if (!mount || !renderer || !camera) return;
      const w = mount.clientWidth || 700;
      const h = mount.clientHeight || 460;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(mount);
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let lastTime = performance.now();
    const animate = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      timeRef.current += delta * speedMultiplierRef.current;

      if (autoRotateRef.current && rootGroupRef.current && !isDraggingRef.current) {
        rootGroupRef.current.rotation.y += 0.005;
      }

      if (autoRotateRef.current && stageGroupRef.current) {
        stageGroupRef.current.rotation.y += 0.0015;
      }

      try {
        updateNCERTModelAnimation(renderTypeRef.current, modelGroup, timeRef.current);
      } catch (e) {
        console.warn('NCERT model animation error:', e);
      }

      // Pulse pinpoints
      if (pinsGroupRef.current) {
        pinsGroupRef.current.children.forEach((pinObj, index) => {
          const pulse = 1 + 0.16 * Math.sin(timeRef.current * 3.5 + index);
          pinObj.scale.set(pulse, pulse, pulse);
        });
      }

      try {
        renderer.render(scene, camera);
      } catch {}

      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

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

  // Rebuild model when props change
  useEffect(() => {
    if (!modelGroupRef.current) return;
    clearGroup(modelGroupRef.current);
    buildNCERTModel(renderType, modelGroupRef.current, { wireframe, xray, explodeFactor, unitCellType });
  }, [renderType, wireframe, xray, explodeFactor, unitCellType]);

  // Rebuild pins when pinpoints, selection, or explodeFactor change
  useEffect(() => {
    if (!pinsGroupRef.current) return;
    clearGroup(pinsGroupRef.current);
    buildNCERTPins(pinpoints, pinsGroupRef.current, selectedPinId, explodeFactor);
  }, [pinpoints, selectedPinId, explodeFactor]);

  // Drag Orbit Interactions
  const handleDragStart = (x: number, y: number) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    previousMousePositionRef.current = { x, y };
  };

  const handleDragMove = (x: number, y: number) => {
    if (!isDraggingRef.current || !rootGroupRef.current) return;
    const deltaX = x - previousMousePositionRef.current.x;
    const deltaY = y - previousMousePositionRef.current.y;

    rootGroupRef.current.rotation.y += deltaX * 0.009;
    rootGroupRef.current.rotation.x = Math.max(-1.4, Math.min(1.4, rootGroupRef.current.rotation.x + deltaY * 0.009));

    previousMousePositionRef.current = { x, y };
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  // Hover Raycasting
  const handleHoverRaycast = (clientX: number, clientY: number) => {
    try {
      if (!containerRef.current || !cameraRef.current || !modelGroupRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (!rect || rect.width <= 0 || rect.height <= 0) return;

      const mouseX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((clientY - rect.top) / rect.height) * 2 + 1;
      mouseRef.current.x = mouseX;
      mouseRef.current.y = mouseY;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      // Check pinpoints
      if (pinsGroupRef.current && pinsGroupRef.current.children.length > 0) {
        const pinHits = raycasterRef.current.intersectObjects(pinsGroupRef.current.children, true);
        if (pinHits.length > 0) {
          let obj: THREE.Object3D | null = pinHits[0].object;
          while (obj && !obj.userData?.pinId && obj.parent) obj = obj.parent;
          if (obj?.userData?.pinId) {
            const pin = pinpoints.find((p) => p.id === obj!.userData.pinId);
            if (pin) {
              setHoveredTooltip({
                name: pin.name,
                category: 'NCERT Labeled Feature',
                function: pin.description,
                fact: pin.significance + (pin.formulaOrFact ? ` • ${pin.formulaOrFact}` : ''),
                pinId: pin.id,
                screenX: clientX - rect.left,
                screenY: clientY - rect.top
              });
              return;
            }
          }
        }
      }

      // Check model components
      const modelHits = raycasterRef.current.intersectObjects(modelGroupRef.current.children, true);
      for (const hit of modelHits) {
        let curr: THREE.Object3D | null = hit.object;
        while (curr && curr !== modelGroupRef.current) {
          if (curr.userData?.partInfo) {
            if (currentHoveredObjRef.current !== curr) {
              if (currentHoveredObjRef.current) unhighlightObject(currentHoveredObjRef.current);
              highlightObject(curr);
              currentHoveredObjRef.current = curr;
            }
            setHoveredTooltip({
              ...curr.userData.partInfo,
              screenX: clientX - rect.left,
              screenY: clientY - rect.top
            });
            return;
          }
          curr = curr.parent;
        }
      }

      if (currentHoveredObjRef.current) {
        unhighlightObject(currentHoveredObjRef.current);
        currentHoveredObjRef.current = null;
      }
      setHoveredTooltip(null);
    } catch {}
  };

  const handleClick = (e: React.MouseEvent) => {
    try {
      if (!containerRef.current || !cameraRef.current || !onSelectPin) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (!rect || rect.width <= 0) return;
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      mouseRef.current.x = mouseX;
      mouseRef.current.y = mouseY;
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      if (pinsGroupRef.current) {
        const pinHits = raycasterRef.current.intersectObjects(pinsGroupRef.current.children, true);
        if (pinHits.length > 0) {
          let obj: THREE.Object3D | null = pinHits[0].object;
          while (obj && !obj.userData?.pinId && obj.parent) obj = obj.parent;
          if (obj?.userData?.pinId) {
            const pin = pinpoints.find((p) => p.id === obj!.userData.pinId);
            if (pin) {
              onSelectPin(pin);
              return;
            }
          }
        }
      }

      if (modelGroupRef.current) {
        const modelHits = raycasterRef.current.intersectObjects(modelGroupRef.current.children, true);
        for (const hit of modelHits) {
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
    } catch {}
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!cameraRef.current) return;
      const zoomDelta = e.deltaY * 0.003;
      if (Number.isFinite(zoomDelta)) {
        cameraRef.current.position.z = Math.max(1.8, Math.min(8.0, cameraRef.current.position.z + zoomDelta));
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
      onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
      onMouseMove={(e) => (isDraggingRef.current ? handleDragMove(e.clientX, e.clientY) : handleHoverRaycast(e.clientX, e.clientY))}
      onMouseUp={handleDragEnd}
      onMouseLeave={() => {
        handleDragEnd();
        if (currentHoveredObjRef.current) {
          unhighlightObject(currentHoveredObjRef.current);
          currentHoveredObjRef.current = null;
        }
        setHoveredTooltip(null);
      }}
      onTouchStart={(e) => e.touches.length === 1 && handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => e.touches.length === 1 && handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleDragEnd}
      onClick={handleClick}
    >
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Floating Hover Tooltip (hidden during Labeling Quiz for challenge) */}
      {hoveredTooltip && !isDragging && !quizMode && (
        <div
          className="pointer-events-none absolute z-40 transition-all duration-75 ease-out"
          style={{
            left: `${Math.max(140, Math.min((containerRef.current?.clientWidth || 600) - 140, hoveredTooltip.screenX))}px`,
            top: hoveredTooltip.screenY < 170 ? `${Math.max(10, hoveredTooltip.screenY + 16)}px` : `${Math.max(10, hoveredTooltip.screenY - 14)}px`,
            transform: hoveredTooltip.screenY < 170 ? 'translate(-50%, 0)' : 'translate(-50%, -100%)'
          }}
        >
          <div className="w-72 bg-slate-900/95 backdrop-blur-md text-white text-xs rounded-xl p-3.5 shadow-2xl border border-cyan-400/40 ring-1 ring-cyan-500/20">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {hoveredTooltip.category || 'NCERT Diagram Component'}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono tracking-tight">3D Interactive</span>
            </div>
            <h4 className="text-sm font-bold text-white tracking-wide mb-1 leading-snug">{hoveredTooltip.name}</h4>
            <p className="text-slate-300 text-[11px] leading-relaxed mb-1.5">
              <span className="font-semibold text-cyan-200">Role / Function: </span>
              {hoveredTooltip.function}
            </p>
            {hoveredTooltip.fact && (
              <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700/60 mb-1.5">
                <p className="text-[10px] text-amber-200/90 leading-tight">
                  <span className="font-semibold text-amber-300">NCERT Point: </span>
                  {hoveredTooltip.fact}
                </p>
              </div>
            )}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              <span className="text-cyan-400 font-medium">Click to inspect</span>
              <span className="text-slate-500">Drag to orbit</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Three.js Helpers & Material Generator ---

function getMaterial(
  color: number,
  options: {
    wireframe?: boolean;
    xray?: boolean;
    transparent?: boolean;
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
    transparent = false,
    roughness = 0.25,
    metalness = 0.35,
    opacity = 1.0,
    depthWrite = true,
    emissive = 0x000000,
    emissiveIntensity = 0.25,
    side = THREE.DoubleSide
  } = options;

  if (xray) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      wireframe,
      side
    });
  }

  const isTransparent = transparent || opacity < 1.0;

  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    wireframe,
    transparent: isTransparent,
    opacity,
    depthWrite: isTransparent ? depthWrite : true,
    side,
    emissive,
    emissiveIntensity
  });
}

function clearGroup(group: THREE.Group) {
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
}

function highlightObject(rootObj: THREE.Object3D) {
  try {
    rootObj.traverse((child) => {
      const obj = child as any;
      if (obj && (obj.isMesh || obj.isLine) && !obj.userData?.__highlighted) {
        obj.userData.__origMaterial = obj.material;
        const clone = obj.material.clone();
        if ('emissive' in clone) {
          clone.emissive.setHex(0x38bdf8);
          clone.emissiveIntensity = 0.9;
        } else if ('color' in clone) {
          clone.color.setHex(0x38bdf8);
        }
        obj.material = clone;
        obj.userData.__highlighted = true;
      }
    });
  } catch {}
}

function unhighlightObject(rootObj: THREE.Object3D) {
  try {
    rootObj.traverse((child) => {
      const obj = child as any;
      if (obj && (obj.isMesh || obj.isLine) && obj.userData?.__highlighted && obj.userData.__origMaterial) {
        try {
          obj.material.dispose();
        } catch {}
        obj.material = obj.userData.__origMaterial;
        delete obj.userData.__origMaterial;
        delete obj.userData.__highlighted;
      }
    });
  } catch {}
}

function buildNCERTPins(pinpoints: Pinpoint[], group: THREE.Group, selectedPinId: string | null, explodeFactor = 0) {
  const scale = 1 + explodeFactor * 0.35;
  pinpoints.forEach((pin) => {
    if (pin.minExplodeFactor !== undefined && explodeFactor < pin.minExplodeFactor) {
      return;
    }
    const isSelected = pin.id === selectedPinId;
    const pinContainer = new THREE.Group();
    pinContainer.position.set(pin.position[0] * scale, pin.position[1] * scale, pin.position[2] * scale);
    pinContainer.userData = { pinId: pin.id };

    const ringGeom = new THREE.RingGeometry(0.08, 0.12, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isSelected ? 0xef4444 : 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    pinContainer.add(ring);

    const sphereGeom = new THREE.SphereGeometry(0.06, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: isSelected ? 0xffffff : 0x22d3ee,
      emissive: isSelected ? 0xef4444 : 0x0891b2,
      emissiveIntensity: 1.1
    });
    const sphere = new THREE.Mesh(sphereGeom, sphereMat);
    pinContainer.add(sphere);

    group.add(pinContainer);
  });
}

// --- Procedural 3D Model Builders for NCERT Diagrams ---

interface ModelOpts {
  wireframe: boolean;
  xray: boolean;
  explodeFactor: number;
  unitCellType?: 'SC' | 'BCC' | 'FCC';
}

function buildNCERTModel(renderType: string, group: THREE.Group, opts: ModelOpts) {
  switch (renderType) {
    case 'ncert_flower':
      buildFlowerModel(group, opts);
      break;
    case 'ncert_circuit':
      buildCircuitModel(group, opts);
      break;
    case 'ncert_digestive':
      buildDigestiveModel(group, opts);
      break;
    case 'ncert_stomata':
      buildStomataModel(group, opts);
      break;
    case 'ncert_flame':
      buildFlameModel(group, opts);
      break;
    case 'ncert_eye':
      buildEyeModel(group, opts);
      break;
    case 'ncert_neuron':
      buildNeuronModel(group, opts);
      break;
    case 'ncert_rutherford':
      buildRutherfordModel(group, opts);
      break;
    case 'ncert_nephron':
      buildNephronModel(group, opts);
      break;
    case 'ncert_heart':
      buildHeartModel(group, opts);
      break;
    case 'ncert_motor':
      buildMotorModel(group, opts);
      break;
    case 'ncert_prism':
      buildPrismModel(group, opts);
      break;
    case 'ncert_electrolysis':
      buildElectrolysisModel(group, opts);
      break;
    case 'ncert_mitochondria':
      buildMitochondriaModel(group, opts);
      break;
    case 'ncert_bacteriophage':
      buildBacteriophageModel(group, opts);
      break;
    case 'ncert_dna':
      buildDNAModel(group, opts);
      break;
    case 'ncert_antibody':
      buildAntibodyModel(group, opts);
      break;
    case 'ncert_pbr322':
      buildPBR322Model(group, opts);
      break;
    case 'ncert_unit_cell':
      buildUnitCellModel(group, opts);
      break;
    case 'ncert_transformer':
      buildTransformerModel(group, opts);
      break;
    default:
      buildNephronModel(group, opts);
  }

  // Apply universal radial explode & cross-section expansion to all top-level model parts
  if (opts.explodeFactor > 0) {
    const total = group.children.length;
    group.children.forEach((child, idx) => {
      const pos = child.position;
      const len = pos.length();
      if (len > 0.04) {
        child.position.multiplyScalar(1 + opts.explodeFactor * 0.45);
      } else if (total > 1) {
        const angle = (idx / total) * Math.PI * 2;
        child.position.x += Math.cos(angle) * opts.explodeFactor * 0.28;
        child.position.z += Math.sin(angle) * opts.explodeFactor * 0.28;
      }
    });
  }
}

// 1. PARTS OF A FLOWER
function buildFlowerModel(group: THREE.Group, opts: ModelOpts) {
  const explode = opts.explodeFactor * 0.7;

  // Stem & Receptacle (Thalamus)
  const stemGeom = new THREE.CylinderGeometry(0.12, 0.14, 1.2, 16);
  const stemMat = getMaterial(0x15803d, { ...opts, roughness: 0.4 });
  const stem = new THREE.Mesh(stemGeom, stemMat);
  stem.position.y = -1.0;
  group.add(stem);

  const thalamusGeom = new THREE.SphereGeometry(0.42, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const thalamus = new THREE.Mesh(thalamusGeom, stemMat);
  thalamus.position.y = -0.4;
  thalamus.rotation.x = Math.PI;
  group.add(thalamus);

  // 4 Green Sepals (Calyx)
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI * 2) / 4;
    const sepalGeom = new THREE.ConeGeometry(0.25, 0.8, 4);
    const sepalMat = getMaterial(0x16a34a, { ...opts });
    const sepal = new THREE.Mesh(sepalGeom, sepalMat);
    sepal.position.set(Math.cos(angle) * (0.45 + explode * 0.4), -0.35, Math.sin(angle) * (0.45 + explode * 0.4));
    sepal.rotation.z = Math.cos(angle) * -0.7;
    sepal.rotation.x = Math.sin(angle) * 0.7;
    sepal.userData.partInfo = {
      name: 'Sepal (Calyx)',
      category: 'Protective Whorl',
      function: 'Shields internal floral whorls during bud development.',
      pinId: 'sepals'
    };
    group.add(sepal);
  }

  // 5 Bright Rose/Magenta Petals (Corolla)
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 + 0.3;
    const petalGeom = new THREE.SphereGeometry(0.55, 16, 12, 0, Math.PI, 0, Math.PI * 0.6);
    const petalMat = getMaterial(0xf43f5e, { ...opts, roughness: 0.3, emissive: 0xbe123c, emissiveIntensity: 0.35 });
    const petal = new THREE.Mesh(petalGeom, petalMat);
    petal.position.set(Math.cos(angle) * (0.8 + explode * 0.8), 0.3 + explode * 0.2, Math.sin(angle) * (0.8 + explode * 0.8));
    petal.rotation.y = angle;
    petal.rotation.x = 0.55;
    petal.userData.partInfo = {
      name: 'Petal (Corolla)',
      category: 'Attraction Whorl',
      function: 'Attracts insect pollinators via vibrant carotenoid/anthocyanin pigmentation.',
      pinId: 'petals'
    };
    group.add(petal);
  }

  // Male Stamens (6 Filament + Anther pairs)
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const filamentCurve = new THREE.LineCurve3(
      new THREE.Vector3(Math.cos(angle) * 0.25, -0.1, Math.sin(angle) * 0.25),
      new THREE.Vector3(Math.cos(angle) * (0.65 + explode * 0.3), 0.9, Math.sin(angle) * (0.65 + explode * 0.3))
    );
    const filGeom = new THREE.TubeGeometry(filamentCurve, 8, 0.03, 8, false);
    const filMat = getMaterial(0xfef08a, { ...opts, emissive: 0xeab308, emissiveIntensity: 0.4 });
    const filMesh = new THREE.Mesh(filGeom, filMat);
    filMesh.userData.partInfo = {
      name: 'Stamen Filament',
      category: 'Male Androecium',
      function: 'Elevates the anther for maximum pollen dispersal.',
      pinId: 'filament'
    };
    group.add(filMesh);

    // Bilobed golden anther
    const antherGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.28, 12);
    const antherMat = getMaterial(0xeab308, { ...opts, emissive: 0xca8a04, emissiveIntensity: 0.6 });
    const anther = new THREE.Mesh(antherGeom, antherMat);
    anther.position.set(Math.cos(angle) * (0.65 + explode * 0.3), 1.05, Math.sin(angle) * (0.65 + explode * 0.3));
    anther.rotation.z = Math.cos(angle) * 0.3;
    anther.userData.partInfo = {
      name: 'Anther (with Pollen Grains)',
      category: 'Male Androecium',
      function: 'Dithecous microsporangium producing thousands of haploid pollen grains.',
      pinId: 'anther'
    };
    group.add(anther);
  }

  // Central Female Carpel (Pistil): Ovary, Style & Stigma
  const ovaryGeom = new THREE.SphereGeometry(0.48, 20, 20);
  const ovaryMat = getMaterial(0x84cc16, { ...opts, roughness: 0.35, emissive: 0x4d7c0f, emissiveIntensity: 0.2 });
  const ovary = new THREE.Mesh(ovaryGeom, ovaryMat);
  ovary.position.y = 0.1;
  ovary.scale.set(1, 1.25, 1);
  ovary.userData.partInfo = {
    name: 'Ovary & Ovules',
    category: 'Female Gynoecium',
    function: 'Encloses fertile ovules; develops into fruit following fertilization.',
    pinId: 'ovary'
  };
  group.add(ovary);

  const styleGeom = new THREE.CylinderGeometry(0.08, 0.12, 1.1, 16);
  const styleMat = getMaterial(0xa3e635, { ...opts });
  const style = new THREE.Mesh(styleGeom, styleMat);
  style.position.y = 0.95;
  group.add(style);

  // 3-Lobed sticky stigma
  const stigmaGroup = new THREE.Group();
  stigmaGroup.position.y = 1.5;
  for (let s = 0; s < 3; s++) {
    const sAngle = (s * Math.PI * 2) / 3;
    const lobeGeom = new THREE.SphereGeometry(0.12, 12, 12);
    const lobeMat = getMaterial(0x22c55e, { ...opts, emissive: 0x16a34a, emissiveIntensity: 0.5 });
    const lobe = new THREE.Mesh(lobeGeom, lobeMat);
    lobe.position.set(Math.cos(sAngle) * 0.12, 0, Math.sin(sAngle) * 0.12);
    stigmaGroup.add(lobe);
  }
  stigmaGroup.userData.partInfo = {
    name: 'Sticky Stigma',
    category: 'Female Gynoecium',
    function: 'Receptive landing platform for compatible pollen grains.',
    pinId: 'stigma'
  };
  group.add(stigmaGroup);
}

// 2. SIMPLE ELECTRIC CIRCUIT
function buildCircuitModel(group: THREE.Group, opts: ModelOpts) {
  // Wooden / Acrylic Base Board
  const baseGeom = new THREE.BoxGeometry(3.6, 0.15, 2.4);
  const baseMat = getMaterial(0x1e293b, { ...opts, roughness: 0.8 });
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.position.y = -0.7;
  group.add(base);

  // Dry Cell (Battery)
  const cellCyl = new THREE.CylinderGeometry(0.35, 0.35, 1.2, 24);
  const cellMat = getMaterial(0x0284c7, { ...opts, metalness: 0.6, emissive: 0x0369a1, emissiveIntensity: 0.3 });
  const cellMesh = new THREE.Mesh(cellCyl, cellMat);
  cellMesh.rotation.z = Math.PI / 2;
  cellMesh.position.set(-1.1, -0.4, 0);
  cellMesh.userData.partInfo = {
    name: 'Dry Cell (1.5 V)',
    category: 'Power Source',
    function: 'Maintains electric potential difference between anode (+) and cathode (-).',
    pinId: 'dry_cell'
  };
  group.add(cellMesh);

  // Positive Pip Terminal
  const pipGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.15, 16);
  const pipMat = getMaterial(0xf59e0b, { metalness: 0.9, roughness: 0.2 });
  const pip = new THREE.Mesh(pipGeom, pipMat);
  pip.rotation.z = Math.PI / 2;
  pip.position.set(-0.45, -0.4, 0);
  group.add(pip);

  // Incandescent Filament Lamp
  const bulbBaseGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 16);
  const bulbBaseMat = getMaterial(0x94a3b8, { metalness: 0.8, roughness: 0.3 });
  const bulbBase = new THREE.Mesh(bulbBaseGeom, bulbBaseMat);
  bulbBase.position.set(1.1, -0.45, 0);
  group.add(bulbBase);

  // Glass Globe
  const globeGeom = new THREE.SphereGeometry(0.48, 24, 24);
  const globeMat = getMaterial(0xfef08a, { ...opts, transparent: true, opacity: 0.45, emissive: 0xfef08a, emissiveIntensity: 0.8 });
  const globe = new THREE.Mesh(globeGeom, globeMat);
  globe.position.set(1.1, 0.15, 0);
  globe.name = 'glowing_bulb';
  globe.userData.partInfo = {
    name: 'Incandescent Filament Lamp',
    category: 'Load',
    function: 'Converts electrical energy into light and heat via tungsten resistance.',
    pinId: 'filament_bulb'
  };
  group.add(globe);

  // Glowing spiral tungsten filament inside
  const filamentGeom = new THREE.TorusGeometry(0.12, 0.02, 8, 24);
  const filamentMat = getMaterial(0xffffff, { emissive: 0xffffff, emissiveIntensity: 1.5 });
  const filament = new THREE.Mesh(filamentGeom, filamentMat);
  filament.position.set(1.1, 0.15, 0);
  group.add(filament);

  // Plug Key / Switch
  const switchBox = new THREE.BoxGeometry(0.6, 0.2, 0.4);
  const switchMat = getMaterial(0x334155, { ...opts });
  const sw = new THREE.Mesh(switchBox, switchMat);
  sw.position.set(0, -0.55, 0.8);
  group.add(sw);

  const leverGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 12);
  const leverMat = getMaterial(0xd97706, { metalness: 0.8 });
  const lever = new THREE.Mesh(leverGeom, leverMat);
  lever.position.set(0, -0.35, 0.8);
  lever.rotation.z = 0.25;
  lever.userData.partInfo = {
    name: 'Switch Key',
    category: 'Control Element',
    function: 'Closes or interrupts circuit continuity.',
    pinId: 'switch_key'
  };
  group.add(lever);

  // Circuit Conducting Wire Loop
  const wirePoints = [
    new THREE.Vector3(-0.4, -0.4, 0),
    new THREE.Vector3(0, -0.4, -0.6),
    new THREE.Vector3(1.1, -0.4, -0.6),
    new THREE.Vector3(1.1, -0.4, 0),
    new THREE.Vector3(1.1, -0.4, 0.8),
    new THREE.Vector3(0.2, -0.4, 0.8),
    new THREE.Vector3(-0.2, -0.4, 0.8),
    new THREE.Vector3(-1.7, -0.4, 0.8),
    new THREE.Vector3(-1.7, -0.4, 0)
  ];
  const wireCurve = new THREE.CatmullRomCurve3(wirePoints, false);
  const wireGeom = new THREE.TubeGeometry(wireCurve, 64, 0.035, 8, false);
  const wireMat = getMaterial(0xef4444, { emissive: 0xdc2626, emissiveIntensity: 0.4 });
  const wireMesh = new THREE.Mesh(wireGeom, wireMat);
  wireMesh.userData.partInfo = {
    name: 'Insulated Copper Wire',
    category: 'Conductor',
    function: 'Transports electric charges with minimal resistive energy loss.',
    pinId: 'copper_wire'
  };
  group.add(wireMesh);
}

// 3. HUMAN ALIMENTARY CANAL & DIGESTIVE SYSTEM (Exact NCERT Fig. 2.11 High-Fidelity 3D Cutaway Model)
function buildDigestiveModel(group: THREE.Group, opts: ModelOpts) {
  const explode = opts.explodeFactor * 0.75;

  // Signature NCERT Fig. 2.11 Color Materials
  const palePinkMat = getMaterial(0xfbcfe8, {
    ...opts,
    roughness: 0.38,
    metalness: 0.05,
    emissive: 0xf472b6,
    emissiveIntensity: 0.12
  });
  const roseWallMat = getMaterial(0xf472b6, {
    ...opts,
    roughness: 0.35,
    metalness: 0.06,
    emissive: 0xdb2777,
    emissiveIntensity: 0.18
  });
  const deepRoseMat = getMaterial(0xec4899, {
    ...opts,
    roughness: 0.4,
    metalness: 0.05,
    emissive: 0xbe185d,
    emissiveIntensity: 0.16
  });
  const plumLumenMat = getMaterial(0x784b6a, {
    ...opts,
    roughness: 0.65,
    metalness: 0.04,
    emissive: 0x4a253e,
    emissiveIntensity: 0.15
  });
  const darkPlumFoldMat = new THREE.LineBasicMaterial({
    color: 0x3b1d31,
    transparent: true,
    opacity: 0.75
  });
  const ductMat = getMaterial(0xfdf2f8, {
    ...opts,
    roughness: 0.3,
    metalness: 0.05,
    emissive: 0xf9a8d4,
    emissiveIntensity: 0.18
  });

  // ============================================================================
  // 1. GALL BLADDER (PEAR-SHAPED SAC WITH UPPER CUTAWAY) & BILIARY DUCT TREE
  // ============================================================================
  const biliaryGroup = new THREE.Group();
  biliaryGroup.position.set(-explode * 0.5, explode * 0.35, explode * 0.2);
  biliaryGroup.userData.partInfo = {
    name: 'Gall Bladder & Biliary Duct Tree (Hepatic & Common Bile Duct)',
    category: 'Digestive Gland & Ducts',
    function: 'Stores and concentrates alkaline bile from the liver and delivers it via the common bile duct into the duodenum.',
    fact: 'Bile salts emulsify large dietary fat globules into microscopic micelles for lipase action.',
    pinId: 'liver_gallbladder'
  };

  // Lower intact bulbous pear fundus of Gall Bladder
  const gbFundusGeom = new THREE.SphereGeometry(0.21, 24, 20);
  gbFundusGeom.scale(0.95, 1.18, 0.72);
  const gbFundus = new THREE.Mesh(gbFundusGeom, roseWallMat);
  gbFundus.position.set(-0.88, 0.92, 0.05);
  gbFundus.rotation.z = -0.22;
  biliaryGroup.add(gbFundus);

  // Upper cutaway neck/body of Gall Bladder (Rose outer rim + deep plum-mauve interior cavity)
  const gbNeckCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.84, 1.06, 0.04),
    new THREE.Vector3(-0.76, 1.25, 0.04),
    new THREE.Vector3(-0.64, 1.38, 0.03),
    new THREE.Vector3(-0.55, 1.24, 0.02)
  ]);
  const gbNeckRim = new THREE.Mesh(new THREE.TubeGeometry(gbNeckCurve, 24, 0.095, 14, false), roseWallMat);
  gbNeckRim.scale.set(1, 1, 0.55);
  biliaryGroup.add(gbNeckRim);

  const gbLumenCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.85, 1.04, 0.075),
    new THREE.Vector3(-0.77, 1.23, 0.075),
    new THREE.Vector3(-0.65, 1.35, 0.06)
  ]);
  const gbLumen = new THREE.Mesh(new THREE.TubeGeometry(gbLumenCurve, 20, 0.068, 12, false), plumLumenMat);
  gbLumen.scale.set(1, 1, 0.45);
  biliaryGroup.add(gbLumen);

  // Branching Hepatic Ducts (Y-shaped left & right hepatic ducts with upper sub-branches as in Fig. 2.11)
  const commonBileCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.55, 1.24, 0.02),
    new THREE.Vector3(-0.46, 0.96, 0.01),
    new THREE.Vector3(-0.49, 0.62, -0.02),
    new THREE.Vector3(-0.56, 0.24, 0.03)
  ]);
  biliaryGroup.add(new THREE.Mesh(new THREE.TubeGeometry(commonBileCurve, 24, 0.026, 10, false), ductMat));

  // Right & Left Hepatic Duct branches at top
  const hepaticBranch1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.46, 0.96, 0.01),
    new THREE.Vector3(-0.44, 1.22, 0.01),
    new THREE.Vector3(-0.43, 1.37, 0.01)
  ]);
  biliaryGroup.add(new THREE.Mesh(new THREE.TubeGeometry(hepaticBranch1, 12, 0.02, 8, false), ductMat));

  const hepaticBranch2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.44, 1.15, 0.01),
    new THREE.Vector3(-0.33, 1.33, 0.01)
  ]);
  biliaryGroup.add(new THREE.Mesh(new THREE.TubeGeometry(hepaticBranch2, 10, 0.018, 8, false), ductMat));

  const hepaticBranch3 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.38, 1.25, 0.01),
    new THREE.Vector3(-0.30, 1.28, 0.01)
  ]);
  biliaryGroup.add(new THREE.Mesh(new THREE.TubeGeometry(hepaticBranch3, 8, 0.014, 8, false), ductMat));

  group.add(biliaryGroup);

  // ============================================================================
  // 2. LOWER OESOPHAGUS & J-SHAPED STOMACH (WITH ANTERIOR CUTAWAY & RUGAE)
  // ============================================================================
  const stomachGroup = new THREE.Group();
  stomachGroup.position.set(explode * 0.45, explode * 0.3, 0);

  // Oesophagus (Top center vertical cutaway tube entering cardiac stomach)
  const esoGroup = new THREE.Group();
  esoGroup.userData.partInfo = {
    name: 'Oesophagus (Food Pipe)',
    category: 'Muscular Transport Tube',
    function: 'Conveys masticated food bolus from the pharynx into the cardiac stomach via peristalsis.',
    fact: 'Peristaltic waves push food into the stomach through the gastro-oesophageal sphincter.',
    pinId: 'mouth_esophagus'
  };
  const esoCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.02, 1.62, 0),
    new THREE.Vector3(0.03, 1.38, 0),
    new THREE.Vector3(0.08, 1.18, 0)
  ]);
  const esoOuter = new THREE.Mesh(new THREE.TubeGeometry(esoCurve, 16, 0.095, 14, false), roseWallMat);
  esoOuter.scale.set(1, 1, 0.62);
  esoGroup.add(esoOuter);

  const esoLumen = new THREE.Mesh(new THREE.TubeGeometry(esoCurve, 16, 0.06, 12, false), plumLumenMat);
  esoLumen.position.z = 0.03;
  esoLumen.scale.set(1, 1, 0.45);
  esoGroup.add(esoLumen);
  stomachGroup.add(esoGroup);

  // J-Shaped Stomach Container
  const jStomach = new THREE.Group();
  jStomach.userData.partInfo = {
    name: 'Stomach (J-Shaped Muscular Bag — Cutaway View)',
    category: 'Gastric Chamber',
    function: 'Churns food with gastric juice (HCl, pepsin, and mucus) into acidic semi-fluid chyme.',
    fact: 'Shows the pale pink outer serosa (fundus & greater curvature), rose muscular wall rim, and deep plum-mauve mucosal lumen.',
    pinId: 'stomach'
  };

  // A. Outer Pale Blush-Pink Serosal Dome (Fundus & Sweeping Greater Curvature extending right/below cutaway)
  const outerStomachCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.24, 1.24, -0.04),
    new THREE.Vector3(0.56, 1.14, -0.03),
    new THREE.Vector3(0.72, 0.82, -0.03),
    new THREE.Vector3(0.62, 0.48, -0.03),
    new THREE.Vector3(0.28, 0.34, -0.03),
    new THREE.Vector3(-0.14, 0.38, -0.03)
  ]);
  const outerStomachGeom = new THREE.TubeGeometry(outerStomachCurve, 36, 0.32, 20, false);
  outerStomachGeom.scale(1.0, 1.0, 0.48);
  const outerStomachMesh = new THREE.Mesh(outerStomachGeom, palePinkMat);
  jStomach.add(outerStomachMesh);

  // Fundus top dome cap (pale blush pink)
  const fundusCapGeom = new THREE.SphereGeometry(0.31, 24, 20);
  fundusCapGeom.scale(1.05, 0.95, 0.48);
  const fundusCap = new THREE.Mesh(fundusCapGeom, palePinkMat);
  fundusCap.position.set(0.32, 1.18, -0.03);
  jStomach.add(fundusCap);

  // B. Rose-Pink Cutaway Muscular Wall Rim framing the anterior cutaway window
  const cutawayWallCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.12, 1.12, 0.02),
    new THREE.Vector3(0.36, 1.05, 0.02),
    new THREE.Vector3(0.46, 0.78, 0.02),
    new THREE.Vector3(0.36, 0.52, 0.02),
    new THREE.Vector3(0.05, 0.43, 0.02),
    new THREE.Vector3(-0.26, 0.52, 0.02)
  ]);
  const cutawayWallGeom = new THREE.TubeGeometry(cutawayWallCurve, 36, 0.25, 18, false);
  cutawayWallGeom.scale(1.0, 1.0, 0.45);
  const cutawayWallMesh = new THREE.Mesh(cutawayWallGeom, roseWallMat);
  jStomach.add(cutawayWallMesh);

  // C. Deep Plum-Mauve Gastric Lumen (Interior Cavity of Stomach)
  const lumenCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.12, 1.10, 0.065),
    new THREE.Vector3(0.34, 1.02, 0.065),
    new THREE.Vector3(0.43, 0.78, 0.065),
    new THREE.Vector3(0.33, 0.53, 0.065),
    new THREE.Vector3(0.04, 0.45, 0.065),
    new THREE.Vector3(-0.28, 0.53, 0.065)
  ]);
  const lumenGeom = new THREE.TubeGeometry(lumenCurve, 36, 0.205, 18, false);
  lumenGeom.scale(1.0, 1.0, 0.36);
  const lumenMesh = new THREE.Mesh(lumenGeom, plumLumenMat);
  jStomach.add(lumenMesh);

  // Wavy gastric rugae contour lines inside the plum lumen
  const rugaePaths = [
    [new THREE.Vector3(0.15, 0.95, 0.145), new THREE.Vector3(0.28, 0.78, 0.145), new THREE.Vector3(0.18, 0.56, 0.145)],
    [new THREE.Vector3(0.32, 0.92, 0.145), new THREE.Vector3(0.42, 0.72, 0.145), new THREE.Vector3(0.25, 0.48, 0.145)],
    [new THREE.Vector3(0.08, 0.46, 0.145), new THREE.Vector3(-0.12, 0.48, 0.145), new THREE.Vector3(-0.24, 0.53, 0.145)]
  ];
  rugaePaths.forEach((pts) => {
    const rCurve = new THREE.CatmullRomCurve3(pts);
    jStomach.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(rCurve.getPoints(20)), darkPlumFoldMat));
  });

  stomachGroup.add(jStomach);
  group.add(stomachGroup);

  // ============================================================================
  // 3. C-SHAPED DUODENUM (CUTAWAY) & HORIZONTAL LOBULATED PANCREAS
  // ============================================================================
  // C-Shaped Duodenum looping from pylorus around left and descending into jejunal hook
  const duodenumGroup = new THREE.Group();
  duodenumGroup.position.set(-explode * 0.25, 0, explode * 0.15);
  duodenumGroup.userData.partInfo = {
    name: 'Duodenum (C-Shaped Proximal Small Intestine)',
    category: 'Chemical Digestion Hub',
    function: 'Receives bile from the gall bladder and pancreatic juice from the pancreas via the hepatopancreatic duct.',
    fact: 'First and shortest (~25 cm) C-shaped segment of the small intestine surrounding the head of the pancreas.',
    pinId: 'small_intestine'
  };

  const duoCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.30, 0.54, 0.02),
    new THREE.Vector3(-0.56, 0.58, 0.02),
    new THREE.Vector3(-0.78, 0.42, 0.02),
    new THREE.Vector3(-0.84, 0.16, 0.02),
    new THREE.Vector3(-0.72, -0.02, 0.02),
    new THREE.Vector3(-0.38, -0.10, 0.01),
    new THREE.Vector3(0.08, -0.14, -0.02),
    new THREE.Vector3(0.24, -0.35, -0.02),
    new THREE.Vector3(0.32, -0.52, 0.02),
    new THREE.Vector3(0.14, -0.58, 0.04),
    new THREE.Vector3(0.02, -0.46, 0.05)
  ]);
  const duoOuter = new THREE.Mesh(new THREE.TubeGeometry(duoCurve, 48, 0.11, 14, false), roseWallMat);
  duoOuter.scale.set(1, 1, 0.55);
  duodenumGroup.add(duoOuter);

  const duoLumen = new THREE.Mesh(new THREE.TubeGeometry(duoCurve, 48, 0.076, 12, false), plumLumenMat);
  duoLumen.position.z = 0.032;
  duoLumen.scale.set(1, 1, 0.42);
  duodenumGroup.add(duoLumen);

  group.add(duodenumGroup);

  // Horizontal Leaf-Shaped Lobulated Pancreas (Nestled in C-loop of Duodenum)
  const pancreasGroup = new THREE.Group();
  pancreasGroup.position.set(explode * 0.2, 0.02, -explode * 0.35);
  pancreasGroup.userData.partInfo = {
    name: 'Pancreas (Lobulated Gland & Main Pancreatic Duct)',
    category: 'Heterocrine Digestive Gland',
    function: 'Secretes alkaline pancreatic juice (trypsinogen, amylase, lipase) via the central pancreatic duct into the duodenum.',
    fact: 'Nestled horizontally inside the C-curve of the duodenum just below the stomach.',
    pinId: 'pancreas'
  };

  // Elongated leaf-shaped pancreas core
  const pancAxisCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.66, 0.18, -0.02),
    new THREE.Vector3(-0.25, 0.14, -0.02),
    new THREE.Vector3(0.22, 0.11, -0.02),
    new THREE.Vector3(0.68, 0.12, -0.02)
  ]);
  const pancCoreGeom = new THREE.TubeGeometry(pancAxisCurve, 28, 0.14, 14, false);
  pancCoreGeom.scale(1.0, 1.05, 0.45);
  const pancCore = new THREE.Mesh(pancCoreGeom, roseWallMat);
  pancreasGroup.add(pancCore);

  // Lobulated acinar surface texture (pebbled pink clusters matching Fig. 2.11)
  for (let i = 0; i < 34; i++) {
    const t = i / 33;
    const pt = pancAxisCurve.getPoint(t);
    const radiusScale = 1.0 - t * 0.45; // wider at head on left, tapering toward tail on right
    const rowY = ((i % 3) - 1) * 0.075 * radiusScale;
    const lobGeom = new THREE.SphereGeometry(0.065 * (0.75 + 0.35 * radiusScale), 10, 10);
    lobGeom.scale(1.25, 0.85, 0.55);
    const lob = new THREE.Mesh(lobGeom, i % 2 === 0 ? roseWallMat : deepRoseMat);
    lob.position.set(pt.x + (i % 2) * 0.02, pt.y + rowY, 0.02);
    pancreasGroup.add(lob);
  }

  // Prominent White-Pink Central Pancreatic Duct (Duct of Wirsung) + Fishbone Tributaries
  const mainPancDuctCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.72, 0.22, 0.055),
    new THREE.Vector3(-0.52, 0.21, 0.055),
    new THREE.Vector3(-0.18, 0.14, 0.055),
    new THREE.Vector3(0.25, 0.11, 0.055),
    new THREE.Vector3(0.58, 0.12, 0.055)
  ]);
  pancreasGroup.add(new THREE.Mesh(new THREE.TubeGeometry(mainPancDuctCurve, 24, 0.02, 8, false), ductMat));

  // Fishbone side-branch ductules
  for (let b = 1; b <= 9; b++) {
    const bt = b / 10;
    const bp = mainPancDuctCurve.getPoint(bt);
    const side = b % 2 === 0 ? 1 : -1;
    const branchCurve = new THREE.LineCurve3(
      bp,
      new THREE.Vector3(bp.x + 0.06, bp.y + side * 0.065, bp.z)
    );
    pancreasGroup.add(new THREE.Mesh(new THREE.TubeGeometry(branchCurve, 4, 0.009, 6, false), ductMat));
  }

  group.add(pancreasGroup);

  // ============================================================================
  // 4. HAUSTRATED LARGE INTESTINE (COLON, CUTAWAY CAECUM, APPENDIX & RECTUM)
  // ============================================================================
  const colonGroup = new THREE.Group();
  colonGroup.position.set(0, -explode * 0.35, 0);
  colonGroup.userData.partInfo = {
    name: 'Large Intestine (Haustrated Colon, Cutaway Caecum, Appendix & Rectum)',
    category: 'Water Absorption & Excretion',
    function: 'Reabsorbs water and electrolytes from undigested residue; stores fecal matter in the rectum before defecation.',
    fact: 'Features sacculated pouches (haustra), a blind pouch (caecum) with the vermiform appendix on the lower left, and the rectum.',
    pinId: 'large_intestine'
  };

  // Helper to build plump haustrated colon segments along a curve
  const addHaustratedSegment = (pts: THREE.Vector3[], numHaustra: number, radius: number, zOffset = 0.08) => {
    const curve = new THREE.CatmullRomCurve3(pts);
    for (let i = 0; i <= numHaustra; i++) {
      const t = i / numHaustra;
      const p = curve.getPoint(t);
      const tangent = curve.getTangent(t);
      const hGeom = new THREE.SphereGeometry(radius, 16, 14);
      hGeom.scale(1.12, 0.86, 0.72);
      const hMesh = new THREE.Mesh(hGeom, i % 2 === 0 ? roseWallMat : deepRoseMat);
      hMesh.position.set(p.x, p.y, p.z + zOffset);
      hMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent.normalize());
      colonGroup.add(hMesh);
    }
  };

  // A. Transverse Colon (Sweeping horizontally across the middle in front of duodenum/jejunum)
  addHaustratedSegment(
    [
      new THREE.Vector3(-0.84, -0.18, 0.06),
      new THREE.Vector3(-0.42, -0.20, 0.09),
      new THREE.Vector3(0.08, -0.21, 0.09),
      new THREE.Vector3(0.52, -0.15, 0.07),
      new THREE.Vector3(0.76, -0.05, 0.05)
    ],
    13,
    0.145,
    0.06
  );

  // B. Upper Ascending Colon (Viewer's left, above cutaway window)
  addHaustratedSegment(
    [
      new THREE.Vector3(-0.86, -0.20, 0.02),
      new THREE.Vector3(-0.86, -0.38, 0.02),
      new THREE.Vector3(-0.86, -0.56, 0.02)
    ],
    4,
    0.14,
    0.04
  );

  // C. Cutaway Lower Ascending Colon & Caecum (Viewer's lower left — exact match to Fig. 2.11!)
  const caecumCutawayCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.86, -0.58, 0.02),
    new THREE.Vector3(-0.85, -0.85, 0.02),
    new THREE.Vector3(-0.78, -1.10, 0.02),
    new THREE.Vector3(-0.62, -1.24, 0.02)
  ]);
  const caecumOuter = new THREE.Mesh(new THREE.TubeGeometry(caecumCutawayCurve, 24, 0.155, 16, false), roseWallMat);
  caecumOuter.scale.set(1, 1, 0.55);
  colonGroup.add(caecumOuter);

  const caecumLumen = new THREE.Mesh(new THREE.TubeGeometry(caecumCutawayCurve, 24, 0.115, 14, false), plumLumenMat);
  caecumLumen.position.z = 0.04;
  caecumLumen.scale.set(1, 1, 0.42);
  colonGroup.add(caecumLumen);

  // Rounded Caecum Blind Pouch Base (Cutaway plum cavity + rose rim)
  const caecumBulbOuter = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 16), roseWallMat);
  caecumBulbOuter.scale.set(1.1, 0.95, 0.55);
  caecumBulbOuter.position.set(-0.62, -1.24, 0.02);
  colonGroup.add(caecumBulbOuter);

  const caecumBulbLumen = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 14), plumLumenMat);
  caecumBulbLumen.scale.set(1.1, 0.95, 0.42);
  caecumBulbLumen.position.set(-0.62, -1.24, 0.06);
  colonGroup.add(caecumBulbLumen);

  // Finger-like Vermiform Appendix hanging off the bottom-right of Caecum
  const appendixCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.52, -1.26, 0.02),
    new THREE.Vector3(-0.48, -1.35, 0.02),
    new THREE.Vector3(-0.42, -1.42, 0.02)
  ]);
  const appendixMesh = new THREE.Mesh(new THREE.TubeGeometry(appendixCurve, 12, 0.032, 10, false), roseWallMat);
  colonGroup.add(appendixMesh);

  // D. Descending Colon & Sigmoid Colon (Viewer's right side sweeping down to bottom center)
  addHaustratedSegment(
    [
      new THREE.Vector3(0.74, -0.14, 0.02),
      new THREE.Vector3(0.72, -0.48, 0.02),
      new THREE.Vector3(0.72, -0.82, 0.02),
      new THREE.Vector3(0.66, -1.12, 0.02),
      new THREE.Vector3(0.45, -1.32, 0.02),
      new THREE.Vector3(0.15, -1.38, 0.02),
      new THREE.Vector3(-0.08, -1.36, 0.02)
    ],
    16,
    0.138,
    0.04
  );

  // E. Rectum & Anal Canal (Vertical terminal segment at bottom center)
  const rectumCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.08, -1.36, 0.02),
    new THREE.Vector3(-0.08, -1.54, 0.02),
    new THREE.Vector3(-0.06, -1.74, 0.02)
  ]);
  const rectumGeom = new THREE.TubeGeometry(rectumCurve, 18, 0.105, 16, false);
  rectumGeom.scale(1.0, 1.0, 0.68);
  const rectumMesh = new THREE.Mesh(rectumGeom, roseWallMat);
  colonGroup.add(rectumMesh);

  group.add(colonGroup);

  // ============================================================================
  // 5. CENTRAL COILED SMALL INTESTINE (JEJUNUM & ILEUM SERPENTINE FOLDS)
  // ============================================================================
  const siGroup = new THREE.Group();
  siGroup.position.set(0, -explode * 0.15, explode * 0.45);
  siGroup.userData.partInfo = {
    name: 'Small Intestine (Coiled Jejunum & Ileum)',
    category: 'Complete Digestion & Villi Absorption',
    function: 'Completes enzymatic breakdown of carbohydrates, proteins, and fats; absorbs nutrients via millions of villi.',
    fact: 'Highly coiled pale-pink tubular canal framed inside the colon and opening into the caecum via the ileocaecal junction.',
    pinId: 'small_intestine'
  };

  // Continuous, tightly packed serpentine intestinal coils filling the central frame (matching Fig. 2.11)
  const serpentineCoils = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.02, -0.46, 0.03),
    new THREE.Vector3(-0.22, -0.44, 0.04),
    new THREE.Vector3(-0.42, -0.62, 0.02),
    new THREE.Vector3(-0.56, -0.42, 0.05),
    new THREE.Vector3(-0.62, -0.76, 0.03),
    new THREE.Vector3(-0.42, -0.92, 0.05),
    new THREE.Vector3(-0.24, -0.68, 0.06),
    new THREE.Vector3(-0.05, -0.88, 0.04),
    new THREE.Vector3(0.12, -0.64, 0.06),
    new THREE.Vector3(0.36, -0.68, 0.03),
    new THREE.Vector3(0.46, -0.52, 0.05),
    new THREE.Vector3(0.48, -0.84, 0.04),
    new THREE.Vector3(0.24, -0.92, 0.06),
    new THREE.Vector3(0.02, -1.08, 0.04),
    new THREE.Vector3(0.34, -1.08, 0.03),
    new THREE.Vector3(0.18, -1.18, 0.05),
    new THREE.Vector3(-0.18, -1.18, 0.04),
    new THREE.Vector3(-0.42, -1.14, 0.03)
  ]);
  const siTubeGeom = new THREE.TubeGeometry(serpentineCoils, 140, 0.098, 16, false);
  siTubeGeom.scale(1.0, 1.0, 0.68);
  const siTubeMesh = new THREE.Mesh(siTubeGeom, palePinkMat);
  siGroup.add(siTubeMesh);

  // Cutaway Terminal Ileum opening into the Caecum (Ileocaecal junction on lower left, as in Fig. 2.11)
  const terminalIleumCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.42, -1.14, 0.03),
    new THREE.Vector3(-0.56, -1.04, 0.03),
    new THREE.Vector3(-0.72, -1.02, 0.03)
  ]);
  const tiOuter = new THREE.Mesh(new THREE.TubeGeometry(terminalIleumCurve, 14, 0.085, 12, false), roseWallMat);
  tiOuter.scale.set(1, 1, 0.55);
  siGroup.add(tiOuter);

  const tiLumen = new THREE.Mesh(new THREE.TubeGeometry(terminalIleumCurve, 14, 0.055, 10, false), plumLumenMat);
  tiLumen.position.z = 0.03;
  tiLumen.scale.set(1, 1, 0.42);
  siGroup.add(tiLumen);

  group.add(siGroup);
}

// 4. STRUCTURE OF STOMATA
function buildStomataModel(group: THREE.Group, opts: ModelOpts) {
  // Pavement Epidermal Cells (Surrounding tiling)
  for (let x = -2; x <= 2; x++) {
    for (let y = -1.5; y <= 1.5; y += 0.8) {
      if (Math.abs(x) < 0.9 && Math.abs(y) < 0.6) continue;
      const epiGeom = new THREE.BoxGeometry(0.75, 0.7, 0.15);
      const epiMat = getMaterial(0x86efac, { ...opts, opacity: 0.55, transparent: true });
      const epi = new THREE.Mesh(epiGeom, epiMat);
      epi.position.set(x * 0.8, y, -0.05);
      group.add(epi);
    }
  }

  // Left & Right Kidney Guard Cells
  const leftTorus = new THREE.TorusGeometry(0.7, 0.25, 16, 32, Math.PI * 0.75);
  const guardMat = getMaterial(0x22c55e, { ...opts, roughness: 0.3, emissive: 0x15803d, emissiveIntensity: 0.35 });
  const leftGuard = new THREE.Mesh(leftTorus, guardMat);
  leftGuard.position.set(-0.35 - opts.explodeFactor * 0.5, 0, 0);
  leftGuard.rotation.z = Math.PI * 0.62;
  leftGuard.name = 'guard_left';
  leftGuard.userData.partInfo = {
    name: 'Left Guard Cell',
    category: 'Stomatal Regulator',
    function: 'Swells with potassium-driven endosmosis to pull the pore open.',
    pinId: 'guard_cells'
  };
  group.add(leftGuard);

  const rightGuard = new THREE.Mesh(leftTorus, guardMat);
  rightGuard.position.set(0.35 + opts.explodeFactor * 0.5, 0, 0);
  rightGuard.rotation.z = -Math.PI * 0.38;
  rightGuard.name = 'guard_right';
  rightGuard.userData.partInfo = {
    name: 'Right Guard Cell',
    category: 'Stomatal Regulator',
    function: 'Thick inner wall resists bulging, forcing curved pore aperture.',
    pinId: 'guard_cells'
  };
  group.add(rightGuard);

  // Central Stomatal Aperture (Glowing ellipse)
  const poreGeom = new THREE.RingGeometry(0.08, 0.16, 24);
  const poreMat = getMaterial(0x064e3b, { emissive: 0x059669, emissiveIntensity: 0.8 });
  const pore = new THREE.Mesh(poreGeom, poreMat);
  pore.position.z = 0.05;
  pore.scale.set(0.7, 1.8, 1);
  pore.userData.partInfo = {
    name: 'Stomatal Aperture / Pore',
    category: 'Gas Exchange Gateway',
    function: 'Allows diffusion of CO2 and cooling transpiration stream.',
    pinId: 'stomatal_pore'
  };
  group.add(pore);

  // Chloroplast beads inside guard cells
  for (let c = 0; c < 10; c++) {
    const angle = (c * Math.PI) / 5 - Math.PI / 2;
    const chloroGeom = new THREE.SphereGeometry(0.065, 12, 12);
    const chloroMat = getMaterial(0x15803d, { emissive: 0x22c55e, emissiveIntensity: 0.7 });
    const chMesh1 = new THREE.Mesh(chloroGeom, chloroMat);
    chMesh1.position.set(-0.65 + Math.cos(angle) * 0.25, Math.sin(angle) * 0.5, 0.12);
    group.add(chMesh1);

    const chMesh2 = new THREE.Mesh(chloroGeom, chloroMat);
    chMesh2.position.set(0.65 - Math.cos(angle) * 0.25, Math.sin(angle) * 0.5, 0.12);
    group.add(chMesh2);
  }
}

// Helper to create organic teardrop flame LatheGeometry with optional vertical color gradient
function createTeardropFlameGeometry(
  maxRadius: number,
  height: number,
  radialSegments = 36,
  colorStops?: Array<{ t: number; color: THREE.Color }>
): THREE.LatheGeometry {
  const profilePoints: THREE.Vector2[] = [];
  const steps = 28;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // 0 = bottom base around wick, 1 = top pointed apex
    // Smooth organic teardrop profile matching NCERT Fig. 6.13:
    // Rounded lower belly peaking around t = 0.34, tapering gracefully to a pointed tip at t = 1.0
    let r = 0;
    if (t > 0 && t < 1) {
      r = maxRadius * Math.pow(Math.sin(t * Math.PI), 0.78) * Math.pow(1 - t * 0.62, 0.95) * 1.42;
    }
    profilePoints.push(new THREE.Vector2(Math.max(0, r), t * height));
  }

  const geom = new THREE.LatheGeometry(profilePoints, radialSegments);

  // Subtle organic S-curve flame tip wave & vertex color gradient
  const pos = geom.attributes.position;
  const colors: number[] = [];
  const tmpColor = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const t = Math.max(0, Math.min(1, vy / height));

    // Slight natural flame taper & gentle lean at the very top tip
    const tipCurve = Math.pow(t, 2.6) * 0.035;
    pos.setX(i, vx + tipCurve);
    pos.setZ(i, vz * 0.92); // Slightly flatter front-to-back for crisp cross-sectional clarity

    if (colorStops && colorStops.length > 0) {
      // Find surrounding stops
      let c0 = colorStops[0];
      let c1 = colorStops[colorStops.length - 1];
      for (let s = 0; s < colorStops.length - 1; s++) {
        if (t >= colorStops[s].t && t <= colorStops[s + 1].t) {
          c0 = colorStops[s];
          c1 = colorStops[s + 1];
          break;
        }
      }
      const localT = c1.t > c0.t ? (t - c0.t) / (c1.t - c0.t) : 0;
      tmpColor.lerpColors(c0.color, c1.color, localT);
      colors.push(tmpColor.r, tmpColor.g, tmpColor.b);
    }
  }

  if (colorStops && colorStops.length > 0) {
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  }
  geom.computeVertexNormals();
  return geom;
}

// 5. CANDLE FLAME (ZONES OF COMBUSTION - Exact NCERT Class 8 Fig. 6.13 High-Fidelity 3D Model)
function buildFlameModel(group: THREE.Group, opts: ModelOpts) {
  const explode = opts.explodeFactor * 0.75;

  // --- 1. WAX CANDLE PILLAR (White with soft ice-blue shading, concave melted rim & front wax drip) ---
  const candleGroup = new THREE.Group();
  candleGroup.position.y = -explode * 0.45;
  candleGroup.userData.partInfo = {
    name: 'Wax Candle (Solid Paraffin Fuel)',
    category: 'Hydrocarbon Fuel Source',
    function: 'Supplies solid paraffin wax that melts and rises up the wick via capillary action.',
    fact: 'Paraffin wax is a mixture of higher alkanes (C20–C40) that melts around 55 °C and vaporizes at ~300 °C.',
    pinId: 'wick_wax'
  };

  // Slightly tapered cylindrical wax body (matches ice-blue shaded white wax cylinder in NCERT diagram)
  const candleGeom = new THREE.CylinderGeometry(0.46, 0.51, 1.62, 48, 24);
  const cPos = candleGeom.attributes.position;
  const candleColors: number[] = [];
  const centerWhite = new THREE.Color(0xf8fafc);
  const edgeIceBlue = new THREE.Color(0xbae6fd);

  for (let i = 0; i < cPos.count; i++) {
    const x = cPos.getX(i);
    const y = cPos.getY(i);
    const z = cPos.getZ(i);
    // Subtle organic hand-molded candle contour
    const radial = Math.sqrt(x * x + z * z);
    if (y > 0.75 && radial > 0.2) {
      // Front dip on the top rim where wax drips down
      const angle = Math.atan2(x, z);
      const frontNotch = Math.exp(-Math.pow(angle, 2) * 8) * 0.055;
      const sideWave = Math.sin(angle * 3) * 0.015;
      cPos.setY(i, y - frontNotch + sideWave);
    }
    // Soft ice-blue shading on the right & outer edges just like the textbook illustration
    const shadeFactor = Math.max(0, Math.min(1, (x / 0.5 + 1) * 0.42 + (1 - Math.abs(z) / 0.5) * 0.25));
    const col = centerWhite.clone().lerp(edgeIceBlue, shadeFactor);
    candleColors.push(col.r, col.g, col.b);
  }
  candleGeom.setAttribute('color', new THREE.Float32BufferAttribute(candleColors, 3));
  candleGeom.computeVertexNormals();

  const candleMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.28,
    metalness: 0.04,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.08,
    wireframe: opts.wireframe,
    transparent: opts.xray,
    opacity: opts.xray ? 0.45 : 1.0
  });
  const candleBody = new THREE.Mesh(candleGeom, candleMat);
  candleBody.position.y = -1.26;
  candleGroup.add(candleBody);

  // Top Melted Wax Cup Rim (Raised wavy lip with front drip notch)
  const rimPoints: THREE.Vector3[] = [];
  const rimSegs = 64;
  for (let i = 0; i <= rimSegs; i++) {
    const theta = (i / rimSegs) * Math.PI * 2;
    const rx = Math.sin(theta) * 0.455;
    const rz = Math.cos(theta) * 0.455;
    const frontDip = Math.exp(-Math.pow(theta - Math.PI * 2 * Math.round(theta / (Math.PI * 2)), 2) * 7) * 0.06;
    const wave = Math.sin(theta * 3) * 0.014;
    rimPoints.push(new THREE.Vector3(rx, -0.45 - frontDip + wave, rz));
  }
  const rimCurve = new THREE.CatmullRomCurve3(rimPoints, true);
  const rimGeom = new THREE.TubeGeometry(rimCurve, 64, 0.028, 12, true);
  const rimMat = getMaterial(0xe0f2fe, {
    ...opts,
    roughness: 0.22,
    emissive: 0x7dd3fc,
    emissiveIntensity: 0.12
  });
  const rimMesh = new THREE.Mesh(rimGeom, rimMat);
  candleGroup.add(rimMesh);

  // Glistening Liquid Molten Wax Pool inside top cup
  const poolGeom = new THREE.CylinderGeometry(0.43, 0.43, 0.04, 36);
  const poolMat = getMaterial(0xdbeafe, {
    ...opts,
    roughness: 0.12,
    metalness: 0.1,
    emissive: 0x93c5fd,
    emissiveIntensity: 0.18
  });
  const poolMesh = new THREE.Mesh(poolGeom, poolMat);
  poolMesh.position.y = -0.47;
  candleGroup.add(poolMesh);

  // Subtle dark contour ripples on the left of the top cup (matching the NCERT illustration strokes)
  const ripplePts1 = [
    new THREE.Vector3(-0.36, -0.44, 0.12),
    new THREE.Vector3(-0.39, -0.44, 0.0),
    new THREE.Vector3(-0.34, -0.44, -0.14)
  ];
  const rippleLineMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.75 });
  candleGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ripplePts1), rippleLineMat));

  // Iconic Melted Wax Drip / Tear Running Down Front Center (Exact match to NCERT diagram!)
  const dripPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.02, -0.49, 0.458),
    new THREE.Vector3(-0.035, -0.58, 0.472),
    new THREE.Vector3(-0.015, -0.68, 0.476),
    new THREE.Vector3(-0.025, -0.78, 0.478)
  ]);
  const dripTubeGeom = new THREE.TubeGeometry(dripPath, 20, 0.024, 10, false);
  const dripMat = getMaterial(0xe0f2fe, {
    ...opts,
    roughness: 0.18,
    emissive: 0xbae6fd,
    emissiveIntensity: 0.15
  });
  const dripTube = new THREE.Mesh(dripTubeGeom, dripMat);
  candleGroup.add(dripTube);

  // Rounded Teardrop Bead at bottom of the wax drip
  const tearGeom = new THREE.SphereGeometry(0.042, 16, 16);
  tearGeom.scale(0.95, 1.35, 0.7);
  const tearBead = new THREE.Mesh(tearGeom, dripMat);
  tearBead.position.set(-0.022, -0.81, 0.478);
  candleGroup.add(tearBead);

  // --- 2. BRAIDED COTTON WICK (Slightly curved dark wick emerging from molten pool) ---
  const wickCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.47, 0),
    new THREE.Vector3(-0.008, -0.34, 0),
    new THREE.Vector3(0.005, -0.21, 0),
    new THREE.Vector3(0.028, -0.11, 0)
  ]);
  const wickGeom = new THREE.TubeGeometry(wickCurve, 20, 0.026, 10, false);
  const wickMat = getMaterial(0x18181b, {
    ...opts,
    roughness: 0.9,
    emissive: 0x27272a,
    emissiveIntensity: 0.2
  });
  const wickMesh = new THREE.Mesh(wickGeom, wickMat);
  candleGroup.add(wickMesh);

  group.add(candleGroup);

  // --- 3. CONCENTRIC TEARDROP FLAME ZONES (Animated Group) ---
  const flameGroup = new THREE.Group();
  flameGroup.name = 'flickering_flame';
  group.add(flameGroup);

  // ZONE A: INNERMOST ZONE OF UNBURNT WAX VAPOURS (BLACK) - Least Hot (~600 °C)
  const innerGroup = new THREE.Group();
  innerGroup.position.set(0, -0.36 - explode * 0.15, 0);
  innerGroup.userData.partInfo = {
    name: 'Innermost Zone of Unburnt Wax Vapours (Black) — Least Hot',
    category: 'Innermost Dark Zone (~600 °C)',
    function: 'Contains unburnt paraffin wax vapours surrounding the wick with zero atmospheric oxygen access.',
    fact: 'Least hot part of the candle flame (~600 °C); no combustion takes place here.',
    pinId: 'inner_dark_zone'
  };

  const innerDarkGeom = createTeardropFlameGeometry(0.125, 0.56, 32, [
    { t: 0.0, color: new THREE.Color(0x090d16) },
    { t: 0.55, color: new THREE.Color(0x1e293b) },
    { t: 1.0, color: new THREE.Color(0x475569) }
  ]);
  const innerDarkMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: opts.xray ? 0.45 : 0.92,
    wireframe: opts.wireframe,
    side: THREE.DoubleSide
  });
  const innerDarkMesh = new THREE.Mesh(innerDarkGeom, innerDarkMat);
  innerGroup.add(innerDarkMesh);
  flameGroup.add(innerGroup);

  // ZONE B: MIDDLE ZONE OF PARTIAL COMBUSTION (YELLOW -> ORANGE -> RED GRADIENT) - Moderately Hot (~1000 °C)
  const middleGroup = new THREE.Group();
  middleGroup.position.set(0, -0.34 + explode * 0.15, 0);
  middleGroup.userData.partInfo = {
    name: 'Middle Zone of Partial Combustion (Yellow) — Moderately Hot',
    category: 'Luminous Middle Zone (~1000 °C)',
    function: 'Limited oxygen causes partial combustion; glowing incandescent carbon particles emit bright yellow-orange light.',
    fact: 'Moderately hot (~1000 °C); deposits black carbon soot if a cool glass plate is held inside it.',
    pinId: 'middle_zone'
  };

  // Inner bright yellow luminous core (lower-middle belly of the flame, matching NCERT illustration)
  const yellowCoreGeom = createTeardropFlameGeometry(0.29, 1.38, 36, [
    { t: 0.0, color: new THREE.Color(0xfef08a) },
    { t: 0.38, color: new THREE.Color(0xfacc15) },
    { t: 0.72, color: new THREE.Color(0xfb923c) },
    { t: 1.0, color: new THREE.Color(0xef4444) }
  ]);
  const yellowCoreMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: opts.xray ? 0.35 : 0.86,
    wireframe: opts.wireframe,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const yellowCoreMesh = new THREE.Mesh(yellowCoreGeom, yellowCoreMat);
  middleGroup.add(yellowCoreMesh);

  // Outer luminous yellow-orange-red shell (smoothly blends from golden yellow at bottom to fiery orange-red at top peak)
  const midOuterGeom = createTeardropFlameGeometry(0.41, 1.84, 40, [
    { t: 0.0, color: new THREE.Color(0xfde047) },
    { t: 0.28, color: new THREE.Color(0xfbbf24) },
    { t: 0.55, color: new THREE.Color(0xf97316) },
    { t: 0.80, color: new THREE.Color(0xef4444) },
    { t: 1.0, color: new THREE.Color(0xdc2626) }
  ]);
  const midOuterMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: opts.xray ? 0.3 : 0.74,
    wireframe: opts.wireframe,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const midOuterMesh = new THREE.Mesh(midOuterGeom, midOuterMat);
  middleGroup.add(midOuterMesh);
  flameGroup.add(middleGroup);

  // ZONE C: OUTER ZONE OF COMPLETE COMBUSTION (BLUE) - Hottest Part (~1400 °C)
  const outerGroup = new THREE.Group();
  outerGroup.position.set(0, -0.38 + explode * 0.45, 0);
  outerGroup.userData.partInfo = {
    name: 'Outer Zone of Complete Combustion (Blue) — Hottest Part',
    category: 'Non-Luminous Outer Zone (~1400 °C)',
    function: 'Plentiful atmospheric oxygen enables complete oxidation of wax vapours into CO2 and water vapour.',
    fact: 'Hottest part of the flame (~1400 °C); goldsmiths blow into this blue zone using a metallic blowpipe.',
    pinId: 'outer_zone'
  };

  // Translucent blue-violet outer combustion sheath enveloping the entire flame
  const outerBlueGeom = createTeardropFlameGeometry(0.49, 2.04, 40, [
    { t: 0.0, color: new THREE.Color(0x60a5fa) },
    { t: 0.35, color: new THREE.Color(0x3b82f6) },
    { t: 0.75, color: new THREE.Color(0x6366f1) },
    { t: 1.0, color: new THREE.Color(0x818cf8) }
  ]);
  const outerBlueMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: opts.xray ? 0.25 : 0.36,
    wireframe: opts.wireframe,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const outerBlueMesh = new THREE.Mesh(outerBlueGeom, outerBlueMat);
  outerGroup.add(outerBlueMesh);

  // Soft outer periwinkle-blue atmospheric glow veil (matches the soft blue-violet halo in the NCERT diagram)
  const haloGeom = createTeardropFlameGeometry(0.55, 2.12, 36, [
    { t: 0.0, color: new THREE.Color(0x93c5fd) },
    { t: 0.5, color: new THREE.Color(0x60a5fa) },
    { t: 1.0, color: new THREE.Color(0xa5b4fc) }
  ]);
  const haloMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: opts.xray ? 0.12 : 0.18,
    wireframe: false,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const haloMesh = new THREE.Mesh(haloGeom, haloMat);
  haloMesh.position.y = -0.02;
  outerGroup.add(haloMesh);

  flameGroup.add(outerGroup);
}

// 6. HUMAN EYE & OPTICAL REFRACTION (Exact High-Fidelity 3D Anatomical Model from 3D Learning)
function buildEyeModel(group: THREE.Group, opts: ModelOpts) {
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
    fact: 'Ciliary muscle contraction releases zonular tension, allowing lens to round up for near vision.',
    pinId: 'lens'
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

// 7. NEURON (NERVE CELL)
function buildNeuronModel(group: THREE.Group, opts: ModelOpts) {
  // Cyton (Soma) - Starburst core
  const cytonGeom = new THREE.DodecahedronGeometry(0.65, 1);
  const cytonMat = getMaterial(0x8b5cf6, { ...opts, roughness: 0.35, emissive: 0x6d28d9, emissiveIntensity: 0.4 });
  const cyton = new THREE.Mesh(cytonGeom, cytonMat);
  cyton.position.set(-1.3, 0.3, 0);
  cyton.userData.partInfo = {
    name: 'Cyton (Cell Body / Soma)',
    category: 'Neuronal Core',
    function: 'Integrates postsynaptic potentials and houses the nucleus and Nissl granules.',
    pinId: 'cyton'
  };
  group.add(cyton);

  // Branching Dendrites
  for (let d = 0; d < 7; d++) {
    const angle = (d * Math.PI * 2) / 7;
    const dCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.3 + Math.cos(angle) * 0.4, 0.3 + Math.sin(angle) * 0.4, 0),
      new THREE.Vector3(-1.3 + Math.cos(angle) * 0.9, 0.3 + Math.sin(angle) * 0.9, (Math.random() - 0.5) * 0.4)
    ]);
    const dGeom = new THREE.TubeGeometry(dCurve, 8, 0.03, 6, false);
    const dMat = getMaterial(0xa78bfa, { emissive: 0x7c3aed, emissiveIntensity: 0.5 });
    const dMesh = new THREE.Mesh(dGeom, dMat);
    group.add(dMesh);
  }

  // Long Axon Core Fiber
  const axonCurve = new THREE.LineCurve3(new THREE.Vector3(-0.7, 0.3, 0), new THREE.Vector3(1.4, -0.2, 0));
  const axonGeom = new THREE.TubeGeometry(axonCurve, 16, 0.045, 8, false);
  const axonMat = getMaterial(0x38bdf8, { emissive: 0x0284c7, emissiveIntensity: 0.7 });
  const axon = new THREE.Mesh(axonGeom, axonMat);
  axon.name = 'pulsing_axon';
  axon.userData.partInfo = {
    name: 'Axon (Conducting Nerve Fiber)',
    category: 'Impulse Conductor',
    function: 'Propagates action potential waves.',
    pinId: 'axon'
  };
  group.add(axon);

  // Myelin Sheath Segments (Schwann cells)
  for (let m = 0; m < 4; m++) {
    const posX = -0.4 + m * 0.5;
    const posY = 0.22 - m * 0.11;
    const sheathGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.36, 16);
    const sheathMat = getMaterial(0xfacc15, { ...opts, roughness: 0.3, emissive: 0xeab308, emissiveIntensity: 0.3 });
    const sheath = new THREE.Mesh(sheathGeom, sheathMat);
    sheath.rotation.z = Math.PI / 2 + 0.22;
    sheath.position.set(posX, posY, 0);
    sheath.userData.partInfo = {
      name: 'Myelin Sheath & Schwann Cell',
      category: 'Lipid Insulator',
      function: 'Speeds up nerve impulses via saltatory jumping.',
      pinId: 'myelin_schwann'
    };
    group.add(sheath);
  }

  // Axon Terminals & Synaptic Knobs
  const knobPositions = [
    new THREE.Vector3(1.6, -0.1, 0.3),
    new THREE.Vector3(1.75, -0.3, 0),
    new THREE.Vector3(1.6, -0.5, -0.3)
  ];
  knobPositions.forEach((pos) => {
    const knobGeom = new THREE.SphereGeometry(0.1, 12, 12);
    const knobMat = getMaterial(0xec4899, { emissive: 0xdb2777, emissiveIntensity: 0.8 });
    const knob = new THREE.Mesh(knobGeom, knobMat);
    knob.position.copy(pos);
    knob.userData.partInfo = {
      name: 'Synaptic Bouton / End Knob',
      category: 'Neurotransmitter Release',
      function: 'Exocytoses acetylcholine into the synaptic cleft.',
      pinId: 'axon_terminals'
    };
    group.add(knob);
  });
}

// 8. RUTHERFORD ALPHA PARTICLE SCATTERING EXPERIMENT
function buildRutherfordModel(group: THREE.Group, opts: ModelOpts) {
  // Ultra-thin Gold Foil Target
  const foilGeom = new THREE.BoxGeometry(0.04, 1.8, 1.4);
  const foilMat = getMaterial(0xeab308, { ...opts, metalness: 0.95, roughness: 0.15, emissive: 0xca8a04, emissiveIntensity: 0.3 });
  const foil = new THREE.Mesh(foilGeom, foilMat);
  foil.userData.partInfo = {
    name: 'Ultra-thin Gold Foil (~100 nm)',
    category: 'Atomic Target',
    function: 'Provides single-layer atomic Coulomb scattering targets.',
    pinId: 'gold_foil'
  };
  group.add(foil);

  // Circular Zinc Sulfide (ZnS) Scintillation Screen Ring
  const screenGeom = new THREE.TorusGeometry(1.6, 0.08, 12, 48, Math.PI * 1.5);
  const screenMat = getMaterial(0x22c55e, { ...opts, emissive: 0x16a34a, emissiveIntensity: 0.6 });
  const screen = new THREE.Mesh(screenGeom, screenMat);
  screen.rotation.z = Math.PI * 0.25;
  screen.userData.partInfo = {
    name: 'Circular ZnS Fluorescent Detector',
    category: 'Particle Detector',
    function: 'Flashes light scintillations upon alpha particle impact.',
    pinId: 'zinc_screen'
  };
  group.add(screen);

  // Alpha Particle Gun / Lead Collimator
  const gunGeom = new THREE.BoxGeometry(0.7, 0.4, 0.4);
  const gunMat = getMaterial(0x475569, { ...opts, metalness: 0.8 });
  const gun = new THREE.Mesh(gunGeom, gunMat);
  gun.position.set(-1.8, 0, 0);
  gun.userData.partInfo = {
    name: 'Alpha Emitter & Lead Collimator',
    category: 'Particle Beam Source',
    function: 'Emits high-energy doubly ionized helium nuclei (He2+).',
    pinId: 'alpha_source'
  };
  group.add(gun);

  // Animated Alpha Particle Beams
  const beamGroup = new THREE.Group();
  beamGroup.name = 'rutherford_alpha_beams';
  // Straight through tracks
  for (let b = 0; b < 6; b++) {
    const yOff = (b - 2.5) * 0.15;
    const beamLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.4, yOff, 0), new THREE.Vector3(1.5, yOff, 0)]),
      new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
    );
    beamGroup.add(beamLine);
  }
  // Deflected tracks
  const def1 = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(1.4, 0.9, 0)]),
    new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.9 })
  );
  beamGroup.add(def1);
  // Rebounding track (180°)
  const rebound = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-1.2, 0.7, 0)]),
    new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 1.0 })
  );
  beamGroup.add(rebound);
  group.add(beamGroup);
}

// 9. STRUCTURE OF A NEPHRON (Stylized Anatomical Model)
function buildNephronModel(group: THREE.Group, opts: ModelOpts) {
  const explode = opts.explodeFactor * 0.7;

  // Renal Cortex & Medulla boundary subtle indicator
  const boundaryGeom = new THREE.PlaneGeometry(3.6, 0.04);
  const boundaryMat = getMaterial(0x475569, { transparent: true, opacity: 0.4 });
  const boundary = new THREE.Mesh(boundaryGeom, boundaryMat);
  boundary.position.set(0, 0.05, -0.3);
  group.add(boundary);

  // Bowman's Capsule (Double-walled cutaway spherical cup with golden sheen)
  const cupGeom = new THREE.SphereGeometry(0.58, 28, 28, 0, Math.PI * 2, 0, Math.PI * (0.65 - opts.explodeFactor * 0.15));
  const cupMat = getMaterial(0xfbbf24, { ...opts, side: THREE.DoubleSide, roughness: 0.25, metalness: 0.2, emissive: 0xd97706, emissiveIntensity: 0.35 });
  const capsule = new THREE.Mesh(cupGeom, cupMat);
  capsule.position.set(-1.1 - explode * 0.75, 1.1 + explode * 0.55, -explode * 0.3);
  capsule.rotation.x = Math.PI * 0.7;
  capsule.userData.partInfo = {
    name: "Bowman's Capsule (Parietal & Visceral Layers)",
    category: 'Ultrafiltration Chamber',
    function: 'Encloses the glomerulus; podocyte slit pores filter blood plasma under high renal pressure.',
    pinId: 'bowmans_capsule'
  };
  group.add(capsule);

  // Glomerulus Capillary Knot inside with high vascular crimson tone
  const glomGeom = new THREE.TorusKnotGeometry(0.25, 0.07, 64, 16, 2, 3);
  const glomMat = getMaterial(0xef4444, { ...opts, metalness: 0.4, roughness: 0.2, emissive: 0xdc2626, emissiveIntensity: 0.85 });
  const glom = new THREE.Mesh(glomGeom, glomMat);
  glom.position.set(-1.1 - explode * 0.35, 1.1 + explode * 0.2, explode * 0.35);
  glom.userData.partInfo = {
    name: 'Glomerulus Capillary Knot',
    category: 'High-Pressure Microvascular Bed',
    function: 'Ultrafiltration driven by hydrostatic pressure differential (~55 mm Hg).',
    pinId: 'bowmans_capsule'
  };
  group.add(glom);

  // Afferent Arteriole (Wider red input vessel entering from renal artery)
  const affPoints = [new THREE.Vector3(-1.8, 1.5, 0), new THREE.Vector3(-1.25, 1.25, 0.1)];
  const affCurve = new THREE.LineCurve3(affPoints[0], affPoints[1]);
  const affGeom = new THREE.TubeGeometry(affCurve, 8, 0.08, 10, false);
  const affMat = getMaterial(0xdc2626, { emissive: 0xb91c1c, emissiveIntensity: 0.6 });
  const affMesh = new THREE.Mesh(affGeom, affMat);
  affMesh.userData.partInfo = {
    name: 'Afferent Arteriole (Wide Lumen)',
    category: 'Arterial Inflow',
    function: 'Brings oxygenated, nitrogenous-rich systemic blood into the glomerulus.',
    pinId: 'bowmans_capsule'
  };
  group.add(affMesh);

  // Efferent Arteriole (Narrower red output vessel creating backpressure)
  const effPoints = [new THREE.Vector3(-1.1, 1.25, -0.1), new THREE.Vector3(-0.7, 1.45, -0.15)];
  const effCurve = new THREE.LineCurve3(effPoints[0], effPoints[1]);
  const effGeom = new THREE.TubeGeometry(effCurve, 8, 0.05, 10, false);
  const effMesh = new THREE.Mesh(effGeom, affMat);
  effMesh.userData.partInfo = {
    name: 'Efferent Arteriole (Narrow Lumen)',
    category: 'Arterial Outflow',
    function: 'Narrow diameter creates bottleneck pressure forcing plasma filtration.',
    pinId: 'bowmans_capsule'
  };
  group.add(effMesh);

  // Proximal Convoluted Tubule (PCT) - Serpentine golden-orange coils with microvilli brush border
  const pctPoints = [
    new THREE.Vector3(-0.9 - explode * 0.4, 0.9, 0),
    new THREE.Vector3(-0.55, 1.15, 0.35),
    new THREE.Vector3(-0.2, 0.85, -0.2),
    new THREE.Vector3(-0.45, 0.55, 0.25),
    new THREE.Vector3(-0.3, 0.15, 0)
  ];
  const pctCurve = new THREE.CatmullRomCurve3(pctPoints, false);
  const pctGeom = new THREE.TubeGeometry(pctCurve, 40, 0.11, 14, false);
  const pctMat = getMaterial(0xf97316, { ...opts, roughness: 0.35, emissive: 0xc2410c, emissiveIntensity: 0.4 });
  const pct = new THREE.Mesh(pctGeom, pctMat);
  pct.userData.partInfo = {
    name: 'Proximal Convoluted Tubule (PCT)',
    category: 'Selective Reabsorption',
    function: 'Cuboidal brush border reabsorbs 100% glucose, amino acids, and 75% NaCl and water.',
    pinId: 'pct'
  };
  group.add(pct);

  // Loop of Henle: Descending Thin Limb (Permeable to water) + Ascending Thick Limb (Active salt pump)
  const desPoints = [
    new THREE.Vector3(-0.3, 0.15, 0),
    new THREE.Vector3(-0.32, -1.35 - explode * 0.5, 0),
    new THREE.Vector3(-0.16, -1.5 - explode * 0.5, 0)
  ];
  const desCurve = new THREE.CatmullRomCurve3(desPoints, false);
  const desGeom = new THREE.TubeGeometry(desCurve, 28, 0.065, 12, false);
  const desMat = getMaterial(0x38bdf8, { ...opts, emissive: 0x0284c7, emissiveIntensity: 0.5 });
  const desMesh = new THREE.Mesh(desGeom, desMat);
  group.add(desMesh);

  const ascPoints = [
    new THREE.Vector3(-0.16, -1.5 - explode * 0.5, 0),
    new THREE.Vector3(0.02, -1.35 - explode * 0.5, 0),
    new THREE.Vector3(0.02, 0.2, 0)
  ];
  const ascCurve = new THREE.CatmullRomCurve3(ascPoints, false);
  const ascGeom = new THREE.TubeGeometry(ascCurve, 28, 0.09, 12, false);
  const ascMat = getMaterial(0x0ea5e9, { ...opts, emissive: 0x0284c7, emissiveIntensity: 0.45 });
  const ascMesh = new THREE.Mesh(ascGeom, ascMat);
  ascMesh.userData.partInfo = {
    name: "Loop of Henle (U-shaped Hairpin)",
    category: 'Countercurrent Multiplier',
    function: 'Generates osmotic gradient in medullary interstitium to produce hypertonic urine.',
    pinId: 'loop_henle'
  };
  group.add(ascMesh);

  // Distal Convoluted Tubule (DCT) - Emerald green convoluted segment
  const dctPoints = [
    new THREE.Vector3(0.02, 0.2, 0),
    new THREE.Vector3(0.35, 0.85, -0.3),
    new THREE.Vector3(0.65, 0.65, 0.2),
    new THREE.Vector3(1.0, 0.95, 0)
  ];
  const dctCurve = new THREE.CatmullRomCurve3(dctPoints, false);
  const dctGeom = new THREE.TubeGeometry(dctCurve, 32, 0.095, 12, false);
  const dctMat = getMaterial(0x10b981, { ...opts, emissive: 0x059669, emissiveIntensity: 0.4 });
  const dct = new THREE.Mesh(dctGeom, dctMat);
  dct.userData.partInfo = {
    name: 'Distal Convoluted Tubule (DCT)',
    category: 'Facultative Balance',
    function: 'Reabsorbs water and sodium conditionally under ADH and Aldosterone.',
    pinId: 'dct'
  };
  group.add(dct);

  // Vertical Collecting Duct with Realistic Tributary Branches
  const cdPoints = [new THREE.Vector3(1.15, 1.45, 0), new THREE.Vector3(1.15, -1.55, 0)];
  const cdCurve = new THREE.CatmullRomCurve3(cdPoints, false);
  const cdGeom = new THREE.TubeGeometry(cdCurve, 20, 0.17, 16, false);
  const cdMat = getMaterial(0x6366f1, { ...opts, roughness: 0.3, emissive: 0x4f46e5, emissiveIntensity: 0.35 });
  const cd = new THREE.Mesh(cdGeom, cdMat);
  cd.userData.partInfo = {
    name: 'Collecting Duct (Tubular Trunk)',
    category: 'Drainage System',
    function: 'Collects concentrated urine from multiple nephrons into the renal pelvis.',
    pinId: 'collecting_duct'
  };
  group.add(cd);

  // Tributary feeder branches from adjacent nephrons
  [0.55, -0.3, -1.0].forEach((branchY) => {
    const brGeom = new THREE.CylinderGeometry(0.07, 0.07, 0.35, 10);
    const brMesh = new THREE.Mesh(brGeom, cdMat);
    brMesh.rotation.z = Math.PI / 3;
    brMesh.position.set(0.98, branchY, 0);
    group.add(brMesh);
  });
}

// 10. HUMAN HEART & CIRCULATION (Exact High-Fidelity 3D Anatomical Model)
function buildHeartModel(group: THREE.Group, opts: ModelOpts) {
  const explode = opts.explodeFactor * 0.85;

  const heartBody = new THREE.Group();
  heartBody.rotation.z = -0.12;
  heartBody.rotation.y = 0.08;
  heartBody.name = 'pulsing_heart';
  group.add(heartBody);

  // --- 1. VENTRICULAR BODY (MYOCARDIUM & APEX) ---
  const ventriclesGroup = new THREE.Group();
  ventriclesGroup.position.set(-explode * 0.25, -explode * 0.35, 0);
  ventriclesGroup.userData.partInfo = {
    name: 'Left & Right Ventricles',
    category: 'Myocardium & Apex',
    function: 'Thick muscular pumping chambers generating systemic arterial pressure (~120 mmHg) and pulmonary circulation.',
    fact: 'Left ventricular wall is ~3x thicker than right; stroke volume is ~70 mL per beat.',
    pinId: 'left_ventricle'
  };

  const ventGeom = new THREE.SphereGeometry(1.05, 36, 32);
  ventGeom.scale(0.92, 1.35, 0.88);

  const vPos = ventGeom.attributes.position;
  for (let i = 0; i < vPos.count; i++) {
    const x = vPos.getX(i);
    const y = vPos.getY(i);
    const z = vPos.getZ(i);

    if (y < 0.2) {
      const taper = Math.max(0.18, 1.0 + y * 0.65);
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

  // --- 3. GREAT VESSELS ---
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

  const cranialBranches = [
    { pos: [-0.08, 1.42 + explode * 0.5, 0.1], angle: 0.18, r: 0.082, len: 0.45 },
    { pos: [0.12, 1.51 + explode * 0.5, -0.02], angle: 0.0, r: 0.072, len: 0.48 },
    { pos: [0.32, 1.44 + explode * 0.5, -0.14], angle: -0.18, r: 0.072, len: 0.44 }
  ];
  cranialBranches.forEach((cb) => {
    const branchGeom = new THREE.CylinderGeometry(cb.r, cb.r, cb.len, 16);
    const branch = new THREE.Mesh(branchGeom, redVesselMat);
    branch.position.set(cb.pos[0], cb.pos[1] + cb.len * 0.45, cb.pos[2]);
    branch.rotation.z = cb.angle;
    aortaGroup.add(branch);

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

  const lpaCurve = new THREE.LineCurve3(
    new THREE.Vector3(0.55, 0.88 + explode * 0.35, 0.08),
    new THREE.Vector3(1.05 + explode * 0.4, 0.88 + explode * 0.35, 0.08)
  );
  const lpa = new THREE.Mesh(new THREE.TubeGeometry(lpaCurve, 12, 0.16, 18, false), blueVesselMat);
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

  // --- 5. INTERNAL VALVES & CHORDAE TENDINEAE ---
  const internalGroup = new THREE.Group();
  internalGroup.position.set(0, 0, 0.05);
  internalGroup.userData.partInfo = {
    name: 'Atrioventricular Valves (Tricuspid & Bicuspid)',
    category: 'Valvular Apparatus',
    function: 'Fibrous cusps anchored by chordae tendineae preventing backflow during systole.',
    fact: 'Sudden closure produces the classic first heart sound (lub / S1).',
    pinId: 'heart_valves'
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

// Helper to generate crisp transparent 2D canvas texture labels in 3D space
function createDiagramLabelPlane(
  lines: Array<{ text: string; font: string; color: string; y: number }>,
  widthWorld: number,
  heightWorld: number,
  canvasW = 256,
  canvasH = 128,
  frontSideOnly = false
): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lines.forEach((line) => {
      ctx.font = line.font;
      ctx.fillStyle = line.color;
      ctx.fillText(line.text, canvasW / 2, line.y);
    });
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: frontSideOnly ? THREE.FrontSide : THREE.DoubleSide
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(widthWorld, heightWorld), mat);
}

// 11. ELECTRIC MOTOR (ARMATURE & COMMUTATOR - Exact Textbook Diagram 3D Model)
function buildMotorModel(group: THREE.Group, opts: ModelOpts) {
  const explode = opts.explodeFactor * 0.75;

  // ============================================================================
  // 1. LEFT (NORTH - RED) & RIGHT (SOUTH - BLUE) CONCAVE BLOCK POLE MAGNETS
  // ============================================================================
  const magDepth = 1.45;
  const magHalfD = magDepth / 2;

  // Left North Pole Shape (Block with concave semi-circular inner cutout on right face)
  const northShape = new THREE.Shape();
  northShape.moveTo(-1.85, -0.78);
  northShape.lineTo(-0.92, -0.78);
  northShape.lineTo(-0.92, -0.52);
  northShape.absarc(-0.92, 0, 0.52, -Math.PI / 2, Math.PI / 2, false);
  northShape.lineTo(-0.92, 0.78);
  northShape.lineTo(-1.85, 0.78);
  northShape.closePath();

  const poleExtrudeOpts = {
    depth: magDepth,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.015,
    bevelThickness: 0.015
  };

  const northGroup = new THREE.Group();
  northGroup.position.set(-explode * 0.55, 0.12, -0.1);
  northGroup.userData.partInfo = {
    name: 'North Magnetic Pole (N)',
    category: 'Permanent Stator Magnet',
    function: 'Red concave pole block generating a uniform horizontal magnetic field.',
    fact: 'Concave cylindrical pole face concentrates radial magnetic flux through the armature loop.',
    pinId: 'magnetic_poles'
  };

  const northMat = getMaterial(0xdf5b5b, {
    ...opts,
    roughness: 0.35,
    metalness: 0.1,
    emissive: 0xb91c1c,
    emissiveIntensity: 0.18
  });
  const northMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(northShape, poleExtrudeOpts), northMat);
  northMesh.position.z = -magHalfD;
  northGroup.add(northMesh);

  // Darker crimson inner concave trough liner for visual depth matching the diagram
  const northTroughGeom = new THREE.CylinderGeometry(0.515, 0.515, magDepth, 28, 1, true, 0, Math.PI);
  const northTroughMat = getMaterial(0xb83b3b, { ...opts, roughness: 0.45, metalness: 0.08, side: THREE.DoubleSide });
  const northTrough = new THREE.Mesh(northTroughGeom, northTroughMat);
  northTrough.rotation.x = Math.PI / 2;
  northTrough.position.set(-0.92, 0, 0);
  northGroup.add(northTrough);

  // "N / North pole" label on front face of North Magnet
  if (!opts.wireframe) {
    const nLabel = createDiagramLabelPlane(
      [
        { text: 'N', font: 'bold 104px Inter, sans-serif', color: '#ffffff', y: 92 },
        { text: 'North pole', font: '600 32px Inter, sans-serif', color: '#271717', y: 182 }
      ],
      0.72,
      0.72,
      256,
      256,
      true
    );
    nLabel.position.set(-1.42, -0.04, magHalfD + 0.022);
    northGroup.add(nLabel);
  }
  group.add(northGroup);

  // Right South Pole Shape (Block with concave semi-circular inner cutout on left face)
  const southShape = new THREE.Shape();
  southShape.moveTo(0.92, -0.78);
  southShape.lineTo(1.85, -0.78);
  southShape.lineTo(1.85, 0.78);
  southShape.lineTo(0.92, 0.78);
  southShape.lineTo(0.92, 0.52);
  southShape.absarc(0.92, 0, 0.52, Math.PI / 2, -Math.PI / 2, false);
  southShape.closePath();

  const southGroup = new THREE.Group();
  southGroup.position.set(explode * 0.55, 0.12, -0.1);
  southGroup.userData.partInfo = {
    name: 'South Magnetic Pole (S)',
    category: 'Permanent Stator Magnet',
    function: 'Blue concave pole block completing the magnetic circuit across the air gap.',
    fact: 'Works with the North pole to sustain a horizontal magnetic field B across the armature.',
    pinId: 'magnetic_poles'
  };

  const southMat = getMaterial(0x5693e8, {
    ...opts,
    roughness: 0.35,
    metalness: 0.1,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.18
  });
  const southMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(southShape, poleExtrudeOpts), southMat);
  southMesh.position.z = -magHalfD;
  southGroup.add(southMesh);

  // Darker cobalt inner concave trough liner
  const southTroughGeom = new THREE.CylinderGeometry(0.515, 0.515, magDepth, 28, 1, true, Math.PI, Math.PI);
  const southTroughMat = getMaterial(0x376cb8, { ...opts, roughness: 0.45, metalness: 0.08, side: THREE.DoubleSide });
  const southTrough = new THREE.Mesh(southTroughGeom, southTroughMat);
  southTrough.rotation.x = Math.PI / 2;
  southTrough.position.set(0.92, 0, 0);
  southGroup.add(southTrough);

  // "S / South pole" label on front face of South Magnet
  if (!opts.wireframe) {
    const sLabel = createDiagramLabelPlane(
      [
        { text: 'S', font: 'bold 104px Inter, sans-serif', color: '#ffffff', y: 92 },
        { text: 'South pole', font: '600 32px Inter, sans-serif', color: '#112238', y: 182 }
      ],
      0.72,
      0.72,
      256,
      256,
      true
    );
    sLabel.position.set(1.42, -0.04, magHalfD + 0.022);
    southGroup.add(sLabel);
  }
  group.add(southGroup);

  // ============================================================================
  // 2. DASHED GREEN MAGNETIC FIELD (B) LINES & DIRECTION ARROW
  // ============================================================================
  const fluxGroup = new THREE.Group();
  fluxGroup.position.set(0, 0.12 + explode * 0.25, -0.1);
  fluxGroup.userData.partInfo = {
    name: 'Magnetic Field Lines (B)',
    category: 'Uniform Magnetic Flux',
    function: 'Horizontal magnetic field lines between the concave North and South poles.',
    fact: 'Interacts with the perpendicular current I in the armature arms to produce Lorentz force F = I(L × B).',
    pinId: 'magnetic_poles'
  };

  const dashMat = new THREE.LineBasicMaterial({ color: 0x2d6a4f, transparent: true, opacity: 0.85 });
  const zRows = [-0.42, -0.26, -0.12, 0.14, 0.28, 0.42];
  zRows.forEach((zPos, rIdx) => {
    for (let d = -4; d <= 3; d++) {
      // Leave clear central window for the bold "<- B" arrow and label
      if ((rIdx === 2 || rIdx === 3) && d >= -2 && d <= 1) continue;
      const xStart = d * 0.14;
      const xEnd = xStart + 0.08;
      const pts = [new THREE.Vector3(xStart, 0, zPos), new THREE.Vector3(xEnd, 0, zPos)];
      fluxGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), dashMat));
    }
  });

  // Central Bold Green Magnetic Field Arrow (<--- B) matching the diagram
  const bArrowMat = getMaterial(0x2d6a4f, { emissive: 0x1b4332, emissiveIntensity: 0.4 });
  const bShaftGeom = new THREE.CylinderGeometry(0.016, 0.016, 0.52, 12);
  bShaftGeom.rotateZ(Math.PI / 2);
  const bShaft = new THREE.Mesh(bShaftGeom, bArrowMat);
  bShaft.position.set(0.04, 0, 0.01);
  fluxGroup.add(bShaft);

  const bHeadGeom = new THREE.ConeGeometry(0.05, 0.13, 14);
  bHeadGeom.rotateZ(Math.PI / 2);
  const bHead = new THREE.Mesh(bHeadGeom, bArrowMat);
  bHead.position.set(-0.24, 0, 0.01);
  fluxGroup.add(bHead);

  if (!opts.wireframe) {
    // Separate compact 'B' badge above arrow and 'Magnetic field' badge below arrow so neither intersects the arrow shaft
    const bTopLabel = createDiagramLabelPlane(
      [{ text: 'B', font: 'bold 76px Inter, sans-serif', color: '#4ade80', y: 64 }],
      0.26,
      0.22,
      128,
      128
    );
    bTopLabel.position.set(0.02, 0.16, 0.01);
    fluxGroup.add(bTopLabel);

    const bBotLabel = createDiagramLabelPlane(
      [{ text: 'Magnetic field', font: '600 34px Inter, sans-serif', color: '#e2e8f0', y: 64 }],
      0.66,
      0.20,
      256,
      96
    );
    bBotLabel.position.set(0.02, -0.15, 0.01);
    fluxGroup.add(bBotLabel);
  }
  group.add(fluxGroup);

  // ============================================================================
  // 3. HORIZONTAL COPPER ARMATURE LOOP, LORENTZ FORCE (F) & ROTATION ARROWS
  // ============================================================================
  const armatureGroup = new THREE.Group();
  armatureGroup.name = 'rotating_motor_armature';
  armatureGroup.position.set(0, 0.12 + explode * 0.4, -0.1);
  group.add(armatureGroup);

  const copperMat = getMaterial(0xe8932c, {
    ...opts,
    metalness: 0.55,
    roughness: 0.25,
    emissive: 0xb45309,
    emissiveIntensity: 0.28
  });

  // Left half of Copper Armature Loop (from Left Commutator neck -> front-left -> back-left -> back-center)
  const leftCoilPts = [
    new THREE.Vector3(-0.13, -0.06, 0.92),
    new THREE.Vector3(-0.13, 0, 0.48),
    new THREE.Vector3(-0.68, 0, 0.48),
    new THREE.Vector3(-0.68, 0, -0.58),
    new THREE.Vector3(0.0, 0, -0.58)
  ];
  // Right half of Copper Armature Loop (from back-center -> back-right -> front-right -> Right Commutator neck)
  const rightCoilPts = [
    new THREE.Vector3(0.0, 0, -0.58),
    new THREE.Vector3(0.68, 0, -0.58),
    new THREE.Vector3(0.68, 0, 0.48),
    new THREE.Vector3(0.13, 0, 0.48),
    new THREE.Vector3(0.13, -0.06, 0.92)
  ];

  // Build crisp mitred/rounded rectangular copper segments
  const buildSegmentedPipe = (pts: THREE.Vector3[], radius: number, mat: THREE.Material) => {
    const pipeGroup = new THREE.Group();
    for (let i = 0; i < pts.length - 1; i++) {
      const segCurve = new THREE.LineCurve3(pts[i], pts[i + 1]);
      const segMesh = new THREE.Mesh(new THREE.TubeGeometry(segCurve, 12, radius, 14, false), mat);
      pipeGroup.add(segMesh);
      const joint = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.04, 14, 14), mat);
      joint.position.copy(pts[i + 1]);
      pipeGroup.add(joint);
    }
    return pipeGroup;
  };

  const coilMeshGroup = new THREE.Group();
  coilMeshGroup.add(buildSegmentedPipe(leftCoilPts, 0.044, copperMat));
  coilMeshGroup.add(buildSegmentedPipe(rightCoilPts, 0.044, copperMat));
  coilMeshGroup.userData.partInfo = {
    name: 'Rectangular Copper Armature Loop',
    category: 'Rotor Conductor Winding',
    function: 'Carries electric current I through the magnetic field B; opposite forces on the left and right arms create rotational torque.',
    fact: 'Left arm carries current away from the front while right arm carries current toward the front.',
    pinId: 'armature_coil'
  };
  armatureGroup.add(coilMeshGroup);

  // Yellow Current-Direction Arrows along the Copper Armature Arms
  const yellowArrowMat = getMaterial(0xfacc15, { emissive: 0xeab308, emissiveIntensity: 0.7 });
  // Left arm arrow pointing backward (-Z)
  const leftCurrCone = new THREE.Mesh(new THREE.ConeGeometry(0.062, 0.14, 12), yellowArrowMat);
  leftCurrCone.rotation.x = -Math.PI / 2;
  leftCurrCone.position.set(-0.68, 0.03, -0.05);
  armatureGroup.add(leftCurrCone);

  // Right arm arrow pointing forward (+Z)
  const rightCurrCone = new THREE.Mesh(new THREE.ConeGeometry(0.062, 0.14, 12), yellowArrowMat);
  rightCurrCone.rotation.x = Math.PI / 2;
  rightCurrCone.position.set(0.68, 0.03, -0.02);
  armatureGroup.add(rightCurrCone);

  // Purple Vertical Lorentz Force Arrows (F), Curved Rotation Arrows, & Label — only visible when Explode / Cross-Section >= 58%
  if (opts.explodeFactor >= 0.58) {
    const forceGroup = new THREE.Group();
    forceGroup.userData.partInfo = {
      name: 'Magnetic Force (Lorentz forces (F = I · L × B))',
      category: 'Electromagnetic Couple',
      function: 'Upward force F on the left arm and downward force F on the right arm create a clockwise turning torque.',
      fact: 'Direction determined by Fleming’s Left-Hand Rule.',
      pinId: 'magnetic_force'
    };
    const purpleForceMat = getMaterial(0x9333ea, { emissive: 0x7e22ce, emissiveIntensity: 0.65 });

    // Left Upward Purple Force Arrow (F)
    const fLeftShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.48, 12), purpleForceMat);
    fLeftShaft.position.set(-0.68, 0.28, -0.32);
    forceGroup.add(fLeftShaft);

    const fLeftHead = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.14, 14), purpleForceMat);
    fLeftHead.position.set(-0.68, 0.55, -0.32);
    forceGroup.add(fLeftHead);

    // Right Downward Purple Force Arrow (F)
    const fRightShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.48, 12), purpleForceMat);
    fRightShaft.position.set(0.68, 0.32, -0.32);
    forceGroup.add(fRightShaft);

    const fRightHead = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.14, 14), purpleForceMat);
    fRightHead.rotation.z = Math.PI;
    fRightHead.position.set(0.68, 0.08, -0.32);
    forceGroup.add(fRightHead);

    // Curved Red Rotation Arrows (matching diagram, offset cleanly from F arrow)
    const redRotMat = getMaterial(0xef4444, { emissive: 0xdc2626, emissiveIntensity: 0.6 });
    const leftArcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.38, 0.36, -0.46),
      new THREE.Vector3(-0.30, 0.50, -0.46),
      new THREE.Vector3(-0.16, 0.58, -0.46)
    ]);
    forceGroup.add(new THREE.Mesh(new THREE.TubeGeometry(leftArcCurve, 14, 0.012, 8, false), redRotMat));
    const leftArcHead = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.09, 10), redRotMat);
    leftArcHead.position.set(-0.14, 0.59, -0.46);
    leftArcHead.rotation.z = -Math.PI * 0.35;
    forceGroup.add(leftArcHead);

    const rightArcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.50, -0.02, -0.20),
      new THREE.Vector3(0.42, -0.16, -0.20),
      new THREE.Vector3(0.28, -0.24, -0.20)
    ]);
    forceGroup.add(new THREE.Mesh(new THREE.TubeGeometry(rightArcCurve, 14, 0.012, 8, false), redRotMat));
    const rightArcHead = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.09, 10), redRotMat);
    rightArcHead.position.set(0.26, -0.25, -0.20);
    rightArcHead.rotation.z = Math.PI * 0.65;
    forceGroup.add(rightArcHead);

    if (!opts.wireframe) {
      const fLabel = createDiagramLabelPlane(
        [
          { text: 'F', font: 'bold 76px Inter, sans-serif', color: '#c084fc', y: 48 },
          { text: 'Magnetic Force (Lorentz forces (F = I · L × B))', font: '600 22px Inter, sans-serif', color: '#e9d5ff', y: 102 }
        ],
        1.15,
        0.32,
        512,
        140
      );
      fLabel.position.set(-0.22, 0.72, -0.32);
      forceGroup.add(fLabel);
    }
    armatureGroup.add(forceGroup);
  }

  // ============================================================================
  // 4. SPLIT-RING COMMUTATOR (TWO GOLDEN-ORANGE HALF-RINGS WITH VERTICAL GAP)
  // ============================================================================
  const commGroup = new THREE.Group();
  commGroup.position.set(0, -0.10, 0.92);
  commGroup.userData.partInfo = {
    name: 'Split-Ring Commutator',
    category: 'Mechanical Current Inverter',
    function: 'Two insulated metallic half-rings that reverse the direction of current through the armature loop every half-turn (180°).',
    fact: 'Ensures both armature arms always experience torque in the same clockwise rotational direction.',
    pinId: 'split_rings'
  };

  // Build C-shaped half-ring using ExtrudeGeometry for thick, crisp textbook commutator halves
  const createCommutatorHalf = (isLeft: boolean) => {
    const rOuter = 0.25;
    const rInner = 0.155;
    const gapAngle = 0.14;
    const startAngle = isLeft ? Math.PI / 2 + gapAngle : -Math.PI / 2 + gapAngle;
    const endAngle = isLeft ? (3 * Math.PI) / 2 - gapAngle : Math.PI / 2 - gapAngle;

    const cShape = new THREE.Shape();
    cShape.absarc(0, 0, rOuter, startAngle, endAngle, false);
    cShape.absarc(0, 0, rInner, endAngle, startAngle, true);
    cShape.closePath();

    const cGeom = new THREE.ExtrudeGeometry(cShape, {
      depth: 0.24,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.008,
      bevelThickness: 0.008
    });
    const halfMesh = new THREE.Mesh(cGeom, copperMat);
    halfMesh.position.z = -0.12;
    return halfMesh;
  };

  const leftCommHalf = createCommutatorHalf(true);
  leftCommHalf.position.x = -explode * 0.18;
  commGroup.add(leftCommHalf);

  const rightCommHalf = createCommutatorHalf(false);
  rightCommHalf.position.x = explode * 0.18;
  commGroup.add(rightCommHalf);

  armatureGroup.add(commGroup);

  // ============================================================================
  // 5. STATIONARY DARK-GREY CARBON BRUSHES (LEFT & RIGHT)
  // ============================================================================
  const brushesGroup = new THREE.Group();
  brushesGroup.position.set(0, 0.02, 0.82 + explode * 0.25);
  brushesGroup.userData.partInfo = {
    name: 'Carbon Contact Brushes',
    category: 'Sliding Electrical Contacts',
    function: 'Stationary graphite blocks pressed against the rotating split-ring commutator to supply current from the battery.',
    fact: 'Graphite is self-lubricating and heat-resistant, maintaining low-friction sliding contact.',
    pinId: 'carbon_brushes'
  };

  const brushMat = getMaterial(0x57534e, {
    ...opts,
    roughness: 0.75,
    metalness: 0.2,
    emissive: 0x292524,
    emissiveIntensity: 0.2
  });
  const brushGeom = new THREE.BoxGeometry(0.24, 0.14, 0.22);

  const leftBrush = new THREE.Mesh(brushGeom, brushMat);
  leftBrush.position.set(-0.37 - explode * 0.3, 0, 0);
  brushesGroup.add(leftBrush);

  const rightBrush = new THREE.Mesh(brushGeom, brushMat);
  rightBrush.position.set(0.37 + explode * 0.3, 0, 0);
  brushesGroup.add(rightBrush);

  group.add(brushesGroup);

  // ============================================================================
  // 6. EXTERNAL CIRCUIT LOOP, CURRENT (I) ARROWS & BOTTOM CYLINDRICAL BATTERY (+ / -)
  // ============================================================================
  const circuitGroup = new THREE.Group();
  circuitGroup.position.set(0, -explode * 0.35, explode * 0.35);
  circuitGroup.userData.partInfo = {
    name: 'DC Battery (+ / -) & External Conducting Circuit (Current I)',
    category: 'DC Power Source',
    function: 'Drives conventional electric current I from the positive (+) battery terminal into the left brush, through the armature, and back via the right brush to the negative (-) terminal.',
    fact: 'Reversing the battery polarity reverses the direction of motor rotation.',
    pinId: 'rotation_shaft'
  };

  const wireMat = getMaterial(0x4b5563, { ...opts, roughness: 0.5, metalness: 0.3 });

  // Left wire: from positive (+) battery terminal to Left Brush
  const leftWireCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.38, -0.78, 1.32),
    new THREE.Vector3(-0.88, -0.78, 1.32),
    new THREE.Vector3(-0.92, -0.68, 1.25),
    new THREE.Vector3(-0.68, 0.02, 0.82),
    new THREE.Vector3(-0.48, 0.02, 0.82)
  ]);
  circuitGroup.add(new THREE.Mesh(new THREE.TubeGeometry(leftWireCurve, 32, 0.024, 10, false), wireMat));

  // Right wire: from Right Brush to negative (-) battery terminal
  const rightWireCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.48, 0.02, 0.82),
    new THREE.Vector3(0.68, 0.02, 0.82),
    new THREE.Vector3(0.92, -0.68, 1.25),
    new THREE.Vector3(0.88, -0.78, 1.32),
    new THREE.Vector3(0.38, -0.78, 1.32)
  ]);
  circuitGroup.add(new THREE.Mesh(new THREE.TubeGeometry(rightWireCurve, 32, 0.024, 10, false), wireMat));

  // Yellow Current (I) Arrows on Left & Right External Wires
  const leftWireArrow = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.12, 12), yellowArrowMat);
  leftWireArrow.position.set(-0.77, -0.28, 1.01);
  leftWireArrow.rotation.z = -0.32;
  leftWireArrow.rotation.x = -0.45;
  circuitGroup.add(leftWireArrow);

  const rightWireArrow = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.12, 12), yellowArrowMat);
  rightWireArrow.position.set(0.82, -0.42, 1.09);
  rightWireArrow.rotation.z = -2.82;
  rightWireArrow.rotation.x = 0.45;
  circuitGroup.add(rightWireArrow);

  if (!opts.wireframe) {
    const currLabel = createDiagramLabelPlane(
      [{ text: 'Current  I', font: 'bold 44px Inter, sans-serif', color: '#facc15', y: 64 }],
      0.46,
      0.22,
      256,
      128
    );
    currLabel.position.set(-1.18, -0.34, 1.05);
    circuitGroup.add(currLabel);
  }

  // Horizontal Cylindrical Battery at bottom front center (0, -0.78, 1.32)
  const batteryGroup = new THREE.Group();
  batteryGroup.position.set(0, -0.78, 1.32);

  // Positive Left Third (Light metallic grey cylinder)
  const posCylGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.24, 24);
  posCylGeom.rotateZ(Math.PI / 2);
  const posCylMat = getMaterial(0x9ca3af, { ...opts, metalness: 0.5, roughness: 0.3 });
  const posCyl = new THREE.Mesh(posCylGeom, posCylMat);
  posCyl.position.x = -0.22;
  batteryGroup.add(posCyl);

  // Dark Negative Right Two-Thirds (Charcoal cylinder)
  const negCylGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.44, 24);
  negCylGeom.rotateZ(Math.PI / 2);
  const negCylMat = getMaterial(0x4b5563, { ...opts, metalness: 0.4, roughness: 0.4 });
  const negCyl = new THREE.Mesh(negCylGeom, negCylMat);
  negCyl.position.x = 0.12;
  batteryGroup.add(negCyl);

  // Positive & Negative End Caps / Nub Terminals
  const terminalMat = getMaterial(0xcbd5e1, { ...opts, metalness: 0.7, roughness: 0.2 });
  const posNubGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.06, 16);
  posNubGeom.rotateZ(Math.PI / 2);
  const posNub = new THREE.Mesh(posNubGeom, terminalMat);
  posNub.position.x = -0.36;
  batteryGroup.add(posNub);

  const negCap = new THREE.Mesh(posNubGeom, terminalMat);
  negCap.position.x = 0.36;
  batteryGroup.add(negCap);

  // "+  -" Symbols on the front of the Battery
  if (!opts.wireframe) {
    const batSymbols = createDiagramLabelPlane(
      [{ text: '+         -', font: 'bold 72px Inter, sans-serif', color: '#ffffff', y: 64 }],
      0.52,
      0.22,
      256,
      128,
      true
    );
    batSymbols.position.set(0, 0, 0.148);
    batteryGroup.add(batSymbols);
  }

  circuitGroup.add(batteryGroup);
  group.add(circuitGroup);
}

// 12. PRISM DISPERSION
function buildPrismModel(group: THREE.Group, opts: ModelOpts) {
  // Triangular Glass Prism (60° equilateral cross-section)
  const prismGeom = new THREE.CylinderGeometry(1.2, 1.2, 1.4, 3, 1, false);
  const prismMat = getMaterial(0xe0f2fe, {
    ...opts,
    transparent: true,
    opacity: 0.45,
    roughness: 0.05,
    metalness: 0.1
  });
  const prism = new THREE.Mesh(prismGeom, prismMat);
  prism.rotation.y = Math.PI / 6;
  prism.userData.partInfo = {
    name: 'Equilateral Glass Prism (A = 60°)',
    category: 'Dispersive Medium',
    function: 'Non-parallel faces cause wavelength-dependent refraction.',
    pinId: 'glass_prism'
  };
  group.add(prism);

  // Incident White Beam
  const incLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-2.2, 0.3, 0), new THREE.Vector3(-0.6, 0.1, 0)]),
    new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 })
  );
  group.add(incLine);

  // Refracted & Dispersed VIBGYOR Spectrum Fan
  const vibgyorColors = [
    { name: 'Red (~700 nm)', hex: 0xef4444, pinId: 'spectrum_red', yEnd: 0.5 },
    { name: 'Orange (~620 nm)', hex: 0xf97316, yEnd: 0.35 },
    { name: 'Yellow (~580 nm)', hex: 0xeab308, yEnd: 0.2 },
    { name: 'Green (~530 nm)', hex: 0x22c55e, yEnd: 0.05 },
    { name: 'Blue (~470 nm)', hex: 0x06b6d4, yEnd: -0.1 },
    { name: 'Indigo (~430 nm)', hex: 0x6366f1, yEnd: -0.25 },
    { name: 'Violet (~400 nm)', hex: 0x8b5cf6, pinId: 'spectrum_violet', yEnd: -0.4 }
  ];

  vibgyorColors.forEach((col) => {
    const rayLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.55, 0, 0),
        new THREE.Vector3(2.2, col.yEnd, 0)
      ]),
      new THREE.LineBasicMaterial({ color: col.hex, linewidth: 2 })
    );
    rayLine.userData.partInfo = {
      name: `Spectral Color: ${col.name}`,
      category: 'Dispersed Wave',
      function: 'Separated by differential refractive index in glass (nv > nr).',
      pinId: col.pinId
    };
    group.add(rayLine);
  });

  // White Projection Screen receiving the spectrum
  const screenGeom = new THREE.BoxGeometry(0.08, 1.4, 0.9);
  const screenMat = getMaterial(0xf8fafc, { ...opts, roughness: 0.8 });
  const screen = new THREE.Mesh(screenGeom, screenMat);
  screen.position.set(2.25, 0.05, 0);
  screen.userData.partInfo = {
    name: 'White Projection Screen',
    category: 'Display Screen',
    function: 'Captures the real, continuous VIBGYOR visible spectrum.',
    pinId: 'spectrum_red'
  };
  group.add(screen);
}

// 13. ELECTROLYSIS OF WATER
function buildElectrolysisModel(group: THREE.Group, opts: ModelOpts) {
  // Beaker / Voltammeter Vessel
  const beakerGeom = new THREE.CylinderGeometry(1.2, 1.2, 1.4, 24, 1, true);
  const beakerMat = getMaterial(0x38bdf8, { ...opts, transparent: true, opacity: 0.35 });
  const beaker = new THREE.Mesh(beakerGeom, beakerMat);
  beaker.position.y = -0.3;
  group.add(beaker);

  // Acidified Electrolyte Liquid
  const liquidGeom = new THREE.CylinderGeometry(1.18, 1.18, 1.1, 24);
  const liquidMat = getMaterial(0x0284c7, { transparent: true, opacity: 0.45 });
  const liquid = new THREE.Mesh(liquidGeom, liquidMat);
  liquid.position.y = -0.4;
  liquid.userData.partInfo = {
    name: 'Acidified Water Electrolyte (H2O + H2SO4)',
    category: 'Electrolyte',
    function: 'Supplies ions to enable electric conduction through water.',
    pinId: 'acidified_electrolyte'
  };
  group.add(liquid);

  // Dual Inverted Test Tubes
  const tubeGeom = new THREE.CylinderGeometry(0.2, 0.2, 1.6, 16);
  const tubeMat = getMaterial(0xe0f2fe, { transparent: true, opacity: 0.4 });

  // Cathode Tube (Hydrogen, 2x volume collected)
  const catTube = new THREE.Mesh(tubeGeom, tubeMat);
  catTube.position.set(-0.55, 0.5, 0);
  catTube.userData.partInfo = {
    name: 'Cathode Tube (Hydrogen Gas - 2 Volumes)',
    category: 'Gas Collection',
    function: 'Reduction produces twice the volume of H2 gas compared to O2.',
    pinId: 'cathode_h2'
  };
  group.add(catTube);

  // Anode Tube (Oxygen, 1x volume collected)
  const anTube = new THREE.Mesh(tubeGeom, tubeMat);
  anTube.position.set(0.55, 0.5, 0);
  anTube.userData.partInfo = {
    name: 'Anode Tube (Oxygen Gas - 1 Volume)',
    category: 'Gas Collection',
    function: 'Oxidation produces 1 volume of O2 gas.',
    pinId: 'anode_o2'
  };
  group.add(anTube);

  // Black Graphite Electrodes inside
  const electGeom = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 12);
  const electMat = getMaterial(0x1e293b, { roughness: 0.85 });
  const elect1 = new THREE.Mesh(electGeom, electMat);
  elect1.position.set(-0.55, -0.1, 0);
  group.add(elect1);

  const elect2 = new THREE.Mesh(electGeom, electMat);
  elect2.position.set(0.55, -0.1, 0);
  elect2.userData.partInfo = {
    name: 'Inert Graphite Carbon Electrodes',
    category: 'Electrodes',
    function: 'Conducts charge without participating chemically.',
    pinId: 'graphite_electrodes'
  };
  group.add(elect2);
}

// 14. MITOCHONDRIA
function buildMitochondriaModel(group: THREE.Group, opts: ModelOpts) {
  const explode = opts.explodeFactor * 0.75;
  // Outer Membrane (Smooth capsule lifting upward in cross-section)
  const outerGeom = new THREE.CapsuleGeometry(0.9, 1.8, 16, 24);
  const outerMat = getMaterial(0xd97706, { ...opts, transparent: true, opacity: Math.max(0.2, 0.45 - explode * 0.2), roughness: 0.3 });
  const outer = new THREE.Mesh(outerGeom, outerMat);
  outer.rotation.z = Math.PI / 2;
  outer.position.set(0, explode * 0.65, -explode * 0.35);
  outer.userData.partInfo = {
    name: 'Outer Mitochondrial Membrane',
    category: 'Porin Envelope',
    function: 'Freely permeable to ions via porin channels.',
    pinId: 'outer_membrane'
  };
  group.add(outer);

  // Inner Folded Cristae Shells
  const cristaeGroup = new THREE.Group();
  for (let c = -4; c <= 4; c++) {
    const foldGeom = new THREE.TorusGeometry(0.65, 0.08, 8, 24, Math.PI * 0.8);
    const foldMat = getMaterial(0xf59e0b, { emissive: 0xd97706, emissiveIntensity: 0.6 });
    const fold = new THREE.Mesh(foldGeom, foldMat);
    fold.position.set(c * (0.22 + explode * 0.08), 0, 0);
    fold.rotation.y = Math.PI / 2;
    cristaeGroup.add(fold);
  }
  cristaeGroup.userData.partInfo = {
    name: 'Inner Membrane Cristae Folds',
    category: 'Respiratory Scaffold',
    function: 'Houses ETC complexes I–IV and F0-F1 ATP synthase.',
    pinId: 'inner_cristae'
  };
  group.add(cristaeGroup);

  // Oxysome particles (ATP synthase knobs)
  for (let p = 0; p < 12; p++) {
    const oxyGeom = new THREE.SphereGeometry(0.05, 8, 8);
    const oxyMat = getMaterial(0x22c55e, { emissive: 0x16a34a, emissiveIntensity: 0.8 });
    const oxy = new THREE.Mesh(oxyGeom, oxyMat);
    oxy.position.set((p - 5.5) * (0.16 + explode * 0.06), 0.4 + explode * 0.3, (Math.random() - 0.5) * 0.3);
    group.add(oxy);
  }
}

// 15. BACTERIOPHAGE VIRUS
function buildBacteriophageModel(group: THREE.Group, opts: ModelOpts) {
  // Icosahedral Capsid Head
  const headGeom = new THREE.IcosahedronGeometry(0.85, 1);
  const headMat = getMaterial(0x8b5cf6, { ...opts, roughness: 0.25, metalness: 0.4, emissive: 0x7c3aed, emissiveIntensity: 0.4 });
  const head = new THREE.Mesh(headGeom, headMat);
  head.position.y = 1.1;
  head.userData.partInfo = {
    name: 'Icosahedral Capsid Head',
    category: 'Viral Genome Shell',
    function: 'Encloses ~170 kb of double-stranded genomic DNA.',
    pinId: 'capsid_head'
  };
  group.add(head);

  // Collar Disc
  const collarGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.08, 16);
  const collarMat = getMaterial(0xec4899, { emissive: 0xdb2777, emissiveIntensity: 0.5 });
  const collar = new THREE.Mesh(collarGeom, collarMat);
  collar.position.y = 0.45;
  collar.userData.partInfo = {
    name: 'Collar & Whisker Region',
    category: 'Head-Tail Connector',
    function: 'Regulates attachment and assembly.',
    pinId: 'collar'
  };
  group.add(collar);

  // Contractile Cylindrical Tail Sheath
  const sheathGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.9, 16);
  const sheathMat = getMaterial(0x38bdf8, { ...opts, metalness: 0.5, emissive: 0x0284c7, emissiveIntensity: 0.3 });
  const sheath = new THREE.Mesh(sheathGeom, sheathMat);
  sheath.position.y = -0.05;
  sheath.userData.partInfo = {
    name: 'Contractile Tail Sheath',
    category: 'Syringe Mechanism',
    function: 'Contracts to inject DNA through host peptidoglycan wall.',
    pinId: 'contractile_sheath'
  };
  group.add(sheath);

  // Hexagonal Base Plate
  const plateGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 6);
  const plateMat = getMaterial(0xf59e0b, { metalness: 0.8 });
  const plate = new THREE.Mesh(plateGeom, plateMat);
  plate.position.y = -0.55;
  plate.userData.partInfo = {
    name: 'Hexagonal Base Plate & Spikes',
    category: 'Docking Base',
    function: 'Anchors onto host cell receptors.',
    pinId: 'base_plate'
  };
  group.add(plate);

  // 6 Jointed Tail Fibers
  for (let f = 0; f < 6; f++) {
    const angle = (f * Math.PI * 2) / 6;
    const fiberPoints = [
      new THREE.Vector3(Math.cos(angle) * 0.35, -0.55, Math.sin(angle) * 0.35),
      new THREE.Vector3(Math.cos(angle) * 0.8, -0.9, Math.sin(angle) * 0.8),
      new THREE.Vector3(Math.cos(angle) * 1.25, -1.4, Math.sin(angle) * 1.25)
    ];
    const fiberCurve = new THREE.CatmullRomCurve3(fiberPoints, false);
    const fiberGeom = new THREE.TubeGeometry(fiberCurve, 8, 0.035, 6, false);
    const fiberMat = getMaterial(0xa855f7, { emissive: 0x9333ea, emissiveIntensity: 0.5 });
    const fiberMesh = new THREE.Mesh(fiberGeom, fiberMat);
    group.add(fiberMesh);
  }
}

// 16. DNA DOUBLE HELIX
function buildDNAModel(group: THREE.Group, opts: ModelOpts) {
  const steps = 36;
  const height = 3.6;
  const radius = 0.85;
  const strand1: THREE.Vector3[] = [];
  const strand2: THREE.Vector3[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * Math.PI * 2 * 2.5;
    const y = (t - 0.5) * height;
    const x1 = Math.cos(a) * radius;
    const z1 = Math.sin(a) * radius;
    const x2 = Math.cos(a + Math.PI) * radius;
    const z2 = Math.sin(a + Math.PI) * radius;

    strand1.push(new THREE.Vector3(x1, y, z1));
    strand2.push(new THREE.Vector3(x2, y, z2));

    // Base pair rungs
    if (i % 2 === 0 && i < steps) {
      const isAT = (i / 2) % 2 === 0;
      const col = isAT ? 0xf43f5e : 0x10b981;
      const rungGeom = new THREE.CylinderGeometry(0.04, 0.04, radius * 2, 8);
      const rungMat = getMaterial(col, { emissive: col, emissiveIntensity: 0.5 });
      const rung = new THREE.Mesh(rungGeom, rungMat);
      rung.position.set(0, y, 0);
      rung.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x1, 0, z1).normalize());
      group.add(rung);
    }
  }

  const tube1 = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(strand1), 64, 0.08, 8, false),
    getMaterial(0x6366f1, { ...opts, emissive: 0x4f46e5, emissiveIntensity: 0.4 })
  );
  tube1.position.x = -opts.explodeFactor * 0.45;
  tube1.userData.partInfo = {
    name: 'Sugar-Phosphate Backbone (5′ to 3′)',
    category: 'Antiparallel Strand',
    function: 'Negative phosphodiester polymer framework.',
    pinId: 'backbone_5_3'
  };
  group.add(tube1);

  const tube2 = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(strand2), 64, 0.08, 8, false),
    getMaterial(0xa855f7, { ...opts, emissive: 0x9333ea, emissiveIntensity: 0.4 })
  );
  tube2.position.x = opts.explodeFactor * 0.45;
  tube2.userData.partInfo = {
    name: 'Complementary Strand (3′ to 5′)',
    category: 'Antiparallel Strand',
    function: 'Provides complementary base pair pairing template.',
    pinId: 'backbone_3_5'
  };
  group.add(tube2);
}

// 17. ANTIBODY MOLECULE (H2L2)
function buildAntibodyModel(group: THREE.Group, opts: ModelOpts) {
  const explode = opts.explodeFactor * 0.65;
  // Heavy Chains (Long central Y-shape)
  const leftHeavy = [new THREE.Vector3(-1.1, 1.2, 0), new THREE.Vector3(-0.25, 0.2, 0), new THREE.Vector3(-0.25, -1.2, 0)];
  const lhMesh = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(leftHeavy), 24, 0.09, 8, false),
    getMaterial(0x8b5cf6, { ...opts, emissive: 0x7c3aed, emissiveIntensity: 0.4 })
  );
  lhMesh.position.set(-explode * 0.3, 0, 0);
  lhMesh.userData.partInfo = {
    name: 'Heavy Chains (H Chains, ~50 kDa)',
    category: 'Immunoglobulin Backbone',
    function: 'Possesses 1 variable domain (VH) and 3 constant domains (CH).',
    pinId: 'heavy_chain'
  };
  group.add(lhMesh);

  const rightHeavy = [new THREE.Vector3(1.1, 1.2, 0), new THREE.Vector3(0.25, 0.2, 0), new THREE.Vector3(0.25, -1.2, 0)];
  const rhMesh = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rightHeavy), 24, 0.09, 8, false),
    getMaterial(0x8b5cf6, { ...opts, emissive: 0x7c3aed, emissiveIntensity: 0.4 })
  );
  rhMesh.position.set(explode * 0.3, 0, 0);
  group.add(rhMesh);

  // Light Chains (Shorter outer branches)
  const leftLight = [new THREE.Vector3(-1.3, 1.3, 0.1), new THREE.Vector3(-0.45, 0.35, 0.1)];
  const llMesh = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(leftLight), 16, 0.075, 8, false),
    getMaterial(0x06b6d4, { ...opts, emissive: 0x0891b2, emissiveIntensity: 0.4 })
  );
  llMesh.position.set(-explode * 0.7, explode * 0.35, explode * 0.2);
  llMesh.userData.partInfo = {
    name: 'Light Chains (L Chains, ~25 kDa)',
    category: 'Outer Arm Segment',
    function: 'Contributes to the hypervariable antigen-binding pocket.',
    pinId: 'light_chain'
  };
  group.add(llMesh);

  const rightLight = [new THREE.Vector3(1.3, 1.3, 0.1), new THREE.Vector3(0.45, 0.35, 0.1)];
  const rlMesh = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rightLight), 16, 0.075, 8, false),
    getMaterial(0x06b6d4, { ...opts, emissive: 0x0891b2, emissiveIntensity: 0.4 })
  );
  rlMesh.position.set(explode * 0.7, explode * 0.35, explode * 0.2);
  group.add(rlMesh);

  // Disulfide (-S-S-) bridges (Golden spheres)
  [
    new THREE.Vector3(0, 0.2, 0),
    new THREE.Vector3(-0.7, 0.7, 0.05),
    new THREE.Vector3(0.7, 0.7, 0.05)
  ].forEach((pos) => {
    const sGeom = new THREE.SphereGeometry(0.065, 12, 12);
    const sMat = getMaterial(0xeab308, { emissive: 0xca8a04, emissiveIntensity: 0.8 });
    const sMesh = new THREE.Mesh(sGeom, sMat);
    sMesh.position.copy(pos);
    group.add(sMesh);
  });
}

// 18. pBR322 CLONING VECTOR
function buildPBR322Model(group: THREE.Group, opts: ModelOpts) {
  // Circular Double Plasmid Ring
  const ringGeom = new THREE.TorusGeometry(1.3, 0.08, 16, 64);
  const ringMat = getMaterial(0x94a3b8, { ...opts, metalness: 0.7 });
  const ring = new THREE.Mesh(ringGeom, ringMat);
  group.add(ring);

  // Colored Cassette Segments:
  // ampR (Ampicillin resistance - Emerald)
  const ampGeom = new THREE.TorusGeometry(1.3, 0.12, 16, 32, Math.PI * 0.5);
  const ampMat = getMaterial(0x10b981, { emissive: 0x059669, emissiveIntensity: 0.7 });
  const amp = new THREE.Mesh(ampGeom, ampMat);
  amp.rotation.z = Math.PI * 0.75;
  amp.userData.partInfo = {
    name: 'ampR (Ampicillin Resistance Gene)',
    category: 'Selectable Marker',
    function: 'Contains PstI and PvuI cloning sites.',
    pinId: 'ampr_gene'
  };
  group.add(amp);

  // tetR (Tetracycline resistance - Amber)
  const tetGeom = new THREE.TorusGeometry(1.3, 0.12, 16, 32, Math.PI * 0.45);
  const tetMat = getMaterial(0xf59e0b, { emissive: 0xd97706, emissiveIntensity: 0.7 });
  const tet = new THREE.Mesh(tetGeom, tetMat);
  tet.rotation.z = -Math.PI * 0.2;
  tet.userData.partInfo = {
    name: 'tetR (Tetracycline Resistance Gene)',
    category: 'Selectable Marker',
    function: 'Contains BamHI and SalI restriction sites.',
    pinId: 'tetr_gene'
  };
  group.add(tet);

  // ori (Origin of replication - Blue)
  const oriGeom = new THREE.TorusGeometry(1.3, 0.14, 16, 24, Math.PI * 0.35);
  const oriMat = getMaterial(0x0284c7, { emissive: 0x0369a1, emissiveIntensity: 0.8 });
  const ori = new THREE.Mesh(oriGeom, oriMat);
  ori.rotation.z = -Math.PI * 0.85;
  ori.userData.partInfo = {
    name: 'ori (Origin of Replication)',
    category: 'Replication Control',
    function: 'Initiates plasmid replication and copy number.',
    pinId: 'ori_site'
  };
  group.add(ori);
}

// 19. CRYSTAL UNIT CELLS (SC, BCC, FCC)
function buildUnitCellModel(group: THREE.Group, opts: ModelOpts) {
  const type = opts.unitCellType || 'BCC';
  const a = 1.8;
  const halfA = a / 2;

  // Bounding Cube Frame
  const boxGeom = new THREE.BoxGeometry(a, a, a);
  const edges = new THREE.EdgesGeometry(boxGeom);
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 }));
  group.add(line);

  // 8 Corner Atoms (Shared 1/8 each)
  const cornerPositions = [
    [-halfA, -halfA, -halfA],
    [-halfA, -halfA, halfA],
    [-halfA, halfA, -halfA],
    [-halfA, halfA, halfA],
    [halfA, -halfA, -halfA],
    [halfA, -halfA, halfA],
    [halfA, halfA, -halfA],
    [halfA, halfA, halfA]
  ];

  const cornerMat = getMaterial(0x06b6d4, { ...opts, metalness: 0.6, roughness: 0.2, emissive: 0x0891b2, emissiveIntensity: 0.4 });
  cornerPositions.forEach((pos) => {
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), cornerMat);
    sphere.position.set(pos[0], pos[1], pos[2]);
    sphere.userData.partInfo = {
      name: 'Corner Lattice Atom (1/8th contribution)',
      category: 'Lattice Node',
      function: 'Shared among 8 contiguous unit cells.',
      pinId: 'corner_atoms'
    };
    group.add(sphere);
  });

  // Body-Center Atom (BCC)
  if (type === 'BCC') {
    const centerMat = getMaterial(0xef4444, { ...opts, metalness: 0.8, emissive: 0xdc2626, emissiveIntensity: 0.7 });
    const centerAtom = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 20), centerMat);
    centerAtom.userData.partInfo = {
      name: 'Body-Center Atom (100% contribution)',
      category: 'BCC Center',
      function: 'Resides wholly inside unit cell (Z = 2).',
      pinId: 'body_center_atom'
    };
    group.add(centerAtom);
  }

  // Face-Center Atoms (FCC)
  if (type === 'FCC') {
    const facePositions = [
      [0, 0, halfA],
      [0, 0, -halfA],
      [0, halfA, 0],
      [0, -halfA, 0],
      [halfA, 0, 0],
      [-halfA, 0, 0]
    ];
    const faceMat = getMaterial(0x10b981, { ...opts, metalness: 0.8, emissive: 0x059669, emissiveIntensity: 0.7 });
    facePositions.forEach((pos) => {
      const faceAtom = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 16), faceMat);
      faceAtom.position.set(pos[0], pos[1], pos[2]);
      faceAtom.userData.partInfo = {
        name: 'Face-Center Atom (1/2 contribution)',
        category: 'FCC Face Node',
        function: 'Shared across 2 adjacent unit cells (Z = 4).',
        pinId: 'face_center_atoms'
      };
      group.add(faceAtom);
    });
  }
}

// 20. ELECTRIC TRANSFORMER
function buildTransformerModel(group: THREE.Group, opts: ModelOpts) {
  // Laminated Soft-Iron Closed Core
  const coreShape = new THREE.Shape();
  coreShape.moveTo(-1.6, -1.2);
  coreShape.lineTo(1.6, -1.2);
  coreShape.lineTo(1.6, 1.2);
  coreShape.lineTo(-1.6, 1.2);
  coreShape.closePath();

  const hole = new THREE.Path();
  hole.moveTo(-0.9, -0.6);
  hole.lineTo(0.9, -0.6);
  hole.lineTo(0.9, 0.6);
  hole.lineTo(-0.9, 0.6);
  hole.closePath();
  coreShape.holes.push(hole);

  const extrudeSettings = { depth: 0.5, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
  const coreGeom = new THREE.ExtrudeGeometry(coreShape, extrudeSettings);
  const coreMat = getMaterial(0x475569, { ...opts, metalness: 0.8, roughness: 0.35 });
  const core = new THREE.Mesh(coreGeom, coreMat);
  core.position.z = -0.25;
  core.userData.partInfo = {
    name: 'Laminated Soft-Iron Core',
    category: 'Magnetic Circuit',
    function: 'Suppresses wasteful circulating eddy currents via insulating varnish.',
    pinId: 'laminated_core'
  };
  group.add(core);

  // Primary Coil Windings (Left limb)
  const primGroup = new THREE.Group();
  for (let w = -4; w <= 4; w++) {
    const turnGeom = new THREE.TorusGeometry(0.4, 0.045, 8, 24);
    const primMat = getMaterial(0xf59e0b, { metalness: 0.9, emissive: 0xd97706, emissiveIntensity: 0.4 });
    const turn = new THREE.Mesh(turnGeom, primMat);
    turn.position.set(-1.25, w * 0.1, 0);
    turn.rotation.x = Math.PI / 2;
    primGroup.add(turn);
  }
  primGroup.userData.partInfo = {
    name: 'Primary Coil (Np Turns)',
    category: 'Input Induction',
    function: 'Alternating input current generates varying magnetic flux.',
    pinId: 'primary_coil'
  };
  group.add(primGroup);

  // Secondary Coil Windings (Right limb)
  const secGroup = new THREE.Group();
  for (let w = -6; w <= 6; w++) {
    const turnGeom = new THREE.TorusGeometry(0.4, 0.035, 8, 24);
    const secMat = getMaterial(0x38bdf8, { metalness: 0.9, emissive: 0x0284c7, emissiveIntensity: 0.5 });
    const turn = new THREE.Mesh(turnGeom, secMat);
    turn.position.set(1.25, w * 0.075, 0);
    turn.rotation.x = Math.PI / 2;
    secGroup.add(turn);
  }
  secGroup.userData.partInfo = {
    name: 'Secondary Coil (Ns Turns)',
    category: 'Output Induction',
    function: 'Mutual magnetic flux induces stepped-up/down voltage.',
    pinId: 'secondary_coil'
  };
  group.add(secGroup);
}

// --- Dynamic Continuous Animations for Models ---

function updateNCERTModelAnimation(renderType: string, group: THREE.Group, time: number) {
  if (renderType === 'ncert_motor') {
    const armature = group.getObjectByName('rotating_motor_armature');
    if (armature) {
      // Gentle clockwise torque rocking oscillation so the armature loop, F arrows, and commutator gap stay clear and legible
      armature.rotation.z = -0.12 * Math.sin(time * 2.4);
    }
  } else if (renderType === 'ncert_heart' || renderType === 'heart') {
    const heart = group.getObjectByName('pulsing_heart');
    if (heart) {
      // Natural 2-stage cardiac contraction (lub-dub cycle: atrial kick then strong ventricular systole)
      const heartRatePhase = (time * 4.5) % (Math.PI * 2);
      const systole = Math.pow(Math.sin(heartRatePhase), 8) * 0.065;
      const atrialKick = Math.pow(Math.sin(heartRatePhase + 0.4), 12) * 0.035;
      const s = 1 + systole + atrialKick;
      heart.scale.set(s, s * 0.98, s);
    }
  } else if (renderType === 'ncert_eye' || renderType === 'eye') {
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
  } else if (renderType === 'ncert_circuit') {
    const bulb = group.getObjectByName('glowing_bulb');
    if (bulb) {
      const glow = 0.85 + 0.15 * Math.sin(time * 6);
      bulb.scale.set(glow, glow, glow);
    }
  } else if (renderType === 'ncert_flame') {
    const flame = group.getObjectByName('flickering_flame');
    if (flame) {
      const stretchY = 1 + 0.028 * Math.sin(time * 6.5) + 0.012 * Math.cos(time * 13.0);
      const breatheX = 1 - 0.014 * Math.sin(time * 6.5);
      flame.scale.set(breatheX, stretchY, breatheX);
      flame.rotation.z = 0.018 * Math.sin(time * 4.2);
    }
  } else if (renderType === 'ncert_neuron') {
    const axon = group.getObjectByName('pulsing_axon');
    if (axon && axon instanceof THREE.Mesh && axon.material instanceof THREE.MeshStandardMaterial) {
      axon.material.emissiveIntensity = 0.5 + 0.5 * Math.sin(time * 5);
    }
  }
}
