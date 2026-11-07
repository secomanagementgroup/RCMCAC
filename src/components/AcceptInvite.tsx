import { useState, useEffect } from 'react';
import { Loader2, Mail, Lock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AcceptInviteProps {
  token: string;
  onSuccess: () => void;
}

interface InviteInfo {
  email: string;
  role: string;
  expires_at: string;
  accepted_at: string | null;
}

export default function AcceptInvite({ token, onSuccess }: AcceptInviteProps) {
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [checking, setChecking] = useState(true);
  const [inviteError, setInviteError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function checkInvite() {
      if (!supabase) {
        setInviteError('Invite verification is temporarily unavailable.');
        setChecking(false);
        return;
      }

      const { data, error: rpcError } = await supabase.rpc('validate_invite', {
        p_token: token,
      });

      if (rpcError || !data || (data as InviteInfo[]).length === 0) {
        setInviteError('This invitation is invalid, expired, or has already been used.');
        setChecking(false);
        return;
      }

      const info = (data as InviteInfo[])[0];
      if (info.accepted_at) {
        setInviteError('This invitation has already been used.');
        setChecking(false);
        return;
      }
      if (new Date(info.expires_at) < new Date()) {
        setInviteError('This invitation has expired. Please ask your administrator for a new one.');
        setChecking(false);
        return;
      }

      setInviteInfo(info);
      setChecking(false);
    }

    checkInvite();
  }, [token]);

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
    if (!inviteInfo) return;

    setLoading(true);

    if (!supabase) {
      setError('Setup is temporarily unavailable.');
      setLoading(false);
      return;
    }

    // Create the auth account with the invited email
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: inviteInfo.email,
      password,
    });

    if (signUpError) {
      // If user already exists, they may need to sign in instead
      if (signUpError.message.includes('already') || signUpError.message.includes('registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(signUpError.message || 'Failed to create account.');
      }
      setLoading(false);
      return;
    }

    if (!signUpData.user) {
      setError('Failed to create account. Please try again.');
      setLoading(false);
      return;
    }

    // Create the profile via complete_signup with the invite token
    const { data: profileData, error: rpcError } = await supabase.rpc('complete_signup', {
      p_full_name: fullName.trim(),
      p_title: null,
      p_phone: null,
      p_photo_url: null,
      p_dealership_name: null,
      p_dealership_address: null,
      p_invite_token: token,
    });

    if (rpcError) {
      setError(rpcError.message || 'Failed to complete signup.');
      setLoading(false);
      return;
    }

    void profileData;
    onSuccess();
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100">
            <AlertCircle className="h-7 w-7 text-rose-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Invitation Invalid</h1>
          <p className="mt-3 text-sm text-slate-600">{inviteError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600">
            <Mail className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Accept Your Invitation</h1>
          <p className="mt-2 text-sm text-slate-400">
            You've been invited to join the team. Set up your account to get started.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-2xl"
        >
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3">
            <Mail className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-xs font-medium text-emerald-700">Account Email</p>
              <p className="text-sm font-semibold text-emerald-900">{inviteInfo?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Richard Chiang"
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="At least 8 characters"
                    className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat password"
                    className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
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
                Creating your account...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Accept & Create Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
