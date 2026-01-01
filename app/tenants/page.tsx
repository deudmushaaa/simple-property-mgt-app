'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function TenantsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  const [tenants, setTenants] = useState([]);
  const [pageTitle, setPageTitle] = useState('Tenants');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTenants = async () => {
      if (user) {
        let tenantsQuery;
        if (propertyId) {
          tenantsQuery = query(
            collection(db, 'tenants'),
            where('userId', '==', user.uid),
            where('propertyId', '==', propertyId)
          );
          const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
          if (propertyDoc.exists()) {
            setPageTitle(`Tenants for ${propertyDoc.data().name}`);
          }
        } else {
          tenantsQuery = query(collection(db, 'tenants'), where('userId', '==', user.uid));
          setPageTitle('All Tenants');
        }

        const tenantsSnapshot = await getDocs(tenantsQuery);
        const tenantsData = tenantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTenants(tenantsData);
      }
    };

    fetchTenants();
  }, [user, propertyId]);

  const addTenantLink = propertyId ? `/tenants/add?propertyId=${propertyId}` : '/tenants/add';

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{pageTitle}</CardTitle>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Link href={addTenantLink}>
              <Button>Add Tenant</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map(tenant => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>{tenant.propertyName}</TableCell>
                    <TableCell>{tenant.unitName}</TableCell>
                    <TableCell>{tenant.email}</TableCell>
                    <TableCell>{tenant.phone}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/tenants/${tenant.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
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
