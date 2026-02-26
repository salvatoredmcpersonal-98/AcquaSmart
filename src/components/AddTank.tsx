import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Beaker, Box } from 'lucide-react';

const InputField = ({ icon, placeholder, value, onChange, type = 'text' }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
      {icon}
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-shadow"
    />
  </div>
);

export default function AddTank({ onTankAdded }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [type, setType] = useState('freshwater');
  const [volume, setVolume] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && type && volume) {
      onTankAdded({ name, type, volume: parseInt(volume, 10) });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">{t('add_tank_title')}</h1>
          <p className="text-white/60 mt-2">{t('add_tank_subtitle')}</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputField 
            icon={<Box size={20} className="text-white/40" />} 
            placeholder={t('tank_name_label')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Beaker size={20} className="text-white/40" />
            </div>
            <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full appearance-none bg-white/5 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-shadow cursor-pointer"
            >
                <option value="freshwater" className="bg-zinc-800">{t('tank_type_freshwater')}</option>
                <option value="saltwater" className="bg-zinc-800">{t('tank_type_saltwater')}</option>
                <option value="brackish" className="bg-zinc-800">{t('tank_type_brackish')}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          <InputField 
            icon={<Droplets size={20} className="text-white/40" />} 
            placeholder={t('tank_volume_label')}
            type="number"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
          />

          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 transition-colors duration-200 text-white font-bold py-3 rounded-xl !mt-8">
            {t('save_tank_button')}
          </button>
        </form>
      </div>
    </div>
  );
}
