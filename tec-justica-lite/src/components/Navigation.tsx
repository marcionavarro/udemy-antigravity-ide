import React from 'react';
import { CheckSquare, Scale, User, Info } from 'lucide-react';

export type AppView = 'tarefas' | 'casos';

interface NavigationProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  pendingTasksCount: number;
  casesCount: number;
  onOpenProfile: () => void;
  onOpenCompanyInfo: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onChangeView,
  pendingTasksCount,
  casesCount,
  onOpenProfile,
  onOpenCompanyInfo,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0d14]/95 backdrop-blur-md border-t border-amber-500/20 px-3 py-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Tarefas Tab */}
        <button
          onClick={() => onChangeView('tarefas')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
            currentView === 'tarefas'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <CheckSquare className="w-5 h-5" />
            {pendingTasksCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-black text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                {pendingTasksCount > 99 ? '99+' : pendingTasksCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Tarefas</span>
        </button>

        {/* Casos & Defesa Tab */}
        <button
          onClick={() => onChangeView('casos')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
            currentView === 'casos'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Scale className="w-5 h-5" />
            {casesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-slate-700 text-amber-300 text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-amber-500/40">
                {casesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Casos & Defesa</span>
        </button>

        {/* Profile Button */}
        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Meu Perfil</span>
        </button>

        {/* Info & WhatsApp Button */}
        <button
          onClick={onOpenCompanyInfo}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
        >
          <Info className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Contato</span>
        </button>
      </div>
    </div>
  );
};
