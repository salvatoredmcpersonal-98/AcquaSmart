import { useTranslation } from 'react-i18next';
import { useTrial } from '../hooks/useTrial';
import { Bell, Settings as SettingsIcon } from 'lucide-react';

export default function Header({ onNavigate }) {
  const { t } = useTranslation();
  const { daysRemaining, isActive } = useTrial();

  return (
    <header className="bg-zinc-900/50 backdrop-blur-lg p-4 flex justify-between items-center border-b border-white/10">
      <div className="text-xl font-bold text-white">{t('app_title')}</div>
      <div className="flex items-center gap-4">
        {isActive && (
          <div className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
            {t('trial_ends_in_days', { days: daysRemaining })}
          </div>
        )}
        <button className="text-white/70 hover:text-white transition-colors">
          <Bell size={20} />
        </button>
        <button onClick={() => onNavigate('settings')} className="text-white/70 hover:text-white transition-colors">
          <SettingsIcon size={20} />
        </button>
      </div>
    </header>
  );
}
