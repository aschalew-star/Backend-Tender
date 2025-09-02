import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from './Input';
import { Button } from './Button';

const customerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  loading?: boolean;
}

export function CustomerForm({ onSubmit, loading = false }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          {...register('firstName')}
          error={errors.firstName?.message}
          placeholder="Enter your first name"
        />
        <Input
          label="Last Name"
          {...register('lastName')}
          error={errors.lastName?.message}
          placeholder="Enter your last name"
        />
      </div>
      
      <Input
        label="Email Address"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        placeholder="Enter your email address"
      />
      
      <Input
        label="Phone Number"
        {...register('phone')}
        error={errors.phone?.message}
        placeholder="Enter your phone number"
      />
      
      <Input
        label="Password"
        type="password"
        {...register('password')}
        error={errors.password?.message}
        placeholder="Create a password"
      />

      <Button
        type="submit"
        className="w-full"
        loading={loading}
        disabled={loading}
      >
        Continue to Payment
      </Button>
    </form>
  );
}