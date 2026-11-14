import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from '../data/mockData';

const INITIAL_ACCOUNTS: UserProfile[] = [
  DEMO_USERS.customer,
  DEMO_USERS.professional,
  DEMO_USERS.supplier
];

interface UserContextType {
  currentUser: UserProfile | null;
  role: UserRole;
  accounts: UserProfile[];
  registerUser: (userData: Partial<UserProfile> & { role: UserRole; fullName: string; email: string; password?: string }) => Promise<void>;
  loginUser: (email: string, password?: string) => Promise<boolean>;
  switchUser: (user: UserProfile) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  isRegistered: boolean;
  openRegisterModal: boolean;
  setOpenRegisterModal: (open: boolean) => void;
  openLoginModal: boolean;
  setOpenLoginModal: (open: boolean) => void;
  selectedRoleForModal: UserRole;
  setSelectedRoleForModal: (role: UserRole) => void;
  refreshAccounts: () => Promise<void>;
  updateSubscriptionTier: (newTier: 'free' | 'pro' | 'premium') => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('buildwise_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        return INITIAL_ACCOUNTS;
      }
    }
    return INITIAL_ACCOUNTS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('buildwise_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_USERS.customer;
      }
    }
    return DEMO_USERS.customer;
  });

  const [openRegisterModal, setOpenRegisterModal] = useState<boolean>(false);
  const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
  const [selectedRoleForModal, setSelectedRoleForModal] = useState<UserRole>('customer');

  // Sync accounts to localStorage whenever accounts changes
  useEffect(() => {
    localStorage.setItem('buildwise_accounts', JSON.stringify(accounts));
  }, [accounts]);

  // Sync current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('buildwise_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('buildwise_user');
    }
  }, [currentUser]);

  // Fetch registered accounts from Supabase/Backend on mount
  const refreshAccounts = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/accounts');
      if (res.ok) {
        const serverAccounts = await res.json();
        if (Array.isArray(serverAccounts) && serverAccounts.length > 0) {
          const mapped: UserProfile[] = serverAccounts.map((a: any) => ({
            id: a.id || `user-${Date.now()}`,
            fullName: a.full_name,
            email: a.email,
            role: a.role as UserRole,
            phone: a.phone || '+91 98221 00000',
            companyName: a.company_name,
            businessName: a.business_name,
            professionalCategory: a.professional_category || 'contractor',
            city: a.city || 'Panaji',
            locationDistrict: a.district || 'North Goa',
            defaultLocation: a.default_location || `${a.city || 'Panaji'}, ${a.district || 'North Goa'}`,
            subscriptionTier: a.subscription_tier || 'free',
            isSponsored: a.is_sponsored || false,
            isVerified: a.is_verified ?? true,
            createdAt: a.created_at || new Date().toISOString()
          }));

          // Merge uniquely by email
          setAccounts(prev => {
            const emailMap = new Map<string, UserProfile>();
            INITIAL_ACCOUNTS.forEach(u => emailMap.set(u.email.toLowerCase(), u));
            prev.forEach(u => emailMap.set(u.email.toLowerCase(), u));
            mapped.forEach(u => emailMap.set(u.email.toLowerCase(), u));
            return Array.from(emailMap.values());
          });
        }
      }
    } catch {
      // Backend offline, fallback to local accounts
    }
  };

  useEffect(() => {
    refreshAccounts();
  }, []);

  const registerUser = async (userData: Partial<UserProfile> & { role: UserRole; fullName: string; email: string; password?: string }) => {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      phone: userData.phone || '+91 98221 00000',
      isVerified: true,
      createdAt: new Date().toISOString(),
      companyName: userData.role === 'professional' ? (userData.companyName || `${userData.fullName} Constructions`) : undefined,
      professionalCategory: userData.professionalCategory || 'contractor',
      experienceYears: userData.experienceYears || 5,
      city: userData.city || 'Panaji',
      locationDistrict: userData.locationDistrict || 'North Goa',
      leadCredits: userData.role === 'professional' ? 50 : undefined,
      averageRating: 5.0,
      reviewCount: 0,
      isAvailable: true,
      businessName: userData.role === 'supplier' ? (userData.businessName || `${userData.fullName} Building Supplies`) : undefined,
      warehouseLocation: userData.warehouseLocation || 'Margao Industrial Estate',
      defaultLocation: userData.defaultLocation || 'Goa',
      projectsCount: 0,
      subscriptionTier: userData.subscriptionTier || (userData.role === 'professional' ? 'pro' : 'free'),
      isSponsored: userData.role === 'professional' ? (userData.subscriptionTier === 'premium' || userData.subscriptionTier === 'pro') : false,
      ...userData,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role
    };

    // Save to Supabase user_accounts table via backend
    try {
      await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password || 'pass123',
          full_name: userData.fullName,
          role: userData.role,
          phone: userData.phone,
          company_name: newUser.companyName,
          business_name: newUser.businessName,
          professional_category: newUser.professionalCategory,
          city: newUser.city,
          district: newUser.locationDistrict,
          default_location: newUser.defaultLocation,
          subscription_tier: newUser.subscriptionTier,
          is_sponsored: newUser.isSponsored
        })
      });
    } catch (err) {
      console.warn('Backend user_account register fallback notice:', err);
    }

    // Add to local accounts list so it appears in switcher immediately
    setAccounts(prev => {
      const filtered = prev.filter(a => a.email.toLowerCase() !== newUser.email.toLowerCase());
      return [newUser, ...filtered];
    });

    setCurrentUser(newUser);
    setOpenRegisterModal(false);
  };

  const loginUser = async (email: string, password?: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();

    // Try backend / Supabase first
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: password || 'pass123' })
      });

      if (res.ok) {
        const data = await res.json();
        const profile: UserProfile = {
          id: data.id,
          fullName: data.full_name,
          email: data.email,
          role: data.role as UserRole,
          phone: data.phone || '+91 98221 00000',
          companyName: data.company_name,
          businessName: data.business_name,
          professionalCategory: data.professional_category,
          city: data.city || 'Panaji',
          locationDistrict: data.district || 'North Goa',
          defaultLocation: data.default_location || 'Goa',
          subscriptionTier: data.subscription_tier || 'free',
          isSponsored: data.is_sponsored || false,
          isVerified: true,
          createdAt: data.created_at || new Date().toISOString()
        };

        setCurrentUser(profile);
        setAccounts(prev => {
          const filtered = prev.filter(a => a.email.toLowerCase() !== profile.email.toLowerCase());
          return [profile, ...filtered];
        });
        setOpenLoginModal(false);
        return true;
      }
    } catch {
      // Local fallback
    }

    // Fallback: check existing accounts in state
    const existing = accounts.find(a => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      setCurrentUser(existing);
      setOpenLoginModal(false);
      return true;
    }

    // Frictionless hackathon sign-in: create account on the fly
    const namePrefix = cleanEmail.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());
    const autoUser: UserProfile = {
      id: `user-${Date.now()}`,
      fullName: namePrefix,
      email: cleanEmail,
      role: 'customer',
      phone: '+91 98221 00000',
      city: 'Panaji',
      locationDistrict: 'North Goa',
      defaultLocation: 'Panaji, North Goa',
      subscriptionTier: 'free',
      isSponsored: false,
      isVerified: true,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(autoUser);
    setAccounts(prev => [autoUser, ...prev]);
    setOpenLoginModal(false);
    return true;
  };

  const switchUser = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const switchRole = (role: UserRole) => {
    // Look for matching user in existing registered accounts first
    const match = accounts.find(a => a.role === role);
    if (match) {
      setCurrentUser(match);
      return;
    }
    const demo = DEMO_USERS[role];
    if (demo) {
      setCurrentUser(demo);
    }
  };

  const updateSubscriptionTier = async (newTier: 'free' | 'pro' | 'premium') => {
    if (!currentUser) return;
    const isSponsored = newTier === 'premium' || newTier === 'pro';
    const updatedUser: UserProfile = {
      ...currentUser,
      subscriptionTier: newTier,
      isSponsored
    };

    setCurrentUser(updatedUser);

    setAccounts(prev =>
      prev.map(a =>
        a.email.toLowerCase() === currentUser.email.toLowerCase()
          ? { ...a, subscriptionTier: newTier, isSponsored }
          : a
      )
    );

    try {
      await fetch('http://localhost:8000/api/v1/auth/update-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          subscription_tier: newTier,
          role: currentUser.role
        })
      });
    } catch (err) {
      console.warn('Backend update-tier notice:', err);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || 'customer',
        accounts,
        registerUser,
        loginUser,
        switchUser,
        switchRole,
        logout,
        isRegistered: !!currentUser,
        openRegisterModal,
        setOpenRegisterModal,
        openLoginModal,
        setOpenLoginModal,
        selectedRoleForModal,
        setSelectedRoleForModal,
        refreshAccounts,
        updateSubscriptionTier,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
