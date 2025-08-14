// Prisma-compatible types
export type UserRole = 'SUPERUSER' | 'ADMIN' | 'CUSTOMER' | 'DATAENTRY';
export type PRICETYPE = 'FREE' | 'PAID';
export type PRIMUIMETYPE = 'TENDER' | 'THREEMONTHLY' | 'SIXMONTHLY' | 'YEARLY';
export type NotificationPreference = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'DAILY';

export interface SystemUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo?: string;
  role: UserRole;
  password: string;
  type: string;
  createdAt: Date;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  password: string;
  isSubscribed: boolean;
  endDate?: Date;
  type: string;
  createdAt: Date;
}

export interface Category {
  id: number;
  name: string;
  createdAt: Date;
  createdBy?: number;
}

export interface Subcategory {
  id: number;
  name: string;
  createdBy?: number;
  createdAt: Date;
  categoryId: number;
}

export interface Region {
  id: number;
  name: string;
  createdAt: Date;
}

export interface TenderDoc {
  id: number;
  name: string;
  title: string;
  file: string;
  createdAt: Date;
  tenderId: number;
  price?: number;
  type: PRICETYPE;
}

export interface BiddingDoc {
  id: number;
  title: string;
  description?: string;
  company: string;
  file: string;
  price?: number;
  tenderId: number;
  type: PRICETYPE;
}

export interface Tender {
  id: number;
  title: string;
  description?: string;
  biddingOpen: Date;
  biddingClosed: Date;
  categoryId: number;
  category: Category;
  subcategoryId: number;
  subcategory: Subcategory;
  regionId?: number;
  region?: Region;
  postedById?: number;
  postedBy?: SystemUser;
  approvedById?: number;
  approvedBy?: SystemUser;
  approvedAt?: Date;
  type: PRICETYPE;
  tenderDocs: TenderDoc[];
  biddingDocs: BiddingDoc[];
}