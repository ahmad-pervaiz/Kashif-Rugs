import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../services/carpetService';
import { money } from '../utils/money';
export default function ProductCard({ rug }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  return <article className="product-card"><Link className="product-image" to={`/carpets/${rug._id}`}><img src={getImageUrl(rug.imageUrl)} alt={rug.title} loading="lazy" /></Link>
    <div className="product-meta"><h2><Link to={`/carpets/${rug._id}`}>{rug.title}</Link></h2><span className="product-price">{money(rug.price)}</span></div>
    <p className="product-country">{rug.category || 'Handmade rug'}{rug.country ? ` / ${rug.country}` : ''}</p>
    <button className="quick-add" onClick={() => { addToCart(rug); setAdded(true); }} aria-label={`Add ${rug.title} to bag`}>{added ? 'Add another +' : 'Add to bag +'}</button><span className="sr-only" role="status">{added ? `${rug.title} added to your bag` : ''}</span>
  </article>;
}
