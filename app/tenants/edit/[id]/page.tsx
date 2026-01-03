'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function EditTenantPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [unitName, setUnitName] = useState('');
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenantAndProperties = async () => {
      if (user && id) {
        // Fetch tenant data
        const tenantDocRef = doc(db, 'tenants', id);
        const tenantDocSnap = await getDoc(tenantDocRef);

        if (tenantDocSnap.exists() && tenantDocSnap.data().userId === user.uid) {
          const tenantData = tenantDocSnap.data();
          setName(tenantData.name);
          setEmail(tenantData.email);
          setPhone(tenantData.phone);
          setPropertyId(tenantData.propertyId);
          setUnitName(tenantData.unitName);

          // Fetch properties
          const propsQuery = query(collection(db, 'properties'), where('userId', '==', user.uid));
          const propsSnapshot = await getDocs(propsQuery);
          const propsList = propsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setProperties(propsList);

          // Fetch units for the initial property
          if (tenantData.propertyId) {
            const propDoc = await getDoc(doc(db, 'properties', tenantData.propertyId));
            if (propDoc.exists()) {
                setUnits(propDoc.data().units || []);
            }
          }

        } else {
          toast.error('Tenant not found or you don\'t have access.');
          router.push('/tenants');
        }
        setLoading(false);
      }
    };

    fetchTenantAndProperties();
  }, [user, id, router]);

  useEffect(() => {
    const fetchUnits = async () => {
        if (propertyId) {
            const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
            if (propertyDoc.exists()) {
                setUnits(propertyDoc.data().units || []);
            }
        }
    };
    fetchUnits();
  }, [propertyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to edit a tenant.');
      return;
    }

    try {
      const tenantRef = doc(db, 'tenants', id);
      await updateDoc(tenantRef, {
        name,
        email,
        phone,
        propertyId,
        unitName,
      });

      toast.success('Tenant updated successfully!');
      router.push('/tenants');
    } catch (error) {
      console.error("Error updating tenant: ", error);
      toast.error('Failed to update tenant. Please try again.');
    }
  };

  if (loading) {
    return <div className="container mx-auto py-10 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Tenant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="name">Full Name</label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <label htmlFor="email">Email</label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <label htmlFor="phone">Phone Number</label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
                <label htmlFor="property">Property</label>
                <Select value={propertyId} onValueChange={setPropertyId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                        {properties.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <label htmlFor="unit">Unit</label>
                <Select value={unitName} onValueChange={setUnitName}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                    <SelectContent>
                        {units.map((u, index) => (
                            <SelectItem key={index} value={u.name}>{u.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
