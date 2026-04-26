"use client";

import { useState } from "react";
import DynamicLayout from "@/components/DynamicLayout";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/SectionCard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

export default function SettingsPage() {
  const { user, token, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!user || !token) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await apiFetch<{ user: any }>("/api/auth/profile", {
        method: "POST",
        body: JSON.stringify({ name, email }),
      }, token);
      
      setUser(data.user);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiFetch("/api/auth/password", {
        method: "POST",
        body: JSON.stringify({ password }),
      }, token);
      
      setPassword("");
      setSuccess("Password changed successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DynamicLayout>
      <div className="p-6 max-w-4xl mx-auto animate-fade-in">
        <PageHeader 
          title="Account Settings" 
          description="Manage your account preferences and security settings."
        />

        {error && (
          <div className="mb-6 rounded-lg border border-[var(--color-danger-soft)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-lg border border-[var(--color-success-soft)] bg-[var(--color-success-soft)] px-4 py-3 text-sm text-[var(--color-success)]">
            {success}
          </div>
        )}

        <div className="grid gap-6">
          {/* Profile Settings */}
          <SectionCard title="Personal Information" subtitle="Update your display name and email address.">
            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
              <div>
                <label className="block text-[13px] font-medium text-[var(--color-text)] mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--color-text)] mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </SectionCard>

          {/* Security Settings */}
          <SectionCard title="Security" subtitle="Change your password to keep your account secure.">
            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-[13px] font-medium text-[var(--color-text)] mb-1.5">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" variant="secondary" disabled={loading || !password}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </SectionCard>
        </div>
      </div>
    </DynamicLayout>
  );
}
