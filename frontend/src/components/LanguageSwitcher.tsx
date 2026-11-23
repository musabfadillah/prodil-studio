import React, { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { LANGUAGES, useLanguage } from '../context/LanguageContext';

const Flag: React.FC<{ code: string }> = ({ code }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 rounded-full shadow-sm ring-1 ring-slate-200" aria-hidden="true">
    {code === 'GB' ? (
      <>
        <rect width="24" height="24" fill="#1d4ed8" />
        <path d="M0 0l24 24M24 0L0 24" stroke="#fff" strokeWidth="5" />
        <path d="M0 0l24 24M24 0L0 24" stroke="#dc2626" strokeWidth="2" />
        <path d="M12 0v24M0 12h24" stroke="#fff" strokeWidth="7" />
        <path d="M12 0v24M0 12h24" stroke="#dc2626" strokeWidth="3" />
      </>
    ) : code === 'US' ? (
      <>
        {[0, 4, 8, 12, 16, 20].map((y) => <rect key={y} y={y} width="24" height="4" fill={y % 8 === 0 ? '#dc2626' : '#fff'} />)}
        <rect width="11" height="12" fill="#1e40af" />
      </>
    ) : code === 'IT' ? (
      <><rect width="8" height="24" fill="#149447" /><rect x="8" width="8" height="24" fill="#fff" /><rect x="16" width="8" height="24" fill="#ce2b37" /></>
    ) : code === 'DE' ? (
      <><rect width="24" height="8" fill="#18181b" /><rect y="8" width="24" height="8" fill="#dc2626" /><rect y="16" width="24" height="8" fill="#eab308" /></>
    ) : (
      <><rect width="24" height="12" fill="#dc2626" /><rect y="12" width="24" height="12" fill="#fff" /></>
    )}
  </svg>
);

export const LanguageSwitcher: React.FC = () => {
  const { language, option, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => LANGUAGES.filter((item) =>
    `${item.country} ${item.language} ${item.countryCode}`.toLowerCase().includes(search.toLowerCase())
  ), [search]);

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-haspopup="listbox" aria-expanded={open}
        className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-extrabold text-slate-800 hover:bg-slate-100">
        <Flag code={option.flag} /><span>{option.countryCode}</span><ChevronDown size={13} className="text-slate-400" />
      </button>
      {open && (
        <>
          <button type="button" aria-label={t('closeLanguageMenu')} className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-[330px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-bold text-slate-900">{t('choose')}</p>
              <label className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search size={15} className="text-slate-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('searchLanguage')} className="min-w-0 flex-1 bg-transparent text-xs outline-none" />
              </label>
            </div>
            <div role="listbox" className="max-h-80 p-2">
              {filtered.map((item) => (
                <button type="button" role="option" aria-selected={item.code === language} key={item.code} onClick={() => { setLanguage(item.code); setOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${item.code === language ? 'bg-blue-50 ring-1 ring-blue-100' : 'hover:bg-slate-50'}`}>
                  <Flag code={item.flag} />
                  <span className="text-xs font-bold text-slate-900">{item.country}</span>
                  <span className="ml-auto text-[11px] text-slate-500">{item.language}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
