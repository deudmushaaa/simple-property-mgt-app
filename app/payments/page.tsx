'use client'

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import withAuth from '@/components/auth/withAuth';

function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [tenantId, setTenantId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchPayments = async () => {
    const querySnapshot = await getDocs(collection(db, 'payments'));
    const paymentsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const payment = { id: doc.id, ...doc.data() };
        if (payment.tenantId) {
            const tenantDoc = await getDoc(doc(db, 'tenants', payment.tenantId));
            if (tenantDoc.exists()) {
                payment.tenantName = tenantDoc.data().name;
            }
        }
        if (payment.unitId) {
            const unitDoc = await getDoc(doc(db, 'units', payment.unitId));
            if (unitDoc.exists()) {
                payment.unitNumber = unitDoc.data().unitNumber;
            }
        }
        return payment;
    }));
    setPayments(paymentsData);
  };

  const fetchTenants = async () => {
    const querySnapshot = await getDocs(collection(db, 'tenants'));
    const tenantsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTenants(tenantsData);
  };

  const fetchUnits = async () => {
    const querySnapshot = await getDocs(collection(db, 'units'));
    const unitsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUnits(unitsData);
  };

  useEffect(() => {
    fetchPayments();
    fetchTenants();
    fetchUnits();
  }, []);

  const handleAddPayment = async () => {
    if (tenantId && unitId && amount && date) {
      await addDoc(collection(db, 'payments'), {
        tenantId,
        unitId,
        amount,
        date,
      });
      setTenantId('');
      setUnitId('');
      setAmount('');
      setDate('');
      setIsOpen(false);
      fetchPayments();
    }
  };

  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setTenantId(payment.tenantId);
    setUnitId(payment.unitId);
    setAmount(payment.amount);
    setDate(payment.date);
    setEditIsOpen(true);
  };

  const handleUpdate = async () => {
    if (selectedPayment) {
      const paymentRef = doc(db, 'payments', selectedPayment.id);
      await updateDoc(paymentRef, {
        tenantId,
        unitId,
        amount,
        date,
      });
      setSelectedPayment(null);
      setTenantId('');
      setUnitId('');
      setAmount('');
      setDate('');
      setEditIsOpen(false);
      fetchPayments();
    }
  };

  const handleDelete = async (paymentId) => {
    await deleteDoc(doc(db, 'payments', paymentId));
    fetchPayments();
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Payments</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
                setTenantId('');
                setUnitId('');
                setAmount('');
                setDate('');
            }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Payment</DialogTitle>
              <DialogDescription>
                Enter the details of the new payment.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tenant" className="text-right">
                  Tenant
                </Label>
                <Select onValueChange={setTenantId} value={tenantId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map(tenant => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit" className="text-right">
                  Unit
                </Label>
                <Select onValueChange={setUnitId} value={unitId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.unitNumber}
                      </SelectItem>
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
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddPayment}>
                Add Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map(payment => (
              <TableRow key={payment.id}>
                <TableCell>{payment.tenantName}</TableCell>
                <TableCell>{payment.unitNumber}</TableCell>
                <TableCell>{payment.amount}</TableCell>
                <TableCell>{payment.date}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(payment)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(payment.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

        <Dialog open={editIsOpen} onOpenChange={setEditIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Edit Payment</DialogTitle>
                <DialogDescription>
                    Update the details of the payment.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tenant-edit" className="text-right">
                    Tenant
                    </Label>
                    <Select onValueChange={setTenantId} value={tenantId}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a tenant" />
                    </SelectTrigger>
                    <SelectContent>
                        {tenants.map(tenant => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unit-edit" className="text-right">
                    Unit
                    </Label>
                    <Select onValueChange={setUnitId} value={unitId}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                    <SelectContent>
                        {units.map(unit => (
                        <SelectItem key={unit.id} value={unit.id}>
                            {unit.unitNumber}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount-edit" className="text-right">
                    Amount
                    </Label>
                    <Input
                    id="amount-edit"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="col-span-3"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date-edit" className="text-right">
                    Date
                    </Label>
                    <Input
                    id="date-edit"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="col-span-3"
                    />
                </div>
                </div>
                <DialogFooter>
                <Button type="submit" onClick={handleUpdate}>
                    Save Changes
                </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}

export default withAuth(PaymentsPage);
