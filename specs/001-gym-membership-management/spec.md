# Feature Specification: Gym Membership Management System

**Feature Branch**: `001-gym-membership-management`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "You are an expert Frontend Architect, UI/UX designer, and Next.js + Tailwind + TypeScript + shadcn/ui specialist. Your job: Build a COMPLETE, PREMIUM, UNIQUE and FULLY STRUCTURED frontend for a GYM MEMBERSHIP MANAGEMENT SYSTEM. Build a Gym Membership Management frontend that includes: Member registration, Member listing, Fee management (fee paid date + expiry date), Auto status system (ACTIVE / EXPIRING / EXPIRED), Attendance clock-in screen, Member detail page, Clean admin dashboard layout, Notifications UI for fee expiry. No backend is required. Use dummy data or local state."

## Clarifications

### Session 2025-01-27

- Q: What specific contact details should be collected for members? → A: Email address and phone number (both required fields)
- Q: How should member unique identifiers be generated? → A: Auto-generated sequential numeric ID assigned upon member creation
- Q: How should expiry date exactly matching today be handled? → A: If expiry date is today or in the past, status is EXPIRED. If expiry date is within 3 days from today (including today if future), status is EXPIRING
- Q: How should members with no expiry date be handled? → A: Expiry date is required; form validation prevents submission without it
- Q: Should multiple attendance check-ins per day be allowed? → A: Yes, allow multiple check-ins per day (members may leave and return)
- Q: How should data persistence work without a backend? → A: Use browser localStorage to persist all member and attendance data across browser sessions
- Q: How should member search function in clock-in interface? → A: Case-insensitive partial match on member name, exact match on member ID
- Q: What member information should be editable? → A: All member personal details (name, email, phone) and fee information (fee paid date, expiry date) can be edited
- Q: How much attendance history should be displayed on member detail page? → A: Display recent attendance records (last 30 days or last 10 records, whichever provides more data)
- Q: How should errors and validation failures be handled? → A: Display user-friendly error messages inline for validation failures, and clear messages for invalid operations (e.g., attempting to check in expired members)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and Manage Members (Priority: P1)

As a gym administrator, I need to view all members in a list with their membership status, so I can quickly see who is active, expiring, or expired and take appropriate actions.

**Why this priority**: This is the core functionality - viewing members is the primary task administrators perform daily. Without this, the system cannot function.

**Independent Test**: Can be fully tested by navigating to the members list page and verifying that all members are displayed with correct status indicators (ACTIVE, EXPIRING, EXPIRED) based on their fee expiry dates. The page should be fully functional with dummy data.

**Acceptance Scenarios**:

1. **Given** I am on the members list page, **When** the page loads, **Then** I see all members displayed in a clean, organized list with their name, membership status, and expiry date
2. **Given** I am viewing the members list, **When** I look at a member with expiry date more than 3 days away, **Then** their status shows as ACTIVE with appropriate visual indicator
3. **Given** I am viewing the members list, **When** I look at a member with expiry date within 3 days, **Then** their status shows as EXPIRING with appropriate warning visual indicator
4. **Given** I am viewing the members list, **When** I look at a member with expiry date in the past, **Then** their status shows as EXPIRED with appropriate visual indicator
5. **Given** I am on the members list page, **When** I click on a member, **Then** I am taken to that member's detail page

---

### User Story 2 - Register New Members (Priority: P1)

As a gym administrator, I need to register new members with their personal information and initial membership fee details, so I can add them to the system and start tracking their membership.

**Why this priority**: Member registration is essential for onboarding new gym members. This must work alongside the member listing to form a complete member management workflow.

**Independent Test**: Can be fully tested by navigating to the add member page, filling out the registration form with member details and fee information, submitting the form, and verifying the new member appears in the members list with correct status.

**Acceptance Scenarios**:

1. **Given** I am on the add member page, **When** I fill in all required fields (name, email address, phone number, fee paid date, expiry date), **Then** I can submit the form successfully
2. **Given** I have submitted a new member registration, **When** the form is processed, **Then** the new member is added to the system and I am redirected to the members list or member detail page
3. **Given** I am filling the registration form, **When** I enter an expiry date, **Then** the system automatically calculates and displays the membership status (ACTIVE, EXPIRING, or EXPIRED)
4. **Given** I am on the add member page, **When** I leave required fields empty, **Then** I see validation errors preventing submission

---

### User Story 3 - View Member Details (Priority: P2)

As a gym administrator, I need to view detailed information about a specific member including their membership history, fee payment records, and attendance, so I can manage their account effectively.

**Why this priority**: While viewing the list is essential, detailed member information is needed for account management, fee tracking, and resolving member inquiries. This supports the core member management workflow.

**Independent Test**: Can be fully tested by navigating to a member's detail page from the members list and verifying all member information, fee history, and membership status are displayed correctly.

