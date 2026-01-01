'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      if (user) {
        const paymentsQuery = query(collection(db, 'payments'), where('userId', '==', user.uid));
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const paymentsData = await Promise.all(paymentsSnapshot.docs.map(async (paymentDoc) => {
          const payment = { id: paymentDoc.id, ...paymentDoc.data() };
          
          let tenantName = 'N/A';
          if (payment.tenantId) {
            const tenantDocRef = doc(db, 'tenants', payment.tenantId);
            const tenantDocSnap = await getDoc(tenantDocRef);
            tenantName = tenantDocSnap.exists() ? tenantDocSnap.data().name : 'N/A';
          }
          
          let propertyName = 'N/A';
          if (payment.propertyId) {
            const propertyDocRef = doc(db, 'properties', payment.propertyId);
            const propertyDocSnap = await getDoc(propertyDocRef);
            propertyName = propertyDocSnap.exists() ? propertyDocSnap.data().name : 'N/A';
          }

          return { ...payment, tenantName, propertyName };
        }));
        setPayments(paymentsData);
      }
    };

    fetchPayments();
  }, [user]);

  const filteredPayments = payments.filter(payment =>
    payment.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.propertyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payments</CardTitle>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search by tenant or property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Link href="/payments/add">
              <Button>Record Payment</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.date.toDate().toLocaleDateString()}</TableCell>
                    <TableCell>{payment.tenantName}</TableCell>
                    <TableCell>{payment.propertyName}</TableCell>
                    <TableCell>${payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{payment.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
