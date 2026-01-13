'use client'

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function RedirectToReceipt() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;

  useEffect(() => {
    if (id) {
      router.replace(`/receipts/${id}`);
    } else {
      router.replace('/payments');
    }
  }, [id, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Redirecting to receipt...</p>
    </div>
  );
}
