import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MachineComponent } from '../types';

interface AdvancedLabRendererProps {
  renderType: 'ev_powertrain' | 'jet_engine' | 'robot_arm' | 'microchip_motherboard';
  throttle: number; // 0 to 1
  exploded: number; // 0 to 1
  selectedComponentId: string | null;
  onSelectComponent: (componentId: string) => void;
  afterburner?: boolean;
}

export const AdvancedLabRenderer: React.FC<AdvancedLabRendererProps> = ({
  renderType,
  throttle,
  exploded,
  selectedComponentId,
  onSelectComponent,
  afterburner = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const machineGroupRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Dynamic moving parts refs
  const fanGroupRef = useRef<THREE.Group | null>(null);
  const wheelsRef = useRef<THREE.Mesh[]>([]);
  const flameMeshRef = useRef<THREE.Mesh | null>(null);
  const robotJointsRef = useRef<THREE.Group[]>([]);

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 720;
    const height = mount.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      100
    );
    if (renderType === 'ev_powertrain') {
      camera.position.set(0, 3.65, 1.85);
    } else {
      camera.position.set(2.8, 2.0, 4.2);
    }
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
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

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(6, 10, 6);
    scene.add(mainLight);

    const blueRimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    blueRimLight.position.set(-6, -2, -6);
    scene.add(blueRimLight);

    const amberLight = new THREE.DirectionalLight(0xf59e0b, 0.8);
    amberLight.position.set(0, -4, 4);
    scene.add(amberLight);

    // Floor Grid Helper & Holographic Stage Rings
    const grid = new THREE.GridHelper(8, 16, 0x0284c7, 0x1e293b);
    grid.position.y = -1.2;
    scene.add(grid);

    // Holographic Scanner Rings
    const ringOuterGeom = new THREE.RingGeometry(2.4, 2.45, 64);
    const ringOuterMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const ringOuter = new THREE.Mesh(ringOuterGeom, ringOuterMat);
    ringOuter.rotation.x = Math.PI / 2;
    ringOuter.position.y = -1.18;
    scene.add(ringOuter);

    const ringInnerGeom = new THREE.RingGeometry(1.8, 1.83, 48);
    const ringInnerMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const ringInner = new THREE.Mesh(ringInnerGeom, ringInnerMat);
    ringInner.rotation.x = Math.PI / 2;
    ringInner.position.y = -1.18;
    scene.add(ringInner);

    // Coordinate tick markers
    const ticksGeom = new THREE.BufferGeometry();
    const tickVerts: number[] = [];
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      const r1 = 2.35;
      const r2 = 2.45;
      tickVerts.push(Math.cos(angle) * r1, -1.18, Math.sin(angle) * r1);
      tickVerts.push(Math.cos(angle) * r2, -1.18, Math.sin(angle) * r2);
    }
    ticksGeom.setAttribute('position', new THREE.Float32BufferAttribute(tickVerts, 3));
    const ticksLine = new THREE.LineSegments(
      ticksGeom,
      new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 })
    );
    scene.add(ticksLine);

    // Floating Quantum Dust Particles
    const particleCount = 60;
    const pGeom = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 7;
      pPos[i + 1] = (Math.random() - 0.5) * 4;
      pPos[i + 2] = (Math.random() - 0.5) * 7;
    }
    pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x67e8f9,
      size: 0.04,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeom, pMat);
    scene.add(particles);

    // Machine Group
    const machineGroup = new THREE.Group();
    machineGroupRef.current = machineGroup;
    scene.add(machineGroup);

    // Build Specific Machine
    buildMachineScene(renderType, machineGroup, {
      fanGroupRef,
      wheelsRef,
      flameMeshRef,
      robotJointsRef
    });

    // Resize Handler with ResizeObserver
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

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(mount);
    window.addEventListener('resize', handleResize);
    requestAnimationFrame(handleResize);

    // Animation Loop
    let lastTime = performance.now();
    const animate = () => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      timeRef.current += dt;

      // Animate based on throttle
      if (renderType === 'jet_engine' && fanGroupRef.current) {
        fanGroupRef.current.rotation.z += (1.0 + throttle * 15.0) * dt;
        if (flameMeshRef.current) {
          const flameScale = afterburner ? 1.5 + Math.random() * 0.4 : 0.6 + throttle * 0.8;
          flameMeshRef.current.scale.set(flameScale, flameScale, flameScale * 1.5);
          flameMeshRef.current.visible = throttle > 0.05 || afterburner;
        }
      } else if (renderType === 'ev_powertrain') {
        const wheelRotSpeed = throttle * 18.0 * dt;
        wheelsRef.current.forEach((wheel) => {
          wheel.rotation.y -= wheelRotSpeed;
        });
      } else if (renderType === 'robot_arm' && robotJointsRef.current.length >= 3) {
        // Kinematic oscillating sequence
        const cycleSpeed = 0.5 + throttle * 2.0;
        const angle1 = Math.sin(timeRef.current * cycleSpeed) * 0.5;
        const angle2 = Math.cos(timeRef.current * cycleSpeed * 0.8) * 0.4;
        const angle3 = Math.sin(timeRef.current * cycleSpeed * 1.2) * 0.6;
        robotJointsRef.current[0].rotation.y = angle1;
        robotJointsRef.current[1].rotation.z = angle2;
        robotJointsRef.current[2].rotation.z = angle3;
      }

      renderer.render(scene, camera);
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
  }, [renderType]);

  // Handle Explode updates
  useEffect(() => {
    if (!machineGroupRef.current) return;
    updateExplodedOffsets(machineGroupRef.current, renderType, exploded);
  }, [exploded, renderType]);

  // Mouse & Touch drag Orbit
  const handleDragStart = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: clientX, y: clientY };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current || !machineGroupRef.current) return;
    const dx = clientX - prevMouseRef.current.x;
    const dy = clientY - prevMouseRef.current.y;

    machineGroupRef.current.rotation.y += dx * 0.008;
    machineGroupRef.current.rotation.x += dy * 0.008;
    prevMouseRef.current = { x: clientX, y: clientY };
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
  };

  const onMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !machineGroupRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(machineGroupRef.current.children, true);

    if (intersects.length > 0) {
      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj && !obj.userData?.componentId && obj.parent) {
        obj = obj.parent;
      }
      if (obj?.userData?.componentId) {
        onSelectComponent(obj.userData.componentId);
      }
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!cameraRef.current) return;
      cameraRef.current.position.z = Math.max(1.8, Math.min(8.0, cameraRef.current.position.z + e.deltaY * 0.002));
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
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={handleDragEnd}
      onClick={onClick}
    >
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
};

