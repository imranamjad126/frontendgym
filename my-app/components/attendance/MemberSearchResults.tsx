'use client';

import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/status/StatusBadge';
import { MemberWithStatus } from '@/lib/types/member';
import { format } from 'date-fns';

interface MemberSearchResultsProps {
  members: MemberWithStatus[];
  onSelect: (member: MemberWithStatus) => void;
  selectedId?: number;
}

export function MemberSearchResults({ members, onSelect, selectedId }: MemberSearchResultsProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">No members found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {members.map((member) => (
        <Card
          key={member.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedId === member.id ? 'ring-2 ring-slate-900' : ''
          }`}
          onClick={() => onSelect(member)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{member.name}</h3>
                <p className="text-sm text-slate-500">ID: {member.id} • {member.email}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Expires: {format(member.expiryDate, 'MMM dd, yyyy')}
                </p>
              </div>
              <StatusBadge status={member.status} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}









