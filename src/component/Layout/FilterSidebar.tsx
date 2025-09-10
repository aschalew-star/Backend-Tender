"use client";

import { useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Memoized FilterSidebar component
const MemoizedFilterSidebar = memo(function FilterSidebar({
  filters,
  onFilterChange,
  categories,
  regions,
  isOpen,
  onToggle,
  onSubmitFilters,
}: {
  filters: {
    searchQuery: string;
    selectedRegion: string;
    selectedLanguage: string;
    publishDateFrom: string;
    publishDateTo: string;
    selectedCategory: string;
    selectedSubcategory: string;
    tenderType: "ALL" | "FREE" | "PAID";
  };
  onFilterChange: (filters: any) => void;
  categories: any[];
  regions: any[];
  isOpen: boolean;
  onToggle: () => void;
  onSubmitFilters: () => void;
}) {
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    category: true,
    date: true,
    language: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const languages = ["English", "Amharic", "Afaan Oromoo"];
  const tenderTypes = ["ALL", "FREE", "PAID"];

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Optimized active filter count
  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).reduce((count, [key, val]) => {
      return val && val !== "ALL" ? count + 1 : count;
    }, 0);
  }, [filters]);

  const selectedCategory = useMemo(
    () => categories.find((cat) => cat.id?.toString() === filters.selectedCategory),
    [categories, filters.selectedCategory]
  );

  const handleResetFilters = () => {
    onFilterChange({
      searchQuery: "",
      selectedRegion: "",
      selectedLanguage: "",
      publishDateFrom: "",
      publishDateTo: "",
      selectedCategory: "",
      selectedSubcategory: "",
      tenderType: "ALL",
    });
    onToggle(); // Close sidebar on mobile after reset
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmitFilters();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants for mobile only
  const sidebarVariants = {
    open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  };

  const overlayVariants = {
    open: { opacity: 0.3, transition: { duration: 0.3 } },
    closed: { opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
            onClick={onToggle}
            aria-label="Close filter sidebar"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onToggle()}
          >
            <button
              className="absolute top-6 right-6 p-2.5 bg-white/90 rounded-full shadow-lg border border-gray-200 hover:bg-gray-100 transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Close sidebar"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar: Conditional rendering for mobile vs md+ */}
      <div className="md:sticky md:top-20 md:w-80 md:flex md:flex-col md:bg-gradient-to-b md:from-gray-50 md:to-gray-100 md:shadow-xl md:border-r md:border-gray-200/50 md:overflow-y-auto md:h-[calc(100vh-5rem)]">
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-16 left-0 z-50 w-80 bg-gradient-to-b from-gray-50 to-gray-100 shadow-xl border-r border-gray-200/50 overflow-y-auto md:static md:z-auto md:transform-none md:opacity-100"
              style={{ height: "calc(100vh - 4rem)" }}
              role="complementary"
              aria-label="Filter Sidebar"
            >
              <SidebarContent
                filters={filters}
                onFilterChange={onFilterChange}
                categories={categories}
                regions={regions}
                activeFilterCount={activeFilterCount}
                selectedCategory={selectedCategory}
                languages={languages}
                tenderTypes={tenderTypes}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                handleSubmit={handleSubmit}
                handleResetFilters={handleResetFilters}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          ) : (
            <div
              className="hidden md:block md:w-80 md:bg-gradient-to-b md:from-gray-50 md:to-gray-100 md:shadow-xl md:border-r md:border-gray-200/50 md:overflow-y-auto md:h-[calc(100vh-5rem)]"
              role="complementary"
              aria-label="Filter Sidebar"
            >
              <SidebarContent
                filters={filters}
                onFilterChange={onFilterChange}
                categories={categories}
                regions={regions}
                activeFilterCount={activeFilterCount}
                selectedCategory={selectedCategory}
                languages={languages}
                tenderTypes={tenderTypes}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                handleSubmit={handleSubmit}
                handleResetFilters={handleResetFilters}
                isSubmitting={isSubmitting}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
});

