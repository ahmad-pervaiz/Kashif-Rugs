import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCarpetById, getImageUrl } from '../services/carpetService';
import { useCart } from '../context/CartContext';
import RugReviews from '../components/RugReviews';
import { motion } from 'framer-motion';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [carpet, setCarpet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchCarpet();
  }, [id]);

  const fetchCarpet = async () => {
    try {
      setLoading(true);
      const data = await getCarpetById(id);
      setCarpet(data);
      setSelectedImage(data.imageUrl);
      setError(null);
    } catch (err) {
      setError('Failed to load carpet details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(carpet);
    }
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !carpet) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-500 mb-4">{error || 'Carpet not found'}</div>
          <Link to="/carpets" className="text-accent-blue hover:text-white transition">
            Back to Carpets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/carpets"
          className="text-gray-400 hover:text-white mb-8 inline-flex items-center transition-colors group"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Collection
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-dark-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-12">
            {/* Image */}
            <div className="aspect-square relative overflow-hidden bg-black/50">
              <motion.img
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8 }}
                src={getImageUrl(selectedImage)}
                alt={carpet.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl font-bold text-white mb-4"
                >
                  {carpet.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-accent-blue mb-8"
                >
                  ${carpet.price.toLocaleString()}
                </motion.p>
                <div className="h-0.5 w-full bg-gray-800 mb-8" />
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-300 text-lg mb-10 leading-relaxed"
                >
                  {carpet.description}
                </motion.p>
              </div>

              <p className="text-gray-300">Category: {carpet.category || 'Rugs'}</p>
              {carpet.country && <p className="text-gray-300">Country: {carpet.country}</p>}
              {carpet.material && <p className="text-gray-300">Material: {carpet.material}</p>}
              {carpet.dimensions && <p className="text-gray-300">Dimensions: {carpet.dimensions}</p>}
              <div className="flex flex-wrap gap-2 my-4">{(carpet.images?.length ? carpet.images : [carpet.imageUrl]).map((url, i) => <button key={url} onClick={() => setSelectedImage(url)} aria-label={`View rug photo ${i + 1}`} aria-pressed={selectedImage === url}><img src={getImageUrl(url)} alt={`${carpet.title}, photo ${i + 1}`} className="w-20 h-20 object-cover rounded border border-gray-500" /></button>)}</div>
              {/* Quantity and Add to Cart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-6"
              >
                <div className="flex items-center gap-6 mb-8">
                  <label className="text-gray-400 font-medium uppercase tracking-wider text-sm">Quantity</label>
                  <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-gray-800 text-white transition bg-gray-900 border-r border-gray-700"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center py-2 bg-transparent text-white focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 hover:bg-gray-800 text-white transition bg-gray-900 border-l border-gray-700"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-accent-blue text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-900/50 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Add to Cart
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
        <RugReviews key={id} id={id} />
      </div>
    </div>
  );
}

