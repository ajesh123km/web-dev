import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { ShieldCheck, CalendarCheck, Award, Building, Landmark, Users, ArrowUpRight } from 'lucide-react';
import { FintechCard3D } from './3d/FintechCard3D';
import { MotionSection } from './3d/MotionSection';

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
    <section id="why-us" className="py-12 sm:py-16 lg:py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <MotionSection className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 bg-[#064E3B] text-[#65E83A] border border-emerald-400/30 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest mb-3 pubzi-chamfer-sm">
            <span>{lang === 'ta' ? 'நம்பகத்தன்மை தூண்கள்' : 'Core Advantages'}</span>
          </div>
          <h2 className="heading-3d-pop text-2xl sm:text-4xl font-extrabold text-[#052E22] tracking-tight leading-tight [text-wrap:balance]">
            {t.whyUs.title}
          </h2>
          <p className="mt-3 text-sm sm:text-lg text-[#0B3B2C] font-medium leading-relaxed">
            {t.whyUs.subtitle}
          </p>
        </MotionSection>

        {/* 3 Core Pillars Editorial Bento Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-10 sm:mb-14">
          {/* Pillar 1: Structured Plans */}
          <button
            type="button"
            onClick={() => document.getElementById('schemes')?.scrollIntoView({ behavior: 'smooth' })}
            className="reveal group text-left relative rounded-2xl fintech-card-forest pubzi-chamfer text-[#ECFDF5] p-6 min-h-[195px] flex flex-col justify-between overflow-hidden transition-transform duration-200 hover:-translate-y-1 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#65E83A]">
                {lang === 'ta' ? 'தூண் 01' : 'Core Pillar 01'}
              </span>
              <span className="w-9 h-9 rounded-xl bg-white/10 border border-[#65E83A]/35 text-[#65E83A] group-hover:bg-[#65E83A] group-hover:text-[#052E22] flex items-center justify-center transition-colors shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>

            <div className="flex items-end justify-between gap-4 mt-8">
              <div className="w-12 h-12 rounded-xl bg-[#052E22] border border-[#65E83A]/45 flex items-center justify-center text-2xl font-extrabold text-[#65E83A] shrink-0">
                ₹
              </div>
              <div className="text-right">
                <h3 className="side-heading-3d-pop-dark text-base sm:text-lg font-extrabold text-white leading-snug">
                  {lang === 'ta' ? '₹1L – ₹10L சீட்டு திட்டங்கள்' : '₹1L – ₹10L Chit Tiers'}
                </h3>
                <p className="text-[11px] text-[#D1FAE5] mt-0.5">
                  {lang === 'ta' ? '20 மாத நிலையான தவணைகள்' : '20-Month Fixed Schedules'}
                </p>
              </div>
            </div>
          </button>

          {/* Pillar 2: 11th Monthly Draw */}
          <button
            type="button"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="reveal reveal-delay-100 group text-left relative rounded-2xl fintech-card-mint pubzi-chamfer p-6 min-h-[195px] flex flex-col justify-between overflow-hidden transition-transform duration-200 hover:-translate-y-1 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#052E22]">
                {lang === 'ta' ? 'தூண் 02' : 'Core Pillar 02'}
              </span>
              <span className="w-9 h-9 rounded-xl bg-[#064E3B] border border-emerald-400/25 text-[#65E83A] group-hover:bg-[#0B5D46] flex items-center justify-center transition-colors shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>

            <div className="flex items-end justify-between gap-4 mt-8">
              <div className="w-12 h-12 rounded-xl bg-[#064E3B] text-[#65E83A] flex items-center justify-center text-sm font-black font-mono shrink-0">
                11th
              </div>
              <div className="text-right">
                <h3 className="side-heading-3d-pop text-base sm:text-lg font-extrabold text-[#052E22] leading-snug">
                  {lang === 'ta' ? 'மாதாந்திர நேரடி குலுக்கல்' : 'Monthly Verified Draws'}
                </h3>
                <p className="text-[11px] text-[#0B3B2C] mt-0.5 font-semibold">
                  {lang === 'ta' ? 'உறுப்பினர்கள் முன்னிலையில் ஏலம்' : 'Transparent Live Auctions'}
                </p>
              </div>
            </div>
          </button>

          {/* Pillar 3: Timely Bonus Network */}
          <button
            type="button"
            onClick={() => document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="reveal reveal-delay-200 group text-left relative rounded-2xl fintech-card pubzi-chamfer p-6 min-h-[195px] flex flex-col justify-between overflow-hidden transition-transform duration-200 hover:-translate-y-1 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#0B3B2C]">
                {lang === 'ta' ? 'தூண் 03' : 'Core Pillar 03'}
              </span>
              <span className="w-9 h-9 rounded-xl bg-white border border-[#064E3B]/20 text-[#064E3B] group-hover:bg-[#064E3B] group-hover:text-[#65E83A] flex items-center justify-center transition-colors shrink-0 shadow-xs">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>

            <div className="flex items-end justify-between gap-4 mt-8">
              <div className="w-12 h-12 rounded-xl bg-[#064E3B] text-[#65E83A] flex items-center justify-center shrink-0 shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <div className="text-right">
                <h3 className="side-heading-3d-pop text-base sm:text-lg font-extrabold text-[#052E22] leading-snug">
                  {lang === 'ta' ? 'சிறப்பு போனஸ் பலன்' : '10th Payment Bonus'}
                </h3>
                <p className="text-[11px] text-[#0B3B2C] font-medium mt-0.5">
                  {lang === 'ta' ? 'நேர தவணை உறுப்பினர் சலுகை' : 'Zero-Delay Member Rewards'}
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* 6 Pillars Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            const isForestAccent = idx % 2 === 0;
            const delayClasses = ['', 'reveal-delay-100', 'reveal-delay-200'];
            const staggerClass = delayClasses[idx % 3];
            return (
              <div key={idx} className={`reveal ${staggerClass} flex`}>
                <FintechCard3D
                  accent={isForestAccent ? 'emerald' : 'mint'}
                  className="w-full p-5 sm:p-7 rounded-2xl fintech-card-ash pubzi-chamfer hover:border-[#064E3B]/35 transition-all flex flex-col justify-between"
                >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center pubzi-chamfer-sm ${
                        isForestAccent
                          ? 'bg-[#064E3B] border-emerald-400/25 text-[#65E83A] shadow-sm'
                          : 'bg-[#65E83A] border-[#064E3B]/20 text-[#052E22]'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black font-mono text-[#064E3B]/18 tabular-nums">
                      0{idx + 1}
                    </span>
                  </div>

                  <h3 className="side-heading-3d-pop text-base sm:text-lg font-bold text-[#052E22] mb-2.5 tracking-tight">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#0B3B2C] leading-relaxed font-medium">
                    {pillar.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-white/30 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-[#0B3B2C]">Team Stars Guarantee</span>
                  <span className="text-[#064E3B]">100% Verifiable</span>
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
