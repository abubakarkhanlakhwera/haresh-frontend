'use client';

import { useState } from 'react';

interface AnalysisResult {
  analysis: string;
  conditions: string[];
  recommendations: string;
}

// Get API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_URL}/api/analyze-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError('Failed to analyze the image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl shadow-2xl border border-zinc-200/50 dark:border-zinc-700/50 p-8">
      {/* Enhanced Header */}
      <div className="mb-8 text-center">
        <div className="inline-block p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
          <span className="text-4xl">📋</span>
        </div>
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Medical Report Analysis
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Upload your medical report for instant AI-powered analysis
        </p>
      </div>

      {/* Upload Area */}
      {!previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-3 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
              : 'border-zinc-300 dark:border-zinc-600 hover:border-blue-400 dark:hover:border-blue-500'
          }`}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full"></div>
            <div className="relative mb-6 text-6xl">📄</div>
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
            {isDragging ? 'Drop your file here' : 'Upload Medical Report'}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Drag and drop your file here, or click to browse
          </p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-600 dark:text-zinc-400">
              JPG
            </span>
            <span className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-600 dark:text-zinc-400">
              PNG
            </span>
            <span className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-600 dark:text-zinc-400">
              PDF
            </span>
          </div>
          <label className="inline-block">
            <input
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
            <span className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 cursor-pointer transition-all font-semibold shadow-lg hover:shadow-xl inline-block transform hover:scale-105">
              Choose File
            </span>
          </label>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Preview */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 shadow-xl">
            <img
              src={previewUrl}
              alt="Medical report preview"
              className="w-full h-auto max-h-[500px] object-contain bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900"
            />
            <div className="absolute top-4 right-4">
              <button
                onClick={reset}
                className="p-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-zinc-800 transition-all shadow-lg"
              >
                <span className="text-xl">❌</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={analyzeImage}
              disabled={isAnalyzing}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:hover:shadow-lg transform hover:scale-105 disabled:hover:scale-100"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>Analyzing...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🔍</span>
                  <span>Analyze Report</span>
                </span>
              )}
            </button>
            <button
              onClick={reset}
              disabled={isAnalyzing}
              className="px-8 py-4 border-2 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-50 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              Reset
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-5 animate-fade-in">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">Error</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6 mt-8 animate-fade-in-up">
              {/* Disclaimer */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">⚠️</span>
                  <div>
                    <h4 className="font-bold text-yellow-900 dark:text-yellow-100 mb-2 text-lg">Important Medical Disclaimer</h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
                      This is an AI analysis for informational purposes only. It is <strong>NOT a substitute</strong> for 
                      professional medical advice, diagnosis, or treatment. Please consult with a qualified healthcare 
                      provider for proper medical evaluation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Analysis */}
              <div className="bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📊</span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                    Analysis Results
                  </h3>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {result.analysis}
                </p>
              </div>

              {/* Conditions */}
              {result.conditions.length > 0 && (
                <div className="bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <span className="text-xl">🔬</span>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                      Identified Conditions
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {result.conditions.map((condition, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl"
                      >
                        <span className="text-blue-600 dark:text-blue-400 text-lg mt-0.5">●</span>
                        <span className="text-zinc-700 dark:text-zinc-300 flex-1">{condition}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-xl">💡</span>
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    Recommendations
                  </h3>
                </div>
                <p className="text-blue-800 dark:text-blue-200 leading-relaxed whitespace-pre-wrap">
                  {result.recommendations}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
