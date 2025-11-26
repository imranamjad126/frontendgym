# Tasks: Gym Membership Management System

**Input**: Design documents from `/specs/001-gym-membership-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Tests are OPTIONAL - not requested in specification, so no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Next.js App Router structure with `app/` and `components/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create Next.js project structure with App Router (app/, components/, lib/, hooks/, data/ directories)
- [x] T002 Initialize Next.js 14+ project with TypeScript strict mode in root directory
- [x] T003 [P] Configure Tailwind CSS 3.x with custom color palette (white, navy, soft gray) in tailwind.config.ts
- [x] T004 [P] Initialize shadcn/ui component library with npx shadcn-ui@latest init
- [x] T005 [P] Install lucide-react package for icons
- [x] T006 [P] Install shadcn/ui components: button, input, card, badge, alert, dialog, table, form
- [x] T007 Create global styles file with design system (rounded-xl, soft shadows, spacing) in app/globals.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 [P] Create Member type definition with id, name, email, phone, feePaidDate, expiryDate, createdAt, updatedAt in lib/types/member.ts
- [x] T009 [P] Create AttendanceRecord type definition with id, memberId, checkInTime, date in lib/types/attendance.ts
- [x] T010 [P] Create MembershipStatus enum (ACTIVE, EXPIRING, EXPIRED) in lib/types/status.ts
- [x] T011 [P] Create Notification type definition with memberId, memberName, status, expiryDate, daysUntilExpiry in lib/types/notification.ts
- [x] T012 [P] Create localStorage wrapper with get, set, remove functions and error handling in lib/storage/localStorage.ts
- [x] T013 [P] Create storage key constants (gym_members, gym_attendance) in lib/storage/storageKeys.ts
- [x] T014 [P] Create memberStorage module with CRUD operations (saveMember, getMember, getAllMembers, updateMember, deleteMember) in lib/storage/memberStorage.ts
- [x] T015 [P] Create attendanceStorage module with operations (saveAttendance, getMemberAttendance, getRecentAttendance) in lib/storage/attendanceStorage.ts
- [x] T016 [P] Create ID generator utility for sequential member IDs and unique attendance IDs in lib/utils/idGenerator.ts
- [x] T017 [P] Create status calculation utility with calculateMembershipStatus, isExpiring, isExpired, daysUntilExpiry functions in lib/utils/status.ts
- [x] T018 [P] Create search utility with searchMembers function (case-insensitive partial name match, exact ID match) in lib/utils/search.ts
- [x] T019 [P] Create validation utility with validateMemberForm, validateEmail, validatePhone, validateDateRange functions in lib/utils/validation.ts
- [x] T020 [P] Create notifications utility with getExpiringMembers, getExpiredMembers, createNotification, sortNotificationsByExpiry functions in lib/utils/notifications.ts
- [x] T021 Create seed data generator with 10-15 sample members (mix of ACTIVE, EXPIRING, EXPIRED) and sample attendance records in data/seed.ts
- [x] T022 Create useLocalStorage custom hook for generic localStorage operations in hooks/useLocalStorage.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View and Manage Members (Priority: P1) 🎯 MVP

**Goal**: Display all members in a list with their membership status (ACTIVE, EXPIRING, EXPIRED) so administrators can quickly see who is active, expiring, or expired.

**Independent Test**: Navigate to the members list page and verify that all members are displayed with correct status indicators (ACTIVE, EXPIRING, EXPIRED) based on their fee expiry dates. The page should be fully functional with dummy data.

### Implementation for User Story 1

- [x] T023 [P] [US1] Create useMembers custom hook to fetch and manage members list in hooks/useMembers.ts
- [x] T024 [P] [US1] Create StatusBadge component with visual indicators for ACTIVE, EXPIRING, EXPIRED in components/status/StatusBadge.tsx
- [x] T025 [P] [US1] Create StatusIcon component with lucide-react icons for each status type in components/status/StatusIcon.tsx
- [x] T026 [P] [US1] Create MemberCard component to display individual member with name, status, expiry date in components/members/MemberCard.tsx
- [x] T027 [US1] Create MemberList component to display table/list of all members with status badges in components/members/MemberList.tsx
- [x] T028 [US1] Create members list page that loads members from localStorage and displays them in app/members/page.tsx
- [x] T029 [US1] Add navigation link to members list in sidebar navigation component

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Administrators can view all members with correct status indicators.

---

## Phase 4: User Story 2 - Register New Members (Priority: P1)

**Goal**: Allow administrators to register new members with personal information and initial membership fee details, so they can add members to the system and start tracking their membership.

**Independent Test**: Navigate to the add member page, fill out the registration form with member details and fee information, submit the form, and verify the new member appears in the members list with correct status.

### Implementation for User Story 2

