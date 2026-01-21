import api from "./axiosConfig";

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
  };
  subscription?: {
    plan: {
      id: number;
      name: string;
      price: number;
      features: Array<{
        feature: {
          name: string;
          category: string;
        };
        value: string;
        limit: number | null;
      }>;
    };
  };
}

export interface ProfileResponse {
  id: number;
  email: string;
  name: string;
  avatar?: {
    url: string;
  };
  avatar_url?: string;
  preferences?: any;
  subscription?: {
    plan: {
      id: number;
      name: string;
      price: number;
      features: Array<{
        feature: {
          name: string;
          category: string;
        };
        value: string;
        limit: number | null;
      }>;
    };
  };
}

export const authApi = {
  // Sign up new user
  signUp: async (data: SignUpData): Promise<AuthResponse> => {
    const [first, ...rest] = data.name.trim().split(" ");
    const last = rest.length > 0 ? rest.join(" ") : "";

    const response = await api.post("/auth/register", {
      email: data.email,
      password: data.password,
      firstName: first,
      lastName: last,
    });

    return response.data;
  },

  // Sign in existing user
  signIn: async (data: SignInData): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", {
      email: data.email,
      password: data.password,
    });
    return response.data;
  },

  // Sign out user
  signOut: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  // Get current user profile
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  // Update user profile
  updateProfile: async (
    data: Partial<ProfileResponse>
  ): Promise<ProfileResponse> => {
    const response = await api.put("/auth/profile", data);
    return response.data;
  },

  // Change password
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    await api.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  },

  // Social authentication (LinkedIn, Google)
  socialAuth: async (
    provider: "linkedin" | "google",
    authData: any
  ): Promise<AuthResponse> => {
    const endpoint = provider === "google" 
      ? "/auth/google/callback" 
      : "/auth/linkedin/callback";
    
    const response = await api.post(endpoint, authData);
    return response.data;
  },
};
