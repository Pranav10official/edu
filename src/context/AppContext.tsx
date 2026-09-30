import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ExplanationLevel,
  SupportedLanguage,
  QuizResult,
  Flashcard,
  StudyPlan,
  Badge,
} from '../types';

interface AppContextType {
  xp: number;
  level: number;
  levelTitle: string;
  nextLevelXP: number;
  streakDays: number;
  addXP: (amount: number, reason?: string) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  explanationLevel: ExplanationLevel;
  setExplanationLevel: (lvl: ExplanationLevel) => void;
  academicStage: string;
  setAcademicStage: (stage: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  studyTimeSeconds: number;
  isTimerRunning: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  quizHistory: QuizResult[];
  recordQuizResult: (result: QuizResult) => void;
  weakTopics: string[];
  addWeakTopic: (topic: string) => void;
  removeWeakTopic: (topic: string) => void;
  savedFlashcards: Flashcard[];
  setSavedFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  toggleCardMastered: (id: string) => void;
  savedStudyPlan: StudyPlan | null;
  setSavedStudyPlan: React.Dispatch<React.SetStateAction<StudyPlan | null>>;
  togglePlanTask: (dayIndex: number, taskId: string) => void;
  badges: Badge[];
  unlockBadge: (badgeId: string) => void;
  showAchievementsModal: boolean;
  setShowAchievementsModal: (show: boolean) => void;
  recentXPGain: { amount: number; reason: string } | null;
}

const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_question',
    title: 'Curious Spark',
    description: 'Asked your first question to the AI Personal Tutor',
    icon: '✨',
    unlocked: true,
    unlockedAt: 'Today',
  },
  {
    id: 'doubt_solved',
    title: 'Doubt Crusher',
    description: 'Broke down a complex STEM problem step-by-step',
    icon: '🔍',
    unlocked: true,
    unlockedAt: 'Yesterday',
  },
  {
    id: 'quiz_master',
    title: 'Quiz Ace',
    description: 'Scored 80% or higher on an AI generated quiz',
    icon: '🎯',
    unlocked: true,
    unlockedAt: '2 days ago',
  },
  {
    id: 'flashcard_streak',
    title: 'Memory Vault',
    description: 'Mastered 10 or more active recall flashcards',
    icon: '🧠',
    unlocked: false,
  },
  {
    id: 'streak_week',
    title: 'Relentless Scholar',
    description: 'Maintained a 5-day continuous learning streak',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'deep_focus',
    title: 'Focus Virtuoso',
    description: 'Completed 25+ minutes of continuous study focus',
    icon: '⏱️',
    unlocked: false,
  },
  {
    id: 'polyglot',
    title: 'Global Learner',
    description: 'Switched languages to learn in a regional or foreign tongue',
    icon: '🌐',
    unlocked: false,
  },
  {
    id: 'code_whisperer',
    title: 'Bug Hunter',
    description: 'Debugged or explained complex programming concepts',
    icon: '💻',
    unlocked: false,
  },
];

const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    question: 'What is the primary difference between Mitosis and Meiosis?',
    answer: 'Mitosis produces 2 genetically identical diploid daughter cells for growth/repair; Meiosis produces 4 genetically diverse haploid gametes for sexual reproduction.',
    hint: 'Think: "Mito = My toes (body cells)", "Meio = Make sex cells"',
    category: 'Biology',
    difficulty: 'Medium',
    mastered: true,
  },
  {
    id: 'fc-2',
    question: "State Newton's Second Law of Motion mathematically and conceptually.",
    answer: 'F = m · a (Force = mass × acceleration). The acceleration of an object is directly proportional to net force and inversely proportional to its mass.',
    hint: 'Heavier objects need more push to accelerate at the same rate.',
    category: 'Physics',
    difficulty: 'Easy',
    mastered: true,
  },
  {
    id: 'fc-3',
    question: 'What is time complexity of QuickSort in the average vs worst case?',
    answer: 'Average case: O(n log n). Worst case (e.g. already sorted array with poor pivot): O(n²).',
    hint: 'Randomized pivot selection avoids the O(n²) pitfall.',
    category: 'Computer Science',
    difficulty: 'Hard',
    mastered: false,
  },
  {
    id: 'fc-4',
    question: 'What does Le Chatelier’s Principle state regarding chemical equilibrium?',
    answer: 'If a dynamic equilibrium is disturbed by changing conditions (temperature, pressure, or concentration), the position of equilibrium moves to counteract the change.',
    hint: 'The system pushes back against changes.',
    category: 'Chemistry',
    difficulty: 'Medium',
    mastered: false,
  },
];

const INITIAL_QUIZ_HISTORY: QuizResult[] = [
  {
    id: 'q-1',
    topic: 'Photosynthesis & Cellular Respiration',
    score: 4,
    totalQuestions: 5,
    percentage: 80,
    date: 'Yesterday',
    missedConcepts: ['Krebs Cycle ATP Yield'],
  },
  {
    id: 'q-2',
    topic: 'Electromagnetism & Faraday’s Law',
    score: 3,
    totalQuestions: 5,
    percentage: 60,
    date: '2 days ago',
    missedConcepts: ['Lenz’s Law Direction', 'Magnetic Flux Units'],
  },
  {
    id: 'q-3',
    topic: 'Python Data Structures & Big-O',
    score: 5,
    totalQuestions: 5,
    percentage: 100,
    date: '3 days ago',
    missedConcepts: [],
  },
];

