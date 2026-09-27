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
    } else if (renderType === 'jet_engine') {
      camera.position.set(2.75, 0.55, 2.35);
    } else if (renderType === 'microchip_motherboard') {
      camera.position.set(-0.55, 2.65, 2.75);
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
      const cam = cameraRef.current;
      if (!cam) return;
      const currentDist = cam.position.length();
      if (currentDist > 0.001) {
        const nextDist = Math.max(1.8, Math.min(9.0, currentDist + e.deltaY * 0.003));
        cam.position.setLength(nextDist);
        cam.lookAt(0, 0, 0);
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

// 2. High-Bypass Turbofan Jet Engine (Matching Reference Image)
function buildJetTurbofan(
  group: THREE.Group,
  fanRef: React.MutableRefObject<THREE.Group | null>,
  flameRef: React.MutableRefObject<THREE.Mesh | null>
) {
  // Shared Aerospace PBR Materials
  const brushedTitaniumMat = new THREE.MeshStandardMaterial({
    color: 0x9aa5b4,
    metalness: 0.86,
    roughness: 0.24,
    side: THREE.DoubleSide
  });
  const polishedSteelMat = new THREE.MeshStandardMaterial({
    color: 0xd8dee9,
    metalness: 0.92,
    roughness: 0.16,
    side: THREE.DoubleSide
  });
  const darkAlloyMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.82,
    roughness: 0.28,
    side: THREE.DoubleSide
  });
  const fadecBoxMat = new THREE.MeshStandardMaterial({
    color: 0x3f4652,
    metalness: 0.55,
    roughness: 0.42
  });
  const acousticBlueMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    metalness: 0.25,
    roughness: 0.55,
    side: THREE.DoubleSide
  });
  const chromateGoldMat = new THREE.MeshStandardMaterial({
    color: 0xc8a951,
    metalness: 0.68,
    roughness: 0.32
  });
  const crimsonHarnessMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0x991b1b,
    emissiveIntensity: 0.22,
    roughness: 0.32,
    metalness: 0.15
  });
  const cobaltHarnessMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    roughness: 0.35,
    metalness: 0.2
  });
  const spinnerDarkMat = new THREE.MeshStandardMaterial({
    color: 0x1e242d,
    metalness: 0.75,
    roughness: 0.22
  });
  const spinnerTipMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.65,
    roughness: 0.2
  });

  // ============================================================================
  // SUBSYSTEM 1: SWEPT TITANIUM FAN, BLUE ACOUSTIC LINER & CONTAINMENT CASE (+Z)
  // ============================================================================
  const fanCaseSubsystem = new THREE.Group();
  fanCaseSubsystem.name = 'comp_titanium_fan';
  fanCaseSubsystem.userData = { componentId: 'titanium_fan' };

  // Main Full-Circumference Brushed Titanium Fan Containment Barrel (z = 0.20 to 1.68)
  const fanBarrelGeom = new THREE.CylinderGeometry(1.28, 1.26, 1.48, 48, 1, true);
  const fanBarrel = new THREE.Mesh(fanBarrelGeom, brushedTitaniumMat);
  fanBarrel.rotation.x = Math.PI / 2;
  fanBarrel.position.set(0, 0, 0.94);
  fanCaseSubsystem.add(fanBarrel);

  // Polished Rounded Front Intake Lip Ring at z = 1.68
  const intakeLip = new THREE.Mesh(
    new THREE.TorusGeometry(1.25, 0.055, 20, 48),
    polishedSteelMat
  );
  intakeLip.position.set(0, 0, 1.68);
  fanCaseSubsystem.add(intakeLip);

  // Signature Cobalt-Blue Inner Acoustic Liner Ring (visible inside intake throat)
  const blueLinerGeom = new THREE.CylinderGeometry(1.22, 1.21, 0.56, 48, 1, true);
  const blueLiner = new THREE.Mesh(blueLinerGeom, acousticBlueMat);
  blueLiner.rotation.x = Math.PI / 2;
  blueLiner.position.set(0, 0, 1.38);
  fanCaseSubsystem.add(blueLiner);

  // Dark Inner Containment Ring behind Fan Blades
  const innerShroudGeom = new THREE.CylinderGeometry(1.20, 1.16, 0.85, 48, 1, true);
  const innerShroud = new THREE.Mesh(innerShroudGeom, darkAlloyMat);
  innerShroud.rotation.x = Math.PI / 2;
  innerShroud.position.set(0, 0, 0.68);
  fanCaseSubsystem.add(innerShroud);

  // Stepped Circumferential Stiffening Flanges on Fan Containment Barrel
  [0.24, 0.38, 0.55, 0.98, 1.52].forEach((zRing, rIdx) => {
    const flange = new THREE.Mesh(
      new THREE.TorusGeometry(rIdx < 3 ? 1.29 : 1.285, rIdx === 1 ? 0.035 : 0.022, 14, 48),
      rIdx % 2 === 0 ? polishedSteelMat : darkAlloyMat
    );
    flange.position.set(0, 0, zRing);
    fanCaseSubsystem.add(flange);
  });

  // Axial Structural Mounting Straps on Outer Fan Barrel (seen in reference photo)
  [-0.28, 0.0, 0.28, 0.58, 1.15].forEach((ang) => {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.11, 0.56), darkAlloyMat);
    const rad = 1.29;
    strap.position.set(Math.cos(ang) * rad, Math.sin(ang) * rad, 1.22);
    strap.rotation.z = ang;
    fanCaseSubsystem.add(strap);
  });

  // 36 Stationary Outlet Guide Vanes (OGVs) behind the rotating fan
  for (let i = 0; i < 36; i++) {
    const ang = (i / 36) * Math.PI * 2;
    const ogv = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.68, 0.09), darkAlloyMat);
    ogv.position.set(Math.cos(ang) * 0.82, Math.sin(ang) * 0.82, 0.62);
    ogv.rotation.z = ang;
    fanCaseSubsystem.add(ogv);
  }

  // Rotating Fan Rotor Group (22 Wide-Chord Swept Blades + Bi-Metallic Spinner Cone)
  const rotatingFanGroup = new THREE.Group();
  rotatingFanGroup.position.set(0, 0, 1.18);

  // Dark Anthracite Spinner Base Cone
  const spinnerBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.38, 0.38, 32),
    spinnerDarkMat
  );
  spinnerBase.rotation.x = Math.PI / 2;
  spinnerBase.position.set(0, 0, 0.16);
  rotatingFanGroup.add(spinnerBase);

  // Bright Silver-White Conical Spinner Nose Tip (Matches reference photo)
  const spinnerTip = new THREE.Mesh(
    new THREE.ConeGeometry(0.14, 0.22, 32),
    spinnerTipMat
  );
  spinnerTip.rotation.x = Math.PI / 2;
  spinnerTip.position.set(0, 0, 0.46);
  rotatingFanGroup.add(spinnerTip);

  // Hub disk holding the 22 fan blades
  const fanDisk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.42, 0.24, 32),
    spinnerDarkMat
  );
  fanDisk.rotation.x = Math.PI / 2;
  fanDisk.position.set(0, 0, -0.05);
  rotatingFanGroup.add(fanDisk);

  // 22 Wide-Chord 3D-Swept Scimitar Titanium Fan Blades
  const numBlades = 22;
  for (let i = 0; i < numBlades; i++) {
    const angle = (i / numBlades) * Math.PI * 2;
    const bladeHolder = new THREE.Group();
    bladeHolder.rotation.z = angle;

    // Dark root dovetail platform
    const bladeRoot = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.22, 0.14),
      spinnerDarkMat
    );
    bladeRoot.position.set(0, 0.44, 0.0);
    bladeRoot.rotation.y = 0.52;
    bladeHolder.add(bladeRoot);

    // Wide-chord swept metallic titanium airfoil
    const bladeMain = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.76, 0.024),
      polishedSteelMat
    );
    bladeMain.position.set(0.02, 0.79, 0.03);
    bladeMain.rotation.y = 0.62;
    bladeMain.rotation.x = -0.12;
    bladeHolder.add(bladeMain);

    // Swept leading-edge tip twist
    const bladeTip = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.24, 0.02),
      brushedTitaniumMat
    );
    bladeTip.position.set(-0.02, 1.06, 0.06);
    bladeTip.rotation.y = 0.74;
    bladeTip.rotation.z = 0.12;
    bladeHolder.add(bladeTip);

    rotatingFanGroup.add(bladeHolder);
  }

  fanRef.current = rotatingFanGroup;
  fanCaseSubsystem.add(rotatingFanGroup);
  group.add(fanCaseSubsystem);

  // ============================================================================
  // SUBSYSTEM 2: FADEC CONTROL BOXES, HARNESSES & ACCESSORY GEARBOX (AGB)
  // ============================================================================
  const agbHarnessGroup = new THREE.Group();
  agbHarnessGroup.name = 'comp_compressors';
  agbHarnessGroup.userData = { componentId: 'compressors' };

  // Upper & Mid-Side Anthracite FADEC / EEC Control Boxes on Fan Case (+X side)
  const fadecUpper = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.34, 0.28), fadecBoxMat);
  fadecUpper.position.set(1.26, 0.38, 0.74);
  fadecUpper.rotation.z = -0.28;
  agbHarnessGroup.add(fadecUpper);

  const fadecLower = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.32, 0.32), fadecBoxMat);
  fadecLower.position.set(1.31, -0.08, 0.72);
  fadecLower.rotation.z = 0.06;
  agbHarnessGroup.add(fadecLower);

  // Red circular diagnostic/pressure port on lower FADEC box (seen in photo)
  const redPort = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.032, 0.04, 16),
    crimsonHarnessMat
  );
  redPort.rotation.z = Math.PI / 2;
  redPort.position.set(1.39, -0.02, 0.64);
  agbHarnessGroup.add(redPort);

  // Side Ignition Exciter & Sensor Junction Boxes
  const ignBox = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.20), darkAlloyMat);
  ignBox.position.set(1.04, 0.82, 0.82);
  ignBox.rotation.z = -0.68;
  agbHarnessGroup.add(ignBox);

  // Under-Slung Yellow-Chromate / Gold Cast-Aluminum Accessory Gearbox (AGB) at Bottom-Front
  const agbHousingCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.12, -0.68, 0.65),
    new THREE.Vector3(0.92, -1.08, 0.72),
    new THREE.Vector3(0.58, -1.38, 0.82),
    new THREE.Vector3(0.18, -1.48, 0.85)
  ]);
  const agbMainBody = new THREE.Mesh(
    new THREE.TubeGeometry(agbHousingCurve, 20, 0.17, 14, false),
    chromateGoldMat
  );
  agbHarnessGroup.add(agbMainBody);

  // Cast Gearbox Sump & Starter/Pump Cylinders protruding forward-downward
  const starterMotor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.14, 0.46, 20),
    brushedTitaniumMat
  );
  starterMotor.rotation.x = Math.PI / 2;
  starterMotor.rotation.y = -0.18;
  starterMotor.position.set(0.46, -1.32, 1.05);
  agbHarnessGroup.add(starterMotor);

  // Crimson-Red Anodized Hydraulic/Fuel Caps & Manifolds on the Accessory Gearbox
  [
    [0.40, -1.32, 1.28, 0.065],
    [0.54, -1.48, 1.12, 0.075],
    [0.86, -1.04, 0.92, 0.06],
    [0.24, -1.52, 0.96, 0.055]
  ].forEach(([rx, ry, rz, rRad]) => {
    const redCap = new THREE.Mesh(
      new THREE.CylinderGeometry(rRad, rRad, 0.11, 16),
      crimsonHarnessMat
    );
    redCap.rotation.x = Math.PI / 2;
    redCap.position.set(rx, ry, rz);
    agbHarnessGroup.add(redCap);
  });

  // Bright Crimson-Red High-Temp Harnesses curving down Fan Case into AGB
  const redCable1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.22, 0.52, 0.62),
    new THREE.Vector3(1.34, 0.18, 0.56),
    new THREE.Vector3(1.36, -0.26, 0.58),
    new THREE.Vector3(1.22, -0.68, 0.66),
    new THREE.Vector3(0.95, -1.02, 0.78)
  ]);
  agbHarnessGroup.add(
    new THREE.Mesh(new THREE.TubeGeometry(redCable1, 28, 0.022, 10, false), crimsonHarnessMat)
  );

  const redCable2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.35, -0.18, 0.78),
    new THREE.Vector3(1.28, -0.52, 0.84),
    new THREE.Vector3(1.06, -0.88, 0.88),
    new THREE.Vector3(0.74, -1.22, 0.96)
  ]);
  agbHarnessGroup.add(
    new THREE.Mesh(new THREE.TubeGeometry(redCable2, 24, 0.02, 10, false), crimsonHarnessMat)
  );

  const redCable3 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.36, -0.16, 0.64),
    new THREE.Vector3(1.34, -0.46, 0.54),
    new THREE.Vector3(1.18, -0.78, 0.58),
    new THREE.Vector3(0.98, -0.96, 0.68)
  ]);
  agbHarnessGroup.add(
    new THREE.Mesh(new THREE.TubeGeometry(redCable3, 24, 0.018, 10, false), crimsonHarnessMat)
  );

  // Cobalt-Blue Sensor & Pneumatic Conduits wrapping from Top of Fan Case down to FADEC & AGB
  const blueCable1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.25, 1.29, 1.15),
    new THREE.Vector3(0.78, 1.06, 1.02),
    new THREE.Vector3(1.14, 0.68, 0.92),
    new THREE.Vector3(1.32, 0.16, 0.88),
    new THREE.Vector3(1.28, -0.38, 0.86),
    new THREE.Vector3(1.05, -0.82, 0.86)
  ]);
  agbHarnessGroup.add(
    new THREE.Mesh(new THREE.TubeGeometry(blueCable1, 32, 0.018, 10, false), cobaltHarnessMat)
  );

  const blueCable2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.15, 1.30, 0.85),
    new THREE.Vector3(0.48, 1.22, 0.78),
    new THREE.Vector3(0.96, 0.92, 0.72),
    new THREE.Vector3(1.26, 0.48, 0.68)
  ]);
  agbHarnessGroup.add(
    new THREE.Mesh(new THREE.TubeGeometry(blueCable2, 24, 0.016, 10, false), cobaltHarnessMat)
  );

  // Braided Stainless Steel Hydraulic Conduits along Fan Case
  [-0.06, 0.06].forEach((zOff) => {
    const steelConduit = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.35, 1.26, 0.95 + zOff),
      new THREE.Vector3(0.88, 0.98, 0.86 + zOff),
      new THREE.Vector3(1.25, 0.52, 0.78 + zOff),
      new THREE.Vector3(1.35, -0.05, 0.74 + zOff),
      new THREE.Vector3(1.18, -0.65, 0.72 + zOff)
    ]);
    agbHarnessGroup.add(
      new THREE.Mesh(new THREE.TubeGeometry(steelConduit, 28, 0.015, 8, false), polishedSteelMat)
    );
  });

  group.add(agbHarnessGroup);

  // ============================================================================
  // SUBSYSTEM 3: NARROW HIGH-PRESSURE CORE & STAINLESS BLEED MANIFOLDS (Waist)
  // ============================================================================
  const coreGroup = new THREE.Group();
  coreGroup.name = 'comp_combustor';
  coreGroup.userData = { componentId: 'combustor' };

  // Conical Transition Splitter from Fan Case to Narrow Core Waist
  const splitterCone = new THREE.Mesh(
    new THREE.CylinderGeometry(0.98, 0.56, 0.36, 36),
    darkAlloyMat
  );
  splitterCone.rotation.x = Math.PI / 2;
  splitterCone.position.set(0, 0, 0.08);
  coreGroup.add(splitterCone);

  // Narrow High-Pressure Compressor (HPC) & Combustor Core Barrel (z = -0.82 to 0.0)
  const coreBarrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.58, 0.86, 36),
    darkAlloyMat
  );
  coreBarrel.rotation.x = Math.PI / 2;
  coreBarrel.position.set(0, 0, -0.38);
  coreGroup.add(coreBarrel);

  // Circumferential Stainless Steel Fuel & Bleed-Air Manifold Rings around Core Waist
  [-0.05, -0.22, -0.38, -0.54, -0.70].forEach((zManifold, idx) => {
    const manifoldRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.61 + (idx % 2) * 0.03, 0.024, 12, 36),
      polishedSteelMat
    );
    manifoldRing.position.set(0, 0, zManifold);
    coreGroup.add(manifoldRing);
  });

  // Signature Twin Parallel S-Bend Large Stainless Bleed-Air Ducts (Prominent in reference photo)
  [-0.06, 0.06].forEach((yOff) => {
    const bleedDuctCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.62, -0.18 + yOff, 0.02),
      new THREE.Vector3(0.68, -0.14 + yOff, -0.24),
      new THREE.Vector3(0.76, -0.02 + yOff, -0.48),
      new THREE.Vector3(0.88, 0.04 + yOff, -0.72),
      new THREE.Vector3(0.94, 0.04 + yOff, -0.98)
    ]);
    const bleedDuct = new THREE.Mesh(
      new THREE.TubeGeometry(bleedDuctCurve, 28, 0.042, 12, false),
      polishedSteelMat
    );
    coreGroup.add(bleedDuct);

    // Machined flange couplings on the S-bend bleed ducts
    [-0.24, -0.68].forEach((zClamp) => {
      const clamp = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.04, 14),
        darkAlloyMat
      );
      clamp.rotation.x = Math.PI / 2;
      clamp.position.set(zClamp === -0.24 ? 0.68 : 0.86, -0.08 + yOff, zClamp);
      coreGroup.add(clamp);
    });
  });

  // Intricate Multi-Branch Stainless Steel Piping & Actuator Network around Core
  for (let p = 0; p < 8; p++) {
    const ang1 = (p / 8) * Math.PI * 2;
    const ang2 = ang1 + 0.45;
    const rPipe = 0.64;
    const pipeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(ang1) * rPipe, Math.sin(ang1) * rPipe, 0.02),
      new THREE.Vector3(Math.cos((ang1 + ang2) * 0.5) * (rPipe + 0.05), Math.sin((ang1 + ang2) * 0.5) * (rPipe + 0.05), -0.36),
      new THREE.Vector3(Math.cos(ang2) * (rPipe + 0.08), Math.sin(ang2) * (rPipe + 0.08), -0.74)
    ]);
    coreGroup.add(
      new THREE.Mesh(new THREE.TubeGeometry(pipeCurve, 20, 0.018, 8, false), polishedSteelMat)
    );

    // Valve bosses & VSV actuator cylinders on core casing
    const boss = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.038, 0.14, 12),
      brushedTitaniumMat
    );
    boss.position.set(Math.cos(ang1) * 0.62, Math.sin(ang1) * 0.62, -0.28);
    boss.rotation.z = ang1 + Math.PI / 2;
    coreGroup.add(boss);
  }

  group.add(coreGroup);

  // ============================================================================
  // SUBSYSTEM 4: RIBBED LOW-PRESSURE TURBINE (LPT) BARREL CASING (Rear Drum)
  // ============================================================================
  const lptGroup = new THREE.Group();
  lptGroup.name = 'comp_turbine';
  lptGroup.userData = { componentId: 'turbine' };

  // Main Flared LPT Drum (z = -1.72 to -0.76)
  const lptDrumGeom = new THREE.CylinderGeometry(0.76, 0.92, 0.96, 40);
  const lptDrum = new THREE.Mesh(lptDrumGeom, darkAlloyMat);
  lptDrum.rotation.x = Math.PI / 2;
  lptDrum.position.set(0, 0, -1.24);
  lptGroup.add(lptDrum);

  // 13 Closely-Spaced Circumferential Metallic Cooling/Stiffening Flange Ribs (Signature feature on right of photo)
  const numRibs = 13;
  for (let r = 0; r < numRibs; r++) {
    const t = r / (numRibs - 1);
    const zPos = -0.78 - t * 0.88;
    // Barrel profile: flares quickly from 0.78 to 0.95 then tapers slightly to 0.84 at rear
    const profileRad = 0.78 + Math.sin(t * Math.PI * 0.82) * 0.17;
    const ribTorus = new THREE.Mesh(
      new THREE.TorusGeometry(profileRad, 0.022, 12, 44),
      r % 2 === 0 ? polishedSteelMat : brushedTitaniumMat
    );
    ribTorus.position.set(0, 0, zPos);
    lptGroup.add(ribTorus);
  }

  // Axial Longitudinal Strakes & Tie-Rods crossing the LPT Circumferential Ribs
  const numStrakes = 16;
  for (let s = 0; s < numStrakes; s++) {
    const ang = (s / numStrakes) * Math.PI * 2;
    const strakeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(ang) * 0.79, Math.sin(ang) * 0.79, -0.78),
      new THREE.Vector3(Math.cos(ang) * 0.96, Math.sin(ang) * 0.96, -1.18),
      new THREE.Vector3(Math.cos(ang) * 0.86, Math.sin(ang) * 0.86, -1.66)
    ]);
    const strakeMesh = new THREE.Mesh(
      new THREE.TubeGeometry(strakeCurve, 16, 0.016, 8, false),
      s % 3 === 0 ? polishedSteelMat : darkAlloyMat
    );
    lptGroup.add(strakeMesh);
  }

  // Rear LPT Structural Mounting Flange Ring with Bolt Bosses
  const rearFlange = new THREE.Mesh(
    new THREE.CylinderGeometry(0.84, 0.78, 0.14, 40),
    brushedTitaniumMat
  );
  rearFlange.rotation.x = Math.PI / 2;
  rearFlange.position.set(0, 0, -1.72);
  lptGroup.add(rearFlange);

  group.add(lptGroup);

  // ============================================================================
  // SUBSYSTEM 5: TURBINE EXHAUST FRAME, CORE NOZZLE & THRUST PLUME (-Z)
  // ============================================================================
  const exhGroup = new THREE.Group();
  exhGroup.name = 'comp_exhaust_nozzle';
  exhGroup.userData = { componentId: 'exhaust_nozzle' };

  const exhConeGeom = new THREE.CylinderGeometry(0.42, 0.76, 0.38, 36);
  const exhCone = new THREE.Mesh(exhConeGeom, darkAlloyMat);
  exhCone.rotation.x = Math.PI / 2;
  exhCone.position.set(0, 0, -1.92);
  exhGroup.add(exhCone);

  // Inner Centerbody Exhaust Plug Cone
  const plugCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 0.55, 28),
    spinnerDarkMat
  );
  plugCone.rotation.x = -Math.PI / 2;
  plugCone.position.set(0, 0, -2.08);
  exhGroup.add(plugCone);

  // Dynamic Mach Thrust Plume (scales with RPM / Throttle slider)
  const flameGeom = new THREE.ConeGeometry(0.36, 1.25, 24);
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.75
  });
  const flame = new THREE.Mesh(flameGeom, flameMat);
  flame.rotation.x = -Math.PI / 2;
  flame.position.set(0, 0, -2.65);
  flameRef.current = flame;
  exhGroup.add(flame);

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

