import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
export default function Home() {
  return <>
    <Hero />
    <div className="brand-strip"><span>Made by hand</span><span>Rooted in tradition</span><span>Chosen for everyday living</span></div>
    <section className="section container">
      <div className="section-heading"><div><p className="eyebrow">Find your own perspective</p><h2 className="display">A world of character.</h2></div><Link className="text-link" to="/carpets">Shop all rugs <span aria-hidden="true">↗</span></Link></div>
      <div className="edit-grid">
        <Link className="edit-card" to="/carpets?country=Pakistan&category=BOKHARA"><div className="edit-image"><img src="/images/bokhara-detail.jpg" alt="Geometric details on a neutral Bokhara rug" loading="lazy" /></div><div className="edit-caption"><div><h3>The Bokhara edit</h3><p>Traditional pattern, everyday character</p></div><span aria-hidden="true">↗</span></div></Link>
        <Link className="edit-card" to="/carpets"><div className="edit-image"><img src="/images/bokhara-green.jpg" alt="A green handmade rug showing the texture and repeating details of the collection" loading="lazy" /></div><div className="edit-caption"><div><h3>Colour, considered.</h3><p>Explore the handmade collection</p></div><span aria-hidden="true">↗</span></div></Link>
      </div>
      <div className="editorial-note"><p className="eyebrow">More than a finishing touch</p><div><h2 className="display">Made slowly.<br />Lived in for years.</h2><p className="mt-6">A rug brings a room together. Our collection celebrates the colours, textures, and traditions of handmade weaving, with something for a quiet corner or the centre of your home.</p><Link className="text-link" to="/about">The story behind the rugs <span aria-hidden="true">↗</span></Link></div></div>
    </section>
  </>;
}
