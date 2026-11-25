import React, { useState, useEffect } from 'react';
import { ChitScheme, Language } from '../types';
import { CHIT_SCHEMES } from '../data/schemes';
import { TRANSLATIONS } from '../data/translations';
import { Calculator, ArrowRight, Calendar } from 'lucide-react';
import { MotionSection, RupeeEmblem3D } from './3d/MotionSection';

interface ChitCalculatorProps {
  lang: Language;
  onEnquireScheme: (schemeName: string) => void;
}

export const ChitCalculator: React.FC<ChitCalculatorProps> = ({ lang, onEnquireScheme }) => {
  const [schemes, setSchemes] = useState<ChitScheme[]>(CHIT_SCHEMES);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('scheme-2-lakh');
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    let active = true;
    const loadSchemes = () => {
      fetch('/api/schemes')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (active && data?.schemes?.length > 0) {
            setSchemes(data.schemes);
          }
        })
        .catch(() => {});
    };
    loadSchemes();
    window.addEventListener('teamstars:schemes-updated', loadSchemes);
    return () => {
      active = false;
      window.removeEventListener('teamstars:schemes-updated', loadSchemes);
    };
  }, []);

  const currentScheme = schemes.find((s) => s.id === selectedSchemeId) || schemes[0];
  const maxMonths = currentScheme.durationMonths || 20;
  const clampedMonth = Math.min(selectedMonth, maxMonths);
  const currentMonthData =
    currentScheme.schedule.find((m) => m.month === clampedMonth) ||
    currentScheme.schedule[0] ||
    { month: 1, instalment: currentScheme.firstMonthInstalment, chitAmount: currentScheme.chitValue };

  const sliderRatio = maxMonths > 1 ? (clampedMonth - 1) / (maxMonths - 1) : 1;
  const fillWidth =
    clampedMonth >= maxMonths
      ? '100%'
      : `calc(9px + (100% - 18px) * ${sliderRatio})`;

  return (
    <section id="calculator" className="py-12 sm:py-16 lg:py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <MotionSection className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 bg-[#064E3B] border border-emerald-400/30 text-[#65E83A] px-3.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-widest mb-3">
            <Calculator className="w-3.5 h-3.5 text-[#65E83A]" />
            <span>{lang === 'ta' ? 'திட்டமிட்ட சேமிப்பு கணக்கீடு' : 'Financial Planning'}</span>
          </div>
          <h2 className="heading-3d-pop text-2xl sm:text-4xl font-extrabold text-[#052E22] tracking-tight leading-tight [text-wrap:balance]">
            {t.calculator.title}
          </h2>
          <p className="mt-3 text-sm sm:text-lg text-[#0B3B2C] font-medium leading-relaxed">
            {t.calculator.subtitle}
          </p>
        </MotionSection>

        {/* Soft Light-Green & White Calculator Frame */}
        <MotionSection delay={0.1}>
          <div className="max-w-4xl mx-auto fintech-card-ash rounded-2xl p-4 sm:p-10 relative overflow-hidden isolate">
          <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-[#064E3B]/12">
            <div className="flex items-center gap-3">
              <RupeeEmblem3D size="sm" tone="forest" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#052E22] block">
                  {lang === 'ta' ? 'சீட்டு வருமானம் & தவணை கணிப்பான்' : 'Interactive Chit Payout Simulator'}
                </span>
                <span className="text-[11px] text-[#264D40]">
                  {currentScheme.nameEn}
                </span>
              </div>
            </div>
            <span className="hidden sm:inline-block text-[11px] font-mono font-bold text-[#052E22] bg-[#DCFCE7] border border-[#064E3B]/20 px-2.5 py-1 rounded-md tabular-nums">
              {maxMonths} Months
            </span>
          </div>

          {/* Scheme Switcher Segmented Control */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#264D40] mb-3">
              {t.calculator.selectScheme}
            </label>
            <div
              className={`grid gap-2 p-1.5 bg-white/40 backdrop-blur-md border border-white/30 rounded-xl shadow-md ${
                schemes.length >= 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'
              }`}
            >
              {schemes.map((scheme) => {
                const isSelected = scheme.id === currentScheme.id;
                return (
                  <button
                    key={scheme.id}
                    onClick={() => {
                      setSelectedSchemeId(scheme.id);
                      if (selectedMonth > (scheme.durationMonths || 20)) setSelectedMonth(1);
                    }}
                    className={`py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-bold transition-all text-center cursor-pointer tabular-nums ${
                      isSelected
                        ? 'bg-[#064E3B] text-white shadow-[0_6px_16px_-4px_rgba(6,78,59,0.35)]'
                        : 'text-[#264D40] hover:text-[#052E22] hover:bg-[#EAF7F0]'
                    }`}
                  >
                    {scheme.chitValueFormatted} {scheme.durationMonths !== 20 ? `(${scheme.durationMonths}M)` : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scheme High-Level Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
            <div className="p-3 sm:p-4 rounded-xl bg-white/40 backdrop-blur-md border border-white/30 shadow-lg overflow-hidden isolate min-w-0">
              <span className="text-[11px] font-semibold text-[#0B3B2C] block">{t.calculator.totalToPay}</span>
              <span className="text-base sm:text-xl font-extrabold text-[#052E22] font-mono tabular-nums block mt-1 break-words">
                ₹{currentScheme.totalInstalmentsPaid.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#0B3B2C] font-medium block mt-0.5">
                {lang === 'ta' ? `${maxMonths} மாத மொத்தம்` : `Sum of ${maxMonths} months`}
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl fintech-card-mint min-w-0">
              <span className="text-[11px] font-semibold text-[#0B3B2C] block">{t.calculator.netDividend}</span>
              <span className="text-base sm:text-xl font-extrabold text-[#052E22] font-mono tabular-nums block mt-1 break-words">
                ₹{currentScheme.dividendBenefit.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#0B3B2C] font-medium block mt-0.5">Dividend advantage</span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl fintech-card-forest text-[#ECFDF5] min-w-0">
              <span className="text-[11px] font-semibold text-[#D1FAE5] block">
                {t.calculator.promptBonusEligible}
              </span>
              <span className="text-base sm:text-xl font-extrabold text-[#65E83A] font-mono tabular-nums block mt-1 break-words">
                ₹{currentScheme.totalBonus.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#A7F3D0] block mt-0.5">If paid by 10th</span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-white/40 backdrop-blur-md border border-white/30 shadow-lg overflow-hidden isolate min-w-0">
              <span className="text-[11px] font-semibold text-[#0B3B2C] block">
                {lang === 'ta' ? 'முதல் மாத தவணை' : 'First Month Due'}
              </span>
              <span className="text-base sm:text-xl font-extrabold text-[#052E22] font-mono tabular-nums block mt-1 break-words">
                ₹{currentScheme.firstMonthInstalment.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#0B3B2C] font-medium block mt-0.5">1st month flat</span>
            </div>
          </div>

          {/* Interactive Month Slider + Emerald Visual Progress Bar */}
          <div className="p-4 sm:p-6 rounded-xl bg-white/40 backdrop-blur-md border border-white/30 mb-6 sm:mb-8 shadow-lg overflow-hidden isolate">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <label htmlFor="month-slider" className="text-xs font-bold text-[#052E22] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#064E3B] shrink-0" />
                <span>
                  {lang === 'ta' ? `மாதத்தை தேர்வு செய்க (1 முதல் ${maxMonths})` : `Inspect Month in ${maxMonths}-Month Cycle`}
                </span>
              </label>
              <span
                className={`text-xs sm:text-sm font-extrabold text-[#052E22] px-2.5 py-1 bg-[#DCFCE7] border border-[#064E3B]/20 rounded-md tabular-nums whitespace-nowrap ${
                  lang === 'ta' ? '' : 'font-mono'
                }`}
              >
                {lang === 'ta' ? `மாதம் ${clampedMonth} / ${maxMonths}` : `Month ${clampedMonth} of ${maxMonths}`}
              </span>
            </div>

            {/* Unified Interactive Slider & Emerald Cashflow Track */}
            <div className="relative h-6 flex items-center mt-1 mb-2">
              <div className="h-2 w-full rounded-full bg-[#DCFCE7] overflow-hidden pointer-events-none">
                <div
                  className="h-full bg-gradient-to-r from-[#064E3B] via-[#16A34A] to-[#65E83A]"
                  style={{ width: fillWidth }}
                />
              </div>

              <input
                id="month-slider"
                type="range"
                min="1"
                max={maxMonths}
                value={clampedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer focus:outline-none [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#064E3B] [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(5,46,34,0.35)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#064E3B] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-[0_1px_4px_rgba(5,46,34,0.35)]"
              />
            </div>

            <div className="flex justify-between text-[10px] sm:text-[11px] font-mono text-[#476D60] px-0.5 sm:px-1 tabular-nums">
              <span>M1</span>
              <span className="hidden sm:inline">Month {Math.max(2, Math.round(maxMonths * 0.25))}</span>
              <span>M{Math.max(3, Math.round(maxMonths * 0.5))}</span>
              <span className="hidden sm:inline">Month {Math.max(4, Math.round(maxMonths * 0.75))}</span>
              <span>M{maxMonths}</span>
            </div>

            {/* Selected Month Outcome Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-white/30">
              <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-500/15 backdrop-blur-sm border border-white/30 shadow-sm">
                <span className="text-xs font-semibold text-[#0B3B2C] block">
                  {t.calculator.instalmentDue}
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-[#052E22] font-mono tabular-nums block mt-1">
                  ₹{currentMonthData.instalment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-[#0B3B2C] font-medium block mt-1">
                  {clampedMonth === 1
                    ? lang === 'ta'
                      ? 'ஆரம்ப மாத தவணை'
                      : 'Flat initial enrolment instalment'
                    : lang === 'ta'
                    ? 'தள்ளுபடி கழித்தபின் தவணை'
                    : 'Dividend discounted instalment'}
                </span>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-green-500/15 backdrop-blur-sm border border-white/30 shadow-sm">
                <span className="text-xs font-bold text-[#052E22] block">
                  {t.calculator.prizeDisbursed}
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-[#052E22] font-mono tabular-nums block mt-1">
                  ₹{currentMonthData.chitAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-[#0B3B2C] font-medium block mt-1">
                  {clampedMonth === maxMonths
                    ? lang === 'ta'
                      ? 'கடைசி மாதத்தில் கூடுதல் போனஸ் சேர்க்கப்படும்'
                      : 'Disbursed to final prized member + bonus'
                    : lang === 'ta'
                    ? '11-ல் குலுக்கல் தேர்வுக்குப் பின் வழங்கப்படும்'
                    : 'Disbursed upon 11th draw/auction selection'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row in Deep Emerald */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-xl fintech-card-forest text-[#ECFDF5]">
            <div className="text-center sm:text-left">
              <h4 className="side-heading-3d-pop-dark font-bold text-sm sm:text-base text-white">
                {t.calculator.readyToEnquire}
              </h4>
              <p className="text-xs text-[#D1FAE5] mt-0.5">
                {lang === 'ta'
                  ? `${currentScheme.nameTa} குறித்த முழு ஆவணங்களை பெற விண்ணப்பியுங்கள்.`
                  : `Enquire now to reserve your slot in the upcoming ${maxMonths}-month batch.`}
              </p>
            </div>

            <button
              onClick={() => onEnquireScheme(`${currentScheme.chitValueFormatted} Scheme`)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#052E22] bg-[#65E83A] hover:bg-[#7CF056] shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
            >
              <span>{t.calculator.enquireForSelected}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          </div>
        </MotionSection>
      </div>
    </section>
  );
};
