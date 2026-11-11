import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';
import { money } from '../utils/money';
const fields = [
  ['customerName', 'Full name', 'text', 'name'], ['email', 'Email', 'email', 'email'], ['phone', 'Phone', 'tel', 'tel'],
  ['address.street', 'Street address', 'text', 'street-address'], ['address.city', 'City', 'text', 'address-level2'],
  ['address.state', 'State / province', 'text', 'address-level1'], ['address.zipCode', 'Postal code', 'text', 'postal-code'], ['address.country', 'Country', 'text', 'country-name'],
];
export default function Checkout() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [order, setOrder] = useState(null);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    const form = new FormData(e.currentTarget);
    const body = { address: {}, items: cartItems.map(item => ({ carpet: item._id, quantity: item.quantity })), notes: form.get('notes') || '' };
    for (const [name] of fields) { if (name.startsWith('address.')) body.address[name.split('.')[1]] = form.get(name); else body[name] = form.get(name); }
    try { const result = await createOrder(body); setOrder(result); clearCart(); }
    catch (err) { setError(err.response?.data?.message || 'Your request could not be placed. Please try again.'); }
    finally { setBusy(false); }
  }
  if (order) return <div className="container section"><div className="status-panel" role="status"><p className="eyebrow">Thank you</p><h1 className="page-title">Your next chapter starts here.</h1><p>Your order request has been received. We’ll contact you to confirm availability, delivery and payment.</p><p>Reference: <strong className="break-all">{order._id}</strong></p><p>Items subtotal: {money(order.totalAmount)}</p><Link className="button" to="/carpets">Back to the collection</Link></div></div>;
  if (!cartItems.length) return <div className="container section"><div className="status-panel"><h1 className="page-title">Your bag is empty.</h1><Link className="button" to="/carpets">Explore the collection</Link></div></div>;
  return <div className="container"><div className="page-head"><p className="eyebrow">Checkout</p><h1 className="page-title">Make it yours.</h1><p>Leave your details and we’ll help your chosen pieces find their way home.</p></div><div className="bag-layout">
    <form className="contact-form" onSubmit={submit}><h2 className="display text-3xl">Your details</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{fields.map(([name,label,type,autocomplete]) => <label key={name} className={name === 'address.street' ? 'sm:col-span-2' : ''}>{label} *<input className="input" name={name} type={type} autoComplete={autocomplete} required maxLength={name === 'email' ? 254 : name === 'phone' ? 40 : 120} /></label>)}</div><label>Anything we should know?<textarea className="input" name="notes" rows="4" maxLength="2000" placeholder="Optional delivery notes or questions about your rug" /></label>
      <p className="form-note">This is an order request. We’ll confirm availability, delivery costs, and payment arrangements. No online payment is collected here. Please read our <Link className="underline" to="/privacy">privacy information</Link>.</p>{error && <p role="alert" className="text-danger">{error}</p>}<button className="button" disabled={busy}>{busy ? 'Sending your request…' : 'Place order request ↗'}</button>
    </form><aside className="order-summary"><h2>Your selection</h2>{cartItems.map(item => <div className="summary-line" key={item._id}><span>{item.title} × {item.quantity}</span><span className="whitespace-nowrap">{money(item.price * item.quantity)}</span></div>)}<div className="summary-line summary-total"><span>Items subtotal</span><span>{money(getCartTotal())}</span></div><p className="form-note">The server confirms current product prices when your request is submitted. Delivery charges are confirmed separately.</p><Link className="text-link" to="/cart">Edit your bag</Link></aside>
  </div></div>;
}
