import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-muted p-4 rounded-full mb-6">
                <FileQuestion className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">404 - Page Not Found</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Button asChild>
                <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
        </div>
    );
}
