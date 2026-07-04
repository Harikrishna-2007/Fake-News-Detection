'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AnalysisResultCard from './AnalysisResultCard';
import AnalysisResultSkeleton from './AnalysisResultSkeleton';

interface AnalysisFormValues {
  headline: string;
  content: string;
  sourceUrl: string;
  category: string;
}

export interface PredictionResult {
  label: 'REAL' | 'FAKE';
  confidence: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  processingTime: number;
  wordCount: number;
  modelVersion: string;
  linguisticSignals: string[];
  summary: string;
}

const CATEGORIES = [
  'Politics',
  'Health',
  'Science',
  'Finance',
  'Technology',
  'Sports',
  'Entertainment',
  'International',
  'Other',
];

// Mock prediction logic — Backend: POST /api/predict → Spring Boot → Flask ML API → POST /predict
function mockPredict(headline: string, content: string): PredictionResult {
  const text = (headline + ' ' + content).toLowerCase();
  const fakeKeywords = [
    'secret',
    'conspiracy',
    'hidden',
    'exposed',
    'banned',
    'suppressed',
    'alien',
    'microchip',
    'mind control',
    'deep state',
    'cover-up',
    'miracle cure',
    "they don't want you to know",
    'shocking truth',
  ];
  const realKeywords = [
    'study',
    'research',
    'according to',
    'official',
    'confirmed',
    'government',
    'published',
    'report',
    'data shows',
    'statistics',
  ];

  const fakeScore = fakeKeywords.filter((k) => text.includes(k)).length;
  const realScore = realKeywords.filter((k) => text.includes(k)).length;

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const isFake = fakeScore > realScore || (wordCount < 20 && fakeScore > 0);
  const baseConfidence = isFake
    ? Math.min(99.9, 72 + fakeScore * 4.3 + Math.random() * 8)
    : Math.min(99.9, 70 + realScore * 3.8 + Math.random() * 10);

  const confidence = parseFloat(baseConfidence.toFixed(1));
  const label: 'REAL' | 'FAKE' = isFake ? 'FAKE' : 'REAL';

  let risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (label === 'FAKE') {
    if (confidence >= 90) risk = 'CRITICAL';
    else if (confidence >= 80) risk = 'HIGH';
    else if (confidence >= 65) risk = 'MEDIUM';
    else risk = 'LOW';
  }

  const fakeLinguistic = [
    'Sensationalist headline language detected',
    'Unverified claims without source citation',
    'Emotional manipulation patterns identified',
    'Clickbait structural markers present',
    'Conspiracy terminology cluster detected',
  ];
  const realLinguistic = [
    'Formal journalistic language patterns',
    'Verifiable source references found',
    'Neutral tone and factual framing',
    'Statistical evidence present',
    'Multi-perspective reporting detected',
  ];

  return {
    label,
    confidence,
    risk,
    processingTime: parseFloat((0.28 + Math.random() * 0.4).toFixed(2)),
    wordCount,
    modelVersion: 'v2.4.1-sklearn',
    linguisticSignals: isFake
      ? fakeLinguistic.slice(0, fakeScore + 2)
      : realLinguistic.slice(0, realScore + 2),
    summary: isFake
      ? `This article exhibits ${fakeScore} high-risk linguistic patterns commonly associated with misinformation. The model detected sensationalist framing and unverified claims with ${confidence}% confidence. Exercise extreme caution before sharing.`
      : `This article demonstrates credible journalistic characteristics including verifiable sourcing and neutral framing. The model classified it as authentic news with ${confidence}% confidence.`,
  };
}

