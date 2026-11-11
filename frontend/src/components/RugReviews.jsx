import { useEffect, useState } from 'react';
import { api } from '../services/api';
export default function RugReviews({ id }) {
  const [reviews, setReviews] = useState([]), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => { setReviews([]); setMessage(''); api.get(`/carpets/${id}/reviews`).then(r => setReviews(r.data)).catch(() => setMessage('Reviews could not be loaded.')); }, [id]);
  async function submit(e) {
    e.preventDefault(); const form = e.currentTarget, data = new FormData(form); setBusy(true);
    try { const result = await api.post(`/carpets/${id}/reviews`, { name: data.get('name'), rating: Number(data.get('rating')), comment: data.get('comment') }); setMessage(result.data.message); form.reset(); }
    catch (err) { setMessage(err.response?.data?.message || 'Unable to submit review.'); } finally { setBusy(false); }
  }
  return <section className="my-16 border-t border-line pt-12 text-ink"><h2 className="display text-3xl text-ink mb-4">Reviews for this rug</h2><p>{reviews.length ? `${(reviews.reduce((s,r) => s + r.rating, 0) / reviews.length).toFixed(1)}/5 from ${reviews.length} published reviews` : 'No published reviews yet.'}</p>{reviews.map(r => <article className="border-b border-line py-4" key={r._id}><p>{r.name} · {r.rating}/5</p><p className="whitespace-pre-wrap">{r.comment}</p></article>)}
  <form onSubmit={submit} className="space-y-4 max-w-xl mt-8"><h3 className="text-xl text-ink">Write a review</h3><p>Your name and review will be public after moderation. Please leave out contact information. Reviews are not verified purchases.</p>
  <label className="block">Display name<input className="input" name="name" required maxLength="80" /></label>
  <label className="block">Rating<select className="input" name="rating" defaultValue="5">{[5,4,3,2,1].map(n => <option key={n} value={n}>{n} / 5</option>)}</select></label>
  <label className="block">Review<textarea className="input" name="comment" required maxLength="2000" rows="4" /></label>
  <button disabled={busy} className="bg-ink px-5 py-3 rounded-none text-paper disabled:opacity-50">{busy ? 'Submitting…' : 'Submit review'}</button><p role="status">{message}</p></form></section>;
}