// Helper: Generate detailed emerald-green server PCB texture with white silkscreen, BGA grids & SMD pads
function createGreenServerPCBTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Rich emerald server PCB base coat
    ctx.fillStyle = '#156b38';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle Lighter Green Copper Bus Etched Traces
    ctx.strokeStyle = '#1f8a4c';
    ctx.lineWidth = 1.5;
    for (let i = 16; i < 500; i += 8) {
      ctx.beginPath();
      ctx.moveTo(20, i);
      ctx.lineTo(240, i);
      ctx.lineTo(260, i + 12);
      ctx.lineTo(490, i + 12);
      ctx.stroke();
    }
    for (let x = 24; x < 490; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, 490);
      ctx.stroke();
    }

    // White silkscreen component outlines & labels
    ctx.strokeStyle = 'rgba(241, 245, 249, 0.65)';
    ctx.lineWidth = 1;
    for (let r = 0; r < 65; r++) {
      const rx = ((r * 73) % 460) + 20;
      const ry = ((r * 131) % 460) + 20;
      const rw = 8 + (r % 3) * 6;
      const rh = 5 + (r % 2) * 5;
      ctx.strokeRect(rx, ry, rw, rh);
    }

    // White BGA array footprints (seen at bottom-left and bottom-right of board in photo)
    const drawBGAGrid = (gx: number, gy: number, size: number) => {
      ctx.fillStyle = 'rgba(226, 232, 240, 0.75)';
      ctx.strokeStyle = '#f8fafc';
      ctx.strokeRect(gx - 3, gy - 3, size + 6, size + 6);
      for (let x = gx; x < gx + size; x += 4) {
        for (let y = gy; y < gy + size; y += 4) {
          ctx.fillRect(x, y, 2, 2);
        }
      }
    };
    drawBGAGrid(32, 430, 44);
    drawBGAGrid(435, 345, 48);
    drawBGAGrid(265, 355, 32);

    // Silver SMD solder pads & white silkscreen bar strips
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(92, 305, 16, 75);
    ctx.fillRect(250, 325, 45, 10);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