// Builder implementations
function buildMachineScene(
  renderType: string,
  group: THREE.Group,
  refs: {
    fanGroupRef: React.MutableRefObject<THREE.Group | null>;
    wheelsRef: React.MutableRefObject<THREE.Mesh[]>;
    flameMeshRef: React.MutableRefObject<THREE.Mesh | null>;
    robotJointsRef: React.MutableRefObject<THREE.Group[]>;
  }
) {
  // Clear previous refs
  refs.wheelsRef.current = [];
  refs.robotJointsRef.current = [];

  if (renderType === 'ev_powertrain') {
    buildEVChassis(group, refs.wheelsRef);
  } else if (renderType === 'jet_engine') {
    buildJetTurbofan(group, refs.fanGroupRef, refs.flameMeshRef);
  } else if (renderType === 'robot_arm') {
    buildRobotArm(group, refs.robotJointsRef);
  } else if (renderType === 'microchip_motherboard') {
    buildMotherboard(group);
  }
}

// Helper: Generate procedural tire tread texture so the 4 wide radial tires match the photo
function createTireTreadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#1c1f24';
    ctx.fillRect(0, 0, 256, 256);

    // Circumferential grooves (vertical bands across cylinder UV)
    ctx.fillStyle = '#0d0f12';
    [52, 102, 152, 202].forEach((x) => {
      ctx.fillRect(x, 0, 8, 256);
    });

    // Lateral tread blocks and sipes
    ctx.strokeStyle = '#111318';
    ctx.lineWidth = 3;
    for (let y = 0; y < 256; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(52, y + 5);
      ctx.moveTo(60, y + 3);
      ctx.lineTo(102, y);
      ctx.moveTo(110, y);
      ctx.lineTo(152, y + 4);
      ctx.moveTo(160, y + 4);
      ctx.lineTo(202, y);
      ctx.moveTo(210, y + 5);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 3);
  return tex;
}

