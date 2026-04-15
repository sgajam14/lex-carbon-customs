import { Link } from 'react-router-dom';
import { Instagram, Youtube, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="dark:bg-dark-surface bg-gray-900 border-t dark:border-dark-border border-gray-800 mt-auto">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-red flex items-center justify-center rounded font-display font-black text-white text-sm">LC</div>
              <span className="font-display font-bold text-white tracking-wider uppercase">LEX'S CARBON</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Premium carbon fiber parts engineered for performance. Every piece is verified for fitment before it ships.
            </p>
            <div className="flex items-center gap-1 text-sm font-medium text-green-400 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
              Guaranteed Fit or Your Money Back
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="text-gray-400 hover:text-brand-red transition-colors"><Instagram size={18} /></a>
              <a href="#" className="text-gray-400 hover:text-brand-red transition-colors"><Youtube size={18} /></a>
              <a href="#" className="text-gray-400 hover:text-brand-red transition-colors"><Facebook size={18} /></a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-heading font-bold text-white tracking-widest uppercase text-sm mb-4">Shop</h4>
            <ul className="space-y-2">
              {['Hoods', 'Spoilers', 'Diffusers', 'Side Skirts', 'Front Bumpers', 'Interior Trim'].map(item => (
                <li key={item}>
                  <Link to={`/shop?category=${item.replace(' ', '+')}`} className="text-gray-400 hover:text-brand-red text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-heading font-bold text-white tracking-widest uppercase text-sm mb-4">Account</h4>
            <ul className="space-y-2">
              {[
                { label: 'My Account', href: '/account' },
                { label: 'Order History', href: '/orders' },
                { label: 'Track Order', href: '/track' },
                { label: 'My Garage', href: '/build' },
                { label: 'Wishlist', href: '/account' },
              ].map(item => (
                <li key={item.href}>
                  <Link to={item.href} className="text-gray-400 hover:text-brand-red text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold text-white tracking-widest uppercase text-sm mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-400 text-sm">
                <Phone size={14} className="mt-0.5 shrink-0 text-brand-red" />
                <span>(555) 867-5309</span>
              </li>
              <li className="flex items-start gap-2 text-gray-400 text-sm">
                <Mail size={14} className="mt-0.5 shrink-0 text-brand-red" />
                <span>support@lexscarboncustoms.com</span>
              </li>
              <li className="flex items-start gap-2 text-gray-400 text-sm">
                <MapPin size={14} className="mt-0.5 shrink-0 text-brand-red" />
                <span>Los Angeles, CA 90001</span>
              </li>
            </ul>
            <div className="mt-6">
              <h5 className="font-heading font-semibold text-white text-xs tracking-widest uppercase mb-3">We Accept</h5>
              <div className="flex flex-wrap gap-2">
                {['VISA', 'MC', 'AMEX', 'AFFIRM', 'KLARNA'].map(card => (
                  <span key={card} className="text-xs bg-dark-surface-2 border border-dark-border text-gray-400 px-2 py-1 rounded font-mono">
                    {card}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} Lex's Carbon Customs. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Return Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
