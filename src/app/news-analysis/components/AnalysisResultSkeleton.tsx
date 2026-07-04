import React from 'react';

export default function AnalysisResultSkeleton() {
  return (
    <div className="space-y-4">
      {/* Main card skeleton */}
      <div
        className="card-elevated rounded-xl overflow-hidden"
        style={{ backgroundColor: 'var(--card)' }}
      >
        <div className="px-5 py-4 flex items-center gap-3" style={{ background: 'var(--muted)' }}>
          <div className="skeleton-pulse w-10 h-10 rounded-full" />
          <div className="space-y-2">
            <div className="skeleton-pulse h-3 w-24 rounded" />
            <div className="skeleton-pulse h-6 w-36 rounded" />
          </div>
        </div>
        <div className="px-5 py-4 flex flex-col sm:flex-row items-center gap-6">
          <div className="skeleton-pulse w-[140px] h-[140px] rounded-full" />
          <div className="flex-1 space-y-4 w-full">
            <div className="space-y-2">
              <div className="skeleton-pulse h-3 w-20 rounded" />
              <div className="skeleton-pulse h-2.5 w-full rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3]?.map((n) => (
                <div key={`sk-meta-${n}`} className="skeleton-pulse h-14 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Summary skeleton */}
      <div
        className="card-elevated rounded-xl p-5 space-y-2"
        style={{ backgroundColor: 'var(--card)' }}
      >
        <div className="skeleton-pulse h-4 w-32 rounded" />
        <div className="skeleton-pulse h-3 w-full rounded" />
        <div className="skeleton-pulse h-3 w-5/6 rounded" />
        <div className="skeleton-pulse h-3 w-4/6 rounded" />
      </div>
      {/* Signals skeleton */}
      <div
        className="card-elevated rounded-xl p-5 space-y-3"
        style={{ backgroundColor: 'var(--card)' }}
      >
        <div className="skeleton-pulse h-4 w-40 rounded" />
        {[1, 2, 3]?.map((n) => (
          <div key={`sk-sig-${n}`} className="skeleton-pulse h-10 rounded-lg" />
        ))}
      </div>
      {/* Actions skeleton */}
      <div className="flex gap-3">
        <div className="skeleton-pulse h-11 flex-1 rounded-lg" />
        <div className="skeleton-pulse h-11 w-24 rounded-lg" />
      </div>
    </div>
  );
}
