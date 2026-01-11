'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner';
import { Tenant, Property } from '@/lib/types';

export default function TenantsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [pageTitle, setPageTitle] = useState('Tenants');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      const fetchTenants = async () => {
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

        const [tenantsSnapshot, propertiesSnapshot] = await Promise.all([
          getDocs(tenantsQuery),
          getDocs(query(collection(db, 'properties'), where('userId', '==', user.uid)))
        ]);

        const propertiesData = propertiesSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data() as Property;
          return acc;
        }, {} as { [key: string]: Property });

        const tenantsData = tenantsSnapshot.docs.map(doc => {
            const tenantData = doc.data() as Tenant;
            const property = propertiesData[tenantData.propertyId!];
            return {
                ...tenantData,
                id: doc.id,
                propertyName: property ? property.name : 'N/A',
            }
        });
        setTenants(tenantsData);
      };
      fetchTenants();
    }
  }, [user, propertyId]);

  const handleDelete = async (tenantId: string) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return;

    try {
      await deleteDoc(doc(db, 'tenants', tenantId));
      toast.success('Tenant deleted successfully!');
      setTenants(currentTenants => currentTenants.filter(t => t.id !== tenantId));
    } catch (error) {
      toast.error('Failed to delete tenant. Please try again.');
      console.error("Error deleting tenant: ", error);
    }
  };

  const addTenantLink = propertyId ? `/tenants/add?propertyId=${propertyId}` : '/tenants/add';

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{pageTitle}</h1>
        <div className="flex items-center space-x-2">
           <Input
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e: FormEvent<HTMLInputElement>) => setSearchTerm(e.currentTarget.value)}
              className="max-w-sm hidden sm:block"
            />
            <Link href={addTenantLink}>
              <Button>Add Tenant</Button>
            </Link>
        </div>
      </div>
       <Input
        placeholder="Search tenants..."
        value={searchTerm}
        onChange={(e: FormEvent<HTMLInputElement>) => setSearchTerm(e.currentTarget.value)}
        className="max-w-sm sm:hidden mb-4"
      />

      {/* Mobile Card View */}
      <div className="sm:hidden grid gap-4">
        {filteredTenants.map(tenant => (
          <Card key={tenant.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {tenant.name}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild><Link href={`/tenants/${tenant.id}`}>View Details</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href={`/tenants/edit/${tenant.id}`}>Edit</Link></DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(tenant.id)} className="text-red-500">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{tenant.propertyName} - Unit {tenant.unitName}</p>
              <p className="text-sm">{tenant.email}</p>
              <p className="text-sm">{tenant.phone}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden sm:block">
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
                    <TableCell>{tenant.propertyName ?? 'N/A'}</TableCell>
                    <TableCell>{tenant.unitName ?? 'N/A'}</TableCell>
                    <TableCell>{tenant.email}</TableCell>
                    <TableCell>{tenant.phone ?? 'N/A'}</TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link href={`/tenants/${tenant.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={`/tenants/edit/${tenant.id}`}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(tenant.id)} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
