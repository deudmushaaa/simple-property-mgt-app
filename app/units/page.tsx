'use client'

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
import withAuth from '@/components/auth/withAuth';

function UnitsPage() {
  const [units, setUnits] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [rent, setRent] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const fetchUnits = async () => {
    const querySnapshot = await getDocs(collection(db, 'units'));
    const unitsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUnits(unitsData);
  };

  useEffect(() => {
    (async () => {
        await fetchUnits();
    })();
  }, []);

  const handleAddUnit = async () => {
    if (name && address && rent) {
      await addDoc(collection(db, 'units'), {
        name,
        address,
        rent: Number(rent),
      });
      setName('');
      setAddress('');
      setRent('');
      setIsOpen(false);
      fetchUnits();
    }
  };

  const handleEdit = (unit) => {
    setSelectedUnit(unit);
    setName(unit.name);
    setAddress(unit.address);
    setRent(unit.rent.toString());
    setEditIsOpen(true);
  };

  const handleUpdate = async () => {
    if (selectedUnit) {
      const unitRef = doc(db, 'units', selectedUnit.id);
      await updateDoc(unitRef, {
        name,
        address,
        rent: Number(rent),
      });
      setSelectedUnit(null);
      setName('');
      setAddress('');
      setRent('');
      setEditIsOpen(false);
      fetchUnits();
    }
  };

  const handleDelete = async (unitId) => {
    await deleteDoc(doc(db, 'units', unitId));
    fetchUnits();
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Units</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setName('');
              setAddress('');
              setRent('');
            }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Unit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Unit</DialogTitle>
              <DialogDescription>
                Enter the details of the new unit.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Apartment 3B"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Bukoto, Kampala"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rent" className="text-right">
                  Rent
                </Label>
                <Input
                  id="rent"
                  value={rent}
                  onChange={e => setRent(e.target.value)}
                  className="col-span-3"
                  type="number"
                  placeholder="e.g., 500000"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddUnit}>
                Add Unit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Rent</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map(unit => (
              <TableRow key={unit.id}>
                <TableCell>{unit.name}</TableCell>
                <TableCell>{unit.address}</TableCell>
                <TableCell>{unit.rent}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(unit)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(unit.id)}>
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
              <DialogTitle>Edit Unit</DialogTitle>
              <DialogDescription>
                Update the details of the unit.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name-edit" className="text-right">
                  Name
                </Label>
                <Input
                  id="name-edit"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address-edit" className="text-right">
                  Address
                </Label>
                <Input
                  id="address-edit"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rent-edit" className="text-right">
                  Rent
                </Label>
                <Input
                  id="rent-edit"
                  value={rent}
                  onChange={e => setRent(e.target.value)}
                  className="col-span-3"
                  type="number"
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

export default withAuth(UnitsPage);
