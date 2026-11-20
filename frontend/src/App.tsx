import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StudioEditor } from './components/StudioEditor';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';

export const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<'landing' | 'studio'>('landing');
  const [editorTab, setEditorTab] = useState<'profile' | 'cv' | 'cover-letter'>('cv');
  const [smartImportOpen, setSmartImportOpen] = useState(false);

  const handleStartEditing = (templateId?: number) => {
    setActiveView('studio');
    setEditorTab('cv');
    if (templateId) {
      try {
        const savedConfig = localStorage.getItem('prodil_cv_config');
        const parsed = savedConfig ? JSON.parse(savedConfig) : {};
        parsed.themeId = templateId;
        localStorage.setItem('prodil_cv_config', JSON.stringify(parsed));
      } catch (e) {
        console.warn(e);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        editorTab={editorTab}
        setEditorTab={setEditorTab}
        onOpenSmartImport={() => {
          setActiveView('studio');
          setSmartImportOpen(true);
        }}
      />

      <main className="flex-1">
        {activeView === 'landing' ? (
          <LandingPage
            onStartEditing={handleStartEditing}
            onOpenSmartImport={() => {
              setActiveView('studio');
              setSmartImportOpen(true);
            }}
          />
        ) : (
          <StudioEditor
            editorTab={editorTab}
            setEditorTab={setEditorTab}
            onBackToLanding={() => setActiveView('landing')}
            smartImportOpen={smartImportOpen}
            setSmartImportOpen={setSmartImportOpen}
          />
        )}
      </main>

      {activeView === 'landing' && <Footer />}

      {/* Global Auth Dialog */}
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
