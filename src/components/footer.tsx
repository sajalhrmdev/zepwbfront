import Link from "next/link";
import { Leaf, Mail, Phone, MapPin } from "lucide-react";
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube } from "react-icons/fi";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

const categories = [
  { label: "Vegetables", href: "/products?category=vegetables" },
  { label: "Fruits", href: "/products?category=fruits" },
  { label: "Dairy", href: "/products?category=dairy" },
  { label: "Bakery", href: "/products?category=bakery" },
  { label: "Beverages", href: "/products?category=beverages" },
  { label: "Snacks", href: "/products?category=snacks" },
];

const socialLinks = [
  { icon: FiFacebook, href: "https://facebook.com" },
  { icon: FiTwitter, href: "https://twitter.com" },
  { icon: FiInstagram, href: "https://instagram.com" },
  { icon: FiYoutube, href: "https://youtube.com" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Leaf className="h-7 w-7 text-brand-400" />
              <span className="text-xl font-bold">Zep</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Quick delivery of fresh fruits, vegetables, dairy, and everyday
              essentials — delivered to your doorstep in minutes.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.label}>
                  <Link
                    href={cat.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-gray-400 text-sm">
                <Mail className="h-4 w-4 text-brand-400 shrink-0" />
                <a
                  href="mailto:support@zep.com"
                  className="hover:text-white transition-colors"
                >
                  support@zep.com
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400 text-sm">
                <Phone className="h-4 w-4 text-brand-400 shrink-0" />
                <a
                  href="tel:+919876543210"
                  className="hover:text-white transition-colors"
                >
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-gray-400 text-sm">
                <MapPin className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
                <span>
                  123, BKC, Bandra East,
                  <br />
                  Howrah, West Bengal 711101
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; 2024 Zep. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
