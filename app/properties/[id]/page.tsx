'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function PropertyDetailPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [unitsWithTenants, setUnitsWithTenants] = useState([]);

  useEffect(() => {
    const fetchPropertyData = async () => {
      if (user && id) {
        // Fetch property details
        const propertyDocRef = doc(db, 'properties', id);
        const propertyDocSnap = await getDoc(propertyDocRef);

        if (propertyDocSnap.exists()) {
          const propertyData = { id: propertyDocSnap.id, ...propertyDocSnap.data() };
          setProperty(propertyData);

          // Fetch tenants for this property
          const tenantsQuery = query(collection(db, 'tenants'), where('propertyId', '==', id));
          const tenantsSnapshot = await getDocs(tenantsQuery);
          const tenantsMap = new Map(tenantsSnapshot.docs.map(doc => [doc.data().unitId, {id: doc.id, ...doc.data()}]));

          // Map units to tenants
          const units = propertyData.units || [];
          const unitsData = units.map(unit => ({
            ...unit,
            tenant: tenantsMap.get(unit.id) || tenantsMap.get(unit.name) || null
          }));
          setUnitsWithTenants(unitsData);

        } else {
          // Handle property not found
        }
      }
    };

    fetchPropertyData();
  }, [user, id]);

  if (!property) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{property.name}</CardTitle>
          <CardDescription>{property.address}</CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="my-6" />
          
          <h3 className="text-2xl font-semibold mb-4">Units</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unitsWithTenants.map((unit, index) => (
                  <TableRow key={unit.id || index}>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell>
                      {unit.tenant ? (
                        <Badge>Occupied</Badge>
                      ) : (
                        <Badge variant="secondary">Vacant</Badge>
                      )}
                    </TableCell>
                    <TableCell>{unit.tenant ? unit.tenant.name : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      {unit.tenant ? (
                        <Link href={`/tenants/${unit.tenant.id}`}>
                          <Button variant="outline" size="sm">View Tenant</Button>
                        </Link>
                      ) : (
                        <Link href={`/tenants/add?propertyId=${id}&unitId=${unit.id || unit.name}&unitName=${unit.name}&propertyName=${property.name}`}>
                           <Button size="sm">Add Tenant</Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
