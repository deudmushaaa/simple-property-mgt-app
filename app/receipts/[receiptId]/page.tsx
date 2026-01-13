'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Payment } from '@/lib/types';
import dynamic from 'next/dynamic';

// Dynamically import the PDF component with SSR disabled
const ReceiptClient = dynamic(
  () => import('@/components/ReceiptClient'),
  {
    ssr: false,
    loading: () => (
      <Button disabled variant="outline" className="gap-2">
        <Download className="h-4 w-4" />
        Initializing...
      </Button>
    ),
  }
);

// Helper to safely format dates
const formatDate = (date: any) => {
  if (!date) return 'N/A';
  if (date.toDate) return date.toDate().toLocaleDateString();
  return new Date(date).toLocaleDateString();
}

// Helper to safely format currency
const formatCurrency = (amount: any) => {
  if (typeof amount !== 'number') return '0';
  return amount.toLocaleString();
}

export default function ReceiptPage() {
  const params = useParams();
  const receiptId = params?.receiptId ? (Array.isArray(params.receiptId) ? params.receiptId[0] : params.receiptId) : null;
  const { user } = useAuth();
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!user || !receiptId) {
        setLoading(false);
        return;
      }

      try {
        const paymentDocRef = doc(db, 'payments', receiptId);
        const paymentSnap = await getDoc(paymentDocRef);

        if (paymentSnap.exists()) {
          const paymentData = paymentSnap.data();

          if (paymentData.userId !== user.uid) {
            toast.error("Unauthorized access");
            router.push('/dashboard');
            return;
          }

          // Fetch related data
          const [tenantSnap, propertySnap] = await Promise.all([
            getDoc(doc(db, 'tenants', paymentData.tenantId)),
            getDoc(doc(db, 'properties', paymentData.propertyId))
          ]);

          setPayment({
            id: paymentSnap.id,
            ...paymentData,
            date: paymentData.date as Timestamp,
            tenantName: tenantSnap.exists() ? tenantSnap.data().name : 'N/A',
            unitName: tenantSnap.exists() ? tenantSnap.data().unitName : 'N/A',
            propertyName: propertySnap.exists() ? propertySnap.data().name : 'N/A',
            months: Array.isArray(paymentData.months) ? paymentData.months : [],
          } as Payment);

        } else {
          toast.error("Payment not found!");
          setPayment(null);
        }
      } catch (error) {
        console.error("Error fetching payment details:", error);
        toast.error("Failed to fetch payment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [receiptId, user, router]);

  if (loading) {
    return (
      <div className="container mx-auto py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading receipt details...</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="container mx-auto py-20 text-center">
        <p className="text-red-500 text-lg font-semibold mb-4">Receipt not found or you lack permission.</p>
        <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payment Receipt</h1>
        <ReceiptClient payment={payment} />
      </div>

      <div className="p-4 sm:p-8 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-100 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">Property Payment Receipt</h2>
            <p className="text-gray-500 font-medium tracking-tight">Senra Technologies Management</p>
          </div>
          <div className="text-left sm:text-right bg-primary/5 p-3 rounded-lg border border-primary/10">
            <h3 className="text-xs uppercase tracking-widest font-bold text-primary/70">Receipt Number</h3>
            <p className="text-lg font-mono font-bold text-gray-900">#{payment.receiptNumber || 'N/A'}</p>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
          <div className="space-y-1">
            <h4 className="text-sm uppercase tracking-wider font-bold text-gray-400">Billed To</h4>
            <p className="text-xl font-bold text-gray-900">{payment.tenantName}</p>
            <p className="text-gray-600 font-medium">{payment.propertyName}</p>
            <p className="text-gray-500">Unit: {payment.unitName}</p>
          </div>
          <div className="text-left sm:text-right space-y-1">
            <h4 className="text-sm uppercase tracking-wider font-bold text-gray-400">Payment Date</h4>
            <p className="text-xl font-bold text-gray-900">{formatDate(payment.date)}</p>
            <p className="text-gray-500 capitalize">Method: {payment.type}</p>
          </div>
        </section>

        <section className="mt-10">
          <div className="border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="p-4 font-bold text-gray-700 border-b">Description</th>
                  <th className="p-4 text-right font-bold text-gray-700 border-b">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 text-gray-800 font-medium">{payment.type} Payment</td>
                  <td className="p-4 text-right text-gray-900 font-bold">UGX {formatCurrency(payment.amount)}</td>
                </tr>
                {payment.months && payment.months.length > 0 && (
                  <tr className="bg-gray-50/30">
                    <td className="p-4 text-gray-500 text-sm">Allocated for Months</td>
                    <td className="p-4 text-right text-gray-600 font-semibold">{payment.months.join(', ')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex justify-end mt-8">
          <div className="w-full max-w-sm space-y-3">
            <div className="flex justify-between items-center text-gray-600">
              <span className="font-medium">Total Billed</span>
              <span className="font-bold">UGX {formatCurrency(payment.amount)}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-t-2 border-primary/20 bg-primary/5 px-4 rounded-lg">
              <span className="text-primary font-bold text-lg">Total Paid</span>
              <span className="text-primary font-black text-2xl tracking-tight">UGX {formatCurrency(payment.amount)}</span>
            </div>
            <div className="px-4 text-right">
              <p className="text-[10px] text-gray-400 font-medium italic">All values are in Ugandan Shillings (UGX)</p>
            </div>
          </div>
        </section>

        <footer className="mt-12 pt-8 border-t border-gray-100 flex flex-col items-center gap-2">
          <div className="h-1 w-12 bg-gray-200 rounded-full mb-2"></div>
          <p className="text-gray-900 font-bold text-sm">Thank you for your timely payment!</p>
          <p className="text-gray-400 text-xs font-medium">This is an electronically generated receipt.</p>
        </footer>
      </div>
    </div>
  );
}
