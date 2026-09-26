export type GradeLevel = 'middle' | 'high' | 'senior';

export interface Pinpoint {
  id: string;
  name: string;
  position: [number, number, number];
  description: string;
  significance: string;
  formulaOrFact?: string;
  minExplodeFactor?: number;
}

export interface Model3DItem {
  id: string;
  title: string;
  category: 'Biology' | 'Mathematics';
  grade: GradeLevel;
  gradeLabel: string;
  subtitle: string;
  description: string;
  keyConcepts: string[];
  pinpoints: Pinpoint[];
  renderType: 
    | 'dna' 
    | 'heart' 
    | 'brain' 
    | 'cell' 
    | 'eye' 
    | 'tesseract' 
    | 'klein' 
    | 'platonic' 
    | 'calculus_surface'
    | 'torus';
  formula?: string;
}

export interface MachineComponent {
  id: string;
  name: string;
  role: string;
  detail: string;
  position: [number, number, number];
}

export interface AdvancedMachine {
  id: string;
  name: string;
  category: 'Automotive' | 'Aerospace' | 'Robotics' | 'Computing';
  subtitle: string;
  description: string;
  components: MachineComponent[];
  renderType: 'ev_powertrain' | 'jet_engine' | 'robot_arm' | 'microchip_motherboard';
  specifications: { label: string; value: string }[];
}

export interface Chemical {
  id: string;
  name: string;
  formula: string;
  color: string;
  pH: number;
  type: 'acid' | 'base' | 'salt' | 'metal' | 'indicator' | 'oxidizer' | 'solvent';
  description: string;
  density: number;
}

export interface ReactionResult {
  id: string;
  name: string;
  equation: string;
  requiredIds: string[];
  minTemp?: number;
  resultColor: string;
  resultPH: number;
  gasEvolution?: boolean;
  effervescenceName?: string;
  precipitate?: boolean;
  precipitateName?: string;
  exothermicDeltaTemp?: number;
  luminescence?: boolean;
  molecularExplanation: string;
  realWorldApplication: string;
  safetyNote: string;
}

export type PhysicsSimType = 
  | 'newton_first'
  | 'newton_second'
  | 'newton_third'
  | 'projectile' 
  | 'collision' 
  | 'gravity' 
  | 'pendulum';

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  formulaUsed: string;
}

export interface NoteItem {
  id: string;
  title: string;
  subject: 'Biology' | 'Mathematics' | 'Chemistry' | 'Physics' | 'Engineering' | 'General';
  content: string;
  tags: string[];
  updatedAt: number;
  favorite?: boolean;
  labReference?: string;
}