const INITIAL_PLAN: StudyPlan = {
  planTitle: 'Final Term Mastery & Exam Readiness Roadmap',
  overview: 'Strategic 7-day high-yield revision cycle combining deep conceptual synthesis with active recall and timed problem sets.',
  weeklyMilestones: [
    {
      week: 'Week 1',
      goal: 'Clear all high-yield physics and calculus concepts',
      priorityTopics: ['Electromagnetism', 'Calculus Integrals', 'Cellular Respiration'],
    },
    {
      week: 'Week 2',
      goal: 'Full-length timed practice tests and error catalog review',
      priorityTopics: ['Mock Exam 1', 'Mock Exam 2', 'Formula Sheet Speed Run'],
    },
  ],
  dailySchedule: [
    {
      day: 'Day 1 (Today)',
      dateLabel: 'Phase 1: Foundation & High-Yield Blitz',
      focusSubject: 'Physics & Applied Math',
      allocatedHours: 3.5,
      tasks: [
        {
          id: 't-1',
          time: '45 mins',
          title: 'Faraday & Lenz’s Law conceptual review with AI Tutor',
          type: 'study',
          completed: true,
        },
        {
          id: 't-2',
          time: '45 mins',
          title: 'Solve 10 induction & flux practice problems with Doubt Solver',
          type: 'practice',
          completed: false,
        },
        {
          id: 't-3',
          time: '20 mins',
          title: 'Speed flashcard drill on physics formulas',
          type: 'revision',
          completed: false,
        },
      ],
    },
    {
      day: 'Day 2 (Tomorrow)',
      dateLabel: 'Phase 1: Deep Mechanics',
      focusSubject: 'Biology & Biochemistry',
      allocatedHours: 3.0,
      tasks: [
        {
          id: 't-4',
          time: '50 mins',
          title: 'Cellular Respiration & Krebs Cycle step breakdown',
          type: 'study',
          completed: false,
        },
        {
          id: 't-5',
          time: '30 mins',
          title: 'Take adaptive 10-question Bio Quiz',
          type: 'quiz',
          completed: false,
        },
      ],
    },
    {
      day: 'Day 3',
      dateLabel: 'Phase 1: Algorithmic Thinking',
      focusSubject: 'Computer Science',
      allocatedHours: 2.5,
      tasks: [
        {
          id: 't-6',
          time: '40 mins',
          title: 'Review Sorting Algorithms & Recursion with Code Assistant',
          type: 'study',
          completed: false,
        },
        {
          id: 't-7',
          time: '30 mins',
          title: 'Debug two binary search challenges',
          type: 'practice',
          completed: false,
        },
      ],
    },
  ],
  smartRevisionTips: [
    'Use Feynman Technique: explain each concept simply to EduGenie as if teaching a beginner.',
    'Review your error log before starting every new practice session.',
    'Study in 25-minute Pomodoro focus sprints with 5-minute cognitive breaks.',
  ],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('edugenie_xp');
    return saved ? parseInt(saved, 10) : 680;
  });

  const [streakDays, setStreakDays] = useState<number>(() => {
    const saved = localStorage.getItem('edugenie_streak');
    return saved ? parseInt(saved, 10) : 4;
  });

  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('edugenie_lang') as SupportedLanguage) || 'English';
  });

  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>(() => {
    return (localStorage.getItem('edugenie_level') as ExplanationLevel) || 'intermediate';
  });

  const [academicStage, setAcademicStage] = useState<string>(() => {
    return localStorage.getItem('edugenie_stage') || 'College / University';
  });

  const [activeTab, setActiveTab] = useState<string>('tutor');

  // Study Timer
  const [studyTimeSeconds, setStudyTimeSeconds] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Weak Topics
  const [weakTopics, setWeakTopics] = useState<string[]>(() => {
    const saved = localStorage.getItem('edugenie_weak');
    return saved
      ? JSON.parse(saved)
      : ['Lenz’s Law Direction', 'Krebs Cycle ATP Yield', 'QuickSort Worst-Case Pivot'];
  });

  // Quiz History
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>(() => {
    const saved = localStorage.getItem('edugenie_quiz_history');
    return saved ? JSON.parse(saved) : INITIAL_QUIZ_HISTORY;
  });

  // Flashcards
  const [savedFlashcards, setSavedFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('edugenie_flashcards');
    return saved ? JSON.parse(saved) : INITIAL_FLASHCARDS;
  });

  // Study Plan
  const [savedStudyPlan, setSavedStudyPlan] = useState<StudyPlan | null>(() => {
    const saved = localStorage.getItem('edugenie_plan');
    return saved ? JSON.parse(saved) : INITIAL_PLAN;
  });

  // Badges
  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('edugenie_badges');
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  const [showAchievementsModal, setShowAchievementsModal] = useState<boolean>(false);
  const [recentXPGain, setRecentXPGain] = useState<{ amount: number; reason: string } | null>(
    null
  );

  // Level calculations: Level = Math.floor(xp / 250) + 1
  const level = Math.floor(xp / 250) + 1;
  const nextLevelXP = level * 250;

  const levelTitles = [
    'Beginner Apprentice',
    'Curious Scholar',
    'Knowledge Seeker',
    'Master Problem Solver',
    'Deep Thinker',
    'Polymath Adept',
    'Grand Sage of Science',
  ];
  const levelTitle = levelTitles[Math.min(level - 1, levelTitles.length - 1)];

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('edugenie_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('edugenie_streak', streakDays.toString());
  }, [streakDays]);

  useEffect(() => {
    localStorage.setItem('edugenie_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('edugenie_level', explanationLevel);
  }, [explanationLevel]);

  useEffect(() => {
    localStorage.setItem('edugenie_stage', academicStage);
  }, [academicStage]);

  useEffect(() => {
    localStorage.setItem('edugenie_weak', JSON.stringify(weakTopics));
  }, [weakTopics]);

  useEffect(() => {
    localStorage.setItem('edugenie_quiz_history', JSON.stringify(quizHistory));
  }, [quizHistory]);

  useEffect(() => {
    localStorage.setItem('edugenie_flashcards', JSON.stringify(savedFlashcards));
  }, [savedFlashcards]);

  useEffect(() => {
    if (savedStudyPlan) {
      localStorage.setItem('edugenie_plan', JSON.stringify(savedStudyPlan));
    }
  }, [savedStudyPlan]);

  useEffect(() => {
    localStorage.setItem('edugenie_badges', JSON.stringify(badges));
  }, [badges]);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && studyTimeSeconds > 0) {
      interval = setInterval(() => {
        setStudyTimeSeconds((prev) => prev - 1);
      }, 1000);
    } else if (studyTimeSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      addXP(50, 'Completed 25-minute Deep Focus Session!');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      unlockBadge('deep_focus');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, studyTimeSeconds]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setStudyTimeSeconds(25 * 60);
  };

  const addXP = (amount: number, reason: string = 'Learning Activity') => {
    setXp((prev) => {
      const next = prev + amount;
      const prevLvl = Math.floor(prev / 250) + 1;
      const nextLvl = Math.floor(next / 250) + 1;
      if (nextLvl > prevLvl) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      }
      return next;
    });

    setRecentXPGain({ amount, reason });
    setTimeout(() => {
      setRecentXPGain(null);
    }, 3200);
  };

  const unlockBadge = (badgeId: string) => {
    setBadges((prev) =>
      prev.map((b) => (b.id === badgeId ? { ...b, unlocked: true, unlockedAt: 'Just now' } : b))
    );
  };

  const addWeakTopic = (topic: string) => {
    if (!weakTopics.includes(topic)) {
      setWeakTopics((prev) => [...prev, topic]);
    }
  };

  const removeWeakTopic = (topic: string) => {
    setWeakTopics((prev) => prev.filter((t) => t !== topic));
  };

  const toggleCardMastered = (id: string) => {
    setSavedFlashcards((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const next = !c.mastered;
          if (next) addXP(15, 'Mastered Flashcard');
          return { ...c, mastered: next };
        }
        return c;
      })
    );
  };

  const togglePlanTask = (dayIndex: number, taskId: string) => {
    if (!savedStudyPlan) return;
    const nextPlan = { ...savedStudyPlan };
    const day = nextPlan.dailySchedule[dayIndex];
    if (!day) return;

    day.tasks = day.tasks.map((t) => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        if (nextState) {
          addXP(30, 'Completed Study Planner Task');
        }
        return { ...t, completed: nextState };
      }
      return t;
    });

    setSavedStudyPlan(nextPlan);
  };

  const recordQuizResult = (result: QuizResult) => {
    setQuizHistory((prev) => [result, ...prev]);
    if (result.percentage >= 80) {
      unlockBadge('quiz_master');
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    }
    // Add missed concepts to weak topics
    result.missedConcepts.forEach((c) => addWeakTopic(c));
    addXP(result.score * 15, `Quiz completed (${result.percentage}%)`);
  };

  return (
    <AppContext.Provider
      value={{
        xp,
        level,
        levelTitle,
        nextLevelXP,
        streakDays,
        addXP,
        language,
        setLanguage,
        explanationLevel,
        setExplanationLevel,
        academicStage,
        setAcademicStage,
        activeTab,
        setActiveTab,
        studyTimeSeconds,
        isTimerRunning,
        toggleTimer,
        resetTimer,
        quizHistory,
        recordQuizResult,
        weakTopics,
        addWeakTopic,
        removeWeakTopic,
        savedFlashcards,
        setSavedFlashcards,
        toggleCardMastered,
        savedStudyPlan,
        setSavedStudyPlan,
        togglePlanTask,
        badges,
        unlockBadge,
        showAchievementsModal,
        setShowAchievementsModal,
        recentXPGain,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