// 1. Next-Gen Hybrid-Electric Automotive Rolling Chassis (Matching Reference Image)
function buildEVChassis(group: THREE.Group, wheelsRef: React.MutableRefObject<THREE.Mesh[]>) {
  // Shared PBR Materials
  const castAlumMat = new THREE.MeshStandardMaterial({
    color: 0xd8dee9,
    metalness: 0.78,
    roughness: 0.26
  });
  const machinedSteelMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.88,
    roughness: 0.2
  });
  const darkGunmetalMat = new THREE.MeshStandardMaterial({
    color: 0x333842,
    metalness: 0.65,
    roughness: 0.38
  });
  const matteCoverMat = new THREE.MeshStandardMaterial({
    color: 0x22252a,
    metalness: 0.25,
    roughness: 0.65
  });
  const batteryCaseMat = new THREE.MeshStandardMaterial({
    color: 0x2d3139,
    metalness: 0.55,
    roughness: 0.42
  });
  const exhaustSteelMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    metalness: 0.92,
    roughness: 0.18
  });
  const hvOrangeMat = new THREE.MeshStandardMaterial({
    color: 0xff7700,
    emissive: 0xff5500,
    emissiveIntensity: 0.38,
    roughness: 0.28,
    metalness: 0.15
  });

  // ============================================================================
  // SUBSYSTEM 1: FRONT HYBRID ENGINE, TRANSMISSION & FRONT SUBFRAME (+X Side)
  // ============================================================================
  const frontMotorGroup = new THREE.Group();
  frontMotorGroup.name = 'comp_front_motor';
  frontMotorGroup.userData = { componentId: 'front_motor' };

  // Front Aluminum Subframe Side Rails & Crossmembers
  [-0.44, 0.44].forEach((zSide) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.08, 0.09), castAlumMat);
    rail.position.set(1.25, -0.08, zSide);
    frontMotorGroup.add(rail);

    // Flared rear subframe mounting horns (seen at x ~ 0.75, z ~ +-0.48)
    const horn = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.07, 0.12), castAlumMat);
    horn.position.set(0.76, -0.06, zSide * 1.12);
    horn.rotation.y = zSide > 0 ? 0.22 : -0.22;
    frontMotorGroup.add(horn);
  });

  // Front Radiator / Crash Cross-Struts at extreme right (+X = 1.74..1.84)
  const frontBumperBar = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 1.32), castAlumMat);
  frontBumperBar.position.set(1.82, 0.02, 0);
  frontMotorGroup.add(frontBumperBar);

  const frontInnerBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 1.18), machinedSteelMat);
  frontInnerBar.position.set(1.71, 0.0, 0);
  frontMotorGroup.add(frontInnerBar);

  // Engine Cylinder Block & Cast Aluminum Crankcase (underneath cover)
  const engineBlock = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.28, 0.56), castAlumMat);
  engineBlock.position.set(1.32, 0.02, 0.02);
  frontMotorGroup.add(engineBlock);

  // Sculpted Matte Charcoal Acoustic Engine Cover on Top (Matches right side of image)
  const engineCover = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.14, 0.62), matteCoverMat);
  engineCover.position.set(1.36, 0.21, 0.03);
  frontMotorGroup.add(engineCover);

  // Molded V-ribs and oil cap on engine cover
  for (let i = -2; i <= 2; i++) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.025, 0.04), darkGunmetalMat);
    rib.position.set(1.35, 0.285, 0.03 + i * 0.09);
    rib.rotation.y = i * 0.08;
    frontMotorGroup.add(rib);
  }
  const oilCap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16), matteCoverMat);
  oilCap.position.set(1.48, 0.29, 0.22);
  frontMotorGroup.add(oilCap);

  // Black intake / coolant hose curving over top-left of engine
  const hoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.12, 0.24, -0.34),
    new THREE.Vector3(1.22, 0.28, -0.22),
    new THREE.Vector3(1.38, 0.26, -0.18)
  ]);
  const hoseMesh = new THREE.Mesh(
    new THREE.TubeGeometry(hoseCurve, 16, 0.035, 10, false),
    matteCoverMat
  );
  frontMotorGroup.add(hoseMesh);

  // Longitudinal Die-Cast Aluminum Hybrid Planetary Transmission (x = 0.34 to 1.05)
  const bellHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.34, 20), castAlumMat);
  bellHousing.rotation.z = Math.PI / 2;
  bellHousing.position.set(0.92, 0.06, -0.02);
  frontMotorGroup.add(bellHousing);

  const gearBoxMain = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.24, 0.28), castAlumMat);
  gearBoxMain.position.set(0.58, 0.06, -0.03);
  frontMotorGroup.add(gearBoxMain);

  // Transmission cast stiffening ribs
  for (let xRib = 0.38; xRib <= 0.82; xRib += 0.09) {
    const gRib = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.27, 0.31), machinedSteelMat);
    gRib.position.set(xRib, 0.06, -0.03);
    frontMotorGroup.add(gRib);
  }

  // Front Shock Towers & Upper A-Arm Suspension Domes (x = 1.28, z = +-0.56)
  [-1, 1].forEach((dir) => {
    const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.18, 20), castAlumMat);
    dome.position.set(1.28, 0.14, dir * 0.56);
    frontMotorGroup.add(dome);

    // Sculpted Cast-Aluminum Upper Wishbone Arch
    const wishboneCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.08, 0.16, dir * 0.48),
      new THREE.Vector3(1.28, 0.22, dir * 0.78),
      new THREE.Vector3(1.48, 0.16, dir * 0.48)
    ]);
    const wishbone = new THREE.Mesh(
      new THREE.TubeGeometry(wishboneCurve, 16, 0.035, 10, false),
      castAlumMat
    );
    frontMotorGroup.add(wishbone);
  });

  group.add(frontMotorGroup);

  // ============================================================================
  // SUBSYSTEM 2: OFFSET HIGH-VOLTAGE LITHIUM-ION BATTERY PACK (Bottom Center)
  // ============================================================================
  const battGroup = new THREE.Group();
  battGroup.name = 'comp_battery_pack';
  battGroup.userData = { componentId: 'battery_pack' };

  // Main Dark Anthracite Stamped Metal Enclosure (Offset at z = +0.46, x = -0.14)
  const battBaseFlange = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.04, 0.64), darkGunmetalMat);
  battBaseFlange.position.set(-0.14, -0.12, 0.46);
  battGroup.add(battBaseFlange);

  const battBody = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.18, 0.54), batteryCaseMat);
  battBody.position.set(-0.14, -0.02, 0.46);
  battGroup.add(battBody);

  // Raised stamped structural lid panels on the battery pack
  const lidPanelL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.44), darkGunmetalMat);
  lidPanelL.position.set(-0.34, 0.08, 0.46);
  battGroup.add(lidPanelL);

  const lidPanelR = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.03, 0.44), darkGunmetalMat);
  lidPanelR.position.set(0.02, 0.08, 0.46);
  battGroup.add(lidPanelR);

  // Longitudinal stamped ribs on the battery cover
  [-0.1, 0.0, 0.1].forEach((zOff) => {
    const stampRib = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.018, 0.035), matteCoverMat);
    stampRib.position.set(0.02, 0.098, 0.46 + zOff);
    battGroup.add(stampRib);
  });

  // Perimeter mounting tabs & bolt bosses
  [-0.42, -0.14, 0.14].forEach((xBolt) => {
    [-0.31, 0.31].forEach((zBolt) => {
      const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.06, 10), castAlumMat);
      boss.position.set(xBolt, -0.1, 0.46 + zBolt);
      battGroup.add(boss);
    });
  });

  // Right-side High-Voltage Terminal Junction Box on Battery Pack
  const battJunction = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.22), matteCoverMat);
  battJunction.position.set(0.28, -0.01, 0.46);
  battGroup.add(battJunction);

  group.add(battGroup);

  // ============================================================================
  // SUBSYSTEM 3: REAR MULTI-LINK SUBFRAME, DRIVESHAFT & EXHAUST (-X Side)
  // ============================================================================
  const rearMotorGroup = new THREE.Group();
  rearMotorGroup.name = 'comp_rear_motor';
  rearMotorGroup.userData = { componentId: 'rear_motor' };

  // Central Longitudinal Carbon/Steel Propeller Shaft (Driveshaft)
  const propShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 1.52, 16), darkGunmetalMat);
  propShaft.rotation.z = Math.PI / 2;
  propShaft.position.set(-0.38, 0.02, -0.03);
  rearMotorGroup.add(propShaft);

  // Driveshaft universal joint couplings & center bearing collar
  [-1.02, -0.32, 0.32].forEach((xJoint) => {
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.07, 16), machinedSteelMat);
    collar.rotation.z = Math.PI / 2;
    collar.position.set(xJoint, 0.02, -0.03);
    rearMotorGroup.add(collar);
  });

  // Rear Differential Housing (Center of Rear Subframe)
  const rearDiff = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.26), castAlumMat);
  rearDiff.position.set(-1.18, 0.02, -0.02);
  rearMotorGroup.add(rearDiff);

  // Rear Left & Right Axle Half-Shafts
  const rearAxleShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 1.85, 14), darkGunmetalMat);
  rearAxleShaft.rotation.x = Math.PI / 2;
  rearAxleShaft.position.set(-1.18, 0.0, 0);
  rearMotorGroup.add(rearAxleShaft);

  // Sculpted Die-Cast Aluminum Rear Multi-Link Subframe Cradle
  [-1.38, -0.98].forEach((xBeam) => {
    const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 1.18), castAlumMat);
    crossBeam.position.set(xBeam, 0.06, 0);
    rearMotorGroup.add(crossBeam);
  });

  [-0.52, 0.52].forEach((zSide) => {
    const sideMember = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.08, 0.14), castAlumMat);
    sideMember.position.set(-1.18, 0.07, zSide);
    rearMotorGroup.add(sideMember);

    // Subframe circular rubber/aluminum mounting bushings (4 corner bosses)
    [-1.48, -0.84].forEach((xMount) => {
      const bushingOuter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.075, 0.08, 18),
        castAlumMat
      );
      bushingOuter.position.set(xMount, 0.06, zSide * 1.18);
      rearMotorGroup.add(bushingOuter);

      const bushingCore = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.09, 14),
        matteCoverMat
      );
      bushingCore.position.set(xMount, 0.06, zSide * 1.18);
      rearMotorGroup.add(bushingCore);
    });
  });

  // Diagonal V-brace connecting rear subframe to center tunnel
  [-1, 1].forEach((dir) => {
    const vBrace = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.05), darkGunmetalMat);
    vBrace.position.set(-0.82, -0.02, dir * 0.18);
    vBrace.rotation.y = dir * 0.48;
    rearMotorGroup.add(vBrace);
  });

  // Exhaust Pipe & Catalytic Converters (From engine manifold along driveshaft)
  const exhaustCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.02, -0.04, 0.24),
    new THREE.Vector3(0.75, -0.04, 0.24),
    new THREE.Vector3(0.45, -0.04, 0.22),
    new THREE.Vector3(0.22, -0.03, 0.02),
    new THREE.Vector3(-0.95, -0.04, -0.02),
    new THREE.Vector3(-1.55, -0.02, -0.02)
  ]);
  const exhaustPipe = new THREE.Mesh(
    new THREE.TubeGeometry(exhaustCurve, 28, 0.03, 10, false),
    exhaustSteelMat
  );
  rearMotorGroup.add(exhaustPipe);

  // Two Catalytic Converter Canisters on Front Exhaust Pipe (seen at x ~ 0.46 and 0.86)
  [0.46, 0.86].forEach((xCat) => {
    const catCanister = new THREE.Mesh(
      new THREE.CylinderGeometry(0.068, 0.068, 0.18, 16),
      exhaustSteelMat
    );
    catCanister.rotation.z = Math.PI / 2;
    catCanister.position.set(xCat, -0.04, 0.23);
    rearMotorGroup.add(catCanister);
  });

  // Large Transverse Brushed Stainless-Steel Exhaust Muffler at Rear (-X = -1.72)
  const rearMuffler = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.92, 24),
    exhaustSteelMat
  );
  rearMuffler.rotation.x = Math.PI / 2;
  rearMuffler.position.set(-1.72, 0.02, 0.04);
  rearMotorGroup.add(rearMuffler);

  // Twin Curved Exhaust Tailpipes (Left & Right Rear Exits)
  [-1, 1].forEach((dir) => {
    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.68, 0.02, dir * 0.42),
      new THREE.Vector3(-1.72, 0.02, dir * 0.62),
      new THREE.Vector3(-1.92, 0.02, dir * 0.65)
    ]);
    const tailPipe = new THREE.Mesh(
      new THREE.TubeGeometry(tailCurve, 14, 0.028, 10, false),
      exhaustSteelMat
    );
    rearMotorGroup.add(tailPipe);
  });

  group.add(rearMotorGroup);

  // ============================================================================
  // SUBSYSTEM 4: SIGNATURE BRIGHT-ORANGE HIGH-VOLTAGE HARNESS & INVERTER
  // ============================================================================
  const invGroup = new THREE.Group();
  invGroup.name = 'comp_inverter';
  invGroup.userData = { componentId: 'inverter' };

  // Rear Finned Aluminum Power Control Unit / Charger mounted atop rear muffler (-X = -1.78, Z = -0.32)
  const rearPCU = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.28), castAlumMat);
  rearPCU.position.set(-1.78, 0.22, -0.32);
  invGroup.add(rearPCU);

  // Dual Bright-Orange High-Voltage Connector Blocks on Rear PCU
  [-0.27, -0.37].forEach((zPlug) => {
    const orangePlug = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.06, 0.065), hvOrangeMat);
    orangePlug.position.set(-1.69, 0.25, zPlug);
    invGroup.add(orangePlug);
  });

  // Front Hybrid Motor High-Voltage Orange Connector Block (on upper-left of transmission)
  const frontHVBlock = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.11), hvOrangeMat);
  frontHVBlock.position.set(0.76, 0.16, -0.24);
  frontHVBlock.rotation.y = 0.15;
  invGroup.add(frontHVBlock);

  // 1. Main Thick Orange High-Voltage Trunk Cable (sweeping from rear PCU around bottom-left wheel to center tunnel and diagonally up to front transmission)
  const mainHVCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.65, 0.24, -0.27),
    new THREE.Vector3(-1.60, 0.18, 0.15),
    new THREE.Vector3(-1.56, 0.12, 0.62),
    new THREE.Vector3(-1.12, 0.11, 0.64),
    new THREE.Vector3(-0.96, 0.09, 0.42),
    new THREE.Vector3(-0.86, 0.08, 0.08),
    new THREE.Vector3(-0.24, 0.08, 0.04),
    new THREE.Vector3(0.08, 0.14, -0.52),
    new THREE.Vector3(0.28, 0.18, -0.54),
    new THREE.Vector3(0.54, 0.17, -0.38),
    new THREE.Vector3(0.68, 0.16, -0.24)
  ]);
  const mainHVCable = new THREE.Mesh(
    new THREE.TubeGeometry(mainHVCurve, 48, 0.036, 12, false),
    hvOrangeMat
  );
  invGroup.add(mainHVCable);

  // 2. Secondary Orange HV Harness from Rear Subframe along Center Tunnel
  const rearBranchCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.75, 0.24, -0.38),
    new THREE.Vector3(-1.82, 0.18, -0.54),
    new THREE.Vector3(-1.35, 0.14, -0.52),
    new THREE.Vector3(-1.02, 0.12, -0.44),
    new THREE.Vector3(-0.96, 0.09, -0.14),
    new THREE.Vector3(-0.28, 0.09, -0.14),
    new THREE.Vector3(0.05, 0.14, -0.58)
  ]);
  const rearBranchCable = new THREE.Mesh(
    new THREE.TubeGeometry(rearBranchCurve, 36, 0.022, 10, false),
    hvOrangeMat
  );
  invGroup.add(rearBranchCable);

  // 3. Upper-Right Twin Parallel Orange Lines (from top-center junction to front-left shock tower and around front of engine)
  [-0.03, 0.03].forEach((offsetZ) => {
    const upperFrontCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.12, 0.16, -0.58 + offsetZ),
      new THREE.Vector3(0.55, 0.15, -0.50 + offsetZ),
      new THREE.Vector3(0.96, 0.15, -0.48 + offsetZ),
      new THREE.Vector3(1.18, 0.20, -0.36 + offsetZ),
      new THREE.Vector3(1.58, 0.22, -0.32 + offsetZ),
      new THREE.Vector3(1.62, 0.22, 0.28 + offsetZ),
      new THREE.Vector3(1.42, 0.20, 0.42 + offsetZ)
    ]);
    const upperFrontCable = new THREE.Mesh(
      new THREE.TubeGeometry(upperFrontCurve, 36, 0.016, 8, false),
      hvOrangeMat
    );
    invGroup.add(upperFrontCable);
  });

  // 4. Offset Battery Pack Twin Parallel Orange HV Cables (from battery pack right side to front-right suspension & engine)
  [-0.04, 0.04].forEach((offsetZ) => {
    const battFeedCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.30, 0.0, 0.46 + offsetZ),
      new THREE.Vector3(0.68, 0.02, 0.48 + offsetZ),
      new THREE.Vector3(1.02, 0.06, 0.46 + offsetZ),
      new THREE.Vector3(1.25, 0.15, 0.42 + offsetZ),
      new THREE.Vector3(1.42, 0.20, 0.42 + offsetZ)
    ]);
    const battFeedCable = new THREE.Mesh(
      new THREE.TubeGeometry(battFeedCurve, 24, 0.017, 8, false),
      hvOrangeMat
    );
    invGroup.add(battFeedCable);
  });

  // Orange Harness Mounting Brackets / Junction Clips
  [
    [0.08, 0.16, -0.58],
    [0.96, 0.15, -0.48],
    [1.02, 0.06, 0.46]
  ].forEach(([bx, by, bz]) => {
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.11), hvOrangeMat);
    clip.position.set(bx, by, bz);
    invGroup.add(clip);
  });

  group.add(invGroup);

  // ============================================================================
  // SUBSYSTEM 5: 4 WIDE TREADED RADIAL TIRES, DISC BRAKES & SUSPENSION ARMS
  // ============================================================================
  const treadTexture = createTireTreadTexture();
  const tireMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: treadTexture,
    roughness: 0.82,
    metalness: 0.08
  });
  const sidewallMat = new THREE.MeshStandardMaterial({
    color: 0x181a1f,
    roughness: 0.75,
    metalness: 0.1
  });

  // 4 Wheel Coordinates: Rear Left/Right at X = -1.18, Front Left/Right at X = +1.28
  const wheelPositions: [number, number, number][] = [
    [-1.18, 0.0, -0.98],
    [-1.18, 0.0, 0.98],
    [1.28, 0.0, -0.98],
    [1.28, 0.0, 0.98]
  ];

  wheelPositions.forEach((pos, idx) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(pos[0], pos[1], pos[2]);

    // Wide Performance Radial Tire (Cylinder axis aligned with Z via rotation.x = Math.PI / 2)
    const tireGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.38, 32);
    const tire = new THREE.Mesh(tireGeom, [tireMat, sidewallMat, sidewallMat]);
    tire.rotation.x = Math.PI / 2;
    wheelGroup.add(tire);

    // Multi-Spoke Alloy Rim & Ventilated Brake Rotor inside wheel
    const rimGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.39, 20);
    const rim = new THREE.Mesh(rimGeom, machinedSteelMat);
    rim.rotation.x = Math.PI / 2;
    wheelGroup.add(rim);

    // Ventilated Disc Brake Rotor (inboard side)
    const zInboard = pos[2] > 0 ? -0.14 : 0.14;
    const rotorGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.04, 24);
    const rotor = new THREE.Mesh(rotorGeom, castAlumMat);
    rotor.rotation.x = Math.PI / 2;
    rotor.position.set(0, 0, zInboard);
    wheelGroup.add(rotor);

    // Silver-Grey Forged Brake Caliper
    const caliperGeom = new THREE.BoxGeometry(0.14, 0.11, 0.09);
    const caliper = new THREE.Mesh(caliperGeom, castAlumMat);
    caliper.position.set(pos[0] > 0 ? -0.14 : 0.14, 0.06, zInboard * 1.15);
    wheelGroup.add(caliper);

    // Lower Cast Suspension Control Arm linking wheel hub to subframe
    const armGeom = new THREE.BoxGeometry(0.12, 0.04, 0.36);
    const arm = new THREE.Mesh(armGeom, castAlumMat);
    arm.position.set(0, -0.05, pos[2] > 0 ? -0.28 : 0.28);
    wheelGroup.add(arm);

    wheelGroup.name = `comp_suspension_brakes_${idx}`;
    wheelGroup.userData = { componentId: 'suspension_brakes' };

    wheelsRef.current.push(tire);
    group.add(wheelGroup);
  });
}

