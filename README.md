# Property Management Tool

## COMPANY PURPOSE
To design a tool that helps landlords simplify management of their properties.

## PROBLEM
Ugandans, who diversify Into real estate face significant challenges in management of their real estate portfolio since they run the business as a gig.
They therefore can't dedicate full time commitment to the properties yet they need to generate significant returns.
One of the major issues is in keeping track of payments with the different tenants and issuing receipts.
Companies which offer solutions currently focus on building costly tools,with lots of Features that barely address the problems of the consumer.

## SOLUTION
Our solution is to build a tool, that keeps tracks of all payments on the landlords end.
The display page will show the landlord how much money he's demanding a certain tenant.
It will also show totals of rent that have been collected per month, rent occupancy & vacancy.
The landlord will also be able to have payment history of the tenant.

The tool will be cheap, a one-off negotiable 500,000 payment followed by a 100,000 annual payment.

## TECH STACK
*   **FRAMEWORK** - a react next.js project
*   **CSS** - TAILWIND but i will use shadcn/ui
*   **Receipt generation** -- using HTML2PDF tool https://github.com/eKoopmans/html2pdf.js
*   **Frontend Hosting** - Vercel
*   **Database** - Firebase Firestore
*   **Auth** - Firebase Auth
*   **Storage** - Firebase Storage

## HOW THE APP WILL WORK?
Landlord
Dashboard: where they can add and view all their properties, track payments, print receipts

## WHY NOW?
The market for property management services exists and is largely untapped, there is no company that has a monopoly on the business in the residential market, This is an ideal time to solidify our position.

## MARKET POTENTIAL
Our customers are landlords in Uganda, we shall initially cater for the residential real estate space before developing solutions for the commercial real estate sector

## COMPETITION /ALTERNATIVES
All our competitors,with similar tools, don't even have more than 20 active customers.
Competitors include ; True Soil, Credo Mgt, Alinda, RentalLyk.

## BUSINESS MODEL
We shall run a low-cost, subscription model.
Clients pay a one-off followed by a regular yearly payment.

## DEPLOYMENT SETTINGS (VERCEL)

To deploy this application on Vercel, you must configure the following **Environment Variables** in your Vercel Project Settings. Ensure they match your Firebase configuration and importantly, **must start with `NEXT_PUBLIC_`** to be visible to the application in the browser.

| Variable Name | Description |
| :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your Firebase API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Your Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Your Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Your Firebase App ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Your Firebase Measurement ID |

> **Note:** Failed to include `NEXT_PUBLIC_` prefix on these variables will result in a blank screen or "Application error: a client-side exception has occurred" because the browser cannot access the configuration to initialize Firebase.
