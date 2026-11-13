import type { FeaturedProfessional, MaterialCategoryItem, UserProfile } from '../types';

export const DEMO_USERS: Record<string, UserProfile> = {
  customer: {
    id: 'demo-cust-1',
    fullName: 'Rahul Naik',
    email: 'rahul.naik@example.com',
    phone: '+91 98221 45091',
    role: 'customer',
    defaultLocation: 'Margao, South Goa',
    projectsCount: 2,
    isVerified: true,
    createdAt: '2026-01-15'
  },
  professional: {
    id: 'demo-prof-1',
    fullName: 'Carlos Fernandes',
    companyName: 'Fernandes & Sons Civil Construction',
    professionalCategory: 'contractor',
    email: 'carlos@fernandesconstruct.in',
    phone: '+91 94220 88210',
    role: 'professional',
    experienceYears: 14,
    licenseNumber: 'GOA-PWD-CLASS1-2018',
    gstin: '30AAACF1234K1Z5',
    city: 'Panaji',
    locationDistrict: 'North Goa',
    serviceRegions: ['North Goa', 'South Goa'],
    budgetTier: 'mid-range',
    averageRating: 4.88,
    reviewCount: 34,
    leadCredits: 120,
    isAvailable: true,
    isVerified: true,
    subscriptionTier: 'premium',
    isSponsored: true,
    bio: 'Specialists in Goan villas, RCC framed structures, and traditional Portuguese restorations across Goa.',
    createdAt: '2025-06-10'
  },
  supplier: {
    id: 'demo-supp-1',
    fullName: 'Sunil Silva',
    businessName: 'Mandovi Building Solutions & Steel Yard',
    email: 'mandovi.supplies@gmail.com',
    phone: '+91 98900 12345',
    role: 'supplier',
    warehouseLocation: 'Verna Industrial Estate, South Goa',
    suppliedCategories: ['Cement', 'TMT Steel', 'Sand & Laterite', 'Vitrified Tiles'],
    minOrderValue: 25000,
    isVerified: true,
    createdAt: '2025-08-20'
  }
};

export const FEATURED_PROFESSIONALS: FeaturedProfessional[] = [
  {
    id: 'pro-1',
    name: 'Carlos Fernandes',
    companyName: 'Fernandes & Sons Civil Construction',
    category: 'contractor',
    categoryLabel: 'General Contractor',
    experienceYears: 14,
    location: 'Panaji, North Goa',
    district: 'North Goa',
    rating: 4.9,
    reviewCount: 38,
    completedProjects: 52,
    specialization: 'Luxury Coastal Villas & Portuguese Heritage Restorations',
    startingRatePerSqft: 2150,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pro-2',
    name: 'Ar. Ananya Deshmukh',
    companyName: 'Atelier Goa Architecture',
    category: 'architect',
    categoryLabel: 'Architect & Planner',
    experienceYears: 9,
    location: 'Porvorim, North Goa',
    district: 'North Goa',
    rating: 4.95,
    reviewCount: 27,
    completedProjects: 31,
    specialization: 'Biophilic Tropical Homes, Coastal Regulations (CRZ) Compliance',
    startingRatePerSqft: 180,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pro-3',
    name: 'Er. Rajesh Kerkar',
    companyName: 'Kerkar Structural & Civil Engineering',
    category: 'civil_engineer',
    categoryLabel: 'Civil / Structural Engineer',
    experienceYears: 18,
    location: 'Margao, South Goa',
    district: 'South Goa',
    rating: 4.82,
    reviewCount: 45,
    completedProjects: 86,
    specialization: 'Seismic RCC Design, Soil Stabilization, Foundation Engineering',
    startingRatePerSqft: 1950,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pro-4',
    name: 'Meera Shenoy',
    companyName: 'Studio Terra Goa Interiors',
    category: 'interior_designer',
    categoryLabel: 'Interior Designer',
    experienceYears: 7,
    location: 'Assagao, North Goa',
    district: 'North Goa',
    rating: 4.88,
    reviewCount: 22,
    completedProjects: 29,
    specialization: 'Boutique Resorts, Goan Modern Aesthetics & Modular Kitchens',
    startingRatePerSqft: 1400,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
  }
];

export const FEATURED_MATERIALS: MaterialCategoryItem[] = [
  {
    id: 'mat-1',
    name: 'UltraTech Weather Plus Cement (PPC)',
    category: 'Cement',
    supplierName: 'Mandovi Building Solutions',
    location: 'Verna Industrial Estate',
    unitPrice: '₹385',
    unit: 'per 50kg bag',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'mat-2',
    name: 'Tata Tiscon 550D TMT Steel Rebars (8mm - 25mm)',
    category: 'TMT Steel',
    supplierName: 'Goa Steel & Allied Corp',
    location: 'Margao Yard',
    unitPrice: '₹62,500',
    unit: 'per metric ton',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'mat-3',
    name: 'Goan Laterite Dressed Cut Stones (Standard 14"x8")',
    category: 'Stones & Masonry',
    supplierName: 'Sanvordem Quarry Direct',
    location: 'Sanvordem, South Goa',
    unitPrice: '₹42',
    unit: 'per piece',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'mat-4',
    name: 'Kajaria Vitrified Floor Tiles (800x1200mm Matte)',
    category: 'Tiles & Sanitary',
    supplierName: 'Coastline Ceramics Panaji',
    location: 'Panaji',
    unitPrice: '₹68',
    unit: 'per sq.ft',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80'
  }
];
