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
              CHRONO
            </Link>
            <p className="text-sm text-neutral-500 max-w-xs">
              Handpicked watches crafted for style, precision, and everyday elegance. Get premium watches delivered right to your doorstep.
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
                <Link to="/login" className="hover:text-black transition-colors">My Account</Link>
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
                <span>123 Watch Street, Time Square, Mumbai, 400001</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">Get in Touch</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-neutral-400 flex-shrink-0" />
                <a href="tel:+919876543210" className="hover:text-black transition-colors">+91 98765 43210</a>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-neutral-400 flex-shrink-0" />
                <a href="mailto:support@chrono.com" className="hover:text-black transition-colors">support@chrono.com</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 border-t border-neutral-200 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-400">
          <p>&copy; {new Date().getFullYear()} CHRONO. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <span className="text-neutral-500 font-medium">WhatsApp Direct Ordering Enabled</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
