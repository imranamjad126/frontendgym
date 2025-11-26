'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useMembers } from '@/hooks/useMembers';
import { hasAttendanceToday, markAttendanceToday, canMemberMarkAttendance } from '@/lib/storage/attendanceStorage';
import { Member } from '@/lib/types/member';
import { calculateMembershipStatus } from '@/lib/utils/status';
import { MembershipStatus } from '@/lib/types/status';

export function AttendanceQuickMark() {
  const { members, refresh: refreshMembers } = useMembers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<boolean | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Optimized search - memoized for performance with large datasets
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.trim().toLowerCase();
    const results: Member[] = [];
    
    // Limit results for performance
    const maxResults = 10;
    
    // Search by ID first (fastest)
    if (!isNaN(Number(query))) {
      const memberId = Number(query);
      const member = members.find(m => m.id === memberId);
      if (member) {
        results.push(member);
        return results;
      }
    }
    
    // Search by name (optimized)
    for (const member of members) {
      if (results.length >= maxResults) break;
      
      if (member.name.toLowerCase().includes(query)) {
        results.push(member);
      }
    }
    
    return results;
  }, [searchQuery, members]);

  // Handle member selection - automatically mark attendance
  const handleMemberSelect = useCallback(async (member: Member) => {
    setSelectedMember(member);
    const hasAttendance = hasAttendanceToday(member.id);
    setAttendanceStatus(hasAttendance);
    setShowSuccess(false);
    setErrorMessage(null);
    
    // If already marked, just show status
    if (hasAttendance) {
      setAttendanceStatus(true);
      return;
    }
    
    // Check if member can mark attendance
    const membershipStatus = calculateMembershipStatus(member.expiryDate);
    const canMark = canMemberMarkAttendance(member.id);
    
    if (!canMark) {
      if (membershipStatus === MembershipStatus.EXPIRED) {
        setErrorMessage('This member\'s membership has expired. Please renew their membership before marking attendance.');
      } else {
        setErrorMessage('This member is inactive. Cannot mark attendance.');
      }
      return;
    }
    
    // Automatically mark attendance
    setIsToggling(true);
    try {
      const marked = markAttendanceToday(member.id);
      if (marked) {
        setAttendanceStatus(true);
        setShowSuccess(true);
        
        // Dispatch custom event to notify dashboard of attendance update
        window.dispatchEvent(new CustomEvent('attendanceUpdated'));
        
        // Refresh members to update any related data
        refreshMembers();
        
        // Auto-clear after 1.5 seconds
        setTimeout(() => {
          setSelectedMember(null);
          setSearchQuery('');
          setAttendanceStatus(null);
          setShowSuccess(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to mark attendance';
      setErrorMessage(errorMsg);
    } finally {
      setIsToggling(false);
    }
  }, [refreshMembers]);

  // Handle search input - auto-select if exact ID match
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setSelectedMember(null);
    setAttendanceStatus(null);
    setShowSuccess(false);
    
    // Auto-select if exact ID match
    if (value.trim() && !isNaN(Number(value.trim()))) {
      const memberId = Number(value.trim());
      const member = members.find(m => m.id === memberId);
      if (member) {
        handleMemberSelect(member);
      }
    }
  }, [members, handleMemberSelect]);


  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Quick Attendance Marking
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Search by ID or name to mark attendance instantly
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by ID (e.g., 199) or name..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        {/* Search Results */}
        {searchQuery.trim() && searchResults.length > 0 && !selectedMember && (
          <div className="border border-slate-200 rounded-lg max-h-60 overflow-y-auto bg-white">
            {searchResults.map((member) => {
              const hasAttendance = hasAttendanceToday(member.id);
              const membershipStatus = calculateMembershipStatus(member.expiryDate);
              const isExpired = membershipStatus === MembershipStatus.EXPIRED;
              const canMark = canMemberMarkAttendance(member.id);
              
              return (
                <button
                  key={member.id}
                  onClick={() => handleMemberSelect(member)}
                  disabled={isToggling || hasAttendance || !canMark}
                  className={`w-full p-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 flex items-center justify-between ${
                    isExpired || !canMark || hasAttendance ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{member.name}</p>
                      {isExpired && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
                          Expired
                        </Badge>
                      )}
                      {!canMark && !isExpired && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
                          Inactive
                        </Badge>
                      )}
                      {hasAttendance && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Already Marked
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">ID: {member.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isToggling ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    ) : hasAttendance ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Present
                      </Badge>
                    ) : canMark ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                        Click to Mark
                      </Badge>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {searchQuery.trim() && searchResults.length === 0 && !selectedMember && (
          <div className="text-center py-8 text-slate-500 border border-slate-200 rounded-lg bg-slate-50">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
            <p className="font-medium">No members found</p>
            <p className="text-sm mt-1">Try searching by ID (e.g., 199) or name</p>
          </div>
        )}

        {/* Success Message - Show when attendance is marked */}
        {showSuccess && selectedMember && (
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-semibold">Attendance marked successfully!</p>
            </div>
            <p className="text-sm text-green-600 text-center mt-2">
              {selectedMember.name} (ID: {selectedMember.id}) - Present
            </p>
          </div>
        )}

        {/* Error Message - Show when member cannot be marked */}
        {errorMessage && selectedMember && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="flex items-start gap-2 text-red-700">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold mb-1">{selectedMember.name} (ID: {selectedMember.id})</p>
                <p className="text-sm">{errorMessage}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedMember(null);
                setSearchQuery('');
                setErrorMessage(null);
              }}
              className="w-full mt-3"
            >
              Clear & Search Another
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

