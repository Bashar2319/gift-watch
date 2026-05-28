import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-neutral-100 bg-neutral-50 text-neutral-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link to="/" className="text-xl font-bold tracking-widest text-black">
              GIFT WATCH
            </Link>
            <p className="text-sm text-neutral-500 max-w-xs">
              Prepaid delivery directly to your doorstep all over India. Keep shopping for the best watches from @giftwatch_lucknow.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/shop" className="hover:text-black transition-colors">Shop All Watches</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-black transition-colors">Contact Support</Link>
              </li>
              <li>
                <a 
                  href="https://www.instagram.com/reel/DYys8WUTtm1/?igsh=MTQ5OHIxYXdyeXRjcg==" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-black transition-colors block text-neutral-500 hover:text-black"
                >
                  Follow on Instagram
                </a>
              </li>
            </ul>
          </div>

          {/* Business Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">Store Information</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center text-neutral-500">
                <Clock className="mr-2 h-4 w-4 text-neutral-400 flex-shrink-0" />
                <span>Mon - Sat: 10:00 AM - 8:00 PM</span>
              </li>
              <li className="flex items-start text-neutral-500">
                <MapPin className="mr-2 h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                <span>Opposite lane of burma biscuit company, Aminabad, Lucknow (Near Akhil paper mart)</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">Get in Touch</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-neutral-400 flex-shrink-0" />
                <a href="tel:+917081271482" className="hover:text-black transition-colors">+91 70812 71482</a>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-neutral-400 flex-shrink-0" />
                <a href="mailto:pro4134@gmail.com" className="hover:text-black transition-colors">pro4134@gmail.com</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 border-t border-neutral-200 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-400">
          <p>&copy; {new Date().getFullYear()} GIFT WATCH. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <span className="text-neutral-500 font-medium">WhatsApp Direct Ordering Enabled</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
