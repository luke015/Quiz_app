export interface Question {
  id: string;
  type: 'text' | 'multiple-choice';
  questionText: string;
  mediaType: 'none' | 'image' | 'video' | 'audio';
  mediaPath: string | null;
  maxPoints: number;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  questions: Question[];
}

export interface Player {
  id: string;
  name: string;
  createdAt: string;
}

export interface QuestionResult {
  questionId: string;
  pointsAwarded: number;
}

export interface Result {
  id: string;
  quizId: string;
  playerId: string;
  questionResults: QuestionResult[];
  totalScore: number;
  completedAt: string;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  totalPoints: number;
}
