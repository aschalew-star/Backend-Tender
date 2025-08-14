"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterSidebar } from "../component/Layout/FilterSidebar";
import { TenderGrid } from "../component/Layout/TenderGrid";
import AdvertisementSidebar from "../component/Layout/AdvertismentSidebar";
import Navbar from "../component/Layout/Navbar";
import type {
  Tender,
  FilterState,
  Category,
  Region,
  Advertisement,
  TenderDoc,
} from "../component/type/Tender";

// Mock data (static)
const mockTenderDocs: TenderDoc[] = [
  {
    id: 1,
    name: "Technical_Specifications.pdf",
    title: "Technical Specifications",
    file: "/docs/tech_specs.pdf",
    price: 25.0,
    type: "PAID",
    createdAt: "2024-01-15T10:00:00Z",
    tenderId: 0,
  },
  {
    id: 2,
    name: "Bidding_Guidelines.pdf",
    title: "Bidding Guidelines",
    file: "/docs/bidding_guide.pdf",
    type: "FREE",
    createdAt: "2024-01-15T10:00:00Z",
    tenderId: 0,
  },
  {
    id: 3,
    name: "Project_Requirements.docx",
    title: "Project Requirements",
    file: "/docs/requirements.docx",
    price: 15.0,
    type: "PAID",
    createdAt: "2024-01-15T10:00:00Z",
    tenderId: 0,
  },
];

const mockTenders: Tender[] = [
  {
    id: 1,
    title: "Construction of Highway Bridge Phase 2",
    description:
      "Major infrastructure project for a new highway bridge connecting two major cities. Spanning 2.5 kilometers, it includes foundation work, structural engineering, and advanced materials.",
    biddingOpen: "2024-01-15T09:00:00Z",
    biddingClosed: "2024-03-15T17:00:00Z",
    type: "PAID",
    category: { id: 1, name: "Construction" },
    subcategory: { id: 1, name: "Infrastructure" },
    region: { id: 1, name: "Northern Region" },
    approvedAt: "2024-01-10T10:00:00Z",
    tenderDocs: mockTenderDocs,
  },
  {
    id: 2,
    title: "IT System Modernization Project",
    description:
      "Complete overhaul of legacy IT systems with cloud migration, security updates, and staff training programs.",
    biddingOpen: "2024-01-20T08:00:00Z",
    biddingClosed: "2024-02-28T16:00:00Z",
    type: "FREE",
    category: { id: 2, name: "Technology" },
    subcategory: { id: 3, name: "Software Development" },
    region: { id: 2, name: "Central Region" },
    approvedAt: "2024-01-18T14:00:00Z",
  },
  {
    id: 3,
    title: "Medical Equipment Procurement",
    description:
      "Procurement of advanced medical equipment for public hospitals, including MRI machines and CT scanners.",
    biddingOpen: "2024-02-01T09:00:00Z",
    biddingClosed: "2024-04-01T17:00:00Z",
    type: "PAID",
    category: { id: 3, name: "Healthcare" },
    subcategory: { id: 4, name: "Medical Equipment" },
    region: { id: 3, name: "Southern Region" },
    approvedAt: "2024-01-28T11:00:00Z",
    tenderDocs: mockTenderDocs,
  },
  {
    id: 4,
    title: "Green Energy Solar Farm Development",
    description:
      "Development of a 500MW solar farm with land preparation, panel installation, and grid connection.",
    biddingOpen: "2024-01-10T07:00:00Z",
    biddingClosed: "2024-05-10T18:00:00Z",
    type: "FREE",
    category: { id: 4, name: "Energy" },
    subcategory: { id: 5, name: "Renewable Energy" },
    region: { id: 4, name: "Western Region" },
    approvedAt: "2024-01-05T09:00:00Z",
    tenderDocs: mockTenderDocs.slice(1),
  },
  {
    id: 5,
    title: "Educational Technology Platform",
    description:
      "E-learning platform for K-12 education with interactive content and assessment tools.",
    biddingOpen: "2024-02-15T10:00:00Z",
    biddingClosed: "2024-03-30T15:00:00Z",
    type: "FREE",
    category: { id: 5, name: "Education" },
    subcategory: { id: 6, name: "E-Learning" },
    region: { id: 2, name: "Central Region" },
    approvedAt: "2024-02-10T13:00:00Z",
    tenderDocs: mockTenderDocs.slice(0, 1),
  },
  {
    id: 6,
    title: "Water Treatment Plant Upgrade",
    description:
      "Modernization of water treatment facilities with new filtration and monitoring systems.",
    biddingOpen: "2024-01-25T08:30:00Z",
    biddingClosed: "2024-04-25T16:30:00Z",
    type: "PAID",
    category: { id: 6, name: "Utilities" },
    subcategory: { id: 7, name: "Water Management" },
    region: { id: 1, name: "Northern Region" },
    approvedAt: "2024-01-22T10:30:00Z",
    tenderDocs: mockTenderDocs,
  },
];

