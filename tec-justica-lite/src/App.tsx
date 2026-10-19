/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { StatsProgress } from './components/StatsProgress';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { CasesListView } from './components/CasesListView';
import { InlineCaseForm } from './components/InlineCaseForm';
import { DefenseDrawer } from './components/DefenseDrawer';
import { ProfileModal } from './components/ProfileModal';
import { CompanyInfoModal } from './components/CompanyInfoModal';
import { ContractExportModal } from './components/ContractExportModal';
import { Navigation, AppView } from './components/Navigation';
import { generateContractPDF } from './services/contractPdf';
import { requestDefenseAnalysis } from './services/api';
import {
  registerUser,
  loginUser,
  logoutUser,
  checkSession,
  hasRegisteredAccount,
  getEncryptionKeyFromPassword,
} from './services/authStore';
import { initDB, saveEncrypted, loadDecrypted, migrateFromLocalStorage } from './services/db';
import { Task, LegalCase, LawyerProfile, TaskPriority } from './types';
import { Sparkles, Scale, CheckCircle2, UserCheck } from 'lucide-react';

// ─── Chaves para persistência em IndexedDB ──────────────────────
const DB_KEYS = {
  PROFILE: 'profile',
  TASKS: 'tasks',
  CASES: 'cases',
  CATEGORIES: 'categories',
};

