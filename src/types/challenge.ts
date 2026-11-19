export interface ChallengeOption {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation: string;
}

export interface Challenge {
  id: string;
  category: 'cpu-scheduling' | 'memory' | 'deadlock' | 'process';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  title: string;
  scenario: string;
  question: string;
  hint: string;
  options: ChallengeOption[];
  conceptualExplanation: string;
}
