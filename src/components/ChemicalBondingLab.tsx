import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Atom,
  Search,
  RotateCcw,
  PlusCircle,
  Check,
  Zap,
  Layers,
  ArrowLeftRight,
  Grid
} from 'lucide-react';
import { ALL_118_ELEMENTS_SUMMARY, getElementByNumber } from '../data/elementsData';
import { ElementData } from '../types/atomic';

interface ChemicalBondingLabProps {
  onAddNote: (
    title: string,
    subject: 'Chemistry',
    content: string,
    tags: string[],
    labRef: string
  ) => void;
}

// Complete Pauling electronegativity table (fallback for elements where electronegativity is null in summary)
const PAULING_ELECTRONEGATIVITY: Record<number, number | null> = {
  1: 2.20, 2: null,
  3: 0.98, 4: 1.57, 5: 2.04, 6: 2.55, 7: 3.04, 8: 3.44, 9: 3.98, 10: null,
  11: 0.93, 12: 1.31, 13: 1.61, 14: 1.90, 15: 2.19, 16: 2.58, 17: 3.16, 18: null,
  19: 0.82, 20: 1.00, 21: 1.36, 22: 1.54, 23: 1.63, 24: 1.66, 25: 1.55, 26: 1.83,
  27: 1.88, 28: 1.91, 29: 1.90, 30: 1.65, 31: 1.81, 32: 2.01, 33: 2.18, 34: 2.55,
  35: 2.96, 36: 3.00,
  37: 0.82, 38: 0.95, 39: 1.22, 40: 1.33, 41: 1.60, 42: 2.16, 43: 1.90, 44: 2.20,
  45: 2.28, 46: 2.20, 47: 1.93, 48: 1.69, 49: 1.78, 50: 1.96, 51: 2.05, 52: 2.10,
  53: 2.66, 54: 2.60,
  55: 0.79, 56: 0.89, 57: 1.10, 58: 1.12, 59: 1.13, 60: 1.14, 61: 1.13, 62: 1.17,
  63: 1.20, 64: 1.20, 65: 1.10, 66: 1.22, 67: 1.23, 68: 1.24, 69: 1.25, 70: 1.10,
  71: 1.27, 72: 1.30, 73: 1.50, 74: 2.36, 75: 1.90, 76: 2.20, 77: 2.20, 78: 2.28,
  79: 2.54, 80: 2.00, 81: 1.62, 82: 2.33, 83: 2.02, 84: 2.00, 85: 2.20, 86: 2.20,
  87: 0.70, 88: 0.90, 89: 1.10, 90: 1.30, 91: 1.50, 92: 1.38, 93: 1.36, 94: 1.28,
  95: 1.13, 96: 1.28, 97: 1.30, 98: 1.30, 99: 1.30, 100: 1.30, 101: 1.30, 102: 1.30,
  103: 1.30, 104: 1.30, 105: 1.50, 106: 1.70, 107: 1.80, 108: 2.00, 109: 2.10, 110: 2.10,
  111: 2.10, 112: 2.00, 113: 1.80, 114: 1.90, 115: 1.90, 116: 1.90, 117: 2.00, 118: null
};

const SUBSCRIPT_MAP: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉'
};

function toSubscript(num: number): string {
  if (num <= 1) return '';
  return String(num)
    .split('')
    .map((d) => SUBSCRIPT_MAP[d] ?? d)
    .join('');
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function isMetalCategory(cat: ElementData['category']): boolean {
  return (
    cat === 'alkali' ||
    cat === 'alkaline' ||
    cat === 'transition' ||
    cat === 'post-transition' ||
    cat === 'lanthanide' ||
    cat === 'actinide'
  );
}

const ANION_IDE_NAMES: Record<string, string> = {
  H: 'Hydride',
  B: 'Boride',
  C: 'Carbide',
  N: 'Nitride',
  O: 'Oxide',
  F: 'Fluoride',
  Si: 'Silicide',
  P: 'Phosphide',
  S: 'Sulfide',
  Cl: 'Chloride',
  As: 'Arsenide',
  Se: 'Selenide',
  Br: 'Bromide',
  Te: 'Telluride',
  I: 'Iodide',
  At: 'Astatide',
  Ts: 'Tennesside'
};

const GREEK_PREFIXES: Record<number, string> = {
  1: 'Mono',
  2: 'Di',
  3: 'Tri',
  4: 'Tetra',
  5: 'Penta',
  6: 'Hexa',
  7: 'Hepta',
  8: 'Octa'
};

const ROMAN_NUMERALS: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII'
};

export type BondClassification =
  | 'ionic'
  | 'polar_covalent'
  | 'nonpolar_covalent'
  | 'metallic'
  | 'noble_inert';

export interface BondAnalysisResult {
  elA: ElementData;
  elB: ElementData;
  valA: number;
  valB: number;
  enA: number | null;
  enB: number | null;
  deltaEN: number;
  ionicCharacterPercent: number;
  bondType: BondClassification;
  bondTypeLabel: string;
  formulaDisplay: string;
  compoundName: string;
  countA: number;
  countB: number;
  molarMass: number;
  bondOrder: number; // 1 = single, 2 = double, 3 = triple
  mechanismSummary: string;
  octetExplanation: string;
  physicalProperties: string[];
}

