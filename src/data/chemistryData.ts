import { Chemical, ReactionResult } from '../types';

export const CHEMICALS: Chemical[] = [
  {
    id: 'hcl',
    name: 'Hydrochloric Acid (HCl)',
    formula: 'HCl (aq) · 1.0 M',
    color: '#E0F2FE', // clear faint watery cyan
    pH: 1.0,
    type: 'acid',
    description: 'Strong monoprotic mineral acid that completely dissociates into hydronium (H₃O⁺) and chloride (Cl⁻) ions.',
    density: 1.05
  },
  {
    id: 'naoh',
    name: 'Sodium Hydroxide (NaOH)',
    formula: 'NaOH (aq) · 1.0 M',
    color: '#F1F5F9', // clear watery
    pH: 13.5,
    type: 'base',
    description: 'Strong caustic alkaline base that completely dissociates into sodium (Na⁺) and hydroxide (OH⁻) ions.',
    density: 1.04
  },
  {
    id: 'universal_indicator',
    name: 'Universal pH Indicator',
    formula: 'Indicator Solution',
    color: '#10B981', // green at neutral pH
    pH: 7.0,
    type: 'indicator',
    description: 'A blend of thymol blue, methyl red, bromothymol blue, and phenolphthalein producing a rainbow spectrum of colors from pH 1 to 14.',
    density: 1.0
  },
  {
    id: 'agno3',
    name: 'Silver Nitrate (AgNO₃)',
    formula: 'AgNO₃ (aq) · 0.2 M',
    color: '#EDE9FE', // translucent pale silver-violet
    pH: 5.5,
    type: 'salt',
    description: 'Water-soluble silver salt providing free solvated silver cations (Ag⁺) used to test for halide ions.',
    density: 1.12
  },
  {
    id: 'nacl',
    name: 'Sodium Chloride (NaCl)',
    formula: 'NaCl (aq) · 1.0 M',
    color: '#F8FAFC', // crystal clear
    pH: 7.0,
    type: 'salt',
    description: 'Neutral table salt solution providing high concentrations of free chloride anions (Cl⁻).',
    density: 1.08
  },
  {
    id: 'h2o2',
    name: 'Hydrogen Peroxide (H₂O₂)',
    formula: 'H₂O₂ (aq) · 30%',
    color: '#F0FDFA', // clear
    pH: 5.0,
    type: 'oxidizer',
    description: 'Concentrated peroxide with high chemical potential energy prone to catalytic disproportionation into water and oxygen.',
    density: 1.11
  },
  {
    id: 'ki_soap',
    name: 'Potassium Iodide Catalyst + Surfactant',
    formula: 'KI (aq) + C₁₂H₂₅SO₄Na',
    color: '#FEF08A', // golden yellow
    pH: 7.2,
    type: 'metal',
    description: 'Iodide ions (I⁻) provide a rapid alternative reaction pathway with lower activation energy; surfactant traps released O₂ gas into dense foam.',
    density: 1.15
  },
  {
    id: 'cuso4',
    name: 'Copper(II) Sulfate (CuSO₄)',
    formula: 'CuSO₄ (aq) · 0.5 M',
    color: '#0284C7', // vivid ocean blue [Cu(H2O)6]2+
    pH: 4.5,
    type: 'salt',
    description: 'Bright blue solution containing hexaquacopper(II) complex ions [Cu(H₂O)₆]²⁺; common transition metal reagent.',
    density: 1.1
  },
  {
    id: 'iron_metal',
    name: 'Metallic Iron Filings (Fe)',
    formula: 'Fe (s) · 99.8%',
    color: '#475569', // dark metallic gray
    pH: 7.0,
    type: 'metal',
    description: 'Transition metal with standard reduction potential E° = -0.44 V, more electropositive than copper.',
    density: 7.87
  },
  {
    id: 'caco3',
    name: 'Calcium Carbonate (CaCO₃)',
    formula: 'CaCO₃ (s) · Marble Chips',
    color: '#E2E8F0', // off-white mineral
    pH: 8.5,
    type: 'salt',
    description: 'Insoluble carbonate mineral (limestone/marble) that reacts with hydronium ions to liberate gaseous carbon dioxide.',
    density: 2.71
  },
  {
    id: 'luminol_oxidizer',
    name: 'Luminol + Alkaline Oxidizer',
    formula: 'C₈H₇N₃O₂ + H₂O₂ + OH⁻',
    color: '#DDD6FE', // faint pale lavender
    pH: 11.0,
    type: 'indicator',
    description: '5-Amino-2,3-dihydrophthalazine-1,4-dione; undergoes chemiluminescence upon catalytic oxidation without producing heat.',
    density: 1.02
  },
  {
    id: 'distilled_water',
    name: 'Deionized Water (H₂O)',
    formula: 'H₂O (l)',
    color: '#F8FAFC',
    pH: 7.0,
    type: 'solvent',
    description: 'Universal polar solvent with high dielectric constant (ε ≈ 80) and autoionization constant Kw = 1.0 × 10⁻¹⁴.',
    density: 1.0
  }
];

