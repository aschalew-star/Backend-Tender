"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Filter } from "lucide-react";
import { FilterSidebar } from "../component/Layout/FilterSidebar";
import { TenderGrid } from "../component/Layout/TenderGrid";
import AdvertisementSidebar from "../component/Layout/AdvertismentSidebar";
import Navbar from "../component/Layout/Navbar";
import { AxiosError } from "axios";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from "lodash";
import type { Tender, Category, Region, Advertisement } from "../type/Tender";

const API_BASE_URL = "http://localhost:4000/api";

const AllTender: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"single" | "double">("double");
  const [isLoading, setIsLoading] = useState(false);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 12;
  const adsPerPage = 3;
  const isSubscribed = true;

  const [filters, setFilters] = useState({
    searchQuery: "",
    selectedRegion: "",
    selectedLanguage: "",
    publishDateFrom: "",
    publishDateTo: "",
    selectedCategory: "",
    selectedSubcategory: "",
    tenderType: "ALL" as "ALL" | "FREE" | "PAID",
  });

  const fetchTenders = useCallback(
    async (page: number, retryCount = 0) => {
      if (page < 1 || (page > totalPages && totalPages > 0)) return;
      setIsLoading(true);
      setError(null);
      try {
        const params = {
          page,
          limit: itemsPerPage,
          ...(filters.searchQuery && { searchQuery: filters.searchQuery }),
          ...(filters.selectedRegion && { regionId: filters.selectedRegion }),
          ...(filters.selectedCategory && { categoryId: filters.selectedCategory }),
          ...(filters.selectedSubcategory && { subcategoryId: filters.selectedSubcategory }),
          ...(filters.tenderType !== "ALL" && { tenderType: filters.tenderType }),
          ...(filters.publishDateFrom && { publishDateFrom: filters.publishDateFrom }),
          ...(filters.publishDateTo && { publishDateTo: filters.publishDateTo }),
          ...(filters.selectedLanguage && { language: filters.selectedLanguage }),
        };

        const response = await axios.get(`${API_BASE_URL}/tender/all`, { params });
        const newTenders = response.data.data || [];
        console.log("AllTender: Fetched tenders:", newTenders.map((t: Tender) => ({ id: t.id, title: t.title })));
        setTenders(newTenders);
        setTotalPages(response.data.meta?.totalPages || 0);
        setTotalItems(response.data.meta?.totalItems || 0);
      } catch (err: unknown) {
        if (retryCount < 2) {
          setTimeout(() => fetchTenders(page, retryCount + 1), 1000);
          return;
        }
        const errorMessage =
          err instanceof AxiosError
            ? err.response?.data?.message || err.message
            : "An unknown error occurred.";
        setError(errorMessage);
        console.error("AllTender: Error fetching tenders:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, totalPages]
  );

  const fetchInitialData = useCallback(async () => {
    try {
      const [categoriesRes, regionsRes, adsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/catagory/all?page=1&limit=100`), // Fixed typo
        axios.get(`${API_BASE_URL}/region/all?page=1&limit=100`),
        axios.get(`${API_BASE_URL}/advertisement/all?page=1&limit=100`),
      ]);

      setCategories(categoriesRes.data.data || []);
      setRegions(regionsRes.data.data || []);
      setAdvertisements(adsRes.data.data || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.status === 404
            ? "API endpoint not found. Please check the server configuration."
            : err.response?.data?.message || err.message
          : "Failed to fetch initial data.";
      setError(errorMessage);
      console.error("AllTender: Failed to fetch initial data:", err);
    }
  }, []);

  useEffect(() => {
    fetchTenders(currentPage);
  }, [fetchTenders, currentPage]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const debouncedFetchTenders = useCallback(debounce((page: number) => fetchTenders(page), 500), [fetchTenders]);

  const handleSubmitFilters = () => {
    setCurrentPage(1);
    setSidebarOpen(false);
    debouncedFetchTenders(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleViewModeChange = (mode: "single" | "double") => {
    setViewMode(mode);
  };

  const handleViewTenderDetails = useCallback(
    (tender: Tender) => {
      console.log("AllTender: handleViewTenderDetails called with tender:", { id: tender.id, title: tender.title });
      if (!tender?.id) {
        console.error("AllTender: Invalid tender ID:", tender);
        setError("Invalid tender ID");
        return;
      }
      try {
        navigate(`/TenderDetailPage/${tender.id}`);
      } catch (err) {
        console.error("AllTender: Navigation error:", err);
        setError("Failed to navigate to tender details.");
      }
    },
    [navigate]
  );

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter((val) => val && val !== "ALL").length;
  }, [filters]);

  const handleClearAllFilters = () => {
    setFilters({
      searchQuery: "",
      selectedRegion: "",
      selectedLanguage: "",
      publishDateFrom: "",
      publishDateTo: "",
      selectedCategory: "",
      selectedSubcategory: "",
      tenderType: "ALL",
    });
    setCurrentPage(1);
    setSidebarOpen(false);
    debouncedFetchTenders(1);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  };

  const currentAdvertisements = useMemo(() => {
    if (advertisements.length === 0) return [];
    const shuffledAds = shuffleArray([...advertisements]);
    return shuffledAds.slice(0, adsPerPage);
  }, [advertisements]);

  const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }> = ({ currentPage, totalPages, onPageChange }) => {
    const maxVisiblePages = 5;
    const pageNumbers = useMemo(() => {
      const pages: (number | string)[] = [];
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }

      return pages;
    }, [currentPage, totalPages]);

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <motion.button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Previous
        </motion.button>
        {pageNumbers.map((page, index) => (
          <motion.button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={isLoading || typeof page !== "number"}
            className={`px-4 py-2 rounded-full ${
              page === currentPage
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                : typeof page === "number"
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-gray-50 text-gray-400 cursor-default"
            } disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-300`}
            whileHover={typeof page === "number" ? { scale: 1.05 } : {}}
            whileTap={typeof page === "number" ? { scale: 0.95 } : {}}
          >
            {page}
          </motion.button>
        ))}
        <motion.button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Next
        </motion.button>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 pt-20">
        <FilterSidebar
          filters={filters}
          onFilterChange={setFilters}
          categories={categories}
          regions={regions}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((prev) => !prev)}
          onSubmitFilters={handleSubmitFilters}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 relative">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10"
            >
              <div className="space-y-4 w-full max-w-md">
                <div className="flex items-center space-x-2 justify-center">
                  <svg className="animate-spin h-5 w-5 text-indigo-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-gray-600 font-medium">Loading tenders...</span>
                </div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <motion.button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden fixed bottom-8 right-8 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            aria-label="Toggle filter sidebar"
            animate={activeFilterCount > 0 ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={activeFilterCount > 0 ? { repeat: Infinity, duration: 1.5 } : {}}
          >
            <Filter size={24} />
            {activeFilterCount > 0 && (
              <motion.span
                className="bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full absolute -top-1 -right-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                {activeFilterCount}
              </motion.span>
            )}
          </motion.button>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-100 text-red-700 rounded-lg shadow-sm border border-red-200 flex items-center justify-between"
              role="alert"
            >
              <p className="text-sm font-medium">{error}</p>
              <button
                onClick={() => fetchTenders(currentPage)}
                className="text-xs font-semibold text-red-600 hover:text-red-800"
                aria-label="Retry fetching tenders"
              >
                Retry
              </button>
            </motion.div>
          )}
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">
                  <Filter size={20} />
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {activeFilterCount} Active Filter{activeFilterCount > 1 ? "s" : ""}
                </span>
              </div>
              <div className="mt-2 md:mt-0 flex items-center space-x-2">
                <motion.button
                  onClick={handleClearAllFilters}
                  className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear All
                  <svg className="w-3 h-3 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
                <motion.button
                  onClick={() => setSidebarOpen(true)}
                  className="text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 hidden md:block focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Edit filters"
                >
                  Edit Filters
                </motion.button>
              </div>
            </motion.div>
          )}
          <AnimatePresence>
            {!isLoading && tenders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-gray-100 text-gray-500 rounded-lg text-center"
              >
                No tenders available. Try adjusting your filters or navigating to another page.
              </motion.div>
            ) : (
              <TenderGrid
                tenders={tenders}
                isLoading={isLoading}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                onViewTenderDetails={handleViewTenderDetails}
                isSubscribed={isSubscribed}
                advertisements={currentAdvertisements}
                hasMore={currentPage < totalPages}
                onLoadMore={() => handlePageChange(currentPage + 1)}
                baseUrl={API_BASE_URL}
              />
            )}
          </AnimatePresence>
          {!isLoading && totalPages > 1 && (
            <div className="text-center text-sm text-gray-600 mb-4">
              Showing {tenders.length} of {totalItems} tenders
            </div>
          )}
          {!isLoading && totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </main>
        <aside className="hidden lg:block w-96 flex-shrink-0 p-8 space-y-8 border-l border-gray-200">
          <div className="sticky top-20 space-y-8">
            <h2 className="text-xl font-bold text-gray-800">Featured Ads</h2>
            <AnimatePresence>
              {currentAdvertisements.length > 0 ? (
                <AdvertisementSidebar advertisements={currentAdvertisements} />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-gray-100 text-gray-500 rounded-lg text-center"
                >
                  No advertisements available
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AllTender;