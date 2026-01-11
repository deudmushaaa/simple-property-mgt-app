'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/app/AuthProvider';
import { Payment, Tenant, Property } from '@/lib/types';
import ReceiptDocument from '@/components/ReceiptDocument';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReceiptPage() {
  const { user } = useAuth();
  const params = useParams() as any;
  const { id } = params;
  const [payment, setPayment] = useState<Payment | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceiptData = async () => {
      if (user && id) {
        try {
          const paymentDocRef = doc(db, 'payments', id as string);
          const paymentDocSnap = await getDoc(paymentDocRef);

          if (paymentDocSnap.exists()) {
            const paymentData = { id: paymentDocSnap.id, ...paymentDocSnap.data() } as Payment;

            if (paymentData.userId !== user.uid) {
              setError('You do not have permission to view this receipt.');
              setLoading(false);
              return;
            }

            // Fetch tenant and property data
            const tenantDocRef = doc(db, 'tenants', paymentData.tenantId);
            const propertyDocRef = doc(db, 'properties', paymentData.propertyId);

            const [tenantDocSnap, propertyDocSnap] = await Promise.all([
              getDoc(tenantDocRef),
              getDoc(propertyDocRef),
            ]);

            if (!tenantDocSnap.exists()) {
              setError('Tenant associated with this payment not found.');
              setLoading(false);
              return;
            }
            if (!propertyDocSnap.exists()) {
              setError('Property associated with this payment not found.');
              setLoading(false);
              return;
            }

            const tenantData = { id: tenantDocSnap.id, ...tenantDocSnap.data() } as Tenant;
            const propertyData = { id: propertyDocSnap.id, ...propertyDocSnap.data() } as Property;

            setPayment(paymentData);
            setTenant(tenantData);
            setProperty(propertyData);

          } else {
            setError('Receipt not found.');
          }
        } catch (err) {
          console.error("Error fetching receipt data: ", err);
          setError('Failed to fetch receipt data.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchReceiptData();
  }, [user, id]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading receipt...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  if (!payment || !tenant || !property) {
    return <div className="flex justify-center items-center h-screen">Could not display the receipt. Required data is missing.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 border-b">
          <CardTitle className="text-lg font-semibold">Receipt #{payment.id.substring(0, 8)}</CardTitle>
          <PDFDownloadLink
            document={<ReceiptDocument payment={payment} tenant={tenant} property={property} />}
            fileName={`receipt-${payment.id.substring(0, 8)}.pdf`}
          >
            {({ loading }) =>
              <Button variant="outline" disabled={loading}>
                {loading ? 'Generating PDF...' : 'Download PDF'}
              </Button>
            }
          </PDFDownloadLink>
        </CardHeader>
        <CardContent className="p-0">
          <div style={{ height: 'calc(100vh - 200px)' }}>
            <PDFViewer style={{ width: '100%', height: '100%' }} showToolbar={false}>
              <ReceiptDocument payment={payment} tenant={tenant} property={property} />
            </PDFViewer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
