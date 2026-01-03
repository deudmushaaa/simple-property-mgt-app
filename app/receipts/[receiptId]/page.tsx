'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import withAuth from '@/components/auth/withAuth';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReceiptDocument from '@/components/ReceiptDocument';

function ReceiptPage() {
  const { receiptId } = useParams();
  const { user } = useAuth();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const fetchPaymentDetails = async () => {
      if (!user || !receiptId) return;

      try {
        setLoading(true);
        const paymentDocRef = doc(db, 'payments', receiptId);
        const paymentSnap = await getDoc(paymentDocRef);

        if (paymentSnap.exists()) {
          const paymentData = paymentSnap.data();

          if (paymentData.userId !== user.uid) {
            console.error("Unauthorized access attempt");
            setPayment(null);
            return;
          }

          const tenantDocRef = doc(db, 'tenants', paymentData.tenantId);
          const tenantSnap = await getDoc(tenantDocRef);
          const tenantData = tenantSnap.exists() ? tenantSnap.data() : {};

          const propertyDocRef = tenantData.propertyId ? doc(db, 'properties', tenantData.propertyId) : null;
          const propertySnap = propertyDocRef ? await getDoc(propertyDocRef) : null;
          const propertyData = propertySnap && propertySnap.exists() ? propertySnap.data() : {};

          setPayment({
            id: paymentSnap.id,
            ...paymentData,
            date: paymentData.date.toDate().toLocaleDateString(),
            tenantName: tenantData.name || 'N/A',
            unitName: tenantData.unitName || 'N/A',
            propertyName: propertyData.name || 'N/A',
          });
        } else {
          console.log("No such payment found!");
          setPayment(null);
        }
      } catch (error) {
        console.error("Error fetching payment details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [receiptId, user]);

  if (loading) {
    return <div className="container mx-auto py-10 text-center">Loading receipt...</div>;
  }

  if (!payment) {
    return <div className="container mx-auto py-10 text-center text-red-500">Receipt not found or you do not have permission to view it.</div>;
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
       <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Payment Receipt</h1>
            {isClient && (
              <PDFDownloadLink
                document={<ReceiptDocument payment={payment} />}
                fileName={`receipt-${payment.receiptNumber}.pdf`}
              >
                {({ loading }) => (
                  <Button disabled={loading}>
                    <Download className="mr-2 h-4 w-4" />
                    {loading ? 'Generating PDF...' : 'Download PDF'}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
        </div>
      <div className="p-8 bg-white rounded-lg shadow-lg border border-gray-200">
        <header className="flex justify-between items-center pb-6 border-b-2 border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Karibu Properties</h2>
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
            <p className="text-gray-800">{payment.date}</p>
          </div>
        </section>

        <section className="mt-8">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="p-3 font-semibold text-gray-600">Description</th>
                        <th className="p-3 text-right font-semibold text-gray-600">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-gray-100">
                        <td className="p-3 text-gray-800">Rent Payment for {payment.unitName}</td>
                        <td className="p-3 text-right text-gray-800">${payment.amount.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>
        </section>

        <section className="flex justify-end mt-8">
          <div className="w-1/2">
              <div className="flex justify-between py-2">
                  <span className="font-semibold text-gray-600">Amount Paid</span>
                  <span className="text-gray-800">${payment.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                  <span className="font-semibold text-gray-600">Remaining Balance</span>
                  <span className={(payment.balanceAfterPayment ?? 0) > 0 ? 'text-red-500' : 'text-green-500'}>${(payment.balanceAfterPayment ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-xl border-t-2 border-gray-200 mt-2 pt-2">
                  <span className="text-gray-800">Total Paid</span>
                  <span className="text-indigo-600">${payment.amount.toLocaleString()}</span>
              </div>
          </div>
        </section>

        <footer className="mt-12 text-center text-gray-500">
            <p>Thank you for your payment!</p>
            <p>Generated by Karibu</p>
        </footer>
      </div>
    </div>
  );
}

export default withAuth(ReceiptPage);
