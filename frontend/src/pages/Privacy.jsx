import { Link } from 'react-router-dom';
export default function Privacy() {
  return <article className="max-w-3xl mx-auto px-6 py-12 text-gray-300 space-y-6"><h1 className="text-4xl text-white">Privacy information</h1>
    <p>Checkout collects your name, email, phone number, shipping address and optional notes so Kashif Rugs can process your order and contact you about it. Please do not submit payment card details or sensitive information in notes.</p>
    <p>Your shopping cart is saved in this browser using local storage. You can remove it by clearing your cart or clearing this website’s browser data.</p>
    <p>When you submit a rug review, your display name, rating and review text may be published after moderation. Do not include your email, address or phone number in a review.</p>
    <p>Product photos are public. Store staff should remove location metadata and personal details from photos before uploading them.</p>
    <p>Links to WhatsApp and Instagram take you to third-party services with their own privacy practices. Existing site images may also be loaded from external image providers.</p>
    <p>For questions about your information, or to request correction or deletion, contact <a className="underline" href="mailto:Kashifrugs@hotmail.com">Kashifrugs@hotmail.com</a>. Retention periods and applicable regional rights must be confirmed by the store before launch.</p>
    <Link className="underline" to="/contact">Contact the store</Link>
  </article>;
}