function analyzeElementBonding(
  elA: ElementData,
  elB: ElementData,
  valA: number,
  valB: number
): BondAnalysisResult {
  const enA = elA.electronegativity ?? PAULING_ELECTRONEGATIVITY[elA.number] ?? null;
  const enB = elB.electronegativity ?? PAULING_ELECTRONEGATIVITY[elB.number] ?? null;
  const deltaEN = enA !== null && enB !== null ? Math.abs(enA - enB) : 0;

  // Pauling's percent ionic character formula: %IC = (1 - exp(-0.25 * dEN^2)) * 100
  const ionicCharacterPercent =
    enA !== null && enB !== null ? (1 - Math.exp(-0.25 * deltaEN * deltaEN)) * 100 : 0;

  // 1. Check Noble Gas / Zero Valency
  if (valA === 0 || valB === 0 || (elA.category === 'noble' && valA === 0) || (elB.category === 'noble' && valB === 0)) {
    const inertNames =
      elA.number === elB.number ? `${elA.name} Monatomic Gas` : `${elA.name} + ${elB.name} Unbonded Mixture`;
    return {
      elA,
      elB,
      valA,
      valB,
      enA,
      enB,
      deltaEN: 0,
      ionicCharacterPercent: 0,
      bondType: 'noble_inert',
      bondTypeLabel: 'No Chemical Bond (Inert Closed Shell)',
      formulaDisplay: elA.number === elB.number ? `${elA.symbol} (Monatomic)` : `${elA.symbol} + ${elB.symbol}`,
      compoundName: inertNames,
      countA: 1,
      countB: 1,
      molarMass: elA.atomicMass + (elA.number === elB.number ? 0 : elB.atomicMass),
      bondOrder: 0,
      mechanismSummary: `${
        valA === 0 ? elA.name : elB.name
      } already possesses a completely filled valence shell (${
        (valA === 0 ? elA : elB).number === 2 ? 'stable K-shell duplet of 2e⁻' : 'stable octet of 8e⁻'
      }). Electron transfer or sharing is energetically unfavorable under standard conditions.`,
      octetExplanation:
        'Valence orbitals are saturated. Only ultra-weak London dispersion (van der Waals) forces act between atoms at cryogenic temperatures.',
      physicalProperties: [
        'Exists as monatomic gas at standard temperature and pressure',
        'Extremely high ionization energy and near-zero electron affinity',
        'Very low boiling and melting points'
      ]
    };
  }

  const metalA = isMetalCategory(elA.category);
  const metalB = isMetalCategory(elB.category);

  // 2. Check Metallic Bonding (Metal + Metal)
  if (metalA && metalB) {
    const isSame = elA.number === elB.number;
    const formulaDisplay = isSame ? `${elA.symbol}(s)` : `${elA.symbol}${elB.symbol} (Alloy)`;
    const compoundName = isSame
      ? `Pure Metallic ${elA.name} Lattice`
      : `${elA.name}–${elB.name} Intermetallic Alloy`;
    return {
      elA,
      elB,
      valA,
      valB,
      enA,
      enB,
      deltaEN,
      ionicCharacterPercent: Math.min(15, ionicCharacterPercent),
      bondType: 'metallic',
      bondTypeLabel: 'Metallic Bond (Delocalized Electron Sea)',
      formulaDisplay,
      compoundName,
      countA: 1,
      countB: 1,
      molarMass: isSame ? elA.atomicMass : elA.atomicMass + elB.atomicMass,
      bondOrder: 1,
      mechanismSummary: `Both ${elA.name} and ${elB.name} are electropositive metals with low ionization energies. Instead of transferring or localizing electrons into discrete pairs, their valence electrons (${valA}e⁻ and ${valB}e⁻) delocalize across a 3D crystalline lattice of positive metal cations (${elA.symbol}${'⁺'.repeat(Math.min(3, valA))} / ${elB.symbol}${'⁺'.repeat(Math.min(3, valB))}).`,
      octetExplanation:
        'Non-directional electrostatic attraction between mobile conduction-band electrons and positively charged metal cores.',
      physicalProperties: [
        'High electrical and thermal conductivity via mobile electron sea',
        'Malleable and ductile (cation layers slide without shattering)',
        'Metallic luster and high tensile strength'
      ]
    };
  }

  // Compute Stoichiometry via Valency Criss-Cross
  const divisor = gcd(valA, valB);
  let countA = valB / divisor;
  let countB = valA / divisor;

  // Homonuclear diatomic nonmetals (e.g. H + H -> H2, O + O -> O2, N + N -> N2, C + C -> C2)
  if (elA.number === elB.number && !metalA) {
    countA = 1;
    countB = 1;
  }

  // Order electropositive element first in formula (unless C+H or N+H where NH3 / CH4 is standard)
  const firstIsA =
    elA.number === elB.number
      ? true
      : metalA && !metalB
      ? true
      : !metalA && metalB
      ? false
      : (enA ?? 2.0) <= (enB ?? 2.0);

  const leftEl = firstIsA ? elA : elB;
  const rightEl = firstIsA ? elB : elA;
  const leftCount = firstIsA ? countA : countB;
  const rightCount = firstIsA ? countB : countA;
  const leftVal = firstIsA ? valA : valB;
  const rightVal = firstIsA ? valB : valA;

  let formulaDisplay = '';
  if (elA.number === elB.number) {
    formulaDisplay = `${elA.symbol}₂`;
  } else {
    formulaDisplay = `${leftEl.symbol}${toSubscript(leftCount)}${rightEl.symbol}${toSubscript(rightCount)}`;
  }

  // Special conventional formulas
  if (
    (elA.symbol === 'N' && elB.symbol === 'H' && valA === 3) ||
    (elA.symbol === 'H' && elB.symbol === 'N' && valB === 3)
  ) {
    formulaDisplay = 'NH₃';
  } else if (
    (elA.symbol === 'C' && elB.symbol === 'H' && valA === 4) ||
    (elA.symbol === 'H' && elB.symbol === 'C' && valB === 4)
  ) {
    formulaDisplay = 'CH₄';
  } else if (
    (elA.symbol === 'H' && elB.symbol === 'O') ||
    (elA.symbol === 'O' && elB.symbol === 'H')
  ) {
    formulaDisplay = 'H₂O';
  }

  const totalMolarMass =
    elA.number === elB.number
      ? elA.atomicMass * 2
      : leftEl.atomicMass * leftCount + rightEl.atomicMass * rightCount;

  // 3. Determine Ionic vs Polar Covalent vs Nonpolar Covalent
  const isMetalNonmetalPair = (metalA && !metalB) || (!metalA && metalB);
  let bondType: BondClassification = 'polar_covalent';

  if (isMetalNonmetalPair && deltaEN >= 1.2) {
    bondType = 'ionic';
  } else if (deltaEN >= 1.7) {
    bondType = 'ionic';
  } else if (deltaEN < 0.4 || elA.number === elB.number) {
    bondType = 'nonpolar_covalent';
  } else {
    bondType = 'polar_covalent';
  }

  // Determine Bond Order (Single, Double, Triple) for covalent bonds
  const sharedPairsPerBond = Math.min(3, Math.max(1, Math.min(valA, valB)));

  // Build systematic IUPAC name
  let compoundName = '';
  const anionRoot = ANION_IDE_NAMES[rightEl.symbol] || `${rightEl.name.replace(/(ine|gen|on|ium|ur|us)$/i, '')}ide`;

  if (elA.number === elB.number) {
    compoundName = `Diatomic ${elA.name} (${elA.symbol}₂)`;
  } else if (bondType === 'ionic' || isMetalCategory(leftEl.category)) {
    const hasMultipleValencies = leftEl.valency.length > 1;
    const roman = hasMultipleValencies ? `(${ROMAN_NUMERALS[leftVal] || leftVal})` : '';
    compoundName = `${leftEl.name}${roman} ${anionRoot}`;
  } else {
    const leftPrefix = leftCount > 1 ? GREEK_PREFIXES[leftCount] || `${leftCount}-` : '';
    const rightPrefix = GREEK_PREFIXES[rightCount] || `${rightCount}-`;
    const cleanAnion =
      rightPrefix.endsWith('a') && anionRoot.startsWith('O')
        ? `${rightPrefix.slice(0, -1)}${anionRoot.toLowerCase()}`
        : `${rightPrefix}${anionRoot.toLowerCase()}`;
    compoundName = `${leftPrefix}${leftEl.name} ${cleanAnion.charAt(0).toUpperCase() + cleanAnion.slice(1)}`;
  }

  if (formulaDisplay === 'H₂O') compoundName = 'Water (Dihydrogen Monoxide)';
  if (formulaDisplay === 'NH₃') compoundName = 'Ammonia (Nitrogen Trihydride)';
  if (formulaDisplay === 'CH₄') compoundName = 'Methane (Carbon Tetrahydride)';
  if (formulaDisplay === 'NaCl') compoundName = 'Sodium Chloride (Rock Salt)';
  if (formulaDisplay === 'CO₂') compoundName = 'Carbon Dioxide';
  if (formulaDisplay === 'HCl') compoundName = 'Hydrogen Chloride';

  if (bondType === 'ionic') {
    const totalElectronsTransferred = leftCount * leftVal;
    return {
      elA,
      elB,
      valA,
      valB,
      enA,
      enB,
      deltaEN,
      ionicCharacterPercent,
      bondType: 'ionic',
      bondTypeLabel: 'Ionic (Electrovalent) Bond',
      formulaDisplay,
      compoundName,
      countA: firstIsA ? leftCount : rightCount,
      countB: firstIsA ? rightCount : leftCount,
      molarMass: totalMolarMass,
      bondOrder: 1,
      mechanismSummary: `Complete electron transfer: ${leftCount} ${leftEl.name} atom(s) donate ${leftVal} valence electron(s) each (${totalElectronsTransferred}e⁻ total) to ${rightCount} ${rightEl.name} atom(s), forming ${leftCount} ${leftEl.symbol}${leftVal > 1 ? leftVal : ''}⁺ cation(s) and ${rightCount} ${rightEl.symbol}${rightVal > 1 ? rightVal : ''}⁻ anion(s) held together by strong Coulombic electrostatic attraction.`,
      octetExplanation: `${leftEl.symbol} empties its outer valence shell to achieve the preceding noble-gas core, while ${rightEl.symbol} gains ${rightVal}e⁻ per atom to complete a stable ${rightEl.number === 1 ? 'duplet (2e⁻)' : 'octet (8e⁻)'}.`,
      physicalProperties: [
        'Forms high-melting crystalline ionic lattice at room temperature',
        'Conducts electricity when molten or dissolved in polar solvents (aqueous electrolytes)',
        'Hard but brittle crystal cleavage along ionic planes'
      ]
    };
  }

  if (bondType === 'nonpolar_covalent') {
    const bondOrderLabel =
      sharedPairsPerBond === 3 ? 'Triple Covalent Bond (3 shared pairs, 6e⁻)' : sharedPairsPerBond === 2 ? 'Double Covalent Bond (2 shared pairs, 4e⁻)' : 'Single Covalent Bond (1 shared pair, 2e⁻)';
    return {
      elA,
      elB,
      valA,
      valB,
      enA,
      enB,
      deltaEN,
      ionicCharacterPercent,
      bondType: 'nonpolar_covalent',
      bondTypeLabel: `Nonpolar Covalent (${bondOrderLabel.split(' (')[0]})`,
      formulaDisplay,
      compoundName,
      countA: elA.number === elB.number ? 1 : countA,
      countB: elA.number === elB.number ? 1 : countB,
      molarMass: totalMolarMass,
      bondOrder: sharedPairsPerBond,
      mechanismSummary: `Symmetric orbital overlap: ${elA.name} and ${elB.name} have nearly identical electronegativities (Δχ = ${deltaEN.toFixed(2)}), so they share valence electron pairs equally in ${bondOrderLabel.toLowerCase()} with zero net bond dipole.`,
      octetExplanation: `Both atoms attain stable noble-gas configurations (${elA.number === 1 || elB.number === 1 ? 'duplet / octet' : 'octet'}) through mutual electron pair sharing between overlapping valence orbitals.`,
      physicalProperties: [
        'Zero or negligible permanent electric dipole moment',
        'Low intermolecular attraction (London dispersion forces) in discrete molecular form',
        'Poor electrical conductivity in all phases'
      ]
    };
  }

  // Polar Covalent
  const moreEN = (enA ?? 0) >= (enB ?? 0) ? elA : elB;
  const lessEN = moreEN.number === elA.number ? elB : elA;
  return {
    elA,
    elB,
    valA,
    valB,
    enA,
    enB,
    deltaEN,
    ionicCharacterPercent,
    bondType: 'polar_covalent',
    bondTypeLabel: 'Polar Covalent Bond (Unequal Sharing)',
    formulaDisplay,
    compoundName,
    countA,
    countB,
    molarMass: totalMolarMass,
    bondOrder: sharedPairsPerBond,
    mechanismSummary: `Unequal electron sharing: ${elA.name} and ${elB.name} share ${sharedPairsPerBond} valence electron pair(s) per bond, but because ${moreEN.name} is more electronegative (χ = ${
      (moreEN.number === elA.number ? enA : enB)?.toFixed(2) ?? '—'
    } vs ${
      (lessEN.number === elA.number ? enA : enB)?.toFixed(2) ?? '—'
    }), shared electron density shifts toward ${moreEN.symbol} (δ⁻), leaving ${lessEN.symbol} partially positive (δ⁺).`,
    octetExplanation: `Shared bonding pairs count toward the valence shells of both ${elA.symbol} and ${elB.symbol}, satisfying their valence shell stability with ${ionicCharacterPercent.toFixed(1)}% partial ionic character.`,
    physicalProperties: [
      `Permanent bond dipole moment pointing from ${lessEN.symbol} (δ⁺) → ${moreEN.symbol} (δ⁻)`,
      'Exhibits dipole–dipole intermolecular attractions (or H-bonding with N/O/F)',
      'Soluble in polar solvents; non-conductive unless ionizable in water'
    ]
  };
}

