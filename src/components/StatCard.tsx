import React from 'react';

interface Props {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  colorClass?: string;
  onClick?: () => void;
  isEditMode?: boolean;
}

export default function StatCard({ icon, label, value, colorClass, onClick, isEditMode }: Props) {
  return (
    <div
      className={`stat-card relative bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center h-full ${colorClass || ''} ${isEditMode ? 'edit-mode-active' : ''}`}
      onClick={onClick}
      /* Non aggiungere `onTouchStart`/`onTouchEnd` qui, lasciali gestire dal genitore se serve */
    >
      {icon && <div className="mb-2">{icon}</div>}
      <p className="text-xs text-white/60 mb-2 stat-label">{label}</p>
      <span className="text-3xl font-bold text-white stat-value">{value}</span>
    </div>
  );
}