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
  Star,
  Users,
  Compass
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
      {/* 1. HERO SECTION (Mirroring the uploaded high-fidelity mockup) */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-[#FAF7F2] border-b border-ivory-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 lg:pt-14 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* HERO TEXT */}
            <div className="lg:col-span-6 space-y-6 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-[11px] font-bold uppercase tracking-[0.2em]">
                <Sparkles size={12} className="text-gold-500" />
                <span>The Legacy of Gadwal</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal-900 leading-[1.15]">
                Authentic <br />
                <span className="text-brand-800">Gadwal Handlooms</span>
              </h1>

              <p className="text-sm sm:text-base text-charcoal-600 max-w-lg leading-relaxed">
                Handwoven in Gadwal, Telangana. A legacy in every thread, carrying the heritage of royal patronages and interlocking kuttu borders.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
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

              {/* 4 PILLARS STRIP */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-ivory-300">
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div className="w-8 h-8 rounded-full bg-gold-100 text-gold-600 flex items-center justify-center mb-1.5">
                    <Award size={16} />
                  </div>
                  <span className="text-xs font-bold text-charcoal-900">Authentic Handlooms</span>
                  <span className="text-[10px] text-charcoal-500">GI & Silk Mark Certified</span>
                </div>

                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div className="w-8 h-8 rounded-full bg-gold-100 text-gold-600 flex items-center justify-center mb-1.5">
                    <Users size={16} />
                  </div>
                  <span className="text-xs font-bold text-charcoal-900">Direct From Weavers</span>
                  <span className="text-[10px] text-charcoal-500">Zero Middlemen</span>
                </div>

                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div className="w-8 h-8 rounded-full bg-gold-100 text-gold-600 flex items-center justify-center mb-1.5">
                    <ShieldCheck size={16} />
                  </div>
                  <span className="text-xs font-bold text-charcoal-900">Reliable Payments</span>
                  <span className="text-[10px] text-charcoal-500">100% Encrypted & Safe</span>
                </div>

                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div className="w-8 h-8 rounded-full bg-gold-100 text-gold-600 flex items-center justify-center mb-1.5">
                    <Truck size={16} />
                  </div>
                  <span className="text-xs font-bold text-charcoal-900">Pan-India Delivery</span>
                  <span className="text-[10px] text-charcoal-500">Free Insured Shipping</span>
                </div>
              </div>
            </div>

            {/* HERO IMAGE & FLOATING SHOWCASE CARD */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="relative w-full max-w-md lg:max-w-none aspect-[4/5] rounded-2xl overflow-hidden shadow-warm-lg border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80"
                  alt="Model wearing authentic Gadwal Silk Saree"
                  className="w-full h-full object-cover object-top"
                />

                {/* FLOATING CARD OVERLAY (As in mockup) */}
                <div className="absolute bottom-6 right-6 left-6 sm:left-auto sm:w-72 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-warm-lg border border-ivory-300">
                  <span className="text-[10px] font-bold text-gold-600 uppercase tracking-wider block mb-1">
                    Featured Masterpiece
                  </span>
                  <h4 className="font-serif font-bold text-xs text-charcoal-900 mb-1">
                    Royal Gadwal Silk Saree
                  </h4>
                  <p className="text-[11px] text-charcoal-600 mb-2 leading-snug">
                    Handwoven with traditional Gadwal interlock technique & pure gold zari.
                  </p>
                  <Link
                    to="/shop"
                    className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1 group"
                  >
                    <span>Explore Collection</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. SHOP BY CATEGORY */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-gold-600 uppercase block mb-1">
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
      {/* 3. FEATURED HANDPICKED SAREES (Mockup grid) */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-gold-600 uppercase block mb-1">
              Featured Collection
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
              Our Handpicked Sarees
            </h2>
            <p className="text-xs text-charcoal-500 mt-1">
              Explore the finest Gadwal handlooms curated from our certified weavers.
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
      {/* 4. HERITAGE STORY & VIDEO CTA */}
      {/* ========================================================= */}
      <section className="bg-ivory-200 border-y border-ivory-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* VIDEO THUMBNAIL */}
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
                  <h4 className="font-serif font-bold text-lg mb-1">Watch Our Story</h4>
                  <p className="text-xs text-gold-200">The Art of Gadwal Weaves</p>
                </div>
              </div>
            </div>

            {/* HERITAGE CONTENT */}
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-bold tracking-[0.2em] text-gold-600 uppercase block">
                A Rich Heritage
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 leading-tight">
                More Than a Saree. <br />
                A Living Tradition.
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Gadwal sarees are known for their unique interlock weaving, rich silk, and timeless elegance. Each saree carries the legacy of generations of skilled weavers from Gadwal, Telangana, who weave the lightweight cotton body and pure silk border with seamless interlocking precision.
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
      {/* 5. WHY CHOOSE GADWAL WEAVES (4 FEATURES STRIP) */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Why Choose Gadwal Weaves?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-white border border-ivory-300 text-center space-y-2.5 shadow-warm-sm">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center mx-auto">
              <Users size={22} />
            </div>
            <h3 className="font-serif font-bold text-sm text-charcoal-900">Verified Weavers</h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Sellers are certified handloom cooperatives and master artisans from Gadwal.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-ivory-300 text-center space-y-2.5 shadow-warm-sm">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center mx-auto">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-serif font-bold text-sm text-charcoal-900">Authenticity Guarantee</h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Silk Mark & Handloom Mark certified. 100% genuine weaves or full refund.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-ivory-300 text-center space-y-2.5 shadow-warm-sm">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center mx-auto">
              <Sparkles size={22} />
            </div>
            <h3 className="font-serif font-bold text-sm text-charcoal-900">Wide Collection</h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              From traditional temple borders to modern festive pastel palettes.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-ivory-300 text-center space-y-2.5 shadow-warm-sm">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center mx-auto">
              <Award size={22} />
            </div>
            <h3 className="font-serif font-bold text-sm text-charcoal-900">Secure & Easy Shopping</h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Razorpay encrypted checkout, order tracking, and hassle-free returns.
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
            <span className="text-xs font-bold tracking-[0.2em] text-gold-600 uppercase block mb-1">
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
      {/* 7. BENTO COLLECTION BANNERS (Bridal, New Arrivals, Festive) */}
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
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/80 via-charcoal-900/50 to-transparent flex flex-col justify-center p-8 sm:p-12 text-white">
              <span className="text-[10px] font-bold tracking-[0.2em] text-gold-300 uppercase mb-2">
                Curated Series
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
                Bridal Collection
              </h3>
              <p className="text-xs sm:text-sm text-ivory-300 max-w-sm mb-6 leading-relaxed">
                Exquisite handwoven pure silk sarees crafted for your most auspicious wedding moments.
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
                <p className="text-xs text-ivory-300 mb-3">Fresh weaves, new stories straight from the loom.</p>
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
                <p className="text-xs text-ivory-300 mb-3">Find the best sarees for every celebration.</p>
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
            Loved by saree enthusiasts and brides across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test) => (
            <div key={test.id} className="bg-white p-6 rounded-xl border border-ivory-300 shadow-warm-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center text-amber-500 mb-3">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
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
      {/* 9. JOIN OUR HANDLOOM COMMUNITY (Newsletter Banner) */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-900 rounded-2xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-warm-lg">
          <div className="max-w-xl mx-auto space-y-4 relative z-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gold-200">
              Join Our Handloom Community
            </h2>
            <p className="text-xs text-ivory-300 leading-relaxed">
              Get updates on new collections, exclusive festive offers, and stories from our master weavers.
            </p>

            {newsletterSubscribed ? (
              <div className="p-3 bg-brand-800/80 rounded border border-gold-400/30 text-gold-300 text-xs font-medium">
                ✓ Thank you for subscribing! We've sent a 10% welcome coupon to your inbox.
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
                  Subscribe
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