**Acceptance Scenarios**:

1. **Given** I am on a member's detail page, **When** the page loads, **Then** I see the member's full profile information (name, email, phone), current membership status, fee paid date, expiry date, and recent attendance history
2. **Given** I am viewing a member's details, **When** I look at the membership section, **Then** I see the current status (ACTIVE/EXPIRING/EXPIRED) with clear visual indicators
3. **Given** I am on a member's detail page, **When** I want to update their information, **Then** I can edit member personal details (name, email, phone) and fee information (fee paid date, expiry date) with changes saved to localStorage
4. **Given** I am viewing a member with EXPIRING status, **When** I look at the page, **Then** I see a prominent notification or warning about the upcoming expiry

---

### User Story 4 - Track Member Attendance (Priority: P2)

As a gym administrator, I need to record member attendance when they check in at the gym, so I can track member activity and ensure only active members can access the facility.

**Why this priority**: Attendance tracking is a core operational function. It validates membership status in real-time and provides usage data. This must work with the membership status system to prevent expired members from checking in.

**Independent Test**: Can be fully tested by navigating to the attendance clock-in page, searching for a member, and successfully recording their attendance. The system should validate membership status before allowing check-in.

**Acceptance Scenarios**:

1. **Given** I am on the attendance clock-in page, **When** I search for a member by name (case-insensitive partial match) or ID (exact match), **Then** I see matching members displayed, or a "no members found" message if no matches exist
2. **Given** I have found a member with ACTIVE status, **When** I select them and clock them in, **Then** their attendance is recorded with timestamp and they are marked as checked in
3. **Given** I attempt to clock in a member with EXPIRED status, **When** I try to record attendance, **Then** the system prevents check-in and displays a message indicating their membership has expired
4. **Given** I attempt to clock in a member with EXPIRING status, **When** I try to record attendance, **Then** the system allows check-in but displays a warning about upcoming expiry
5. **Given** I am on the clock-in page, **When** I successfully clock in a member, **Then** I see a confirmation message and can immediately clock in another member

---

### User Story 5 - Monitor Fee Expiry and Notifications (Priority: P3)

As a gym administrator, I need to see notifications about memberships that are expiring soon or have expired, so I can proactively contact members and manage renewals.

**Why this priority**: While not blocking core operations, fee expiry notifications help prevent membership lapses and improve member retention. This enhances the value of the system but can be delivered after core functionality.

**Independent Test**: Can be fully tested by viewing the dashboard or notifications UI and verifying that members with expiring or expired memberships are prominently displayed with appropriate alerts.

**Acceptance Scenarios**:

1. **Given** I am on the dashboard, **When** the page loads, **Then** I see a notifications section displaying members with EXPIRING status (within 3 days) and EXPIRED status
2. **Given** I am viewing notifications, **When** I see an expiring membership, **Then** I can click on it to navigate to that member's detail page
3. **Given** I am on the dashboard, **When** there are no expiring or expired memberships, **Then** the notifications section shows a message indicating all memberships are active
4. **Given** I am viewing fee expiry notifications, **When** I see multiple expiring memberships, **Then** they are sorted by expiry date (soonest first)

---

### User Story 6 - Access Admin Dashboard (Priority: P3)

As a gym administrator, I need a dashboard that provides an overview of key metrics, recent activity, and quick access to common tasks, so I can efficiently manage the gym operations.

**Why this priority**: The dashboard provides operational insights and quick navigation, but the core member management functions (stories 1-4) can operate independently. This enhances usability but is not required for basic functionality.

**Independent Test**: Can be fully tested by navigating to the dashboard and verifying that key metrics (total members, active/expiring/expired counts), recent activity, and navigation to main features are displayed correctly.

**Acceptance Scenarios**:

1. **Given** I am on the dashboard, **When** the page loads, **Then** I see summary statistics including total members, active members count, expiring members count, and expired members count
2. **Given** I am viewing the dashboard, **When** I want to access a feature, **Then** I can navigate to members list, add member, or attendance pages via clear navigation elements
3. **Given** I am on the dashboard, **When** I look at the layout, **Then** I see a clean, professional interface with cards showing different metrics and sections
4. **Given** I am viewing the dashboard on a mobile device, **When** the page renders, **Then** all content is accessible and properly formatted for the smaller screen

---

### Edge Cases

