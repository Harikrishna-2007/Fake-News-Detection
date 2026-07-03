import React from 'react';
import AppLayout from '@/components/AppLayout';
import NewsAnalysisContent from './components/NewsAnalysisContent';

export default function NewsAnalysisPage() {
  return (
    <AppLayout activeRoute="/news-analysis">
      <div className="px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 max-w-screen-2xl mx-auto">
        <NewsAnalysisContent />
      </div>
    </AppLayout>
  );
}