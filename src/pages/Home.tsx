
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ProductImage from '@/components/ui/ProductImage';
import { products } from '@/data/products';

const Home = () => {
  const featuredProducts = products.slice(0, 3);
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
          <div className="max-w-lg">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-sawatsya-wood mb-4">
              Pure & Natural Products
            </h1>
            <p className="text-xl text-sawatsya-wood mb-6">
              Handcrafted incense sticks and authentic A2 cow ghee made with traditional methods.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="btn-primary">
                <Link to="/products">Shop Now</Link>
              </Button>
              <Button asChild variant="outline" className="border-sawatsya-earth text-sawatsya-earth hover:bg-sawatsya-cream">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/2 bg-sawatsya-sand opacity-30 hidden md:block"></div>
      </section>
      
      {/* Product Categories */}
      <section className="section-container">
        <h2 className="section-title text-center">Our Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-sawatsya-cream rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="font-serif text-2xl mb-2 text-sawatsya-wood">Incense Sticks</h3>
            <p className="text-gray-700 mb-4">
              Handcrafted with natural ingredients, our incense sticks create a serene atmosphere with their delicate fragrances.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sawatsya-earth font-medium">₹40 per pack</span>
              <Button asChild variant="outline" className="border-sawatsya-earth text-sawatsya-earth hover:bg-sawatsya-cream">
                <Link to="/products/incense">View Products</Link>
              </Button>
            </div>
          </div>
          
          <div className="bg-sawatsya-cream rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="font-serif text-2xl mb-2 text-sawatsya-wood">A2 Cow Ghee</h3>
            <p className="text-gray-700 mb-4">
              Pure, authentic ghee made from A2 cow milk using traditional bilona method for maximum nutrients and flavor.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sawatsya-earth font-medium">₹2200 per kg</span>
              <Button asChild variant="outline" className="border-sawatsya-earth text-sawatsya-earth hover:bg-sawatsya-cream">
                <Link to="/products/ghee">View Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="bg-sawatsya-sand/30 py-12 md:py-16">
        <div className="section-container">
          <h2 className="section-title text-center">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
            {featuredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="aspect-square mb-4">
                  <ProductImage src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-medium text-lg mb-2 text-sawatsya-wood">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sawatsya-earth">₹{product.price}</span>
                  <Button asChild className="btn-primary">
                    <Link to={`/product/${product.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild className="btn-primary">
              <Link to="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="section-title">About SAWATSYA</h2>
            <p className="text-gray-700 mb-6">
              At SAWATSYA, we believe in preserving traditional methods to create pure and natural products. Our incense sticks and A2 cow ghee are made with carefully selected ingredients to ensure the highest quality.
            </p>
            <p className="text-gray-700 mb-6">
              Every product is crafted with love and attention to detail, bringing the goodness of nature to your home. We take pride in our commitment to sustainability and authentic production methods.
            </p>
            <Button asChild className="btn-primary">
              <Link to="/about">Read Our Story</Link>
            </Button>
          </div>
          <div className="bg-sawatsya-cream rounded-lg h-80 flex items-center justify-center">
            <span className="text-2xl font-serif text-sawatsya-earth">Our Story</span>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="bg-sawatsya-sand/30 py-12 md:py-16">
        <div className="section-container">
          <h2 className="section-title text-center">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-700 mb-4 italic">
                "The fragrance of these incense sticks is incredible. So pure and long-lasting. I've been using them for meditation and they create the perfect atmosphere."
              </p>
              <p className="font-medium text-sawatsya-wood">- Priya S.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-700 mb-4 italic">
                "This is the best A2 ghee I've tried. The aroma and taste are simply amazing. It reminds me of the ghee my grandmother used to make."
              </p>
              <p className="font-medium text-sawatsya-wood">- Rahul M.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-700 mb-4 italic">
                "I love how natural all the products are. You can really feel the difference in quality. Will definitely be purchasing again!"
              </p>
              <p className="font-medium text-sawatsya-wood">- Anjali P.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter Signup */}
      <section className="section-container">
        <div className="bg-sawatsya-cream rounded-lg p-8 text-center">
          <h2 className="text-2xl font-serif font-medium text-sawatsya-wood mb-4">Join Our Newsletter</h2>
          <p className="text-gray-700 mb-6 max-w-md mx-auto">
            Stay updated with our latest products, special offers, and traditional recipes.
          </p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 px-4 py-2 border border-sawatsya-sand rounded-md focus:outline-none focus:ring-2 focus:ring-sawatsya-earth"
            />
            <Button className="btn-primary whitespace-nowrap">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
