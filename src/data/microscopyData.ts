export interface MicroscopicObjectItem {
  id: string;
  name: string;
  category: string;
  color: string;
  sizeMicrons: string;
  abundance: string;
  /** Normalized coordinates (-0.75 to 0.75) inside the circular microscope field */
  position: [number, number];
  description: string;
  functionOrRole: string;
  ncertKeyFact: string;
}

export interface MicroscopySlideItem {
  id: string;
  title: string;
  subtitle: string;
  classGrade: number;
  subject: 'Biology' | 'Chemistry' | 'Physics';
  ncertReference: string;
  defaultStain: 'iodine' | 'safranin' | 'methylene_blue' | 'leishman' | 'fluorescence';
  stainLabel: string;
  recommendedMag: 40 | 100 | 400 | 1000;
  fieldDiameterMicrons: number;
  description: string;
  slidePrepSteps: string[];
  objects: MicroscopicObjectItem[];
}

export const MICROSCOPY_SLIDES: MicroscopySlideItem[] = [
  {
    id: 'onion_peel',
    title: 'Onion Bulb Epidermal Peel (Plant Cells)',
    subtitle: 'Brick-like rectangular plant cells with rigid cell walls and peripheral nuclei',
    classGrade: 9,
    subject: 'Biology',
    ncertReference: 'NCERT Class 9 Ch. 5 · Activity 5.1 (Fig. 5.2)',
    defaultStain: 'safranin',
    stainLabel: 'Safranin / Iodine Solution',
    recommendedMag: 100,
    fieldDiameterMicrons: 450,
    description:
      'A temporary wet mount of the transparent inner epidermis of an Allium cepa (onion) scale leaf showing tightly packed rectangular plant cells without intercellular spaces.',
    slidePrepSteps: [
      'Peel a thin, transparent membrane from the concave inner surface of an onion scale leaf using forceps.',
      'Place immediately in a watch glass with water to prevent folding or drying.',
      'Transfer to a glass slide with a drop of Safranin or Iodine stain for 2 minutes.',
      'Mount in glycerine and lower the coverslip gently at 45° using a needle to avoid air bubbles.'
    ],
    objects: [
      {
        id: 'cell_wall',
        name: 'Cellulose Cell Wall',
        category: 'Structural Boundary',
        color: '#f43f5e',
        sizeMicrons: '1.5 µm thick',
        abundance: 'Surrounds every epidermal cell',
        position: [-0.42, -0.28],
        description: 'Thick, rigid, double-layered outer boundary framing each rectangular brick-like cell.',
        functionOrRole: 'Provides mechanical strength, fixed rectangular shape, and prevents osmotic bursting (lysis).',
        ncertKeyFact: 'Freely permeable and composed of β-D-glucose cellulose microfibrils.'
      },
      {
        id: 'plasma_membrane',
        name: 'Plasma Membrane (Cell Membrane)',
        category: 'Selectively Permeable Barrier',
        color: '#fb7185',
        sizeMicrons: '7.5 nm thick',
        abundance: 'Pressed紧 against inner cell wall',
        position: [0.38, -0.32],
        description: 'Delicate phospholipid bilayer lying immediately inside the rigid cell wall.',
        functionOrRole: 'Regulates selective entry and exit of water and ions via osmosis and active transport.',
        ncertKeyFact: 'Becomes visibly detached from the cell wall during plasmolysis in hypertonic salt solution.'
      },
      {
        id: 'peripheral_nucleus',
        name: 'Peripheral Stained Nucleus',
        category: 'Control Organelle',
        color: '#be123c',
        sizeMicrons: '12–15 µm diameter',
        abundance: '1 per cell (pushed to periphery)',
        position: [-0.15, 0.08],
        description: 'Darkly stained spherical or oval body pushed toward the edge of the cell by the central vacuole.',
        functionOrRole: 'Houses chromatin DNA and directs cellular metabolism and gene transcription.',
        ncertKeyFact: 'Absorbs safranin/iodine strongly due to acidic nucleic acids (DNA & RNA).'
      },
      {
        id: 'central_vacuole',
        name: 'Large Central Vacuole',
        category: 'Osmotic Storage Organelle',
        color: '#fda4af',
        sizeMicrons: '80–110 µm length',
        abundance: 'Occupies ~85% of cell volume',
        position: [0.12, 0.14],
        description: 'Clear, unstained central region filled with cell sap and bounded by the tonoplast membrane.',
        functionOrRole: 'Maintains turgor pressure against the cell wall and stores water, sugars, and ions.',
        ncertKeyFact: 'Pushes the cytoplasm and nucleus into a thin peripheral layer.'
      },
      {
        id: 'cytoplasm_strand',
        name: 'Peripheral Cytoplasm',
        category: 'Cellular Matrix',
        color: '#fecdd3',
        sizeMicrons: 'Thin lining (3–5 µm)',
        abundance: 'Fills space between tonoplast and membrane',
        position: [0.45, 0.25],
        description: 'Faintly granular, translucent fluid layer lining the inner periphery of the cell.',
        functionOrRole: 'Site of glycolysis and cytoplasmic streaming (cyclosis) of organelles.',
        ncertKeyFact: 'Stains lightly pink with safranin compared to the deep crimson nucleus.'
      },
      {
        id: 'plasmodesmata_junction',
        name: 'Middle Lamella & Intercellular Junction',
        category: 'Cell-to-Cell Cement',
        color: '#9f1239',
        sizeMicrons: '0.5 µm junction',
        abundance: 'Between all adjacent cells',
        position: [-0.35, 0.36],
        description: 'Calcium and magnesium pectate layer cementing adjacent onion epidermal cells together.',
        functionOrRole: 'Holds neighboring cells tightly with zero intercellular air spaces.',
        ncertKeyFact: 'Traversed by microscopic cytoplasmic bridges called plasmodesmata.'
      }
    ]
  },
  {
    id: 'cheek_cells',
    title: 'Human Squamous Cheek Epithelial Cells (Animal Cells)',
    subtitle: 'Polygonal, flat animal cells with a central nucleus and no cell wall',
    classGrade: 9,
    subject: 'Biology',
    ncertReference: 'NCERT Class 9 Ch. 5 · Activity 5.7',
    defaultStain: 'methylene_blue',
    stainLabel: 'Methylene Blue Stain',
    recommendedMag: 400,
    fieldDiameterMicrons: 180,
    description:
      'Gently scraped human buccal mucosa cells stained with Methylene Blue, illustrating typical eukaryotic animal cells lacking a rigid cell wall or large central vacuole.',
    slidePrepSteps: [
      'Rinse mouth with clean water and gently scrape the inner cheek lining using a sterile toothpick.',
      'Spread the scraping in a drop of water on a clean glass slide.',
      'Add 1 drop of 1% Methylene Blue stain and wait 1–2 minutes.',
      'Mount with a drop of glycerine and place coverslip carefully without trapping air bubbles.'
    ],
    objects: [
      {
        id: 'central_nucleus',
        name: 'Central Prominent Nucleus',
        category: 'Nuclear Organelle',
        color: '#1d4ed8',
        sizeMicrons: '8–10 µm',
        abundance: '1 centrally located per cell',
        position: [-0.22, -0.12],
        description: 'Deep blue-stained spherical body situated right at the center of each squamous cell.',
        functionOrRole: 'Contains 46 human chromosomes (23 pairs) and regulates cellular protein synthesis.',
        ncertKeyFact: 'Unlike plant cells, animal cells have a centrally placed nucleus because they lack a large central vacuole.'
      },
      {
        id: 'cell_membrane_animal',
        name: 'Flexible Plasma Membrane',
        category: 'Outer Boundary',
        color: '#38bdf8',
        sizeMicrons: '50–60 µm cell diameter',
        abundance: 'Outer boundary of each cell',
        position: [0.32, 0.18],
        description: 'Thin, irregular, polygonal outer boundary enclosing the cell without any rigid cell wall.',
        functionOrRole: 'Allows flexible cell shape and selective transport of nutrients and waste.',
        ncertKeyFact: 'Absence of a cell wall gives cheek cells their irregular, folded, polygonal outline.'
      },
      {
        id: 'granular_cytoplasm',
        name: 'Granular Cytoplasm',
        category: 'Intracellular Matrix',
        color: '#93c5fd',
        sizeMicrons: 'Fills entire cell interior',
        abundance: 'Uniformly distributed',
        position: [-0.18, 0.28],
        description: 'Sky-blue stained jelly-like cytosol filling the entire volume between the nucleus and membrane.',
        functionOrRole: 'Suspends mitochondria, endoplasmic reticulum, Golgi apparatus, and ribosomes.',
        ncertKeyFact: 'Contains tiny glycogen granules and intermediate keratin filaments.'
      },
      {
        id: 'mitochondria_granules',
        name: 'Mitochondrial & Ribosomal Granules',
        category: 'Bioenergetic Organelles',
        color: '#60a5fa',
        sizeMicrons: '0.5–2 µm specks',
        abundance: 'Hundreds per cell',
        position: [0.24, -0.25],
        description: 'Fine dark-blue cytoplasmic speckles visible at high magnification (400x–1000x).',
        functionOrRole: 'Synthesize ATP via aerobic cellular respiration and translate mRNA into proteins.',
        ncertKeyFact: 'Known as the powerhouse of the cell (Mitochondria).'
      },
      {
        id: 'nucleolus_spot',
        name: 'Dense Nucleolus',
        category: 'Sub-Nuclear Body',
        color: '#1e3a8a',
        sizeMicrons: '2 µm',
        abundance: '1–2 inside each nucleus',
        position: [0.28, 0.14],
        description: 'Extra-dark sub-region inside the stained nucleus.',
        functionOrRole: 'Synthesizes ribosomal RNA (rRNA) and assembles ribosomal subunits.',
        ncertKeyFact: 'Not bounded by a separate membrane inside the nucleoplasm.'
      }
    ]
  },
  {
    id: 'leaf_stomata',
    title: 'Leaf Epidermal Peel — Stomatal Apparatus',
    subtitle: 'Kidney-shaped guard cells, chloroplasts, stomatal pore, and subsidiary cells',
    classGrade: 10,
    subject: 'Biology',
    ncertReference: 'NCERT Class 10 Ch. 5 · Fig. 5.3 (Life Processes)',
    defaultStain: 'safranin',
    stainLabel: 'Safranin Wet Mount',
    recommendedMag: 400,
    fieldDiameterMicrons: 200,
    description:
      'Lower epidermis peel of a dicot leaf (Tradescantia / Lily / Bryophyllum) showing stomatal pores flanked by paired bean-shaped guard cells rich in green chloroplasts.',
    slidePrepSteps: [
      'Fold and tear a freshly plucked leaf with a single motion to expose the transparent lower epidermis.',
      'Cut a small piece of the lower epidermal peel and transfer it to a watch glass containing water.',
      'Stain with a few drops of Safranin for 1 minute, wash excess stain, and mount in glycerine.'
    ],
    objects: [
      {
        id: 'guard_cells',
        name: 'Paired Kidney-Shaped Guard Cells',
        category: 'Specialized Turgor Cells',
        color: '#22c55e',
        sizeMicrons: '25–35 µm long',
        abundance: '2 per stomatal apparatus',
        position: [0.0, -0.05],
        description: 'Bean-shaped (in dicots) specialized epidermal cells with thick inner walls and thin elastic outer walls.',
        functionOrRole: 'Swell when turgid (water enters) to open the stomatal pore; shrink when flaccid to close it.',
        ncertKeyFact: 'Guard cells are the ONLY epidermal cells that contain photosynthetic chloroplasts!'
      },
      {
        id: 'stomatal_pore',
        name: 'Stomatal Aperture (Pore)',
        category: 'Gas Exchange Opening',
        color: '#064e3b',
        sizeMicrons: '8–12 µm opening',
        abundance: 'Central opening between guard cells',
        position: [0.0, 0.06],
        description: 'Lens-shaped microscopic opening between the concave inner walls of the two guard cells.',
        functionOrRole: 'Allows intake of CO₂ for photosynthesis, release of O₂, and water vapor transpiration.',
        ncertKeyFact: 'Closes at night or during water stress to prevent excessive transpiration loss.'
      },
      {
        id: 'guard_chloroplasts',
        name: 'Chloroplasts in Guard Cells',
        category: 'Photosynthetic Plastids',
        color: '#10b981',
        sizeMicrons: '4–5 µm oval bodies',
        abundance: '8–15 per guard cell',
        position: [-0.14, -0.02],
        description: 'Bright emerald-green oval plastids clustered inside both guard cells.',
        functionOrRole: 'Generate ATP and osmotically active solutes (K⁺/malate pump) to regulate stomatal opening.',
        ncertKeyFact: 'Surrounding pavement epidermal cells completely lack chloroplasts.'
      },
      {
        id: 'subsidiary_cells',
        name: 'Subsidiary (Accessory) Cells',
        category: 'Support Epidermal Cells',
        color: '#f472b6',
        sizeMicrons: '40–55 µm',
        abundance: '3–4 surrounding each stoma',
        position: [0.32, 0.16],
        description: 'Specialized epidermal cells immediately bordering the guard cells.',
        functionOrRole: 'Act as ion and water reservoirs (K⁺ and Cl⁻) during rapid guard cell turgor changes.',
        ncertKeyFact: 'Stain light pink with Safranin while guard cells stay green due to chlorophyll.'
      },
      {
        id: 'epidermal_pavement',
        name: 'Wavy Epidermal Pavement Cells',
        category: 'Dermal Tissue',
        color: '#fb7185',
        sizeMicrons: '60–90 µm',
        abundance: 'Continuous interlocking sheet',
        position: [-0.42, 0.32],
        description: 'Jigsaw-puzzle-like interlocking cells forming the outer protective skin of the leaf.',
        functionOrRole: 'Secrete waxy cuticle and protect internal mesophyll tissue from desiccation and pathogens.',
        ncertKeyFact: 'Have zero intercellular spaces to prevent unregulated water loss.'
      }
    ]
  },
  {
    id: 'human_blood_smear',
    title: 'Human Peripheral Blood Smear (RBCs, WBCs & Platelets)',
    subtitle: 'Biconcave erythrocytes, lobed-nucleus leukocytes, and thrombocytes',
    classGrade: 11,
    subject: 'Biology',
    ncertReference: 'NCERT Class 11 Ch. 18 · Fig. 18.1 (Body Fluids & Circulation)',
    defaultStain: 'leishman',
    stainLabel: 'Leishman / Wright-Giemsa Stain',
    recommendedMag: 1000,
    fieldDiameterMicrons: 100,
    description:
      'High-power oil-immersion (1000x) view of a stained human blood film showing abundant pink biconcave erythrocytes (RBCs), purple-nucleated leukocytes (WBCs), and tiny platelets.',
    slidePrepSteps: [
      'Place a small drop of anticoagulated blood near one end of a clean glass slide.',
      'Use a spreader slide at a 30°–45° angle to draw out a thin, feathered-edge blood film and air-dry.',
      'Flood slide with Leishman stain (eosin + methylene blue in methanol) for 2 minutes, then dilute with buffered water for 8 minutes.'
    ],
    objects: [
      {
        id: 'erythrocyte_rbc',
        name: 'Erythrocytes (Red Blood Corpuscles / RBCs)',
        category: 'Oxygen Transport Cells',
        color: '#ef4444',
        sizeMicrons: '7.2 µm diameter',
        abundance: '5.0–5.5 million / mm³ (~99% of cells)',
        position: [-0.32, -0.22],
        description: 'Circular, biconcave disc-shaped pink cells with a paler central zone and NO nucleus.',
        functionOrRole: 'Packed with iron-containing Hemoglobin (Hb) to transport O₂ and CO₂ across the body.',
        ncertKeyFact: 'Mature mammalian RBCs lack a nucleus and mitochondria to maximize space for ~270 million Hb molecules!'
      },
      {
        id: 'neutrophil_wbc',
        name: 'Neutrophil (Granulocyte WBC)',
        category: 'Phagocytic Immune Cell',
        color: '#a855f7',
        sizeMicrons: '12–14 µm',
        abundance: '60–65% of total WBCs',
        position: [0.18, 0.15],
        description: 'Large leukocyte featuring a characteristic multi-lobed (3 to 5 lobes) dark purple nucleus and fine neutral granules.',
        functionOrRole: 'First-responder phagocyte that engulfs and destroys invading bacteria at infection sites.',
        ncertKeyFact: 'Most abundant white blood cell in human blood.'
      },
      {
        id: 'lymphocyte_wbc',
        name: 'Lymphocyte (B & T Cells)',
        category: 'Adaptive Immunity Cell',
        color: '#6366f1',
        sizeMicrons: '8–10 µm',
        abundance: '20–25% of total WBCs',
        position: [-0.25, 0.3],
        description: 'Agranulocyte with a large, dense, spherical dark-violet nucleus surrounded by a thin rim of sky-blue cytoplasm.',
        functionOrRole: 'B-lymphocytes secrete specific antibodies (IgG/IgM); T-lymphocytes mediate cellular immunity.',
        ncertKeyFact: 'Smallest leukocyte, roughly comparable in size to an RBC.'
      },
      {
        id: 'eosinophil_wbc',
        name: 'Eosinophil (Acidophil)',
        category: 'Allergy & Antiparasitic WBC',
        color: '#ec4899',
        sizeMicrons: '12–15 µm',
        abundance: '2–3% of total WBCs',
        position: [0.38, -0.24],
        description: 'Granulocyte with a spectacle-like bilobed (2-lobed) nucleus and coarse brick-red eosinophilic granules.',
        functionOrRole: 'Resists parasitic helminth infections and modulates allergic/histamine reactions.',
        ncertKeyFact: 'Stains bright orange-red with acidic dye Eosin.'
      },
      {
        id: 'platelets_thrombocytes',
        name: 'Blood Platelets (Thrombocytes)',
        category: 'Coagulation Fragments',
        color: '#f59e0b',
        sizeMicrons: '2–3 µm fragments',
        abundance: '1.5–3.5 lakh / mm³',
        position: [0.02, -0.35],
        description: 'Tiny, irregular violet-purple cell fragments clustered in small groups between RBCs.',
        functionOrRole: 'Release thromboplastin to convert prothrombin → thrombin → fibrin mesh for blood clotting.',
        ncertKeyFact: 'Formed by fragmentation of giant bone marrow cells called Megakaryocytes.'
      }
    ]
  },
  {
    id: 'mitosis_onion_root',
    title: 'Onion Root Tip Meristem — Stages of Mitosis',
    subtitle: 'Actively dividing meristematic cells showing Prophase, Metaphase, Anaphase & Telophase',
    classGrade: 11,
    subject: 'Biology',
    ncertReference: 'NCERT Class 11 Ch. 10 · Fig. 10.2 (Cell Cycle & Cell Division)',
    defaultStain: 'safranin',
    stainLabel: 'Acetocarmine Squash Preparation',
    recommendedMag: 400,
    fieldDiameterMicrons: 160,
    description:
      'Hydrolyzed and squashed Allium cepa root tip meristem stained with Acetocarmine, displaying all four mitotic karyokinesis stages in a single microscopic field.',
    slidePrepSteps: [
      'Cut 2–3 mm apical root tips from growing onion roots in the morning (peak mitotic index).',
      'Warm gently in 1N HCl + 2% Acetocarmine (1:9) to dissolve the middle lamella and stain chromosomes crimson.',
      'Place root tip on a slide in a drop of Acetocarmine, cover with a coverslip, and tap gently with a pencil eraser to squash into a single-cell layer.'
    ],
    objects: [
      {
        id: 'interphase_cell',
        name: 'Interphase Meristematic Cell',
        category: 'Preparatory Phase (G₁/S/G₂)',
        color: '#f43f5e',
        sizeMicrons: '25 µm cuboidal cell',
        abundance: '~85% of root tip cells',
        position: [-0.4, -0.28],
        description: 'Isodiametric cell with an intact nuclear envelope, prominent nucleolus, and uncondensed chromatin network.',
        functionOrRole: 'Duplicates DNA (S phase) and synthesizes tubulin spindle proteins (G₂ phase) before mitosis.',
        ncertKeyFact: 'Interphase occupies over 95% of the total duration of the cell cycle.'
      },
      {
        id: 'prophase_cell',
        name: 'Prophase Cell (Condensing Spireme)',
        category: 'Mitosis Stage 1',
        color: '#e11d48',
        sizeMicrons: '26 µm',
        abundance: 'Early dividing cell',
        position: [0.35, -0.28],
        description: 'Cell showing tangled, thick crimson chromosome threads as the nuclear membrane and nucleolus disappear.',
        functionOrRole: 'Condenses chromatin into compact sister chromatids held together at the centromere.',
        ncertKeyFact: 'Initiation of mitotic spindle assembly occurs at opposite poles.'
      },
      {
        id: 'metaphase_cell',
        name: 'Metaphase Cell (Equatorial Plate)',
        category: 'Mitosis Stage 2',
        color: '#fbbf24',
        sizeMicrons: '28 µm',
        abundance: 'Diagnostic landmark stage',
        position: [-0.02, 0.02],
        description: 'Highly condensed, thick chromosomes aligned sharply along the central equatorial (metaphase) plate with visible spindle fibers.',
        functionOrRole: 'Ensures every chromosome kinetochore is attached to spindle microtubules from both poles.',
        ncertKeyFact: 'Metaphase is the best stage under the microscope to count chromosome number and study morphology!'
      },
      {
        id: 'anaphase_cell',
        name: 'Anaphase Cell (V & J Shaped Chromatids)',
        category: 'Mitosis Stage 3',
        color: '#10b981',
        sizeMicrons: '30 µm',
        abundance: 'Rapid separation stage',
        position: [-0.32, 0.3],
        description: 'Two distinct V-shaped groups of daughter chromosomes being pulled toward opposite poles with centromeres leading.',
        functionOrRole: 'Splits centromeres and segregates identical genetic copies to opposite ends of the cell.',
        ncertKeyFact: 'Shortest phase of mitosis; chromosome arms trail behind the leading centromere.'
      },
      {
        id: 'telophase_cell',
        name: 'Telophase & Cell Plate (Phragmoplast)',
        category: 'Mitosis Stage 4 + Cytokinesis',
        color: '#38bdf8',
        sizeMicrons: '32 µm',
        abundance: 'Late dividing cell',
        position: [0.34, 0.3],
        description: 'Two daughter nuclei reformed at opposite poles separated by a newly forming central Golgi cell plate.',
        functionOrRole: 'Completes plant cytokinesis centrifugally (from center outward) to form two diploid (2n) cells.',
        ncertKeyFact: 'Plant cells divide via a centrifugal Cell Plate (Phragmoplast) instead of a contractile furrow.'
      }
    ]
  },
  {
    id: 'neuron_histology',
    title: 'Multipolar Motor Neuron & Myelinated Nerve Fiber Slide',
    subtitle: 'Stellate cyton, Nissl’s granules, dendritic arbor, and Nodes of Ranvier',
    classGrade: 10,
    subject: 'Biology',
    ncertReference: 'NCERT Class 10 Ch. 6 · Fig. 6.1(a) (Control & Coordination)',
    defaultStain: 'fluorescence',
    stainLabel: 'Silver Nitrate / Neuro-Fluorescence Stain',
    recommendedMag: 400,
    fieldDiameterMicrons: 220,
    description:
      'Spinal cord smear stained to reveal the star-shaped cell body (soma) of a multipolar motor neuron, branching dendrites, Nissl bodies, and a long myelinated axon.',
    slidePrepSteps: [
      'Prepare a thin histological section or smear of spinal cord gray matter.',
      'Fix and impregnate with Cajal Silver Nitrate or fluorescent neuro-stain to highlight neurofibrils and Nissl substance.'
    ],
    objects: [
      {
        id: 'cyton_soma',
        name: 'Cyton (Cell Body / Soma)',
        category: 'Metabolic Center',
        color: '#22d3ee',
        sizeMicrons: '35–50 µm diameter',
        abundance: 'Central star-shaped body',
        position: [-0.24, 0.04],
        description: 'Large stellate (star-shaped) neuronal body housing a euchromatic nucleus with a prominent nucleolus.',
        functionOrRole: 'Integrates incoming graded potentials and synthesizes neurotransmitters.',
        ncertKeyFact: 'Mature neurons lack centrioles and therefore cannot undergo cell division.'
      },
      {
        id: 'nissl_granules',
        name: 'Nissl’s Granules (Rough ER Clusters)',
        category: 'Protein Synthesis Bodies',
        color: '#f59e0b',
        sizeMicrons: '2–4 µm basophilic clumps',
        abundance: 'Abundant in soma & dendrites',
        position: [-0.18, -0.06],
        description: 'Darkly stained basophilic clumps distributed throughout the cyton and dendrites (absent in the axon).',
        functionOrRole: 'Mass-produce neuroproteins and enzymes required for neurotransmitter synthesis.',
        ncertKeyFact: 'Composed of Rough Endoplasmic Reticulum (RER) and free polysomes.'
      },
      {
        id: 'dendritic_tree',
        name: 'Branching Dendrites',
        category: 'Afferent Receptor Processes',
        color: '#38bdf8',
        sizeMicrons: 'Up to 100 µm branches',
        abundance: '5–8 radiating branches',
        position: [-0.46, 0.22],
        description: 'Short, tapering, highly branched protoplasmic extensions radiating from the cell body.',
        functionOrRole: 'Receive chemical signals across synapses and conduct impulses TOWARD the cyton.',
        ncertKeyFact: 'Covered in microscopic dendritic spines that increase synaptic surface area.'
      },
      {
        id: 'myelin_schwann',
        name: 'Myelin Sheath & Schwann Cells',
        category: 'Lipid Electrical Insulation',
        color: '#a855f7',
        sizeMicrons: '20 µm internode segments',
        abundance: 'Wraps along the axon shaft',
        position: [0.16, -0.04],
        description: 'Segmented lipoprotein insulating sleeves wrapped around the central axon cylinder.',
        functionOrRole: 'Prevents ion leakage and speeds up action potential conduction up to 120 m/s.',
        ncertKeyFact: 'Secreted by Schwann cells in the Peripheral Nervous System (PNS).'
      },
      {
        id: 'node_of_ranvier',
        name: 'Node of Ranvier',
        category: 'Saltatory Conduction Gap',
        color: '#fde047',
        sizeMicrons: '1 µm unmyelinated gap',
        abundance: 'Periodic constrictions along axon',
        position: [0.02, -0.02],
        description: 'Microscopic periodic constriction between two adjacent myelin sheath segments.',
        functionOrRole: 'Rich in voltage-gated Na⁺ channels; enables rapid "jumping" (saltatory) conduction of nerve impulses.',
        ncertKeyFact: 'Dramatically reduces ATP energy needed by Na⁺/K⁺ pumps.'
      },
      {
        id: 'axon_terminals',
        name: 'Axon Terminal Synaptic Knobs',
        category: 'Efferent Transmitter Bulbs',
        color: '#34d399',
        sizeMicrons: '3–5 µm terminal boutons',
        abundance: 'Branched distal endings',
        position: [0.46, -0.14],
        description: 'Bulb-like distal endings of the axon filled with acetylcholine synaptic vesicles.',
        functionOrRole: 'Convert electrical action potential into chemical neurotransmitter release across the synaptic cleft.',
        ncertKeyFact: 'Forms the neuromuscular junction when synapsing with skeletal muscle fibers.'
      }
    ]
  },
  {
    id: 'vascular_bundle_ts',
    title: 'T.S. of Dicot Stem — Xylem, Phloem & Vascular Cambium',
    subtitle: 'Conjoint, collateral, open vascular bundles arranged in a ring with protoxylem & metaxylem',
    classGrade: 9,
    subject: 'Biology',
    ncertReference: 'NCERT Class 9 Ch. 6 (Tissues) & Class 11 Ch. 6 · Fig. 6.7',
    defaultStain: 'safranin',
    stainLabel: 'Safranin & Fast Green Double Stain',
    recommendedMag: 100,
    fieldDiameterMicrons: 420,
    description:
      'Thin transverse section of a dicotyledonous stem (Helianthus / Sunflower) double-stained with Safranin (staining lignified xylem red) and Fast Green (staining cellulose phloem green).',
    slidePrepSteps: [
      'Cut ultra-thin transverse sections of a fresh dicot stem using a wet razor blade.',
      'Stain in Safranin for 2 minutes, rinse in water, and counter-stain in Fast Green for 30 seconds.',
      'Mount in glycerine and observe the ring of wedge-shaped vascular bundles under 100x.'
    ],
    objects: [
      {
        id: 'metaxylem_vessels',
        name: 'Metaxylem Vessels (Wide Lignified Tubes)',
        category: 'Water-Conducting Tissue',
        color: '#e11d48',
        sizeMicrons: '60–80 µm lumen',
        abundance: 'Outer region of xylem wedge',
        position: [-0.15, -0.18],
        description: 'Large, thick-walled, polygonal red-stained vessels facing toward the periphery (pericycle).',
        functionOrRole: 'Conduct water and dissolved mineral salts upward from roots to leaves.',
        ncertKeyFact: 'Because protoxylem lies toward the pith (center) and metaxylem toward the periphery, dicot stem xylem is Endarch!'
      },
      {
        id: 'protoxylem_vessels',
        name: 'Protoxylem (First-Formed Xylem)',
        category: 'Primary Xylem',
        color: '#f43f5e',
        sizeMicrons: '20–30 µm narrow lumen',
        abundance: 'Pointing inward toward central pith',
        position: [-0.02, 0.24],
        description: 'Smaller, narrower lignified tracheary elements situated near the central pith.',
        functionOrRole: 'Provides water conduction in young elongating stems with annular and spiral thickenings.',
        ncertKeyFact: 'Dead at maturity and lacks protoplasm to offer zero resistance to water flow.'
      },
      {
        id: 'vascular_cambium',
        name: 'Intrafascicular Vascular Cambium Strip',
        category: 'Lateral Meristem',
        color: '#fbbf24',
        sizeMicrons: '3–5 cell layers thick',
        abundance: 'Sandwiched between Xylem & Phloem',
        position: [0.02, -0.02],
        description: 'Thin strip of rectangular, thin-walled meristematic cells separating phloem (outer) and xylem (inner).',
        functionOrRole: 'Divides to form secondary xylem and secondary phloem during secondary growth (girth increase).',
        ncertKeyFact: 'Presence of cambium makes dicot vascular bundles "Open" (unlike "Closed" monocot bundles).'
      },
      {
        id: 'phloem_sieve_tubes',
        name: 'Phloem (Sieve Tubes & Companion Cells)',
        category: 'Food-Translocating Tissue',
        color: '#10b981',
        sizeMicrons: '25–40 µm',
        abundance: 'Outer cap of vascular bundle',
        position: [0.24, -0.26],
        description: 'Emerald-green stained living tissue located on the outer side of the cambium strip.',
        functionOrRole: 'Bidirectionally translocates sucrose and amino acids from leaves to roots, fruits, and buds.',
        ncertKeyFact: 'Sieve tube elements lack a nucleus at maturity and are controlled by adjacent Companion Cells.'
      },
      {
        id: 'sclerenchyma_bundle_cap',
        name: 'Sclerenchymatous Pericycle (Bundle Cap)',
        category: 'Mechanical Support Tissue',
        color: '#9f1239',
        sizeMicrons: 'Semilunar patch',
        abundance: 'Caps the outer edge of phloem',
        position: [0.36, -0.34],
        description: 'Thick-walled, lignified dead sclerenchyma fibers forming a crescent-shaped cap above the phloem.',
        functionOrRole: 'Protects delicate phloem sieve tubes and gives tensile bending strength to the stem.',
        ncertKeyFact: 'Also called hard bast in dicot stems like sunflower.'
      }
    ]
  },
  {
    id: 'pond_microorganisms',
    title: 'Pond Water Drop — Amoeba, Paramecium & Spirogyra',
    subtitle: 'Unicellular protozoans with pseudopodia/cilia alongside filamentous green algae',
    classGrade: 8,
    subject: 'Biology',
    ncertReference: 'NCERT Class 8 Ch. 2 & Class 10 Ch. 5 · Fig. 5.5 (Nutrition in Amoeba)',
    defaultStain: 'iodine',
    stainLabel: 'Live Wet Mount / Dilute Methylcellulose',
    recommendedMag: 100,
    fieldDiameterMicrons: 400,
    description:
      'A single drop of freshwater pond water revealing diverse eukaryotic microorganisms: shape-shifting Amoeba proteus, slipper-shaped ciliated Paramecium, and spiral-chloroplast Spirogyra filaments.',
    slidePrepSteps: [
      'Collect a drop of greenish pond water from near submerged aquatic weeds using a dropper.',
      'Place on a cavity slide with a tiny drop of methylcellulose to slow down fast-swimming protozoans.',
      'Cover gently with a coverslip and scan under 100x low-power objective.'
    ],
    objects: [
      {
        id: 'amoeba_pseudopodia',
        name: 'Amoeba proteus & Pseudopodia (False Feet)',
        category: 'Amoeboid Protozoan',
        color: '#38bdf8',
        sizeMicrons: '250–400 µm',
        abundance: 'Slowly gliding on slide floor',
        position: [-0.28, 0.14],
        description: 'Irregular, continuously changing unicellular organism extending finger-like cytoplasmic projections (pseudopodia).',
        functionOrRole: 'Uses pseudopodia for locomotion and holozoic phagocytosis (engulfing food to form a food vacuole).',
        ncertKeyFact: 'Reproduces asexually by Binary Fission; osmoregulates via a pulsating Contractile Vacuole.'
      },
      {
        id: 'amoeba_food_vacuole',
        name: 'Food Vacuole & Contractile Vacuole in Amoeba',
        category: 'Digestive & Osmoregulatory Organelles',
        color: '#f59e0b',
        sizeMicrons: '20–35 µm vesicles',
        abundance: 'Inside endoplasm of Amoeba',
        position: [-0.22, 0.08],
        description: 'Spherical intracellular vesicles inside Amoeba containing engulfed diatoms/bacteria and clear water.',
        functionOrRole: 'Digestive enzymes break down food inside the food vacuole; contractile vacuole expels excess water.',
        ncertKeyFact: 'Demonstrates intracellular holozoic digestion in unicellular eukaryotes.'
      },
      {
        id: 'paramecium_cilia',
        name: 'Paramecium caudatum (Slipper Animalcule)',
        category: 'Ciliated Protozoan',
        color: '#a855f7',
        sizeMicrons: '180–300 µm long',
        abundance: 'Actively swimming protozoan',
        position: [0.3, 0.22],
        description: 'Slipper-shaped unicellular organism covered in thousands of rhythmic hair-like cilia and a distinct oral groove.',
        functionOrRole: 'Coordinated ciliary beating propels the cell and sweeps bacteria into the cytostome (cell mouth).',
        ncertKeyFact: 'Exhibits nuclear dimorphism: a large kidney-shaped Macronucleus and a small Micronucleus.'
      },
      {
        id: 'spirogyra_filament',
        name: 'Spirogyra Filament & Spiral Chloroplast',
        category: 'Filamentous Green Alga (Chlorophyceae)',
        color: '#22c55e',
        sizeMicrons: '50 µm wide cylindrical cells',
        abundance: 'Unbranched green chains',
        position: [0.05, -0.28],
        description: 'Cylindrical cells joined end-to-end featuring ribbon-like spiral green chloroplasts studded with pyrenoids.',
        functionOrRole: 'Performs oxygenic photosynthesis; pyrenoids store starch around protein cores.',
        ncertKeyFact: 'Reproduces asexually by Fragmentation and sexually by scalariform conjugation.'
      }
    ]
  }
];
