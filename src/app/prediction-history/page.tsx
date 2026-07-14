import React from 'react';
import AppLayout from '@/components/AppLayout';
import PredictionHistoryContent from './components/PredictionHistoryContent';

export default function PredictionHistoryPage() {
  return (
    <AppLayout activeRoute="/prediction-history">
      <div className="px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 max-w-screen-2xl mx-auto space-y-6">
        <PredictionHistoryContent />
      </div>
    </AppLayout>
  );
}