const BOND_PRESETS: { label: string; zA: number; zB: number; desc: string }[] = [
  { label: 'Na + Cl (Ionic)', zA: 11, zB: 17, desc: 'Rock Salt Electrovalent Transfer' },
  { label: 'H + O (Polar Covalent)', zA: 1, zB: 8, desc: 'Water Dipole Sharing' },
  { label: 'N + N (Triple Covalent)', zA: 7, zB: 7, desc: 'N≡N 6-Electron Bond' },
  { label: 'C + O (Double Covalent)', zA: 6, zB: 8, desc: 'O=C=O Shared Pairs' },
  { label: 'Mg + F (Ionic 1:2)', zA: 12, zB: 9, desc: 'MgF₂ Divalent Transfer' },
  { label: 'Fe + O (Transition Oxide)', zA: 26, zB: 8, desc: 'Iron Oxide Synthesis' },
  { label: 'Cu + Zn (Metallic Brass)', zA: 29, zB: 30, desc: 'Electron Sea Alloy' },
  { label: 'U + F (Actinide UF₆)', zA: 92, zB: 9, desc: 'Heavy Element Hexafluoride' },
  { label: 'He + Ne (Noble Inert)', zA: 2, zB: 10, desc: 'Closed Shell Non-Bonding' }
];

