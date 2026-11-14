// Centralized API Base URL configuration
// In production (e.g. Vercel), set VITE_API_BASE_URL to your Render backend URL (e.g. https://buildwise-backend.onrender.com)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
