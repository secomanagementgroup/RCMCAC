export type LeadType = 'buying' | 'selling';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'appointment'
  | 'won'
  | 'lost';

export type GmBrand = 'Chevrolet' | 'Buick' | 'GMC' | 'Cadillac';

export interface Lead {
  id: string;
  lead_type: LeadType;
  name: string;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  gm_brand: GmBrand | null;
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
  created_at: string;
  updated_at: string;
}

export interface LeadInsert {
  lead_type: LeadType;
  name: string;
  email?: string | null;
  phone?: string | null;
  gm_brand?: GmBrand | null;
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
}

export const GM_BRANDS: GmBrand[] = ['Chevrolet', 'Buick', 'GMC', 'Cadillac'];

export const FUNNEL_STAGES: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: 'blue' },
  { value: 'contacted', label: 'Contacted', color: 'cyan' },
  { value: 'qualified', label: 'Qualified', color: 'amber' },
  { value: 'appointment', label: 'Appointment', color: 'violet' },
  { value: 'won', label: 'Won', color: 'emerald' },
  { value: 'lost', label: 'Lost', color: 'rose' },
];

export const GM_VEHICLE_MODELS = [
  'Chevrolet Trax',
  'Chevrolet Trailblazer',
  'Chevrolet Equinox',
  'Chevrolet Equinox EV',
  'Chevrolet Blazer EV',
  'Chevrolet Traverse',
  'Chevrolet Tahoe',
  'Chevrolet Suburban',
  'Chevrolet Colorado',
  'Chevrolet Silverado 1500',
  'Chevrolet Silverado HD',
  'Chevrolet Silverado EV',
  'Chevrolet Corvette',
  'Buick Envista',
  'Buick Encore GX',
  'Buick Envision',
  'Buick Enclave',
  'GMC Terrain',
  'GMC Acadia',
  'GMC Yukon',
  'GMC Yukon XL',
  'GMC Canyon',
  'GMC Sierra 1500',
  'GMC Sierra HD',
  'GMC Sierra EV',
  'GMC HUMMER EV Pickup',
  'GMC HUMMER EV SUV',
  'Cadillac CT4',
  'Cadillac CT5',
  'Cadillac CT5-V',
  'Cadillac XT4',
  'Cadillac XT5',
  'Cadillac XT6',
  'Cadillac Escalade',
  'Cadillac Escalade IQ',
  'Cadillac OPTIQ',
  'Cadillac LYRIQ',
  'Cadillac VISTIQ',
  'Cadillac CELESTIQ',
  'Not sure yet',
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
