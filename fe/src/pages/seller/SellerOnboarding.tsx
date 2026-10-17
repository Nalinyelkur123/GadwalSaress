import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const SellerOnboarding: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Account
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Business
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('Gadwal, Telangana');
  const [experienceYears, setExperienceYears] = useState('15');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');

  // Step 3: Address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Gadwal');
  const [state, setState] = useState('Telangana');
  const [postalCode, setPostalCode] = useState('509125');

  // Step 4: Tax & Bank Payout
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankBeneficiary, setBankBeneficiary] = useState('');

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (step === 1) {
      if (!fullName || !email || !password || password.length < 6) {
        setError('Please complete all account fields. Password must be at least 6 characters.');
        return;
      }
    } else if (step === 2) {
      if (!businessName) {
        setError('Business / Cooperative name is required.');
        return;
      }
    } else if (step === 3) {
      if (!street || !postalCode) {
        setError('Street address and postal code are required for courier pickups.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        email,
        password,
        full_name: fullName,
        phone,
        role: 'seller' as const,
        business_name: businessName,
        location,
        experience_years: parseInt(experienceYears, 10),
        description,
        story,
        gstin,
        pan,
        bank_account_number: bankAccount,
        bank_ifsc: bankIfsc,
        bank_beneficiary: bankBeneficiary || businessName,
        pickup_address: {
          full_name: businessName,
          phone,
          street_address: street,
          city,
          state,
          postal_code: postalCode,
          country: 'India',
        }
      };

      await register(payload);
      navigate('/seller/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit seller registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      {/* HEADER */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-brand-50 text-brand-700 rounded-full flex items-center justify-center mx-auto border border-brand-200">
          <Store size={28} />
        </div>
        <h1 className="font-serif font-bold text-3xl text-charcoal-900">
          Register as an Artisan Weaver
        </h1>
        <p className="text-xs text-charcoal-500 max-w-md mx-auto">
          Join our direct-to-customer marketplace. Sell authentic handloom sarees directly from your loom with zero middlemen fees.
        </p>
      </div>

      {/* STEPPER PROGRESS */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className={`p-2 rounded border font-semibold ${step >= 1 ? 'bg-brand-700 text-white border-brand-700' : 'bg-white text-charcoal-500 border-ivory-300'}`}>
          1. Account
        </div>
        <div className={`p-2 rounded border font-semibold ${step >= 2 ? 'bg-brand-700 text-white border-brand-700' : 'bg-white text-charcoal-500 border-ivory-300'}`}>
          2. Weaving Loom
        </div>
        <div className={`p-2 rounded border font-semibold ${step >= 3 ? 'bg-brand-700 text-white border-brand-700' : 'bg-white text-charcoal-500 border-ivory-300'}`}>
          3. Pickup Point
        </div>
        <div className={`p-2 rounded border font-semibold ${step >= 4 ? 'bg-brand-700 text-white border-brand-700' : 'bg-white text-charcoal-500 border-ivory-300'}`}>
          4. KYC & Payout
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-1.5">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* FORM CARD */}
      <div className="bg-white p-7 rounded-xl border border-ivory-300 shadow-warm-md">
        
        {/* STEP 1: ACCOUNT */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-4">
            <h3 className="font-serif font-bold text-base text-charcoal-900">1. Master Weaver Account</h3>
            
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Your Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Narasimha Rao"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="artisan@weaves.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 94401 23456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Create Password (min. 6 characters)</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Next: Business Details</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        {/* STEP 2: BUSINESS */}
        {step === 2 && (
          <form onSubmit={handleNext} className="space-y-4">
            <h3 className="font-serif font-bold text-base text-charcoal-900">2. Weaving Business & Loom Story</h3>
            
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Loom / Business / Cooperative Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sri Venkateswara Handlooms"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Experience (Years of Weaving)</label>
                <input
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Short Description</label>
              <input
                type="text"
                placeholder="e.g. Generations of master pit loom artisans specializing in classic pure silk Gadwal sarees."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Artisan Heritage Story</label>
              <textarea
                rows={3}
                placeholder="Tell customers about your weaving lineage, wooden pit looms, and traditional kuttu techniques..."
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2 border border-ivory-400 rounded text-xs font-semibold text-charcoal-700"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold flex items-center justify-center gap-1"
              >
                <span>Next: Pickup Address</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: PICKUP ADDRESS */}
        {step === 3 && (
          <form onSubmit={handleNext} className="space-y-4">
            <h3 className="font-serif font-bold text-base text-charcoal-900">3. Loom Pickup Address</h3>
            <p className="text-xs text-charcoal-500">
              Shiprocket courier will dispatch parcels directly from this workshop address.
            </p>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Street / House / Colony</label>
              <input
                type="text"
                required
                placeholder="Door No. 4-2-88, Weavers Colony, Fort Road"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-2 border border-ivory-400 rounded text-xs font-semibold text-charcoal-700"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold flex items-center justify-center gap-1"
              >
                <span>Next: KYC & Bank Payout</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: KYC & BANK */}
        {step === 4 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <h3 className="font-serif font-bold text-base text-charcoal-900">4. KYC & Payout Details</h3>
            <p className="text-xs text-charcoal-500">
              Entered details are encrypted and accessible only to marketplace compliance officers.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">GSTIN (Optional for Handloom Artisans)</label>
                <input
                  type="text"
                  placeholder="36ABCDE1234F1Z5"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">PAN Number</label>
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400 font-mono"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-ivory-300">
              <h4 className="font-semibold text-xs text-charcoal-900">Bank Account for Payout Settlements</h4>
              
              <div>
                <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">Beneficiary Name</label>
                <input
                  type="text"
                  placeholder="Sri Venkateswara Handlooms"
                  value={bankBeneficiary}
                  onChange={(e) => setBankBeneficiary(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    required
                    placeholder="912345678901"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-ivory-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    required
                    placeholder="SBIN0001234"
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs rounded border border-ivory-400 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-brand-50 border border-brand-200 rounded text-[11px] text-brand-900 leading-relaxed">
              Upon submission, your application will enter administrative verification. Once approved, you can publish authentic sarees and receive payouts directly to this bank account.
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-2 border border-ivory-400 rounded text-xs font-semibold text-charcoal-700"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold shadow-sm"
              >
                {loading ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
