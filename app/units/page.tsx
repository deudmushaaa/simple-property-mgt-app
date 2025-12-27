'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2, Eye } from 'lucide-react';
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

function UnitsPage() {
  const [units, setUnits] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [unitNumber, setUnitNumber] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [rent, setRent] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const fetchUnits = async () => {
    const querySnapshot = await getDocs(collection(db, 'units'));
    const unitsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
      const unit = { id: doc.id, ...doc.data() };
      if (unit.buildingId) {
        const buildingDoc = await getDoc(doc(db, 'buildings', unit.buildingId));
        if (buildingDoc.exists()) {
          unit.buildingName = buildingDoc.data().name;
        }
      }
      return unit;
    }));
    setUnits(unitsData);
  };

  const fetchBuildings = async () => {
    const querySnapshot = await getDocs(collection(db, 'buildings'));
    const buildingsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBuildings(buildingsData);
  };

  useEffect(() => {
    fetchUnits();
    fetchBuildings();
  }, []);

  const handleAddUnit = async () => {
    if (unitNumber && buildingId && rent) {
      await addDoc(collection(db, 'units'), {
        unitNumber,
        buildingId,
        rent,
      });
      setUnitNumber('');
      setBuildingId('');
      setRent('');
      setIsOpen(false);
      fetchUnits();
    }
  };

  const handleEdit = (unit) => {
    setSelectedUnit(unit);
    setUnitNumber(unit.unitNumber);
    setBuildingId(unit.buildingId);
    setRent(unit.rent);
    setEditIsOpen(true);
  };

  const handleUpdate = async () => {
    if (selectedUnit) {
      const unitRef = doc(db, 'units', selectedUnit.id);
      await updateDoc(unitRef, {
        unitNumber,
        buildingId,
        rent,
      });
      setSelectedUnit(null);
      setUnitNumber('');
      setBuildingId('');
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
              setUnitNumber('');
              setBuildingId('');
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
                <Label htmlFor="unitNumber" className="text-right">
                  Unit Number
                </Label>
                <Input
                  id="unitNumber"
                  value={unitNumber}
                  onChange={e => setUnitNumber(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="building" className="text-right">
                  Building
                </Label>
                <Select onValueChange={setBuildingId} value={buildingId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map(building => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <TableHead>Unit Number</TableHead>
              <TableHead>Building</TableHead>
              <TableHead>Rent</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map(unit => (
              <TableRow key={unit.id}>
                <TableCell>
                    <Link href={`/units/${unit.id}`} className="hover:underline">
                        {unit.unitNumber}
                    </Link>
                </TableCell>
                <TableCell>{unit.buildingName}</TableCell>
                <TableCell>{unit.rent}</TableCell>
                <TableCell>
                    <Link href={`/units/${unit.id}`}>
                        <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
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
                <Label htmlFor="unitNumber-edit" className="text-right">
                  Unit Number
                </Label>
                <Input
                  id="unitNumber-edit"
                  value={unitNumber}
                  onChange={e => setUnitNumber(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="building-edit" className="text-right">
                  Building
                </Label>
                <Select onValueChange={setBuildingId} value={buildingId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map(building => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
