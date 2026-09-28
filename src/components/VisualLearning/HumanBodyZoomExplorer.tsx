import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  FileText,
  CheckCircle2,
  ChevronRight,
  Compass,
  Maximize2,
  Layers
} from 'lucide-react';

export interface ZoomHotspot {
  id: string;
  name: string;
  x: number; // percentage 0..100
  y: number; // percentage 0..100
  role: string;
  details: string;
  ncertFact: string;
  isPortalToNext?: boolean;
}

export interface BiologicalZoomLevel {
  index: number;
  id: string;
  shortTitle: string;
  title: string;
  hierarchyRank: string;
  magnificationLabel: string;
  physicalScale: string;
  portalTargetName: string;
  portalCoords: { x: number; y: number }; // percentage 0..100 where next level emerges
  summary: string;
  ncertChapter: string;
  keyPrinciples: string[];
  hotspots: ZoomHotspot[];
}

export const BIOLOGICAL_ZOOM_LEVELS: BiologicalZoomLevel[] = [
  {
    index: 0,
    id: 'organism',
    shortTitle: '1. Human Body',
    title: 'Human Organism (Surface & Regional Anatomy)',
    hierarchyRank: 'Level 1 · Organism',
    magnificationLabel: '1×',
    physicalScale: '1.7 m',
    portalTargetName: 'Thoracic & Abdominopelvic Organ Systems',
    portalCoords: { x: 50, y: 38 },
    summary:
      'The complete human organism is the highest level of individual biological organization, integrating 11 coordinated organ systems within dorsal (cranial/vertebral) and ventral (thoracic/abdominopelvic) body cavities.',
    ncertChapter: 'Class 11 Biology · Structural Organisation & Human Physiology',
    keyPrinciples: [
      'Bilateral symmetry with cephalization and segmented axial/appendicular skeleton',
      'Homeostasis maintained via negative feedback loops across nervous and endocrine systems',
      'Ventral body cavity divided by the muscular diaphragm into thoracic and abdominopelvic cavities'
    ],
    hotspots: [
      {
        id: 'cranial_region',
        name: 'Cranial Cavity (Cephalic Region)',
        x: 50,
        y: 11,
        role: 'Houses and protects the central encephalon (brain) and special sense organs.',
        details:
          'Encased by the 8 fused bones of the neurocranium and cushioned by three meningeal membranes and cerebrospinal fluid (CSF).',
        ncertFact: 'Human brain consumes ~20% of total body oxygen despite being ~2% of body mass.'
      },
      {
        id: 'thoracic_portal',
        name: 'Thoracic Cavity (Chest & Mediastinum)',
        x: 50,
        y: 32,
        role: 'Protected by the 12 pairs of ribs and sternum; encloses the lungs and heart.',
        details:
          'Subdivided into left/right pleural cavities housing the lungs and the central mediastinum containing the pericardial heart, trachea, and great vessels.',
        ncertFact: 'Zoom in here to peel back the skin and musculature to reveal the internal Organ Systems.',
        isPortalToNext: true
      },
      {
        id: 'abdominopelvic_region',
        name: 'Abdominopelvic Cavity',
        x: 50,
        y: 47,
        role: 'Contains the major digestive, hepatic, renal, and reproductive viscera.',
        details:
          'Lined by the serous peritoneum; houses the stomach, liver, gallbladder, pancreas, spleen, small/large intestines, kidneys, and urinary bladder.',
        ncertFact: 'Separated superiorly from the thoracic cavity by the dome-shaped diaphragm.'
      },
      {
        id: 'upper_extremity',
        name: 'Upper Appendicular Limb',
        x: 27,
        y: 38,
        role: 'Specialized for wide-range manipulation, locomotion, and prehensile grasping.',
        details:
          'Anchored by the pectoral girdle (clavicle & scapula) and articulated through the humerus, radius, ulna, carpals, metacarpals, and phalanges.',
        ncertFact: 'Each upper limb contains exactly 30 bones (60 in total).'
      },
      {
        id: 'lower_extremity',
        name: 'Lower Appendicular Limb',
        x: 42,
        y: 74,
        role: 'Supports bipedal posture, upright balance, and high-load locomotion.',
        details:
          'Articulates with the pelvic acetabulum via the femur, patella, tibia, fibula, tarsals, metatarsals, and phalanges.',
        ncertFact: 'The femur is the longest, heaviest, and strongest bone in the human body.'
      }
    ]
  },
  {
    index: 1,
    id: 'organ_systems',
    shortTitle: '2. Organ Systems',
    title: 'Integrated Human Organ Systems',
    hierarchyRank: 'Level 2 · Organ Systems',
    magnificationLabel: '5×',
    physicalScale: '40 cm',
    portalTargetName: 'Human Heart (Cardiovascular Organ)',
    portalCoords: { x: 52, y: 36 },
    summary:
      'Zooming beneath the integumentary and muscular layers reveals the interconnected human organ systems: the Respiratory lungs, Cardiovascular heart and great vessels, Nervous brain/spinal axis, Digestive tract, and Renal excretory organs.',
    ncertChapter: 'Class 11 Biology · Units V: Human Physiology (Chapters 17–22)',
    keyPrinciples: [
      'Cardiovascular & Respiratory systems couple at the alveolar-capillary membrane for O₂/CO₂ exchange',
      'Digestive & Hepatic portal systems absorb macromolecules and regulate blood glucose',
      'Renal system filters ~180 L of plasma daily to regulate osmolarity, pH, and blood pressure'
    ],
    hotspots: [
      {
        id: 'nervous_system',
        name: 'Central Nervous System (Brain & Spinal Cord)',
        x: 50,
        y: 12,
        role: 'Master neural command center integrating sensory input and motor output.',
        details:
          'Comprises the cerebrum, cerebellum, brainstem, and spinal cord transmitting rapid electrochemical action potentials.',
        ncertFact: 'Contains ~86 billion neurons connected by trillions of chemical and electrical synapses.'
      },
      {
        id: 'respiratory_lungs',
        name: 'Respiratory System (Trachea, Bronchi & Lungs)',
        x: 38,
        y: 34,
        role: 'Conducts atmospheric air to 300 million alveoli for pulmonary gas exchange.',
        details:
          'Right lung has 3 lobes; left lung has 2 lobes (with the cardiac notch accommodating the heart apex).',
        ncertFact: 'Total alveolar surface area spans ~80–100 m² for rapid diffusion of O₂ and CO₂.'
      },
      {
        id: 'cardiovascular_heart_portal',
        name: 'Cardiovascular System (Heart & Great Vessels)',
        x: 52,
        y: 36,
        role: 'Muscular double-pump driving pulmonary and systemic blood circulation.',
        details:
          'Pumps deoxygenated blood to the lungs via the pulmonary trunk and oxygenated blood to the body via the aorta.',
        ncertFact: 'Cardiac Output = Stroke Volume (70 mL) × Heart Rate (72 bpm) ≈ 5.04 Liters/minute.',
        isPortalToNext: true
      },
      {
        id: 'digestive_liver_stomach',
        name: 'Digestive System (Liver, Stomach & Intestines)',
        x: 44,
        y: 52,
        role: 'Mechanical and enzymatic breakdown of food, nutrient absorption, and detoxification.',
        details:
          'The liver (right hypochondrium) secretes bile; the J-shaped stomach digests proteins via pepsin and HCl; intestinal villi absorb nutrients.',
        ncertFact: 'The liver is the largest internal gland (~1.5 kg) in the human body.'
      },
      {
        id: 'excretory_kidneys',
        name: 'Excretory System (Paired Kidneys & Ureters)',
        x: 58,
        y: 60,
        role: 'Homeostatic filtration of blood plasma, nitrogenous urea excretion, and osmoregulation.',
        details:
          'Retroperitoneal bean-shaped organs each housing ~1 million microscopic nephron filtration units.',
        ncertFact: 'Glomerular Filtration Rate (GFR) in a healthy adult is 125 mL/min (180 L/day).'
      }
    ]
  },
  {
    index: 2,
    id: 'organ_heart',
    shortTitle: '3. Organ (Heart)',
    title: 'Individual Organ: The Four-Chambered Human Heart',
    hierarchyRank: 'Level 3 · Organ',
    magnificationLabel: '25×',
    physicalScale: '12 cm',
    portalTargetName: 'Myocardial Muscle Tissue & Capillaries',
    portalCoords: { x: 63, y: 62 },
    summary:
      'An organ is composed of multiple tissue types (muscular, epithelial, connective, nervous) working as a structural unit. The human heart features four chambers, unidirectional valves, a nodal conduction system, and a thick contractile myocardium.',
    ncertChapter: 'Class 11 Biology · Chapter 18: Body Fluids and Circulation',
    keyPrinciples: [
      'Complete separation of oxygenated (left side) and deoxygenated (right side) blood via septa',
      'Myogenic automaticity initiated by the Sinoatrial (SA) Node ("Pacemaker") in the right atrium',
      'Left ventricular wall is 3× thicker than the right to generate high systemic arterial pressure (120 mmHg)'
    ],
    hotspots: [
      {
        id: 'sinoatrial_right_atrium',
        name: 'Right Atrium & Sinoatrial (SA) Node',
        x: 34,
        y: 38,
        role: 'Receives deoxygenated blood from Venae Cavae and initiates the heartbeat impulse.',
        details:
          'The SA node in the upper right corner generates 70–75 action potentials per minute, setting the sinus rhythm.',
        ncertFact: 'The SA node is called the natural pacemaker of the myogenic human heart.'
      },
      {
        id: 'aortic_arch',
        name: 'Aortic Arch & Semilunar Valves',
        x: 49,
        y: 20,
        role: 'Main systemic artery distributing oxygenated blood from the left ventricle to the body.',
        details:
          'Guarded at its base by the aortic semilunar valve, which snaps shut during diastole (producing the "Dub" S2 heart sound).',
        ncertFact: 'Closure of AV valves produces "Lub" (S1); closure of semilunar valves produces "Dub" (S2).'
      },
      {
        id: 'left_atrium_mitral',
        name: 'Left Atrium & Bicuspid (Mitral) Valve',
        x: 64,
        y: 39,
        role: 'Receives freshly oxygenated blood from the four pulmonary veins.',
        details:
          'Channels blood into the left ventricle through the two-cusped bicuspid (mitral) valve anchored by chordae tendineae.',
        ncertFact: 'Prevented from everting into the atrium by papillary muscles and chordae tendineae.'
      },
      {
        id: 'right_ventricle',
        name: 'Right Ventricle & Tricuspid Valve',
        x: 39,
        y: 62,
        role: 'Pumps deoxygenated blood through the pulmonary artery to the lungs for oxygenation.',
        details:
          'Separated from the right atrium by the three-cusped tricuspid valve and from the left ventricle by the interventricular septum.',
        ncertFact: 'Drives the low-pressure pulmonary circulation.'
      },
      {
        id: 'left_ventricle_myocardium_portal',
        name: 'Left Ventricular Myocardium (Heart Wall)',
        x: 63,
        y: 62,
        role: 'Thick muscular chamber wall generating high-pressure systemic blood ejection.',
        details:
          'Composed of densely vascularized cardiac muscle tissue rich in mitochondria and coronary capillary networks.',
        ncertFact: 'Zoom into the ventricular wall to inspect Microscopic Cardiac Tissue & Capillaries.',
        isPortalToNext: true
      }
    ]
  },
  {
    index: 3,
    id: 'tissue_myocardium',
    shortTitle: '4. Tissue',
    title: 'Biological Tissue: Striated Cardiac Muscle & Capillary Bed',
    hierarchyRank: 'Level 4 · Tissue',
    magnificationLabel: '250×',
    physicalScale: '500 µm',
    portalTargetName: 'Single Eukaryotic Human Cell',
    portalCoords: { x: 50, y: 48 },
    summary:
      'A tissue is an ensemble of similar specialized cells and their extracellular matrix performing a common function. Here, branched striated cardiomyocytes interlock via intercalated discs alongside endothelial blood capillaries.',
    ncertChapter: 'Class 11 Biology · Chapter 7: Structural Organisation in Animals',
    keyPrinciples: [
      'Branched, cylindrical, uninucleate striated muscle fibers that never fatigue',
      'Intercalated discs contain gap junctions (electrical coupling) and desmosomes (mechanical adhesion)',
      'Functional syncytium: excitation waves spread rapidly from cell to cell across gap junctions'
    ],
    hotspots: [
      {
        id: 'intercalated_disc',
        name: 'Intercalated Disc (Gap Junctions & Desmosomes)',
        x: 35,
        y: 44,
        role: 'Specialized cell-to-cell junction uniting adjacent cardiac muscle cells.',
        details:
          'Desmosomes prevent cells from pulling apart under contractile stress; gap junctions allow Na⁺/Ca²⁺ ions to flow freely between cells.',
        ncertFact: 'Unique histological hallmark of cardiac muscle tissue—absent in skeletal and smooth muscle.'
      },
      {
        id: 'cardiomyocyte_portal',
        name: 'Nucleated Cardiomyocyte (Human Cell)',
        x: 50,
        y: 48,
        role: 'Individual contractile human cell packed with myofibrils and mitochondria.',
        details:
          'Contains a central oval nucleus, sarcoplasmic reticulum, and sarcomere striations (alternating A-bands and I-bands of actin and myosin).',
        ncertFact: 'Zoom into this individual cell to explore its internal Eukaryotic Organelles.',
        isPortalToNext: true
      },
      {
        id: 'coronary_capillary',
        name: 'Coronary Capillary & Erythrocytes (RBCs)',
        x: 52,
        y: 23,
        role: 'Single-cell-thick squamous endothelial microvessel delivering O₂ and glucose.',
        details:
          'Biconcave disc-shaped red blood cells (7.5 µm diameter) squeeze in single file through the lumen, unloading oxygen from oxyhemoglobin.',
        ncertFact: 'Every cardiac muscle fiber is flanked by multiple capillaries to sustain aerobic respiration.'
      },
      {
        id: 'striated_sarcomeres',
        name: 'Actin–Myosin Striations (Sarcomeres)',
        x: 68,
        y: 62,
        role: 'Repeating contractile units between Z-lines that slide via ATP hydrolysis.',
        details:
          'Calcium influx triggers troponin-tropomyosin shift, allowing myosin heads to form cross-bridges with actin filaments.',
        ncertFact: 'Follows the Sliding Filament Theory of muscle contraction (Huxley & Huxley).'
      }
    ]
  },
  {
    index: 4,
    id: 'human_cell',
    shortTitle: '5. Human Cell',
    title: 'The Eukaryotic Human Cell & Cytoplasmic Organelles',
    hierarchyRank: 'Level 5 · Cell',
    magnificationLabel: '2,500×',
    physicalScale: '20 µm',
    portalTargetName: 'Mitochondrion & Nuclear Chromatin',
    portalCoords: { x: 50, y: 48 },
    summary:
      'The cell is the fundamental structural and functional unit of all living organisms (Schleiden, Schwann & Virchow). The eukaryotic human cell compartmentalizes biochemical pathways inside membrane-bound organelles.',
    ncertChapter: 'Class 11 Biology · Chapter 8: Cell: The Unit of Life',
    keyPrinciples: [
      'Fluid Mosaic Plasma Membrane (Singer & Nicolson): phospholipid bilayer with integral/peripheral proteins',
      'Endomembrane system coordinates protein synthesis and trafficking (ER → Golgi → Lysosomes/Vesicles)',
      'Double-membrane Nucleus houses the diploid human genome (46 chromosomes / 23 pairs)'
    ],
    hotspots: [
      {
        id: 'nucleus_portal',
        name: 'Nucleus, Nucleolus & Nuclear Envelope',
        x: 50,
        y: 48,
        role: 'Control center of the cell containing genetic chromatin (DNA + Histones) and rRNA synthesis.',
        details:
          'Surrounded by a double-layered nuclear membrane perforated by nuclear pore complexes regulating mRNA and protein transport.',
        ncertFact: 'Discovered by Robert Brown (1831); zoom in to inspect Chromatin & Mitochondria at 25,000×.',
        isPortalToNext: true
      },
      {
        id: 'mitochondria_organelle',
        name: 'Mitochondria (Powerhouse of the Cell)',
        x: 28,
        y: 40,
        role: 'Generates cellular ATP via the Krebs cycle and oxidative phosphorylation.',
        details:
          'Semi-autonomous double-membrane organelle possessing its own circular dsDNA and 70S ribosomes.',
        ncertFact: 'Divide by fission and synthesize ~30–32 ATP molecules per glucose molecule.'
      },
      {
        id: 'rough_er',
        name: 'Rough Endoplasmic Reticulum (RER & 80S Ribosomes)',
        x: 35,
        y: 64,
        role: 'Synthesizes and folds secretory, lysosomal, and membrane proteins.',
        details:
          'Continuous with the outer nuclear membrane; studded with 80S ribosomes (60S + 40S subunits).',
        ncertFact: 'Smooth ER (SER) lacks ribosomes and synthesizes lipids and steroid hormones.'
      },
      {
        id: 'golgi_apparatus',
        name: 'Golgi Apparatus (Cis & Trans Cisternae)',
        x: 68,
        y: 36,
        role: 'Post-translational modification (glycosylation), sorting, and packaging of proteins.',
        details:
          'Proteins enter the convex cis (forming) face from the ER and exit in vesicles from the concave trans (maturing) face.',
        ncertFact: 'First observed by Camillo Golgi (1898); primary site of glycoprotein and glycolipid synthesis.'
      },
      {
        id: 'plasma_membrane',
        name: 'Plasma Membrane & Lysosomes',
        x: 74,
        y: 62,
        role: 'Selectively permeable phospholipid bilayer boundary; lysosomes digest macromolecules.',
        details:
          'Lysosomes ("suicidal bags") contain ~50 acid hydrolase enzymes active at pH 4.5–5.0 for intracellular autophagy.',
        ncertFact: 'Animal cells contain centrioles (9+0 triplet microtubule organization) and lack cell walls.'
      }
    ]
  },
  {
    index: 5,
    id: 'organelle_chromatin',
    shortTitle: '6. Organelle & Chromatin',
    title: 'Sub-Cellular Ultrastructure: Chromosomes & Mitochondrial Cristae',
    hierarchyRank: 'Level 6 · Organelle / Supramolecular',
    magnificationLabel: '25,000×',
    physicalScale: '200 nm',
    portalTargetName: 'DNA Double Helix & Base Pairs',
    portalCoords: { x: 38, y: 50 },
    summary:
      'At electron-microscope resolution (200 nm), we observe how a 2-meter-long human genome is packaged inside the nucleus around histone octamers (nucleosomes) into chromosomes, alongside the ATP-generating cristae of the mitochondrion.',
    ncertChapter: 'Class 12 Biology · Chapter 6: Molecular Basis of Inheritance',
    keyPrinciples: [
      'Nucleosome "Beads-on-a-String": 200 bp of negatively charged DNA wrapped 1.75 turns around positively charged Histone Octamer',
      'Chromatin condenses into 30 nm solenoid fibers and metaphase sister chromatids joined at the centromere',
      'Mitochondrial inner membrane cristae house the Electron Transport Chain (Complexes I–IV) and F₀–F₁ ATP Synthase'
    ],
    hotspots: [
      {
        id: 'chromosome_chromatin_portal',
        name: 'Condensed Chromosome & Uncoiling Chromatin Fiber',
        x: 34,
        y: 44,
        role: 'Packages genetic information into 23 homologous chromosome pairs in human somatic cells.',
        details:
          'Telomeres cap the ends; the primary constriction (centromere) bears disc-shaped kinetochores for spindle attachment.',
        ncertFact: 'Zoom into the uncoiling nucleosome fiber to reach the 2 nm DNA Double Helix!',
        isPortalToNext: true
      },
      {
        id: 'nucleosome_histone',
        name: 'Nucleosome Core (Histone Octamer H2A, H2B, H3, H4)',
        x: 52,
        y: 66,
        role: 'Fundamental packing unit of eukaryotic chromatin.',
        details:
          'Histones are rich in basic amino acids Lysine and Arginine (positively charged), binding tightly to the negatively charged phosphate backbone of DNA.',
        ncertFact: 'A typical diploid human nucleus contains ~3.3 × 10⁷ nucleosomes.'
      },
      {
        id: 'mitochondrial_cristae',
        name: 'Mitochondrial Cristae & Matrix',
        x: 72,
        y: 42,
        role: 'Infoldings of the inner mitochondrial membrane that maximize surface area for chemiosmosis.',
        details:
          'Proton pumping across the inner membrane creates an electrochemical H⁺ gradient (proton-motive force) across the intermembrane space.',
        ncertFact: 'The mitochondrial matrix contains circular DNA, RNA, 70S ribosomes, and Krebs cycle enzymes.'
      },
      {
        id: 'atp_synthase',
        name: 'F₀–F₁ ATP Synthase (Oxysomes)',
        x: 76,
        y: 62,
        role: 'Rotary molecular motor synthesizing ATP from ADP + Pi as protons flow back into the matrix.',
        details:
          'F₀ is an integral membrane proton channel; F₁ is the peripheral catalytic headpiece protruding into the matrix.',
        ncertFact: 'Chemiosmotic Hypothesis was formulated by Peter Mitchell (1961).'
      }
    ]
  },
  {
    index: 6,
    id: 'dna_molecule',
    shortTitle: '7. DNA & Atoms',
    title: 'Molecular & Atomic Scale: DNA Double Helix (2 nm)',
    hierarchyRank: 'Level 7 · Biomolecule & Atoms',
    magnificationLabel: '1,000,000×',
    physicalScale: '2 nm',
    portalTargetName: 'Maximum Atomic Resolution Reached',
    portalCoords: { x: 50, y: 50 },
    summary:
      'At one million times magnification (nanometer scale), the chromatin fiber resolves into the Watson–Crick B-DNA Double Helix (2.0 nm diameter) composed of antiparallel polynucleotide chains held together by hydrogen bonds between purine and pyrimidine bases.',
    ncertChapter: 'Class 12 Biology · Chapter 6: Molecular Basis of Inheritance',
    keyPrinciples: [
      'Two antiparallel polynucleotide strands (5′ → 3′ and 3′ → 5′) with a sugar-phosphate-phosphodiester backbone',
      'Complementary base pairing (Chargaff’s Rule): Adenine = Thymine (2 H-bonds), Guanine ≡ Cytosine (3 H-bonds)',
      'Helical pitch = 3.4 nm per complete turn (~10 base pairs per turn; 0.34 nm rise between adjacent base pairs)'
    ],
    hotspots: [
      {
        id: 'sugar_phosphate_backbone',
        name: 'Antiparallel Sugar–Phosphate Backbone (5′ → 3′)',
        x: 31,
        y: 35,
        role: 'Forms the exterior structural rails of the double helix via 3′–5′ phosphodiester bonds.',
        details:
          'Composed of alternating 2′-deoxyribose pentose sugars and negatively charged phosphate (PO₄³⁻) groups.',
        ncertFact: 'One strand runs 5′ → 3′ while the complementary strand runs 3′ → 5′ in antiparallel orientation.'
      },
      {
        id: 'at_base_pair',
        name: 'Adenine = Thymine Base Pair (2 Hydrogen Bonds)',
        x: 50,
        y: 44,
        role: 'Purine–Pyrimidine complementary rung bridged by two electrostatic hydrogen bonds.',
        details:
          'Adenine (two-ring purine) always pairs opposite Thymine (single-ring pyrimidine) to maintain a uniform 2.0 nm helix diameter.',
        ncertFact: 'In RNA, Uracil (5-demethylated thymine) replaces Thymine.'
      },
      {
        id: 'gc_base_pair',
        name: 'Guanine ≡ Cytosine Base Pair (3 Hydrogen Bonds)',
        x: 50,
        y: 62,
        role: 'High-stability Purine–Pyrimidine rung bridged by three hydrogen bonds.',
        details:
          'DNA regions rich in G≡C base pairs have a higher melting temperature (Tm) due to the third hydrogen bond.',
        ncertFact: 'Chargaff’s Rule: [A] + [G] = [T] + [C], and [A]/[T] = [G]/[C] = 1 in dsDNA.'
      },
      {
        id: 'atomic_nucleotides',
        name: 'Covalent Atomic Geometry (C, H, O, N, P Atoms)',
        x: 69,
        y: 50,
        role: 'Fundamental chemical elements forming every nucleotide monomer.',
        details:
          'Phosphorus (P) sits at the center of the phosphate tetrahedron; Nitrogen (N) and Carbon (C) form the aromatic heterocyclic rings of the bases.',
        ncertFact: 'B-DNA helical pitch = 3.4 nm (34 Å); distance between stacked base pairs = 0.34 nm (3.4 Å).'
      }
    ]
  }
];

