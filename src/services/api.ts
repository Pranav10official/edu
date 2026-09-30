import {
  ExplanationLevel,
  SupportedLanguage,
  DoubtSolution,
  StudyPlan,
  Quiz,
  NotesSummary,
  Flashcard,
  CodeAnalysis,
  LearningInsights,
} from '../types';

export async function askTutor(params: {
  message: string;
  history?: { role: 'user' | 'assistant'; text: string }[];
  level: ExplanationLevel;
  language: SupportedLanguage;
  image?: string;
  context?: string;
}): Promise<string> {
  const res = await fetch('/api/ai/tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Tutor error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.reply;
}

export async function solveDoubt(params: {
  question?: string;
  image?: string;
  subject?: string;
  language?: SupportedLanguage;
}): Promise<DoubtSolution> {
  const res = await fetch('/api/ai/doubt-solver', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Doubt solver error: ${res.statusText}`);
  }

  return await res.json();
}

export async function generateStudyPlan(params: {
  subjects: string[];
  examName?: string;
  examDate?: string;
  dailyHours: number;
  strengths?: string;
  weaknesses?: string;
  targetScore?: string;
  language?: SupportedLanguage;
}): Promise<StudyPlan> {
  const res = await fetch('/api/ai/study-planner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Study planner error: ${res.statusText}`);
  }

  return await res.json();
}

export async function generateQuiz(params: {
  topic: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  count?: number;
  types?: string[];
  contentSource?: string;
  language?: SupportedLanguage;
}): Promise<Quiz> {
  const res = await fetch('/api/ai/quiz-generator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Quiz generator error: ${res.statusText}`);
  }

  return await res.json();
}

export async function summarizeNotes(params: {
  content?: string;
  image?: string;
  mode?: 'brief' | 'comprehensive' | 'exam_revision';
  language?: SupportedLanguage;
}): Promise<NotesSummary> {
  const res = await fetch('/api/ai/notes-summarizer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Notes summarizer error: ${res.statusText}`);
  }

  return await res.json();
}

export async function generateFlashcards(params: {
  topic: string;
  sourceText?: string;
  count?: number;
  language?: SupportedLanguage;
}): Promise<{ deckTitle: string; cards: Flashcard[] }> {
  const res = await fetch('/api/ai/flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Flashcard generator error: ${res.statusText}`);
  }

  return await res.json();
}

export async function queryDocument(params: {
  documentText: string;
  question: string;
  language?: SupportedLanguage;
}): Promise<string> {
  const res = await fetch('/api/ai/document-qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Doc QA error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.answer;
}

export async function runProgrammingAssistant(params: {
  action: 'explain' | 'debug' | 'practice' | 'line_by_line';
  language: string;
  code?: string;
  errorTrace?: string;
  userQuery?: string;
}): Promise<CodeAnalysis> {
  const res = await fetch('/api/ai/programming', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Programming assistant error: ${res.statusText}`);
  }

  return await res.json();
}

export async function getLearningInsights(params: {
  quizHistory: any[];
  weakTopics: string[];
  totalStudyMinutes: number;
  streakDays: number;
  level: string;
}): Promise<LearningInsights> {
  const res = await fetch('/api/ai/learning-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Learning insights error: ${res.statusText}`);
  }

  return await res.json();
}
