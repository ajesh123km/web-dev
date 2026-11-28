import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Announcement, Language } from '../types';

interface PublicAnnouncementsProps {
  lang: Language;
}

export const PublicAnnouncements: React.FC<PublicAnnouncementsProps> = ({ lang }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    let active = true;
    const loadAnnouncements = () => {
      fetch('/api/public-announcements')
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (active && Array.isArray(data?.announcements)) {
            setAnnouncements(data.announcements);
          }
        })
        .catch((error) => {
          console.error('Failed to load public announcements:', error);
        });
    };

    loadAnnouncements();
    window.addEventListener('teamstars:announcements-updated', loadAnnouncements);
    return () => {
      active = false;
      window.removeEventListener('teamstars:announcements-updated', loadAnnouncements);
    };
  }, []);

  if (announcements.length === 0) return null;

  return (
    <section aria-labelledby="public-announcements-title" className="bg-gradient-to-br from-white/30 via-white/24 to-white/18 backdrop-blur-lg rounded-3xl border border-white/30 shadow-xl overflow-hidden isolate bg-clip-padding">
      <div className="px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-[#064E3B] p-2 text-[#65E83A]">
            <Bell className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="public-announcements-title" className="text-xl font-extrabold text-[#052E22]">
              {lang === 'ta' ? 'அறிவிப்புகள்' : 'Latest announcements'}
            </h2>
            <p className="text-sm text-[#0B3B2C]">
              {lang === 'ta' ? 'அனைவருக்கும் வெளியிடப்பட்ட செய்திகள்' : 'Updates published for everyone'}
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {announcements.slice(0, 4).map((announcement) => (
            <article key={announcement.id} className="rounded-2xl border border-emerald-900/10 bg-white/70 p-4 shadow-sm">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-emerald-800">
                {announcement.category}
                {announcement.publish_date && (
                  <span className="ml-2 font-medium text-slate-600">
                    {new Date(`${announcement.publish_date}T00:00:00`).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN')}
                  </span>
                )}
              </p>
              <h3 className="font-bold text-[#052E22]">{announcement.title}</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {announcement.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
