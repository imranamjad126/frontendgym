export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  return phone.trim().length > 0;
}

export function validateDateRange(startDate: Date, endDate: Date): boolean {
  return endDate >= startDate;
}

export function validateMemberForm(data: {
  name?: string;
  email?: string;
  phone?: string;
  feePaidDate?: Date;
  expiryDate?: Date;
}): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (data.name.length > 100) {
    errors.name = 'Name must be 100 characters or less';
  }
  
  if (!data.email || data.email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!data.phone || data.phone.trim().length === 0) {
    errors.phone = 'Phone number is required';
  } else if (!validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  if (!data.feePaidDate) {
    errors.feePaidDate = 'Fee paid date is required';
  } else if (data.feePaidDate > new Date()) {
    errors.feePaidDate = 'Fee paid date cannot be in the future';
  }
  
  if (!data.expiryDate) {
    errors.expiryDate = 'Expiry date is required';
  } else if (data.feePaidDate && data.expiryDate < data.feePaidDate) {
    errors.expiryDate = 'Expiry date must be after fee paid date';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}









