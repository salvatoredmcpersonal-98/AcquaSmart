import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';

export default function Paywall() {
  const { t } = useTranslation();
  const { formatCurrency } = useLocale();

  const subscriptionPrice = 2.99;

  const features = [
    'Gestione Multi-vasca',
    'Grafici AI Avanzati',
    'Notifiche Predittive',
    'Salvataggio Dati Illimitato',
    'Supporto Prioritario'
  ];

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-4 text-center animate-fade-in">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-amber-400">{t('trial_expired_title')}</h1>
        <p className="text-white/70 mt-2 mb-8">{t('trial_expired_message')}</p>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-3 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircle size={20} className="text-emerald-400" />
              <span className="text-white">{feature}</span>
            </div>
          ))}
        </div>

        <button className="w-full bg-emerald-500 hover:bg-emerald-600 transition-colors duration-200 text-white font-bold py-4 rounded-xl text-lg">
          {t('subscribe_button', { price: formatCurrency(subscriptionPrice) })}
        </button>
      </div>
    </div>
  );
}
