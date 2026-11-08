import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { ShieldCheck, FileText, X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialTab?: 'privacy' | 'terms';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialTab = 'privacy'
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#075C32] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#C9A64A]" />
            <h3 className="text-base sm:text-lg font-bold tracking-tight">
              {activeTab === 'privacy' ? t.legal.privacyTitle : t.legal.termsTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'privacy'
                ? 'border-[#075C32] text-[#075C32]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {t.legal.privacyTitle}
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'terms'
                ? 'border-[#075C32] text-[#075C32]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {t.legal.termsTitle}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          <div className="text-[11px] font-mono text-slate-400 mb-2">
            {t.legal.lastUpdated} · TEAM STARS CHITS PRIVATE LIMITED
          </div>

          {activeTab === 'privacy' ? (
            <>
              <p className="font-medium text-slate-800">{t.legal.privacyP1}</p>
              
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="font-bold text-slate-900 mb-1">1. Information We Collect</h5>
                <p>{t.legal.privacyP2}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="font-bold text-slate-900 mb-1">2. Purpose of Information Use</h5>
                <p>{t.legal.privacyP3}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="font-bold text-slate-900 mb-1">3. Data Security & Non-Disclosure</h5>
                <p>{t.legal.privacyP4}</p>
              </div>
            </>
          ) : (
            <>
              <p className="font-medium text-slate-800">{t.legal.termsP1}</p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="font-bold text-slate-900 mb-1">1. No Guaranteed Yield Disclaimers</h5>
                <p>{t.legal.termsP2}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="font-bold text-slate-900 mb-1">2. Statutory Documentation & KYC</h5>
                <p>{t.legal.termsP3}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="font-bold text-slate-900 mb-1">3. Legal Jurisdiction</h5>
                <p>{t.legal.termsP4}</p>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500">
            CIN: U64990TN2025PTC181717 · Registered Office: 41/5E, Madathattuvillai, Villukuri, Kalkulam, Kanyakumari District – 629180.
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-[#075C32] hover:bg-[#12834B] rounded-lg transition-colors"
          >
            {t.legal.agreeButton}
          </button>
        </div>
      </div>
    </div>
  );
};
