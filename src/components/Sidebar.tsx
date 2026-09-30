import React from 'react';
import {
  Bot,
  HelpCircle,
  CalendarCheck,
  CheckSquare,
  BookOpen,
  FileText,
  Code2,
  BarChart3,
  Award,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, weakTopics } = useApp();

  const navItems = [
    {
      id: 'tutor',
      label: 'AI Personal Tutor',
      shortLabel: 'AI Tutor',
      icon: Bot,
      color: 'text-indigo-400',
      badge: 'Step-by-Step',
    },
    {
      id: 'doubt',
      label: 'AI Doubt Solver',
      shortLabel: 'Doubt Solver',
      icon: HelpCircle,
      color: 'text-pink-400',
      badge: 'Image & Math',
    },
    {
      id: 'planner',
      label: 'Study Planner',
      shortLabel: 'Planner',
      icon: CalendarCheck,
      color: 'text-emerald-400',
    },
    {
      id: 'quiz',
      label: 'AI Quiz & Mock Test',
      shortLabel: 'Practice Quiz',
      icon: CheckSquare,
      color: 'text-amber-400',
    },
    {
      id: 'flashcards',
      label: 'AI Flashcards',
      shortLabel: 'Flashcards',
      icon: BookOpen,
      color: 'text-violet-400',
    },
    {
      id: 'docs',
      label: 'Doc Analyzer & Notes',
      shortLabel: 'Doc & Notes',
      icon: FileText,
      color: 'text-cyan-400',
    },
    {
      id: 'code',
      label: 'Programming Assistant',
      shortLabel: 'Code Assistant',
      icon: Code2,
      color: 'text-blue-400',
    },
    {
      id: 'analytics',
      label: 'Analytics & Weak Topics',
      shortLabel: 'Analytics',
      icon: BarChart3,
      color: 'text-rose-400',
      count: weakTopics.length > 0 ? weakTopics.length : undefined,
    },
  ];

  return (
    <aside className="w-full md:w-64 lg:w-72 bg-slate-900/60 border-r border-slate-800/80 p-3 md:p-4 flex flex-col justify-between shrink-0">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
          Learning Modules
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-white border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isActive ? 'bg-indigo-600/30 text-indigo-300' : 'bg-slate-800/80 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.count !== undefined && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {item.count} weak
                  </span>
                )}
                {item.badge && !item.count && (
                  <span className="hidden lg:inline text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Motivational Daily Challenge Box */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 hidden md:block">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/20 shadow-md">
          <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-indigo-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Today's Study Goal</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Review 1 weak topic & complete 1 practice quiz to earn <span className="text-amber-300 font-bold">+100 XP</span>!
          </p>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Daily Progress</span>
            <span className="font-semibold text-indigo-300">65%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-indigo-500 w-[65%]" />
          </div>
        </div>
      </div>
    </aside>
  );
};
