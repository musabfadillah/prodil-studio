import React from 'react';
import { ShieldCheck, Server } from 'lucide-react';
import { ProdilLogo } from './ProdilLogo';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="no-print bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="[&_*]:text-white [&_.text-slate-500]:text-slate-400 [&_.rounded]:bg-white/10 [&_.rounded]:text-blue-200"><ProdilLogo /></span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm mb-4">
              {t('footerDescription')}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Server size={14} className="text-blue-400" /> {t('footerHost')}</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-400" /> {t('footerCdn')}</span>
            </div>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">{t('careerDocuments')}</h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>{t('footerTemplate')}</li>
              <li>{t('footerLetter')}</li>
              <li>{t('footerMaster')}</li>
              <li>{t('footerJsonBackup')}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">{t('workspaceFeatures')}</h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>{t('footerVector')}</li>
              <li>{t('footerSignIn')}</li>
              <li>{t('footerSecureData')}</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Prodil Studio. {t('footerRights')}</p>
          <p className="mt-2 sm:mt-0">{t('footerAudience')}</p>
        </div>
      </div>
    </footer>
  );
};
