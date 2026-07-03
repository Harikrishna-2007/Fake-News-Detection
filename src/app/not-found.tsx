'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

export default function NotFound() {
    const router = useRouter();

    const handleGoHome = () => {
        router?.push('/');
    };

    const handleGoBack = () => {
        if (typeof window !== 'undefined') {
            window.history?.back();
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <h1 className="text-9xl font-bold opacity-20" style={{ color: 'var(--primary)' }}>404</h1>
                    </div>
                </div>

                <h2 className="text-2xl font-medium mb-2" style={{ color: 'var(--foreground)' }}>Page Not Found</h2>
                <p className="mb-8" style={{ color: 'var(--muted-foreground)' }}>
                    The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleGoBack}
                        className="btn-primary px-6 py-3"
                    >
                        <Icon name="ArrowLeftIcon" size={16} />
                        Go Back
                    </button>

                    <button
                        onClick={handleGoHome}
                        className="btn-secondary px-6 py-3"
                    >
                        <Icon name="HomeIcon" size={16} />
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}