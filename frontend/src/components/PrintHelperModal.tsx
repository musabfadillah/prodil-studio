import React from 'react';
import { X, Printer, Smartphone, Monitor, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PrintHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedPrint: () => void;
}

export const PrintHelperModal: React.FC<PrintHelperModalProps> = ({
  isOpen,
  onClose,
  onProceedPrint,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Printer size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">{t('printTitle')}</h3>
              <p className="text-[11px] text-slate-500">{t('printSubtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PC / Laptop */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-2">
                <Monitor size={16} className="text-blue-600" /> {t('pcLaptop')}
              </div>
              <ul className="text-[11px] space-y-1.5 text-slate-600">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>{t('printDestination')}: <strong>{t('printSavePdf')}</strong></span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>{t('printPaper')}: <strong>A4</strong></span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>{t('printMargins')}: <strong>{t('printNone')}</strong></span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span><strong>{t('printBackground')}</strong></span>
                </li>
              </ul>
            </div>

            {/* Smartphone Android / iOS */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-2">
                <Smartphone size={16} className="text-blue-600" /> {t('smartphone')}
              </div>
              <ul className="text-[11px] space-y-1.5 text-slate-600">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span><strong>{t('chromeAndroid')}:</strong> {t('printChrome')}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span><strong>{t('safariIos')}:</strong> {t('printSafari')}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>{t('printCopyText')}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              {t('cancel')}
            </button>
            <button
              onClick={() => {
                onClose();
                onProceedPrint();
              }}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md flex items-center gap-2"
            >
              <Printer size={14} /> {t('continuePrint')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
