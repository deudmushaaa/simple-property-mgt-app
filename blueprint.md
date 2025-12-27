# Property Management Tool

## Overview

A tool designed to help landlords in Uganda simplify the management of their properties. It addresses the challenges faced by individuals who manage real estate as a side business and cannot dedicate full-time commitment. The primary focus is on tracking tenant payments, issuing receipts, and providing an overview of the property's financial health.

## Project Outline

### Style and Design
*   **Framework:** Next.js with React
*   **Styling:** Tailwind CSS with shadcn/ui components.
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

## Current Plan: Project Setup

*   Create a comprehensive `README.md` file for the project.
*   Create a `.gitignore` file tailored for a Next.js project.
*   Configure the Firebase environment by updating `.idx/mcp.json`.
