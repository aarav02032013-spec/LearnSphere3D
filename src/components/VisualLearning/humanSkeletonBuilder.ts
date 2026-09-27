import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import skeletonGlbUrl from '../../assets/ecorche_-_skeleton.glb?url';

export interface SkeletonBuildOptions {
  wireframe?: boolean;
  xray?: boolean;
  explodeFactor?: number;
}

export interface SkeletonPartMetadata {
  name: string;
  category: string;
  function: string;
  fact: string;
  pinId: string;
}

// Anatomical region metadata mapped by 3D hit coordinates on the GLB model
export const SKELETON_REGIONS: Record<string, SkeletonPartMetadata> = {
  skull_cranium: {
    name: 'Skull (Cranium & Mandible — 22 Bones)',
    category: 'Axial Skeleton',
    function:
      'Encloses and protects the brain within the neurocranium while supporting the eyes, nasal cavity, and masticatory jaws.',
    fact: 'Consists of 8 cranial bones fused by sutures and 14 facial bones (only the mandible is freely movable).',
    pinId: 'skull_cranium'
  },
  thoracic_ribcage: {
    name: 'Thoracic Rib Cage, Sternum & Clavicles',
    category: 'Axial & Pectoral Skeleton',
    function:
      'Shields the heart, lungs, and great vessels while expanding and contracting during costal respiration; clavicles and scapulae anchor the upper limbs.',
    fact: '12 pairs of ribs: Pairs 1–7 True Ribs, Pairs 8–10 False (Vertebrochondral) Ribs, and Pairs 11–12 Floating Ribs.',
    pinId: 'thoracic_ribcage'
  },
  vertebral_column: {
    name: 'Vertebral Column (Spine — 26 Bones / 33 Vertebrae)',
    category: 'Axial Skeleton',
    function:
      'Central weight-bearing longitudinal axis protecting the spinal cord and absorbing axial loads via fibrocartilaginous intervertebral discs.',
    fact: 'Vertebral formula: C₇ T₁₂ L₅ S₍₅₎ Co₍₄₎ (33 embryonic vertebrae fusing into 26 adult bones).',
    pinId: 'vertebral_column'
  },
  upper_limbs: {
    name: 'Upper Limbs: Humerus, Radius, Ulna & Hands (60 Bones)',
    category: 'Appendicular Skeleton',
    function:
      'Provides ball-and-socket circumduction at the shoulder, hinge flexion at the elbow, forearm pronation/supination, and prehensile hand dexterity.',
    fact: 'Each upper limb contains 30 bones: 1 Humerus, 1 Radius, 1 Ulna, 8 Carpals, 5 Metacarpals, and 14 Phalanges.',
    pinId: 'upper_limbs'
  },
  pelvic_girdle: {
    name: 'Pelvic Girdle (Coxal / Hip Bones & Sacrum)',
    category: 'Appendicular Skeleton',
    function:
      'Transmits upper-body weight from the axial spine to the lower limbs via the deep acetabulum hip sockets and supports pelvic viscera.',
    fact: 'Each coxal bone forms by the fusion of three bones: Ilium, Ischium, and Pubis, meeting anteriorly at the pubic symphysis.',
    pinId: 'pelvic_girdle'
  },
  lower_limbs: {
    name: 'Lower Limbs: Femur, Patella, Tibia, Fibula & Feet (60 Bones)',
    category: 'Appendicular Skeleton',
    function:
      'Supports bipedal locomotion and full body weight via the femur (longest and strongest bone), sesamoid patella, tibia, fibula, and arched foot bones.',
    fact: 'Each lower limb contains 30 bones: 1 Femur, 1 Patella, 1 Tibia, 1 Fibula, 7 Tarsals, 5 Metatarsals, and 14 Phalanges.',
    pinId: 'lower_limbs'
  }
};

/**
 * Resolves which anatomical region of the GLB skeleton was hovered or clicked
 * based on the local/model-space (x, y) intersection coordinate.
 */
export function resolveSkeletonRegionFromPoint(x: number, y: number): SkeletonPartMetadata {
  if (y > 1.32) {
    return SKELETON_REGIONS.skull_cranium;
  }
  if (Math.abs(x) > 0.25 && y > -0.25 && y <= 1.32) {
    return SKELETON_REGIONS.upper_limbs;
  }
  if (y > 0.56) {
    return SKELETON_REGIONS.thoracic_ribcage;
  }
  if (y > 0.14) {
    return SKELETON_REGIONS.vertebral_column;
  }
  if (y > -0.26) {
    return SKELETON_REGIONS.pelvic_girdle;
  }
  return SKELETON_REGIONS.lower_limbs;
}

