export type ExplanationLevel = 'beginner' | 'intermediate' | 'advanced';

export type SupportedLanguage =
  | 'English'
  | 'Tamil'
  | 'Hindi'
  | 'Spanish'
  | 'French'
  | 'German'
  | 'Japanese';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  image?: string;
  timestamp: number;
  level?: ExplanationLevel;
  followUps?: string[];
}

export interface StepSolution {
  step: number;
  title: string;
  explanation: string;
}

export interface PracticeQuestion {
  question: string;
  hint: string;
  solution: string;
}

export interface DoubtSolution {
  problemTitle: string;
  subject: string;
  difficulty: string;
  keyConcepts: string[];
  formulasUsed: string[];
  stepByStepSolution: StepSolution[];
  finalAnswer: string;
  proTipsAndCommonPitfalls: string;
  similarPracticeQuestions: PracticeQuestion[];
}

export interface PlannerTask {
  id: string;
  time: string;
  title: string;
  type: 'study' | 'practice' | 'revision' | 'quiz';
  completed: boolean;
}

export interface PlannerDay {
  day: string;
  dateLabel: string;
  focusSubject: string;
  allocatedHours: number;
  tasks: PlannerTask[];
}

export interface WeeklyMilestone {
  week: string;
  goal: string;
  priorityTopics: string[];
}

export interface StudyPlan {
  planTitle: string;
  overview: string;
  weeklyMilestones: WeeklyMilestone[];
  dailySchedule: PlannerDay[];
  smartRevisionTips: string[];
}

export interface QuizQuestion {
  id: number;
  type: 'mcq' | 'boolean' | 'fill_blank' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  conceptTag: string;
  points: number;
}

export interface Quiz {
  quizTitle: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: QuizQuestion[];
}

export interface QuizResult {
  id: string;
  topic: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: string;
  missedConcepts: string[];
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  category: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  mastered?: boolean;
}

export interface NotesSummary {
  title: string;
  executiveSummary: string;
  keyConcepts: {
    heading: string;
    summary: string;
    importance: string;
  }[];
  definitionsAndFormulas: {
    term: string;
    explanation: string;
  }[];
  keyTakeaways: string[];
  keywordsGlossary: {
    keyword: string;
    brief: string;
  }[];
  quickRevisionFlashPoints: string[];
}

export interface CodeAnalysis {
  action: string;
  summary: string;
  analysis: string;
  fixedCode?: string;
  lineByLine?: { line: string; explanation: string }[];
  timeComplexity?: string;
  spaceComplexity?: string;
  bestPractices?: string[];
  practiceChallenge?: {
    title: string;
    description: string;
    starterSnippet: string;
    hint: string;
  };
}

export interface LearningInsights {
  overallHealth: string;
  readinessScore: number;
  strengthsSummary: string;
  criticalWeakAreas: {
    topic: string;
    urgency: string;
    recommendation: string;
  }[];
  recommendedActionPlan: {
    action: string;
    type: string;
    timeEstimate: string;
  }[];
  motivationalMessage: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}
