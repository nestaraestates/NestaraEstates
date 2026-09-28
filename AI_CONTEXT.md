# AI Context & Session Memory

## Project State: Nestara Estates (Monorepo: Expo + Next.js + Supabase)

### Recent Accomplishments (Latest Session)
1. **Push Notifications (Native)**: 
   - Successfully wired up OS-level Expo Push Notifications.
   - Built a Supabase Edge Function (`send-push-notification`) to hit the Expo Push API.
   - Set up `pg_net` database webhooks and triggers to automatically fire pushes when new rows are added to the `notifications` table.

2. **Permissions Gate**:
   - Built a sleek `PermissionsGate.tsx` modal for first-time app launches.
   - Elegantly asks for Location, Media Library, and Push Notification permissions sequentially.

3. **Dark Mode Implementation**:
   - Added NativeWind `dark:` variants across all 31+ screens in the mobile app.
   - Wired up the toggle in the App Settings screen (`app-settings.tsx`) using `useColorScheme`.

4. **Web Downloads Page**:
   - Created a public, unauthenticated marketing page at `apps/web/src/app/downloads/page.tsx`.
   - Directed the "Get App" navbar and mobile menu links to this landing page.
   - Explains native advantages (Speed, Push, Camera) and links directly to the `.apk` GitHub release.

5. **Build & Infrastructure Fixes**:
   - Fixed a local Gradle build crash by bumping `react-native-worklets` to `^0.13.0` (resolving an incompatibility with `react-native-reanimated@4.7.0`).
   - Fixed a Vercel build failure where a stray `apps/web/package-lock.json` caused Vercel to run `npm install` instead of `pnpm`, breaking module hoisting.

### Next Steps / Pending Features
- **Google Authentication**: The `signInWithGoogle` function in the mobile app is fully implemented in the code, but requires ensuring Google Cloud Client IDs are perfectly wired in Supabase production to function flawlessly.
- **Testing**: Ensure the APK is thoroughly tested on a physical device for the Push Notification and Dark Mode flows.
