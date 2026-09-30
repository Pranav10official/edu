import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TutorView } from './components/TutorView';
import { DoubtSolverView } from './components/DoubtSolverView';
import { StudyPlannerView } from './components/StudyPlannerView';
import { QuizView } from './components/QuizView';
import { FlashcardsView } from './components/FlashcardsView';
import { DocAnalyzerView } from './components/DocAnalyzerView';
import { CodeAssistantView } from './components/CodeAssistantView';
import { AnalyticsView } from './components/AnalyticsView';
import { AchievementsModal } from './components/AchievementsModal';
import {
  Bot,
  HelpCircle,
  CalendarCheck,
  CheckSquare,
  BookOpen,
  FileText,
  Code2,
  BarChart3,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const mobileTabs = [
    { id: 'tutor', label: 'Tutor', icon: Bot },
    { id: 'doubt', label: 'Doubts', icon: HelpCircle },
    { id: 'planner', label: 'Plan', icon: CalendarCheck },
    { id: 'quiz', label: 'Quiz', icon: CheckSquare },
    { id: 'flashcards', label: 'Cards', icon: BookOpen },
    { id: 'docs', label: 'Docs', icon: FileText },
    { id: 'code', label: 'Code', icon: Code2 },
    { id: 'analytics', label: 'Stats', icon: BarChart3 },
  ];

  const renderActiveView = () => {
    switch (activeTab) {
      case 'tutor':
        return <TutorView />;
      case 'doubt':
        return <DoubtSolverView />;
      case 'planner':
        return <StudyPlannerView />;
      case 'quiz':
        return <QuizView />;
      case 'flashcards':
        return <FlashcardsView />;
      case 'docs':
        return <DocAnalyzerView />;
      case 'code':
        return <CodeAssistantView />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <TutorView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Header />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden pb-16 md:pb-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto min-h-0 bg-slate-950/50">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-medium transition cursor-pointer ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <AchievementsModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
