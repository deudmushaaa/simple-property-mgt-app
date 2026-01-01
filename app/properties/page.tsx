'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Eye } from 'lucide-react';

export default function PropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      if (user) {
        const propertiesQuery = query(collection(db, 'properties'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(propertiesQuery);
        const propertiesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProperties(propertiesData);
      }
    };

    fetchProperties();
  }, [user]);

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Properties</h1>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Link href="/properties/add">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </Link>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Units</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProperties.map((property) => (
              <TableRow key={property.id}>
                <TableCell className="font-medium">{property.name}</TableCell>
                <TableCell>{property.address}</TableCell>
                <TableCell>{property.units ? property.units.length : 0}</TableCell>
                <TableCell className="text-right">
                    <Link href={`/tenants?propertyId=${property.id}`}>
                        <Button variant="ghost" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View Tenants
                        </Button>
                    </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
