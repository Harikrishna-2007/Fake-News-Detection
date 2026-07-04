'use client';

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import AppLogo from '@/components/ui/AppLogo';

export default function AuthContent() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>
      {/* Left brand panel */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #1E1B4B 0%, #312E81 40%, #4F46E5 80%, #6366F1 100%)',
        }}
      >
        {/* Background decoration */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #EC4899 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, #6366F1 0%, transparent 40%)`,
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <AppLogo size={40} />
          <span className="text-white font-bold text-xl">FakeNewsDetector</span>
        </div>

        {/* Main content */}
        <div className="relative space-y-8">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-600 mb-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#34D399' }} />
              ML Model v2.4.1 — Active
            </div>
            <h1 className="text-4xl xl:text-5xl font-800 text-white leading-tight">
              Detect Fake News
              <br />
              <span style={{ color: '#A5B4FC' }}>with AI Precision</span>
            </h1>
            <p
              className="text-base mt-4 leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              Submit any news article and receive an instant Real or Fake verdict powered by a
              Scikit-learn model trained on 40,000+ verified articles.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '94.7%', label: 'Model Accuracy', icon: '🎯' },
              { value: '40K+', label: 'Training Samples', icon: '📊' },
              { value: '1.8s', label: 'Avg Response Time', icon: '⚡' },
              { value: '1,284', label: 'Analyses Completed', icon: '🔍' },
            ].map((stat) => (
              <div
                key={`stat-${stat.label}`}
                className="rounded-xl p-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
              >
                <div className="text-xl mb-1">{stat.icon}</div>
                <p className="text-xl font-800 text-white tabular-nums">{stat.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Tech stack badge */}
          <div className="flex flex-wrap gap-2">
            {['Python', 'Scikit-learn', 'Flask', 'Spring Boot', 'Next.js', 'MySQL'].map((tech) => (
              <span
                key={`tech-${tech}`}
                className="px-2.5 py-1 rounded-full text-xs font-500"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <p className="relative text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Final Year Project — ML-Powered Fake News Detection System
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto scrollbar-thin">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <AppLogo size={36} />
          <span className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>
            FakeNewsDetector
          </span>
        </div>

        <div className="w-full max-w-md">
          {/* Mode tabs */}
          <div className="flex rounded-xl p-1 mb-8" style={{ backgroundColor: 'var(--muted)' }}>
            {(['login', 'register'] as const).map((tab) => (
              <button
                key={`auth-tab-${tab}`}
                onClick={() => setMode(tab)}
                className="flex-1 py-2.5 rounded-lg text-sm font-600 transition-all duration-200"
                style={{
                  backgroundColor: mode === tab ? 'var(--card)' : 'transparent',
                  color: mode === tab ? 'var(--primary)' : 'var(--muted-foreground)',
                  boxShadow: mode === tab ? 'var(--card-shadow)' : 'none',
                }}
              >
                {tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {mode === 'login' ? (
            <LoginForm onSwitchToRegister={() => setMode('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setMode('login')} />
          )}
        </div>
      </div>
    </div>
  );
}
