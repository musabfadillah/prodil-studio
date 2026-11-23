import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StudioEditor } from './components/StudioEditor';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';

export const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<'landing' | 'studio'>('landing');
  const [editorTab, setEditorTab] = useState<'profile' | 'cv' | 'cover-letter'>('cv');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>(undefined);
  const [smartImportOpen, setSmartImportOpen] = useState(false);

  const handleStartEditing = (templateId?: number) => {
    if (templateId) {
      setSelectedTemplateId(templateId);
      try {
        const savedConfig = localStorage.getItem('prodil_cv_config');
        const parsed = savedConfig ? JSON.parse(savedConfig) : {};
        parsed.themeId = templateId;
        localStorage.setItem('prodil_cv_config', JSON.stringify(parsed));
      } catch (e) {
        console.warn(e);
      }
    }
    setEditorTab('cv');
    setActiveView('studio');
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[#F4F7FC] bg-grid-slate text-slate-900 ${activeView === 'studio' ? 'pb-20 lg:pb-0' : ''}`}>
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
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={(id) => setSelectedTemplateId(id)}
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
            initialTemplateId={selectedTemplateId}
            onTemplateChange={(id) => setSelectedTemplateId(id)}
            onBackToLanding={() => setActiveView('landing')}
            smartImportOpen={smartImportOpen}
            setSmartImportOpen={setSmartImportOpen}
          />
        )}
      </main>

      <Footer />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}