"use client";

import { useState, useMemo, memo } from "react";

// Memoized FilterSidebar component
const MemoizedFilterSidebar = memo(function FilterSidebar({
  filters,
  onFilterChange,
  categories,
  regions,
  isOpen,
  onToggle,
  onSubmitFilters,
}) {
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    category: true,
    date: true,
    language: true,
  });

  const languages = ["English", "Amharic", "Afaan Oromoo"];
  const tenderTypes = ["ALL", "FREE", "PAID"];

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const activeFilterCount = useMemo(() => {
    let count = Object.values(filters).filter(
      (val) => val && val !== "ALL" && !languages.includes(val)
    ).length;
    if (filters.selectedLanguage && filters.selectedLanguage !== "") {
      count += 1;
    }
    return count;
  }, [filters]);

  const selectedCategory = useMemo(
    () => categories.find((cat) => cat.id.toString() === filters.selectedCategory),
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
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed  inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={onToggle}
          aria-label="Close filter sidebar"
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
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:sticky top-16 md:top-0 left-0 z-50 w-80 bg-gradient-to-b from-gray-50 to-gray-100 shadow-xl border-r border-gray-200/50 overflow-y-auto transition-transform duration300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ height: "calc(100vh - 4rem)" }}
        role="complementary"
        aria-label="Filter Sidebar"
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl blur opacity-20"></div>
              <div className="relative p-2.5 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1m-4 8H3m13 8H3" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 font-serif tracking-tight">Advanced Filters</h2>
              <p className="text-sm text-gray-600 font-medium">Refine your search with precision</p>
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
              className="w-full pl-11 pr-10 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white/90 text-gray-900 placeholder-gray-400 transition-all duration-200 shadow-sm hover:shadow-lg font-medium focus:shadow-lg"
              aria-label="Search tenders by name, title, or keywords"
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
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
                <option key={region.id} value={region.id.toString()}>
                  {region.name}
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
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedCategory && selectedCategory.subcategories.length > 0 && (
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
                      <option key={subcategory.id} value={subcategory.id.toString()}>
                        {subcategory.name}
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
                <button
                  key={type}
                  onClick={() => onFilterChange({ ...filters, tenderType: type })}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500/30 ${
                    filters.tenderType === type
                      ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/25"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                  aria-pressed={filters.tenderType === type}
                >
                  {type}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Action Buttons */}
          <div className="space-y-3 pt-6 border-t border-gray-200">
            <button
              onClick={onSubmitFilters}
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Apply filters"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Apply Filters
              {activeFilterCount > 0 && (
                <span className="bg-white text-teal-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                  {activeFilterCount}
                </span>
              )}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={handleResetFilters}
              className="w-full py-3.5 bg-gradient-to-r from-rose-50 to-red-100 text-red-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:bg-red-200/50 border border-red-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Reset filters"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

const FilterSection = ({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
  iconBg = "from-gray-50 to-gray-100",
  borderColor = "border-gray-200",
  focusColor = "focus:ring-gray-500/30 focus:border-gray-500",
}) => {
  return (
    <div className="space-y-3">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left focus:outline-none focus:ring-2 focus:ring-teal-500/30 rounded-xl p-2 -m-2 transition-all duration-200 hover:bg-gray-100/50"
        aria-expanded={isExpanded}
        aria-controls={`${title.toLowerCase().replace(/\s/g, "-")}-filter`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-gradient-to-br ${iconBg} rounded-lg hover:scale-105 transition-all duration-200 shadow-sm border border-white/50`}>
            {icon}
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 tracking-tight">{title}</h3>
            <p className="text-xs text-gray-600">Configure options</p>
          </div>
        </div>
        <div className={`p-1 rounded-md transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isExpanded && (
        <div id={`${title.toLowerCase().replace(/\s/g, "-")}-filter`} className="pl-1">
          {children}
        </div>
      )}
    </div>
  );
};

export const FilterSidebar = MemoizedFilterSidebar;