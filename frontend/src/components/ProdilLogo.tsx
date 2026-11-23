import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface ProdilLogoProps {
  compact?: boolean;
}

export const ProdilLogo: React.FC<ProdilLogoProps> = ({ compact = false }) => {
  const { t } = useLanguage();
  return (
  <span className="inline-flex items-center gap-2.5">
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-10 w-10 shrink-0">
      <rect x="5" y="4" width="12" height="40" rx="6" fill="#0066FF" />
      <path d="M18 4C18 4 29 4 32 4C42 4 44 12 44 19C44 27 38 34 29 34H21C19.9 34 19 33.1 19 32V31.5C19 30.4 19.9 29.5 21 29.5H28.5C33.2 29.5 36.5 25.8 36.5 21C36.5 16.1 33.3 12.5 28.5 12.5H21C19.3 12.5 18 11.2 18 9.5V4Z" fill="#0066FF" />
      <path d="M21 18.5H28.5C30.4 18.5 32 20.1 32 22C32 23.9 30.4 25.5 28.5 25.5H21V18.5Z" fill="#00A3FF" />
      <path d="M20 34V38.2L14.8 44H20.2L27 36.5C29 34.3 27.3 31.5 24.5 31.5H21.5C20.7 31.5 20 32.2 20 34Z" fill="#0066FF" />
    </svg>
    {!compact && (
      <span className="flex flex-col">
        <span className="flex items-center gap-1.5 text-xl font-extrabold tracking-tight text-[#00104B]">
          Prodil Studio
          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">v2.0</span>
        </span>
        <span className="hidden text-[11px] font-medium text-slate-500 sm:inline">{t('productSubtitle')}</span>
      </span>
    )}
  </span>
  );
};
