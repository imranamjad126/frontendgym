'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Form, FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/status/StatusBadge';
import { validateMemberForm } from '@/lib/utils/validation';
import { calculateMembershipStatus } from '@/lib/utils/status';
import { MembershipStatus } from '@/lib/types/status';
import { FeeType, FEE_AMOUNTS } from '@/lib/types/fee';
import { Gender } from '@/lib/types/member';
import { User, Users } from 'lucide-react';

interface MemberFormData {
  name: string;
  email: string;
  phone: string;
  gender?: Gender;
  feeType: FeeType;
  feePaidDate: string;
  expiryDate: string;
}

interface MemberFormProps {
  initialData?: Partial<MemberFormData>;
  onSubmit: (data: MemberFormData & { feeType: FeeType }) => void;
  submitLabel?: string;
}

export function MemberForm({ initialData, onSubmit, submitLabel = 'Save Member' }: MemberFormProps) {
  const [formData, setFormData] = useState<MemberFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    gender: (initialData as any)?.gender || undefined,
    feeType: (initialData as any)?.feeType || FeeType.WITHOUT_AC,
    feePaidDate: initialData?.feePaidDate || '',
    expiryDate: initialData?.expiryDate || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewStatus, setPreviewStatus] = useState<MembershipStatus | null>(null);

  // Auto-set dates when fee type changes
  useEffect(() => {
    if (formData.feeType && !formData.feePaidDate) {
      const today = new Date();
      const feePaidDate = formatDateForInput(today);
      const expiryDate = new Date(today);
      
      // For One Day Payment, expiry is same day (1 day)
      // For monthly fees, expiry is 30 days
      if (formData.feeType === FeeType.ONE_DAY) {
        expiryDate.setDate(expiryDate.getDate() + 1);
      } else {
        expiryDate.setDate(expiryDate.getDate() + 30);
      }
      
      setFormData(prev => ({
        ...prev,
        feePaidDate,
        expiryDate: formatDateForInput(expiryDate),
      }));
    }
  }, [formData.feeType]);

  function formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  const handleChange = (field: keyof MemberFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));

    // Update status preview when expiry date changes
    if (field === 'expiryDate' && value) {
      try {
        const expiryDate = new Date(value);
        if (!isNaN(expiryDate.getTime())) {
          const status = calculateMembershipStatus(expiryDate);
          setPreviewStatus(status);
        }
      } catch {
        setPreviewStatus(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate gender
    if (!formData.gender) {
      setErrors(prev => ({ ...prev, gender: 'Please select gender' }));
      return;
    }
    
    const validation = validateMemberForm({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      feePaidDate: formData.feePaidDate ? new Date(formData.feePaidDate) : undefined,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{submitLabel}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form onSubmit={handleSubmit}>
          <FormField>
            <FormLabel htmlFor="name">Name *</FormLabel>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="John Doe"
            />
            {errors.name && <FormMessage>{errors.name}</FormMessage>}
          </FormField>

          <FormField>
            <FormLabel htmlFor="email">Email *</FormLabel>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john@example.com"
            />
            {errors.email && <FormMessage>{errors.email}</FormMessage>}
          </FormField>

          <FormField>
            <FormLabel htmlFor="phone">Phone *</FormLabel>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 555-0100"
            />
            {errors.phone && <FormMessage>{errors.phone}</FormMessage>}
          </FormField>

          <FormField>
            <FormLabel htmlFor="gender">Gender *</FormLabel>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={formData.gender === 'Male' ? 'default' : 'outline'}
                onClick={() => {
                  setFormData(prev => ({ ...prev, gender: 'Male' }));
                  setErrors(prev => ({ ...prev, gender: '' }));
                }}
                className={`flex-1 ${formData.gender === 'Male' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
              >
                <User className="mr-2 h-4 w-4" />
                Male
              </Button>
              <Button
                type="button"
                variant={formData.gender === 'Female' ? 'default' : 'outline'}
                onClick={() => {
                  setFormData(prev => ({ ...prev, gender: 'Female' }));
                  setErrors(prev => ({ ...prev, gender: '' }));
                }}
                className={`flex-1 ${formData.gender === 'Female' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}`}
              >
                <Users className="mr-2 h-4 w-4" />
                Female
              </Button>
            </div>
            {errors.gender && <FormMessage>{errors.gender}</FormMessage>}
          </FormField>

          <FormField>
            <FormLabel htmlFor="feeType">Fee Type *</FormLabel>
            <Select
              id="feeType"
              value={formData.feeType}
              onChange={(e) => {
                const feeType = e.target.value as FeeType;
                setFormData(prev => {
                  const today = new Date();
                  const feePaidDate = formatDateForInput(today);
                  const expiryDate = new Date(today);
                  
                  // For One Day Payment, expiry is same day (1 day)
                  // For monthly fees, expiry is 30 days
                  if (feeType === FeeType.ONE_DAY) {
                    expiryDate.setDate(expiryDate.getDate() + 1);
                  } else {
                    expiryDate.setDate(expiryDate.getDate() + 30);
                  }
                  
                  return {
                    ...prev,
                    feeType,
                    feePaidDate,
                    expiryDate: formatDateForInput(expiryDate),
                  };
                });
                setErrors(prev => ({ ...prev, feeType: '' }));
              }}
            >
              <option value={FeeType.WITHOUT_AC}>Without AC - ₹{FEE_AMOUNTS[FeeType.WITHOUT_AC]}</option>
              <option value={FeeType.WITH_AC}>With AC - ₹{FEE_AMOUNTS[FeeType.WITH_AC]}</option>
              <option value={FeeType.ONE_DAY}>One Day Payment - ₹{FEE_AMOUNTS[FeeType.ONE_DAY]}</option>
            </Select>
            {errors.feeType && <FormMessage>{errors.feeType}</FormMessage>}
            <p className="text-xs text-slate-500 mt-1">
              Fee Amount: ₹{FEE_AMOUNTS[formData.feeType]} | 
              Expiry: {formData.feeType === FeeType.ONE_DAY ? '1 day' : '30 days'} from payment
            </p>
          </FormField>

          <FormField>
            <FormLabel htmlFor="feePaidDate">Fee Paid Date *</FormLabel>
            <Input
              id="feePaidDate"
              type="date"
              value={formData.feePaidDate}
              onChange={(e) => {
                const feePaidDate = e.target.value;
                const paidDate = new Date(feePaidDate);
                const expiryDate = new Date(paidDate);
                expiryDate.setDate(expiryDate.getDate() + 30);
                
                setFormData(prev => ({
                  ...prev,
                  feePaidDate,
                  expiryDate: formatDateForInput(expiryDate),
                }));
                setErrors(prev => ({ ...prev, feePaidDate: '' }));
              }}
            />
            {errors.feePaidDate && <FormMessage>{errors.feePaidDate}</FormMessage>}
          </FormField>

          <FormField>
            <FormLabel htmlFor="expiryDate">Expiry Date *</FormLabel>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleChange('expiryDate', e.target.value)}
            />
            {errors.expiryDate && <FormMessage>{errors.expiryDate}</FormMessage>}
            {previewStatus && (
              <div className="mt-2">
                <p className="text-sm text-slate-600 mb-1">Status Preview:</p>
                <StatusBadge status={previewStatus} />
              </div>
            )}
          </FormField>

          <Button type="submit" className="w-full mt-6">
            {submitLabel}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}

