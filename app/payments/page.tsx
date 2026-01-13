'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner';
import { Payment, Tenant, Property } from '@/lib/types';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      const fetchPayments = async () => {
        try {
          const paymentsQuery = query(collection(db, 'payments'), where('userId', '==', user.uid));
          const tenantsQuery = query(collection(db, 'tenants'), where('userId', '==', user.uid));
          const propertiesQuery = query(collection(db, 'properties'), where('userId', '==', user.uid));

          const [paymentsSnapshot, tenantsSnapshot, propertiesSnapshot] = await Promise.all([
            getDocs(paymentsQuery),
            getDocs(tenantsQuery),
            getDocs(propertiesQuery),
          ]);

          const tenantsData = tenantsSnapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = doc.data() as Tenant;
            return acc;
          }, {} as { [key: string]: Tenant });

          const propertiesData = propertiesSnapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = doc.data() as Property;
            return acc;
          }, {} as { [key: string]: Property });

          const paymentsData = paymentsSnapshot.docs.map((paymentDoc) => {
            const data = paymentDoc.data();
            const tenant = tenantsData[data.tenantId];
            const property = propertiesData[data.propertyId];

            return {
              id: paymentDoc.id,
              userId: data.userId || '',
              tenantId: data.tenantId || '',
              propertyId: data.propertyId || '',
              unitId: data.unitId || '',
              amount: data.amount || 0,
              type: data.type || 'rent',
              date: data.date instanceof Timestamp ? data.date : Timestamp.now(),
              tenantName: tenant?.name || 'N/A',
              propertyName: property?.name || 'N/A',
              months: data.months || [],
              receiptNumber: data.receiptNumber,
              unitName: data.unitName,
              balanceAfterPayment: data.balanceAfterPayment
            } as Payment;
          });

          setPayments(paymentsData);
        } catch (error) {
          console.error("Permission Error during fetch:", error);
          toast.error("Could not load payments. Check your permissions.");
        }
      };
      fetchPayments();
    }
  }, [user]);

  const handleDelete = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return;

    try {
      await deleteDoc(doc(db, 'payments', paymentId));
      toast.success('Payment record deleted successfully!');
      setPayments(currentPayments => currentPayments.filter(p => p.id !== paymentId));
    } catch (error) {
      toast.error('Failed to delete payment record. Please try again.');
      console.error("Error deleting payment record: ", error);
    }
  };

  const filteredPayments = payments.filter(payment =>
    (payment.tenantName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (payment.propertyName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toDate = (date: any) => {
    if (date instanceof Date) {
      return date;
    }
    if (date && date.toDate) { // Handle Firestore Timestamp
      return date.toDate();
    }
    return new Date(); // Fallback for unexpected types
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Payments</h1>
          <Link href="/payments/add">
            <Button>Record Payment</Button>
          </Link>
        </div>
        <Input
          placeholder="Search by tenant or property..."
          value={searchTerm}
          onChange={(e: FormEvent<HTMLInputElement>) => setSearchTerm(e.currentTarget.value)}
          className="w-full"
        />
        <div className="flex justify-end">
          <Link href="/payments/reports">
            <Button variant="secondary">
              Generate/View Report
            </Button>
          </Link>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map(payment => (
              <TableRow key={payment.id}>
                <TableCell>{payment.date.toDate ? payment.date.toDate().toLocaleDateString() : new Date(payment.date as any).toLocaleDateString()}</TableCell>
                <TableCell>{payment.tenantName}</TableCell>
                <TableCell>{payment.propertyName}</TableCell>
                <TableCell>UGX {payment.amount.toLocaleString()}</TableCell>
                <TableCell>{payment.type}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/receipts/${payment.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Receipt
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/payments/edit/${payment.id}`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(payment.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
