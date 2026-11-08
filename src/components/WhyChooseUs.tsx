import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { ShieldCheck, CalendarCheck, Award, Building, Landmark, Users } from 'lucide-react';

interface WhyChooseUsProps {
  lang: Language;
}

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  const pillars = [
    {
      icon: CalendarCheck,
      title: t.whyUs.reason1Title,
      desc: t.whyUs.reason1Desc
    },
    {
      icon: ShieldCheck,
      title: t.whyUs.reason2Title,
      desc: t.whyUs.reason2Desc
    },
    {
      icon: Award,
      title: t.whyUs.reason3Title,
      desc: t.whyUs.reason3Desc
    },
    {
      icon: Building,
      title: t.whyUs.reason4Title,
      desc: t.whyUs.reason4Desc
    },
    {
      icon: Landmark,
      title: t.whyUs.reason5Title,
      desc: t.whyUs.reason5Desc
    },
    {
      icon: Users,
      title: t.whyUs.reason6Title,
      desc: t.whyUs.reason6Desc
    }
  ];

  return (
    <section id="why-us" className="py-16 lg:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E5F2E8] text-[#075C32] text-xs font-bold uppercase tracking-wider mb-3">
            <span>{lang === 'ta' ? 'நம்பகத்தன்மை தூண்கள்' : 'Core Advantages'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight [text-wrap:balance]">
            {t.whyUs.title}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            {t.whyUs.subtitle}
          </p>
        </div>

        {/* 6 Pillars Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-[#12834B]/30 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-[#075C32] mb-5">
                    <Icon className="w-6 h-6 text-[#12834B]" />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2.5 tracking-tight">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {pillar.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold text-[#075C32]">
                  <span>Team Stars Guarantee</span>
                  <span>100% Verifiable</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
