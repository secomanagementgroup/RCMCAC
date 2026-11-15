export type LeadType = 'buying' | 'selling';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'appointment'
  | 'won'
  | 'lost';

export type UserRole = 'admin' | 'sales';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  title: string | null;
  slug: string;
  photo_url: string | null;
  phone: string | null;
  dealership_name: string | null;
  dealership_address: string | null;
  role: UserRole;
  profile_setup_complete: boolean;
  theme_palette: string | null;
  brands: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  full_name?: string;
  title?: string | null;
  slug?: string;
  photo_url?: string | null;
  phone?: string | null;
  dealership_name?: string | null;
  dealership_address?: string | null;
  profile_setup_complete?: boolean;
  theme_palette?: string | null;
  brands?: string | null;
}

export interface Invite {
  id: string;
  email: string;
  token: string;
  role: UserRole;
  invited_by: string | null;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
}

export interface Lead {
  id: string;
  lead_type: LeadType;
  name: string;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  gm_brand: string | null;
  preferred_brand: string | null;
  vehicle_interest: string | null;
  budget_range: string | null;
  payment_goal: string | null;
  down_payment: string | null;
  timeframe: string | null;
  vehicle_year: number | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_mileage: number | null;
  vehicle_condition: string | null;
  asking_price: number | null;
  vehicle_vin: string | null;
  notes: string | null;
  rep_slug: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadInsert {
  lead_type: LeadType;
  name: string;
  email?: string | null;
  phone?: string | null;
  preferred_brand?: string | null;
  vehicle_interest?: string | null;
  budget_range?: string | null;
  payment_goal?: string | null;
  down_payment?: string | null;
  timeframe?: string | null;
  vehicle_year?: number | null;
  vehicle_make?: string | null;
  vehicle_model?: string | null;
  vehicle_mileage?: number | null;
  vehicle_condition?: string | null;
  asking_price?: number | null;
  vehicle_vin?: string | null;
  notes?: string | null;
  rep_slug?: string | null;
}

export const FUNNEL_STAGES: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: 'blue' },
  { value: 'contacted', label: 'Contacted', color: 'cyan' },
  { value: 'qualified', label: 'Qualified', color: 'amber' },
  { value: 'appointment', label: 'Appointment', color: 'violet' },
  { value: 'won', label: 'Won', color: 'emerald' },
  { value: 'lost', label: 'Lost', color: 'rose' },
];

export const TIMEFRAMES = [
  'Immediately',
  '1–2 weeks',
  '1 month',
  '2–3 months',
  'Just browsing',
];

export const VEHICLE_CONDITIONS = [
  'Great',
  'Good',
  'Fair',
];