const mockCategories: Category[] = [
  {
    id: 1,
    name: "Construction",
    subcategories: [
      { id: 1, name: "Infrastructure", categoryId: 1 },
      { id: 2, name: "Building", categoryId: 1 },
    ],
  },
  {
    id: 2,
    name: "Technology",
    subcategories: [
      { id: 3, name: "Software Development", categoryId: 2 },
      { id: 8, name: "Hardware", categoryId: 2 },
    ],
  },
  {
    id: 3,
    name: "Healthcare",
    subcategories: [
      { id: 4, name: "Medical Equipment", categoryId: 3 },
      { id: 9, name: "Pharmaceutical", categoryId: 3 },
    ],
  },
  {
    id: 4,
    name: "Energy",
    subcategories: [
      { id: 5, name: "Renewable Energy", categoryId: 4 },
      { id: 10, name: "Traditional Energy", categoryId: 4 },
    ],
  },
  {
    id: 5,
    name: "Education",
    subcategories: [
      { id: 6, name: "E-Learning", categoryId: 5 },
      { id: 11, name: "Infrastructure", categoryId: 5 },
    ],
  },
  {
    id: 6,
    name: "Utilities",
    subcategories: [
      { id: 7, name: "Water Management", categoryId: 6 },
      { id: 12, name: "Electricity", categoryId: 6 },
    ],
  },
];

const mockRegions: Region[] = [
  { id: 1, name: "Northern Region" },
  { id: 2, name: "Central Region" },
  { id: 3, name: "Southern Region" },
  { id: 4, name: "Western Region" },
  { id: 5, name: "Eastern Region" },
];

const mockAdvertisements: Advertisement[] = [
  {
    id: 1,
    image:
      "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800",
    url: "https://example.com/consulting",
  },
  {
    id: 2,
    image:
      "https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=800",
    url: "https://example.com/equipment",
  },
  {
    id: 3,
    image:
      "https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=800",
    url: "https://example.com/marketing",
  },
  {
    id: 4,
    image:
      "https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg?auto=compress&cs=tinysrgb&w=800",
    url: "https://example.com/finance",
  },
];

