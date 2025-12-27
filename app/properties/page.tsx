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
import { collection, addDoc, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Property {
  id: string;
  name: string;
  location: string;
  units: number;
  rent: string;
}

export default function PropertiesPage() {
  const [isAddPropertyDialogOpen, setIsAddPropertyDialogOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "properties"), (snapshot) => {
      const newProperties = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Property[];
      setProperties(newProperties);
    });

    return () => unsubscribe();
  }, []);

  const handleAddProperty = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.elements.namedItem("name") as HTMLInputElement;
    const location = form.elements.namedItem("location") as HTMLInputElement;
    const units = form.elements.namedItem("units") as HTMLInputElement;
    const rent = form.elements.namedItem("rent") as HTMLInputElement;

    await addDoc(collection(db, "properties"), {
      name: name.value,
      location: location.value,
      units: Number(units.value),
      rent: rent.value,
    });

    setIsAddPropertyDialogOpen(false);
  };

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
          <form onSubmit={handleAddProperty}>
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
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
