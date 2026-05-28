import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const outOfStock = product.stock === 0;

  // Calculate discount percentage
  const discount =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden border border-neutral-100 bg-white hover:shadow-md transition-all duration-300">
      
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-neutral-50">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={product.name}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {outOfStock ? (
            <span className="bg-neutral-950 text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-1 rounded shadow-sm">
              Out of stock
            </span>
          ) : (
            <>
              {product.isTrending && (
                <span className="bg-gold-500 text-[10px] font-extrabold uppercase tracking-widest text-primary-950 px-2.5 py-1 w-max rounded shadow-sm border border-gold-600/20">
                  Trending
                </span>
              )}
              {discount > 0 && (
                <span className="bg-red-600 text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-1 w-max rounded shadow-sm">
                  -{discount}%
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gold-650">
          {product.brand}
        </span>
        <h3 className="mt-1 text-sm font-semibold text-neutral-900 line-clamp-1 hover:text-primary-850">
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </h3>
        
        {/* Category */}
        <span className="mt-1 text-xs text-neutral-500 font-medium">{product.category}</span>

        {/* Price & Cart button */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-sm font-extrabold text-primary-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-neutral-455 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={() => !outOfStock && addToCart(product, 1)}
            disabled={outOfStock}
            className={`p-2 rounded-full border transition-all duration-300 shadow-sm ${
              outOfStock
                ? 'border-neutral-200 text-neutral-300 cursor-not-allowed'
                : 'border-primary-100 text-primary-800 hover:bg-primary-800 hover:text-white hover:border-primary-800'
            }`}
            title={outOfStock ? 'Out of Stock' : 'Add to Cart'}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
