'use client';

import React from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import FinancialReportDocument from './FinancialReportDocument';
import { Payment } from '@/lib/types';

interface ReportClientProps {
    payments: Payment[];
    month: string;
    year: string;
}

export default function ReportClient({ payments, month, year }: ReportClientProps) {
    return (
        <div className="md:col-span-2 space-y-6">
            <div className="flex flex-row items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold">Report Preview</h3>
                <PDFDownloadLink
                    document={<FinancialReportDocument payments={payments} month={month} year={year} />}
                    fileName={`Report_${month}_${year}.pdf`}
                >
                    {({ blob, url, loading, error }) => (
                        <Button variant="outline" disabled={loading}>
                            <FileDown className="mr-2 h-4 w-4" />
                            {loading ? 'Preparing...' : 'Download PDF'}
                        </Button>
                    )}
                </PDFDownloadLink>
            </div>

            <div className="h-[600px] w-full border rounded-lg overflow-hidden shadow-inner bg-muted">
                <PDFViewer width="100%" height="100%" className="border-none">
                    <FinancialReportDocument payments={payments} month={month} year={year} />
                </PDFViewer>
            </div>
        </div>
    );
}
