import React, { useState } from 'react';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Clock,
  Award,
  CheckCircle2,
  Flame,
  ArrowRight,
  BookOpen,
  Target,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLearningInsights } from '../services/api';
import { LearningInsights } from '../types';

export const AnalyticsView: React.FC = () => {
  const {
    xp,
    level,
    streakDays,
    studyTimeSeconds,
    quizHistory,
    weakTopics,
    removeWeakTopic,
    setActiveTab,
    academicStage,
    addXP,
  } = useApp();

  const [insights, setInsights] = useState<LearningInsights | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Compute stats
  const totalQuizzes = quizHistory.length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(quizHistory.reduce((acc, q) => acc + q.percentage, 0) / totalQuizzes)
      : 80;

  const totalMinutesStudied = Math.round((25 * 60 - studyTimeSeconds) / 60) + 120; // add mock foundation

  const handleGenerateInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const data = await getLearningInsights({
        quizHistory,
        weakTopics,
        totalStudyMinutes: totalMinutesStudied,
        streakDays,
        level: academicStage,
      });

      setInsights(data);
      addXP(30, 'Analyzed Performance with AI Learning Insights');
    } catch (err: any) {
      console.error(err);
      alert(`Could not fetch insights: ${err.message || 'Please check connection.'}`);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handlePracticeWeakTopic = (topic: string) => {
    setActiveTab('quiz');
  };

  const handleAskTutorWeakTopic = (topic: string) => {
    setActiveTab('tutor');
  };

  // Weekly study hours mockup
  const weeklyData = [
    { day: 'Mon', hours: 2.5, target: 3 },
    { day: 'Tue', hours: 3.5, target: 3 },
    { day: 'Wed', hours: 4.0, target: 3 },
    { day: 'Thu', hours: 2.0, target: 3 },
    { day: 'Fri', hours: 3.2, target: 3 },
    { day: 'Sat', hours: 5.0, target: 4 },
    { day: 'Sun', hours: 3.0, target: 2 },
  ];

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-900 border border-rose-500/20 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Learning Analytics & Weak Topic Detection
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Track mastery metrics, diagnose knowledge gaps, and get AI-driven study recommendations
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateInsights}
          disabled={isLoadingInsights}
          className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-rose-500/20 disabled:opacity-40 transition cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isLoadingInsights ? 'Diagnosing...' : 'Generate AI Learning Insights'}</span>
        </button>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Study Hours */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Study Time</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white">
            {(totalMinutesStudied / 60).toFixed(1)} <span className="text-xs font-normal text-slate-400">Hours</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">↑ 18% from last week</p>
        </div>

        {/* Quiz Mastery */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Quiz Average</span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white">
            {avgScore}% <span className="text-xs font-normal text-slate-400">Mastery</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{totalQuizzes} assessments logged</p>
        </div>

        {/* Streak */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Learning Streak</span>
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-orange-400">
            {streakDays} <span className="text-xs font-normal text-slate-400">Days</span>
          </div>
          <p className="text-[11px] text-orange-300 font-medium">Top 10% consistency</p>
        </div>

        {/* XP & Level */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Experience</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-purple-300">
            {xp} <span className="text-xs font-normal text-slate-400">XP (Lvl {level})</span>
          </div>
          <p className="text-[11px] text-purple-300 font-medium">Scholar Status</p>
        </div>
      </div>

      {/* Weak Topic Detection Engine */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-white">Weak Topic Detection Engine</h2>
          </div>
          <span className="text-xs text-slate-400">
            Auto-detected from incorrect quiz answers & complex doubt logs
          </span>
        </div>

        {weakTopics.length > 0 ? (
          <div className="space-y-3">
            {weakTopics.map((topic, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-rose-950/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <h3 className="text-sm font-bold text-white">{topic}</h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Needs Practice
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Scheduled for active spaced repetition. Practice to remove from weak list.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAskTutorWeakTopic(topic)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 transition"
                  >
                    Ask Tutor
                  </button>
                  <button
                    onClick={() => handlePracticeWeakTopic(topic)}
                    className="text-xs bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 px-3 py-1.5 rounded-xl font-medium transition"
                  >
                    Practice Quiz
                  </button>
                  <button
                    onClick={() => removeWeakTopic(topic)}
                    className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1"
                    title="Mark resolved"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-950 border border-emerald-500/20 rounded-xl p-6 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">No weak topics detected!</h3>
            <p className="text-xs text-slate-400">
              You are performing with high accuracy across all subjects.
            </p>
          </div>
        )}
      </div>

      {/* AI Diagnostic Insights Card */}
      {insights && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">AI Diagnostic Health & Readiness</h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Exam Readiness Score:</span>
              <span className="font-extrabold text-base text-emerald-400">
                {insights.readinessScore}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-slate-950 border border-emerald-500/20 rounded-xl p-4 space-y-2">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Demonstrated Strengths
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {insights.strengthsSummary}
              </p>
            </div>

            {/* Motivation */}
            <div className="bg-slate-950 border border-purple-500/20 rounded-xl p-4 space-y-2">
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Personalized Strategic Guidance
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                "{insights.motivationalMessage}"
              </p>
            </div>
          </div>

          {/* Critical Weak Areas */}
          {insights.criticalWeakAreas && insights.criticalWeakAreas.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Actionable Remediation by Concept
              </h3>
              <div className="space-y-2">
                {insights.criticalWeakAreas.map((area, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white mr-2">{area.topic}:</span>
                      <span className="text-slate-300">{area.recommendation}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold shrink-0">
                      {area.urgency} Priority
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Action Plan */}
          {insights.recommendedActionPlan && (
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Prescribed Next Activities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {insights.recommendedActionPlan.map((act, i) => (
                  <div
                    key={i}
                    className="bg-slate-950 border border-indigo-500/20 rounded-xl p-3 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-200">{act.action}</span>
                    <span className="text-[10px] text-indigo-400 font-semibold shrink-0 ml-2">
                      ⏱️ {act.timeEstimate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weekly Activity Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          Weekly Study Hours & Daily Performance
        </h3>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4">
          {weeklyData.map((d, i) => {
            const heightPct = Math.min(100, Math.round((d.hours / 6) * 100));
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">{d.hours}h</span>
                <div className="w-full bg-slate-950 rounded-xl h-36 flex items-end p-1 border border-slate-800/80">
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 via-purple-500 to-pink-500 rounded-lg transition-all duration-500"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-300">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
