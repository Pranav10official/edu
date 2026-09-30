import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Award,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Languages,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SupportedLanguage } from '../types';

export const Header: React.FC = () => {
  const {
    xp,
    level,
    levelTitle,
    nextLevelXP,
    streakDays,
    language,
    setLanguage,
    academicStage,
    setAcademicStage,
    studyTimeSeconds,
    isTimerRunning,
    toggleTimer,
    resetTimer,
    setShowAchievementsModal,
    recentXPGain,
  } = useApp();

  const [showTimerMenu, setShowTimerMenu] = useState(false);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const xpProgressPercent = Math.min(
    100,
    Math.round(((xp % 250) / 250) * 100)
  );

  const languages: { label: string; value: SupportedLanguage }[] = [
    { label: 'English', value: 'English' },
    { label: 'Tamil (தமிழ்)', value: 'Tamil' },
    { label: 'Hindi (हिंदी)', value: 'Hindi' },
    { label: 'Spanish (Español)', value: 'Spanish' },
    { label: 'French (Français)', value: 'French' },
    { label: 'German (Deutsch)', value: 'German' },
    { label: 'Japanese (日本語)', value: 'Japanese' },
  ];

  const academicStages = [
    'Middle School',
    'High School',
    'College / University',
    'Competitive Exam (SAT/GRE/JEE/NEET)',
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-300">
                EduGenie
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI Powered Learning Assistant
            </p>
          </div>
        </div>

        {/* Center / Action Pills */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Study Focus Timer */}
          <div className="relative">
            <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-full px-3 py-1.5 text-xs text-slate-200 shadow-sm">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              <span className="font-mono font-bold mr-2 text-indigo-200">
                {formatTimer(studyTimeSeconds)}
              </span>
              <button
                onClick={toggleTimer}
                title={isTimerRunning ? 'Pause Focus' : 'Start Focus (Pomodoro)'}
                className={`p-1 rounded-full hover:bg-slate-700 transition ${
                  isTimerRunning ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {isTimerRunning ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={resetTimer}
                title="Reset Focus Timer"
                className="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition ml-0.5"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Streak Counter */}
          <div
            title={`${streakDays} days consecutive study streak!`}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-orange-500/30 rounded-full px-3 py-1.5 text-xs font-semibold text-orange-300"
          >
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-bounce" />
            <span>{streakDays}d Streak</span>
          </div>

          {/* XP & Level Button */}
          <button
            onClick={() => setShowAchievementsModal(true)}
            className="group relative flex items-center gap-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-full px-3 py-1.5 text-xs text-slate-200 transition cursor-pointer"
          >
            <Award className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-indigo-300">Lvl {level}</span>
                <span className="text-[10px] text-slate-400">({xp} XP)</span>
              </div>
              <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${xpProgressPercent}%` }}
                />
              </div>
            </div>
          </button>

          {/* Language Selector */}
          <div className="relative hidden md:block">
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-full px-2.5 py-1.5 text-xs text-slate-300">
              <Languages className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <select
                aria-label="Language selection"
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer pr-1"
              >
                {languages.map((l) => (
                  <option key={l.value} value={l.value} className="bg-slate-900 text-slate-100">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Academic Level */}
          <div className="relative hidden lg:block">
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-full px-2.5 py-1.5 text-xs text-slate-300">
              <GraduationCap className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <select
                aria-label="Academic stage selection"
                value={academicStage}
                onChange={(e) => setAcademicStage(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer pr-1 max-w-[150px] truncate"
              >
                {academicStages.map((stage) => (
                  <option key={stage} value={stage} className="bg-slate-900 text-slate-100">
                    {stage}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Floating XP Gain Alert */}
      {recentXPGain && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-white/20">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
          <div className="text-xs">
            <span className="font-extrabold text-amber-300 text-sm mr-1">
              +{recentXPGain.amount} XP
            </span>
            <span className="text-indigo-100 font-medium">{recentXPGain.reason}</span>
          </div>
        </div>
      )}
    </header>
  );
};
