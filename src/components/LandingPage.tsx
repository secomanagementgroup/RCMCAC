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
} from 'lucide-react';
import LeadForm from './LeadForm';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/types';

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
  photo_url: 'images/5145370146758135874_121.jpg',
  phone: '(626) 498-4820',
  dealership_name: 'Mark Christopher Auto Center',
  dealership_address: '2131 Convention Center Way\nOntario, CA 91764',
  role: 'sales',
  profile_setup_complete: false,
  created_at: '',
  updated_at: '',
};

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
  const photoSrc = p.photo_url || 'images/5145370146758135874_121.jpg';
  const addressLines = (p.dealership_address || '').split('\n').filter(Boolean);

  return (
    <div className="min-h-screen bg-[#f6f5f2] text-[#111111]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b38318] text-white">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#111111]">
                {p.full_name}
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#7a5a13]">
                {p.title}
              </p>
            </div>
          </div>
          <button
            onClick={onGoToFunnel}
            className="rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#6b6b6b] transition hover:bg-[#f3f0e7] hover:text-[#111111] sm:px-4 sm:text-sm"
          >
            Staff Login
          </button>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden border-b border-[#b38318]/30 bg-[#111111] text-white">
          <div className="absolute inset-y-0 right-0 hidden w-[58%] sm:block">
            <img
              src={photoSrc}
              alt={`${p.full_name}, ${p.title || 'sales consultant'}`}
              className="h-full w-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#111111]/75 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/60 via-transparent to-[#111111]/10" />
          </div>
          <div className="relative mx-auto flex min-h-[600px] max-w-6xl items-center px-4 py-16 sm:px-6 sm:py-20">
            <div className="relative z-10 max-w-2xl sm:-mr-24">
              <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold uppercase tracking-[0.2em] text-[#e0bb54] sm:text-sm">
                <span>Chevrolet</span>
                <span className="text-[#b38318]">|</span>
                <span>Buick</span>
                <span className="text-[#b38318]">|</span>
                <span>GMC</span>
                <span className="text-[#b38318]">|</span>
                <span>Cadillac</span>
              </div>
              <div className="h-px w-20 bg-[#d4a72c]" />
              <h1 className="mt-6 max-w-2xl text-4xl font-black uppercase leading-[1.04] tracking-tight text-white sm:text-6xl">
                Let&apos;s get you on the road.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#e4e4e4] sm:text-lg">
                Looking for your next GM vehicle or ready to sell your current one? Share a few details and {p.full_name.split(' ')[0]}&apos;ll help you take the next step.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold text-[#f4f1e8]">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#d8c28a]/70 bg-[#2a2519]/90 px-4 py-2 backdrop-blur-sm">
                  <CheckCircle2 className="h-4 w-4 text-[#e0bb54]" />
                  Transparent pricing
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#d8c28a]/70 bg-[#2a2519]/90 px-4 py-2 backdrop-blur-sm">
                  <CheckCircle2 className="h-4 w-4 text-[#e0bb54]" />
                  No pressure
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#d8c28a]/70 bg-[#2a2519]/90 px-4 py-2 backdrop-blur-sm">
                  <Clock3 className="h-4 w-4 text-[#e0bb54]" />
                  Fast response
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#d8c28a]/70 bg-[#2a2519]/90 px-4 py-2 backdrop-blur-sm">
                  <CheckCircle2 className="h-4 w-4 text-[#e0bb54]" />
                  Professional service
                </span>
              </div>
            </div>
            <div className="relative mt-10 h-[360px] w-full sm:hidden">
              <img
                src={photoSrc}
                alt={`${p.full_name}, ${p.title || 'sales consultant'}`}
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-[#111111]" />
            </div>
          </div>
        </section>

        <section id="lead-form" className="py-12 sm:py-16">
          <div className="mx-auto max-w-2xl px-4 sm:px-6">
            <div className="mb-7 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a6617]">Start here</p>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-[#111111] sm:text-4xl">
                How can {p.full_name.split(' ')[0]} help?
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#666666] sm:text-base">
                Tell us whether you&apos;re buying or selling, and {p.full_name.split(' ')[0]}&apos;ll be in touch within one business day.
              </p>
            </div>
            <LeadForm repSlug={p.slug} />
          </div>
        </section>

        <section className="border-y border-black/10 bg-[#111111] py-10 text-white sm:py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-8 sm:grid-cols-3">
              <TrustItem
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Straightforward guidance"
                text="Clear answers and a simple process from first conversation to keys in hand."
              />
              <TrustItem
                icon={<Award className="h-5 w-5" />}
                title="Full GM lineup"
                text="One contact for Chevrolet, Buick, GMC, and Cadillac vehicles."
              />
              <TrustItem
                icon={<Sparkles className="h-5 w-5" />}
                title="Value for your vehicle"
                text="Get a thoughtful appraisal when you are ready to sell or trade."
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
                <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-[#b38318]" />{p.phone}</p>
              )}
              {p.email && (
                <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-[#b38318]" />{p.email}</p>
              )}
            </div>
            <div className="space-y-3 text-sm text-[#555555]">
              {addressLines.length > 0 && (
                <p className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#b38318]" />{addressLines.map((line, i) => <span key={i} className="block">{line}</span>)}</p>
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
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#b38318] text-white">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-white">{title}</h3>
        <p className="mt-1.5 text-sm leading-6 text-[#c8c8c8]">{text}</p>
      </div>
    </div>
  );
}
