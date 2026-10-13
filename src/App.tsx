/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsProgress } from './components/StatsProgress';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { CasesListView } from './components/CasesListView';
import { CaseModal } from './components/CaseModal';
import { DefenseDrawer } from './components/DefenseDrawer';
import { ProfileModal } from './components/ProfileModal';
import { CompanyInfoModal } from './components/CompanyInfoModal';
import { Navigation, AppView } from './components/Navigation';
import { requestDefenseAnalysis } from './services/api';
import { Task, LegalCase, LawyerProfile, TaskPriority } from './types';
import { Sparkles, Scale, CheckCircle2, UserCheck } from 'lucide-react';

const STORAGE_KEYS = {
  PROFILE: 'tecjustica_profile_v1',
  TASKS: 'tecjustica_tasks_v1',
  CASES: 'tecjustica_cases_v1',
  CATEGORIES: 'tecjustica_categories_v1',
};

export default function App() {
  // State 100% BLANK by default as requested: no sample data pre-filled
  const [profile, setProfile] = useState<LawyerProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : { name: '', specialty: '', oab: '' };
    } catch {
      return { name: '', specialty: '', oab: '' };
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cases, setCases] = useState<LegalCase[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CASES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : ['Geral'];
    } catch {
      return ['Geral'];
    }
  });

  const [currentView, setCurrentView] = useState<AppView>('tarefas');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState<LegalCase | null>(null);

  // Defense Drawer & AI State
  const [isDefenseDrawerOpen, setIsDefenseDrawerOpen] = useState(false);
  const [activeCaseForDefense, setActiveCaseForDefense] = useState<LegalCase | null>(null);
  const [activeTaskTitleForDefense, setActiveTaskTitleForDefense] = useState<string | undefined>(undefined);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  // Task Operations
  const handleAddTask = (data: {
    title: string;
    category: string;
    caseId?: string;
    dueDate?: string;
    dueTime?: string;
    priority?: TaskPriority;
    notes?: string;
  }) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: data.title,
      category: data.category || 'Geral',
      completed: false,
      caseId: data.caseId,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      priority: data.priority || 'normal',
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleAddCategory = (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    if (!categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
    }
  };

  const handleDeleteCategory = (categoryName: string) => {
    setCategories((prev) => prev.filter((c) => c !== categoryName));
    if (selectedCategory === categoryName) {
      setSelectedCategory('Todas');
    }
  };

  // Case Operations
  const handleSaveCase = async (
    caseData: Omit<LegalCase, 'id' | 'createdAt' | 'updatedAt' | 'analysis'>,
    andAnalyze?: boolean
  ) => {
    let savedCase: LegalCase;

    if (caseToEdit) {
      // Edit existing
      savedCase = {
        ...caseToEdit,
        ...caseData,
        updatedAt: new Date().toISOString(),
      };
      setCases((prev) => prev.map((c) => (c.id === caseToEdit.id ? savedCase : c)));
      setCaseToEdit(null);
    } else {
      // Create new
      savedCase = {
        id: crypto.randomUUID(),
        ...caseData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCases((prev) => [savedCase, ...prev]);
    }

    if (andAnalyze) {
      handleOpenDefense(savedCase);
    }
  };

  const handleDeleteCase = (caseId: string) => {
    if (confirm('Tem certeza que deseja excluir este caso? As tarefas associadas serão mantidas.')) {
      setCases((prev) => prev.filter((c) => c.id !== caseId));
      setTasks((prev) =>
        prev.map((t) => (t.caseId === caseId ? { ...t, caseId: undefined } : t))
      );
    }
  };

  const handleEditCase = (caseItem: LegalCase) => {
    setCaseToEdit(caseItem);
    setIsCaseModalOpen(true);
  };

  // AI Defense Trigger
  const handleOpenDefense = async (caseItem: LegalCase, taskTitle?: string) => {
    setActiveCaseForDefense(caseItem);
    setActiveTaskTitleForDefense(taskTitle);
    setIsDefenseDrawerOpen(true);

    // If analysis does not exist yet, trigger it immediately
    if (!caseItem.analysis) {
      setIsAiLoading(true);
      try {
        const analysis = await requestDefenseAnalysis({
          lawyer: profile,
          caseItem,
          taskTitle,
        });

        const updatedCase: LegalCase = {
          ...caseItem,
          analysis,
          updatedAt: new Date().toISOString(),
        };

        setActiveCaseForDefense(updatedCase);
        setCases((prev) => prev.map((c) => (c.id === caseItem.id ? updatedCase : c)));
      } catch (err: any) {
        console.error('Falha ao obter consultoria jurídica:', err);
        alert(err.message || 'Erro ao gerar análise jurídica.');
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  const handleRefreshDefense = async (updatedCircumstances?: string) => {
    if (!activeCaseForDefense) return;

    setIsAiLoading(true);
    try {
      const caseToProcess: LegalCase = {
        ...activeCaseForDefense,
        circumstances:
          updatedCircumstances !== undefined
            ? updatedCircumstances
            : activeCaseForDefense.circumstances,
      };

      const analysis = await requestDefenseAnalysis({
        lawyer: profile,
        caseItem: caseToProcess,
        taskTitle: activeTaskTitleForDefense,
      });

      const updatedCase: LegalCase = {
        ...caseToProcess,
        analysis,
        updatedAt: new Date().toISOString(),
      };

      setActiveCaseForDefense(updatedCase);
      setCases((prev) => prev.map((c) => (c.id === updatedCase.id ? updatedCase : c)));
    } catch (err: any) {
      console.error('Erro ao atualizar análise jurídica:', err);
      alert(err.message || 'Erro ao recalcular análise jurídica.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col pb-24 select-none">
      {/* Top Header */}
      <Header
        profile={profile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenCompanyInfo={() => setIsCompanyModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 space-y-4">
        {/* Lawyer Profile Welcome Banner (if name is not set yet) */}
        {!profile.name && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#131724] to-[#121624] border border-amber-500/30 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">
                  Identifique-se como Advogado(a)
                </p>
                <p className="text-[11px] text-slate-400">
                  Informe seu nome e especialidade jurídica para que a IA personalize as teses e leis.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="px-3 py-1.5 rounded-xl gold-gradient-btn text-black font-semibold text-xs shrink-0 shadow-md"
            >
              Definir Perfil
            </button>
          </div>
        )}

        {/* View Switcher Tabs (For Desktop / Quick Access) */}
        <div className="grid grid-cols-2 p-1 bg-[#121624] border border-slate-800 rounded-2xl">
          <button
            onClick={() => setCurrentView('tarefas')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              currentView === 'tarefas'
                ? 'bg-[#1e2538] text-amber-400 shadow-md border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📋</span> Minhas Tarefas ({tasks.length})
          </button>
          <button
            onClick={() => setCurrentView('casos')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              currentView === 'casos'
                ? 'bg-[#1e2538] text-amber-400 shadow-md border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚖️</span> Casos & Defesa ({cases.length})
          </button>
        </div>

        {/* View: Tarefas (Matching layout of reference image) */}
        {currentView === 'tarefas' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Top Progress & Categories Breakdown */}
            <StatsProgress
              tasks={tasks}
              categories={categories}
              onDeleteCategory={handleDeleteCategory}
            />

            {/* Task Input Form */}
            <TaskForm
              categories={categories}
              cases={cases}
              onAddTask={handleAddTask}
              onAddCategory={handleAddCategory}
              onOpenNewCaseModal={() => {
                setCaseToEdit(null);
                setIsCaseModalOpen(true);
              }}
            />

            {/* Filter Pills & Task List */}
            <TaskList
              tasks={tasks}
              cases={cases}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onViewCaseDefense={(caseItem, taskTitle) =>
                handleOpenDefense(caseItem, taskTitle)
              }
              onLinkCaseToTask={(taskId, caseId) => {
                setTasks((prev) =>
                  prev.map((t) => (t.id === taskId ? { ...t, caseId } : t))
                );
              }}
            />
          </div>
        )}

        {/* View: Casos & Defesa */}
        {currentView === 'casos' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <CasesListView
              cases={cases}
              tasks={tasks}
              onOpenNewCaseModal={() => {
                setCaseToEdit(null);
                setIsCaseModalOpen(true);
              }}
              onEditCase={handleEditCase}
              onDeleteCase={handleDeleteCase}
              onViewDefense={(caseItem) => handleOpenDefense(caseItem)}
            />
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation */}
      <Navigation
        currentView={currentView}
        onChangeView={setCurrentView}
        pendingTasksCount={pendingTasksCount}
        casesCount={cases.length}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenCompanyInfo={() => setIsCompanyModalOpen(true)}
      />

      {/* Modals & Drawers */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSave={(updated) => setProfile(updated)}
      />

      <CompanyInfoModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
      />

      <CaseModal
        isOpen={isCaseModalOpen}
        onClose={() => {
          setIsCaseModalOpen(false);
          setCaseToEdit(null);
        }}
        caseToEdit={caseToEdit}
        lawyerProfile={profile}
        onSaveCase={handleSaveCase}
      />

      <DefenseDrawer
        isOpen={isDefenseDrawerOpen}
        onClose={() => {
          setIsDefenseDrawerOpen(false);
          setActiveCaseForDefense(null);
          setActiveTaskTitleForDefense(undefined);
        }}
        caseItem={activeCaseForDefense}
        taskTitle={activeTaskTitleForDefense}
        lawyerProfile={profile}
        isLoading={isAiLoading}
        onRefreshAnalysis={handleRefreshDefense}
      />
    </div>
  );
}