// 4. Supercomputing Dual-Socket Server Motherboard & Workstation Hardware (Matching Reference Image)
function buildMotherboard(group: THREE.Group) {
  const pcbTex = createGreenServerPCBTexture();
  const pcbTopMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: pcbTex,
    roughness: 0.42,
    metalness: 0.15
  });
  const pcbEdgeMat = new THREE.MeshStandardMaterial({
    color: 0x0f5229,
    roughness: 0.5
  });
  const brushedSilverMat = new THREE.MeshStandardMaterial({
    color: 0xd8dee9,
    metalness: 0.88,
    roughness: 0.2
  });
  const anodizedWhiteAlumMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.65,
    roughness: 0.25
  });
  const blueSlotMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.35,
    metalness: 0.1
  });
  const ramSpreaderBlueSilverMat = new THREE.MeshStandardMaterial({
    color: 0x93b4d8,
    metalness: 0.82,
    roughness: 0.22
  });
  const ivorySlotMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    roughness: 0.4,
    metalness: 0.05
  });
  const blackSlotMat = new THREE.MeshStandardMaterial({
    color: 0x181b20,
    roughness: 0.45,
    metalness: 0.15
  });
  const darkSiliconMat = new THREE.MeshStandardMaterial({
    color: 0x262930,
    roughness: 0.35,
    metalness: 0.4
  });
  const yellowCapMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.3,
    metalness: 0.2
  });
  const purpleCapMat = new THREE.MeshStandardMaterial({
    color: 0x7c3aed,
    roughness: 0.35,
    metalness: 0.2
  });
  const brownCapMat = new THREE.MeshStandardMaterial({
    color: 0x3b2314,
    roughness: 0.35,
    metalness: 0.25
  });
  const copperWindMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    metalness: 0.75,
    roughness: 0.25
  });
  const tealPortMat = new THREE.MeshStandardMaterial({
    color: 0x0d9488,
    roughness: 0.35,
    metalness: 0.2
  });
  const redGpuPcbMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.38,
    metalness: 0.2
  });

  // Main Emerald-Green Dual-Socket Server PCB Substrate (Centered slightly left so GPU fits on right)
  const pcbGeom = new THREE.BoxGeometry(2.65, 0.06, 2.25);
  const pcb = new THREE.Mesh(pcbGeom, [
    pcbEdgeMat,
    pcbEdgeMat,
    pcbTopMat,
    pcbEdgeMat,
    pcbEdgeMat,
    pcbEdgeMat
  ]);
  pcb.position.set(-0.22, 0, 0.05);
  group.add(pcb);

  // Small onboard square IC chips & grey ferrite inductors scattered on the green PCB
  [
    [-0.98, 0.045, 0.04, 0.22, 0.22],
    [-0.06, 0.045, 0.36, 0.18, 0.14],
    [0.08, 0.045, 0.68, 0.22, 0.22],
    [0.72, 0.045, 0.32, 0.16, 0.16]
  ].forEach(([ix, iy, iz, iw, id]) => {
    const ic = new THREE.Mesh(new THREE.BoxGeometry(iw, 0.03, id), darkSiliconMat);
    ic.position.set(ix, iy, iz);
    group.add(ic);
  });

  // Grey Square Ferrite Inductors (1R0 blocks below the blue RAM slots)
  [
    [-0.98, -0.18],
    [-0.84, -0.18],
    [-0.70, -0.18],
    [-0.78, -0.06],
    [-0.64, -0.06],
    [-0.50, -0.06]
  ].forEach(([fx, fz]) => {
    const choke = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.06, 0.10), darkSiliconMat);
    choke.position.set(fx, 0.06, fz);
    group.add(choke);
  });

  // ============================================================================
  // SUBSYSTEM 1: DUAL LGA SERVER CPU SOCKETS & SOLID POLYMER CAPACITOR BANKS
  // ============================================================================
  const cpuGroup = new THREE.Group();
  cpuGroup.name = 'comp_cpu_socket';
  cpuGroup.userData = { componentId: 'cpu_socket' };

  // Two Tandem Server CPU Sockets (Upper Socket 1 at z = -0.58, Lower Socket 2 at z = 0.04)
  [
    [0.24, -0.58],
    [0.32, 0.04]
  ].forEach(([cx, cz]) => {
    const sockHolder = new THREE.Group();
    sockHolder.position.set(cx, 0.04, cz);

    // Socket Base Frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.46), darkSiliconMat);
    sockHolder.add(frame);

    // Brushed Stainless Retention Load Plate
    const loadPlate = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.055, 0.44), brushedSilverMat);
    loadPlate.position.y = 0.02;
    sockHolder.add(loadPlate);

    // Raised Nickel-Plated CPU Integrated Heat Spreader (IHS)
    const ihs = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.075, 0.32), brushedSilverMat);
    ihs.position.y = 0.035;
    sockHolder.add(ihs);

    // Socket Locking Lever Arm
    const lever = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.46, 8),
      brushedSilverMat
    );
    lever.rotation.x = Math.PI / 2;
    lever.position.set(-0.24, 0.04, 0);
    sockHolder.add(lever);

    cpuGroup.add(sockHolder);
  });

  // Rows of Silver-Top Solid Polymer Capacitors Flanking Both CPU Sockets
  for (let i = 0; i < 8; i++) {
    // Top row above Socket 1
    const capTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.09, 14),
      brushedSilverMat
    );
    capTop.position.set(-0.08 + i * 0.075, 0.075, -0.88);
    cpuGroup.add(capTop);

    // Middle row between Socket 1 and Socket 2
    const capMid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.09, 14),
      brushedSilverMat
    );
    capMid.position.set(-0.02 + i * 0.075, 0.075, -0.27);
    cpuGroup.add(capMid);
  }

  group.add(cpuGroup);

  // ============================================================================
  // SUBSYSTEM 2: TOROIDAL COPPER INDUCTORS & WHITE/SILVER FINNED VRM HEATSINKS
  // ============================================================================
  const vrmGroup = new THREE.Group();
  vrmGroup.name = 'comp_vrm_heatsink';
  vrmGroup.userData = { componentId: 'vrm_heatsink' };

  // 9 Yellow-Core Toroidal Choke Coils Wound with Red/Copper Wire (Right of CPU Sockets)
  for (let t = 0; t < 9; t++) {
    const tz = -0.82 + t * 0.125;
    const tx = 0.68 + (t > 4 ? 0.06 : 0);
    const toroidHolder = new THREE.Group();
    toroidHolder.position.set(tx, 0.085, tz);
    toroidHolder.rotation.y = 0.35;

    // Yellow Toroid Core
    const yellowCore = new THREE.Mesh(
      new THREE.TorusGeometry(0.038, 0.016, 12, 20),
      yellowCapMat
    );
    toroidHolder.add(yellowCore);

    // Red/Copper Wire Windings around Toroid
    for (let w = 0; w < 6; w++) {
      const wAng = (w / 6) * Math.PI * 2;
      const windLoop = new THREE.Mesh(
        new THREE.TorusGeometry(0.019, 0.006, 8, 12),
        copperWindMat
      );
      windLoop.position.set(Math.cos(wAng) * 0.038, Math.sin(wAng) * 0.038, 0);
      windLoop.rotation.z = wAng + Math.PI / 2;
      toroidHolder.add(windLoop);
    }
    vrmGroup.add(toroidHolder);
  }

  // Two Long White/Silver Multi-Fin VRM Heatsinks to the Right of the Toroid Chokes
  [-0.58, 0.02].forEach((hz, hIdx) => {
    const hx = 0.85 + hIdx * 0.05;
    const hsBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.04, 0.52),
      anodizedWhiteAlumMat
    );
    hsBase.position.set(hx, 0.05, hz);
    vrmGroup.add(hsBase);

    for (let f = -0.24; f <= 0.24; f += 0.04) {
      const fin = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.16, 0.015),
        anodizedWhiteAlumMat
      );
      fin.position.set(hx, 0.12, hz + f);
      vrmGroup.add(fin);
    }
  });

  // Tall Dark-Brown Electrolytic Capacitor Drums near VRM edge
  [
    [0.54, -0.96],
    [0.84, 0.34],
    [0.94, 0.34],
    [0.89, 0.44]
  ].forEach(([bx, bz]) => {
    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 0.20, 16),
      brownCapMat
    );
    drum.position.set(bx, 0.13, bz);
    vrmGroup.add(drum);

    const drumTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.038, 0.01, 16),
      brushedSilverMat
    );
    drumTop.position.set(bx, 0.232, bz);
    vrmGroup.add(drumTop);
  });

  group.add(vrmGroup);

  // ============================================================================
  // SUBSYSTEM 3: 6-CHANNEL BLUE DIMM SLOTS & ECC REGISTERED SERVER RAM MODULES
  // ============================================================================
  const ramGroup = new THREE.Group();
  ramGroup.name = 'comp_ram_slots';
  ramGroup.userData = { componentId: 'ram_slots' };

  // 6 Horizontal Blue DIMM Slots on Upper-Left of Board (z = -0.86 to -0.36)
  for (let s = 0; s < 6; s++) {
    const sz = -0.86 + s * 0.10;
    // Blue DIMM Socket Rail
    const slotRail = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.06, 0.055), blueSlotMat);
    slotRail.position.set(-0.74, 0.06, sz);
    ramGroup.add(slotRail);

    // White Ejector Latches at Left & Right Ends of each Blue DIMM Slot
    [-1.28, -0.20].forEach((lx) => {
      const latch = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, 0.11, 0.05),
        anodizedWhiteAlumMat
      );
      latch.position.set(lx, 0.085, sz);
      latch.rotation.z = lx < -0.5 ? 0.18 : -0.18;
      ramGroup.add(latch);
    });

    // Populate the back 3 slots (s = 0, 1, 2) with tall ECC Registered RAM Modules with Silver-Blue Heatspreaders
    if (s < 3) {
      const stickPcb = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.24, 0.018),
        pcbEdgeMat
      );
      stickPcb.position.set(-0.74, 0.19, sz);
      ramGroup.add(stickPcb);

      const heatSpreader = new THREE.Mesh(
        new THREE.BoxGeometry(0.98, 0.22, 0.034),
        ramSpreaderBlueSilverMat
      );
      heatSpreader.position.set(-0.74, 0.19, sz);
      ramGroup.add(heatSpreader);

      // Top metal clip ridges on ECC Server RAM heatspreader
      [-0.32, 0.0, 0.32].forEach((clipX) => {
        const clip = new THREE.Mesh(
          new THREE.BoxGeometry(0.11, 0.04, 0.044),
          brushedSilverMat
        );
        clip.position.set(-0.74 + clipX, 0.29, sz);
        ramGroup.add(clip);
      });
    }
  }

  // Spare Detached RAM Modules Laid Flat Behind the Upper Edge of Motherboard (Matches top of photo)
  [
    [-0.95, -1.24, 0xb48a5a],
    [-0.95, -1.38, 0xb48a5a],
    [0.05, -1.26, 0x1e242b],
    [0.05, -1.40, 0x1e242b]
  ].forEach(([rx, rz, rColor]) => {
    const spareStick = new THREE.Mesh(
      new THREE.BoxGeometry(0.86, 0.03, 0.11),
      new THREE.MeshStandardMaterial({ color: rColor, metalness: 0.7, roughness: 0.3 })
    );
    spareStick.position.set(rx, 0.015, rz);
    ramGroup.add(spareStick);
  });

  group.add(ramGroup);

  // ============================================================================
  // SUBSYSTEM 4: BLACK PCIe SLOTS, IVORY LEGACY PCI SLOTS & REAR I/O SHIELD
  // ============================================================================
  const pcieGroup = new THREE.Group();
  pcieGroup.name = 'comp_pcie_lanes';
  pcieGroup.userData = { componentId: 'pcie_lanes' };

  // 3 Black PCI Express Slots (1 long x16 at z = 0.22, 2 shorter x8/x4 at z = 0.50 & 0.66)
  [
    [-0.72, 0.22, 0.96],
    [-0.84, 0.50, 0.68],
    [-0.84, 0.66, 0.68]
  ].forEach(([px, pz, pLen]) => {
    const blackSlot = new THREE.Mesh(new THREE.BoxGeometry(pLen, 0.08, 0.07), blackSlotMat);
    blackSlot.position.set(px, 0.07, pz);
    pcieGroup.add(blackSlot);
  });

  // 2 Cream / Ivory-White Legacy 32-Bit PCI Slots at Bottom-Left (z = 0.86 & 1.02)
  [0.86, 1.02].forEach((pz) => {
    const ivorySlot = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.085, 0.075), ivorySlotMat);
    ivorySlot.position.set(-0.56, 0.072, pz);
    pcieGroup.add(ivorySlot);

    // Slot key divider notch
    const notch = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.09, 0.078), ivorySlotMat);
    notch.position.set(-0.18, 0.075, pz);
    pcieGroup.add(notch);
  });

  // Left-Edge Stainless Steel Rear I/O Port Shield Towers (x = -1.44)
  [
    [-1.44, 0.16, -0.88, 0.20, 0.26, 0.22, brushedSilverMat], // PS/2 & USB Tower
    [-1.44, 0.11, -0.58, 0.22, 0.14, 0.26, tealPortMat],      // Teal DB9 Serial Port
    [-1.44, 0.18, -0.28, 0.24, 0.30, 0.24, brushedSilverMat], // Dual USB + RJ45 LAN 1
    [-1.44, 0.18, 0.02, 0.24, 0.30, 0.24, brushedSilverMat],  // Dual USB + RJ45 LAN 2
    [-1.44, 0.16, 0.30, 0.20, 0.26, 0.18, brushedSilverMat]   // Audio Jack Stack
  ].forEach(([iox, ioy, ioz, iow, ioh, iod, ioMat]) => {
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(iow as number, ioh as number, iod as number),
      ioMat as THREE.Material
    );
    tower.position.set(iox as number, ioy as number, ioz as number);
    pcieGroup.add(tower);
  });

  // White 8-pin / 24-pin Power Header Blocks & Black SATA Ports along Board Edges
  const whitePwrLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.14), ivorySlotMat);
  whitePwrLeft.position.set(-1.32, 0.075, 0.32);
  pcieGroup.add(whitePwrLeft);

  const whitePwrRight = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.10, 0.18), ivorySlotMat);
  whitePwrRight.position.set(0.92, 0.08, 0.42);
  pcieGroup.add(whitePwrRight);

  // 4 Black SATA Ports along Bottom-Right Edge (z = 1.08)
  for (let sata = 0; sata < 4; sata++) {
    const sataPort = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, 0.06), blackSlotMat);
    sataPort.position.set(0.45 + sata * 0.17, 0.065, 1.08);
    pcieGroup.add(sataPort);
  }

  group.add(pcieGroup);

  // ============================================================================
  // SUBSYSTEM 5: EXTRUDED ALUMINUM NORTHBRIDGE/SOUTHBRIDGE & WORKSTATION GPU
  // ============================================================================
  const chipsetGroup = new THREE.Group();
  chipsetGroup.name = 'comp_chipset_m2';
  chipsetGroup.userData = { componentId: 'chipset_m2' };

  // 1. Tall Silver Extruded Aluminum Finned Northbridge Heatsink (Center of Board: x = -0.22, z = -0.18)
  const nbBase = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.05, 0.36), brushedSilverMat);
  nbBase.position.set(-0.22, 0.055, -0.18);
  chipsetGroup.add(nbBase);

  for (let f = -0.15; f <= 0.15; f += 0.05) {
    const nbFin = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.24, 0.016), brushedSilverMat);
    nbFin.position.set(-0.22, 0.18, -0.18 + f);
    chipsetGroup.add(nbFin);
  }

  // 2. Wide Silver Extruded Aluminum Finned Southbridge Heatsink (Lower-Right: x = 0.42, z = 0.62)
  const sbBase = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.40), brushedSilverMat);
  sbBase.position.set(0.42, 0.05, 0.62);
  chipsetGroup.add(sbBase);

  for (let f = -0.17; f <= 0.17; f += 0.048) {
    const sbFin = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.15, 0.016), brushedSilverMat);
    sbFin.position.set(0.42, 0.13, 0.62 + f);
    chipsetGroup.add(sbFin);
  }

  // Yellow & Purple Cylindrical Electrolytic Capacitors scattered around Northbridge & Southbridge
  [
    [-0.52, -0.24, yellowCapMat],
    [-0.46, -0.24, yellowCapMat],
    [-0.50, -0.15, yellowCapMat],
    [-0.44, -0.15, yellowCapMat],
    [0.24, 0.34, yellowCapMat],
    [0.31, 0.34, yellowCapMat],
    [0.48, 0.34, purpleCapMat],
    [0.58, 0.44, yellowCapMat],
    [0.65, 0.44, yellowCapMat],
    [0.74, 0.82, yellowCapMat],
    [0.81, 0.82, yellowCapMat],
    [0.76, 0.24, yellowCapMat]
  ].forEach(([cx, cz, cMat]) => {
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.028, 0.10, 14),
      cMat as THREE.Material
    );
    cap.position.set(cx as number, 0.08, cz as number);
    chipsetGroup.add(cap);
  });

  // 3. Companion Red-PCB Blower-Style Workstation Graphics Card (Laid out on Right Side of Board)
  const gpuHolder = new THREE.Group();
  gpuHolder.position.set(1.52, 0.02, -0.22);

  // Red GPU PCB
  const gpuPcb = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.035, 1.32), redGpuPcbMat);
  gpuHolder.add(gpuPcb);

  // Contoured Matte-Black Radial Blower Cooler Shroud
  const gpuShroud = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.14, 1.02), blackSlotMat);
  gpuShroud.position.set(0.02, 0.085, 0.08);
  gpuHolder.add(gpuShroud);

  // Rounded Front End of Blower Shroud with Circular Radial Fan Intake
  const shroudRound = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.26, 0.14, 24),
    blackSlotMat
  );
  shroudRound.position.set(0.02, 0.085, 0.58);
  gpuHolder.add(shroudRound);

  const fanWell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.17, 0.15, 24),
    darkSiliconMat
  );
  fanWell.position.set(0.02, 0.086, 0.54);
  gpuHolder.add(fanWell);

  const fanHub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.16, 16),
    blackSlotMat
  );
  fanHub.position.set(0.02, 0.088, 0.54);
  gpuHolder.add(fanHub);

  // Silver PCI Bracket with Blue VGA & White DVI Ports at back of GPU
  const gpuBracket = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.18, 0.03),
    brushedSilverMat
  );
  gpuBracket.position.set(0.0, 0.09, -0.66);
  gpuHolder.add(gpuBracket);

  const vgaPort = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.06), blueSlotMat);
  vgaPort.position.set(-0.16, 0.06, -0.68);
  gpuHolder.add(vgaPort);

  const dviPort = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.06, 0.06), ivorySlotMat);
  dviPort.position.set(0.10, 0.06, -0.68);
  gpuHolder.add(dviPort);

  chipsetGroup.add(gpuHolder);

  // 4. Companion 3.5-Inch Server Hard Disk Drive (Top-Right Corner, Inverted showing Green Controller Board & Spindle)
  const hddHolder = new THREE.Group();
  hddHolder.position.set(1.22, 0.04, -1.28);

  const hddChassis = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 0.78), darkSiliconMat);
  hddHolder.add(hddChassis);

  const hddPcb = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.02, 0.72), pcbEdgeMat);
  hddPcb.position.y = 0.045;
  hddHolder.add(hddPcb);

  const spindleHub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.025, 20),
    brushedSilverMat
  );
  spindleHub.position.set(0.06, 0.05, 0.08);
  hddHolder.add(spindleHub);

  chipsetGroup.add(hddHolder);

  group.add(chipsetGroup);
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
    if (fan) fan.position.z = factor * 0.85;
    const comp = group.getObjectByName('comp_compressors');
    if (comp) {
      comp.position.x = factor * 0.55;
      comp.position.y = -factor * 0.35;
    }
    const comb = group.getObjectByName('comp_combustor');
    if (comb) comb.position.z = 0;
    const turb = group.getObjectByName('comp_turbine');
    if (turb) turb.position.z = -factor * 0.65;
    const exh = group.getObjectByName('comp_exhaust_nozzle');
    if (exh) exh.position.z = -factor * 1.25;
  } else if (renderType === 'microchip_motherboard') {
    const cpu = group.getObjectByName('comp_cpu_socket');
    if (cpu) cpu.position.y = factor * 0.65;
    const vrm = group.getObjectByName('comp_vrm_heatsink');
    if (vrm) {
      vrm.position.y = factor * 0.45;
      vrm.position.x = factor * 0.35;
    }
    const ram = group.getObjectByName('comp_ram_slots');
    if (ram) {
      ram.position.y = factor * 0.55;
      ram.position.z = -factor * 0.25;
    }
    const pcie = group.getObjectByName('comp_pcie_lanes');
    if (pcie) {
      pcie.position.y = factor * 0.35;
      pcie.position.x = -factor * 0.25;
    }
    const chip = group.getObjectByName('comp_chipset_m2');
    if (chip) {
      chip.position.y = factor * 0.5;
      chip.position.x = factor * 0.3;
    }
  }
}
