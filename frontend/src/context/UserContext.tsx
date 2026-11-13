import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from '../data/mockData';

interface UserContextType {
  currentUser: UserProfile | null;
  role: UserRole;
  registerUser: (userData: Partial<UserProfile> & { role: UserRole; fullName: string; email: string }) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  isRegistered: boolean;
  openRegisterModal: boolean;
  setOpenRegisterModal: (open: boolean) => void;
  selectedRoleForModal: UserRole;
  setSelectedRoleForModal: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  const [selectedRoleForModal, setSelectedRoleForModal] = useState<UserRole>('customer');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('buildwise_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('buildwise_user');
    }
  }, [currentUser]);

  const registerUser = (userData: Partial<UserProfile> & { role: UserRole; fullName: string; email: string }) => {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      phone: '+91 98221 00000',
      isVerified: true,
      createdAt: new Date().toISOString(),
      companyName: userData.role === 'professional' ? `${userData.fullName} Constructions` : undefined,
      professionalCategory: 'contractor',
      experienceYears: 5,
      city: 'Panaji',
      locationDistrict: 'North Goa',
      leadCredits: userData.role === 'professional' ? 50 : undefined,
      averageRating: 5.0,
      reviewCount: 0,
      isAvailable: true,
      businessName: userData.role === 'supplier' ? `${userData.fullName} Building Supplies` : undefined,
      warehouseLocation: 'Margao Industrial Estate',
      defaultLocation: 'Goa',
      projectsCount: 0,
      subscriptionTier: userData.subscriptionTier || (userData.role === 'professional' ? 'pro' : 'free'),
      isSponsored: userData.role === 'professional' ? (userData.subscriptionTier === 'premium' || userData.subscriptionTier === 'pro') : false,
      ...userData,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role
    };

    setCurrentUser(newUser);
    setOpenRegisterModal(false);
  };

  const switchRole = (role: UserRole) => {
    const demo = DEMO_USERS[role];
    if (demo) {
      setCurrentUser(demo);
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
        registerUser,
        switchRole,
        logout,
        isRegistered: !!currentUser,
        openRegisterModal,
        setOpenRegisterModal,
        selectedRoleForModal,
        setSelectedRoleForModal,
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