- [x] T030 [P] [US2] Create MemberForm component with fields for name, email, phone, feePaidDate, expiryDate in components/members/MemberForm.tsx
- [x] T031 [US2] Add form validation to MemberForm with inline error messages for required fields in components/members/MemberForm.tsx
- [x] T032 [US2] Add status preview calculation in MemberForm that shows ACTIVE/EXPIRING/EXPIRED when expiry date changes in components/members/MemberForm.tsx
- [x] T033 [US2] Create add member page with MemberForm component in app/members/new/page.tsx
- [x] T034 [US2] Implement form submission handler that generates member ID, saves to localStorage, and redirects to members list in app/members/new/page.tsx
- [x] T035 [US2] Add navigation link to add member page in sidebar navigation component

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Administrators can view members and register new members.

---

## Phase 5: User Story 3 - View Member Details (Priority: P2)

**Goal**: Display detailed information about a specific member including their membership history, fee payment records, and attendance, so administrators can manage their account effectively.

**Independent Test**: Navigate to a member's detail page from the members list and verify all member information, fee history, and membership status are displayed correctly.

### Implementation for User Story 3

- [x] T036 [P] [US3] Create useMember custom hook to fetch single member by ID in hooks/useMember.ts
- [x] T037 [P] [US3] Create useAttendance custom hook to fetch attendance records for a member in hooks/useAttendance.ts
- [x] T038 [P] [US3] Create MemberDetailView component to display full member profile information in components/members/MemberDetailView.tsx
- [x] T039 [P] [US3] Create AttendanceHistory component to display recent attendance records (last 30 days or last 10 records) in components/attendance/AttendanceHistory.tsx
- [x] T040 [P] [US3] Create MemberEditForm component for inline editing of member details in components/members/MemberEditForm.tsx
- [x] T041 [US3] Create ExpiryWarning component to display prominent notification for expiring memberships in components/status/ExpiryWarning.tsx
- [x] T042 [US3] Create member detail page with dynamic route [id] that loads member and attendance data in app/members/[id]/page.tsx
- [x] T043 [US3] Add edit functionality to member detail page that updates member in localStorage in app/members/[id]/page.tsx
- [x] T044 [US3] Add click handler to MemberCard and MemberList to navigate to member detail page

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Administrators can view members, register new members, and view/edit member details.

---

## Phase 6: User Story 4 - Track Member Attendance (Priority: P2)

**Goal**: Record member attendance when they check in at the gym, so administrators can track member activity and ensure only active members can access the facility.

**Independent Test**: Navigate to the attendance clock-in page, search for a member, and successfully record their attendance. The system should validate membership status before allowing check-in.

### Implementation for User Story 4

- [x] T045 [P] [US4] Create MemberSearchBar component with search input for name/ID in components/attendance/MemberSearchBar.tsx
- [x] T046 [P] [US4] Create MemberSearchResults component to display search results with member status in components/attendance/MemberSearchResults.tsx
- [x] T047 [P] [US4] Create CheckInButton component with status validation logic in components/attendance/CheckInButton.tsx
- [x] T048 [P] [US4] Create CheckInConfirmation component to display success/error messages in components/attendance/CheckInConfirmation.tsx
- [x] T049 [US4] Create ClockInInterface component that combines search, results, and check-in functionality in components/attendance/ClockInInterface.tsx
- [x] T050 [US4] Implement search functionality with case-insensitive partial name match and exact ID match in ClockInInterface
- [x] T051 [US4] Implement check-in validation that prevents EXPIRED members and allows ACTIVE/EXPIRING with warnings in ClockInInterface
- [x] T052 [US4] Create attendance clock-in page with ClockInInterface component in app/attendance/page.tsx
- [x] T053 [US4] Add navigation link to attendance page in sidebar navigation component

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 4 should all work independently. Administrators can view members, register members, view details, and track attendance.

---

## Phase 7: User Story 5 - Monitor Fee Expiry and Notifications (Priority: P3)

**Goal**: Display notifications about memberships that are expiring soon or have expired, so administrators can proactively contact members and manage renewals.

**Independent Test**: View the dashboard or notifications UI and verify that members with expiring or expired memberships are prominently displayed with appropriate alerts.

### Implementation for User Story 5

- [x] T054 [P] [US5] Create useNotifications custom hook to fetch expiring and expired members in hooks/useNotifications.ts
- [x] T055 [P] [US5] Create NotificationCard component to display individual notification with member info and expiry details in components/dashboard/NotificationCard.tsx
- [x] T056 [US5] Create NotificationsPanel component to display list of notifications sorted by expiry date (soonest first) in components/dashboard/NotificationsPanel.tsx
- [x] T057 [US5] Add click handler to NotificationCard to navigate to member detail page
- [x] T058 [US5] Add empty state message to NotificationsPanel when no expiring/expired memberships exist

**Checkpoint**: At this point, User Stories 1-5 should all work independently. Administrators can view members, register members, view details, track attendance, and see notifications.

---

## Phase 8: User Story 6 - Access Admin Dashboard (Priority: P3)

**Goal**: Provide a dashboard with overview of key metrics, recent activity, and quick access to common tasks, so administrators can efficiently manage gym operations.

