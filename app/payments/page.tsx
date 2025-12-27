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
import { useState } from "react";

// Mock data for payments
const payments = [
  {
    id: "1",
    tenant: "John Doe",
    property: "Acme Apartments",
    amount: "1,200,000 UGX",
    date: "2023-05-15",
  },
  {
    id: "2",
    tenant: "Jane Smith",
    property: "Sunset Towers",
    amount: "1,500,000 UGX",
    date: "2023-05-12",
  },
  {
    id: "3",
    tenant: "Bob Johnson",
    property: "The Pearl",
    amount: "950,000 UGX",
    date: "2023-05-10",
  },
];

export default function PaymentsPage() {
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);

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
        onOpenChange={setIsAddPaymentDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
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
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a tenant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john-doe">John Doe</SelectItem>
                  <SelectItem value="jane-smith">Jane Smith</SelectItem>
                  <SelectItem value="bob-johnson">Bob Johnson</SelectItem>
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
        </DialogContent>
      </Dialog>
    </main>
  );
}
