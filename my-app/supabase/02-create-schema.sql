-- ============================================
-- CREATE FRESH SCHEMA
-- ============================================
-- Run this AFTER cleanup script
-- Creates tables EXACTLY as specified

-- TABLE: members
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT,
  cnic TEXT,
  membership_type TEXT NOT NULL,
  ac_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: attendance
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  UNIQUE(member_id, date)
);

-- TABLE: payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  method TEXT NOT NULL,
  date DATE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_attendance_member_id ON attendance(member_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_payments_member_id ON payments(member_id);
CREATE INDEX idx_payments_date ON payments(date);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_expiry_date ON members(expiry_date);



