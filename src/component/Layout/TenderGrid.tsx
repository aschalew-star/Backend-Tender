import React from "react";
import { Grid, List, Loader2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TenderCard } from "./TenderCard";
import type { Tender } from "../type/Tender";

interface TenderGridProps {
  tenders: Tender[];
  viewMode: "single" | "double";
  onViewModeChange: (mode: "single" | "double") => void;
  isSubscribed: boolean;
  isLoading: boolean;
  onViewTenderDetails: (tender: Tender) => void;
  onLoadMore: () => void;
  hasMore: boolean;
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

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="space-y-8">
      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-10"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between">
            <div className="h-12 w-56 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-2xl animate-pulse" />
            <div className="flex gap-4">
              <div className="h-14 w-28 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-2xl animate-pulse" />
              <div className="h-14 w-28 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-2xl animate-pulse" />
            </div>
          </div>
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
              </motion.div>
              <h3 className="text-2xl font-bold text-indigo-800 mb-3">Discovering Opportunities</h3>
              <p className="text-indigo-600 text-lg">Curating the best tenders just for you...</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      {!isLoading && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div
            className="z-20 bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-indigo-200/50"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Explore Tenders
                </h2>
                <p className="text-base text-gray-600 mt-2 font-medium">
                  <span className="font-semibold text-indigo-600">{tenders.length}</span> exciting opportunities await
                </p>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#EEF2FF" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onViewModeChange("single")}
                  className={`p-3 rounded-xl transition-all duration-300 flex items-center gap-3 shadow-sm border border-indigo-200/50 ${
                    viewMode === "single"
                      ? "bg-indigo-100 text-indigo-600"
                      : "text-gray-600 hover:bg-indigo-100"
                  }`}
                  aria-label="Switch to list view"
                  title="List view"
                >
                  <List className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:inline">List</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#EEF2FF" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onViewModeChange("double")}
                  className={`p-3 rounded-xl transition-all duration-300 flex items-center gap-3 shadow-sm border border-indigo-200/50 ${
                    viewMode === "double"
                      ? "bg-indigo-100 text-indigo-600"
                      : "text-gray-600 hover:bg-indigo-100"
                  }`}
                  aria-label="Switch to grid view"
                  title="Grid view"
                >
                  <Grid className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:inline">Grid</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* No Results State */}
          <AnimatePresence>
            {tenders.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="text-center py-24 bg-white/95 backdrop-blur-xl rounded-2xl border border-indigo-200/50 shadow-lg"
                role="alert"
              >
                <Search className="w-20 h-20 text-indigo-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-indigo-800 mb-3">No Matches Found</h3>
                <p className="text-indigo-600 text-lg max-w-md mx-auto">
                  Try adjusting your filters or explore new categories for fresh opportunities.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tender Grid */}
          {tenders.length > 0 && (
            <motion.div
              variants={containerVariants}
              className={`grid gap-6 ${
                viewMode === "single"
                  ? "grid-cols-1 max-w-3xl mx-auto"
                  : "grid-cols-1 sm:grid-cols-2 "
              }`}
            >
              {tenders.map((tender) => (
                <motion.div
                  key={tender.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                  className="group"
                >
                  <TenderCard
                    tender={tender}
                    isSubscribed={isSubscribed}
                    onViewDetails={onViewTenderDetails}
                    className="h-full bg-white rounded-2xl shadow-md border border-indigo-200/50 overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:border-indigo-400"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Load More Button */}
          {tenders.length > 0 && hasMore && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center pt-8"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 6px 20px rgba(79,70,229,0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={onLoadMore}
                className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg flex items-center justify-center gap-3 mx-auto transition-all text-lg"
                aria-label="Load more tenders"
                disabled={isLoading}
              >
                <span>{isLoading ? "Loading..." : "Load More"}</span>
                {!isLoading && (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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