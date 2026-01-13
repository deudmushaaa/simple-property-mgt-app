'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import {
  CirclePlus,
  AlertCircle,
  Phone,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { useAuth } from '@/app/AuthProvider';
import { Tenant, Property } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

// Format currency to UGX
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface VacancyData {
  propertyName: string;
  vacantCount: number;
  totalUnits: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [overdueTenants, setOverdueTenants] = useState<Tenant[]>([]);
  const [vacancies, setVacancies] = useState<VacancyData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueData, setRevenueData] = useState<{ name: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;

      try {
        // 1. Fetch Tenants
        const tenantsQuery = query(collection(db, 'tenants'), where('userId', '==', user.uid));
        const tenantsSnapshot = await getDocs(tenantsQuery);
        const tenants = tenantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenant));

        // 2. Fetch Properties (for vacancies)
        const propsQuery = query(collection(db, 'properties'), where('userId', '==', user.uid));
        const propsSnapshot = await getDocs(propsQuery);
        const properties = propsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property & DocumentData));

        // 3. Fetch Payments (for revenue)
        const paymentsQuery = query(collection(db, 'payments'), where('userId', '==', user.uid));
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const payments = paymentsSnapshot.docs.map(doc => doc.data());

        // --- Logic: Overdue Tenants ---
        const today = new Date();
        const currentMonthStr = today.toLocaleString('default', { month: 'long' });

        // Filter payments for current month to check status
        const currentMonthPayments = payments.filter((p: any) =>
          p.months && p.months.includes(currentMonthStr)
        );
        const paidTenantIds = new Set(currentMonthPayments.map((p: any) => p.tenantId));

        const overdue = tenants.filter(tenant => {
          const dueDay = tenant.dueDay || 1;
          const isPastDue = today.getDate() > dueDay;
          return isPastDue && !paidTenantIds.has(tenant.id);
        });
        setOverdueTenants(overdue);

        // --- Logic: Vacant Units ---
        const vacancyList: VacancyData[] = [];
        properties.forEach(prop => {
          const propUnits = prop.units || [];
          if (propUnits.length > 0) {
            const occupiedUnitsInProp = tenants
              .filter(t => t.propertyId === prop.id)
              .map(t => t.unitName);

            const vacantCount = propUnits.length - occupiedUnitsInProp.length;
            if (vacantCount > 0) {
              vacancyList.push({
                propertyName: prop.name,
                vacantCount: vacantCount,
                totalUnits: propUnits.length
              });
            }
          }
        });
        setVacancies(vacancyList);

        // --- Logic: Total Revenue (All Time) ---
        const total = payments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
        setTotalRevenue(total);

        // --- Logic: Revenue Chart (Last 6 Months) ---
        // Sample Data Structure with UGX context.
        setRevenueData([
          { name: 'Jan', revenue: 4000000 },
          { name: 'Feb', revenue: 3000000 },
          { name: 'Mar', revenue: 5000000 },
          { name: 'Apr', revenue: 4500000 },
          { name: 'May', revenue: 6000000 },
          { name: 'Jun', revenue: 5500000 },
        ]);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hey there!</h1>
        <div className="flex gap-2">
          <Button asChild className="md:hidden">
            <Link href="/payments/add">
              <CirclePlus className="mr-2 h-4 w-4" />
              Record Payment
            </Link>
          </Button>
          <Button asChild className="hidden md:inline-flex">
            <Link href="/payments/add">
              <CirclePlus className="mr-2 h-4 w-4" />
              Add Receipt
            </Link>
          </Button>
          <Link
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3"
            data-size="default"
            data-slot="button"
            data-variant="default"
            href="/properties/add"
          >
            <CirclePlus className="mr-2 h-4 w-4" />
            Add Property
          </Link>
        </div>
      </div>

      {/* Overdue Tenants and Vacant Units */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Tenants with Overdue Balances
              {overdueTenants.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {overdueTenants.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : overdueTenants.length === 0 ? (
              <p className="text-sm text-gray-500">No overdue tenants found. Great job!</p>
            ) : (
              <ul className="space-y-4">
                {overdueTenants.map((tenant) => {
                  const daysLate = new Date().getDate() - (tenant.dueDay || 1);
                  return (
                    <li key={tenant.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-sm text-gray-500">
                          Unit: {tenant.unitName || 'N/A'} • Due: Day {tenant.dueDay || 1}
                        </p>
                        <p className="text-xs text-red-500 flex items-center mt-1">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {daysLate} day{daysLate !== 1 ? 's' : ''} late
                        </p>
                      </div>
                      {tenant.phone && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={`tel:${tenant.phone}`}>
                            <Phone className="w-3 h-3 mr-1" />
                            Call
                          </a>
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Vacant Units */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Vacant Units
              {vacancies.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {vacancies.reduce((a, b) => a + b.vacantCount, 0)} Total
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : vacancies.length === 0 ? (
              <p className="text-sm text-gray-500">All properties are fully occupied!</p>
            ) : (
              <ul className="space-y-3">
                {vacancies.map((item, index) => (
                  <li key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">{item.propertyName}</span>
                    <Badge>
                      {item.vacantCount} / {item.totalUnits} Units Vacant
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">All time earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Overview Chart */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <BarChart data={revenueData}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `UGX ${(value / 1000000).toFixed(1)}M`} />
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                  cursor={{ fill: 'transparent' }}
                />
                <Legend />
                <Bar
                  dataKey="revenue"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}