// Extracted SidebarContent for reusability
const SidebarContent = ({
  filters,
  onFilterChange,
  categories,
  regions,
  activeFilterCount,
  selectedCategory,
  languages,
  tenderTypes,
  expandedSections,
  toggleSection,
  handleSubmit,
  handleResetFilters,
  isSubmitting,
}: {
  filters: any;
  onFilterChange: (filters: any) => void;
  categories: any[];
  regions: any[];
  activeFilterCount: number;
  selectedCategory: any;
  languages: string[];
  tenderTypes: string[];
  expandedSections: { [key: string]: boolean };
  toggleSection: (section: string) => void;
  handleSubmit: () => void;
  handleResetFilters: () => void;
  isSubmitting: boolean;
}) => (
  <div className="p-6 space-y-6">
    {/* Header */}
    <div className="relative flex items-center gap-3 mb-6">
      <motion.div className="relative" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl blur opacity-30 animate-pulse"></div>
        <div className="relative p-2.5 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1m-4 8H3m13 8H3" />
          </svg>
        </div>
      </motion.div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-serif tracking-tight">Advanced Filters</h2>
        <p className="text-sm text-gray-600 font-medium">Refine your search</p>
      </div>
    </div>

    {/* Filter Progress */}
    <div className="relative">
      <div className="text-sm font-medium text-gray-700 mb-2">
        Filters Applied: {activeFilterCount}/{Object.keys(filters).length}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <motion.div
          className="bg-gradient-to-r from-teal-500 to-cyan-600 h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(activeFilterCount / Object.keys(filters).length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>

    {/* Search Input */}
    <div className="relative group" role="search">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-500 transition-colors duration-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="Search tenders..."
        value={filters.searchQuery}
        onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
        className="w-full pl-11 pr-10 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white/90 text-gray-900 placeholder-gray-400 transition-all duration-200 shadow-sm hover:shadow-lg font-medium"
        aria-label="Search tenders by name, title, or keywords"
      />
      <motion.svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        whileHover={{ rotate: 20, scale: 1.2 }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </motion.svg>
    </div>

    {/* Filter Sections */}
    <FilterSection
      title="Location"
      icon={
        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z" />
        </svg>
      }
      isExpanded={expandedSections.location}
      onToggle={() => toggleSection("location")}
      iconBg="from-emerald-50 to-teal-50"
      borderColor="border-emerald-200"
      focusColor="focus:ring-emerald-500/30 focus:border-emerald-500"
    >
      <select
        value={filters.selectedRegion}
        onChange={(e) => onFilterChange({ ...filters, selectedRegion: e.target.value })}
        className="w-full p-3.5 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white/90 transition-all duration-200 shadow-sm hover:shadow-lg font-medium text-gray-900"
        aria-label="Select region"
      >
        <option value="">All Regions</option>
        {regions.map((region) => (
          <option key={region.id} value={region.id?.toString() || ""}>
            {region.name || "Unknown Region"}
          </option>
        ))}
      </select>
    </FilterSection>

    <FilterSection
      title="Language"
      icon={
        <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18M9 3v18m6-18v18m-9-6h12" />
        </svg>
      }
      isExpanded={expandedSections.language}
      onToggle={() => toggleSection("language")}
      iconBg="from-violet-50 to-purple-50"
      borderColor="border-violet-200"
      focusColor="focus:ring-violet-500/30 focus:border-violet-500"
    >
      <select
        value={filters.selectedLanguage}
        onChange={(e) => onFilterChange({ ...filters, selectedLanguage: e.target.value })}
        className="w-full p-3.5 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white/90 transition-all duration-200 shadow-sm hover:shadow-lg font-medium text-gray-900"
        aria-label="Select language"
      >
        <option value="">All Languages</option>
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </FilterSection>

    <FilterSection
      title="Date Range"
      icon={
        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      }
      isExpanded={expandedSections.date}
      onToggle={() => toggleSection("date")}
      iconBg="from-amber-50 to-orange-50"
      borderColor="border-amber-200"
      focusColor="focus:ring-amber-500/30 focus:border-amber-500"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="publishDateFrom">
            Start Date
          </label>
          <input
            type="date"
            id="publishDateFrom"
            value={filters.publishDateFrom}
            onChange={(e) => onFilterChange({ ...filters, publishDateFrom: e.target.value })}
            className="w-full p-3.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white/90 transition-all duration-200 shadow-sm hover:shadow-lg font-medium text-gray-900"
            aria-label="Start date"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="publishDateTo">
            End Date
          </label>
          <input
            type="date"
            id="publishDateTo"
            value={filters.publishDateTo}
            onChange={(e) => onFilterChange({ ...filters, publishDateTo: e.target.value })}
            className="w-full p-3.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white/90 transition-all duration-200 shadow-sm hover:shadow-lg font-medium text-gray-900"
            aria-label="End date"
          />
        </div>
      </div>
    </FilterSection>

    <FilterSection
      title="Category"
      icon={
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m-12 4h12m-12 0l4-4m-4 4l4 4" />
        </svg>
      }
      isExpanded={expandedSections.category}
      onToggle={() => toggleSection("category")}
      iconBg="from-blue-50 to-indigo-50"
      borderColor="border-blue-200"
      focusColor="focus:ring-blue-500/30 focus:border-blue-500"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="main-category">
            Main Category
          </label>
          <select
            id="main-category"
            value={filters.selectedCategory}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                selectedCategory: e.target.value,
                selectedSubcategory: "",
              })
            }
            className="w-full p-3.5 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white/90 transition-all duration-200 shadow-sm hover:shadow-lg font-medium text-gray-900"
            aria-label="Select category"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id?.toString() || ""}>
                {category.name || "Unknown Category"}
              </option>
            ))}
          </select>
        </div>
        {selectedCategory && selectedCategory.subcategories?.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="subcategory">
              Subcategory
            </label>
            <select
              id="subcategory"
              value={filters.selectedSubcategory}
              onChange={(e) => onFilterChange({ ...filters, selectedSubcategory: e.target.value })}
              className="w-full p-3.5 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 transition-all duration-200 shadow-sm hover:shadow-lg font-medium text-gray-900"
              aria-label="Select subcategory"
            >
              <option value="">All Subcategories</option>
              {selectedCategory.subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id?.toString() || ""}>
                  {subcategory.name || "Unknown Subcategory"}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </FilterSection>

    <FilterSection
      title="Tender Type"
      icon={
        <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 9.143 15.143 12l2.286 6.857L12 15.143 6.857 18l2.286-6.857L3 9.143l5.714 2.714L12 3z" />
        </svg>
      }
      isExpanded={true}
      onToggle={() => {}}
      iconBg="from-pink-50 to-rose-50"
      borderColor="border-pink-200"
      focusColor="focus:ring-pink-500/30 focus:border-pink-500"
    >
      <div className="grid grid-cols-3 gap-2">
        {tenderTypes.map((type) => (
          <motion.button
            key={type}
            onClick={() => onFilterChange({ ...filters, tenderType: type })}
            className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 ${
              filters.tenderType === type
                ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/25"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-pressed={filters.tenderType === type}
          >
            {type}
          </motion.button>
        ))}
      </div>
    </FilterSection>

    {/* Quick Filters */}
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700">Quick Filters</h3>
      <div className="flex gap-2">
        <motion.button
          onClick={() =>
            onFilterChange({
              ...filters,
              publishDateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              tenderType: "ALL",
            })
          }
          className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium hover:bg-indigo-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Recent Tenders
        </motion.button>
        <motion.button
          onClick={() => onFilterChange({ ...filters, selectedRegion: regions[0]?.id?.toString() || "" })}
          className="px-3 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium hover:bg-teal-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Local Tenders
        </motion.button>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="space-y-3 pt-6 border-t border-gray-200">
      <motion.button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
          isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:shadow-xl hover:scale-105"
        }`}
        whileHover={!isSubmitting ? { scale: 1.05 } : {}}
        whileTap={!isSubmitting ? { scale: 0.95 } : {}}
        aria-label="Apply filters"
      >
        {isSubmitting ? (
          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Apply Filters
            {activeFilterCount > 0 && (
              <motion.span
                className="bg-white text-teal-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                {activeFilterCount}
              </motion.span>
            )}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </motion.button>
      <motion.button
        onClick={handleResetFilters}
        className="w-full py-3.5 bg-gradient-to-r from-rose-50 to-red-100 text-red-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:bg-red-200/50 border border-red-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Reset filters"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset Filters
      </motion.button>
    </div>
  </div>
);

const FilterSection = ({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
  iconBg = "from-gray-50 to-gray-100",
  borderColor = "border-gray-200",
  focusColor = "focus:ring-gray-500/30 focus:border-gray-500",
}: {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  iconBg?: string;
  borderColor?: string;
  focusColor?: string;
}) => {
  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left focus:outline-none focus:ring-2 focus:ring-teal-500/30 rounded-xl p-2 -m-2 transition-all duration-200 hover:bg-gray-100/50"
        aria-expanded={isExpanded}
        aria-controls={`${title.toLowerCase().replace(/\s/g, "-")}-filter`}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className={`p-2 bg-gradient-to-br ${iconBg} rounded-lg shadow-sm border border-white/50`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {icon}
          </motion.div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 tracking-tight">{title}</h3>
            <p className="text-xs text-gray-600">Configure options</p>
          </div>
        </div>
        <motion.div
          className="p-1 rounded-md"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id={`${title.toLowerCase().replace(/\s/g, "-")}-filter`}
            className="pl-1"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const FilterSidebar = MemoizedFilterSidebar;