import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTrial } from '../hooks/useTrial';
import { Bell, Settings as SettingsIcon } from 'lucide-react';

interface HeaderProps {
  onSettingsClick: () => void;
  onLogoClick: () => void;
  onRemindersClick: () => void;
  reminders?: any[];
}

const Header = memo(({ onSettingsClick, onLogoClick, onRemindersClick, reminders = [] }: HeaderProps) => {
  const { t } = useTranslation();
  const { daysRemaining, isActive } = useTrial();

  const expiredCount = reminders.filter(r => new Date(r.nextDue) <= new Date()).length;

  return (
    <header className="h-[65px] bg-zinc-900/50 backdrop-blur-lg p-4 flex justify-between items-center border-b border-white/10 shrink-0">
      <button 
        onClick={onLogoClick}
        className="text-xl font-bold text-white hover:opacity-80 transition-opacity"
      >
        {t('app_title')}
      </button>
      <div className="flex items-center gap-4">
        {isActive && (
          <div className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
            {t('trial_ends_in_days', { days: daysRemaining })}
          </div>
        )}
        <button 
          onClick={onRemindersClick}
          className="text-white/70 hover:text-white transition-colors relative p-1"
        >
          <Bell size={20} />
          {expiredCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              {expiredCount}
            </span>
          )}
        </button>
        <button onClick={onSettingsClick} className="text-white/70 hover:text-white transition-colors p-1">
          <SettingsIcon size={20} />
        </button>
      </div>
    </header>
  );
});

export default Header;