// 2. High-Bypass Turbofan Jet Engine
function buildJetTurbofan(
  group: THREE.Group,
  fanRef: React.MutableRefObject<THREE.Group | null>,
  flameRef: React.MutableRefObject<THREE.Mesh | null>
) {
  // Outer Nacelle Cowling (Cutaway view)
  const cowlGeom = new THREE.CylinderGeometry(1.4, 1.25, 3.4, 32, 1, true, 0, Math.PI * 1.55);
  const cowlMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.8,
    roughness: 0.25,
    side: THREE.DoubleSide
  });
  const cowl = new THREE.Mesh(cowlGeom, cowlMat);
  cowl.rotation.x = Math.PI / 2;
  group.add(cowl);

  // Rotating Swept Fan Blades (Front)
  const fanGroup = new THREE.Group();
  fanGroup.name = 'comp_titanium_fan';
  fanGroup.userData = { componentId: 'titanium_fan' };
  fanGroup.position.set(0, 0, 1.5);

  // Spinner cone
  const coneGeom = new THREE.ConeGeometry(0.35, 0.7, 24);
  const coneMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 });
  const cone = new THREE.Mesh(coneGeom, coneMat);
  cone.rotation.x = Math.PI / 2;
  fanGroup.add(cone);

  // 18 Titanium Fan Blades
  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2;
    const bladeGeom = new THREE.BoxGeometry(0.12, 1.0, 0.03);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
    const blade = new THREE.Mesh(bladeGeom, bladeMat);
    blade.position.set(Math.cos(angle) * 0.65, Math.sin(angle) * 0.65, -0.1);
    blade.rotation.z = angle;
    blade.rotation.y = 0.45;
    fanGroup.add(blade);
  }
  fanRef.current = fanGroup;
  group.add(fanGroup);

  // Compressor Stages (Core)
  const compGroup = new THREE.Group();
  compGroup.name = 'comp_compressors';
  compGroup.userData = { componentId: 'compressors' };
  const compGeom = new THREE.CylinderGeometry(0.65, 0.55, 1.0, 24);
  const compMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.2 });
  const comp = new THREE.Mesh(compGeom, compMat);
  comp.rotation.x = Math.PI / 2;
  comp.position.set(0, 0, 0.5);
  compGroup.add(comp);
  group.add(compGroup);

  // Annular Combustor Chamber (Orange Glow)
  const combustGroup = new THREE.Group();
  combustGroup.name = 'comp_combustor';
  combustGroup.userData = { componentId: 'combustor' };
  const combGeom = new THREE.CylinderGeometry(0.55, 0.5, 0.6, 24);
  const combMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: 0xe11d48,
    emissiveIntensity: 0.6,
    roughness: 0.4
  });
  const combust = new THREE.Mesh(combGeom, combMat);
  combust.rotation.x = Math.PI / 2;
  combust.position.set(0, 0, -0.3);
  combustGroup.add(combust);
  group.add(combustGroup);

  // HP Turbine
  const turbGroup = new THREE.Group();
  turbGroup.name = 'comp_turbine';
  turbGroup.userData = { componentId: 'turbine' };
  const turbGeom = new THREE.CylinderGeometry(0.5, 0.45, 0.5, 24);
  const turbMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.15 });
  const turbine = new THREE.Mesh(turbGeom, turbMat);
  turbine.rotation.x = Math.PI / 2;
  turbine.position.set(0, 0, -0.85);
  turbGroup.add(turbine);
  group.add(turbGroup);

  // Exhaust Nozzle & Flame
  const exhGroup = new THREE.Group();
  exhGroup.name = 'comp_exhaust_nozzle';
  exhGroup.userData = { componentId: 'exhaust_nozzle' };
  const exhConeGeom = new THREE.ConeGeometry(0.45, 0.9, 24);
  const exhMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 });
  const exhCone = new THREE.Mesh(exhConeGeom, exhMat);
  exhCone.rotation.x = -Math.PI / 2;
  exhCone.position.set(0, 0, -1.6);
  exhGroup.add(exhCone);

  // Afterburner Flame plume with Supersonic Shock Diamonds
  const flameGeom = new THREE.ConeGeometry(0.38, 1.4, 16);
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.85
  });
  const flame = new THREE.Mesh(flameGeom, flameMat);
  flame.rotation.x = -Math.PI / 2;
  flame.position.set(0, 0, -2.5);
  flameRef.current = flame;
  exhGroup.add(flame);

  // Shock diamond rings inside flame
  for (let s = 1; s <= 3; s++) {
    const diamondGeom = new THREE.RingGeometry(0.08 * s, 0.12 * s, 16);
    const diamondMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const diamond = new THREE.Mesh(diamondGeom, diamondMat);
    diamond.position.set(0, 0, -1.8 - s * 0.35);
    exhGroup.add(diamond);
  }

  group.add(exhGroup);
}

