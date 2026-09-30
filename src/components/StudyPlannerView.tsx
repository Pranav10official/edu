import React, { useState } from 'react';
import {
  CalendarCheck,
  Sparkles,
  Clock,
  CheckCircle,
  Circle,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Target,
  RefreshCw,
  Plus,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateStudyPlan } from '../services/api';
import { StudyPlan } from '../types';

export const StudyPlannerView: React.FC = () => {
  const {
    savedStudyPlan,
    setSavedStudyPlan,
    togglePlanTask,
    language,
    addXP,
  } = useApp();

  const [examName, setExamName] = useState('Final Semester Exams & AP Tests');
  const [examDate, setExamDate] = useState('2026-10-25');
  const [dailyHours, setDailyHours] = useState(3.5);
  const [subjectInputs, setSubjectInputs] = useState<string[]>([
    'Physics (Mechanics & Electromagnetism)',
    'Calculus & Applied Math',
    'Organic Chemistry',
    'Data Structures & Algorithms',
  ]);
  const [newSubject, setNewSubject] = useState('');
  const [weaknesses, setWeaknesses] = useState('Calculus Integrals, Lenz Law, Circuit Analysis');
  const [strengths, setStrengths] = useState('Kinematics, Thermodynamics, Python basics');
  const [targetScore, setTargetScore] = useState('Top 5% / 95%+ Distinction');
  const [isLoading, setIsLoading] = useState(false);
  const [activeDayTab, setActiveDayTab] = useState(0);

  const handleAddSubject = () => {
    if (newSubject.trim() && !subjectInputs.includes(newSubject.trim())) {
      setSubjectInputs([...subjectInputs, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (idx: number) => {
    setSubjectInputs(subjectInputs.filter((_, i) => i !== idx));
  };

  const handleGeneratePlan = async () => {
    if (subjectInputs.length === 0 || isLoading) return;

    setIsLoading(true);
    try {
      const plan = await generateStudyPlan({
        subjects: subjectInputs,
        examName,
        examDate,
        dailyHours,
        strengths,
        weaknesses,
        targetScore,
        language,
      });

      setSavedStudyPlan(plan);
      setActiveDayTab(0);
      addXP(50, 'Generated AI Personalized Study Roadmap');
    } catch (err: any) {
      console.error(err);
      alert(`Could not generate study plan: ${err.message || 'Please check your connection and retry.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate task completion percentage
  const totalTasks =
    savedStudyPlan?.dailySchedule.reduce((acc, d) => acc + d.tasks.length, 0) || 0;
  const completedTasks =
    savedStudyPlan?.dailySchedule.reduce(
      (acc, d) => acc + d.tasks.filter((t) => t.completed).length,
      0
    ) || 0;
  const planProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/20 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Personalized Study Planner & Smart Revision
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Gemini builds daily schedules, revision blocks, and active task tracking tailored to your goals
            </p>
          </div>
        </div>

        {savedStudyPlan && (
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs">
            <div className="text-right">
              <div className="text-[10px] text-slate-400">Roadmap Progress</div>
              <div className="font-bold text-emerald-400">
                {completedTasks}/{totalTasks} Tasks ({planProgress}%)
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-emerald-500/40 flex items-center justify-center font-bold text-xs text-white">
              {planProgress}%
            </div>
          </div>
        )}
      </div>

      {/* Plan Creator Form / Config */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Study Goals & Exam Timeline
          </h2>
          <span className="text-xs text-slate-400">Language: {language}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Target Exam / Goal
            </label>
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="e.g. SAT, JEE, Semester Finals"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Target Exam Date
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Daily Study Hours ({dailyHours} hrs/day)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={dailyHours}
              onChange={(e) => setDailyHours(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 mt-2"
            />
          </div>
        </div>

        {/* Subjects List */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Subjects & Core Topics
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {subjectInputs.map((sub, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1.5 bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-xl text-xs"
              >
                <span>{sub}</span>
                <button
                  onClick={() => handleRemoveSubject(idx)}
                  className="text-slate-400 hover:text-rose-400 font-bold ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
              placeholder="Add another subject or chapter..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-slate-100"
            />
            <button
              onClick={handleAddSubject}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Weak Topics (Given higher revision frequency)
            </label>
            <input
              type="text"
              value={weaknesses}
              onChange={(e) => setWeaknesses(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Strong Topics (Consolidation & practice tests)
            </label>
            <input
              type="text"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleGeneratePlan}
            disabled={isLoading || subjectInputs.length === 0}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-40 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Crafting Personalized Schedule...' : 'Generate AI Study Schedule'}</span>
          </button>
        </div>
      </div>

      {/* Render Saved or Generated Plan */}
      {savedStudyPlan && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Plan Overview & Milestones */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active Study Roadmap
                </span>
                <span className="text-xs text-slate-400">
                  Target: {savedStudyPlan.planTitle}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-2">
                {savedStudyPlan.planTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                {savedStudyPlan.overview}
              </p>
            </div>

            {/* Weekly Milestones */}
            {savedStudyPlan.weeklyMilestones && savedStudyPlan.weeklyMilestones.length > 0 && (
              <div className="pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Key Strategic Milestones
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {savedStudyPlan.weeklyMilestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-emerald-400">{m.week}</span>
                        <span className="text-slate-400">{m.goal}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {m.priorityTopics.map((pt, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                          >
                            {pt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Daily Schedule Tabs & Task Checklist */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Daily Action Plan & Task Checklist
              </h3>
              <span className="text-xs text-slate-400">Click task to complete & earn XP</span>
            </div>

            {/* Days Horizontal Tab Bar */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {savedStudyPlan.dailySchedule.map((day, idx) => {
                const dayDone = day.tasks.every((t) => t.completed);
                const isSelected = activeDayTab === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveDayTab(idx)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-2 shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span>{day.day}</span>
                    {dayDone ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                    ) : (
                      <span className="text-[10px] opacity-75">{day.allocatedHours}h</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Day View */}
            {savedStudyPlan.dailySchedule[activeDayTab] && (
              <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="text-base font-bold text-white">
                      {savedStudyPlan.dailySchedule[activeDayTab].day}
                    </h4>
                    <p className="text-xs text-emerald-400 font-medium">
                      Focus: {savedStudyPlan.dailySchedule[activeDayTab].focusSubject}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Allocated: {savedStudyPlan.dailySchedule[activeDayTab].allocatedHours} Hours</span>
                  </div>
                </div>

                {/* Task Checklist */}
                <div className="space-y-2.5">
                  {savedStudyPlan.dailySchedule[activeDayTab].tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => togglePlanTask(activeDayTab, task.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                        task.completed
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400'
                          : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 text-slate-100'
                      }`}
                    >
                      <button className="mt-0.5 shrink-0">
                        {task.completed ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500 hover:text-emerald-400 transition" />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-sm font-medium ${
                              task.completed ? 'line-through text-slate-400' : 'text-slate-100'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                            {task.type} • {task.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Revision & Spaced Repetition Advice */}
            {savedStudyPlan.smartRevisionTips && (
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4" />
                  <span>Cognitive Science & Spaced Repetition Advice</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {savedStudyPlan.smartRevisionTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
