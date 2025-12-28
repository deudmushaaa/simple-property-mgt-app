### Project Overview

This project is a property management application called Karibu. It allows landlords to manage their tenants, rental units, and payments. The application is built with Next.js and Firebase, and it features a modern, user-friendly interface.

### Implemented Features

*   **Authentication:** Users can sign in to the application using their email and password. The application uses Firebase Authentication to manage user accounts.
*   **Dashboard:** The main dashboard provides a summary of the number of tenants, units, and total payments.
*   **Tenants:** Landlords can add, view, edit, and delete tenants.
*   **Units:** Landlords can add, view, edit, and delete rental units.
*   **Payments:** Landlords can record payments from tenants. The application automatically generates a receipt number for each payment.

### Design and Styling

The application uses the following design and styling elements:

*   **CSS Framework:** Tailwind CSS
*   **UI Components:** The application uses a custom set of UI components, including buttons, cards, dialogs, inputs, labels, selects, sheets, and tables.
*   **Icons:** The application uses icons from the `lucide-react` library.

### Project Structure

The project follows a standard Next.js project structure:

*   `app/`: Contains the application's routes and pages.
*   `components/`: Contains the application's UI components.
*   `lib/`: Contains the application's utility functions and libraries.

### Current Plan

I am currently in the process of refactoring the application to improve its structure and functionality. I have already completed the following tasks:

*   Deleted the old `landlords` and `buildings` pages.
*   Created new `tenants` and `units` pages.
*   Updated the navigation to reflect the new page structure.
*   Created a new `payments` page.
*   Updated the main dashboard.

My next step is to add a table to the `payments` page to display a list of all payments that have been recorded.