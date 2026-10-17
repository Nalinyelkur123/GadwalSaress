import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Store, MapPin, Award, ChevronRight, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { SellerProfile, Product } from '../../types';
import { SareeCard } from '../../components/common/SareeCard';

export const WeaversList: React.FC = () => {
  const [weavers, setWeavers] = useState<SellerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeavers = async () => {
      try {
        const res = await api.get('/storefront/weavers');
        setWeavers(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeavers();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-[0.2em] text-gold-600 uppercase">
          Artisans of Telangana
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
          Our Master Weavers & Cooperatives
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
          Every saree on Gadwal Weaves is woven on traditional wooden pit looms by families with generations of weaving expertise. We provide direct marketplace access with fair compensation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {weavers.map((weaver) => (
          <div key={weaver.id} className="bg-white rounded-xl overflow-hidden border border-ivory-300 shadow-warm-sm flex flex-col justify-between">
            <div>
              <div className="aspect-[4/3] bg-ivory-200 overflow-hidden">
                <img src={weaver.cover_url || weaver.logo_url} alt={weaver.business_name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-center gap-1.5 text-gold-600 text-xs font-semibold">
                  <ShieldCheck size={14} />
                  <span>Verified Weaver</span>
                </div>
                <h3 className="font-serif font-bold text-base text-charcoal-900">{weaver.business_name}</h3>
                <p className="text-xs text-charcoal-500">📍 {weaver.location}</p>
                <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed">{weaver.description}</p>
              </div>
            </div>
            <div className="p-5 pt-0">
              <Link
                to={`/weavers/${weaver.slug}`}
                className="w-full py-2 bg-brand-50 hover:bg-brand-100 text-brand-800 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <span>Explore Looms & Sarees</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const WeaverDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [weaver, setWeaver] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeaver = async () => {
      try {
        const res = await api.get(`/storefront/weavers/${slug}`);
        setWeaver(res.data.weaver);
        setProducts(res.data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeaver();
  }, [slug]);

  if (!weaver) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* BANNER */}
      <div className="relative rounded-2xl overflow-hidden aspect-[16/6] bg-brand-900 text-white shadow-warm-lg">
        <img
          src={weaver.cover_url || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1400&auto=format&fit=crop&q=80'}
          alt={weaver.business_name}
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-end">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/20 text-gold-300 rounded-full text-xs font-semibold w-max mb-2">
            <span>Verified Pit Loom Weaver • {weaver.location}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">{weaver.business_name}</h1>
          <p className="text-xs sm:text-sm text-ivory-200 mt-2 max-w-xl">{weaver.story}</p>
        </div>
      </div>

      {/* WEAVER'S SAREES */}
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-charcoal-900">
            Handcrafted by {weaver.business_name} ({products.length})
          </h2>
          <p className="text-xs text-charcoal-500 mt-1">Directly dispatched from this artisan workshop.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <SareeCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
};
