'use client'

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { propertySchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export default function AddPropertyPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [numberOfUnits, setNumberOfUnits] = useState('');
  const [unitPrefix, setUnitPrefix] = useState('Unit #');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to add a property.');
      return;
    }

    const numUnits = parseInt(numberOfUnits, 10);
    setLoading(true);

    try {
      const units = [];
      for (let i = 1; i <= numUnits; i++) {
        units.push({ name: `${unitPrefix}${i}` });
      }

      const payload = {
        userId: user.uid,
        name,
        address,
        units,
        createdAt: new Date(),
      };

      // Validate with Zod
      propertySchema.parse(payload);

      await addDoc(collection(db, 'properties'), payload);

      toast.success(`Property ${name} with ${numUnits} units created successfully!`);
      router.push('/properties');
    } catch (error) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0].message);
      } else {
        console.error("Error adding property: ", error);
        toast.error('Failed to add property. Please try again.');
      }
    } finally {
      setLoading(false);
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
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Property'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
