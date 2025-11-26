import { Member } from '../lib/types/member';
import { AttendanceRecord } from '../lib/types/attendance';
import { saveMember, getAllMembers } from '../lib/storage/memberStorage';
import { getAllAttendance } from '../lib/storage/attendanceStorage';
import { setItem } from '../lib/storage/localStorage';
import { STORAGE_KEYS } from '../lib/storage/storageKeys';
import { FeeType, FEE_AMOUNTS, FeeStatus } from '../lib/types/fee';

export function seedData(): void {
  // Check if data already exists
  const existingMembers = getAllMembers();
  const existingAttendance = getAllAttendance();
  
  if (existingMembers.length > 0 || existingAttendance.length > 0) {
    return; // Data already seeded
  }
  
  const today = new Date();
  const members: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 555-0101',
      feeType: FeeType.WITHOUT_AC,
      feeAmount: FEE_AMOUNTS[FeeType.WITHOUT_AC],
      feePaid: true,
      feeStatus: FeeStatus.ACTIVE,
      status: 'Active',
      feePaidDate: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      expiryDate: new Date(today.getFullYear(), today.getMonth() + 1, 1), // ACTIVE
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '+1 555-0102',
      feeType: FeeType.WITH_AC,
      feeAmount: FEE_AMOUNTS[FeeType.WITH_AC],
      feePaid: false,
      feeStatus: FeeStatus.UNPAID,
      status: undefined,
      feePaidDate: new Date(today.getFullYear(), today.getMonth() - 2, 15),
      expiryDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // EXPIRING (2 days)
    },
    {
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      phone: '+1 555-0103',
      feeType: FeeType.WITHOUT_AC,
      feeAmount: FEE_AMOUNTS[FeeType.WITHOUT_AC],
      feePaid: false,
      feeStatus: FeeStatus.UNPAID,
      status: 'Inactive',
      feePaidDate: new Date(today.getFullYear(), today.getMonth() - 3, 1),
      expiryDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // EXPIRED (5 days ago)
    },
    {
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      phone: '+1 555-0104',
      feeType: FeeType.WITH_AC,
      feeAmount: FEE_AMOUNTS[FeeType.WITH_AC],
      feePaid: true,
      feeStatus: FeeStatus.ACTIVE,
      status: 'Active',
      feePaidDate: new Date(today.getFullYear(), today.getMonth() - 1, 10),
      expiryDate: new Date(today.getFullYear(), today.getMonth() + 2, 10), // ACTIVE
    },
    {
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      phone: '+1 555-0105',
      feeType: FeeType.WITHOUT_AC,
      feeAmount: FEE_AMOUNTS[FeeType.WITHOUT_AC],
      feePaid: true,
      feeStatus: FeeStatus.ACTIVE,
      status: 'Freeze',
      feePaidDate: new Date(today.getFullYear(), today.getMonth() - 2, 20),
      expiryDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // EXPIRING (1 day)
    },
    {
      name: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      phone: '+1 555-0106',
      feeType: FeeType.WITH_AC,
      feeAmount: FEE_AMOUNTS[FeeType.WITH_AC],
      feePaid: false,
      feeStatus: FeeStatus.UNPAID,
      status: 'Dormant',
      feePaidDate: new Date(today.getFullYear(), today.getMonth() - 1, 5),
      expiryDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // EXPIRED (10 days ago)
    },
    {
      name: 'Robert Taylor',
      email: 'robert.taylor@example.com',
      phone: '+1 555-0107',
      feeType: FeeType.WITHOUT_AC,
      feeAmount: FEE_AMOUNTS[FeeType.WITHOUT_AC],
      feePaid: true,
      feeStatus: FeeStatus.ACTIVE,
      status: 'Active',
      feePaidDate: new Date(today.getFullYear(), today.getMonth() - 1, 15),
      expiryDate: new Date(today.getFullYear(), today.getMonth() + 3, 15), // ACTIVE
    },
    {
      name: 'Jennifer Martinez',
      email: 'jennifer.m@example.com',
      phone: '+1 555-0108',
      feeType: FeeType.WITH_AC,
      feeAmount: FEE_AMOUNTS[FeeType.WITH_AC],
      feePaid: true,
      feeStatus: FeeStatus.ACTIVE,
      status: 'Active',
      feePaidDate: new Date(today.getFullYear(), today.getMonth() - 2, 1),
      expiryDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // EXPIRING (3 days)
    },
    {
      name: 'James Brown',
      email: 'james.brown@example.com',
      phone: '+1 555-0109',
      feeType: FeeType.WITHOUT_AC,
      feeAmount: FEE_AMOUNTS[FeeType.WITHOUT_AC],
      feePaid: true,
      feeStatus: FeeStatus.ACTIVE,
      status: 'Active',
      feePaidDate: new Date(today.getFullYear(), today.getMonth() - 1, 20),
      expiryDate: new Date(today.getFullYear(), today.getMonth() + 1, 20), // ACTIVE
    },
    {
      name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      phone: '+1 555-0110',
      feeType: FeeType.WITH_AC,
      feeAmount: FEE_AMOUNTS[FeeType.WITH_AC],
      feePaid: false,
      feeStatus: FeeStatus.UNPAID,
      status: 'Inactive',
      feePaidDate: new Date(today.getFullYear(), today.getMonth() - 3, 10),
      expiryDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // EXPIRED (1 day ago)
    },
  ];
  
  // Save members
  const savedMembers = members.map(member => saveMember(member));
  
  // Create some sample attendance records
  const memberIds = savedMembers.map(m => m.id);
  
  // Add attendance for some active members
  const allAttendance: AttendanceRecord[] = [];
  memberIds.slice(0, 5).forEach((memberId, index) => {
    for (let i = 0; i < 3 + index; i++) {
      const checkInDate = new Date(today);
      checkInDate.setDate(checkInDate.getDate() - i);
      checkInDate.setHours(8 + i, 30, 0, 0);
      
      // Create attendance record
      const newRecord: AttendanceRecord = {
        id: `att_${checkInDate.getTime()}_${memberId}`,
        memberId,
        checkInTime: checkInDate,
        date: new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate()),
      };
      allAttendance.push(newRecord);
    }
  });
  
  if (allAttendance.length > 0) {
    setItem(STORAGE_KEYS.ATTENDANCE, allAttendance);
  }
}

