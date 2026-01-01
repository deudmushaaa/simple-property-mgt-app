'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function TenantDetailPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    const fetchTenantData = async () => {
      if (user && id) {
        const tenantDocRef = doc(db, 'tenants', id);
        const tenantDocSnap = await getDoc(tenantDocRef);

        if (tenantDocSnap.exists()) {
          setTenant({ id: tenantDocSnap.id, ...tenantDocSnap.data() });
        } else {
          // Handle tenant not found
        }
      }
    };

    fetchTenantData();
  }, [user, id]);

  if (!tenant) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{tenant.name}</CardTitle>
          <CardDescription>Tenant Details</CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="my-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold">Contact Information</h3>
              <p><strong>Email:</strong> {tenant.email}</p>
              <p><strong>Phone:</strong> {tenant.phone}</p>
            </div>
            <div>
              <h3 className="font-semibold">Lease Information</h3>
              <p><strong>Property:</strong> {tenant.propertyName}</p>
              <p><strong>Unit:</strong> {tenant.unitName}</p>
              <p><strong>Balance:</strong> ${tenant.balance}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
