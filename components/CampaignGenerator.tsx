import React, { useState } from 'react';
import { Sparkles, Mail, ImageIcon, Copy, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateCampaignContent, generateMarketingImage } from '../services/geminiService';
import { CampaignResult } from '../types';
import ReactMarkdown from 'react-markdown';

export const CampaignGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<'idle' | 'generating_text' | 'generating_image' | 'complete' | 'error'>('idle');
  const [result, setResult] = useState<CampaignResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setStatus('generating_text');
    setResult(null);
    setErrorMsg('');

    try {
      // Step 1: Generate Text Content
      const textData = await generateCampaignContent(topic);
      
      // Intermediate state update to show text progress
      setResult({ ...textData });
      setStatus('generating_image');

      // Step 2: Generate Image based on the prompt from Step 1
      const imageUrl = await generateMarketingImage(textData.imagePrompt, '16:9');
      
      setResult({ ...textData, imageUrl });
      setStatus('complete');

    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "";
      if (errorMessage.includes("PERMISSION_DENIED") || errorMessage.includes("403")) {
        setErrorMsg("API Permission Denied. Please ensure you have selected a paid API key with billing enabled in the setup screen.");
      } else {
        setErrorMsg("Something went wrong while generating the campaign. Please try again.");
      }
      setStatus('error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Campaign Creator</h2>
        <p className="text-slate-500 mt-2">One-click email marketing campaigns with copy and visuals</p>
      </div>

      {/* Input Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 mb-2">What are you promoting?</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., A summer sale for premium sunglasses with 50% off"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={status !== 'idle' && status !== 'complete' && status !== 'error'}
            className={`
              mt-7 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 whitespace-nowrap transition-all
              ${status.startsWith('generating') 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'}
            `}
          >
            {status.startsWith('generating') ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Sparkles size={20} />
            )}
            <span>Generate Campaign</span>
          </button>
        </div>
        
        {/* Status Indicators */}
        {(status !== 'idle') && (
           <div className="mt-4 flex items-center gap-6 text-sm">
             <div className={`flex items-center gap-2 ${status === 'generating_text' ? 'text-indigo-600 font-medium' : status === 'error' ? 'text-slate-400' : 'text-emerald-600'}`}>
               {status === 'generating_text' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
               Drafting Copy
             </div>
             <div className={`w-8 h-[1px] bg-slate-200`} />
             <div className={`flex items-center gap-2 ${status === 'generating_image' ? 'text-indigo-600 font-medium' : status === 'complete' ? 'text-emerald-600' : 'text-slate-400'}`}>
                {status === 'generating_image' ? <Loader2 size={14} className="animate-spin" /> : status === 'complete' ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
               Designing Visuals
             </div>
           </div>
        )}
        
        {status === 'error' && (
          <div className="mt-4 flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Email Preview */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail size={18} />
                <span className="font-medium">Email Preview</span>
              </div>
              <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                <Copy size={12} /> Copy HTML
              </button>
            </div>
            
            <div className="p-8">
              {/* Subject Line */}
              <div className="mb-6 pb-6 border-b border-slate-100">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Subject Line</label>
                <h3 className="text-xl font-bold text-slate-800">{result.subject}</h3>
              </div>

              {/* Image Header in Email */}
              {result.imageUrl ? (
                <div className="mb-6 rounded-xl overflow-hidden shadow-sm">
                  <img src={result.imageUrl} alt="Campaign Hero" className="w-full h-auto object-cover" />
                </div>
              ) : (
                <div className="mb-6 h-48 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
                   <div className="flex flex-col items-center gap-2">
                     <Loader2 className="animate-spin opacity-50" />
                     <span className="text-sm">Generating header image...</span>
                   </div>
                </div>
              )}

              {/* Body Copy */}
              <div className="prose prose-slate prose-p:text-slate-600 prose-headings:text-slate-800 max-w-none">
                <ReactMarkdown>{result.body}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Metadata / Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <ImageIcon size={18} className="text-indigo-500" />
                Generated Image Prompt
              </h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 italic">
                "{result.imagePrompt}"
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Gemini 3.0 Pro generated this prompt specifically for Imagen 4.0 to match your email context.
              </p>
            </div>

            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
               <h3 className="font-semibold text-indigo-900 mb-2">MarketerAI Tip</h3>
               <p className="text-sm text-indigo-700">
                 Review the generated content and adjust the tone if necessary. You can copy the image prompt to the "Image Studio" tab to generate different variations!
               </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};