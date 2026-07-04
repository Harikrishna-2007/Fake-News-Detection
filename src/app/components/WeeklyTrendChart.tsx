'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const weeklyData = [
  { day: 'Jun 27', real: 4, fake: 7 },
  { day: 'Jun 28', real: 7, fake: 11 },
  { day: 'Jun 29', real: 3, fake: 9 },
  { day: 'Jun 30', real: 8, fake: 6 },
  { day: 'Jul 1', real: 5, fake: 14 },
  { day: 'Jul 2', real: 9, fake: 8 },
  { day: 'Jul 3', real: 4, fake: 5 },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="card-elevated rounded-xl px-4 py-3 shadow-modal"
      style={{ backgroundColor: 'var(--card)', minWidth: '140px' }}
    >
      <p className="text-xs font-600 mb-2" style={{ color: 'var(--muted-foreground)' }}>
        {label}
      </p>
      {payload.map((entry) => (
        <div key={`tt-${entry.name}`} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs font-500" style={{ color: 'var(--foreground)' }}>
              {entry.name === 'real' ? 'Real' : 'Fake'}
            </span>
          </div>
          <span className="text-xs font-700 tabular-nums" style={{ color: 'var(--foreground)' }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function WeeklyTrendChart() {
  return (
    <div className="card-elevated rounded-xl p-5 h-full" style={{ backgroundColor: 'var(--card)' }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-600" style={{ color: 'var(--foreground)' }}>
            Weekly Analysis Trend
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Real vs Fake detections — last 7 days
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: 'var(--success)' }}
            />
            <span className="text-xs font-500" style={{ color: 'var(--muted-foreground)' }}>
              Real
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: 'var(--danger)' }}
            />
            <span className="text-xs font-500" style={{ color: 'var(--muted-foreground)' }}>
              Fake
            </span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradReal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--success)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--success)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradFake" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--danger)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="real"
            stroke="var(--success)"
            strokeWidth={2}
            fill="url(#gradReal)"
            dot={{ r: 3, fill: 'var(--success)', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: 'var(--success)' }}
          />
          <Area
            type="monotone"
            dataKey="fake"
            stroke="var(--danger)"
            strokeWidth={2}
            fill="url(#gradFake)"
            dot={{ r: 3, fill: 'var(--danger)', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: 'var(--danger)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
