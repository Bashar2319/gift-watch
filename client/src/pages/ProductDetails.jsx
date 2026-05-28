import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { ShoppingBag, ChevronLeft, ShieldCheck, RefreshCw, Truck } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);

  // States
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Fetch product data
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        setActiveImage(data.images?.[0] || '');
        setQuantity(1);

        // Fetch related products (same category, exclude current)
        const relatedRes = await api.get(`/products?category=${data.category}&limit=5`);
        const filteredRelated = relatedRes.data.products.filter((p) => p._id !== id).slice(0, 4);
        setRelated(filteredRelated);
      } catch (error) {
        console.error('Error loading product details:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="h-4 w-24 bg-neutral-200"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-neutral-200"></div>
          <div className="space-y-4">
            <div className="h-3 w-1/4 bg-neutral-200"></div>
            <div className="h-8 w-3/4 bg-neutral-200"></div>
            <div className="h-6 w-1/3 bg-neutral-200"></div>
            <div className="h-20 w-full bg-neutral-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <p className="mt-2 text-sm text-neutral-500">The watch you're looking for does not exist or has been removed.</p>
        <Link to="/shop" className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-black underline">
          Back to Shop
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;
  const discount = product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-16">
      
      {/* Back button */}
      <div>
        <Link to="/shop" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to collection
        </Link>
      </div>

      {/* Main product view */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
        
        {/* Images Column */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden bg-neutral-50 border border-neutral-100 rounded">
            <img
              src={activeImage || 'https://via.placeholder.com/600x600?text=No+Image'}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          </div>
          
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden border bg-neutral-50 ${
                    activeImage === img ? 'border-black' : 'border-neutral-200'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover object-center" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="flex flex-col space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              {product.brand}
            </span>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-900 uppercase">
              {product.name}
            </h1>
            <p className="mt-2 text-xs text-neutral-500 font-medium">Category: <span className="text-neutral-800">{product.category}</span></p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline space-x-3 border-y border-neutral-100 py-4">
            <span className="text-2xl font-bold text-primary-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-neutral-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="bg-red-50 text-red-750 text-xs font-bold uppercase tracking-wider px-2 py-0.5 border border-red-200 rounded">
                  Save {discount}%
                </span>
              </>
            )}
          </div>

          {/* Stock Info */}
          <div>
            {outOfStock ? (
              <span className="inline-block bg-neutral-950 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded shadow-sm">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-block bg-amber-50 text-amber-800 text-xs font-semibold px-3 py-1 border border-amber-200 rounded">
                Only {product.stock} left in stock - order soon!
              </span>
            ) : (
              <span className="inline-block bg-primary-50 text-primary-800 text-xs font-semibold px-3 py-1 border border-primary-200 rounded animate-pulse">
                In Stock (Ready to dispatch)
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-900">Product Details</h3>
            <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          {/* Qty & Add to Cart */}
          {!outOfStock && (
            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center space-x-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">Quantity</span>
                <div className="flex items-center border border-neutral-200 rounded">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 text-neutral-550 hover:text-primary-800 font-semibold"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-semibold text-neutral-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-1 text-neutral-550 hover:text-primary-800 font-semibold"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => addToCart(product, quantity)}
                className="w-full flex items-center justify-center rounded-full bg-primary-800 py-4 text-sm font-bold uppercase tracking-wider text-white border border-gold-500/20 hover:bg-primary-900 transition-colors shadow-md"
              >
                <ShoppingBag className="mr-2 h-5 w-5 text-gold-300" /> Add to Cart
              </button>
            </div>
          )}

          {/* Trust points */}
          <div className="mt-4 grid grid-cols-1 gap-2.5 pt-4 border-t border-neutral-100 text-xs text-neutral-500">
            <div className="flex items-center">
              <Truck className="mr-2.5 h-4.5 w-4.5 text-gold-500" />
              <span>Free Delivery across India</span>
            </div>
            <div className="flex items-center">
              <RefreshCw className="mr-2.5 h-4.5 w-4.5 text-gold-500" />
              <span>Easy 7-day exchanges on manufacturing defects</span>
            </div>
            <div className="flex items-center">
              <ShieldCheck className="mr-2.5 h-4.5 w-4.5 text-gold-500" />
              <span>Direct WhatsApp assistance for ordering questions</span>
            </div>
          </div>

        </div>

      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pt-12 border-t border-neutral-100">
          <div className="space-y-2 mb-6">
            <h2 className="text-xl font-bold uppercase tracking-wider text-primary-900">Related Timepieces</h2>
            <p className="text-xs text-neutral-500">You might also like these watches from {product.category} collection</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {related.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetails;
