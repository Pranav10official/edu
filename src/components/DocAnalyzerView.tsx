import React, { useState, useRef } from 'react';
import {
  FileText,
  Sparkles,
  Upload,
  BookOpen,
  Send,
  HelpCircle,
  Copy,
  Check,
  CheckSquare,
  Layers,
  ArrowRight,
  Bookmark,
  FileQuestion,
  FileCode,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { summarizeNotes, queryDocument, generateQuiz, generateFlashcards } from '../services/api';
import { NotesSummary } from '../types';

export const DocAnalyzerView: React.FC = () => {
  const { language, addXP, setActiveTab, setSavedFlashcards } = useApp();

  const [inputText, setInputText] = useState('');
  const [docImage, setDocImage] = useState<string | null>(null);
  const [summaryMode, setSummaryMode] = useState<'brief' | 'comprehensive' | 'exam_revision'>(
    'comprehensive'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<NotesSummary | null>(null);

  // Document Q&A state
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState<{ question: string; answer: string }[]>([]);
  const [isQaLoading, setIsQaLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleTexts = [
    {
      title: 'Biology: Cell Membrane Transport',
      text: `Cell membranes are selectively permeable barriers composed of a phospholipid bilayer with embedded proteins, cholesterol, and carbohydrates, described by the fluid mosaic model. Passive transport moves substances down their concentration gradient without cellular energy expenditure (ATP). Diffusion is the movement of solutes from higher to lower concentration. Osmosis is the passive movement of water molecules across a semipermeable membrane from low solute concentration (hypotonic) to high solute concentration (hypertonic). Facilitated diffusion uses transmembrane channel proteins (like aquaporins) or carrier proteins (like GLUT glucose transporters). In contrast, Active Transport requires ATP to move solutes against their electrochemical gradient. The Sodium-Potassium pump (Na+/K+-ATPase) exports 3 Na+ ions out of the cell and imports 2 K+ ions into the cell for each ATP molecule hydrolyzed, maintaining resting membrane potential and cellular volume. Secondary active transport uses the energy stored in ionic gradients created by primary active transport to symport or antiport other molecules. Bulk transport occurs through endocytosis (phagocytosis and pinocytosis) and exocytosis.`,
    },
    {
      title: 'Physics: Thermodynamics Laws',
      text: `Thermodynamics is the branch of physics concerned with heat, work, and temperature. The Zeroth Law of Thermodynamics states that if two systems are each in thermal equilibrium with a third system, they are in thermal equilibrium with each other, defining temperature. The First Law expresses conservation of energy: ΔU = Q - W, where ΔU is the change in internal energy, Q is heat added, and W is work done by the system. The Second Law asserts that the total entropy of an isolated system always increases over time in spontaneous processes: ΔS >= 0; heat cannot spontaneously flow from a colder body to a hotter body without external work. Carnot theorem establishes the maximum theoretical efficiency of a heat engine: η_max = 1 - (T_c / T_h). The Third Law states that the entropy of a pure crystalline substance approaches zero as temperature approaches absolute zero (0 Kelvin).`,
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setDocImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // Plain text or markdown
        const reader = new FileReader();
        reader.onload = () => {
          setInputText(reader.result as string);
        };
        reader.readAsText(file);
      }
    }
  };

  const handleAnalyze = async () => {
    if ((!inputText.trim() && !docImage) || isLoading) return;

    setIsLoading(true);
    try {
      const res = await summarizeNotes({
        content: inputText,
        image: docImage || undefined,
        mode: summaryMode,
        language,
      });

      setSummary(res);
      addXP(45, 'Analyzed Document & Generated Revision Pack');
    } catch (err: any) {
      console.error(err);
      alert(`Could not analyze document: ${err.message || 'Please check connection.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!qaQuestion.trim() || (!inputText.trim() && !summary) || isQaLoading) return;

    const q = qaQuestion;
    setQaQuestion('');
    setIsQaLoading(true);

    try {
      const source =
        inputText ||
        `${summary?.executiveSummary}\n${summary?.keyTakeaways.join('\n')}\n${summary?.keyConcepts.map((c) => c.summary).join('\n')}`;

      const answer = await queryDocument({
        documentText: source,
        question: q,
        language,
      });

      setQaHistory((prev) => [...prev, { question: q, answer }]);
      addXP(15, 'Queried Document Intelligence');
    } catch (err: any) {
      console.error(err);
      alert(`Could not answer question: ${err.message || 'Please retry.'}`);
    } finally {
      setIsQaLoading(false);
    }
  };

  const handleCreateQuizFromDoc = () => {
    setActiveTab('quiz');
  };

  const handleCreateFlashcardsFromDoc = async () => {
    if (!summary && !inputText) return;
    setIsLoading(true);
    try {
      const result = await generateFlashcards({
        topic: summary?.title || 'Document Revision',
        sourceText: inputText || summary?.executiveSummary,
        count: 6,
        language,
      });
      if (result.cards) {
        setSavedFlashcards((prev) => [...result.cards, ...prev]);
        setActiveTab('flashcards');
        addXP(30, 'Generated Flashcards from Document');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900 border border-cyan-500/20 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              PDF & Document Analyzer & AI Summarizer
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Extract high-yield key concepts, formulas, definitions, and ask questions directly to your study documents
            </p>
          </div>
        </div>

        <div className="text-xs px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300">
          Output Language: <span className="font-semibold text-cyan-300">{language}</span>
        </div>
      </div>

      {/* Input / Upload Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Upload or Paste Textbook Material / Lecture Notes
          </label>

          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            {(
              [
                { label: 'Comprehensive', val: 'comprehensive' },
                { label: 'Brief Summary', val: 'brief' },
                { label: 'Exam Revision', val: 'exam_revision' },
              ] as const
            ).map((m) => (
              <button
                key={m.val}
                onClick={() => setSummaryMode(m.val)}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  summaryMode === m.val
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={6}
          placeholder="Paste textbook excerpts, syllabus chapters, article paragraphs, or revision notes here..."
          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none transition leading-relaxed font-sans"
        />

        {/* Upload Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.pdf,image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Upload Document / Image</span>
            </button>

            {docImage && (
              <div className="flex items-center gap-1.5 bg-slate-950 border border-cyan-500/40 px-2.5 py-1 rounded-xl text-xs text-cyan-300">
                <span>Image Document Attached</span>
                <button
                  onClick={() => setDocImage(null)}
                  className="text-rose-400 hover:text-rose-300 ml-1 font-bold"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={(!inputText.trim() && !docImage) || isLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-40 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Analyzing Material...' : 'Summarize & Extract Revision Pack'}</span>
          </button>
        </div>

        {/* Sample Topics */}
        <div className="pt-2">
          <span className="text-[11px] font-semibold text-slate-400">
            Quick samples to try right now:
          </span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {sampleTexts.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(sample.text)}
                className="text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 transition"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Distilling Essential Insights</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Extracting core concepts, compiling definitions, formulas, and flash points...
          </p>
        </div>
      )}

      {/* Structured Summary Display */}
      {summary && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Main Summary Container */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
            {/* Header & Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Revision Study Pack
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-white mt-2">
                  {summary.title || 'Extracted Study Notes'}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCreateFlashcardsFromDoc}
                  className="flex items-center gap-1.5 text-xs bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-violet-200 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Generate Flashcards</span>
                </button>

                <button
                  onClick={handleCreateQuizFromDoc}
                  className="flex items-center gap-1.5 text-xs bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Take Quiz on this</span>
                </button>
              </div>
            </div>

            {/* Executive Summary */}
            {summary.executiveSummary && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5" />
                  Executive Summary
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {summary.executiveSummary}
                </p>
              </div>
            )}

            {/* Key Concepts Grid */}
            {summary.keyConcepts && summary.keyConcepts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Core Key Concepts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {summary.keyConcepts.map((kc, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{kc.heading}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                          {kc.importance}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{kc.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Definitions & Formulas */}
            {summary.definitionsAndFormulas && summary.definitionsAndFormulas.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Critical Definitions & Formulas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {summary.definitionsAndFormulas.map((df, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1"
                    >
                      <div className="text-xs font-bold font-mono text-cyan-300">{df.term}</div>
                      <p className="text-xs text-slate-300 leading-relaxed">{df.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Takeaways & Quick Revision Flash Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {summary.keyTakeaways && summary.keyTakeaways.length > 0 && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Key Exam Takeaways
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside leading-relaxed">
                    {summary.keyTakeaways.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.quickRevisionFlashPoints && summary.quickRevisionFlashPoints.length > 0 && (
                <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-4">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                    Flash Points for Fast Recall
                  </div>
                  <ul className="space-y-1.5 text-xs text-cyan-200 list-disc list-inside leading-relaxed">
                    {summary.quickRevisionFlashPoints.map((fp, i) => (
                      <li key={i}>{fp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Document Q&A Section */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Ask Questions to this Document</h3>
            </div>
            <p className="text-xs text-slate-400">
              Pose specific doubts or clarify passages based directly on the uploaded material.
            </p>

            {/* Q&A Stream */}
            {qaHistory.length > 0 && (
              <div className="space-y-3 pt-2">
                {qaHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 space-y-2"
                  >
                    <div className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                      <span>Q:</span> {item.question}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-200 leading-relaxed pl-3 border-l-2 border-cyan-500/40">
                      {item.answer}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Question Input */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={qaQuestion}
                onChange={(e) => setQaQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                placeholder="Ask anything about the text (e.g., 'What is the role of Na+/K+ ATPase?')..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100"
              />
              <button
                onClick={handleAskQuestion}
                disabled={!qaQuestion.trim() || isQaLoading}
                className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl disabled:opacity-40 transition cursor-pointer"
              >
                <span>{isQaLoading ? 'Thinking...' : 'Ask'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
