import { useState } from 'react';
import { Loader2, User, Briefcase, Phone, MapPin, Building2, Save, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface ProfileSetupProps {
  onComplete: () => void;
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [title, setTitle] = useState(profile?.title || 'Sales & Leasing Consultant');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [photoUrl, setPhotoUrl] = useState(profile?.photo_url || '');
  const [dealershipName, setDealershipName] = useState(profile?.dealership_name || 'Mark Christopher Auto Center');
  const [dealershipAddress, setDealershipAddress] = useState(profile?.dealership_address || '2131 Convention Center Way\nOntario, CA 91764');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const personalLink = profile ? `${siteOrigin}/?rep=${profile.slug}` : '';

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!supabase || !profile) {
      setError('Unable to save profile.');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        title: title.trim() || null,
        phone: phone.trim() || null,
        photo_url: photoUrl.trim() || null,
        dealership_name: dealershipName.trim() || null,
        dealership_address: dealershipAddress.trim() || null,
        profile_setup_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (updateError) {
      setError('Failed to save profile. Please try again.');
      setLoading(false);
      return;
    }

    await refreshProfile();
    setLoading(false);
    onComplete();
  }

  function copyLink() {
    if (personalLink) {
      navigator.clipboard.writeText(personalLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Set Up Your Profile</h1>
          <p className="mt-2 text-sm text-slate-600">
            This information appears on your personal landing page that you share with customers.
          </p>
        </div>

        {profile && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900">
                <LinkIcon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Your Personal Customer Link
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 truncate rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
                    {personalLink}
                  </code>
                  <button
                    onClick={copyLink}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Share this link with customers. Leads submitted from this page will appear in your dashboard.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-5">
            <Field
              icon={<User className="h-4 w-4" />}
              label="Full Name"
              value={fullName}
              onChange={setFullName}
              required
              placeholder="Richard Chiang"
            />
            <Field
              icon={<Briefcase className="h-4 w-4" />}
              label="Job Title"
              value={title}
              onChange={setTitle}
              placeholder="Sales & Leasing Consultant"
            />
            <Field
              icon={<Phone className="h-4 w-4" />}
              label="Phone Number"
              value={phone}
              onChange={setPhone}
              placeholder="(626) 498-4820"
            />
            <Field
              icon={<LinkIcon className="h-4 w-4" />}
              label="Photo URL"
              value={photoUrl}
              onChange={setPhotoUrl}
              placeholder="Link to your headshot photo"
            />
            <Field
              icon={<Building2 className="h-4 w-4" />}
              label="Dealership Name"
              value={dealershipName}
              onChange={setDealershipName}
              placeholder="Mark Christopher Auto Center"
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Dealership Address
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <textarea
                  value={dealershipAddress}
                  onChange={(e) => setDealershipAddress(e.target.value)}
                  rows={2}
                  placeholder="2131 Convention Center Way&#10;Ontario, CA 91764"
                  className="w-full resize-none rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
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
            disabled={loading || !fullName.trim()}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save & Continue
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />
      </div>
    </div>
  );
}


