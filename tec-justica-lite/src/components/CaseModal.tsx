import React, { useState, useEffect } from 'react';
import { X, Scale, FileText, Sparkles, AlertCircle, PlusCircle, BookmarkCheck } from 'lucide-react';
import { LegalCase, LawyerProfile } from '../types';

interface CaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseToEdit?: LegalCase | null;
  lawyerProfile: LawyerProfile;
  onSaveCase: (caseData: Omit<LegalCase, 'id' | 'createdAt' | 'updatedAt' | 'analysis'>, andAnalyze?: boolean) => void;
}

const COMMON_AREAS = [
  'Direito Criminal / Penal',
  'Direito Cível e Processual',
  'Direito do Trabalho',
  'Direito Tributário',
  'Direito de Família e Sucessões',
  'Direito Previdenciário',
  'Direito Empresarial',
  'Direito do Consumidor',
  'Direito Administrativo',
  'Outro Ramo',
];

const CLIENT_ROLES = [
  'Réu / Defesa / Requerido',
  'Investigado / Indiciado',
  'Reclamado (Trabalhista)',
  'Autor / Requerente / Vítima',
  'Reclamante (Trabalhista)',
  'Terceiro Interessado',
];

export const CaseModal: React.FC<CaseModalProps> = ({
  isOpen,
  onClose,
  caseToEdit,
  lawyerProfile,
  onSaveCase,
}) => {
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientRole, setClientRole] = useState(CLIENT_ROLES[0]);
  const [court, setCourt] = useState('');
  const [area, setArea] = useState(lawyerProfile.specialty || COMMON_AREAS[0]);
  const [factsDescription, setFactsDescription] = useState('');
  const [circumstances, setCircumstances] = useState('');

  // Keep form state in sync when editing
  useEffect(() => {
    if (caseToEdit) {
      setTitle(caseToEdit.title || '');
      setClientName(caseToEdit.clientName || '');
      setClientRole(caseToEdit.clientRole || CLIENT_ROLES[0]);
      setCourt(caseToEdit.court || '');
      setArea(caseToEdit.area || lawyerProfile.specialty || COMMON_AREAS[0]);
      setFactsDescription(caseToEdit.factsDescription || '');
      setCircumstances(caseToEdit.circumstances || '');
    } else {
      // 100% clean initial state
      setTitle('');
      setClientName('');
      setClientRole(CLIENT_ROLES[0]);
      setCourt('');
      setArea(lawyerProfile.specialty || COMMON_AREAS[0]);
      setFactsDescription('');
      setCircumstances('');
    }
  }, [caseToEdit, lawyerProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (andAnalyze: boolean) => {
    if (!title.trim() && !factsDescription.trim()) {
      alert('Por favor, informe ao menos a Identificação do Processo/Causa ou a Descrição dos Fatos.');
      return;
    }

    onSaveCase(
      {
        title: title.trim() || 'Processo sem identificação',
        clientName: clientName.trim() || 'Cliente sem nome cadastrado',
        clientRole,
        court: court.trim(),
        area: area.trim() || lawyerProfile.specialty || 'Geral',
        factsDescription: factsDescription.trim(),
        circumstances: circumstances.trim(),
      },
      andAnalyze
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#101420] border border-amber-500/30 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100 my-8 overflow-hidden">
        {/* Top Gold Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-cinzel text-lg font-bold text-white">
              {caseToEdit ? 'Editar Caso / Causa' : 'Cadastrar Caso / Causa a Defender'}
            </h2>
            <p className="text-xs text-amber-300/80">
              {lawyerProfile.name ? `Advogado Responsável: Dr(a). ${lawyerProfile.name}` : 'Consultoria Estratégica e Enredo de Defesa'}
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          {/* Row 1: Title / Number + Client Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-300 mb-1">
                Número do Processo ou Título da Causa *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Proc. nº 0001234-56... ou Ação de Defesa"
                className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-300 mb-1">
                Cliente / Assistido(a) *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome da parte assistida..."
                className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Row 2: Polo / Role + Juízo/Vara + Ramo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-300 mb-1">
                Posição / Polo
              </label>
              <select
                value={clientRole}
                onChange={(e) => setClientRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-slate-700 text-white focus:outline-none focus:border-amber-400 text-xs"
              >
                {CLIENT_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-300 mb-1">
                Vara / Tribunal / Juízo
              </label>
              <input
                type="text"
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                placeholder="Ex: 2ª Vara Criminal / TJSP"
                className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-300 mb-1">
                Ramo Jurídico
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-slate-700 text-white focus:outline-none focus:border-amber-400 text-xs"
              >
                {COMMON_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Facts Description */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-300 mb-1 flex items-center justify-between">
              <span>Fatos da Causa e Objeto da Ação / Denúncia *</span>
              <span className="text-[10px] text-amber-400/80 font-normal">
                Base para a IA sugerir leis e enredo
              </span>
            </label>
            <textarea
              rows={4}
              value={factsDescription}
              onChange={(e) => setFactsDescription(e.target.value)}
              placeholder="Descreva detalhadamente os fatos ocorridos, o que a outra parte alega/acusa e quais são os pontos principais do conflito..."
              className="w-full px-3 py-2.5 rounded-xl bg-[#090b10] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors text-xs sm:text-sm leading-relaxed"
            />
          </div>

          {/* Dicas / Circunstâncias Novas Field (Explicit User Requirement) */}
          <div className="p-3.5 rounded-xl bg-[#080a10] border border-amber-500/25 space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Campo de Dicas & Novas Circunstâncias da Causa (Opcional)
            </label>
            <p className="text-[11px] text-slate-400">
              Permite a você colocar novas circunstâncias ou fatos supervenientes descobertos ao longo do processo para recalibrar a defesa.
            </p>
            <textarea
              rows={3}
              value={circumstances}
              onChange={(e) => setCircumstances(e.target.value)}
              placeholder="Ex: Surgiu uma nova testemunha presencial; documento de recibo localizado; ausência de perícia no local do crime..."
              className="w-full px-3 py-2 rounded-lg bg-[#121624] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors text-xs leading-relaxed"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="w-full sm:flex-1 py-2.5 rounded-xl bg-[#1c2233] hover:bg-[#252c42] border border-slate-700 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <BookmarkCheck className="w-4 h-4 text-slate-300" />
              Salvar Caso
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="w-full sm:flex-1 py-2.5 rounded-xl gold-gradient-btn text-black font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-black" />
              Salvar e Obter IA de Defesa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
