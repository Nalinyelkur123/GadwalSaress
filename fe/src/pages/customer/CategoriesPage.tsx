import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { Category, Collection } from '../../types';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catsRes, colRes] = await Promise.all([
          api.get('/storefront/categories'),
          api.get('/storefront/collections'),
        ]);
        setCategories(catsRes.data || []);
        setCollections(colRes.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold tracking-[0.2em] text-gold-600 uppercase">
          Artisanal Taxonomy
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
          Explore Gadwal Saree Categories
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 max-w-xl mx-auto">
          From opulent Pure Silk bridal weaves to breathable Silk-Cotton (Sico) classics, discover centuries of royal Telangana handlooms.
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-charcoal-500">Loading catalog categories...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden shadow-warm-md hover:shadow-warm-xl transition-all duration-300 bg-white border border-ivory-300 flex flex-col"
            >
              <div className="aspect-[4/3] overflow-hidden bg-ivory-200">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800'}
                  alt={cat.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-serif font-bold text-xl text-charcoal-900 group-hover:text-brand-900 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-charcoal-600 mt-1 leading-relaxed line-clamp-2">
                    {cat.description || 'Authentic pit-loom Gadwal handloom collection.'}
                  </p>
                </div>
                <div className="pt-2 flex items-center text-xs font-bold text-brand-700 group-hover:text-brand-900 gap-1.5">
                  <span>Explore Collection</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* CURATED COLLECTIONS STRIP */}
      {collections.length > 0 && (
        <div className="pt-8 border-t border-ivory-300 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold-600">Curated Editions</span>
              <h2 className="font-serif text-2xl font-bold text-charcoal-900">Featured Collections</h2>
            </div>
            <Link to="/shop" className="text-xs font-bold text-brand-700 hover:underline">
              View All Sarees →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((col) => (
              <Link
                key={col.id}
                to={`/shop?collection=${col.slug}`}
                className="group relative rounded-xl overflow-hidden border border-ivory-300 p-6 bg-gradient-to-br from-ivory-100 to-white hover:border-brand-700 transition-colors"
              >
                <div className="space-y-2">
                  <span className="px-2 py-0.5 bg-gold-100 text-gold-900 rounded text-[10px] font-bold uppercase tracking-wider">
                    {col.tag || 'Special Weave'}
                  </span>
                  <h4 className="font-serif font-bold text-lg text-charcoal-900 group-hover:text-brand-900">
                    {col.title}
                  </h4>
                  <p className="text-xs text-charcoal-600">{col.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
