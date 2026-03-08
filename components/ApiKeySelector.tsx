import React from 'react';

export default function ApiKeySelector({ onKeySelect }: { onKeySelect?: (key: string) => void }) {
  const handleSelectKey = () => {
    // This creates a standard internet pop-up box asking for the key
    const key = prompt("Please paste your Gemini API Key here:");
    
    if (key && key.trim() !== "") {
      // Save the key safely inside the user's browser
      localStorage.setItem('gemini_api_key', key.trim());
      localStorage.setItem('API_KEY', key.trim()); // Backup for older versions
      
      if (onKeySelect) {
        onKeySelect(key.trim());
      } else {
        // Refresh the page to load the app with the new key active
        window.location.reload();
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">API Key Required</h2>
        <p className="text-gray-600 mb-6">
          To use high-quality image generation and advanced marketing AI features, you need to enter a paid Gemini API key.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
          <div className="flex items-center text-yellow-800 font-semibold mb-1">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Important Setup
          </div>
          <p className="text-yellow-700 text-sm">
            You must use an API key from a paid Google Cloud project with billing enabled.
          </p>
        </div>

        <a href="https://cloud.google.com/billing/docs" target="_blank" rel="noreferrer" className="flex items-center justify-between w-full p-3 mb-6 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition">
          <span className="text-sm font-medium">Billing Documentation</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
        </a>

        <button
          onClick={handleSelectKey}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200 mb-4"
        >
          Enter API Key
        </button>

        <p className="text-xs text-gray-400">
          Your key is stored securely in your browser's local storage and only used for your requests.
        </p>
      </div>
    </div>
  );
}