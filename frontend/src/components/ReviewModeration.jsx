import { useEffect, useState } from 'react';
import { api, adminHeaders } from '../services/api';
export default function ReviewModeration() {
  const [reviews, setReviews] = useState([]), [error, setError] = useState('');
  const load = async () => { try { setReviews((await api.get('/reviews', { headers: adminHeaders() })).data); } catch { setError('Unable to load pending reviews'); } };
  useEffect(() => { load(); }, []);
  async function moderate(id, approve) { try { await api[approve ? 'patch' : 'delete'](`/reviews/${id}`, ...(approve ? [{}, { headers: adminHeaders() }] : [{ headers: adminHeaders() }])); await load(); } catch { setError('Unable to moderate review'); } }
  return <section className="mb-10 text-white"><h2 className="text-2xl mb-4">Pending rug reviews</h2><p role="alert">{error}</p>{!reviews.length && <p>No reviews awaiting moderation.</p>}{reviews.map(r => <article key={r._id} className="border border-gray-700 p-4 my-3 rounded"><h3>{r.carpet?.title || 'Deleted rug'} — {r.rating}/5</h3><p>{r.name}: {r.comment}</p><button className="underline mr-5" onClick={() => moderate(r._id, true)}>Publish</button><button className="underline" onClick={() => moderate(r._id, false)}>Delete</button></article>)}</section>;
}
