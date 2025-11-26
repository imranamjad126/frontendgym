# Quick Start Guide

**Feature**: Gym Membership Management System  
**Date**: 2025-01-27

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Initial Setup

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Install shadcn/ui Components

```bash
npx shadcn-ui@latest init
```

Follow prompts to configure:
- TypeScript: Yes
- Style: Default
- Base color: Slate
- CSS variables: Yes

### 3. Install Required shadcn/ui Components

```bash
npx shadcn-ui@latest add button input card badge alert dialog table form
```

### 4. Install Additional Dependencies

```bash
npm install lucide-react
# or
yarn add lucide-react
```

## Project Structure

```
app/                          # Next.js App Router pages
components/                   # React components
lib/                          # Business logic and utilities
hooks/                        # Custom React hooks
data/                         # Seed data
```

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

### 2. Seed Dummy Data

On first load, if localStorage is empty, the app will automatically seed sample data. Alternatively, you can manually trigger seeding by:

```typescript
// In browser console or seed function
import { seedDummyData } from '@/data/seed';
seedDummyData();
```

### 3. Development Checklist

- [ ] Layout with sidebar and header working
- [ ] Members list page displays all members
- [ ] Add member form validates and saves
- [ ] Member detail page shows all information
- [ ] Attendance clock-in works with search
- [ ] Dashboard shows statistics and notifications
- [ ] All pages responsive on mobile and desktop
- [ ] Status calculations work correctly
- [ ] Data persists in localStorage

## Key Files to Implement

### Pages (Priority Order)

1. **app/layout.tsx** - Root layout with sidebar
2. **app/(dashboard)/page.tsx** - Dashboard page
3. **app/members/page.tsx** - Members list
4. **app/members/new/page.tsx** - Add member
5. **app/members/[id]/page.tsx** - Member detail
6. **app/attendance/page.tsx** - Attendance clock-in

### Core Components

1. **components/layout/Sidebar.tsx** - Navigation
2. **components/members/MemberList.tsx** - Member table
3. **components/members/MemberForm.tsx** - Add/edit form
4. **components/attendance/ClockInInterface.tsx** - Clock-in UI

### Business Logic

1. **lib/utils/status.ts** - Status calculation
2. **lib/storage/memberStorage.ts** - Member CRUD
3. **lib/storage/attendanceStorage.ts** - Attendance operations
4. **lib/utils/validation.ts** - Form validation

### Custom Hooks

1. **hooks/useMembers.ts** - Members data management
2. **hooks/useMember.ts** - Single member data
3. **hooks/useAttendance.ts** - Attendance data

## Testing the Application

### Manual Testing Checklist

#### Member Management
- [ ] View all members in list
- [ ] Add new member with all required fields
- [ ] Edit existing member information
- [ ] View member detail page
- [ ] Verify status badges (ACTIVE, EXPIRING, EXPIRED)
- [ ] Search members by name or ID

#### Attendance
- [ ] Search for member in clock-in interface
- [ ] Clock in active member (should succeed)
- [ ] Attempt to clock in expired member (should fail)
- [ ] Clock in expiring member (should show warning)
- [ ] View attendance history on member detail page

#### Dashboard
- [ ] View statistics (total, active, expiring, expired)
- [ ] View notifications for expiring/expired members
- [ ] Click notification to navigate to member
- [ ] Verify empty state when no notifications

#### Data Persistence
- [ ] Add member, refresh page, verify member still exists
- [ ] Edit member, refresh page, verify changes persisted
- [ ] Clock in member, refresh page, verify attendance recorded

#### Responsive Design
- [ ] Test on mobile (320px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1280px+ width)
- [ ] Verify sidebar collapses on mobile
- [ ] Verify tables become cards on mobile

## Common Issues & Solutions

### Issue: localStorage Not Persisting

**Solution**: Check browser settings, ensure localStorage is enabled. Some browsers disable it in private/incognito mode.

### Issue: Status Not Updating

**Solution**: Status is calculated on-demand. Ensure `calculateMembershipStatus` is called when displaying members.

### Issue: Form Validation Not Working

**Solution**: Ensure validation functions are imported and called in form component. Check that required fields are marked.

### Issue: Search Not Finding Members

**Solution**: Verify search function uses case-insensitive matching. Check that member data is loaded from localStorage.

## Next Steps

After completing implementation:

1. Run `/speckit.tasks` to generate detailed task breakdown
2. Implement features in priority order (P1 → P2 → P3)
3. Test each feature independently
4. Verify constitution compliance
5. Polish UI/UX for premium appearance

## Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

