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

### Data Structure

*   **`landlords` collection:**
    *   `name` (string)
    *   `email` (string)
    *   `phoneNumber` (string)
    *   `auth_uid` (string)
*   **`buildings` collection:**
    *   `name` (string)
    *   `address` (string)
    *   `landlordId` (string)
*   **`units` collection:**
    *   `unitNumber` (string)
    *   `buildingId` (string)
    *   `rent` (number)
    *   `tenantId` (string) (optional)
*   **`tenants` collection:**
    *   `name` (string)
    *   `email` (string)
    *   `phoneNumber` (string)
*   **`payments` collection:**
    *   `tenantId` (string)
    *   `unitId` (string)
    *   `amount` (number)
    *   `date` (timestamp)
    *   `receiptNumber` (string)

## Implementation Progress

### Phase 1: Foundational UI for Data Management (Completed)

*   **Created Pages:** Built dedicated pages for managing Landlords, Buildings, Units, Tenants, and Payments.
*   **Implemented UI:** Each page features a table to display data from the corresponding Firestore collection.
*   **Add Functionality:** Implemented a dialog form on each page to allow users to add new records.
*   **Navigation:** Updated the main navigation bar to provide easy access to all the new management pages.
*   **Connected to Firebase:** Established the connection between the UI and the Firestore database to create and read data.

### Phase 2: Refine CRUD Operations and Data Relationships (Completed)

*   **Enhanced CRUD:**
    *   Implemented **Edit** functionality for all management pages.
    *   Implemented **Delete** functionality for all management pages.
*   **Improved Data Display:**
    *   Modified tables to display human-readable names instead of IDs for related data.

### Phase 3: Nested and Dynamic Routing (Completed)

*   **Dynamic Routes:**
    *   Created dynamic routes to show details for a specific building (`buildings/[id]`).
    *   On a building's detail page, displayed a list of all units within that building.
    *   Created dynamic routes to show details for a specific unit (`units/[id]`).
    *   On a unit's detail page, displayed the assigned tenant's information.
*   **Enhanced Navigation:**
    *   Added links to the details pages from the main `buildings` and `units` tables.

### Phase 4: Authentication and Route Protection (Completed)

*   **Secure Routes:**
    *   Implemented user authentication using Firebase Auth.
    *   Created a login page for landlords at `app/login/page.tsx`.
    *   Protected all data management pages by creating a `withAuth` Higher-Order Component and applying it to the following pages, ensuring they are only accessible to authenticated users:
        - `app/landlords/page.tsx`
        - `app/buildings/page.tsx`
        - `app/units/page.tsx`
        - `app/tenants/page.tsx`
        - `app/payments/page.tsx`
        - `app/page.tsx` (Dashboard)
    *   Implemented sign-out functionality in the main navigation bar.
    *   The `withAuth` HOC uses the `useAuthState` hook for real-time authentication state tracking.
