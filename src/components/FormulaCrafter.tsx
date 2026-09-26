import React, { useState, useMemo } from 'react';
import {
  Atom,
  Sparkles,
  CheckCircle2,
  FileText,
  RotateCcw,
  ArrowRight,
  Layers,
  FlaskConical,
  Scale,
  Plus,
  Check
} from 'lucide-react';
import { ELEMENTS_DATA } from '../data/elementsData';

interface FormulaCrafterProps {
  onAddNote: (
    title: string,
    subject: 'Chemistry',
    content: string,
    tags: string[],
    labRef: string
  ) => void;
}

export interface CationSpecies {
  id: string;
  symbol: string;
  displayCharge: string;
  name: string;
  valency: number;
  isPolyatomic: boolean;
  category: 'Monovalent (+1)' | 'Divalent (+2)' | 'Trivalent (+3)' | 'Tetravalent & Higher (+4/+5/+6)';
  atoms: Record<string, number>;
}

export interface AnionSpecies {
  id: string;
  symbol: string;
  displayCharge: string;
  name: string;
  valency: number;
  isPolyatomic: boolean;
  category: 'Monoatomic Anions' | 'Polyatomic Ions (-1)' | 'Polyatomic Ions (-2)' | 'Polyatomic Ions (-3)';
  atoms: Record<string, number>;
  structureNote?: string;
}

const CATION_LIST: CationSpecies[] = [
  // Monovalent (+1)
  { id: 'H_1', symbol: 'H', displayCharge: 'H⁺', name: 'Hydrogen', valency: 1, isPolyatomic: false, category: 'Monovalent (+1)', atoms: { H: 1 } },
  { id: 'Li_1', symbol: 'Li', displayCharge: 'Li⁺', name: 'Lithium', valency: 1, isPolyatomic: false, category: 'Monovalent (+1)', atoms: { Li: 1 } },
  { id: 'Na_1', symbol: 'Na', displayCharge: 'Na⁺', name: 'Sodium', valency: 1, isPolyatomic: false, category: 'Monovalent (+1)', atoms: { Na: 1 } },
  { id: 'K_1', symbol: 'K', displayCharge: 'K⁺', name: 'Potassium', valency: 1, isPolyatomic: false, category: 'Monovalent (+1)', atoms: { K: 1 } },
  { id: 'Ag_1', symbol: 'Ag', displayCharge: 'Ag⁺', name: 'Silver(I)', valency: 1, isPolyatomic: false, category: 'Monovalent (+1)', atoms: { Ag: 1 } },
  { id: 'Cu_1', symbol: 'Cu', displayCharge: 'Cu⁺', name: 'Copper(I) (Cuprous)', valency: 1, isPolyatomic: false, category: 'Monovalent (+1)', atoms: { Cu: 1 } },
  { id: 'NH4_1', symbol: 'NH₄', displayCharge: 'NH₄⁺', name: 'Ammonium (Polyatomic)', valency: 1, isPolyatomic: true, category: 'Monovalent (+1)', atoms: { N: 1, H: 4 } },

  // Divalent (+2)
  { id: 'Mg_2', symbol: 'Mg', displayCharge: 'Mg²⁺', name: 'Magnesium', valency: 2, isPolyatomic: false, category: 'Divalent (+2)', atoms: { Mg: 1 } },
  { id: 'Ca_2', symbol: 'Ca', displayCharge: 'Ca²⁺', name: 'Calcium', valency: 2, isPolyatomic: false, category: 'Divalent (+2)', atoms: { Ca: 1 } },
  { id: 'Ba_2', symbol: 'Ba', displayCharge: 'Ba²⁺', name: 'Barium', valency: 2, isPolyatomic: false, category: 'Divalent (+2)', atoms: { Ba: 1 } },
  { id: 'Zn_2', symbol: 'Zn', displayCharge: 'Zn²⁺', name: 'Zinc', valency: 2, isPolyatomic: false, category: 'Divalent (+2)', atoms: { Zn: 1 } },
  { id: 'Cu_2', symbol: 'Cu', displayCharge: 'Cu²⁺', name: 'Copper(II) (Cupric)', valency: 2, isPolyatomic: false, category: 'Divalent (+2)', atoms: { Cu: 1 } },
  { id: 'Fe_2', symbol: 'Fe', displayCharge: 'Fe²⁺', name: 'Iron(II) (Ferrous)', valency: 2, isPolyatomic: false, category: 'Divalent (+2)', atoms: { Fe: 1 } },
  { id: 'Pb_2', symbol: 'Pb', displayCharge: 'Pb²⁺', name: 'Lead(II) (Plumbous)', valency: 2, isPolyatomic: false, category: 'Divalent (+2)', atoms: { Pb: 1 } },
  { id: 'Mn_2', symbol: 'Mn', displayCharge: 'Mn²⁺', name: 'Manganese(II)', valency: 2, isPolyatomic: false, category: 'Divalent (+2)', atoms: { Mn: 1 } },

  // Trivalent (+3)
  { id: 'Al_3', symbol: 'Al', displayCharge: 'Al³⁺', name: 'Aluminium', valency: 3, isPolyatomic: false, category: 'Trivalent (+3)', atoms: { Al: 1 } },
  { id: 'Fe_3', symbol: 'Fe', displayCharge: 'Fe³⁺', name: 'Iron(III) (Ferric)', valency: 3, isPolyatomic: false, category: 'Trivalent (+3)', atoms: { Fe: 1 } },
  { id: 'Cr_3', symbol: 'Cr', displayCharge: 'Cr³⁺', name: 'Chromium(III)', valency: 3, isPolyatomic: false, category: 'Trivalent (+3)', atoms: { Cr: 1 } },
  { id: 'B_3', symbol: 'B', displayCharge: 'B³⁺', name: 'Boron', valency: 3, isPolyatomic: false, category: 'Trivalent (+3)', atoms: { B: 1 } },
  { id: 'P_3', symbol: 'P', displayCharge: 'P³⁺', name: 'Phosphorus(III)', valency: 3, isPolyatomic: false, category: 'Trivalent (+3)', atoms: { P: 1 } },

  // Tetravalent & Higher (+4/+5/+6)
  { id: 'C_4', symbol: 'C', displayCharge: 'C⁴⁺', name: 'Carbon(IV)', valency: 4, isPolyatomic: false, category: 'Tetravalent & Higher (+4/+5/+6)', atoms: { C: 1 } },
  { id: 'Si_4', symbol: 'Si', displayCharge: 'Si⁴⁺', name: 'Silicon(IV)', valency: 4, isPolyatomic: false, category: 'Tetravalent & Higher (+4/+5/+6)', atoms: { Si: 1 } },
  { id: 'Sn_4', symbol: 'Sn', displayCharge: 'Sn⁴⁺', name: 'Tin(IV) (Stannic)', valency: 4, isPolyatomic: false, category: 'Tetravalent & Higher (+4/+5/+6)', atoms: { Sn: 1 } },
  { id: 'S_4', symbol: 'S', displayCharge: 'S⁴⁺', name: 'Sulfur(IV)', valency: 4, isPolyatomic: false, category: 'Tetravalent & Higher (+4/+5/+6)', atoms: { S: 1 } },
  { id: 'P_5', symbol: 'P', displayCharge: 'P⁵⁺', name: 'Phosphorus(V)', valency: 5, isPolyatomic: false, category: 'Tetravalent & Higher (+4/+5/+6)', atoms: { P: 1 } },
  { id: 'S_6', symbol: 'S', displayCharge: 'S⁶⁺', name: 'Sulfur(VI)', valency: 6, isPolyatomic: false, category: 'Tetravalent & Higher (+4/+5/+6)', atoms: { S: 1 } }
];

