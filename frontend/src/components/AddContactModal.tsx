import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Tag,
  Plus,
  Check,
  AlertCircle,
  Briefcase,
  Globe,
  Home,
  ExternalLink,
  QrCode,
  Link as LinkIcon,
  Bot,
  UserCheck,
  Target,
} from "lucide-react";
import { AppDispatch, RootState } from "../store/store";
import { createContact, updateContact } from "../store/contactSlice";
import { ContactData } from "../api/contactApi";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactAdded?: (contactData: any) => void;
  contact: any;
  existingTags?: string[];
}

export function AddContactModal({
  isOpen,
  onClose,
  contact,
  existingTags = [],
}: AddContactModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { isUpdating, error } = useSelector(
    (state: RootState) => state.contacts
  );
  // UPDATED: Complete Contact Field Structure from UI/UX Designer Brief
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    job_title: "",
    company: "",
    company_website: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "",
    linkedin_url: "",
    notes: "",
    tags: [] as string[],
    source: "manual" as const,
    last_contact: "", // New field for Last Contact date
  });

  useEffect(() => {
    if (contact && Object?.keys(contact)?.length) {
      setFormData({
        first_name: contact.first_name || "",
        last_name: contact.last_name || "",
        email: contact.email || "",
        job_title: contact.job_title || "",
        company: contact.company || "",
        company_website: contact.company_website || "",
        phone: contact.phone || "",
        website: contact.website || "",
        address: contact.address || "",
        city: contact.city || "",
        state: contact.state || "",
        country: contact.country || "",
        linkedin_url: contact.linkedin_url || "",
        notes: contact.notes || "",
        tags: contact.tags || [],
        source: contact.source || "manual",
        last_contact: contact.last_contact ? new Date(contact.last_contact).toISOString().split('T')[0] : "",
      });
    } else {
      // reset if new contact
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        job_title: "",
        company: "",
        company_website: "",
        phone: "",
        website: "",
        address: "",
        city: "",
        state: "",
        country: "",
        linkedin_url: "",
        notes: "",
        tags: [],
        source: "manual",
        last_contact: "",
      });
    }
  }, [contact]);

  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Only First Name, Last Name, and Email are required as per design brief
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Handle Last Contact logic: use provided date or default to current date for new contacts
    const currentDate = new Date().toISOString();
    const lastContactDate = formData.last_contact 
      ? new Date(formData.last_contact).toISOString()
      : (Object?.keys(contact)?.length ? undefined : currentDate); // Only default for new contacts

    // Create contact data matching backend schema
    const contactData: Partial<ContactData> = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone || undefined,
      job_title: formData.job_title || undefined,
      company: formData.company || undefined,
      company_website: formData.company_website || undefined,
      website: formData.website || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      country: formData.country || undefined,
      linkedin_url: formData.linkedin_url || undefined,
      source: formData.source,
      notes: formData.notes || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      last_contact: lastContactDate,
    };

    try {
      if (Object?.keys(contact)?.length) {
        dispatch(updateContact({ id: contact.id, contactData }));
      } else {
        dispatch(createContact(contactData));
      }

      // if (createContact.fulfilled.match(result)) {
      //   // Call legacy callback if provided for backward compatibility
      // }
      handleClose();
    } catch (error) {
      console.error("Failed to create contact:", error);
    }
  };

  const handleClose = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      job_title: "",
      company: "",
      company_website: "",
      phone: "",
      website: "",
      address: "",
      city: "",
      state: "",
      country: "",
      linkedin_url: "",
      notes: "",
      tags: [],
      source: "manual" as const,
      last_contact: "",
    });
    setNewTag("");
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleExistingTagSelect = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Premium Backdrop with Leo Design System */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"
        style={{
          animation: "fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onClick={handleClose}
      />

      {/* Modal Container - Leo Design System Enhanced */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-surface border border-border rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden"
          style={{
            animation: "scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow:
              "0 24px 64px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(242, 101, 34, 0.08)",
          }}
        >
          {/* Header - Premium Leo Design */}
          <div
            className="px-8 py-6 border-b border-border"
            style={{
              background:
                "linear-gradient(135deg, var(--surface) 0%, var(--primary-light) 1%, var(--surface) 100%)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)",
                    boxShadow: "0 4px 12px rgba(242, 101, 34, 0.25)",
                  }}
                >
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: "var(--text-2xl)",
                      lineHeight: "var(--leading-2xl)",
                      fontWeight: "var(--font-weight-bold)",
                      letterSpacing: "var(--tracking-tight)",
                      color: "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    {Object?.keys(contact)?.length ? "Update Contact" : "Add New Contact"}
                  </h2>
                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      lineHeight: "var(--leading-sm)",
                      fontWeight: "var(--font-weight-normal)",
                      color: "var(--text-secondary)",
                      marginTop: "4px",
                      margin: 0,
                    }}
                  >
                    Expand your professional network with Leo
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-xl bg-surface hover:bg-surface-hover border border-border transition-all duration-200 flex items-center justify-center group hover:scale-105"
                style={{
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                }}
              >
                <X className="h-5 w-5 text-text-secondary group-hover:text-text-primary transition-colors" />
              </button>
            </div>
          </div>

          {/* Form Container - Enhanced Scrolling */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto"
            style={{ maxHeight: "calc(92vh - 200px)" }}
          >
            <div className="px-8 py-6 space-y-10">
              {/* Personal Information Section - Leo Enhanced */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-2 border-b border-border/30">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "var(--primary-surface)" }}
                  >
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <h3
                    style={{
                      fontSize: "var(--text-lg)",
                      lineHeight: "var(--leading-lg)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name - Leo Input Style */}
                  <div>
                    <Label
                      htmlFor="first_name"
                      style={{
                        fontSize: "var(--text-sm)",
                        lineHeight: "var(--leading-sm)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--text-primary)",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      First Name*
                    </Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) =>
                        handleInputChange("first_name", e.target.value)
                      }
                      placeholder="Enter first name"
                      className={`input-refined ${
                        errors.first_name ? "border-error" : ""
                      }`}
                      style={{
                        height: "48px",
                        borderRadius: "var(--radius-lg)",
                        border: errors.first_name
                          ? "2px solid var(--error)"
                          : "1px solid var(--border)",
                        fontSize: "var(--text-base)",
                        fontWeight: "var(--font-weight-normal)",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                    {errors.first_name && (
                      <p
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--error)",
                          marginTop: "4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <AlertCircle className="h-3 w-3" />
                        {errors.first_name}
                      </p>
                    )}
                  </div>

                  {/* Last Name - Leo Input Style */}
                  <div>
                    <Label
                      htmlFor="last_name"
                      style={{
                        fontSize: "var(--text-sm)",
                        lineHeight: "var(--leading-sm)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--text-primary)",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Last Name*
                    </Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) =>
                        handleInputChange("last_name", e.target.value)
                      }
                      placeholder="Enter last name"
                      className={`input-refined ${
                        errors.last_name ? "border-error" : ""
                      }`}
                      style={{
                        height: "48px",
                        borderRadius: "var(--radius-lg)",
                        border: errors.last_name
                          ? "2px solid var(--error)"
                          : "1px solid var(--border)",
                        fontSize: "var(--text-base)",
                        fontWeight: "var(--font-weight-normal)",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                    {errors.last_name && (
                      <p
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--error)",
                          marginTop: "4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <AlertCircle className="h-3 w-3" />
                        {errors.last_name}
                      </p>
                    )}
                  </div>

                  {/* Email - Full Width Leo Style */}
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="email"
                      style={{
                        fontSize: "var(--text-sm)",
                        lineHeight: "var(--leading-sm)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--text-primary)",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Email Address*
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Enter email address"
                      className={`input-refined ${
                        errors.email ? "border-error" : ""
                      }`}
                      style={{
                        height: "48px",
                        borderRadius: "var(--radius-lg)",
                        border: errors.email
                          ? "2px solid var(--error)"
                          : "1px solid var(--border)",
                        fontSize: "var(--text-base)",
                        fontWeight: "var(--font-weight-normal)",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                    {errors.email && (
                      <p
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--error)",
                          marginTop: "4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Information Section - Leo Enhanced */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-2 border-b border-border/30">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "var(--primary-surface)" }}
                  >
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                  <h3
                    style={{
                      fontSize: "var(--text-lg)",
                      lineHeight: "var(--leading-lg)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    Professional Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Job Title */}
                  <div>
                    <Label
                      htmlFor="job_title"
                      style={{
                        fontSize: "var(--text-sm)",
                        lineHeight: "var(--leading-sm)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--text-primary)",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Job Title
                    </Label>
                    <Input
                      id="job_title"
                      value={formData.job_title}
                      onChange={(e) =>
                        handleInputChange("job_title", e.target.value)
                      }
                      placeholder="Enter job title"
                      className="input-refined"
                      style={{
                        height: "48px",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--border)",
                        fontSize: "var(--text-base)",
                        fontWeight: "var(--font-weight-normal)",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <Label
                      htmlFor="company"
                      style={{
                        fontSize: "var(--text-sm)",
                        lineHeight: "var(--leading-sm)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--text-primary)",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Company
                    </Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) =>
                        handleInputChange("company", e.target.value)
                      }
                      placeholder="Enter company name"
                      className="input-refined"
                      style={{
                        height: "48px",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--border)",
                        fontSize: "var(--text-base)",
                        fontWeight: "var(--font-weight-normal)",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </div>

                  {/* Company Website - Full Width */}
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="company_website"
                      style={{
                        fontSize: "var(--text-sm)",
                        lineHeight: "var(--leading-sm)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--text-primary)",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Company Website
                    </Label>
                    <Input
                      id="company_website"
                      value={formData.company_website}
                      onChange={(e) =>
                        handleInputChange("company_website", e.target.value)
                      }
                      placeholder="https://company.com"
                      className="input-refined"
                      style={{
                        height: "48px",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--border)",
                        fontSize: "var(--text-base)",
                        fontWeight: "var(--font-weight-normal)",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Details Section - Leo Enhanced */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-2 border-b border-border/30">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "var(--primary-surface)" }}
                  >
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <h3
                    style={{
                      fontSize: "var(--text-lg)",
                      lineHeight: "var(--leading-lg)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    Contact Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <Label
                      htmlFor="phone"
                      style={{
                        fontSize: "var(--text-sm)",
                        lineHeight: "var(--leading-sm)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--text-primary)",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="+1 (555) 123-4567"
                      className="input-refined"
                      style={{
                        height: "48px",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--border)",
                        fontSize: "var(--text-base)",
                        fontWeight: "var(--font-weight-normal)",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <Label
                      htmlFor="website"
                      style={{
                        fontSize: "var(--text-sm)",
                        lineHeight: "var(--leading-sm)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--text-primary)",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Personal Website
                    </Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      placeholder="https://website.com"
                      className="input-refined"
                      style={{
                        height: "48px",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--border)",
                        fontSize: "var(--text-base)",
                        fontWeight: "var(--font-weight-normal)",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Location Section - Leo Enhanced */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-2 border-b border-border/30">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "var(--primary-surface)" }}
                  >
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <h3
                    style={{
                      fontSize: "var(--text-lg)",
                      lineHeight: "var(--leading-lg)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    Location
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Address */}
                  <div>
                    <Label
                      htmlFor="address"
                      style={{
                        fontSize: "var(--text-sm)",
                        lineHeight: "var(--leading-sm)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--text-primary)",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Street Address
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="123 Main Street"
                      className="input-refined"
                      style={{
                        height: "48px",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--border)",
                        fontSize: "var(--text-base)",
                        fontWeight: "var(--font-weight-normal)",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* City */}
                    <div>
                      <Label
                        htmlFor="city"
                        style={{
                          fontSize: "var(--text-sm)",
                          lineHeight: "var(--leading-sm)",
                          fontWeight: "var(--font-weight-semibold)",
                          color: "var(--text-primary)",
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        City
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        placeholder="New York"
                        className="input-refined"
                        style={{
                          height: "48px",
                          borderRadius: "var(--radius-lg)",
                          border: "1px solid var(--border)",
                          fontSize: "var(--text-base)",
                          fontWeight: "var(--font-weight-normal)",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                    </div>

                    {/* State */}
                    <div>
                      <Label
                        htmlFor="state"
                        style={{
                          fontSize: "var(--text-sm)",
                          lineHeight: "var(--leading-sm)",
                          fontWeight: "var(--font-weight-semibold)",
                          color: "var(--text-primary)",
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        State
                      </Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) =>
                          handleInputChange("state", e.target.value)
                        }
                        placeholder="NY"
                        className="input-refined"
                        style={{
                          height: "48px",
                          borderRadius: "var(--radius-lg)",
                          border: "1px solid var(--border)",
                          fontSize: "var(--text-base)",
                          fontWeight: "var(--font-weight-normal)",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <Label
                        htmlFor="country"
                        style={{
                          fontSize: "var(--text-sm)",
                          lineHeight: "var(--leading-sm)",
                          fontWeight: "var(--font-weight-semibold)",
                          color: "var(--text-primary)",
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        Country
                      </Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) =>
                          handleInputChange("country", e.target.value)
                        }
                        placeholder="United States"
                        className="input-refined"
                        style={{
                          height: "48px",
                          borderRadius: "var(--radius-lg)",
                          border: "1px solid var(--border)",
                          fontSize: "var(--text-base)",
                          fontWeight: "var(--font-weight-normal)",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Section - Leo Enhanced */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-2 border-b border-border/30">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "var(--primary-surface)" }}
                  >
                    <ExternalLink className="h-4 w-4 text-primary" />
                  </div>
                  <h3
                    style={{
                      fontSize: "var(--text-lg)",
                      lineHeight: "var(--leading-lg)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    Social & Source
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* LinkedIn */}
                  <div>
                    <Label
                      htmlFor="linkedin_url"
                      style={{
                        fontSize: "var(--text-sm)",
                        lineHeight: "var(--leading-sm)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--text-primary)",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      LinkedIn Profile
                    </Label>
                    <Input
                      id="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={(e) =>
                        handleInputChange("linkedin_url", e.target.value)
                      }
                      placeholder="https://linkedin.com/in/username"
                      className="input-refined"
                      style={{
                        height: "48px",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--border)",
                        fontSize: "var(--text-base)",
                        fontWeight: "var(--font-weight-normal)",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </div>

                  {/* Source */}
                  <div>
                    <Label
                      htmlFor="source"
                      style={{
                        fontSize: "var(--text-sm)",
                        lineHeight: "var(--leading-sm)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--text-primary)",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      How did you meet?
                    </Label>
                    <Select
                      value={formData.source}
                      onValueChange={(value) =>
                        handleInputChange("source", value)
                      }
                    >
                      <SelectTrigger
                        className="input-refined"
                        style={{
                          height: "48px",
                          borderRadius: "var(--radius-lg)",
                          border: "1px solid var(--border)",
                          fontSize: "var(--text-base)",
                          fontWeight: "var(--font-weight-normal)",
                          backgroundColor: "var(--surface)",
                        }}
                      >
                        <SelectValue placeholder="Select how you met" />
                      </SelectTrigger>
                      <SelectContent
                        style={{
                          borderRadius: "var(--radius-lg)",
                          border: "1px solid var(--border)",
                          backgroundColor: "var(--surface)",
                          boxShadow: "var(--shadow-lg)",
                        }}
                      >
                        <SelectItem value="manual">
                          <div className="flex items-center space-x-3">
                            <Target className="h-4 w-4 text-primary" />
                            <span>Manual Entry</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="card_scan">
                          <div className="flex items-center space-x-3">
                            <QrCode className="h-4 w-4 text-primary" />
                            <span>Card Scan</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="website">
                          <div className="flex items-center space-x-3">
                            <LinkIcon className="h-4 w-4 text-primary" />
                            <span>Website</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="linkedin">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-primary" />
                            <span>LinkedIn</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="google">
                          <div className="flex items-center space-x-3">
                            <Bot className="h-4 w-4 text-primary" />
                            <span>Google</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="event">
                          <div className="flex items-center space-x-3">
                            <Globe className="h-4 w-4 text-primary" />
                            <span>Event</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="referral">
                          <div className="flex items-center space-x-3">
                            <UserCheck className="h-4 w-4 text-primary" />
                            <span>Referral</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="other">
                          <div className="flex items-center space-x-3">
                            <Target className="h-4 w-4 text-primary" />
                            <span>Other</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Last Contact Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-2 border-b border-border/30">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "var(--primary-surface)" }}
                  >
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <h3
                    style={{
                      fontSize: "var(--text-lg)",
                      lineHeight: "var(--leading-lg)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    Last Contact
                  </h3>
                </div>

                <div>
                  <Label htmlFor="last_contact" className="label-refined">
                    Last Contact Date
                  </Label>
                  <Input
                    id="last_contact"
                    type="date"
                    value={formData.last_contact}
                    onChange={(e) => handleInputChange("last_contact", e.target.value)}
                    className="input-refined"
                    style={{
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--border)",
                      fontSize: "var(--text-base)",
                      fontWeight: "var(--font-weight-normal)",
                      padding: "16px",
                    }}
                  />
                  <p className="text-xs text-text-secondary mt-2">
                    {Object?.keys(contact)?.length 
                      ? "Update the last contact date for this contact"
                      : "Leave empty to automatically set to today's date"
                    }
                  </p>
                </div>
              </div>

              {/* Notes Section - Leo Enhanced */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-2 border-b border-border/30">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "var(--primary-surface)" }}
                  >
                    <AlertCircle className="h-4 w-4 text-primary" />
                  </div>
                  <h3
                    style={{
                      fontSize: "var(--text-lg)",
                      lineHeight: "var(--leading-lg)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    Notes
                  </h3>
                </div>

                <div>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Add any additional information about this contact..."
                    rows={4}
                    className="input-refined resize-none"
                    style={{
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--border)",
                      fontSize: "var(--text-base)",
                      fontWeight: "var(--font-weight-normal)",
                      padding: "16px",
                      lineHeight: "1.5",
                    }}
                  />
                </div>
              </div>

              {/* Tags Section - Leo Enhanced */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-2 border-b border-border/30">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "var(--primary-surface)" }}
                  >
                    <Tag className="h-4 w-4 text-primary" />
                  </div>
                  <h3
                    style={{
                      fontSize: "var(--text-lg)",
                      lineHeight: "var(--leading-lg)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    Tags
                  </h3>
                </div>

                {/* Selected Tags - Leo Enhanced */}
                {formData.tags.length > 0 && (
                  <div>
                    <Label
                      style={{
                        fontSize: "var(--text-sm)",
                        lineHeight: "var(--leading-sm)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--text-primary)",
                        display: "block",
                        marginBottom: "12px",
                      }}
                    >
                      Selected Tags
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge
                          key={tag}
                          className="tag-orange cursor-pointer hover:bg-error/10 hover:border-error hover:text-error transition-all duration-200 px-3 py-1"
                          onClick={() => handleRemoveTag(tag)}
                          style={{
                            borderRadius: "var(--radius-lg)",
                            fontSize: "var(--text-sm)",
                            fontWeight: "var(--font-weight-medium)",
                          }}
                        >
                          {tag}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Tag - Leo Enhanced */}
                <div>
                  <Label
                    style={{
                      fontSize: "var(--text-sm)",
                      lineHeight: "var(--leading-sm)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--text-primary)",
                      display: "block",
                      marginBottom: "12px",
                    }}
                  >
                    Add Tags
                  </Label>
                  <div className="flex space-x-3">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Enter a tag..."
                      className="input-refined flex-1"
                      style={{
                        height: "44px",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--border)",
                        fontSize: "var(--text-base)",
                        fontWeight: "var(--font-weight-normal)",
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                      className="h-11 px-4 rounded-xl border-border hover:bg-primary-surface hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Existing Tags - Leo Enhanced */}
                {existingTags.length > 0 && (
                  <div>
                    <Label
                      style={{
                        fontSize: "var(--text-sm)",
                        lineHeight: "var(--leading-sm)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--text-primary)",
                        display: "block",
                        marginBottom: "12px",
                      }}
                    >
                      Or choose from existing tags
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {existingTags
                        .filter((tag) => !formData.tags.includes(tag))
                        .map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="cursor-pointer hover:bg-primary-surface hover:border-primary hover:text-primary transition-all duration-200 px-3 py-1"
                            onClick={() => handleExistingTagSelect(tag)}
                            style={{
                              borderRadius: "var(--radius-lg)",
                              fontSize: "var(--text-sm)",
                              fontWeight: "var(--font-weight-medium)",
                            }}
                          >
                            {tag}
                            <Plus className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer - Premium Leo Design */}
            <div
              className="px-8 py-6 border-t border-border flex justify-end space-x-4"
              style={{
                background:
                  "linear-gradient(135deg, var(--surface) 0%, var(--primary-light) 1%, var(--surface) 100%)",
              }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="h-12 px-6 rounded-xl border-border hover:bg-surface-hover transition-all duration-200"
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="btn-primary h-12 px-8 rounded-xl flex items-center space-x-2 min-w-[140px]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)",
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-weight-semibold)",
                  boxShadow: "0 4px 16px rgba(242, 101, 34, 0.25)",
                }}
              >
                <Check className="h-4 w-4" />
                <span>
                  {isUpdating
                    ? Object?.keys(contact)?.length
                      ? "Updating..."
                      : "Adding..."
                    : Object?.keys(contact)?.length
                    ? "Update Contact"
                    : "Add Contact"}
                </span>{" "}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Custom Leo Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
}
