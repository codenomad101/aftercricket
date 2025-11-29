import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    QuickLinks: [
      { href: '/', label: 'Home' },
      { href: '/articles', label: 'News' },
      { href: '/players', label: 'Players' },
      { href: '/series', label: 'Series' },
    ],
    Categories: [
      { href: '/articles?category=players', label: 'Players' },
      { href: '/articles?category=teams', label: 'Teams' },
      { href: '/articles?category=tournaments', label: 'Tournaments' },
      { href: '/articles?category=matches', label: 'Matches' },
    ],
    Info: [
      { href: '/about', label: 'About Us' },
      { href: '/contact', label: 'Contact' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
    ],
  };

  return (
    <footer className="bg-red-600 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold mb-2 font-papyrus">
              AfterCricket
            </h3>
            <p className="text-sm text-red-100 mb-4">
              hype the game
            </p>
            <p className="text-sm text-gray-200 mb-4">
              Your ultimate destination for cricket news, live scores, player stats, and more.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-red-700 rounded-full flex items-center justify-center hover:bg-red-800 transition-colors"
                aria-label="Facebook"
              >
                <span className="text-white">f</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-red-700 rounded-full flex items-center justify-center hover:bg-red-800 transition-colors"
                aria-label="Twitter"
              >
                <span className="text-white">t</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-red-700 rounded-full flex items-center justify-center hover:bg-red-800 transition-colors"
                aria-label="Instagram"
              >
                <span className="text-white">i</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.QuickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-200 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              {footerLinks.Categories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-200 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Information</h4>
            <ul className="space-y-2">
              {footerLinks.Info.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-200 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-red-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-center items-center">
            <p className="text-sm text-gray-200">
              © {currentYear} AfterCricket.com. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}



