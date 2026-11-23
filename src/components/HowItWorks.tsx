import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Search, CheckCircle, Send, PhoneCall, ShieldAlert, FileSignature, ArrowUpRight } from 'lucide-react';
import { FintechCard3D } from './3d/FintechCard3D';
import { MotionSection } from './3d/MotionSection';
import { IsometricArchitecture3DScene } from './3d/TemplateShowcaseScenes';

interface HowItWorksProps {
  lang: Language;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  const steps = [
    {
      num: '01',
      icon: Search,
      title: t.howItWorks.step1Title,
      desc: t.howItWorks.step1Desc
    },
    {
      num: '02',
      icon: CheckCircle,
      title: t.howItWorks.step2Title,
      desc: t.howItWorks.step2Desc
    },
    {
      num: '03',
      icon: Send,
      title: t.howItWorks.step3Title,
      desc: t.howItWorks.step3Desc
    },
    {
      num: '04',
      icon: PhoneCall,
      title: t.howItWorks.step4Title,
      desc: t.howItWorks.step4Desc
    },
    {
      num: '05',
      icon: ShieldAlert,
      title: t.howItWorks.step5Title,
      desc: t.howItWorks.step5Desc
    },
    {
      num: '06',
      icon: FileSignature,
      title: t.howItWorks.step6Title,
      desc: t.howItWorks.step6Desc
    }
  ];

  return (
    <section id="how-it-works" className="py-12 sm:py-16 lg:py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <MotionSection className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 bg-[#064E3B] border border-emerald-400/30 text-[#65E83A] px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest mb-3 pubzi-chamfer-sm">
            <span>{lang === 'ta' ? 'முறையான வழிமுறை' : 'Standard Workflow'}</span>
          </div>
          <h2 className="heading-3d-pop text-2xl sm:text-4xl font-extrabold text-[#052E22] tracking-tight leading-tight [text-wrap:balance]">
            {t.howItWorks.title}
          </h2>
          <p className="mt-3 text-sm sm:text-lg text-[#264D40] font-normal leading-relaxed">
            {t.howItWorks.subtitle}
          </p>
        </MotionSection>

        {/* 3D Isometric Stepped Architecture Showcase */}
        <MotionSection delay={0.04} className="mb-10 sm:mb-12">
          <div className="max-w-4xl mx-auto rounded-2xl border border-[#064E3B]/14 bg-white overflow-hidden pubzi-chamfer shadow-[0_18px_40px_-18px_rgba(6,78,59,0.16)]">
            <IsometricArchitecture3DScene className="w-full h-[240px] sm:h-[295px]" />
            <div className="bg-[#F4FBF7] border-t border-[#064E3B]/12 px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
              <div>
                <h3 className="side-heading-3d-pop text-sm font-extrabold text-[#052E22]">
                  {lang === 'ta' ? 'டீம் ஸ்டார்ஸ் 20-மாத கட்டமைப்பு' : 'The Team Stars 20-Month Ecosystem'}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#264D40]">
                  {lang === 'ta'
                    ? 'ஒவ்வொரு மாதமும் 10-ஆம் தேதி போனஸ், 11-ஆம் தேதி குலுக்கல், 25-க்குள் பட்டுவாடா.'
                    : 'Synchronized monthly instalments by the 10th, live auction on the 11th, payout by the 25th.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3.5 py-2 text-xs font-bold text-white bg-[#064E3B] hover:bg-[#0B5D46] rounded-lg transition-colors inline-flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>{lang === 'ta' ? 'கணக்கிடுக' : 'Simulate Returns'}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#65E83A]" />
              </button>
            </div>
          </div>
        </MotionSection>

        {/* 6-Step Chamfered Numbered Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isLightGreenFocus = idx % 2 === 1;
            const delayClasses = ['', 'reveal-delay-100', 'reveal-delay-200'];
            const staggerClass = delayClasses[idx % 3];
            return (
              <div key={idx} className={`reveal ${staggerClass} flex`}>
                <FintechCard3D
                  accent={isLightGreenFocus ? 'mint' : 'emerald'}
                  className="w-full relative fintech-card pubzi-chamfer hover:border-[#064E3B]/35 rounded-2xl p-5 sm:p-7 transition-all flex flex-col justify-between"
                >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center border pubzi-chamfer-sm ${
                        isLightGreenFocus
                          ? 'bg-[#65E83A] border-[#064E3B]/20 text-[#052E22] shadow-sm'
                          : 'bg-[#064E3B] border-emerald-400/25 text-[#65E83A]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-black font-mono text-[#064E3B]/14 tabular-nums">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="side-heading-3d-pop text-base sm:text-lg font-bold text-[#052E22] tracking-tight mb-2.5">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#264D40] font-normal leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#064E3B]/10 flex items-center justify-between text-[11px] font-semibold text-[#476D60]">
                  <span>{lang === 'ta' ? `படிநிலை ${step.num}` : `Step ${step.num} of 06`}</span>
                  <span className="text-[#064E3B] font-bold">{lang === 'ta' ? 'வெளிப்படையானது' : 'Verified'}</span>
                </div>
                </FintechCard3D>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
