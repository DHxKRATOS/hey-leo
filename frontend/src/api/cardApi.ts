import axios from "axios";
import api from "./axiosConfig";
import publicApi from "./publicApiConfig";
import externalApi from "./externalApiConfig";

export interface ContactCaptureField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  enabled: boolean;
}

export interface TrainingDocument {
  id: string;
  name: string;
  url: string;
  size: number;
  mime: string;
  uploadedAt: Date;
}

export interface TrainingWebsiteLink {
  id: string;
  url: string;
  title?: string;
  description?: string;
  addedAt: Date;
}

export interface TrainingQAPair {
  id: string;
  question: string;
  answer: string;
  addedAt: Date;
}

export interface CardData {
  user: any;
  createdAt: any;
  updatedAt: any;
  id?: string;
  card_creation_type: "google" | "linkedin" | "email";
  card_name: string;
  first_name: string;
  last_name: string;
  job_title?: string;
  company?: string;
  professional_bio_type?: "own" | "AI" | "linkedin";
  description?: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  calendar_url?: string;
  card_profile_link?: string;
  card_profile_image?: File | string;
  card_views?: number;
  card_leads?: number;
  twitter_url?: string;
  instagram_url?: string;
  website_url?: string;
  portfolio_url?: string;
  calendly_url?: string;
  custom_links?: any;
  location?: string;
  documents?: any;
  additional_information?: string;
  status?: "draft" | "active" | "paused";
  card_type?: "business" | "personal" | "networking";
  contact_capture_enabled?: boolean;
  contact_capture_allow_skip?: boolean;
  contact_capture_header_message?: string;
  contact_capture_fields?: ContactCaptureField[];
  training_documents?: TrainingDocument[];
  training_website_links?: TrainingWebsiteLink[];
  training_qa_pairs?: TrainingQAPair[];
  training_free_text?: string;
  ai_training_status?: "not_started" | "processing" | "completed" | "error";
  ai_training_last_updated?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CardResponse {
  card: CardData;
  message?: string;
}

export interface CardsResponse {
  cards: CardData[];
}

export interface OnboardingCardData {
  provider: "google" | "linkedin" | "email";
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    jobTitle?: string;
    company?: string;
    bio?: string;
    photo?: string;
    location?: string;
  };
  contacts: {
    email: boolean;
    phone: boolean;
    linkedin: boolean;
    calendar: boolean;
  };
  preferences: {
    aiGenerated: boolean;
    bioPrompt?: string;
  };
}

