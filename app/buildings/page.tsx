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

function BuildingsPage() {
  const [buildings, setBuildings] = useState([]);
  const [landlords, setLandlords] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [landlordId, setLandlordId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const fetchBuildings = async () => {
    const querySnapshot = await getDocs(collection(db, 'buildings'));
    const buildingsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
      const building = { id: doc.id, ...doc.data() };
      if (building.landlordId) {
        const landlordDoc = await getDoc(doc(db, 'landlords', building.landlordId));
        if (landlordDoc.exists()) {
          building.landlordName = landlordDoc.data().name;
        }
      }
      return building;
    }));
    setBuildings(buildingsData);
  };

  const fetchLandlords = async () => {
    const querySnapshot = await getDocs(collection(db, 'landlords'));
    const landlordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLandlords(landlordsData);
  };

  useEffect(() => {
    fetchBuildings();
    fetchLandlords();
  }, []);

  const handleAddBuilding = async () => {
    if (name && address && landlordId) {
      await addDoc(collection(db, 'buildings'), {
        name,
        address,
        landlordId,
      });
      setName('');
      setAddress('');
      setLandlordId('');
      setIsOpen(false);
      fetchBuildings();
    }
  };

  const handleEdit = (building) => {
    setSelectedBuilding(building);
    setName(building.name);
    setAddress(building.address);
    setLandlordId(building.landlordId);
    setEditIsOpen(true);
  };

  const handleUpdate = async () => {
    if (selectedBuilding) {
      const buildingRef = doc(db, 'buildings', selectedBuilding.id);
      await updateDoc(buildingRef, {
        name,
        address,
        landlordId,
      });
      setSelectedBuilding(null);
      setName('');
      setAddress('');
      setLandlordId('');
      setEditIsOpen(false);
      fetchBuildings();
    }
  };

  const handleDelete = async (buildingId) => {
    await deleteDoc(doc(db, 'buildings', buildingId));
    fetchBuildings();
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Buildings</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setName('');
              setAddress('');
              setLandlordId('');
            }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Building
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Building</DialogTitle>
              <DialogDescription>
                Enter the details of the new building.
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
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="landlord" className="text-right">
                  Landlord
                </Label>
                <Select onValueChange={setLandlordId} value={landlordId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a landlord" />
                  </SelectTrigger>
                  <SelectContent>
                    {landlords.map(landlord => (
                      <SelectItem key={landlord.id} value={landlord.id}>
                        {landlord.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddBuilding}>
                Add Building
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
              <TableHead>Landlord</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buildings.map(building => (
              <TableRow key={building.id}>
                <TableCell>
                    <Link href={`/buildings/${building.id}`} className="hover:underline">
                        {building.name}
                    </Link>
                </TableCell>
                <TableCell>{building.address}</TableCell>
                <TableCell>{building.landlordName}</TableCell>
                <TableCell>
                  <Link href={`/buildings/${building.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(building)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(building.id)}>
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
              <DialogTitle>Edit Building</DialogTitle>
              <DialogDescription>
                Update the details of the building.
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
                <Label htmlFor="landlord-edit" className="text-right">
                  Landlord
                </Label>
                <Select onValueChange={setLandlordId} value={landlordId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a landlord" />
                  </SelectTrigger>
                  <SelectContent>
                    {landlords.map(landlord => (
                      <SelectItem key={landlord.id} value={landlord.id}>
                        {landlord.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

export default withAuth(BuildingsPage);
