'use client';

import React from 'react';
import Link from 'next/link';

const stats = [
  { value: '1,284', label: 'Articles Analyzed', icon: '📊' },
  { value: '87.3%', label: 'Avg Confidence', icon: '🎯' },
  { value: '743', label: 'Fake News Caught', icon: '🚫' },
  { value: '98.1%', label: 'Model Accuracy', icon: '✅' },
];

const recentDetections = [
  { headline: 'WHO confirms new respiratory illness spreading in Southeast Asia', label: 'REAL', confidence: 93, source: 'Reuters', time: '2 min ago' },
  { headline: 'Government secretly plans to microchip citizens through vaccine boosters', label: 'FAKE', confidence: 97, source: 'Unknown Blog', time: '15 min ago' },
  { headline: 'Stock market reaches all-time high amid tech sector recovery', label: 'REAL', confidence: 88, source: 'Bloomberg', time: '1 hr ago' },
  { headline: 'Scientists discover alien microbes on Mars surface, NASA confirms', label: 'FAKE', confidence: 91, source: 'Parody Site', time: '3 hr ago' },
];

const features = [
  {
    title: 'TF-IDF Vectorization',
    desc: 'Converts raw news text into numerical feature vectors, capturing term frequency and inverse document frequency for precise classification.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    title: 'Logistic Regression',
    desc: 'A proven ML algorithm trained on thousands of labeled news articles, delivering binary classification with calibrated probability scores.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    title: 'Linguistic Analysis',
    desc: 'Detects sensationalist language, emotional manipulation, and structural patterns commonly found in misinformation and propaganda.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
        <path d="M11 8v6M8 11h6" />
      </svg>
    ),
  },
  {
    title: 'Confidence Scoring',
    desc: 'Every prediction comes with a percentage confidence score and risk level (LOW / MEDIUM / HIGH / CRITICAL) for transparent decision-making.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', fontFamily: 'var(--font-sans)' }}>
      {/* Navbar */}
      <nav
        className="sticky top-0 z-50 border-b backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(255,255,255,0.92)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <span className="font-bold text-base" style={{ color: 'var(--foreground)' }}>
              FakeNewsDetector
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {['Features', 'How It Works', 'Analytics']?.map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-500 transition-colors hover:text-primary"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-up-login-screen" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              Sign In
            </Link>
            <Link href="/" className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              Dashboard
            </Link>
          </div>
        </div>
      </nav>
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24 px-6">
        {/* Background blobs */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4F46E5, transparent)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #EC4899, transparent)' }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-600 mb-6"
            style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)', border: '1px solid var(--border)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            ML Model Active · 98.1% Accuracy
          </div>

          <h1
            className="text-hero-xl font-800 mb-6 leading-tight"
            style={{ color: 'var(--foreground)' }}
          >
            Detect Fake News with{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #4F46E5, #7C3AED, #EC4899)' }}
            >
              Machine Learning
            </span>
          </h1>

          <p
            className="text-lg leading-relaxed max-w-2xl mx-auto mb-10"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Paste any news article or headline and get an instant AI-powered verdict — REAL or FAKE — backed by TF-IDF vectorization and Logistic Regression trained on 44,000+ labeled articles.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/news-analysis" className="btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Analyze an Article
            </Link>
            <Link href="/" className="btn-secondary" style={{ padding: '12px 28px', fontSize: '15px' }}>
              View Dashboard
            </Link>
          </div>
        </div>
      </section>
      {/* Stats bar */}
      <section className="border-y py-8 px-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats?.map((s) => (
            <div key={s?.label} className="text-center">
              <div className="text-2xl mb-1">{s?.icon}</div>
              <div className="text-2xl font-800 tabular-nums" style={{ color: 'var(--foreground)' }}>{s?.value}</div>
              <div className="text-xs font-500 mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{s?.label}</div>
            </div>
          ))}
        </div>
      </section>
      {/* Live feed + features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          {/* Live detections */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-xl font-700" style={{ color: 'var(--foreground)' }}>Live Detection Feed</h2>
            </div>
            <div className="space-y-3">
              {recentDetections?.map((item, i) => (
                <div
                  key={i}
                  className="card-elevated rounded-xl p-4 flex items-start gap-3"
                  style={{ backgroundColor: 'var(--card)' }}
                >
                  <span
                    className={`mt-0.5 px-2 py-0.5 rounded-md text-xs font-700 flex-shrink-0 ${item?.label === 'REAL' ? 'badge-real' : 'badge-fake'}`}
                  >
                    {item?.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-500 leading-snug" style={{ color: 'var(--foreground)' }}>
                      {item?.headline}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item?.source}</span>
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>·</span>
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item?.confidence}% confidence</span>
                      <span className="text-xs ml-auto" style={{ color: 'var(--muted-foreground)' }}>{item?.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-xl font-700 mb-6" style={{ color: 'var(--foreground)' }}>How It Works</h2>
            <div className="space-y-4">
              {features?.map((f, i) => (
                <div
                  key={i}
                  className="card-elevated rounded-xl p-4 flex items-start gap-4"
                  style={{ backgroundColor: 'var(--card)' }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}
                  >
                    {f?.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-700 mb-1" style={{ color: 'var(--foreground)' }}>{f?.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{f?.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* CTA */}
      <section
        className="py-16 px-6 mx-6 mb-16 rounded-2xl text-center"
        style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 60%, #EC4899 100%)' }}
      >
        <h2 className="text-2xl font-800 text-white mb-3">Ready to fight misinformation?</h2>
        <p className="text-sm text-white/80 mb-8 max-w-md mx-auto">
          Submit any news article and get an instant ML-powered verdict in under 2 seconds.
        </p>
        <Link
          href="/news-analysis"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-700 text-sm transition-all hover:scale-105"
          style={{ backgroundColor: 'white', color: 'var(--primary)' }}
        >
          Start Analyzing Free
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </section>
      {/* Footer */}
      <footer className="border-t py-8 px-6 text-center" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          © 2026 FakeNewsDetector · B.E CSE (AI&ML) · V.S.B Engineering College · Built with Next.js + TF-IDF + Logistic Regression
        </p>
      </footer>
    </div>
  );
}
