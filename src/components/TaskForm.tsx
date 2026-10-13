import React, { useState } from 'react';
import { Plus, Briefcase, Calendar, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { LegalCase, TaskPriority } from '../types';

interface TaskFormProps {
  categories: string[];
  cases: LegalCase[];
  onAddTask: (data: {
    title: string;
    category: string;
    caseId?: string;
    dueDate?: string;
    dueTime?: string;
    priority?: TaskPriority;
    notes?: string;
  }) => void;
  onAddCategory: (categoryName: string) => void;
  onOpenNewCaseModal: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  categories,
  cases,
  onAddTask,
  onAddCategory,
  onOpenNewCaseModal,
}) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || 'Geral');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced fields
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [dueTime, setDueTime] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>('normal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    let finalCategory = selectedCategory;

    // If user typed a new category, add and use it
    if (newCategoryInput.trim()) {
      const trimmedCat = newCategoryInput.trim();
      onAddCategory(trimmedCat);
      finalCategory = trimmedCat;
    } else if (!finalCategory) {
      finalCategory = 'Geral';
    }

    onAddTask({
      title: taskTitle.trim(),
      category: finalCategory,
      caseId: selectedCaseId || undefined,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      priority,
    });

    // Reset form
    setTaskTitle('');
    setNewCategoryInput('');
    setSelectedCaseId('');
    setDueDate('');
    setDueTime('');
    setPriority('normal');
    setShowAdvanced(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#121624] border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-xl"
    >
      {/* Primary Input */}
      <div>
        <input
          type="text"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="Nova tarefa..."
          className="w-full px-3.5 py-3 rounded-xl bg-[#090b10] border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm transition-all"
        />
      </div>

      {/* Primary Actions Row (Matching layout in screenshot) */}
      <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
        {/* Category Dropdown */}
        <div className="relative flex-1 min-w-[120px]">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full appearance-none px-3 py-2.5 rounded-xl bg-[#090b10] border border-slate-700/80 text-slate-200 text-xs font-medium focus:outline-none focus:border-amber-400 pr-8 transition-colors cursor-pointer"
          >
            {categories.length === 0 ? (
              <option value="Geral">Geral</option>
            ) : (
              categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))
            )}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* New Category Input */}
        <div className="flex-1 min-w-[140px]">
          <input
            type="text"
            value={newCategoryInput}
            onChange={(e) => setNewCategoryInput(e.target.value)}
            placeholder="Nova categoria (opcional)"
            className="w-full px-3 py-2.5 rounded-xl bg-[#090b10] border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 transition-all"
          />
        </div>

        {/* Add Button */}
        <button
          type="submit"
          disabled={!taskTitle.trim()}
          className="px-5 py-2.5 rounded-xl gold-gradient-btn text-black font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar
        </button>
      </div>

      {/* Advanced Toggle (Link Case, Deadline Alert, Priority) */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-amber-400/90 hover:text-amber-300 flex items-center gap-1.5 transition-colors font-medium"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>
            {showAdvanced ? 'Ocultar detalhes jurídicos' : '+ Vincular Caso / Prazo Processual'}
          </span>
          {showAdvanced ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showAdvanced && (
          <div className="mt-3 p-3 rounded-xl bg-[#090b10] border border-amber-500/20 space-y-3 animate-in fade-in duration-200">
            {/* Link to Legal Case */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1 flex items-center justify-between">
                <span>Vincular a um Caso / Causa a Defender</span>
                <button
                  type="button"
                  onClick={onOpenNewCaseModal}
                  className="text-amber-400 hover:text-amber-300 lowercase text-[11px] underline"
                >
                  + cadastrar novo caso
                </button>
              </label>

              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#141824] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="">Nenhum caso vinculado (Tarefa geral)</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    ⚖️ {c.title} — {c.clientName} ({c.area})
                  </option>
                ))}
              </select>
              {cases.length === 0 && (
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  Nenhum caso cadastrado ainda. Cadastre um caso para ativar a inteligência de defesa.
                </p>
              )}
            </div>

            {/* Date & Time (Deadline / Audiência) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-400" /> Prazo Fatal / Audiência
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#141824] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                  Horário (Opcional)
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#141824] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Priority Selection */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                Prioridade da Demanda
              </label>
              <div className="flex gap-2">
                {(['baixa', 'normal', 'alta', 'fatal'] as TaskPriority[]).map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`text-[11px] px-2.5 py-1 rounded-md capitalize border transition-all ${
                      priority === p
                        ? p === 'fatal'
                          ? 'bg-red-500/20 border-red-500 text-red-300 font-bold'
                          : p === 'alta'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-700 border-amber-400 text-white font-medium'
                        : 'bg-[#141824] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p === 'fatal' ? '🚨 Prazo Fatal' : p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};
