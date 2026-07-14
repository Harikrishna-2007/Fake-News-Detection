'use client';

import React, { useState } from 'react';

interface Prediction {
  id: string;
  headline: string;
  label: 'REAL' | 'FAKE';
  confidence: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
  category: string;
  date: string;
  wordCount: number;
  processingTime: string;
}

const allPredictions: Prediction[] = [
  {
    id: 'P-001',
    headline: 'WHO confirms new respiratory illness spreading in Southeast Asia',
    label: 'REAL',
    confidence: 93.2,
    risk: 'LOW',
    source: 'Reuters',
    category: 'Health',
    date: 'Jul 3, 2026',
    wordCount: 312,
    processingTime: '0.84s',
  },
  {
    id: 'P-002',
    headline: 'Government secretly plans to microchip citizens through vaccine boosters',
    label: 'FAKE',
    confidence: 97.8,
    risk: 'CRITICAL',
    source: 'Unknown Blog',
    category: 'Politics',
    date: 'Jul 3, 2026',
    wordCount: 487,
    processingTime: '1.12s',
  },
  {
    id: 'P-003',
    headline: 'Stock market reaches all-time high amid tech sector recovery',
    label: 'REAL',
    confidence: 88.4,
    risk: 'LOW',
    source: 'Bloomberg',
    category: 'Finance',
    date: 'Jul 2, 2026',
    wordCount: 256,
    processingTime: '0.71s',
  },
  {
    id: 'P-004',
    headline: 'Scientists discover alien microbes on Mars surface, NASA confirms',
    label: 'FAKE',
    confidence: 91.6,
    risk: 'HIGH',
    source: 'ScienceDaily Parody',
    category: 'Science',
    date: 'Jul 2, 2026',
    wordCount: 398,
    processingTime: '0.93s',
  },
  {
    id: 'P-005',
    headline: 'India launches third lunar mission targeting south pole water deposits',
    label: 'REAL',
    confidence: 89.1,
    risk: 'LOW',
    source: 'ISRO Official',
    category: 'Science',
    date: 'Jul 1, 2026',
    wordCount: 421,
    processingTime: '0.88s',
  },
  {
    id: 'P-006',
    headline: 'Celebrity billionaire announces plan to replace all police with AI robots',
    label: 'FAKE',
    confidence: 86.3,
    risk: 'HIGH',
    source: 'Viral Tweet',
    category: 'Technology',
    date: 'Jul 1, 2026',
    wordCount: 178,
    processingTime: '0.62s',
  },
  {
    id: 'P-007',
    headline: 'Central bank raises interest rates by 0.25% to combat inflation',
    label: 'REAL',
    confidence: 94.7,
    risk: 'LOW',
    source: 'Financial Times',
    category: 'Finance',
    date: 'Jun 30, 2026',
    wordCount: 334,
    processingTime: '0.79s',
  },
  {
    id: 'P-008',
    headline: 'New study proves 5G towers cause memory loss and behavioral changes',
    label: 'FAKE',
    confidence: 95.2,
    risk: 'CRITICAL',
    source: 'Conspiracy Forum',
    category: 'Health',
    date: 'Jun 30, 2026',
    wordCount: 512,
    processingTime: '1.08s',
  },
  {
    id: 'P-009',
    headline: 'Supreme Court upholds digital privacy rights in landmark ruling',
    label: 'REAL',
    confidence: 91.3,
    risk: 'LOW',
    source: 'AP News',
    category: 'Politics',
    date: 'Jun 29, 2026',
    wordCount: 289,
    processingTime: '0.76s',
  },
  {
    id: 'P-010',
    headline: 'Drinking bleach cures COVID-19, says anonymous health expert',
    label: 'FAKE',
    confidence: 99.1,
    risk: 'CRITICAL',
    source: 'Anonymous Post',
    category: 'Health',
    date: 'Jun 29, 2026',
    wordCount: 143,
    processingTime: '0.55s',
  },
  {
    id: 'P-011',
    headline: 'Electric vehicle sales surpass petrol cars for first time in Europe',
    label: 'REAL',
    confidence: 87.6,
    risk: 'LOW',
    source: 'BBC',
    category: 'Technology',
    date: 'Jun 28, 2026',
    wordCount: 367,
    processingTime: '0.82s',
  },
  {
    id: 'P-012',
    headline: 'UN declares secret world government formed at Davos summit',
    label: 'FAKE',
    confidence: 96.4,
    risk: 'CRITICAL',
    source: 'Conspiracy Blog',
    category: 'Politics',
    date: 'Jun 28, 2026',
    wordCount: 623,
    processingTime: '1.24s',
  },
  {
    id: 'P-013',
    headline: 'NASA announces Artemis III crew for 2027 Moon landing mission',
    label: 'REAL',
    confidence: 92.8,
    risk: 'LOW',
    source: 'NASA.gov',
    category: 'Science',
    date: 'Jun 27, 2026',
    wordCount: 445,
    processingTime: '0.91s',
  },
  {
    id: 'P-014',
    headline: 'Eating chocolate daily reverses aging by 20 years, Harvard study finds',
    label: 'FAKE',
    confidence: 94.1,
    risk: 'HIGH',
    source: 'Health Clickbait',
    category: 'Health',
    date: 'Jun 27, 2026',
    wordCount: 234,
    processingTime: '0.68s',
  },
  {
    id: 'P-015',
    headline: 'G20 nations agree on new carbon emission reduction targets for 2030',
    label: 'REAL',
    confidence: 90.5,
    risk: 'LOW',
    source: 'Reuters',
    category: 'Politics',
    date: 'Jun 26, 2026',
    wordCount: 378,
    processingTime: '0.85s',
  },
];

