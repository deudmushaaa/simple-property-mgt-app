
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

// Mock data for properties
const properties = [
  {
    id: "1",
    name: "Acme Apartments",
    location: "Kampala",
    units: 10,
    rent: "1,200,000 UGX",
  },
  {
    id: "2",
    name: "Sunset Towers",
    location: "Entebbe",
    units: 8,
    rent: "1,500,000 UGX",
  },
  {
    id: "3",
    name: "The Pearl",
    location: "Jinja",
    units: 15,
    rent: "950,000 UGX",
  },
];

export default function PropertiesPage() {
  const [isAddPropertyDialogOpen, setIsAddPropertyDialogOpen] = useState(false);

  return (
    <main className="flex-1 bg-gray-100 dark:bg-gray-800 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Properties</CardTitle>
            <CardDescription>
              A list of all your managed properties.
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddPropertyDialogOpen(true)}>
            Add Property
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Units</TableHead>
                <TableHead className="text-right">Monthly Rent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">{property.name}</TableCell>
                  <TableCell>{property.location}</TableCell>
                  <TableCell>{property.units}</TableCell>
                  <TableCell className="text-right">{property.rent}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={isAddPropertyDialogOpen}
        onOpenChange={setIsAddPropertyDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new property.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" placeholder="e.g. Acme Apartments" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input id="location" placeholder="e.g. Kampala" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="units" className="text-right">
                Units
              </Label>
              <Input id="units" type="number" placeholder="e.g. 10" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rent" className="text-right">
                Rent (UGX)
              </Label>
              <Input id="rent" type="number" placeholder="e.g. 1200000" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add Property</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
