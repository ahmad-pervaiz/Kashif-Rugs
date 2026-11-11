import { useState } from 'react';
export default function Contact() {
  const [recipient, setRecipient] = useState('923007722760');
  function submit(e) {
    e.preventDefault(); const form = new FormData(e.currentTarget);
    const message = `Hello Kashif Rugs, my name is ${form.get('name')}. ${form.get('message')}`;
    window.open(`https://wa.me/${recipient}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }
  return <div className="container"><div className="page-head"><p className="eyebrow">Here to help</p><h1 className="page-title">Let’s find your piece.</h1><p>A question about colour, size, or a particular rug? We’re happy to help you look a little closer.</p></div><div className="contact-layout">
    <div className="contact-details"><section className="contact-detail"><h2>Email us</h2><a href="mailto:Kashifrugs@hotmail.com">Kashifrugs@hotmail.com</a></section><section className="contact-detail"><h2>Call or WhatsApp</h2><a href="https://wa.me/923007722760" target="_blank" rel="noopener noreferrer">+92 300 7722760 ↗</a><br /><a href="https://wa.me/923335849004" target="_blank" rel="noopener noreferrer">+92 333 5849004 ↗</a></section><section className="contact-detail"><h2>Follow the collection</h2><a href="https://instagram.com/kashif_rugs" target="_blank" rel="noopener noreferrer">@kashif_rugs ↗</a></section></div>
    <form className="contact-form" onSubmit={submit}><label>Your name<input className="input" name="name" autoComplete="name" required maxLength="120" placeholder="How should we address you?" /></label><label>Your message<textarea className="input" name="message" required rows="6" maxLength="2000" placeholder="Tell us about the rug or space you have in mind…" /></label><label>Contact<select className="input" value={recipient} onChange={e => setRecipient(e.target.value)}><option value="923007722760">+92 300 7722760</option><option value="923335849004">+92 333 5849004</option></select></label><p className="form-note">This opens WhatsApp with your message ready to send. You choose when to send it.</p><button className="button">Continue on WhatsApp ↗</button></form>
  </div></div>;
}