// 3. 6-Axis Industrial Robotic Arm
function buildRobotArm(group: THREE.Group, jointsRef: React.MutableRefObject<THREE.Group[]>) {
  // Base Pedestal (Axis 1)
  const baseGroup = new THREE.Group();
  baseGroup.name = 'comp_pedestal_base';
  baseGroup.userData = { componentId: 'pedestal_base' };

  const baseGeom = new THREE.CylinderGeometry(0.65, 0.75, 0.4, 24);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });
  const base = new THREE.Mesh(baseGeom, baseMat);
  baseGroup.add(base);
  baseGroup.position.set(0, -1.0, 0);
  group.add(baseGroup);

  // Joint 1 Turntable with Glowing Degree Ring
  const j1 = new THREE.Group();
  j1.position.set(0, 0.3, 0);
  baseGroup.add(j1);
  jointsRef.current.push(j1);

  const j1RingGeom = new THREE.TorusGeometry(0.55, 0.02, 12, 32);
  const j1RingMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
  const j1Ring = new THREE.Mesh(j1RingGeom, j1RingMat);
  j1Ring.rotation.x = Math.PI / 2;
  j1.add(j1Ring);

  // Joint 2 Shoulder Boom
  const j2 = new THREE.Group();
  j2.position.set(0, 0.2, 0);
  j1.add(j2);
  jointsRef.current.push(j2);

  const shoulderGeom = new THREE.BoxGeometry(0.32, 1.2, 0.28);
  const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.25 });
  const shoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
  shoulder.position.set(0, 0.6, 0);
  shoulder.userData = { componentId: 'shoulder_joint' };
  j2.add(shoulder);

  // Joint 3 Elbow
  const j3 = new THREE.Group();
  j3.position.set(0, 1.2, 0);
  j2.add(j3);
  jointsRef.current.push(j3);

  const forearmGeom = new THREE.BoxGeometry(0.24, 1.1, 0.24);
  const forearmMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7, roughness: 0.2 });
  const forearm = new THREE.Mesh(forearmGeom, forearmMat);
  forearm.position.set(0, 0.55, 0);
  forearm.userData = { componentId: 'elbow_joint' };
  j3.add(forearm);

  // Wrist Assembly & Tool
  const wristGroup = new THREE.Group();
  wristGroup.position.set(0, 1.1, 0);
  wristGroup.userData = { componentId: 'wrist_assembly' };

  const wristGeom = new THREE.SphereGeometry(0.18, 16, 16);
  const wristMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, emissive: 0xb45309, emissiveIntensity: 0.3 });
  const wrist = new THREE.Mesh(wristGeom, wristMat);
  wristGroup.add(wrist);

  // Parallel Jaw Gripper
  const clawLGeom = new THREE.BoxGeometry(0.04, 0.25, 0.08);
  const clawMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 });
  const clawL = new THREE.Mesh(clawLGeom, clawMat);
  clawL.position.set(-0.08, 0.2, 0);
  clawL.userData = { componentId: 'end_effector' };
  wristGroup.add(clawL);

  const clawR = new THREE.Mesh(clawLGeom, clawMat);
  clawR.position.set(0.08, 0.2, 0);
  clawR.userData = { componentId: 'end_effector' };
  wristGroup.add(clawR);

  // Stylized Laser Targeting Beam pointing outward from gripper
  const laserGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.2, 0),
    new THREE.Vector3(0, 1.2, 0)
  ]);
  const laserLine = new THREE.Line(
    laserGeom,
    new THREE.LineBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.75 })
  );
  wristGroup.add(laserLine);

  const dotGeom = new THREE.SphereGeometry(0.03, 12, 12);
  const dotMat = new THREE.MeshBasicMaterial({ color: 0x4ade80 });
  const dot = new THREE.Mesh(dotGeom, dotMat);
  dot.position.set(0, 1.2, 0);
  wristGroup.add(dot);

  j3.add(wristGroup);
}

