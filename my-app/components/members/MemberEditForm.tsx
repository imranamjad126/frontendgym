'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { validateMemberForm } from '@/lib/utils/validation';
import { MemberWithStatus } from '@/lib/types/member';
import { format } from 'date-fns';
import { FeeType, FEE_AMOUNTS } from '@/lib/types/fee';
import { Select } from '@/components/ui/select';
import { Gender } from '@/lib/types/member';
import { User, Users } from 'lucide-react';

interface MemberEditFormProps {
  member: MemberWithStatus;
  onSave: (updates: Partial<MemberWithStatus>) => void;
  onCancel: () => void;
}

export function MemberEditForm({ member, onSave, onCancel }: MemberEditFormProps) {
  const [formData, setFormData] = useState({
    name: member.name,
    email: member.email,
    phone: member.phone,
    gender: member.gender || undefined,
    feeType: (member.feeType || FeeType.WITHOUT_AC) as FeeType,
    feeAmount: member.feeAmount || FEE_AMOUNTS[member.feeType || FeeType.WITHOUT_AC],
    feePaidDate: format(member.feePaidDate, 'yyyy-MM-dd'),
    expiryDate: format(member.expiryDate, 'yyyy-MM-dd'),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateMemberForm({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      feePaidDate: new Date(formData.feePaidDate),
      expiryDate: new Date(formData.expiryDate),
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSave({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      feeType: formData.feeType,
      feeAmount: formData.feeAmount,
      feePaidDate: new Date(formData.feePaidDate),
      expiryDate: new Date(formData.expiryDate),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Member</CardTitle>
      </CardHeader>
      <CardContent>
        <Form onSubmit={handleSubmit}>
          <FormField>
            <FormLabel htmlFor="edit-name">Name *</FormLabel>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {errors.name && <FormMessage>{errors.name}</FormMessage>}
          </FormField>

          <FormField>
            <FormLabel htmlFor="edit-email">Email *</FormLabel>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            {errors.email && <FormMessage>{errors.email}</FormMessage>}
          </FormField>

          <FormField>
            <FormLabel htmlFor="edit-phone">Phone *</FormLabel>
            <Input
              id="edit-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            {errors.phone && <FormMessage>{errors.phone}</FormMessage>}
          </FormField>

          <FormField>
            <FormLabel htmlFor="edit-gender">Gender *</FormLabel>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={formData.gender === 'Male' ? 'default' : 'outline'}
                onClick={() => handleChange('gender', 'Male')}
                className={`flex-1 ${formData.gender === 'Male' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
              >
                <User className="mr-2 h-4 w-4" />
                Male
              </Button>
              <Button
                type="button"
                variant={formData.gender === 'Female' ? 'default' : 'outline'}
                onClick={() => handleChange('gender', 'Female')}
                className={`flex-1 ${formData.gender === 'Female' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}`}
              >
                <Users className="mr-2 h-4 w-4" />
                Female
              </Button>
            </div>
            {errors.gender && <FormMessage>{errors.gender}</FormMessage>}
          </FormField>

          <FormField>
            <FormLabel htmlFor="edit-feeType">Membership Type *</FormLabel>
            <Select
              id="edit-feeType"
              value={formData.feeType}
              onChange={(e) => {
                const feeType = e.target.value as FeeType;
                setFormData(prev => ({
                  ...prev,
                  feeType,
                  feeAmount: FEE_AMOUNTS[feeType],
                }));
                setErrors(prev => ({ ...prev, feeType: '' }));
              }}
            >
              <option value={FeeType.WITHOUT_AC}>Without AC - ₹{FEE_AMOUNTS[FeeType.WITHOUT_AC]}</option>
              <option value={FeeType.WITH_AC}>With AC - ₹{FEE_AMOUNTS[FeeType.WITH_AC]}</option>
              <option value={FeeType.ONE_DAY}>One Day Payment - ₹{FEE_AMOUNTS[FeeType.ONE_DAY]}</option>
            </Select>
            {errors.feeType && <FormMessage>{errors.feeType}</FormMessage>}
          </FormField>

          <FormField>
            <FormLabel htmlFor="edit-feeAmount">Fee Amount *</FormLabel>
            <Input
              id="edit-feeAmount"
              type="number"
              value={formData.feeAmount}
              onChange={(e) => handleChange('feeAmount', Number(e.target.value))}
              readOnly
              className="bg-slate-50"
            />
            <p className="text-xs text-slate-500 mt-1">
              Automatically set based on membership type
            </p>
          </FormField>

          <FormField>
            <FormLabel htmlFor="edit-feePaidDate">Fee Paid Date *</FormLabel>
            <Input
              id="edit-feePaidDate"
              type="date"
              value={formData.feePaidDate}
              onChange={(e) => handleChange('feePaidDate', e.target.value)}
            />
            {errors.feePaidDate && <FormMessage>{errors.feePaidDate}</FormMessage>}
          </FormField>

          <FormField>
            <FormLabel htmlFor="edit-expiryDate">Expiry Date *</FormLabel>
            <Input
              id="edit-expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleChange('expiryDate', e.target.value)}
            />
            {errors.expiryDate && <FormMessage>{errors.expiryDate}</FormMessage>}
          </FormField>

          <div className="flex gap-3 mt-6">
            <Button type="submit" className="flex-1">Save Changes</Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}




