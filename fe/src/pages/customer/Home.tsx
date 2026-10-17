import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Truck, 
  Play, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Star,
  Users,
  Compass,
  MapPin,
  Heart
} from 'lucide-react';
import { api } from '../../services/api';
import { SareeCard } from '../../components/common/SareeCard';
import { Category, Product, SellerProfile, Review } from '../../types';

export const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [weavers, setWeavers] = useState<SellerProfile[]>([]);
  const [testimonials, setTestimonials] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.get('/storefront/home');
        setCategories(res.data.categories || []);
        setFeaturedProducts(res.data.featuredProducts || []);
        setWeavers(res.data.weavers || []);
        setTestimonials(res.data.testimonials || []);
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
      {/* 1. HERO SECTION (Pixel-aligned to provided mockup) */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-[#FAF6F0] border-b border-ivory-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 lg:pt-12 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* LEFT COLUMN: HERO TEXT */}
            <div className="lg:col-span-6 space-y-6 z-10">
              <span className="text-[11px] font-bold tracking-[0.25em] text-gold-600 uppercase block font-sans">
                The Legacy of Gadwal
              </span>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-charcoal-900 leading-[1.12]">
                Authentic <br />
                <span className="text-charcoal-900">Gadwal Handlooms</span>
              </h1>

              <p className="text-sm sm:text-base text-charcoal-600 max-w-md leading-relaxed font-sans">
                Handwoven in Gadwal, Telangana.<br />
                A legacy in every thread.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link
                  to="/shop"
                  className="px-6 py-3 bg-brand-700 hover:bg-brand-800 text-white font-medium text-xs tracking-wider rounded flex items-center gap-2 shadow-warm-md transition-all group"
                >
                  <span>Shop Sarees</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/craft-and-heritage"
                  className="px-6 py-3 border border-brand-800/40 text-brand-900 hover:bg-brand-50 font-medium text-xs tracking-wider rounded transition-colors"
                >
                  Our Story
                </Link>
              </div>

              {/* 4 PILLARS STRIP (Matching Icons in Mockup) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-ivory-300">
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
                  <Award size={20} className="text-gold-600" />
                  <span className="text-xs font-bold text-charcoal-900">Authentic Handlooms</span>
                </div>

                <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
                  <Users size={20} className="text-gold-600" />
                  <span className="text-xs font-bold text-charcoal-900">Direct from Weavers</span>
                </div>

                <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
                  <ShieldCheck size={20} className="text-gold-600" />
                  <span className="text-xs font-bold text-charcoal-900">Reliable Payments</span>
                </div>

                <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
                  <Truck size={20} className="text-gold-600" />
                  <span className="text-xs font-bold text-charcoal-900">Pan-India Delivery</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: MAIN SAREE PHOTOGRAPHY & FLOATING CARD */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-warm-lg">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80"
                  alt="Model wearing authentic Gadwal Silk Saree"
                  className="w-full h-full object-cover object-top"
                />

                {/* FLOATING CARD OVERLAY (Identical to mockup) */}
                <div className="absolute bottom-5 right-5 left-5 sm:left-auto sm:w-80 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-warm-lg border border-ivory-300">
                  <h4 className="font-serif font-bold text-sm text-charcoal-900 mb-0.5">
                    Royal Gadwal Silk Saree
                  </h4>
                  <p className="text-[11px] text-charcoal-600 mb-2 leading-tight">
                    Handwoven with traditional Gadwal interlock technique.
                  </p>
                  <div className="flex items-center justify-between border-t border-ivory-300 pt-2">
                    <Link
                      to="/shop"
                      className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1 group"
                    >
                      <span>Explore Collection</span>
                      <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <div className="flex items-center space-x-1 text-[11px] text-charcoal-500 font-mono">
                      <span>‹</span>
                      <span className="font-bold text-charcoal-800">01</span>
                      <span>/</span>
                      <span>04</span>
                      <span>›</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. SHOP BY CATEGORY (6 Round Thumbnail Cards) */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-[0.25em] text-gold-600 uppercase block mb-1">
              Explore Our Collections
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/shop"
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
      {/* 3. FEATURED COLLECTION: OUR HANDPICKED SAREES */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-[0.25em] text-gold-600 uppercase block mb-1">
              Featured Collection
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
              Our Handpicked Sarees
            </h2>
            <p className="text-xs text-charcoal-500 mt-1">
              Explore the finest Gadwal handlooms from our certified weavers.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 text-charcoal-600">
              <button className="w-7 h-7 rounded-full border border-ivory-400 hover:border-brand-700 flex items-center justify-center text-xs">
                <ChevronLeft size={14} />
              </button>
              <button className="w-7 h-7 rounded-full border border-ivory-400 hover:border-brand-700 flex items-center justify-center text-xs">
                <ChevronRight size={14} />
              </button>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1 group ml-2"
            >
              <span>View All Sarees</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map((product) => (
            <SareeCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. HERITAGE STORY & VIDEO CTA */}
      {/* ========================================================= */}
      <section className="bg-ivory-200 border-y border-ivory-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* VIDEO THUMBNAIL (Artisan at Pit Loom) */}
            <div className="lg:col-span-6">
              <div 
                onClick={() => setVideoModalOpen(true)}
                className="relative aspect-video rounded-xl overflow-hidden shadow-warm-lg cursor-pointer group"
              >
                <img
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=1000&auto=format&fit=crop&q=80"
                  alt="Artisan weaving at pit loom"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-charcoal-900/40 flex flex-col items-center justify-center p-6 text-center text-white">
                  <div className="w-14 h-14 rounded-full bg-brand-700/90 text-white flex items-center justify-center pl-1 mb-3 group-hover:scale-110 transition-transform shadow-lg border border-gold-400">
                    <Play size={24} fill="currentColor" />
                  </div>
                  <h4 className="font-serif font-bold text-lg mb-0.5">Watch Our Story</h4>
                  <p className="text-xs text-gold-200">The Art of Gadwal Weaves</p>
                </div>
              </div>
            </div>

            {/* HERITAGE CONTENT */}
            <div className="lg:col-span-6 space-y-5">
              <span className="text-[11px] font-bold tracking-[0.25em] text-gold-600 uppercase block">
                A Rich Heritage
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 leading-tight">
                More Than a Saree. <br />
                A Living Tradition.
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed font-sans">
                Gadwal sarees are known for their unique interlock weaving, rich silk, and timeless elegance. Each saree carries the legacy of generations of skilled weavers from Gadwal, Telangana.
              </p>
              <div>
                <Link
                  to="/craft-and-heritage"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-medium text-xs tracking-wider rounded transition-colors shadow-sm"
                >
                  <span>Our Story</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. WHY CHOOSE GADWAL WEAVES? */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Why Choose Gadwal Weaves?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-white border border-ivory-300 text-center space-y-2 shadow-warm-sm">
            <div className="w-12 h-12 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center mx-auto">
              <Users size={22} />
            </div>
            <h3 className="font-serif font-bold text-sm text-charcoal-900">Verified Weavers</h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Sellers are certified from Gadwal.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-ivory-300 text-center space-y-2 shadow-warm-sm">
            <div className="w-12 h-12 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center mx-auto">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-serif font-bold text-sm text-charcoal-900">Authenticity Guarantee</h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Handloom & Silk Mark sarees.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-ivory-300 text-center space-y-2 shadow-warm-sm">
            <div className="w-12 h-12 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center mx-auto">
              <Sparkles size={22} />
            </div>
            <h3 className="font-serif font-bold text-sm text-charcoal-900">Wide Collection</h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              From traditional to modern.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-ivory-300 text-center space-y-2 shadow-warm-sm">
            <div className="w-12 h-12 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center mx-auto">
              <Award size={22} />
            </div>
            <h3 className="font-serif font-bold text-sm text-charcoal-900">Secure & Easy Shopping</h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Multiple payment options.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. MEET THE WEAVERS */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-[0.25em] text-gold-600 uppercase block mb-1">
              Meet the Weavers
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
              The Hands Behind the Heritage
            </h2>
            <p className="text-xs text-charcoal-500 mt-1">
              Real people. Real stories. Real craftsmanship.
            </p>
          </div>
          <Link
            to="/weavers"
            className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1 group"
          >
            <span>View All Weavers</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {weavers.map((weaver) => (
            <div key={weaver.id} className="bg-white rounded-xl overflow-hidden border border-ivory-300 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col">
              <div className="aspect-[4/3] overflow-hidden bg-ivory-200">
                <img
                  src={weaver.cover_url || weaver.logo_url}
                  alt={weaver.business_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-sm text-charcoal-900 mb-1">
                    {weaver.business_name}
                  </h3>
                  <p className="text-[11px] text-charcoal-500 flex items-center gap-1 mb-1">
                    <span>📍</span> {weaver.location}
                  </p>
                  <p className="text-[11px] text-gold-600 font-semibold mb-3">
                    {weaver.experience_years}+ years of weaving
                  </p>
                </div>
                <Link
                  to={`/weavers/${weaver.slug}`}
                  className="text-xs font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-1 group"
                >
                  <span>View Story</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. BENTO COLLECTION BANNERS */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* BRIDAL COLLECTION (Large Left) */}
          <div className="lg:col-span-7 relative rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] shadow-warm-md group">
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&auto=format&fit=crop&q=80"
              alt="Bridal Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/85 via-charcoal-900/50 to-transparent flex flex-col justify-center p-8 sm:p-12 text-white">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
                Bridal Collection
              </h3>
              <p className="text-xs sm:text-sm text-ivory-300 max-w-sm mb-6 leading-relaxed">
                Exquisite handwoven sarees for your special moments.
              </p>
              <div>
                <Link
                  to="/shop?category=bridal-collection"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-medium text-xs rounded transition-colors shadow-sm"
                >
                  <span>Explore Collection</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* TWO STACKED CARDS RIGHT */}
          <div className="lg:col-span-5 grid grid-cols-1 gap-6">
            
            {/* NEW ARRIVALS */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/8] shadow-warm-md group">
              <img
                src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&auto=format&fit=crop&q=80"
                alt="New Arrivals"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/80 to-transparent flex flex-col justify-center p-6 text-white">
                <h3 className="font-serif text-xl font-bold mb-1">New Arrivals</h3>
                <p className="text-xs text-ivory-300 mb-3">Fresh weaves, new stories.</p>
                <div>
                  <Link
                    to="/shop?category=new-arrivals"
                    className="text-xs font-semibold text-gold-300 hover:text-white flex items-center gap-1 group"
                  >
                    <span>Shop Now</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* FESTIVE COLLECTION */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/8] shadow-warm-md group">
              <img
                src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1000&auto=format&fit=crop&q=80"
                alt="Festive Collection"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/80 to-transparent flex flex-col justify-center p-6 text-white">
                <h3 className="font-serif text-xl font-bold mb-1">Festive Collection</h3>
                <p className="text-xs text-ivory-300 mb-3">Find the best sarees for every celebration!</p>
                <div>
                  <Link
                    to="/shop?collection=festive-collection"
                    className="text-xs font-semibold text-gold-300 hover:text-white flex items-center gap-1 group"
                  >
                    <span>Shop Now</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. WHAT OUR CUSTOMERS SAY */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            What Our Customers Say
          </h2>
          <p className="text-xs text-charcoal-500 mt-1">
            Loved by saree enthusiasts across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test) => (
            <div key={test.id} className="bg-white p-6 rounded-xl border border-ivory-300 shadow-warm-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center text-amber-500 mb-3">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-charcoal-700 leading-relaxed italic">
                  "{test.comment}"
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-3 border-t border-ivory-300">
                <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center text-xs">
                  {test.customer_name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal-900">{test.customer_name}</h4>
                  <p className="text-[10px] text-charcoal-500">Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. JOIN OUR HANDLOOM COMMUNITY (Newsletter) */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-900 rounded-2xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-warm-lg">
          <div className="max-w-xl mx-auto space-y-3 relative z-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gold-200">
              Join Our Handloom Community
            </h2>
            <p className="text-xs text-ivory-300 leading-relaxed">
              Get updates on new collections, exclusive offers and stories from our weavers.
            </p>

            {newsletterSubscribed ? (
              <div className="p-3 bg-brand-800/80 rounded border border-gold-400/30 text-gold-300 text-xs font-medium">
                ✓ Thank you for subscribing! We've sent a welcome coupon to your inbox.
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
                  className="px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-gold-200 font-semibold text-xs rounded border border-gold-400/40 transition-colors shadow-sm"
                >
                  Subscribe →
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* VIDEO MODAL */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl overflow-hidden max-w-3xl w-full">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-3 right-3 text-white bg-charcoal-900/60 p-1.5 rounded-full hover:bg-charcoal-900"
            >
              ✕
            </button>
            <div className="aspect-video bg-black flex items-center justify-center">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="The Art of Gadwal Weaves"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
