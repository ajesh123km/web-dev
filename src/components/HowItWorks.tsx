import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Search, CheckCircle, Send, PhoneCall, ShieldAlert, FileSignature } from 'lucide-react';

interface HowItWorksProps {
  lang: Language;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  const steps = [
    {
      num: "01",
      icon: Search,
      title: t.howItWorks.step1Title,
      desc: t.howItWorks.step1Desc
    },
    {
      num: "02",
      icon: CheckCircle,
      title: t.howItWorks.step2Title,
      desc: t.howItWorks.step2Desc
    },
    {
      num: "03",
      icon: Send,
      title: t.howItWorks.step3Title,
      desc: t.howItWorks.step3Desc
    },
    {
      num: "04",
      icon: PhoneCall,
      title: t.howItWorks.step4Title,
      desc: t.howItWorks.step4Desc
    },
    {
      num: "05",
      icon: ShieldAlert,
      title: t.howItWorks.step5Title,
      desc: t.howItWorks.step5Desc
    },
    {
      num: "06",
      icon: FileSignature,
      title: t.howItWorks.step6Title,
      desc: t.howItWorks.step6Desc
    }
  ];

  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-[#F8FAF9] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E5F2E8] text-[#075C32] text-xs font-bold uppercase tracking-wider mb-3">
            <span>{lang === 'ta' ? 'முறையான வழிமுறை' : 'Standard Workflow'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight [text-wrap:balance]">
            {t.howItWorks.title}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            {t.howItWorks.subtitle}
          </p>
        </div>

        {/* 6-Step Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:border-[#12834B]/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-black font-mono text-[#075C32]/30">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#E5F2E8] flex items-center justify-center text-[#075C32]">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-2.5">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>{lang === 'ta' ? `படிநிலை ${step.num}` : `Step ${step.num} of 06`}</span>
                  <span className="text-[#12834B]">{lang === 'ta' ? 'வெளிப்படையானது' : 'Verified'}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
