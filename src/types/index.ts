export type CaseArea =
  | 'Criminal / Penal'
  | 'Cível e Processo Civil'
  | 'Trabalhista e Previdenciário'
  | 'Tributário e Fiscal'
  | 'Direito de Família e Sucessões'
  | 'Direito Empresarial / Societário'
  | 'Direito do Consumidor'
  | 'Direito Administrativo / Público'
  | 'Geral / Outros';

export interface ApplicableLaw {
  norm: string;
  relevance: string;
  practicalApplication: string;
}

export interface DefenseStoryline {
  factualNarrative: string;
  preliminaries: string[];
  meritArguments: string[];
  evidenceStrategy: string[];
  keyRequests: string[];
}

export interface LegalAnalysis {
  personalizedGreeting: string;
  thesisName: string;
  quickSummary: string;
  applicableLaws: ApplicableLaw[];
  defenseStoryline: DefenseStoryline;
  circumstanceImpact: string;
  strategicAlerts: string[];
  generatedAt: string;
}

export interface LegalCase {
  id: string;
  title: string; // e.g. "Processo nº 1002345-88.2024.8.26.0100" ou "Inquérito Policial nº 45"
  clientName: string;
  clientRole: string; // e.g. "Réu / Defesa", "Autor", "Investigado", "Reclamado"
  court?: string; // e.g. "2ª Vara Criminal da Capital"
  area: string;
  factsDescription: string;
  circumstances?: string; // Campo opcional de circunstâncias novas / dicas
  analysis?: LegalAnalysis;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'baixa' | 'normal' | 'alta' | 'fatal';

export interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority?: TaskPriority;
  caseId?: string; // Link to a LegalCase
  notes?: string;
  createdAt: string;
}

export interface LawyerProfile {
  name: string;
  specialty: string;
  oab?: string;
}
