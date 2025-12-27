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
import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Tenant {
  id: string;
  name: string;
  property: string;
  unit: string;
  leaseStartDate: string;
  rentStatus: string;
}

export default function TenantsPage() {
  const [isAddTenantDialogOpen, setIsAddTenantDialogOpen] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tenants"), (snapshot) => {
      const newTenants = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Tenant[];
      setTenants(newTenants);
    });

    return () => unsubscribe();
  }, []);

  const handleAddTenant = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.elements.namedItem("name") as HTMLInputElement;
    const property = form.elements.namedItem("property") as HTMLInputElement;
    const unit = form.elements.namedItem("unit") as HTMLInputElement;
    const leaseStart = form.elements.namedItem("lease-start") as HTMLInputElement;

    await addDoc(collection(db, "tenants"), {
      name: name.value,
      property: property.value,
      unit: unit.value,
      leaseStartDate: leaseStart.value,
      rentStatus: "Paid", // Default to "Paid" for now
    });

    setIsAddTenantDialogOpen(false);
  };

  return (
    <main className="flex-1 bg-gray-100 dark:bg-gray-800 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tenants</CardTitle>
            <CardDescription>
              A list of all your tenants.
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddTenantDialogOpen(true)}>
            Add Tenant
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Lease Start Date</TableHead>
                <TableHead>Rent Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell>{tenant.property}</TableCell>
                  <TableCell>{tenant.unit}</TableCell>
                  <TableCell>{tenant.leaseStartDate}</TableCell>
                  <TableCell>{tenant.rentStatus}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={isAddTenantDialogOpen}
        onOpenChange={setIsAddTenantDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleAddTenant}>
            <DialogHeader>
              <DialogTitle>Add New Tenant</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new tenant.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" placeholder="e.g. John Doe" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="property" className="text-right">
                  Property
                </Label>
                <Input id="property" placeholder="e.g. Acme Apartments" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit" className="text-right">
                  Unit
                </Label>
                <Input id="unit" placeholder="e.g. Apt 4B" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lease-start" className="text-right">
                  Lease Start Date
                </Label>
                <Input id="lease-start" type="date" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Add Tenant</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