export default function App() {
  // ─── Estado de Autenticação ─────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [hasExistingAccount, setHasExistingAccount] = useState(false);
  const [loginProcessing, setLoginProcessing] = useState(false);

  // Chave de criptografia mantida em memória após login
  const cryptoKeyRef = useRef<CryptoKey | null>(null);

  // ─── Estado do App (100% BLANK por padrão) ─────────────────────
  const [profile, setProfile] = useState<LawyerProfile>({ name: '', specialty: '', oab: '' });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [categories, setCategories] = useState<string[]>(['Geral']);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [currentView, setCurrentView] = useState<AppView>('tarefas');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState<LegalCase | null>(null);
  const [casePromptPdf, setCasePromptPdf] = useState<LegalCase | null>(null);
  const [isCaseFormOpen, setIsCaseFormOpen] = useState(false);

  // Defense Drawer & AI State
  const [isDefenseDrawerOpen, setIsDefenseDrawerOpen] = useState(false);
  const [activeCaseForDefense, setActiveCaseForDefense] = useState<LegalCase | null>(null);
  const [activeTaskTitleForDefense, setActiveTaskTitleForDefense] = useState<string | undefined>(undefined);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // ─── Verificação Inicial de Sessão ─────────────────────────────
  useEffect(() => {
    async function checkAuth() {
      try {
        await initDB();
        const accountExists = await hasRegisteredAccount();
        setHasExistingAccount(accountExists);

        const session = checkSession();
        if (session.valid) {
          // Sessão válida — mas precisamos da senha para derivar a chave.
          // Se temos uma sessão válida mas sem chave, mostrar tela de login
          // para obter a senha novamente (sem necessidade de recriar conta).
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Erro na verificação de autenticação:', err);
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  // ─── Carregar dados criptografados após autenticação ───────────
  const loadEncryptedData = useCallback(async (key: CryptoKey) => {
    try {
      // Migrar dados legados do localStorage se existirem
      await migrateFromLocalStorage(key);

      const [savedProfile, savedTasks, savedCases, savedCategories] = await Promise.all([
        loadDecrypted<LawyerProfile>(DB_KEYS.PROFILE, key),
        loadDecrypted<Task[]>(DB_KEYS.TASKS, key),
        loadDecrypted<LegalCase[]>(DB_KEYS.CASES, key),
        loadDecrypted<string[]>(DB_KEYS.CATEGORIES, key),
      ]);

      if (savedProfile) setProfile(savedProfile);
      if (savedTasks) setTasks(savedTasks);
      if (savedCases) setCases(savedCases);
      if (savedCategories) setCategories(savedCategories);

      setDataLoaded(true);
    } catch (err) {
      console.error('Erro ao carregar dados criptografados:', err);
      setDataLoaded(true);
    }
  }, []);

  // ─── Persistir dados automaticamente quando mudam ──────────────
  useEffect(() => {
    if (!dataLoaded || !cryptoKeyRef.current) return;
    saveEncrypted(DB_KEYS.PROFILE, profile, cryptoKeyRef.current).catch(console.error);
  }, [profile, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded || !cryptoKeyRef.current) return;
    saveEncrypted(DB_KEYS.TASKS, tasks, cryptoKeyRef.current).catch(console.error);
  }, [tasks, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded || !cryptoKeyRef.current) return;
    saveEncrypted(DB_KEYS.CASES, cases, cryptoKeyRef.current).catch(console.error);
  }, [cases, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded || !cryptoKeyRef.current) return;
    saveEncrypted(DB_KEYS.CATEGORIES, categories, cryptoKeyRef.current).catch(console.error);
  }, [categories, dataLoaded]);

  // ─── Handlers de Autenticação ──────────────────────────────────
  const handleLogin = async (email: string, password: string) => {
    setLoginProcessing(true);
    setAuthError(null);
    try {
      await loginUser(email, password);
      const key = await getEncryptionKeyFromPassword(password);
      cryptoKeyRef.current = key;
      await loadEncryptedData(key);
      setIsAuthenticated(true);
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao fazer login.');
    } finally {
      setLoginProcessing(false);
    }
  };

  const handleRegister = async (email: string, password: string) => {
    setLoginProcessing(true);
    setAuthError(null);
    try {
      await registerUser(email, password);
      const key = await getEncryptionKeyFromPassword(password);
      cryptoKeyRef.current = key;
      await loadEncryptedData(key);
      setIsAuthenticated(true);
      setHasExistingAccount(true);
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoginProcessing(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    cryptoKeyRef.current = null;
    setIsAuthenticated(false);
    setDataLoaded(false);
    // Reset state
    setProfile({ name: '', specialty: '', oab: '' });
    setTasks([]);
    setCases([]);
    setCategories(['Geral']);
    setCurrentView('tarefas');
    setIsProfileModalOpen(false);
    setIsCompanyModalOpen(false);
    setIsDefenseDrawerOpen(false);
  };

  // ─── Task Operations ──────────────────────────────────────────
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

  // ─── Case Operations ──────────────────────────────────────────
  const handleSaveCase = async (
    caseData: Omit<LegalCase, 'id' | 'createdAt' | 'updatedAt' | 'analysis'>,
    options?: { andAnalyze?: boolean; andExportPdf?: boolean }
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

    if (options?.andExportPdf) {
      try {
        generateContractPDF(savedCase, profile);
      } catch (err) {
        console.error('Erro ao gerar PDF do contrato:', err);
        alert('Erro ao gerar o contrato em PDF.');
      }
    } else if (!options?.andAnalyze) {
      // Abre modal oferecendo o download imediato do PDF
      setCasePromptPdf(savedCase);
    }

    if (options?.andAnalyze) {
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
  };

  // ─── AI Defense Trigger ────────────────────────────────────────
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

  // ─── Tela de carregamento inicial ──────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#090b10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
          <p className="text-xs text-amber-300/70 font-medium">Carregando Tec Justiça Lite...</p>
        </div>
      </div>
    );
  }

  // ─── Tela de Login / Registro ──────────────────────────────────
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onAuthenticated={handleLogin}
        onRegister={handleRegister}
        isLoading={loginProcessing}
        error={authError}
        hasAccount={hasExistingAccount}
      />
    );
  }

  // ─── App Principal (após autenticação) ─────────────────────────
  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col pb-24 select-none">
      {/* Top Header */}
      <Header
        profile={profile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenCompanyInfo={() => setIsCompanyModalOpen(true)}
        onLogout={handleLogout}
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

        {/* API Key Alert Banner */}
        {profile.name && !profile.geminiApiKey && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-[#131724] to-[#121624] border border-blue-500/30 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Configure a IA de Defesa
                </p>
                <p className="text-[11px] text-slate-400">
                  Insira sua chave do Gemini API no Perfil para ativar a consultoria jurídica inteligente.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-200 font-semibold text-xs shrink-0 transition-colors"
            >
              Configurar
            </button>
          </div>
        )}

        {/* View Switcher Tabs */}
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

        {/* View: Tarefas */}
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
                setIsCaseFormOpen(true);
                setCurrentView('casos');
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
              onExportContractPDF={(caseItem) => {
                try {
                  generateContractPDF(caseItem, profile);
                } catch (err) {
                  console.error('Erro ao gerar contrato em PDF:', err);
                  alert('Erro ao gerar o contrato em PDF.');
                }
              }}
            />
          </div>
        )}

        {/* View: Casos & Defesa (com formulário inline) */}
        {currentView === 'casos' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Formulário inline para cadastro/edição de caso */}
            <InlineCaseForm
              lawyerProfile={profile}
              caseToEdit={caseToEdit}
              isExpanded={isCaseFormOpen || cases.length === 0}
              onToggleExpand={setIsCaseFormOpen}
              onSaveCase={handleSaveCase}
              onCancelEdit={() => {
                setCaseToEdit(null);
                setIsCaseFormOpen(false);
              }}
            />

            {/* Lista de casos existentes */}
            <CasesListView
              cases={cases}
              tasks={tasks}
              lawyerProfile={profile}
              onOpenNewCaseModal={() => {
                setCaseToEdit(null);
                setIsCaseFormOpen(true);
                // Scroll to top to expand the InlineCaseForm
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
        onLogout={handleLogout}
      />

      <CompanyInfoModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
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

      <ContractExportModal
        isOpen={!!casePromptPdf}
        onClose={() => setCasePromptPdf(null)}
        caseItem={casePromptPdf}
        lawyerProfile={profile}
        onOpenDefense={(c) => handleOpenDefense(c)}
      />
    </div>
  );
}
