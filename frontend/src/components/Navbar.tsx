import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, FileText, CheckCircle2, User as UserIcon, LogOut, ShieldCheck, ChevronDown } from 'lucide-react';

interface NavbarProps {
  activeView: 'landing' | 'studio';
  setActiveView: (view: 'landing' | 'studio') => void;
  editorTab: 'profile' | 'cv' | 'cover-letter';
  setEditorTab: (tab: 'profile' | 'cv' | 'cover-letter') => void;
  onOpenSmartImport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  editorTab,
  setEditorTab,
  onOpenSmartImport,
}) => {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <nav className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveView('landing')}
              className="flex items-center gap-2.5 focus:outline-none group text-left"
            >
              <img
                src="/assets/prodil-logo.jpg"
                alt="Prodil Studio"
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
                onError={(e) => {
                  // Fallback to SVG if image not found
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-950 flex items-center gap-1.5">
                  Prodil Studio
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">v2.0</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  Craft Your Career & Creative Identity
                </span>
              </div>
            </button>

            {/* In-Editor Navigation Tabs */}
            {activeView === 'studio' && (
              <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setEditorTab('profile')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    editorTab === 'profile'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Master Profile
                </button>
                <button
                  onClick={() => setEditorTab('cv')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    editorTab === 'cv'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  CV Builder (15 Templates)
                </button>
                <button
                  onClick={() => setEditorTab('cover-letter')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    editorTab === 'cover-letter'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cover Letter
                </button>
              </div>
            )}
          </div>

          {/* Right Navigation & User Actions */}
          <div className="flex items-center gap-3">
            {activeView === 'landing' ? (
              <>
                <button
                  onClick={() => {
                    setActiveView('studio');
                    setEditorTab('cv');
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600"
                >
                  <FileText size={14} /> 15 Templates
                </button>
                <button
                  onClick={() => {
                    setActiveView('studio');
                    onOpenSmartImport();
                  }}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600"
                >
                  <Sparkles size={14} className="text-amber-500" /> Smart Import AI
                </button>
              </>
            ) : (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Auto-saved to Cloud</span>
              </div>
            )}

            {/* Auth / Account Buttons */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-800 hidden sm:inline max-w-[120px] truncate">
                    {user.fullName}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                        <ShieldCheck size={12} /> Email Verified &bull; Gemini Quota Protected
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveView('studio');
                        setEditorTab('profile');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <UserIcon size={14} /> Master Profile
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={14} /> Keluar (Sign Out)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Masuk
                </button>
                <button
                  onClick={() => {
                    setActiveView('studio');
                    setEditorTab('cv');
                  }}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
                >
                  Buka Studio
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
