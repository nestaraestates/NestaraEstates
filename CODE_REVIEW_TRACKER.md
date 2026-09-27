# AI Agent Handoff & Codebase Review Tracker

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