interface HumanBodyZoomExplorerProps {
  onAddNote: (
    title: string,
    subject: 'Biology' | 'Physics' | 'Chemistry' | 'Mathematics',
    content: string,
    tags: string[],
    labRef: string
  ) => void;
}

export const HumanBodyZoomExplorer: React.FC<HumanBodyZoomExplorerProps> = ({ onAddNote }) => {
  // Continuous zoom value from 0.0 (Level 1: Organism) to 6.0 (Level 7: DNA & Atoms)
  const [zoomValue, setZoomValue] = useState<number>(0);
  const [targetZoom, setTargetZoom] = useState<number | null>(null);
  const [isAutoTouring, setIsAutoTouring] = useState<boolean>(false);
  const [selectedHotspot, setSelectedHotspot] = useState<ZoomHotspot>(
    BIOLOGICAL_ZOOM_LEVELS[0].hotspots[1]
  );
  const [organSystemFilter, setOrganSystemFilter] = useState<
    'all' | 'circulatory' | 'respiratory' | 'digestive' | 'nervous'
  >('all');
  const [labelDisplayMode, setLabelDisplayMode] = useState<'margin' | 'pins' | 'hidden'>('margin');
  const [noteSaved, setNoteSaved] = useState<boolean>(false);

  const viewportRef = useRef<HTMLDivElement>(null);

  // Active discrete level index (nearest integer 0..6)
  const activeLevelIndex = Math.min(
    BIOLOGICAL_ZOOM_LEVELS.length - 1,
    Math.max(0, Math.round(zoomValue))
  );
  const activeLevel = BIOLOGICAL_ZOOM_LEVELS[activeLevelIndex];

  // Fractional progress between floorLevel and ceilLevel for smooth concentric optical zoom
  const baseIndex = Math.min(BIOLOGICAL_ZOOM_LEVELS.length - 1, Math.max(0, Math.floor(zoomValue)));
  const nextIndex = Math.min(BIOLOGICAL_ZOOM_LEVELS.length - 1, baseIndex + 1);
  const frac = zoomValue - baseIndex;

  // Keep selectedHotspot synchronized when crossing into a new biological scale level
  const prevLevelIndexRef = useRef<number>(activeLevelIndex);
  useEffect(() => {
    if (prevLevelIndexRef.current !== activeLevelIndex) {
      prevLevelIndexRef.current = activeLevelIndex;
      const lvl = BIOLOGICAL_ZOOM_LEVELS[activeLevelIndex];
      const portalSpot = lvl.hotspots.find((h) => h.isPortalToNext) || lvl.hotspots[0];
      if (portalSpot) {
        setSelectedHotspot(portalSpot);
      }
    }
  }, [activeLevelIndex]);

  // Smooth spring animation toward targetZoom when clicking a level or portal
  useEffect(() => {
    if (targetZoom === null) return;
    let rafId: number;
    const step = () => {
      setZoomValue((prev) => {
        const diff = targetZoom - prev;
        if (Math.abs(diff) < 0.012) {
          setTargetZoom(null);
          return targetZoom;
        }
        return prev + diff * 0.14;
      });
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [targetZoom]);

  // Auto-Dive Journey animation through all 7 biological scales
  useEffect(() => {
    if (!isAutoTouring) return;
    let rafId: number;
    let lastTime = performance.now();
    const animateTour = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setZoomValue((prev) => {
        const next = prev + dt * 0.42;
        if (next >= 6) {
          setIsAutoTouring(false);
          return 6;
        }
        return next;
      });
      rafId = requestAnimationFrame(animateTour);
    };
    rafId = requestAnimationFrame(animateTour);
    return () => cancelAnimationFrame(rafId);
  }, [isAutoTouring]);

  // Native wheel listener on the viewport so scrolling smoothly zooms in/out without page scroll
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsAutoTouring(false);
      setTargetZoom(null);
      const delta = -e.deltaY * 0.0022;
      setZoomValue((prev) => Math.max(0, Math.min(6, prev + delta)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const jumpToLevel = (idx: number) => {
    setIsAutoTouring(false);
    setTargetZoom(Math.max(0, Math.min(6, idx)));
  };

  // Compute interpolated magnification number (1x to 1,000,000x)
  const magnificationNumeric = Math.round(Math.pow(10, zoomValue));
  const formattedMagnification =
    magnificationNumeric >= 1000
      ? `${magnificationNumeric.toLocaleString()}×`
      : `${Math.max(1, magnificationNumeric)}×`;

  const handleSaveNote = () => {
    const content = `### Human Body Multiscale Hierarchy: ${activeLevel.title}
**Biological Level**: ${activeLevel.hierarchyRank} (${activeLevel.magnificationLabel} · Scale: ${activeLevel.physicalScale})
**NCERT Reference**: ${activeLevel.ncertChapter}

${activeLevel.summary}

#### Labeled Structures at this Scale:
${activeLevel.hotspots
  .map((h) => `- **${h.name}**: ${h.role} ${h.details} *(NCERT Fact: ${h.ncertFact})*`)
  .join('\n')}

#### Core Principles:
${activeLevel.keyPrinciples.map((p) => `- ${p}`).join('\n')}

#### Complete 7-Level Biological Zoom Pathway:
${BIOLOGICAL_ZOOM_LEVELS.map(
  (l) => `${l.index + 1}. **${l.shortTitle}** (${l.magnificationLabel} · ${l.physicalScale}) — ${l.title}`
).join('\n')}
`;

    onAddNote(
      `Body Zoom: ${activeLevel.shortTitle} (${activeLevel.magnificationLabel})`,
      'Biology',
      content,
      ['Biology', 'Human Anatomy', activeLevel.hierarchyRank, 'NCERT'],
      `Visual Learning · Human Body Zoom`
    );
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2500);
  };

  const baseLevel = BIOLOGICAL_ZOOM_LEVELS[baseIndex];

  // Base layer optical transform: scales up around its portalCoords as frac goes 0 -> 1
  const baseScale = 1 + frac * 3.4;
  const baseOpacity = baseIndex === nextIndex ? 1 : Math.max(0, 1 - Math.pow(frac, 1.35));

  // Next layer optical transform: emerges from the portal center and scales from 0.22 -> 1.0
  const nextScale = 0.22 + frac * 0.78;
  const nextOpacity = baseIndex === nextIndex ? 0 : Math.min(1, Math.pow(frac, 0.75));

  return (
    <div className="space-y-5">
      {/* Top 7-Stage Biological Scale Stepper Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-cyan-300">Powers of Ten · Biological Organization</span>
              <span aria-hidden="true">·</span>
              <span>Scroll wheel or click any scale level to dive from Organism (1.7 m) to DNA (2 nm)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (isAutoTouring) {
                  setIsAutoTouring(false);
                } else {
                  if (zoomValue >= 5.9) setZoomValue(0);
                  setTargetZoom(null);
                  setIsAutoTouring(true);
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isAutoTouring
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
              }`}
            >
              {isAutoTouring ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoTouring ? 'Pause Auto-Dive' : 'Auto-Dive Journey (1× → 1,000,000×)'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveNote}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                noteSaved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {noteSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
              <span>{noteSaved ? 'Saved to Notes!' : 'Save Scale to Notes'}</span>
            </button>
          </div>
        </div>

        {/* 7 Scale Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {BIOLOGICAL_ZOOM_LEVELS.map((lvl) => {
            const isCurrent = lvl.index === activeLevelIndex;
            const isPassed = lvl.index < activeLevelIndex;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => jumpToLevel(lvl.index)}
                className={`group text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-lg shadow-cyan-950/50'
                    : isPassed
                    ? 'bg-slate-900/90 border-cyan-500/30 text-slate-300 hover:border-cyan-400/60'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                  <span className={isCurrent ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                    {lvl.magnificationLabel}
                  </span>
                  <span className="text-slate-400">{lvl.physicalScale}</span>
                </div>
                <div className="text-xs font-semibold truncate">{lvl.shortTitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Workspace: Interactive Deep-Zoom Viewport (Left 8 cols) + Inspector Panel (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Deep-Zoom Interactive Viewport */}
        <div className="lg:col-span-8 bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          {/* Top HUD Overlay Bar */}
          <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-cyan-400 font-semibold">{activeLevel.hierarchyRank}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-slate-300">
                  Magnification: <strong className="text-cyan-300">{formattedMagnification}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-amber-300">Field Scale: {activeLevel.physicalScale}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-display font-bold text-white mt-0.5">
                {activeLevel.title}
              </h2>
            </div>

            {/* Organ System Sub-Filter when on Level 2 (Organ Systems) */}
            {activeLevelIndex === 1 && (
              <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px]">
                {(
                  [
                    { id: 'all', label: 'All Systems' },
                    { id: 'circulatory', label: 'Circulatory' },
                    { id: 'respiratory', label: 'Respiratory' },
                    { id: 'digestive', label: 'Digestive' },
                    { id: 'nervous', label: 'Nervous' }
                  ] as const
                ).map((sys) => (
                  <button
                    key={sys.id}
                    type="button"
                    onClick={() => setOrganSystemFilter(sys.id)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      organSystemFilter === sys.id
                        ? 'bg-cyan-500 text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {sys.label}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Step Zoom Out / In & Label Mode Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Label Visibility Mode Switcher */}
              <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] mr-1">
                {(
                  [
                    { id: 'margin', label: 'Side Labels' },
                    { id: 'pins', label: 'Pins Only' },
                    { id: 'hidden', label: 'Hide Labels' }
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setLabelDisplayMode(mode.id)}
                    className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      labelDisplayMode === mode.id
                        ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={zoomValue <= 0.01}
                onClick={() => jumpToLevel(Math.max(0, activeLevelIndex - 1))}
                title="Zoom Out to Previous Level"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zoom Out</span>
              </button>
              <button
                type="button"
                disabled={zoomValue >= 5.99}
                onClick={() => jumpToLevel(Math.min(6, activeLevelIndex + 1))}
                title="Zoom In to Next Deeper Level"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 text-xs font-bold shadow-sm cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>
                  {activeLevelIndex < 6
                    ? `Zoom In: ${BIOLOGICAL_ZOOM_LEVELS[activeLevelIndex + 1].shortTitle.split('. ')[1]}`
                    : 'Max Zoom'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => jumpToLevel(0)}
                title="Reset to Full Human Body (1×)"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Optical Zoom Canvas */}
          <div
            ref={viewportRef}
            className="relative w-full h-[540px] bg-slate-950 science-grid overflow-hidden select-none"
          >
            {/* Radial Ambient Glow */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 50% 48%, rgba(6, 182, 212, 0.14) 0%, rgba(15, 23, 42, 0.65) 58%, rgba(2, 6, 23, 0.96) 100%)'
              }}
            />

            {/* Concentric Target Rings Decoration */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25">
              <div className="w-[430px] h-[430px] rounded-full border border-cyan-500/20" />
              <div className="absolute w-[290px] h-[290px] rounded-full border border-dashed border-cyan-400/25" />
              <div className="absolute w-[150px] h-[150px] rounded-full border border-cyan-400/20" />
            </div>

            {/* Layer A: Base Scale Level SVG */}
            <div
              className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none will-change-transform"
              style={{
                opacity: baseOpacity,
                transformOrigin: `${baseLevel.portalCoords.x}% ${baseLevel.portalCoords.y}%`,
                transform: `scale(${baseScale})`
              }}
            >
              {renderBiologicalLevelSVG(baseIndex, organSystemFilter)}
            </div>

            {/* Layer B: Next Deeper Scale Level SVG (crossfading in during fractional zoom) */}
            {nextIndex !== baseIndex && frac > 0.02 && (
              <div
                className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none will-change-transform"
                style={{
                  opacity: nextOpacity,
                  transformOrigin: '50% 50%',
                  transform: `scale(${nextScale})`
                }}
              >
                {renderBiologicalLevelSVG(nextIndex, organSystemFilter)}
              </div>
            )}

            {/* Non-Overlapping Anatomical Pin Nodes & Side-Margin Callout Labels */}
            {labelDisplayMode !== 'hidden' && (
              <div
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{
                  opacity: Math.max(0.15, 1 - Math.abs(zoomValue - activeLevelIndex) * 1.65)
                }}
              >
                {(() => {
                  // Partition hotspots into Left Margin and Right Margin callouts so they never cover the center diagram
                  const indexedSpots = activeLevel.hotspots.map((spot, idx) => ({
                    spot,
                    num: idx + 1,
                    side: idx % 2 === 0 ? ('left' as const) : ('right' as const)
                  }));
                  const leftSpots = indexedSpots
                    .filter((item) => item.side === 'left')
                    .sort((a, b) => a.spot.y - b.spot.y);
                  const rightSpots = indexedSpots
                    .filter((item) => item.side === 'right')
                    .sort((a, b) => a.spot.y - b.spot.y);

                  const calloutPlacements = [
                    ...leftSpots.map((item, i) => ({
                      ...item,
                      marginX: 18,
                      marginY:
                        leftSpots.length === 1
                          ? 45
                          : 16 + (i / (leftSpots.length - 1)) * 58
                    })),
                    ...rightSpots.map((item, i) => ({
                      ...item,
                      marginX: 82,
                      marginY:
                        rightSpots.length === 1
                          ? 45
                          : 18 + (i / (rightSpots.length - 1)) * 56
                    }))
                  ];

                  return (
                    <>
                      {/* Thin SVG Leader Lines connecting Anatomy Pin -> Outer Margin Label */}
                      {labelDisplayMode === 'margin' && (
                        <svg
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden sm:block"
                        >
                          {calloutPlacements.map(({ spot, side, marginY }) => {
                            const isSelected = selectedHotspot?.id === spot.id;
                            const endX = side === 'left' ? 22 : 78;
                            const elbowX = side === 'left' ? Math.min(spot.x - 4, 28) : Math.max(spot.x + 4, 72);
                            const strokeColor = spot.isPortalToNext
                              ? '#fbbf24'
                              : isSelected
                              ? '#22d3ee'
                              : '#64748b';
                            return (
                              <g key={`line_${spot.id}`}>
                                <polyline
                                  points={`${spot.x},${spot.y} ${elbowX},${marginY} ${endX},${marginY}`}
                                  fill="none"
                                  stroke={strokeColor}
                                  strokeWidth={isSelected || spot.isPortalToNext ? '0.45' : '0.3'}
                                  strokeDasharray={isSelected ? 'none' : '1.2 0.9'}
                                  strokeOpacity={isSelected || spot.isPortalToNext ? '0.95' : '0.6'}
                                />
                              </g>
                            );
                          })}
                        </svg>
                      )}

                      {/* Compact Numbered Target Pins on the Diagram (never covers the artwork) */}
                      {calloutPlacements.map(({ spot, num }) => {
                        const isSelected = selectedHotspot?.id === spot.id;
                        return (
                          <div
                            key={`pin_${spot.id}`}
                            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
                          >
                            <button
                              type="button"
                              title={spot.name}
                              onClick={() => {
                                setSelectedHotspot(spot);
                                if (spot.isPortalToNext && activeLevelIndex < 6) {
                                  jumpToLevel(activeLevelIndex + 1);
                                }
                              }}
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all cursor-pointer shadow-md ${
                                spot.isPortalToNext
                                  ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/35 hover:scale-125'
                                  : isSelected
                                  ? 'bg-cyan-400 text-slate-950 ring-4 ring-cyan-400/35 scale-115'
                                  : 'bg-slate-950/85 text-cyan-300 border border-cyan-400/80 hover:bg-cyan-400 hover:text-slate-950'
                              }`}
                            >
                              {num}
                            </button>
                          </div>
                        );
                      })}

                      {/* Outer Left & Right Margin Callout Badges (outside the central diagram) */}
                      {labelDisplayMode === 'margin' &&
                        calloutPlacements.map(({ spot, num, side, marginY }) => {
                          const isSelected = selectedHotspot?.id === spot.id;
                          const shortLabel = spot.name.split(' (')[0];
                          return (
                            <div
                              key={`badge_${spot.id}`}
                              style={{
                                top: `${marginY}%`,
                                left: side === 'left' ? '12px' : undefined,
                                right: side === 'right' ? '12px' : undefined
                              }}
                              className="absolute -translate-y-1/2 z-20 pointer-events-auto hidden sm:block max-w-[24%]"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedHotspot(spot);
                                  if (spot.isPortalToNext && activeLevelIndex < 6) {
                                    jumpToLevel(activeLevelIndex + 1);
                                  }
                                }}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer backdrop-blur-md shadow-md text-left ${
                                  spot.isPortalToNext
                                    ? 'bg-amber-400/95 text-slate-950 font-bold ring-2 ring-amber-400/30 hover:scale-105'
                                    : isSelected
                                    ? 'bg-cyan-950/90 text-cyan-200 border border-cyan-400 shadow-cyan-950/50'
                                    : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:border-cyan-500/50 hover:text-white'
                                }`}
                              >
                                <span
                                  className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[9px] font-mono font-bold ${
                                    spot.isPortalToNext
                                      ? 'bg-slate-950 text-amber-300'
                                      : isSelected
                                      ? 'bg-cyan-400 text-slate-950'
                                      : 'bg-slate-800 text-cyan-300'
                                  }`}
                                >
                                  {num}
                                </span>
                                <span className="truncate">{shortLabel}</span>
                                {spot.isPortalToNext && activeLevelIndex < 6 && (
                                  <ChevronRight className="w-3 h-3 shrink-0" />
                                )}
                              </button>
                            </div>
                          );
                        })}
                    </>
                  );
                })()}
              </div>
            )}

            {/* Bottom-Left Scale Bar & Portal Cue */}
            <div className="absolute bottom-3 left-4 z-20 flex flex-wrap items-center gap-3 pointer-events-none">
              <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2.5 text-xs">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono text-cyan-300 font-bold">
                    {activeLevel.physicalScale}
                  </span>
                  <div className="w-12 h-1 border-b-2 border-l-2 border-r-2 border-cyan-400" />
                </div>
                <span className="text-slate-400 text-[11px]">
                  Scroll wheel to zoom · Click <strong className="text-amber-300">amber portal</strong> to dive deeper
                </span>
              </div>
            </div>

            {/* Bottom-Right Next Level Portal CTA Button */}
            {activeLevelIndex < 6 && (
              <div className="absolute bottom-3 right-4 z-20">
                <button
                  type="button"
                  onClick={() => jumpToLevel(activeLevelIndex + 1)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400/95 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xl cursor-pointer transition-transform hover:scale-105"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Dive into {activeLevel.portalTargetName}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Bottom Continuous Magnification Slider Bar */}
          <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-300 shrink-0">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold">Continuous Optical Zoom:</span>
              <span className="font-mono text-cyan-300 font-bold">{formattedMagnification}</span>
            </div>

            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <span className="text-[11px] font-mono text-slate-500">1× (Body)</span>
              <input
                type="range"
                min={0}
                max={6}
                step={0.02}
                value={zoomValue}
                onChange={(e) => {
                  setIsAutoTouring(false);
                  setTargetZoom(null);
                  setZoomValue(parseFloat(e.target.value));
                }}
                aria-label="Continuous Biological Magnification Zoom"
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <span className="text-[11px] font-mono text-slate-500">10⁶× (DNA)</span>
            </div>
          </div>
        </div>

        {/* Right: Biological Hierarchy & Hotspot Inspector Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Scale Level Overview Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-semibold text-cyan-400">
                  {activeLevel.hierarchyRank}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{activeLevel.shortTitle}</h3>
              </div>
              <div className="text-right font-mono">
                <div className="text-sm font-bold text-cyan-300">{activeLevel.magnificationLabel}</div>
                <div className="text-[11px] text-slate-400">{activeLevel.physicalScale}</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{activeLevel.summary}</p>

            <div className="text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-800/80">
              {activeLevel.ncertChapter}
            </div>

            {/* Selected Hotspot Detailed Inspector */}
            {selectedHotspot && (
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-cyan-300">Selected Structure</span>
                  {selectedHotspot.isPortalToNext && activeLevelIndex < 6 && (
                    <button
                      type="button"
                      onClick={() => jumpToLevel(activeLevelIndex + 1)}
                      className="text-[11px] font-bold text-amber-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Zoom Inside</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white">{selectedHotspot.name}</h4>
                <p className="text-xs text-cyan-100/90 font-medium">{selectedHotspot.role}</p>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedHotspot.details}</p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300/90">
                  <strong className="font-semibold">NCERT Key Fact: </strong>
                  {selectedHotspot.ncertFact}
                </div>
              </div>
            )}

            {/* All Hotspots at Current Level */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Structures at {activeLevel.magnificationLabel} Scale</span>
                <span className="text-[11px] text-slate-500">{activeLevel.hotspots.length} labeled</span>
              </div>
              <div className="space-y-1.5">
                {activeLevel.hotspots.map((spot, idx) => {
                  const isSel = selectedHotspot?.id === spot.id;
                  return (
                    <button
                      key={spot.id}
                      type="button"
                      onClick={() => setSelectedHotspot(spot)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between gap-2 cursor-pointer border ${
                        isSel
                          ? 'bg-cyan-950/70 border-cyan-400/60 text-white font-semibold'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span
                          className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[10px] font-mono font-bold ${
                            spot.isPortalToNext
                              ? 'bg-amber-400 text-slate-950'
                              : isSel
                              ? 'bg-cyan-400 text-slate-950'
                              : 'bg-slate-800 text-cyan-300'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="truncate">{spot.name}</span>
                      </span>
                      {spot.isPortalToNext && (
                        <span className="text-[10px] font-mono text-amber-300 shrink-0">
                          Portal →
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Key NCERT Takeaways for this Scale */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-300">
                Key Biological Principles
              </span>
              <div className="space-y-1.5">
                {activeLevel.keyPrinciples.map((kp, i) => (
                  <div
                    key={i}
                    className="text-xs text-slate-300 leading-relaxed flex items-start gap-2"
                  >
                    <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{kp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Renders the custom multi-layered anatomical SVG diagram for each of the 7 biological zoom levels.
 */
function renderBiologicalLevelSVG(
  levelIndex: number,
  organSystemFilter: 'all' | 'circulatory' | 'respiratory' | 'digestive' | 'nervous'
) {
  switch (levelIndex) {
    case 0:
      // LEVEL 1: Full Human Body Organism (Surface & Cavity Silhouette)
      return (
        <svg viewBox="0 0 500 540" className="w-full h-full max-w-[500px] max-h-[520px]">
          <defs>
            <linearGradient id="bodyGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.32" />
              <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.28" />
            </linearGradient>
            <radialGradient id="thoraxPortalGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Anatomical Grid & Height Ruler */}
          <line x1="85" y1="30" x2="85" y2="505" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />
          <text x="50" y="45" fill="#64748b" fontSize="10" fontFamily="monospace">1.70 m</text>
          <text x="50" y="270" fill="#64748b" fontSize="10" fontFamily="monospace">0.85 m</text>
          <text x="50" y="500" fill="#64748b" fontSize="10" fontFamily="monospace">0.00 m</text>

          {/* Full Human Body Anterior Silhouette */}
          <g stroke="#38bdf8" strokeWidth="2.2" fill="url(#bodyGlow)">
            {/* Head & Cranium */}
            <ellipse cx="250" cy="60" rx="28" ry="34" />
            {/* Neck */}
            <path d="M 238 92 L 236 112 L 264 112 L 262 92 Z" />
            {/* Torso + Arms + Legs Unified Anatomical Contour */}
            <path d="
              M 236 112
              C 205 114, 182 122, 174 138
              L 138 225
              L 120 292
              C 117 300, 126 305, 132 297
              L 158 232
              L 192 158
              L 198 242
              C 198 265, 195 280, 196 300
              L 202 415
              L 206 495
              C 206 504, 224 504, 226 495
              L 234 415
              L 244 310
              L 256 310
              L 266 415
              L 274 495
              C 276 504, 294 504, 294 495
              L 298 415
              L 304 300
              C 305 280, 302 265, 302 242
              L 308 158
              L 342 232
              L 368 297
              C 374 305, 383 300, 380 292
              L 362 225
              L 326 138
              C 318 122, 295 114, 264 112
              Z
            " />
          </g>

          {/* Subtle Internal Cavity Outlines (Previewing Organ Systems Inside) */}
          <ellipse cx="250" cy="55" rx="20" ry="22" fill="none" stroke="#a855f7" strokeWidth="1.2" strokeDasharray="3 2" />
          <path d="M 212 135 Q 250 125 288 135 L 284 215 Q 250 202 216 215 Z" fill="rgba(244,63,94,0.12)" stroke="#f43f5e" strokeWidth="1.4" strokeDasharray="4 3" />
          <path d="M 214 218 Q 250 206 286 218 L 280 295 Q 250 308 220 295 Z" fill="rgba(16,185,129,0.10)" stroke="#10b981" strokeWidth="1.4" strokeDasharray="4 3" />

          {/* Glowing Portal Reticle over Thoracic Organ Systems */}
          <circle cx="250" cy="175" r="46" fill="url(#thoraxPortalGlow)" />
          <circle cx="250" cy="175" r="34" fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeDasharray="6 4" />
          <circle cx="250" cy="175" r="6" fill="#fbbf24" />
        </svg>
      );

    case 1:
      // LEVEL 2: Human Organ Systems (Circulatory, Respiratory, Digestive, Nervous, Excretory)
      const showNervous = organSystemFilter === 'all' || organSystemFilter === 'nervous';
      const showResp = organSystemFilter === 'all' || organSystemFilter === 'respiratory';
      const showCirc = organSystemFilter === 'all' || organSystemFilter === 'circulatory';
      const showDig = organSystemFilter === 'all' || organSystemFilter === 'digestive';
      return (
        <svg viewBox="0 0 500 540" className="w-full h-full max-w-[500px] max-h-[520px]">
          {/* Torso Contour Frame */}
          <path
            d="M 225 90 L 160 125 L 175 260 L 185 430 L 315 430 L 325 260 L 340 125 L 275 90 Z"
            fill="rgba(15, 23, 42, 0.7)"
            stroke="#334155"
            strokeWidth="2"
          />
          <ellipse cx="250" cy="58" rx="34" ry="38" fill="rgba(15, 23, 42, 0.7)" stroke="#334155" strokeWidth="2" />

          {/* 1. NERVOUS SYSTEM: Brain & Spinal Cord */}
          <g opacity={showNervous ? 1 : 0.15}>
            <path
              d="M 226 52 C 226 34, 274 34, 274 52 C 280 65, 268 78, 250 78 C 232 78, 220 65, 226 52 Z"
              fill="#c084fc"
              fillOpacity="0.45"
              stroke="#e879f9"
              strokeWidth="2"
            />
            <line x1="250" y1="78" x2="250" y2="395" stroke="#e879f9" strokeWidth="4" strokeDasharray="6 3" />
          </g>

          {/* 2. RESPIRATORY SYSTEM: Trachea, Bronchi & Left/Right Lungs */}
          <g opacity={showResp ? 1 : 0.15}>
            {/* Trachea */}
            <rect x="245" y="96" width="10" height="58" rx="4" fill="#38bdf8" fillOpacity="0.5" stroke="#7dd3fc" strokeWidth="1.8" />
            {/* Right Lung (3 Lobes) */}
            <path
              d="M 238 145 C 205 138, 185 165, 182 225 C 182 242, 215 245, 238 232 Z"
              fill="#38bdf8"
              fillOpacity="0.38"
              stroke="#38bdf8"
              strokeWidth="2.2"
            />
            {/* Left Lung (2 Lobes with Cardiac Notch) */}
            <path
              d="M 262 145 C 295 138, 315 165, 318 225 C 318 242, 288 245, 272 228 C 276 205, 268 185, 262 178 Z"
              fill="#38bdf8"
              fillOpacity="0.38"
              stroke="#38bdf8"
              strokeWidth="2.2"
            />
          </g>

          {/* 3. DIGESTIVE & EXCRETORY SYSTEMS: Liver, Stomach, Intestines & Kidneys */}
          <g opacity={showDig ? 1 : 0.15}>
            {/* Diaphragm */}
            <path d="M 180 248 Q 250 228 320 248" fill="none" stroke="#f59e0b" strokeWidth="3" />
            {/* Liver */}
            <path
              d="M 190 255 L 262 258 L 245 295 L 192 298 Z"
              fill="#b45309"
              fillOpacity="0.65"
              stroke="#f59e0b"
              strokeWidth="2"
            />
            {/* J-Shaped Stomach */}
            <path
              d="M 258 258 C 292 258, 302 288, 282 308 C 266 320, 246 310, 250 295 Z"
              fill="#fb7185"
              fillOpacity="0.5"
              stroke="#fda4af"
              strokeWidth="2"
            />
            {/* Kidneys */}
            <ellipse cx="222" cy="325" rx="12" ry="20" fill="#9f1239" stroke="#f43f5e" strokeWidth="1.8" />
            <ellipse cx="278" cy="328" rx="12" ry="20" fill="#9f1239" stroke="#f43f5e" strokeWidth="1.8" />
            {/* Large & Small Intestine Coils */}
            <rect x="202" y="325" width="96" height="78" rx="18" fill="#10b981" fillOpacity="0.28" stroke="#34d399" strokeWidth="2" />
            <path d="M 218 345 Q 250 335 282 348 Q 250 365 218 372 Q 250 388 280 385" fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* 4. CARDIOVASCULAR SYSTEM: Heart, Aorta & Vena Cava (Portal Target) */}
          <g opacity={showCirc ? 1 : 0.2}>
            {/* Systemic Arteries (Red) & Veins (Blue) */}
            <line x1="244" y1="110" x2="244" y2="390" stroke="#3b82f6" strokeWidth="4" />
            <line x1="256" y1="110" x2="256" y2="390" stroke="#ef4444" strokeWidth="4" />
            {/* Heart in Mediastinum */}
            <path
              d="M 248 175 C 235 168, 228 188, 240 208 C 248 220, 265 225, 274 214 C 282 202, 272 175, 258 175 Z"
              fill="#ef4444"
              stroke="#fecdd3"
              strokeWidth="2.5"
            />
            {/* Portal Reticle over Heart */}
            <circle cx="258" cy="196" r="30" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5 3" />
          </g>
        </svg>
      );

    case 2:
      // LEVEL 3: Individual Organ — The Four-Chambered Human Heart (25x)
      return (
        <svg viewBox="0 0 500 540" className="w-full h-full max-w-[500px] max-h-[520px]">
          <defs>
            <linearGradient id="oxyGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <linearGradient id="deoxyGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>

          {/* Superior & Inferior Vena Cava (Blue) */}
          <path d="M 175 95 L 175 210" stroke="#3b82f6" strokeWidth="26" strokeLinecap="round" />
          <path d="M 180 365 L 180 450" stroke="#3b82f6" strokeWidth="24" strokeLinecap="round" />

          {/* Aortic Arch (Red) */}
          <path
            d="M 260 220 C 260 105, 210 95, 210 155"
            fill="none"
            stroke="#ef4444"
            strokeWidth="30"
            strokeLinecap="round"
          />
          {/* Three Aortic Arch Branches */}
          <line x1="225" y1="112" x2="218" y2="75" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" />
          <line x1="242" y1="110" x2="242" y2="72" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" />
          <line x1="258" y1="116" x2="266" y2="78" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" />

          {/* Pulmonary Artery Trunk & Branches */}
          <path
            d="M 225 260 L 225 165 M 165 165 L 325 165"
            fill="none"
            stroke="#6366f1"
            strokeWidth="22"
            strokeLinecap="round"
          />

          {/* Outer Pericardium & Myocardium Wall */}
          <path
            d="M 145 200 C 125 270, 165 395, 285 435 C 365 395, 385 265, 345 195 C 310 155, 180 155, 145 200 Z"
            fill="#7f1d1d"
            stroke="#fda4af"
            strokeWidth="4"
          />

          {/* Right Atrium (Deoxygenated) */}
          <path
            d="M 158 205 C 145 235, 155 275, 195 275 L 218 250 L 205 195 Z"
            fill="url(#deoxyGrad)"
            stroke="#93c5fd"
            strokeWidth="2"
          />
          {/* SA Node Pacemaker Glow */}
          <circle cx="172" cy="212" r="9" fill="#fbbf24" />

          {/* Right Ventricle (Deoxygenated) */}
          <path
            d="M 168 292 C 175 355, 215 395, 255 408 L 245 282 Z"
            fill="url(#deoxyGrad)"
            stroke="#93c5fd"
            strokeWidth="2"
          />

          {/* Left Atrium (Oxygenated) */}
          <path
            d="M 282 195 C 325 195, 345 235, 330 268 L 272 265 Z"
            fill="url(#oxyGrad)"
            stroke="#fecdd3"
            strokeWidth="2"
          />

          {/* Left Ventricle (Thick Myocardium Wall + Chamber) */}
          <path
            d="M 268 282 L 275 412 C 325 385, 348 325, 328 280 Z"
            fill="url(#oxyGrad)"
            stroke="#fecdd3"
            strokeWidth="3"
          />

          {/* Interventricular Septum */}
          <line x1="252" y1="265" x2="266" y2="418" stroke="#f87171" strokeWidth="12" strokeLinecap="round" />

          {/* Tricuspid & Bicuspid Valves (White Leaflets) */}
          <line x1="175" y1="282" x2="225" y2="278" stroke="#ffffff" strokeWidth="4" strokeDasharray="8 4" />
          <line x1="275" y1="275" x2="325" y2="278" stroke="#ffffff" strokeWidth="4" strokeDasharray="8 4" />

          {/* Portal Reticle on Left Ventricular Myocardium Wall */}
          <circle cx="315" cy="335" r="36" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="6 4" />
          <circle cx="315" cy="335" r="7" fill="#fbbf24" />
        </svg>
      );

    case 3:
      // LEVEL 4: Biological Tissue — Striated Cardiac Muscle & Capillary Bed (250x)
      return (
        <svg viewBox="0 0 500 540" className="w-full h-full max-w-[500px] max-h-[520px]">
          {/* Background Endomysium Connective Matrix */}
          <rect x="30" y="40" width="440" height="460" rx="28" fill="#1e1b4b" fillOpacity="0.45" stroke="#334155" strokeWidth="2" />

          {/* Superior & Inferior Coronary Capillaries with Flowing Red Blood Cells */}
          <g>
            <path d="M 40 120 Q 250 95 460 125" fill="none" stroke="#ef4444" strokeWidth="34" strokeOpacity="0.35" />
            <path d="M 40 120 Q 250 95 460 125" fill="none" stroke="#fca5a5" strokeWidth="2" strokeDasharray="6 4" />
            {[95, 165, 240, 315, 390].map((cx, i) => (
              <ellipse key={i} cx={cx} cy={114 + (i % 2) * 4} rx="18" ry="10" fill="#ef4444" stroke="#fecdd3" strokeWidth="1.5" />
            ))}
          </g>

          {/* Branched Striated Cardiomyocyte Fibers */}
          <g>
            {/* Upper-Center Branched Fiber */}
            <path
              d="M 45 220 L 210 220 L 295 185 L 455 185 L 455 245 L 310 245 L 260 280 L 455 280 L 455 340 L 220 340 L 165 290 L 45 290 Z"
              fill="#be123c"
              fillOpacity="0.72"
              stroke="#fda4af"
              strokeWidth="2.5"
            />
            {/* Lower Branched Fiber */}
            <path
              d="M 45 365 L 215 365 L 275 405 L 455 405 L 455 465 L 245 465 L 185 425 L 45 425 Z"
              fill="#9f1239"
              fillOpacity="0.72"
              stroke="#fda4af"
              strokeWidth="2.5"
            />

            {/* Sarcomere Cross-Striations (Z-discs & A/I bands) */}
            {Array.from({ length: 16 }).map((_, idx) => {
              const sx = 65 + idx * 24;
              return (
                <line
                  key={idx}
                  x1={sx}
                  y1="185"
                  x2={sx}
                  y2="465"
                  stroke="#fecdd3"
                  strokeOpacity="0.28"
                  strokeWidth="2"
                />
              );
            })}

            {/* Intercalated Discs (Zig-Zag Gap Junction & Desmosome Boundaries) */}
            <path d="M 175 220 L 180 238 L 172 255 L 180 272 L 175 290" fill="none" stroke="#38bdf8" strokeWidth="4" />
            <path d="M 345 280 L 350 295 L 342 310 L 350 325 L 345 340" fill="none" stroke="#38bdf8" strokeWidth="4" />
            <path d="M 210 365 L 216 385 L 208 405 L 215 425" fill="none" stroke="#38bdf8" strokeWidth="4" />

            {/* Central Oval Cardiomyocyte Nuclei */}
            <ellipse cx="250" cy="260" rx="34" ry="20" fill="#7e22ce" stroke="#e9d5ff" strokeWidth="2.5" />
            <circle cx="250" cy="260" r="7" fill="#f0abfc" />

            <ellipse cx="115" cy="395" rx="28" ry="16" fill="#7e22ce" stroke="#e9d5ff" strokeWidth="2" />
            <ellipse cx="365" cy="435" rx="28" ry="16" fill="#7e22ce" stroke="#e9d5ff" strokeWidth="2" />
          </g>

          {/* Portal Reticle on Central Cardiomyocyte Cell */}
          <circle cx="250" cy="260" r="46" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="6 4" />
        </svg>
      );

    case 4:
      // LEVEL 5: The Eukaryotic Human Cell & Organelles (2,500x)
      return (
        <svg viewBox="0 0 500 540" className="w-full h-full max-w-[500px] max-h-[520px]">
          <defs>
            <radialGradient id="cytoplasmGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="75%" stopColor="#083344" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.45" />
            </radialGradient>
          </defs>

          {/* Outer Plasma Membrane (Phospholipid Bilayer Boundary) */}
          <ellipse
            cx="250"
            cy="265"
            rx="205"
            ry="195"
            fill="url(#cytoplasmGrad)"
            stroke="#22d3ee"
            strokeWidth="5"
          />
          <ellipse
            cx="250"
            cy="265"
            rx="197"
            ry="187"
            fill="none"
            stroke="#67e8f9"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />

          {/* Rough Endoplasmic Reticulum (Cisternae around Nucleus) */}
          <path
            d="M 165 295 Q 145 345 195 365 Q 245 380 275 350 M 150 315 Q 130 375 195 392 Q 255 405 290 368"
            fill="none"
            stroke="#818cf8"
            strokeWidth="9"
            strokeLinecap="round"
          />

          {/* Golgi Apparatus (Stacked Cisternae + Secretory Vesicles) */}
          <g stroke="#f472b6" strokeWidth="7" strokeLinecap="round" fill="none">
            <path d="M 315 165 Q 355 180 365 215" />
            <path d="M 328 152 Q 372 170 382 210" />
            <path d="M 342 140 Q 388 160 398 205" />
          </g>
          <circle cx="405" cy="225" r="8" fill="#f472b6" />
          <circle cx="385" cy="240" r="6" fill="#f472b6" />

          {/* Mitochondria (Double Membrane + Cristae Folds) */}
          {[
            { cx: 140, cy: 215, rot: -25 },
            { cx: 345, cy: 365, rot: 30 },
            { cx: 165, cy: 140, rot: 15 }
          ].map((m, idx) => (
            <g key={idx} transform={`translate(${m.cx}, ${m.cy}) rotate(${m.rot})`}>
              <ellipse cx="0" cy="0" rx="36" ry="19" fill="#ea580c" stroke="#fed7aa" strokeWidth="2.2" />
              <path
                d="M -24 0 L -16 -10 L -8 10 L 0 -10 L 8 10 L 16 -10 L 24 0"
                fill="none"
                stroke="#ffedd5"
                strokeWidth="2"
              />
            </g>
          ))}

          {/* Lysosomes & Peroxisomes */}
          <circle cx="368" cy="305" r="18" fill="#eab308" fillOpacity="0.65" stroke="#fef08a" strokeWidth="2" />
          <circle cx="120" cy="305" r="14" fill="#10b981" fillOpacity="0.65" stroke="#a7f3d0" strokeWidth="2" />

          {/* Central Nucleus, Nuclear Envelope, Chromatin & Nucleolus (Portal Target) */}
          <circle
            cx="250"
            cy="260"
            r="68"
            fill="#581c87"
            fillOpacity="0.82"
            stroke="#d8b4fe"
            strokeWidth="4"
            strokeDasharray="14 5"
          />
          {/* Chromatin Threads inside Nucleus */}
          <path
            d="M 215 235 Q 250 210 280 240 Q 295 270 255 290 Q 215 300 220 260 Q 235 235 275 275"
            fill="none"
            stroke="#e879f9"
            strokeWidth="2.5"
          />
          {/* Dense Nucleolus */}
          <circle cx="250" cy="260" r="24" fill="#a855f7" stroke="#f5d0fe" strokeWidth="2" />

          {/* Portal Reticle on Nucleus */}
          <circle cx="250" cy="260" r="78" fill="none" stroke="#fbbf24" strokeWidth="2.2" strokeDasharray="6 4" />
        </svg>
      );

    case 5:
      // LEVEL 6: Organelle & Supramolecular — Chromosome, Nucleosomes & Mitochondrial Cristae (25,000x)
      return (
        <svg viewBox="0 0 500 540" className="w-full h-full max-w-[500px] max-h-[520px]">
          {/* Left: Metaphase Chromosome Uncoiling into Nucleosome "Beads-on-a-String" */}
          <g>
            {/* Sister Chromatids X-Shape */}
            <path
              d="M 125 130 C 145 190, 155 230, 170 240 C 155 250, 145 290, 125 350"
              fill="none"
              stroke="#c084fc"
              strokeWidth="26"
              strokeLinecap="round"
            />
            <path
              d="M 215 130 C 195 190, 185 230, 170 240 C 185 250, 195 290, 215 350"
              fill="none"
              stroke="#a855f7"
              strokeWidth="26"
              strokeLinecap="round"
            />
            {/* Centromere Kinetochore Constriction */}
            <circle cx="170" cy="240" r="14" fill="#fbbf24" stroke="#fef08a" strokeWidth="2.5" />

            {/* Uncoiling Solenoid & Histone Octamer Nucleosomes */}
            <path
              d="M 215 350 C 235 395, 295 390, 330 355"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3.5"
            />
            {[
              { x: 235, y: 372 },
              { x: 265, y: 382 },
              { x: 295, y: 376 },
              { x: 322, y: 360 }
            ].map((n, idx) => (
              <g key={idx}>
                <circle cx={n.x} cy={n.y} r="11" fill="#ec4899" stroke="#fbcfe8" strokeWidth="2" />
                <ellipse cx={n.x} cy={n.y} rx="13" ry="6" fill="none" stroke="#38bdf8" strokeWidth="2" />
              </g>
            ))}

            {/* Portal Reticle on Uncoiling Chromatin -> DNA */}
            <circle cx="170" cy="240" r="52" fill="none" stroke="#fbbf24" strokeWidth="2.2" strokeDasharray="6 4" />
          </g>

          {/* Right: High-Resolution Mitochondrial Cristae & F0-F1 ATP Synthase Motors */}
          <g>
            <path
              d="M 305 120 C 425 120, 455 215, 445 320 C 435 415, 365 445, 305 425"
              fill="#7c2d12"
              fillOpacity="0.6"
              stroke="#fb923c"
              strokeWidth="5"
            />
            {/* Inner Cristae Folds */}
            <path
              d="M 310 155 L 395 175 L 315 215 L 405 245 L 315 285 L 398 318 L 312 360"
              fill="none"
              stroke="#fed7aa"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            {/* F0-F1 Oxysome / ATP Synthase Complexes */}
            {[
              { x: 380, y: 172 },
              { x: 390, y: 242 },
              { x: 385, y: 314 },
              { x: 365, y: 340 }
            ].map((ox, i) => (
              <g key={i}>
                <line x1={ox.x} y1={ox.y} x2={ox.x + 16} y2={ox.y - 10} stroke="#fde047" strokeWidth="3" />
                <circle cx={ox.x + 19} cy={ox.y - 12} r="7" fill="#facc15" stroke="#fef9c3" strokeWidth="1.5" />
              </g>
            ))}
          </g>
        </svg>
      );

    case 6:
    default:
      // LEVEL 7: Molecular & Atomic Scale — DNA Double Helix & Nucleotide Base Pairs (1,000,000x)
      return (
        <svg viewBox="0 0 500 540" className="w-full h-full max-w-[500px] max-h-[520px]">
          {/* Base Pair Rungs (A=T and G≡C) with Atomic Nodes */}
          {Array.from({ length: 11 }).map((_, idx) => {
            const y = 70 + idx * 40;
            const phase = idx * 0.62;
            const x1 = 250 + Math.sin(phase) * 95;
            const x2 = 250 - Math.sin(phase) * 95;
            const isGC = idx % 2 === 1;
            const midX = (x1 + x2) / 2;
            return (
              <g key={idx}>
                {/* Left Base Half */}
                <line
                  x1={x1}
                  y1={y}
                  x2={midX}
                  y2={y}
                  stroke={isGC ? '#10b981' : '#f43f5e'}
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                {/* Right Complementary Base Half */}
                <line
                  x1={midX}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke={isGC ? '#fbbf24' : '#38bdf8'}
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                {/* Hydrogen Bonds in Center */}
                <circle cx={midX - 5} cy={y} r="2.5" fill="#ffffff" />
                <circle cx={midX + 5} cy={y} r="2.5" fill="#ffffff" />
                {/* Sugar-Phosphate Backbone Atoms */}
                <circle cx={x1} cy={y} r="10" fill="#22d3ee" stroke="#ecfeff" strokeWidth="2" />
                <circle cx={x2} cy={y} r="10" fill="#a855f7" stroke="#f3e8ff" strokeWidth="2" />
              </g>
            );
          })}

          {/* Antiparallel 5'->3' and 3'->5' Helical Strands */}
          <path
            d={Array.from({ length: 45 })
              .map((_, i) => {
                const t = i / 44;
                const y = 65 + t * 410;
                const x = 250 + Math.sin(t * 10 * 0.62) * 95;
                return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
              })
              .join(' ')}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="5"
          />
          <path
            d={Array.from({ length: 45 })
              .map((_, i) => {
                const t = i / 44;
                const y = 65 + t * 410;
                const x = 250 - Math.sin(t * 10 * 0.62) * 95;
                return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
              })
              .join(' ')}
            fill="none"
            stroke="#a855f7"
            strokeWidth="5"
          />

          {/* Atomic Pitch & Diameter Dimension Annotations */}
          <line x1="375" y1="150" x2="375" y2="350" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
          <text x="385" y="255" fill="#cbd5e1" fontSize="11" fontFamily="monospace">Pitch = 3.4 nm</text>
          <text x="210" y="512" fill="#38bdf8" fontSize="11" fontFamily="monospace">Helix Diameter = 2.0 nm</text>
        </svg>
      );
  }
}
