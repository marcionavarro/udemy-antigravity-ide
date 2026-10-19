import React, { useState } from 'react';
import {
  X,
  Scale,
  Sparkles,
  BookOpen,
  ShieldAlert,
  Layers,
  Copy,
  Check,
  RefreshCw,
  FileCheck,
  AlertCircle,
  HelpCircle,
  BookmarkCheck,
  FileDown,
} from 'lucide-react';
import { LegalCase, LawyerProfile } from '../types';
import { generateContractPDF } from '../services/contractPdf';

interface DefenseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: LegalCase | null;
  taskTitle?: string;
  lawyerProfile: LawyerProfile;
  isLoading: boolean;
  onRefreshAnalysis: (updatedCircumstances?: string) => void;
}

export const DefenseDrawer: React.FC<DefenseDrawerProps> = ({
  isOpen,
  onClose,
  caseItem,
  taskTitle,
  lawyerProfile,
  isLoading,
  onRefreshAnalysis,
}) => {
  const [copied, setCopied] = useState(false);
  const [newCircumstance, setNewCircumstance] = useState('');
  const [activeTab, setActiveTab] = useState<'tese' | 'leis' | 'provas' | 'alertas'>('tese');

  if (!isOpen || !caseItem) return null;

  const analysis = caseItem.analysis;

  const handleCopyText = () => {
    if (!analysis) return;
    const textToCopy = `=== TEC JUSTIÇA LITE - ESTRATÉGIA DE DEFESA ===
${analysis.personalizedGreeting}

CASO: ${caseItem.title}
CLIENTE: ${caseItem.clientName} (${caseItem.clientRole})
ÁREA: ${caseItem.area}

TESE CENTRAL: ${analysis.thesisName}
RESUMO: ${analysis.quickSummary}

LEIS APLICÁVEIS:
${analysis.applicableLaws.map((l) => `- ${l.norm}: ${l.relevance} (Aplicação: ${l.practicalApplication})`).join('\n')}

ENREDO DE DEFESA:
Narrativa: ${analysis.defenseStoryline.factualNarrative}
Preliminares:
${analysis.defenseStoryline.preliminaries.map((p) => `* ${p}`).join('\n')}
Mérito:
${analysis.defenseStoryline.meritArguments.map((m) => `* ${m}`).join('\n')}
Estratégia Probatória:
${analysis.defenseStoryline.evidenceStrategy.map((e) => `* ${e}`).join('\n')}
Pedidos:
${analysis.defenseStoryline.keyRequests.map((k) => `* ${k}`).join('\n')}

ALERTAS E PONTOS CRÍTICOS:
${analysis.strategicAlerts.map((a) => `! ${a}`).join('\n')}
`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyNewCircumstance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircumstance.trim()) return;
    const combined = caseItem.circumstances
      ? `${caseItem.circumstances}\n[Nova circunstância]: ${newCircumstance.trim()}`
      : newCircumstance.trim();
    onRefreshAnalysis(combined);
    setNewCircumstance('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl h-full bg-[#0d101a] border-l border-amber-500/30 flex flex-col text-slate-100 overflow-hidden shadow-2xl">
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shrink-0" />

        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#111524] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cinzel text-base sm:text-lg font-bold text-white tracking-wide">
                  Considerações & Enredo de Defesa
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40">
                  IA Jurídica
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {caseItem.title} • {caseItem.clientName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                try {
                  generateContractPDF(caseItem, lawyerProfile);
                } catch (err) {
                  console.error(err);
                  alert('Erro ao gerar contrato em PDF.');
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md border border-emerald-400/40 transition-all"
              title="Baixar Contrato de Prestação de Serviços em PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-white" />
              <span>Contrato PDF</span>
            </button>

            {analysis && (
              <button
                onClick={handleCopyText}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Copiar estratégia completa"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={() => onRefreshAnalysis()}
              disabled={isLoading}
              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-colors disabled:opacity-50"
              title="Recalcular análise"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              aria-label="Fechar gaveta"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Linked Task Notice (if triggered from a specific task) */}
        {taskTitle && (
          <div className="px-4 py-2 bg-blue-950/40 border-b border-blue-900/40 text-xs text-blue-200 flex items-center gap-2 shrink-0">
            <BookmarkCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">
              Analisando com foco na tarefa: <strong>{taskTitle}</strong>
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
                <Scale className="w-7 h-7 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="space-y-1">
                <p className="font-cinzel text-base font-semibold text-white">
                  Consultando Jurisprudência e Legislação...
                </p>
                <p className="text-xs text-slate-400 max-w-sm">
                  O assistente do Tec Justiça Lite está construindo a tese defensiva e selecionando normas aplicáveis para {lawyerProfile.name ? `Dr(a). ${lawyerProfile.name}` : 'o seu caso'}.
                </p>
              </div>
            </div>
          ) : !analysis ? (
            <div className="py-16 text-center space-y-3 bg-[#121624] border border-slate-800 rounded-2xl p-6">
              <Scale className="w-12 h-12 mx-auto text-amber-400/60" />
              <p className="font-semibold text-white text-base">
                Nenhuma análise gerada para esta causa ainda.
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Clique no botão abaixo para processar os fatos e obter o enredo de defesa e leis sugeridas.
              </p>
              <button
                onClick={() => onRefreshAnalysis()}
                className="mt-3 px-5 py-2.5 rounded-xl gold-gradient-btn text-black font-semibold text-xs inline-flex items-center gap-2 shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                Gerar Análise Jurídica Agora
              </button>
            </div>
          ) : (
            <>
              {/* Personalized Greeting */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30">
                <p className="font-serif italic text-sm text-amber-200 leading-relaxed">
                  "{analysis.personalizedGreeting}"
                </p>
              </div>

              {/* Central Thesis Card */}
              <div className="bg-[#121624] border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-amber-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Tese Central de Defesa</span>
                </div>
                <h3 className="font-cinzel text-base sm:text-lg font-bold text-white leading-snug">
                  {analysis.thesisName}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#0a0d15] p-3 rounded-xl border border-slate-800/80">
                  {analysis.quickSummary}
                </p>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveTab('tese')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'tese'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  📖 Enredo Fático & Mérito
                </button>
                <button
                  onClick={() => setActiveTab('leis')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'leis'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  ⚖️ Leis e Normas ({analysis.applicableLaws.length})
                </button>
                <button
                  onClick={() => setActiveTab('provas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'provas'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  🔍 Provas & Pedidos
                </button>
                <button
                  onClick={() => setActiveTab('alertas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'alertas'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  🚨 Alertas Estratégicos
                </button>
              </div>

              {/* Tab: Enredo Fático & Mérito */}
              {activeTab === 'tese' && (
                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Factual Narrative */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" /> Enredo Fático para Apresentação em Juízo
                    </h4>
                    <div className="bg-[#121624] p-4 rounded-xl border border-slate-800 text-slate-200 leading-relaxed whitespace-pre-line">
                      {analysis.defenseStoryline.factualNarrative}
                    </div>
                  </div>

                  {/* Preliminaries */}
                  {analysis.defenseStoryline.preliminaries.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-amber-300 flex items-center gap-1.5">
                        <Layers className="w-4 h-4" /> Preliminares Processuais & Nulidades
                      </h4>
                      <div className="bg-[#121624] p-3.5 rounded-xl border border-slate-800 space-y-2">
                        {analysis.defenseStoryline.preliminaries.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-slate-300">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Merit Arguments */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4" /> Argumentos de Mérito
                    </h4>
                    <div className="bg-[#121624] p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                      {analysis.defenseStoryline.meritArguments.map((arg, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-slate-300">
                          <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{arg}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Leis e Normas Aplicáveis */}
              {activeTab === 'leis' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-amber-300 tracking-wider">
                    Dispositivos Legais, Artigos & Súmulas Aplicáveis
                  </h4>

                  <div className="space-y-3">
                    {analysis.applicableLaws.map((law, idx) => (
                      <div
                        key={idx}
                        className="bg-[#121624] border border-slate-800 hover:border-amber-500/40 rounded-xl p-3.5 space-y-2 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm text-amber-300 flex items-center gap-2">
                            <Scale className="w-4 h-4 text-amber-400" />
                            {law.norm}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          <strong className="text-white">Relevância:</strong> {law.relevance}
                        </p>
                        <p className="text-xs text-slate-400 bg-[#090c14] p-2.5 rounded-lg border border-slate-800/80">
                          <strong className="text-amber-200">Como Aplicar:</strong> {law.practicalApplication}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Provas & Pedidos */}
              {activeTab === 'provas' && (
                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Evidence */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4" /> Estratégia Probatória Recomendada
                    </h4>
                    <div className="bg-[#121624] p-3.5 rounded-xl border border-slate-800 space-y-2">
                      {analysis.defenseStoryline.evidenceStrategy.map((ev, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-slate-300">
                          <span className="text-amber-400 font-bold shrink-0">✓</span>
                          <span>{ev}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Requests */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" /> Pedidos Finais a Formular
                    </h4>
                    <div className="bg-[#121624] p-3.5 rounded-xl border border-slate-800 space-y-2">
                      {analysis.defenseStoryline.keyRequests.map((req, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-slate-300">
                          <span className="text-emerald-400 font-bold shrink-0">§</span>
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Alertas Estratégicos */}
              {activeTab === 'alertas' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    Alertas Críticos, Riscos e Jurisprudência
                  </h4>

                  <div className="space-y-2.5">
                    {analysis.strategicAlerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className="bg-red-950/20 border border-red-500/30 rounded-xl p-3 text-xs text-red-200 flex items-start gap-2.5 leading-relaxed"
                      >
                        <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          !
                        </span>
                        <span>{alert}</span>
                      </div>
                    ))}
                  </div>

                  {/* Circumstance Impact */}
                  {analysis.circumstanceImpact && (
                    <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                      <p className="font-bold flex items-center gap-1 text-amber-300">
                        <Sparkles className="w-3.5 h-3.5" /> Impacto das Circunstâncias Atuais:
                      </p>
                      <p className="text-slate-300 leading-relaxed">
                        {analysis.circumstanceImpact}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Dicas & Novas Circunstâncias Section (Prompt Requirement) */}
              <div className="p-4 rounded-2xl bg-[#121624] border border-amber-500/30 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Campo de Dicas & Novas Circunstâncias
                  </h4>
                  <span className="text-[10px] text-slate-400">Opcional</span>
                </div>

                {caseItem.circumstances ? (
                  <div className="text-xs bg-[#090b10] p-3 rounded-xl border border-slate-800 text-slate-300 whitespace-pre-line leading-relaxed">
                    <strong className="text-white block mb-1">Circunstâncias Registradas:</strong>
                    {caseItem.circumstances}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Nenhuma circunstância nova foi adicionada ainda a este caso.
                  </p>
                )}

                {/* Form to append new circumstances */}
                <form onSubmit={handleApplyNewCircumstance} className="space-y-2 pt-1">
                  <textarea
                    rows={2}
                    value={newCircumstance}
                    onChange={(e) => setNewCircumstance(e.target.value)}
                    placeholder="Adicionar novos fatos ou circunstâncias supervenientes para atualizar o enredo..."
                    className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={!newCircumstance.trim() || isLoading}
                    className="w-full py-2 rounded-xl gold-gradient-btn text-black font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    Atualizar Defesa com Nova Circunstância
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
