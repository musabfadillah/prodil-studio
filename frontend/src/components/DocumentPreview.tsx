import React, { useState } from 'react';
import { MasterProfile, CVDesignConfig } from '../types/cv';
import { CVRenderer } from '../templates/CVRenderer';
import { ZoomIn, ZoomOut, Maximize2, ShieldCheck, Printer, Smartphone, Monitor, Download } from 'lucide-react';

interface DocumentPreviewProps {
  profile: MasterProfile;
  config: CVDesignConfig;
  onOpenAtsScore: () => void;
  onTriggerPrint: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  profile,
  config,
  onOpenAtsScore,
  onTriggerPrint,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(95);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 140));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 60));
  const handleResetZoom = () => setZoomLevel(95);

  return (
    <div className="flex flex-col h-full bg-slate-200/70 rounded-2xl border border-slate-300/80 overflow-hidden shadow-inner">
      {/* Top Preview Controls Toolbar */}
      <div className="no-print bg-white p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={handleZoomOut}
            title="Perkecil Tampilan"
            className="p-1 rounded hover:bg-white text-slate-600 transition-colors"
          >
            <ZoomOut size={14} />
          </button>
          <span className="px-1.5 font-mono text-[11px] font-semibold text-slate-700 min-w-[40px] text-center">
            {zoomLevel}%
          </span>
          <button
            onClick={handleZoomIn}
            title="Perbesar Tampilan"
            className="p-1 rounded hover:bg-white text-slate-600 transition-colors"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={handleResetZoom}
            title="Fit to Screen (Pas Layar)"
            className="p-1 rounded hover:bg-white text-slate-600 transition-colors ml-1"
          >
            <Maximize2 size={13} />
          </button>
        </div>

        {/* Center: Device Mode (Desktop / Mobile Preview) */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setPreviewDevice('desktop')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
              previewDevice === 'desktop'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor size={13} /> Desktop (A4)
          </button>
          <button
            onClick={() => setPreviewDevice('mobile')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
              previewDevice === 'mobile'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone size={13} /> Mobile View
          </button>
        </div>

        {/* Right: ATS Score Pill & PDF Download Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAtsScore}
            className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>96/100 ATS Ready</span>
          </button>

          <button
            onClick={onTriggerPrint}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Download ATS PDF</span>
          </button>
        </div>
      </div>

      {/* Main Preview Scroll Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start">
        <div
          className={`transition-all duration-200 ${
            previewDevice === 'mobile' ? 'max-w-md w-full' : 'w-full max-w-[210mm]'
          }`}
          style={{
            transform: previewDevice === 'desktop' ? `scale(${zoomLevel / 100})` : 'none',
            transformOrigin: 'top center',
          }}
        >
          {/* Printable A4 Document Container */}
          <div
            id="printable-cv-sheet"
            className="printable-document bg-white rounded-lg shadow-sheet border border-slate-300/80 overflow-hidden min-h-[297mm] w-full"
          >
            <CVRenderer profile={profile} config={config} />
          </div>
        </div>
      </div>
    </div>
  );
};
