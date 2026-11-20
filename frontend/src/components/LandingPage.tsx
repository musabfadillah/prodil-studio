import React, { useState } from 'react';
import { CV_TEMPLATES } from '../templates/TemplateRegistry';
import { Sparkles, CheckCircle2, FileDown, ShieldCheck, ArrowRight, Upload, Layers, Zap } from 'lucide-react';

interface LandingPageProps {
  onStartEditing: (templateId?: number) => void;
  onOpenSmartImport: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartEditing, onOpenSmartImport }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'ATS Clean', 'Executive', 'Creative', 'Modern', 'Technical'];

  const filteredTemplates = selectedCategory === 'All'
    ? CV_TEMPLATES
    : CV_TEMPLATES.filter(t => t.category === selectedCategory);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-100/60 to-transparent pointer-events-none rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles size={14} className="text-blue-600" />
            <span>Prodil Studio v2.0 &bull; 15 Template CV ATS + Gemini AI</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl mx-auto">
            Craft Your Career & Creative Identity <span className="text-blue-600">in Minutes.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Satu Profil untuk Semua Dokumen. Buat CV ramah sistem ATS, Cover Letter persuasif, dan portofolio profesional dengan teks asli yang 100% bisa di-copy dan stabil di smartphone.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onStartEditing(1)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-sm"
            >
              Mulai Buat CV Gratis <ArrowRight size={16} />
            </button>
            <button
              onClick={onOpenSmartImport}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Upload size={16} className="text-blue-600" /> Smart Import (PDF/DOCX)
            </button>
          </div>

          {/* Trust stats */}
          <div className="mt-12 pt-8 border-t border-slate-200/80 flex flex-wrap justify-center items-center gap-8 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>100% Selectable Text (No Screenshot)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>15 Pilihan Template Teruji</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Diproteksi Login & Verifikasi Email</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUE PILLARS */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Kenapa Memilih Prodil Studio?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Evaluasi mendalam dari versi sebelumnya: kini lebih kokoh, anti-gagal download di HP, dan ditenagai kecerdasan buatan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <FileDown size={20} />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">PDF Vektor Asli (ATS)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bukan gambar screenshot! Teks murni yang bisa di-copy & dibaca 100% oleh software HRD ATS perusahaan. Stabil di PC & smartphone.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <Sparkles size={20} />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Gemini AI Assistant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tulis ringkasan profesional otomatis dan pertajam poin pengalaman kerja menggunakan formula terukur (Google XYZ Method).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Layers size={20} />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Master Profile Tunggal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cukup isi data diri sekali. Ubah ke 15 template CV berbeda atau Cover Letter dalam sekejap tanpa ketik ulang.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Aman & Terverifikasi</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Login Google & Email Password dengan 6-digit verifikasi untuk mengamankan data profil dan menjaga kuota Gemini AI kamu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 15 CV TEMPLATES SHOWCASE */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">Koleksi Desain</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
              15 Template CV Prodil Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Semua 15 tema legendaris dari Prodil CV Maker kini disempurnakan dengan tipografi presisi.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-200/60 rounded-xl border border-slate-200">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-400 transition-all flex flex-col justify-between"
            >
              {/* Card Header & Preview mockup */}
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">#{template.id} {template.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {template.badge}
                </span>
              </div>

              {/* Mockup Preview Area */}
              <div className="p-6 bg-slate-100/50 flex flex-col items-center justify-center min-h-[180px] relative overflow-hidden group-hover:bg-blue-50/30 transition-colors">
                <div className="w-48 h-36 bg-white rounded-lg shadow-sm border border-slate-200 p-2.5 flex flex-col justify-between transform group-hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center gap-2 border-b pb-1.5 border-slate-100">
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: template.previewColor }} />
                    <div className="space-y-1">
                      <div className="w-16 h-2 bg-slate-300 rounded" />
                      <div className="w-10 h-1.5 bg-slate-200 rounded" />
                    </div>
                  </div>
                  <div className="space-y-1.5 py-1">
                    <div className="w-full h-1.5 bg-slate-200 rounded" />
                    <div className="w-5/6 h-1.5 bg-slate-200 rounded" />
                    <div className="w-4/6 h-1.5 bg-slate-200 rounded" />
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                    <div className="w-8 h-1.5 rounded" style={{ backgroundColor: template.previewColor }} />
                    <div className="w-6 h-1.5 bg-slate-200 rounded" />
                  </div>
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    <strong className="text-slate-600">Cocok untuk:</strong> {template.recommendedRole}
                  </p>
                </div>

                <button
                  onClick={() => onStartEditing(template.id)}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-1.5"
                >
                  Gunakan Template #{template.id} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Siap Membangun CV Kelas Dunia?
          </h2>
          <p className="mt-3 text-sm text-blue-100 max-w-xl mx-auto">
            Langsung masuk ke Studio Editor tanpa biaya, coba 15 template, dan unduh PDF dengan teks asli sekarang.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => onStartEditing(1)}
              className="px-8 py-3.5 rounded-xl font-bold bg-white text-blue-600 hover:bg-blue-50 shadow-lg text-sm transition-all"
            >
              Buka Studio Editor
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
