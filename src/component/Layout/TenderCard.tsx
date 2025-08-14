import React, { useState } from 'react';
import { Calendar, MapPin, Tag, Lock, Star, FileText, Eye, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Tender } from '../type/Tender';

interface TenderCardProps {
  tender: Tender;
  isSubscribed: boolean;
  className?: string;
  onViewDetails: (tender: Tender) => void;
}

export function TenderCard({ tender, isSubscribed, className = '', onViewDetails }: TenderCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const canViewDates = isSubscribed || tender.type === 'FREE';
  const isExpired = new Date(tender.biddingClosed) < new Date();
  const daysLeft = Math.ceil((new Date(tender.biddingClosed).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited);
    // Optionally, add logic to save favorite state to a backend or local storage
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    hover: { scale: 1.03, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className={`relative bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100/50 ${className}`}
      role="article"
      aria-labelledby={`tender-title-${tender.id}`}
    >
      {/* Gradient Hover Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-purple-50/30 to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="relative p-6 border-b border-gray-100/30">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <motion.span
              whileHover={{ scale: 1.1 }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-md ${
                tender.type === 'FREE'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
              }`}
            >
              {tender.type}
            </motion.span>
            {!isExpired && daysLeft <= 7 && (
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1, transition: { duration: 0.5, repeat: Infinity, repeatType: 'reverse' } }}
                className="px-4 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-xs font-semibold shadow-md"
              >
                {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
              </motion.span>
            )}
            {isExpired && (
              <span className="px-4 py-1.5 bg-gray-500/80 text-white rounded-full text-xs font-semibold shadow-md">
                Expired
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {tender.type === 'PAID' && !isSubscribed && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="p-2 bg-amber-100/80 rounded-full"
                title="Premium content locked"
              >
                <Lock className="w-5 h-5 text-amber-600" />
              </motion.div>
            )}
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavoriteToggle}
              className="p-2 rounded-full hover:bg-gray-100/50"
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                className={`w-5 h-5 ${isFavorited ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
                aria-hidden="true"
              />
            </motion.button>
          </div>
        </div>
{/* 
        <h3
          id={`tender-title-${tender.id}`}
          className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight"
        >
          {tender.title}
        </h3> */}

        {tender.description && (
          <p className="text-gray-600  mt-2 text-xl hover:text-red-500 line-clamp-3 leading-relaxed">
            {/* {tender.description} */}
          {tender.title}

          </p>
        )}
      </div>

      {/* Content */}
      <div className=" space-y-5">
        {/* Category and Region */}
        <div className="flex flex-wrap gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 bg-indigo-50/80 px-3 rounded-lg"
          >
            <Tag className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-800">
              {tender.category.name} • {tender.subcategory.name}
            </span>
          </motion.div>
          {tender.region && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-emerald-50/80 px-3  rounded-lg"
            >
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-800">{tender.region.name}</span>
            </motion.div>
          )}
        </div>

        {/* Dates */}
        {canViewDates ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-100/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-normal text-indigo-600 uppercase">Opening</span>
              </div>
              <div className="text-base font-light text-indigo-800">
                {formatDate(tender.biddingOpen)}
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-pink-50 to-red-50 p-4 rounded-lg border border-red-100/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-red-500" />
                <span className="text-xs font-normal text-red-600 uppercase">Closing</span>
              </div>
              <div className="text-base font-light text-red-800">
                {formatDate(tender.biddingClosed)}
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 p-5 rounded-lg text-center"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-3 bg-amber-100/80 rounded-full inline-block mb-3"
            >
              <Lock className="w-6 h-6 text-amber-600" />
            </motion.div>
            <h4 className="text-amber-800 text-base font-semibold mb-2">Premium Content</h4>
            <p className="text-amber-700 text-sm mb-3">
              Subscribe to unlock bidding dates and full details
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Subscribe Now
            </motion.button>
          </motion.div>
        )}

        {/* Tender Documents */}
        {tender.tenderDocs && tender.tenderDocs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50/80 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-800">Documents</span>
              <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs font-medium">
                {tender.tenderDocs.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tender.tenderDocs.slice(0, 3).map((doc) => (
                <motion.span
                  key={doc.id}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white px-3 py-1 rounded-lg text-xs text-gray-700 border border-gray-200 shadow-sm"
                >
                  {doc.name}
                </motion.span>
              ))}
              {tender.tenderDocs.length > 3 && (
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg text-xs font-medium">
                  +{tender.tenderDocs.length - 3} more
                </span>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 pt-0">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onViewDetails(tender)}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all"
          aria-label={`View details for ${tender.title}`}
        >
          <Eye className="w-4 h-4" />
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
}