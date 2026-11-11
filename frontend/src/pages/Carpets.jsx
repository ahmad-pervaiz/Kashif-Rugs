import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllCarpets } from '../services/carpetService';
import { RUG_CATEGORIES, RUG_CATEGORY_GROUPS } from '../rugCategories';
import ProductCard from '../components/ProductCard';
export default function Carpets() {
  const [params, setParams] = useSearchParams();
  const requestedCountry = params.get('country');
  const country = RUG_CATEGORY_GROUPS.some(g => g.country === requestedCountry) ? requestedCountry : 'All';
  const category = params.get('category') || 'All';
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [rugs, setRugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function load() {
    setLoading(true); setError('');
    try { setRugs(await getAllCarpets()); } catch { setError('Our collection is temporarily unavailable. Please try again.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  const categories = [...new Set([...RUG_CATEGORIES.filter(c => country === 'All' || c.country === country).map(c => c.name), ...rugs.filter(r => country === 'All' || r.country === country).map(r => r.category || 'Rugs'), ...(category !== 'All' ? [category] : [])])];
  const visible = rugs.filter(r => (country === 'All' || r.country === country) && (category === 'All' || (r.category || 'Rugs') === category) && `${r.title} ${r.description} ${r.category || ''}`.toLowerCase().includes(search.toLowerCase()));
  if (sort !== 'newest') visible.sort((a,b) => sort === 'low' ? a.price - b.price : b.price - a.price);
  const updateCountry = value => { const next = new URLSearchParams(params); next.delete('category'); value === 'All' ? next.delete('country') : next.set('country', value); setParams(next); };
  const updateCategory = value => { const next = new URLSearchParams(params); value === 'All' ? next.delete('category') : next.set('category', value); setParams(next); };
  return <div className="container">
    <div className="page-head"><p className="eyebrow">The collection</p><h1 className="page-title">Find your grounding.</h1><p>From quiet neutrals to expressive patterns. Handmade rugs from Pakistan and Afghanistan, ready for a place in your home.</p></div>
    <div className="filters"><label>Search<input className="input" type="search" placeholder="Find a rug…" value={search} onChange={e => setSearch(e.target.value)} /></label>
      <label>Country<select aria-label="Country" className="input" value={country} onChange={e => updateCountry(e.target.value)}><option value="All">All countries</option>{RUG_CATEGORY_GROUPS.map(g => <option key={g.country}>{g.country}</option>)}</select></label>
      <label>Category<select aria-label="Category" className="input" value={category} onChange={e => updateCategory(e.target.value)}><option value="All">All rugs</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
      <label>Sort by<select aria-label="Sort by" className="input" value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Newest first</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label>
    </div>
    <p className="result-count" role="status">{loading ? 'Gathering the collection…' : `${visible.length} ${visible.length === 1 ? 'piece' : 'pieces'}`}</p>
    {error ? <div className="status-panel" role="alert"><h2>A moment, please.</h2><p>{error}</p><button className="button button-outline" onClick={load}>Try again</button></div> : !loading && !visible.length ? <div className="status-panel"><h2>A little room for discovery.</h2><p>No rugs match this selection. Try another category or check back soon.</p><button className="button button-outline" onClick={() => { setParams({}); setSearch(''); }}>Clear filters</button></div> : <div className="product-grid">{visible.map(rug => <ProductCard key={rug._id} rug={rug} />)}</div>}
  </div>;
}
