
import React from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

// This component handles product images with fallbacks
const ProductImage: React.FC<ProductImageProps> = ({ src, alt, className = "" }) => {
  // Check if the src is a full URL or a relative path
  const isExternalUrl = src.startsWith('http');
  
  // Function to generate placeholder based on alt text
  const generatePlaceholder = () => {
    const colors = [
      'bg-sawatsya-earth', 'bg-sawatsya-leaf', 
      'bg-sawatsya-terracotta', 'bg-sawatsya-amber'
    ];
    
    // Use a hash of the alt text to consistently select the same color for the same product
    const colorIndex = alt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    
    return (
      <div className={`w-full h-full flex items-center justify-center ${colors[colorIndex]}`}>
        <span className="text-white font-medium">{alt.substring(0, 2).toUpperCase()}</span>
      </div>
    );
  };
  
  // For development, we'll use placeholders instead of actual images
  return (
    <div className={`rounded-md overflow-hidden relative ${className}`}>
      {src === '/images/sandalwood-incense.jpg' && (
        <div className="w-full h-full aspect-square bg-sawatsya-cream">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1/2 h-3/4 bg-sawatsya-wood rounded-sm"></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 text-center p-2 text-xs bg-sawatsya-sand/50">
            Sandalwood Incense
          </div>
        </div>
      )}
      
      {src === '/images/rose-incense.jpg' && (
        <div className="w-full h-full aspect-square bg-sawatsya-cream">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1/2 h-3/4 bg-sawatsya-terracotta rounded-sm"></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 text-center p-2 text-xs bg-sawatsya-sand/50">
            Rose Incense
          </div>
        </div>
      )}
      
      {src === '/images/lavender-incense.jpg' && (
        <div className="w-full h-full aspect-square bg-sawatsya-cream">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1/2 h-3/4 bg-purple-400 rounded-sm"></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 text-center p-2 text-xs bg-sawatsya-sand/50">
            Lavender Incense
          </div>
        </div>
      )}
      
      {src === '/images/jasmine-incense.jpg' && (
        <div className="w-full h-full aspect-square bg-sawatsya-cream">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1/2 h-3/4 bg-amber-100 rounded-sm"></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 text-center p-2 text-xs bg-sawatsya-sand/50">
            Jasmine Incense
          </div>
        </div>
      )}
      
      {src === '/images/ghee-500g.jpg' && (
        <div className="w-full h-full aspect-square bg-sawatsya-cream">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1/2 h-1/2 rounded-full bg-sawatsya-amber"></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 text-center p-2 text-xs bg-sawatsya-sand/50">
            A2 Ghee 500g
          </div>
        </div>
      )}
      
      {src === '/images/ghee-1kg.jpg' && (
        <div className="w-full h-full aspect-square bg-sawatsya-cream">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/5 h-3/5 rounded-full bg-sawatsya-amber"></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 text-center p-2 text-xs bg-sawatsya-sand/50">
            A2 Ghee 1kg
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImage;
