import React, { useState } from 'react';
import { Wand2, Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { generateMarketingImage } from '../services/geminiService';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3'>('1:1');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageBase64 = await generateMarketingImage(prompt, aspectRatio);
      setGeneratedImage(imageBase64);
    } catch (err: any) {
      console.error("Generation error:", err);
      const errorMessage = err.message || "";
      if (errorMessage.includes("PERMISSION_DENIED") || errorMessage.includes("403")) {
        setError("Your API key doesn't have permission to use Imagen 4.0. Please ensure you've selected a paid API key with billing enabled.");
      } else if (errorMessage.includes("Requested entity was not found")) {
        setError("API key configuration error. Please try re-selecting your API key.");
      } else {
        setError("Failed to generate image. Please try again or refine your prompt.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `imagen-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Image Studio</h2>
        <p className="text-slate-500 mt-2">Create stunning visuals for your campaigns using Imagen 4.0</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Image Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A futuristic office with neon lighting, 4k render, highly detailed..."
                className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {['1:1', '16:9', '4:3'].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio as any)}
                    className={`
                      py-2 px-3 rounded-lg text-sm font-medium transition-all
                      ${aspectRatio === ratio 
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300'}
                    `}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className={`
                w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all
                ${isLoading || !prompt.trim()
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'}
              `}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
              <span>{isLoading ? 'Generating...' : 'Generate Image'}</span>
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <span className="font-medium text-slate-700">Preview</span>
              {generatedImage && (
                <button 
                  onClick={downloadImage}
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <Download size={16} /> Download
                </button>
              )}
            </div>
            
            <div className="flex-1 flex items-center justify-center bg-slate-50/50 p-6">
              {isLoading ? (
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-500 animate-pulse">Creating masterpiece...</p>
                </div>
              ) : generatedImage ? (
                <img 
                  src={generatedImage} 
                  alt={prompt} 
                  className="max-w-full max-h-[600px] rounded-lg shadow-lg object-contain"
                />
              ) : error ? (
                <div className="text-center text-red-500 bg-red-50 px-6 py-4 rounded-xl border border-red-100">
                  <p>{error}</p>
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  <ImageIcon size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Enter a prompt to generate an image</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};