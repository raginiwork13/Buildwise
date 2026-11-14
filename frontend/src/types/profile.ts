export type AvailabilityStatus = 'available' | 'limited_availability' | 'unavailable';
export type VerificationStatus = 'not_submitted' | 'pending' | 'under_review' | 'verified' | 'rejected';

export interface LocationItem {
  id?: string;
  location_name: string;
  district: string;
}

export interface ServiceItem {
  id?: string;
  service_name: string;
  description?: string;
  pricing_model: string;
  indicative_rate: number;
}

export interface PortfolioMediaItem {
  id?: string;
  media_type: 'image' | 'document' | 'floor_plan' | '3d_render';
  file_url: string;
  file_name: string;
  caption?: string;
  display_order: number;
}

export interface PortfolioProjectItem {
  id?: string;
  title: string;
  project_type: string;
  description: string;
  location: string;
  completion_year: number;
  project_area_sqft?: number;
  indicative_budget?: number;
  role: string;
  display_order: number;
  media: PortfolioMediaItem[];
}

export interface CertificationItem {
  id?: string;
  certification_name: string;
  issuing_authority: string;
  certificate_number?: string;
  issue_date: string;
  expiry_date?: string;
  document_url?: string;
  verification_status?: string;
}

export interface ProfessionalReviewItem {
  id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  project_reference?: string;
  moderation_status: string;
  is_verified_purchase: boolean;
  created_at?: string;
}

export interface ProfessionalProfileFull {
  id: string;
  full_name: string;
  company_name?: string;
  profile_photo_url?: string;
  company_logo_url?: string;
  category: string;
  email: string;
  phone: string;
  website?: string;
  bio?: string;
  experience_years: number;
  specialisations: string[];
  project_types_handled: string[];
  min_budget: number;
  max_budget: number;
  currency: string;
  availability_status: AvailabilityStatus;
  country: string;
  state: string;
  district: string;
  city: string;
  business_address?: string;
  is_published: boolean;
  profile_completion_pct: number;
  verification_status: VerificationStatus;
  services: ServiceItem[];
  locations: LocationItem[];
  portfolio_projects: PortfolioProjectItem[];
  certifications: CertificationItem[];
  reviews: ProfessionalReviewItem[];
  average_rating?: number;
  review_count: number;
  subscription_tier?: 'free' | 'pro' | 'premium';
  is_sponsored?: boolean;
}

// --- Supplier Types ---
export interface ProductMediaItem {
  id?: string;
  media_url: string;
  display_order: number;
}

export interface SupplierProductItem {
  id?: string;
  product_name: string;
  category: string;
  brand?: string;
  description: string;
  specifications?: string;
  unit_of_measurement: string;
  indicative_price: number;
  currency: string;
  in_stock: boolean;
  delivery_available: boolean;
  primary_image_url?: string;
  media?: ProductMediaItem[];
}

export interface SupplierProfileFull {
  id: string;
  company_name: string;
  logo_url?: string;
  description: string;
  business_email: string;
  phone: string;
  website?: string;
  business_address?: string;
  latitude?: number;
  longitude?: number;
  primary_location: string;
  delivery_locations: string[];
  is_published: boolean;
  profile_completion_pct: number;
  verification_status: VerificationStatus;
  categories: { id?: string; category_name: string }[];
  products: SupplierProductItem[];
}

// --- Verification Types ---
export interface VerificationSubmission {
  id: string;
  entity_type: 'professional' | 'supplier';
  entity_id: string;
  business_legal_name: string;
  registration_number?: string;
  tax_identifier_gstin?: string;
  id_proof_doc_url: string;
  business_proof_doc_url?: string;
  status: VerificationStatus;
  rejection_reason?: string;
  reviewer_notes?: string;
  submission_date?: string;
  reviewed_at?: string;
}