export const ChemicalBondingLab: React.FC<ChemicalBondingLabProps> = ({ onAddNote }) => {
  const [zA, setZA] = useState<number>(11); // Sodium default
  const [zB, setZB] = useState<number>(17); // Chlorine default
  const [valA, setValA] = useState<number>(1);
  const [valB, setValB] = useState<number>(1);
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showPeriodicModal, setShowPeriodicModal] = useState<boolean>(false);
  const [visualMode, setVisualMode] = useState<'orbital' | 'lewis'>('orbital');
  const [noteSaved, setNoteSaved] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  const elA = useMemo(() => getElementByNumber(zA), [zA]);
  const elB = useMemo(() => getElementByNumber(zB), [zB]);

  // Sync default valency when element changes
  useEffect(() => {
    const defaultValA = elA.valency.find((v) => v > 0) ?? elA.valency[0] ?? 1;
    setValA(defaultValA);
  }, [elA]);

  useEffect(() => {
    const defaultValB = elB.valency.find((v) => v > 0) ?? elB.valency[0] ?? 1;
    setValB(defaultValB);
  }, [elB]);

  const bondResult = useMemo(
    () => analyzeElementBonding(elA, elB, valA, valB),
    [elA, elB, valA, valB]
  );

  // Filtered elements list from all 118 elements
  const filteredElements = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ALL_118_ELEMENTS_SUMMARY.filter((el) => {
      if (categoryFilter !== 'all' && el.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        el.symbol.toLowerCase().includes(q) ||
        el.name.toLowerCase().includes(q) ||
        String(el.number) === q
      );
    });
  }, [searchQuery, categoryFilter]);

  const handleSelectElement = (atomicNumber: number) => {
    if (activeSlot === 'A') {
      setZA(atomicNumber);
    } else {
      setZB(atomicNumber);
    }
  };

  const handleSwapElements = () => {
    const prevZA = zA;
    const prevValA = valA;
    setZA(zB);
    setZB(prevZA);
    setValA(valB);
    setValB(prevValA);
  };

  // Interactive 2D Canvas Animation for Chemical Bonding
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;
    const render = () => {
      t += 0.025;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = 'left';

      // Deep space lab background
      ctx.fillStyle = '#040814';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle coordinate grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 36) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      if (visualMode === 'orbital') {
        drawOrbitalBondingCanvas(ctx, canvas, t, bondResult);
      } else {
        drawLewisStructureCanvas(ctx, canvas, t, bondResult);
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [bondResult, visualMode]);

  const handleSaveBondNote = () => {
    const content = `### Chemical Bonding Synthesis Report: ${bondResult.formulaDisplay} (${bondResult.compoundName})
- **Element A**: ${elA.name} (${elA.symbol}, Z = ${elA.number}) · Electron Config: \`${elA.electronConfiguration}\` · Active Valency: ${valA}
- **Element B**: ${elB.name} (${elB.symbol}, Z = ${elB.number}) · Electron Config: \`${elB.electronConfiguration}\` · Active Valency: ${valB}
- **Bond Classification**: **${bondResult.bondTypeLabel}**
- **Electronegativity Difference (Δχ)**: \`${bondResult.deltaEN.toFixed(2)}\` (Pauling Scale)
- **Percent Ionic Character**: \`${bondResult.ionicCharacterPercent.toFixed(1)}%\`
- **Calculated Molar Mass**: \`${bondResult.molarMass.toFixed(3)} g/mol\`

#### Electronic Bonding Mechanism:
${bondResult.mechanismSummary}

#### Valence Octet / Duplet Analysis:
${bondResult.octetExplanation}

#### Expected Physical & Chemical Properties:
${bondResult.physicalProperties.map((p) => `- ${p}`).join('\n')}
`;

    onAddNote(
      `Chemical Bonding: ${bondResult.formulaDisplay} (${bondResult.compoundName})`,
      'Chemistry',
      content,
      ['Chemical Bonding', bondResult.bondTypeLabel, bondResult.formulaDisplay, elA.symbol, elB.symbol],
      `Chemistry Bonding Studio: ${elA.symbol} + ${elB.symbol}`
    );
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2200);
  };

  return (
    <div className="space-y-6">
      {/* Quick Presets & Periodic Picker Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Quick Bonding Benchmarks (or select any of the 118 elements below):</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {BOND_PRESETS.map((preset) => {
              const isSelected =
                (zA === preset.zA && zB === preset.zB) || (zA === preset.zB && zB === preset.zA);
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setZA(preset.zA);
                    setZB(preset.zB);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                  title={preset.desc}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPeriodicModal(!showPeriodicModal)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
            showPeriodicModal
              ? 'bg-cyan-500 text-slate-950 border-cyan-400'
              : 'bg-slate-950 border-slate-700 text-cyan-300 hover:border-cyan-500/50'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>{showPeriodicModal ? 'Hide Full 118-Element Table' : 'Open Full 118-Element Periodic Table'}</span>
        </button>
      </div>

      {/* Expandable Full 118-Element Periodic Table Selector */}
      {showPeriodicModal && (
        <div className="bg-slate-900/95 border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                Select Element for Slot {activeSlot} ({activeSlot === 'A' ? `${elA.name} (${elA.symbol})` : `${elB.name} (${elB.symbol})`})
              </h3>
              <p className="text-xs text-slate-400">
                Click any of the 118 IUPAC elements below to assign it to the currently active slot.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSlot('A')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border ${
                  activeSlot === 'A'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                    : 'bg-slate-950 text-slate-300 border-slate-800'
                }`}
              >
                Assigning Slot A: {elA.symbol} (#{elA.number})
              </button>
              <button
                type="button"
                onClick={() => setActiveSlot('B')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border ${
                  activeSlot === 'B'
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-950 text-slate-300 border-slate-800'
                }`}
              >
                Assigning Slot B: {elB.symbol} (#{elB.number})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-14 lg:grid-cols-18 gap-1.5 max-h-[320px] overflow-y-auto pr-1">
            {ALL_118_ELEMENTS_SUMMARY.map((item) => {
              const isA = item.number === zA;
              const isB = item.number === zB;
              return (
                <button
                  key={item.number}
                  type="button"
                  onClick={() => handleSelectElement(item.number)}
                  className={`p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                    isA && isB
                      ? 'bg-emerald-500/25 border-emerald-400 text-white'
                      : isA
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                      : isB
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                      : 'bg-slate-950/70 border-slate-800/90 text-slate-300 hover:border-slate-600 hover:text-white'
                  }`}
                  title={`#${item.number} ${item.name} · Valency: ${item.valency.join(', ')}`}
                >
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span>{item.number}</span>
                    <span>v:{item.valency[0]}</span>
                  </div>
                  <div className="text-xs font-bold font-mono">{item.symbol}</div>
                  <div className="text-[9px] text-slate-400 truncate">{item.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main 12-Column Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4 cols): All-118 Element Selector & Valency Controls */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Reactant Cards (Slot A & Slot B) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Selected Bonding Atoms</span>
              <button
                type="button"
                onClick={handleSwapElements}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                title="Swap Element A and Element B"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Swap A ↔ B</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Slot A Card */}
              <div
                onClick={() => setActiveSlot('A')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  activeSlot === 'A'
                    ? 'bg-cyan-950/30 border-cyan-500/60 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400">
                  <span>ATOM A (Z={elA.number})</span>
                  <span>{activeSlot === 'A' ? 'ACTIVE' : 'SELECT'}</span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-display text-white">{elA.symbol}</span>
                  <span className="text-xs text-slate-300 truncate">{elA.name}</span>
                </div>
                <div className="mt-1.5 text-[11px] font-mono text-slate-400 space-y-0.5">
                  <div>Shells: {elA.shells.join('-')}</div>
                  <div>
                    χ: {(elA.electronegativity ?? PAULING_ELECTRONEGATIVITY[elA.number])?.toFixed(2) ?? 'Inert'}
                  </div>
                </div>

                {/* Valency Selector for A */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block mb-1">Active Valency:</span>
                  <div className="flex flex-wrap gap-1">
                    {elA.valency.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setValA(v);
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
                          valA === v
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Slot B Card */}
              <div
                onClick={() => setActiveSlot('B')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  activeSlot === 'B'
                    ? 'bg-amber-950/30 border-amber-500/60 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-amber-400">
                  <span>ATOM B (Z={elB.number})</span>
                  <span>{activeSlot === 'B' ? 'ACTIVE' : 'SELECT'}</span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-display text-white">{elB.symbol}</span>
                  <span className="text-xs text-slate-300 truncate">{elB.name}</span>
                </div>
                <div className="mt-1.5 text-[11px] font-mono text-slate-400 space-y-0.5">
                  <div>Shells: {elB.shells.join('-')}</div>
                  <div>
                    χ: {(elB.electronegativity ?? PAULING_ELECTRONEGATIVITY[elB.number])?.toFixed(2) ?? 'Inert'}
                  </div>
                </div>

                {/* Valency Selector for B */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block mb-1">Active Valency:</span>
                  <div className="flex flex-wrap gap-1">
                    {elB.valency.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setValB(v);
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
                          valB === v
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Searchable All-118 Element Directory */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Choose Element for Slot {activeSlot} (1–118)
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {filteredElements.length} elements
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, symbol, or atomic # (1-118)..."
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            {/* Category Filter Buttons */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'All (118)' },
                { id: 'nonmetal', label: 'Nonmetals' },
                { id: 'halogen', label: 'Halogens' },
                { id: 'alkali', label: 'Alkali' },
                { id: 'alkaline', label: 'Alkaline' },
                { id: 'transition', label: 'Transition' },
                { id: 'metalloid', label: 'Metalloids' },
                { id: 'post-transition', label: 'Post-Trans' },
                { id: 'lanthanide', label: 'Lanthanides' },
                { id: 'actinide', label: 'Actinides' },
                { id: 'noble', label: 'Noble Gases' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium cursor-pointer transition-colors ${
                    categoryFilter === cat.id
                      ? 'bg-cyan-500 text-slate-950 font-semibold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Scrollable Element List */}
            <div className="grid grid-cols-2 gap-1.5 max-h-[290px] overflow-y-auto pr-1">
              {filteredElements.map((item) => {
                const isCurrentSlot =
                  (activeSlot === 'A' && item.number === zA) ||
                  (activeSlot === 'B' && item.number === zB);
                return (
                  <button
                    key={item.number}
                    type="button"
                    onClick={() => handleSelectElement(item.number)}
                    className={`p-2 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isCurrentSlot
                        ? activeSlot === 'A'
                          ? 'bg-cyan-500/20 border-cyan-500/60 text-white'
                          : 'bg-amber-500/20 border-amber-500/60 text-white'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-cyan-300">{item.symbol}</span>
                        <span className="text-[10px] font-mono text-slate-500">#{item.number}</span>
                      </div>
                      <div className="text-[11px] font-medium truncate">{item.name}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-mono text-slate-400">
                        v:{item.valency.join('/')}
                      </div>
                      <div className="text-[9px] font-mono text-slate-500">
                        {item.valenceElectrons}e⁻
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center & Right Columns (8 cols): Interactive Bonding Canvas + Synthesis Telemetry */}
        <div className="lg:col-span-8 space-y-5">
          {/* Interactive Bonding Canvas Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Top Bar */}
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-2">
                  <span>{bondResult.compoundName}</span>
                  <span className="text-slate-500">·</span>
                  <span className="font-mono text-cyan-400">{bondResult.formulaDisplay}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {bondResult.bondTypeLabel} · Δχ = {bondResult.deltaEN.toFixed(2)} ·{' '}
                  {bondResult.ionicCharacterPercent.toFixed(1)}% Ionic Character
                </div>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setVisualMode('orbital')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    visualMode === 'orbital'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Valence Shell Bonding
                </button>
                <button
                  type="button"
                  onClick={() => setVisualMode('lewis')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    visualMode === 'lewis'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Lewis Electron-Dot Structure
                </button>
              </div>
            </div>

            {/* Canvas Viewport */}
            <div className="w-full h-[360px] bg-slate-950 relative">
              <canvas
                ref={canvasRef}
                width={760}
                height={360}
                className="w-full h-full block"
              />
            </div>

            {/* Bottom Bar */}
            <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                <span>
                  Stoichiometry: {bondResult.countA} {elA.symbol} : {bondResult.countB} {elB.symbol}
                </span>
                <span>·</span>
                <span>Molar Mass: {bondResult.molarMass.toFixed(2)} g/mol</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setZA(11);
                    setZB(17);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to NaCl</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveBondNote}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded-xl transition-all cursor-pointer"
                >
                  {noteSaved ? <Check className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                  <span>{noteSaved ? 'Saved to Notes!' : 'Log Bonding Analysis to Notes'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Comprehensive Bonding Analysis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Analysis Box: Electronic Mechanism & Octet Status */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Atom className="w-4 h-4" />
                  <span>Electronic Bonding Mechanism</span>
                </span>
                <span className="text-xs font-mono text-white font-bold">
                  {bondResult.formulaDisplay}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {bondResult.mechanismSummary}
              </p>

              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                <span className="text-[11px] font-semibold text-amber-300 block">
                  Octet / Valence Shell Stability:
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {bondResult.octetExplanation}
                </p>
              </div>
            </div>

            {/* Right Analysis Box: Electronegativity Continuum & Properties */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Pauling Polarity & Material Properties</span>
                </span>
                <span className="text-xs font-mono text-emerald-400">
                  Δχ = {bondResult.deltaEN.toFixed(2)}
                </span>
              </div>

              {/* Pauling Polarity Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Pure Covalent (0%)</span>
                  <span>Polar</span>
                  <span>Ionic ({bondResult.ionicCharacterPercent.toFixed(0)}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 transition-all duration-300"
                    style={{ width: `${Math.max(4, Math.min(100, bondResult.ionicCharacterPercent))}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-300 block">
                  Predicted Macroscopic Characteristics:
                </span>
                <ul className="space-y-1 text-xs text-slate-400">
                  {bondResult.physicalProperties.map((prop, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">·</span>
                      <span>{prop}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Canvas Renderer 1: Animated Valence Shell & Orbital Bonding ---
function drawOrbitalBondingCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  t: number,
  bond: BondAnalysisResult
) {
  const { elA, elB, valA, valB, bondType, formulaDisplay, bondOrder } = bond;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2 + 12;

  // Top HUD Banner inside canvas
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fillRect(20, 16, canvas.width - 40, 52);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(20, 16, canvas.width - 40, 52);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px "Syne", sans-serif';
  ctx.fillText(
    `VALENCE SHELL INTERACTION: ${elA.name.toUpperCase()} (${elA.symbol}) + ${elB.name.toUpperCase()} (${elB.symbol}) ⟶ ${formulaDisplay}`,
    32,
    36
  );

  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px "JetBrains Mono"';
  ctx.fillText(
    `Bond Type: ${bond.bondTypeLabel} | Electronegativity Δχ = ${bond.deltaEN.toFixed(2)} | Valencies: ${elA.symbol}=${valA}, ${elB.symbol}=${valB}`,
    32,
    54
  );

  const leftCenter = { x: cx - 135, y: cy + 10 };
  const rightCenter = { x: cx + 135, y: cy + 10 };

  if (bondType === 'ionic') {
    // Determine which atom is donor (metal/less electronegative) and acceptor (nonmetal/more electronegative)
    const aIsDonor = isMetalCategory(elA.category) || (bond.enA ?? 1) <= (bond.enB ?? 2);
    const donor = aIsDonor ? elA : elB;
    const acceptor = aIsDonor ? elB : elA;
    const donorVal = aIsDonor ? valA : valB;
    const acceptorVal = aIsDonor ? valB : valA;

    // Draw Donor Cation on Left
    drawAtomBohrShells(ctx, leftCenter.x, leftCenter.y, donor, '#38bdf8', t, -donorVal);

    // Draw Acceptor Anion on Right
    drawAtomBohrShells(ctx, rightCenter.x, rightCenter.y, acceptor, '#f59e0b', -t, acceptorVal);

    // Animate electron transfer arcs from Donor to Acceptor
    const numTransferred = Math.min(6, Math.max(1, donorVal));
    for (let i = 0; i < numTransferred; i++) {
      const phase = (t * 0.75 + i / numTransferred) % 1;
      const startX = leftCenter.x + 70;
      const startY = leftCenter.y - 20 + (i - (numTransferred - 1) / 2) * 14;
      const endX = rightCenter.x - 70;
      const endY = rightCenter.y - 20 + (i - (numTransferred - 1) / 2) * 14;
      const ctrlX = cx;
      const ctrlY = cy - 75 - i * 12;

      // Dashed trajectory arc
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Moving electron along quadratic Bezier curve
      const oneMinus = 1 - phase;
      const ex = oneMinus * oneMinus * startX + 2 * oneMinus * phase * ctrlX + phase * phase * endX;
      const ey = oneMinus * oneMinus * startY + 2 * oneMinus * phase * ctrlY + phase * phase * endY;

      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ex, ey, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Charge Badges
    ctx.textAlign = 'center';
    ctx.font = 'bold 13px "JetBrains Mono"';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(
      `Cation: ${donor.symbol}${donorVal > 1 ? donorVal : ''}⁺ (Donates ${donorVal}e⁻)`,
      leftCenter.x,
      canvas.height - 22
    );

    ctx.fillStyle = '#fbbf24';
    ctx.fillText(
      `Anion: ${acceptor.symbol}${acceptorVal > 1 ? acceptorVal : ''}⁻ (Gains ${acceptorVal}e⁻)`,
      rightCenter.x,
      canvas.height - 22
    );

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 11px "JetBrains Mono"';
    ctx.fillText('⚡ Electrostatic Attraction', cx, cy + 25);
  } else if (bondType === 'polar_covalent' || bondType === 'nonpolar_covalent') {
    // Overlapping valence shells in center
    const cLeft = { x: cx - 68, y: cy + 8 };
    const cRight = { x: cx + 68, y: cy + 8 };

    drawAtomBohrShells(ctx, cLeft.x, cLeft.y, elA, '#38bdf8', t, 0, true);
    drawAtomBohrShells(ctx, cRight.x, cRight.y, elB, '#f59e0b', -t, 0, true);

    // Shared electron pairs in the overlapping region
    const pairs = Math.min(3, Math.max(1, bondOrder));
    ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, 28, 36 + pairs * 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    for (let p = 0; p < pairs; p++) {
      const pairY = cy + 8 + (p - (pairs - 1) / 2) * 22;
      const wobble = Math.sin(t * 3 + p) * 5;

      // Electron from A (cyan)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx - 8 + wobble, pairY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Electron from B (amber)
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx + 8 - wobble, pairY, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = 'center';
    ctx.font = 'bold 11px "JetBrains Mono"';
    ctx.fillStyle = '#10b981';
    ctx.fillText(
      `${pairs} Shared Electron Pair${pairs > 1 ? 's' : ''} (${pairs * 2}e⁻ Shared)`,
      cx,
      canvas.height - 20
    );

    if (bondType === 'polar_covalent') {
      const aMoreEN = (bond.enA ?? 0) >= (bond.enB ?? 0);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 12px "JetBrains Mono"';
      ctx.fillText(aMoreEN ? 'δ⁻ (Higher χ)' : 'δ⁺ (Lower χ)', cLeft.x - 45, cLeft.y - 75);
      ctx.fillText(aMoreEN ? 'δ⁺ (Lower χ)' : 'δ⁻ (Higher χ)', cRight.x + 45, cRight.y - 75);
    }
  } else if (bondType === 'metallic') {
    // Metallic lattice of cations + flowing delocalized electron sea
    const cols = 4;
    const rows = 2;
    const startX = cx - 150;
    const startY = cy - 25;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isAtomA = (r + c) % 2 === 0;
        const el = isAtomA ? elA : elB;
        const x = startX + c * 100;
        const y = startY + r * 75;

        // Cation core
        ctx.fillStyle = isAtomA ? 'rgba(56, 189, 248, 0.22)' : 'rgba(245, 158, 11, 0.22)';
        ctx.strokeStyle = isAtomA ? '#38bdf8' : '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "JetBrains Mono"';
        ctx.fillText(`${el.symbol}⁺`, x, y + 4);
      }
    }

    // Flowing delocalized sea electrons
    for (let e = 0; e < 18; e++) {
      const ex = cx - 190 + ((e * 47 + t * 55) % 380);
      const ey = cy + 12 + Math.sin(t * 2.5 + e) * 62;
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(ex, ey, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px "JetBrains Mono"';
    ctx.fillText(
      'Delocalized Conduction Electron Sea Flowing Around Positive Metal Cations',
      cx,
      canvas.height - 20
    );
  } else {
    // Noble Gas Inert
    drawAtomBohrShells(ctx, leftCenter.x, leftCenter.y, elA, '#38bdf8', t, 0);
    drawAtomBohrShells(ctx, rightCenter.x, rightCenter.y, elB, '#a855f7', -t, 0);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px "JetBrains Mono"';
    ctx.fillText('CLOSED VALENCE SHELLS — NO ELECTRON TRANSFER OR SHARING', cx, canvas.height - 20);
  }

  ctx.textAlign = 'left';
}

function drawAtomBohrShells(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  el: ElementData,
  color: string,
  timeAngle: number,
  chargeDelta = 0,
  overlapMode = false
) {
  const maxRadius = overlapMode ? 90 : 84;
  const numShells = Math.min(4, el.shells.length);

  // Nucleus
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#020617';
  ctx.font = 'bold 12px "JetBrains Mono"';
  ctx.fillText(el.symbol, x, y + 4);

  // Concentric shells (up to 4 visible rings, always showing outermost valence shell)
  for (let s = 0; s < numShells; s++) {
    const isOuter = s === numShells - 1;
    const r = 32 + ((s + 1) / numShells) * (maxRadius - 32);

    ctx.strokeStyle = isOuter ? color : 'rgba(148, 163, 184, 0.28)';
    ctx.lineWidth = isOuter ? 1.6 : 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();

    const eCount = isOuter
      ? Math.max(0, Math.min(8, el.valenceElectrons))
      : Math.min(8, el.shells[s]);

    for (let e = 0; e < eCount; e++) {
      const ang = (e / Math.max(1, eCount)) * Math.PI * 2 + timeAngle * (isOuter ? 0.8 : 0.4);
      const ex = x + Math.cos(ang) * r;
      const ey = y + Math.sin(ang) * r;

      ctx.fillStyle = isOuter ? color : '#64748b';
      ctx.beginPath();
      ctx.arc(ex, ey, isOuter ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Label below atom
  if (!overlapMode) {
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px "Plus Jakarta Sans"';
    ctx.fillText(`${el.name} (${el.valenceElectrons} valence e⁻)`, x, y + maxRadius + 18);
  }
}

// --- Canvas Renderer 2: Lewis Electron-Dot Structure ---
function drawLewisStructureCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  _t: number,
  bond: BondAnalysisResult
) {
  const { elA, elB, valA, valB, bondType, formulaDisplay, bondOrder } = bond;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2 + 15;

  // Top Header Box
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fillRect(20, 16, canvas.width - 40, 52);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(20, 16, canvas.width - 40, 52);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px "Syne", sans-serif';
  ctx.fillText(`LEWIS ELECTRON-DOT REPRESENTATION: ${formulaDisplay} (${bond.compoundName})`, 32, 36);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px "JetBrains Mono"';
  ctx.fillText(
    `${elA.symbol} Valence e⁻ = ${elA.valenceElectrons} (•)   |   ${elB.symbol} Valence e⁻ = ${elB.valenceElectrons} (×)   |   ${bond.bondTypeLabel}`,
    32,
    54
  );

  ctx.textAlign = 'center';

  if (bondType === 'ionic') {
    const aIsDonor = isMetalCategory(elA.category) || (bond.enA ?? 1) <= (bond.enB ?? 2);
    const cation = aIsDonor ? elA : elB;
    const anion = aIsDonor ? elB : elA;
    const catVal = aIsDonor ? valA : valB;
    const anVal = aIsDonor ? valB : valA;
    const catCount = aIsDonor ? bond.countA : bond.countB;
    const anCount = aIsDonor ? bond.countB : bond.countA;

    // Cation Bracket Box
    const leftX = cx - 135;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(leftX - 55, cy - 45, 110, 90);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px "JetBrains Mono"';
    ctx.fillText(`${catCount > 1 ? catCount : ''}${cation.symbol}`, leftX, cy + 10);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px "JetBrains Mono"';
    ctx.fillText(`${catVal > 1 ? catVal : ''}+`, leftX + 68, cy - 32);

    // Anion Bracket Box with 8 valence dots
    const rightX = cx + 135;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(rightX - 55, cy - 45, 110, 90);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px "JetBrains Mono"';
    ctx.fillText(`${anion.symbol}`, rightX, cy + 10);

    if (anCount > 1) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 22px "JetBrains Mono"';
      ctx.fillText(`${anCount}`, rightX - 72, cy + 8);
    }

    // 8 Octet dots around Anion
    const dotOffsets = [
      [-8, -30],
      [8, -30],
      [-8, 30],
      [8, 30],
      [-34, -8],
      [-34, 8],
      [34, -8],
      [34, 8]
    ];
    const maxDots = anion.number === 1 ? 2 : 8;
    for (let i = 0; i < maxDots; i++) {
      const [dx, dy] = dotOffsets[i];
      ctx.fillStyle = i < anVal ? '#38bdf8' : '#fbbf24';
      ctx.beginPath();
      ctx.arc(rightX + dx, cy + dy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px "JetBrains Mono"';
    ctx.fillText(`${anVal > 1 ? anVal : ''}−`, rightX + 68, cy - 32);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "JetBrains Mono"';
    ctx.fillText(
      `Cyan dots (•) = ${anVal}e⁻ transferred from ${cation.symbol} to complete ${anion.symbol}'s valence shell`,
      cx,
      canvas.height - 22
    );
  } else if (bondType === 'polar_covalent' || bondType === 'nonpolar_covalent') {
    const leftX = cx - 90;
    const rightX = cx + 90;

    // Atom A Symbol
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 34px "JetBrains Mono"';
    ctx.fillText(elA.symbol, leftX, cy + 12);

    // Atom B Symbol
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 34px "JetBrains Mono"';
    ctx.fillText(elB.symbol, rightX, cy + 12);

    // Draw covalent bond lines & shared electron pairs between A and B
    const lines = Math.min(3, Math.max(1, bondOrder));
    for (let l = 0; l < lines; l++) {
      const ly = cy + (l - (lines - 1) / 2) * 16;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(leftX + 36, ly);
      ctx.lineTo(rightX - 36, ly);
      ctx.stroke();

      // Shared electron pair dots on the bond line
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx - 10, ly, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx + 10, ly, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Remaining non-bonding valence electrons on A and B
    const remA = Math.max(0, Math.min(6, elA.valenceElectrons - lines));
    const remB = Math.max(0, Math.min(6, elB.valenceElectrons - lines));

    const lonePositionsA = [
      [-36, -8],
      [-36, 8],
      [-8, -32],
      [8, -32],
      [-8, 34],
      [8, 34]
    ];
    for (let i = 0; i < remA; i++) {
      const [dx, dy] = lonePositionsA[i];
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(leftX + dx, cy + dy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    const lonePositionsB = [
      [36, -8],
      [36, 8],
      [-8, -32],
      [8, -32],
      [-8, 34],
      [8, 34]
    ];
    for (let i = 0; i < remB; i++) {
      const [dx, dy] = lonePositionsB[i];
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(rightX + dx, cy + dy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px "JetBrains Mono"';
    ctx.fillText(
      `Formula: ${formulaDisplay}   |   Bond Order: ${lines} (${lines === 3 ? 'Triple' : lines === 2 ? 'Double' : 'Single'} Covalent Bond)`,
      cx,
      canvas.height - 22
    );
  } else {
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 20px "JetBrains Mono"';
    ctx.fillText(`${elA.symbol}   +   ${elB.symbol}   ⟶   ${formulaDisplay}`, cx, cy);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px "JetBrains Mono"';
    ctx.fillText(bond.mechanismSummary.slice(0, 95) + '...', cx, cy + 40);
  }

  ctx.textAlign = 'left';
}
