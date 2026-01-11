'use client'

import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Payment } from '@/lib/types';

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  if (typeof amount !== 'number') {
    return '0.00';
  }
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Helper function to format dates safely
const formatDate = (date: any): string => {
    // Handle Firestore Timestamp
    if (date && typeof date.toDate === 'function') {
        const d = date.toDate();
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }
    // Handle native Date object or string
    try {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return 'Invalid Date';
    }
}

// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    padding: 30,
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#1a202c',
    paddingBottom: 5,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  subtitle: {
    fontSize: 10,
    color: '#718096',
  },
  receiptInfo: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'right',
  },
  billedTo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  billedToText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  billedToInfo: {
    fontSize: 10,
    color: '#718096',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 1,
    alignItems: 'center',
    height: 30,
  },
  tableHeader: {
    backgroundColor: '#f7fafc',
    height: 35,
  },
  tableColHeader: {
    width: '70%',
    padding: 8,
    fontWeight: 'bold',
  },
  tableCol: {
    width: '70%',
    padding: 8,
  },
  tableColAmountHeader: {
    width: '30%',
    padding: 8,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  tableColAmount: {
    width: '30%',
    padding: 8,
    textAlign: 'right',
  },
  summary: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontWeight: 'bold',
  },
  total: {
    borderTopWidth: 2,
    borderTopColor: '#1a202c',
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#718096',
  },
  // Style for the new row as per mentor's advice
  paymentPeriodRow: {
      flexDirection: 'row',
      borderBottomColor: '#e2e8f0',
      borderBottomWidth: 1,
      alignItems: 'center',
      height: 30,
      backgroundColor: '#f7fafc', // Light background to stand out
  },
  paymentPeriodLabel: {
      width: '70%',
      padding: 8,
      fontWeight: 'bold',
  },
  paymentPeriodValue: {
      width: '30%',
      padding: 8,
      textAlign: 'right',
      fontSize: 10,
  }
});

const ReceiptDocument = ({ payment }: { payment: Payment }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Senra Technologies</Text>
          <Text style={styles.subtitle}>Simplified Property Management</Text>
        </View>
        <View>
          <Text style={styles.title}>Receipt</Text>
          <Text style={styles.receiptInfo}>#{payment.receiptNumber || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.billedTo}>
        <View>
          <Text style={styles.billedToText}>Billed To</Text>
          <Text>{payment.tenantName}</Text>
          <Text style={styles.billedToInfo}>{payment.propertyName} - {payment.unitName}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.billedToText}>Payment Date</Text>
          <Text>{formatDate(payment.date)}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableColHeader}>Description</Text>
          <Text style={styles.tableColAmountHeader}>Amount</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCol}>{payment.type} Payment</Text>
          <Text style={styles.tableColAmount}>UGX {formatCurrency(payment.amount)}</Text>
        </View>

        {/* Mentor's suggestion implemented here */}
        <View style={styles.paymentPeriodRow}>
          <Text style={styles.paymentPeriodLabel}>Payment Period:</Text>
          <Text style={styles.paymentPeriodValue}>
            {payment.months && payment.months.length > 0
              ? payment.months.join(', ')
              : 'Not specified'}
          </Text>
        </View>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount Paid</Text>
          <Text>UGX {formatCurrency(payment.amount)}</Text>
        </View>
        <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Remaining Balance</Text>
            <Text>UGX {formatCurrency(payment.balanceAfterPayment ?? 0)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.total]}>
          <Text style={styles.totalLabel}>Total Paid</Text>
          <Text style={styles.totalLabel}>UGX {formatCurrency(payment.amount)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Thank you for your payment!</Text>
        <Text>Generated by Senra</Text>
      </View>
    </Page>
  </Document>
);

export default ReceiptDocument;
