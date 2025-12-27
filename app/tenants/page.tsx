
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
import { useState } from "react";

// Mock data for tenants
const tenants = [
  {
    id: "1",
    name: "John Doe",
    property: "Acme Apartments",
    unit: "Apt 4B",
    leaseStartDate: "2023-01-15",
    rentStatus: "Paid",
  },
  {
    id: "2",
    name: "Jane Smith",
    property: "Sunset Towers",
    unit: "Unit 8",
    leaseStartDate: "2022-11-01",
    rentStatus: "Paid",
  },
  {
    id: "3",
    name: "Bob Johnson",
    property: "The Pearl",
    unit: "Apt 2C",
    leaseStartDate: "2023-03-01",
    rentStatus: "Overdue",
  },
];

export default function TenantsPage() {
  const [isAddTenantDialogOpen, setIsAddTenantDialogOpen] = useState(false);

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
        </DialogContent>
      </Dialog>
    </main>
  );
}
