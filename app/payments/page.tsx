"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Payment {
  id: string;
  tenant: string;
  property: string;
  amount: string;
  date: string;
}

interface Tenant {
  id: string;
  name: string;
}

export default function PaymentsPage() {
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    const unsubscribePayments = onSnapshot(collection(db, "payments"), (snapshot) => {
      const newPayments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Payment[];
      setPayments(newPayments);
    });

    const unsubscribeTenants = onSnapshot(collection(db, "tenants"), (snapshot) => {
      const newTenants = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Tenant[];
      setTenants(newTenants);
    });

    return () => {
      unsubscribePayments();
      unsubscribeTenants();
    };
  }, []);

  const handleAddPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const tenant = form.elements.namedItem("tenant") as HTMLSelectElement;
    const amount = form.elements.namedItem("amount") as HTMLInputElement;
    const date = form.elements.namedItem("date") as HTMLInputElement;

    const selectedTenant = tenants.find((t) => t.id === tenant.value);

    await addDoc(collection(db, "payments"), {
      tenant: selectedTenant?.name,
      property: "Acme Apartments", // This will need to be dynamic
      amount: amount.value,
      date: date.value,
    });

    setIsAddPaymentDialogOpen(false);
  };

  return (
    <main className="flex-1 bg-gray-100 dark:bg-gray-800 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Payments</CardTitle>
            <CardDescription>
              A log of all tenant payments.
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddPaymentDialogOpen(true)}>
            Add Payment
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.tenant}</TableCell>
                  <TableCell>{payment.property}</TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell className="text-right">{payment.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={isAddPaymentDialogOpen}
        onOpenChange={setIsAddPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleAddPayment}>
            <DialogHeader>
              <DialogTitle>Add New Payment</DialogTitle>
              <DialogDescription>
                Fill in the details below to log a new payment.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tenant" className="text-right">
                  Tenant
                </Label>
                <Select name="tenant">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount (UGX)
                </Label>
                <Input id="amount" type="number" placeholder="e.g. 1200000" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input id="date" type="date" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Add Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
