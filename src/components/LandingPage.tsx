import { useEffect, useState } from 'react';
import {
  Award,
  Car,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Loader2,
  User,
} from 'lucide-react';
import LeadForm from './LeadForm';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/types';
import { getPalette, type Palette } from '@/lib/palettes';

interface LandingPageProps {
  onGoToFunnel: () => void;
  repSlug?: string;
}

const FALLBACK_PROFILE: Profile = {
  id: '',
  email: '',
  full_name: '',
  title: 'Sales & Leasing Consultant',
  slug: '',
  photo_url: null,
  phone: '',
  dealership_name: 'Mark Christopher Auto Center',
  dealership_address: '2131 Convention Center Way\nOntario, CA 91764',
  role: 'sales',
  profile_setup_complete: false,
  theme_palette: null,
  created_at: '',
  updated_at: '',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function LandingPage({ onGoToFunnel, repSlug }: LandingPageProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const slug = repSlug || '';
      if (!slug) {
        setProfile(FALLBACK_PROFILE);
        setLoading(false);
        return;
      }
      if (!supabase) {
        setProfile(FALLBACK_PROFILE);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (data) {
        setProfile(data as Profile);
      } else {
        setProfile(FALLBACK_PROFILE);
      }
      setLoading(false);
    }

    loadProfile();
  }, [repSlug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f5f2]">
        <Loader2 className="h-8 w-8 animate-spin text-[#b38318]" />
      </div>
    );
  }

  const p = profile || FALLBACK_PROFILE;
  const pal: Palette = getPalette(p.theme_palette);
  const hasPhoto = Boolean(p.photo_url);
  const photoSrc = p.photo_url || '';
  const initials = getInitials(p.full_name);
  const addressLines = (p.dealership_address || '').split('\n').filter(Boolean);
  const firstName = p.full_name.split(' ')[0] || p.full_name;

  return (
    <div className="min-h-screen text-[#111111]" style={{ background: pal.pageBg }}>
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-white"
              style={{ background: pal.accent }}
            >
              <Car className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#111111]">
                {p.full_name}
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.16em]" style={{ color: pal.accentMuted }}>
                {p.title}
              </p>
            </div>
          </div>
          <button
            onClick={onGoToFunnel}
            className="rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#6b6b6b] transition hover:bg-slate-100 hover:text-[#111111] sm:px-4 sm:text-sm"
          >
            Staff Login
          </button>
        </div>
      </header>

      <main>
        {/* Hero — unified layout for mobile and desktop */}
        <section
          className="relative isolate overflow-hidden border-b text-white"
          style={{
            background: pal.dark,
            borderBottomColor: `${pal.borderAccent}30`,
          }}
        >
          {/* Desktop: photo on the right with gradient blend */}
          <div className="absolute inset-y-0 right-0 hidden w-[58%] sm:block">
            {hasPhoto ? (
              <img
                src={photoSrc}
                alt={`${p.full_name}, ${p.title || 'sales consultant'}`}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div
                className="flex h-full w-full flex-col items-center justify-center"
                style={{ background: `linear-gradient(to bottom right, ${pal.darkSoft}, ${pal.dark})` }}
              >
                <div
                  className="flex h-40 w-40 items-center justify-center rounded-full"
                  style={{
                    background: `${pal.accent}33`,
                    boxShadow: `0 0 0 4px ${pal.accent}4d`,
                  }}
                >
                  {initials ? (
                    <span className="text-5xl font-black tracking-wide" style={{ color: pal.accentBright }}>
                      {initials}
                    </span>
                  ) : (
                    <User className="h-16 w-16" style={{ color: `${pal.accentBright}99` }} />
                  )}
                </div>
              </div>
            )}
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to right, ${pal.dark}, ${pal.dark}bf, transparent)` }}
            />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to top, ${pal.dark}99, transparent, ${pal.dark}1a)` }}
            />
          </div>

          {/* Mobile: photo as full-bleed background with gradient blend (same approach as desktop) */}
          <div className="absolute inset-0 sm:hidden">
            {hasPhoto ? (
              <img
                src={photoSrc}
                alt={`${p.full_name}, ${p.title || 'sales consultant'}`}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div
                className="flex h-full w-full flex-col items-center justify-center"
                style={{ background: `linear-gradient(to bottom right, ${pal.darkSoft}, ${pal.dark})` }}
              >
                <div
                  className="flex h-32 w-32 items-center justify-center rounded-full"
                  style={{
                    background: `${pal.accent}33`,
                    boxShadow: `0 0 0 4px ${pal.accent}4d`,
                  }}
                >
                  {initials ? (
                    <span className="text-4xl font-black tracking-wide" style={{ color: pal.accentBright }}>
                      {initials}
                    </span>
                  ) : (
                    <User className="h-12 w-12" style={{ color: `${pal.accentBright}99` }} />
                  )}
                </div>
              </div>
            )}
            {/* Gradient overlays — top fade in, bottom fade out, left-to-right darkening for text readability */}
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to bottom, ${pal.dark}ee, ${pal.dark}55 30%, ${pal.dark}44 55%, ${pal.dark}dd 85%, ${pal.dark})` }}
            />
          </div>

          <div className="relative mx-auto flex min-h-[600px] max-w-6xl items-center px-4 py-16 sm:px-6 sm:py-20">
            <div className="relative z-10 max-w-2xl sm:-mr-24">
              <div
                className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold uppercase tracking-[0.2em] sm:text-sm"
                style={{ color: pal.accentBright }}
              >
                <span>Chevrolet</span>
                <span style={{ color: pal.divider }}>|</span>
                <span>Buick</span>
                <span style={{ color: pal.divider }}>|</span>
                <span>GMC</span>
                <span style={{ color: pal.divider }}>|</span>
                <span>Cadillac</span>
              </div>
              <div className="h-px w-20" style={{ background: pal.heroLine }} />
              <h1 className="mt-6 max-w-2xl text-4xl font-black uppercase leading-[1.04] tracking-tight text-white sm:text-6xl">
                Let&apos;s get you on the road.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#e4e4e4] sm:text-lg">
                Looking for your next GM vehicle or ready to sell your current one? Share a few details and {firstName}&apos;ll help you take the next step.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold text-[#f4f1e8]">
                {['Transparent pricing', 'No pressure', 'Fast response', 'Professional service'].map((label, i) => {
                  const Icon = i === 2 ? Clock3 : CheckCircle2;
                  return (
                    <span
                      key={label}
                      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-sm"
                      style={{
                        borderColor: `${pal.badgeBorder}b3`,
                        background: `${pal.badgeBg}e6`,
                      }}
                    >
                      <Icon className="h-4 w-4" style={{ color: pal.accentBright }} />
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="lead-form" className="py-12 sm:py-16">
          <div className="mx-auto max-w-2xl px-4 sm:px-6">
            <div className="mb-7 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: pal.accentTint }}>
                Start here
              </p>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-[#111111] sm:text-4xl">
                How can {firstName} help?
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#666666] sm:text-base">
                Tell us whether you&apos;re buying or selling, and {firstName}&apos;ll be in touch within one business day.
              </p>
            </div>
            <LeadForm repSlug={p.slug} />
          </div>
        </section>

        <section
          className="border-y border-black/10 py-10 text-white sm:py-12"
          style={{ background: pal.dark }}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-8 sm:grid-cols-3">
              <TrustItem
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Straightforward guidance"
                text="Clear answers and a simple process from first conversation to keys in hand."
                accent={pal.accent}
              />
              <TrustItem
                icon={<Award className="h-5 w-5" />}
                title="Full GM lineup"
                text="One contact for Chevrolet, Buick, GMC, and Cadillac vehicles."
                accent={pal.accent}
              />
              <TrustItem
                icon={<Sparkles className="h-5 w-5" />}
                title="Value for your vehicle"
                text="Get a thoughtful appraisal when you are ready to sell or trade."
                accent={pal.accent}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#111111]">{p.full_name}</p>
              <p className="mt-2 text-sm text-[#666666]">{p.title}</p>
            </div>
            <div className="space-y-3 text-sm text-[#555555]">
              {p.phone && (
                <p className="flex items-center gap-3"><Phone className="h-4 w-4" style={{ color: pal.accent }} />{p.phone}</p>
              )}
              {p.email && (
                <p className="flex items-center gap-3"><Mail className="h-4 w-4" style={{ color: pal.accent }} />{p.email}</p>
              )}
            </div>
            <div className="space-y-3 text-sm text-[#555555]">
              {addressLines.length > 0 && (
                <p className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: pal.accent }} />{addressLines.map((line, i) => <span key={i} className="block">{line}</span>)}</p>
              )}
            </div>
          </div>
          <div className="mt-8 border-t border-black/10 pt-5 text-xs text-[#888888]">
            {p.dealership_name || 'Mark Christopher Auto Center'} · Chevrolet · Buick · GMC · Cadillac
          </div>
        </div>
      </footer>
    </div>
  );
}

function TrustItem({
  icon,
  title,
  text,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  accent: string;
}) {
  return (
    <div className="flex gap-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: accent }}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-white">{title}</h3>
        <p className="mt-1.5 text-sm leading-6 text-[#c8c8c8]">{text}</p>
      </div>
    </div>
  );
}
