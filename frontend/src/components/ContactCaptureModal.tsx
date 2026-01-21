import React, { useState } from "react";
import { X, User, Mail, Phone, Building, Briefcase, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { cardApi, ContactCaptureField } from "../api/cardApi";
import { useToast } from "./ui/toast";

interface ContactCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardProfileLink: string;
  headerMessage: string;
  allowSkip: boolean;
  fields: ContactCaptureField[];
  cardOwnerName?: string;
}

const getFieldIcon = (fieldName: string) => {
  switch (fieldName) {
    case "full_name":
      return <User className="w-4 h-4" />;
    case "email":
      return <Mail className="w-4 h-4" />;
    case "phone":
      return <Phone className="w-4 h-4" />;
    case "company":
      return <Building className="w-4 h-4" />;
    case "job_title":
      return <Briefcase className="w-4 h-4" />;
    default:
      return <User className="w-4 h-4" />;
  }
};

const getFieldPlaceholder = (fieldName: string, fieldLabel: string) => {
  switch (fieldName) {
    case "full_name":
      return "Enter your full name";
    case "email":
      return "Enter your email address";
    case "phone":
      return "Enter your phone number";
    case "company":
      return "Enter your company name";
    case "job_title":
      return "Enter your job title";
    default:
      return `Enter your ${fieldLabel.toLowerCase()}`;
  }
};

export function ContactCaptureModal({
  isOpen,
  onClose,
  cardProfileLink,
  headerMessage,
  allowSkip,
  fields,
  cardOwnerName,
}: ContactCaptureModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  // Check if user has already submitted the form for this card
  const getStorageKey = () => `contact_submitted_${cardProfileLink}`;

  const hasAlreadySubmitted = () => {
    try {
      return localStorage.getItem(getStorageKey()) === "true";
    } catch {
      return false;
    }
  };

  const markAsSubmitted = () => {
    try {
      localStorage.setItem(getStorageKey(), "true");
    } catch {
      // Silently fail if localStorage is not available
    }
  };
  // Don't show modal if user has already submitted or if not open
  if (!isOpen || hasAlreadySubmitted()) return null;

  const enabledFields = fields.filter((f) => f.enabled);
  const requiredFields = allowSkip
    ? []
    : enabledFields.filter((f) => f.required);

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    requiredFields.forEach((field) => {
      if (!formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    const emailField = enabledFields.find((f) => f.name === "email");
    if (emailField && formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Single API call that handles contact creation and lead tracking
      const submitData = {
        ...formData,
        card_profile_link: cardProfileLink,
      };

      const response = await cardApi.submitContactForm(
        cardProfileLink,
        submitData
      );

      // Mark as submitted in localStorage
      markAsSubmitted();

      addToast({
        type: "success",
        title: "Thank you!",
        message: "Your information has been submitted successfully.",
      });

      onClose(); // close modal
    } catch (err: any) {
      console.error("Failed to submit contact form:", err);
      addToast({
        type: "error",
        title: "Submission Failed",
        message:
          err?.response?.data?.error?.message ||
          err?.message ||
          "Failed to submit form. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Connect with {cardOwnerName || "me"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{headerMessage}</p>
            </div>
            {allowSkip && (
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {enabledFields.map((field) => (
              <div key={field.name}>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  {getFieldIcon(field.name)}
                  {field.label}
                  {!allowSkip && field.required && (
                    <span className="text-red-500">*</span>
                  )}
                </Label>

                {field.type === "textarea" ? (
                  <Textarea
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      handleInputChange(field.name, e.target.value)
                    }
                    placeholder={getFieldPlaceholder(field.name, field.label)}
                    className={`mt-1 ${
                      errors[field.name] ? "border-red-500" : ""
                    }`}
                    rows={3}
                  />
                ) : (
                  <Input
                    type={field.type}
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      handleInputChange(field.name, e.target.value)
                    }
                    placeholder={getFieldPlaceholder(field.name, field.label)}
                    className={`mt-1 ${
                      errors[field.name] ? "border-red-500" : ""
                    }`}
                  />
                )}

                {errors[field.name] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            {allowSkip && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
              >
                Skip for now
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Your information will be shared with{" "}
            {cardOwnerName || "the card owner"} and used to connect with you.
          </p>
        </form>
      </div>
    </div>
  );
}
