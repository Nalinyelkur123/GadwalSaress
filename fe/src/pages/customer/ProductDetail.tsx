import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Heart, 
  Truck, 
  ShieldCheck, 
  Award, 
  RotateCcw, 
  Check, 
  Store, 
  Sparkles, 
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Product, SellerProfile, Review } from '../../types';
import { SareeCard } from '../../components/common/SareeCard';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, setIsAuthModalOpen } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Delivery pincode check
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<any>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data.product);
        setSeller(res.data.seller);
        setReviews(res.data.reviews || []);
        setRelatedProducts(res.data.relatedProducts || []);
        setSelectedImage(res.data.product.images[0] || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) return;
    setCheckingPincode(true);
    try {
      const res = await api.get(`/shipping/check-pincode?pincode=${pincode}`);
      setPincodeResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingPincode(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product.id, quantity);
      navigate('/checkout');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!product || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await api.post(`/products/${product.id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
        title: reviewTitle,
      });
      setReviews([res.data.review, ...reviews]);
      setReviewSuccess('Thank you! Your verified review has been submitted.');
      setReviewComment('');
      setReviewTitle('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-serif text-charcoal-600">Loading authentic Gadwal saree details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* BREADCRUMB */}
      <nav className="flex items-center space-x-2 text-xs text-charcoal-500">
        <Link to="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight size={12} />
        <Link to="/shop" className="hover:text-brand-700">Sarees</Link>
        <ChevronRight size={12} />
        <Link to={`/shop?category=${product.category_slug}`} className="hover:text-brand-700">
          {product.category_name}
        </Link>
        <ChevronRight size={12} />
        <span className="text-charcoal-900 font-semibold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* PRODUCT MAIN CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* GALLERY LEFT (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-ivory-200 border border-ivory-300 shadow-warm-md">
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* THUMBNAILS */}
          {product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === img ? 'border-brand-700 shadow-sm' : 'border-ivory-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DETAILS RIGHT (7 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* SELLER / WEAVER BADGE */}
          {seller && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-50 border border-gold-200 rounded-full text-xs">
              <Store size={13} className="text-gold-600" />
              <span className="text-charcoal-700">Woven by</span>
              <Link to={`/weavers/${seller.slug}`} className="font-bold text-brand-900 hover:underline">
                {seller.business_name}
              </Link>
              <span className="text-gold-600 font-bold">✓ Verified</span>
            </div>
          )}

          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 mb-2">
              {product.title}
            </h1>
            <p className="text-xs text-charcoal-500 font-mono">SKU: {product.sku}</p>
          </div>

          {/* RATING */}
          <div className="flex items-center space-x-2">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={15}
                  className={i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-amber-200"}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-charcoal-900">{product.rating}</span>
            <span className="text-xs text-charcoal-500">({product.review_count || reviews.length} verified reviews)</span>
          </div>

          {/* PRICE ROW */}
          <div className="flex items-baseline space-x-3 p-4 bg-ivory-100 rounded-xl border border-ivory-300">
            <span className="font-serif font-bold text-3xl text-brand-900">
              ₹{product.base_price.toLocaleString('en-IN')}
            </span>
            {product.original_price > product.base_price && (
              <>
                <span className="text-base text-charcoal-400 line-through">
                  ₹{product.original_price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                  {product.discount_percent}% OFF
                </span>
              </>
            )}
            <span className="text-[11px] text-charcoal-500 block sm:inline ml-auto">
              (Includes Handloom GST & Insured Delivery)
            </span>
          </div>

          {/* STOCK STATUS */}
          <div className="flex items-center space-x-2 text-xs">
            {product.stock_quantity > 0 ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Check size={14} /> In Stock ({product.stock_quantity} available direct from weaver)
              </span>
            ) : (
              <span className="text-red-600 font-semibold">Sold Out</span>
            )}
          </div>

          {/* ACTIONS: QUANTITY, ADD TO CART, BUY NOW */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-ivory-400 rounded bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-sm text-charcoal-700 hover:bg-ivory-200"
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-bold text-charcoal-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="px-3 py-2 text-sm text-charcoal-700 hover:bg-ivory-200"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
                className="flex-1 py-3 px-6 bg-brand-700 hover:bg-brand-800 disabled:bg-charcoal-300 text-white font-medium text-xs tracking-wider rounded transition-colors shadow-sm"
              >
                Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock_quantity <= 0}
                className="flex-1 py-3 px-6 bg-brand-900 hover:bg-brand-950 text-gold-300 font-medium text-xs tracking-wider rounded border border-gold-400/40 transition-colors shadow-sm"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* PINCODE DELIVERY CHECK (Shiprocket service adapter) */}
          <div className="p-4 bg-white rounded-xl border border-ivory-300 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-charcoal-900">
              <Truck size={16} className="text-gold-600" />
              <span>Check Delivery & Courier Serviceability</span>
            </div>
            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="px-3 py-2 text-xs rounded border border-ivory-400 flex-1 focus:outline-none"
              />
              <button
                type="submit"
                disabled={checkingPincode}
                className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-900 text-white text-xs font-semibold rounded"
              >
                {checkingPincode ? 'Checking...' : 'Check'}
              </button>
            </form>

            {pincodeResult && (
              <div className="text-xs mt-2 pt-2 border-t border-ivory-200">
                {pincodeResult.is_serviceable ? (
                  <p className="text-emerald-700 font-medium">
                    ✓ Delivery available to {pincodeResult.pincode} via <b>{pincodeResult.courier_name}</b> within {pincodeResult.estimated_delivery_days} business days. Insured Shipping: FREE.
                  </p>
                ) : (
                  <p className="text-red-600">
                    ✕ Sorry, courier service is currently unavailable for this postal code.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* SPECIFICATIONS TABLE */}
          <div className="space-y-3 pt-4 border-t border-ivory-300">
            <h3 className="font-serif font-bold text-base text-charcoal-900">
              Saree Specifications & Craftsmanship
            </h3>

            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <div className="text-charcoal-500">Fabric</div>
              <div className="font-semibold text-charcoal-900">{product.fabric}</div>

              <div className="text-charcoal-500">Zari Type</div>
              <div className="font-semibold text-charcoal-900">{product.zari_type}</div>

              <div className="text-charcoal-500">Border Style</div>
              <div className="font-semibold text-charcoal-900">{product.border_style}</div>

              <div className="text-charcoal-500">Weaving Technique</div>
              <div className="font-semibold text-charcoal-900">{product.weaving_technique}</div>

              <div className="text-charcoal-500">Saree Length</div>
              <div className="font-semibold text-charcoal-900">{product.saree_length_meters} Meters (with 0.8m Blouse)</div>

              <div className="text-charcoal-500">Care Instructions</div>
              <div className="font-semibold text-charcoal-900">{product.care_instructions}</div>
            </div>
          </div>

          {/* AUTHENTICITY CERTIFICATE GUARANTEE */}
          <div className="p-4 bg-gold-50/50 rounded-xl border border-gold-200/60 flex items-start space-x-3">
            <Award size={20} className="text-gold-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-charcoal-900 mb-0.5">Government GI & Silk Mark Certified</h4>
              <p className="text-charcoal-600 leading-relaxed">
                Handcrafted under the Geographical Indication (GI) registry for Gadwal handlooms. Shipped with authentic weaver security hologram tag.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* REVIEWS SECTION */}
      <section className="pt-10 border-t border-ivory-300">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-charcoal-900">
                Customer Reviews ({reviews.length})
              </h2>
              <p className="text-xs text-charcoal-500 mt-0.5">Verified purchasers of this Gadwal weave.</p>
            </div>
            
            <button
              onClick={() => {
                if (!user) setIsAuthModalOpen(true);
                else document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 border border-brand-700 text-brand-700 hover:bg-brand-50 rounded text-xs font-semibold flex items-center gap-1.5 self-start"
            >
              <MessageSquare size={14} />
              <span>Write a Review</span>
            </button>
          </div>

          {/* REVIEWS LIST */}
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 bg-white rounded-xl border border-ivory-300 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-charcoal-900">{rev.customer_name}</span>
                    {rev.verified_purchase && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                        ✓ Verified Buyer
                      </span>
                    )}
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                {rev.title && <h4 className="font-serif font-bold text-xs text-charcoal-800">{rev.title}</h4>}
                <p className="text-xs text-charcoal-600 leading-relaxed">{rev.comment}</p>
                <p className="text-[10px] text-charcoal-400">{new Date(rev.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>

          {/* WRITE REVIEW FORM */}
          <div id="review-form" className="p-6 bg-ivory-100 rounded-xl border border-ivory-300 space-y-4">
            <h3 className="font-serif font-bold text-base text-charcoal-900">
              Share Your Experience With This Saree
            </h3>

            {reviewSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded font-medium">
                {reviewSuccess}
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="text-amber-500"
                      >
                        <Star size={20} className={star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-amber-200"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">Review Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Stunning kuttu border, received endless compliments!"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-ivory-400 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">Your Detailed Review</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe the fabric quality, weave accuracy, feel, and your experience..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-ivory-400 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-ivory-300">
          <div className="mb-6">
            <h2 className="font-serif text-2xl font-bold text-charcoal-900">
              More Handpicked {product.category_name}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <SareeCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
