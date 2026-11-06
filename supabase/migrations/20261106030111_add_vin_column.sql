/*
# Add VIN column to leads table

1. Modified Tables
- `leads`
  - Added `vehicle_vin` (text, nullable) — 17-character Vehicle Identification Number for sellers.
  - Length check: 17 characters max to match standard VIN format.

2. Security
- No RLS policy changes needed — the table already allows anon + authenticated CRUD.
*/

ALTER TABLE leads ADD COLUMN IF NOT EXISTS vehicle_vin text CHECK (vehicle_vin IS NULL OR length(vehicle_vin) <= 17);
