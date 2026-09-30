import React, { useState, useRef } from 'react';
import {
  HelpCircle,
  Upload,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { solveDoubt } from '../services/api';
import { DoubtSolution } from '../types';

export const DoubtSolverView: React.FC = () => {
  const { language, addXP, unlockBadge } = useApp();

  const [questionText, setQuestionText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics & Physics');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState<DoubtSolution | null>(null);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<number, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const subjects = [
    'Mathematics & Physics',
    'Calculus & Linear Algebra',
    'Organic & Physical Chemistry',
    'Biology & Genetics',
    'Computer Science & Data Structures',
    'General STEM',
  ];

  const sampleDoubts = [
    {
      title: 'Calculus: Chain Rule & Trig',
      text: 'Find the derivative of f(x) = sin^3(4x^2 + 1) with respect to x. Explain each step clearly.',
      subject: 'Calculus & Linear Algebra',
    },
    {
      title: 'Physics: Projectile Motion',
      text: 'A ball is launched at 30 m/s at an angle of 35 degrees above the horizontal. Find its maximum height and total flight time (g = 9.8 m/s^2).',
      subject: 'Mathematics & Physics',
    },
    {
      title: 'Chemistry: pH Calculation',
      text: 'Calculate the pH of a 0.05 M solution of acetic acid (CH3COOH) given Ka = 1.8 x 10^-5.',
      subject: 'Organic & Physical Chemistry',
    },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolve = async () => {
    if ((!questionText.trim() && !imagePreview) || isLoading) return;

    setIsLoading(true);
    setSolution(null);
    setRevealedSolutions({});
    setRevealedHints({});

    try {
      const result = await solveDoubt({
        question: questionText,
        image: imagePreview || undefined,
        subject: selectedSubject,
        language,
      });

      setSolution(result);
      addXP(40, 'Solved Academic Doubt with Step-by-Step Breakdown');
      unlockBadge('doubt_solved');
    } catch (err: any) {
      console.error(err);
      alert(`Could not solve doubt: ${err.message || 'Please check your connection and retry.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleHint = (idx: number) => {
    setRevealedHints((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const togglePracticeSolution = (idx: number) => {
    setRevealedSolutions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopySolution = () => {
    if (!solution) return;
    const text = `Problem: ${solution.problemTitle}\n\nFinal Answer: ${solution.finalAnswer}\n\nSteps:\n${solution.stepByStepSolution.map((s) => `Step ${s.step}: ${s.title}\n${s.explanation}`).join('\n\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-slate-900 border border-pink-500/20 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-pink-500/20 text-pink-300 border border-pink-500/30">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">AI Doubt Solver</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Type your problem or upload textbook photos for step-by-step explanations & practice questions
            </p>
          </div>
        </div>

        <div className="text-xs px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300">
          Target Language: <span className="font-semibold text-pink-300">{language}</span>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Select Subject Area
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
          >
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* Text Input */}
        <div>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            rows={4}
            placeholder="Type or paste your doubt, formula, or problem statement here... (e.g. 'Solve the integral of e^(2x) * cos(x) dx' or 'Why does Lenz law conserve energy?')"
            className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500/70 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none transition"
          />
        </div>

        {/* Image Attachment / Upload Area */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              <Camera className="w-4 h-4 text-pink-400" />
              <span>Upload Image of Problem</span>
            </button>

            {imagePreview && (
              <div className="flex items-center gap-2 bg-slate-950 border border-pink-500/40 px-2.5 py-1 rounded-xl">
                <span className="text-xs text-pink-300 font-medium">Image attached</span>
                <button
                  onClick={() => setImagePreview(null)}
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold px-1"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSolve}
            disabled={(!questionText.trim() && !imagePreview) || isLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-pink-500/20 disabled:opacity-40 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Solving Step-by-Step...' : 'Solve with AI Doubt Engine'}</span>
          </button>
        </div>

        {/* Image Preview thumbnail */}
        {imagePreview && (
          <div className="mt-2 rounded-xl overflow-hidden border border-slate-700 max-w-sm max-h-56 bg-black/40">
            <img src={imagePreview} alt="Doubt Problem" className="w-full h-full object-contain" />
          </div>
        )}

        {/* Quick Sample Prompts */}
        <div className="pt-2">
          <span className="text-[11px] font-semibold text-slate-400">Try quick sample doubts:</span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {sampleDoubts.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestionText(s.text);
                  setSelectedSubject(s.subject);
                }}
                className="text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/60 transition cursor-pointer"
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center mx-auto text-pink-400 animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Analyzing Problem & Deriving Solution</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            EduGenie is verifying theorems, breaking down math operations, and generating similar practice questions...
          </p>
        </div>
      )}

      {/* Solution Display */}
      {solution && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Main Solution Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 mr-2">
                  {solution.subject || selectedSubject}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {solution.difficulty || 'Medium'}
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-white mt-2">
                  {solution.problemTitle || 'Detailed Problem Solution'}
                </h2>
              </div>

              <button
                onClick={handleCopySolution}
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Solution'}</span>
              </button>
            </div>

            {/* Key Concepts & Formulas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {solution.keyConcepts && solution.keyConcepts.length > 0 && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    Key Concepts Applied
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {solution.keyConcepts.map((kc, i) => (
                      <span
                        key={i}
                        className="text-xs bg-indigo-950/60 text-indigo-200 border border-indigo-500/30 px-2 py-1 rounded-lg"
                      >
                        {kc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {solution.formulasUsed && solution.formulasUsed.length > 0 && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Formulas & Theorems
                  </div>
                  <div className="space-y-1">
                    {solution.formulasUsed.map((f, i) => (
                      <div
                        key={i}
                        className="text-xs font-mono text-purple-200 bg-purple-950/40 px-2 py-1 rounded border border-purple-500/20"
                      >
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step-by-Step Breakdown */}
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">
                Step-by-Step Educational Solution
              </h3>
              <div className="space-y-3">
                {solution.stepByStepSolution?.map((step) => (
                  <div
                    key={step.step}
                    className="flex gap-3 bg-slate-950/70 border border-slate-800 rounded-xl p-4"
                  >
                    <div className="w-7 h-7 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300 font-bold text-xs shrink-0 mt-0.5">
                      {step.step}
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="text-sm font-bold text-white">{step.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {step.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Answer Banner */}
            {solution.finalAnswer && (
              <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Final Result / Conclusion
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white mt-1">
                    {solution.finalAnswer}
                  </div>
                </div>
              </div>
            )}

            {/* Common Pitfalls & Exam Tips */}
            {solution.proTipsAndCommonPitfalls && (
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Exam Pro-Tip & Common Pitfall to Avoid
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
                    {solution.proTipsAndCommonPitfalls}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Similar Practice Questions Generator Section */}
          {solution.similarPracticeQuestions && solution.similarPracticeQuestions.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Active Recall: Similar Practice Questions
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Attempt these similar problems on paper, then check the hints and verified solutions to solidify your understanding.
              </p>

              <div className="space-y-4 pt-2">
                {solution.similarPracticeQuestions.map((pq, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 space-y-3"
                  >
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Practice Problem #{idx + 1}
                    </div>
                    <p className="text-sm font-medium text-slate-100">{pq.question}</p>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
                      <button
                        onClick={() => toggleHint(idx)}
                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium transition cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>{revealedHints[idx] ? 'Hide Hint' : 'Reveal Hint'}</span>
                      </button>

                      <button
                        onClick={() => togglePracticeSolution(idx)}
                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-200 font-medium transition cursor-pointer"
                      >
                        {revealedSolutions[idx] ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                        <span>{revealedSolutions[idx] ? 'Hide Solution' : 'Check Solution'}</span>
                      </button>
                    </div>

                    {revealedHints[idx] && (
                      <div className="text-xs text-amber-200 bg-amber-950/40 border border-amber-500/20 p-2.5 rounded-lg">
                        <strong>Hint:</strong> {pq.hint}
                      </div>
                    )}

                    {revealedSolutions[idx] && (
                      <div className="text-xs text-emerald-200 bg-emerald-950/40 border border-emerald-500/20 p-2.5 rounded-lg">
                        <strong>Solution:</strong> {pq.solution}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
