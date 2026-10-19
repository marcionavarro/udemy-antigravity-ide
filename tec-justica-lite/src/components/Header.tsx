import React from 'react';
import { JusticeLogo } from './JusticeLogo';
import { LawyerProfile } from '../types';
import { User, Info, Calendar, LogOut, Sparkles } from 'lucide-react';

interface HeaderProps {
  profile: LawyerProfile;
  isAiActive?: boolean;
  onOpenProfile: () => void;
  onOpenCompanyInfo: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  isAiActive,
  onOpenProfile,
  onOpenCompanyInfo,
  onLogout,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0a0d14]/95 backdrop-blur-md border-b border-amber-500/20 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        {/* Logo and App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-950/40 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/5">
            <JusticeLogo size={26} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-cinzel text-lg md:text-xl font-bold tracking-wide text-white">
                Tec Justiça <span className="gold-gradient-text font-semibold text-sm md:text-base">Lite</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-amber-300/70 tracking-wider uppercase font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3 inline text-amber-400" />
                <span className="capitalize">{todayFormatted}</span>
              </p>
              {isAiActive && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[9px] font-semibold tracking-wide">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                  IA (.env)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons (Lawyer Profile & Corporate Info) */}
        <div className="flex items-center gap-2">
          {/* Lawyer Quick Pill */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131722] hover:bg-[#1a2030] border border-amber-500/30 text-left transition-all group"
            title="Editar Perfil do Advogado"
          >
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors leading-tight truncate max-w-[130px]">
                {profile.name ? `Dr(a). ${profile.name}` : 'Cadastrar Nome'}
              </p>
              <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                {profile.specialty || 'Definir Especialidade'}
              </p>
            </div>
          </button>

          {/* Info Modal Button */}
          <button
            onClick={onOpenCompanyInfo}
            className="p-2 rounded-xl bg-[#131722] hover:bg-[#1a2030] border border-slate-700/80 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition-all"
            title="Informações da Empresa e Contato"
            aria-label="Dados empresariais"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={() => {
                if (confirm('Deseja sair da sua conta?')) {
                  onLogout();
                }
              }}
              className="p-2 rounded-xl bg-[#131722] hover:bg-red-950/40 border border-slate-700/80 hover:border-red-500/40 text-slate-400 hover:text-red-300 transition-all"
              title="Sair da conta"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