- What happens when a member's expiry date is exactly today? → **RESOLVED**: If expiry date is today or in the past, status is EXPIRED. If expiry date is within 3 days from today (including today if future), status is EXPIRING
- How does the system handle members with no expiry date set? → **RESOLVED**: Expiry date is required; form validation prevents submission without it
- What happens when clocking in a member who was just added with a future expiry date? → **RESOLVED**: System allows check-in if status is ACTIVE (calculated based on expiry date relative to current date)
- How does the system handle multiple attendance records for the same member on the same day? → **RESOLVED**: System allows multiple check-ins per day (members may leave and return)
- What happens when searching for a member in clock-in with no results? → **RESOLVED**: System displays "no members found" message with clear indication that search returned no matches
- How does the system handle very old expiry dates (years in the past)? → **RESOLVED**: System clearly shows status as EXPIRED for any expiry date that is today or in the past
- What happens when the system date changes and a member's status should update? → **RESOLVED**: Status recalculates in real-time based on current date whenever member data is accessed or displayed
- How is member data persisted without a backend? → **RESOLVED**: All member and attendance data is stored in browser localStorage, persisting across browser sessions
- What happens if localStorage is full or unavailable? → **RESOLVED**: System displays user-friendly error message indicating data cannot be saved, with guidance to clear browser storage or use a different browser

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a list of all members with their name, membership status, and key information
- **FR-002**: System MUST automatically calculate membership status (ACTIVE, EXPIRING, EXPIRED) based on expiry date relative to current date
- **FR-003**: System MUST allow administrators to register new members with personal information (name, email address, phone number)
- **FR-004**: System MUST allow administrators to set fee paid date and expiry date for each member (expiry date is required)
- **FR-019**: System MUST automatically generate a unique numeric identifier for each new member upon registration
- **FR-020**: System MUST allow administrators to edit member personal information (name, email, phone) and fee information (fee paid date, expiry date)
- **FR-021**: System MUST persist all member and attendance data using browser localStorage to maintain data across browser sessions
- **FR-022**: System MUST allow multiple attendance check-ins per day for the same member
- **FR-023**: System MUST provide case-insensitive partial name matching and exact ID matching in member search functionality
- **FR-024**: System MUST display recent attendance history on member detail pages (last 30 days or last 10 records, whichever provides more data)
- **FR-025**: System MUST display user-friendly error messages for validation failures and invalid operations
- **FR-005**: System MUST prevent members with EXPIRED status from checking in for attendance
- **FR-006**: System MUST allow members with ACTIVE status to check in for attendance
- **FR-007**: System MUST allow members with EXPIRING status to check in but display a warning
- **FR-008**: System MUST provide a member detail page showing complete member information, membership status, and fee history
- **FR-009**: System MUST display notifications for members with EXPIRING status (expiry within 3 days)
- **FR-010**: System MUST display notifications for members with EXPIRED status
- **FR-011**: System MUST provide a dashboard with summary statistics (total members, active count, expiring count, expired count)
- **FR-012**: System MUST allow searching for members by name or identifier in the attendance clock-in interface
- **FR-013**: System MUST record attendance with timestamp when a member checks in
- **FR-014**: System MUST provide navigation between all major pages (dashboard, members list, add member, member detail, attendance)
- **FR-015**: System MUST maintain membership status calculations in real-time based on current date
- **FR-016**: System MUST validate required fields when registering new members
- **FR-017**: System MUST display membership status with clear visual indicators (colors, badges, or icons)
- **FR-018**: System MUST work responsively on both mobile and desktop devices

### Key Entities *(include if feature involves data)*

- **Member**: Represents a gym member with personal information (name, email address, phone number), membership fee information (fee paid date, expiry date), and membership status (ACTIVE, EXPIRING, EXPIRED). Each member has a unique auto-generated numeric identifier and can have multiple attendance records. All member data is persisted in browser localStorage.

- **Attendance Record**: Represents a single check-in event for a member, including the member reference, check-in timestamp, and date. Linked to a specific member.

- **Membership Status**: A calculated value derived from the member's expiry date relative to the current date. Status can be ACTIVE (expiry > 3 days away), EXPIRING (expiry within 3 days including today if future), or EXPIRED (expiry date is today or in the past). Status recalculates in real-time based on current date.

- **Notification**: Represents an alert about a member's membership status, specifically for EXPIRING or EXPIRED memberships. Includes member reference and expiry information.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can view all members and their status in under 2 seconds from page load
- **SC-002**: Administrators can register a new member with all required information in under 1 minute
- **SC-003**: Administrators can successfully clock in an active member in under 10 seconds from search to confirmation
- **SC-004**: System correctly calculates and displays membership status for 100% of members based on their expiry dates
- **SC-005**: Administrators can navigate between all major pages (dashboard, members list, add member, detail, attendance) without errors
- **SC-006**: System prevents 100% of expired members from successfully checking in
- **SC-007**: All pages render correctly and remain functional on mobile devices (screen width 320px and above) and desktop devices (screen width 1280px and above)
- **SC-008**: Administrators can identify expiring memberships (within 3 days) immediately upon viewing the dashboard or notifications section
- **SC-009**: System displays membership status with visual indicators that are distinguishable by administrators (different colors/styles for ACTIVE, EXPIRING, EXPIRED)
- **SC-010**: Administrators can access member detail pages from the members list with a single click or tap

