export type BiasCategory = 'gender' | 'age' | 'ethnicity' | 'status';

export interface Scenario {
  id: string;
  category: BiasCategory;
  title: string;
  description: string;
  systemPrompt: string;
  isBiased: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface UserAssessment {
  scenarioId: string;
  isBiased: boolean;
  confidence: number; // 1-5
  reasoning: string;
  chatHistory: ChatMessage[];
  timestamp: Date;
}

export interface StudyResults {
  assessments: UserAssessment[];
  overallAccuracy: number;
  accuracyByCategory: Record<BiasCategory, number>;
}
