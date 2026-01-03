# Property Management App Blueprint

## Overview

A comprehensive property management application for landlords in Uganda. It allows users to manage their properties, tenants, and payments efficiently. The application is built with Next.js and Firebase, featuring a modern, responsive, and intuitive user interface that is optimized for mobile devices and installable as a Progressive Web App (PWA).

## Project Outline & Features

### Core Architecture
- **Framework:** Next.js (with App Router)
- **PWA Support:** `next-pwa` for service worker generation and offline capabilities.
- **Authentication:** Firebase Authentication
- **Database:** Cloud Firestore
- **Styling:** Tailwind CSS with shadcn/ui components.
- **State Management:** React Context (for Auth) and component-level state.
- **Deployment:** Firebase Hosting

### Implemented Features

#### 1. User Authentication
- **Sign-in/Sign-up:** Users can create an account and log in using email and password.
- **Authentication State:** The application maintains and provides authentication status throughout the components using a React Context (`AuthProvider`).
- **Protected Routes:** Pages like the dashboard, properties, and tenants are protected, redirecting unauthenticated users to the login page.

#### 2. Dashboard (`/dashboard`)
- **Central Hub:** Serves as the main landing page after login.
- **At-a-glance Information:** Displays key metrics and quick-access links to major sections of the application.
- **Responsive Design:** Adapts to various screen sizes.

#### 3. Property Management (`/properties`)
- **Responsive Layout:** Displays a data table on desktop and a card-based list on mobile.
- **CRUD Operations:** Create, Read, Update, and Delete properties.
- **Search:** Users can search for properties by name.

#### 4. Tenant Management (`/tenants`)
- **Responsive Layout:** Displays a data table on desktop and a card-based list on mobile.
- **CRUD Operations:** Create, Read, Update, and Delete tenants.
- **Search:** Users can search for tenants by name.

#### 5. Payment Management (`/payments`)
- **Responsive Layout:** Displays a data table on desktop and a card-based list on mobile.
- **CRUD Operations:** Create, Read, Update, and Delete payment records.
- **Search:** Users can search payments by tenant or property name.
- **Receipts:** Generate and view receipts for each payment.

#### 6. UI & Navigation
- **Responsive Navigation:** A persistent side navigation bar for desktop and a slide-in "sheet" menu for mobile, ensuring a great experience on all devices.
- **Header & Breadcrumbs:** A dynamic header displays the page title and breadcrumb navigation.
- **UI Components:** Utilizes `shadcn/ui` for a consistent and modern look and feel.
- **Notifications:** Uses `sonner` for user-friendly toast notifications.

## Current Task: Final Touches - Mobile Optimization & PWA

### Plan & Steps

#### Phase 1: Mobile-First Responsive UI
- **In Progress:** Overhaul the main layout and navigation to be fully responsive.
- **Next:** Refactor data-heavy pages (`properties`, `tenants`, `payments`) to use a card-based view on mobile screens.

#### Phase 2: PWA Implementation
- **Todo:** Install and configure the `next-pwa` package.
- **Todo:** Create a `manifest.json` file and add app icons.
- **Todo:** Update the root layout to enable PWA functionality.
