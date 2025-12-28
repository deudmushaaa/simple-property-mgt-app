'use client'

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, CreditCard } from 'lucide-react';
import withAuth from '@/components/auth/withAuth';

function DashboardPage() {
  const [tenantsCount, setTenantsCount] = useState(0);
  const [unitsCount, setUnitsCount] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const tenantsSnapshot = await getDocs(collection(db, 'tenants'));
      setTenantsCount(tenantsSnapshot.size);

      const unitsSnapshot = await getDocs(collection(db, 'units'));
      setUnitsCount(unitsSnapshot.size);

      const paymentsSnapshot = await getDocs(collection(db, 'payments'));
      const total = paymentsSnapshot.docs.reduce((acc, doc) => acc + doc.data().amount, 0);
      setTotalPayments(total);
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Welcome to Karibu!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
            Your simplified property management dashboard.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{tenantsCount}</div>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Units</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{unitsCount}</div>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${totalPayments.toLocaleString()}</div>
            </CardContent>
            </Card>
        </div>
    </div>
  );
}

export default withAuth(DashboardPage);
