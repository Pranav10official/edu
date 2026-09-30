import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Sparkles,
  Timer,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  Flame,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { generateQuiz } from '../services/api';
import { Quiz, QuizQuestion } from '../types';

export const QuizView: React.FC = () => {
  const { language, recordQuizResult, addXP, addWeakTopic, academicStage } = useApp();

  const [topic, setTopic] = useState('Photosynthesis & Cellular Respiration');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [isExamMode, setIsExamMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Timed exam mode
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 mins default

  useEffect(() => {
    let timer: any = null;
    if (activeQuiz && isExamMode && !quizCompleted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !quizCompleted && activeQuiz) {
      handleFinishQuiz();
    }
    return () => clearInterval(timer);
  }, [activeQuiz, isExamMode, quizCompleted, timeLeft]);

  const sampleTopics = [
    'Electromagnetism & Faraday’s Law',
    'Calculus: Derivatives & Chain Rule',
    'Organic Chemistry: Reaction Mechanisms',
    'Python: OOP, Inheritence, & Big-O',
    'Cell Division: Mitosis vs Meiosis',
    'World History: The Industrial Revolution',
  ];

  const handleGenerate = async () => {
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setActiveQuiz(null);
    setQuizCompleted(false);
    setUserAnswers({});
    setShowExplanation({});
    setCurrentQuestionIndex(0);
    setTimeLeft(questionCount * 60);

    try {
      const generated = await generateQuiz({
        topic,
        difficulty,
        count: questionCount,
        types: ['mcq', 'boolean'],
        language,
      });

      setActiveQuiz(generated);
    } catch (err: any) {
      console.error(err);
      alert(`Could not generate quiz: ${err.message || 'Please check your connection and retry.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnswer = (qId: number, answerText: string) => {
    if (quizCompleted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: answerText }));
    if (!isExamMode) {
      // In casual mode, show explanation immediately
      setShowExplanation((prev) => ({ ...prev, [qId]: true }));
    }
  };

  const handleNext = () => {
    if (!activeQuiz) return;
    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    if (!activeQuiz) return;
    setQuizCompleted(true);

    let correctCount = 0;
    const missedConcepts: string[] = [];

    activeQuiz.questions.forEach((q) => {
      const selected = userAnswers[q.id];
      if (selected === q.correctAnswer) {
        correctCount += 1;
      } else {
        if (q.conceptTag) missedConcepts.push(q.conceptTag);
      }
    });

    const percentage = Math.round((correctCount / activeQuiz.questions.length) * 100);

    recordQuizResult({
      id: Date.now().toString(),
      topic: activeQuiz.topic,
      score: correctCount,
      totalQuestions: activeQuiz.questions.length,
      percentage,
      date: 'Today',
      missedConcepts,
    });

    if (percentage >= 70) {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    }
  };

  const currentQ: QuizQuestion | undefined = activeQuiz?.questions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-slate-900 border border-amber-500/20 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">AI Quiz & Mock Test</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Adaptive tests, instant feedback, explanations, and automatic weak-topic detection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-300">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Earn 15 XP per correct answer!</span>
        </div>
      </div>

      {/* Generator Configuration (when no active quiz or want to new) */}
      {(!activeQuiz || quizCompleted) && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Configure Practice Quiz or Exam
            </h2>
            <span className="text-xs text-slate-400">Language: {language}</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Subject or Topic to Test
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Newton's Laws, Organic Reactions, Cellular Respiration"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100"
              />
            </div>

            {/* Quick Topic Pills */}
            <div className="flex flex-wrap gap-1.5">
              {sampleTopics.map((st, i) => (
                <button
                  key={i}
                  onClick={() => setTopic(st)}
                  className="text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 transition"
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Difficulty */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Difficulty Level
                </label>
                <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
                  {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-1.5 rounded-lg font-medium transition ${
                        difficulty === d
                          ? 'bg-amber-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of questions */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Questions: {questionCount}
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value={3}>3 Quick Warm-up</option>
                  <option value={5}>5 Standard Quiz</option>
                  <option value={10}>10 In-depth Assessment</option>
                </select>
              </div>

              {/* Mode Toggle */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Test Mode</label>
                <button
                  onClick={() => setIsExamMode(!isExamMode)}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer ${
                    isExamMode
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>{isExamMode ? '⏱️ Timed Exam Mode' : 'Practice Mode (Instant Feedback)'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={handleGenerate}
                disabled={isLoading || !topic.trim()}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-40 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isLoading ? 'Generating Adaptive Quiz...' : 'Start AI Quiz'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Generating Diagnostic Questions</h3>
          <p className="text-xs text-slate-400">
            Formulating challenging problems, comprehensive explanations, and concept tags...
          </p>
        </div>
      )}

      {/* Active Quiz Taking Interface */}
      {activeQuiz && !quizCompleted && currentQ && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          {/* Top Progress & Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {currentQ.conceptTag || activeQuiz.topic}
              </span>
            </div>

            {isExamMode && (
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full">
                <Timer className="w-3.5 h-3.5" />
                <span>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Text */}
          <div className="py-2">
            <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQ.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options?.map((option, idx) => {
              const isSelected = userAnswers[currentQ.id] === option;
              const isRevealed = showExplanation[currentQ.id];
              const isCorrect = option === currentQ.correctAnswer;

              let optionStyle =
                'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-200';

              if (isRevealed) {
                if (isCorrect) {
                  optionStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
                }
              } else if (isSelected) {
                optionStyle = 'bg-amber-500/20 border-amber-500 text-amber-200';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(currentQ.id, option)}
                  disabled={showExplanation[currentQ.id]}
                  className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition cursor-pointer flex items-center justify-between ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {isRevealed && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isRevealed && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Instant Explanation (Practice Mode) */}
          {showExplanation[currentQ.id] && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 animate-in fade-in">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                Explanation & Learning Note:
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Bottom Next / Finish Button */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Answered {answeredCount}/{activeQuiz.questions.length}
            </span>

            <button
              onClick={handleNext}
              disabled={!userAnswers[currentQ.id]}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md disabled:opacity-40 transition cursor-pointer"
            >
              <span>
                {currentQuestionIndex === activeQuiz.questions.length - 1
                  ? 'Submit Quiz'
                  : 'Next Question'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quiz Completion Results Screen */}
      {quizCompleted && activeQuiz && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white">Quiz Completed!</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">Topic: {activeQuiz.topic}</p>
          </div>

          {/* Score Circle */}
          {(() => {
            const correctCount = activeQuiz.questions.filter(
              (q) => userAnswers[q.id] === q.correctAnswer
            ).length;
            const pct = Math.round((correctCount / activeQuiz.questions.length) * 100);

            return (
              <div className="flex flex-col items-center justify-center">
                <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500">
                  {pct}%
                </div>
                <div className="text-sm font-semibold text-slate-300 mt-1">
                  {correctCount} out of {activeQuiz.questions.length} correct (+{correctCount * 15} XP
                  earned!)
                </div>
              </div>
            );
          })()}

          {/* Missed Topics Alert */}
          {(() => {
            const missed = activeQuiz.questions.filter(
              (q) => userAnswers[q.id] !== q.correctAnswer
            );

            if (missed.length === 0) {
              return (
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300">
                  🎉 Flawless score! You have complete mastery of this topic.
                </div>
              );
            }

            return (
              <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-4 text-left space-y-2">
                <div className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Concepts Added to Weak Topic Detector:
                </div>
                <div className="flex flex-wrap gap-2">
                  {missed.map((m, i) => (
                    <span
                      key={i}
                      className="text-xs bg-rose-900/40 text-rose-200 border border-rose-500/30 px-2.5 py-1 rounded-lg"
                    >
                      {m.conceptTag || 'Concept'}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  EduGenie will automatically schedule targeted revision drills for these concepts.
                </p>
              </div>
            );
          })()}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setActiveQuiz(null);
                setQuizCompleted(false);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white font-medium text-xs sm:text-sm px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practice Another Topic</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
