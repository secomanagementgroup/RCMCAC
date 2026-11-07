import { useState, useRef, useCallback } from 'react';
import { Loader2, User, Briefcase, Phone, MapPin, Building2, Save, Link as LinkIcon, UploadCloud, ImageIcon, X } from 'lucide-react';
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
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseUrl = (() => {
    if (typeof window === 'undefined') return '';
    const path = window.location.pathname.replace(/index\.html$/, '');
    const normalized = path.endsWith('/') ? path : path + '/';
    return window.location.origin + normalized;
  })();
  const personalLink = profile ? `${baseUrl}?rep=${profile.slug}` : '';

  const handleFile = useCallback(async (file: File) => {
    if (!supabase || !profile) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }

    setError('');
    setUploading(true);

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${profile.id}/photo.${ext}`;

    // Delete any existing photo first (in case the extension changed)
    await supabase.storage.from('profile-photos').remove([`${profile.id}/photo.jpg`, `${profile.id}/photo.png`, `${profile.id}/photo.webp`, `${profile.id}/photo.gif`]);

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      setError('Failed to upload photo. Please try again.');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName);

    setPhotoUrl(urlData.publicUrl);
    setUploading(false);
  }, [profile, supabase]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function removePhoto() {
    setPhotoUrl('');
  }

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
      setError(`Failed to save profile: ${updateError.message}`);
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
            {/* Photo upload */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Profile Photo
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />
              {photoUrl ? (
                <div className="relative inline-block">
                  <img
                    src={photoUrl}
                    alt="Profile preview"
                    className="h-32 w-32 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg transition hover:bg-rose-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 block text-xs font-medium text-slate-500 underline transition hover:text-slate-700"
                  >
                    Change photo
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition ${
                    dragOver
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                      <p className="mt-3 text-sm text-slate-500">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <UploadCloud className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="mt-3 text-sm font-medium text-slate-700">
                        Drag & drop your photo here
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        or click to browse — JPG, PNG, or WebP (max 5MB)
                      </p>
                      <p className="mt-2 text-xs font-medium text-amber-600">
                        Your landing page will show your initials instead of a photo until you upload one.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            <Field
              icon={<User className="h-4 w-4" />}
              label="Full Name"
              value={fullName}
              onChange={setFullName}
              required
              placeholder="Your full name"
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

void ImageIcon;

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
