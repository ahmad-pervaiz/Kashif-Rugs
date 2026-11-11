import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCarpetById, getImageUrl } from '../services/carpetService';
import { useCart } from '../context/CartContext';
import RugReviews from '../components/RugReviews';
import { money } from '../utils/money';
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [rug, setRug] = useState(null), [selected, setSelected] = useState(''), [quantity, setQuantity] = useState(1), [loading, setLoading] = useState(true), [error, setError] = useState('');
  useEffect(() => {
    let active = true; setLoading(true); setError(''); setQuantity(1);
    getCarpetById(id).then(data => { if (active) { setRug(data); setSelected(data.imageUrl); } }).catch(() => { if (active) setError('This rug could not be loaded. Please return to the collection.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  if (loading || error || !rug) return <div className="container section"><div className="status-panel" role={error ? 'alert' : 'status'}><h1 className="page-title">{loading ? 'A closer look…' : 'Rug unavailable'}</h1><p>{error}</p>{!loading && <Link className="button" to="/carpets">Back to the collection</Link>}</div></div>;
  const images = rug.images?.length ? rug.images : [rug.imageUrl];
  function add() { for (let i = 0; i < quantity; i++) addToCart(rug); navigate('/cart'); }
  return <div className="container"><Link to="/carpets" className="back-link">← The collection</Link>
    <div className="product-detail"><div><img className="detail-main-image" src={getImageUrl(selected)} alt={rug.title} /><div className="thumbnails" aria-label="Rug photographs">{images.map((url, i) => <button key={url} aria-label={`View rug photo ${i + 1}`} aria-pressed={selected === url} onClick={() => setSelected(url)}><img src={getImageUrl(url)} alt={`${rug.title}, view ${i + 1}`} /></button>)}</div></div>
      <div className="product-info"><p className="eyebrow">{rug.category || 'The handmade collection'}{rug.country ? ` / ${rug.country}` : ''}</p><h1>{rug.title}</h1><p className="detail-price">{money(rug.price)} <span className="muted text-xs">USD</span></p><p className="product-description">{rug.description}</p>
        <dl className="specs">{[['Category', rug.category || 'Rugs'], ['Country', rug.country], ['Material', rug.material], ['Dimensions', rug.dimensions]].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <label className="block text-xs mb-3" htmlFor="rug-quantity">Quantity</label><div className="purchase-actions"><div className="quantity"><button onClick={() => setQuantity(q => Math.max(1,q-1))} aria-label="Decrease quantity">−</button><input id="rug-quantity" type="number" min="1" max="100" value={quantity} onChange={e => setQuantity(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))} /><button onClick={() => setQuantity(q => Math.min(100,q+1))} aria-label="Increase quantity">+</button></div><button className="button" onClick={add}>Add to bag <span aria-hidden="true">↗</span></button></div>
        <p className="form-note">A piece worth getting to know. <Link className="underline" to="/contact">Ask us about this rug</Link> for more details, availability, and delivery information.</p>
      </div>
    </div><RugReviews key={id} id={id} />
  </div>;
}
