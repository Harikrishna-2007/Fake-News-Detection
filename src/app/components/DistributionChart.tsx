'use client';

import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

const distributionData = [
  { name: 'Real', value: 42.1, fill: 'var(--success)' },
  { name: 'Fake', value: 57.9, fill: 'var(--danger)' },
];

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number } }>;
}) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="card-elevated rounded-xl px-3 py-2" style={{ backgroundColor: 'var(--card)' }}>
      <p className="text-xs font-600" style={{ color: 'var(--foreground)' }}>
        {d.name}: {d.value}%
      </p>
    </div>
  );
};

export default function DistributionChart() {
  return (
    <div className="card-elevated rounded-xl p-5 h-full" style={{ backgroundColor: 'var(--card)' }}>
      <div className="mb-4">
        <h3 className="text-base font-600" style={{ color: 'var(--foreground)' }}>
          Detection Distribution
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          REAL vs FAKE across all analyses
        </p>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="40%"
          outerRadius="90%"
          data={distributionData}
          startAngle={180}
          endAngle={-180}
        >
          <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'var(--muted)' }} />
          <Tooltip content={<CustomTooltip />} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-2">
        {distributionData.map((d) => (
          <div key={`dist-${d.name}`} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.fill }} />
            <div>
              <p className="text-xs font-500" style={{ color: 'var(--muted-foreground)' }}>
                {d.name}
              </p>
              <p className="text-sm font-700 tabular-nums" style={{ color: 'var(--foreground)' }}>
                {d.value}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
