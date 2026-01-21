import api from "./axiosConfig";
import publicApi from "./publicApiConfig";

export interface Plan {
  id: number;
  name: string;
  price: number;
  description?: string;
  features: Array<{
    feature: {
      id: number;
      name: string;
      category: string;
    };
    value: string;
    limit: number | null;
  }>;
}

export interface Subscription {
  id: number;
  plan: Plan;
  status: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface SubscriptionHistory {
  id: number;
  plan: Plan;
  status: string;
  startDate: string;
  endDate?: string;
  amount?: number;
}

export const subscriptionApi = {
  // Get all available plans (public endpoint - uses API token)
  getPlans: async (): Promise<Plan[]> => {
    const response = await publicApi.get("/subscription/plans");
    return response.data;
  },

  // Subscribe to a plan (user-specific - uses JWT)
  subscribe: async (planId: number): Promise<Subscription> => {
    const response = await api.post("/subscription/subscribe", { planId });
    return response.data;
  },

  // Get current user subscription (user-specific - uses JWT)
  getCurrentSubscription: async (): Promise<Subscription> => {
    const response = await api.get("/subscription/current");
    return response.data;
  },

  // Cancel subscription (user-specific - uses JWT)
  cancelSubscription: async (): Promise<{ message: string }> => {
    const response = await api.post("/subscription/cancel");
    return response.data;
  },

  // Get subscription history (user-specific - uses JWT)
  getSubscriptionHistory: async (): Promise<SubscriptionHistory[]> => {
    const response = await api.get("/subscription/history");
    return response.data;
  },
};
