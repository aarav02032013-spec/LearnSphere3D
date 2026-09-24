import { Model3DItem } from '../types';

export const BIOLOGY_MATH_MODELS: Model3DItem[] = [
  // Class 6-8 (Middle School)
  {
    id: 'plant_cell',
    title: 'Eukaryotic Plant Cell',
    category: 'Biology',
    grade: 'middle',
    gradeLabel: 'Class 6–8',
    subtitle: 'Cellular anatomy, plastids, and osmotic vacuolar structure',
    description: 'Plant cells are eukaryotic cells with a rigid cellulose cell wall, large central vacuole, and photosynthetic chloroplasts that synthesize glucose from sunlight and carbon dioxide.',
    keyConcepts: ['Cell Wall & Membrane', 'Chloroplast Photosynthesis', 'Central Turgor Vacuole', 'Nuclear DNA Storage'],
    renderType: 'cell',
    pinpoints: [
      {
        id: 'cell_wall',
        name: 'Cell Wall & Membrane',
        position: [0, 1.35, 0],
        description: 'Rigid outer layer composed primarily of cellulose fibers, providing mechanical structural support and protection against osmotic lysis.',
        significance: 'Maintains turgor pressure allowing herbaceous plants to stand upright without skeletal bones.',
        formulaOrFact: 'Composed of microfibrils of β-D-glucose polymer chains.'
      },
      {
        id: 'chloroplast',
        name: 'Chloroplasts (Thylakoids)',
        position: [0.9, 0.4, 0.6],
        description: 'Double-membrane organelles containing chlorophyll pigments where the light and dark reactions of photosynthesis take place.',
        significance: 'Converts electromagnetic photon energy into chemical potential energy (glucose ATP).',
        formulaOrFact: '6CO₂ + 6H₂O + photons → C₆H₁₂O₆ + 6O₂'
      },
      {
        id: 'vacuole',
        name: 'Central Vacuole',
        position: [-0.4, -0.2, 0.4],
        description: 'Large fluid-filled central organelle bounded by the tonoplast membrane storing water, ions, enzymes, and nutrient pigments.',
        significance: 'Occupies up to 80-90% of mature plant cell volume and drives cytoplasmic turgidity.',
        formulaOrFact: 'Generates hydrostatic pressure of 0.1 to 1.0 MPa against the cell wall.'
      },
      {
        id: 'nucleus',
        name: 'Nucleus & Nucleolus',
        position: [0.2, -0.3, -0.6],
        description: 'Double-membrane enclosed compartment protecting genomic DNA and orchestrating transcription and ribosomal synthesis.',
        significance: 'Controls gene expression, cell division, and enzyme metabolic pathways.',
        formulaOrFact: 'Enclosed by nuclear pores ~100 nm in diameter regulating RNA trafficking.'
      },
      {
        id: 'mitochondria',
        name: 'Mitochondrion',
        position: [-0.8, 0.5, -0.4],
        description: 'Folded inner membrane (cristae) generating ATP via oxidative phosphorylation and the Krebs cycle.',
        significance: 'Supplies high-energy adenosine triphosphate for cellular active transport and synthesis.',
        formulaOrFact: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ~32 ATP'
      }
    ]
  },
  {
    id: 'human_eye',
    title: 'Human Eye & Optical Refraction',
    category: 'Biology',
    grade: 'middle',
    gradeLabel: 'Class 6–8',
    subtitle: 'Corneal convergence, crystalline lens, and photoreceptor retina',
    description: 'The human eye acts as an adaptive optical camera: light rays are refracted by the cornea and crystalline lens to form an inverted real image on the photosensitive retina.',
    keyConcepts: ['Corneal Refraction', 'Crystalline Lens Accommodation', 'Pupil Aperture Control', 'Photoreceptor Signal Transduction'],
    renderType: 'eye',
    formula: 'Lens Formula: 1/f = 1/v - 1/u',
    pinpoints: [
      {
        id: 'cornea',
        name: 'Cornea',
        position: [0, 0, 1.25],
        description: 'Transparent anterior dome of the eye providing roughly two-thirds (40-44 diopters) of the total refractive power.',
        significance: 'Fixed refractive element focusing incoming parallel light rays into the anterior chamber.',
        formulaOrFact: 'Refractive index n ≈ 1.376; contains no blood vessels to remain completely clear.'
      },
      {
        id: 'iris_pupil',
        name: 'Iris & Pupil',
        position: [0, 0, 1.02],
        description: 'Colored muscular diaphragm with two muscle sets: the circular sphincter pupillae (constricts pupil in bright light) and radial dilator pupillae (widens pupil in dim light).',
        significance: 'Regulates incoming photon intensity and increases depth of field like an adjustable camera aperture.',
        formulaOrFact: 'Pupil diameter dynamically adjusts between 2 mm (bright sunlight) and 8 mm (night vision).'
      },
      {
        id: 'lens',
        name: 'Crystalline Lens & Zonules',
        position: [0, 0, 0.75],
        description: 'Biconvex, flexible proteinaceous lens suspended by fine ciliary zonule threads (Zonules of Zinn) that alters curvature for near vs far vision (accommodation).',
        significance: 'Accommodates dynamic focal adjustment (ciliary muscles contract to round the lens for close reading).',
        formulaOrFact: 'Optical power varies dynamically from +15D (relaxed far vision) to +30D (close reading).'
      },
      {
        id: 'retina',
        name: 'Retina & Fovea Centralis',
        position: [0, 0, -1.18],
        description: 'Multilayered sensory tissue lining the posterior eye, containing ~120 million rod cells (scotopic night vision) and ~6 million cone cells (color photopic vision).',
        significance: 'Transduces light photons into electrochemical nerve impulses; the fovea centralis provides pinpoint 20/20 central resolution.',
        formulaOrFact: 'The fovea has the highest packing density of cones: ~150,000 cones/mm².'
      },
      {
        id: 'optic_nerve',
        name: 'Optic Nerve (CN II) & Blind Spot',
        position: [0.32, -0.15, -1.6],
        description: 'Thick cable of over 1.2 million myelinated retinal ganglion cell axons traversing the sclera toward the visual cortex, carrying the central retinal artery and vein.',
        significance: 'Transmits visual neural action potentials to the thalamus and occipital visual cortex V1.',
        formulaOrFact: 'The optic disc lacks photoreceptors, producing the natural physiological blind spot.'
      }
    ]
  },
  {
    id: 'platonic_solids',
    title: 'Platonic Solids & Geometric Symmetry',
    category: 'Mathematics',
    grade: 'middle',
    gradeLabel: 'Class 6–8',
    subtitle: 'Regular convex polyhedra, Euler characteristic, and dual shapes',
    description: 'In 3D Euclidean geometry, a Platonic solid is a convex regular polyhedron whose faces are congruent regular polygons with the same number of faces meeting at each vertex.',
    keyConcepts: ['Euler Formula: V - E + F = 2', 'Congruent Faces', 'Dihedral Angles', 'Polyhedral Duality'],
    renderType: 'platonic',
    formula: 'V - E + F = 2 (Euler Characteristic χ = 2)',
    pinpoints: [
      {
        id: 'tetrahedron',
        name: 'Regular Tetrahedron (4 Faces)',
        position: [-1.2, 0.6, 0],
        description: '4 equilateral triangular faces, 4 vertices, 6 edges. Self-dual polyhedron with tetrahedral symmetry group T_d.',
        significance: 'The simplest 3D polyhedron; building block of crystalline molecular lattices like diamond.',
        formulaOrFact: 'V = 4, E = 6, F = 4 → 4 - 6 + 4 = 2.'
      },
      {
        id: 'octahedron',
        name: 'Regular Octahedron (8 Faces)',
        position: [0, 0, 0],
        description: '8 equilateral triangular faces, 6 vertices, 12 edges. Dual to the cube; contains 3 perpendicular equatorial square planes.',
        significance: 'Fundamental coordination geometry in inorganic chemistry (e.g. sulfur hexafluoride SF₆).',
        formulaOrFact: 'V = 6, E = 12, F = 8 → 6 - 12 + 8 = 2.'
      },
      {
        id: 'icosahedron',
        name: 'Regular Icosahedron (20 Faces)',
        position: [1.2, -0.4, 0],
        description: '20 equilateral triangular faces, 12 vertices, 30 edges. Exhibits golden ratio proportions across Cartesian coordinates (0, ±1, ±ϕ).',
        significance: 'Underlies the viral capsid geometry of adenoviruses and spherical bacteriophages for optimal volume.',
        formulaOrFact: 'Coordinates: (0, ±1, ±ϕ) where ϕ = (1 + √5)/2 ≈ 1.618.'
      }
    ]
  },

  // Class 9-10 (High School)
  {
    id: 'human_heart',
    title: 'Human Heart & Hemodynamics',
    category: 'Biology',
    grade: 'high',
    gradeLabel: 'Class 9–10',
    subtitle: '4-chamber cardiac pump, coronary vascular arborization, and great vessels',
    description: 'The human heart is an intricate muscular pump driving systemic and pulmonary circulation. Oxygenated blood (red) is propelled into the high-pressure aortic arch with its 3 cranial branches, while deoxygenated blood (blue) returns via the vena cava and enters the pulmonary loop.',
    keyConcepts: ['Aortic Arch & 3 Cranial Branches', 'Pulmonary Trunk & Lumen', 'Right & Left Auricles', 'Branching Coronary Arteries & Veins', 'Left & Right Ventricles'],
    renderType: 'heart',
    formula: 'Cardiac Output = Stroke Volume × Heart Rate (CO = SV × HR)',
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
        id: 'valves_internal',
        name: 'Atrioventricular Valves & Chordae',
        position: [-0.35, 0.08, 0.15],
        description: 'Fibrous valve flaps (Tricuspid on right, Mitral/Bicuspid on left) tethered to muscular papillary pillars by chordae tendineae ("heart strings"). Visible when exploded.',
        significance: 'Prevents backflow into atria during peak ventricular systole.',
        formulaOrFact: 'Sudden closure of the AV valves creates the first heart sound ("lub" / S1).'
      }
    ]
  },
  {
    id: 'dna_helix',
    title: 'DNA Double Helix & Molecular Pairing',
    category: 'Biology',
    grade: 'high',
    gradeLabel: 'Class 9–10',
    subtitle: 'Antiparallel strands, nitrogenous base pairs, and major/minor grooves',
    description: 'Deoxyribonucleic acid is a double-stranded helical polymer carrying genetic instructions. Adenine pairs with Thymine via 2 hydrogen bonds; Guanine pairs with Cytosine via 3 hydrogen bonds.',
    keyConcepts: ['Antiparallel 5′ to 3′ Strands', 'Watson-Crick Base Pairing (A-T, G-C)', 'Deoxyribose-Phosphate Backbone', 'Major & Minor Grooves'],
    renderType: 'dna',
    formula: 'Chargaff Rule: [A] = [T] and [G] = [C]',
    pinpoints: [
      {
        id: 'base_pair_at',
        name: 'Adenine = Thymine (A-T)',
        position: [0, 0.6, 0],
        description: 'Purine adenine bound to pyrimidine thymine through 2 specific hydrogen bonds (N-H...O and N-H...N).',
        significance: 'Easier to denature/melt during replication and transcription due to having only 2 hydrogen bonds (lower Tm).',
        formulaOrFact: 'Distance between C1′ glycosidic carbons is 1.08 nm.'
      },
      {
        id: 'base_pair_gc',
        name: 'Guanine ≡ Cytosine (G-C)',
        position: [0, -0.6, 0],
        description: 'Purine guanine bound to pyrimidine cytosine via 3 strong hydrogen bonds (O-H...N, N-H...O, N-H...N).',
        significance: 'DNA regions with high GC content exhibit higher thermal denaturation stability (higher melting temperature Tm).',
        formulaOrFact: 'Contributes higher base-stacking interaction energy (-14.6 kJ/mol).'
      },
      {
        id: 'sugar_phosphate',
        name: 'Phosphodiester Backbone',
        position: [0.8, 0, 0.4],
        description: 'Alternating deoxyribose sugar rings and negatively charged phosphate groups forming the hydrophilic exterior spiral.',
        significance: 'Provides electrostatic stability and binds magnesium ions (Mg²⁺) to neutralize negative phosphate repulsion.',
        formulaOrFact: 'Each full helical turn repeats every 10.5 base pairs (3.4 nm pitch).'
      },
      {
        id: 'major_groove',
        name: 'Major Groove Binding Site',
        position: [-0.6, 0.8, -0.5],
        description: 'Wider spiral indentation (2.2 nm wide) exposing distinct chemical signatures (hydrogen bond donors and acceptors).',
        significance: 'Primary docking site for sequence-specific transcription factors and CRISPR Cas9 recognition complexes.',
        formulaOrFact: 'Depth: 0.85 nm; permits direct nucleotide recognition without unzipping.'
      }
    ]
  },
  {
    id: 'torus_topology',
    title: 'Torus & Non-Euclidean Geometry',
    category: 'Mathematics',
    grade: 'high',
    gradeLabel: 'Class 9–10',
    subtitle: 'Surface of revolution, toroidal coordinates, and genus-1 topology',
    description: 'A torus is a surface of revolution generated by revolving a circle of radius r in 3-dimensional space about an axis coplanar with the circle at distance R.',
    keyConcepts: ['Major Radius R & Minor Radius r', 'Euler Characteristic χ = 0', 'Genus g = 1', 'Villarceau Circles'],
    renderType: 'torus',
    formula: '(R - √(x² + y²))² + z² = r²',
    pinpoints: [
      {
        id: 'major_radius',
        name: 'Major Radius (R)',
        position: [1.2, 0, 0],
        description: 'The distance from the center of the hole (origin axis) to the center of the tube cylinder.',
        significance: 'Governs overall toroidal span; when R > r, a standard ring torus is formed.',
        formulaOrFact: 'Surface Area A = 4π²Rr, Volume V = 2π²Rr².'
      },
      {
        id: 'minor_radius',
        name: 'Minor Radius (r)',
        position: [1.2, 0.4, 0],
        description: 'The cross-sectional radius of the revolving circle tube itself.',
        significance: 'Ratio R/r determines aspect ratio. When R = r, the inner hole closes to a horn torus.',
        formulaOrFact: 'Cross-sectional area is πr².'
      },
      {
        id: 'villarceau',
        name: 'Villarceau Circles',
        position: [0.7, 0.7, 0.2],
        description: 'A pair of circles produced by cutting the torus with a bitangent plane tilted at angle arcsin(r/R).',
        significance: 'Proves the torus is a doubly ruled surface in complex projective space, despite non-zero curvature.',
        formulaOrFact: 'Discovered in 1848 by French astronomer Yvon Villarceau.'
      }
    ]
  },

  // Class 11-12 (Senior / College Prep)
  {
    id: 'human_brain',
    title: 'Human Brain & Functional Neuroanatomy',
    category: 'Biology',
    grade: 'senior',
    gradeLabel: 'Class 11–12',
    subtitle: 'Cortical gyri & sulci, motor/sensory strips, cerebellum, and brainstem',
    description: 'The human brain is depicted with its lifelike rosy-pink cerebral cortex, convoluted gyri and sulci grooves, cerebellar horizontal folia, and ivory brainstem, illustrating the functional localization of speech, movement, sensation, intellect, and involuntary vitals.',
    keyConcepts: ['Motor & Sensory Strips', 'Central & Lateral Sulci', 'Broca & Wernicke Speech Areas', 'Cerebellar Coordination', 'Brainstem Autonomics'],
    renderType: 'brain',
    pinpoints: [
      {
        id: 'motor_cortex',
        name: 'Motor Cortex (Movement)',
        position: [0.65, 0.55, 0.1],
        description: 'The Precentral Gyrus running vertically immediately anterior to the Central Sulcus. Topographically mapped (Motor Homunculus) to initiate conscious voluntary skeletal muscle contractions.',
        significance: 'Pyramidal neurons (Betz cells) transmit electrical action potentials down the corticospinal tract to control fine voluntary motor skills.',
        formulaOrFact: 'Over 30% of the motor cortex area is dedicated to fine control of the hands, fingers, and facial speech muscles.'
      },
      {
        id: 'central_sulcus',
        name: 'Central Sulcus (Rolandic Fissure)',
        position: [0.55, 0.65, 0.02],
        description: 'Prominent anatomical dividing canyon fissure descending obliquely from the cerebral vertex down to the lateral sulcus, separating the frontal motor cortex from the parietal sensory cortex.',
        significance: 'The primary anatomical boundary demarcating motor intention from somatosensory perception.',
        formulaOrFact: 'One of the first cortical sulci to develop during human embryonic neurogenesis (~20 weeks gestation).'
      },
      {
        id: 'sensory_cortex',
        name: 'Sensory Cortex (Pain, Heat, Sensations)',
        position: [0.65, 0.52, -0.05],
        description: 'The Postcentral Gyrus running vertically immediately posterior to the Central Sulcus. Decodes somatic sensations including tactile touch, ambient thermal changes, proprioception, and nociceptive pain.',
        significance: 'Houses the Sensory Homunculus, providing conscious bodily awareness and environmental interaction.',
        formulaOrFact: 'Receives third-order sensory neurons relaying from the ventral posterolateral (VPL) nucleus of the thalamus.'
      },
      {
        id: 'frontal_lobe',
        name: 'Frontal Lobe (Judgment & Foresight)',
        position: [0.42, 0.42, 0.52],
        description: 'The anterior cerebral dome orchestrating executive intelligence: long-term foresight, deductive logic, goal planning, emotional regulation, and working memory.',
        significance: 'Distinguishes human cognition; undergoes active synaptic pruning and myelination through young adulthood (~age 25).',
        formulaOrFact: 'Comprises approximately 35% of the total cerebral cortex volume.'
      },
      {
        id: 'broca_area',
        name: "Broca's Area (Motor Speech)",
        position: [0.68, 0.15, 0.52],
        description: 'Located at the inferior frontal gyrus (pars triangularis & opercularis, typically in the left hemisphere). Coordinates the kinetic motor movements of the tongue, lips, and larynx required for articulate speech.',
        significance: 'Lesions cause expressive aphasia: patients comprehend language fully but struggle to speak fluent words.',
        formulaOrFact: 'Connected to Wernicke’s area via the arcuate fasciculus white matter tract.'
      },
      {
        id: 'parietal_lobe',
        name: 'Parietal Lobe (Language & Spatial Integration)',
        position: [0.42, 0.55, -0.25],
        description: 'Superior-posterior crown of the brain integrating multimodal sensory streams, mathematical computation, and spatial coordinates.',
        significance: 'Translates visual and tactile information into an integrated internal representation of the 3D world.',
        formulaOrFact: 'Damage to the right parietal lobe can cause hemispatial neglect, where patients ignore the entire left visual field.'
      },
      {
        id: 'temporal_lobe',
        name: 'Temporal Lobe (Hearing, Emotion & Intellect)',
        position: [0.75, -0.15, 0.15],
        description: 'Elongated lateral thumb-shaped lobe containing the Primary Auditory Cortex (Heschl’s gyrus), amygdala for emotional valence, and hippocampus for memory encoding.',
        significance: 'Processes auditory frequency spectrums and converts short-term experiences into permanent synaptic memories.',
        formulaOrFact: 'Tonotopically mapped: high audio frequencies are decoded at the base, low frequencies at the apex.'
      },
      {
        id: 'wernicke_area',
        name: "Wernicke's Area (Speech Comprehension)",
        position: [0.75, 0.12, -0.22],
        description: 'Located at the posterior junction of the superior temporal and parietal lobes. Decodes semantic meaning and linguistic comprehension of spoken and written words.',
        significance: 'Crucial for understanding language; lesions cause receptive aphasia where speech is fluent but devoid of coherent meaning.',
        formulaOrFact: 'Brodmann Area 22; processes syntactic rules and phonetic sequences.'
      },
      {
        id: 'occipital_lobe',
        name: 'Occipital Lobe (Primary Visual Area)',
        position: [0.35, 0.16, -0.88],
        description: 'Situated at the posterior pole of the cerebrum; processes raw photonic signals relayed from the retinas via the optic radiations (Brodmann area 17 / V1).',
        significance: 'Perceives edges, motion vectors, spatial frequencies, and color gradients.',
        formulaOrFact: 'Features retinotopic mapping where central foveal vision occupies a disproportionately large cortical area.'
      },
      {
        id: 'cerebellum',
        name: 'Cerebellum (Coordination & Balance)',
        position: [0, -0.62, -0.7],
        description: 'Subcortical peach-toned structure with fine, parallel horizontal folia striations. Contains over 50% of the entire brain’s neurons tightly packed into 10% of total brain volume.',
        significance: 'Calculates forward sensory error predictions to automate smooth motor coordination, posture, balance, and procedural memory (e.g. riding a bicycle).',
        formulaOrFact: 'Purkinje cells within the cerebellar cortex each receive up to 200,000 synaptic inputs from parallel fibers.'
      },
      {
        id: 'brainstem',
        name: 'Brainstem (Involuntary Vitals & Wakefulness)',
        position: [0, -0.62, 0.05],
        description: 'Ivory stalk comprising the Midbrain, bulbous Pons (respiratory rhythm generator), and Medulla Oblongata continuing downward into the spinal cord.',
        significance: 'Controls non-conscious vital reflexes: breathing rhythm, cardiovascular blood pressure, swallowing, and the reticular activating system for wakefulness.',
        formulaOrFact: '10 of the 12 cranial nerves originate directly from the brainstem.'
      }
    ]
  },
  {
    id: 'calculus_surface',
    title: 'Multivariable Calculus: 3D Surface & Gradients',
    category: 'Mathematics',
    grade: 'senior',
    gradeLabel: 'Class 11–12',
    subtitle: 'z = sin(x)·cos(y), gradient vector field, tangent planes & saddle points',
    description: 'Visualizes 3D scalar fields f(x, y), partial derivatives ∂f/∂x and ∂f/∂y, the gradient vector ∇f pointing in the direction of steepest ascent, and the Hessian matrix for critical point classification.',
    keyConcepts: ['Partial Derivatives (∂f/∂x, ∂f/∂y)', 'Gradient Vector ∇f', 'Tangent Plane Equation', 'Saddle Point & Hessian Matrix'],
    renderType: 'calculus_surface',
    formula: '∇f = (∂f/∂x) î + (∂f/∂y) ĵ',
    pinpoints: [
      {
        id: 'peak_max',
        name: 'Local Maximum Peak',
        position: [0.8, 1.0, 0],
        description: 'Point where both partial derivatives vanish (∂f/∂x = 0, ∂f/∂y = 0) and the second derivative test discriminant D > 0 with f_xx < 0.',
        significance: 'Represents an equilibrium point with negative eigenvalues in the Hessian matrix.',
        formulaOrFact: 'Hessian H = [[f_xx, f_xy], [f_yx, f_yy]]; det(H) > 0 and f_xx < 0.'
      },
      {
        id: 'saddle_point',
        name: 'Hyperbolic Saddle Point',
        position: [0, 0, 0],
        description: 'A critical point where the surface curves upward in one orthogonal direction and downward in another.',
        significance: 'Demonstrates why vanishing gradients do not guarantee local extrema; common in neural network loss landscapes.',
        formulaOrFact: 'Hessian discriminant D = f_xx f_yy - (f_xy)² < 0.'
      },
      {
        id: 'gradient_vector',
        name: 'Gradient Vector (Steepest Ascent)',
        position: [-0.6, 0.4, 0.7],
        description: 'Vector ∇f perpendicular to the level curves (contour lines), pointing in the direction of maximum directional derivative.',
        significance: 'Forms the foundational mathematics behind modern AI machine learning gradient descent optimization algorithms.',
        formulaOrFact: 'D_u f = ∇f · û = ||∇f|| cos(θ), maximized when û is parallel to ∇f.'
      }
    ]
  },
  {
    id: 'tesseract_4d',
    title: '4D Tesseract (Hypercube Projection)',
    category: 'Mathematics',
    grade: 'senior',
    gradeLabel: 'Class 11–12',
    subtitle: '8 cubical cells, 24 faces, 32 edges, 16 vertices & 4D rotation',
    description: 'The tesseract is the four-dimensional analogue of the 3D cube. As a cube unfolds into 6 square faces, a tesseract unfolds into 8 cubical cells (the Dalí Cross). Here, it is projected stereographically and rotated in xw and yw planes.',
    keyConcepts: ['4D Euclidean Coordinates (x, y, z, w)', '16 Vertices (±1, ±1, ±1, ±1)', '8 Bounding 3D Cube Cells', 'Dual: 16-Cell (Hexadecachoron)'],
    renderType: 'tesseract',
    formula: 'Betti numbers: b₀=1, b₁=0, b₂=0, b₃=0, b₄=1',
    pinpoints: [
      {
        id: 'inner_cube',
        name: 'Projected Inner Cube Cell',
        position: [0, 0, 0],
        description: 'In 3D perspective projection, the face furthest along the 4th spatial dimension (w = -1) appears smaller and nestled inside the outer cube.',
        significance: 'As the 4D rotation executes, the inner cube continuously turns inside out into the outer cube.',
        formulaOrFact: 'Rotation in 4D occurs around planes rather than 1D axes.'
      },
      {
        id: 'connecting_struts',
        name: '4D Dimensional Edge Struts',
        position: [0.7, 0.7, 0.7],
        description: 'Edges parallel to the 4th spatial basis vector ŵ connecting corresponding vertices of the inner and outer cubic projections.',
        significance: 'Total edges = 2 × 12 + 8 = 32 edges, each of equal length in 4D space.',
        formulaOrFact: 'Euler-Poincaré Formula: V - E + F - C = 16 - 32 + 24 - 8 = 0.'
      },
      {
        id: 'outer_cell',
        name: 'Outer Bounding Cube Cell',
        position: [1.2, 0, 0],
        description: 'The closest 3D cell along the 4th dimension (w = +1), bounding the outer envelope of the perspective projection.',
        significance: 'All 8 cubic cells are congruent and identical in 4-space; disparity in size is purely an artifact of 3D projection.',
        formulaOrFact: 'Hypervolume V₄ = s⁴; 3D Surface Area S₃ = 8s³.'
      }
    ]
  },
  {
    id: 'klein_bottle',
    title: 'Klein Bottle & Topological Manifolds',
    category: 'Mathematics',
    grade: 'senior',
    gradeLabel: 'Class 11–12',
    subtitle: 'One-sided non-orientable surface with zero boundary & Euler characteristic 0',
    description: 'A Klein bottle is a two-dimensional manifold that has no boundary and is non-orientable. It has only one side: a continuous path can travel from the "inside" to the "outside" without crossing an edge or piercing the surface.',
    keyConcepts: ['Non-Orientable Manifold', 'Euler Characteristic χ = 0', 'Self-Intersection in 3D Space', 'Immersion vs Embedding in ℝ⁴'],
    renderType: 'klein',
    formula: 'χ = V - E + F = 2 - 2g = 0 (Genus g = 1 non-orientable)',
    pinpoints: [
      {
        id: 'self_intersection',
        name: '3D Self-Intersection Line',
        position: [0, 0.5, 0],
        description: 'In 3D Euclidean space, the bottle must pass through its own wall. In 4D space, the neck loops through the 4th dimension without touching.',
        significance: 'Illustrates the difference between an immersion in ℝ³ and a true embedding in ℝ⁴.',
        formulaOrFact: 'Whitney embedding theorem proves any smooth n-manifold embeds in ℝ²ⁿ.'
      },
      {
        id: 'neck_loop',
        name: 'Looping Neck Handle',
        position: [0.6, 1.2, 0],
        description: 'The tube bends and enters through the side to join the base from the inside, reversing surface normal orientation.',
        significance: 'Walking along the loop inverts chirality: a right hand returns as a left hand.',
        formulaOrFact: 'Fundamental group π₁(K) = ⟨a, b | aba⁻¹b = 1⟩.'
      },
      {
        id: 'base_bulb',
        name: 'Base Bulb Reservoir',
        position: [0, -1.0, 0],
        description: 'The wide spherical base where the inverted neck expands and fuses smoothly with the outer surface.',
        significance: 'Cannot hold liquid under atmospheric gravity because its interior is topologically continuous with exterior space.',
        formulaOrFact: 'Can be formed by gluing two Möbius strips together along their single circular boundaries.'
      }
    ]
  }
];
