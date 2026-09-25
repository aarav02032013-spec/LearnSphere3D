export type NCERTClass = 'class_6' | 'class_7' | 'class_8' | 'class_9' | 'class_10' | 'class_11' | 'class_12';

export type NCERTSubject = 'Biology' | 'Physics' | 'Chemistry';

export interface NCERTPinpoint {
  id: string;
  name: string;
  position: [number, number, number];
  description: string;
  functionOrRole: string;
  examTip?: string;
}

export interface NCERTDiagram {
  id: string;
  title: string;
  ncertClass: NCERTClass;
  classLabel: string; // e.g. "Class 10"
  subject: NCERTSubject;
  chapterNumber: number | string;
  chapterTitle: string;
  figureNumber: string; // e.g. "Fig. 6.13"
  subtitle: string;
  description: string;
  examRelevance: string; // e.g. "Frequently asked 5-mark question in CBSE Board Exams for diagram labeling"
  keyFormulasOrFacts: string[];
  renderType: string;
  pinpoints: NCERTPinpoint[];
}
