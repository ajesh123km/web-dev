import React, { useState, useEffect } from 'react';
import { ChitScheme, Language } from '../types';
import { CHIT_SCHEMES } from '../data/schemes';
import { TRANSLATIONS } from '../data/translations';
import { SchemeModal } from './SchemeModal';
import { Calendar, ArrowRight, Table, Award } from 'lucide-react';

interface SchemesSectionProps {
  lang: Language;
  onSelectSchemeForEnquiry: (schemeName: string) => void;
}

export const SchemesSection: React.FC<SchemesSectionProps> = ({
  lang,
  onSelectSchemeForEnquiry
}) => {
  const [schemes, setSchemes] = useState<ChitScheme[]>(CHIT_SCHEMES);
  const [selectedScheme, setSelectedScheme] = useState<ChitScheme | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
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

  const handleOpenDetails = (scheme: ChitScheme) => {
    setSelectedScheme(scheme);
    setModalOpen(true);
  };

  return (
    <section id="schemes" className="py-12 sm:py-16 lg:py-24 bg-[#F8FAF9] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E5F2E8] text-[#075C32] text-xs font-bold uppercase tracking-wider mb-3">
            <Calendar className="w-3.5 h-3.5 text-[#12834B]" />
            <span>{lang === 'ta' ? 'அதிகாரப்பூர்வ திட்டங்கள்' : 'Rate Card Plans'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight [text-wrap:balance]">
            {t.schemes.title}
          </h2>
          <p className="mt-3 text-sm sm:text-lg text-slate-600 font-normal leading-relaxed">
            {t.schemes.subtitle}
          </p>
        </div>

        {/* Scheme Cards Grid */}
        <div className={`grid grid-cols-1 gap-6 items-stretch mb-12 ${
          schemes.length >= 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3 gap-8'
        }`}>
          {schemes.map((scheme) => {
            const isPopular = scheme.id === 'scheme-2-lakh';
            const isTenLakh = scheme.id === 'scheme-10-lakh' || scheme.chitValue === 1000000;
            const schemeName = lang === 'ta' ? scheme.nameTa : scheme.nameEn;
            const tagline = lang === 'ta' ? scheme.taglineTa : scheme.taglineEn;

            return (
              <div
                key={scheme.id}
                className={`flex flex-col justify-between rounded-2xl bg-white transition-all duration-200 p-4 sm:p-6 relative border ${
                  isPopular
                    ? 'border-[#075C32] shadow-lg ring-1 ring-[#075C32]/20'
                    : isTenLakh
                    ? 'border-[#C9A64A] shadow-md ring-1 ring-[#C9A64A]/20'
                    : 'border-slate-200/90 shadow-sm hover:border-[#12834B]/40 hover:shadow-md'
                }`}
              >
                {/* Top highlight caption */}
                {isPopular && (
                  <div className="text-[11px] font-bold text-[#075C32] tracking-wider uppercase mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#12834B]" />
                    <span>{lang === 'ta' ? 'பெரும்பான்மையினர் தேர்வு' : 'Most Popular Choice'}</span>
                  </div>
                )}
                {isTenLakh && (
                  <div className="text-[11px] font-bold text-amber-800 tracking-wider uppercase mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#C9A64A]" />
                    <span>{lang === 'ta' ? 'பெருந்தொகை சிறப்பு திட்டம்' : 'High-Value Enterprise Plan'}</span>
                  </div>
                )}

                <div>
                  {/* Scheme Header */}
                  <div className="mb-3">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      {scheme.chitValueFormatted}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                      {schemeName}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed min-h-[40px] mb-4 sm:mb-5">
                    {tagline}
                  </p>

                  {/* Highlights Summary Box */}
                  <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100 mb-4 sm:mb-5 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-slate-500">{t.schemes.tenure}:</span>
                      <span className="font-bold text-slate-800 whitespace-nowrap">
                        {scheme.durationMonths} {lang === 'ta' ? 'மாதங்கள்' : 'Months'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-slate-500">{t.schemes.firstMonth}:</span>
                      <span className="font-bold font-mono text-slate-900 tabular-nums whitespace-nowrap">
                        ₹{scheme.firstMonthInstalment.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-x-2 gap-y-0.5 flex-wrap">
                      <span className="text-slate-500">{t.schemes.instalmentRange}:</span>
                      <span className="font-bold font-mono text-slate-900 tabular-nums sm:whitespace-nowrap text-right">
                        ₹{scheme.minInstalment.toLocaleString('en-IN')} – ₹{scheme.maxInstalment.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="h-px bg-slate-200" />

                    <div className="flex items-center justify-between gap-2 flex-wrap text-[#075C32] font-semibold">
                      <span>{t.schemes.totalPaid}:</span>
                      <span className="font-mono font-bold tabular-nums whitespace-nowrap">
                        ₹{scheme.totalInstalmentsPaid.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap text-[#12834B] font-semibold">
                      <span>{t.schemes.dividendGain}:</span>
                      <span className="font-mono font-bold tabular-nums whitespace-nowrap">
                        +₹{scheme.dividendBenefit.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Bonus Reward Badge */}
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200/80 mb-5 flex items-start gap-2.5">
                    <Award className="w-4 h-4 text-[#C9A64A] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-amber-900 block">
                        {lang === 'ta' ? 'உரிய தேதி போனஸ்:' : 'Timely Payment Bonus:'} ₹{scheme.totalBonus.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-amber-800 leading-tight block mt-0.5">
                        {lang === 'ta' ? '10-ஆம் தேதிக்குள் செலுத்தினால் கிடைக்கும் கூடுதல் நன்மை' : 'Available for members paying on or before the 10th'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={() => handleOpenDetails(scheme)}
                    className="w-full py-2.5 px-3 text-xs font-bold text-[#075C32] bg-[#E5F2E8] hover:bg-[#d4ead9] border border-[#12834B]/20 rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <Table className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t.schemes.viewFullSchedule}</span>
                  </button>

                  <button
                    onClick={() => onSelectSchemeForEnquiry(`${scheme.chitValueFormatted} Scheme`)}
                    className="w-full py-2.5 px-3 text-xs font-bold text-white bg-[#075C32] hover:bg-[#12834B] rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <span className="truncate">{t.schemes.enquireThisScheme}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer Note */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs text-slate-500 italic leading-relaxed">
            {t.schemes.disclaimer}
          </p>
        </div>

      </div>

      {/* Full Schedule & Rules Modal */}
      <SchemeModal
        scheme={selectedScheme}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        lang={lang}
        onEnquireThisScheme={onSelectSchemeForEnquiry}
      />
    </section>
  );
};
