# AI Agent Handoff & Codebase Review Tracker

## Recent Changes & Active Tasks (This Session)
The user and I have been actively fixing UI and UX issues. Here is what has been accomplished recently and what remains pending:

**Completed Fixes Today:**
- Fixed the "Get App" button visibility on mobile browsers (removed `hidden sm:block` in `apps/web/src/components/layout/navbar.tsx`).
- Moved the "Get App" button to appear before the "Buy" link in the mobile navigation menu.
- Both changes were committed and pushed to `main`.

**PENDING BUGS / TASKS (High Priority):**
These were brought up by the user from a previous session and still need to be fixed in the mobile app (`apps/mobile`):
1. **Splash Screen:** At startup (1-2 seconds), the splash screen shows a blue background with the company logo that does not match the company style. (Need to check `apps/mobile/app.json` and adjust `expo-splash-screen` colors).
2. **Login Page:** There is no "Terms and Conditions" tick box on the login page.
3. **Keyboard Issues:** During user onboarding (specifically on the "Create Password" page), the keyboard acts abnormally: it comes up and hides the actual text box, or it doesn't dismiss properly when the user taps away.

---

**To the next AI Agent:**
The user has requested a comprehensive, line-by-line, easy-to-understand code review of the *entire* NestaraEstates codebase. Because the codebase is massive, this task must be completed iteratively across multiple sessions. 

Your objective is to pick up where the last agent left off, create a detailed markdown document (artifact) explaining the next batch of files, and then update this tracker document.

## Goal
Provide a detailed code review document explaining exactly what each line of code does, how it works, and where it connects to the rest of the application.

## Progress Tracker

- [x] **Web App Core Routing & Layout** (`apps/web/src/app/layout.tsx`, `apps/web/src/app/page.tsx`)
    *   *Status:* Completed by previous agent.
- [ ] **Web App Authentication & Authorization** (`apps/web/src/app/(auth)/*`, `apps/web/src/app/api/auth/*`)
    *   *Status:* **PENDING (Next Step)**
- [ ] **Web App Dashboard & User Profile** (`apps/web/src/app/dashboard/*`, profile components)
    *   *Status:* PENDING
- [ ] **Web App Property Listing & Search** (`apps/web/src/app/property/*`, `apps/web/src/app/buy/*`, search components)
    *   *Status:* PENDING
- [ ] **Mobile App Core & Navigation** (`apps/mobile/src/app/_layout.tsx`, `apps/mobile/src/app/index.tsx`)
    *   *Status:* PENDING
- [ ] **Mobile App Authentication** (`apps/mobile/src/app/(auth)/*`)
    *   *Status:* PENDING
- [ ] **Database & Supabase Config** (`packages/config/*`, SQL migrations, row level security)
    *   *Status:* PENDING
- [ ] **Admin Dashboard** (`apps/admin/*`)
    *   *Status:* PENDING

## Instructions for the Next Agent:
1. When the user asks to continue the code review, look at the **PENDING** tasks above.
2. Select the next logical chunk (e.g., Web App Authentication).
3. Read the relevant files in that section.
4. Generate a detailed, easy-to-understand markdown artifact (e.g., `Code_Review_Web_Auth.md`) explaining those files.
5. Update this `CODE_REVIEW_TRACKER.md` file by marking the section as completed (`[x]`) and adding the next pending sections if necessary.
6. Present the newly created artifact to the user and ask if they want to proceed to the next section.
