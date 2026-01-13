'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, Timestamp, DocumentData } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Eye } from 'lucide-react';

// Interfaces for type safety
interface Tenant extends DocumentData {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyName: string;
  unitName: string;
  balance: number;
}

interface Payment extends DocumentData {
  id: string;
  date: Timestamp;
  amount: number;
  type: string;
  months: string[];
}

export default function TenantDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTenantData = async () => {
      if (user && id) {
        const tenantDocRef = doc(db, 'tenants', id);
        const tenantDocSnap = await getDoc(tenantDocRef);

        if (tenantDocSnap.exists() && tenantDocSnap.data().userId === user.uid) {
          setTenant({ id: tenantDocSnap.id, ...tenantDocSnap.data() } as Tenant);
          fetchPayments(tenantDocSnap.id);
        } else {
          toast.error("Tenant not found or you don't have access.");
          router.push('/tenants');
        }
      }
    };

    const fetchPayments = async (tenantId: string) => {
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('tenantId', '==', tenantId),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(paymentsQuery);
      const paymentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
      setPayments(paymentsData);
      setFilteredPayments(paymentsData);
    };

    fetchTenantData();
  }, [user, id, router]);

  useEffect(() => {
    const filterPayments = () => {
      if (filter === 'all') {
        setFilteredPayments(payments);
        return;
      }

      const now = new Date();
      let startDate;

      if (filter === '6months') {
        startDate = new Date(now.setMonth(now.getMonth() - 6));
      } else if (filter === '1year') {
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      }

      if (startDate) {
        const filtered = payments.filter(payment => payment.date.toDate() >= startDate);
        setFilteredPayments(filtered);
      }
    };

    filterPayments();
  }, [filter, payments]);

  if (!tenant) {
    return <div className="container mx-auto py-10 text-center">Loading...</div>;
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
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <div className="flex space-x-2 pt-2">
            <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All Time</Button>
            <Button variant={filter === '6months' ? 'default' : 'outline'} onClick={() => setFilter('6months')}>Last 6 Months</Button>
            <Button variant={filter === '1year' ? 'default' : 'outline'} onClick={() => setFilter('1year')}>Last Year</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Months</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.date.toDate().toLocaleDateString()}</TableCell>
                  <TableCell>UGX {payment.amount.toLocaleString()}</TableCell>
                  <TableCell>{payment.months?.join(', ') || 'N/A'}</TableCell>
                  <TableCell>{payment.type}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/payments/${payment.id}`} passHref>
                      <Button variant="outline" size="icon" asChild>
                        <a><Eye className="h-4 w-4" /></a>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
