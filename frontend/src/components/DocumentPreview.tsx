import React, { useEffect, useRef, useState } from 'react';
import { MasterProfile, CVDesignConfig, LegacySectionKey } from '../types/cv';
import { CVRenderer } from '../templates/CVRenderer';
import { ZoomIn, ZoomOut, Maximize2, ShieldCheck, Smartphone, Monitor, Download, Palette } from 'lucide-react';
import { TemplatesModal } from './TemplatesModal';
import { useLanguage } from '../context/LanguageContext';

interface DocumentPreviewProps {
  profile: MasterProfile;
  config: CVDesignConfig;
  setConfig: React.Dispatch<React.SetStateAction<CVDesignConfig>>;
  onOpenAtsScore: () => void;
  onTriggerPrint: () => void;
  onSectionFocus?: (section: 'personal' | LegacySectionKey) => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  profile,
  config,
  setConfig,
  onOpenAtsScore,
  onTriggerPrint,
  onSectionFocus,
}) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [documentHeight, setDocumentHeight] = useState(1123);
  const [zoomMode, setZoomMode] = useState<'auto' | 'manual'>('auto');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [templatesOpen, setTemplatesOpen] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(([entry]) => {
      setAvailableWidth(entry.target.getBoundingClientRect().width);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const printableDocument = documentRef.current;
    if (!printableDocument) return;

    const observer = new ResizeObserver(([entry]) => {
      setDocumentHeight(Math.max(1123, entry.contentRect.height));
    });
    observer.observe(printableDocument);
    return () => observer.disconnect();
  }, []);

  const canvasContentWidth = Math.max(0, availableWidth - 32);
  const measuredWidth = previewDevice === 'mobile' ? Math.min(375, canvasContentWidth) : availableWidth;
  const autoScale = availableWidth > 0
    ? Math.min(1, Math.max(0, (measuredWidth - 32) / 794))
    : 1;
  const scale = zoomMode === 'auto' ? autoScale : zoomLevel / 100;
  const displayZoom = Math.round(scale * 100);
  const adjustZoom = (change: number) => {
    setZoomLevel(Math.min(120, Math.max(50, displayZoom + change)));
    setZoomMode('manual');
  };
  const setDevice = (device: 'desktop' | 'mobile') => {
    setPreviewDevice(device);
    setZoomMode('auto');
  };

  return (
    <div className="preview-wrapper flex flex-col rounded-2xl border border-slate-300/80 bg-slate-200/70 shadow-inner">
      {/* Top Preview Controls Toolbar */}
      <div className="no-print bg-white p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => adjustZoom(-10)}
            title={t('zoomOut')}
            className="p-1 rounded hover:bg-white text-slate-600 transition-colors"
          >
            <ZoomOut size={14} />
          </button>
          <span className="px-1.5 font-mono text-[11px] font-semibold text-slate-700 min-w-[40px] text-center">
            {displayZoom}%{zoomMode === 'auto' ? ` · ${t('autoFit')}` : ''}
          </span>
          <button
            onClick={() => adjustZoom(10)}
            title={t('zoomIn')}
            className="p-1 rounded hover:bg-white text-slate-600 transition-colors"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoomMode('auto')}
            title={t('autoFit')}
            aria-label={t('autoFit')}
            aria-pressed={zoomMode === 'auto'}
            className={`rounded p-1 transition-colors ${zoomMode === 'auto' ? 'bg-white text-blue-600' : 'text-slate-600 hover:bg-white'}`}
          >
            <Maximize2 size={13} />
          </button>
        </div>

        {/* Center: Device Mode (Desktop / Mobile Preview) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setDevice('desktop')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
              previewDevice === 'desktop'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor size={13} /> {t('desktopA4')}
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
              previewDevice === 'mobile'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone size={13} /> {t('mobileView')}
          </button>
        </div>

        {/* Right: ATS Score Pill & PDF Download Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTemplatesOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700"
          >
            <Palette size={13} /> {t('selectTheme')}
          </button>
          <button
            onClick={onOpenAtsScore}
            className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>{t('atsReady')}</span>
          </button>

          <button
            onClick={onTriggerPrint}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>{t('downloadPdf')}</span>
          </button>
        </div>
      </div>

      {/* Main Preview Scroll Area */}
      <div ref={canvasRef} className="preview-scroll-area flex justify-center items-start overflow-x-auto px-4 py-4 sm:px-4 sm:py-8">
        <div
          className={previewDevice === 'mobile' ? 'preview-phone-frame mx-auto w-[375px] max-w-full rounded-[2rem] border-[8px] border-slate-800 bg-slate-800 p-2 shadow-xl' : ''}
          style={previewDevice === 'mobile' ? { width: 'min(375px, 100%)' } : undefined}
        >
          <div
            className="preview-scale-frame transition-[width,height] duration-200"
            style={{ width: `${794 * scale}px`, height: `${documentHeight * scale}px` }}
          >
            <div
              className="preview-scale-container"
              style={{
                width: '794px',
                minHeight: '1123px',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              {/* Printable A4 Document Container */}
              <div
                ref={documentRef}
                id="printable-cv-sheet"
                className="printable-document relative w-[794px] min-h-[1123px] bg-white rounded-lg shadow-sheet border border-slate-300/80"
              >
                <div className="a4-page-boundary no-print"><span>{t('pageBoundary')}</span></div>
                <CVRenderer profile={profile} config={config} onSectionFocus={onSectionFocus} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <TemplatesModal
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        activeTemplateId={config.themeId}
        onSelectTemplate={(themeId) => {
          setConfig((current) => ({ ...current, themeId, accentColor: '' }));
          setTemplatesOpen(false);
        }}
      />
    </div>
  );
};