'use client'

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, writeBatch } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AddPropertyPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [numberOfUnits, setNumberOfUnits] = useState('');
  const [unitPrefix, setUnitPrefix] = useState('Unit #');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to add a property.');
      return;
    }

    const numUnits = parseInt(numberOfUnits, 10);

    if (!name || !address || !numberOfUnits || isNaN(numUnits) || numUnits <= 0) {
      toast.error('Please fill in all fields and provide a valid number of units.');
      return;
    }

    try {
      // Create the property first to get an ID
      const propertyRef = await addDoc(collection(db, 'properties'), {
        userId: user.uid,
        name,
        address,
        createdAt: new Date(),
      });

      // Now, create a batch to add all the units
      const batch = writeBatch(db);
      for (let i = 1; i <= numUnits; i++) {
        addDoc(collection(db, 'units'), {
            propertyId: propertyRef.id,
            name: `${unitPrefix}${i}`
        });
      }
      await batch.commit();


      toast.success(`${numUnits} units created for property ${name} successfully!`);
      router.push('/properties');
    } catch (error) {
      console.error("Error adding property: ", error);
      toast.error('Failed to add property. Please try again.');
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Property</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="font-semibold">Property Name</label>
              <Input id="name" value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="e.g., Downtown Apartments" required />
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="font-semibold">Address</label>
              <Input id="address" value={address} onChange={(e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)} placeholder="123 Main St, Anytown, USA" required />
            </div>

            <div>
              <h3 className="font-semibold mb-2">Units</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <label htmlFor="unit-prefix">Unit Name Prefix</label>
                      <Input id="unit-prefix" value={unitPrefix} onChange={(e: ChangeEvent<HTMLInputElement>) => setUnitPrefix(e.target.value)} placeholder="e.g., Unit #, Apt" />
                  </div>
                  <div className="space-y-2">
                      <label htmlFor="number-of-units">Number of Units</label>
                      <Input id="number-of-units" type="number" value={numberOfUnits} onChange={(e: ChangeEvent<HTMLInputElement>) => setNumberOfUnits(e.target.value)} placeholder="e.g., 50" required />
                  </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit">Save Property</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
