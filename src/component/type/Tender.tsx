export interface Tender {
  id: number;
  title: string;
  description?: string;
  biddingOpen: string;
  biddingClosed: string;
  type: 'FREE' | 'PAID';
  category: {
    id: number;
    name: string;
  };
  subcategory: {
    id: number;
    name: string;
  };
  region?: {
    id: number;
    name: string;
  };
  approvedAt?: string;
  tenderDocs?: TenderDoc[];
}

export interface TenderDoc {
  id: number;
  name: string;
  title: string;
  file: string;
  price?: number;
  type: 'FREE' | 'PAID';
  createdAt: string;
  tenderId: number;
}

export interface Category {
  id: number;
  name: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
}

export interface Region {
  id: number;
  name: string;
}

export interface FilterState {
  searchQuery: string;
  selectedRegion: string;
  selectedLanguage: string;
  publishDateFrom: string;
  publishDateTo: string;
  selectedCategory: string;
  selectedSubcategory: string;
  tenderType: string;
}

export interface Advertisement {
  id: number;
  title: string;
  image: string;
  link: string;
  company: string;
  description?: string;
}