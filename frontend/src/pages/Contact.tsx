
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
   
    toast.success('Your message has been sent successfully!');
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };
  
  return (
    <div className="min-h-screen">
      <section className="bg-sawatsya-cream py-16 md:py-24">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-sawatsya-wood mb-4">Contact Us</h1>
            <p className="text-xl text-sawatsya-wood">
              We'd love to hear from you. Get in touch with us.
            </p>
          </div>
        </div>
      </section>
      
      <section className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {}
          <div>
            <h2 className="text-2xl font-serif font-medium text-sawatsya-wood mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-sawatsya-sand rounded-md focus:outline-none focus:ring-2 focus:ring-sawatsya-earth"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-sawatsya-sand rounded-md focus:outline-none focus:ring-2 focus:ring-sawatsya-earth"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-sawatsya-sand rounded-md focus:outline-none focus:ring-2 focus:ring-sawatsya-earth"
                >
                  <option value="">Select a subject</option>
                  <option value="product-inquiry">Product Inquiry</option>
                  <option value="order-status">Order Status</option>
                  <option value="feedback">Feedback</option>
                  <option value="wholesale">Wholesale Inquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-sawatsya-sand rounded-md focus:outline-none focus:ring-2 focus:ring-sawatsya-earth"
                ></textarea>
              </div>
              
              <Button type="submit" className="btn-primary">
                Send Message
              </Button>
            </form>
          </div>
          
          {}
          <div>
            <h2 className="text-2xl font-serif font-medium text-sawatsya-wood mb-6">Contact Information</h2>
            
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h3 className="font-medium text-lg text-sawatsya-wood mb-4">Reach Us</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-sawatsya-cream rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <span className="text-sawatsya-earth text-lg">📍</span>
                  </div>
                  <div>
                    <p className="font-medium">Address</p>
                    <address className="not-italic text-gray-600">
                      Varade Gaon,<br />
                      Badlapur, Maharashtra<br />
                      India
                    </address>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-sawatsya-cream rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <span className="text-sawatsya-earth text-lg">📧</span>
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:vedjoshi0304@gmail.com" className="text-gray-600 hover:text-sawatsya-terracotta">
                      vedjoshi0304@gmail.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-sawatsya-cream rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <span className="text-sawatsya-earth text-lg">📞</span>
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href="tel:+91 9588958811" className="text-gray-600 hover:text-sawatsya-terracotta">
                      +91 9588958811
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-medium text-lg text-sawatsya-wood mb-4">Business Hours</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span>9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span>10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {}
      <section className="mt-12">
        <div className="h-80 bg-sawatsya-sand flex items-center justify-center">
          <p className="text-sawatsya-wood font-medium">Map Location Placeholder</p>
        </div>
      </section>
    </div>
  );
};

export default Contact;