// Module-level cache so the 9.6MB GLB is fetched and parsed only once
let cachedGltfScene: THREE.Group | null = null;
let cachedCenter = new THREE.Vector3();
let cachedScale = 0.055156;
let loadingPromise: Promise<THREE.Group> | null = null;
let buildGeneration = 0;

function loadSkeletonGLB(): Promise<THREE.Group> {
  if (cachedGltfScene) {
    return Promise.resolve(cachedGltfScene);
  }
  if (loadingPromise) {
    return loadingPromise;
  }

  const loader = new GLTFLoader();
  loadingPromise = new Promise<THREE.Group>((resolve, reject) => {
    loader.load(
      skeletonGlbUrl,
      (gltf) => {
        const scene = gltf.scene;
        scene.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(scene);
        const size = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(cachedCenter);

        const targetHeight = 3.68;
        cachedScale = size.y > 0 ? targetHeight / size.y : 0.055156;
        cachedGltfScene = scene;
        resolve(scene);
      },
      undefined,
      (err) => {
        loadingPromise = null;
        reject(err);
      }
    );
  });

  return loadingPromise;
}

// Kick off preload immediately on module import
loadSkeletonGLB().catch(() => {});

function populateGroupFromCachedGLB(
  group: THREE.Group,
  templateScene: THREE.Group,
  opts: SkeletonBuildOptions
) {
  const explode = opts.explodeFactor || 0;
  const clonedRoot = templateScene.clone(true);

  clonedRoot.scale.setScalar(cachedScale);
  clonedRoot.position.set(
    -cachedCenter.x * cachedScale,
    -cachedCenter.y * cachedScale,
    -cachedCenter.z * cachedScale
  );

  let meshIndex = 0;
  clonedRoot.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh && mesh.isMesh) {
      const currentIdx = meshIndex++;
      mesh.userData = mesh.userData || {};
      mesh.userData.__preserveGeometry = true;
      mesh.userData.__hoverEmissiveIntensity = 0.18;
      mesh.userData.isSkeletonGLB = true;
      mesh.userData.partInfo =
        currentIdx === 0 ? SKELETON_REGIONS.thoracic_ribcage : SKELETON_REGIONS.upper_limbs;

      // Apply Explode / Layer Dissection offset between the two anatomical meshes in the GLB
      if (explode > 0) {
        const dir = currentIdx === 0 ? -1 : 1;
        mesh.position.x += dir * explode * 4.5;
      }

      // Clone material so wireframe / xray toggles do not mutate the cached GLB template
      const configureMat = (origMat: THREE.Material): THREE.Material => {
        const clonedMat = origMat.clone() as THREE.MeshStandardMaterial;
        clonedMat.side = THREE.DoubleSide;
        clonedMat.wireframe = !!opts.wireframe;

        if (opts.xray) {
          clonedMat.transparent = true;
          clonedMat.opacity = 0.44;
          clonedMat.depthWrite = false;
        } else {
          clonedMat.transparent = false;
          clonedMat.opacity = 1.0;
          clonedMat.depthWrite = true;
        }
        return clonedMat;
      };

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map(configureMat);
      } else if (mesh.material) {
        mesh.material = configureMat(mesh.material);
      }
    }
  });

  group.add(clonedRoot);
}

/**
 * Builds the 3D Human Skeletal System using `/src/assets/ecorche_-_skeleton.glb`.
 */
export function buildHumanSkeleton3D(
  group: THREE.Group,
  opts: SkeletonBuildOptions
) {
  const currentGen = ++buildGeneration;
  group.userData = group.userData || {};
  group.userData.__skeletonGen = currentGen;

  if (cachedGltfScene) {
    populateGroupFromCachedGLB(group, cachedGltfScene, opts);
    return;
  }

  loadSkeletonGLB()
    .then((scene) => {
      if (group.userData?.__skeletonGen !== currentGen) return;
      while (group.children.length > 0) {
        group.remove(group.children[0]);
      }
      populateGroupFromCachedGLB(group, scene, opts);
    })
    .catch((err) => {
      console.error('Failed to load ecorche_-_skeleton.glb:', err);
    });
}
