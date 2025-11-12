export type BiasCategory = 'gender' | 'age' | 'ethnicity' | 'status';

export interface Scenario {
  id: string;
  category: BiasCategory;
  title: string;
  description: string;
  systemPrompt: string;
  isBiased: boolean;
  openingQuestion?: string;
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
  isCorrect: boolean;
  pointsEarned: number;
}

export interface StudyResults {
  assessments: UserAssessment[];
  overallAccuracy: number;
  accuracyByCategory: Record<BiasCategory, number>;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

export interface GameStats {
  totalPoints: number;
  currentStreak: number;
  badges: Badge[];
  rank: string;
}
