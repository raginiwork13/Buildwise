export type UserRole = 'customer' | 'professional' | 'supplier';

export type ProfessionalCategory = 
  | 'contractor' 
  | 'architect' 
  | 'civil_engineer' 
  | 'interior_designer' 
  | 'structural_consultant';

export type BudgetTier = 'economy' | 'mid-range' | 'premium' | 'luxury';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  isVerified?: boolean;
  createdAt: string;

  // Professional specific
  companyName?: string;
  professionalCategory?: ProfessionalCategory;
  experienceYears?: number;
  licenseNumber?: string;
  gstin?: string;
  city?: string;
  locationDistrict?: string;
  serviceRegions?: string[];
  budgetTier?: BudgetTier;
  bio?: string;
  averageRating?: number;
  reviewCount?: number;
  leadCredits?: number;
  isAvailable?: boolean;
  subscriptionTier?: 'free' | 'pro' | 'premium';
  isSponsored?: boolean;

  // Supplier specific
  businessName?: string;
  warehouseLocation?: string;
  suppliedCategories?: string[];
  minOrderValue?: number;

  // Customer specific
  defaultLocation?: string;
  projectsCount?: number;
}

export interface FeaturedProfessional {
  id: string;
  name: string;
  companyName: string;
  category: ProfessionalCategory;
  categoryLabel: string;
  experienceYears: number;
  location: string;
  district: string;
  rating: number;
  reviewCount: number;
  completedProjects: number;
  specialization: string;
  startingRatePerSqft: number;
  verified: boolean;
  avatar: string;
  image: string;
}

export interface MaterialCategoryItem {
  id: string;
  name: string;
  category: string;
  supplierName: string;
  location: string;
  unitPrice: string;
  unit: string;
  inStock: boolean;
  image: string;
}

