import React from 'react';
import { Award, Sparkles, Flame, CheckCircle2, Lock, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AchievementsModal: React.FC = () => {
  const {
    xp,
    level,
    levelTitle,
    nextLevelXP,
    streakDays,
    badges,
    showAchievementsModal,
    setShowAchievementsModal,
  } = useApp();

  if (!showAchievementsModal) return null;

  const currentLevelBaseXP = (level - 1) * 250;
  const xpInCurrentLevel = xp - currentLevelBaseXP;
  const xpNeededForNext = 250;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 max-w-2xl w-full space-y-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Achievements & Scholar Rank
              </h2>
              <p className="text-xs text-slate-400">
                Unlock honors, level up, and maintain daily learning streaks
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAchievementsModal(false)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Progression Card */}
        <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-950 border border-indigo-500/30 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                Current Title
              </span>
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                Level {level}: {levelTitle}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Total XP</span>
              <div className="text-xl font-mono font-bold text-amber-300">{xp} XP</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Next Level Progress</span>
              <span>
                {xpInCurrentLevel} / {xpNeededForNext} XP ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Earned Badges ({badges.filter((b) => b.unlocked).length} / {badges.length})
            </h3>
            <span className="text-xs text-amber-300 flex items-center gap-1 font-semibold">
              <Flame className="w-3.5 h-3.5" />
              {streakDays} Days Active Streak
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 transition ${
                  badge.unlocked
                    ? 'bg-slate-950/80 border-indigo-500/30 text-white'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-500 opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    badge.unlocked ? 'bg-indigo-600/20 border border-indigo-500/30' : 'bg-slate-900'
                  }`}
                >
                  {badge.icon}
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-200">{badge.title}</h4>
                    {badge.unlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">{badge.description}</p>
                  {badge.unlocked && badge.unlockedAt && (
                    <span className="text-[10px] text-indigo-400 font-medium block pt-1">
                      Unlocked: {badge.unlockedAt}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
