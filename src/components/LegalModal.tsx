import React, { useEffect, useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { ShieldCheck, X } from 'lucide-react';

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

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#052E22]/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white border border-[#064E3B]/20 shadow-2xl w-full max-w-3xl rounded-xl sm:rounded-2xl overflow-hidden max-h-[94vh] sm:max-h-[90vh] flex flex-col text-[#052E22]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#064E3B] to-[#0B5D46] border-b border-[#65E83A]/35 text-white px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-5 h-5 text-[#65E83A] shrink-0" />
            <h3 className="text-sm sm:text-lg font-bold tracking-tight truncate">
              {activeTab === 'privacy' ? t.legal.privacyTitle : t.legal.termsTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#D1FAE5] hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#064E3B]/15 bg-[#EAF7F0] px-4 sm:px-6 pt-3 gap-5 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-[#064E3B] text-[#052E22]'
                : 'border-transparent text-[#476D60] hover:text-[#052E22]'
            }`}
          >
            {t.legal.privacyTitle}
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'terms'
                ? 'border-[#064E3B] text-[#052E22]'
                : 'border-transparent text-[#476D60] hover:text-[#052E22]'
            }`}
          >
            {t.legal.termsTitle}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-4 text-xs sm:text-sm text-[#264D40] leading-relaxed font-normal bg-[#F4FBF7]">
          <div className="text-[11px] font-mono text-[#476D60] font-semibold mb-2">
            {t.legal.lastUpdated} · TEAM STARS CHITS PRIVATE LIMITED
          </div>

          {activeTab === 'privacy' ? (
            <>
              <p className="font-semibold text-[#052E22]">{t.legal.privacyP1}</p>

              <div className="p-4 rounded-xl bg-white border border-[#064E3B]/15">
                <h5 className="font-bold text-[#052E22] mb-1">1. Information We Collect</h5>
                <p>{t.legal.privacyP2}</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#064E3B]/15">
                <h5 className="font-bold text-[#052E22] mb-1">2. Purpose of Information Use</h5>
                <p>{t.legal.privacyP3}</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#064E3B]/15">
                <h5 className="font-bold text-[#052E22] mb-1">3. Data Security & Non-Disclosure</h5>
                <p>{t.legal.privacyP4}</p>
              </div>
            </>
          ) : (
            <>
              <p className="font-semibold text-[#052E22]">{t.legal.termsP1}</p>

              <div className="p-4 rounded-xl bg-white border border-[#064E3B]/15">
                <h5 className="font-bold text-[#052E22] mb-1">1. No Guaranteed Yield Disclaimers</h5>
                <p>{t.legal.termsP2}</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#064E3B]/15">
                <h5 className="font-bold text-[#052E22] mb-1">2. Statutory Documentation & KYC</h5>
                <p>{t.legal.termsP3}</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#064E3B]/15">
                <h5 className="font-bold text-[#052E22] mb-1">3. Legal Jurisdiction</h5>
                <p>{t.legal.termsP4}</p>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-[#064E3B]/15 text-[11px] text-[#476D60]">
            CIN: U64990TN2025PTC181717 · Registered Office: 41/5E, Madathattuvillai, Villukuri, Kalkulam, Kanyakumari District – 629180.
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-3 border-t border-[#064E3B]/15 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-extrabold text-white bg-[#064E3B] hover:bg-[#052E22] rounded-lg transition-colors cursor-pointer"
          >
            {t.legal.agreeButton}
          </button>
        </div>
      </div>
    </div>
  );
};
