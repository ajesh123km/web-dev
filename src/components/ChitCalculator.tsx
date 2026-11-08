import React, { useState } from 'react';
import { Language } from '../types';
import { CHIT_SCHEMES } from '../data/schemes';
import { TRANSLATIONS } from '../data/translations';
import { Calculator, ArrowRight, Award, Info, TrendingUp, Calendar } from 'lucide-react';

interface ChitCalculatorProps {
  lang: Language;
  onEnquireScheme: (schemeName: string) => void;
}

export const ChitCalculator: React.FC<ChitCalculatorProps> = ({ lang, onEnquireScheme }) => {
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('scheme-2-lakh');
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const t = TRANSLATIONS[lang];

  const currentScheme = CHIT_SCHEMES.find((s) => s.id === selectedSchemeId) || CHIT_SCHEMES[0];
  const currentMonthData = currentScheme.schedule.find((m) => m.month === selectedMonth) || currentScheme.schedule[0];

  return (
    <section id="calculator" className="py-16 lg:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E5F2E8] text-[#075C32] text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5 text-[#12834B]" />
            <span>{lang === 'ta' ? 'திட்டமிட்ட சேமிப்பு கணக்கீடு' : 'Financial Planning'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight [text-wrap:balance]">
            {t.calculator.title}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            {t.calculator.subtitle}
          </p>
        </div>

        {/* Calculator Main Box */}
        <div className="max-w-4xl mx-auto bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          
          {/* Scheme Switcher Segmented Control */}
          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              {t.calculator.selectScheme}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-slate-200/70 rounded-xl">
              {CHIT_SCHEMES.map((scheme) => {
                const isSelected = scheme.id === selectedSchemeId;
                return (
                  <button
                    key={scheme.id}
                    onClick={() => {
                      setSelectedSchemeId(scheme.id);
                      if (selectedMonth > 20) setSelectedMonth(1);
                    }}
                    className={`py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold transition-all text-center ${
                      isSelected
                        ? 'bg-[#075C32] text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    {scheme.chitValueFormatted} Scheme
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scheme High-Level Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">{t.calculator.totalToPay}</span>
              <span className="text-xl font-extrabold text-[#075C32] font-mono tabular-nums block mt-1">
                ₹{currentScheme.totalInstalmentsPaid.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Sum of 20 months</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">{t.calculator.netDividend}</span>
              <span className="text-xl font-extrabold text-[#12834B] font-mono tabular-nums block mt-1">
                ₹{currentScheme.dividendBenefit.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Dividend advantage</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">{t.calculator.promptBonusEligible}</span>
              <span className="text-xl font-extrabold text-amber-800 font-mono tabular-nums block mt-1">
                ₹{currentScheme.totalBonus.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">If paid by 10th</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">{lang === 'ta' ? 'முதல் மாத தவணை' : 'First Month Due'}</span>
              <span className="text-xl font-extrabold text-slate-900 font-mono tabular-nums block mt-1">
                ₹{currentScheme.firstMonthInstalment.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">1st month flat</span>
            </div>
          </div>

          {/* Interactive Month Slider */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 mb-8">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="month-slider" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#12834B]" />
                <span>{t.calculator.monthSliderLabel}</span>
              </label>
              <span className="text-sm font-extrabold text-[#075C32] px-2.5 py-1 bg-[#E5F2E8] rounded-md font-mono tabular-nums">
                {lang === 'ta' ? `மாதம் ${selectedMonth} / 20` : `Month ${selectedMonth} of 20`}
              </span>
            </div>

            <input
              id="month-slider"
              type="range"
              min="1"
              max="20"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#075C32] mt-3 mb-2"
            />

            <div className="flex justify-between text-[11px] font-mono text-slate-400 px-1">
              <span>Month 1</span>
              <span>Month 5</span>
              <span>Month 10</span>
              <span>Month 15</span>
              <span>Month 20</span>
            </div>

            {/* Selected Month Outcome Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs font-medium text-slate-500 block">
                  {t.calculator.instalmentDue}
                </span>
                <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums block mt-1">
                  ₹{currentMonthData.instalment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  {selectedMonth === 1 
                    ? (lang === 'ta' ? 'ஆரம்ப மாத தவணை' : 'Flat initial enrolment instalment') 
                    : (lang === 'ta' ? 'தள்ளுபடி கழித்தபின் தவணை' : 'Dividend discounted instalment')}
                </span>
              </div>

              <div className="p-4 rounded-lg bg-[#E5F2E8]/60 border border-[#12834B]/20">
                <span className="text-xs font-semibold text-[#075C32] block">
                  {t.calculator.prizeDisbursed}
                </span>
                <span className="text-2xl font-extrabold text-[#075C32] font-mono tabular-nums block mt-1">
                  ₹{currentMonthData.chitAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-[#075C32] block mt-1">
                  {selectedMonth === 20 
                    ? (lang === 'ta' ? 'கடைசி மாதத்தில் கூடுதல் போனஸ் சேர்க்கப்படும்' : 'Disbursed to final prized member + bonus') 
                    : (lang === 'ta' ? '11-ல் குலுக்கல் தேர்வுக்குப் பின் வழங்கப்படும்' : 'Disbursed upon 11th draw/auction selection')}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#075C32] text-white">
            <div className="text-center sm:text-left">
              <h4 className="font-bold text-sm sm:text-base">
                {t.calculator.readyToEnquire}
              </h4>
              <p className="text-xs text-white/80 mt-0.5">
                {lang === 'ta' 
                  ? `${currentScheme.nameTa} குறித்த முழு ஆவணங்களை பெற விண்ணப்பியுங்கள்.` 
                  : `Enquire now to reserve your slot in the upcoming 20-month batch.`}
              </p>
            </div>

            <button
              onClick={() => onEnquireScheme(currentScheme.nameEn)}
              className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold text-[#075C32] bg-white hover:bg-slate-100 rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
            >
              <span>{t.calculator.enquireForSelected}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
