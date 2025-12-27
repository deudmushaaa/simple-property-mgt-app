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

function LandlordsPage() {
  const [landlords, setLandlords] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [selectedLandlord, setSelectedLandlord] = useState(null);

  const fetchLandlords = async () => {
    const querySnapshot = await getDocs(collection(db, 'landlords'));
    const landlordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLandlords(landlordsData);
  };

  useEffect(() => {
    fetchLandlords();
  }, []);

  const handleAddLandlord = async () => {
    if (name && email) {
      await addDoc(collection(db, 'landlords'), {
        name,
        email,
        phoneNumber,
      });
      setName('');
      setEmail('');
      setPhoneNumber('');
      setIsOpen(false);
      fetchLandlords();
    }
  };

  const handleEdit = (landlord) => {
    setSelectedLandlord(landlord);
    setName(landlord.name);
    setEmail(landlord.email);
    setPhoneNumber(landlord.phoneNumber);
    setEditIsOpen(true);
  };

  const handleUpdate = async () => {
    if (selectedLandlord) {
      const landlordRef = doc(db, 'landlords', selectedLandlord.id);
      await updateDoc(landlordRef, {
        name,
        email,
        phoneNumber,
      });
      setSelectedLandlord(null);
      setName('');
      setEmail('');
      setPhoneNumber('');
      setEditIsOpen(false);
      fetchLandlords();
    }
  };

  const handleDelete = async (landlordId) => {
    await deleteDoc(doc(db, 'landlords', landlordId));
    fetchLandlords();
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Landlords</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setName('');
              setEmail('');
              setPhoneNumber('');
            }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Landlord
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Landlord</DialogTitle>
              <DialogDescription>
                Enter the details of the new landlord.
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
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddLandlord}>
                Add Landlord
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
              <TableHead>Email</_TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {landlords.map(landlord => (
              <TableRow key={landlord.id}>
                <TableCell>{landlord.name}</TableCell>
                <TableCell>{landlord.email}</TableCell>
                <TableCell>{landlord.phoneNumber}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(landlord)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(landlord.id)}>
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
              <DialogTitle>Edit Landlord</DialogTitle>
              <DialogDescription>
                Update the details of the landlord.
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
                <Label htmlFor="email-edit" className="text-right">
                  Email
                </Label>
                <Input
                  id="email-edit"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone-edit" className="text-right">
                  Phone Number
                </Label>
                <Input
                  id="phone-edit"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
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

export default withAuth(LandlordsPage);