export const cardApi = {
  // Create a new card
  create: async (cardData: Partial<CardData>): Promise<CardResponse> => {
    const response = await api.post("/cards", cardData);
    return response.data;
  },

  // Create card from onboarding data
  createFromOnboarding: async (
    onboardingData: OnboardingCardData
  ): Promise<CardResponse> => {
    const cardData: Partial<CardData> = {
      card_creation_type: onboardingData.provider,
      card_name:
        `${onboardingData.profile.firstName} ${onboardingData.profile.lastName}`.trim(),
      first_name: onboardingData.profile.firstName,
      last_name: onboardingData.profile.lastName,
      job_title: onboardingData.profile.jobTitle || "",
      company: onboardingData.profile.company || "",
      professional_bio_type: onboardingData.preferences.aiGenerated
        ? "AI"
        : "own",
      description:
        onboardingData.profile.bio ||
        (onboardingData.preferences.aiGenerated
          ? onboardingData.preferences.bioPrompt
          : ""),
      email: onboardingData.profile.email,
      phone: onboardingData.profile.phone || "",
      location: onboardingData.profile.location || "",
      linkedin_url: onboardingData.contacts.linkedin
        ? `https://linkedin.com/in/${onboardingData.profile.firstName.toLowerCase()}-${onboardingData.profile.lastName.toLowerCase()}`
        : "",
      calendar_url: onboardingData.contacts.calendar
        ? "https://calendly.com/user"
        : "",
      status: "active",
      card_type: "business",
    };

    return await cardApi.create(cardData);
  },

  // Get all cards for the current user
  getAll: async (): Promise<CardsResponse> => {
    const response = await api.get("/cards");
    return response.data;
  },

  // Get a specific card by ID
  getById: async (id: string): Promise<CardResponse> => {
    const response = await api.get(`/cards/${id}`);
    return response.data;
  },

  // Update a card
  update: async (
    id: string,
    cardData: Partial<CardData>
  ): Promise<CardResponse> => {
    const response = await api.put(`/cards/${id}`, cardData);
    return response.data;
  },

  // Update card with file upload (multipart)
  updateWithFile: async (
    id: string,
    formData: FormData
  ): Promise<CardResponse> => {
    const response = await api.put(`/cards/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Delete a card
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/cards/${id}`);
    return response.data;
  },

  // Increment card views (public endpoint - uses API token)
  incrementViews: async (
    id: string
  ): Promise<{ message: string; views: number }> => {
    const response = await publicApi.post(`/cards/${id}/views`);
    return response.data;
  },

  // Increment card leads (public endpoint - uses API token)
  incrementLeads: async (
    id: string
  ): Promise<{ message: string; leads: number }> => {
    const response = await publicApi.post(`/cards/${id}/leads`);
    return response.data;
  },

  // Get public card by profile link (public endpoint - uses API token)
  getByProfileLink: async (
    profileLink: string | undefined
  ): Promise<CardResponse> => {
    const response = await publicApi.get(`/public/cards/${profileLink}`);
    return response.data;
  },

  // Update contact capture settings for a card
  updateContactCapture: async (
    id: string,
    contactCaptureData: {
      contact_capture_enabled?: boolean;
      contact_capture_allow_skip?: boolean;
      contact_capture_header_message?: string;
      contact_capture_fields?: ContactCaptureField[];
    }
  ): Promise<CardResponse> => {
    const response = await api.put(
      `/cards/${id}/contact-capture`,
      contactCaptureData
    );
    return response.data;
  },

  async submitContactForm(profileLink: string, formData: any) {
    const response = await publicApi.post(
      `/public/cards/${profileLink}/contact-form`,
      formData
    );
    return response.data;
  },

  async updateTrainingData(
    cardId: string,
    trainingData: {
      training_documents?: TrainingDocument[];
      training_website_links?: TrainingWebsiteLink[];
      training_qa_pairs?: TrainingQAPair[];
      training_free_text?: string;
    }
  ) {
    const response = await api.put(
      `/cards/${cardId}/training-data`,
      trainingData
    );
    return response.data;
  },

  async uploadTrainingDocuments(user_id: string, files: File[]) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file);
      formData.append("user_id", user_id);
    });

    const response = await externalApi.post(`/documents/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async uploadWebsiteLinks(training_website_links?: {
    user_id: string;
    url: string;
  }) {
    const response = await externalApi.post(
      `/scraper/scrape`,
      training_website_links,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  async uploadQaPairs(training_qa_pairs?: {
    question: string;
    answer: string;
    user_id: string;
  }) {
    const response = await externalApi.post(`/faq/add`, training_qa_pairs, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  async uploadAdditionalInformation(training_free_text?: {
    text: string;
    user_id: string;
  }) {
    const response = await externalApi.post(
      `/additional/add`,
      training_free_text,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  async sendChatMsg(chatMsg?: { query: string; user_id: string }) {
    const response = await externalApi.post(`/chat/query`, chatMsg, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  async deleteTrainingDocument(cardId: string, documentId: string) {
    const response = await api.delete(
      `/cards/${cardId}/training-documents/${documentId}`
    );
    return response.data;
  },

  // Transform frontend card data to match backend schema
  transformToBackend: (frontendCard: any): Partial<CardData> => {
    return {
      card_creation_type: frontendCard.provider || "email",
      card_name:
        frontendCard.name ||
        `${frontendCard.profile?.full_name || "Untitled Card"}`,
      first_name: frontendCard.profile?.full_name?.split(" ")[0] || "",
      last_name:
        frontendCard.profile?.full_name?.split(" ").slice(1).join(" ") || "",
      job_title: frontendCard.profile?.job_title,
      company: frontendCard.profile?.company,
      description: frontendCard.profile?.bio,
      email: frontendCard.user_id || "", // This should be handled differently
      status: frontendCard.status || "draft",
      card_type: frontendCard.type || "business",
    };
  },

  // Transform backend card data to match frontend expectations
  transformToFrontend: (backendCard: CardData): any => {
    return {
      id: backendCard.id,
      user_id: backendCard?.user?.id,
      name: backendCard.card_name,
      type: backendCard.card_type,
      status: backendCard.status,
      profile: {
        full_name: `${backendCard.first_name} ${backendCard.last_name}`,
        job_title: backendCard.job_title,
        company: backendCard.company,
        bio: backendCard.description,
        profile_photo_url: backendCard.card_profile_image || "",
        cover_image_url: "",
        email: backendCard?.email,
      },
      analytics: {
        views: backendCard.card_views || 0,
        unique_views: backendCard.card_views || 0,
        conversations: 0,
        leads: backendCard.card_leads || 0,
        conversion_rate:
          backendCard.card_leads && backendCard.card_views
            ? Math.round(
                (backendCard.card_leads / backendCard.card_views) * 100
              )
            : 0,
        monthly_views: backendCard.card_views || 0,
        weekly_change: 0,
        link_clicks: 0,
      },
      ai_config: {
        enabled: backendCard.professional_bio_type === "AI",
        training_status: "completed",
        confidence_threshold: 0.8,
        personality: "professional",
      },
      created_at: backendCard.createdAt,
      updated_at: backendCard.updatedAt,
      shared_count: 0,
      qr_scans: 0,
      links: backendCard?.custom_links,
    };
  },
};

export default cardApi;
