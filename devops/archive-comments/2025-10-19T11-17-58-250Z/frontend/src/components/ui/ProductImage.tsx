
import React, { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

// This component handles product images with fallbacks
const ProductImage: React.FC<ProductImageProps> = ({ src, alt, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Function to generate placeholder based on alt text
  const generatePlaceholder = () => {
    const colors = [
      'bg-sawatsya-earth', 'bg-sawatsya-leaf', 
      'bg-sawatsya-terracotta', 'bg-sawatsya-amber'
    ];
    
    // Use a hash of the alt text to consistently select the same color for the same product
    const colorIndex = alt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    
    return (
      <div className={`w-full h-full flex items-center justify-center ${colors[colorIndex]} rounded-md`}>
        <span className="text-white font-medium text-lg">{alt.substring(0, 2).toUpperCase()}</span>
      </div>
    );
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  return (
    <div className={`rounded-md overflow-hidden relative ${className}`}>
      {!imageError ? (
        <>
          {imageLoading && (
            <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
              <span className="text-gray-400">Loading...</span>
            </div>
          )}
          <img
            src={src}
            alt={alt}
            className={`w-full h-full object-cover ${imageLoading ? 'hidden' : 'block'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </>
      ) : (
        generatePlaceholder()
      )}
    </div>
  );
};

export default ProductImage;