**Independent Test**: Navigate to the dashboard and verify that key metrics (total members, active/expiring/expired counts), recent activity, and navigation to main features are displayed correctly.

### Implementation for User Story 6

- [x] T059 [P] [US6] Create DashboardStats component with statistics cards (total, active, expiring, expired counts) in components/dashboard/DashboardStats.tsx
- [x] T060 [P] [US6] Create QuickActions component with navigation buttons to members list, add member, attendance pages in components/dashboard/QuickActions.tsx
- [x] T061 [US6] Create dashboard page that loads members, calculates statistics, and displays dashboard components in app/(dashboard)/page.tsx
- [x] T062 [US6] Integrate NotificationsPanel into dashboard page
- [x] T063 [US6] Add navigation link to dashboard in sidebar navigation component

**Checkpoint**: All user stories should now be independently functional. The complete system is ready for use.

---

## Phase 9: Layout & Navigation

**Purpose**: Create shared layout and navigation infrastructure

- [x] T064 [P] Create Sidebar component with navigation menu items (dashboard, members, add member, attendance) in components/layout/Sidebar.tsx
- [x] T065 [P] Create Header component with minimal top header and branding in components/layout/Header.tsx
- [x] T066 [P] Create Navigation component for navigation links with active state highlighting in components/layout/Navigation.tsx
- [x] T067 Create Layout component that combines Sidebar, Header, and content area with responsive design in components/layout/Layout.tsx
- [x] T068 Create root layout with Layout wrapper and global styles in app/layout.tsx
- [x] T069 Add responsive behavior to Sidebar (collapses on mobile, expands on desktop)
- [x] T070 Apply design system styling (rounded-xl cards, soft shadows, perfect spacing) to all layout components

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T071 [P] Add responsive design to all pages (mobile 320px+, desktop 1280px+)
- [x] T072 [P] Apply color palette (white, navy, soft gray) consistently across all components
- [x] T073 [P] Add loading states to all data-fetching operations
- [x] T074 [P] Add error handling for localStorage quota exceeded scenarios
- [x] T075 [P] Add empty state messages to all list views (no members, no attendance, etc.)
- [x] T076 Implement auto-seed functionality that loads dummy data if localStorage is empty on first app load
- [x] T077 Add form validation error messages with user-friendly text
- [x] T078 Add success/error toast notifications for member operations (create, update, delete)
- [x] T079 Optimize status calculation to recalculate in real-time on all member displays
- [x] T080 Add keyboard navigation support for accessibility
- [x] T081 Test all pages on mobile devices (320px, 375px, 414px) and desktop (1280px, 1920px)
- [x] T082 Validate all edge cases (expiry date exactly today, very old dates, empty lists, etc.)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **Layout & Navigation (Phase 9)**: Can be done in parallel with user stories, but needed for complete experience
- **User Stories (Phases 3-8)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed) after Phase 2
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Uses members from US1/US2 but independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Uses members from US1/US2 but independently testable
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Uses members from US1/US2 but independently testable
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Uses members and notifications but independently testable

### Within Each User Story

- Types/utilities before components
- Components before pages
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members
- Layout & Navigation (Phase 9) can be done in parallel with user stories

---

## Parallel Example: User Story 1

```bash
# Launch all components for User Story 1 together:
Task: "Create StatusBadge component in components/status/StatusBadge.tsx"
Task: "Create StatusIcon component in components/status/StatusIcon.tsx"
Task: "Create MemberCard component in components/members/MemberCard.tsx"
Task: "Create useMembers hook in hooks/useMembers.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 9: Layout & Navigation (for basic navigation)
4. Complete Phase 3: User Story 1 (View Members)
5. Complete Phase 4: User Story 2 (Register Members)
6. **STOP and VALIDATE**: Test User Stories 1 & 2 independently
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add Layout & Navigation → Basic navigation available
3. Add User Story 1 → Test independently → Deploy/Demo (View Members)
4. Add User Story 2 → Test independently → Deploy/Demo (Register Members - MVP!)
5. Add User Story 3 → Test independently → Deploy/Demo (Member Details)
6. Add User Story 4 → Test independently → Deploy/Demo (Attendance)
7. Add User Story 5 → Test independently → Deploy/Demo (Notifications)
8. Add User Story 6 → Test independently → Deploy/Demo (Dashboard)
9. Add Polish → Final polish and optimization
10. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (View Members)
   - Developer B: User Story 2 (Register Members)
   - Developer C: Layout & Navigation
3. Next iteration:
   - Developer A: User Story 3 (Member Details)
   - Developer B: User Story 4 (Attendance)
   - Developer C: User Story 5 (Notifications)
4. Final iteration:
   - Developer A: User Story 6 (Dashboard)
   - Developer B: Polish & Cross-Cutting
   - Developer C: Testing & Validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All components must use shadcn/ui base components
- All icons must use lucide-react
- All styling must use Tailwind CSS with design system (rounded-xl, soft shadows, white/navy/gray palette)
- All code must be TypeScript with proper type definitions

