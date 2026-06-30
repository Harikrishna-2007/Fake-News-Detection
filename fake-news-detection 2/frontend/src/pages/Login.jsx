import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ScanLine, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";
import ErrorBanner, { extractErrorMessage } from "../components/ErrorBanner.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, "Incorrect email or password."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 dark:bg-ink">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-ink font-display text-lg font-bold text-paper dark:bg-paper dark:text-ink">
            V
          </span>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-signal-slate">Sign in to verify the news.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-card border border-paper-border bg-paper-panel p-6 shadow-stamp dark:border-ink-border dark:bg-ink-panel">
          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-card border border-paper-border bg-paper px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-signal-amber dark:border-ink-border dark:bg-ink"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-card border border-paper-border bg-paper px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-signal-amber dark:border-ink-border dark:bg-ink"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-card bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-paper dark:text-ink"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ScanLine size={16} />}
            Sign in
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-signal-slate">
          Don&rsquo;t have an account?{" "}
          <Link to="/register" className="font-medium text-ink underline-offset-2 hover:underline dark:text-paper">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