// 4. Supercomputing Motherboard
function buildMotherboard(group: THREE.Group) {
  // PCB Mainboard (Matte Black 10-layer substrate)
  const pcbGeom = new THREE.BoxGeometry(3.2, 0.08, 2.6);
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.4 });
  const pcb = new THREE.Mesh(pcbGeom, pcbMat);
  group.add(pcb);

  // Glowing Neon Cyan Bus Traces on PCB
  const traceCoords = [
    [[-0.8, 0.05, -0.2], [0.2, 0.05, -0.2], [0.2, 0.05, 0.1]],
    [[-0.4, 0.05, -0.6], [-0.4, 0.05, -0.1], [0.0, 0.05, 0.1]],
    [[0.6, 0.05, -0.4], [0.6, 0.05, -0.1], [0.35, 0.05, 0.1]]
  ];
  traceCoords.forEach((pts) => {
    const traceGeom = new THREE.BufferGeometry().setFromPoints(
      pts.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
    );
    const traceLine = new THREE.Line(
      traceGeom,
      new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.85 })
    );
    group.add(traceLine);
  });

  // CPU Socket & Integrated Heat Spreader (IHS)
  const cpuGroup = new THREE.Group();
  cpuGroup.name = 'comp_cpu_socket';
  cpuGroup.userData = { componentId: 'cpu_socket' };

  const socketGeom = new THREE.BoxGeometry(0.85, 0.06, 0.85);
  const socketMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.4 });
  const socket = new THREE.Mesh(socketGeom, socketMat);
  socket.position.set(0, 0.06, 0.2);
  cpuGroup.add(socket);

  const ihsGeom = new THREE.BoxGeometry(0.68, 0.08, 0.68);
  const ihsMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.1 });
  const ihs = new THREE.Mesh(ihsGeom, ihsMat);
  ihs.position.set(0, 0.12, 0.2);
  cpuGroup.add(ihs);
  group.add(cpuGroup);

  // VRM Heatsinks (L-shaped fin arrays with subtle metallic edges)
  const vrmGroup = new THREE.Group();
  vrmGroup.name = 'comp_vrm_heatsink';
  vrmGroup.userData = { componentId: 'vrm_heatsink' };

  const vrmTopGeom = new THREE.BoxGeometry(1.4, 0.35, 0.3);
  const vrmMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
  const vrmTop = new THREE.Mesh(vrmTopGeom, vrmMat);
  vrmTop.position.set(0, 0.2, 0.85);
  vrmGroup.add(vrmTop);

  const vrmSideGeom = new THREE.BoxGeometry(0.3, 0.35, 1.2);
  const vrmSide = new THREE.Mesh(vrmSideGeom, vrmMat);
  vrmSide.position.set(-0.85, 0.2, 0.2);
  vrmGroup.add(vrmSide);
  group.add(vrmGroup);

  // 4 DDR5 RAM Slots with glowing RGB lightbars
  const ramGroup = new THREE.Group();
  ramGroup.name = 'comp_ram_slots';
  ramGroup.userData = { componentId: 'ram_slots' };

  for (let i = 0; i < 4; i++) {
    const xPos = 0.65 + i * 0.18;
    const stickGeom = new THREE.BoxGeometry(0.06, 0.32, 1.4);
    const stickMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const stick = new THREE.Mesh(stickGeom, stickMat);
    stick.position.set(xPos, 0.2, 0.2);
    ramGroup.add(stick);

    // Glowing RGB strip on top of RAM
    const rgbColors = [0xec4899, 0xa855f7, 0x3b82f6, 0x06b6d4];
    const rgbGeom = new THREE.BoxGeometry(0.06, 0.04, 1.38);
    const rgbMat = new THREE.MeshBasicMaterial({ color: rgbColors[i] });
    const rgbStrip = new THREE.Mesh(rgbGeom, rgbMat);
    rgbStrip.position.set(xPos, 0.37, 0.2);
    ramGroup.add(rgbStrip);
  }
  group.add(ramGroup);

  // PCIe 5.0 Steel-Reinforced Slots
  const pcieGroup = new THREE.Group();
  pcieGroup.name = 'comp_pcie_lanes';
  pcieGroup.userData = { componentId: 'pcie_lanes' };

  const slot1Geom = new THREE.BoxGeometry(1.8, 0.15, 0.12);
  const slotMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.15 });
  const slot1 = new THREE.Mesh(slot1Geom, slotMat);
  slot1.position.set(-0.1, 0.1, -0.45);
  pcieGroup.add(slot1);

  const slot2 = new THREE.Mesh(slot1Geom, slotMat);
  slot2.position.set(-0.1, 0.1, -0.95);
  pcieGroup.add(slot2);
  group.add(pcieGroup);

  // M.2 Armor & Chipset Heatsink
  const m2Group = new THREE.Group();
  m2Group.name = 'comp_chipset_m2';
  m2Group.userData = { componentId: 'chipset_m2' };

  const m2Geom = new THREE.BoxGeometry(0.9, 0.12, 0.7);
  const m2Mat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });
  const m2 = new THREE.Mesh(m2Geom, m2Mat);
  m2.position.set(0.8, 0.1, -0.7);
  m2Group.add(m2);
  group.add(m2Group);
}

