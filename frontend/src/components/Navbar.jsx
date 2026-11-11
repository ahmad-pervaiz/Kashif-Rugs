import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ThemeToggle from './ThemeToggle';
const links = [['/carpets', 'Shop rugs'], ['/about', 'Our story'], ['/contact', 'Contact']];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname, search } = useLocation();
  const { getCartItemsCount } = useCart();
  const count = getCartItemsCount();
  useEffect(() => { setOpen(false); }, [pathname, search]);
  useEffect(() => {
    const escape = e => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, []);
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="announcement">Handmade rugs · Pakistan & Afghanistan · Collected with care</div>
    <header className="site-header">
      <nav className="navbar container" aria-label="Main navigation">
        <div className="nav-links">{links.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}</div>
        <button className="menu-button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d={open ? 'M5 5l14 14M5 19 19 5' : 'M3 7h18M3 12h18M3 17h18'} /></svg>
        </button>
        <Link to="/" className="brand" aria-label="Kashif Rugs home">KASHIF RUGS<span>Handmade, for living.</span></Link>
        <div className="nav-actions">
          <ThemeToggle />
          <Link className="desktop-account" to="/admin">Admin</Link>
          <Link to="/cart" className="bag-link" aria-label={`Shopping bag, ${count} ${count === 1 ? 'item' : 'items'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg><span className="bag-label">Bag</span><span>({count})</span>
          </Link>
        </div>
      </nav>
      {open && <nav id="mobile-navigation" className="mobile-menu" aria-label="Mobile navigation">{links.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}<Link to="/admin">Admin account</Link></nav>}
    </header>
  </>;
}