export const REACTIONS: ReactionResult[] = [
  {
    id: 'neutralization_indicator',
    name: 'Exothermic Acid-Base Neutralization',
    equation: 'H₃O⁺(aq) + OH⁻(aq) → 2H₂O(l)   [ΔH° = -57.1 kJ/mol]',
    requiredIds: ['hcl', 'naoh'],
    resultColor: '#60A5FA', // shifts with indicator or blue-neutral
    resultPH: 7.0,
    exothermicDeltaTemp: 14.5,
    molecularExplanation: 'Hydronium cations transferred protons to hydroxide anions to form neutral water molecules. In the presence of universal indicator, solution shifts from deep red (pH 1) to emerald green (pH 7).',
    realWorldApplication: 'Antacid medication neutralizing excess stomach hydrochloric acid; industrial wastewater pH balancing before river discharge.',
    safetyNote: 'Neutralization is exothermic. Mixing highly concentrated stock acids and bases rapidly generates intense heat.'
  },
  {
    id: 'precipitation_agcl',
    name: 'Silver Halide Precipitation',
    equation: 'Ag⁺(aq) + Cl⁻(aq) → AgCl(s) ↓   [Ksp = 1.8 × 10⁻¹⁰]',
    requiredIds: ['agno3', 'nacl'],
    resultColor: '#FFFFFF', // bright milky white suspension
    resultPH: 6.2,
    precipitate: true,
    precipitateName: 'Silver Chloride (AgCl) Milky White Curd',
    molecularExplanation: 'The electrostatic attraction between Ag⁺ cations and Cl⁻ anions overcomes the hydration energy of surrounding polar water molecules, condensing into an insoluble ionic crystal lattice.',
    realWorldApplication: 'Quantitative gravimetric analysis of chloride in drinking water; classical photographic film emulsions.',
    safetyNote: 'Silver salts stain human skin dark upon photolytic UV reduction into elemental silver particles.'
  },
  {
    id: 'elephant_toothpaste',
    name: 'Catalyzed Peroxide Disproportionation (Elephant Toothpaste)',
    equation: '2H₂O₂ (aq) ──[I⁻ catalyst]──> 2H₂O (l) + O₂ (g) ↑ + 196 kJ',
    requiredIds: ['h2o2', 'ki_soap'],
    resultColor: '#FBBF24', // warm yellow foam
    resultPH: 7.4,
    gasEvolution: true,
    effervescenceName: 'Pure Oxygen (O₂) Gas Micro-Bubbles',
    exothermicDeltaTemp: 38.0,
    molecularExplanation: 'Iodide acts as a homogeneous catalyst via two-step kinetics: H₂O₂ + I⁻ → IO⁻ + H₂O, followed by H₂O₂ + IO⁻ → I⁻ + H₂O + O₂. The soap traps surging O₂ gas into an expanding thermal foam tower.',
    realWorldApplication: 'Catalytic converters in vehicles; oxygen generation systems in aerospace and industrial bleaches.',
    safetyNote: 'Highly exothermic reaction! Reaches over 70°C and releases hot oxygen steam.'
  },
  {
    id: 'redox_copper_iron',
    name: 'Redox Single Displacement (Iron & Copper Sulfate)',
    equation: 'Fe(s) + Cu²⁺(aq) → Fe²⁺(aq) + Cu(s)   [E°cell = +0.78 V]',
    requiredIds: ['cuso4', 'iron_metal'],
    resultColor: '#86EFAC', // pale green ferrous solution
    resultPH: 5.2,
    precipitate: true,
    precipitateName: 'Elemental Copper Metal (Cu) Red-Brown Deposit',
    molecularExplanation: 'Iron has a higher oxidation potential than copper. Two valence electrons spontaneously transfer from metallic Fe atoms to solvated Cu²⁺ ions, plating elemental copper metal onto the iron.',
    realWorldApplication: 'Hydrometallurgical extraction of copper metal; galvanic sacrificial anode corrosion protection for ship hulls.',
    safetyNote: 'Mild exothermic reaction. Precipitated copper should be collected and neutralized.'
  },
  {
    id: 'effervescence_co2',
    name: 'Acid-Carbonate Gas Evolution',
    equation: 'CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g) ↑',
    requiredIds: ['hcl', 'caco3'],
    resultColor: '#E2E8F0',
    resultPH: 4.8,
    gasEvolution: true,
    effervescenceName: 'Carbon Dioxide (CO₂) Effervescence',
    exothermicDeltaTemp: 4.2,
    molecularExplanation: 'Hydronium ions attack the carbonate CO₃²⁻ lattice to form unstable carbonic acid (H₂CO₃), which rapidly decomposes into gaseous carbon dioxide bubbles and water.',
    realWorldApplication: 'Ocean acidification eroding coral reefs and mollusk shells; effervescent baking powder and soda leavening.',
    safetyNote: 'Generates pressure in sealed containers. Never stopper an active gas-evolving reaction flask.'
  },
  {
    id: 'chemiluminescence',
    name: 'Cold Chemiluminescence Photon Emission',
    equation: 'Luminol + 2H₂O₂ + 2OH⁻ ──[Fe³⁺]──> 3-Aminophthalate* + N₂ ↑ + 2H₂O + hν (λ = 425 nm)',
    requiredIds: ['luminol_oxidizer', 'h2o2'],
    resultColor: '#38BDF8', // radiant electric cyan-blue glow
    resultPH: 10.5,
    luminescence: true,
    molecularExplanation: 'Oxidation creates 3-aminophthalate in an electronically excited triplet state. As electrons relax down to the ground singlet orbital, energy is emitted directly as visible blue light photons (425 nm).',
    realWorldApplication: 'Forensic bloodstain detection (hemoglobin iron catalyzes reaction); marine bioluminescence in deep-sea jellyfish.',
    safetyNote: 'Safe cold-light reaction. Minimal thermal delta (temperature remains room level).'
  }
];
