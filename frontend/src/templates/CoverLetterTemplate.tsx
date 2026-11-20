import React from 'react';
import { MasterProfile, CoverLetterData } from '../types/cv';
import { Mail, Phone, MapPin } from 'lucide-react';

interface CoverLetterTemplateProps {
  profile: MasterProfile;
  letterData: CoverLetterData;
}

export const CoverLetterTemplate: React.FC<CoverLetterTemplateProps> = ({ profile, letterData }) => {
  const { personal } = profile;
  const accent = letterData.accentColor || '#2563eb';

  return (
    <div className="p-10 bg-white text-slate-900 font-sans leading-relaxed min-h-[297mm]">
      {/* Header */}
      <div className="border-b-2 pb-6 mb-8" style={{ borderColor: accent }}>
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-slate-900">{personal.fullName}</h1>
        <p className="text-sm font-semibold uppercase tracking-wider mt-1" style={{ color: accent }}>{personal.headline}</p>

        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600 mt-3">
          {personal.location && <span className="flex items-center gap-1"><MapPin size={13} /> {personal.location}</span>}
          {personal.phone && <span className="flex items-center gap-1"><Phone size={13} /> {personal.phone}</span>}
          {personal.email && <span className="flex items-center gap-1"><Mail size={13} /> {personal.email}</span>}
          {personal.website && <span>{personal.website}</span>}
        </div>
      </div>

      {/* Date & Recipient Details */}
      <div className="mb-6 text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-800">{letterData.date || new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div className="mt-4 font-bold text-slate-900 text-sm">{letterData.recipientName || 'Hiring Manager'}</div>
        <div>{letterData.recipientTitle || 'Talent Acquisition Team'}</div>
        <div className="font-semibold text-slate-800">{letterData.companyName || 'Target Company'}</div>
        {letterData.companyAddress && <div>{letterData.companyAddress}</div>}
      </div>

      {/* Subject Line */}
      {letterData.subject && (
        <div className="mb-6 pb-2 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-900">
            Subject: <span style={{ color: accent }}>{letterData.subject}</span>
          </p>
        </div>
      )}

      {/* Letter Body */}
      <div className="text-xs text-slate-700 leading-relaxed space-y-4 whitespace-pre-line text-justify">
        {letterData.letterBody}
      </div>

      {/* Sign-off */}
      <div className="mt-8 pt-4 border-t border-slate-100 text-xs">
        <p className="text-slate-600">Hormat saya,</p>
        <div className="mt-8 font-bold text-slate-900 text-sm">{personal.fullName}</div>
        <div className="text-slate-500">{personal.headline}</div>
      </div>
    </div>
  );
};
