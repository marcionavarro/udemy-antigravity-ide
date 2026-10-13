import React from 'react';
import { X, MessageSquare, Mail, Building, FileText, CheckCircle2 } from 'lucide-react';
import { JusticeLogo } from './JusticeLogo';

interface CompanyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompanyInfoModal: React.FC<CompanyInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#10141f] border border-amber-500/30 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Subtle decorative gold top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 shadow-inner">
            <JusticeLogo size={36} />
          </div>
          <h2 className="font-cinzel text-xl font-bold tracking-wide gold-gradient-text">
            Tec Justiça Lite
          </h2>
          <p className="text-xs text-amber-300/80 uppercase tracking-widest mt-0.5">
            Plataforma Jurídica Estratégica
          </p>
        </div>

        <div className="space-y-4 text-sm bg-[#0a0d14] p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-start gap-3">
            <Building className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Razão Social</p>
              <p className="font-semibold text-white">Tectreinamentos Informática LTDA</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">CNPJ</p>
              <p className="font-semibold text-white tracking-wide">40.963.840/0001-74</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="w-full">
              <p className="text-xs text-slate-400 font-medium uppercase">WhatsApp / Contato</p>
              <a
                href="https://wa.me/5511982357631?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20Tec%20Justi%C3%A7a%20Lite"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors mt-0.5"
              >
                +55 (11) 98235-7631
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-sans">
                  Falar no WhatsApp
                </span>
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">E-mail Corporativo</p>
              <a
                href="mailto:wagner.inst@gmail.com"
                className="font-medium text-slate-200 hover:text-amber-300 transition-colors"
              >
                wagner.inst@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-5 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Agenda funcional e inteligência de causa com estética Preto, Branco e Dourado.</span>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
