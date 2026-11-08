import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { ShieldCheck, Target, Compass, Award, Building2, MapPin, Mail, Phone } from 'lucide-react';

interface AboutSectionProps {
  lang: Language;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <section id="about" className="py-16 lg:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E5F2E8] text-[#075C32] text-xs font-bold uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5 text-[#12834B]" />
            <span>{lang === 'ta' ? 'நிறுவன பின்னணி' : 'Corporate Profile'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight [text-wrap:balance]">
            {t.about.title}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            {t.about.subtitle}
          </p>
        </div>

        {/* Narrative & Registered Letterhead Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch mb-16">
          
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-4 text-base">
              <p className="text-lg font-medium text-slate-800">
                {t.about.introParagraph1}
              </p>
              <p>
                {t.about.introParagraph2}
              </p>
              <p>
                {lang === 'ta' 
                  ? 'எங்கள் நிறுவனத்தில் பங்குபெறும் ஒவ்வொரு உறுப்பினரின் முதலீடும் பாதுகாப்பான ஆவணங்கள் மற்றும் 2 உத்தரவாத கையொப்பங்கள் மூலம் முழுமையாக உறுதி செய்யப்படுகிறது. தவணைகள் மற்றும் குலுக்கல் நடைமுறைகள் யாவும் வெளிப்படையாக முன்கூட்டியே அறிவிக்கப்பட்டு முறைப்படுத்தப்படுகின்றன.'
                  : 'Every participant’s capital is protected through verified documentation, dual guarantors, and systematic banking channels. All auction procedures and bonus structures are strictly adhered to as published in our official rate cards.'}
              </p>
            </div>

            {/* Mission & Vision Bento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2 mb-2 text-[#075C32]">
                  <Target className="w-5 h-5" />
                  <h3 className="font-bold text-base text-slate-900">{t.about.missionTitle}</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {t.about.missionText}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2 mb-2 text-[#12834B]">
                  <Compass className="w-5 h-5" />
                  <h3 className="font-bold text-base text-slate-900">{t.about.visionTitle}</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {t.about.visionText}
                </p>
              </div>
            </div>
          </div>

          {/* Official Letterhead Representation Card */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="border-b border-slate-200 pb-4 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">
                  CIN: U64990TN2025PTC181717
                </span>
                <span className="text-[11px] font-semibold text-[#075C32] px-2 py-0.5 bg-[#E5F2E8] rounded-md">
                  Active Entity
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#075C32] mt-2 tracking-tight">
                TEAM STARS CHITS PRIVATE LIMITED
              </h3>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#12834B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-slate-900 mb-0.5">
                    {t.about.registeredOfficeLabel}
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    41/5E, Madathattuvillai, Villukuri, Kalkulam, Kanyakumari District – 629180, Tamil Nadu, India.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#12834B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-slate-900 mb-0.5">Public Phone</span>
                  <a href="tel:9789825684" className="text-[#075C32] font-semibold hover:underline">
                    +91 9789825684
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#12834B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-slate-900 mb-0.5">Official Inquiries</span>
                  <a href="mailto:teamstarschitsprivatelimited@gmail.com" className="text-slate-700 hover:text-[#075C32] break-all">
                    teamstarschitsprivatelimited@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Incorporated: 2025</span>
              <span>Kalkulam Jurisdiction</span>
            </div>
          </div>

        </div>

        {/* 4 Core Business Values Grid */}
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight text-center mb-8">
            {t.about.valuesTitle}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-[#12834B]/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#E5F2E8] flex items-center justify-center text-[#075C32] font-bold mb-4">
                01
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-2">{t.about.value1Title}</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">{t.about.value1Text}</p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-[#12834B]/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#E5F2E8] flex items-center justify-center text-[#075C32] font-bold mb-4">
                02
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-2">{t.about.value2Title}</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">{t.about.value2Text}</p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-[#12834B]/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#E5F2E8] flex items-center justify-center text-[#075C32] font-bold mb-4">
                03
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-2">{t.about.value3Title}</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">{t.about.value3Text}</p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-[#12834B]/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#E5F2E8] flex items-center justify-center text-[#075C32] font-bold mb-4">
                04
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-2">{t.about.value4Title}</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">{t.about.value4Text}</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
