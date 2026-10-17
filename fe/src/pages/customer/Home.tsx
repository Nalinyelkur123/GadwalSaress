import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  Truck, 
  Users, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { SareeCard } from '../../components/common/SareeCard';
import { Category, Product, SellerProfile } from '../../types';

export const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.get('/storefront/home');
        setCategories(res.data.categories || []);
        setFeaturedProducts(res.data.featuredProducts || []);
        setNewArrivals(res.data.newArrivals || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      
      {/* ========================================================= */}
      {/* 1. HERO SECTION (Authentic Pit-Loom Reference Image) */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-[#FAF6F0] border-b border-ivory-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 lg:pt-14 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* LEFT COLUMN: HERO TEXT */}
            <div className="lg:col-span-6 space-y-6 z-10">
              <span className="text-[11px] font-bold tracking-[0.25em] text-gold-600 uppercase block font-sans">
                The Heritage of Telangana
              </span>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.6rem] font-bold text-charcoal-900 leading-[1.12]">
                Authentic <br />
                <span className="text-brand-900">Gadwal Handlooms</span>
              </h1>

              <p className="text-sm sm:text-base text-charcoal-600 max-w-md leading-relaxed font-sans">
                Handcrafted directly by master pit-loom weavers in Gadwal, Telangana. Certified authentic silk, kuttu interlocking borders, and pure zari in every weave.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link
                  to="/shop"
                  className="px-7 py-3 bg-brand-700 hover:bg-brand-800 text-white font-medium text-xs tracking-wider rounded flex items-center gap-2 shadow-warm-md transition-all group"
                >
                  <span>Shop Sarees</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/craft-and-heritage"
                  className="px-6 py-3 border border-brand-800/40 text-brand-900 hover:bg-brand-50 font-medium text-xs tracking-wider rounded transition-colors"
                >
                  Our Heritage Story
                </Link>
              </div>

              {/* 4 PILLARS STRIP */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-ivory-300">
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
                  <Award size={20} className="text-gold-600" />
                  <span className="text-xs font-bold text-charcoal-900">GI Certified</span>
                  <span className="text-[10px] text-charcoal-500">Authentic Handlooms</span>
                </div>

                <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
                  <Users size={20} className="text-gold-600" />
                  <span className="text-xs font-bold text-charcoal-900">Direct from Weavers</span>
                  <span className="text-[10px] text-charcoal-500">Zero Middlemen</span>
                </div>

                <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
                  <ShieldCheck size={20} className="text-gold-600" />
                  <span className="text-xs font-bold text-charcoal-900">Secure Payments</span>
                  <span className="text-[10px] text-charcoal-500">Razorpay Verified</span>
                </div>

                <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
                  <Truck size={20} className="text-gold-600" />
                  <span className="text-xs font-bold text-charcoal-900">Insured Delivery</span>
                  <span className="text-[10px] text-charcoal-500">Pan-India Express</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: MAIN SAREE HERO PHOTOGRAPHY */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-warm-lg border border-ivory-300">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80"
                  alt="Authentic Gadwal Pure Silk Saree"
                  className="w-full h-full object-cover object-top"
                />

                {/* FLOATING CURATED CARD OVERLAY */}
                <div className="absolute bottom-5 right-5 left-5 sm:left-auto sm:w-80 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-warm-lg border border-ivory-300">
                  <span className="text-[10px] uppercase font-bold text-gold-600 tracking-wider">Pit-Loom Masterpiece</span>
                  <h4 className="font-serif font-bold text-sm text-charcoal-900 mb-0.5">
                    Royal Kuttu Gadwal Silk Saree
                  </h4>
                  <p className="text-[11px] text-charcoal-600 mb-2 leading-tight">
                    Interlocked mulberry silk body with pure zari pallu.
                  </p>
                  <div className="flex items-center justify-between border-t border-ivory-200 pt-2">
                    <Link
                      to="/shop"
                      className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1 group"
                    >
                      <span>Explore Catalog</span>
                      <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      GI Tagged
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. MAIN SAREE CATEGORIES */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-[0.25em] text-gold-600 uppercase block mb-1">
              Curated Collections
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
              Shop by Category
            </h2>
            <p className="text-xs text-charcoal-500 mt-1">
              Pure silk, lightweight cotton, and heirloom bridal pit-loom weaves.
            </p>
          </div>
          <Link
            to="/categories"
            className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1 group"
          >
            <span>View All Categories</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group flex flex-col items-center text-center space-y-2.5"
            >
              <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-ivory-200 border border-ivory-300 shadow-warm-sm group-hover:shadow-warm-md transition-all">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xs text-charcoal-900 group-hover:text-brand-700 transition-colors">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. FEATURED SAREES (Live Database Products) */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-[0.25em] text-gold-600 uppercase block mb-1">
              Featured Handlooms
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
              Our Handpicked Sarees
            </h2>
            <p className="text-xs text-charcoal-500 mt-1">
              Direct from the pit-looms of Telangana's certified weavers.
            </p>
          </div>

          <Link
            to="/shop"
            className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1 group"
          >
            <span>View All Sarees</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map((product) => (
            <SareeCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. CONCISE WEAVING HERITAGE SECTION */}
      {/* ========================================================= */}
      <section className="bg-ivory-200 border-y border-ivory-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* ARTISAN PHOTOGRAPHY */}
            <div className="lg:col-span-6">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-warm-lg border border-ivory-300">
                <img
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=1000&auto=format&fit=crop&q=80"
                  alt="Master Artisan weaving authentic Gadwal saree at pit loom"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-charcoal-900/85 backdrop-blur-sm p-3.5 rounded-lg text-white text-xs">
                  <p className="font-serif font-bold text-gold-300 text-sm">The Authentic Pit Loom Tradition</p>
                  <p className="text-[11px] text-ivory-200 mt-0.5">
                    Weaving a single Gadwal saree requires 15 to 25 days of dedicated pit-loom interlock artistry.
                  </p>
                </div>
              </div>
            </div>

            {/* HERITAGE CONTENT */}
            <div className="lg:col-span-6 space-y-5">
              <span className="text-[11px] font-bold tracking-[0.25em] text-gold-600 uppercase block">
                Centuries of Craftsmanship
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 leading-tight">
                More Than a Saree. <br />
                A Living Handloom Heritage.
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed font-sans">
                Renowned for their patented <b>Kuttu (Kevvu) interlock technique</b>, Gadwal sarees seamlessly connect a lightweight, breathable body with a contrast pure silk and zari border and pallu.
              </p>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed font-sans">
                Every saree purchased through our marketplace provides direct financial empowerment to the weaving families in Gadwal, safeguarding India's irreplaceable handloom legacy.
              </p>
              <div className="pt-2">
                <Link
                  to="/craft-and-heritage"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-700 hover:bg-brand-800 text-white font-medium text-xs tracking-wider rounded transition-colors shadow-sm"
                >
                  <span>Read The Full Heritage Story</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. NEW ARRIVALS SECTION (If active products exist) */}
      {/* ========================================================= */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-[0.25em] text-gold-600 uppercase block mb-1">
                Fresh from the Looms
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
                New Arrivals
              </h2>
              <p className="text-xs text-charcoal-500 mt-1">
                Recently completed weaves available directly from the artisans.
              </p>
            </div>

            <Link
              to="/shop?filter=new"
              className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1 group"
            >
              <span>Explore New Weaves</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.slice(0, 4).map((product) => (
              <SareeCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 6. PROMOTIONAL CURATIONS (Bridal & Festive Handlooms) */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* BRIDAL COLLECTION BANNER */}
          <div className="lg:col-span-7 relative rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] shadow-warm-md group">
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&auto=format&fit=crop&q=80"
              alt="Bridal Gadwal Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/85 via-charcoal-900/50 to-transparent flex flex-col justify-center p-8 sm:p-12 text-white">
              <span className="text-[10px] uppercase font-bold text-gold-400 tracking-widest mb-1">Heirloom Handlooms</span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
                Bridal Gadwal Sarees
              </h3>
              <p className="text-xs sm:text-sm text-ivory-300 max-w-sm mb-6 leading-relaxed">
                Timeless pure silk sarees woven with ceremonial temple borders and heavy zari pallus.
              </p>
              <div>
                <Link
                  to="/shop?category=bridal-collection"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-medium text-xs rounded transition-colors shadow-sm"
                >
                  <span>Explore Bridal Sarees</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* FESTIVE SAREES BANNER */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto shadow-warm-md group">
            <img
              src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1000&auto=format&fit=crop&q=80"
              alt="Festive Gadwal Sarees"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/50 to-transparent flex flex-col justify-end p-8 text-white">
              <span className="text-[10px] uppercase font-bold text-gold-400 tracking-widest mb-1">Celebration Handlooms</span>
              <h3 className="font-serif text-2xl font-bold mb-2">Festive Collection</h3>
              <p className="text-xs text-ivory-300 mb-4 leading-relaxed">
                Lightweight Sico and vibrant pure silk sarees crafted for auspicious occasions.
              </p>
              <div>
                <Link
                  to="/shop?category=silk-cotton-sarees"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-charcoal-900 hover:bg-ivory-100 font-semibold text-xs rounded transition-colors shadow-sm"
                >
                  <span>Shop Festive Weaves</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. HANDLOOM NEWSLETTER / CONCIERGE */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-900 rounded-2xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-warm-lg border border-brand-800">
          <div className="max-w-xl mx-auto space-y-3 relative z-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gold-200">
              Stay Connected with Gadwal Weaves
            </h2>
            <p className="text-xs text-ivory-300 leading-relaxed">
              Receive notifications when fresh weaves come off the loom, along with exclusive handloom care guides.
            </p>

            {newsletterSubscribed ? (
              <div className="p-3 bg-brand-800/80 rounded border border-gold-400/30 text-gold-300 text-xs font-medium">
                ✓ Thank you for subscribing to our handloom updates.
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded text-xs text-charcoal-900 bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-gold-200 font-semibold text-xs rounded border border-gold-400/40 transition-colors shadow-sm whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};
