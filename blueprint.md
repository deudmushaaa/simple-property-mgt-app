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
- **Deployment:** Vercel
- **PWA:** Enabled with `next-pwa` for a native-like experience.
- **Scheduled Tasks:** Vercel Cron Jobs

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

#### 6. Automated Notifications
- **Overdue Balances:** A Vercel Cron Job runs daily to check for tenants with overdue balances.
- **Push Notifications:** If overdue balances are found, the system sends a push notification to the landlord via Firebase Cloud Messaging.

#### 7. UI & Navigation
- **Dual Navigation System:**
    - **Desktop:** A persistent side navigation bar for larger screens.
    - **Mobile:** A touch-friendly bottom navigation bar for smaller screens.
- **Header & Breadcrumbs:** A dynamic header displays the title of the current page and provides breadcrumb navigation.
- **UI Components:** Utilizes `shadcn/ui` for a consistent and modern look and feel.
- **Notifications:** Uses `sonner` to provide user-friendly toast notifications.
- **Responsive Layout:** The entire application is designed to be responsive and work seamlessly on both desktop and mobile devices.

#### 8. Progressive Web App (PWA)
- **Installable:** Users can install the application on their home screen for easy access.
- **Offline Access:** The application caches assets for offline use, ensuring a reliable experience even with a poor connection.
- **Native-like Experience:** Provides a full-screen, standalone experience that feels like a native app.

