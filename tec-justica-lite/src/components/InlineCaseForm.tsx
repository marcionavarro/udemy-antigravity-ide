/**
 * Formulário Inline de Caso / Causa — Tec Justiça Lite
 *
 * Substitui o CaseModal por um formulário expansível diretamente na aba
 * "Casos & Defesa", permitindo cadastro e edição inline.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Scale, Sparkles, ChevronDown, ChevronUp, BookmarkCheck, X, PlusCircle } from 'lucide-react';
import { LegalCase, LawyerProfile } from '../types';

interface InlineCaseFormProps {
  lawyerProfile: LawyerProfile;
  caseToEdit: LegalCase | null;
  onSaveCase: (
    caseData: Omit<LegalCase, 'id' | 'createdAt' | 'updatedAt' | 'analysis'>,
    andAnalyze?: boolean,
  ) => void;
  onCancelEdit: () => void;
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

export const InlineCaseForm: React.FC<InlineCaseFormProps> = ({
  lawyerProfile,
  caseToEdit,
  onSaveCase,
  onCancelEdit,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientRole, setClientRole] = useState(CLIENT_ROLES[0]);
  const [court, setCourt] = useState('');
  const [area, setArea] = useState(lawyerProfile.specialty || COMMON_AREAS[0]);
  const [factsDescription, setFactsDescription] = useState('');
  const [circumstances, setCircumstances] = useState('');

  // Quando recebe caso para editar, expande e preenche
  useEffect(() => {
    if (caseToEdit) {
      setTitle(caseToEdit.title || '');
      setClientName(caseToEdit.clientName || '');
      setClientRole(caseToEdit.clientRole || CLIENT_ROLES[0]);
      setCourt(caseToEdit.court || '');
      setArea(caseToEdit.area || lawyerProfile.specialty || COMMON_AREAS[0]);
      setFactsDescription(caseToEdit.factsDescription || '');
      setCircumstances(caseToEdit.circumstances || '');
      setIsExpanded(true);

      // Rola até o formulário
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [caseToEdit, lawyerProfile]);

  const resetForm = () => {
    setTitle('');
    setClientName('');
    setClientRole(CLIENT_ROLES[0]);
    setCourt('');
    setArea(lawyerProfile.specialty || COMMON_AREAS[0]);
    setFactsDescription('');
    setCircumstances('');
  };

  const handleToggle = () => {
    if (isExpanded && caseToEdit) {
      // Se está editando e colapsa, cancela edição
      onCancelEdit();
      resetForm();
    }
    setIsExpanded(!isExpanded);
  };

  const handleCancel = () => {
    setIsExpanded(false);
    resetForm();
    if (caseToEdit) {
      onCancelEdit();
    }
  };

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
      andAnalyze,
    );

    resetForm();
    if (!andAnalyze) {
      setIsExpanded(false);
    }
  };

  return (
    <div ref={formRef} className="w-full">
      {/* Collapsed: Button to expand */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#131724] to-amber-500/10 border border-amber-500/30 hover:border-amber-500/50 flex items-center justify-between gap-3 transition-all group shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300 group-hover:bg-amber-500/25 transition-colors">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
                Cadastrar Novo Caso / Causa
              </p>
              <p className="text-[11px] text-slate-400">
                Cadastre o processo e consulte defesas com IA
              </p>
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-amber-400 group-hover:translate-y-0.5 transition-transform" />
        </button>
      ) : (
        /* Expanded: Full form */
        <div className="w-full bg-[#101420] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* Top Gold Bar */}
          <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

          {/* Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Scale className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-cinzel text-sm font-bold text-white">
                  {caseToEdit ? 'Editar Caso / Causa' : 'Cadastrar Caso / Causa'}
                </h3>
                <p className="text-[10px] text-amber-300/80">
                  {lawyerProfile.name ? `Advogado: Dr(a). ${lawyerProfile.name}` : 'Preencha os dados do processo'}
                </p>
              </div>
            </div>

            <button
              onClick={handleCancel}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Fechar formulário"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
            {/* Row 1: Title + Client Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-300 mb-1">
                  Nº Processo ou Título da Causa *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Row 2: Polo + Juízo + Ramo */}
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
                    <option key={r} value={r}>{r}</option>
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
                    <option key={a} value={a}>{a}</option>
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
                className="w-full px-3 py-2.5 rounded-xl bg-[#090b10] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors text-xs sm:text-sm leading-relaxed"
              />
            </div>

            {/* Dicas / Circunstâncias Novas */}
            <div className="p-3.5 rounded-xl bg-[#080a10] border border-amber-500/25 space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Campo de Dicas & Novas Circunstâncias (Opcional)
              </label>
              <p className="text-[11px] text-slate-400">
                Novas circunstâncias ou fatos supervenientes para recalibrar a defesa.
              </p>
              <textarea
                rows={3}
                value={circumstances}
                onChange={(e) => setCircumstances(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#121624] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors text-xs leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
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
                Salvar e Consultar IA de Defesa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
