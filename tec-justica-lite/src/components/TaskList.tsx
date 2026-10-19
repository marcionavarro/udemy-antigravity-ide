import React from 'react';
import { Check, X, Calendar, AlertTriangle, ShieldCheck, Sparkles, Scale, FileDown } from 'lucide-react';
import { Task, LegalCase } from '../types';

interface TaskListProps {
  tasks: Task[];
  cases: LegalCase[];
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onViewCaseDefense: (caseItem: LegalCase, taskTitle?: string) => void;
  onLinkCaseToTask: (taskId: string, caseId: string) => void;
  onExportContractPDF?: (caseItem: LegalCase) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  cases,
  categories,
  selectedCategory,
  onSelectCategory,
  onToggleTask,
  onDeleteTask,
  onViewCaseDefense,
  onExportContractPDF,
}) => {
  // Filter tasks based on category
  const filteredTasks = selectedCategory === 'Todas'
    ? tasks
    : tasks.filter((t) => t.category === selectedCategory);

  // Helper for deadline status
  const getDeadlineStatus = (dueDate?: string) => {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = dueDate.split('-').map(Number);
    const deadline = new Date(year, month - 1, day);
    deadline.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Venceu há ${Math.abs(diffDays)}d`, isUrgent: true, color: 'text-red-400 bg-red-500/10 border-red-500/30' };
    }
    if (diffDays === 0) {
      return { label: 'Vence Hoje!', isUrgent: true, color: 'text-amber-300 bg-amber-500/20 border-amber-500/40 animate-pulse' };
    }
    if (diffDays === 1) {
      return { label: 'Amanhã', isUrgent: true, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    }
    return { label: `Em ${diffDays} dias`, isUrgent: false, color: 'text-slate-400 bg-slate-800/60 border-slate-700' };
  };

  return (
    <div className="w-full space-y-3">
      {/* Category Pills (Matching Reference Image) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onSelectCategory('Todas')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
            selectedCategory === 'Todas'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-[#141824] text-slate-300 hover:bg-[#1a2032] border border-slate-800'
          }`}
        >
          Todas
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#141824] text-slate-300 hover:bg-[#1a2032] border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 ? (
        <div className="bg-[#121624] border border-slate-800/80 rounded-2xl p-8 text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500">
            <Scale className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-300">
            {tasks.length === 0
              ? 'Nenhuma tarefa cadastrada ainda.'
              : `Nenhuma tarefa encontrada na categoria "${selectedCategory}".`}
          </p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Utilize o campo acima para registrar suas tarefas diárias, audiências e prazos processuais.
          </p>
        </div>
      ) : (
        /* Tasks List matching the reference screenshot */
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const linkedCase = cases.find((c) => c.id === task.caseId);
            const deadlineInfo = getDeadlineStatus(task.dueDate);

            return (
              <div
                key={task.id}
                className={`group relative bg-[#121624] border transition-all rounded-2xl p-3.5 flex flex-col gap-2 shadow-md ${
                  task.completed
                    ? 'border-slate-800/50 bg-[#0e121c]/70 opacity-75'
                    : 'border-slate-800 hover:border-amber-500/30'
                }`}
              >
                {/* Main Row */}
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Checkbox + Title */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        task.completed
                          ? 'bg-blue-600 border border-blue-500 text-white shadow-sm'
                          : 'border-2 border-slate-600 hover:border-amber-400 bg-[#090b10]'
                      }`}
                      aria-label={task.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
                    >
                      {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium leading-snug break-words ${
                          task.completed
                            ? 'line-through text-slate-500'
                            : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </p>

                      {/* Badges Row (Category & Deadline & Priority) */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {/* Category Pill matching screenshot blue style */}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40">
                          {task.category}
                        </span>

                        {/* Priority Badge */}
                        {task.priority === 'fatal' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600/20 text-red-300 border border-red-500/40 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Prazo Fatal
                          </span>
                        )}
                        {task.priority === 'alta' && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Alta Prioridade
                          </span>
                        )}

                        {/* Deadline Alert Pill */}
                        {deadlineInfo && (
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${deadlineInfo.color}`}
                          >
                            <Calendar className="w-3 h-3" />
                            {task.dueDate} {task.dueTime ? `às ${task.dueTime}` : ''} ({deadlineInfo.label})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Delete button (matching red X in reference image) */}
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
                    title="Excluir tarefa"
                    aria-label="Excluir tarefa"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Linked Case Footer & Quick AI Defense Advice Trigger */}
                {linkedCase ? (
                  <div className="pt-2 mt-1 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 text-xs text-amber-300/90 truncate">
                      <Scale className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <span className="font-semibold truncate">
                        {linkedCase.title}
                      </span>
                      <span className="text-slate-400 truncate">
                        • {linkedCase.clientName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onExportContractPDF && (
                        <button
                          onClick={() => onExportContractPDF(linkedCase)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-sm"
                          title="Exportar Contrato de Prestação de Serviços em PDF"
                        >
                          <FileDown className="w-3 h-3 text-emerald-400" />
                          <span>Contrato PDF</span>
                        </button>
                      )}

                      <button
                        onClick={() => onViewCaseDefense(linkedCase, task.title)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Estratégia & Leis IA</span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
