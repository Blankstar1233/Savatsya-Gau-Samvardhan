
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, User, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-serif text-2xl font-bold text-sawatsya-earth">SAWATSYA</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-6">
              <Link to="/" className="px-3 py-2 text-sawatsya-wood hover:text-sawatsya-terracotta transition-colors">Home</Link>
              <Link to="/products" className="px-3 py-2 text-sawatsya-wood hover:text-sawatsya-terracotta transition-colors">Products</Link>
              <Link to="/about" className="px-3 py-2 text-sawatsya-wood hover:text-sawatsya-terracotta transition-colors">About</Link>
              <Link to="/contact" className="px-3 py-2 text-sawatsya-wood hover:text-sawatsya-terracotta transition-colors">Contact</Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="p-2 text-sawatsya-wood hover:text-sawatsya-terracotta transition-colors">
              <User size={20} />
            </Link>
            <Link to="/cart" className="p-2 text-sawatsya-wood hover:text-sawatsya-terracotta transition-colors">
              <ShoppingCart size={20} />
            </Link>
          </div>
          
          <div className="flex items-center md:hidden">
            <Link to="/cart" className="p-2 mr-2 text-sawatsya-wood">
              <ShoppingCart size={20} />
            </Link>
            <Button 
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-sawatsya-sand animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" 
              className="block px-3 py-2 text-sawatsya-wood hover:bg-sawatsya-cream rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link to="/products" 
              className="block px-3 py-2 text-sawatsya-wood hover:bg-sawatsya-cream rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link to="/about" 
              className="block px-3 py-2 text-sawatsya-wood hover:bg-sawatsya-cream rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link to="/contact" 
              className="block px-3 py-2 text-sawatsya-wood hover:bg-sawatsya-cream rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link to="/login" 
              className="block px-3 py-2 text-sawatsya-wood hover:bg-sawatsya-cream rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Login / Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
