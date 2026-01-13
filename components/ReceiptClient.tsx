'use client';

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import ReceiptDocument from '@/components/ReceiptDocument';
import { Payment } from '@/lib/types';

interface ReceiptClientProps {
    payment: Payment;
}

export default function ReceiptClient({ payment }: ReceiptClientProps) {
    return (
        <PDFDownloadLink
            document={<ReceiptDocument payment={payment} />}
            fileName={`Receipt-${payment.receiptNumber || '000'}.pdf`}
        >
            {({ loading }) => (
                <Button disabled={loading} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    {loading ? 'Generating PDF...' : 'Download Receipt'}
                </Button>
            )}
        </PDFDownloadLink>
    );
}
