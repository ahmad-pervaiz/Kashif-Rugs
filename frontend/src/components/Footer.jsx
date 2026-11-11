import { Link } from 'react-router-dom';
export default function Footer() {
  return <footer className="site-footer"><div className="container">
    <div className="footer-main">
      <div><Link className="footer-brand" to="/">Kashif Rugs</Link><p>Considered pieces. Lasting character.<br />Handmade rugs from Pakistan and Afghanistan, chosen for the spaces you call home.</p></div>
      <div><h2>Explore</h2><ul><li><Link to="/carpets">The collection</Link></li><li><Link to="/carpets?country=Pakistan">Rugs from Pakistan</Link></li><li><Link to="/carpets?country=Afghanistan">Rugs from Afghanistan</Link></li><li><Link to="/about">Our story</Link></li></ul></div>
      <div><h2>Here to help</h2><ul><li><Link to="/contact">Contact & rug enquiries</Link></li><li><a href="mailto:Kashifrugs@hotmail.com">Kashifrugs@hotmail.com</a></li><li><a href="https://wa.me/923007722760" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></li><li><a href="https://instagram.com/kashif_rugs" target="_blank" rel="noopener noreferrer">Instagram ↗</a></li></ul></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Kashif Rugs</span><span>Made by hand. Chosen by you.</span><div className="flex gap-6"><Link to="/privacy">Privacy information</Link><Link to="/admin">Admin sign in</Link></div></div>
  </div></footer>;
}
