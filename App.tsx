import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { ImageGenerator } from './components/ImageGenerator';
import { CampaignGenerator } from './components/CampaignGenerator';
import { ApiKeySelector } from './components/ApiKeySelector';
import { AppView } from './types';
import { Menu } from 'lucide-react';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const Dashboard: React.FC<{ onViewChange: (view: AppView) => void }> = ({ onViewChange }) => (
  <div className="max-w-5xl mx-auto">
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">Welcome to MarketerAI</h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto">
        Your all-in-one artificial intelligence suite for modern marketing. 
        Generate campaigns, design visuals, and brainstorm strategies instantly.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <div 
        onClick={() => onViewChange(AppView.CHAT)}
        className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
      >
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">AI Assistant</h3>
        <p className="text-slate-500">Chat with Gemini 3.0 Pro to brainstorm ideas, refine copy, and strategize.</p>
      </div>

      <div 
        onClick={() => onViewChange(AppView.IMAGE_GEN)}
        className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
      >
        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Image Studio</h3>
        <p className="text-slate-500">Generate photorealistic marketing assets using Imagen 4.0.</p>
      </div>

      <div 
        onClick={() => onViewChange(AppView.CAMPAIGN)}
        className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
      >
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Campaign Creator</h3>
        <p className="text-slate-500">Create full email campaigns with subject lines, copy, and visuals in one click.</p>
      </div>
    </div>
  </div>
);

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isKeySelected, setIsKeySelected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      try {
        const selected = await window.aistudio.hasSelectedApiKey();
        setIsKeySelected(selected);
      } catch (err) {
        console.error("Failed to check API key:", err);
        setIsKeySelected(false);
      }
    };
    checkKey();
  }, []);

  if (isKeySelected === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  if (!isKeySelected) {
    return <ApiKeySelector onKeySelected={() => setIsKeySelected(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center">
              <span className="font-bold text-white text-xs">M</span>
            </div>
            <span className="font-bold text-slate-800">MarketerAI</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500">
            <Menu size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {currentView === AppView.DASHBOARD && <Dashboard onViewChange={setCurrentView} />}
          {currentView === AppView.CHAT && <ChatInterface />}
          {currentView === AppView.IMAGE_GEN && <ImageGenerator />}
          {currentView === AppView.CAMPAIGN && <CampaignGenerator />}
        </div>
      </main>
    </div>
  );
}