import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { ArrowRight, Watch, Award, ShieldCheck, Heart, Gift } from 'lucide-react';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [featuredRes, trendingRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products/trending'),
        ]);
        setFeatured(featuredRes.data);
        setTrending(trendingRes.data);
      } catch (error) {
        console.error('Error fetching homepage data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const categories = [
    { name: 'Analog', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=400' },
    { name: 'Luxury', image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=400' },
    { name: 'Sports', image: 'https://images.unsplash.com/photo-1539874754764-5a96559165b0?auto=format&fit=crop&q=80&w=400' },
    { name: 'Casual', image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=400' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-primary-950 via-primary-900 to-neutral-950 text-white min-h-[580px] lg:h-[650px] flex items-center overflow-hidden py-12">
        <div className="absolute inset-0 z-0 bg-primary-990">
          <img
            src="/lucknow_watch_hero_bg_v2.png"
            alt="Hero Watch Lucknow"
            className="w-full h-full object-cover object-right md:object-center opacity-45 md:opacity-75"
          />
          {/* Subtle gradient overlay to fade to dark on the left where text resides */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary-950/85 via-primary-950/40 to-primary-950/90 md:bg-gradient-to-r md:from-primary-950 md:via-primary-950/70 md:to-transparent"></div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-10 flex flex-col justify-center h-full">
          <div className="max-w-2xl space-y-6 animate-fadeIn">
            
            {/* Top Brand Logo Header */}
            <div className="flex items-center space-x-3 mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              <img 
                src="/logo.jpg" 
                alt="Gift Watch Logo" 
                className="h-12 w-12 rounded-full border-2 border-gold-500 object-cover shadow-md" 
              />
              <div>
                <span className="block text-xs font-bold tracking-[0.25em] text-amber-100 font-sans leading-none">GIFT WATCH</span>
                <span className="block text-[8px] font-bold tracking-[0.38em] text-gold-500 font-sans leading-none mt-1">LUCKNOW</span>
              </div>
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.35em] text-amber-100 block drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                TIME. ELEGANCE. LEGACY.
              </span>
              <h1 className="text-4xl font-extrabold tracking-wide sm:text-5xl uppercase font-sans leading-tight drop-shadow-[0_3px_8px_rgba(0,0,0,0.95)]">
                CRAFTED TO <br/>
                <span className="text-amber-100 font-black">LEAVE AN IMPRESSION</span>
              </h1>
            </div>

            {/* Horizontal ornament divider line */}
            <div className="flex items-center space-x-3 py-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-gold-500/50"></div>
              <div className="text-gold-500 text-[10px] tracking-widest">❖</div>
              <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-gold-500/50"></div>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-white/95 max-w-lg leading-relaxed drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)] font-medium">
              Curated timepieces for those who value precision, style, and timeless sophistication.
            </p>

            {/* Action button */}
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center rounded border border-gold-500/80 px-6 py-3 text-xs font-bold uppercase tracking-wider text-amber-100 hover:bg-gold-500 hover:text-primary-950 hover:border-gold-500 transition-all duration-300 group shadow-md"
              >
                Explore Collection
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform text-amber-100 group-hover:text-primary-950" />
              </Link>
            </div>

            {/* Bottom Highlights row */}
            <div className="mt-12 pt-6 border-t border-gold-500/10 flex flex-wrap gap-x-8 gap-y-4 text-xs font-medium tracking-wider text-amber-100/90">
              <div className="flex items-center space-x-2">
                <Watch className="h-4.5 w-4.5 text-gold-500" />
                <span className="uppercase text-[9px] tracking-widest font-bold">Premium Quality</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4.5 w-4.5 text-gold-500" />
                <span className="uppercase text-[9px] tracking-widest font-bold">Authentic Timepieces</span>
              </div>
              <div className="flex items-center space-x-2">
                <Gift className="h-4.5 w-4.5 text-gold-500" />
                <span className="uppercase text-[9px] tracking-widest font-bold">Perfect For Every Occasion</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-primary-900">Shop Categories</h2>
          <p className="text-sm text-neutral-500">Explore watches designed for every occasion</p>
        </div>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/shop?category=${cat.name}`}
              className="group relative h-40 overflow-hidden bg-neutral-100 border border-primary-100 flex flex-col justify-end p-4 hover:shadow-md hover:border-gold-500/30 transition-all rounded shadow-sm"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-primary-950/40 to-transparent"></div>
              <span className="relative text-sm font-bold uppercase tracking-wider text-white z-10">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Watches */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-primary-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-primary-900">Featured Products</h2>
            <p className="text-xs text-neutral-500">Our signature timepieces selected for you</p>
          </div>
          <Link
            to="/shop"
            className="flex items-center text-xs font-bold uppercase tracking-wider text-primary-800 hover:text-gold-500 transition-colors"
          >
            View All <ArrowRight className="ml-1 h-3.5 w-3.5 text-gold-500" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4)
              .fill(null)
              .map((_, i) => <ProductSkeleton key={i} />)
          ) : featured.length > 0 ? (
            featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-sm text-neutral-500 bg-neutral-50 border border-dashed border-neutral-200">
              No featured products found. Check back later!
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-primary-900 py-12 border-y border-gold-500/20 text-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-primary-850 border border-gold-500/35 rounded-full text-gold-400 shadow-sm flex-shrink-0">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400">100% Premium Watches</h3>
                <p className="mt-1 text-xs text-neutral-350 leading-relaxed">We source directly from official brand distributors.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-primary-850 border border-gold-500/35 rounded-full text-gold-400 shadow-sm flex-shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400">Secure Direct Ordering</h3>
                <p className="mt-1 text-xs text-neutral-350 leading-relaxed">Order directly via WhatsApp. Fast confirmation & support.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-primary-850 border border-gold-500/35 rounded-full text-gold-400 shadow-sm flex-shrink-0">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400">Customer Satisfaction</h3>
                <p className="mt-1 text-xs text-neutral-350 leading-relaxed">Dedicated post-purchase support and quick exchange policies.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-primary-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-primary-900">Trending Now</h2>
            <p className="text-xs text-neutral-500">The most popular picks in this season</p>
          </div>
          <Link
            to="/shop"
            className="flex items-center text-xs font-bold uppercase tracking-wider text-primary-800 hover:text-gold-500 transition-colors"
          >
            View All <ArrowRight className="ml-1 h-3.5 w-3.5 text-gold-500" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4)
              .fill(null)
              .map((_, i) => <ProductSkeleton key={i} />)
          ) : trending.length > 0 ? (
            trending.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-sm text-neutral-500 bg-neutral-50 border border-dashed border-neutral-200">
              No trending products found. Check back later!
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
