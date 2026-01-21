import api from "./axiosConfig";

export interface ContactData {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  job_title?: string;
  company?: string;
  company_website?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  source?: "manual" | "card_scan" | "linkedin" | "google" | "referral" | "event" | "website" | "other";
  linkedin_url?: string;
  tags?: string[];
  notes?: string;
  user?: any;
  last_contact?: string; // New field for Last Contact date
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactResponse {
  contact: ContactData;
  message?: string;
}

export interface ContactsResponse {
  contacts: ContactData[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
}

export interface ContactFilters {
  search?: string;
  company?: string;
  source?: string;
  tags?: string | string[];
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ContactMetaResponse {
  companies?: string[];
  tags?: string[];
}

export const contactApi = {
  // Create a new contact
  create: async (contactData: Partial<ContactData>): Promise<ContactResponse> => {
    const response = await api.post("/contacts", contactData);
    return response.data;
  },

  // Get all contacts with optional filters
  getAll: async (filters?: ContactFilters): Promise<ContactsResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await api.get(`/contacts?${params.toString()}`);
    return response.data;
  },

  // Get a specific contact by ID
  getById: async (id: string): Promise<ContactResponse> => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },

  // Update a contact
  update: async (
    id: string,
    contactData: Partial<ContactData>
  ): Promise<ContactResponse> => {
    const response = await api.put(`/contacts/${id}`, contactData);
    return response.data;
  },

  // Delete a contact
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },

  // Get unique companies for filter dropdown
  getCompanies: async (): Promise<ContactMetaResponse> => {
    const response = await api.get("/contacts/meta/companies");
    return response.data;
  },

  // Get unique tags for filter dropdown
  getTags: async (): Promise<ContactMetaResponse> => {
    const response = await api.get("/contacts/meta/tags");
    return response.data;
  },

  // Search contacts with advanced filtering
  search: async (filters: ContactFilters): Promise<ContactsResponse> => {
    return contactApi.getAll(filters);
  },

  // Bulk operations
  bulkDelete: async (ids: string[]): Promise<{ message: string }> => {
    const deletePromises = ids.map(id => contactApi.delete(id));
    await Promise.all(deletePromises);
    return { message: `${ids.length} contacts deleted successfully` };
  },

  // Export contacts
  export: async (format: 'json' | 'csv' = 'json'): Promise<any> => {
    const response = await api.get(`/contacts/export?format=${format}`);
    return response.data;
  },

  // Transform frontend contact data to match backend schema
  transformToBackend: (frontendContact: any): Partial<ContactData> => {
    return {
      first_name: frontendContact.firstName || frontendContact.first_name,
      last_name: frontendContact.lastName || frontendContact.last_name,
      email: frontendContact.email,
      phone: frontendContact.phone,
      job_title: frontendContact.jobTitle || frontendContact.job_title,
      company: frontendContact.company,
      company_website: frontendContact.companyWebsite || frontendContact.company_website,
      website: frontendContact.website,
      address: frontendContact.address,
      city: frontendContact.city,
      state: frontendContact.state,
      country: frontendContact.country,
      source: frontendContact.source || "manual",
      linkedin_url: frontendContact.linkedinUrl || frontendContact.linkedin_url,
      tags: frontendContact.tags || [],
      notes: frontendContact.notes,
    };
  },

  // Transform backend contact data to match frontend expectations
  transformToFrontend: (backendContact: ContactData): any => {
    return {
      id: backendContact.id,
      firstName: backendContact.first_name,
      lastName: backendContact.last_name,
      fullName: `${backendContact.first_name} ${backendContact.last_name}`,
      email: backendContact.email,
      phone: backendContact.phone,
      jobTitle: backendContact.job_title,
      company: backendContact.company,
      companyWebsite: backendContact.company_website,
      website: backendContact.website,
      address: backendContact.address,
      city: backendContact.city,
      state: backendContact.state,
      country: backendContact.country,
      source: backendContact.source,
      linkedinUrl: backendContact.linkedin_url,
      tags: backendContact.tags || [],
      notes: backendContact.notes,
      createdAt: backendContact.createdAt,
      updatedAt: backendContact.updatedAt,
      // Additional computed fields for frontend
      location: [backendContact.city, backendContact.state, backendContact.country]
        .filter(Boolean)
        .join(", "),
      initials: `${backendContact.first_name?.[0] || ''}${backendContact.last_name?.[0] || ''}`,
    };
  },
};
