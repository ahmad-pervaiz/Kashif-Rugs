import { useEffect, useRef, useState } from 'react';
import { RUG_CATEGORIES, RUG_CATEGORY_GROUPS } from '../rugCategories';
export default function AdminForm({ onSubmit, initialData, buttonText = 'Add Rug' }) {
  const empty = { title: '', price: '', description: '', category: '', country: '', material: '', dimensions: '', images: [] };
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef();
  useEffect(() => { setForm({ ...empty, ...initialData, images: [] }); if (fileInput.current) fileInput.current.value = ''; }, [initialData]);
  const selectedCategory = RUG_CATEGORIES.find(c => c.name === form.category && c.country === form.country);
  async function submit(e) {
    e.preventDefault(); setError('');
    if (form.images.length > 8 || form.images.some(f => f.size > 8 * 1024 * 1024)) { setError('Choose up to 8 photos, each no larger than 8 MB.'); return; }
    setBusy(true);
    try { await onSubmit(form); } finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="space-y-5">
    <label className="block text-ink">Rug category
      <select className="input mt-2" name="category" required value={selectedCategory?.key || (form.category ? '__existing' : '')} onChange={e => {
        const chosen = RUG_CATEGORIES.find(c => c.key === e.target.value);
        if (chosen) setForm({ ...form, category: chosen.name, country: chosen.country });
      }}>
        <option value="" disabled>Select a rug category and country</option>
        {form.category && !selectedCategory && <option value="__existing">{form.category} — {form.country || 'country not assigned'} (existing)</option>}
        {RUG_CATEGORY_GROUPS.map(group => <optgroup key={group.country} label={group.country}>
          {RUG_CATEGORIES.filter(c => c.country === group.country).map(c => <option key={c.key} value={c.key}>{c.name} — {c.country}</option>)}
        </optgroup>)}
      </select>
      <span className="block mt-2 text-sm text-muted">{form.country ? `Country: ${form.country}` : 'Choose a country-specific category for this rug.'}</span>
    </label>
    {['title', 'material', 'dimensions', 'price'].map(field => <label key={field} className="block text-ink capitalize">{field === 'price' ? 'Price (USD)' : field}
      <input className="input mt-2" name={field} type={field === 'price' ? 'number' : 'text'} min="0" step={field === 'price' ? '0.01' : undefined} maxLength={field === 'category' ? 80 : 120} required={['title', 'category', 'price'].includes(field)} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
    </label>)}
    <label className="block text-ink">About this rug<textarea className="input mt-2" rows="5" required maxLength="10000" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
    <label className="block text-ink">Photos from your computer<input ref={fileInput} className="block my-3" type="file" multiple accept="image/jpeg,image/png,image/webp" required={!initialData} onChange={e => setForm({ ...form, images: Array.from(e.target.files) })} /></label>
    <p className="text-sm text-muted">Up to 8 JPEG, PNG or WebP photos, 8 MB each. First photo is the cover. Selecting photos replaces the gallery when editing.</p>
    <ul className="text-ink">{form.images.map((f, i) => <li key={i}>{f.name}</li>)}</ul>
    {error && <p role="alert" className="text-danger">{error}</p>}
    <button disabled={busy} className="bg-ink text-paper rounded-none px-6 py-3 disabled:opacity-50">{busy ? 'Saving…' : buttonText}</button>
  </form>;
}
