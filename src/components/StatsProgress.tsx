import React from 'react';
import { Trash2 } from 'lucide-react';
import { Task } from '../types';

interface StatsProgressProps {
  tasks: Task[];
  categories: string[];
  onDeleteCategory: (category: string) => void;
}

export const StatsProgress: React.FC<StatsProgressProps> = ({
  tasks,
  categories,
  onDeleteCategory,
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Compute breakdown per category
  const categoryStats = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat);
    const catCompleted = catTasks.filter((t) => t.completed).length;
    return {
      name: cat,
      total: catTasks.length,
      completed: catCompleted,
    };
  });

  return (
    <div className="w-full space-y-3">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📋</span> Minhas Tarefas e Prazos
        </h2>
        {totalTasks > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
            {totalTasks} {totalTasks === 1 ? 'registro' : 'registros'}
          </span>
        )}
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-1.5">
        <div className="relative w-full h-7 bg-[#141824] rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
            style={{ width: `${Math.max(percentage, totalTasks > 0 ? 8 : 0)}%` }}
          >
            {totalTasks > 0 && (
              <span className="text-[11px] font-bold text-black drop-shadow-sm px-1.5 py-0.5 bg-white/90 rounded-full">
                {percentage}%
              </span>
            )}
          </div>
        </div>

        {/* Counters */}
        <div className="flex items-center justify-between text-xs px-1 text-slate-400">
          <span className="font-medium text-emerald-400">
            {completedTasks} concluída{completedTasks !== 1 ? 's' : ''}
          </span>
          <span className="font-medium text-amber-400">
            {pendingTasks} pendente{pendingTasks !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Category Breakdown Card (only show if there are categories) */}
      {categoryStats.length > 0 && (
        <div className="bg-[#121624] border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/60 shadow-lg">
          {categoryStats.map((stat) => (
            <div
              key={stat.name}
              className="flex items-center justify-between px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="font-semibold text-white">{stat.name}</span>
                <span className="text-slate-400">
                  {stat.completed} de {stat.total} feitos
                </span>
              </div>
              <button
                onClick={() => onDeleteCategory(stat.name)}
                className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                title={`Excluir categoria "${stat.name}" e desassociar tarefas`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
