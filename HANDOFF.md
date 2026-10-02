# Nestara Estates - Project Handoff & Architecture Update
**Last Updated:** October 2, 2026

This document outlines the major architectural updates, features, and fixes implemented in the latest development phase.

## 1. Automated Database Maintenance (Supabase)
* **7-Day Grace Period System:** Implemented a `pg_cron` scheduled sweeper that automatically deletes properties from the database exactly 7 days after their status is changed to `SOLD`, `CLOSED`, or `DELETED`.
* **Automated Storage Cleanup:** Engineered a custom Postgres Trigger (`trigger_auto_delete_storage`) on the `property_media` table. When a property is deleted, this trigger reaches into the Supabase Storage bucket and permanently deletes the physical image files to save storage costs.
* **Cascade Cleanups:** Deleting a property or user automatically purges all related chats, messages, and favorites without breaking Foreign Key constraints.

## 2. Location & Search Architecture
* **Interactive Location Picker:** Built a full-screen, native map using `react-native-maps` and `expo-location`. Users can auto-detect their GPS location or manually drag a pin to select a search city.
* **Cross-Device Sync:** The selected location is cached instantly in `AsyncStorage` (for zero-latency UI updates) and securely synced to the `profiles.preferred_cities` array in Supabase.
* **Synchronized Radius Search:** The `explore.tsx` filter was re-architected. Instead of forcing physical GPS coordinates, the 10km/50km radius search now mathematically pivots around the user's *selected* map coordinates.

## 3. UI/UX & Formatting Overhaul
* **Smart Currency Badges:** Implemented real-time formatting across the Dashboard and Financial Calculators. Raw inputs (e.g., `5000000`) now render contextual "₹50 L" or "₹1.5 Cr" badges to prevent misreading large numbers.
* **Edge-to-Edge Headers:** Stripped out generic `SafeAreaView` wrappers on colored chat headers. Replaced with `useSafeAreaInsets()` math to allow the Amber/Emerald header colors to bleed beautifully into the iOS Notch and Android Status Bar.
* **Contextual Status Bar:** Replaced legacy `react-native` Status Bars with `expo-status-bar`. System icons (battery, time, wifi) now intelligently stay white on dark login screens, and instantly adapt to black when entering the light Dashboard.

## 4. Communication & Chat Features
* **Push Notifications Repaired:** Rewrote the Expo FCM V1 token synchronization. Created custom Supabase DB Triggers using the `pg_net` extension to properly fire push payloads via Edge Functions when messages are received.
* **Secure Chat Deletion:** Implemented a long-press deletion UI in the Inbox. Bound this action to a new Supabase RPC (`delete_chat_completely`) which safely bypasses RLS and Foreign Key constraints to wipe the chat room and all internal messages.

## 5. Settings & Polish
* **Developer Team Credits:** Designed and injected a premium credits card at the bottom of the App Settings page highlighting Vineeth B (Lead Developer) and Rakshith Gowda M K (Marketing & Partner), complete with native `Linking` routing for Email and Instagram.
* **Emergency SQL Documentation:** Generated a dedicated PDF and TXT cheat sheet (`Emergency_SQL_Commands.pdf`) containing rapid-response SQL queries for banning users, nuking spam accounts, and overriding the 7-day sweeper.

---
**Status:** All code compiles successfully with 0 TypeScript errors (`tsc --noEmit`). Project is 100% cleared for APK Release Build.
