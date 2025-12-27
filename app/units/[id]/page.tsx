'use client'

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnitDetailsPage({ params }) {
  const [unit, setUnit] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [building, setBuilding] = useState(null);

  useEffect(() => {
    if (params.id) {
      const fetchUnitDetails = async () => {
        const unitDoc = await getDoc(doc(db, 'units', params.id));
        if (unitDoc.exists()) {
          const unitData = { id: unitDoc.id, ...unitDoc.data() };
          setUnit(unitData);

          if (unitData.tenantId) {
            const tenantDoc = await getDoc(doc(db, 'tenants', unitData.tenantId));
            if (tenantDoc.exists()) {
              setTenant({ id: tenantDoc.id, ...tenantDoc.data() });
            }
          }

          if (unitData.buildingId) {
            const buildingDoc = await getDoc(doc(db, 'buildings', unitData.buildingId));
            if (buildingDoc.exists()) {
              setBuilding({ id: buildingDoc.id, ...buildingDoc.data() });
            }
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
          <p><strong>Unit Number:</strong> {unit.unitNumber}</p>
          <p><strong>Rent:</strong> {unit.rent}</p>
          {building && <p><strong>Building:</strong> {building.name}</p>}
        </CardContent>
      </Card>

      {tenant && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Tenant Information</h2>
          <Card>
            <CardContent className="pt-6">
              <p><strong>Name:</strong> {tenant.name}</p>
              <p><strong>Email:</strong> {tenant.email}</p>
              <p><strong>Phone Number:</strong> {tenant.phoneNumber}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
