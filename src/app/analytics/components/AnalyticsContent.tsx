'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const monthlyData = [
  { month: 'Jan', real: 42, fake: 58 },
  { month: 'Feb', real: 55, fake: 71 },
  { month: 'Mar', real: 38, fake: 62 },
  { month: 'Apr', real: 67, fake: 83 },
  { month: 'May', real: 74, fake: 91 },
  { month: 'Jun', real: 61, fake: 79 },
  { month: 'Jul', real: 48, fake: 65 },
];

const categoryData = [
  { name: 'Politics', fake: 312, real: 98 },
  { name: 'Health', fake: 187, real: 143 },
  { name: 'Science', fake: 94, real: 112 },
  { name: 'Finance', fake: 76, real: 134 },
  { name: 'Technology', fake: 74, real: 54 },
];

const pieData = [
  { name: 'FAKE', value: 743, color: '#DC2626' },
  { name: 'REAL', value: 541, color: '#059669' },
];

const confidenceData = [
  { range: '50–60%', count: 34 },
  { range: '60–70%', count: 67 },
  { range: '70–80%', count: 142 },
  { range: '80–90%', count: 389 },
  { range: '90–100%', count: 652 },
];

const accuracyTrend = [
  { week: 'W1', accuracy: 94.2, precision: 92.1, recall: 95.8 },
  { week: 'W2', accuracy: 95.8, precision: 93.4, recall: 96.2 },
  { week: 'W3', accuracy: 96.1, precision: 94.7, recall: 96.9 },
  { week: 'W4', accuracy: 97.3, precision: 95.9, recall: 97.4 },
  { week: 'W5', accuracy: 97.8, precision: 96.2, recall: 98.1 },
  { week: 'W6', accuracy: 98.1, precision: 97.0, recall: 98.4 },
];

