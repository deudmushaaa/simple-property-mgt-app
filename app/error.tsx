'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('App Error:', error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-destructive/10 p-4 rounded-full mb-6">
                <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
                Don&apos;t worry, this doesn&apos;t happen often. We&apos;ve been notified and are looking into it.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()} className="gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    Try again
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Go to Home
                </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
                <pre className="mt-8 p-4 bg-muted rounded text-left text-xs overflow-auto max-w-full">
                    {error.message}
                </pre>
            )}
        </div>
    );
}
