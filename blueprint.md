# Property Management App Blueprint

## Overview

A comprehensive property management application for landlords in Uganda. It allows users to manage their properties, tenants, and payments efficiently. The application is built with Next.js and Firebase, featuring a modern, responsive, and intuitive user interface.

## Project Outline & Features

### Core Architecture
- **Framework:** Next.js (with App Router)
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
- **Property List:** Displays a table of all properties owned by the user.
- **CRUD Operations:**
    - **Create:** Users can add new properties with details like name and address.
    - **Read:** View a list of all properties.
    - **Update:** Edit existing property details.
    - **Delete:** Remove properties from the system.
- **Search:** Users can search for properties by name.
- **Navigation:** Links to view tenants for a specific property.

#### 4. Tenant Management (`/tenants`)
- **Tenant List:** Displays a table of all tenants. Can be filtered by property.
- **CRUD Operations:**
    - **Create:** Add new tenants and associate them with a property.
    - **Read:** View a list of all tenants or tenants for a specific property.
    - **Update:** Edit tenant details.
    - **Delete:** Remove tenants from the system.
- **Search:** Users can search for tenants by name.

#### 5. Payment Management (`/payments`)
- **Payment Records:** Displays a table of all recorded payments.
- **CRUD Operations:**
    - **Create:** Record new payments from tenants, specifying the amount, date, and type.
    - **Read:** View a history of all payments.
    - **Update:** Edit payment details.
    - **Delete:** Remove payment records.
- **Search:** Users can search payments by tenant or property name.
- **Receipts:** Generate and view receipts for each payment.

#### 6. UI & Navigation
- **Main Navigation:** A persistent side navigation bar (`Nav.tsx`) provides easy access to all main pages (Dashboard, Properties, Tenants, Payments, Settings).
- **Header & Breadcrumbs:** A dynamic header (`Header.tsx`) displays the title of the current page and provides breadcrumb navigation to show the user's current location within the app hierarchy. The breadcrumbs are built with a reusable UI component (`breadcrumb.tsx`).
- **UI Components:** Utilizes `shadcn/ui` for a consistent and modern look and feel, including components like `Card`, `Table`, `Button`, `Input`, and `DropdownMenu`.
- **Notifications:** Uses `sonner` to provide user-friendly toast notifications for actions like successful creation or deletion of records.
- **Responsive Layout:** The entire application is designed to be responsive and work seamlessly on both desktop and mobile devices.

## Current Task: Add Breadcrumb Navigation

### Plan & Steps
- **DONE:** Create a reusable `Breadcrumb` UI component in `components/ui/breadcrumb.tsx`.
- **DONE:** Modify the `Header.tsx` component to dynamically generate and display breadcrumbs based on the current URL path.
- **DONE:** Ensure the `Header` component is included in the main `app/layout.tsx` to display on all pages.
- **DONE:** Correct all cascading errors introduced during the initial failed implementation.
- **DONE:** Verify the application builds and runs without any linting or runtime errors.

