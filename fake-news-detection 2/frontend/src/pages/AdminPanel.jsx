import React, { useEffect, useState, useCallback } from "react";
import { ShieldCheck, ShieldOff, Users, BarChart3 } from "lucide-react";
import { getAllUsers, updateUser, getPlatformAnalytics } from "../services/adminService.js";
import { useAuth } from "../hooks/useAuth.jsx";
import StatCard from "../components/StatCard.jsx";
import { VerdictBreakdownChart } from "../components/Charts.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorBanner, { extractErrorMessage } from "../components/ErrorBanner.jsx";
import { formatDateTime } from "../utils/format.js";

export default function AdminPanel() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    Promise.all([getAllUsers(), getPlatformAnalytics()])
      .then(([usersData, analyticsData]) => {
        setUsers(usersData);
        setAnalytics(analyticsData);
      })
      .catch((err) => setError(extractErrorMessage(err, "Could not load admin data.")))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleActive = async (targetUser) => {
    setUpdatingId(targetUser.id);
    setError(null);
    try {
      const updated = await updateUser(targetUser.id, { is_active: !targetUser.is_active });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      setError(extractErrorMessage(err, "Could not update this user."));
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner label="Loading admin data…" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Admin Panel</h1>
        <p className="mt-1 text-sm text-signal-slate">Manage users and view platform-wide activity.</p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {analytics && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={Users} label="Registered Users" value={users.length} />
          <StatCard icon={BarChart3} label="Total Predictions" value={analytics.total_analyzed} />
          <div className="rounded-card border border-paper-border bg-paper-panel p-5 dark:border-ink-border dark:bg-ink-panel sm:col-span-2 lg:col-span-1">
            <p className="mb-2 text-sm font-medium text-signal-slate">Platform Verdict Mix</p>
            <VerdictBreakdownChart realCount={analytics.real_count} fakeCount={analytics.fake_count} />
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">User Management</h2>
        <div className="overflow-hidden rounded-card border border-paper-border dark:border-ink-border">
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-paper-border bg-paper-panel text-xs uppercase tracking-wide text-signal-slate dark:border-ink-border dark:bg-ink-panel">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Predictions</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-paper-border last:border-0 dark:border-ink-border">
                    <td className="px-4 py-3">
                      <p className="font-medium">{u.full_name || "—"}</p>
                      <p className="text-xs text-signal-slate">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-signal-amber/15 text-signal-amber"
                            : "bg-paper-panel text-signal-slate dark:bg-ink"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{u.prediction_count}</td>
                    <td className="px-4 py-3 text-signal-slate">{formatDateTime(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          u.is_active
                            ? "bg-verdict-realBg text-verdict-real dark:bg-verdict-real/10"
                            : "bg-verdict-fakeBg text-verdict-fake dark:bg-verdict-fake/10"
                        }`}
                      >
                        {u.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleActive(u)}
                        disabled={updatingId === u.id || u.id === currentUser?.id}
                        title={u.id === currentUser?.id ? "You can't deactivate your own account" : ""}
                        className="inline-flex items-center gap-1.5 rounded-md border border-paper-border px-2.5 py-1.5 text-xs font-medium hover:bg-paper-panel disabled:cursor-not-allowed disabled:opacity-40 dark:border-ink-border dark:hover:bg-ink-panel"
                      >
                        {u.is_active ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
