import { useEffect, useRef, useState } from 'react';
import { RUG_CATEGORIES } from '../rugCategories';
export default function AdminForm({ onSubmit, initialData, buttonText = 'Add Rug' }) {
  const empty = { title: '', price: '', description: '', category: '', material: '', dimensions: '', images: [] };
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef();
  useEffect(() => { setForm({ ...empty, ...initialData, images: [] }); if (fileInput.current) fileInput.current.value = ''; }, [initialData]);
  async function submit(e) {
    e.preventDefault(); setError('');
    if (form.images.length > 8 || form.images.some(f => f.size > 8 * 1024 * 1024)) { setError('Choose up to 8 photos, each no larger than 8 MB.'); return; }
    setBusy(true);
    try { await onSubmit(form); } finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="space-y-5">
    <label className="block text-gray-300">Rug category
      <select className="input mt-2" name="category" required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
        <option value="" disabled>Select a rug category</option>
        {form.category && !RUG_CATEGORIES.some(c => c.name === form.category) && <option value={form.category}>{form.category} (existing category)</option>}
        {RUG_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
      </select>
      <span className="block mt-2 text-sm text-gray-400">{RUG_CATEGORIES.find(c => c.name === form.category)?.description}</span>
    </label>
    {['title', 'material', 'dimensions', 'price'].map(field => <label key={field} className="block text-gray-300 capitalize">{field === 'price' ? 'Price (USD)' : field}
      <input className="input mt-2" name={field} type={field === 'price' ? 'number' : 'text'} min="0" step={field === 'price' ? '0.01' : undefined} maxLength={field === 'category' ? 80 : 120} required={['title', 'category', 'price'].includes(field)} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
    </label>)}
    <label className="block text-gray-300">About this rug<textarea className="input mt-2" rows="5" required maxLength="10000" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
    <label className="block text-gray-300">Photos from your computer<input ref={fileInput} className="block my-3" type="file" multiple accept="image/jpeg,image/png,image/webp" required={!initialData} onChange={e => setForm({ ...form, images: Array.from(e.target.files) })} /></label>
    <p className="text-sm text-gray-400">Up to 8 JPEG, PNG or WebP photos, 8 MB each. First photo is the cover. Selecting photos replaces the gallery when editing.</p>
    <ul className="text-gray-300">{form.images.map((f, i) => <li key={i}>{f.name}</li>)}</ul>
    {error && <p role="alert" className="text-red-400">{error}</p>}
    <button disabled={busy} className="bg-blue-600 text-white rounded-lg px-6 py-3 disabled:opacity-50">{busy ? 'Saving…' : buttonText}</button>
  </form>;
}
