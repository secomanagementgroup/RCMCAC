/*
# Create leads table for car salesman lead capture

1. New Tables
- `leads`
  - `id` (uuid, primary key)
  - `lead_type` (text, not null) — 'buying' or 'selling'
  - `name` (text, not null) — customer's full name
  - `email` (text) — customer email
  - `phone` (text) — customer phone
  - `status` (text, not null, default 'new') — funnel stage: new, contacted, qualified, appointment, won, lost
  - `gm_brand` (text) — preferred GM brand for buyers: Chevrolet, Buick, GMC, Cadillac
  - `vehicle_interest` (text) — model/vehicle the buyer is interested in
  - `budget_range` (text) — buyer's budget range
  - `timeframe` (text) — buying/selling timeframe
  - `vehicle_year` (integer) — year of vehicle (sellers)
  - `vehicle_make` (text) — make of vehicle (sellers)
  - `vehicle_model` (text) — model of vehicle (sellers)
  - `vehicle_mileage` (integer) — mileage of vehicle (sellers)
  - `vehicle_condition` (text) — condition of vehicle (sellers)
  - `asking_price` (numeric) — seller's expected price
  - `notes` (text) — additional notes from customer
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Indexes
- Index on `status` for funnel filtering
- Index on `lead_type` for buy/sell filtering
- Index on `gm_brand` for brand filtering
- Index on `created_at` for chronological sorting

3. Security
- Enable RLS on `leads`.
- Grant CRUD to `anon` + `authenticated` so the anon-key frontend can read/write.
- Allow anon + authenticated full CRUD because this is a single-tenant app (one salesman, no sign-in).
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_type text NOT NULL CHECK (lead_type IN ('buying', 'selling')),
  name text NOT NULL,
  email text,
  phone text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'appointment', 'won', 'lost')),
  gm_brand text CHECK (gm_brand IS NULL OR gm_brand IN ('Chevrolet', 'Buick', 'GMC', 'Cadillac')),
  vehicle_interest text,
  budget_range text,
  timeframe text,
  vehicle_year integer,
  vehicle_make text,
  vehicle_model text,
  vehicle_mileage integer,
  vehicle_condition text,
  asking_price numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_lead_type ON leads (lead_type);
CREATE INDEX IF NOT EXISTS idx_leads_gm_brand ON leads (gm_brand);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON leads TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_leads" ON leads;
CREATE POLICY "anon_select_leads" ON leads FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_leads" ON leads;
CREATE POLICY "anon_update_leads" ON leads FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_leads" ON leads;
CREATE POLICY "anon_delete_leads" ON leads FOR DELETE
  TO anon, authenticated USING (true);
