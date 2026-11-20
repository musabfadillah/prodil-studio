import React from 'react';
import { ShieldCheck, Server, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="no-print bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <img src="/assets/prodil-logo.jpg" alt="Prodil Studio" className="h-8 w-auto rounded" />
              <span className="text-white font-extrabold text-lg">Prodil Studio</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm mb-4">
              All-in-one Career & Personal Document Builder. Sedia 15 Template CV ATS teruji, Master Profile sekali isi, dan Gemini AI Assistant.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Server size={14} className="text-blue-400" /> Hostinger VPS (Node.js + PostgreSQL)</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-400" /> Vercel HTTPS CDN</span>
            </div>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Dokumen Karir</h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>15 Template CV ATS-Friendly</li>
              <li>Cover Letter / Job Application</li>
              <li>Master Profile (Single Source of Truth)</li>
              <li>Smart Import Resume (PDF/DOCX)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Teknologi & Fitur AI</h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5"><Sparkles size={12} className="text-amber-400" /> Google Gemini 2.5 Flash</li>
              <li>Selectable Text Vector PDF</li>
              <li>Google Sign-in & Email Verification</li>
              <li>Protected Quota Architecture</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Prodil Studio. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Dirancang untuk Fresh Graduate, Freelancer, dan Professional Creators.</p>
        </div>
      </div>
    </footer>
  );
};
