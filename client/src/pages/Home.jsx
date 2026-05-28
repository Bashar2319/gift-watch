import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { ArrowRight, Watch, Award, ShieldCheck, Heart } from 'lucide-react';

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
    { name: 'Digital', image: 'https://images.unsplash.com/photo-1613941490217-062e58bf4e75?auto=format&fit=crop&q=80&w=400' },
    { name: 'Smart', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=400' },
    { name: 'Luxury', image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=400' },
    { name: 'Sports', image: 'https://images.unsplash.com/photo-1539874754764-5a96559165b0?auto=format&fit=crop&q=80&w=400' },
    { name: 'Casual', image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=400' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner */}
      <section className="relative bg-neutral-900 text-white h-[500px] flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1490633874781-1c63cc424610?auto=format&fit=crop&q=80&w=1600"
            alt="Hero Watch"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="max-w-md space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              Gift Watch Collection
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl uppercase">
              Time Defined By Elegance
            </h1>
            <p className="text-base text-neutral-300">
              Discover our curated range of minimal, casual, smart, and luxury timepieces. Built for precision. Styled for you.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-neutral-100 transition-all group"
              >
                Explore Shop
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-black">Shop Categories</h2>
          <p className="text-sm text-neutral-500">Explore watches designed for every occasion</p>
        </div>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/shop?category=${cat.name}`}
              className="group relative h-40 overflow-hidden bg-neutral-100 border border-neutral-100 flex flex-col justify-end p-4 hover:shadow-md transition-all"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <span className="relative text-sm font-bold uppercase tracking-wider text-white z-10">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Watches */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-black">Featured Products</h2>
            <p className="text-xs text-neutral-500">Our signature timepieces selected for you</p>
          </div>
          <Link
            to="/shop"
            className="flex items-center text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black transition-colors"
          >
            View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
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
      <section className="bg-neutral-50 py-12 border-y border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white border border-neutral-100 rounded-full text-black">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-black">100% Genuine Watches</h3>
                <p className="mt-1 text-xs text-neutral-500">We source directly from official brand distributors.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white border border-neutral-100 rounded-full text-black">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-black">Secure Direct Ordering</h3>
                <p className="mt-1 text-xs text-neutral-500">Order directly via WhatsApp. Fast confirmation & support.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white border border-neutral-100 rounded-full text-black">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-black">Customer Satisfaction</h3>
                <p className="mt-1 text-xs text-neutral-500">Dedicated post-purchase support and quick exchange policies.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-black">Trending Now</h2>
            <p className="text-xs text-neutral-500">The most popular picks in this season</p>
          </div>
          <Link
            to="/shop"
            className="flex items-center text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black transition-colors"
          >
            View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
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