// Explode offsets dynamically
function updateExplodedOffsets(group: THREE.Group, renderType: string, factor: number) {
  if (renderType === 'ev_powertrain') {
    const batt = group.getObjectByName('comp_battery_pack');
    if (batt) {
      batt.position.y = -factor * 0.55;
      batt.position.z = factor * 0.45;
    }
    const rMotor = group.getObjectByName('comp_rear_motor');
    if (rMotor) rMotor.position.x = -factor * 0.65;
    const fMotor = group.getObjectByName('comp_front_motor');
    if (fMotor) fMotor.position.x = factor * 0.65;
    const inv = group.getObjectByName('comp_inverter');
    if (inv) inv.position.y = factor * 0.65;
  } else if (renderType === 'jet_engine') {
    const fan = group.getObjectByName('comp_titanium_fan');
    if (fan) fan.position.z = 1.5 + factor * 1.2;
    const comp = group.getObjectByName('comp_compressors');
    if (comp) comp.position.z = 0.5 + factor * 0.4;
    const comb = group.getObjectByName('comp_combustor');
    if (comb) comb.position.z = -0.3 - factor * 0.4;
    const turb = group.getObjectByName('comp_turbine');
    if (turb) turb.position.z = -0.85 - factor * 0.8;
    const exh = group.getObjectByName('comp_exhaust_nozzle');
    if (exh) exh.position.z = -factor * 1.2;
  }
}
