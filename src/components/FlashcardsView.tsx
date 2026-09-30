import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  RotateCw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Lightbulb,
  Plus,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { generateFlashcards } from '../services/api';
import { Flashcard } from '../types';

export const FlashcardsView: React.FC = () => {
  const {
    savedFlashcards,
    setSavedFlashcards,
    toggleCardMastered,
    language,
    addXP,
    unlockBadge,
  } = useApp();

  const [topicInput, setTopicInput] = useState('');
  const [sourceNotes, setSourceNotes] = useState('');
  const [cardCount, setCardCount] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Deck player state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'needs_review' | 'mastered'>('all');

  // Filtered Cards
  const displayedCards = savedFlashcards.filter((card) => {
    if (filterMode === 'needs_review') return !card.mastered;
    if (filterMode === 'mastered') return card.mastered;
    return true;
  });

  const currentCard: Flashcard | undefined = displayedCards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < displayedCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(displayedCards.length - 1);
    }
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...savedFlashcards].sort(() => Math.random() - 0.5);
    setSavedFlashcards(shuffled);
    setCurrentIndex(0);
  };

  const handleGenerate = async () => {
    if (!topicInput.trim() && !sourceNotes.trim()) return;

    setIsLoading(true);
    try {
      const result = await generateFlashcards({
        topic: topicInput || 'Study Revision',
        sourceText: sourceNotes,
        count: cardCount,
        language,
      });

      if (result.cards && result.cards.length > 0) {
        setSavedFlashcards((prev) => [...result.cards, ...prev]);
        setShowGenerateModal(false);
        setTopicInput('');
        setSourceNotes('');
        setCurrentIndex(0);
        setIsFlipped(false);
        addXP(40, 'Generated AI Flashcards');
        unlockBadge('flashcard_streak');
      }
    } catch (err: any) {
      console.error(err);
      alert(`Could not generate flashcards: ${err.message || 'Please check connection.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCurrent = () => {
    if (!currentCard) return;
    setSavedFlashcards((prev) => prev.filter((c) => c.id !== currentCard.id));
    if (currentIndex >= displayedCards.length - 1) {
      setCurrentIndex(Math.max(0, displayedCards.length - 2));
    }
    setIsFlipped(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-violet-950/40 via-purple-950/30 to-slate-900 border border-violet-500/20 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">AI Active Recall Flashcards</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Flip, shuffle, and master high-yield concepts using spaced repetition
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New AI Deck</span>
        </button>
      </div>

      {/* Filter Tabs & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => {
              setFilterMode('all');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              filterMode === 'all' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Cards ({savedFlashcards.length})
          </button>
          <button
            onClick={() => {
              setFilterMode('needs_review');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              filterMode === 'needs_review'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Needs Review ({savedFlashcards.filter((c) => !c.mastered).length})
          </button>
          <button
            onClick={() => {
              setFilterMode('mastered');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              filterMode === 'mastered'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mastered ({savedFlashcards.filter((c) => c.mastered).length})
          </button>
        </div>

        <button
          onClick={handleShuffle}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer"
        >
          <Shuffle className="w-3.5 h-3.5 text-violet-400" />
          <span>Shuffle Deck</span>
        </button>
      </div>

      {/* 3D Flashcard Viewer */}
      {displayedCards.length > 0 && currentCard ? (
        <div className="space-y-4">
          {/* Card Meta Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span className="font-bold text-violet-400">
              Card {currentIndex + 1} of {displayedCards.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {currentCard.category || 'General'}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {currentCard.difficulty || 'Medium'}
              </span>
            </div>
          </div>

          {/* Flip Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[280px] sm:min-h-[320px] rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-slate-800 hover:border-violet-500/50 shadow-2xl flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-violet-500/10 group relative select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                {isFlipped ? '💡 Answer & Explanation' : '❓ Question (Click to Flip)'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCardMastered(currentCard.id);
                  }}
                  className={`p-1.5 rounded-xl border transition ${
                    currentCard.mastered
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-emerald-400'
                  }`}
                  title={currentCard.mastered ? 'Mark as Needs Review' : 'Mark as Mastered (+15 XP)'}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCurrent();
                  }}
                  className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-400 transition"
                  title="Delete Card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="my-auto py-4 text-center sm:text-left">
              {!isFlipped ? (
                <h3 className="text-lg sm:text-2xl font-bold text-white leading-relaxed">
                  {currentCard.question}
                </h3>
              ) : (
                <div className="space-y-3">
                  <p className="text-base sm:text-xl font-semibold text-emerald-200 leading-relaxed">
                    {currentCard.answer}
                  </p>
                  {currentCard.hint && (
                    <div className="text-xs sm:text-sm text-amber-300/90 bg-amber-950/30 border border-amber-500/20 p-3 rounded-xl flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        <strong>Mnemonic Hint:</strong> {currentCard.hint}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Flip Indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="flex items-center gap-1 text-[11px] group-hover:text-violet-300 transition">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Click card space to flip</span>
              </span>

              {currentCard.mastered && (
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mastered
                </span>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              onClick={handlePrev}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-slate-200 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => toggleCardMastered(currentCard.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition cursor-pointer border ${
                currentCard.mastered
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-md'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{currentCard.mastered ? 'Mastered ✓' : 'Mark Mastered'}</span>
            </button>

            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-slate-200 transition cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No flashcards found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filterMode !== 'all'
              ? 'No cards matching this filter. Switch back to "All Cards" or generate a new deck.'
              : 'Generate an AI deck from any topic or textbook notes to start active recall drills.'}
          </p>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs px-4 py-2 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Flashcards Now</span>
          </button>
        </div>
      )}

      {/* Generator Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <h3 className="text-base font-bold text-white">AI Flashcard Generator</h3>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Deck Subject or Topic
              </label>
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="e.g. Organic Chemistry Reactions, European History, Calculus Formulas"
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Optional: Paste Raw Study Material or Lecture Notes
              </label>
              <textarea
                value={sourceNotes}
                onChange={(e) => setSourceNotes(e.target.value)}
                rows={4}
                placeholder="Paste paragraphs from textbooks, lecture slides, or summaries..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Number of Cards: {cardCount}
              </label>
              <input
                type="range"
                min="4"
                max="12"
                value={cardCount}
                onChange={(e) => setCardCount(parseInt(e.target.value, 10))}
                className="w-full accent-violet-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={isLoading || (!topicInput.trim() && !sourceNotes.trim())}
                className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 text-white font-medium text-xs px-4 py-2 rounded-xl shadow-md disabled:opacity-40"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Creating Flashcards...' : 'Generate Deck'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