const modelMetrics = [
  {
    label: 'Accuracy',
    value: '98.1%',
    desc: 'Overall correct predictions',
    color: 'var(--success)',
  },
  {
    label: 'Precision',
    value: '97.0%',
    desc: 'True positives / predicted positives',
    color: 'var(--primary)',
  },
  {
    label: 'Recall',
    value: '98.4%',
    desc: 'True positives / actual positives',
    color: 'var(--accent)',
  },
  {
    label: 'F1 Score',
    value: '0.977',
    desc: 'Harmonic mean of precision & recall',
    color: 'var(--warning)',
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="card-elevated rounded-lg p-3 text-xs"
        style={{ backgroundColor: 'var(--card)' }}
      >
        <p className="font-600 mb-1" style={{ color: 'var(--foreground)' }}>
          {label}
        </p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsContent() {
  const [activeTab, setActiveTab] = useState<'overview' | 'model'>('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-800" style={{ color: 'var(--foreground)' }}>
            Analytics Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Comprehensive statistics on detection performance and trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex rounded-lg overflow-hidden border"
            style={{ borderColor: 'var(--border)' }}
          >
            {(['overview', 'model'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2 text-sm font-600 capitalize transition-colors"
                style={{
                  backgroundColor: activeTab === tab ? 'var(--primary)' : 'var(--card)',
                  color: activeTab === tab ? 'white' : 'var(--muted-foreground)',
                }}
              >
                {tab === 'overview' ? 'Overview' : 'Model Performance'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Analyses',
                value: '1,284',
                sub: 'All time',
                color: 'var(--primary)',
                bg: 'var(--secondary)',
              },
              {
                label: 'Fake Detected',
                value: '743',
                sub: '57.9% of total',
                color: 'var(--danger)',
                bg: 'var(--danger-bg)',
              },
              {
                label: 'Real Verified',
                value: '541',
                sub: '42.1% of total',
                color: 'var(--success)',
                bg: 'var(--success-bg)',
              },
              {
                label: 'This Month',
                value: '127',
                sub: '+18% vs last month',
                color: 'var(--info)',
                bg: 'var(--info-bg)',
              },
            ].map((card) => (
              <div
                key={card.label}
                className="card-elevated rounded-xl p-5"
                style={{ backgroundColor: card.bg, borderColor: 'transparent' }}
              >
                <p
                  className="text-xs font-600 uppercase tracking-wide mb-2"
                  style={{ color: card.color, letterSpacing: '0.06em' }}
                >
                  {card.label}
                </p>
                <p
                  className="text-3xl font-800 tabular-nums"
                  style={{ color: 'var(--foreground)' }}
                >
                  {card.value}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  {card.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Monthly bar + pie */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div
              className="lg:col-span-2 card-elevated rounded-xl p-5"
              style={{ backgroundColor: 'var(--card)' }}
            >
              <h3 className="text-sm font-700 mb-4" style={{ color: 'var(--foreground)' }}>
                Monthly Detection Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="real" name="REAL" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fake" name="FAKE" fill="#DC2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div
              className="card-elevated rounded-xl p-5"
              style={{ backgroundColor: 'var(--card)' }}
            >
              <h3 className="text-sm font-700 mb-4" style={{ color: 'var(--foreground)' }}>
                Overall Distribution
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-xs font-600" style={{ color: 'var(--foreground)' }}>
                      {d.name} ({d.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="card-elevated rounded-xl p-5" style={{ backgroundColor: 'var(--card)' }}>
            <h3 className="text-sm font-700 mb-4" style={{ color: 'var(--foreground)' }}>
              Fake vs Real by Category
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="fake" name="FAKE" fill="#DC2626" radius={[0, 4, 4, 0]} />
                <Bar dataKey="real" name="REAL" fill="#059669" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Confidence distribution */}
          <div className="card-elevated rounded-xl p-5" style={{ backgroundColor: 'var(--card)' }}>
            <h3 className="text-sm font-700 mb-4" style={{ color: 'var(--foreground)' }}>
              Confidence Score Distribution
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  name="Predictions"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {activeTab === 'model' && (
        <>
          {/* Model metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {modelMetrics.map((m) => (
              <div
                key={m.label}
                className="card-elevated rounded-xl p-5"
                style={{ backgroundColor: 'var(--card)' }}
              >
                <p
                  className="text-xs font-600 uppercase tracking-wide mb-2"
                  style={{ color: m.color, letterSpacing: '0.06em' }}
                >
                  {m.label}
                </p>
                <p
                  className="text-3xl font-800 tabular-nums"
                  style={{ color: 'var(--foreground)' }}
                >
                  {m.value}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  {m.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Accuracy trend */}
          <div className="card-elevated rounded-xl p-5" style={{ backgroundColor: 'var(--card)' }}>
            <h3 className="text-sm font-700 mb-4" style={{ color: 'var(--foreground)' }}>
              Model Performance Over Time
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={accuracyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[90, 100]}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  name="Accuracy %"
                  stroke="var(--success)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="precision"
                  name="Precision %"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="recall"
                  name="Recall %"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Confusion matrix */}
          <div className="card-elevated rounded-xl p-5" style={{ backgroundColor: 'var(--card)' }}>
            <h3 className="text-sm font-700 mb-4" style={{ color: 'var(--foreground)' }}>
              Confusion Matrix (Test Set — 8,800 samples)
            </h3>
            <div className="max-w-sm mx-auto">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div />
                <div className="font-700 py-2" style={{ color: 'var(--muted-foreground)' }}>
                  Predicted REAL
                </div>
                <div className="font-700 py-2" style={{ color: 'var(--muted-foreground)' }}>
                  Predicted FAKE
                </div>
                <div
                  className="font-700 py-2 flex items-center justify-end pr-2"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Actual REAL
                </div>
                <div
                  className="rounded-xl p-4 font-800 text-xl"
                  style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}
                >
                  4,312
                </div>
                <div
                  className="rounded-xl p-4 font-800 text-xl"
                  style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}
                >
                  88
                </div>
                <div
                  className="font-700 py-2 flex items-center justify-end pr-2"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Actual FAKE
                </div>
                <div
                  className="rounded-xl p-4 font-800 text-xl"
                  style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}
                >
                  79
                </div>
                <div
                  className="rounded-xl p-4 font-800 text-xl"
                  style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}
                >
                  4,321
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
