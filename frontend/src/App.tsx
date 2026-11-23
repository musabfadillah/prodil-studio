import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StudioEditor } from './components/StudioEditor';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';

export const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading, openAuthModal } = useAuth();

  const [activeView, setActiveView] = useState<'landing' | 'studio'>('landing');
  const [editorTab, setEditorTab] = useState<'profile' | 'cv' | 'cover-letter'>('cv');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>(undefined);
  const [pendingStudioRequest, setPendingStudioRequest] = useState<{ templateId?: number } | null>(null);

  const requireAccount = (onAuthenticated: () => void, templateId?: number) => {
    if (isAuthenticated && user) {
      onAuthenticated();
      return;
    }
    setPendingStudioRequest({ templateId });
    setActiveView('landing');
    openAuthModal('login');
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated && activeView === 'studio') {
      setActiveView('landing');
      openAuthModal('login');
    }
  }, [isAuthenticated, isLoading, activeView, openAuthModal]);

  useEffect(() => {
    if (isAuthenticated && pendingStudioRequest) {
      const { templateId } = pendingStudioRequest;
      setPendingStudioRequest(null);
      applyTemplateAndOpenStudio(templateId);
    }
  }, [isAuthenticated, pendingStudioRequest]);

  const applyTemplateAndOpenStudio = (templateId?: number) => {
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

  const handleStartEditing = (templateId?: number) => {
    requireAccount(() => applyTemplateAndOpenStudio(templateId), templateId);
  };

  const handleSelectView = (view: 'landing' | 'studio') => {
    if (view === 'studio') {
      requireAccount(() => setActiveView('studio'), selectedTemplateId);
      return;
    }
    setActiveView('landing');
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#F4F7FC] bg-grid-slate text-slate-900 ${
        activeView === 'studio' && isAuthenticated ? 'pb-20 lg:pb-0' : ''
      }`}
    >
      <Navbar
        activeView={activeView === 'studio' && !isAuthenticated ? 'landing' : activeView}
        setActiveView={handleSelectView}
        editorTab={editorTab}
        setEditorTab={setEditorTab}
      />

      <main className="flex-1">
        {activeView === 'landing' || !isAuthenticated || !user ? (
          <LandingPage
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={(id) => setSelectedTemplateId(id)}
            onStartEditing={handleStartEditing}
          />
        ) : (
          <StudioEditor
            editorTab={editorTab}
            setEditorTab={setEditorTab}
            initialTemplateId={selectedTemplateId}
            onTemplateChange={(id) => setSelectedTemplateId(id)}
            onBackToLanding={() => setActiveView('landing')}
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