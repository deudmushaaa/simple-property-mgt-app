'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Payment, Tenant, Property } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the entire ReportClient component with SSR disabled.
// This ensures @react-pdf/renderer is only ever loaded in the browser.
const ReportClient = dynamic(
    () => import('@/components/reports/ReportClient'),
    {
        ssr: false,
        loading: () => (
            <div className="md:col-span-2 h-[600px] flex items-center justify-center bg-muted border rounded-md">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Initializing Report Viewer...</p>
                </div>
            </div>
        ),
    }
);

export default function ReportsPage() {
    const { user } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const [generated, setGenerated] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Date Selection logic
    const currentYear = new Date().getFullYear();
    const [selectedMonth, setSelectedMonth] = useState<string>(
        new Date().toLocaleString('default', { month: 'long' })
    );
    const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const generateReport = async () => {
        if (!user) return;
        setLoading(true);
        setGenerated(false);

        try {
            const tenantsQuery = query(collection(db, 'tenants'), where('userId', '==', user.uid));
            const propertiesQuery = query(collection(db, 'properties'), where('userId', '==', user.uid));

            const [tenantsSnapshot, propertiesSnapshot] = await Promise.all([
                getDocs(tenantsQuery),
                getDocs(propertiesQuery)
            ]);

            const tenantsData = tenantsSnapshot.docs.reduce((acc, doc) => {
                acc[doc.id] = doc.data() as Tenant;
                return acc;
            }, {} as { [key: string]: Tenant });

            const propertiesData = propertiesSnapshot.docs.reduce((acc, doc) => {
                acc[doc.id] = doc.data() as Property;
                return acc;
            }, {} as { [key: string]: Property });

            const q = query(collection(db, 'payments'), where('userId', '==', user.uid));
            const snapshot = await getDocs(q);

            const monthIndex = months.indexOf(selectedMonth);
            const startOfPeriod = new Date(parseInt(selectedYear), monthIndex, 1);
            const endOfPeriod = new Date(parseInt(selectedYear), monthIndex + 1, 0, 23, 59, 59);

            const filteredPayments = snapshot.docs
                .map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        userId: data.userId || '',
                        tenantId: data.tenantId || '',
                        propertyId: data.propertyId || '',
                        unitId: data.unitId || '',
                        amount: data.amount || 0,
                        type: data.type || 'rent',
                        date: data.date instanceof Timestamp ? data.date : Timestamp.now(),
                        tenantName: tenantsData[data.tenantId]?.name || 'Unknown',
                        propertyName: propertiesData[data.propertyId]?.name || 'Unknown',
                        months: data.months || [],
                        receiptNumber: data.receiptNumber,
                        unitName: data.unitName,
                        balanceAfterPayment: data.balanceAfterPayment
                    } as Payment;
                })
                .filter(p => {
                    const paymentDate = p.date.toDate ? p.date.toDate() : new Date(p.date as any);
                    return paymentDate >= startOfPeriod && paymentDate <= endOfPeriod;
                });

            setPayments(filteredPayments);
            setGenerated(true);
        } catch (error) {
            console.error("Error generating report:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/payments">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">Financial Reports</h1>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Report Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Month</label>
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Year</label>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={generateReport} className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {loading ? 'Generating...' : 'Generate Report'}
                        </Button>
                    </CardContent>
                </Card>

                {generated && (
                    <ReportClient
                        payments={payments}
                        month={selectedMonth}
                        year={selectedYear}
                    />
                )}
            </div>
        </div>
    );
}
