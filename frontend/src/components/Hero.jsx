import { Link } from 'react-router-dom';
export default function Hero() {
  return <section className="hero" aria-labelledby="hero-title">
    <div className="hero-copy"><p className="eyebrow">The handmade collection</p><h1 className="display" id="hero-title">A quieter<br />kind of<br /><em>statement.</em></h1><p>Texture, tradition, and a little individuality. Discover handmade rugs that make a room feel like you.</p><Link to="/carpets" className="button">Explore the collection <span aria-hidden="true">↗</span></Link></div>
    <div className="hero-photo"><img src="/images/bokhara-detail.jpg" alt="Close-up of a handmade Bokhara rug with traditional geometric motifs" fetchPriority="high" /><div className="hero-caption"><span>Pattern. Texture. Character.</span><span>01 / The collection</span></div></div>
  </section>;
}
