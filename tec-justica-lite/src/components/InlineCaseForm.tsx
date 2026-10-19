/**
 * Formulário Inline de Caso / Causa — Tec Justiça Lite
 *
 * Substitui o CaseModal por um formulário expansível diretamente na aba
 * "Casos & Defesa", permitindo cadastro e edição inline.
 * Inclui campos de orçamento/pagamento para geração de contrato PDF.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Scale, Sparkles, ChevronDown, ChevronUp, BookmarkCheck, X, PlusCircle, DollarSign, FileDown } from 'lucide-react';
import { LegalCase, LawyerProfile } from '../types';

interface InlineCaseFormProps {
  lawyerProfile: LawyerProfile;
  caseToEdit: LegalCase | null;
  isExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  onSaveCase: (
    caseData: Omit<LegalCase, 'id' | 'createdAt' | 'updatedAt' | 'analysis'>,
    options?: { andAnalyze?: boolean; andExportPdf?: boolean },
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

const PAYMENT_METHODS = [
  'PIX',
  'Transferência Bancária',
  'Boleto Bancário',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Dinheiro',
  'Cheque',
  'Outro',
];

const INSTALLMENT_OPTIONS = [
  'À vista',
  '2x',
  '3x',
  '4x',
  '5x',
  '6x',
  '10x',
  '12x',
  'Entrada + Parcelas',
  'A combinar',
];

export const InlineCaseForm: React.FC<InlineCaseFormProps> = ({
  lawyerProfile,
  caseToEdit,
  isExpanded: externalIsExpanded,
  onToggleExpand,
  onSaveCase,
  onCancelEdit,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalExpanded;
  const setIsExpanded = (val: boolean) => {
    setInternalExpanded(val);
    onToggleExpand?.(val);
  };

  const formRef = useRef<HTMLDivElement>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientRole, setClientRole] = useState(CLIENT_ROLES[0]);
  const [court, setCourt] = useState('');
  const [area, setArea] = useState(lawyerProfile.specialty || COMMON_AREAS[0]);
  const [factsDescription, setFactsDescription] = useState('');
  const [circumstances, setCircumstances] = useState('');

  // Budget / Payment fields - Aberto por padrão para o advogado ver as opções de honorários
  const [budgetValue, setBudgetValue] = useState('');
  const [budgetDescription, setBudgetDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentInstallments, setPaymentInstallments] = useState('');
  const [showBudgetSection, setShowBudgetSection] = useState(true);

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
      setBudgetValue(caseToEdit.budgetValue || '');
      setBudgetDescription(caseToEdit.budgetDescription || '');
      setPaymentMethod(caseToEdit.paymentMethod || '');
      setPaymentInstallments(caseToEdit.paymentInstallments || '');
      setShowBudgetSection(true);
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
    setBudgetValue('');
    setBudgetDescription('');
    setPaymentMethod('');
    setPaymentInstallments('');
    setShowBudgetSection(false);
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

  const handleSubmit = (options?: { andAnalyze?: boolean; andExportPdf?: boolean }) => {
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
        budgetValue: budgetValue.trim(),
        budgetDescription: budgetDescription.trim(),
        paymentMethod: paymentMethod.trim(),
        paymentInstallments: paymentInstallments.trim(),
      },
      options,
    );

    resetForm();
    if (!options?.andAnalyze) {
      setIsExpanded(false);
    }
  };

  return (
    <div ref={formRef} className="w-full">
      {/* Collapsed: Button to expand */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#131724] to-emerald-500/10 border border-amber-500/30 hover:border-amber-500/50 flex items-center justify-between gap-3 transition-all group shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300 group-hover:bg-amber-500/25 transition-colors">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
                  Cadastrar Novo Caso / Causa
                </p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <FileDown className="w-3 h-3" /> Gera Contrato PDF
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Cadastre o processo com orçamento para gerar o Contrato em PDF e consultar IA de defesa
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
                <h3 className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                  <span>{caseToEdit ? 'Editar Caso / Causa' : 'Cadastrar Caso / Causa'}</span>
                  <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    Contrato PDF
                  </span>
                </h3>
                <p className="text-[10px] text-amber-300/80">
                  {lawyerProfile.name ? `Advogado: Dr(a). ${lawyerProfile.name}` : 'Preencha os dados do processo e honorários'}
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
            {/* Informational banner highlighting PDF & Budget */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/15 via-[#0e141e] to-teal-500/10 border border-emerald-500/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 text-xs text-emerald-200">
                <FileDown className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Geração de Contrato:</strong> Este formulário gera automaticamente o <strong>Contrato de Prestação de Serviços Advocatícios em PDF</strong> com as cláusulas de honorários e orçamento.
                </span>
              </div>
            </div>
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

            {/* Budget / Payment Section Toggle */}
            <button
              type="button"
              onClick={() => setShowBudgetSection(!showBudgetSection)}
              className={`w-full p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                showBudgetSection
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-[#080a10] border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase">
                  Orçamento e Honorários {showBudgetSection ? '(aberto)' : '(clique para adicionar)'}
                </span>
              </div>
              {showBudgetSection ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Budget Fields (collapsible) */}
            {showBudgetSection && (
              <div className="p-3.5 rounded-xl bg-[#080a10] border border-emerald-500/25 space-y-3 animate-in fade-in duration-200">
                <p className="text-[11px] text-slate-400">
                  Defina os honorários e forma de pagamento. Esses dados serão incluídos no contrato PDF.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-emerald-300 mb-1">
                      Valor Total dos Honorários (R$)
                    </label>
                    <input
                      type="text"
                      value={budgetValue}
                      onChange={(e) => setBudgetValue(e.target.value)}
                      placeholder="Ex: 5.000,00"
                      className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-emerald-300 mb-1">
                      Forma de Pagamento
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-slate-700 text-white focus:outline-none focus:border-emerald-400 text-xs"
                    >
                      <option value="">Selecionar...</option>
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-emerald-300 mb-1">
                    Condição de Pagamento / Parcelas
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {INSTALLMENT_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setPaymentInstallments(opt)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                          paymentInstallments === opt
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-medium'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-emerald-300 mb-1">
                    Descrição dos Serviços Contratados (para o contrato)
                  </label>
                  <textarea
                    rows={2}
                    value={budgetDescription}
                    onChange={(e) => setBudgetDescription(e.target.value)}
                    placeholder="Ex: Acompanhamento processual completo, incluindo audiências, elaboração de peças e recursos..."
                    className="w-full px-3 py-2 rounded-lg bg-[#121624] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors text-xs leading-relaxed"
                  />
                </div>
              </div>
            )}

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
                onClick={() => handleSubmit()}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-[#1c2233] hover:bg-[#252c42] border border-slate-700 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
                title="Salvar dados do caso"
              >
                <BookmarkCheck className="w-4 h-4 text-slate-300" />
                Salvar Caso
              </button>

              <button
                type="button"
                onClick={() => handleSubmit({ andExportPdf: true })}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all border border-emerald-400/50 hover:scale-[1.01]"
                title="Salvar dados e baixar Contrato de Honorários em PDF"
              >
                <FileDown className="w-4 h-4 text-white" />
                <span>Salvar & Exportar Contrato (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmit({ andAnalyze: true })}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl gold-gradient-btn text-black font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md"
                title="Salvar e consultar a IA de Defesa"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>Salvar & Consultar IA</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
