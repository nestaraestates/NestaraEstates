# Nestara Estates: Technical Onboarding & Architecture Guide

Welcome to the **Nestara Estates** engineering team! This document serves as the comprehensive technical manual for developers, employees, and stakeholders to understand how the platform works under the hood.

---

## 1. High-Level Architecture
Nestara Estates is a modern, full-stack real estate marketplace designed to eliminate middlemen by connecting verified property owners directly with buyers. 

The project is built as a **Monorepo** using **Turborepo**, which houses three distinct applications sharing the same unified backend.

### The Applications
1. **Web App (`apps/web`)**: A Next.js application for public users to browse properties, compare listings, and use financial tools.
2. **Admin Portal (`apps/admin`)**: A secured Next.js application for super-admins to manage users (suspend/ban), verify properties, and monitor platform health.
3. **Mobile App (`apps/mobile`)**: A cross-platform mobile application built with React Native and Expo, offering the exact same functionality as the web app but optimized for iOS and Android.

---

## 2. The Tech Stack
We use a cutting-edge JavaScript/TypeScript ecosystem for maximum performance and developer velocity.

* **Core Languages:** TypeScript, JavaScript, SQL
* **Frontend Frameworks:** Next.js 14+ (App Router), React Native (Expo)
* **Styling:** Tailwind CSS (v4) & NativeWind (for mobile)
* **Backend & Database:** Supabase (PostgreSQL)
* **Authentication:** Supabase Auth (Email/Password & Google OAuth)
* **Real-time:** Supabase Realtime (WebSockets)
* **Package Manager:** pnpm
* **Hosting / Deployment:** 
  * Web & Admin: Vercel
  * Mobile: EAS Build (Expo) / Local APK Generation
  * Codebase: GitHub (`nestaraestates/NestaraEstates`)

---

## 3. Database & Backend Logic (Supabase)
We do not use a traditional Node.js/Express backend. Instead, we use **Supabase**, which acts as our PostgreSQL database, authentication provider, and API layer.

### Core Tables
* `profiles`: Stores user data, phone numbers, onboarding status, and roles (`user` vs `admin`).
* `properties`: Stores all property listings, pricing, and verification status.
* `property_media`: Stores the URLs of images uploaded for each property.
* `enquiries`: Links a buyer to a property when they show interest.
* `messages`: Stores the real-time chat messages between buyers and sellers.

### Security (RLS)
The database is secured using **Row Level Security (RLS)** directly in PostgreSQL. This means the database itself verifies if a user is allowed to read or write data. For example, a user can only delete a property if `auth.uid() == property.seller_id`. 

---

## 4. Key Features & How They Work

### A. Authentication & Onboarding
* **Flow:** Users sign up via Email or Google.
* **Onboarding:** If a user signs up via Google, they bypass the password creation step. Our onboarding screens (`onboarding.tsx` and `OnboardingForm.tsx`) detect this via `app_metadata.providers` and explicitly force the user to create a password so they can log in normally later.

### B. Property Verification (Admin Portal)
* **Flow:** When a user lists a property, its `verification_status` defaults to `PENDING`.
* **Logic:** The property is hidden from the public explore page. Super-admins log into the Admin portal (`apps/admin`), review the title documents/tax receipts, and update the status to `VERIFIED`. Only then does it appear on the public feed.

### C. Real-Time Chat Engine
* **Flow:** Buyers and sellers can negotiate directly.
* **Logic:** When a message is sent, it is written to the `messages` table. We use `supabase.channel()` to listen to database `INSERT` events in real-time.
* **Optimistic UI:** To make the chat feel instantaneous, messages are rendered on the screen *before* they reach the server (using a `temp-id`). Once the server confirms the message, the UI quietly updates the ID to prevent double-messages.

### D. Financial Tools (Calculators)
* The platform includes EMI, ROI, and Rent vs. Buy calculators. These are entirely client-side JavaScript functions that dynamically calculate compound interest and rental yields based on the inputs provided by the user.

---

## 5. Repository Structure
When you clone the repository from GitHub, here is where everything is located:

```text
NestaraEstates/
├── apps/
│   ├── web/               # Next.js Public Facing Website
│   │   ├── src/app/       # Web Pages (Home, Login, Compare)
│   │   └── src/components/# Reusable UI Components
│   ├── admin/             # Next.js Internal Admin Portal
│   │   └── src/app/       # Admin routes (Management, CRM)
│   └── mobile/            # Expo React Native App
│       ├── src/app/       # Mobile Screens (Tabs, Chat)
│       └── android/       # Generated Native Android Code
├── packages/              # Shared configurations (ESLint, TSConfig)
├── package.json           # Root workspace config
└── pnpm-workspace.yaml    # Defines the monorepo structure
```

---

## 6. Local Development Guide

### Prerequisites
1. Install Node.js (v18+)
2. Install pnpm (`npm install -g pnpm`)

### Running the Project
1. Clone the repo: `git clone https://github.com/nestaraestates/NestaraEstates.git`
2. Install dependencies from the root:
   ```bash
   pnpm install
   ```
3. Start the Web and Admin servers:
   ```bash
   pnpm run dev
   ```
   * Web runs on `http://localhost:3000`
   * Admin runs on `http://localhost:3001`
4. Start the Mobile app (requires Expo Go app on your phone or an emulator):
   ```bash
   cd apps/mobile
   pnpm start
   ```

### Building the Mobile App (APK)
To generate a production `.apk` file for Android devices without using cloud builds:
```bash
cd apps/mobile/android
./gradlew assembleRelease
```
The file will be output to: `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`
