'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface DemoCredential {
  role: string;
  email: string;
  password: string;
  description: string;
}

const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    role: 'Student',
    email: 'sneha.agarwal@fnd.edu',
    password: 'Student@2026',
    description: 'Full analysis access, prediction history',
  },
  {
    role: 'Admin',
    email: 'admin@fakenewsdetector.ai',
    password: 'Admin@Secure99',
    description: 'User management, system statistics',
  },
];

interface Props {
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    // Backend integration: POST /api/auth/login
    // const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
    //   email: data.email, password: data.password
    // });
    // const { token } = response.data;
    // localStorage.setItem('jwt_token', token);

    await new Promise((r) => setTimeout(r, 1400));

    const isValid = DEMO_CREDENTIALS.some(
      (c) => c.email === data.email && c.password === data.password
    );

    if (!isValid) {
      setError('password', {
        message: 'Invalid credentials — use the demo accounts below to sign in',
      });
      setIsLoading(false);
      return;
    }

    toast.success('Signed in successfully', {
      description: `Welcome back, ${data.email.split('@')[0]}!`,
    });
    router.push('/');
  };

  const autofill = (cred: DemoCredential) => {
    setValue('email', cred.email);
    setValue('password', cred.password);
    toast.info(`${cred.role} credentials loaded`, { duration: 2000 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-700" style={{ color: 'var(--foreground)' }}>
          Sign in to your account
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Access your news analysis dashboard and prediction history
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-600" style={{ color: 'var(--foreground)' }}>
            Email Address
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
            placeholder="you@example.com"
            className={`input-field ${errors.email ? 'error' : ''}`}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-xs font-500" style={{ color: 'var(--danger)' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-sm font-600" style={{ color: 'var(--foreground)' }}>
            Password
          </label>
          <div className="relative">
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className={`input-field pr-10 ${errors.password ? 'error' : ''}`}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
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

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            {...register('rememberMe')}
            type="checkbox"
            id="rememberMe"
            className="w-4 h-4 rounded"
            style={{ accentColor: 'var(--primary)' }}
          />
          <label
            htmlFor="rememberMe"
            className="text-sm"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Remember me for 30 days
          </label>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
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
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Demo credentials */}
      <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        <div
          className="px-4 py-2.5 flex items-center gap-2"
          style={{ backgroundColor: 'var(--secondary)' }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: 'var(--primary)' }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="text-xs font-600" style={{ color: 'var(--primary)' }}>
            Demo Credentials — Click to autofill
          </span>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {DEMO_CREDENTIALS.map((cred) => (
            <button
              key={`demo-${cred.role}`}
              type="button"
              onClick={() => autofill(cred)}
              className="w-full px-4 py-3 text-left transition-colors"
              style={{ backgroundColor: 'var(--card)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--secondary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--card)';
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-800"
                    style={{
                      background:
                        cred.role === 'Admin'
                          ? 'linear-gradient(135deg, var(--accent), #BE185D)'
                          : 'linear-gradient(135deg, var(--primary), #4338CA)',
                      color: 'white',
                    }}
                  >
                    {cred.role[0]}
                  </span>
                  <div>
                    <p className="text-xs font-700" style={{ color: 'var(--foreground)' }}>
                      {cred.role}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {cred.email}
                    </p>
                  </div>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-600"
                  style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}
                >
                  Use →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-600 transition-colors"
          style={{ color: 'var(--primary)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#4338CA';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary)';
          }}
        >
          Create account
        </button>
      </p>
    </div>
  );
}
