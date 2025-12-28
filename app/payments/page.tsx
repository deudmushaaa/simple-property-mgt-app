'use client'

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { v4 as uuidv4 } from 'uuid';
import withAuth from '@/components/auth/withAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [amount, setAmount] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const fetchPayments = async () => {
    const querySnapshot = await getDocs(collection(db, 'payments'));
    const paymentsData = await Promise.all(querySnapshot.docs.map(async (paymentDoc) => {
        const paymentData = paymentDoc.data();
        const tenantDoc = await getDoc(doc(db, 'tenants', paymentData.tenantId));
        const unitDoc = await getDoc(doc(db, 'units', paymentData.unitId));
        return {
            id: paymentDoc.id,
            ...paymentData,
            tenantName: tenantDoc.exists() ? tenantDoc.data().name : 'N/A',
            unitName: unitDoc.exists() ? unitDoc.data().name : 'N/A',
            date: paymentData.date.toDate().toLocaleDateString(),
        };
    }));
    setPayments(paymentsData);
  };

  useEffect(() => {
    (async () => {
        const tenantsSnapshot = await getDocs(collection(db, 'tenants'));
        const tenantsData = tenantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTenants(tenantsData);

        const unitsSnapshot = await getDocs(collection(db, 'units'));
        const unitsData = unitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUnits(unitsData);
        
        fetchPayments();
    })();
  }, []);

  const handleAddPayment = async () => {
    if (selectedTenant && selectedUnit && amount) {
      await addDoc(collection(db, 'payments'), {
        tenantId: selectedTenant,
        unitId: selectedUnit,
        amount: Number(amount),
        date: serverTimestamp(),
        receiptNumber: uuidv4(),
      });
      setSelectedTenant('');
      setSelectedUnit('');
      setAmount('');
      setIsOpen(false);
      fetchPayments();
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Payments</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
              <DialogDescription>
                Select the tenant and unit to record a payment.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tenant" className="text-right">
                  Tenant
                </Label>
                <Select onValueChange={setSelectedTenant}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a tenant" />
                    </SelectTrigger>
                    <SelectContent>
                        {tenants.map(tenant => (
                            <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit" className="text-right">
                  Unit
                </Label>
                <Select onValueChange={setSelectedUnit}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                    <SelectContent>
                        {units.map(unit => (
                            <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="col-span-3"
                  type="number"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddPayment}>
                Record Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Receipt #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payments.map(payment => (
                        <TableRow key={payment.id}>
                            <TableCell>{payment.receiptNumber}</TableCell>
                            <TableCell>{payment.date}</TableCell>
                            <TableCell>{payment.tenantName}</TableCell>
                            <TableCell>{payment.unitName}</TableCell>
                            <TableCell>${payment.amount.toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    </div>
  );
}

export default withAuth(PaymentsPage);
