'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface RegisterFormValues {
  fullName: string;
  email: string;
  institution: string;
  role: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface Props {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      fullName: '',
      email: '',
      institution: '',
      role: 'Student',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);

    // Backend integration: POST /api/auth/register
    // await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
    //   fullName: data.fullName, email: data.email, password: data.password,
    //   institution: data.institution, role: data.role
    // });

    await new Promise((r) => setTimeout(r, 1600));

    toast.success('Account created successfully!', {
      description: 'You can now sign in with your credentials',
    });
    setIsLoading(false);
    onSwitchToLogin();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-700" style={{ color: 'var(--foreground)' }}>
          Create your account
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Join thousands of researchers using AI to verify news
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-600" style={{ color: 'var(--foreground)' }}>
            Full Name <span className="text-danger">*</span>
          </label>
          <input
            {...register('fullName', {
              required: 'Full name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            })}
            type="text"
            placeholder="Sneha Agarwal"
            className={`input-field ${errors.fullName ? 'error' : ''}`}
            autoComplete="name"
          />
          {errors.fullName && (
            <p className="text-xs font-500" style={{ color: 'var(--danger)' }}>
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-600" style={{ color: 'var(--foreground)' }}>
            Email Address <span className="text-danger">*</span>
          </label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
            type="email"
            placeholder="you@university.edu"
            className={`input-field ${errors.email ? 'error' : ''}`}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-xs font-500" style={{ color: 'var(--danger)' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Institution + Role row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-600" style={{ color: 'var(--foreground)' }}>
              Institution
            </label>
            <input
              {...register('institution')}
              type="text"
              placeholder="University / Org"
              className="input-field"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-600" style={{ color: 'var(--foreground)' }}>
              Role
            </label>
            <select {...register('role')} className="input-field">
              {['Student', 'Researcher', 'Journalist', 'Educator', 'Other'].map((r) => (
                <option key={`role-${r}`} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-sm font-600" style={{ color: 'var(--foreground)' }}>
            Password <span className="text-danger">*</span>
          </label>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Minimum 8 characters with at least one uppercase and one number
          </p>
          <div className="relative">
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*\d)/,
                  message: 'Include at least one uppercase letter and one number',
                },
              })}
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              className={`input-field pr-10 ${errors.password ? 'error' : ''}`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--muted-foreground)' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-500" style={{ color: 'var(--danger)' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label className="block text-sm font-600" style={{ color: 'var(--foreground)' }}>
            Confirm Password <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === passwordValue || 'Passwords do not match',
              })}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat your password"
              className={`input-field pr-10 ${errors.confirmPassword ? 'error' : ''}`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--muted-foreground)' }}
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirm ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs font-500" style={{ color: 'var(--danger)' }}>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Terms */}
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <input
              {...register('agreeTerms', {
                required: 'You must agree to the terms to continue',
              })}
              type="checkbox"
              id="agreeTerms"
              className="w-4 h-4 mt-0.5 rounded flex-shrink-0"
              style={{ accentColor: 'var(--primary)' }}
            />
            <label htmlFor="agreeTerms" className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              I agree to the{' '}
              <span className="font-600 cursor-pointer" style={{ color: 'var(--primary)' }}>
                Terms of Service
              </span>{' '}
              and{' '}
              <span className="font-600 cursor-pointer" style={{ color: 'var(--primary)' }}>
                Privacy Policy
              </span>
              . This system is for educational and research purposes only.
            </label>
          </div>
          {errors.agreeTerms && (
            <p className="text-xs font-500" style={{ color: 'var(--danger)' }}>
              {errors.agreeTerms.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3"
        >
          {isLoading ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <p className="text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-600 transition-colors"
          style={{ color: 'var(--primary)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#4338CA';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary)';
          }}
        >
          Sign in instead
        </button>
      </p>
    </div>
  );
}