# Data Model

**Feature**: Gym Membership Management System  
**Date**: 2025-01-27

## Overview

The application uses a simple data model with two main entities: **Member** and **AttendanceRecord**. All data is stored in browser localStorage as JSON. The **MembershipStatus** is a calculated value, not stored.

## Entities

### Member

Represents a gym member with personal information, membership details, and calculated status.

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | `number` | Yes | Unique sequential numeric identifier | Auto-generated, positive integer |
| `name` | `string` | Yes | Member's full name | Non-empty string, max 100 chars |
| `email` | `string` | Yes | Email address | Valid email format |
| `phone` | `string` | Yes | Phone number | Non-empty string, format flexible |
| `feePaidDate` | `Date` | Yes | Date when membership fee was paid | Valid date, not future |
| `expiryDate` | `Date` | Yes | Membership expiry date | Valid date, after feePaidDate |
| `status` | `MembershipStatus` | Calculated | Current membership status | Calculated, not stored |
| `createdAt` | `Date` | Auto | Record creation timestamp | Auto-set on creation |
| `updatedAt` | `Date` | Auto | Last update timestamp | Auto-updated on modification |

**Relationships**:
- One-to-many with `AttendanceRecord` (one member can have many attendance records)

**State Transitions**:
- Status transitions automatically based on expiry date:
  - ACTIVE → EXPIRING (when expiry date is within 3 days)
  - EXPIRING → EXPIRED (when expiry date passes)
  - Status recalculates on every access (not stored)

**Storage**:
- Stored in localStorage under key: `gym_members`
- Array of Member objects
- JSON serialized/deserialized

**Example**:
```typescript
{
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 234-567-8900",
  feePaidDate: "2025-01-01T00:00:00Z",
  expiryDate: "2025-02-01T00:00:00Z",
  createdAt: "2025-01-01T10:00:00Z",
  updatedAt: "2025-01-15T14:30:00Z"
}
```

### AttendanceRecord

Represents a single check-in event for a member.

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | `string` | Yes | Unique identifier | UUID or timestamp-based |
| `memberId` | `number` | Yes | Reference to Member | Must exist in members |
| `checkInTime` | `Date` | Yes | Exact timestamp of check-in | Valid date/time |
| `date` | `Date` | Yes | Check-in date (normalized) | Date portion of checkInTime |

**Relationships**:
- Many-to-one with `Member` (many attendance records belong to one member)

**Constraints**:
- Multiple check-ins per day allowed (members may leave and return)
- No limit on number of check-ins per member

**Storage**:
- Stored in localStorage under key: `gym_attendance`
- Array of AttendanceRecord objects
- JSON serialized/deserialized

**Example**:
```typescript
{
  id: "att_1704067200000_1",
  memberId: 1,
  checkInTime: "2025-01-27T14:30:00Z",
  date: "2025-01-27T00:00:00Z"
}
```

### MembershipStatus (Enum)

Calculated value, not stored. Derived from expiry date relative to current date.

**Values**:

| Value | Description | Calculation |
|-------|-------------|-------------|
| `ACTIVE` | Membership is active | expiryDate > (today + 3 days) |
| `EXPIRING` | Membership expiring soon | expiryDate <= (today + 3 days) AND expiryDate > today |
| `EXPIRED` | Membership has expired | expiryDate <= today |

**Calculation Logic**:
```typescript
function calculateMembershipStatus(expiryDate: Date): MembershipStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return MembershipStatus.EXPIRED;
  if (daysUntilExpiry <= 3) return MembershipStatus.EXPIRING;
  return MembershipStatus.EXPIRED;
}
```

### Notification (Derived)

Not stored as separate entity. Generated from Member data when needed.

**Fields** (calculated):

| Field | Type | Description |
|-------|------|-------------|
| `memberId` | `number` | Reference to Member |
| `memberName` | `string` | Member's name (from Member) |
| `status` | `MembershipStatus` | EXPIRING or EXPIRED |
| `expiryDate` | `Date` | Expiry date (from Member) |
| `daysUntilExpiry` | `number` | Calculated days until expiry |

**Generation**:
- Generated on-demand from Member array
- Filtered for EXPIRING (within 3 days) or EXPIRED status
- Sorted by expiry date (soonest first)

## Data Validation Rules

### Member Validation

1. **Required Fields**: All fields except `status` are required
2. **Email Format**: Must match valid email regex pattern
3. **Date Logic**: `expiryDate` must be after `feePaidDate`
4. **Name Length**: 1-100 characters
5. **Phone**: Non-empty string (format flexible for international numbers)
6. **ID Uniqueness**: Auto-generated, guaranteed unique

### AttendanceRecord Validation

1. **Required Fields**: All fields required
2. **Member Existence**: `memberId` must reference existing Member
3. **Date Consistency**: `date` must match date portion of `checkInTime`
4. **ID Uniqueness**: Generated unique identifier

## Data Storage Schema

### localStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `gym_members` | `Member[]` | Array of all members |
| `gym_attendance` | `AttendanceRecord[]` | Array of all attendance records |
| `gym_next_member_id` | `number` | Next available member ID (optional optimization) |

### Storage Format

All data stored as JSON strings:

```json
{
  "gym_members": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "feePaidDate": "2025-01-01T00:00:00.000Z",
      "expiryDate": "2025-02-01T00:00:00.000Z",
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-15T14:30:00.000Z"
    }
  ],
  "gym_attendance": [
    {
      "id": "att_1704067200000_1",
      "memberId": 1,
      "checkInTime": "2025-01-27T14:30:00.000Z",
      "date": "2025-01-27T00:00:00.000Z"
    }
  ]
}
```

## Data Operations

### Member Operations

- **Create**: Generate ID, set timestamps, validate, save to localStorage
- **Read**: Load from localStorage, calculate status on access
- **Update**: Update fields, update `updatedAt`, validate, save
- **Delete**: Remove from array, optionally cascade delete attendance records
- **List**: Load all, optionally filter by status
- **Search**: Filter by name (partial, case-insensitive) or ID (exact)

### Attendance Operations

- **Create**: Generate ID, set timestamp, validate member exists, save
- **Read**: Load by memberId, filter by date range
- **List Recent**: Get last 30 days or last 10 records (whichever more)
- **Delete**: Remove record (rare operation)

## Data Migration Considerations

### Future Backend Migration

If backend is added later:
1. Export localStorage data to JSON
2. Transform to backend schema
3. Import via API
4. Update frontend to use API instead of localStorage

### Version Management

Current version: v1.0 (no versioning needed for localStorage-only)

If schema changes in future:
- Add version field to localStorage
- Migration functions to upgrade data
- Backward compatibility handling

## TypeScript Type Definitions

```typescript
// lib/types/member.ts
export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  feePaidDate: Date;
  expiryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// lib/types/attendance.ts
export interface AttendanceRecord {
  id: string;
  memberId: number;
  checkInTime: Date;
  date: Date;
}

// lib/types/status.ts
export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  EXPIRING = 'EXPIRING',
  EXPIRED = 'EXPIRED'
}

// lib/types/notification.ts
export interface Notification {
  memberId: number;
  memberName: string;
  status: MembershipStatus;
  expiryDate: Date;
  daysUntilExpiry: number;
}
```

