'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

export default function AddTenantPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [occupiedUnitIds, setOccupiedUnitIds] = useState(new Set());

  const [propertyId, setPropertyId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [unitName, setUnitName] = useState('');
  const [propertyName, setPropertyName] = useState('');
  
  const [isFromUrl, setIsFromUrl] = useState(false);

  const fetchOccupiedUnits = useCallback(async (propertyId) => {
      const tenantsQuery = query(
          collection(db, 'tenants'), 
          where('propertyId', '==', propertyId)
      );
      const tenantsSnapshot = await getDocs(tenantsQuery);
      const occupied = new Set(tenantsSnapshot.docs.map(doc => doc.data().unitId));
      setOccupiedUnitIds(occupied);
  }, []);

  useEffect(() => {
    const pId = searchParams.get('propertyId');
    const uId = searchParams.get('unitId');
    const pName = searchParams.get('propertyName');
    const uName = searchParams.get('unitName');

    const fetchData = async () => {
      if (pId && uId) {
        setIsFromUrl(true);
        setPropertyId(pId);
        setUnitId(uId);
        
        // Ensure names are strings, not null or undefined
        setPropertyName(pName || 'N/A');
        setUnitName(uName || 'N/A');

      } else if (user) {
        const q = query(collection(db, 'properties'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const props = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProperties(props);
      }
    }

    fetchData();
  }, [user, searchParams]);

  const handlePropertyChange = (selectedPropertyId) => {
    setPropertyId(selectedPropertyId);
    const property = properties.find(p => p.id === selectedPropertyId);
    if (property) {
      setPropertyName(property.name);
      setUnits(property.units || []);
      fetchOccupiedUnits(selectedPropertyId);
      setUnitId('');
      setUnitName('');
    }
  };

  const handleUnitChange = (selectedValue) => {
    // The selectedValue could be an ID or a name
    const unit = (units || []).find(u => u.id === selectedValue || u.name === selectedValue);
    if (unit) {
        setUnitId(unit.id || unit.name); // Use ID if available, otherwise name
        setUnitName(unit.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to add a tenant.');
      return;
    }

    if (!name || !propertyId || !unitId) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    const finalUnitName = isFromUrl ? unitName : (units.find(u => u.id === unitId || u.name === unitId)?.name || 'N/A');
    const finalPropertyName = isFromUrl ? propertyName : (properties.find(p => p.id === propertyId)?.name || 'N/A');

    try {
      await addDoc(collection(db, 'tenants'), {
        userId: user.uid,
        name,
        email,
        phone,
        propertyId,
        unitId, // This will be either the unique ID or the unit name
        unitName: finalUnitName,
        propertyName: finalPropertyName, 
        balance: 0, 
        createdAt: new Date(),
      });

      toast.success('Tenant added successfully!');
      router.push('/properties'); // Redirect to properties page
    } catch (error) {
      console.error("Error adding tenant: ", error);
      toast.error('Failed to add tenant. Please try again.');
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
              <label htmlFor="name" className="font-semibold">Full Name</label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="font-semibold">Email Address</label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="johndoe@example.com" />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="font-semibold">Phone Number</label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 555-5555" />
            </div>

            {isFromUrl ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-semibold">Property</label>
                  <Input value={propertyName} disabled />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold">Unit</label>
                  <Input value={unitName} disabled />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="property" className="font-semibold">Property</label>
                  <Select onValueChange={handlePropertyChange} value={propertyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map(prop => (
                        <SelectItem key={prop.id} value={prop.id}>{prop.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="unit" className="font-semibold">Unit</label>
                  <Select onValueChange={handleUnitChange} value={unitId} disabled={!propertyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit, index) => (
                        <SelectItem 
                          key={unit.id || index} 
                          value={unit.id || unit.name} // Use name as fallback value
                          disabled={occupiedUnitIds.has(unit.id) || occupiedUnitIds.has(unit.name)}
                        >
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button type="submit">Add Tenant</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
