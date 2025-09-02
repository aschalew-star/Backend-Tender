"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterSidebar } from "../component/Layout/FilterSidebar";
import { TenderGrid } from "../component/Layout/TenderGrid";
import AdvertisementSidebar from "../component/Layout/AdvertismentSidebar";
import Navbar from "../component/Layout/Navbar";

// Define data types as they would be received from the backend
type TenderDoc = {
  id: number;
  name?: string;
  title: string;
  file?: string;
  price?: number;
  type: "FREE" | "PAID";
  createdAt: string;
  tenderId: number;
};

type Subcategory = {
  id: number;
  name: string;
  categoryId: number;
};

type Category = {
  id: number;
  name: string;
  subcategories: Subcategory[];
};

type Region = {
  id: number;
  name: string;
};

type Advertisement = {
  id: number;
  image: string;
  url: string;
};

type Tender = {
  id: number;
  title: string;
  description: string;
  biddingOpen: string;
  biddingClosed: string;
  type: "FREE" | "PAID";
  category: { id: number; name: string };
  subcategory?: { id: number; name: string };
  region?: { id: number; name: string };
  approvedAt: string;
  tenderDocs?: TenderDoc[];
};

// Replace with your actual backend API URL
const API_BASE_URL = "http://localhost:4000/api";

const AllTender: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"single" | "double">("double");
  const [isLoading, setIsLoading] = useState(true);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // You should make this configurable and match your backend's limit
  const itemsPerPage = 6;
  const isSubscribed = true;

  const [filters, setFilters] = useState({
    searchQuery: "",
    selectedRegion: "",
    selectedLanguage: "",
    publishDateFrom: "",
    publishDateTo: "",
    selectedCategory: "",
    selectedSubcategory: "",
    tenderType: "ALL",
  });

  // Function to fetch tenders based on current filters and page
  const fetchTenders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        // Map filters to backend query parameters
        ...(filters.searchQuery && { searchQuery: filters.searchQuery }),
        ...(filters.selectedRegion && { regionId: filters.selectedRegion }),
        ...(filters.selectedCategory && { categoryId: filters.selectedCategory }),
        ...(filters.selectedSubcategory && { subcategoryId: filters.selectedSubcategory }),
        ...(filters.tenderType !== "ALL" && { tenderType: filters.tenderType }),
        ...(filters.publishDateFrom && { publishDateFrom: filters.publishDateFrom }),
        ...(filters.publishDateTo && { publishDateTo: filters.publishDateTo }),
      }).toString();

      const response = await fetch(`${API_BASE_URL}/tenders?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tenders");
      }

      const data = await response.json();
      setTenders(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
      console.error("Error fetching tenders:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  // Function to fetch initial data for filter options (categories, regions, ads)
  const fetchInitialData = useCallback(async () => {
    try {
      // You'll need to create these endpoints in your backend
      const [categoriesRes, regionsRes, adsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/categories`),
        fetch(`${API_BASE_URL}/regions`),
        fetch(`${API_BASE_URL}/ads`),
      ]);

      const categoriesData = await categoriesRes.json();
      const regionsData = await regionsRes.json();
      const adsData = await adsRes.json();

      setCategories(categoriesData.data);
      setRegions(regionsData.data);
      setAdvertisements(adsData.data);
    } catch (err) {
      console.error("Failed to fetch initial data for filters:", err);
    }
  }, []);

  // Effect to fetch tenders whenever the page or filters change
  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  // Effect to fetch initial data once on component mount
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSubmitFilters = () => {
    // Reset page to 1 whenever filters are applied
    setCurrentPage(1);
    setSidebarOpen(false);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

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
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 pt-20">
        {/* Filter Sidebar (Left) */}
        <FilterSidebar
          sidebarOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          regions={regions}
          onSubmitFilters={handleSubmitFilters}
        />

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="md:hidden fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            >
              <motion.div
                className="fixed inset-y-0 left-0 w-3/4 bg-white shadow-xl z-50 p-6"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <FilterSidebar
                  sidebarOpen={true}
                  onClose={() => setSidebarOpen(false)}
                  filters={filters}
                  setFilters={setFilters}
                  categories={categories}
                  regions={regions}
                  onSubmitFilters={handleSubmitFilters}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content (Center) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden fixed bottom-8 right-8 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg flex items-center gap-2"
            aria-label="Toggle filter sidebar"
          >
            <Filter size={24} />
            {activeFilterCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full absolute -top-1 -right-1">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Filter Summary */}
          {activeFilterCount > 0 && (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">
                  <Filter size={20} />
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {activeFilterCount} Active Filter{activeFilterCount > 1 ? "s" : ""}
                </span>
              </div>
              <div className="mt-2 md:mt-0 flex items-center space-x-2">
                <button
                  onClick={handleClearAllFilters}
                  className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
                >
                  Clear All
                  <X size={12} className="inline-block ml-1" />
                </button>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 hidden md:block"
                  aria-label="Edit filters"
                >
                  Edit Filters
                </button>
              </div>
            </div>
          )}

          {/* Tender Grid */}
          <TenderGrid
            tenders={tenders}
            isLoading={isLoading}
            viewMode={viewMode}
            onLoadMore={handleLoadMore}
            hasMore={currentPage < totalPages}
            advertisements={advertisements}
          />
        </main>

        {/* Advertisement Sidebar (Right) */}
        <aside className="hidden lg:block w-96 flex-shrink-0 p-8 space-y-8 border-l border-gray-200">
          <div className="sticky top-20 space-y-8">
            <h2 className="text-xl font-bold text-gray-800">Featured Ads</h2>
            {advertisements.length > 0 ? (
              <AdvertisementSidebar advertisements={advertisements} />
            ) : (
              <div className="p-4 bg-gray-100 text-gray-500 rounded-lg text-center">
                No advertisements available
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AllTender;