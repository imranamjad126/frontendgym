'use client';

import { useEffect, useRef, useState, Suspense, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { MemberList } from '@/components/members/MemberList';
import { useMembers } from '@/hooks/useMembers';
import { seedData } from '@/data/seed';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { filterMembersByCategory, getPageTitle } from '@/lib/utils/filterMembers';
import { getAllMembers } from '@/lib/storage/memberStorage';
import { calculateMembershipStatus } from '@/lib/utils/status';
import { MemberWithStatus } from '@/lib/types/member';
import { searchMembers } from '@/lib/utils/search';

function MembersPageContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || '';
  const { members, loading, refresh } = useMembers();
  const [deletedMembers, setDeletedMembers] = useState<MemberWithStatus[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const hasSeeded = useRef(false);

  // Helper function to load deleted members from Supabase (always fresh, no cache)
  const loadDeletedMembers = useCallback(async () => {
    try {
      const { fetchAllMembersFromSupabase } = await import('@/lib/supabase/memberOperations');
      const { data, error } = await fetchAllMembersFromSupabase(true);
      
      if (error) {
        console.error('Failed to load deleted members:', error);
        setDeletedMembers([]);
        return [];
      }
      
      const deleted = data
        .filter(m => m.deletedAt)
        .map(member => ({
          ...member,
          status: calculateMembershipStatus(member.expiryDate),
        }));
      setDeletedMembers(deleted);
      return deleted;
    } catch (error) {
      console.error('Failed to load deleted members:', error);
      setDeletedMembers([]);
      return [];
    }
  }, []);

  useEffect(() => {
    if (!hasSeeded.current) {
      try {
        seedData();
        hasSeeded.current = true;
        setTimeout(() => {
          refresh();
        }, 100);
      } catch (error) {
        console.error('Failed to seed data:', error);
      }
    }
  }, [refresh]);

  // Listen for member updates to refresh the list
  useEffect(() => {
    const handleMemberChange = () => {
      refresh();
    };

    window.addEventListener('membersUpdated', handleMemberChange);
    return () => {
      window.removeEventListener('membersUpdated', handleMemberChange);
    };
  }, [refresh]);

  // Load deleted members when on deleted page or when filter changes
  useEffect(() => {
    if (filter === 'deleted') {
      // Always reload from localStorage to get fresh data (no cached data)
      loadDeletedMembers();
    } else {
      setDeletedMembers([]);
    }
  }, [filter, loadDeletedMembers]);

  // Refresh deleted members when navigating to deleted page (ensures fresh data)
  useEffect(() => {
    if (filter === 'deleted' && !loading) {
      // Small delay to ensure storage is updated
      const timer = setTimeout(() => {
        loadDeletedMembers();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [filter, loading, loadDeletedMembers]);

  // For deleted page, use deletedMembers directly (already filtered)
  // For other pages, use regular members and apply filter
  const categoryFilteredMembers = useMemo(() => {
    return filter === 'deleted' 
      ? deletedMembers  // Already filtered to only deleted members
      : (filter ? filterMembersByCategory(members, filter) : members);
  }, [filter, deletedMembers, members]);
  
  // Apply search filter if search query exists
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return categoryFilteredMembers;
    }
    return searchMembers(searchQuery, categoryFilteredMembers);
  }, [searchQuery, categoryFilteredMembers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Loading members...</p>
      </div>
    );
  }
  
  const pageTitle = getPageTitle(filter || undefined);
  const isFreezePage = filter === 'freeze';
  const isDormantPage = filter === 'dormant';
  const isInactivePage = filter === 'inactive';
  const isDeletedPage = filter === 'deleted';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{pageTitle}</h1>
          <p className="text-slate-600">
            {filter ? `Showing ${filteredMembers.length} ${pageTitle.toLowerCase()}` : 'Manage all gym members'}
            {searchQuery.trim() && ` (${filteredMembers.length} found)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!filter && filteredMembers.length > 0 && (
            <Button
              variant="destructive"
              onClick={async () => {
                if (confirm(`Are you sure you want to delete all ${filteredMembers.length} members? They will be moved to Bin and can be restored later.`)) {
                  const { deleteMember } = await import('@/lib/storage/memberStorage');
                  let deletedCount = 0;
                  for (const member of filteredMembers) {
                    const result = deleteMember(member.id);
                    if (result) {
                      deletedCount++;
                    }
                  }
                  if (deletedCount > 0) {
                    alert(`Successfully deleted ${deletedCount} member(s). They have been moved to Bin.`);
                    refresh();
                  }
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
          {!filter && (
            <Link href="/members/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search by member ID or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <MemberList 
        members={filteredMembers} 
        showMarkAsPaid={filter === 'unpaid'}
        showUnpaidDetails={filter === 'unpaid'}
        showEditAction={!filter || filter === ''}
        onEdit={async (member) => {
          const { updateMember } = await import('@/lib/storage/memberStorage');
          const result = updateMember(member.id, {
            name: member.name,
            email: member.email,
            phone: member.phone,
            feeType: member.feeType,
            feeAmount: member.feeAmount,
            feePaidDate: member.feePaidDate,
            expiryDate: member.expiryDate,
          });
          if (result) {
            refresh(); // Refresh the list to show updated data
          }
        }}
        onMarkAsPaid={async (memberId) => {
          const { markMemberAsPaid } = await import('@/lib/storage/memberStorage');
          const result = markMemberAsPaid(memberId);
          if (result) {
            refresh(); // Refresh the list to remove the member
          }
        }}
        showFreezeActions={!isFreezePage && !isDormantPage}
        showUnfreezeActions={isFreezePage}
        onFreeze={async (memberId) => {
          const { freezeMember } = await import('@/lib/storage/memberStorage');
          const result = freezeMember(memberId);
          if (result) {
            refresh();
          }
        }}
        onUnfreeze={async (memberId) => {
          const { unfreezeMember } = await import('@/lib/storage/memberStorage');
          const result = unfreezeMember(memberId);
          if (result) {
            refresh();
          }
        }}
        showDormantActions={!isDormantPage && !isFreezePage}
        showActivateActions={isDormantPage}
        onMarkDormant={async (memberId) => {
          const { markMemberAsDormant } = await import('@/lib/storage/memberStorage');
          const result = markMemberAsDormant(memberId);
          if (result) {
            refresh();
          }
        }}
        onActivate={async (memberId) => {
          const { activateDormantMember } = await import('@/lib/storage/memberStorage');
          const result = activateDormantMember(memberId);
          if (result) {
            refresh();
          }
        }}
        showDeleteActions={!isDeletedPage}
        showRestoreActions={isDeletedPage}
        onDelete={async (memberId) => {
          const { deleteMember } = await import('@/lib/storage/memberStorage');
          const result = deleteMember(memberId);
          if (result) {
            refresh();
            // If on deleted page, refresh deleted members list immediately
            if (filter === 'deleted') {
              setTimeout(() => {
                loadDeletedMembers();
              }, 100);
            }
          }
        }}
        onRestore={async (memberId) => {
          const { restoreMember } = await import('@/lib/storage/memberStorage');
          const result = restoreMember(memberId);
          if (result) {
            refresh();
            // Immediately remove from deleted members list
            if (filter === 'deleted') {
              setDeletedMembers(prev => prev.filter(m => m.id !== memberId));
              // Also reload to ensure consistency
              setTimeout(() => {
                loadDeletedMembers();
              }, 100);
            }
          }
        }}
        onPermanentDelete={async (memberId) => {
          if (confirm('Are you sure you want to permanently delete this member? This action cannot be undone.')) {
            const { permanentlyDeleteMember } = await import('@/lib/storage/memberStorage');
            const result = permanentlyDeleteMember(memberId);
            if (result) {
              refresh();
              // Immediately remove from deleted members list
              if (filter === 'deleted') {
                setDeletedMembers(prev => prev.filter(m => m.id !== memberId));
                // Also reload to ensure consistency
                setTimeout(() => {
                  loadDeletedMembers();
                }, 100);
              }
            }
          }
        }}
        showInactiveStatus={isInactivePage}
      />
    </div>
  );
}

const MembersPage = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Loading members...</p>
      </div>
    }>
      <MembersPageContent />
    </Suspense>
  );
};

export default MembersPage;