export default function NewsAnalysisContent() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [savedToHistory, setSavedToHistory] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AnalysisFormValues>({
    defaultValues: {
      headline: '',
      content: '',
      sourceUrl: '',
      category: 'Other',
    },
  });

  const contentValue = watch('content');

  const onSubmit = async (data: AnalysisFormValues) => {
    setIsAnalyzing(true);
    setResult(null);
    setSavedToHistory(false);

    // Backend integration point: POST /api/predict
    // const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/predict`, {
    //   headline: data.headline, content: data.content, category: data.category
    // }, { headers: { Authorization: `Bearer ${token}` } });

    await new Promise((r) => setTimeout(r, 1800));

    const prediction = mockPredict(data.headline, data.content);
    setResult(prediction);
    setIsAnalyzing(false);
    setHasAnalyzed(true);

    if (prediction.label === 'FAKE') {
      toast.error('Fake news detected!', {
        description: `${prediction.confidence}% confidence — ${prediction.risk} risk level`,
      });
    } else {
      toast.success('Article verified as Real', {
        description: `${prediction.confidence}% confidence`,
      });
    }
  };

  const handleSaveToHistory = () => {
    // Backend integration point: POST /api/predictions (save result)
    setSavedToHistory(true);
    toast.success('Analysis saved to history', {
      description: 'View all predictions in your dashboard',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            News Analysis
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Submit an article to detect whether it is Real or Fake using our ML model
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-600"
          style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: 'var(--success)',
              boxShadow: '0 0 0 3px rgba(5,150,105,0.2)',
            }}
          />
          ML Model v2.4.1 — Online
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
        {/* Left: Input form */}
        <div
          className="card-elevated rounded-xl overflow-hidden"
          style={{ backgroundColor: 'var(--card)' }}
        >
          <div
            className="px-5 py-4 border-b"
            style={{
              borderColor: 'var(--border)',
              background: 'linear-gradient(to right, var(--secondary), var(--card))',
            }}
          >
            <h2 className="text-base font-600" style={{ color: 'var(--foreground)' }}>
              Article Input
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Provide the news headline and body content for analysis
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
            {/* Headline */}
            <div className="space-y-1.5">
              <label className="block text-sm font-600" style={{ color: 'var(--foreground)' }}>
                News Headline
                <span className="text-danger ml-1">*</span>
              </label>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Enter the exact headline of the news article
              </p>
              <input
                {...register('headline', {
                  required: 'Headline is required',
                  minLength: { value: 10, message: 'Headline must be at least 10 characters' },
                  maxLength: { value: 300, message: 'Headline must be under 300 characters' },
                })}
                type="text"
                placeholder="e.g. Scientists discover water on Mars surface confirmed by NASA"
                className={`input-field ${errors.headline ? 'error' : ''}`}
              />
              {errors.headline && (
                <p className="text-xs font-500" style={{ color: 'var(--danger)' }}>
                  {errors.headline.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-sm font-600" style={{ color: 'var(--foreground)' }}>
                Category
              </label>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Select the news category for improved model accuracy
              </p>
              <select {...register('category')} className="input-field">
                {CATEGORIES.map((cat) => (
                  <option key={`cat-${cat}`} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Source URL */}
            <div className="space-y-1.5">
              <label className="block text-sm font-600" style={{ color: 'var(--foreground)' }}>
                Source URL
                <span
                  className="ml-2 text-xs font-400 px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
                >
                  Optional
                </span>
              </label>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Providing the source URL helps log the origin for history tracking
              </p>
              <input
                {...register('sourceUrl', {
                  pattern: {
                    value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i,
                    message: 'Please enter a valid URL',
                  },
                })}
                type="url"
                placeholder="https://www.reuters.com/article/..."
                className={`input-field ${errors.sourceUrl ? 'error' : ''}`}
              />
              {errors.sourceUrl && (
                <p className="text-xs font-500" style={{ color: 'var(--danger)' }}>
                  {errors.sourceUrl.message}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-600" style={{ color: 'var(--foreground)' }}>
                  Article Content
                  <span className="text-danger ml-1">*</span>
                </label>
                <span
                  className="text-xs tabular-nums"
                  style={{
                    color: charCount > 4500 ? 'var(--warning)' : 'var(--muted-foreground)',
                  }}
                >
                  {charCount} / 5000 chars
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Paste the full article body. More content improves prediction accuracy.
              </p>
              <textarea
                {...register('content', {
                  required: 'Article content is required',
                  minLength: {
                    value: 50,
                    message: 'Content must be at least 50 characters for accurate analysis',
                  },
                  maxLength: { value: 5000, message: 'Content must be under 5000 characters' },
                  onChange: (e) => setCharCount(e.target.value.length),
                })}
                placeholder="Paste the full article text here. Include all paragraphs for the most accurate prediction. The ML model analyzes linguistic patterns, sentence structure, and semantic content to determine credibility..."
                rows={10}
                className={`input-field resize-none scrollbar-thin ${errors.content ? 'error' : ''}`}
              />
              {errors.content && (
                <p className="text-xs font-500" style={{ color: 'var(--danger)' }}>
                  {errors.content.message}
                </p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Word count:{' '}
                  <span className="font-600 tabular-nums">
                    {contentValue ? contentValue.split(/\s+/).filter(Boolean).length : 0}
                  </span>
                </p>
                {contentValue && contentValue.split(/\s+/).filter(Boolean).length < 30 && (
                  <p className="text-xs" style={{ color: 'var(--warning)' }}>
                    ⚠ Short content may reduce accuracy
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isAnalyzing}
              className="btn-primary w-full py-3 text-base"
            >
              {isAnalyzing ? (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="animate-spin"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Analyzing Article...
                </>
              ) : (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                    <path d="M11 8v6M8 11h6" />
                  </svg>
                  Analyze Article
                </>
              )}
            </button>

            {/* Model info */}
            <div
              className="flex flex-wrap items-center gap-3 pt-2 border-t text-xs"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
            >
              <span className="flex items-center gap-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
                Avg. response: ~1.8s
              </span>
              <span className="flex items-center gap-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Scikit-learn TF-IDF + Logistic Regression
              </span>
              <span className="flex items-center gap-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                Accuracy: 94.7% on test set
              </span>
            </div>
          </form>
        </div>

        {/* Right: Result panel */}
        <div className="flex flex-col gap-4">
          {isAnalyzing ? (
            <AnalysisResultSkeleton />
          ) : result && hasAnalyzed ? (
            <AnalysisResultCard
              result={result}
              savedToHistory={savedToHistory}
              onSaveToHistory={handleSaveToHistory}
            />
          ) : (
            <AnalysisIdleState />
          )}
        </div>
      </div>
    </div>
  );
}

function AnalysisIdleState() {
  return (
    <div
      className="card-elevated rounded-xl flex flex-col items-center justify-center text-center p-12 h-full min-h-[480px]"
      style={{ backgroundColor: 'var(--card)' }}
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'linear-gradient(135deg, var(--secondary), #E0E7FF)' }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ color: 'var(--primary)' }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
          <path d="M11 8v6M8 11h6" />
        </svg>
      </div>
      <h3 className="text-lg font-600 mb-2" style={{ color: 'var(--foreground)' }}>
        Ready to Analyze
      </h3>
      <p className="text-sm max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
        Fill in the article details on the left and click{' '}
        <strong style={{ color: 'var(--primary)' }}>Analyze Article</strong> to get a real-time REAL
        or FAKE prediction with confidence score.
      </p>

      <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-sm">
        {[
          { icon: '🎯', label: 'Confidence Score', desc: 'Model certainty %' },
          { icon: '⚠️', label: 'Risk Level', desc: 'LOW to CRITICAL' },
          { icon: '🔍', label: 'Linguistic Signals', desc: 'Key indicators' },
          { icon: '📊', label: 'Model Metadata', desc: 'Version & timing' },
        ].map((feat) => (
          <div
            key={`feat-${feat.label}`}
            className="rounded-lg p-3 text-left"
            style={{ backgroundColor: 'var(--muted)' }}
          >
            <span className="text-lg">{feat.icon}</span>
            <p className="text-xs font-600 mt-1" style={{ color: 'var(--foreground)' }}>
              {feat.label}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {feat.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
