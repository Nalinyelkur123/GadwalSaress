import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Image, 
  Settings, 
  Plus, 
  Trash2, 
  Check, 
  ExternalLink, 
  Save, 
  Sliders, 
  Megaphone,
  Percent,
  DollarSign
} from 'lucide-react';
import { api } from '../../services/api';
import { CMSBanner, Coupon, SiteSettings } from '../../types';

export const AdminCMS: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'banners' | 'coupons' | 'settings'>('settings');

  // State
  const [banners, setBanners] = useState<CMSBanner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // New Coupon Form
  const [couponCode, setCouponCode] = useState('');
  const [couponDesc, setCouponDesc] = useState('');
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponValue, setCouponValue] = useState('10');
  const [minOrder, setMinOrder] = useState('10000');
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  // New Banner Form
  const [showAddBanner, setShowAddBanner] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [bannerCtaText, setBannerCtaText] = useState('Explore Saree Catalog');
  const [bannerCtaLink, setBannerCtaLink] = useState('/shop');
  const [bannerPlacement, setBannerPlacement] = useState<'hero' | 'top_bar' | 'promo_grid' | 'middle_cta'>('hero');
  const [creatingBanner, setCreatingBanner] = useState(false);

  // Settings Save State
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, cRes, sRes] = await Promise.all([
        api.get('/admin/cms/banners'),
        api.get('/admin/cms/coupons'),
        api.get('/admin/settings')
      ]);
      setBanners(bRes.data || []);
      setCoupons(cRes.data || []);
      setSettings(sRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    setCreatingCoupon(true);
    try {
      await api.post('/admin/cms/coupons', {
        code: couponCode,
        description: couponDesc,
        discount_type: couponType,
        discount_value: couponValue,
        min_order_value: minOrder,
      });
      alert(`Coupon ${couponCode.toUpperCase()} created successfully!`);
      setCouponCode('');
      setCouponDesc('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create coupon.');
    } finally {
      setCreatingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    try {
      await api.delete(`/admin/cms/coupons/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete coupon');
    }
  };

  const handleToggleCoupon = async (coupon: Coupon) => {
    try {
      await api.put(`/admin/cms/coupons/${coupon.id}`, {
        is_active: !coupon.is_active,
      });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to toggle coupon');
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle || !bannerImage) {
      alert('Please provide banner title and image URL.');
      return;
    }
    setCreatingBanner(true);
    try {
      await api.post('/admin/cms/banners', {
        placement: bannerPlacement,
        title: bannerTitle,
        subtitle: bannerSubtitle,
        cta_text: bannerCtaText,
        cta_link: bannerCtaLink,
        image_url: bannerImage,
      });
      alert('Promotional banner added successfully!');
      setShowAddBanner(false);
      setBannerTitle('');
      setBannerSubtitle('');
      setBannerImage('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add banner');
    } finally {
      setCreatingBanner(false);
    }
  };

  const handleDeleteBanner = async (id: string, title: string) => {
    if (!window.confirm(`Delete banner "${title}"?`)) return;
    try {
      await api.delete(`/admin/cms/banners/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete banner');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSavingSettings(true);
    setSettingsMessage(null);
    try {
      const res = await api.put('/admin/settings', settings);
      setSettings(res.data.settings);
      setSettingsMessage({ type: 'success', text: 'Marketplace settings saved and synchronized live!' });
      setTimeout(() => setSettingsMessage(null), 4000);
    } catch (err: any) {
      setSettingsMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save settings' });
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-charcoal-900">CMS & Marketplace Configuration</h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Manage site settings, announcement bars, coupons, promotional hero banners, and SEO metadata.
          </p>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-ivory-300 gap-2">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-brand-800 text-brand-900 bg-white rounded-t-lg'
              : 'border-transparent text-charcoal-600 hover:text-charcoal-900'
          }`}
        >
          <Settings size={15} />
          <span>Site Settings & Policies</span>
        </button>

        <button
          onClick={() => setActiveTab('banners')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'banners'
              ? 'border-brand-800 text-brand-900 bg-white rounded-t-lg'
              : 'border-transparent text-charcoal-600 hover:text-charcoal-900'
          }`}
        >
          <Image size={15} />
          <span>Hero Banners & Visuals ({banners.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'coupons'
              ? 'border-brand-800 text-brand-900 bg-white rounded-t-lg'
              : 'border-transparent text-charcoal-600 hover:text-charcoal-900'
          }`}
        >
          <Tag size={15} />
          <span>Discount Coupons ({coupons.length})</span>
        </button>
      </div>

      {/* TAB 1: SITE SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-ivory-300 pb-3">
            <div>
              <h2 className="font-serif font-bold text-base text-charcoal-900">
                Core Marketplace Engine Configuration
              </h2>
              <p className="text-xs text-charcoal-500">Live system parameters used for checkout, tax, and storefront display.</p>
            </div>
          </div>

          {settingsMessage && (
            <div className={`p-3 rounded-lg text-xs font-semibold ${
              settingsMessage.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {settingsMessage.text}
            </div>
          )}

          {settings && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* SECTION: GENERAL IDENTITY */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-900 border-b border-ivory-200 pb-1">
                  Store Identity & Customer Support
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">Marketplace Name</label>
                    <input
                      type="text"
                      value={settings.marketplace_name}
                      onChange={(e) => setSettings({ ...settings, marketplace_name: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-lg bg-ivory-50 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">Support Email</label>
                    <input
                      type="email"
                      value={settings.support_email}
                      onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-lg bg-ivory-50 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">Support Helpline</label>
                    <input
                      type="text"
                      value={settings.support_phone}
                      onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-lg bg-ivory-50 focus:bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: ANNOUNCEMENT BAR */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-900 border-b border-ivory-200 pb-1 flex items-center justify-between">
                  <span>Storefront Announcement Banner</span>
                  <label className="flex items-center gap-2 cursor-pointer font-normal text-xs text-charcoal-700">
                    <input
                      type="checkbox"
                      checked={settings.announcement_bar_active}
                      onChange={(e) => setSettings({ ...settings, announcement_bar_active: e.target.checked })}
                      className="w-4 h-4 text-brand-700 rounded border-ivory-400"
                    />
                    <span>Show on Customer Website</span>
                  </label>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">Announcement Text</label>
                    <input
                      type="text"
                      value={settings.announcement_bar_text}
                      onChange={(e) => setSettings({ ...settings, announcement_bar_text: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-lg bg-ivory-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">Announcement Link (Optional)</label>
                    <input
                      type="text"
                      placeholder="/shop or /categories"
                      value={settings.announcement_bar_link || ''}
                      onChange={(e) => setSettings({ ...settings, announcement_bar_link: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-lg bg-ivory-50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: COMMERCE, TAX & LOGISTICS */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-900 border-b border-ivory-200 pb-1">
                  Tax, Commission & Logistics Defaults
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">Handloom GST Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={settings.tax_rate_handloom}
                      onChange={(e) => setSettings({ ...settings, tax_rate_handloom: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-lg bg-ivory-50 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">Free Shipping Threshold (₹)</label>
                    <input
                      type="number"
                      value={settings.free_shipping_threshold}
                      onChange={(e) => setSettings({ ...settings, free_shipping_threshold: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-lg bg-ivory-50 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">Marketplace Commission Rate (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={settings.default_commission_rate}
                      onChange={(e) => setSettings({ ...settings, default_commission_rate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-lg bg-ivory-50 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">Currency Code</label>
                    <input
                      type="text"
                      disabled
                      value={`${settings.currency} (${settings.currency_symbol})`}
                      className="w-full px-3 py-2 text-xs border border-ivory-200 rounded-lg bg-ivory-200 text-charcoal-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: SEO METADATA */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-900 border-b border-ivory-200 pb-1">
                  Global Storefront SEO
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={settings.meta_title}
                      onChange={(e) => setSettings({ ...settings, meta_title: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-lg bg-ivory-50 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">Meta Description</label>
                    <textarea
                      rows={2}
                      value={settings.meta_description}
                      onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-lg bg-ivory-50 focus:bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-ivory-300">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-lg text-xs font-semibold shadow-warm-sm flex items-center gap-2"
                >
                  <Save size={14} />
                  <span>{savingSettings ? 'Saving Settings...' : 'Save All Settings'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: HERO BANNERS */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-ivory-300 pb-3">
              <div>
                <h2 className="font-serif font-bold text-base text-charcoal-900">
                  Storefront Hero & Promo Banners
                </h2>
                <p className="text-xs text-charcoal-500">Configure visual photography banners, headlines, and call-to-actions.</p>
              </div>
              <button
                onClick={() => setShowAddBanner(!showAddBanner)}
                className="px-4 py-2 bg-brand-800 hover:bg-brand-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-warm-xs"
              >
                <Plus size={14} />
                <span>{showAddBanner ? 'Cancel' : 'Add New Banner'}</span>
              </button>
            </div>

            {/* ADD BANNER FORM */}
            {showAddBanner && (
              <form onSubmit={handleCreateBanner} className="p-5 bg-ivory-100 rounded-xl border border-ivory-300 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-900">Create Banner Slide</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">Headline</label>
                    <input
                      type="text"
                      placeholder="Authentic Handwoven Gadwal Sarees"
                      value={bannerTitle}
                      onChange={(e) => setBannerTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-lg bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">Subtitle / Tagline</label>
                    <input
                      type="text"
                      placeholder="Crafted with pure mulberry silk and pure gold zari"
                      value={bannerSubtitle}
                      onChange={(e) => setBannerSubtitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">Banner Image URL</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={bannerImage}
                      onChange={(e) => setBannerImage(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-lg bg-white font-mono text-[11px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">Placement</label>
                    <select
                      value={bannerPlacement}
                      onChange={(e) => setBannerPlacement(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-lg bg-white"
                    >
                      <option value="hero">Homepage Hero Carousel</option>
                      <option value="promo_grid">Promotional Grid</option>
                      <option value="middle_cta">Editorial Heritage Banner</option>
                      <option value="top_bar">Top Bar Highlight</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      value={bannerCtaText}
                      onChange={(e) => setBannerCtaText(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">CTA Destination Link</label>
                    <input
                      type="text"
                      value={bannerCtaLink}
                      onChange={(e) => setBannerCtaLink(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-ivory-300">
                  <button
                    type="button"
                    onClick={() => setShowAddBanner(false)}
                    className="px-4 py-2 border border-ivory-300 rounded-lg text-xs font-semibold text-charcoal-700 bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingBanner}
                    className="px-5 py-2 bg-brand-800 hover:bg-brand-900 text-white rounded-lg text-xs font-semibold"
                  >
                    {creatingBanner ? 'Adding...' : 'Save Banner'}
                  </button>
                </div>
              </form>
            )}

            {/* BANNERS LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((b) => (
                <div key={b.id} className="border border-ivory-300 rounded-xl overflow-hidden bg-ivory-50 flex flex-col">
                  <div className="relative h-44 bg-charcoal-900">
                    <img
                      src={b.image_url}
                      alt={b.title}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end text-white">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400">
                        {b.placement}
                      </span>
                      <h4 className="font-serif font-bold text-base leading-snug">{b.title}</h4>
                      {b.subtitle && <p className="text-xs text-ivory-200 line-clamp-1">{b.subtitle}</p>}
                    </div>
                  </div>
                  <div className="p-4 flex justify-between items-center bg-white text-xs">
                    <div>
                      <span className="font-semibold text-charcoal-800">CTA:</span>{' '}
                      <span className="text-brand-900 font-medium">{b.cta_text}</span> → <code className="text-charcoal-500 font-mono text-[10px]">{b.cta_link}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteBanner(b.id, b.title)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-red-200"
                        title="Delete banner"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-ivory-300 pb-3">
            <div>
              <h2 className="font-serif font-bold text-base text-charcoal-900 flex items-center gap-2">
                <Tag size={18} className="text-brand-700" />
                <span>Marketplace Promotional Coupons ({coupons.length})</span>
              </h2>
              <p className="text-xs text-charcoal-500">Configure promotional discount codes with minimum order values.</p>
            </div>
          </div>

          {/* CREATE COUPON FORM */}
          <form onSubmit={handleCreateCoupon} className="p-4 bg-ivory-100 rounded-lg space-y-3">
            <h4 className="font-bold text-xs text-charcoal-900 uppercase tracking-wider">Create New Promo Code</h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="KUTCH25"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-1.5 text-xs rounded border border-ivory-400 font-mono uppercase bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">Discount Type</label>
                <select
                  value={couponType}
                  onChange={(e) => setCouponType(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs rounded border border-ivory-400 bg-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">Discount Value</label>
                <input
                  type="number"
                  required
                  value={couponValue}
                  onChange={(e) => setCouponValue(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded border border-ivory-400 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">Min Order Value (₹)</label>
                <input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded border border-ivory-400 bg-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={creatingCoupon}
                  className="w-full py-2 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold shadow-sm"
                >
                  {creatingCoupon ? 'Adding...' : 'Add Coupon'}
                </button>
              </div>
            </div>
          </form>

          {/* COUPONS TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-50 border-b border-ivory-300 text-charcoal-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Discount</th>
                  <th className="p-3">Min Order</th>
                  <th className="p-3">Usage Count</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-ivory-50">
                    <td className="p-3 font-mono font-bold text-brand-900">{c.code}</td>
                    <td className="p-3 font-semibold">
                      {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}
                    </td>
                    <td className="p-3">₹{c.min_order_value.toLocaleString('en-IN')}</td>
                    <td className="p-3">{c.used_count || 0} times</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleCoupon(c)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                          c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-charcoal-200 text-charcoal-700'
                        }`}
                      >
                        {c.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(c.id, c.code)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Delete coupon"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
