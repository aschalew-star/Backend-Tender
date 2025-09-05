import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const adVariants = {
  enter: { opacity: 0, x: 50 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

const AdvertisementSidebar = ({ advertisements }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  // Normalize image path by removing '/Uploads'
  const normalizeImagePath = (path) => {
    if (!path) return '/fallback-image.jpg';
    return path.replace('/Uploads', '');
  };

  // Log advertisements and their full image URLs for debugging
  useEffect(() => {
    console.log('Advertisements:', advertisements);
    advertisements.forEach((ad, index) => {
      const fullImageUrl = `${baseUrl}${normalizeImagePath(ad.image)}`;
      console.log(`Ad ${index}:`, {
        id: ad.id,
        image: fullImageUrl,
        url: ad.url,
      });
    });
  }, [advertisements, baseUrl]);

  // Auto-rotate carousel
  useEffect(() => {
    if (!advertisements || advertisements.length === 0 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % advertisements.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [advertisements, isHovered]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + advertisements.length) % advertisements.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % advertisements.length);
  };

  const handleImageError = (url) => {
    const fullUrl = `${baseUrl}${normalizeImagePath(url)}`;
    console.error(`Image failed to load: ${fullUrl}`);
    setFailedImages((prev) => new Set(prev).add(url));
  };

  const handleAdClick = (ad) => {
    if (!ad?.url) return;
    if (ad.url.startsWith('http')) {
      window.open(ad.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = ad.url;
    }
  };

  if (!advertisements || advertisements.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center shadow-md border border-gray-100/50"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-4xl mb-3"
        >
          📢
        </motion.div>
        <p className="text-gray-600 text-sm font-medium">No advertisements available</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full space-y-3 font-sans">
      {/* Advertisement Cards */}
      <div className="space-y-3">
        {/* Main Carousel */}
        <div
          className="relative group cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => handleAdClick(advertisements[currentIndex])}
          role="button"
          tabIndex={0}
          aria-label={`View advertisement ${currentIndex + 1}`}
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-100/30"
          >
            <div className="relative h-40 w-full overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  src={
                    failedImages.has(advertisements[currentIndex]?.image)
                      ? '/fallback-image.jpg'
                      : `${baseUrl}${normalizeImagePath(advertisements[currentIndex]?.image)}`
                  }
                  alt={`Advertisement ${currentIndex + 1}`}
                  variants={adVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(advertisements[currentIndex]?.image)}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </motion.div>

          {/* Navigation Arrows */}
          {advertisements.length > 1 && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Previous ad"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Next ad"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </motion.button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {advertisements.length > 1 && (
          <div className="flex justify-center gap-2">
            {advertisements.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentIndex(index)}
                animate={{
                  scale: index === currentIndex ? 1.3 : 1,
                  opacity: index === currentIndex ? 1 : 0.5,
                }}
                className="w-2.5 h-2.5 bg-indigo-600 rounded-full transition-all duration-300"
                aria-label={`Go to ad ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Smaller Ads */}
        <AnimatePresence>
          {advertisements.slice(1, 4).map((ad, index) => (
            !failedImages.has(ad.image) && (
              <motion.div
                key={ad.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-100/30 group"
                onClick={() => handleAdClick(ad)}
                role="button"
                tabIndex={0}
                aria-label={`View advertisement ${index + 2}`}
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <img
                    src={`${baseUrl}${normalizeImagePath(ad.image)}`}
                    alt={`Advertisement ${index + 2}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={() => handleImageError(ad.image)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdvertisementSidebar;