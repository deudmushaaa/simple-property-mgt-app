'use client'

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { toast } from 'sonner';
import { tenantSchema } from '@/lib/schemas';
import { ZodError } from 'zod';
import { Loader2 } from 'lucide-react';

// Interfaces for type safety
interface Property extends DocumentData {
  id: string;
  name: string;
  units: { name: string }[];
}

interface Unit {
  name: string;
}

export default function EditTenantPage() {
  const router = useRouter();
  const params = useParams();
  const id = params && 'id' in params ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dueDay, setDueDay] = useState<number>(1);
  const [propertyId, setPropertyId] = useState('');
  const [unitName, setUnitName] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [initLoading, setInitLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTenantAndProperties = async () => {
      if (user && id) {
        try {
          // Fetch tenant data
          const tenantDocRef = doc(db, 'tenants', id);
          const tenantDocSnap = await getDoc(tenantDocRef);

          if (tenantDocSnap.exists() && tenantDocSnap.data().userId === user.uid) {
            const tenantData = tenantDocSnap.data();
            setName(tenantData.name);
            setPhone(tenantData.phone || '');
            setDueDay(tenantData.dueDay || 1);
            setPropertyId(tenantData.propertyId);
            setUnitName(tenantData.unitName);

            // Fetch properties
            const propsQuery = query(collection(db, 'properties'), where('userId', '==', user.uid));
            const propsSnapshot = await getDocs(propsQuery);
            const propsList = propsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
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
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Failed to load tenant data.");
        } finally {
          setInitLoading(false);
        }
      }
    };

    fetchTenantAndProperties();
  }, [user, id, router]);

  useEffect(() => {
    const fetchUnits = async () => {
      if (propertyId && !initLoading) {
        const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
        if (propertyDoc.exists()) {
          setUnits(propertyDoc.data().units || []);
        }
      }
    };
    fetchUnits();
  }, [propertyId, initLoading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !id) {
      toast.error('You must be logged in to edit a tenant.');
      return;
    }

    setSubmitting(true);

    try {
      const tenantRef = doc(db, 'tenants', id);
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

      await updateDoc(tenantRef, payload);

      toast.success('Tenant updated successfully!');
      router.push('/tenants');
    } catch (error) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0].message);
      } else {
        console.error("Error updating tenant: ", error);
        toast.error('Failed to update tenant. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (initLoading) {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Loading tenant details...</p>
      </div>
    );
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

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
