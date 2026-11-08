import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { ChevronDown, HelpCircle, PhoneCall } from 'lucide-react';

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

  const filteredFaqs = activeCategory === 'all'
    ? faqs
    : faqs.filter((faq) => faq.category === activeCategory);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 lg:py-24 bg-[#F8FAF9] border-b border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E5F2E8] text-[#075C32] text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-[#12834B]" />
            <span>{lang === 'ta' ? 'கேள்வி பதில்' : 'Clear Answers'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight [text-wrap:balance]">
            {t.faq.title}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            {t.faq.subtitle}
          </p>
        </div>

        {/* Category Tabs (Interactive Segmented Control) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 p-1.5 bg-slate-200/60 rounded-xl">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.faq.categories.all}
          </button>
          <button
            onClick={() => setActiveCategory('general')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'general'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.faq.categories.general}
          </button>
          <button
            onClick={() => setActiveCategory('schemes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'schemes'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.faq.categories.schemes}
          </button>
          <button
            onClick={() => setActiveCategory('auction')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'auction'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.faq.categories.auction}
          </button>
          <button
            onClick={() => setActiveCategory('documents')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'documents'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.faq.categories.documents}
          </button>
        </div>

        {/* FAQ Accordions List */}
        <div className="space-y-3.5">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.id}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-[#075C32]/40 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full py-4 px-5 sm:px-6 text-left flex items-center justify-between gap-4 focus-visible:outline-hidden"
                  aria-expanded={isOpen}
                >
                  <span className={`text-sm sm:text-base font-bold transition-colors ${
                    isOpen ? 'text-[#075C32]' : 'text-slate-800'
                  }`}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#075C32]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 font-normal animate-in fade-in duration-150">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <div className="mt-12 p-6 rounded-2xl bg-white border border-slate-200 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              {lang === 'ta' ? 'வேறு கேள்விகள் உள்ளதா?' : 'Have specific questions about joining?'}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              {lang === 'ta' 
                ? 'எங்கள் நேரடி அலுவலகத்தை 9789825684 என்ற எண்ணில் அழைத்து பேசலாம்.'
                : 'Call our direct office line to speak with a relationship executive.'}
            </p>
          </div>

          <a
            href="tel:9789825684"
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#075C32] hover:bg-[#12834B] rounded-lg transition-all flex items-center gap-1.5 shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>+91 9789825684</span>
          </a>
        </div>

      </div>
    </section>
  );
};
