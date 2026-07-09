import React from 'react';
import AppLayout from '@/components/AppLayout';
import AnalyticsContent from './components/AnalyticsContent';

export default function AnalyticsPage() {
  return (
    <AppLayout activeRoute="/analytics">
      <div className="px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 max-w-screen-2xl mx-auto space-y-6">
        <AnalyticsContent />
      </div>
    </AppLayout>
  );
}
