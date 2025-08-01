// types.ts

// -----------------------------
// User & Auth Types
// -----------------------------

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'team_member';
  is_verified: boolean;
  trial_ends_at?: string;
  subscription_plan?: string;
  subscription_status?: string;
  subscription?: {
    plan: string;
    status: string;
    expiresAt?: string;
  };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// -----------------------------
// Billing Types
// -----------------------------

export type SubscriptionStatus = 'trial' | 'active' | 'canceled' | 'expired';

export type BillingUsage = {
  projects: number;
  keywords: number;
  audits: number;
};

export type BillingLimits = {
  projects: number;
  keywords: number;
  audits: number;
};

export type BillingPlan = {
  name: string;
  description: string;
  price: {
    monthly: number | string;
    yearly: number | string;
  };
  features: string[];
  limitations: string[];
  recommended: boolean;
};

export type BillingData = {
  currentPlan: string;
  currentPlanFeatures: string[];
  usage: BillingUsage;
  limits: BillingLimits;
  nextBilling: {
    amount: number;
    date: string;
  };
  paymentMethod: string;
};

// -----------------------------
// Project Types
// -----------------------------

export type Project = {
  id: number;
  name: string;
  url: string;
  description?: string;
  is_paused?: boolean | false;
  language?: string;
  target_region?: string;
  search_engine: 'Google' | 'Bing' | 'Yahoo';
  keywords?: number;
  members?: number;
  role?: 'owner' | 'editor' | 'viewer';
  avgPosition?: number;
  lastAudit?: string | null;
  change?: number;
  created_at: string;
  updated_at: string;
};

export type ProjectCreate = {
  name: string;
  url: string;
  description?: string;
  search_engine: 'Google' | 'Bing' | 'Yahoo';
  target_region: string;
  language: string;
};

// -----------------------------
// Keyword Types
// -----------------------------

export interface KeywordOut {
  id: number;
  keyword: string;
  tag?: string;
  language?: string;
  priority?: number;
  added_at: string;
  project_id: number;
}

export interface KeywordCreate {
  keyword: string;
  tag?: string;
  language?: string;
  priority?: number;
}

// -----------------------------
// Transaction / Billing History
// -----------------------------

export type BillingTransaction = {
  id: string | number;
  plan: string;
  amount: number;
  date: string;
  status: 'paid' | 'failed' | 'pending';
};


// -----------------------------
// Team Access Types
// -----------------------------

export interface TeamInviteOut {
  id: number;
  email: string; // EmailStr in backend
  role: "viewer" | "editor" | "owner";
  status: "pending" | "accepted" | "declined";
  created_at: string; // datetime from backend
}

export interface TeamInviteCreate {
  email: string; // EmailStr in backend
  role: "viewer" | "editor" | "owner";
}

export interface TeamInviteUpdate {
  role: "viewer" | "editor" | "owner";
}

export interface UserOut {
  id: number;
  email: string; // EmailStr in backend
  name: string;
}

export interface ProjectMemberOut {
  id: number;
  role: "viewer" | "editor" | "owner";
  user: UserOut;
}

export interface ProjectMemberUpdate {
  role: "viewer" | "editor" | "owner";
}

export interface UnifiedTeamEntry {
  id: number;
  email: string;
  name?: string; // Only for accepted members
  role: "viewer" | "editor" | "owner";
  status: "pending" | "accepted" | "declined";
  created_at?: string; // Only for invites
  isInvite: boolean; // True if it's an invite, false if it's an accepted member
}