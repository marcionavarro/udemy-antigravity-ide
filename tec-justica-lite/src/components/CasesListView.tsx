import React from 'react';
import { Scale, Plus, Sparkles, Edit2, Trash2, Calendar, User, FileText } from 'lucide-react';
import { LegalCase, Task } from '../types';

interface CasesListViewProps {
  cases: LegalCase[];
  tasks: Task[];
  onOpenNewCaseModal: () => void;
  onEditCase: (caseItem: LegalCase) => void;
  onDeleteCase: (caseId: string) => void;
  onViewDefense: (caseItem: LegalCase) => void;
}

export const CasesListView: React.FC<CasesListViewProps> = ({
  cases,
  tasks,
  onOpenNewCaseModal,
  onEditCase,
  onDeleteCase,
  onViewDefense,
}) => {
  return (
    <div className="w-full space-y-4">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>⚖️</span> Casos & Causas Cadastradas
          </h2>
          <p className="text-xs text-slate-400">
            Gerencie os processos e consulte o enredo de defesa e leis sugeridas
          </p>
        </div>

        <button
          onClick={onOpenNewCaseModal}
          className="px-3.5 py-2 rounded-xl gold-gradient-btn text-black font-semibold text-xs flex items-center gap-1.5 shadow-md shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Caso
        </button>
      </div>

      {/* Cases List */}
      {cases.length === 0 ? (
        <div className="bg-[#121624] border border-slate-800/80 rounded-2xl p-8 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Scale className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-slate-200">
            Nenhum caso cadastrado no momento.
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Cadastre um processo ou caso para ativar a inteligência de defesa, teses aplicáveis e leis sugeridas para o advogado.
          </p>
          <button
            onClick={onOpenNewCaseModal}
            className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium text-xs inline-flex items-center gap-2 border border-amber-500/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Cadastrar Primeiro Caso
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((caseItem) => {
            const linkedTasksCount = tasks.filter((t) => t.caseId === caseItem.id).length;
            const hasAnalysis = Boolean(caseItem.analysis);

            return (
              <div
                key={caseItem.id}
                className="bg-[#121624] border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 space-y-3 transition-all shadow-md group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {caseItem.area}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {caseItem.clientRole}
                      </span>
                      {caseItem.court && (
                        <span className="text-[10px] text-slate-400">
                          {caseItem.court}
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-sm sm:text-base text-white group-hover:text-amber-200 transition-colors leading-snug truncate">
                      {caseItem.title}
                    </h3>

                    <p className="text-xs text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      Cliente: <span className="font-medium text-white">{caseItem.clientName}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditCase(caseItem)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Editar caso / circunstâncias"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCase(caseItem.id)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      title="Excluir caso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Facts preview */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed bg-[#0a0d15] p-2.5 rounded-xl border border-slate-800/60">
                  {caseItem.factsDescription || 'Sem descrição fática detalhada.'}
                </p>

                {/* Footer with linked tasks and AI button */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {linkedTasksCount} {linkedTasksCount === 1 ? 'prazo/tarefa' : 'prazos/tarefas'}
                    </span>
                    {caseItem.circumstances && (
                      <span className="text-[11px] text-amber-400/90 font-medium">
                        ✦ Circunstâncias anotadas
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onViewDefense(caseItem)}
                    className="px-3 py-1.5 rounded-xl gold-gradient-btn text-black font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{hasAnalysis ? 'Ver Enredo & Leis IA' : 'Gerar Enredo de Defesa'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