const AllTender: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"single" | "double">("double");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const isSubscribed = true;

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    selectedRegion: "",
    selectedLanguage: "",
    publishDateFrom: "",
    publishDateTo: "",
    selectedCategory: "",
    selectedSubcategory: "",
    tenderType: "ALL",
  });

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter tenders
  const filteredTenders = useMemo(() => {
    return mockTenders.filter((tender) => {
      const {
        searchQuery,
        selectedRegion,
        selectedLanguage,
        publishDateFrom,
        publishDateTo,
        selectedCategory,
        selectedSubcategory,
        tenderType,
      } = filters;
      if (
        searchQuery &&
        !tender.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !tender.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (selectedRegion && tender.region?.id.toString() !== selectedRegion) {
        return false;
      }
      if (
        selectedLanguage &&
        !tender.title.toLowerCase().includes(selectedLanguage.toLowerCase())
      ) {
        return false;
      }
      if (publishDateFrom && tender.approvedAt) {
        const publishDate = new Date(tender.approvedAt);
        const fromDate = new Date(publishDateFrom);
        if (publishDate < fromDate) return false;
      }
      if (publishDateTo && tender.approvedAt) {
        const publishDate = new Date(tender.approvedAt);
        const toDate = new Date(publishDateTo);
        toDate.setHours(23, 59, 59, 999);
        if (publishDate > toDate) return false;
      }
      if (
        selectedCategory &&
        tender.category.id.toString() !== selectedCategory
      ) {
        return false;
      }
      if (
        selectedSubcategory &&
        tender.subcategory?.id.toString() !== selectedSubcategory
      ) {
        return false;
      }
      if (tenderType !== "ALL" && tender.type !== tenderType) {
        return false;
      }
      return true;
    });
  }, [filters]);

  // Paginate tenders
  const paginatedTenders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTenders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTenders, currentPage]);

  const totalPages = Math.ceil(filteredTenders.length / itemsPerPage);

  const handleSubmitFilters = () => {
    setIsLoading(true);
    setCurrentPage(1);
    setTimeout(() => {
      console.log("Filters applied:", filters);
      setIsLoading(false);
      setSidebarOpen(false);
    }, 1000);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] pt-16 " >
        {/* Filter Sidebar (Left) */}
        <aside className="hidden md:block sticky top-16 w-64 lg:w-72 xl:w-80 h-[calc(100vh-4rem)] overflow-y-auto bg-gradient-to-b from-indigo-50 to-purple-50 shadow-xl border-r border-indigo-200/30 md:mp-5">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            categories={mockCategories}
            regions={mockRegions}
            isOpen={true}
            onToggle={() => {}}
            onSubmitFilters={handleSubmitFilters}
          />
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-80 max-w-[80vw] bg-gradient-to-b from-indigo-50 to-purple-50 shadow-2xl h-full overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <FilterSidebar
                  filters={filters}
                  onFilterChange={setFilters}
                  categories={mockCategories}
                  regions={mockRegions}
                  isOpen={sidebarOpen}
                  onToggle={() => setSidebarOpen(false)}
                  onSubmitFilters={handleSubmitFilters}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content (Center) */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="max-w-5xl mx-auto">
            {/* Mobile Filter Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(true)}
              className="md:hidden fixed bottom-8 right-8 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg flex items-center gap-2"
              aria-label="Toggle filter sidebar"
            >
              <Filter className="w-6 h-6" />
              {activeFilterCount > 0 && (
                <span className="bg-white text-indigo-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </motion.button>

            {/* Filter Summary */}
            {activeFilterCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white/90 backdrop-blur-md rounded-xl p-4 mb-6 shadow-md border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-indigo-700">
                    {activeFilterCount} Active Filter
                    {activeFilterCount > 1 ? "s" : ""}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearAllFilters}
                    className="text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100"
                    aria-label="Clear all filters"
                  >
                    Clear All
                  </motion.button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSidebarOpen(true)}
                  className="text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 hidden md:block"
                  aria-label="Edit filters"
                >
                  Edit Filters
                </motion.button>
              </motion.div>
            )}

            {/* Tender Grid */}
            <TenderGrid
              tenders={paginatedTenders}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              isSubscribed={isSubscribed}
              isLoading={isLoading}
              onViewTenderDetails={() => {}}
              onLoadMore={handleLoadMore}
              hasMore={currentPage < totalPages}
            />
          </div>
        </main>

        {/* Advertisement Sidebar (Right) */}
        <aside className="hidden lg:block sticky top-16 w-64 xl:w-72 h-[calc(100vh-4rem)] overflow-y-auto bg-white/90 backdrop-blur-md rounded-xl shadow-md border border-indigo-100 p-4">
          <h3 className="text-lg font-semibold text-indigo-800 mb-4">
            Featured Ads
          </h3>
          {mockAdvertisements.length > 0 ? (
            <AdvertisementSidebar advertisements={mockAdvertisements} />
          ) : (
            <p className="text-gray-500 text-center py-4">
              No advertisements available
            </p>
          )}
        </aside>
      </div>
    </div>
  );
};

export default AllTender;