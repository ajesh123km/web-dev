import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChitScheme, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { HorizontalScrollArea } from './HorizontalScrollArea';
import { X, Calendar, CheckCircle2, FileText, ArrowRight, Image as ImageIcon } from 'lucide-react';

interface SchemeModalProps {
  scheme: ChitScheme | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onEnquireThisScheme: (schemeName: string) => void;
}

export const SchemeModal: React.FC<SchemeModalProps> = ({
  scheme,
  isOpen,
  onClose,
  lang,
  onEnquireThisScheme
}) => {
  const [showOriginalDoc, setShowOriginalDoc] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !scheme) return null;

  const t = TRANSLATIONS[lang];
  const rules = lang === 'ta' ? scheme.rulesTa : scheme.rulesEn;
  const schemeName = lang === 'ta' ? scheme.nameTa : scheme.nameEn;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#052E22]/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white border border-[#064E3B]/20 shadow-2xl w-full max-w-4xl rounded-xl sm:rounded-2xl overflow-hidden max-h-[94vh] sm:max-h-[92vh] flex flex-col text-[#052E22]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Deep Emerald Forest Modal Header */}
        <div className="bg-gradient-to-r from-[#064E3B] to-[#0B5D46] border-b border-[#65E83A]/35 text-white px-4 py-3.5 sm:px-6 sm:py-5 flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#65E83A] truncate">
                {scheme.durationMonths} Months Duration · Structured Chit Plan
              </span>
            </div>
            <h3 className="text-base sm:text-2xl font-extrabold tracking-tight mt-0.5 truncate">
              {schemeName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg text-[#D1FAE5] hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Mint-White Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-5 sm:space-y-6 bg-[#F4FBF7]">

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-2.5 sm:p-3.5 rounded-xl bg-white border border-[#064E3B]/15 min-w-0">
              <span className="text-[11px] sm:text-xs text-[#476D60] font-medium block">{t.schemes.totalValue}</span>
              <span className="text-sm sm:text-lg font-bold text-[#052E22] font-mono tabular-nums break-words">
                {scheme.chitValueFormatted}
              </span>
            </div>
            <div className="p-2.5 sm:p-3.5 rounded-xl bg-white border border-[#064E3B]/15 min-w-0">
              <span className="text-[11px] sm:text-xs text-[#476D60] font-medium block">{t.schemes.totalPaid}</span>
              <span className="text-sm sm:text-lg font-bold text-[#052E22] font-mono tabular-nums break-words">
                ₹{scheme.totalInstalmentsPaid.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#DCFCE7] border border-[#22C55E]/35 min-w-0">
              <span className="text-[11px] sm:text-xs text-[#064E3B] font-semibold block">{t.schemes.dividendGain}</span>
              <span className="text-sm sm:text-lg font-bold text-[#052E22] font-mono tabular-nums break-words">
                ₹{scheme.dividendBenefit.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-2.5 sm:p-3.5 rounded-xl fintech-card-forest text-white min-w-0">
              <span className="text-[11px] sm:text-xs text-[#D1FAE5] font-semibold block">{t.schemes.maxBonus}</span>
              <span className="text-sm sm:text-lg font-bold text-[#65E83A] font-mono tabular-nums break-words">
                ₹{scheme.totalBonus.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Toggle between interactive breakdown table & original document */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#064E3B]/15 pb-3">
            <h4 className="text-sm sm:text-base font-bold text-[#052E22] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#064E3B] shrink-0" />
              <span>
                {lang === 'ta'
                  ? `${scheme.durationMonths} மாத தவணை மற்றும் தொகை அட்டவணை`
                  : `${scheme.durationMonths}-Month Schedule Table`}
              </span>
            </h4>

            <button
              onClick={() => setShowOriginalDoc(!showOriginalDoc)}
              className="text-xs font-bold text-[#052E22] hover:bg-[#DCFCE7] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#064E3B]/25 shrink-0 cursor-pointer transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#064E3B]" />
              <span>{showOriginalDoc ? t.schemes.hideOriginalDocument : t.schemes.viewOriginalDocument}</span>
            </button>
          </div>

          {showOriginalDoc ? (
            <div className="p-4 bg-white rounded-xl border border-[#064E3B]/15 text-center">
              <p className="text-xs text-[#264D40] mb-3 font-medium">
                {lang === 'ta'
                  ? 'நிறுவனத்தால் வழங்கப்பட்ட அதிகாரப்பூர்வ சீட்டு அட்டவணை நகல்:'
                  : 'Official Rate Card Document provided by company management:'}
              </p>
              <div className="max-w-xl mx-auto rounded-lg overflow-hidden border border-[#064E3B]/20 shadow-sm bg-white">
                <img
                  src={scheme.documentImage}
                  alt={`${scheme.nameEn} Official Rate Card`}
                  className="w-full h-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          ) : (
            <div className="border border-[#064E3B]/15 rounded-xl overflow-hidden shadow-xs bg-white">
              <HorizontalScrollArea innerClassName="max-h-72 overflow-y-auto overscroll-contain" ariaLabel="Scheme Schedule Table">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#EAF7F0] text-[#052E22] sticky top-0 font-bold z-10 border-b border-[#064E3B]/15">
                    <tr>
                      <th className="py-2.5 px-2.5 sm:px-4 w-14 sm:w-20 text-center">{t.schemes.tableMonth}</th>
                      <th className="py-2.5 px-2.5 sm:px-4 text-right">{t.schemes.tableInstalment}</th>
                      <th className="py-2.5 px-2.5 sm:px-4 text-right">{t.schemes.tableChitAmount}</th>
                      <th className="py-2.5 px-4 text-left hidden sm:table-cell">
                        {lang === 'ta' ? 'குறிப்பு' : 'Timeline'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#064E3B]/10 font-mono tabular-nums bg-white">
                    {scheme.schedule.map((row) => (
                      <tr
                        key={row.month}
                        className={
                          row.month === 1 || row.month === scheme.durationMonths
                            ? 'bg-[#DCFCE7]/55 font-semibold'
                            : 'hover:bg-[#F4FBF7]'
                        }
                      >
                        <td className="py-2 px-2.5 sm:px-4 text-center font-bold text-[#052E22]">
                          {row.month}
                        </td>
                        <td className="py-2 px-2.5 sm:px-4 text-right font-semibold text-[#052E22]">
                          ₹{row.instalment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-2.5 sm:px-4 text-right font-bold text-[#052E22]">
                          ₹{row.chitAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-4 text-left text-[11px] font-sans text-[#476D60] hidden sm:table-cell">
                          {row.month === 1 && (lang === 'ta' ? 'முதல் மாத ஆரம்பம்' : 'Initial Month')}
                          {row.month === scheme.durationMonths &&
                            (lang === 'ta' ? 'முடிவு & சிறப்பு போனஸ்' : 'Final Month + Bonus')}
                          {row.month > 1 &&
                            row.month < scheme.durationMonths &&
                            (lang === 'ta' ? '11-ல் குலுக்கல் / 25-ல் வழங்கல்' : '11th Draw / 25th Payout')}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#064E3B] font-bold text-white border-t-2 border-[#65E83A]">
                      <td className="py-2.5 px-2.5 sm:px-4 text-center text-[#65E83A]">
                        {lang === 'ta' ? 'மொத்தம்' : 'TOTAL'}
                      </td>
                      <td className="py-2.5 px-2.5 sm:px-4 text-right text-[#65E83A]">
                        ₹{scheme.totalInstalmentsPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-2.5 sm:px-4 text-right text-[#A7F3D0] font-normal">
                        —
                      </td>
                      <td className="py-2.5 px-4 text-left text-[11px] font-sans text-[#D1FAE5] hidden sm:table-cell">
                        {lang === 'ta'
                          ? `${scheme.durationMonths} மாதங்களின் மொத்த தவணை`
                          : `Sum of ${scheme.durationMonths} instalments`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </HorizontalScrollArea>
            </div>
          )}

          {/* Scheme Rules & Terms */}
          <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-[#064E3B]/15">
            <h4 className="text-sm font-bold text-[#052E22] mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#064E3B]" />
              <span>{t.schemes.termsTitle}</span>
            </h4>
            <div className="space-y-2.5 text-xs text-[#264D40] leading-relaxed">
              {rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#064E3B] shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-[#476D60] italic leading-normal">
            {t.schemes.disclaimer}
          </p>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-white px-4 py-3 sm:px-6 sm:py-4 border-t border-[#064E3B]/15 flex flex-wrap items-center justify-between gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 text-xs font-semibold text-[#264D40] hover:text-[#052E22] transition-colors cursor-pointer"
          >
            {lang === 'ta' ? 'பின்செல்ல' : 'Close Details'}
          </button>

          <button
            onClick={() => {
              onClose();
              onEnquireThisScheme(`${scheme.chitValueFormatted} Scheme`);
            }}
            className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-extrabold text-white bg-[#064E3B] hover:bg-[#052E22] rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{t.schemes.enquireThisScheme}</span>
            <ArrowRight className="w-4 h-4 text-[#65E83A]" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
