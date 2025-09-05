import React, { useState, useEffect, useMemo } from "react";
import { Grid, List, Loader2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TenderCard } from "./TenderCard";
import type { Tender, Advertisement } from "../type/Tender";

interface TenderGridProps {
  tenders: Tender[];
  viewMode: "single" | "double";
  onViewModeChange: (mode: "single" | "double") => void;
  isSubscribed: boolean;
  isLoading: boolean;
  onViewTenderDetails: (tender: Tender) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  advertisements: Advertisement[];
}

export function TenderGrid({
  tenders,
  viewMode,
  onViewModeChange,
  isSubscribed,
  isLoading,
  onViewTenderDetails,
  onLoadMore,
  hasMore,
  advertisements,
}: TenderGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const baseUrl = "http://localhost:4000";

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile && viewMode !== "single") {
        onViewModeChange("single");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onViewModeChange, viewMode]);

  const normalizeImagePath = (path: string) => {
    return path.startsWith("/") ? path : `/${path}`;
  };

  const interleavedItems = useMemo(() => {
    console.log("TenderGrid: Rendering tenders:", tenders.map((t) => ({ id: t.id, title: t.title })));
    if (!isMobile || advertisements.length === 0) {
      return tenders.map((tender) => ({ type: "tender" as const, data: tender }));
    }

    const interleaved: Array<{ type: "tender" | "ad"; data: Tender | Advertisement }> = [];
    let adIndex = 0;

    tenders.forEach((tender, index) => {
      interleaved.push({ type: "tender", data: tender });
      if ((index + 1) % 3 === 0 && advertisements.length > 0) {
        const ad = advertisements[adIndex % advertisements.length];
        interleaved.push({ type: "ad", data: ad });
        adIndex++;
      }
    });

    return interleaved;
  }, [tenders, advertisements, isMobile]);

  const handleAdClick = (ad: Advertisement, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("TenderGrid: Advertisement clicked:", { id: ad.id, url: ad.url });
    window.open(ad.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-48 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl animate-pulse" />
            {!isMobile && (
              <div className="flex gap-3">
                <div className="h-12 w-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl animate-pulse" />
                <div className="h-12 w-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl animate-pulse" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold text-indigo-700">Loading Tenders</h3>
              <p className="text-indigo-600 text-sm">Fetching the latest opportunities...</p>
            </div>
          </div>
        </motion.div>
      )}

      {!isLoading && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div
            className="bg-white/80 backdrop-blur-md rounded-3xl p-5 shadow-sm border border-indigo-100/20"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-indigo-700">Explore Tenders</h2>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium text-indigo-600">{tenders.length}</span> opportunities available
                </p>
              </div>
              {!isMobile && (
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onViewModeChange("single")}
                    className={`p-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm border border-indigo-100/50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                      viewMode === "single"
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-600 hover:bg-indigo-50"
                    }`}
                    aria-label="Switch to list view"
                    title="List view"
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">List</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onViewModeChange("double")}
                    className={`p-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm border border-indigo-100/50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                      viewMode === "double"
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-600 hover:bg-indigo-50"
                    }`}
                    aria-label="Switch to grid view"
                    title="Grid view"
                  >
                    <Grid className="w-4 h-4" />
                    <span className="hidden sm:inline">Grid</span>
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>

          <AnimatePresence>
            {tenders.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl border border-indigo-100/20 shadow-sm"
                role="alert"
              >
                <Search className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-indigo-700 mb-2">No Tenders Found</h3>
                <p className="text-indigo-600 text-sm max-w-md mx-auto">
                  Adjust your filters or explore new categories to find opportunities.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {tenders.length > 0 && (
            <motion.div
              variants={containerVariants}
              className={`grid gap-5 ${
                !isMobile && viewMode === "double"
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1 max-w-3xl mx-auto"
              }`}
            >
              {interleavedItems.map((item, index) => {
                console.log("TenderGrid: Rendering item:", { type: item.type, id: item.data.id });
                return item.type === "tender" ? (
                  <motion.div
                    key={`tender-${item.data.id}`}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className="group"
                    style={{ zIndex: 10 }} // Ensure tenders are above ads
                  >
                    <TenderCard
                      tender={item.data as Tender}
                      isSubscribed={isSubscribed}
                      onViewDetails={(tender) => {
                        console.log("TenderGrid: onViewDetails called with:", {
                          id: tender.id,
                          title: tender.title,
                        });
                        onViewTenderDetails(tender);
                      }}
                      className="h-full"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={`ad-${(item.data as Advertisement).id}-${index}`}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className="group"
                    style={{ zIndex: 5 }} // Ensure ads are below tenders
                    onClick={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    <div
                      className="block h-full bg-white rounded-3xl shadow-md border border-indigo-100/20 overflow-hidden transition-all duration-300 group-hover:shadow-lg"
                      onClick={(e) => handleAdClick(item.data as Advertisement, e)}
                      onTouchStart={(e) => handleAdClick(item.data as Advertisement, e)}
                      role="link"
                      aria-label={`Sponsored advertisement ${(item.data as Advertisement).id}`}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-purple-50/20 to-pink-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        aria-hidden="true"
                      />
                      <img
                        src={`${baseUrl}${normalizeImagePath((item.data as Advertisement).image)}`}
                        alt={`Sponsored Advertisement ${(item.data as Advertisement).id}`}
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          console.error("TenderGrid: Ad image failed to load:", (item.data as Advertisement).image);
                          e.currentTarget.src = "/fallback-image.jpg";
                        }}
                      />
                      <div className="p-4">
                        <p className="text-xs font-medium text-indigo-600">Sponsored Content</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {tenders.length > 0 && hasMore && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center pt-6"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 4px 16px rgba(79,70,229,0.2)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  console.log("TenderGrid: Load More clicked");
                  onLoadMore();
                }}
                onTouchStart={() => {
                  console.log("TenderGrid: Load More touched");
                  onLoadMore();
                }}
                className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-sm flex items-center justify-center gap-2 mx-auto transition-all focus:outline-none focus:ring-2 focus:ring-indigo-300"
                aria-label="Load more tenders"
                disabled={isLoading}
              >
                <span>{isLoading ? "Loading..." : "Load More"}</span>
                {!isLoading && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}