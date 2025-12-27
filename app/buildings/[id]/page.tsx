'use client'

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function BuildingDetailsPage({ params }) {
  const [building, setBuilding] = useState(null);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    if (params.id) {
      const fetchBuildingDetails = async () => {
        const buildingDoc = await getDoc(doc(db, 'buildings', params.id));
        if (buildingDoc.exists()) {
          const buildingData = { id: buildingDoc.id, ...buildingDoc.data() };
          if (buildingData.landlordId) {
            const landlordDoc = await getDoc(doc(db, 'landlords', buildingData.landlordId));
            if (landlordDoc.exists()) {
              buildingData.landlordName = landlordDoc.data().name;
            }
          }
          setBuilding(buildingData);
        }
      };

      const fetchUnits = async () => {
        const q = query(collection(db, "units"), where("buildingId", "==", params.id));
        const querySnapshot = await getDocs(q);
        const unitsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUnits(unitsData);
      };

      fetchBuildingDetails();
      fetchUnits();
    }
  }, [params.id]);

  if (!building) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Building Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Name:</strong> {building.name}</p>
          <p><strong>Address:</strong> {building.address}</p>
          <p><strong>Landlord:</strong> {building.landlordName}</p>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Units in {building.name}</h2>
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Unit Number</TableHead>
                <TableHead>Rent</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {units.map(unit => (
                <TableRow key={unit.id}>
                    <TableCell>{unit.unitNumber}</TableCell>
                    <TableCell>{unit.rent}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </div>
    </div>
  );
}
