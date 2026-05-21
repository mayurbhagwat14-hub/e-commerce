import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';
import { fetchTopProducts, fetchCategories } from '../features/products/productSlice';
import ProductCard from '../components/product/ProductCard';
import { GridSkeleton } from '../components/common/LoadingSkeleton';
import { motion } from 'framer-motion';

export const Home = () => {
  const dispatch = useDispatch();
  const { topProducts, categories, loading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchTopProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden glass-panel py-20 px-6 sm:px-12 md:px-20 text-center md:text-left bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border border-white/5">
        <div className="max-w-2xl space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary-light border border-primary/20 text-xxs font-bold uppercase tracking-wider w-fit"
          >
            <Sparkles className="h-3.5 w-3.5" /> <span>Premium Collection 2026</span>
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-white"
          >
            Elevate Your <br />
            <span className="text-gradient">Quantum Lifestyle</span>
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg"
          >
            Discover state-of-the-art gadgets, premium fashion lines, elegant home decor items, and best-selling literature curated for high-performance minds.
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4"
          >
            <Link
              to="/products"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center space-x-2 group active:scale-95"
            >
              <span>Explore Shop</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
        {/* Absolute decorative gradient glow */}
        <div className="absolute right-0 top-0 -z-10 h-72 w-72 rounded-full bg-primary/25 blur-3xl"></div>
        <div className="absolute right-1/4 bottom-0 -z-10 h-72 w-72 rounded-full bg-secondary/15 blur-3xl"></div>
      </section>

      {/* Trust Badges */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl flex items-start space-x-4 border border-white/5">
          <div className="p-3 bg-primary/10 rounded-xl text-primary"><Truck className="h-6 w-6" /></div>
          <div>
            <h4 className="text-sm font-bold text-white">Free Express Delivery</h4>
            <p className="text-xxs text-slate-400 mt-1">On orders over ₹5,000 across India.</p>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex items-start space-x-4 border border-white/5">
          <div className="p-3 bg-secondary/10 rounded-xl text-secondary"><ShieldCheck className="h-6 w-6" /></div>
          <div>
            <h4 className="text-sm font-bold text-white">100% Secured Payments</h4>
            <p className="text-xxs text-slate-400 mt-1">Backed by Razorpay SSL secure encryption protocols.</p>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex items-start space-x-4 border border-white/5">
          <div className="p-3 bg-accent/10 rounded-xl text-accent"><CreditCard className="h-6 w-6" /></div>
          <div>
            <h4 className="text-sm font-bold text-white">Easy Returns Policy</h4>
            <p className="text-xxs text-slate-400 mt-1">10-day replacement warranty for all catalog products.</p>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center">
            <ShoppingBag className="h-6 w-6 mr-2 text-primary" /> Browse Categories
          </h2>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {categories.map((cat) => (
            <motion.div key={cat._id} variants={itemVariants}>
              <Link
                to={`/products?category=${cat.slug}`}
                className="block glass-card p-6 rounded-2xl border border-white/5 bg-slate-900/30 hover:border-secondary/40 text-center transition-all duration-300 active:scale-95 group"
              >
                <div className="h-10 w-10 mx-auto rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center text-secondary mb-3 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-200 group-hover:text-secondary mb-1">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-slate-400 line-clamp-1">{cat.description}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 flex items-center">
              <Sparkles className="h-6 w-6 mr-2 text-accent" /> Featured Products
            </h2>
            <p className="text-xs text-slate-400">Discover this week's highly rated items.</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-secondary hover:text-secondary-light flex items-center space-x-1 group">
            <span>View Catalog</span> <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <GridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {topProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
