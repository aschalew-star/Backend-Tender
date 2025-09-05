import React, { useState } from "react";
import { Calendar, MapPin, Tag, Lock, Star, FileText, Eye } from "lucide-react";
import { motion } from "framer-motion";
import type { Tender } from "../type/Tender";

interface TenderCardProps {
  tender: Tender;
  isSubscribed: boolean;
  className?: string;
  onViewDetails: (tender: Tender) => void;
}

export function TenderCard({ tender, isSubscribed, className = "", onViewDetails }: TenderCardProps) {
  const [isFavorited, setIsFavorited] = useState(() => {
    return JSON.parse(localStorage.getItem(`favorite_${tender.id}`) || "false");
  });

  const canViewDates = isSubscribed || tender.type === "FREE";
  const biddingClosedDate = tender.biddingClosed ? new Date(tender.biddingClosed) : null;
  const isExpired = biddingClosedDate ? biddingClosedDate < new Date() : false;
  const daysLeft = biddingClosedDate
    ? Math.ceil((biddingClosedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent default touch behavior
    const newFavoriteState = !isFavorited;
    setIsFavorited(newFavoriteState);
    localStorage.setItem(`favorite_${tender.id}`, JSON.stringify(newFavoriteState));
    console.log("TenderCard: Favorite toggled for tender:", { id: tender.id, title: tender.title });
  };

  const handleViewDetails = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent any default navigation
    console.log("TenderCard: View Details clicked for tender:", { id: tender.id, title: tender.title });
    onViewDetails(tender);
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    hover: { scale: 1.02, transition: { duration: 0.3 } },
  };

  if (!tender?.id) {
    console.error("TenderCard: Invalid tender data:", tender);
    return null;
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className={`relative bg-white rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-indigo-100/30 ${className}`}
      role="article"
      aria-labelledby={`tender-title-${tender.id}`}
      onClick={handleViewDetails} // Allow entire card to trigger details
      onTouchStart={handleViewDetails} // Handle touch events
      style={{ touchAction: "manipulation" }} // Improve touch responsiveness
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-purple-50/20 to-pink-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        aria-hidden="true"
      />

      <div className="p-6 border-b border-indigo-100/20">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                tender.type === "FREE"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
              role="status"
              aria-label={`Tender type: ${tender.type}`}
            >
              {tender.type}
            </motion.span>
            {!isExpired && daysLeft !== null && daysLeft <= 7 && (
              <motion.span
                initial={{ scale: 0.9 }}
                animate={{ scale: 1, transition: { duration: 0.5, repeat: Infinity, repeatType: "reverse" } }}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium shadow-sm"
                role="status"
                aria-label={`${daysLeft} ${daysLeft === 1 ? "day" : "days"} remaining`}
              >
                {daysLeft} {daysLeft === 1 ? "day" : "days"} left
              </motion.span>
            )}
            {isExpired && (
              <span
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium shadow-sm"
                aria-label="Tender expired"
              >
                Expired
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {tender.type === "PAID" && !isSubscribed && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-1.5 bg-amber-50 rounded-full"
                title="Premium content locked"
                aria-label="Premium content locked"
              >
                <Lock className="w-4 h-4 text-amber-600" />
              </motion.div>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavoriteToggle}
              onTouchStart={handleFavoriteToggle}
              className="p-1.5 rounded-full hover:bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              aria-label={isFavorited ? `Remove ${tender.title} from favorites` : `Add ${tender.title} to favorites`}
            >
              <Star
                className={`w-4 h-4 ${isFavorited ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`}
                aria-hidden="true"
              />
            </motion.button>
          </div>
        </div>
        <h3
          id={`tender-title-${tender.id}`}
          className="text-2xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight"
        >
          {tender.title}
        </h3>
        {tender.description && (
          <p className="text-gray-600 mt-2 text-sm line-clamp-3 leading-relaxed">
            {tender.description}
          </p>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-lg"
            aria-label={`Category: ${tender.category.name}, Subcategory: ${tender.subcategory?.name || "None"}`}
          >
            <Tag className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-xs font-medium text-indigo-700">
              {tender.category.name} • {tender.subcategory?.name || "None"}
            </span>
          </motion.div>
          {tender.region && (
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg"
              aria-label={`Region: ${tender.region.name}`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-700">{tender.region.name}</span>
            </motion.div>
          )}
        </div>

        {canViewDates ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/20"
              aria-label={`Bidding opens: ${formatDate(tender.biddingOpen)}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs font-medium text-indigo-600 uppercase">Opening</span>
              </div>
              <div className="text-sm font-medium text-indigo-800">{formatDate(tender.biddingOpen)}</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-red-50/50 p-3 rounded-lg border border-red-100/20"
              aria-label={`Bidding closes: ${formatDate(tender.biddingClosed)}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs font-medium text-red-600 uppercase">Closing</span>
              </div>
              <div className="text-sm font-medium text-red-800">{formatDate(tender.biddingClosed)}</div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50/50 border border-amber-100/20 p-4 rounded-lg text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-2 bg-amber-100/50 rounded-full inline-block mb-2"
            >
              <Lock className="w-5 h-5 text-amber-600" />
            </motion.div>
            <h4 className="text-amber-800 text-sm font-semibold mb-1">Premium Content</h4>
            <p className="text-amber-700 text-xs mb-3">Subscribe to unlock bidding dates and full details</p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log("TenderCard: Navigate to /subscribe");
                // Replace with actual navigation, e.g., navigate("/subscribe")
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log("TenderCard: Navigate to /subscribe (touch)");
                // Replace with actual navigation
              }}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-amber-300"
              aria-label="Subscribe to unlock premium content"
            >
              Subscribe Now
            </motion.button>
          </motion.div>
        )}

        {tender.tenderDocs && Array.isArray(tender.tenderDocs) && tender.tenderDocs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50/50 rounded-lg p-3 border border-gray-100/20"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <FileText className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-xs font-semibold text-gray-700">Documents</span>
              <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full text-xs font-medium">
                {tender.tenderDocs.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tender.tenderDocs.slice(0, 3).map((doc, index) => (
                <motion.span
                  key={doc.id || `doc-${index}`}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white px-2.5 py-1 rounded-lg text-xs text-gray-600 border border-gray-100 shadow-sm"
                  aria-label={`Document: ${doc.name || doc.title || "Unnamed document"}`}
                >
                  {doc.name || doc.title || "Unnamed document"}
                </motion.span>
              ))}
              {tender.tenderDocs.length > 3 && (
                <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                  +{tender.tenderDocs.length - 3} more
                </span>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-6 pt-0">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleViewDetails}
          onTouchStart={handleViewDetails}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-300 z-10"
          aria-label={`View details for ${tender.title}`}
        >
          <Eye className="w-4 h-4" />
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
}