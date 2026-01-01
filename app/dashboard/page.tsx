'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PlusCircle } from 'lucide-react';
import { TooltipProvider, Tooltip as ShadTooltip, TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
    totalRevenue: 0, 
    occupancyRate: 0, 
    overdueBalances: 0, 
    recentPayments: [],
    overdueTenants: [],
    vacantUnits: [],
  });
  const [revenueData, setRevenueData] = useState([]);
  const [hasPropertiesWithVacantUnits, setHasPropertiesWithVacantUnits] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        // Fetch properties
        const propertiesQuery = query(collection(db, 'properties'), where('userId', '==', user.uid));
        const propertiesSnapshot = await getDocs(propertiesQuery);
        const properties = propertiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const propertiesMap = new Map(properties.map(p => [p.id, p.name]));
        const allUnits = properties.flatMap(p => 
            (p.units || []).map(u => ({ ...u, propertyName: p.name, propertyId: p.id }))
        );
        const totalUnits = allUnits.length;

        // Fetch tenants
        const tenantsQuery = query(collection(db, 'tenants'), where('userId', '==', user.uid));
        const tenantsSnapshot = await getDocs(tenantsQuery);
        const tenants = tenantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const tenantsMap = new Map(tenants.map(t => [t.id, t.name]));
        const occupiedUnits = tenants.length;
        const occupiedUnitIds = new Set(tenants.map(t => t.unitId));

        // Fetch payments
        const paymentsQuery = query(collection(db, 'payments'), where('userId', '==', user.uid));
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const payments = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // --- Calculate stats ---

        const totalRevenue = payments.reduce((acc, payment) => acc + payment.amount, 0);
        const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
        const overdueBalances = tenants.reduce((acc, tenant) => acc + (tenant.balance > 0 ? tenant.balance : 0), 0);
        
        const recentPayments = payments
            .sort((a, b) => b.date.toMillis() - a.date.toMillis())
            .slice(0, 3)
            .map(payment => ({
                ...payment,
                tenantName: tenantsMap.get(payment.tenantId) || 'N/A'
            }));

        const overdueTenants = tenants
            .filter(t => t.balance > 0)
            .map(t => ({ ...t, propertyName: propertiesMap.get(t.propertyId) || 'N/A' }));

        const vacantUnits = allUnits.filter(unit => !occupiedUnitIds.has(unit.id) && !occupiedUnitIds.has(unit.name));
        setHasPropertiesWithVacantUnits(vacantUnits.length > 0);

        // Revenue Chart Data (last 6 months)
        const monthlyRevenueData = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = monthNames[d.getMonth()];
            monthlyRevenueData.push({ name: monthName, revenue: 0 });
        }

        payments.forEach(payment => {
            if (payment.date && typeof payment.date.toDate === 'function') {
                const paymentDate = payment.date.toDate();
                const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
                if (paymentDate >= sixMonthsAgo) {
                    const monthName = monthNames[paymentDate.getMonth()];
                    const monthData = monthlyRevenueData.find(m => m.name === monthName);
                    if (monthData) {
                        monthData.revenue += payment.amount;
                    }
                }
            }
        });
        
        setStats({ totalRevenue, occupancyRate, overdueBalances, recentPayments, overdueTenants, vacantUnits });
        setRevenueData(monthlyRevenueData);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="flex gap-2">
                <TooltipProvider>
                    <ShadTooltip>
                        <TooltipTrigger asChild>
                            <div className={`${!hasPropertiesWithVacantUnits ? 'cursor-not-allowed' : ''}`}>
                                <Button asChild={hasPropertiesWithVacantUnits} disabled={!hasPropertiesWithVacantUnits}>
                                    <Link href="/tenants/add">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Tenant
                                    </Link>
                                </Button>
                            </div>
                        </TooltipTrigger>
                        {!hasPropertiesWithVacantUnits && (
                            <TooltipContent>
                                <p>Add a property with vacant units to add a tenant.</p>
                            </TooltipContent>
                        )}
                    </ShadTooltip>
                </TooltipProvider>
                <Button asChild>
                    <Link href="/properties/add">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Property
                    </Link>
                </Button>
            </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader>
                    <CardTitle>Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Occupancy Rate</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{stats.occupancyRate.toFixed(2)}%</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Overdue Balances</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">${stats.overdueBalances.toLocaleString()}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul>
                        {stats.recentPayments.map(payment => (
                            <li key={payment.id} className="flex justify-between items-center py-1">
                                <span>{payment.tenantName}</span>
                                <span className="font-semibold">${payment.amount.toLocaleString()}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Tenants with Overdue Balances</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul>
                        {stats.overdueTenants.map(tenant => (
                             <li key={tenant.id} className="flex justify-between items-center py-1 border-b">
                                <div>
                                    <p className="font-semibold">{tenant.name}</p>
                                    <p className="text-sm text-gray-500">{tenant.propertyName} - {tenant.unitName}</p>
                                </div>
                                <span className="font-bold text-red-600">${tenant.balance.toLocaleString()}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Vacant Units</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul>
                        {stats.vacantUnits.map((unit, index) => (
                             <li key={unit.id || index} className="flex justify-between items-center py-1 border-b">
                                <div>
                                    <p className="font-semibold">{unit.name}</p>
                                    <p className="text-sm text-gray-500">{unit.propertyName}</p>
                                </div>
                                <Link href={`/tenants/add?propertyId=${unit.propertyId}&unitId=${unit.id || unit.name}&unitName=${unit.name}&propertyName=${unit.propertyName}`}>
                                    <Button size="sm">Add Tenant</Button>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>

        <div className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Overview (Last 6 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#8884d8" name="Monthly Revenue" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
