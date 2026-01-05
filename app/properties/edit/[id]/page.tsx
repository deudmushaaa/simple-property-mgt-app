'use client'

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Property } from '@/lib/types';

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      if (user && id) {
        const docRef = doc(db, 'properties', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().userId === user.uid) {
          const data = docSnap.data() as Property;
          setName(data.name);
          setAddress(data.address);
        } else {
          toast.error('Property not found or you don\'t have access.');
          router.push('/properties');
        }
        setLoading(false);
      }
    };

    fetchProperty();
  }, [user, id, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user || !id) {
      toast.error('You must be logged in to edit a property.');
      return;
    }

    try {
      const propertyRef = doc(db, 'properties', id);
      await updateDoc(propertyRef, {
        name,
        address,
      });

      toast.success('Property updated successfully!');
      router.push('/properties');
    } catch (error) {
      console.error("Error updating property: ", error);
      toast.error('Failed to update property. Please try again.');
    }
  };

  if (loading) {
    return <div className="container mx-auto py-10 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Property</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="font-semibold">Property Name</label>
              <Input id="name" type="text" value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="e.g., Downtown Apartments" required />
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="font-semibold">Address</label>
              <Input id="address" type="text" value={address} onChange={(e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)} placeholder="e.g., 123 Main St, Anytown USA" required />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
