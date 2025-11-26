# Supabase Integration Guide

## Overview
This project is now connected to Supabase for backend data storage. All member operations now sync with Supabase.

## Example Functions

### Adding a Member

```typescript
import { useSupabaseMembers } from '@/hooks/useSupabaseMembers';

function MyComponent() {
  const { addMember, loading, error } = useSupabaseMembers();

  const handleAdd = async () => {
    const result = await addMember({
      name: "Ali",
      phone: "03001234567",
      plan: "WITHOUT_AC", // or "WITH_AC" or "ONE_DAY"
      start_date: "2025-01-01",
      end_date: "2025-02-01",
      status: "active",
      email: "ali@example.com", // optional
      gender: "Male", // optional
    });

    if (result.success) {
      console.log('Member added successfully!');
    } else {
      console.error('Error:', result.error);
    }
  };
}
```

### Fetching All Members

```typescript
import { useSupabaseMembers } from '@/hooks/useSupabaseMembers';

function MyComponent() {
  const { members, loading, error, refresh } = useSupabaseMembers();

  useEffect(() => {
    // Members are automatically loaded
    // Use refresh() to reload manually
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {members.map(member => (
        <div key={member.id}>{member.name}</div>
      ))}
    </div>
  );
}
```

### Updating a Member

```typescript
import { useSupabaseMembers } from '@/hooks/useSupabaseMembers';

function MyComponent() {
  const { updateMember } = useSupabaseMembers();

  const handleUpdate = async (memberId: number) => {
    const result = await updateMember(memberId, {
      name: "Updated Name",
      phone: "03001234567",
      status: "active",
    });

    if (result.success) {
      console.log('Member updated!');
    } else {
      console.error('Error:', result.error);
    }
  };
}
```

### Deleting a Member (Soft Delete)

```typescript
import { useSupabaseMembers } from '@/hooks/useSupabaseMembers';

function MyComponent() {
  const { deleteMember } = useSupabaseMembers();

  const handleDelete = async (memberId: number) => {
    const result = await deleteMember(memberId);

    if (result.success) {
      console.log('Member deleted (moved to Bin)!');
    } else {
      console.error('Error:', result.error);
    }
  };
}
```

### Restoring a Deleted Member

```typescript
import { useSupabaseMembers } from '@/hooks/useSupabaseMembers';

function MyComponent() {
  const { restoreMember } = useSupabaseMembers();

  const handleRestore = async (memberId: number) => {
    const result = await restoreMember(memberId);

    if (result.success) {
      console.log('Member restored!');
    } else {
      console.error('Error:', result.error);
    }
  };
}
```

## Direct Supabase Operations

You can also use the Supabase operations directly:

```typescript
import {
  addMemberToSupabase,
  fetchAllMembersFromSupabase,
  updateMemberInSupabase,
  deleteMemberFromSupabase,
} from '@/lib/supabase/memberOperations';

// Add member
const { data, error } = await addMemberToSupabase({
  name: "Ali",
  phone: "03001234567",
  plan: "WITHOUT_AC",
  start_date: "2025-01-01",
  end_date: "2025-02-01",
  status: "active",
});

// Fetch all members
const { data: members, error } = await fetchAllMembersFromSupabase();

// Update member
const { data: updated, error } = await updateMemberInSupabase(1, {
  name: "Updated Name",
});

// Delete member (soft delete)
const { success, error } = await deleteMemberFromSupabase(1);
```

## Error Handling

All functions return error information:

```typescript
const result = await addMember({...});

if (!result.success) {
  // Handle error
  console.error(result.error);
  alert(result.error);
}
```

## Loading States

The `useSupabaseMembers` hook provides loading states:

```typescript
const { members, loading, error } = useSupabaseMembers();

if (loading) {
  return <div>Loading members...</div>;
}

if (error) {
  return <div>Error: {error}</div>;
}
```

## Real-time Updates

The hook automatically dispatches `membersUpdated` events when data changes, ensuring all components stay in sync.



