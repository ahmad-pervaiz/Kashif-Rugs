import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCarpets, getImageUrl } from '../services/carpetService';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { RUG_CATEGORIES, RUG_CATEGORY_GROUPS } from '../rugCategories';

export default function Carpets() {
  const [country, setCountry] = useState('All');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [carpets, setCarpets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchCarpets();
  }, []);

  const fetchCarpets = async () => {
    try {
      setLoading(true);
      const data = await getAllCarpets();
      setCarpets(data);
    } catch (err) {
      setError('Failed to load carpets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (e, carpet) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(carpet);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-lg">Loading masterpieces...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-xl text-red-500 bg-red-500/10 px-8 py-4 rounded-xl border border-red-500/20">{error}</div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  };

  const visible = carpets.filter(r => (category === 'All' || (r.category || 'Rugs') === category) && (country === 'All' || r.country === country) && `${r.title} ${r.description}`.toLowerCase().includes(search.toLowerCase()));
  if (sort !== 'newest') visible.sort((a,b) => sort === 'low' ? a.price - b.price : b.price - a.price);
  return (
    <div className="min-h-screen bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4">
            Our Collection
          </h1>
          <div className="h-1 w-24 bg-accent-blue mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-gray-300">
          <label>Search rugs<input className="input" type="search" value={search} onChange={e => setSearch(e.target.value)} /></label>
          <label>Country<select className="input" value={country} onChange={e => { setCountry(e.target.value); setCategory('All'); }}><option value="All">All countries</option>{RUG_CATEGORY_GROUPS.map(g => <option key={g.country}>{g.country}</option>)}</select></label>
          <label>Rug category<select className="input" value={category} onChange={e => setCategory(e.target.value)}>{['All', ...new Set([...RUG_CATEGORIES.filter(c => country === 'All' || c.country === country).map(c => c.name), ...carpets.filter(r => country === 'All' || r.country === country).map(r => r.category || 'Rugs')])].map(c => <option key={c}>{c}</option>)}</select></label>
          <label>Sort by<select className="input" value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label>
        </div>
        <p className="text-gray-400 mb-4" role="status">{visible.length} rugs found</p>
        {visible.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">
              No rugs match your selection.
            </p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {visible.map(carpet => (
              <motion.div variants={item} key={carpet._id}>
                <Link
                  to={`/carpets/${carpet._id}`}
                  className="block bg-dark-surface border border-white/5 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-accent-blue/30 transition-all duration-300 group"
                >
                  <div className="aspect-square overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300 z-10" />
                    <img
                      src={getImageUrl(carpet.imageUrl)}
                      alt={carpet.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
                    />
                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-accent-blue text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">View</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-accent-blue transition-colors duration-200 line-clamp-1">
                        {carpet.title}
                      </h3>
                      <p className="text-lg font-bold text-green-400 whitespace-nowrap ml-2">
                        ${carpet.price.toLocaleString()}
                      </p>
                    </div>

                    <p className="text-gray-400 text-sm mb-2">{carpet.category || 'Rugs'}{carpet.country ? ` · ${carpet.country}` : ''}</p>
                    <p className="text-gray-400 text-sm mb-6 line-clamp-2 h-10">
                      {carpet.description}
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={(e) => handleQuickAdd(e, carpet)}
                        className="flex-1 bg-accent-blue hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-semibold transition-colors duration-200 shadow-lg text-sm"
                      >
                        Add to Cart
                      </button>
                      <button className="flex-1 border border-gray-600 text-gray-300 py-2.5 px-4 rounded-lg font-semibold hover:border-white hover:text-white transition-colors duration-200 text-sm">
                        Details
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
