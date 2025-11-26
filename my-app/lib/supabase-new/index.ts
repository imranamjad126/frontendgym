// ============================================
// SUPABASE NEW - EXPORT ALL FUNCTIONS
// ============================================

// Client
export { supabase } from './client';

// Members
export {
  addMember,
  updateMember,
  deleteMember,
  getAllMembers,
  getMembersByStatus,
  getMemberById,
  freezeMember,
  inactiveMember,
  unpaidMember,
  dormantMember,
} from './members';

// Attendance
export {
  recordAttendance,
  getMemberAttendance,
  getAttendanceByDate,
  hasAttendance,
} from './attendance';

// Payments
export {
  recordPayment,
  getMemberPayments,
  getPaymentsByDateRange,
  getMemberTotalPayments,
} from './payments';



