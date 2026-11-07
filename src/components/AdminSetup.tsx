import { useState } from 'react';
import { Loader2, ShieldCheck, UserPlus, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AdminSetupProps {
  onSuccess: () => void;
  onBack: () => void;
}

/**
 * One-time admin bootstrap screen. Shows only when no admin profile exists yet.
 * The user sets their email + password, which creates an auth account and an
 * admin profile via the complete_signup SECURITY DEFINER function.
 *
 * If the auth account already exists (from a previous half-finished attempt),
 * the app signs in with the provided credentials and then completes the profile.
 */
export default function AdminSetup({ onSuccess, onBack }: AdminSetupProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);

    if (!supabase) {
      setError('Setup is temporarily unavailable.');
      setLoading(false);
      return;
    }

    // Try to create the auth account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    let userId: string | undefined;

    if (signUpError) {
      // If the account already exists, try signing in instead (recovery from
      // a half-finished previous attempt where the auth user was created but
      // the profile wasn't)
      if (signUpError.message.includes('already') || signUpError.message.includes('registered') || signUpError.message.includes('been taken')) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) {
          setError('An account with this email already exists. If this is your email, please sign in with your previous password, or use a different email address.');
          setLoading(false);
          return;
        }
        userId = signInData.user?.id;
      } else {
        setError(signUpError.message || 'Failed to create admin account.');
        setLoading(false);
        return;
      }
    } else {
      userId = signUpData.user?.id;
    }

    if (!userId) {
      setError('Failed to create admin account. Please try again.');
      setLoading(false);
      return;
    }

    // Call complete_signup with no invite token — bootstrap creates admin
    const { data: profileData, error: rpcError } = await supabase.rpc('complete_signup', {
      p_full_name: fullName.trim(),
      p_title: 'Administrator',
      p_phone: null,
      p_photo_url: null,
      p_dealership_name: null,
      p_dealership_address: null,
      p_invite_token: null,
    });

    if (rpcError) {
      // If the error is "Public signup is not available", it means an admin
      // already exists. Try to sign in and go to dashboard.
      if (rpcError.message.includes('invitation is required') || rpcError.message.includes('Public signup')) {
        // Admin already exists — just go to the funnel, the session is valid
        onSuccess();
        return;
      }
      setError(rpcError.message || 'Failed to create admin profile.');
      setLoading(false);
      return;
    }

    // Profile created — the auth context will pick up the session
    void profileData;
    onSuccess();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#b38318]">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Setup</h1>
          <p className="mt-2 text-sm text-slate-400">
            Create your administrator account. This screen only appears once —
            after this, you'll invite new staff from your dashboard.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-2xl"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Jane Smith"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@dealership.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating admin account...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create Admin Account
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to landing page
          </button>
        </div>
      </div>
    </div>
  );
}
