import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface SareeCardProps {
  product: Product;
}

export const SareeCard: React.FC<SareeCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.id);
  };

  return (
    <div className="group bg-white rounded-lg overflow-hidden border border-ivory-300 hover:shadow-warm-md transition-all duration-300 flex flex-col">
      {/* IMAGE CONTAINER */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-ivory-200">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'}
          alt={product.title}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* WISHLIST BUTTON */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm backdrop-blur-sm transition-all ${
            isWishlisted ? 'text-red-600 scale-110' : 'text-charcoal-700 hover:text-brand-700'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} className={isWishlisted ? 'fill-red-600' : ''} />
        </button>

        {/* OUT OF STOCK OVERLAY */}
        {product.stock_quantity <= 0 && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-charcoal-900 text-white text-xs font-bold px-3 py-1 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* CARD CONTENT */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          {/* TITLE */}
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-serif font-bold text-sm text-charcoal-900 group-hover:text-brand-800 transition-colors line-clamp-1 mb-1.5">
              {product.title}
            </h3>
          </Link>

          {/* RATINGS */}
          <div className="flex items-center space-x-1.5 mb-2.5">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-amber-200"}
                />
              ))}
            </div>
            <span className="text-[11px] text-charcoal-500 font-medium">
              ({product.review_count || 12})
            </span>
          </div>

          {/* PRICE ROW WITH INLINE DISCOUNT */}
          <div className="flex items-center space-x-2 mb-4 flex-wrap gap-y-1">
            <span className="font-serif font-bold text-base text-brand-900">
              ₹ {product.base_price.toLocaleString('en-IN')}
            </span>
            {product.original_price > product.base_price && (
              <>
                <span className="text-xs text-charcoal-400 line-through">
                  ₹ {product.original_price.toLocaleString('en-IN')}
                </span>
                {product.discount_percent > 0 && (
                  <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                    {product.discount_percent}% OFF
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* ADD TO CART ACTION */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock_quantity <= 0}
          className="w-full py-2 px-3 bg-brand-700 hover:bg-brand-800 disabled:bg-charcoal-300 text-white rounded font-medium text-xs tracking-wide transition-colors shadow-sm"
        >
          {product.stock_quantity > 0 ? 'Add to Cart' : 'Sold Out'}
        </button>
      </div>
    </div>
  );
};
