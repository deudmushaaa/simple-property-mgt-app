# Karibu - Property Management SaaS

## Overview

Karibu is a comprehensive SaaS platform designed for property managers and landlords to streamline their operations. It offers a suite of tools to manage properties, tenants, leases, and maintenance requests in a single, intuitive dashboard.

## Design & Features

### Authentication

*   **Unified Auth Flow:** A centralized authentication component handles both user sign-in and sign-up, providing a consistent user experience.
*   **Email & Password:** Users can create an account and sign in using their email and a secure password (minimum 8 characters).
*   **Google Sign-In:** Seamless one-click sign-in and sign-up using Google accounts, leveraging Firebase Authentication's redirect flow to prevent popup blocker issues.
*   **Secure & Validated:** All authentication actions are validated against a schema to ensure data integrity.

### Dashboard

*   **Centralized Hub:** The main dashboard provides a high-level overview of the user's properties, tenant status, and recent activities.
*   **Responsive Design:** The application is fully responsive, ensuring a seamless experience on both desktop and mobile devices.

## Current Plan

**Objective:** Rebuild the user authentication form with a professional design and robust validation.

**Steps:**

1.  **DONE:** Rewrite `components/auth/user-auth-form.tsx` using Shadcn Form (`react-hook-form` + `zod`).
2.  **DONE:** Implement toggle between "Login" and "Sign Up" modes within the form.
3.  **DONE:** Integrate with Firebase Authentication (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`).
4.  **DONE:** Style with a professional consulting aesthetic using Tailwind CSS.
5.  **DONE:** Update `app/login/page.tsx` and `app/signup/page.tsx` to utilize the improved component properly.