const ANION_LIST: AnionSpecies[] = [
  // Monoatomic Anions
  { id: 'Cl_1', symbol: 'Cl', displayCharge: 'Cl⁻', name: 'Chloride', valency: 1, isPolyatomic: false, category: 'Monoatomic Anions', atoms: { Cl: 1 } },
  { id: 'F_1', symbol: 'F', displayCharge: 'F⁻', name: 'Fluoride', valency: 1, isPolyatomic: false, category: 'Monoatomic Anions', atoms: { F: 1 } },
  { id: 'Br_1', symbol: 'Br', displayCharge: 'Br⁻', name: 'Bromide', valency: 1, isPolyatomic: false, category: 'Monoatomic Anions', atoms: { Br: 1 } },
  { id: 'I_1', symbol: 'I', displayCharge: 'I⁻', name: 'Iodide', valency: 1, isPolyatomic: false, category: 'Monoatomic Anions', atoms: { I: 1 } },
  { id: 'O_2', symbol: 'O', displayCharge: 'O²⁻', name: 'Oxide', valency: 2, isPolyatomic: false, category: 'Monoatomic Anions', atoms: { O: 1 } },
  { id: 'S_2', symbol: 'S', displayCharge: 'S²⁻', name: 'Sulfide', valency: 2, isPolyatomic: false, category: 'Monoatomic Anions', atoms: { S: 1 } },
  { id: 'N_3', symbol: 'N', displayCharge: 'N³⁻', name: 'Nitride', valency: 3, isPolyatomic: false, category: 'Monoatomic Anions', atoms: { N: 1 } },
  { id: 'P_3_an', symbol: 'P', displayCharge: 'P³⁻', name: 'Phosphide', valency: 3, isPolyatomic: false, category: 'Monoatomic Anions', atoms: { P: 1 } },

  // Polyatomic Ions (-1)
  { id: 'OH_1', symbol: 'OH', displayCharge: 'OH⁻', name: 'Hydroxide', valency: 1, isPolyatomic: true, category: 'Polyatomic Ions (-1)', atoms: { O: 1, H: 1 }, structureNote: 'Diatomic anion with oxygen covalently bonded to hydrogen' },
  { id: 'NO3_1', symbol: 'NO₃', displayCharge: 'NO₃⁻', name: 'Nitrate', valency: 1, isPolyatomic: true, category: 'Polyatomic Ions (-1)', atoms: { N: 1, O: 3 }, structureNote: 'Trigonal planar resonance-stabilized oxoanion' },
  { id: 'NO2_1', symbol: 'NO₂', displayCharge: 'NO₂⁻', name: 'Nitrite', valency: 1, isPolyatomic: true, category: 'Polyatomic Ions (-1)', atoms: { N: 1, O: 2 }, structureNote: 'Bent oxoanion of nitrogen(III)' },
  { id: 'HCO3_1', symbol: 'HCO₃', displayCharge: 'HCO₃⁻', name: 'Hydrogen Carbonate (Bicarbonate)', valency: 1, isPolyatomic: true, category: 'Polyatomic Ions (-1)', atoms: { H: 1, C: 1, O: 3 }, structureNote: 'Amphoteric polyatomic ion central to blood pH buffering and baking soda' },
  { id: 'HSO4_1', symbol: 'HSO₄', displayCharge: 'HSO₄⁻', name: 'Hydrogen Sulfate (Bisulfate)', valency: 1, isPolyatomic: true, category: 'Polyatomic Ions (-1)', atoms: { H: 1, S: 1, O: 4 } },
  { id: 'CH3COO_1', symbol: 'CH₃COO', displayCharge: 'CH₃COO⁻', name: 'Acetate (Ethanoate)', valency: 1, isPolyatomic: true, category: 'Polyatomic Ions (-1)', atoms: { C: 2, H: 3, O: 2 } },
  { id: 'MnO4_1', symbol: 'MnO₄', displayCharge: 'MnO₄⁻', name: 'Permanganate', valency: 1, isPolyatomic: true, category: 'Polyatomic Ions (-1)', atoms: { Mn: 1, O: 4 }, structureNote: 'Deep purple tetrahedral oxidizing oxoanion (Mn in +7 state)' },
  { id: 'ClO3_1', symbol: 'ClO₃', displayCharge: 'ClO₃⁻', name: 'Chlorate', valency: 1, isPolyatomic: true, category: 'Polyatomic Ions (-1)', atoms: { Cl: 1, O: 3 } },
  { id: 'CN_1', symbol: 'CN', displayCharge: 'CN⁻', name: 'Cyanide', valency: 1, isPolyatomic: true, category: 'Polyatomic Ions (-1)', atoms: { C: 1, N: 1 } },
  { id: 'AlO2_1', symbol: 'AlO₂', displayCharge: 'AlO₂⁻', name: 'Aluminate', valency: 1, isPolyatomic: true, category: 'Polyatomic Ions (-1)', atoms: { Al: 1, O: 2 } },

  // Polyatomic Ions (-2)
  { id: 'SO4_2', symbol: 'SO₄', displayCharge: 'SO₄²⁻', name: 'Sulfate', valency: 2, isPolyatomic: true, category: 'Polyatomic Ions (-2)', atoms: { S: 1, O: 4 }, structureNote: 'Tetrahedral oxoanion with sulfur in +6 oxidation state' },
  { id: 'SO3_2', symbol: 'SO₃', displayCharge: 'SO₃²⁻', name: 'Sulfite', valency: 2, isPolyatomic: true, category: 'Polyatomic Ions (-2)', atoms: { S: 1, O: 3 }, structureNote: 'Trigonal pyramidal oxoanion with sulfur in +4 state' },
  { id: 'CO3_2', symbol: 'CO₃', displayCharge: 'CO₃²⁻', name: 'Carbonate', valency: 2, isPolyatomic: true, category: 'Polyatomic Ions (-2)', atoms: { C: 1, O: 3 }, structureNote: 'Trigonal planar oxoanion present in limestone, marble, and washing soda' },
  { id: 'Cr2O7_2', symbol: 'Cr₂O₇', displayCharge: 'Cr₂O₇²⁻', name: 'Dichromate', valency: 2, isPolyatomic: true, category: 'Polyatomic Ions (-2)', atoms: { Cr: 2, O: 7 }, structureNote: 'Bright orange oxidizing anion with two corner-sharing CrO₄ tetrahedra' },
  { id: 'CrO4_2', symbol: 'CrO₄', displayCharge: 'CrO₄²⁻', name: 'Chromate', valency: 2, isPolyatomic: true, category: 'Polyatomic Ions (-2)', atoms: { Cr: 1, O: 4 } },
  { id: 'ZnO2_2', symbol: 'ZnO₂', displayCharge: 'ZnO₂²⁻', name: 'Zincate', valency: 2, isPolyatomic: true, category: 'Polyatomic Ions (-2)', atoms: { Zn: 1, O: 2 } },
  { id: 'SiO3_2', symbol: 'SiO₃', displayCharge: 'SiO₃²⁻', name: 'Silicate', valency: 2, isPolyatomic: true, category: 'Polyatomic Ions (-2)', atoms: { Si: 1, O: 3 } },
  { id: 'C2O4_2', symbol: 'C₂O₄', displayCharge: 'C₂O₄²⁻', name: 'Oxalate', valency: 2, isPolyatomic: true, category: 'Polyatomic Ions (-2)', atoms: { C: 2, O: 4 } },

  // Polyatomic Ions (-3)
  { id: 'PO4_3', symbol: 'PO₄', displayCharge: 'PO₄³⁻', name: 'Phosphate', valency: 3, isPolyatomic: true, category: 'Polyatomic Ions (-3)', atoms: { P: 1, O: 4 }, structureNote: 'Tetrahedral oxoanion essential to DNA backbone, ATP, and bone mineral' },
  { id: 'PO3_3', symbol: 'PO₃', displayCharge: 'PO₃³⁻', name: 'Phosphite', valency: 3, isPolyatomic: true, category: 'Polyatomic Ions (-3)', atoms: { P: 1, O: 3 } }
];

