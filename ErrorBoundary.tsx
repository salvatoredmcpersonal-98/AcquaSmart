import { useTranslation } from 'react-i18next';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { AtSign, Lock } from 'lucide-react';

const SocialButton = ({ icon, text, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-colors duration-200 text-white font-medium">
    {icon}
    {text}
  </button>
);

const InputField = ({ icon, placeholder }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
      {icon}
    </div>
    <input
      type={placeholder.toLowerCase().includes('password') ? 'password' : 'text'}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-shadow"
    />
  </div>
);

export default function Login({ onLogin }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">{t('login_welcome')}</h1>
          <p className="text-white/60 mt-2">{t('login_tagline')}</p>
        </div>

        <div className="space-y-4">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <InputField icon={<AtSign size={20} className="text-white/40" />} placeholder={t('login_label_email')} />
            <InputField icon={<Lock size={20} className="text-white/40" />} placeholder={t('login_label_password')} />
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 transition-colors duration-200 text-white font-bold py-3 rounded-xl">
              {t('login_button_classic')}
            </button>
          </form>

          <p className="text-center text-sm text-white/50 pt-2">
            {t('login_signup_prompt')} <a href="#" className="font-medium text-emerald-400 hover:underline">{t('login_signup_link')}</a>
          </p>

          <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-white/40 text-sm">OR</span>
              <div className="flex-grow border-t border-white/10"></div>
          </div>

          <SocialButton icon={<FcGoogle size={22} />} text={t('login_with_google')} onClick={onLogin} />
          <SocialButton icon={<FaApple size={22} />} text={t('login_with_apple')} onClick={onLogin} />
        </div>
      </div>
    </div>
  );
}
