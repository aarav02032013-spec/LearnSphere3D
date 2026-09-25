import { Pinpoint } from '../types';

export type NCERTClassGrade = 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type NCERTSubject = 'Biology' | 'Physics' | 'Chemistry';

export interface NCERTDiagramItem {
  id: string;
  title: string;
  classGrade: NCERTClassGrade;
  subject: NCERTSubject;
  chapter: string;
  ncertFigure: string;
  subtitle: string;
  description: string;
  keyConcepts: string[];
  examTips: string[];
  keyFormulasOrFacts: string[];
  pinpoints: Pinpoint[];
  renderType: string;
  formula?: string;
  boardImportance: 'High' | 'Very High' | 'Crucial';
}

export const NCERT_DIAGRAMS: NCERTDiagramItem[] = [
  // --- CLASS 6 ---
  {
    id: 'flower_anatomy',
    title: 'Parts of a Typical Flower',
    classGrade: 6,
    subject: 'Biology',
    chapter: 'Chapter 7: Getting to Know Plants',
    ncertFigure: 'Fig. 7.20 - Parts of a flower',
    subtitle: 'Floral whorls: Calyx, Corolla, Androecium (Male), and Gynoecium (Female)',
    description: 'A typical angiosperm flower consists of four concentric whorls borne on a swollen receptacle (thalamus): outermost green sepals for protection, colorful petals for pollinator attraction, male stamens bearing anthers, and central female pistil containing the ovary and ovules.',
    boardImportance: 'High',
    keyConcepts: [
      'Four Floral Whorls (Calyx, Corolla, Androecium, Gynoecium)',
      'Male Reproductive Organ: Stamen (Anther + Filament)',
      'Female Reproductive Organ: Pistil/Carpel (Stigma, Style, Ovary)',
      'Ovules developing into seeds after double fertilization'
    ],
    examTips: [
      'Frequently asked: Differentiate between complete and incomplete flowers, or unisexual (papaya/cucumber) and bisexual (mustard/hibiscus) flowers.',
      'Always label the three distinct parts of the carpel: Stigma (receptive surface), Style (slender tube), and Ovary (swollen basal chamber).'
    ],
    keyFormulasOrFacts: [
      'Flower is a modified vegetative shoot meant specifically for sexual reproduction.',
      'Anther contains microsporangia that produce haploid pollen grains.'
    ],
    renderType: 'ncert_flower',
    pinpoints: [
      {
        id: 'stigma',
        name: 'Stigma & Style',
        position: [0, 1.4, 0],
        description: 'Sticky terminal landing platform that receives pollen grains, anchored by a slender tubular style traversing down to the ovary.',
        significance: 'Excretes sugary fluid to stimulate pollen tube germination and elongation.',
        formulaOrFact: 'Pollen tube grows through the style guided by chemotropic calcium gradients.'
      },
      {
        id: 'anther',
        name: 'Anther (with Pollen Grains)',
        position: [0.65, 1.15, 0.35],
        description: 'Bilobed, dithecous sac perched on the filament where microsporogenesis yields thousands of powdery pollen grains.',
        significance: 'Houses male gametophytes necessary for pollination and fertilization.',
        formulaOrFact: 'Typically dithecous with 4 pollen microsporangia.'
      },
      {
        id: 'filament',
        name: 'Filament',
        position: [0.45, 0.65, 0.25],
        description: 'Slender, flexible stalk holding the anther in an elevated position exposed to wind or insect pollinators.',
        significance: 'Its proximal end attaches to the floral thalamus or corolla petal.',
        formulaOrFact: 'Stamen = Filament + Anther.'
      },
      {
        id: 'petals',
        name: 'Petals (Corolla)',
        position: [1.1, 0.45, 0.6],
        description: 'Brightly colored, scented leaf-like appendages arranged around reproductive organs.',
        significance: 'Attracts insect pollinators (bees, butterflies) and shields the interior stamens and carpels.',
        formulaOrFact: 'Collective term: Corolla; can be polypetalous (free) or gamopetalous (fused).'
      },
      {
        id: 'ovary',
        name: 'Ovary (with Ovules)',
        position: [0, 0.1, 0],
        description: 'Swollen basal chamber of the carpel enclosing one or more ovules attached to the placenta.',
        significance: 'Post-fertilization, the ovary matures into the fruit while fertilized ovules become seeds.',
        formulaOrFact: 'Ovary wall transforms into the pericarp (epicarp + mesocarp + endocarp).'
      },
      {
        id: 'sepals',
        name: 'Sepals (Calyx) & Receptacle',
        position: [0.7, -0.4, 0],
        description: 'Green outermost whorl supporting the flower in bud stage, supported by the expanded receptacle (thalamus).',
        significance: 'Prevents desiccation and insect predation before flower anthesis.',
        formulaOrFact: 'Collective term: Calyx; provides photosynthetic nutrition during early budding.'
      }
    ]
  },
  {
    id: 'simple_circuit',
    title: 'Simple Electric Circuit & Key',
    classGrade: 6,
    subject: 'Physics',
    chapter: 'Chapter 12: Electricity and Circuits',
    ncertFigure: 'Fig. 12.5 - An electric circuit with a switch',
    subtitle: 'Closed conducting path comprising electrochemical cell, switch, and incandescent filament',
    description: 'An electric circuit provides a complete unbroken loop through which electric charge flows from the positive terminal of a power source, through conducting wires and a load (bulb), back to the negative terminal.',
    boardImportance: 'High',
    keyConcepts: [
      'Conventional current flow (Positive to Negative) vs Electron drift',
      'Open Circuit (broken path, no current) vs Closed Circuit',
      'Tungsten filament glow via Joule electrical heating ($H = I^2Rt$)',
      'Conductors vs Insulators'
    ],
    examTips: [
      'Common question: Why does a bulb with a broken filament fail to glow? (Because the circuit is rendered open/incomplete).',
      'Direction of conventional current is always drawn opposite to the direction of flow of negatively charged electrons.'
    ],
    keyFormulasOrFacts: [
      'Current $I = Q / t$ (Amperes, A = Coulombs/sec).',
      'Tungsten has high melting point (3422 °C) preventing vaporization during incandescence.'
    ],
    renderType: 'ncert_circuit',
    formula: 'I = Q / t, V = I · R',
    pinpoints: [
      {
        id: 'dry_cell',
        name: 'Dry Cell (Voltage Source)',
        position: [-1.4, 0.1, 0],
        description: 'Electrochemical energy converter providing electromotive force (EMF) via redox reactions between manganese dioxide and zinc.',
        significance: 'Creates potential difference driving free electron drift through the closed circuit.',
        formulaOrFact: 'Standard terminal potential difference ≈ 1.5 V.'
      },
      {
        id: 'switch_key',
        name: 'Plug Key / Switch',
        position: [0, -0.8, 0],
        description: 'Conducting brass key or metal lever that closes or interrupts electrical continuity.',
        significance: 'Safely controls activation of connected electrical appliances without disconnecting wiring.',
        formulaOrFact: 'In open state, air gap has virtually infinite resistance, terminating current.'
      },
      {
        id: 'filament_bulb',
        name: 'Incandescent Filament Lamp',
        position: [1.2, 0.4, 0],
        description: 'Coiled tungsten filament encased in an inert argon/nitrogen glass globe that glows white-hot when electrons collide with lattice atoms.',
        significance: 'Converts electrical energy into luminous radiation via incandescence.',
        formulaOrFact: 'Electrical power dissipated $P = V \\cdot I = I^2 R$.'
      },
      {
        id: 'copper_wire',
        name: 'Insulated Copper Conductors',
        position: [0, 0.8, 0],
        description: 'Low-resistivity copper metal wires clad in PVC polymer insulating jacket.',
        significance: 'Carries current with negligible resistive drop while preventing accidental short circuits.',
        formulaOrFact: 'Resistivity of copper $\\rho \\approx 1.68 \\times 10^{-8}\\ \\Omega\\cdot\\text{m}$.'
      }
    ]
  },

  // --- CLASS 7 ---
  {
    id: 'digestive_system',
    title: 'Human Alimentary Canal & Digestive Glands',
    classGrade: 7,
    subject: 'Biology',
    chapter: 'Chapter 2: Nutrition in Animals',
    ncertFigure: 'Fig. 2.2 - Human digestive system',
    subtitle: 'Continuous muscular gastrointestinal tract spanning mouth, stomach, intestines, liver, and pancreas',
    description: 'The human digestive system breaks down complex insoluble food macromolecules into absorbable micromolecules through mechanical peristalsis, hydrochloric acid denaturation, and enzymatic hydrolysis in the mouth, stomach, small intestine, and large intestine.',
    boardImportance: 'Very High',
    keyConcepts: [
      'Salivary Amylase starch digestion in buccal cavity',
      'Stomach: Pepsin activation by HCl (pH 1.5–2.0) and protective mucus',
      'Liver Bile: Emulsification of fats (alkalizing acidic chyme)',
      'Small Intestinal Villi: Vast surface area for nutrient absorption'
    ],
    examTips: [
      'Frequent board question: Role of bile juice even though it contains no enzymes (Emulsification of large lipid globules into small droplets to increase lipase action surface area).',
      'Remember: Complete digestion of carbohydrates, proteins, and fats occurs exclusively in the Small Intestine.'
    ],
    keyFormulasOrFacts: [
      'Total alimentary canal length in adult humans is approximately 9 meters (~30 feet).',
      'Small intestinal villi and microvilli increase internal mucosal surface area by over 300-fold.'
    ],
    renderType: 'ncert_digestive',
    pinpoints: [
      {
        id: 'mouth_esophagus',
        name: 'Esophagus & Food Pipe',
        position: [0, 1.45, 0],
        description: 'Muscular tube conveying the masticated bolus from the pharynx to the stomach via rhythmic wave-like peristaltic contractions.',
        significance: 'No digestive enzymes are secreted here; purely transport organ lined with protective stratified epithelium.',
        formulaOrFact: 'Peristalsis operates independently of gravity.'
      },
      {
        id: 'stomach',
        name: 'Stomach (J-shaped Bag)',
        position: [0.35, 0.55, 0.2],
        description: 'J-shaped muscular organ secreting gastric juice containing pepsinogen, hydrochloric acid (HCl), and mucus.',
        significance: 'Kills ingested bacteria, creates acidic pH for pepsin protein digestion, and churns food into liquid chyme.',
        formulaOrFact: 'Gastric acid secretion generates pH 1.5 to 2.5; mucus prevents gastric self-digestion.'
      },
      {
        id: 'liver_gallbladder',
        name: 'Liver & Gall Bladder',
        position: [-0.65, 0.65, 0.15],
        description: 'Largest gland of the human body producing alkaline golden-green bile juice, stored and concentrated in the gall bladder.',
        significance: 'Bile salts (sodium glycocholate/taurocholate) emulsify dietary fats and neutralize acidic gastric chyme.',
        formulaOrFact: 'Weighs 1.2 to 1.5 kg; receives dual blood supply via hepatic artery and hepatic portal vein.'
      },
      {
        id: 'pancreas',
        name: 'Pancreas (Heterocrine Gland)',
        position: [0.1, 0.2, -0.1],
        description: 'Elongated retroperitoneal gland secreting alkaline pancreatic juice containing trypsin, amylase, and pancreatic lipase.',
        significance: 'Executes comprehensive digestion of proteins, starches, and lipids in the duodenum.',
        formulaOrFact: 'Endocrine islets of Langerhans secrete insulin and glucagon for blood glucose homeostasis.'
      },
      {
        id: 'small_intestine',
        name: 'Small Intestine (Duodenum, Jejunum, Ileum)',
        position: [0, -0.3, 0.25],
        description: 'Highly coiled ~6-meter tube lined with millions of microscopic finger-like projections called villi.',
        significance: 'Site of complete digestion and principal organ for nutrient absorption into capillary and lacteal lymph vessels.',
        formulaOrFact: 'Villi and brush-border microvilli expand absorption surface area to ~250 m².'
      },
      {
        id: 'large_intestine',
        name: 'Large Intestine (Colon & Rectum)',
        position: [0, -0.65, 0.15],
        description: 'Broader frame-like intestinal canal absorbing residual water, mineral salts, and forming solid fecal waste.',
        significance: 'Prevents dehydration by reabsorbing over 90% of water from undigested residue.',
        formulaOrFact: 'Harbors trillions of symbiotic gut microbiome bacteria synthesizing vitamins B and K.'
      }
    ]
  },
  {
    id: 'stomata_leaf',
    title: 'Structure of Stomata & Guard Cells',
    classGrade: 7,
    subject: 'Biology',
    chapter: 'Chapter 1: Nutrition in Plants',
    ncertFigure: 'Fig. 1.4 - Stoma and guard cells',
    subtitle: 'Microscopic epidermal pores flanked by turgid guard cells regulating transpiration and gas exchange',
    description: 'Stomata are microscopic apertures in plant leaf epidermis enclosed by a pair of specialized bean/kidney-shaped guard cells that swell or shrink due to potassium ion ($K^+$) driven endosmosis and exosmosis, governing carbon dioxide intake and water vapor loss.',
    boardImportance: 'Very High',
    keyConcepts: [
      'Guard cell turgidity opens the pore; flaccidity closes it',
      'Differential wall thickening: Thick inelastic inner wall, thin elastic outer wall',
      'Active Potassium ($K^+$) pump hypothesis & Malate proton exchange',
      'Gas exchange ($CO_2$ in, $O_2$ out) & Transpiration cooling'
    ],
    examTips: [
      'Classic board question: Diagram and explain the mechanism of opening and closing of stomata.',
      'Remember: Guard cells uniquely contain chloroplasts unlike adjacent ordinary epidermal cells!'
    ],
    keyFormulasOrFacts: [
      'Endosmosis increases turgor pressure; elastic outer walls bulge outwards, pulling inner thick walls apart.',
      'Transpiration accounts for up to 95% of water lost by terrestrial plants.'
    ],
    renderType: 'ncert_stomata',
    pinpoints: [
      {
        id: 'guard_cells',
        name: 'Guard Cells (Kidney / Dumbbell Shaped)',
        position: [0, 0, 0.3],
        description: 'Pair of specialized epidermal cells possessing dense cytoplasm, distinct nuclei, and photosynthetic chloroplasts.',
        significance: 'Dynamically modulate aperture dimensions by altering internal osmotic turgor pressure.',
        formulaOrFact: 'Kidney-shaped in dicots; dumbbell-shaped in monocot grasses.'
      },
      {
        id: 'stomatal_pore',
        name: 'Stomatal Aperture / Pore',
        position: [0, 0, 0],
        description: 'Central elliptical slit opening through which gaseous diffusion ($CO_2$, $O_2$, $H_2O$) occurs.',
        significance: 'Acts as gateway for photosynthetic carbon fixation and cooling transpiration stream.',
        formulaOrFact: 'Pore diameter typically ranges between 3 to 12 micrometers when fully open.'
      },
      {
        id: 'inner_wall',
        name: 'Thick Inelastic Inner Cell Wall',
        position: [0.25, 0, 0.1],
        description: 'Heavily reinforced cellulosic wall facing the pore slit that curves outward when guard cells become turgid.',
        significance: 'Radial micellation of cellulose microfibrils causes longitudinal expansion and pore opening.',
        formulaOrFact: 'Thicker inner wall resists outward ballooning, forcing crescent curvature.'
      },
      {
        id: 'chloroplasts_guard',
        name: 'Guard Cell Chloroplasts',
        position: [-0.65, 0.6, 0.15],
        description: 'Green plastids generating ATP and malate organic anions in sunlight to fuel the active $H^+/K^+$ antiporter.',
        significance: 'Triggers daytime stomatal opening for photosynthetic carbon dioxide uptake.',
        formulaOrFact: 'Produce osmotically active solutes fueling potassium ion uptake.'
      },
      {
        id: 'epidermal_cells',
        name: 'Subsidiary / Epidermal Cells',
        position: [1.1, 0.8, 0],
        description: 'Surrounding pavement epidermal cells lacking chloroplasts that serve as water and ion reservoirs.',
        significance: 'Donates water to guard cells during turgor gain and accepts water during nocturnal closure.',
        formulaOrFact: 'Covered with a waxy hydrophobic cutin layer preventing unmanaged desiccation.'
      }
    ]
  },

  // --- CLASS 8 ---
  {
    id: 'candle_flame',
    title: 'Structure of a Candle Flame (Combustion Zones)',
    classGrade: 8,
    subject: 'Chemistry',
    chapter: 'Chapter 6: Combustion and Flame',
    ncertFigure: 'Fig. 6.13 - Different zones of candle flame',
    subtitle: 'Three concentric combustion zones: Non-luminous outer, Luminous middle, and Dark innermost zone',
    description: 'When wax vaporizes and combusts in atmospheric oxygen, it forms three distinct thermal zones: the innermost dark zone of unburnt wax vapors, the middle luminous yellow zone of incomplete combustion containing glowing incandescent carbon particles, and the outermost non-luminous blue zone of complete combustion (hottest part).',
    boardImportance: 'High',
    keyConcepts: [
      'Gaseous substances vaporize during burning to produce a flame',
      'Outer blue zone: Complete combustion ($CO_2 + H_2O$), highest temperature (~1400 °C)',
      'Middle yellow zone: Incomplete combustion with glowing free carbon particles (soot)',
      'Goldsmiths blow through a blowpipe into the outermost zone for jewelry smelting'
    ],
    examTips: [
      'Exam question: Why do goldsmiths use the outermost zone of a flame? (Because it is the hottest zone of complete combustion and does not leave black soot on gold/silver).',
      'Why is the middle zone luminous? (Glowing incandescent unburnt carbon micro-particles emit visible yellow-orange photons).'
    ],
    keyFormulasOrFacts: [
      'Combustion reaction: $C_n H_{2n+2} + O_2 \\rightarrow CO_2 + H_2O + \\text{Heat} + \\text{Light}$.',
      'Outer zone temperature: 1200–1400 °C; Middle zone: ~1000 °C; Inner zone: ~600 °C.'
    ],
    renderType: 'ncert_flame',
    pinpoints: [
      {
        id: 'outer_zone',
        name: 'Outermost Zone (Complete Combustion)',
        position: [0, 1.4, 0],
        description: 'Faint blue, non-luminous outer sheath where unlimited atmospheric oxygen allows 100% complete oxidation.',
        significance: 'Hottest region of the flame (~1400 °C); completely soot-free.',
        formulaOrFact: 'Used by goldsmiths with metallic blowpipes for precision brazing.'
      },
      {
        id: 'middle_zone',
        name: 'Middle Luminous Zone (Incomplete Combustion)',
        position: [0, 0.7, 0.2],
        description: 'Bright yellow-orange zone with limited oxygen supply where hydrocarbons crack into free carbon nanoparticles.',
        significance: 'Carbon particles become incandescent and radiate yellow visible light, leaving black soot deposit on cool surfaces.',
        formulaOrFact: 'Moderately hot (~1000 °C); responsible for primary flame luminosity.'
      },
      {
        id: 'inner_dark_zone',
        name: 'Innermost Dark Zone (Unburnt Vapors)',
        position: [0, 0.05, 0.1],
        description: 'Dark black/transparent area immediately surrounding the wick containing uncombusted wax vapors.',
        significance: 'Least hot zone (~600 °C); zero combustion occurs here due to absence of oxygen penetration.',
        formulaOrFact: 'If a glass capillary tube is inserted here, flammable vapors exit and can be ignited at the other end.'
      },
      {
        id: 'wick_wax',
        name: 'Braided Wick & Liquid Wax Molten Pool',
        position: [0, -0.6, 0],
        description: 'Cotton capillary wick drawing molten paraffin wax upward through surface tension capillary action.',
        significance: 'Heat from flame continuously melts solid paraffin to sustain the vaporization cycle.',
        formulaOrFact: 'Wax melts at ~50–65 °C and vaporizes at ~300 °C.'
      }
    ]
  },
  {
    id: 'human_eye_diagram',
    title: 'Human Eye Anatomy & Refractive Media',
    classGrade: 8,
    subject: 'Biology',
    chapter: 'Chapter 16: Light',
    ncertFigure: 'Fig. 16.14 - Human eye',
    subtitle: 'Cornea, Iris, Crystalline Biconvex Lens, Ciliary Muscles, Retina, and Optic Nerve',
    description: 'The human eye acts as an exquisite biological camera: light rays are refracted first by the transparent cornea and aqueous humor, regulated by the pupil aperture, focused by the flexible crystalline lens, and focused onto the sensory retina where rods and cones trigger optic nerve impulses.',
    boardImportance: 'Crucial',
    keyConcepts: [
      'Cornea provides roughly 70% of total optical refractive power',
      'Power of Accommodation: Ciliary muscles alter lens curvature for close vs distant focus',
      'Pupillary light reflex via circular sphincter and radial dilator iris muscles',
      'Retinal Photoreceptors: Rods (scotopic/twilight vision) and Cones (photopic/color vision)'
    ],
    examTips: [
      'Defects of vision (Class 10 link): Myopia (nearsightedness, corrected by concave lens) vs Hypermetropia (farsightedness, corrected by convex lens).',
      'Blind spot: Region on retina where the optic nerve leaves the eyeball; completely devoid of photoreceptors.'
    ],
    keyFormulasOrFacts: [
      'Near point of normal eye $d = 25\\text{ cm}$; Far point is at infinity ($\\infty$).',
      'Total optical power of the relaxed human eye $\\approx +60\\text{ Diopters}$.'
    ],
    renderType: 'ncert_eye',
    pinpoints: [
      {
        id: 'cornea',
        name: 'Cornea & Anterior Chamber',
        position: [0, 0, 1.25],
        description: 'Transparent convex anterior dome made of arranged collagen fibers bathed in aqueous humor.',
        significance: 'Provides the major static refraction (+40 to +44 Diopters) converging incoming light rays.',
        formulaOrFact: 'Avascular; derives oxygen directly from the surrounding atmosphere.'
      },
      {
        id: 'iris_pupil',
        name: 'Iris & Adjustable Pupil',
        position: [0, 0, 1.02],
        description: 'Pigmented muscular curtain with circular sphincter and radial dilator muscles regulating light aperture.',
        significance: 'Constricts in bright light (protecting retina) and dilates in darkness (maximizing photons).',
        formulaOrFact: 'Pupil diameter dynamically adjusts between 2 mm (bright sunlight) and 8 mm (night vision).'
      },
      {
        id: 'crystalline_lens',
        name: 'Crystalline Biconvex Lens & Zonules',
        position: [0, 0, 0.75],
        description: 'Transparent, flexible fibrous protein lens suspended by fine ciliary zonule ligaments (Zonules of Zinn).',
        significance: 'Performs fine focal adjustments (accommodation) to focus objects at variable distances.',
        formulaOrFact: 'Lens power varies dynamically between +15 D (infinity) and +30 D (near reading).'
      },
      {
        id: 'ciliary_body',
        name: 'Ciliary Muscles & Ciliary Body',
        position: [0, 0.95, 0.75],
        description: 'Circular smooth muscle ring controlling lens curvature by contracting (slackening zonules) or relaxing.',
        significance: 'Crucial for dynamic visual accommodation; loss of elasticity leads to presbyopia.',
        formulaOrFact: 'Also secretes nutrient-rich aqueous humor into the posterior chamber.'
      },
      {
        id: 'retina',
        name: 'Retina & Fovea Centralis',
        position: [0, 0, -1.25],
        description: 'Light-sensitive neural membrane coating posterior eyeball, containing ~120 million rods and ~6 million cones.',
        significance: 'Fovea centralis provides sharpest 20/20 central color vision; photopigments transduce photons into electrical signals.',
        formulaOrFact: 'Image formed on retina is real, inverted, and diminished.'
      },
      {
        id: 'optic_nerve',
        name: 'Optic Nerve (CN II) & Blind Spot',
        position: [0.32, -0.15, -1.6],
        description: 'Thick bundle of over 1.2 million retinal ganglion cell axons exiting the back of eyeball toward the visual cortex.',
        significance: 'Transmits electrochemical action potentials; creates an insensitive blind spot lacking rods and cones.',
        formulaOrFact: 'Cranial Nerve II; myelin insulation increases signal transmission speeds up to 100 m/s.'
      }
    ]
  },

  // --- CLASS 9 ---
  {
    id: 'neuron_anatomy',
    title: 'Structure of a Neuron (Nerve Cell)',
    classGrade: 9,
    subject: 'Biology',
    chapter: 'Chapter 6: Tissues',
    ncertFigure: 'Fig. 6.12 - Neuron: unit of nervous tissue',
    subtitle: 'Cell body (cyton), branching dendrites, elongated axon with myelin sheath, and synaptic terminals',
    description: 'Neurons are the structural and functional units of the nervous system specialized for electrochemical impulse conduction. Incoming signals arrive through dendrites, are integrated in the cyton/soma, and propagate as an action potential along the axon to synaptic end bulbs.',
    boardImportance: 'Crucial',
    keyConcepts: [
      'Unidirectional impulse transmission: Dendrite $\\rightarrow$ Cyton $\\rightarrow$ Axon $\\rightarrow$ Synapse',
      'Myelin sheath produced by Schwann cells for rapid saltatory conduction',
      'Nodes of Ranvier: Unmyelinated gaps where voltage-gated $Na^+$ channels cluster',
      'Synaptic cleft: Neurotransmitter (Acetylcholine) diffusion across chemical synapse'
    ],
    examTips: [
      'Standard 3-mark diagram in CBSE Class 9 & Class 10 board exams. Label cyton, axon, dendrites, and nerve endings.',
      'Explain saltatory conduction: Nerve impulses "jump" from one Node of Ranvier to the next, increasing speed up to 120 m/s.'
    ],
    keyFormulasOrFacts: [
      'Longest cells in the human body (sciatic nerve axon can exceed 1 meter in length).',
      'Resting membrane potential is approximately $-70\\text{ mV}$ maintained by the $Na^+/K^+$ ATPase pump.'
    ],
    renderType: 'ncert_neuron',
    pinpoints: [
      {
        id: 'cyton',
        name: 'Cyton (Soma / Cell Body)',
        position: [-1.4, 0.4, 0],
        description: 'Central metabolic hub containing a large spherical nucleus, cytoplasm, and Nissl granules (rough ER clusters).',
        significance: 'Integrates excitatory and inhibitory postsynaptic potentials; generates initial axon hillock action potential.',
        formulaOrFact: 'Contains prominent nucleolus and abundant neurofilaments.'
      },
      {
        id: 'dendrites',
        name: 'Dendrites (Receptive Arbors)',
        position: [-1.9, 0.8, 0.3],
        description: 'Highly branched, tapering protoplasmic projections radiating from the cell body.',
        significance: 'Presents vast surface area studded with chemical receptors to receive signals from sensory receptors or prior neurons.',
        formulaOrFact: 'Conducts impulses centripetally (towards the soma).'
      },
      {
        id: 'axon',
        name: 'Axon (Nerve Fiber)',
        position: [0.1, 0, 0],
        description: 'Long cylindrical cytoplasmic cylinder extending from the axon hillock to convey electrical action potentials.',
        significance: 'Carries signals away from the soma towards target organs, muscles, or adjoining neurons.',
        formulaOrFact: 'Axoplasm is enclosed by a specialized plasma membrane called the axolemma.'
      },
      {
        id: 'myelin_schwann',
        name: 'Myelin Sheath & Schwann Cells',
        position: [0.2, 0.22, 0.1],
        description: 'Multilayered lipid-rich insulating sheath wrapped spirally around the axon in the peripheral nervous system.',
        significance: 'Acts as electrical insulator, preventing ion leakage and dramatically boosting conduction velocity.',
        formulaOrFact: 'Composed of 80% lipid (sphingomyelin) and 20% protein.'
      },
      {
        id: 'nodes_ranvier',
        name: 'Nodes of Ranvier',
        position: [0.65, 0, 0],
        description: 'Periodic ~1 micrometer gaps in the myelin sheath along the axon where the axolemma is exposed to extracellular fluid.',
        significance: 'Action potentials regenerate exclusively here, enabling high-speed saltatory conduction.',
        formulaOrFact: 'Packed with up to 10,000 voltage-gated $Na^+$ channels per $\\mu m^2$.'
      },
      {
        id: 'axon_terminals',
        name: 'Nerve Endings & Synaptic Knobs',
        position: [1.7, -0.3, 0],
        description: 'Terminal telodendria branches ending in swollen bulbous boutons packed with synaptic vesicles.',
        significance: 'Electrical impulse triggers voltage-gated $Ca^{2+}$ influx, releasing neurotransmitters into the synaptic cleft.',
        formulaOrFact: 'Transfers signal chemically across a 20 nm synaptic gap in less than 1 millisecond.'
      }
    ]
  },
  {
    id: 'rutherford_scattering',
    title: "Rutherford's Alpha Particle Scattering Experiment",
    classGrade: 9,
    subject: 'Physics',
    chapter: 'Chapter 4: Structure of the Atom',
    ncertFigure: 'Fig. 4.2 - Rutherford scattering experiment',
    subtitle: 'Gold foil bombardment demonstrating the nuclear atom and discovery of the dense nucleus',
    description: 'Ernest Rutherford, Hans Geiger, and Ernest Marsden bombarded an ultra-thin gold foil (~1000 atoms thick) with high-energy alpha particles ($He^{2+}$). Most passed straight through undeflected, but ~1 in 8000 rebounded by more than 90°, proving the atom is mostly empty space with a tiny, dense, positively charged nucleus.',
    boardImportance: 'Very High',
    keyConcepts: [
      'Most alpha particles pass undeflected: Most atomic space is empty',
      'Small fractions deflect by small angles: Positive charge occupies very small volume',
      'Rare particles (~1 in 12,000) rebound by 180°: Entire mass and positive charge is concentrated in a tiny nucleus',
      'Nuclear size ($10^{-15}\\text{ m}$) vs Atomic size ($10^{-10}\\text{ m}$)'
    ],
    examTips: [
      'Why was gold foil chosen? (Gold is the most malleable metal, yielding a foil only ~100 nm thick, ensuring single-atom collisions).',
      'Limitations of Rutherford model: Inability to explain atomic stability (accelerating electron in orbit should radiate electromagnetic energy and spiral into nucleus in $10^{-8}\\text{ s}$).'
    ],
    keyFormulasOrFacts: [
      'Scattering relation: Number of particles scattered $N(\\theta) \\propto \\frac{1}{\\sin^4(\\theta/2)}$.',
      'Distance of closest approach $r_0 = \\frac{1}{4\\pi \\varepsilon_0} \\frac{2 Z e^2}{K_\\alpha}$.'
    ],
    renderType: 'ncert_rutherford',
    pinpoints: [
      {
        id: 'gold_foil',
        name: 'Ultra-thin Gold Foil',
        position: [0, 0, 0],
        description: 'Malleable pure gold sheet beaten to approximately 1000 atoms thickness (~100 nm).',
        significance: 'Target atoms where Coulomb electrostatic repulsive scattering occurs.',
        formulaOrFact: 'Atomic number $Z = 79$ for Gold, providing high positive nuclear charge.'
      },
      {
        id: 'alpha_source',
        name: 'Alpha Particle Emitter (Bismuth/Polonium)',
        position: [-1.6, 0, 0],
        description: 'Radioactive source shielded in a lead collimator emitting collimated beams of energetic doubly ionized helium nuclei ($He^{2+}$).',
        significance: 'Projectiles with mass $4\\text{ u}$ and charge $+2e$ traveling at ~5% speed of light.',
        formulaOrFact: 'Kinetic energy typically 5.5 MeV.'
      },
      {
        id: 'zinc_screen',
        name: 'Circular Zinc Sulfide (ZnS) Detector',
        position: [0.8, 0.9, 0.4],
        description: 'Rotatable circular fluorescent screen that emits tiny scintillations of light when struck by scattered alpha particles.',
        significance: 'Enables precise quantitative measurement of scattering angle $\\theta$ distribution.',
        formulaOrFact: 'Scintillations observed through a movable traveling microscope.'
      },
      {
        id: 'rebound_track',
        name: 'Head-on Rebound Trajectory (180°)',
        position: [-0.6, 0.4, 0],
        description: 'Rare catastrophic trajectory of an alpha particle making a direct head-on collision with a gold nucleus.',
        significance: 'Direct proof that atomic mass is concentrated in a volume $10^{15}$ times smaller than the atom.',
        formulaOrFact: 'Rutherford remarked: "It was quite the most incredible event that has ever happened to me in my life."'
      }
    ]
  },

  // --- CLASS 10 ---
  {
    id: 'nephron_structure',
    title: 'Structure of a Nephron (Renal Filtration Unit)',
    classGrade: 10,
    subject: 'Biology',
    chapter: 'Chapter 6: Life Processes',
    ncertFigure: 'Fig. 6.14 - Structure of a nephron',
    subtitle: 'Bowman’s Capsule, Glomerulus, Proximal & Distal Convoluted Tubules, Loop of Henle, and Collecting Duct',
    description: 'The nephron is the microscopic structural and functional unit of the human kidney (~1 million per kidney). It filters metabolic nitrogenous waste (urea, uric acid) from systemic blood through ultrafiltration across the glomerulus, selectively reabsorbs glucose, amino acids, and water, and secretes waste into the collecting duct to produce concentrated urine.',
    boardImportance: 'Crucial',
    keyConcepts: [
      'Ultrafiltration in Bowman’s capsule under high renal hydrostatic capillary pressure',
      'Selective Reabsorption in Proximal Convoluted Tubule (PCT): 100% glucose and amino acids',
      'Countercurrent multiplier in Henle’s Loop: Descending permeable to water, ascending permeable to $NaCl$',
      'Tubular secretion in Distal Convoluted Tubule (DCT) maintaining acid-base balance'
    ],
    examTips: [
      'Top 5-mark question in Class 10 CBSE Board Exam: Draw a neat labeled diagram of a nephron and describe urine formation in three distinct stages.',
      'Remember: Initial glomerular filtrate is ~180 Liters per day, but actual urine excreted is only 1.5 to 2 Liters per day due to >99% tubular reabsorption!'
    ],
    keyFormulasOrFacts: [
      'Glomerular Filtration Rate (GFR) $\\approx 125\\text{ mL/min} = 180\\text{ Liters/day}$.',
      'Afferent arteriole lumen is wider than efferent arteriole, generating high capillary pressure (~55 mm Hg).'
    ],
    renderType: 'ncert_nephron',
    pinpoints: [
      {
        id: 'bowmans_capsule',
        name: "Bowman's Capsule & Glomerulus",
        position: [-1.2, 1.2, 0.2],
        description: 'Double-walled cup enclosing a knot of fenestrated capillaries (glomerulus) fed by afferent arteriole.',
        significance: 'High pressure forces plasma water, urea, glucose, and salts through podocyte slits into the capsular space (ultrafiltration).',
        formulaOrFact: 'Filtration slit diaphragms prevent large plasma proteins (albumin) and blood cells from filtering.'
      },
      {
        id: 'pct',
        name: 'Proximal Convoluted Tubule (PCT)',
        position: [-0.4, 0.9, 0.4],
        description: 'Tortuous tube lined with simple cuboidal brush-border epithelium densely packed with microvilli and mitochondria.',
        significance: 'Selectively reabsorbs ~70–80% of electrolytes and water, and 100% of essential glucose and amino acids.',
        formulaOrFact: 'Active sodium transport via $Na^+/K^+$ ATPase pumps in the basolateral membrane drives co-transport.'
      },
      {
        id: 'loop_henle',
        name: "Loop of Henle (Hairpin Loop)",
        position: [-0.3, -1.3, 0],
        description: 'U-shaped hairpin loop extending deep into the renal medulla, comprising thin descending and thick ascending limbs.',
        significance: 'Creates osmotic hypertonicity in the medullary interstitium, essential for concentrating mammalian urine.',
        formulaOrFact: 'Descending limb is permeable to water but impermeable to salts; ascending limb actively pumps out $NaCl$.'
      },
      {
        id: 'dct',
        name: 'Distal Convoluted Tubule (DCT)',
        position: [0.4, 1.1, -0.3],
        description: 'Coiled tubule segment where conditional reabsorption of water ($ADH$) and sodium ($Aldosterone$) occurs.',
        significance: 'Secretes excess $H^+$, $K^+$, and ammonia into the filtrate, maintaining physiological blood pH ~7.4.',
        formulaOrFact: 'Anti-Diuretic Hormone (ADH) inserts aquaporin-2 water channels during dehydration.'
      },
      {
        id: 'collecting_duct',
        name: 'Collecting Duct',
        position: [1.3, 0, 0],
        description: 'Long vertical duct receiving processed filtrate from multiple adjacent nephrons, draining into renal pelvis.',
        significance: 'Final water reabsorption under vasopressin control yields hypertonic concentrated urine.',
        formulaOrFact: 'Transports urine to the ureter for bladder storage.'
      }
    ]
  },
  {
    id: 'human_heart_circulation',
    title: 'Human Heart & Double Circulation',
    classGrade: 10,
    subject: 'Biology',
    chapter: 'Chapter 6: Life Processes',
    ncertFigure: 'Fig. 6.10 - Sectional view of the human heart',
    subtitle: '4 Chambers (Atria & Ventricles), Septum, Atrioventricular Valves, Aorta, and Vena Cava',
    description: 'The human heart is a muscular myogenic pump with four distinct chambers separated by a central septum to prevent mixing of oxygenated (left side) and deoxygenated (right side) blood. It executes double circulation: Pulmonary circulation through lungs for oxygenation and Systemic circulation delivering nutrients to the entire body.',
    boardImportance: 'Crucial',
    keyConcepts: [
      'Four Chambers: Right Atrium, Right Ventricle, Left Atrium, Left Ventricle',
      'Valves prevent backflow: Tricuspid valve (right), Bicuspid/Mitral valve (left), Semilunar valves',
      'Double Circulation: Pulmonary Loop (Heart $\\rightarrow$ Lungs $\\rightarrow$ Heart) and Systemic Loop (Heart $\\rightarrow$ Body $\\rightarrow$ Heart)',
      'Thick muscular left ventricular wall required to pump blood at high systemic arterial pressure'
    ],
    examTips: [
      'Why is double circulation necessary in mammals and birds? (To keep oxygenated and deoxygenated blood completely separate, providing highly efficient energy production for warm-blooded endothermy).',
      'Identify the blood vessels: Pulmonary artery uniquely carries deoxygenated blood; Pulmonary vein carries oxygen-rich blood.'
    ],
    keyFormulasOrFacts: [
      'Normal arterial blood pressure: 120/80 mm Hg (Systolic/Diastolic).',
      'Cardiac output = Stroke Volume (70 mL) × Heart Rate (72 bpm) ≈ 5 Liters/min.'
    ],
    renderType: 'ncert_heart',
    pinpoints: [
      {
        id: 'aorta',
        name: 'Aorta & Aortic Arch (3 Branches)',
        position: [0.12, 1.48, 0.05],
        description: 'The primary systemic elastic artery curving backward as the aortic arch. Emits three cranial branches: the Brachiocephalic trunk (right arm & head), Left Common Carotid artery (brain), and Left Subclavian artery (left arm).',
        significance: 'Distributes the entire cardiac output (~5 L/min at rest) throughout systemic circulation under high systolic pressure (~120 mmHg).',
        formulaOrFact: 'Aortic arch diameter ~25 mm; exhibits high elastic recoil (Windkessel effect) to maintain continuous forward perfusion during diastole.'
      },
      {
        id: 'superior_vena_cava',
        name: 'Superior Vena Cava (SVC)',
        position: [-0.62, 1.15, -0.05],
        description: 'Large blue venous trunk returning deoxygenated systemic blood from the head, neck, arms, and upper thorax directly into the Right Atrium.',
        significance: 'Maintains low central venous pressure (CVP ~2–8 mmHg) ensuring unobstructed venous return to the right heart.',
        formulaOrFact: 'Bifurcates superiorly into the left and right brachiocephalic veins.'
      },
      {
        id: 'pulmonary_artery',
        name: 'Pulmonary Trunk & Arteries',
        position: [0.65, 0.88, 0.08],
        description: 'Wide cyan-blue vessel emerging from the right ventricle anterior to the aorta, turning horizontally rightward into the Left Pulmonary Artery with a distinct circular lumen opening, and branching to the right lung.',
        significance: 'The only postnatal arteries in the human body carrying deoxygenated blood (O₂ saturation ~75%) to the alveolar capillaries.',
        formulaOrFact: 'Operates at low systolic pressure (15–25 mmHg) to protect the delicate alveolar-capillary respiratory membranes.'
      },
      {
        id: 'auricles',
        name: 'Right & Left Auricles (Plum Pouches)',
        position: [-0.75, 0.22, 0.25],
        description: 'Distinctive plum-purple / burgundy muscular pouches cupping both the right and left shoulders of the heart with smooth, defined outer curved rims.',
        significance: 'Serve as overflow reservoirs that expand during atrial filling, increasing atrial capacity during periods of high physiological demand.',
        formulaOrFact: 'Lined with pectinate muscular ridges and secrete Atrial Natriuretic Peptide (ANP) in response to atrial stretching.'
      },
      {
        id: 'left_ventricle',
        name: 'Left Ventricle & Apex',
        position: [-0.25, -0.75, 0.35],
        description: 'Thick muscular conical chamber forming the inferior-left pointing apex. Possesses walls 3 times thicker than the right ventricle to overcome systemic vascular resistance.',
        significance: 'Generates the high systolic driving pressure required to perfuse the brain, kidneys, and systemic extremities.',
        formulaOrFact: 'Normal ejection fraction: 55%–70%; stroke volume averages ~70 mL per beat.'
      },
      {
        id: 'right_ventricle',
        name: 'Right Ventricle',
        position: [0.35, -0.45, 0.45],
        description: 'Crescent-shaped anterior muscular chamber that wraps around the interventricular septum, receiving venous blood through the tricuspid valve.',
        significance: 'Pumps blood through the pulmonary semilunar valve into the pulmonary loop for alveolar re-oxygenation.',
        formulaOrFact: 'Generates low peak pressure (25 mmHg) matching the low resistance of the pulmonary vascular tree.'
      },
      {
        id: 'coronary_vessels',
        name: 'Branching Coronary Vessels (LAD & Vein Tree)',
        position: [0.15, -0.15, 0.72],
        description: 'Dense vascular arborization running along the anterior interventricular sulcus: the Left Anterior Descending (LAD) coronary artery (scarlet red) intertwined with the Great Cardiac Vein (cobalt blue) with branching diagonal and septal twigs.',
        significance: 'Supplies high-oxygen arterial blood directly to the contracting myocardium; blockage of the LAD is clinically known as a widowmaker infarction.',
        formulaOrFact: 'Coronary perfusion occurs primarily during cardiac diastole when myocardial muscle fibers relax.'
      },
      {
        id: 'heart_valves',
        name: 'Atrioventricular Valves & Chordae',
        position: [-0.35, 0.08, 0.15],
        description: 'Fibrous valve flaps (Tricuspid on right, Mitral/Bicuspid on left) tethered to muscular papillary pillars by chordae tendineae ("heart strings"). Visible when exploded.',
        significance: 'Prevents backflow into atria during peak ventricular systole.',
        formulaOrFact: 'Sudden closure of the AV valves creates the first heart sound ("lub" / S1).'
      }
    ]
  },
  {
    id: 'electric_motor_diagram',
    title: 'Electric Motor (Armature & Commutator)',
    classGrade: 10,
    subject: 'Physics',
    chapter: 'Chapter 13: Magnetic Effects of Electric Current',
    ncertFigure: 'Fig. 13.15 - An electric motor',
    subtitle: 'Rectangular Armature Coil ABCD, Magnetic Poles N-S, Split-ring Commutator, and Carbon Brushes',
    description: 'An electric motor converts electrical energy into mechanical rotational work. When an electric current passes through a rectangular armature coil placed in a uniform magnetic field, opposing electromagnetic Lorentz forces are exerted on its arms according to Fleming’s Left-Hand Rule, generating a couple that rotates the axle continuously with the help of a split-ring commutator.',
    boardImportance: 'Crucial',
    keyConcepts: [
      'Conversion of electrical energy into mechanical rotational kinetic energy',
      'Fleming’s Left-Hand Rule: Thumb = Force/Motion, Forefinger = Magnetic Field, Center finger = Current',
      'Split-Ring Commutator reverses the direction of current in the coil every half-rotation',
      'Continuous unidirectional torque maintains uninterrupted rotation'
    ],
    examTips: [
      'Standard 5-mark question in Class 10 Board exam: State the principle, construction, and working of an electric motor with a neat labeled diagram.',
      'Role of split-ring commutator: Acts as a mechanical inverter, reversing current direction through the armature coil every half-rotation so that rotation continues in the same sense.'
    ],
    keyFormulasOrFacts: [
      'Lorentz magnetic force on conductor arm: $F = B \\cdot I \\cdot L \\cdot \\sin\\theta$.',
      'Torque on armature coil: $\\tau = N \\cdot I \\cdot A \\cdot B \\cdot \\cos\\theta$.'
    ],
    renderType: 'ncert_motor',
    formula: 'F = B · I · L, \\tau = N · I · A · B',
    pinpoints: [
      {
        id: 'armature_coil',
        name: 'Rectangular Armature Coil (ABCD)',
        position: [0, 0.2, 0],
        description: 'Insulated copper wire wound over a soft iron core, suspended between magnetic poles.',
        significance: 'Current through arm AB runs opposite to CD; opposite Lorentz forces generate rotating couple.',
        formulaOrFact: 'Torque increases proportionally with turn count $N$ and coil cross-sectional area $A$.'
      },
      {
        id: 'magnetic_poles',
        name: 'Permanent Magnetic Poles (N & S)',
        position: [-1.4, 0.2, 0],
        description: 'Strong permanent or electromagnet poles creating a uniform horizontal magnetic field $B$ from North to South.',
        significance: 'Provides the magnetic field required for Lorentz force interaction with moving charges in the wire.',
        formulaOrFact: 'Field lines emanate horizontally from Red North pole to Blue South pole.'
      },
      {
        id: 'split_rings',
        name: 'Split-Ring Commutator (P & Q)',
        position: [0, -0.65, 0.7],
        description: 'Conducting metallic cylinder divided into two insulated half-rings rotating with the coil axle.',
        significance: 'Reverses the current direction in coil arms every 180° so the torque vector remains unidirectional.',
        formulaOrFact: 'Without commutator, the coil would merely oscillate back and forth and stall at vertical neutral plane.'
      },
      {
        id: 'carbon_brushes',
        name: 'Carbon Contact Brushes (X & Y)',
        position: [0.45, -0.65, 0.7],
        description: 'Stationary graphite/carbon blocks spring-pressed against rotating split-rings.',
        significance: 'Maintains uninterrupted electrical contact with external DC battery while minimizing friction and sparking.',
        formulaOrFact: 'Graphite provides self-lubricating electrical conductivity.'
      },
      {
        id: 'rotation_shaft',
        name: 'Axle & Rotating Shaft',
        position: [0, 0, -1.2],
        description: 'Sturdy steel central axle rigidly connected to the armature coil.',
        significance: 'Delivers mechanical shaft power to external equipment (fans, wheels, blenders).',
        formulaOrFact: 'Rotational mechanical power $P = \\tau \\cdot \\omega$.'
      }
    ]
  },
  {
    id: 'prism_dispersion_diagram',
    title: 'Refraction & Dispersion of Light in Glass Prism',
    classGrade: 10,
    subject: 'Physics',
    chapter: 'Chapter 11: The Human Eye and the Colourful World',
    ncertFigure: 'Fig. 11.5 - Dispersion of white light by the glass prism',
    subtitle: 'Triangular Glass Prism, Angle of Deviation, and Spectrum VIBGYOR',
    description: 'Sir Isaac Newton demonstrated that white sunlight is composed of seven constituent colors. When a narrow beam of white light enters a triangular glass prism, each wavelength experiences a different refractive index ($n_\\text{violet} > n_\\text{red}$), causing violet light to bend through the greatest angle of deviation and red light through the least, separating into the visible VIBGYOR spectrum.',
    boardImportance: 'Very High',
    keyConcepts: [
      'Dispersion: Splitting of white light into its constituent colors',
      'Cauchy’s dispersion relation: Refractive index $n(\\lambda) = A + B/\\lambda^2$ (Shorter wavelength $\\rightarrow$ Higher index $\\rightarrow$ More bending)',
      'Angle of Deviation ($D$): Angle between incident ray direction and emergent ray direction',
      'Recombination experiment: An inverted second identical prism recombines the spectrum back into white light'
    ],
    examTips: [
      'Why does violet light deviate the most and red the least? (Violet light has the shortest wavelength $\\sim 400\\text{ nm}$, travels slowest in glass, encounters the highest refractive index, and deviates most; Red has $\\sim 700\\text{ nm}$ and travels fastest).',
      'Rainbow formation in nature: Involves three phenomena inside raindrops: Refraction $\\rightarrow$ Dispersion $\\rightarrow$ Internal Reflection $\\rightarrow$ Refraction.'
    ],
    keyFormulasOrFacts: [
      'Angle of prism formula: $A + D = i + e$ where $A = \\text{Angle of Prism}$, $D = \\text{Deviation}$, $i = \\text{Incidence}$, $e = \\text{Emergence}$.',
      'Prism refractive index: $n = \\frac{\\sin((A + D_m)/2)}{\\sin(A/2)}$.'
    ],
    renderType: 'ncert_prism',
    formula: 'A + D = i + e, n = \\sin((A+D_m)/2) / \\sin(A/2)',
    pinpoints: [
      {
        id: 'glass_prism',
        name: 'Triangular Glass Prism (Angle A = 60°)',
        position: [0, 0, 0],
        description: 'Homogeneous transparent optical medium bounded by two inclined triangular refractive faces.',
        significance: 'Non-parallel faces cause emergent rays to bend permanently towards the thicker base rather than emerging parallel.',
        formulaOrFact: 'Crown glass refractive index $n \\approx 1.52$.'
      },
      {
        id: 'incident_beam',
        name: 'Narrow Incident White Light Beam',
        position: [-1.6, 0.4, 0],
        description: 'Polychromatic light beam containing all visible wavelengths from 400 nm to 700 nm striking the first face at angle $i$.',
        significance: 'Initial interface where first differential refraction occurs bending towards normal.',
        formulaOrFact: 'White light speed in air $c \\approx 3 \\times 10^8\\text{ m/s}$.'
      },
      {
        id: 'spectrum_red',
        name: 'Red Light Emergence (Least Deviated)',
        position: [1.6, 0.45, 0.3],
        description: 'Long wavelength visible light ($\\lambda \\approx 700\\text{ nm}$) traveling fastest through glass ($v = c/n_r$).',
        significance: 'Undergoes minimum angle of deviation ($D_r$), emerging at top of the spectral fan.',
        formulaOrFact: 'High wavelength minimizes Rayleigh scattering ($I \\propto 1/\\lambda^4$), making red ideal for hazard stop signals.'
      },
      {
        id: 'spectrum_violet',
        name: 'Violet Light Emergence (Most Deviated)',
        position: [1.6, -0.65, -0.3],
        description: 'Short wavelength visible light ($\\lambda \\approx 400\\text{ nm}$) experiencing highest refractive index in glass ($n_v > n_r$).',
        significance: 'Bends most severely through maximum deviation angle ($D_v$), emerging at bottom base of spectrum.',
        formulaOrFact: 'Violet photon energy $E = hc/\\lambda \\approx 3.1\\text{ eV}$ vs Red $\\approx 1.8\\text{ eV}$.'
      }
    ]
  },
  {
    id: 'electrolysis_water_apparatus',
    title: 'Electrolysis of Water (Hoffman Voltammeter)',
    classGrade: 10,
    subject: 'Chemistry',
    chapter: 'Chapter 1: Chemical Reactions and Equations',
    ncertFigure: 'Fig. 1.6 - Electrolysis of water',
    subtitle: 'Acidified water decomposition yielding 2:1 volume ratio of Hydrogen gas to Oxygen gas',
    description: 'Electrolytic decomposition of water: When electric current passes through acidified water using inert graphite electrodes, water molecules dissociate into Hydrogen gas ($H_2$) at the cathode (negative electrode) and Oxygen gas ($O_2$) at the anode (positive electrode) in a stoichiometric 2:1 volume ratio.',
    boardImportance: 'Very High',
    keyConcepts: [
      'Electrochemical decomposition reaction: $2H_2O(l) \\xrightarrow{\\text{Electric Current}} 2H_2(g) + O_2(g)$',
      'Stoichiometric volume ratio: Volume of $H_2$ collected is twice the volume of $O_2$',
      'Cathode (Negative terminal): $2H^+ + 2e^- \\rightarrow H_2(g)$ (Reduction)',
      'Anode (Positive terminal): $2H_2O \\rightarrow O_2 + 4H^+ + 4e^-$ (Oxidation)',
      'A few drops of dilute sulphuric acid ($H_2SO_4$) are added to make pure water electrically conducting'
    ],
    examTips: [
      'Frequent exam question: Why is the volume of gas collected over one electrode double that of the other? (Because water molecule contains 2 atoms of Hydrogen for every 1 atom of Oxygen).',
      'Gas identification test: Hydrogen gas burns with a characteristic "pop" sound; Oxygen gas rekindles a glowing splinter.'
    ],
    keyFormulasOrFacts: [
      'Decomposition equation: $2H_2O \\rightarrow 2H_2 + O_2$; $\\Delta H > 0$ (Endothermic).',
      'Pure distilled water has very few ions ($K_w = 10^{-14}$); acid electrolyte provides mobile $H^+$ and $SO_4^{2-}$ charge carriers.'
    ],
    renderType: 'ncert_electrolysis',
    pinpoints: [
      {
        id: 'cathode_h2',
        name: 'Cathode (Negative) & Hydrogen Gas (2 Vol)',
        position: [-0.65, 0.9, 0],
        description: 'Negative graphite electrode where reduction occurs, releasing effervescent bubbles of $H_2$ gas.',
        significance: 'Collects double the gas volume ($V_{H_2} : V_{O_2} = 2 : 1$) displacement in inverted test tube.',
        formulaOrFact: 'Hydrogen burns with explosive pop sound.'
      },
      {
        id: 'anode_o2',
        name: 'Anode (Positive) & Oxygen Gas (1 Vol)',
        position: [0.65, 0.9, 0],
        description: 'Positive graphite electrode where oxidation takes place, releasing bubbles of $O_2$ gas.',
        significance: 'Yields 1 volume of oxygen gas; rekindles a glowing wooden splinter.',
        formulaOrFact: 'Gas displacement level in test tube is half that of the cathode tube.'
      },
      {
        id: 'graphite_electrodes',
        name: 'Inert Graphite Rods',
        position: [0, -0.4, 0],
        description: 'Inert carbon electrodes sealed through rubber stoppers into the bottom of the plastic voltammeter.',
        significance: 'Conducts electrons into solution without chemically reacting with sulphuric acid or nascent gases.',
        formulaOrFact: 'Inert electrodes prevent sacrificial anodic dissolution.'
      },
      {
        id: 'acidified_electrolyte',
        name: 'Acidified Water Electrolyte ($H_2O + H_2SO_4$)',
        position: [0, 0.2, 0.4],
        description: 'Dilute solution of water containing drops of sulphuric acid.',
        significance: 'Supplies high concentration of hydronium ($H_3O^+$) and sulphate ($SO_4^{2-}$) ions to overcome pure water’s low conductance.',
        formulaOrFact: 'Electric conductivity increases by over 10,000 times compared to deionized water.'
      }
    ]
  },

  // --- CLASS 11 ---
  {
    id: 'mitochondria_organelle',
    title: 'Structure of a Mitochondrion (Powerhouse of Cell)',
    classGrade: 11,
    subject: 'Biology',
    chapter: 'Chapter 8: Cell - The Unit of Life',
    ncertFigure: 'Fig. 8.7 - Structure of mitochondrion (Longitudinal section)',
    subtitle: 'Outer Membrane, Folded Cristae, Intermembrane Space, Matrix, and F0-F1 Oxysomes',
    description: 'Mitochondria are semi-autonomous double-membrane bound organelles responsible for cellular aerobic respiration and ATP generation through the Krebs cycle and oxidative phosphorylation. The inner membrane is heavily infolded into cristae to maximize surface area for respiratory electron transport chain complexes and ATP synthase particles.',
    boardImportance: 'Very High',
    keyConcepts: [
      'Outer membrane with porin protein channels; inner membrane impermeable and folded into cristae',
      'Mitochondrial matrix: Houses Krebs cycle enzymes, circular 70S ribosomes, and circular dsDNA',
      'Oxysomes ($F_0-F_1$ particles / ATP Synthase): Rotary nanomotor synthesizing ATP from proton gradient',
      'Endosymbiotic origin: Retains prokaryotic characteristics (binary fission, naked circular DNA)'
    ],
    examTips: [
      'Why are cristae deeply folded? (To vastly increase surface area for electron transport chain complexes and ATP synthase complexes).',
      'Why are mitochondria termed "semi-autonomous"? (Because they possess their own circular DNA, RNA, 70S ribosomes, and can synthesize some of their own proteins).'
    ],
    keyFormulasOrFacts: [
      'Chemiosmotic ATP synthesis: Proton motive force $\\Delta p = \\Delta\\Psi - 59\\,\\Delta pH$.',
      'Net yield: ~30 to 32 ATP molecules produced per complete oxidation of one glucose molecule.'
    ],
    renderType: 'ncert_mitochondria',
    pinpoints: [
      {
        id: 'outer_membrane',
        name: 'Outer Mitochondrial Membrane',
        position: [0, 1.35, 0],
        description: 'Smooth, lipid-rich continuous outer envelope containing transmembrane aqueous porin channels.',
        significance: 'Freely permeable to ions, nutrient metabolites, and molecules up to 5000 Daltons.',
        formulaOrFact: 'Composed of 50:50 lipid-to-protein ratio.'
      },
      {
        id: 'inner_cristae',
        name: 'Inner Membrane Foldings (Cristae)',
        position: [0.6, 0.3, 0.4],
        description: 'Highly convoluted inner membrane with transverse shelf-like folds called cristae.',
        significance: 'Houses Complexes I–IV of the electron transport chain, creating proton gradient into intermembrane space.',
        formulaOrFact: 'Protein-dense membrane (80% protein), containing unique phospholipid cardiolipin.'
      },
      {
        id: 'oxysomes',
        name: 'Oxysomes (F0-F1 ATP Synthase Particles)',
        position: [0.2, -0.4, 0.5],
        description: 'Stalked knob-like enzymatic complexes projecting into the matrix from cristae inner surface.',
        significance: 'Rotary catalytic motor driven by proton influx ($\\\\text{H}^+$) converting ADP + Pi into high-energy ATP.',
        formulaOrFact: '$F_0$ is the membrane channel; $F_1$ is the catalytic headpiece.'
      },
      {
        id: 'matrix',
        name: 'Mitochondrial Matrix & DNA',
        position: [-0.3, -0.2, 0.1],
        description: 'Dense gel-like aqueous compartment containing soluble citric acid cycle enzymes, magnesium, and circular DNA.',
        significance: 'Executes pyruvate decarboxylation, Krebs cycle, and beta-oxidation of fatty acids.',
        formulaOrFact: 'Contains 70S ribosomes identical to bacterial ribosomes.'
      }
    ]
  },
  {
    id: 'bacteriophage_virus',
    title: 'Structure of Bacteriophage T4 Virus',
    classGrade: 11,
    subject: 'Biology',
    chapter: 'Chapter 2: Biological Classification',
    ncertFigure: 'Fig. 2.6(b) - A bacteriophage',
    subtitle: 'Icosahedral Capsid Head, Collar, Contractile Tail Sheath, Base Plate, and Tail Fibers',
    description: 'A bacteriophage is an obligate intracellular viral parasite that infects bacterial host cells (such as Escherichia coli). It features an icosahedral protein head enclosing double-stranded viral DNA, a cylindrical contractile tail sheath, a hexagonal base plate with tail pins, and six flexible tail fibers that anchor onto bacterial cell wall receptors.',
    boardImportance: 'High',
    keyConcepts: [
      'Non-cellular infectious entity consisting of protein coat (capsid) + nucleic acid genome',
      'Icosahedral head protects packaged double-stranded genomic DNA',
      'Tail fibers recognize specific lipopolysaccharide receptors on bacterial outer membrane',
      'Syringe mechanism: Contractile sheath contracts, driving the central core through cell wall to inject DNA'
    ],
    examTips: [
      'Standard diagram question in Class 11 and 12 Biology: Draw a labeled diagram of a Bacteriophage and label head, collar, sheath, and tail fibers.',
      'Hershey-Chase experiment connection (Class 12): Proved DNA is the genetic material using $^{32}P$ to label bacteriophage DNA and $^{35}S$ to label protein capsid.'
    ],
    keyFormulasOrFacts: [
      'Head contains ~168,903 base pairs of dsDNA.',
      'Only the viral DNA enters the bacterial cytoplasm; the empty protein capsid "ghost" remains outside.'
    ],
    renderType: 'ncert_bacteriophage',
    pinpoints: [
      {
        id: 'capsid_head',
        name: 'Icosahedral Capsid Head',
        position: [0, 1.4, 0],
        description: 'Bipyramidal hexagonal prism composed of capsomere protein subunits enclosing tightly packaged viral DNA.',
        significance: 'Protects viral genetic information against host enzymatic degradation until injection.',
        formulaOrFact: 'Symmetric icosahedron provides optimal volume for genomic DNA storage.'
      },
      {
        id: 'collar',
        name: 'Collar & Whisker Region',
        position: [0, 0.7, 0],
        description: 'Narrow disc-like connector joining the icosahedral head to the tubular contractile tail.',
        significance: 'Regulates attachment and tail fiber assembly.',
        formulaOrFact: 'Contains sensory proteins that prevent premature DNA ejection.'
      },
      {
        id: 'contractile_sheath',
        name: 'Contractile Tail Sheath',
        position: [0, 0.05, 0],
        description: 'Helical cylinder surrounding a hollow inner core tube.',
        significance: 'Contracts like a hypodermic needle syringe upon receptor binding, driving central tube into host bacterium.',
        formulaOrFact: 'Consumes ATP to compress from 24 helical rings to 12 upon infection.'
      },
      {
        id: 'base_plate',
        name: 'Hexagonal Base Plate & Spikes',
        position: [0, -0.65, 0],
        description: 'Multi-protein hexagonal platform at the tail base bearing sharp tail pins.',
        significance: 'Punctures the bacterial peptidoglycan wall with lysozyme-like tail lysozyme enzymes.',
        formulaOrFact: 'Undergoes conformational transformation from hexagon to star shape upon host binding.'
      },
      {
        id: 'tail_fibers',
        name: 'Jointed Tail Fibers (6 Fibers)',
        position: [0.85, -1.1, 0.5],
        description: 'Six long hinged kinked protein fibers radiating from the base plate.',
        significance: 'Performs primary reversible landing and receptor recognition on host outer membrane LPS.',
        formulaOrFact: 'Coordinates with base plate to orient the viral syringe perpendicular to cell surface.'
      }
    ]
  },
  {
    id: 'dna_double_helix_ncert',
    title: 'DNA Double Helix (Watson-Crick B-DNA Model)',
    classGrade: 11,
    subject: 'Biology',
    chapter: 'Chapter 9: Biomolecules & Class 12 Ch 6',
    ncertFigure: 'Fig. 9.7 - Diagram indicating secondary structure of DNA',
    subtitle: 'Antiparallel Deoxyribose Chains, Complementary Base Pairing, and Helical Grooves',
    description: 'James Watson and Francis Crick elucidated the secondary double-helical structure of B-DNA based on Rosalind Franklin’s X-ray diffraction data. Two antiparallel polynucleotide chains are held together by complementary hydrogen bonding between nitrogenous bases (Adenine pairs with Thymine via 2 H-bonds; Guanine pairs with Cytosine via 3 H-bonds) with a pitch of 3.4 nm per 10 base-pair turn.',
    boardImportance: 'Crucial',
    keyConcepts: [
      'Antiparallel Polarity: One strand runs $5\' \\rightarrow 3\'$, the complementary strand runs $3\' \\rightarrow 5\'$',
      'Chargaff’s Rule: Ratio of Adenine to Thymine and Guanine to Cytosine is constant and equals 1 ($A+G = T+C$)',
      'Dimensions: Helical diameter = 2.0 nm (20 Å); Helical pitch = 3.4 nm (34 Å); Distance between base pairs = 0.34 nm (3.4 Å)',
      'Major and Minor grooves provide sequence-specific access for transcription factor proteins'
    ],
    examTips: [
      'Essential board exam question: State the salient features of Watson and Crick’s double helix model of DNA.',
      'Explain why DNA strands are described as antiparallel (Due to opposite orientation of the phosphodiester bonds between $3\'$ and $5\'$ carbon atoms of deoxyribose sugars).'
    ],
    keyFormulasOrFacts: [
      'Adenine = Thymine (2 Hydrogen bonds); Guanine ≡ Cytosine (3 Hydrogen bonds).',
      'Stability is imparted by stacking of base pairs over each other in the double helix and hydration shell.'
    ],
    renderType: 'ncert_dna',
    pinpoints: [
      {
        id: 'backbone_5_3',
        name: 'Sugar-Phosphate Backbone (5′ to 3′)',
        position: [-0.75, 0.8, 0.4],
        description: 'Outer hydrophilic framework formed by alternating deoxyribose sugar rings and negatively charged phosphate groups.',
        significance: 'Joined by $3\'-5\'$ phosphodiester linkages; gives DNA its overall negative electrical charge.',
        formulaOrFact: 'Terminal 5′ end carries a free phosphate group; 3′ end carries a free hydroxyl (–OH) group.'
      },
      {
        id: 'backbone_3_5',
        name: 'Antiparallel Complementary Strand (3′ to 5′)',
        position: [0.75, -0.6, -0.4],
        description: 'Complementary polymer running in opposite chemical polarity, ensuring stereochemical fit of base pairs.',
        significance: 'Template for semiconservative DNA replication by DNA polymerase.',
        formulaOrFact: 'Antiparallel orientation allows stable planar hydrogen-bonded base pairs.'
      },
      {
        id: 'at_base_pair',
        name: 'Adenine–Thymine Base Pair (A = T)',
        position: [0, 0.4, 0.1],
        description: 'Purine Adenine paired with pyrimidine Thymine via two specific hydrogen bonds.',
        significance: 'Thermally less stable than G-C pairs; clusters at replication origins (TATA box) for easy unwinding.',
        formulaOrFact: 'Hydrogen bonds between N1 of A and N3 of T, and C6 amino of A and C4 oxygen of T.'
      },
      {
        id: 'gc_base_pair',
        name: 'Guanine–Cytosine Base Pair (G ≡ C)',
        position: [0, -0.2, -0.1],
        description: 'Purine Guanine paired with pyrimidine Cytosine through three strong hydrogen bonds.',
        significance: 'Higher GC content elevates the DNA melting temperature ($T_m$).',
        formulaOrFact: 'Three H-bonds provide superior thermodynamic structural stability.'
      },
      {
        id: 'major_groove',
        name: 'Major & Minor Helical Grooves',
        position: [0.8, 0.2, 0.6],
        description: 'Asymmetric winding of the two strands creates wide major grooves (~2.2 nm) and narrower minor grooves (~1.2 nm).',
        significance: 'Allows regulatory proteins (repressors, transcription factors, zinc fingers) to read base sequence without unzipping helix.',
        formulaOrFact: 'Pitch of 1 complete helical turn is 3.4 nm, encompassing 10.5 base pairs.'
      }
    ]
  },

  // --- CLASS 12 ---
  {
    id: 'antibody_molecule',
    title: 'Structure of an Antibody Molecule (H2L2)',
    classGrade: 12,
    subject: 'Biology',
    chapter: 'Chapter 8: Human Health and Disease',
    ncertFigure: 'Fig. 8.4 - Structure of an antibody molecule',
    subtitle: 'Y-shaped Immunoglobulin: 2 Heavy Chains, 2 Light Chains, Fab Variable Regions, and Fc Stem',
    description: 'An antibody (immunoglobulin, Ig) is a Y-shaped glycoprotein synthesized by plasma B cells in response to an antigen. It is represented as $H_2L_2$, comprising two identical heavy polypeptide chains (~50 kDa) and two identical light chains (~25 kDa) interconnected by covalent interchain disulfide (-S-S-) bridges. The variable tips ($V_H/V_L$) form the antigen-binding hypervariable pockets ($F_{ab}$).',
    boardImportance: 'Crucial',
    keyConcepts: [
      'Formula representation $H_2L_2$: 2 Heavy chains and 2 Light chains',
      'Antigen-Binding Site ($F_{ab}$ / Paratope): Formed by hypervariable regions of both heavy and light chains',
      'Constant region ($F_c$ stem): Determines antibody isotype (IgG, IgA, IgM, IgE, IgD) and effector functions',
      'Interchain and intrachain Disulfide (-S-S-) covalent bonds maintain structural integrity'
    ],
    examTips: [
      'High-frequency 3-mark question in Class 12 CBSE Board: Draw a neat labeled diagram of an antibody molecule and label Antigen-binding site, Heavy chain, Light chain, and Disulfide bonds.',
      'Differentiate between Paratope (on antibody) and Epitope (antigenic determinant on foreign pathogen).'
    ],
    keyFormulasOrFacts: [
      'Lock-and-key non-covalent binding: Hydrogen bonds, electrostatic ionic interactions, Van der Waals forces.',
      'IgG is the most abundant immunoglobulin in blood serum (~75%) and the only isotype that crosses the placental barrier.'
    ],
    renderType: 'ncert_antibody',
    pinpoints: [
      {
        id: 'antigen_binding_fab',
        name: 'Antigen-Binding Sites (Paratopes)',
        position: [-1.2, 1.35, 0.1],
        description: 'Bivalent hypervariable clefts located at the tips of both Y-arms, formed by $V_H$ and $V_L$ domains.',
        significance: 'Binds specifically with stereochemical precision to foreign antigenic determinants (epitopes).',
        formulaOrFact: 'Lock-and-key fit with binding affinity $K_a \\approx 10^7$ to $10^{11}\\text{ M}^{-1}$.'
      },
      {
        id: 'light_chain',
        name: 'Light Chains (L Chains, ~25 kDa)',
        position: [-0.95, 0.8, 0.2],
        description: 'Two shorter outer polypeptide chains flanking the upper arms of the Y-structure.',
        significance: 'Possesses one variable domain ($V_L$) and one constant domain ($C_L$).',
        formulaOrFact: 'Can be either kappa ($\\kappa$) or lambda ($\\lambda$) type; never both in the same molecule.'
      },
      {
        id: 'heavy_chain',
        name: 'Heavy Chains (H Chains, ~50 kDa)',
        position: [-0.25, 0.4, 0],
        description: 'Two identical longer central polypeptide chains spanning the full length from Y-arms to the base stem.',
        significance: 'Contains one variable domain ($V_H$) and three to four constant domains ($C_H1, C_H2, C_H3$).',
        formulaOrFact: 'Determines immunoglobulin class (gamma $\\gamma$ for IgG, alpha $\\alpha$ for IgA, mu $\\mu$ for IgM).'
      },
      {
        id: 'disulfide_bonds',
        name: 'Disulfide (-S-S-) Bridges & Hinge Region',
        position: [0, 0.2, 0],
        description: 'Covalent sulfur bonds cross-linking heavy-to-heavy and heavy-to-light chains at a flexible proline-rich hinge.',
        significance: 'Enables rotational flexibility of the two Fab arms to span variable distances between dual epitopes on pathogen.',
        formulaOrFact: 'Papain enzyme cleaves the hinge into two $F_{ab}$ fragments and one $F_c$ fragment.'
      },
      {
        id: 'fc_region',
        name: 'Constant Stem (Fc Fragment)',
        position: [0, -1.1, 0],
        description: 'Crystalline crystallizable tail formed by constant domains of both heavy chains.',
        significance: 'Binds to cell surface Fc receptors on macrophages for phagocytosis (opsonization) and activates complement cascade.',
        formulaOrFact: 'Governs placental transfer and allergic mast cell binding (IgE).'
      }
    ]
  },
  {
    id: 'pbr322_vector',
    title: 'E. coli Cloning Vector pBR322',
    classGrade: 12,
    subject: 'Biology',
    chapter: 'Chapter 11: Biotechnology - Principles and Processes',
    ncertFigure: 'Fig. 11.4 - E. coli cloning vector pBR322',
    subtitle: 'Origin of Replication (ori), ampR, tetR Selectable Markers, rop, and Restriction Sites',
    description: 'pBR322 was the first artificial plasmid cloning vector constructed by Bolivar and Rodriguez (1977). It possesses an Origin of Replication (ori) governing copy number, a rop gene coding for plasmid replication proteins, two selectable antibiotic resistance marker genes (ampR for ampicillin and tetR for tetracycline), and unique restriction endonuclease recognition sites (EcoRI, BamHI, SalI, PstI, HindIII) allowing insertional inactivation.',
    boardImportance: 'Crucial',
    keyConcepts: [
      'Origin of Replication (ori): Controls initiation of replication and plasmid copy number',
      'Selectable Markers: $amp^R$ and $tet^R$ differentiate transformants from non-transformants',
      'Insertional Inactivation: Ligation of foreign DNA at BamHI or SalI inactivates $tet^R$, enabling recombinant selection via replica plating',
      'Rop gene: Codes for proteins involved in the replication of the plasmid'
    ],
    examTips: [
      'Top 5-mark question in Class 12 CBSE Board: Draw the diagram of vector pBR322 and explain the significance of selectable markers and insertional inactivation.',
      'Remember restriction enzyme sites: PstI and PvuI lie within $amp^R$; BamHI and SalI lie within $tet^R$; EcoRI, ClaI, and HindIII lie outside.'
    ],
    keyFormulasOrFacts: [
      'Total size: 4,361 base pairs of double-stranded circular DNA.',
      'Nomenclature: "p" = plasmid, "BR" = Bolivar and Rodriguez, "322" = laboratory strain order number.'
    ],
    renderType: 'ncert_pbr322',
    pinpoints: [
      {
        id: 'ori_site',
        name: 'Origin of Replication (ori)',
        position: [-0.9, -0.9, 0.1],
        description: 'Specific DNA sequence where host DNA polymerase binds to initiate plasmid replication.',
        significance: 'Any piece of foreign DNA linked to this sequence is replicated inside the host cell; controls plasmid copy number.',
        formulaOrFact: 'If a vector with a high-copy ori is used, target gene yield increases dramatically.'
      },
      {
        id: 'ampr_gene',
        name: 'Ampicillin Resistance Gene (ampR) & PstI',
        position: [-1.2, 0.4, 0.1],
        description: 'Encodes beta-lactamase enzyme degrading ampicillin antibiotic; contains unique PstI and PvuI cloning sites.',
        significance: 'Selectable marker allowing transformants to grow on ampicillin-supplemented nutrient agar plates.',
        formulaOrFact: 'Insertion of gene into PstI site causes insertional inactivation of ampicillin resistance.'
      },
      {
        id: 'tetr_gene',
        name: 'Tetracycline Resistance Gene (tetR) & BamHI / SalI',
        position: [1.2, 0.4, 0.1],
        description: 'Encodes membrane efflux protein pumping out tetracycline antibiotic; contains BamHI and SalI restriction sites.',
        significance: 'Ligation of foreign gene at BamHI destroys tetracycline resistance, allowing recombinant identification.',
        formulaOrFact: 'Recombinants grow on ampicillin plates but perish when replica plated onto tetracycline medium.'
      },
      {
        id: 'ecori_hindiii',
        name: 'Restriction Sites (EcoRI, ClaI, HindIII)',
        position: [0.1, 1.35, 0.1],
        description: 'Palindromic recognition sequences for restriction endonucleases EcoRI (GAATTC) and HindIII.',
        significance: 'Enables molecular scissors to cut open the circular plasmid with sticky cohesive ends for gene insertion.',
        formulaOrFact: 'EcoRI creates 5′ overhanging sticky ends: 5\'-G^AATTC-3\'.'
      },
      {
        id: 'rop_gene',
        name: 'rop Gene & PvuII Site',
        position: [0.7, -0.9, 0.1],
        description: 'Region encoding the Rop (Repressor of Primer) protein regulating plasmid copy number.',
        significance: 'Contains unique PvuII cleavage site; mutations in rop can yield ultra-high copy number variants.',
        formulaOrFact: 'Maintains plasmid copy number at approximately 15–20 copies per E. coli bacterium.'
      }
    ]
  },
  {
    id: 'crystal_unit_cells',
    title: 'Crystal Unit Cells (SC, BCC, FCC Lattices)',
    classGrade: 12,
    subject: 'Chemistry',
    chapter: 'Chapter 1: The Solid State',
    ncertFigure: 'Figs. 1.8 to 1.11 - Unit cells of 14 Bravais lattices',
    subtitle: 'Simple Cubic (SC), Body-Centered Cubic (BCC), and Face-Centered Cubic (FCC)',
    description: 'A crystal unit cell is the smallest repeating geometric portion of a crystal lattice that, when repeated in three dimensions, generates the entire crystalline solid. In Simple Cubic (SC), constituent atoms reside exclusively at the 8 cube corners ($Z = 1$); in Body-Centered Cubic (BCC), an additional atom resides at the cube center ($Z = 2$); in Face-Centered Cubic (FCC / CCP), atoms reside at all 8 corners and centers of all 6 faces ($Z = 4$, packing efficiency 74%).',
    boardImportance: 'Crucial',
    keyConcepts: [
      'Simple Cubic (SC): $Z = 8 \\times (1/8) = 1$ atom; Coordination number = 6; Packing efficiency = 52.4%',
      'Body-Centered Cubic (BCC): $Z = 8 \\times (1/8) + 1 = 2$ atoms; $4r = \\sqrt{3}a$; Packing efficiency = 68%',
      'Face-Centered Cubic (FCC): $Z = 8 \\times (1/8) + 6 \\times (1/2) = 4$ atoms; $4r = \\sqrt{2}a$; Packing efficiency = 74%',
      'Density of crystal lattice: $d = \\frac{Z \\cdot M}{a^3 \\cdot N_A}$'
    ],
    examTips: [
      'High-probability numerical question in CBSE Class 12: Calculate edge length $a$, atomic radius $r$, or density $d = \\frac{Z M}{a^3 N_A}$.',
      'Remember edge-radius relationships: SC: $a = 2r$; BCC: $a = \\frac{4r}{\\sqrt{3}}$; FCC: $a = 2\\sqrt{2}r$.'
    ],
    keyFormulasOrFacts: [
      'Coordination numbers: SC = 6; BCC = 8; FCC/HCP = 12 (highest packing density).',
      'FCC packing efficiency 74% leaves only 26% interstitial void volume (tetrahedral and octahedral voids).'
    ],
    renderType: 'ncert_unit_cell',
    formula: 'd = (Z · M) / (a^3 · N_A), FCC: 4r = \\sqrt{2}a',
    pinpoints: [
      {
        id: 'corner_atoms',
        name: 'Corner Lattice Positions (8 Corners)',
        position: [-1, 1, 1],
        description: 'Spheres located at each of the 8 cube vertices, each shared equally among 8 adjacent unit cells.',
        significance: 'Each corner atom contributes exactly $1/8$th of its volume to the single unit cell ($8 \\times 1/8 = 1$).',
        formulaOrFact: 'Corner contribution = $1/8$; present in all cubic unit cell variants.'
      },
      {
        id: 'body_center_atom',
        name: 'Body-Center Position (BCC)',
        position: [0, 0, 0],
        description: 'Single full atom located at the exact geometric center of the body diagonal of the cube.',
        significance: 'Belongs 100% to this unit cell ($1 \\times 1 = 1$), bringing total BCC atom count to $Z = 2$.',
        formulaOrFact: 'Body diagonal touches three spheres: $4r = \\sqrt{3}a$; Coordination number = 8 (e.g. Iron, Chromium, Sodium).'
      },
      {
        id: 'face_center_atoms',
        name: 'Face-Center Positions (FCC / CCP)',
        position: [0, 1, 0],
        description: 'Spheres positioned at the geometric centers of all 6 faces of the cube, shared between 2 adjacent cells.',
        significance: 'Each face atom contributes $1/2$ to the cell ($6 \\times 1/2 = 3$); total $Z = 1 + 3 = 4$.',
        formulaOrFact: 'Face diagonal touches: $4r = \\sqrt{2}a$; Coordination number = 12 (e.g. Copper, Silver, Gold, Aluminum).'
      },
      {
        id: 'lattice_edges',
        name: 'Cubic Edge Vectors ($a = b = c, \\alpha = \\beta = \\gamma = 90^\\circ$)',
        position: [1, 0, 1],
        description: 'Unit cell edge lengths and interaxial angles defining the most symmetric of the 7 crystal systems.',
        significance: 'Determines unit cell volume $V = a^3$ used in calculating solid state density.',
        formulaOrFact: 'Cubic crystal system exhibits the highest symmetry: 3 four-fold, 4 three-fold, and 6 two-fold axes.'
      }
    ]
  },
  {
    id: 'transformer_ac',
    title: 'Electric Transformer (Laminated Core & Mutual Induction)',
    classGrade: 12,
    subject: 'Physics',
    chapter: 'Chapter 7: Alternating Current',
    ncertFigure: 'Fig. 7.20 - Step-up and Step-down Transformer',
    subtitle: 'Primary Coil ($N_p$), Secondary Coil ($N_s$), Laminated Soft-Iron Core, and Mutual Flux Linkage',
    description: 'A transformer is a static electromagnetic device that transfers electrical energy between two alternating current (AC) circuits through mutual electromagnetic induction, stepping voltage up ($N_s > N_p$) or down ($N_s < N_p$) with minimal power loss. Thin laminated soft-iron sheets varnished with insulation are stacked to form the closed magnetic core to suppress wasteful circulating eddy current heating.',
    boardImportance: 'Crucial',
    keyConcepts: [
      'Principle: Mutual Induction (Faraday’s law of induction)',
      'Transformer Equation: $\\frac{V_s}{V_p} = \\frac{N_s}{N_p} = \\frac{I_p}{I_s} = k$ (Transformation ratio)',
      'Energy Losses: Flux leakage, Copper $I^2R$ resistance, Iron Eddy currents ($I^2R$), and Hysteresis loop losses',
      'High-voltage electric grid transmission minimizes $I^2R$ Joulean transmission line heating'
    ],
    examTips: [
      'Top 5-mark question in Class 12 Physics: Explain the principle, construction, and working of a transformer. Why is the core laminated?',
      'Why is soft iron chosen for the core? (High magnetic permeability $\\mu_r$ and narrow hysteresis loop, minimizing magnetic energy dissipation during 50 Hz cyclic reversal).'
    ],
    keyFormulasOrFacts: [
      'Transformer equation: $\\frac{V_s}{V_p} = \\frac{N_s}{N_p}$; for ideal 100% efficient transformer $P_p = P_s \\implies V_p I_p = V_s I_s$.',
      'Step-Up: $N_s > N_p \\implies V_s > V_p$ and $I_s < I_p$; Step-Down: $N_s < N_p \\implies V_s < V_p$ and $I_s > I_p$.'
    ],
    renderType: 'ncert_transformer',
    formula: 'V_s / V_p = N_s / N_p = I_p / I_s',
    pinpoints: [
      {
        id: 'primary_coil',
        name: 'Primary Coil (Np Turns)',
        position: [-1.2, 0, 0.4],
        description: 'Insulated copper wire winding connected to the alternating input voltage source $V_p$.',
        significance: 'Alternating input current generates a continuously varying magnetic flux $\\Phi_B$ through the core.',
        formulaOrFact: 'Induced back EMF $e_p = -N_p \\frac{d\\Phi}{dt}$.'
      },
      {
        id: 'secondary_coil',
        name: 'Secondary Coil (Ns Turns)',
        position: [1.2, 0, 0.4],
        description: 'Insulated copper coil connected to the external output electrical load impedance.',
        significance: 'Mutual magnetic flux induces an alternating electromotive force $V_s$ proportional to turns ratio.',
        formulaOrFact: 'Induced secondary voltage $e_s = -N_s \\frac{d\\Phi}{dt}$.'
      },
      {
        id: 'laminated_core',
        name: 'Laminated Soft-Iron Core',
        position: [0, 0, 0],
        description: 'Rectangular closed magnetic core made of thin insulated soft-iron sheets (laminae) pressed together.',
        significance: 'High magnetic permeability guides flux with negligible leakage; electrical insulation between sheets breaks eddy current loops.',
        formulaOrFact: 'Eddy current power loss is proportional to the square of sheet thickness: $P_e \\propto t^2 f^2 B^2$.'
      },
      {
        id: 'magnetic_flux',
        name: 'Mutual Magnetic Flux Lines',
        position: [0, 1.1, 0],
        description: 'Concentrated alternating magnetic lines of force circulating continuously through the closed core loop.',
        significance: 'Provides nearly 100% mutual flux linkage coupling the primary and secondary windings.',
        formulaOrFact: 'Flux $\\Phi = B \\cdot A$; leakage flux is minimized by shell-type winding configuration.'
      }
    ]
  }
];