const HYDRATE_OPTIONS = [
  { value: 0, label: 'Anhydrous (0 H₂O)', suffix: '' },
  { value: 0.5, label: '·½H₂O (Hemihydrate)', suffix: '·½H₂O' },
  { value: 2, label: '·2H₂O (Dihydrate)', suffix: '·2H₂O' },
  { value: 5, label: '·5H₂O (Pentahydrate)', suffix: '·5H₂O' },
  { value: 7, label: '·7H₂O (Heptahydrate)', suffix: '·7H₂O' },
  { value: 10, label: '·10H₂O (Decahydrate)', suffix: '·10H₂O' }
];

const COMMON_COMPOUND_METADATA: Record<
  string,
  { commonName: string; ncertFact: string; compoundClass: string }
> = {
  H2O: {
    commonName: 'Water (Universal Solvent)',
    compoundClass: 'Neutral Polar Covalent Oxide',
    ncertFact: 'Pure water has a neutral pH of 7.0 at 298 K and exhibits strong intermolecular hydrogen bonding.'
  },
  HCl: {
    commonName: 'Hydrochloric Acid / Hydrogen Chloride',
    compoundClass: 'Strong Monoprotic Mineral Acid',
    ncertFact: 'Secreted by gastric parietal cells in the stomach (pH ~1.8) to activate pepsinogen into pepsin.'
  },
  H2SO4: {
    commonName: 'Sulfuric Acid (Oil of Vitriol / King of Chemicals)',
    compoundClass: 'Strong Diprotic Acid & Dehydrating Agent',
    ncertFact: 'Manufactured industrially by the Contact Process; dilution is highly exothermic (always add acid to water!).'
  },
  HNO3: {
    commonName: 'Nitric Acid (Aqua Fortis)',
    compoundClass: 'Strong Oxidizing Mineral Acid',
    ncertFact: 'Mixed with HCl in a 1:3 molar ratio to form Aqua Regia, which dissolves noble metals like Gold and Platinum.'
  },
  H2CO3: {
    commonName: 'Carbonic Acid',
    compoundClass: 'Weak Diprotic Acid',
    ncertFact: 'Formed when CO₂ dissolves in water under pressure in carbonated beverages and blood plasma.'
  },
  H3PO4: {
    commonName: 'Orthophosphoric Acid',
    compoundClass: 'Triprotic Weak Acid',
    ncertFact: 'Has a basicity of 3 because all three hydrogen atoms are attached to oxygen atoms (-OH groups).'
  },
  CH3COOH: {
    commonName: 'Acetic Acid (Ethanoic Acid / Vinegar)',
    compoundClass: 'Weak Carboxylic Acid',
    ncertFact: 'A 5–8% aqueous solution of ethanoic acid is called vinegar; pure ethanoic acid freezes at 290 K (Glacial Acetic Acid).'
  },
  NaOH: {
    commonName: 'Caustic Soda (Sodium Hydroxide)',
    compoundClass: 'Strong Alkali (Deliquescent Base)',
    ncertFact: 'Produced via the Chlor-Alkali process (electrolysis of aqueous NaCl brine) alongside Cl₂ and H₂.'
  },
  KOH: {
    commonName: 'Caustic Potash (Potassium Hydroxide)',
    compoundClass: 'Strong Alkali',
    ncertFact: 'Used in laboratories to absorb CO₂ gas and manufacture soft bathing soaps.'
  },
  'Ca(OH)2': {
    commonName: 'Slaked Lime (Limewater)',
    compoundClass: 'Sparingly Soluble Diacidic Base',
    ncertFact: 'Turns milky when CO₂ is passed through it due to precipitation of white CaCO₃; used to make Bleaching Powder.'
  },
  'Mg(OH)2': {
    commonName: 'Milk of Magnesia',
    compoundClass: 'Mild Antacid Base',
    ncertFact: 'Used medically as an antacid to neutralize excess stomach HCl without harming the gastric mucosa.'
  },
  NH4OH: {
    commonName: 'Ammonia Solution (Ammonium Hydroxide)',
    compoundName: 'Weak Base',
    compoundClass: 'Weak Aqueous Alkali',
    ncertFact: 'Precipitates reddish-brown Fe(OH)₃ and gelatinous white Al(OH)₃ in qualitative salt analysis.'
  } as any,
  NaCl: {
    commonName: 'Common Rock Salt (Table Salt)',
    compoundClass: 'Neutral Ionic Halide Salt',
    ncertFact: 'Essential raw material for making NaOH, Baking Soda (NaHCO₃), Washing Soda (Na₂CO₃·10H₂O), and Bleaching Powder.'
  },
  NaHCO3: {
    commonName: 'Baking Soda (Sodium Hydrogen Carbonate)',
    compoundClass: 'Mild Non-Corrosive Basic Salt',
    ncertFact: 'Prepared by the Solvay process; decomposes on heating (2NaHCO₃ → Na₂CO₃ + H₂O + CO₂↑) to make cakes fluffy.'
  },
  Na2CO3: {
    commonName: 'Soda Ash (Anhydrous Sodium Carbonate)',
    compoundClass: 'Basic Carbonate Salt',
    ncertFact: 'Used in glass, soap, and paper industries and for removing permanent hardness of water.'
  },
  'Na2CO3·10H2O': {
    commonName: 'Washing Soda (Sodium Carbonate Decahydrate)',
    compoundClass: 'Hydrated Basic Salt',
    ncertFact: 'Contains 10 molecules of water of crystallization; loses 9 H₂O molecules on exposure to air (efflorescence).'
  },
  CaCO3: {
    commonName: 'Limestone / Chalk / Marble',
    compoundClass: 'Insoluble Carbonate Salt',
    ncertFact: 'Undergoes thermal decomposition at ~1200 K into Quicklime (CaO) and CO₂ for cement manufacturing.'
  },
  CaO: {
    commonName: 'Quicklime (Burnt Lime)',
    compoundClass: 'Basic Metal Oxide',
    ncertFact: 'Reacts vigorously and exothermically with water (slaking of lime) to form Slaked Lime Ca(OH)₂.'
  },
  'CaSO4·2H2O': {
    commonName: 'Gypsum (Calcium Sulfate Dihydrate)',
    compoundClass: 'Hydrated Calcium Salt',
    ncertFact: 'When heated carefully at 373 K (100°C), it loses 1.5 molecules of water to form Plaster of Paris!'
  },
  'CaSO4·½H2O': {
    commonName: 'Plaster of Paris (POP)',
    compoundClass: 'Hemihydrate Calcium Salt',
    ncertFact: 'Sets into a hard solid mass of Gypsum within 15 minutes when mixed with water; used for setting fractured bones.'
  },
  'CuSO4·5H2O': {
    commonName: 'Blue Vitriol (Copper(II) Sulfate Pentahydrate)',
    compoundClass: 'Hydrated Transition Metal Salt',
    ncertFact: 'Deep blue crystals turn white (anhydrous CuSO₄) upon heating and regain blue color when drops of water are added.'
  },
  'FeSO4·7H2O': {
    commonName: 'Green Vitriol (Iron(II) Sulfate Heptahydrate)',
    compoundClass: 'Hydrated Ferrous Salt',
    ncertFact: 'Light green crystals decompose on heating into reddish-brown Fe₂O₃ with the smell of burning sulfur (SO₂ + SO₃).'
  },
  'MgSO4·7H2O': {
    commonName: 'Epsom Salt (Magnesium Sulfate Heptahydrate)',
    compoundClass: 'Hydrated Ionic Salt',
    ncertFact: 'Highly water-soluble hydrated salt used in medicine and agriculture.'
  },
  KMnO4: {
    commonName: 'Potassium Permanganate (Condy’s Crystals)',
    compoundClass: 'Strong Oxidizing Agent',
    ncertFact: 'Purple crystals that oxidize ethanol to ethanoic acid and decolorize in the presence of unsaturated alkenes/alkynes.'
  },
  K2Cr2O7: {
    commonName: 'Potassium Dichromate',
    compoundClass: 'Acidified Oxidizing Agent',
    ncertFact: 'Orange solution turns emerald green (Cr³⁺) when reducing agents like SO₂ or primary alcohols are oxidized.'
  },
  AgNO3: {
    commonName: 'Lunar Caustic (Silver Nitrate)',
    compoundClass: 'Photosensitive Heavy Metal Salt',
    ncertFact: 'Stored in dark amber bottles; forms curdy white AgCl precipitate with chloride ions.'
  },
  'Al2(SO4)3': {
    commonName: 'Aluminium Sulfate (Papermaker’s Alum)',
    compoundClass: 'Polyatomic Trivalent Salt',
    ncertFact: 'Classic NCERT example of valency criss-cross: Al³⁺ (+3) and SO₄²⁻ (-2) cross to give Al₂(SO₄)₃ (Atomicity = 17).'
  },
  '(NH4)2SO4': {
    commonName: 'Ammonium Sulfate',
    compoundClass: 'Double-Polyatomic Nitrogenous Fertilizer Salt',
    ncertFact: 'Contains both a polyatomic cation (NH₄⁺) and a polyatomic anion (SO₄²⁻), requiring brackets around NH₄.'
  },
  'Ca3(PO4)2': {
    commonName: 'Tricalcium Phosphate (Bone Ash)',
    compoundClass: 'Biomineral Phosphate Salt',
    ncertFact: 'Derivative of hydroxyapatite that makes up vertebrate tooth enamel (the hardest substance in the human body).'
  },
  CO2: {
    commonName: 'Carbon Dioxide (Dry Ice in solid state)',
    compoundClass: 'Acidic Non-Metal Oxide',
    ncertFact: 'Linear molecule (O=C=O) that turns limewater milky and is fixed into glucose during the Calvin cycle.'
  },
  SO2: {
    commonName: 'Sulfur Dioxide',
    compoundClass: 'Acidic Oxide & Reducing Gas',
    ncertFact: 'Pungent gas that turns acidified potassium dichromate paper from orange to green.'
  },
  SO3: {
    commonName: 'Sulfur Trioxide',
    compoundClass: 'Acidic Oxide (Sulfuric Anhydride)',
    ncertFact: 'Dissolves in concentrated H₂SO₄ to form Oleum (H₂S₂O₇) in the Contact Process.'
  },
  P2O5: {
    commonName: 'Phosphorus Pentoxide',
    compoundClass: 'Powerful Dehydrating Acidic Oxide',
    ncertFact: 'Exists as a dimer (P₄O₁₀) and strips water molecules even from nitric acid.'
  }
};

