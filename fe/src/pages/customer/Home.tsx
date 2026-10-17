import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft,
  Star, 
  Heart, 
  Play, 
  Award, 
  Users, 
  ShieldCheck, 
  Truck, 
  ShoppingBag, 
  MapPin, 
  Clock, 
  Sparkles,
  X
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
  
  // Hero slide index (simulated for reference UI: 01 / 04)
  const [heroSlide, setHeroSlide] = useState(1);
  const totalHeroSlides = 4;

  // Video modal
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState('');

  // Newsletter
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

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
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  const openVideo = (url: string) => {
    setActiveVideoUrl(url);
    setVideoModalOpen(true);
  };

  return (
    <div className="space-y-16 sm:space-y-20 lg:space-y-24 pb-16 bg-[#FAF6F0]/30">
      
      {/* ========================================================= */}
      {/* 1. HERO SECTION (Exact Reference Reproduction) */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-[#FAF6F0] border-b border-[#EAE3D2]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 lg:pt-14 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: HERO HEADLINE & ACTIONS */}
            <div className="lg:col-span-6 space-y-6 z-10">
              <span className="text-xs font-serif font-bold tracking-[0.2em] text-[#B8860B] uppercase block">
                The Legacy of Gadwal
              </span>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.85rem] font-bold text-[#1F1E1D] leading-[1.08] tracking-tight">
                Authentic <br />
                <span className="text-[#1F1E1D]">Gadwal Handlooms</span>
              </h1>

              <div className="space-y-0.5 text-sm sm:text-base text-[#5A554E] leading-relaxed font-sans">
                <p>Handwoven in Gadwal, Telangana.</p>
                <p>A legacy in every thread.</p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link
                  to="/shop"
                  className="px-6 py-3 bg-[#5C101D] hover:bg-[#4A0D17] text-white font-medium text-xs tracking-wider rounded-md flex items-center gap-2 shadow-sm transition-all"
                >
                  <span>Shop Sarees</span>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  to="/craft-and-heritage"
                  className="px-6 py-3 bg-white border border-[#D5CBB9] text-[#2F2C2A] hover:bg-[#F9F6F0] font-medium text-xs tracking-wider rounded-md transition-colors shadow-sm"
                >
                  Our Story
                </Link>
              </div>

              {/* 4 HORIZONTAL TRUST INDICATORS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#E8E1D3]">
                <div className="flex items-center space-x-2 text-left">
                  <Award size={18} className="text-[#B8860B] flex-shrink-0" />
                  <span className="text-xs font-semibold text-[#2F2C2A]">Authentic Handlooms</span>
                </div>

                <div className="flex items-center space-x-2 text-left">
                  <Users size={18} className="text-[#B8860B] flex-shrink-0" />
                  <span className="text-xs font-semibold text-[#2F2C2A]">Direct from Weavers</span>
                </div>

                <div className="flex items-center space-x-2 text-left">
                  <ShieldCheck size={18} className="text-[#B8860B] flex-shrink-0" />
                  <span className="text-xs font-semibold text-[#2F2C2A]">Secure Payments</span>
                </div>

                <div className="flex items-center space-x-2 text-left">
                  <Truck size={18} className="text-[#B8860B] flex-shrink-0" />
                  <span className="text-xs font-semibold text-[#2F2C2A]">Pan-India Delivery</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: HERO PHOTOGRAPHY WITH FLOATING CARD */}
            <div className="lg:col-span-6 relative flex flex-col items-center">
              <div className="relative w-full aspect-[4/5] sm:aspect-[4/5] max-h-[560px] rounded-2xl overflow-hidden shadow-warm-lg border border-[#E8E1D3]">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1400&auto=format&fit=crop&q=80"
                  alt="Authentic Gadwal Pure Silk Saree draped on woman"
                  className="w-full h-full object-cover object-top"
                />

                {/* FLOATING CARD OVERLAY (Reference bottom-right) */}
                <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-72 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-warm-md border border-[#E8E1D3] text-left">
                  <h4 className="font-serif font-bold text-sm text-[#1F1E1D] mb-1">
                    Royal Gadwal Silk Saree
                  </h4>
                  <p className="text-[11px] text-[#69635C] leading-snug mb-2">
                    Handwoven with traditional Gadwal interlock technique.
                  </p>
                  <Link
                    to="/shop?category=pure-silk-sarees"
                    className="text-xs font-semibold text-[#5C101D] hover:text-[#32070E] flex items-center gap-1 group"
                  >
                    <span>Explore Collection</span>
                    <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* SLIDER INDICATOR & CONTROLS */}
              <div className="flex items-center justify-between w-full max-w-[560px] pt-3 px-1 text-xs text-[#69635C]">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setHeroSlide((prev) => (prev > 1 ? prev - 1 : totalHeroSlides))}
                    className="w-7 h-7 rounded-full bg-white border border-[#D5CBB9] flex items-center justify-center hover:bg-[#FAF6F0] text-[#1F1E1D]"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button 
                    onClick={() => setHeroSlide((prev) => (prev < totalHeroSlides ? prev + 1 : 1))}
                    className="w-7 h-7 rounded-full bg-white border border-[#D5CBB9] flex items-center justify-center hover:bg-[#FAF6F0] text-[#1F1E1D]"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
                <span className="font-mono text-xs font-medium text-[#1F1E1D]">
                  0{heroSlide} / 0{totalHeroSlides}
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. EXPLORE OUR COLLECTIONS — SHOP BY CATEGORY */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 pb-2 border-b border-[#E8E1D3]/80">
          <div>
            <span className="text-[11px] font-serif font-bold tracking-[0.2em] text-[#B8860B] uppercase block mb-1">
              Explore Our Collections
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1E1D]">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/categories"
            className="text-xs font-semibold text-[#5C101D] hover:text-[#32070E] flex items-center gap-1 group whitespace-nowrap"
          >
            <span>View All Categories</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 6 CATEGORY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group flex flex-col items-center text-center space-y-2.5"
            >
              <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#FAF6F0] border border-[#E8E1D3] shadow-warm-sm group-hover:shadow-warm-md transition-all duration-300">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xs text-[#1F1E1D] group-hover:text-[#5C101D] transition-colors">
                  {cat.name.replace(/ Sarees/i, '')}
                </h3>
                <span className="text-[10px] text-[#69635C] block">
                  {cat.slug.includes('collection') ? 'Collection' : 'Sarees'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. FEATURED COLLECTION — OUR HANDPICKED SAREES */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-2 border-b border-[#E8E1D3]/80 gap-4">
          <div>
            <span className="text-[11px] font-serif font-bold tracking-[0.2em] text-[#B8860B] uppercase block mb-1">
              Featured Collection
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1E1D]">
              Our Handpicked Sarees
            </h2>
            <p className="text-xs text-[#69635C] mt-1">
              Explore the finest Gadwal handlooms from our certified weavers.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="hidden sm:flex items-center space-x-1.5">
              <button 
                className="w-8 h-8 rounded-full bg-white border border-[#D5CBB9] flex items-center justify-center hover:bg-[#FAF6F0] text-[#1F1E1D]"
                aria-label="Previous sarees"
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                className="w-8 h-8 rounded-full bg-white border border-[#D5CBB9] flex items-center justify-center hover:bg-[#FAF6F0] text-[#1F1E1D]"
                aria-label="Next sarees"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <Link
              to="/shop"
              className="px-4 py-1.5 border border-[#5C101D] text-[#5C101D] hover:bg-[#5C101D] hover:text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <span>View All Sarees</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>

        {/* 4 HANDPICKED PRODUCT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map((product) => (
            <SareeCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. BRAND / HERITAGE STORY: MORE THAN A SAREE */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* LEFT: ARTISAN VIDEO / STORY CARD */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[16/10] sm:aspect-[16/10] rounded-2xl overflow-hidden shadow-warm-md border border-[#E8E1D3] group">
              <img
                src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop&q=80"
                alt="Weavers hands working at wooden pit loom"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1E1D]/90 via-[#1F1E1D]/30 to-transparent flex flex-col items-center justify-center p-6 text-center text-white">
                <button
                  onClick={() => openVideo('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1')}
                  className="w-16 h-16 rounded-full bg-white/95 text-[#5C101D] flex items-center justify-center shadow-warm-lg hover:scale-110 transition-transform mb-4 border-2 border-white"
                  aria-label="Play heritage story video"
                >
                  <Play size={24} className="ml-1 fill-[#5C101D]" />
                </button>
                <div className="absolute bottom-5 left-5 right-5 text-left">
                  <h4 className="font-serif font-bold text-lg text-white">Watch Our Story</h4>
                  <p className="text-xs text-[#E8E1D3]">The Art of Gadwal Weaving</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: HERITAGE NARRATIVE & TEMPLE GOPURAM ACCENT */}
          <div className="lg:col-span-6 space-y-5 lg:pl-6 relative">
            <span className="text-[11px] font-serif font-bold tracking-[0.2em] text-[#B8860B] uppercase block">
              A Rich Heritage
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F1E1D] leading-tight">
              More Than a Saree. <br />
              A Living Tradition.
            </h2>
            <p className="text-xs sm:text-sm text-[#484440] leading-relaxed font-sans">
              Gadwal sarees are known for their unique interlock weaving, rich zari, and timeless elegance. Each saree carries the legacy of generations of skilled weavers from Gadwal, Telangana.
            </p>
            <div className="pt-2">
              <Link
                to="/craft-and-heritage"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#5C101D] hover:bg-[#4A0D17] text-white font-medium text-xs tracking-wider rounded-md transition-colors shadow-sm"
              >
                <span>Our Story</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. WHY CHOOSE GADWAL WEAVES? */}
      {/* ========================================================= */}
      <section className="w-full bg-[#F5EFE6] py-14 border-y border-[#E8E1D3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1E1D]">
            Why Choose Gadwal Weaves?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-white border border-[#D5CBB9] flex items-center justify-center text-[#B8860B] shadow-sm">
                <Users size={22} />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#1F1E1D]">Verified Weavers</h4>
              <p className="text-xs text-[#69635C] max-w-xs">Sellers are certified from Gadwal</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-white border border-[#D5CBB9] flex items-center justify-center text-[#B8860B] shadow-sm">
                <Award size={22} />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#1F1E1D]">Authenticity Guarantee</h4>
              <p className="text-xs text-[#69635C] max-w-xs">Handloom & Silk Mark sarees</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-white border border-[#D5CBB9] flex items-center justify-center text-[#B8860B] shadow-sm">
                <ShoppingBag size={22} />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#1F1E1D]">Wide Collection</h4>
              <p className="text-xs text-[#69635C] max-w-xs">From traditional to modern</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-white border border-[#D5CBB9] flex items-center justify-center text-[#B8860B] shadow-sm">
                <ShieldCheck size={22} />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#1F1E1D]">Secure & Easy Shopping</h4>
              <p className="text-xs text-[#69635C] max-w-xs">Multiple payment options</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. MEET THE WEAVERS — THE HANDS BEHIND THE HERITAGE */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-2 border-b border-[#E8E1D3]/80 gap-4">
          <div>
            <span className="text-[11px] font-serif font-bold tracking-[0.2em] text-[#B8860B] uppercase block mb-1">
              Meet The Weavers
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1E1D]">
              The Hands Behind the Heritage
            </h2>
            <p className="text-xs text-[#69635C] mt-1">
              Real people. Real stories. Real craftsmanship.
            </p>
          </div>

          <Link
            to="/weavers"
            className="px-4 py-1.5 border border-[#5C101D] text-[#5C101D] hover:bg-[#5C101D] hover:text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Weavers</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        {/* 4 WEAVER CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {weavers.slice(0, 4).map((weaver) => (
            <div
              key={weaver.id}
              className="bg-white rounded-2xl overflow-hidden border border-[#E8E1D3] shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col"
            >
              {/* WEAVER IMAGE */}
              <div className="relative aspect-[4/3] bg-[#FAF6F0] overflow-hidden">
                <img
                  src={weaver.logo_url || weaver.cover_url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80'}
                  alt={weaver.business_name}
                  className="w-full h-full object-cover"
                />
                <button
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 text-[#484440] hover:text-[#5C101D] flex items-center justify-center shadow-sm"
                  aria-label="Save weaver"
                >
                  <Heart size={14} />
                </button>
              </div>

              {/* WEAVER DETAILS */}
              <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="font-serif font-bold text-sm text-[#1F1E1D] truncate">
                    {weaver.business_name}
                  </h3>
                  <div className="flex items-center space-x-1.5 text-xs text-[#69635C]">
                    <MapPin size={12} className="text-[#B8860B] flex-shrink-0" />
                    <span>{weaver.location || 'Gadwal, Telangana'}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-[#69635C]">
                    <Clock size={12} className="text-[#B8860B] flex-shrink-0" />
                    <span>{weaver.experience_years || 20}+ years of weaving</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#FAF6F0]">
                  <Link
                    to={`/weavers/${weaver.slug}`}
                    className="text-xs font-semibold text-[#5C101D] hover:text-[#32070E] flex items-center gap-1 group"
                  >
                    <span>View Story</span>
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. PROMOTIONAL BANNERS: BRIDAL & FESTIVE & NEW ARRIVALS */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* BRIDAL COLLECTION BANNER (Left ~58%) */}
          <div className="lg:col-span-7 relative rounded-2xl overflow-hidden shadow-warm-md group min-h-[300px]">
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&auto=format&fit=crop&q=80"
              alt="Bridal Handloom Saree with Zari Pallu"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1F1E1D]/90 via-[#1F1E1D]/60 to-transparent flex flex-col justify-center p-8 sm:p-10 text-white space-y-3">
              <button
                onClick={() => openVideo('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1')}
                className="w-12 h-12 rounded-full bg-white/90 text-[#5C101D] flex items-center justify-center hover:scale-110 transition-transform mb-2"
                aria-label="Play bridal collection preview"
              >
                <Play size={18} className="ml-0.5 fill-[#5C101D]" />
              </button>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold">Bridal Collection</h3>
              <p className="text-xs text-[#E8E1D3] max-w-sm leading-relaxed">
                Exquisite bridal sarees for your special moments.
              </p>
              <div>
                <Link
                  to="/shop?category=bridal-collection"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-transparent hover:bg-white hover:text-[#1F1E1D] text-white border border-white text-xs font-semibold rounded-md transition-colors"
                >
                  <span>Explore Collection</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>

          {/* 2 STACKED CARDS: NEW ARRIVALS & FESTIVE COLLECTION */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* NEW ARRIVALS */}
            <div className="relative rounded-2xl overflow-hidden shadow-warm-sm group h-full min-h-[140px]">
              <img
                src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80"
                alt="New Arrivals Green Saree"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1F1E1D]/85 to-transparent flex flex-col justify-center p-6 text-white space-y-1">
                <h4 className="font-serif text-xl font-bold">New Arrivals</h4>
                <p className="text-xs text-[#E8E1D3] mb-2">Fresh weaves, new stories.</p>
                <div>
                  <Link
                    to="/shop?category=new-arrivals"
                    className="text-xs font-semibold text-[#DFCA95] hover:text-white flex items-center gap-1 group"
                  >
                    <span>Shop Now</span>
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* FESTIVE COLLECTION */}
            <div className="relative rounded-2xl overflow-hidden shadow-warm-sm group h-full min-h-[140px]">
              <img
                src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80"
                alt="Festive Pink Saree"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1F1E1D]/85 to-transparent flex flex-col justify-center p-6 text-white space-y-1">
                <h4 className="font-serif text-xl font-bold">Festive Collection</h4>
                <p className="text-xs text-[#E8E1D3] mb-2">Find the best sarees for every celebration!</p>
                <div>
                  <Link
                    to="/shop?category=silk-cotton-sarees"
                    className="text-xs font-semibold text-[#DFCA95] hover:text-white flex items-center gap-1 group"
                  >
                    <span>Shop Now</span>
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. WHAT OUR CUSTOMERS SAY (Testimonials) */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-2 border-b border-[#E8E1D3]/80 gap-4 text-center sm:text-left">
          <div className="mx-auto sm:mx-0">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1E1D]">
              What Our Customers Say
            </h2>
            <p className="text-xs text-[#69635C] mt-1">
              Loved by saree enthusiasts across India.
            </p>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5">
            <button 
              className="w-8 h-8 rounded-full bg-white border border-[#D5CBB9] flex items-center justify-center hover:bg-[#FAF6F0] text-[#1F1E1D]"
              aria-label="Previous testimonials"
            >
              <ChevronLeft size={14} />
            </button>
            <button 
              className="w-8 h-8 rounded-full bg-white border border-[#D5CBB9] flex items-center justify-center hover:bg-[#FAF6F0] text-[#1F1E1D]"
              aria-label="Next testimonials"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* 3 TESTIMONIAL CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((test) => (
            <div
              key={test.id}
              className="bg-white p-6 rounded-2xl border border-[#E8E1D3] shadow-warm-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center text-amber-500 mb-3">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-[#484440] leading-relaxed italic">
                  "{test.comment}"
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-3 border-t border-[#FAF6F0]">
                <div className="w-9 h-9 rounded-full bg-[#FAF6F0] text-[#5C101D] font-serif font-bold flex items-center justify-center text-xs border border-[#E8E1D3]">
                  {test.customer_name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1F1E1D]">{test.customer_name}</h4>
                  <p className="text-[10px] text-[#69635C]">
                    {test.customer_name.includes('Priya') ? 'Hyderabad' : test.customer_name.includes('Abhijit') ? 'Bengaluru' : 'Chennai'}
                  </p>
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
        <div className="bg-[#4A0D17] rounded-2xl p-8 sm:p-12 text-white relative overflow-hidden shadow-warm-lg">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            <div className="md:col-span-7 space-y-2 text-left">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F7F0DF]">
                Join Our Handloom Community
              </h2>
              <p className="text-xs text-[#E8E1D3] leading-relaxed max-w-lg">
                Get updates on new collections, exclusive offers and stories from our weavers.
              </p>
            </div>

            <div className="md:col-span-5">
              {newsletterSubscribed ? (
                <div className="p-3 bg-white/10 rounded-md border border-white/20 text-[#F7F0DF] text-xs font-medium text-center">
                  ✓ Thank you for subscribing to our handloom community!
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-md bg-white text-[#1F1E1D] text-xs placeholder-[#8A837A] outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#5C101D] hover:bg-[#3D0B13] text-[#F7F0DF] border border-[#DFCA95]/40 font-semibold text-xs rounded-md transition-colors whitespace-nowrap"
                  >
                    Subscribe →
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* VIDEO MODAL */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1F1E1D]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-black rounded-2xl overflow-hidden max-w-3xl w-full border border-white/20">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-3 right-3 text-white bg-black/60 p-1.5 rounded-full hover:bg-black z-10"
              aria-label="Close video"
            >
              <X size={18} />
            </button>
            <div className="aspect-video bg-black flex items-center justify-center">
              <iframe
                className="w-full h-full"
                src={activeVideoUrl}
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
