# Property Management Tool

## Overview

A tool designed to help landlords in Uganda simplify the management of their properties. It addresses the challenges faced by individuals who manage real estate as a side business and cannot dedicate full-time commitment. The primary focus is on tracking tenant payments, issuing receipts, and providing an overview of the property's financial health.

## Project Outline

### Style and Design
*   **Framework:** Next.js with React
*   **Styling:** Tailwind CSS with shadcn/ui components (slate theme).
*   **Visual Design:** Modern, clean, and intuitive user interface. Mobile responsive. Will use modern iconography, typography, and a vibrant color palette.

### Features
*   **Landlord Dashboard:**
    *   Add and view properties.
    *   Track payments from tenants.
    *   View payment history for each tenant.
    *   Generate and print receipts for tenants.
    *   Dashboard view of total rent collected per month.
    *   Display of rent occupancy and vacancy rates.
*   **Authentication:** Firebase Auth for landlord login.
*   **Database:** Firebase Firestore to store property, tenant, and payment information.
*   **Storage:** Firebase Storage for any file uploads (e.g., lease agreements).
*   **Receipt Generation:** Using html2pdf.js to generate PDF receipts from HTML.

## Current Plan: Build out the Properties Page

*   **Add shadcn/ui components:** Add `Table`, `Button`, `Card`, `Dialog`, `Input`, and `Label` components to the project.
*   **Build Properties Page UI:** Create a table to display a list of properties with placeholder data. Add an "Add Property" button that will open a dialog to add a new property.
*   **Create Add Property Dialog:** Design the form within the dialog to capture details for a new property, such as property name, location, and rent amount.
