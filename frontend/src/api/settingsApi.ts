import api from "./axiosConfig";
import publicApi from "./publicApiConfig";

// Types for Settings API
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  preferences?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      marketing?: boolean;
      newLeadCaptured?: boolean;
      weeklyAnalytics?: boolean;
    };
    privacy?: {
      profile_visibility?: string;
      data_sharing?: boolean;
    };
    theme?: string;
    language?: string;
  };
  two_factor_enabled?: boolean;
  last_login?: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  price_type: string;
  features: Array<{
    name: string;
    description: string;
    value: string;
  }>;
}

export interface Subscription {
  id: string;
  plan: {
    id: string;
    name: string;
    description: string;
    price: number;
    price_type: string;
  };
  billing_cycle: string;
  status: string;
  payment_status: string;
  plan_start_date: string;
  plan_end_date?: string;
  features: Array<{
    name: string;
    description: string;
    value: string;
  }>;
}

export interface SubscriptionHistory {
  id: string;
  plan: string;
  billing_cycle: string;
  status: string;
  payment_status: string;
  plan_start_date: string;
  plan_end_date?: string;
  created_at: string;
}

export interface AffiliateStats {
  referralCode: string;
  totalEarnings: number;
  monthlyEarnings: number;
  pendingPayouts: number;
  activeReferrals: number;
  totalReferrals: number;
  conversionRate: number;
  commissionRate: number;
  nextPayoutDate: string;
  recentReferrals: Array<{
    id: string;
    email: string;
    date: string;
    commission: number;
    status: string;
  }>;
}

export interface NotificationPreferences {
  newLeadCaptured: boolean;
  weeklyAnalytics: boolean;
  email: boolean;
  push: boolean;
  marketing: boolean;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileData {
  name?: string;
  preferences?: UserProfile["preferences"];
  avatar?: File;
}

export const settingsApi = {
  // Profile Management
  getProfile: async (): Promise<{
    user: UserProfile;
    subscription: Subscription | null;
  }> => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  updateProfile: async (
    data: UpdateProfileData
  ): Promise<{ user: UserProfile }> => {
    // Handle file upload with FormData if avatar is provided
    if (data.avatar) {
      const formData = new FormData();
      if (data.name) formData.append("name", data.name);
      if (data.preferences)
        formData.append("preferences", JSON.stringify(data.preferences));
      formData.append("avatar_url", data.avatar);

      const response = await api.put("/auth/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } else {
      const response = await api.put("/auth/profile", data);
      return response.data;
    }
  },

  // Security Management
  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await api.post("/auth/change-password", data);
  },

  toggleTwoFactor: async (
    enabled: boolean
  ): Promise<{ two_factor_enabled: boolean }> => {
    const response = await api.post("/auth/toggle-2fa", { enabled });
    return response.data;
  },

  deleteAccount: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete("/auth/account");
    return response.data;
  },

  // Subscription Management
  getPlans: async (): Promise<{ plans: Plan[] }> => {
    // const response = await publicApi.get("/subscription/plans");
    const response = await api.get("/subscription/plans");
    return response.data;
  },

  getCurrentSubscription: async (): Promise<{
    subscription: Subscription | null;
  }> => {
    const response = await api.get("/subscription/current");
    return response.data;
  },

  subscribeToPlan: async (
    planId: string,
    billingCycle: string
  ): Promise<{ subscription: Subscription }> => {
    const response = await api.post("/subscription/subscribe", {
      planId,
      billing_cycle: billingCycle,
    });
    return response.data;
  },

  cancelSubscription: async (): Promise<void> => {
    await api.post("/subscription/cancel");
  },

  getSubscriptionHistory: async (): Promise<{
    history: SubscriptionHistory[];
  }> => {
    const response = await api.get("/subscription/history");
    return response.data;
  },

  // Affiliate Management
  getAffiliateStats: async (): Promise<AffiliateStats> => {
    try {
      const response = await api.get("/affiliate/stats");
      return response.data;
    } catch (error) {
      // Fallback to mock data if API not available
      console.warn("Affiliate API not available, using mock data");
      const profile = await settingsApi.getProfile();
      const userCode = profile.user.id.slice(-6).toUpperCase();
      return {
        referralCode: userCode,
        totalEarnings: 0,
        monthlyEarnings: 0,
        pendingPayouts: 0,
        activeReferrals: 0,
        totalReferrals: 0,
        conversionRate: 0,
        commissionRate: 20,
        nextPayoutDate: "2024-02-01",
        recentReferrals: [],
      };
    }
  },

  generateReferralCode: async (): Promise<{ referralCode: string }> => {
    try {
      const response = await api.post("/affiliate/generate-code");
      return response.data;
    } catch (error) {
      // Fallback to generating code from user ID
      console.warn(
        "Affiliate code generation API not available, using fallback"
      );
      const profile = await settingsApi.getProfile();
      const userCode = profile.user.id.slice(-6).toUpperCase();
      return { referralCode: userCode };
    }
  },

  // Notification Preferences
  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    try {
      const response = await api.get("/auth/notifications");
      return response.data;
    } catch (error) {
      // Fallback to default preferences if API not available
      console.warn(
        "Notification preferences API not available, using defaults"
      );
      return {
        newLeadCaptured: true,
        weeklyAnalytics: true,
        email: true,
        push: true,
        marketing: false,
      };
    }
  },

  updateNotificationPreferences: async (
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> => {
    const response = await api.put("/auth/notifications", preferences);
    return response.data;
  },
};
