import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in Name, Email and Message');
      return;
    }

    // Mock form submit success
    toast.success('Your message has been sent successfully! We will get back to you shortly.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleWhatsAppChat = () => {
    const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';
    const message = encodeURIComponent("Hello Chrono! I'm interested in purchasing a watch and had some questions.");
    window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="border-b border-neutral-100 pb-5 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 uppercase">Contact Us</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Have questions? Talk to our sales and support team directly.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Contact Info & Timings */}
        <section className="lg:col-span-5 space-y-6">
          <div className="border border-neutral-100 bg-white p-6 rounded space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black border-b border-neutral-100 pb-3">
              Office Details
            </h2>

            <ul className="space-y-4 text-sm text-neutral-600">
              <li className="flex items-start">
                <MapPin className="mr-3 h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-black">Store Location</span>
                  <p className="mt-1">123 Watch Street, Time Square, Mumbai, Maharashtra - 400001</p>
                </div>
              </li>

              <li className="flex items-start">
                <Clock className="mr-3 h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-black">Working Hours</span>
                  <p className="mt-1">Monday to Saturday: 10:00 AM - 8:00 PM</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Closed on Sundays and National Holidays</p>
                </div>
              </li>

              <li className="flex items-start">
                <Phone className="mr-3 h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-black">Phone Contact</span>
                  <p className="mt-1">
                    <a href="tel:+919876543210" className="hover:text-black hover:underline">+91 98765 43210</a>
                  </p>
                </div>
              </li>

              <li className="flex items-start">
                <Mail className="mr-3 h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-black">Email Address</span>
                  <p className="mt-1">
                    <a href="mailto:support@chrono.com" className="hover:text-black hover:underline">support@chrono.com</a>
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Quick WhatsApp Redirect Box */}
          <div className="border border-neutral-100 bg-green-50/50 p-6 rounded text-center space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-green-950 flex items-center justify-center">
              <MessageSquare className="mr-2 h-5 w-5 text-green-600" /> WhatsApp Direct assistance
            </h3>
            <p className="text-xs text-green-900/70 leading-relaxed">
              Need immediate advice or want to purchase custom watches? Reach our sales executive on WhatsApp right away.
            </p>
            <button
              onClick={handleWhatsAppChat}
              className="w-full bg-green-600 text-white rounded-full py-3 text-xs font-bold uppercase tracking-wider hover:bg-green-700 transition-colors shadow-sm"
            >
              Start WhatsApp Chat
            </button>
          </div>
        </section>

        {/* Contact Form */}
        <main className="lg:col-span-7">
          <div className="border border-neutral-100 bg-white p-6 rounded">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black border-b border-neutral-100 pb-3">
              Send a Message
            </h2>

            <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-neutral-200 px-3 py-2.5 text-sm focus:border-black focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Your Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-neutral-200 px-3 py-2.5 text-sm focus:border-black focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Subject (Optional)</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full border border-neutral-200 px-3 py-2.5 text-sm focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Message Description</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Tell us what you're looking for..."
                  className="w-full border border-neutral-200 px-3 py-2.5 text-sm focus:border-black focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-black px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors"
              >
                Send Message <Send className="ml-2 h-4 w-4" />
              </button>
            </form>
          </div>
        </main>

      </div>
    </div>
  );
};

export default Contact;
