import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  Phone,
  Mail,
  Car,
  DollarSign,
  Calendar,
  Gauge,
  ClipboardList,
  Tag,
  Hash,
  X,
  Loader2,
  TrendingUp,
  Users,
  Trophy,
  Activity,
  LogOut,
  Link as LinkIcon,
  Copy,
  CheckCircle2,
  UserCog,
  QrCode,
  Trash2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import {
  Lead,
  LeadStatus,
  LeadType,
  GmBrand,
  FUNNEL_STAGES,
  GM_BRANDS,
  Profile,
} from '@/lib/types';
import AdminInvite from './AdminInvite';

interface FunnelDashboardProps {
  onEditProfile: () => void;
}

export default function FunnelDashboard({ onEditProfile }: FunnelDashboardProps) {
  const { profile, signOut } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<LeadType | 'all'>('all');
  const [filterBrand, setFilterBrand] = useState<GmBrand | 'all'>('all');
  const [filterRep, setFilterRep] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const isAdmin = profile?.role === 'admin';

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError('');

    if (!supabase) {
      setLeads([]);
      setError('The lead dashboard is temporarily unavailable.');
      setLoading(false);
      return;
    }

    const { data, error: err } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      setError('Failed to load leads. Please try again.');
    } else {
      setLeads((data as Lead[]) || []);
    }
    setLoading(false);
  }, []);

  const fetchProfiles = useCallback(async () => {
    if (!supabase || !isAdmin) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });
    setAllProfiles((data as Profile[]) || []);
  }, [isAdmin]);

  useEffect(() => {
    fetchLeads();
    fetchProfiles();
  }, [fetchLeads, fetchProfiles]);

  async function updateLeadStatus(leadId: string, status: LeadStatus) {
    if (!supabase) {
      setError('The lead dashboard is temporarily unavailable.');
      return;
    }

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
    if (selectedLead?.id === leadId) {
      setSelectedLead({ ...selectedLead, status });
    }
    const { error: err } = await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', leadId);
    if (err) {
      setError('Failed to update lead status.');
      await fetchLeads();
    }
  }

  async function deleteLead(leadId: string) {
    if (!supabase) {
      setError('The lead dashboard is temporarily unavailable.');
      return;
    }

    const { error: err } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);
    if (err) {
      setError('Failed to delete lead.');
      return;
    }
    setSelectedLead(null);
    await fetchLeads();
  }

  // Filter leads: admin sees all (optionally filtered by rep), sales sees only their own
  const scopedLeads = isAdmin
    ? filterRep === 'all'
      ? leads
      : leads.filter((l) => l.rep_slug === filterRep)
    : leads.filter((l) => l.rep_slug === profile?.slug);

  const filtered = scopedLeads.filter((lead) => {
    const matchesSearch =
      !search ||
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (lead.phone || '').includes(search) ||
      (lead.vehicle_interest || '').toLowerCase().includes(search.toLowerCase()) ||
      (lead.vehicle_make || '').toLowerCase().includes(search.toLowerCase()) ||
      (lead.vehicle_model || '').toLowerCase().includes(search.toLowerCase()) ||
      (lead.vehicle_vin || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || lead.lead_type === filterType;
    const matchesBrand = filterBrand === 'all' || lead.gm_brand === filterBrand;
    return matchesSearch && matchesType && matchesBrand;
  });

  const stats = {
    total: scopedLeads.length,
    new: scopedLeads.filter((l) => l.status === 'new').length,
    qualified: scopedLeads.filter(
      (l) => l.status === 'qualified' || l.status === 'appointment'
    ).length,
    won: scopedLeads.filter((l) => l.status === 'won').length,
  };

  const personalLink = profile
    ? `${window.location.origin}/?rep=${profile.slug}`
    : '';

  function copyPersonalLink() {
    if (personalLink) {
      navigator.clipboard.writeText(personalLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isAdmin && profile?.slug && (
                <>
                  <a
                    href={`${window.location.origin}/?rep=${profile.slug}`}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">My Landing Page</span>
                  </a>
                  <div className="h-6 w-px bg-slate-200" />
                </>
              )}
              <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                {isAdmin ? 'Team Lead Dashboard' : 'My Lead Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLinkModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <LinkIcon className="h-4 w-4" />
                <span className="hidden sm:inline">My Link</span>
              </button>
              {!isAdmin && (
                <button
                  onClick={onEditProfile}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <UserCog className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => setShowTeamModal(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Team</span>
                </button>
              )}
              <button
                onClick={fetchLeads}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Refresh
              </button>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* User badge */}
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium">{profile?.full_name}</span>
            <span className="text-slate-300">·</span>
            <span className={`font-semibold ${isAdmin ? 'text-amber-600' : 'text-slate-500'}`}>
              {isAdmin ? 'Administrator' : 'Salesperson'}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Stats row */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            icon={<Users className="h-5 w-5" />}
            label="Total Leads"
            value={stats.total}
            accent="bg-slate-100 text-slate-600"
          />
          <StatTile
            icon={<Activity className="h-5 w-5" />}
            label="New"
            value={stats.new}
            accent="bg-blue-100 text-blue-600"
          />
          <StatTile
            icon={<TrendingUp className="h-5 w-5" />}
            label="In Progress"
            value={stats.qualified}
            accent="bg-amber-100 text-amber-600"
          />
          <StatTile
            icon={<Trophy className="h-5 w-5" />}
            label="Won"
            value={stats.won}
            accent="bg-emerald-100 text-emerald-600"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, vehicle..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
          <div className="flex gap-3">
            {isAdmin && allProfiles.length > 0 && (
              <div className="relative">
                <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={filterRep}
                  onChange={(e) => setFilterRep(e.target.value)}
                  className="appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-slate-900"
                >
                  <option value="all">All Reps</option>
                  {allProfiles.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.full_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as LeadType | 'all')}
                className="appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-slate-900"
              >
                <option value="all">All Types</option>
                <option value="buying">Buying</option>
                <option value="selling">Selling</option>
              </select>
            </div>
            <div className="relative">
              <Car className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value as GmBrand | 'all')}
                className="appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-slate-900"
              >
                <option value="all">All Brands</option>
                {GM_BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <FunnelBoard
            leads={filtered}
            onSelectLead={setSelectedLead}
            onUpdateStatus={updateLeadStatus}
            showRep={isAdmin && filterRep === 'all'}
            profiles={allProfiles}
          />
        )}
      </div>

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateStatus={updateLeadStatus}
          onDelete={deleteLead}
        />
      )}

      {showTeamModal && (
        <AdminInvite onClose={() => { setShowTeamModal(false); fetchLeads(); fetchProfiles(); }} />
      )}

      {showLinkModal && (
        <MyLinkModal
          link={personalLink}
          copied={copied}
          onCopy={copyPersonalLink}
          onClose={() => setShowLinkModal(false)}
        />
      )}
    </div>
  );
}

