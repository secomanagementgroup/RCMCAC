/*
# Add buyer payment details to leads

1. Modified Tables
- `leads`
  - Added `payment_goal` (text, nullable) — the buyer's preferred payment amount or payment description.
  - Added `down_payment` (text, nullable) — the buyer's intended down payment or related details.
- Existing `budget_range` data and column are preserved for previously submitted leads and database compatibility.

2. Security
- No RLS policy changes are needed.
- The existing single-tenant anon + authenticated CRUD grants and policies continue to cover the new nullable columns.

3. Important Notes
- Both fields remain optional because buyers may not know their payment preferences yet.
- Values are stored as text so buyers can enter flexible responses such as a monthly amount, a range, or a short explanation.
*/

ALTER TABLE leads ADD COLUMN IF NOT EXISTS payment_goal text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS down_payment text;
