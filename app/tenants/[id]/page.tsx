'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function TenantDetailPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const [tenant, setTenant] = useState(null);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTenantData = async () => {
      if (user && id) {
        const tenantDocRef = doc(db, 'tenants', id);
        const tenantDocSnap = await getDoc(tenantDocRef);

        if (tenantDocSnap.exists()) {
          setTenant({ id: tenantDocSnap.id, ...tenantDocSnap.data() });
          fetchPayments(tenantDocSnap.id);
        } else {
          // Handle tenant not found
        }
      }
    };

    const fetchPayments = async (tenantId) => {
        const paymentsQuery = query(
            collection(db, 'payments'), 
            where('tenantId', '==', tenantId),
            orderBy('date', 'desc')
        );
        const snapshot = await getDocs(paymentsQuery);
        const paymentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPayments(paymentsData);
        setFilteredPayments(paymentsData);
    };

    fetchTenantData();
  }, [user, id]);

  useEffect(() => {
    const filterPayments = () => {
        const now = new Date();
        let startDate;

        if (filter === '6months') {
            startDate = new Date(now.setMonth(now.getMonth() - 6));
        } else if (filter === '1year') {
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        } else {
            setFilteredPayments(payments);
            return;
        }

        const filtered = payments.filter(payment => payment.date.toDate() >= startDate);
        setFilteredPayments(filtered);
    };

    filterPayments();
  }, [filter, payments]);

  if (!tenant) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{tenant.name}</CardTitle>
          <CardDescription>Tenant Details</CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="my-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold">Contact Information</h3>
              <p><strong>Email:</strong> {tenant.email}</p>
              <p><strong>Phone:</strong> {tenant.phone}</p>
            </div>
            <div>
              <h3 className="font-semibold">Lease Information</h3>
              <p><strong>Property:</strong> {tenant.propertyName}</p>
              <p><strong>Unit:</strong> {tenant.unitName}</p>
              <p><strong>Balance:</strong> ${tenant.balance}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
          <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <div className="flex space-x-2 pt-2">
                  <Button variant={filter === 'all' ? 'solid' : 'outline'} onClick={() => setFilter('all')}>All Time</Button>
                  <Button variant={filter === '6months' ? 'solid' : 'outline'} onClick={() => setFilter('6months')}>Last 6 Months</Button>
                  <Button variant={filter === '1year' ? 'solid' : 'outline'} onClick={() => setFilter('1year')}>Last Year</Button>
              </div>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Receipt</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {filteredPayments.map(payment => (
                          <TableRow key={payment.id}>
                              <TableCell>{payment.date.toDate().toLocaleDateString()}</TableCell>
                              <TableCell>${payment.amount.toLocaleString()}</TableCell>
                              <TableCell>{payment.type}</TableCell>
                              <TableCell>#{payment.receiptNumber}</TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>
    </div>
  );
}
