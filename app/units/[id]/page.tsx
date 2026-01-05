'use client'

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Unit, Tenant, Property } from '@/lib/types';

interface PageProps {
    params: { id: string };
}

export default function UnitDetailsPage({ params }: PageProps) {
  const [unit, setUnit] = useState<Unit | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (params.id) {
      const fetchUnitDetails = async () => {
        const unitDocRef = doc(db, 'units', params.id);
        const unitDocSnap = await getDoc(unitDocRef);

        if (unitDocSnap.exists()) {
          const unitData = { id: unitDocSnap.id, ...unitDocSnap.data() } as Unit;
          setUnit(unitData);

          // Fetch the associated property
          const propertyDocRef = doc(db, 'properties', unitData.propertyId);
          const propertyDocSnap = await getDoc(propertyDocRef);
          if (propertyDocSnap.exists()) {
            setProperty({ id: propertyDocSnap.id, ...propertyDocSnap.data() } as Property);
          }

          // Find the tenant assigned to this unit
          const tenantsQuery = query(collection(db, 'tenants'), where('unitId', '==', params.id));
          const tenantsSnapshot = await getDocs(tenantsQuery);
          if (!tenantsSnapshot.empty) {
            const tenantDoc = tenantsSnapshot.docs[0];
            setTenant({ id: tenantDoc.id, ...tenantDoc.data() } as Tenant);
          }
        }
      };

      fetchUnitDetails();
    }
  }, [params.id]);

  if (!unit) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Unit Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Unit Name:</strong> {unit.name}</p>
          {property && <p><strong>Property:</strong> {property.name}</p>}
        </CardContent>
      </Card>

      {tenant && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Tenant Information</h2>
          <Card>
            <CardContent className="pt-6">
              <p><strong>Name:</strong> {tenant.name}</p>
              <p><strong>Email:</strong> {tenant.email}</p>
              <p><strong>Phone Number:</strong> {tenant.phone}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
