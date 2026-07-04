'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const WeeklyTrendChart = dynamic(() => import('./WeeklyTrendChart'), { ssr: false });
const DistributionChart = dynamic(() => import('./DistributionChart'), { ssr: false });

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2">
        <WeeklyTrendChart />
      </div>
      <div className="xl:col-span-1">
        <DistributionChart />
      </div>
    </div>
  );
}