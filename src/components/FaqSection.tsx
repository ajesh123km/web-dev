import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { ChevronDown, HelpCircle, PhoneCall } from 'lucide-react';
import { MotionSection } from './3d/MotionSection';

interface FaqSectionProps {
  lang: Language;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ lang }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const t = TRANSLATIONS[lang];

  const faqs = [
    { id: 1, category: 'general', q: t.faq.q1, a: t.faq.a1 },
    { id: 2, category: 'schemes', q: t.faq.q2, a: t.faq.a2 },
    { id: 3, category: 'schemes', q: t.faq.q3, a: t.faq.a3 },
    { id: 4, category: 'schemes', q: t.faq.q4, a: t.faq.a4 },
    { id: 5, category: 'schemes', q: t.faq.q5, a: t.faq.a5 },
    { id: 6, category: 'auction', q: t.faq.q6, a: t.faq.a6 },
    { id: 7, category: 'auction', q: t.faq.q7, a: t.faq.a7 },
    { id: 8, category: 'documents', q: t.faq.q8, a: t.faq.a8 },
    { id: 9, category: 'schemes', q: t.faq.q9, a: t.faq.a9 },
    { id: 10, category: 'general', q: t.faq.q10, a: t.faq.a10 }
  ];

  const filteredFaqs =
    activeCategory === 'all' ? faqs : faqs.filter((faq) => faq.category === activeCategory);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-12 sm:py-16 lg:py-24 bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <MotionSection className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 bg-[#064E3B] text-[#65E83A] border border-[#0B5D46] px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest mb-3 pubzi-chamfer-sm">
            <HelpCircle className="w-3.5 h-3.5 text-[#65E83A]" />
            <span>{lang === 'ta' ? 'கேள்வி பதில்' : 'Clear Answers'}</span>
          </div>
          <h2 className="heading-3d-pop text-2xl sm:text-4xl font-extrabold text-[#052E22] tracking-tight leading-tight [text-wrap:balance]">
            {t.faq.title}
          </h2>
          <p className="mt-3 text-sm sm:text-lg text-[#0B3B2C] font-medium leading-relaxed">
            {t.faq.subtitle}
          </p>
        </MotionSection>

        {/* Category Tabs */}
        <div
          className={`reveal reveal-delay-100 flex flex-wrap items-center justify-center mb-6 sm:mb-8 p-1.5 bg-white/40 backdrop-blur-md border border-white/30 rounded-xl shadow-md ${
            lang === 'ta' ? 'gap-1.5' : 'gap-1.5 sm:gap-2'
          }`}
        >
          {(['all', 'general', 'schemes', 'auction', 'documents'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#064E3B] text-white shadow-xs'
                  : 'text-[#264D40] hover:text-[#052E22] hover:bg-[#EAF7F0]'
              }`}
            >
              {t.faq.categories[cat]}
            </button>
          ))}
        </div>

        {/* FAQ Accordions List */}
        <div className="space-y-3 sm:space-y-3.5">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const delayClasses = ['', 'reveal-delay-100', 'reveal-delay-200'];
            const staggerClass = delayClasses[Math.min(index, 2)];
            return (
              <div
                key={faq.id}
                className={`reveal ${staggerClass} rounded-xl border backdrop-blur-md transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white/45 border-white/40 shadow-xl'
                    : 'bg-white/30 border-white/25 shadow-md hover:bg-white/40 hover:border-white/40'
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full py-3.5 px-4 sm:py-4 sm:px-6 text-left flex items-center justify-between gap-3 sm:gap-4 focus-visible:outline-hidden cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`text-sm sm:text-base font-bold transition-colors ${
                      isOpen ? 'text-[#052E22] font-extrabold' : 'text-[#052E22]'
                    }`}
                  >
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#064E3B]' : 'text-[#0B3B2C]'
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-3 text-xs sm:text-sm text-[#0B3B2C] leading-relaxed border-t border-white/25 bg-emerald-500/12 backdrop-blur-sm font-medium animate-in fade-in duration-150">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions banner in Deep Emerald Forest */}
        <div className="reveal mt-12 p-6 rounded-2xl fintech-card-forest pubzi-chamfer text-white text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="side-heading-3d-pop-dark text-sm sm:text-base font-bold text-white">
              {lang === 'ta' ? 'வேறு கேள்விகள் உள்ளதா?' : 'Have specific questions about joining?'}
            </h4>
            <p className="text-xs text-[#D1FAE5] mt-0.5">
              {lang === 'ta'
                ? 'எங்கள் நேரடி அலுவலகத்தை 9789825684 என்ற எண்ணில் அழைத்து பேசலாம்.'
                : 'Call our direct office line to speak with a relationship executive.'}
            </p>
          </div>

          <a
            href="tel:9789825684"
            className="px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-[#052E22] bg-[#65E83A] hover:bg-[#7CF056] pubzi-chamfer-sm shadow-md transition-all flex items-center gap-1.5 shrink-0 tabular-nums"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>+91 9789825684</span>
          </a>
        </div>

      </div>
    </section>
  );
};
