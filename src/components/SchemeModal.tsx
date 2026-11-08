import React, { useState } from 'react';
import { ChitScheme, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
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
  if (!isOpen || !scheme) return null;

  const t = TRANSLATIONS[lang];
  const rules = lang === 'ta' ? scheme.rulesTa : scheme.rulesEn;
  const schemeName = lang === 'ta' ? scheme.nameTa : scheme.nameEn;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#075C32] text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C9A64A]">
                {scheme.durationMonths} Months Duration · Structured Chit Plan
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">
              {schemeName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 font-medium block">{t.schemes.totalValue}</span>
              <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">{scheme.chitValueFormatted}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 font-medium block">{t.schemes.totalPaid}</span>
              <span className="text-lg font-bold text-[#075C32] font-mono tabular-nums">₹{scheme.totalInstalmentsPaid.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#E5F2E8]/60 border border-[#12834B]/20">
              <span className="text-xs text-[#075C32] font-semibold block">{t.schemes.dividendGain}</span>
              <span className="text-lg font-bold text-[#075C32] font-mono tabular-nums">₹{scheme.dividendBenefit.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/60">
              <span className="text-xs text-amber-800 font-semibold block">{t.schemes.maxBonus}</span>
              <span className="text-lg font-bold text-amber-800 font-mono tabular-nums">₹{scheme.totalBonus.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Toggle between interactive breakdown table & original document */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#12834B]" />
              <span>{lang === 'ta' ? 'மாதாந்திர தவணை மற்றும் தொகை அட்டவணை' : '20-Month Schedule Table'}</span>
            </h4>

            <button
              onClick={() => setShowOriginalDoc(!showOriginalDoc)}
              className="text-xs font-semibold text-[#075C32] hover:text-[#12834B] flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#E5F2E8]"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{showOriginalDoc ? t.schemes.hideOriginalDocument : t.schemes.viewOriginalDocument}</span>
            </button>
          </div>

          {showOriginalDoc ? (
            <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-center">
              <p className="text-xs text-slate-600 mb-3 font-medium">
                {lang === 'ta' 
                  ? 'நிறுவனத்தால் வழங்கப்பட்ட அதிகாரப்பூர்வ சீட்டு அட்டவணை நகல்:'
                  : 'Official Rate Card Document provided by company management:'}
              </p>
              <div className="max-w-xl mx-auto rounded-lg overflow-hidden border border-slate-300 shadow-sm bg-white">
                <img
                  src={scheme.documentImage}
                  alt={`${scheme.nameEn} Official Rate Card`}
                  className="w-full h-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          ) : (
            /* Interactive Responsive Table */
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#075C32] text-white sticky top-0 font-bold">
                    <tr>
                      <th className="py-2.5 px-4 w-20 text-center">{t.schemes.tableMonth}</th>
                      <th className="py-2.5 px-4 text-right">{t.schemes.tableInstalment}</th>
                      <th className="py-2.5 px-4 text-right">{t.schemes.tableChitAmount}</th>
                      <th className="py-2.5 px-4 text-left hidden sm:table-cell">{lang === 'ta' ? 'குறிப்பு' : 'Timeline'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                    {scheme.schedule.map((row) => (
                      <tr 
                        key={row.month} 
                        className={row.month === 1 || row.month === 20 ? 'bg-emerald-50/50 font-semibold' : 'hover:bg-slate-50'}
                      >
                        <td className="py-2 px-4 text-center font-bold text-slate-700">
                          {row.month}
                        </td>
                        <td className="py-2 px-4 text-right font-medium text-slate-900">
                          ₹{row.instalment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-4 text-right font-bold text-[#075C32]">
                          ₹{row.chitAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-4 text-left text-[11px] font-sans text-slate-500 hidden sm:table-cell">
                          {row.month === 1 && (lang === 'ta' ? 'முதல் மாத ஆரம்பம்' : 'Initial Month')}
                          {row.month === 20 && (lang === 'ta' ? 'முடிவு & சிறப்பு போனஸ்' : 'Final Month + Bonus')}
                          {row.month > 1 && row.month < 20 && (lang === 'ta' ? '11-ல் குலுக்கல் / 25-ல் வழங்கல்' : '11th Draw / 25th Payout')}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                      <td className="py-2.5 px-4 text-center">{lang === 'ta' ? 'மொத்தம்' : 'TOTAL'}</td>
                      <td className="py-2.5 px-4 text-right text-[#075C32]">
                        ₹{scheme.totalInstalmentsPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-500 font-normal">
                        —
                      </td>
                      <td className="py-2.5 px-4 text-left text-[11px] font-sans text-slate-600 hidden sm:table-cell">
                        {lang === 'ta' ? '20 மாதங்களின் மொத்த தவணை' : 'Sum of 20 instalments'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Scheme Rules & Terms */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#075C32]" />
              <span>{t.schemes.termsTitle}</span>
            </h4>
            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              {rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#12834B] shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Regulatory Disclaimer */}
          <p className="text-[11px] text-slate-500 italic leading-normal">
            {t.schemes.disclaimer}
          </p>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            {lang === 'ta' ? 'பின்செல்ல' : 'Close Details'}
          </button>
          
          <button
            onClick={() => {
              onClose();
              onEnquireThisScheme(scheme.nameEn);
            }}
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#075C32] hover:bg-[#12834B] rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>{t.schemes.enquireThisScheme}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
