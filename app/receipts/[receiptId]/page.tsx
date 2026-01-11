'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReceiptDocument from '@/components/ReceiptDocument';
import { toast } from 'sonner';
import { Payment } from '@/lib/types';

// Helper to safely format dates
const formatDate = (date: any) => {
  if (!date) return 'N/A';
  if (date.toDate) return date.toDate().toLocaleDateString();
  return new Date(date).toLocaleDateString();
}

// Helper to safely format currency
const formatCurrency = (amount: any) => {
  if (typeof amount !== 'number') return '0.00';
  return amount.toLocaleString();
}

export default function ReceiptPage() {
  const params = useParams();
  const receiptId = Array.isArray(params.receiptId) ? params.receiptId[0] : params.receiptId;
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
          const tenantSnap = await getDoc(doc(db, 'tenants', paymentData.tenantId));
          const propertySnap = await getDoc(doc(db, 'properties', paymentData.propertyId));

          // Mentor's fix for type safety implemented here
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
    return <div className="container mx-auto py-10 text-center">Loading receipt...</div>;
  }

  if (!payment) {
    return <div className="container mx-auto py-10 text-center text-red-500">Receipt not found or you lack permission.</div>;
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payment Receipt</h1>
        {/* Mentor's fix for conditional rendering implemented here */}
        {payment ? (
          <PDFDownloadLink
            document={<ReceiptDocument payment={payment} />}
            fileName={`Receipt-${payment.receiptNumber || '000'}.pdf`}
          >
            {({ loading }) => (
              <Button disabled={loading} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                {loading ? 'Generating PDF...' : 'Download Receipt'}
              </Button>
            )}
          </PDFDownloadLink>
        ) : (
          <Button disabled variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Loading Data...
          </Button>
        )}
      </div>
      <div className="p-8 bg-white rounded-lg shadow-lg border border-gray-200">
        <header className="flex justify-between items-center pb-6 border-b-2 border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Property Payment Receipt</h2>
            <p className="text-gray-500">Simplified Property Management</p>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-semibold text-gray-700">Receipt</h3>
            <p className="text-gray-500">#{payment.receiptNumber}</p>
          </div>
        </header>

        <section className="flex justify-between mt-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-600">Billed To</h4>
            <p className="text-gray-800 font-medium">{payment.tenantName}</p>
            <p className="text-gray-500">{payment.propertyName} - {payment.unitName}</p>
          </div>
          <div className="text-right">
            <h4 className="text-lg font-semibold text-gray-600">Payment Date</h4>
            <p className="text-gray-800">{formatDate(payment.date)}</p>
          </div>
        </section>

        <section className="mt-8">
          <div className="border rounded-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 font-semibold text-gray-700">Description</th>
                  <th className="p-4 text-right font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="p-4 text-gray-800">{payment.type} Payment</td>
                  <td className="p-4 text-right text-gray-800">UGX {formatCurrency(payment.amount)}</td>
                </tr>
                {payment.months && payment.months.length > 0 && (
                  <tr className="bg-gray-50">
                    <td className="p-4 text-gray-600 font-medium">For Months</td>
                    <td className="p-4 text-right text-gray-600">{payment.months.join(', ')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex justify-end mt-8">
          <div className="w-full max-w-sm">
            <div className="flex justify-between py-2">
              <span className="font-semibold text-gray-600">Amount Paid</span>
              <span className="text-gray-800">UGX {formatCurrency(payment.amount)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-semibold text-gray-600">Remaining Balance</span>
              <span className={(payment.balanceAfterPayment ?? 0) > 0 ? 'text-red-500' : 'text-green-500'}>
                UGX {formatCurrency(payment.balanceAfterPayment ?? 0)}
              </span>
            </div>
            <div className="flex justify-between py-3 font-bold text-xl border-t-2 border-gray-200 mt-2">
              <span className="text-gray-800">Total Paid</span>
              <span className="text-indigo-600">UGX {formatCurrency(payment.amount)}</span>
            </div>
          </div>
        </section>

        <footer className="mt-12 pt-6 border-t text-center text-gray-500">
          <p>Thank you for your business!</p>
          <p>Generated by Senra Technologies</p>
        </footer>
      </div>
    </div>
  );
}