export interface CompoundSynthesisRecipe {
  id: string;
  reactantA: { formula: string; name: string; type: string };
  reactantB: { formula: string; name: string; type: string };
  reactantC?: { formula: string; name: string; type: string };
  productFormula: string;
  productName: string;
  commonName: string;
  balancedEquation: string;
  reactionType: string;
  atoms: Record<string, number>;
  explanation: string;
}

const COMPOUND_SYNTHESIS_RECIPES: CompoundSynthesisRecipe[] = [
  {
    id: 'slaked_lime',
    reactantA: { formula: 'CaO', name: 'Calcium Oxide (Quicklime)', type: 'Basic Oxide' },
    reactantB: { formula: 'H₂O', name: 'Water', type: 'Oxide' },
    productFormula: 'Ca(OH)₂',
    productName: 'Calcium Hydroxide',
    commonName: 'Slaked Lime',
    balancedEquation: 'CaO(s) + H₂O(l) → Ca(OH)₂(aq) + Heat',
    reactionType: 'Exothermic Combination (Slaking of Lime)',
    atoms: { Ca: 1, O: 2, H: 2 },
    explanation: 'Quicklime (CaO) combines vigorously with water to craft Calcium Hydroxide Ca(OH)₂, releasing substantial thermal energy.'
  },
  {
    id: 'bleaching_powder',
    reactantA: { formula: 'Ca(OH)₂', name: 'Dry Slaked Lime', type: 'Base' },
    reactantB: { formula: 'Cl₂', name: 'Chlorine Gas', type: 'Halogen Element' },
    productFormula: 'CaOCl₂',
    productName: 'Calcium Oxychloride',
    commonName: 'Bleaching Powder',
    balancedEquation: 'Ca(OH)₂(s) + Cl₂(g) → CaOCl₂(s) + H₂O(l)',
    reactionType: 'Industrial Halogenation Synthesis',
    atoms: { Ca: 1, O: 1, Cl: 2 },
    explanation: 'Passing chlorine gas over dry slaked lime crafts Bleaching Powder (CaOCl₂), used for disinfecting drinking water and bleaching cotton.'
  },
  {
    id: 'sulfuric_acid',
    reactantA: { formula: 'SO₃', name: 'Sulfur Trioxide', type: 'Acidic Oxide' },
    reactantB: { formula: 'H₂O', name: 'Water', type: 'Oxide' },
    productFormula: 'H₂SO₄',
    productName: 'Sulfuric Acid',
    commonName: 'Oil of Vitriol',
    balancedEquation: 'SO₃(g) + H₂O(l) → H₂SO₄(aq)',
    reactionType: 'Acidic Oxide Hydration',
    atoms: { H: 2, S: 1, O: 4 },
    explanation: 'Sulfur trioxide (acidic non-metal oxide) joins with water to craft diprotic Sulfuric Acid (H₂SO₄).'
  },
  {
    id: 'carbonic_acid',
    reactantA: { formula: 'CO₂', name: 'Carbon Dioxide', type: 'Acidic Oxide' },
    reactantB: { formula: 'H₂O', name: 'Water', type: 'Oxide' },
    productFormula: 'H₂CO₃',
    productName: 'Carbonic Acid',
    commonName: 'Soda Water Acid',
    balancedEquation: 'CO₂(g) + H₂O(l) ⇌ H₂CO₃(aq)',
    reactionType: 'Reversible Hydration Synthesis',
    atoms: { H: 2, C: 1, O: 3 },
    explanation: 'Carbon dioxide dissolves in water to form weak diprotic Carbonic Acid (H₂CO₃), donating H⁺ and HCO₃⁻ ions.'
  },
  {
    id: 'ammonium_chloride',
    reactantA: { formula: 'NH₃', name: 'Ammonia Gas', type: 'Covalent Base' },
    reactantB: { formula: 'HCl', name: 'Hydrogen Chloride', type: 'Acid Gas' },
    productFormula: 'NH₄Cl',
    productName: 'Ammonium Chloride',
    commonName: 'Sal Ammoniac (Sublimable Salt)',
    balancedEquation: 'NH₃(g) + HCl(g) → NH₄Cl(s)',
    reactionType: 'Acid-Base Coordinate Covalent Combination',
    atoms: { N: 1, H: 4, Cl: 1 },
    explanation: 'Nitrogen’s lone pair in NH₃ forms a coordinate (dative) bond with H⁺ from HCl to create the NH₄⁺ polyatomic ion, paired with Cl⁻.'
  },
  {
    id: 'baking_soda_solvay',
    reactantA: { formula: 'NaCl + NH₃', name: 'Ammoniacal Brine', type: 'Salt + Base' },
    reactantB: { formula: 'CO₂ + H₂O', name: 'Carbon Dioxide & Water', type: 'Oxide Mixture' },
    productFormula: 'NaHCO₃',
    productName: 'Sodium Hydrogen Carbonate',
    commonName: 'Baking Soda (Solvay Process)',
    balancedEquation: 'NaCl + H₂O + CO₂ + NH₃ → NH₄Cl(aq) + NaHCO₃(s)',
    reactionType: 'Solvay Industrial Synthesis',
    atoms: { Na: 1, H: 1, C: 1, O: 3 },
    explanation: 'Carbonating ammoniacal brine precipitates sparingly soluble Sodium Hydrogen Carbonate (NaHCO₃).'
  },
  {
    id: 'calcium_bicarbonate',
    reactantA: { formula: 'CaCO₃', name: 'Calcium Carbonate (Limestone)', type: 'Insoluble Salt' },
    reactantB: { formula: 'CO₂ + H₂O', name: 'Excess Carbon Dioxide & Water', type: 'Acidic Medium' },
    productFormula: 'Ca(HCO₃)₂',
    productName: 'Calcium Hydrogen Carbonate',
    commonName: 'Bicarbonate of Lime (Causes Temporary Hardness)',
    balancedEquation: 'CaCO₃(s) + H₂O(l) + CO₂(g) → Ca(HCO₃)₂(aq)',
    reactionType: 'Carbonate Dissolution Synthesis',
    atoms: { Ca: 1, H: 2, C: 2, O: 6 },
    explanation: 'Passing excess CO₂ through milky limewater dissolves CaCO₃ into colourless, water-soluble Calcium Hydrogen Carbonate Ca(HCO₃)₂.'
  },
  {
    id: 'gypsum_setting',
    reactantA: { formula: 'CaSO₄·½H₂O', name: 'Plaster of Paris (POP)', type: 'Hemihydrate Salt' },
    reactantB: { formula: '1½ H₂O', name: 'Water of Hydration', type: 'Water' },
    productFormula: 'CaSO₄·2H₂O',
    productName: 'Calcium Sulfate Dihydrate',
    commonName: 'Hard Gypsum Crystal Lattice',
    balancedEquation: 'CaSO₄·½H₂O(s) + 1½H₂O(l) → CaSO₄·2H₂O(s)',
    reactionType: 'Rehydration Crystallization',
    atoms: { Ca: 1, S: 1, O: 6, H: 4 },
    explanation: 'Plaster of Paris absorbs 1.5 molecules of water per formula unit to interlock into a rigid orthorhombic crystal network of Gypsum.'
  }
];

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function toSubscript(num: number): string {
  const map: Record<string, string> = {
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
  return String(num)
    .split('')
    .map((ch) => map[ch] || ch)
    .join('');
}

export const FormulaCrafter: React.FC<FormulaCrafterProps> = ({ onAddNote }) => {
  const [crafterMode, setCrafterMode] = useState<'crisscross' | 'synthesis'>('crisscross');
  const [selectedCationId, setSelectedCationId] = useState<string>('Al_3');
  const [selectedAnionId, setSelectedAnionId] = useState<string>('SO4_2');
  const [hydrateWaterCount, setHydrateWaterCount] = useState<number>(0);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(COMPOUND_SYNTHESIS_RECIPES[0].id);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  const activeCation = useMemo(
    () => CATION_LIST.find((c) => c.id === selectedCationId) || CATION_LIST[0],
    [selectedCationId]
  );

  const activeAnion = useMemo(
    () => ANION_LIST.find((a) => a.id === selectedAnionId) || ANION_LIST[0],
    [selectedAnionId]
  );

  const activeRecipe = useMemo(
    () =>
      COMPOUND_SYNTHESIS_RECIPES.find((r) => r.id === selectedRecipeId) ||
      COMPOUND_SYNTHESIS_RECIPES[0],
    [selectedRecipeId]
  );

  // Compute Criss-Cross Formula, Subscripts, Atomicity & Molar Mass
  const craftedResult = useMemo(() => {
    const valA = activeCation.valency;
    const valB = activeAnion.valency;
    const divisor = gcd(valA, valB);

    const subA = valB / divisor;
    const subB = valA / divisor;

    // Special tidy formatting for H+ + OH- => H2O, and CH3COO- + H+/Metal
    let displayFormula = '';
    let plainKey = '';

    if (activeCation.id === 'H_1' && activeAnion.id === 'OH_1') {
      displayFormula = 'H₂O';
      plainKey = 'H2O';
    } else if (activeAnion.id === 'CH3COO_1' && activeCation.id === 'H_1') {
      displayFormula = 'CH₃COOH';
      plainKey = 'CH3COOH';
    } else {
      const catPart =
        subA > 1
          ? activeCation.isPolyatomic
            ? `(${activeCation.symbol})${toSubscript(subA)}`
            : `${activeCation.symbol}${toSubscript(subA)}`
          : activeCation.symbol;

      const anPart =
        subB > 1
          ? activeAnion.isPolyatomic
            ? `(${activeAnion.symbol})${toSubscript(subB)}`
            : `${activeAnion.symbol}${toSubscript(subB)}`
          : activeAnion.symbol;

      const plainCat =
        subA > 1
          ? activeCation.isPolyatomic
            ? `(${activeCation.symbol.replace(/[₀-₉]/g, (m) => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(m)))})${subA}`
            : `${activeCation.symbol}${subA}`
          : activeCation.symbol.replace(/[₀-₉]/g, (m) => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(m)));

      const plainAn =
        subB > 1
          ? activeAnion.isPolyatomic
            ? `(${activeAnion.symbol.replace(/[₀-₉]/g, (m) => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(m)))})${subB}`
            : `${activeAnion.symbol}${subB}`
          : activeAnion.symbol.replace(/[₀-₉]/g, (m) => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(m)));

      displayFormula = `${catPart}${anPart}`;
      plainKey = `${plainCat}${plainAn}`;
    }

    const hydrateOption = HYDRATE_OPTIONS.find((h) => h.value === hydrateWaterCount) || HYDRATE_OPTIONS[0];
    if (hydrateOption.value > 0) {
      displayFormula += hydrateOption.suffix;
      plainKey += hydrateOption.suffix.replace('₂', '2');
    }

    // Aggregate element counts for Atomicity & Molar Mass
    const elementCounts: Record<string, number> = {};
    Object.entries(activeCation.atoms).forEach(([el, count]) => {
      elementCounts[el] = (elementCounts[el] || 0) + count * subA;
    });
    Object.entries(activeAnion.atoms).forEach(([el, count]) => {
      elementCounts[el] = (elementCounts[el] || 0) + count * subB;
    });
    if (hydrateWaterCount > 0) {
      elementCounts.H = (elementCounts.H || 0) + hydrateWaterCount * 2;
      elementCounts.O = (elementCounts.O || 0) + hydrateWaterCount * 1;
    }

    const elementBreakdown = Object.entries(elementCounts).map(([symbol, count]) => {
      const elData = ELEMENTS_DATA.find((e) => e.symbol === symbol);
      const atomicMass = elData?.atomicMass || 16;
      const totalMass = count * atomicMass;
      return {
        symbol,
        name: elData?.name || symbol,
        count,
        atomicMass,
        totalMass
      };
    });

    const totalAtomicity = elementBreakdown.reduce((sum, item) => sum + item.count, 0);
    const totalMolarMass = elementBreakdown.reduce((sum, item) => sum + item.totalMass, 0);

    // Determine systematic IUPAC name
    let iupacName = `${activeCation.name.replace(' (Polyatomic)', '')} ${activeAnion.name}`;
    if (activeCation.id === 'H_1' && activeAnion.id === 'OH_1') {
      iupacName = 'Dihydrogen Monoxide (Water)';
    } else if (activeCation.id === 'H_1') {
      iupacName = `Hydrogen ${activeAnion.name}`;
    }
    if (hydrateWaterCount > 0) {
      const hydrateWord =
        hydrateWaterCount === 0.5
          ? 'Hemihydrate'
          : hydrateWaterCount === 2
          ? 'Dihydrate'
          : hydrateWaterCount === 5
          ? 'Pentahydrate'
          : hydrateWaterCount === 7
          ? 'Heptahydrate'
          : 'Decahydrate';
      iupacName += ` ${hydrateWord}`;
    }

    const knownMeta = COMMON_COMPOUND_METADATA[plainKey];

    return {
      valA,
      valB,
      divisor,
      subA,
      subB,
      displayFormula,
      plainKey,
      iupacName,
      commonName: knownMeta?.commonName || iupacName,
      compoundClass:
        knownMeta?.compoundClass ||
        (activeCation.id === 'H_1'
          ? 'Acid / Covalent Hydride'
          : activeAnion.id === 'OH_1'
          ? 'Metal Hydroxide Base'
          : activeCation.isPolyatomic || activeAnion.isPolyatomic
          ? 'Polyatomic Ionic Salt'
          : 'Binary Ionic / Covalent Compound'),
      ncertFact:
        knownMeta?.ncertFact ||
        `Formed by balancing ${subA} × (${activeCation.displayCharge}) [+${subA * valA}] with ${subB} × (${activeAnion.displayCharge}) [-${subB * valB}] for a net electrical charge of 0.`,
      totalAtomicity,
      totalMolarMass,
      elementBreakdown
    };
  }, [activeCation, activeAnion, hydrateWaterCount]);

  // Preset Quick-Load Famous Formulas
  const famousPresets = [
    { label: 'Al₂(SO₄)₃ · Alum Salt', cat: 'Al_3', an: 'SO4_2', hyd: 0 },
    { label: 'Ca(OH)₂ · Slaked Lime', cat: 'Ca_2', an: 'OH_1', hyd: 0 },
    { label: '(NH₄)₂SO₄ · Fertilizer', cat: 'NH4_1', an: 'SO4_2', hyd: 0 },
    { label: 'NaHCO₃ · Baking Soda', cat: 'Na_1', an: 'HCO3_1', hyd: 0 },
    { label: 'Na₂CO₃·10H₂O · Washing Soda', cat: 'Na_1', an: 'CO3_2', hyd: 10 },
    { label: 'CaSO₄·½H₂O · Plaster of Paris', cat: 'Ca_2', an: 'SO4_2', hyd: 0.5 },
    { label: 'CuSO₄·5H₂O · Blue Vitriol', cat: 'Cu_2', an: 'SO4_2', hyd: 5 },
    { label: 'Ca₃(PO₄)₂ · Bone Mineral', cat: 'Ca_2', an: 'PO4_3', hyd: 0 },
    { label: 'KMnO₄ · Permanganate', cat: 'K_1', an: 'MnO4_1', hyd: 0 },
    { label: 'K₂Cr₂O₇ · Dichromate', cat: 'K_1', an: 'Cr2O7_2', hyd: 0 }
  ];

  const handleSaveCraftedFormulaToNotes = () => {
    const content =
      crafterMode === 'crisscross'
        ? `### Crafted Chemical Formula: ${craftedResult.displayFormula} (${craftedResult.iupacName})
**Common Name**: ${craftedResult.commonName}
**Classification**: ${craftedResult.compoundClass}
**Total Atomicity**: ${craftedResult.totalAtomicity} atoms per formula unit
**Molar Mass**: ${craftedResult.totalMolarMass.toFixed(2)} g/mol

#### Step-by-Step Valency Criss-Cross Derivation:
1. **Constituent Species**: Cation/Positive Center = \`${activeCation.displayCharge}\` (${activeCation.name}), Anion/Radical = \`${activeAnion.displayCharge}\` (${activeAnion.name})
2. **Valencies**: \`+${craftedResult.valA}\` and \`-${craftedResult.valB}\` (Simplified ratio = \`${craftedResult.subB} : ${craftedResult.subA}\`)
3. **Criss-Cross Formula**: \`${craftedResult.displayFormula}\`

#### Elemental Composition Breakdown:
${craftedResult.elementBreakdown
  .map(
    (el) =>
      `- **${el.name} (${el.symbol})**: ${el.count} × ${el.atomicMass} u = ${el.totalMass.toFixed(2)} g/mol (${((el.totalMass / craftedResult.totalMolarMass) * 100).toFixed(1)}%)`
  )
  .join('\n')}

#### NCERT Key Note:
${craftedResult.ncertFact}`
        : `### Compound Synthesis Record: ${activeRecipe.productFormula} (${activeRecipe.productName})
**Common Name**: ${activeRecipe.commonName}
**Balanced Equation**: \`${activeRecipe.balancedEquation}\`
**Reaction Type**: ${activeRecipe.reactionType}

#### Synthesis Explanation:
${activeRecipe.explanation}`;

    onAddNote(
      crafterMode === 'crisscross'
        ? `Formula: ${craftedResult.displayFormula} (${craftedResult.commonName})`
        : `Synthesis: ${activeRecipe.productFormula} (${activeRecipe.commonName})`,
      'Chemistry',
      content,
      ['Formula Crafter', 'Polyatomic Ions', 'Stoichiometry', 'NCERT Chemistry'],
      `Chemistry Formula Crafter: ${
        crafterMode === 'crisscross' ? craftedResult.displayFormula : activeRecipe.productFormula
      }`
    );
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2400);
  };

  return (
    <div className="space-y-6">
      {/* Top Mode Bar + Famous NCERT Presets */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setCrafterMode('crisscross')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                crafterMode === 'crisscross'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Atom className="w-3.5 h-3.5" />
              <span>01. Element & Polyatomic Ion Criss-Cross Crafter</span>
            </button>
            <button
              type="button"
              onClick={() => setCrafterMode('synthesis')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                crafterMode === 'synthesis'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>02. Compound + Compound Synthesis Combiner</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveCraftedFormulaToNotes}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              savedToast
                ? 'bg-emerald-500 text-white'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
            }`}
          >
            {savedToast ? <CheckCircle2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            <span>{savedToast ? 'Saved Formula to Notes!' : 'Save Crafted Formula to Notes'}</span>
          </button>
        </div>

        {/* Quick NCERT Formula Presets Strip */}
        {crafterMode === 'crisscross' && (
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 mb-2">
              Quick-Load NCERT Benchmark Formulas:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {famousPresets.map((preset, idx) => {
                const isActive =
                  selectedCationId === preset.cat &&
                  selectedAnionId === preset.an &&
                  hydrateWaterCount === preset.hyd;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedCationId(preset.cat);
                      setSelectedAnionId(preset.an);
                      setHydrateWaterCount(preset.hyd);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-semibold'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {crafterMode === 'crisscross' ? (
        /* MODE 1: ELEMENT & POLYATOMIC ION CRISS-CROSS WORKBENCH */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (4 COLS): CATION & ELEMENT SELECTOR */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Step 1: Positive Ion / Element (Cation)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Metals, Hydrogen, Ammonium (`NH₄⁺`), or Non-metal centers
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                {activeCation.displayCharge}
              </span>
            </div>

            <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
              {(
                [
                  'Monovalent (+1)',
                  'Divalent (+2)',
                  'Trivalent (+3)',
                  'Tetravalent & Higher (+4/+5/+6)'
                ] as const
              ).map((catGroup) => (
                <div key={catGroup} className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                    {catGroup}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CATION_LIST.filter((c) => c.category === catGroup).map((item) => {
                      const active = item.id === activeCation.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedCationId(item.id)}
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                            active
                              ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-sm'
                              : 'bg-slate-950/70 border-slate-800/90 text-slate-300 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold font-mono text-cyan-300">
                              {item.displayCharge}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{item.name}</div>
                          </div>
                          {item.isPolyatomic && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                              Poly
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CENTER COLUMN (4 COLS): LIVE CRISS-CROSS SYNTHESIS STAGE */}
          <div className="lg:col-span-4 bg-slate-900/95 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-2xl">
            <div className="text-center space-y-1 border-b border-slate-800 pb-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400">
                Crafted Chemical Formula
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-extrabold text-white tracking-wide py-2 bg-slate-950 rounded-2xl border border-cyan-500/40 shadow-inner">
                {craftedResult.displayFormula}
              </div>
              <div className="text-sm font-bold text-cyan-300 pt-1">{craftedResult.commonName}</div>
              <div className="text-xs text-slate-400">
                IUPAC: {craftedResult.iupacName} · {craftedResult.compoundClass}
              </div>
            </div>

            {/* Interactive 4-Step NCERT Valency Criss-Cross Diagram */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Valency Criss-Cross Method</span>
                <span className="text-[11px] font-mono text-emerald-400">
                  Net Charge = 0
                </span>
              </div>

              {/* Visual SVG Criss-Cross Box */}
              <div className="relative py-2">
                <div className="grid grid-cols-2 gap-4 text-center">
                  {/* Row 1: Symbols */}
                  <div className="p-2 rounded-xl bg-slate-900 border border-cyan-500/30">
                    <div className="text-[10px] text-slate-400">1. Positive Species</div>
                    <div className="text-lg font-mono font-bold text-cyan-300">
                      {activeCation.symbol}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-amber-500/30">
                    <div className="text-[10px] text-slate-400">1. Negative Species</div>
                    <div className="text-lg font-mono font-bold text-amber-300">
                      {activeAnion.symbol}
                    </div>
                  </div>
                </div>

                {/* Crossing Arrows SVG */}
                <svg viewBox="0 0 240 44" className="w-full h-11 my-1">
                  <defs>
                    <marker id="arrowCyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" fill="#22d3ee" />
                    </marker>
                    <marker id="arrowAmber" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" fill="#fbbf24" />
                    </marker>
                  </defs>
                  {/* Left valency crosses to Right subscript */}
                  <line
                    x1="65"
                    y1="6"
                    x2="175"
                    y2="38"
                    stroke="#22d3ee"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    markerEnd="url(#arrowCyan)"
                  />
                  {/* Right valency crosses to Left subscript */}
                  <line
                    x1="175"
                    y1="6"
                    x2="65"
                    y2="38"
                    stroke="#fbbf24"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    markerEnd="url(#arrowAmber)"
                  />
                </svg>

                {/* Row 2: Crossed Subscripts */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-2 rounded-xl bg-slate-900 border border-amber-500/30">
                    <div className="text-[10px] text-slate-400">
                      Subscript of {activeCation.symbol}
                    </div>
                    <div className="text-base font-mono font-bold text-amber-300">
                      {craftedResult.subA}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">
                        (from -{craftedResult.valB}
                        {craftedResult.divisor > 1 ? ` ÷ ${craftedResult.divisor}` : ''})
                      </span>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-cyan-500/30">
                    <div className="text-[10px] text-slate-400">
                      Subscript of {activeAnion.symbol}
                    </div>
                    <div className="text-base font-mono font-bold text-cyan-300">
                      {craftedResult.subB}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">
                        (from +{craftedResult.valA}
                        {craftedResult.divisor > 1 ? ` ÷ ${craftedResult.divisor}` : ''})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Polyatomic Bracket Rule Alert */}
              {((activeCation.isPolyatomic && craftedResult.subA > 1) ||
                (activeAnion.isPolyatomic && craftedResult.subB > 1)) && (
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed">
                  <strong>NCERT Polyatomic Bracket Rule:</strong> Because two or more polyatomic ions are needed, we enclose{' '}
                  <code className="font-mono text-white">
                    {activeAnion.isPolyatomic && craftedResult.subB > 1
                      ? `(${activeAnion.symbol})${toSubscript(craftedResult.subB)}`
                      : `(${activeCation.symbol})${toSubscript(craftedResult.subA)}`}
                  </code>{' '}
                  in parentheses so the subscript multiplies the entire group!
                </div>
              )}
            </div>

            {/* Water of Crystallization Selector */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-2">
              <div className="text-xs font-semibold text-white">
                Optional: Attach Water of Crystallization (`·nH₂O`)
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {HYDRATE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setHydrateWaterCount(opt.value)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border text-left transition-all cursor-pointer ${
                      hydrateWaterCount === opt.value
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-semibold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Atomicity & Molar Mass Breakdown */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">
                  Atomicity: <strong className="text-cyan-300">{craftedResult.totalAtomicity}</strong>
                </span>
                <span className="font-mono font-bold text-emerald-300">
                  Molar Mass: {craftedResult.totalMolarMass.toFixed(2)} g/mol
                </span>
              </div>

              <div className="space-y-1.5">
                {craftedResult.elementBreakdown.map((el) => {
                  const pct = (el.totalMass / craftedResult.totalMolarMass) * 100;
                  return (
                    <div key={el.symbol} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                        <span>
                          <strong>{el.symbol}</strong> ({el.name}) × {el.count}
                        </span>
                        <span>
                          {el.totalMass.toFixed(2)} g/mol ({pct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                <strong className="text-cyan-300">NCERT Insight: </strong>
                {craftedResult.ncertFact}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (4 COLS): ANION & POLYATOMIC RADICAL SELECTOR */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Step 2: Negative Ion / Polyatomic Radical
                </h3>
                <p className="text-[11px] text-slate-400">
                  Monoatomic anions (`Cl⁻`, `O²⁻`) or Polyatomic ions (`SO₄²⁻`, `CO₃²⁻`, `OH⁻`)
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                {activeAnion.displayCharge}
              </span>
            </div>

            <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
              {(
                [
                  'Monoatomic Anions',
                  'Polyatomic Ions (-1)',
                  'Polyatomic Ions (-2)',
                  'Polyatomic Ions (-3)'
                ] as const
              ).map((anGroup) => (
                <div key={anGroup} className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                    {anGroup}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ANION_LIST.filter((a) => a.category === anGroup).map((item) => {
                      const active = item.id === activeAnion.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedAnionId(item.id)}
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                            active
                              ? 'bg-amber-500/20 border-amber-400 text-white shadow-sm'
                              : 'bg-slate-950/70 border-slate-800/90 text-slate-300 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold font-mono text-amber-300">
                              {item.displayCharge}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{item.name}</div>
                          </div>
                          {item.isPolyatomic && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                              Poly
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: COMPOUND + COMPOUND / ELEMENT SYNTHESIS COMBINER */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Compound Synthesis Recipes List */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-white">
              Select Compound + Compound / Element Combination
            </h3>
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {COMPOUND_SYNTHESIS_RECIPES.map((rec) => {
                const isSelected = rec.id === activeRecipe.id;
                return (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => setSelectedRecipeId(rec.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer space-y-1 ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-cyan-300 font-bold">
                        {rec.reactantA.formula} + {rec.reactantB.formula} → {rec.productFormula}
                      </span>
                      <span className="text-[10px] text-slate-400">{rec.commonName}</span>
                    </div>
                    <div className="text-xs font-semibold text-white">{rec.productName}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {rec.reactionType}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Synthesis Reaction & Product Formula Breakdown */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              {activeRecipe.reactionType}
            </div>

            {/* Visual Joining Blocks: Reactant A + Reactant B -> Crafted Product */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
              <div className="sm:col-span-2 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-lg font-mono font-bold text-cyan-300">
                  {activeRecipe.reactantA.formula}
                </div>
                <div className="text-xs font-semibold text-white mt-0.5">
                  {activeRecipe.reactantA.name}
                </div>
                <div className="text-[10px] text-slate-400">{activeRecipe.reactantA.type}</div>
              </div>

              <div className="flex items-center justify-center">
                <span className="w-8 h-8 rounded-full bg-slate-800 text-cyan-300 flex items-center justify-center font-bold">
                  +
                </span>
              </div>

              <div className="sm:col-span-2 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-lg font-mono font-bold text-amber-300">
                  {activeRecipe.reactantB.formula}
                </div>
                <div className="text-xs font-semibold text-white mt-0.5">
                  {activeRecipe.reactantB.name}
                </div>
                <div className="text-[10px] text-slate-400">{activeRecipe.reactantB.type}</div>
              </div>
            </div>

            {/* Crafted Product Formula Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/60 via-slate-950 to-slate-950 border border-cyan-500/40 text-center space-y-2">
              <div className="text-xs font-mono text-cyan-300 uppercase">
                Synthesized Chemical Formula
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-extrabold text-white">
                {activeRecipe.productFormula}
              </div>
              <div className="text-base font-bold text-cyan-300">
                {activeRecipe.productName} ({activeRecipe.commonName})
              </div>
              <div className="pt-2">
                <code className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 font-mono text-xs text-emerald-300">
                  {activeRecipe.balancedEquation}
                </code>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed">
              <strong className="text-cyan-300">How the Formula is Crafted: </strong>
              {activeRecipe.explanation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
