import { useState, useEffect, useCallback } from 'react';
import { Loader2, Mail, Send, Trash2, Clock, CheckCircle2, X, UserPlus, Copy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Invite, Profile } from '@/lib/types';

interface AdminInviteProps {
  onClose: () => void;
}

export default function AdminInvite({ onClose }: AdminInviteProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'sales' | 'admin'>('sales');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [invites, setInvites] = useState<Invite[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [copiedToken, setCopiedToken] = useState('');

  const fetchInvites = useCallback(async () => {
    if (!supabase) return;
    const [{ data: inviteData }, { data: profileData }] = await Promise.all([
      supabase.from('invites').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    ]);
    setInvites((inviteData as Invite[]) || []);
    setProfiles((profileData as Profile[]) || []);
    setLoadingInvites(false);
  }, []);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!supabase) {
      setError('Unable to send invite.');
      setLoading(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from('invites')
      .insert({
        email: email.trim().toLowerCase(),
        role,
      })
      .select()
      .single();

    if (insertError) {
      setError('Failed to create invitation. The email may already have a pending invite.');
      setLoading(false);
      return;
    }

    const invite = data as Invite;
    const siteOrigin = window.location.origin;
    const inviteLink = `${siteOrigin}/#invite=${invite.token}`;

    setSuccess(`Invitation created! Share this link with ${email}:`);
    setEmail('');
    await fetchInvites();
    setLoading(false);

    // Auto-copy the link
    navigator.clipboard.writeText(inviteLink).catch(() => {});
    setCopiedToken(invite.token);
    setTimeout(() => setCopiedToken(''), 3000);
  }

  async function handleDeleteInvite(id: string) {
    if (!supabase) return;
    await supabase.from('invites').delete().eq('id', id);
    await fetchInvites();
  }

  function getInviteLink(token: string) {
    return `${window.location.origin}/#invite=${token}`;
  }

  function copyInviteLink(token: string) {
    navigator.clipboard.writeText(getInviteLink(token));
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(''), 3000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="min-h-screen w-full max-w-2xl rounded-t-2xl bg-white shadow-2xl sm:min-h-0 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Manage Team</h2>
              <p className="text-xs text-slate-500">Invite staff and manage your team</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 px-5 py-5">
          {/* Invite form */}
          <form onSubmit={handleInvite} className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 text-sm font-bold text-slate-900">Invite a New Team Member</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="newperson@dealership.com"
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'sales' | 'admin')}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-4 text-sm text-slate-900 outline-none focus:border-slate-900"
                >
                  <option value="sales">Salesperson — sees only their own leads</option>
                  <option value="admin">Admin — sees all leads, can invite staff</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
            )}
            {success && (
              <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
                <p className="font-semibold">{success}</p>
                <p className="mt-1">The invite link has been copied to your clipboard.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating invitation...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Create Invitation
                </>
              )}
            </button>
          </form>

          {/* Team members */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">Team Members</h3>
            <div className="space-y-2">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                      {p.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{p.full_name}</p>
                      <p className="text-xs text-slate-500">{p.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      p.role === 'admin'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {p.role === 'admin' ? 'Admin' : 'Sales'}
                    </span>
                    {p.profile_setup_complete ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-slate-300" />
                    )}
                  </div>
                </div>
              ))}
              {profiles.length === 0 && !loadingInvites && (
                <p className="text-center text-sm text-slate-400 py-4">No team members yet.</p>
              )}
            </div>
          </div>

          {/* Pending invites */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">Pending Invitations</h3>
            <div className="space-y-2">
              {invites.filter((i) => !i.accepted_at).map((invite) => {
                const expired = new Date(invite.expires_at) < new Date();
                return (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{invite.email}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <code className="truncate rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          {getInviteLink(invite.token)}
                        </code>
                      </div>
                      <p className={`mt-1 text-xs ${expired ? 'text-rose-500' : 'text-slate-400'}`}>
                        {expired ? 'Expired' : `Expires ${new Date(invite.expires_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyInviteLink(invite.token)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        title="Copy invite link"
                      >
                        {copiedToken === invite.token ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteInvite(invite.id)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        title="Delete invite"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {invites.filter((i) => !i.accepted_at).length === 0 && !loadingInvites && (
                <p className="text-center text-sm text-slate-400 py-4">No pending invitations.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
