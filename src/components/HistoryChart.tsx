import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLocale } from '../context/LocaleContext';

const CustomTooltip = ({ active, payload, label }) => {
    const { t } = useTranslation();
    const { formatTemperature } = useLocale();

    if (active && payload && payload.length) {
        const data = payload[0].payload; // The full data object for this point
        return (
            <div className="bg-zinc-700/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-sm text-white">
                <p className="font-bold mb-2">{new Date(data.timestamp).toLocaleDateString()}</p>
                <ul className="space-y-1">
                    {data.temp !== null && typeof data.temp !== 'undefined' && (
                        <li style={{ color: '#f87171' }}>
                            {t('log_test_temp')}: 
                            <span className="font-semibold ml-2">{formatTemperature(data.temp)}</span>
                        </li>
                    )}
                    {data.ph !== null && typeof data.ph !== 'undefined' && (
                        <li style={{ color: '#38bdf8' }}>
                            pH: 
                            <span className="font-semibold ml-2">{data.ph.toFixed(1)}</span>
                        </li>
                    )}
                    {data.nitrates !== null && typeof data.nitrates !== 'undefined' && (
                        <li style={{ color: '#fbbf24' }}>
                            {t('log_test_nitrates')}: 
                            <span className="font-semibold ml-2">{data.nitrates} mg/L</span>
                        </li>
                    )}
                </ul>
            </div>
        );
    }

    return null;
};


export default function HistoryChart({ data }) {
    const { t } = useTranslation();

    if (!data || data.length < 2) {
        return (
            <div className="h-80 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-white/50">{t('chart_no_data')}</p>
            </div>
        );
    }

    const formattedData = data.map(log => ({
        ...log,
        date: new Date(log.timestamp).toLocaleDateString(),
    })).reverse();

    const hasData = (key) => data.some(log => log[key] !== null && typeof log[key] !== 'undefined');

    const hasTempData = hasData('temp');
    const hasPhData = hasData('ph');
    const hasNitratesData = hasData('nitrates');

    return (
        <div className="h-80 bg-white/5 border border-white/10 rounded-2xl p-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.5)" />
                    <YAxis stroke="rgba(255, 255, 255, 0.5)" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: '#fff' }} />
                    
                    {hasPhData && <Line connectNulls type="monotone" dataKey="ph" name="pH" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />}
                    {hasTempData && <Line connectNulls type="monotone" dataKey="temp" name={t('log_test_temp')} stroke="#f87171" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />}
                    {hasNitratesData && <Line connectNulls type="monotone" dataKey="nitrates" name={t('log_test_nitrates')} stroke="#fbbf24" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
