import React, { useState, useEffect } from 'react';
import { Store, MapPin, Building, Award, Check } from 'lucide-react';
import { api } from '../../services/api';
import { SellerProfile } from '../../types';

export const SellerProfilePage: React.FC = () => {
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [story, setStory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('10');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/seller/dashboard');
        const s = res.data.seller;
        setSeller(s);
        setBusinessName(s.business_name || '');
        setStory(s.story || '');
        setDescription(s.description || '');
        setLocation(s.location || '');
        setExperience(String(s.experience_years || 10));
        setStreet(s.pickup_address?.street_address || '');
        setCity(s.pickup_address?.city || '');
        setState(s.pickup_address?.state || '');
        setPincode(s.pickup_address?.postal_code || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await api.put('/seller/profile', {
        business_name: businessName,
        story,
        description,
        location,
        experience_years: parseInt(experience, 10),
        pickup_address: {
          full_name: businessName,
          phone: seller?.pickup_address?.phone || '9999999999',
          street_address: street,
          city,
          state,
          postal_code: pincode,
          country: 'India',
        }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !seller) return <div className="p-8 text-center text-xs">Loading profile...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif font-bold text-2xl text-charcoal-900">Weaver Storefront Profile</h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Public brand story, loom location, and Shiprocket dispatch address.
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-medium flex items-center gap-1.5">
          <Check size={16} />
          <span>Profile saved successfully! Storefront updated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-ivory-300 shadow-warm-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1">Business / Cooperative Name</label>
          <input
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Weaving Experience (Years)</label>
            <input
              type="number"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">General Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1">Short Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1">Artisan Heritage Story</label>
          <textarea
            rows={4}
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
          />
        </div>

        {/* PICKUP ADDRESS */}
        <div className="pt-4 border-t border-ivory-300 space-y-3">
          <h3 className="font-serif font-bold text-sm text-charcoal-900">
            Loom Pickup Address (Courier Dispatch)
          </h3>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Street / Colony</label>
            <input
              type="text"
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
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Postal Code</label>
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold shadow-sm"
        >
          {saving ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
};
