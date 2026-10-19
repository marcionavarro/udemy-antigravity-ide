import React from 'react';
import { FileDown, CheckCircle2, Sparkles, X, Scale, DollarSign, FileText } from 'lucide-react';
import { LegalCase, LawyerProfile } from '../types';
import { generateContractPDF } from '../services/contractPdf';

interface ContractExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: LegalCase | null;
  lawyerProfile: LawyerProfile;
  onOpenDefense?: (caseItem: LegalCase) => void;
}

export const ContractExportModal: React.FC<ContractExportModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  lawyerProfile,
  onOpenDefense,
}) => {
  if (!isOpen || !caseItem) return null;

  const handleDownload = () => {
    try {
      generateContractPDF(caseItem, lawyerProfile);
    } catch (err) {
      console.error('Erro ao gerar contrato em PDF:', err);
      alert('Ocorreu um erro ao gerar o contrato em PDF.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#101420] border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Accent Bar */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />

        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                Caso Salvo com Sucesso!
              </h3>
              <p className="text-xs text-slate-400">
                Informações criptografadas e salvas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Deseja exportar agora a via formal do <strong className="text-white">Contrato de Prestação de Serviços Advocatícios</strong> em PDF com a cláusula de honorários e orçamento?
          </p>

          {/* Resumo do Caso e Orçamento */}
          <div className="p-3.5 rounded-xl bg-[#090b10] border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-200 font-medium">
              <Scale className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">{caseItem.title}</span>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="font-semibold text-slate-300">Cliente:</span>
              <span className="text-slate-200">{caseItem.clientName}</span>
              <span className="text-slate-500">({caseItem.clientRole})</span>
            </div>

            {caseItem.budgetValue ? (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>R$ {caseItem.budgetValue}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {caseItem.paymentMethod || 'A combinar'}
                  {caseItem.paymentInstallments ? ` (${caseItem.paymentInstallments})` : ''}
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-amber-400/80">
                * Honorários não preenchidos no cadastro (sairá campo para preenchimento manual no PDF).
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleDownload}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all border border-emerald-400/30"
            >
              <FileDown className="w-4 h-4" />
              Baixar Contrato em PDF Agora
            </button>

            {onOpenDefense && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDefense(caseItem);
                }}
                className="w-full py-2.5 px-4 rounded-xl gold-gradient-btn text-black font-semibold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-black" />
                Consultar IA de Defesa para este Caso
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Fechar / Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