const riskBadge: Record<string, string> = {
  LOW: 'risk-low',
  MEDIUM: 'risk-medium',
  HIGH: 'risk-high',
  CRITICAL: 'risk-critical',
};

export default function PredictionHistoryContent() {
  const [search, setSearch] = useState('');
  const [labelFilter, setLabelFilter] = useState<'ALL' | 'REAL' | 'FAKE'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  const categories = ['ALL', ...Array.from(new Set(allPredictions.map((p) => p.category)))];

  const filtered = allPredictions.filter((p) => {
    const matchSearch =
      p.headline.toLowerCase().includes(search.toLowerCase()) ||
      p.source.toLowerCase().includes(search.toLowerCase());
    const matchLabel = labelFilter === 'ALL' || p.label === labelFilter;
    const matchCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchSearch && matchLabel && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const fakeCount = filtered.filter((p) => p.label === 'FAKE').length;
  const realCount = filtered.filter((p) => p.label === 'REAL').length;
  const avgConf =
    filtered.length > 0
      ? (filtered.reduce((s, p) => s + p.confidence, 0) / filtered.length).toFixed(1)
      : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-800" style={{ color: 'var(--foreground)' }}>
          Prediction History
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Complete log of all news analyses performed by the system
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Total Records',
            value: filtered.length.toString(),
            color: 'var(--primary)',
            bg: 'var(--secondary)',
          },
          {
            label: 'Fake Detected',
            value: fakeCount.toString(),
            color: 'var(--danger)',
            bg: 'var(--danger-bg)',
          },
          {
            label: 'Avg Confidence',
            value: `${avgConf}%`,
            color: 'var(--success)',
            bg: 'var(--success-bg)',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="card-elevated rounded-xl p-4"
            style={{ backgroundColor: s.bg, borderColor: 'transparent' }}
          >
            <p
              className="text-xs font-600 uppercase tracking-wide"
              style={{ color: s.color, letterSpacing: '0.06em' }}
            >
              {s.label}
            </p>
            <p
              className="text-2xl font-800 tabular-nums mt-1"
              style={{ color: 'var(--foreground)' }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card-elevated rounded-xl p-4" style={{ backgroundColor: 'var(--card)' }}>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by headline or source..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field pl-9 h-9 text-sm"
            />
          </div>

          {/* Label filter */}
          <div
            className="flex rounded-lg overflow-hidden border"
            style={{ borderColor: 'var(--border)' }}
          >
            {(['ALL', 'REAL', 'FAKE'] as const).map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLabelFilter(l);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 text-xs font-600 transition-colors"
                style={{
                  backgroundColor: labelFilter === l ? 'var(--primary)' : 'var(--card)',
                  color: labelFilter === l ? 'white' : 'var(--muted-foreground)',
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="input-field h-9 text-sm"
            style={{ width: 'auto', minWidth: '130px' }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div
        className="card-elevated rounded-xl overflow-hidden"
        style={{ backgroundColor: 'var(--card)' }}
      >
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {[
                  'ID',
                  'Headline',
                  'Label',
                  'Confidence',
                  'Risk',
                  'Category',
                  'Source',
                  'Words',
                  'Time',
                  'Date',
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-600 uppercase tracking-wide"
                    style={{
                      color: 'var(--muted-foreground)',
                      letterSpacing: '0.06em',
                      backgroundColor: 'var(--muted)',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center">
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      No predictions match your filters.
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((pred, i) => (
                  <tr
                    key={pred.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--muted)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        'var(--secondary)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        i % 2 === 0 ? 'transparent' : 'var(--muted)';
                    }}
                  >
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-600 tabular-nums"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {pred.id}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[260px]">
                      <p
                        className="text-sm font-500 truncate"
                        style={{ color: 'var(--foreground)' }}
                        title={pred.headline}
                      >
                        {pred.headline}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-700 ${pred.label === 'REAL' ? 'badge-real' : 'badge-fake'}`}
                      >
                        {pred.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-16 h-1.5 rounded-full overflow-hidden"
                          style={{ backgroundColor: 'var(--muted)' }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pred.confidence}%`,
                              backgroundColor:
                                pred.label === 'REAL' ? 'var(--success)' : 'var(--danger)',
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-600 tabular-nums"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {pred.confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-600 ${riskBadge[pred.risk]}`}
                      >
                        {pred.risk}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {pred.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {pred.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs tabular-nums"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {pred.wordCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs tabular-nums"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {pred.processingTime}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {pred.date}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-5 py-3 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Showing {(currentPage - 1) * perPage + 1}–
              {Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-600 transition-colors disabled:opacity-40"
                style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 rounded-lg text-xs font-600 transition-colors"
                  style={{
                    backgroundColor: currentPage === page ? 'var(--primary)' : 'var(--secondary)',
                    color: currentPage === page ? 'white' : 'var(--primary)',
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-600 transition-colors disabled:opacity-40"
                style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
