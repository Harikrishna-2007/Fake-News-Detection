import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardMetrics from './components/DashboardMetrics';
import DashboardCharts from './components/DashboardCharts';
import RecentPredictionsTable from './components/RecentPredictionsTable';
import DashboardHeader from './components/DashboardHeader';

export default function DashboardPage() {
  return (
    <AppLayout activeRoute="/dashboard">
      <div className="px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 max-w-screen-2xl mx-auto space-y-6">
        <DashboardHeader />
        <DashboardMetrics />
        <DashboardCharts />
        <RecentPredictionsTable />
      </div>
    </AppLayout>
  );
}
