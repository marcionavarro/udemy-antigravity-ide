import React, { useState } from 'react';
import { X, User, Briefcase, Award, Check, Key, ExternalLink, LogOut } from 'lucide-react';
import { LawyerProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: LawyerProfile;
  onSave: (profile: LawyerProfile) => void;
  onLogout?: () => void;
}

const COMMON_SPECIALTIES = [
  'Direito Criminal / Penal',
  'Direito Cível e Processual',
  'Direito do Trabalho / Trabalhista',
  'Direito Tributário e Fiscal',
  'Direito de Família e Sucessões',
  'Direito Previdenciário',
  'Direito Empresarial e Societário',
  'Direito do Consumidor',
  'Direito Administrativo e Público',
  'Direito Imobiliário',
  'Outra Especialidade',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  onLogout,
}) => {
  const [name, setName] = useState(profile.name || '');
  const [specialty, setSpecialty] = useState(profile.specialty || '');
  const [oab, setOab] = useState(profile.oab || '');
  const [geminiApiKey, setGeminiApiKey] = useState(profile.geminiApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      specialty: specialty.trim(),
      oab: oab.trim(),
      geminiApiKey: geminiApiKey.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#10141f] border border-amber-500/30 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-cinzel text-lg font-bold text-white">
              Perfil do Advogado
            </h2>
            <p className="text-xs text-slate-400">
              Personalize seu nome, área de atuação e IA
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              Seu Nome Completo ou Como Prefere ser Chamado
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome (ex: Dr. / Dra.)..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b10] border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              As análises jurídicas e orientações da IA serão endereçadas com este nome.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              Especialidade / Campo de Atuação Principal
            </label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Digite sua especialidade (ex: Criminalista, Cível, Tributário)..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b10] border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm transition-all mb-2"
            />
            
            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-1 max-h-28 overflow-y-auto pr-1">
              {COMMON_SPECIALTIES.map((spec) => (
                <button
                  type="button"
                  key={spec}
                  onClick={() => setSpecialty(spec)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    specialty === spec
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-medium'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              A IA levará esta especialidade em consideração nas teses e leis aplicáveis.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Nº OAB (Opcional)
            </label>
            <input
              type="text"
              value={oab}
              onChange={(e) => setOab(e.target.value)}
              placeholder="Número de inscrição e Seccional..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b10] border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm transition-all"
            />
          </div>

          {/* Gemini API Key Section */}
          <div className="p-3.5 rounded-xl bg-[#080a10] border border-amber-500/25 space-y-2">
            <label className="block text-xs font-semibold uppercase text-amber-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              Chave da API Gemini (Consultoria IA)
            </label>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Para utilizar a consultoria jurídica com IA, insira sua chave de API gratuita do Google AI Studio.
              Seus dados nunca saem do dispositivo — a chave é armazenada localmente com criptografia.
            </p>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Cole sua API Key aqui (ex: AIzaSy...)"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#090b10] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 text-xs transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-300 transition-colors text-[10px] font-semibold"
              >
                {showApiKey ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Obter chave gratuita no Google AI Studio
            </a>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl gold-gradient-btn text-black font-semibold text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Salvo!
                </>
              ) : (
                'Salvar Perfil'
              )}
            </button>
          </div>

          {/* Logout Button */}
          {onLogout && (
            <div className="pt-2 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja realmente sair? Seus dados continuam salvos no dispositivo.')) {
                    onLogout();
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-red-950/30 hover:bg-red-950/50 border border-red-500/30 text-red-300 hover:text-red-200 font-medium text-xs flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair da Conta (Logout)
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
