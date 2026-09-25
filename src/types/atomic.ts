export type ElementCategory = 
  | 'alkali'
  | 'alkaline'
  | 'transition'
  | 'post-transition'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble'
  | 'lanthanide'
  | 'actinide';

export interface ElementData {
  number: number;
  symbol: string;
  name: string;
  atomicMass: number;
  category: ElementCategory;
  group: number;      // 1-18
  period: number;     // 1-7
  block: 's' | 'p' | 'd' | 'f';
  // Electrons per principal shell [n=1(K), n=2(L), n=3(M), n=4(N), n=5(O), n=6(P), n=7(Q)]
  shells: number[];
  electronConfiguration: string;
  electronConfigurationShort: string;
  valency: number[];
  valencyDescription: string;
  valenceElectrons: number;
  electronegativity: number | null;
  ionizationEnergy: number | null; // in kJ/mol
  phase: 'Solid' | 'Liquid' | 'Gas' | 'Synthetic';
  meltingPoint?: number; // Kelvin
  boilingPoint?: number; // Kelvin
  density?: number;      // g/cm3 or g/L for gases
  discoveredBy?: string;
  yearDiscovered?: number | string;
  description: string;
  applications: string[];
  quantumNumbersOuter: {
    n: number;
    l: number;  // 0=s, 1=p, 2=d, 3=f
    ml: number;
    ms: string; // "+1/2" or "-1/2"
  };
}

export type AtomicSubTab = 'periodic_table' | 'bohr_model' | 'quantum_model' | 'element_profile';
