import { useTranslation } from 'react-i18next';
import { ArrowLeft, User, LogOut } from 'lucide-react';

const languages = [
  { code: 'it', name: 'Italiano' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'zh', name: '中文' },
];

// Mock user data for display purposes
const mockUser = {
  name: 'Mario Rossi',
  email: 'mario.rossi@example.com',
};

export default function Settings({ onBack, onLogout }) {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="p-6 text-white animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold">{t('settings_title')}</h1>
      </div>

      {/* Profile Section */}
      <div className="bg-zinc-800/50 border border-white/10 rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3"><User size={22} /> {t('profile_title')}</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-white text-lg">{mockUser.name}</p>
            <p className="text-sm text-white/60">{mockUser.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            <LogOut size={16} />
            {t('logout_button')}
          </button>
        </div>
      </div>

      {/* Language Section */}
      <div className="bg-zinc-800/50 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">{t('language_selection')}</h2>
        <div className="relative">
          <select
            value={i18n.language.split('-')[0]} // Handle cases like en-US
            onChange={(e) => changeLanguage(e.target.value)}
            className="w-full appearance-none bg-white/5 border border-white/20 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-shadow cursor-pointer"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-zinc-800 text-white">
                {lang.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
