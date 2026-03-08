import React, { useState, useEffect } from 'react';
import { Key, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkKey = async () => {
    try {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
      if (selected) {
        onKeySelected();
      }
    } catch (err) {
      console.error("Error checking API key:", err);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleOpenSelector = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Assume success and proceed as per guidelines to avoid race conditions
      onKeySelected();
    } catch (err) {
      console.error("Error opening key selector:", err);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-indigo-100 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center">
        <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-8 shadow-inner">
          <Key size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-3">API Key Required</h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          To use high-quality image generation and advanced marketing AI features, you need to select a paid Gemini API key.
        </p>

        <div className="space-y-4 mb-8 text-left">
          <div className="flex gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <AlertCircle className="text-amber-600 shrink-0" size={20} />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Important Setup</p>
              <p>You must select an API key from a paid Google Cloud project with billing enabled.</p>
            </div>
          </div>

          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-colors group"
          >
            <span className="text-sm font-medium text-slate-700">Billing Documentation</span>
            <ExternalLink size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </a>
        </div>

        <button
          onClick={handleOpenSelector}
          className="w-full py-4 px-6 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
        >
          Select API Key
        </button>
        
        <p className="mt-6 text-xs text-slate-400">
          Your key is stored securely and only used for your requests.
        </p>
      </div>
    </div>
  );
};
