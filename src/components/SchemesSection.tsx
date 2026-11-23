import React, { useState, useEffect } from 'react';
import { ChitScheme, Language } from '../types';
import { CHIT_SCHEMES } from '../data/schemes';
import { TRANSLATIONS } from '../data/translations';
import { SchemeModal } from './SchemeModal';
import { Calendar, ArrowRight, Table, Award } from 'lucide-react';
import { FintechCard3D } from './3d/FintechCard3D';
import { MotionSection, RupeeEmblem3D } from './3d/MotionSection';

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
    <section id="schemes" className="py-12 sm:py-16 lg:py-24 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <MotionSection className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 bg-[#064E3B] border border-emerald-400/30 text-[#65E83A] px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest mb-3 pubzi-chamfer-sm">
            <Calendar className="w-3.5 h-3.5 text-[#65E83A]" />
            <span>{lang === 'ta' ? 'அதிகாரப்பூர்வ திட்டங்கள்' : 'Rate Card Plans'}</span>
          </div>
          <h2 className="heading-3d-pop text-2xl sm:text-4xl font-extrabold text-[#052E22] tracking-tight leading-tight [text-wrap:balance]">
            {t.schemes.title}
          </h2>
          <p className="mt-3 text-sm sm:text-lg text-[#0B3B2C] font-medium leading-relaxed">
            {t.schemes.subtitle}
          </p>
        </MotionSection>

        {/* Scheme Cards Grid */}
        <div
          className={`grid grid-cols-1 gap-6 items-stretch mb-12 ${
            schemes.length >= 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3 gap-8'
          }`}
        >
          {schemes.map((scheme, idx) => {
            const isPopular = scheme.id === 'scheme-2-lakh';
            const isTenLakh = scheme.id === 'scheme-10-lakh' || scheme.chitValue === 1000000;
            const schemeName = lang === 'ta' ? scheme.nameTa : scheme.nameEn;
            const tagline = lang === 'ta' ? scheme.taglineTa : scheme.taglineEn;
            const delayClasses = ['', 'reveal-delay-100', 'reveal-delay-200', 'reveal-delay-300'];
            const staggerClass = delayClasses[idx % 4];

            return (
              <div key={scheme.id} className={`reveal ${staggerClass} flex`}>
                <FintechCard3D
                  accent={isTenLakh ? 'mint' : 'emerald'}
                  intensity="medium"
                  className={`w-full flex flex-col justify-between rounded-2xl pubzi-chamfer transition-all duration-200 p-4 sm:p-6 relative ${
                    isTenLakh
                      ? 'fintech-card-mint hover:border-[#064E3B]/45'
                      : 'fintech-card hover:border-[#064E3B]/35'
                  }`}
                >
                <div>
                  {/* Top highlight caption */}
                  {isPopular && (
                    <div className="text-[11px] font-bold text-[#064E3B] tracking-wider uppercase mb-2.5 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-[#064E3B] shrink-0" />
                      <span>{lang === 'ta' ? 'பெரும்பான்மையினர் தேர்வு' : 'Most Popular Choice'}</span>
                    </div>
                  )}
                  {isTenLakh && (
                    <div className="text-[11px] font-bold text-[#052E22] tracking-wider uppercase mb-2.5 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-[#064E3B] shrink-0" />
                      <span>{lang === 'ta' ? 'பெருந்தொகை சிறப்பு திட்டம்' : 'High-Value Enterprise Plan'}</span>
                    </div>
                  )}

                  {/* Scheme Header with 3D Rupee Coin Crest */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <h3 className="side-heading-3d-pop text-xl sm:text-2xl font-extrabold tracking-tight font-mono tabular-nums text-[#052E22]">
                        {scheme.chitValueFormatted}
                      </h3>
                      <p
                        className={`text-xs font-semibold mt-1 ${
                          isTenLakh ? 'text-[#0B3B2C]' : 'text-[#0B3B2C]'
                        }`}
                      >
                        {schemeName}
                      </p>
                    </div>
                    <RupeeEmblem3D size="sm" tone="forest" />
                  </div>

                  <p
                    className={`text-xs font-medium leading-relaxed min-h-[40px] mb-4 sm:mb-5 ${
                      isTenLakh ? 'text-[#0B3B2C]' : 'text-[#0B3B2C]'
                    }`}
                  >
                    {tagline}
                  </p>

                  {/* Highlights Summary Box */}
                  <div
                    className={`p-3 sm:p-4 rounded-xl mb-4 sm:mb-5 space-y-2.5 text-xs backdrop-blur-sm border border-white/30 shadow-xs ${
                      isTenLakh
                        ? 'bg-white/40'
                        : 'bg-emerald-500/12'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[#0B3B2C] font-medium">
                        {t.schemes.tenure}:
                      </span>
                      <span className="font-bold whitespace-nowrap text-[#052E22]">
                        {scheme.durationMonths} {lang === 'ta' ? 'மாதங்கள்' : 'Months'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[#0B3B2C] font-medium">
                        {t.schemes.firstMonth}:
                      </span>
                      <span className="font-bold font-mono tabular-nums whitespace-nowrap text-[#052E22]">
                        ₹{scheme.firstMonthInstalment.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-x-2 gap-y-0.5 flex-wrap">
                      <span className="text-[#0B3B2C] font-medium">
                        {t.schemes.instalmentRange}:
                      </span>
                      <span className="font-bold font-mono tabular-nums sm:whitespace-nowrap text-right text-[#052E22]">
                        ₹{scheme.minInstalment.toLocaleString('en-IN')} – ₹{scheme.maxInstalment.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="h-px bg-[#064E3B]/15" />

                    <div className="flex items-center justify-between gap-2 flex-wrap font-semibold text-[#0B3B2C]">
                      <span>{t.schemes.totalPaid}:</span>
                      <span className="font-mono font-bold tabular-nums whitespace-nowrap text-[#052E22]">
                        ₹{scheme.totalInstalmentsPaid.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap font-semibold text-[#064E3B]">
                      <span>{t.schemes.dividendGain}:</span>
                      <span className="font-mono font-bold tabular-nums whitespace-nowrap">
                        +₹{scheme.dividendBenefit.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Bonus Reward Box */}
                  <div
                    className={`p-3 rounded-xl mb-5 flex items-start gap-2.5 backdrop-blur-sm ${
                      isTenLakh
                        ? 'bg-[#064E3B]/85 border border-white/25'
                        : 'bg-green-500/15 border border-white/30'
                    }`}
                  >
                    <Award
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        isTenLakh ? 'text-[#65E83A]' : 'text-[#064E3B]'
                      }`}
                    />
                    <div>
                      <span
                        className={`text-xs font-bold block font-mono tabular-nums ${
                          isTenLakh ? 'text-[#65E83A]' : 'text-[#052E22]'
                        }`}
                      >
                        {lang === 'ta' ? 'உரிய தேதி போனஸ்:' : 'Timely Payment Bonus:'} ₹
                        {scheme.totalBonus.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`text-[11px] font-medium leading-tight block mt-0.5 ${
                          isTenLakh ? 'text-[#D1FAE5]' : 'text-[#0B3B2C]'
                        }`}
                      >
                        {lang === 'ta'
                          ? '10-ஆம் தேதிக்குள் செலுத்தினால் கிடைக்கும் கூடுதல் நன்மை'
                          : 'Available for members paying on or before the 10th'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="space-y-2.5 pt-2 relative z-10">
                  <button
                    onClick={() => handleOpenDetails(scheme)}
                    className={`w-full py-2.5 px-3 text-xs font-bold pubzi-chamfer-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isTenLakh
                        ? 'text-[#052E22] bg-white hover:bg-[#EAF7F0] border border-[#064E3B]/20'
                        : 'text-[#052E22] bg-[#EAF7F0] hover:bg-[#DCFCE7] border border-[#064E3B]/18'
                    }`}
                  >
                    <Table className="w-3.5 h-3.5 shrink-0 text-[#064E3B]" />
                    <span className="truncate">{t.schemes.viewFullSchedule}</span>
                  </button>

                  <button
                    onClick={() => onSelectSchemeForEnquiry(`${scheme.chitValueFormatted} Scheme`)}
                    className="w-full py-2.5 px-3 text-xs font-extrabold uppercase tracking-wider pubzi-chamfer-sm transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer text-white bg-[#064E3B] hover:bg-[#0B5D46] shadow-[0_6px_16px_-6px_rgba(6,78,59,0.3)]"
                  >
                    <span className="truncate">{t.schemes.enquireThisScheme}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
                </FintechCard3D>
              </div>
            );
          })}
        </div>

        {/* Disclaimer Note */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs text-[#0B3B2C] font-medium italic leading-relaxed">
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
