// Application Constants
export const APP_CONFIG = {
  // Dashboard Settings
  REFRESH_INTERVAL: 30000, // 30 seconds
  MAX_PERFORMANCE_ITEMS: 5,
  
  // Chart Colors
  CHART_COLORS: {
    PRIMARY: '#3B82F6',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    DANGER: '#EF4444',
    NEUTRAL: '#6B7280',
  },
  
  // Performance Thresholds
  PERFORMANCE_THRESHOLDS: {
    EXCELLENT: 90,
    GOOD: 85,
    AVERAGE: 80,
    NEEDS_ATTENTION: 0,
  },
  
  // API Endpoints (for future use)
  API_ENDPOINTS: {
    BASE_URL: process.env.REACT_APP_API_URL || '/api',
    AUTH: '/auth',
    DASHBOARD: '/dashboard',
    SDPO: '/sdpo',
    COMMUNICATION: '/communication',
    FILES: '/files',
  },
  
  // Local Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_PREFERENCES: 'user_preferences',
    DASHBOARD_FILTERS: 'dashboard_filters',
  },
  
  // Date Formats
  DATE_FORMATS: {
    DISPLAY: 'DD/MM/YYYY',
    API: 'YYYY-MM-DD',
    TIMESTAMP: 'YYYY-MM-DD HH:mm:ss',
  },
  
  // Roles & Permissions
  ROLES: {
    DGP: 'DGP',
    DIG: 'DIG',
    SP: 'SP',
    CP: 'CP',
    SDPO: 'SDPO',
  } as const,
  
  // Tab Configuration
  DASHBOARD_TABS: {
    OVERVIEW: 'overview',
    KPIS: 'kpis',
    PERFORMANCE_TRACKING: 'performance-tracking',
    COMPARISON: 'comparison',
    COMMUNICATION: 'communication',
    ACTIVITIES: 'activities',
  },
  
  // Modal Types
  MODALS: {
    SDPO_DETAIL: 'sdpo_detail',
    TASK_ASSIGNMENT: 'task_assignment',
    MESSAGE_BROADCAST: 'message_broadcast',
  } as const,
} as const;

// Officer Names for Mock Data
export const MOCK_OFFICER_NAMES = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Kavitha Rao', 'Suresh Babu',
  'Lakshmi Devi', 'Ravi Teja', 'Sunitha Reddy', 'Venkat Rao', 'Madhavi Krishna',
  'Arun Reddy', 'Sita Devi', 'Kiran Kumar', 'Padma Latha', 'Vijay Singh',
] as const;

// Color Schemes
export const COLOR_SCHEMES = {
  RANK_COLORS: {
    1: 'bg-yellow-500', // Gold
    2: 'bg-gray-400',   // Silver
    3: 'bg-amber-600',  // Bronze
    DEFAULT: 'bg-gray-200',
  },
  
  PRIORITY_COLORS: {
    URGENT: 'bg-red-100 text-red-800 border-red-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    LOW: 'bg-green-100 text-green-800 border-green-200',
  },
  
  STATUS_COLORS: {
    COMPLETED: 'bg-green-100 text-green-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    OVERDUE: 'bg-red-100 text-red-800',
  },
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[1-9][\d\s-()]{7,15}$/,
  BADGE_NUMBER: /^[A-Z]{2,4}\d{2,4}$/,
  
  // Field Lengths
  MAX_LENGTHS: {
    NAME: 100,
    EMAIL: 255,
    PHONE: 20,
    DESCRIPTION: 1000,
    TITLE: 200,
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  SERVER_ERROR: 'Server error. Please contact support.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  DATA_SAVED: 'Data saved successfully',
  MESSAGE_SENT: 'Message sent successfully',
  TASK_ASSIGNED: 'Task assigned successfully',
  FILE_UPLOADED: 'File uploaded successfully',
} as const;

export type UserRole = keyof typeof APP_CONFIG.ROLES;
