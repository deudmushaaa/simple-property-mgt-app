# Karibu - Property Management SaaS

## Overview

Karibu is a comprehensive SaaS platform designed for property managers and landlords to streamline their operations. It offers a suite of tools to manage properties, tenants, leases, and maintenance requests in a single, intuitive dashboard.

## Design & Features

### Authentication

*   **Unified Auth Flow:** A centralized authentication component handles both user sign-in and sign-up, providing a consistent user experience.
*   **Email & Password:** Users can create an account and sign in using their email and a secure password (minimum 8 characters).
*   **Google Sign-In:** Seamless one-click sign-in and sign-up using Google accounts, leveraging Firebase Authentication's redirect flow to prevent popup blocker issues.
*   **Secure & Validated:** All authentication actions are validated against a schema to ensure data integrity.

### Dashboard & Navigation
*   **Streamlined Layout:** Simplified mobile and desktop navigation. Removed redundant branding and simplified access to key actions.
*   **Quick Actions:** Added "Record Payment" (Mobile) and "Add Receipt" (Desktop) buttons for quick access.

### Security & Permissions
*   **Role-Based Access (RBA):** Strict access control ensuring users can only manage their own Properties, Tenants, and Payments.
*   **Validation:** Secure Firestore rules enforcing ownership checks at the database level.

## Current Plan

**Objective:** Finalize production deployment and polish core features.

**Steps:**

1.  **DONE:** Rewrite `components/auth/user-auth-form.tsx` using Shadcn Form (`react-hook-form` + `zod`).
2.  **DONE:** Implement toggle between "Login" and "Sign Up" modes within the form.
3.  **DONE:** Integrate with Firebase Authentication (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`).
4.  **DONE:** Dashboard UI Polish (Removed "Karibu" title on mobile, updated button labels).
5.  **DONE:** Fix "Missing or insufficient permissions" error in Tenant creation.
6.  **DONE:** Fix Next.js 15 `useParams` Promise awaiting issues.
7.  **DONE:** Production Build & Vercel Deployment configuration (Environment Variables, ESLint rules).
37.  **DONE:** Implement "Rent Due Date" tracking system (DB update, UI for Add/Edit Tenant, Dashboard Overdue logic).
38.  **DONE:** Simplify Dashboard (Removed unnecessary stats, added UGX currency, Interactive Vacant Units).
39.  **DONE:** Implement Monthly Financial Reports (PDF generation via `@react-pdf/renderer`, interactive reports page with monthly filtering).
40.  **DONE:** Production Readiness & Robustness (Global Error Boundaries, Zod validation for all forms, Loading states for all submissions, Fixed legacy bugs in Edit pages).
41.  **DONE:** Production Deployment & PWA (Generated professional app icons, configured manifest.json, added iOS meta tags, and verified mobile install capability).