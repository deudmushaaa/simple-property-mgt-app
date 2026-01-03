'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      const fetchPayments = async () => {
        const paymentsQuery = query(collection(db, 'payments'), where('userId', '==', user.uid));
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const paymentsData = await Promise.all(paymentsSnapshot.docs.map(async (paymentDoc) => {
          const payment = { id: paymentDoc.id, ...paymentDoc.data() };
          
          let tenantName = 'N/A';
          let propertyId = payment.propertyId;
          if (payment.tenantId) {
            const tenantDocRef = doc(db, 'tenants', payment.tenantId);
            const tenantDocSnap = await getDoc(tenantDocRef);
            if (tenantDocSnap.exists()) {
              const tenantData = tenantDocSnap.data();
              tenantName = tenantData.name;
              if (!propertyId) propertyId = tenantData.propertyId;
            }
          }
          
          let propertyName = 'N/A';
          if (propertyId) {
            const propertyDocRef = doc(db, 'properties', propertyId);
            const propertyDocSnap = await getDoc(propertyDocRef);
            propertyName = propertyDocSnap.exists() ? propertyDocSnap.data().name : 'N/A';
          }

          return { ...payment, tenantName, propertyName };
        }));
        setPayments(paymentsData);
      };
      fetchPayments();
    }
  }, [user]);

  const handleDelete = async (paymentId) => {
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
                  <TableHead className="text-right">Actions</TableHead>
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
        </CardContent>
      </Card>
    </div>
  );
}