function MyLinkModal({
  link,
  copied,
  onCopy,
  onClose,
}: {
  link: string;
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
}) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-center gap-2">
          <QrCode className="h-5 w-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-900">Your Customer Link</h2>
        </div>

        <div className="mx-auto mb-4 rounded-xl border border-slate-200 bg-white p-3">
          <img src={qrUrl} alt="QR code for your link" className="mx-auto h-48 w-48" />
        </div>

        <p className="mb-3 text-xs text-slate-500">
          Scan this QR code or share the link below. Leads submitted from this page appear in your dashboard.
        </p>

        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700">
            {link}
          </code>
          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function FunnelBoard({
  leads,
  onSelectLead,
  onUpdateStatus,
  showRep,
  profiles,
}: {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  showRep: boolean;
  profiles: Profile[];
}) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Users className="h-12 w-12 text-slate-300" />
        <p className="mt-4 text-lg font-semibold text-slate-700">No leads yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Leads submitted from your landing page will appear here.
        </p>
      </div>
    );
  }

  function repName(slug: string | null): string {
    if (!slug) return 'Unassigned';
    const p = profiles.find((pr) => pr.slug === slug);
    return p ? p.full_name : slug;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {FUNNEL_STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => l.status === stage.value);
        return (
          <div key={stage.value} className="flex flex-col rounded-xl bg-slate-200/60">
            <div className="flex items-center justify-between px-3 py-3">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full bg-${stage.color}-500`} />
                <h3 className="text-sm font-bold text-slate-700">{stage.label}</h3>
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-600">
                {stageLeads.length}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 px-2 pb-3">
              {stageLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onClick={() => onSelectLead(lead)}
                  onStatusChange={(s) => onUpdateStatus(lead.id, s)}
                  showRep={showRep}
                  repName={repName(lead.rep_slug)}
                />
              ))}
              {stageLeads.length === 0 && (
                <p className="px-2 py-4 text-center text-xs text-slate-400">No leads</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeadCard({
  lead,
  onClick,
  onStatusChange,
  showRep,
  repName,
}: {
  lead: Lead;
  onClick: () => void;
  onStatusChange: (status: LeadStatus) => void;
  showRep: boolean;
  repName: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const typeColor =
    lead.lead_type === 'buying'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-emerald-100 text-emerald-700';

  return (
    <div className="group relative cursor-pointer rounded-lg bg-white p-3 shadow-sm transition hover:shadow-md">
      <div onClick={onClick}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
        </div>
        <span
          className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeColor}`}
        >
          {lead.lead_type === 'buying' ? 'Buying' : 'Selling'}
        </span>
        {showRep && (
          <p className="mt-1 text-xs font-medium text-slate-400">{repName}</p>
        )}
        <div className="mt-2 space-y-1">
          {lead.lead_type === 'buying' ? (
            <>
              {lead.gm_brand && (
                <p className="text-xs text-slate-500">
                  <Car className="mr-1 inline h-3 w-3" />
                  {lead.gm_brand}
                  {lead.vehicle_interest ? ` — ${lead.vehicle_interest}` : ''}
                </p>
              )}
              {lead.budget_range && (
                <p className="text-xs text-slate-500">
                  <DollarSign className="mr-1 inline h-3 w-3" />
                  {lead.budget_range}
                </p>
              )}
            </>
          ) : (
            <>
              {lead.vehicle_make && (
                <p className="text-xs text-slate-500">
                  <Tag className="mr-1 inline h-3 w-3" />
                  {lead.vehicle_year || ''} {lead.vehicle_make} {lead.vehicle_model || ''}
                </p>
              )}
              {lead.vehicle_mileage !== null && (
                <p className="text-xs text-slate-500">
                  <Gauge className="mr-1 inline h-3 w-3" />
                  {lead.vehicle_mileage?.toLocaleString()} mi
                </p>
              )}
            </>
          )}
          {lead.phone && (
            <p className="text-xs text-slate-500">
              <Phone className="mr-1 inline h-3 w-3" />
              {lead.phone}
            </p>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {new Date(lead.created_at).toLocaleDateString()}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        className="absolute right-2 top-2 rounded px-1.5 py-0.5 text-xs text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        ⋮
      </button>
      {menuOpen && (
        <div
          className="absolute right-2 top-8 z-10 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {FUNNEL_STAGES.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                onStatusChange(s.value);
                setMenuOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs transition hover:bg-slate-50 ${
                lead.status === s.value ? 'font-bold text-slate-900' : 'text-slate-600'
              }`}
            >
              <span className={`h-2 w-2 rounded-full bg-${s.color}-500`} />
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LeadDetailModal({
  lead,
  onClose,
  onUpdateStatus,
  onDelete,
}: {
  lead: Lead;
  onClose: () => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{lead.name}</h2>
            <span
              className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                lead.lead_type === 'buying'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {lead.lead_type === 'buying' ? 'Looking to Buy' : 'Selling a Vehicle'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-5 py-5">
          {/* Contact */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
              Contact Info
            </h3>
            <div className="grid gap-2">
              {lead.email && (
                <DetailRow icon={<Mail className="h-4 w-4" />} label="Email" value={lead.email} />
              )}
              {lead.phone && (
                <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone" value={lead.phone} />
              )}
              <DetailRow
                icon={<Calendar className="h-4 w-4" />}
                label="Submitted"
                value={new Date(lead.created_at).toLocaleString()}
              />
            </div>
          </div>

          {/* Vehicle details */}
          {lead.lead_type === 'buying' ? (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                Buying Preferences
              </h3>
              <div className="grid gap-2">
                {lead.gm_brand && (
                  <DetailRow icon={<Car className="h-4 w-4" />} label="GM Brand" value={lead.gm_brand} />
                )}
                {lead.vehicle_interest && (
                  <DetailRow icon={<Tag className="h-4 w-4" />} label="Vehicle Interest" value={lead.vehicle_interest} />
                )}
                {lead.budget_range && (
                  <DetailRow icon={<DollarSign className="h-4 w-4" />} label="Budget" value={lead.budget_range} />
                )}
                {lead.payment_goal && (
                  <DetailRow icon={<DollarSign className="h-4 w-4" />} label="Payment Goal" value={lead.payment_goal} />
                )}
                {lead.down_payment && (
                  <DetailRow icon={<DollarSign className="h-4 w-4" />} label="Down Payment" value={lead.down_payment} />
                )}
                {lead.timeframe && (
                  <DetailRow icon={<Calendar className="h-4 w-4" />} label="Timeframe" value={lead.timeframe} />
                )}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                Vehicle For Sale
              </h3>
              <div className="grid gap-2">
                {lead.vehicle_vin && (
                  <DetailRow icon={<Hash className="h-4 w-4" />} label="VIN" value={lead.vehicle_vin} />
                )}
                {lead.vehicle_year && (
                  <DetailRow icon={<Calendar className="h-4 w-4" />} label="Year" value={String(lead.vehicle_year)} />
                )}
                {lead.vehicle_make && (
                  <DetailRow icon={<Tag className="h-4 w-4" />} label="Make" value={lead.vehicle_make} />
                )}
                {lead.vehicle_model && (
                  <DetailRow icon={<Car className="h-4 w-4" />} label="Model" value={lead.vehicle_model} />
                )}
                {lead.vehicle_mileage !== null && (
                  <DetailRow icon={<Gauge className="h-4 w-4" />} label="Mileage" value={`${lead.vehicle_mileage?.toLocaleString()} mi`} />
                )}
                {lead.vehicle_condition && (
                  <DetailRow icon={<ClipboardList className="h-4 w-4" />} label="Condition" value={lead.vehicle_condition} />
                )}
                {lead.asking_price !== null && (
                  <DetailRow icon={<DollarSign className="h-4 w-4" />} label="Asking Price" value={`$${lead.asking_price?.toLocaleString()}`} />
                )}
                {lead.timeframe && (
                  <DetailRow icon={<Calendar className="h-4 w-4" />} label="Timeframe" value={lead.timeframe} />
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {lead.notes && (
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                Notes
              </h3>
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{lead.notes}</p>
            </div>
          )}

          {/* Status changer */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
              Update Status
            </h3>
            <div className="flex flex-wrap gap-2">
              {FUNNEL_STAGES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => onUpdateStatus(lead.id, s.value)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    lead.status === s.value
                      ? `bg-${s.color}-600 text-white`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Delete */}
          <div className="border-t border-slate-200 pt-4">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 rounded-lg border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete Lead
              </button>
            ) : (
              <div className="rounded-lg bg-rose-50 p-4">
                <p className="text-sm font-medium text-rose-700">
                  Are you sure? This permanently removes the lead record.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => onDelete(lead.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-slate-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="truncate text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-extrabold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
