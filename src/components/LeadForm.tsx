import { useState } from 'react';
import {
  Car,
  DollarSign,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  User,
  Calendar,
  Gauge,
  Car as CarIcon,
  Tag,
  ClipboardList,
  Sparkles,
  Hash,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  LeadType,
  LeadInsert,
  GM_BRANDS,
  GM_VEHICLE_MODELS,
  TIMEFRAMES,
  VEHICLE_CONDITIONS,
} from '@/lib/types';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface LeadFormProps {
  repSlug?: string;
}

export default function LeadForm({ repSlug }: LeadFormProps) {
  const [leadType, setLeadType] = useState<LeadType>('buying');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [notes, setNotes] = useState('');

  // Buying fields
  const [gmBrand, setGmBrand] = useState('');
  const [vehicleInterest, setVehicleInterest] = useState('');
  const [paymentGoal, setPaymentGoal] = useState('');
  const [downPayment, setDownPayment] = useState('');

  // Selling fields
  const [vehicleVin, setVehicleVin] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleMileage, setVehicleMileage] = useState('');
  const [vehicleCondition, setVehicleCondition] = useState('');
  const [askingPrice, setAskingPrice] = useState('');

  function resetForm() {
    setName('');
    setEmail('');
    setPhone('');
    setTimeframe('');
    setNotes('');
    setGmBrand('');
    setVehicleInterest('');
    setPaymentGoal('');
    setDownPayment('');
    setVehicleVin('');
    setVehicleYear('');
    setVehicleMake('');
    setVehicleModel('');
    setVehicleMileage('');
    setVehicleCondition('');
    setAskingPrice('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState('submitting');
    setErrorMsg('');

    const payload: LeadInsert = {
      lead_type: leadType,
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      timeframe: timeframe || null,
      notes: notes.trim() || null,
    };

    if (repSlug) {
      payload.rep_slug = repSlug;
    }

    if (leadType === 'buying') {
      payload.gm_brand = (gmBrand || null) as LeadInsert['gm_brand'];
      payload.vehicle_interest = vehicleInterest || null;
      payload.payment_goal = paymentGoal.trim() || null;
      payload.down_payment = downPayment.trim() || null;
    } else {
      payload.vehicle_year = vehicleYear ? parseInt(vehicleYear, 10) : null;
      payload.vehicle_make = vehicleMake.trim() || null;
      payload.vehicle_model = vehicleModel.trim() || null;
      payload.vehicle_mileage = vehicleMileage ? parseInt(vehicleMileage, 10) : null;
      payload.vehicle_condition = vehicleCondition || null;
      payload.asking_price = askingPrice ? parseFloat(askingPrice) : null;
      payload.vehicle_vin = vehicleVin.trim() || null;
    }

    if (!supabase) {
      setFormState('error');
      setErrorMsg('This form is temporarily unavailable. Please try again later.');
      return;
    }

    const { error } = await supabase.from('leads').insert(payload);

    if (error) {
      setFormState('error');
      setErrorMsg('Something went wrong submitting your request. Please try again.');
      return;
    }

    setFormState('success');
    resetForm();
  }

  if (formState === 'success') {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          </div>
          <h3 className="mt-5 text-2xl font-bold text-slate-900">Request received!</h3>
          <p className="mt-2 max-w-md text-slate-600">
            Thanks for reaching out. I'll review your details and get back to you within
            one business day to discuss next steps.
          </p>
          <button
            onClick={() => setFormState('idle')}
            className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Submit another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8">
      {/* Toggle */}
      <div className="mb-6">
        <p className="mb-3 text-center text-sm font-medium text-slate-500">
          What brings you here today?
        </p>
        <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-100 p-1.5">
          <button
            type="button"
            onClick={() => setLeadType('buying')}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
              leadType === 'buying'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Car className="h-4 w-4" />
            Looking to Buy
          </button>
          <button
            type="button"
            onClick={() => setLeadType('selling')}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
              leadType === 'selling'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            Selling a Vehicle
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            icon={<User className="h-4 w-4" />}
            label="Full Name"
            required
            value={name}
            onChange={(v) => setName(v)}
            placeholder="John Smith"
          />
          <Field
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            type="email"
            value={email}
            onChange={(v) => setEmail(v)}
            placeholder="john@email.com"
          />
          <Field
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            type="tel"
            value={phone}
            onChange={(v) => setPhone(v)}
            placeholder="(555) 123-4567"
          />
          <SelectField
            icon={<Calendar className="h-4 w-4" />}
            label="Timeframe"
            value={timeframe}
            onChange={(v) => setTimeframe(v)}
            options={TIMEFRAMES}
            placeholder="Select timeframe"
          />
        </div>

        {leadType === 'buying' ? (
          <div className="space-y-4 rounded-xl bg-blue-50/60 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Sparkles className="h-4 w-4 text-blue-600" />
              Tell us about the vehicle you're looking for
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                icon={<CarIcon className="h-4 w-4" />}
                label="Preferred GM Brand"
                value={gmBrand}
                onChange={(v) => setGmBrand(v)}
                options={GM_BRANDS}
                placeholder="Any brand"
              />
              <div className="sm:col-span-2">
                <SelectField
                  icon={<Tag className="h-4 w-4" />}
                  label="Vehicle of Interest"
                  value={vehicleInterest}
                  onChange={(v) => setVehicleInterest(v)}
                  options={GM_VEHICLE_MODELS}
                  placeholder="Select a GM vehicle"
                />
              </div>
              <Field
                icon={<DollarSign className="h-4 w-4" />}
                label="Payment Goal"
                value={paymentGoal}
                onChange={(v) => setPaymentGoal(v)}
                placeholder="e.g. $650 per month"
              />
              <Field
                icon={<DollarSign className="h-4 w-4" />}
                label="Down Payment"
                value={downPayment}
                onChange={(v) => setDownPayment(v)}
                placeholder="e.g. $5,000"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 rounded-xl bg-emerald-50/60 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Tell us about the vehicle you're selling
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field
                  icon={<Hash className="h-4 w-4" />}
                  label="VIN"
                  value={vehicleVin}
                  onChange={(v) => setVehicleVin(v)}
                  placeholder="17-character Vehicle Identification Number"
                />
              </div>
              <Field
                icon={<Calendar className="h-4 w-4" />}
                label="Year"
                type="number"
                value={vehicleYear}
                onChange={(v) => setVehicleYear(v)}
                placeholder="2020"
              />
              <Field
                icon={<Tag className="h-4 w-4" />}
                label="Make"
                value={vehicleMake}
                onChange={(v) => setVehicleMake(v)}
                placeholder="Chevrolet"
              />
              <Field
                icon={<CarIcon className="h-4 w-4" />}
                label="Model"
                value={vehicleModel}
                onChange={(v) => setVehicleModel(v)}
                placeholder="Silverado"
              />
              <Field
                icon={<Gauge className="h-4 w-4" />}
                label="Mileage"
                type="number"
                value={vehicleMileage}
                onChange={(v) => setVehicleMileage(v)}
                placeholder="45,000"
              />
              <SelectField
                icon={<ClipboardList className="h-4 w-4" />}
                label="Condition"
                value={vehicleCondition}
                onChange={(v) => setVehicleCondition(v)}
                options={VEHICLE_CONDITIONS}
                placeholder="Select condition"
              />
              <Field
                icon={<DollarSign className="h-4 w-4" />}
                label="Asking Price"
                type="number"
                value={askingPrice}
                onChange={(v) => setAskingPrice(v)}
                placeholder="25,000"
              />
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Anything else I should know?"
            className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        {formState === 'error' && (
          <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={formState === 'submitting' || !name.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {formState === 'submitting' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit Request
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
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
          type={type}
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

function SelectField({
  icon,
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-8 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        >
          <option value="">{placeholder || 'Select...'}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
