'use client'

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc, DocumentData } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { toast } from 'sonner';
import { tenantSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

// Define interfaces for type safety
interface Property extends DocumentData {
  id: string;
  name: string;
  units: { name: string }[];
}

interface Unit {
  name: string;
}

export default function AddTenantPage() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dueDay, setDueDay] = useState<number>(1);
  const [propertyId, setPropertyId] = useState('');
  const [unitName, setUnitName] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [occupiedUnits, setOccupiedUnits] = useState<string[]>([]);
  const [isFromUrl, setIsFromUrl] = useState(false);

  const fetchOccupiedUnits = useCallback(async (propertyId: string, userId: string) => {
    const tenantsQuery = query(
      collection(db, 'tenants'),
      where('propertyId', '==', propertyId),
      where('userId', '==', userId)
    );
    const tenantsSnapshot = await getDocs(tenantsQuery);
    const occupied = tenantsSnapshot.docs.map(doc => doc.data().unitName);
    setOccupiedUnits(occupied);
  }, []);

  useEffect(() => {
    if (user) {
      const fetchProperties = async () => {
        const propsQuery = query(collection(db, 'properties'), where('userId', '==', user.uid));
        const propsSnapshot = await getDocs(propsQuery);
        const propsList = propsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
        setProperties(propsList);

        const propertyIdFromUrl = searchParams?.get('propertyId');
        if (propertyIdFromUrl) {
          const propExists = propsList.some(p => p.id === propertyIdFromUrl);
          if (propExists) {
            setPropertyId(propertyIdFromUrl);
            setIsFromUrl(true);
          }
        }
      };
      fetchProperties();
    }
  }, [user, searchParams]);

  useEffect(() => {
    if (propertyId && user) {
      const fetchUnits = async () => {
        const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
        if (propertyDoc.exists()) {
          setUnits(propertyDoc.data().units || []);
          fetchOccupiedUnits(propertyId, user.uid);
        }
      };
      fetchUnits();
    }
  }, [propertyId, user, fetchOccupiedUnits]);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to add a tenant.');
      return;
    }

    setLoading(true);

    try {
      const selectedProperty = properties.find(p => p.id === propertyId);

      const payload = {
        userId: user.uid,
        name,
        phone,
        dueDay,
        propertyId,
        unitName,
        propertyName: selectedProperty?.name || ''
      };

      // Validate with Zod
      tenantSchema.parse(payload);

      if (occupiedUnits.includes(unitName)) {
        toast.error('This unit is already occupied.');
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'tenants'), payload);

      toast.success(`Tenant ${name} added to ${selectedProperty?.name} successfully!`);
      router.push('/tenants');
    } catch (error) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0].message);
      } else {
        console.error("Error adding tenant: ", error);
        toast.error('Failed to add tenant. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Tenant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name">Full Name</label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone">Phone Number (10 digits)</label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(val);
                }}
                maxLength={10}
                required
                placeholder="0700000000"
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Monthly Rent Due Day
              </label>
              <ToggleGroup
                type="single"
                value={String(dueDay)}
                onValueChange={(val) => {
                  if (val) setDueDay(Number(val));
                }}
                className="grid grid-cols-4 sm:grid-cols-7 gap-2"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <ToggleGroupItem
                    key={day}
                    value={String(day)}
                    className="h-10 w-10 rounded-full border border-input data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-accent hover:text-accent-foreground"
                    aria-label={`Day ${day}`}
                  >
                    {day}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="space-y-2">
              <label htmlFor="property">Property</label>
              <Select value={propertyId} onValueChange={setPropertyId} disabled={isFromUrl}>
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

            {propertyId && (
              <div className="space-y-2">
                <label htmlFor="unit">Unit</label>
                <Select value={unitName} onValueChange={setUnitName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u, index) => (
                      <SelectItem key={index} value={u.name} disabled={occupiedUnits.includes(u.name)}>
                        {u.name} {occupiedUnits.includes(u.name) && "(Occupied)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Tenant'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
