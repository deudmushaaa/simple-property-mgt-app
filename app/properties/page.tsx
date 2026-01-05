'use client'

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Property } from '@/lib/types';

export default function PropertiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      const fetchProperties = async () => {
        const propertiesQuery = query(collection(db, 'properties'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(propertiesQuery);
        const propertiesData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Property);
        setProperties(propertiesData);
      };
      fetchProperties();
    }
  }, [user]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
  };

  const deleteProperty = async (propertyId: string) => {
    if (confirm('Are you sure you want to delete this property and all associated data?')) {
      try {
        const tenantsQuery = query(collection(db, 'tenants'), where('propertyId', '==', propertyId));
        const tenantsSnapshot = await getDocs(tenantsQuery);
        const deletePromises: Promise<void>[] = [];
        tenantsSnapshot.forEach(doc => {
          deletePromises.push(deleteDoc(doc.ref));
        });
        await Promise.all(deletePromises);

        await deleteDoc(doc(db, 'properties', propertyId));
        setProperties(properties.filter(p => p.id !== propertyId));
        toast.success('Property and all related data deleted successfully.');
      } catch (error) {
        console.error('Error deleting property: ', error);
        toast.error('Failed to delete property.');
      }
    }
  };

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Properties</h1>
        <Button onClick={() => router.push('/properties/add')}><Plus className="mr-2 h-4 w-4" /> Add Property</Button>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <Input
          type="text"
          placeholder="Search properties..."
          value={searchQuery}
          onChange={(e: FormEvent<HTMLInputElement>) => setSearchQuery(e.currentTarget.value)}
          className="max-w-sm"
        />
        <Button type="submit"><Search className="h-4 w-4" /></Button>
      </form>

      <div className="bg-white rounded-lg shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProperties.map((property) => (
              <TableRow key={property.id}>
                <TableCell className="font-medium">{property.name}</TableCell>
                <TableCell>{property.address}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => router.push(`/properties/edit/${property.id}`)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteProperty(property.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
