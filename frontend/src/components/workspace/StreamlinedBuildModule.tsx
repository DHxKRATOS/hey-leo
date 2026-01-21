import {
  ArrowLeft,
  Check,
  ChevronDown,
  Circle,
  Code,
  Copy,
  Download,
  Eye,
  Lightbulb,
  Link2,
  Loader2,
  Monitor,
  Plus,
  QrCode,
  Smartphone,
  Tablet,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import QRCode from "qrcode";
import React, { useCallback, useEffect, useState } from "react";
import { cardApi, ContactCaptureField } from "../../api/cardApi";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  clearError,
  fetchCardById,
  updateCard,
  updateCardWithFile,
} from "../../store/cardSlice";
import { EndUserView } from "../EndUserView";
import { ResponsiveCardRenderer } from "../ResponsiveCardRenderer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/toast";

interface StreamlinedBuildModuleProps {
  card?: any;
  selectedCard?: any;
  onBack?: () => void;
  onSave?: (cardData: any) => void;
  onUpdate?: (updates: any) => void;
  user?: any;
  userProfile?: any;
  onModuleChange?: (module: "build" | "train" | "improve") => void;
  showPreviewModal?: boolean;
  onPreviewModalChange?: (show: boolean) => void;
  navigationToTab?: string | null;
  onTabNavigated?: () => void;
}

interface LinkItem {
  id: string;
  icon: string;
  name: string;
  url: string;
  platform?: string;
}

// Popular platforms for quick adding
const POPULAR_PLATFORMS = [
  {
    id: "linkedin",
    icon: "💼",
    name: "LinkedIn",
    placeholder: "linkedin.com/in/yourname",
  },
  {
    id: "twitter",
    icon: "🐦",
    name: "Twitter",
    placeholder: "twitter.com/yourname",
  },
  {
    id: "instagram",
    icon: "📸",
    name: "Instagram",
    placeholder: "instagram.com/yourname",
  },
  {
    id: "calendly",
    icon: "📅",
    name: "Calendly",
    placeholder: "calendly.com/yourname",
  },
  {
    id: "portfolio",
    icon: "💳",
    name: "Portfolio",
    placeholder: "yourportfolio.com",
  },
  {
    id: "website",
    icon: "🌐",
    name: "Website",
    placeholder: "yourwebsite.com",
  },
];

const COLOR_THEMES = [
  { id: "professional", name: "Professional", color: "#2563EB" },
  { id: "modern", name: "Modern", color: "#6B7280" },
  { id: "leo", name: "Leo", color: "#F26522" },
  { id: "vibrant", name: "Vibrant", color: "#10B981" },
  { id: "creative", name: "Creative", color: "#8B5CF6" },
  { id: "elegant", name: "Elegant", color: "#EF4444" },
];

const LAYOUT_OPTIONS = [
  { id: "standard", name: "Standard" },
  { id: "left-aligned", name: "Left-aligned" },
  { id: "right-aligned", name: "Right-aligned" },
];

const BACKGROUND_ENHANCEMENTS = [
  { id: "soft", name: "Soft" },
  { id: "gradient", name: "Gradient" },
  { id: "pattern", name: "Pattern" },
  { id: "custom", name: "Custom" },
];

const ACCENT_COLORS = [
  "#2563EB",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

const TYPOGRAPHY_STYLES = [
  { id: "classic", name: "Classic", description: "Timeless and professional" },
  { id: "modern", name: "Modern", description: "Clean and contemporary" },
  { id: "creative", name: "Creative", description: "Bold and expressive" },
];

export function StreamlinedBuildModule({
  card,
  selectedCard,
  onBack,
  onSave,
  onUpdate,
  user,
  userProfile,
  onModuleChange,
  showPreviewModal,
  onPreviewModalChange,
  navigationToTab,
  onTabNavigated,
}: StreamlinedBuildModuleProps) {
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const { currentCard, isLoading, isUpdating, error } = useAppSelector(
    (state) => state.cards
  );
  const [activeTab, setActiveTab] = useState("About");
  const [selectedDevice, setSelectedDevice] = useState("mobile");
  const [showPreview, setShowPreview] = useState(false);
  const [deviceSwitching, setDeviceSwitching] = useState(false);

  // QR Code and Embed functionality state
  const [showQRModal, setShowQRModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [generatingQR, setGeneratingQR] = useState(false);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<{
    urlSharing: boolean;
    qrCode: boolean;
    embedCode: boolean;
  }>({ urlSharing: false, qrCode: false, embedCode: false });

  // Contact Capture tab state
  const [contactCaptureEnabled, setContactCaptureEnabled] = useState(false);
  const [allowSkip, setAllowSkip] = useState(true); // Optional by default
  const [headerMessage, setHeaderMessage] = useState(
    "Share your info back with me!"
  );
  const [contactCaptureFields, setContactCaptureFields] = useState<
    ContactCaptureField[]
  >([
    {
      name: "full_name",
      label: "Full Name",
      type: "text",
      required: true,
      enabled: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      enabled: true,
    },
    {
      name: "phone",
      label: "Phone",
      type: "tel",
      required: false,
      enabled: false,
    },
    {
      name: "company",
      label: "Company",
      type: "text",
      required: false,
      enabled: false,
    },
    {
      name: "job_title",
      label: "Job Title",
      type: "text",
      required: false,
      enabled: false,
    },
  ]);
  const [isUpdatingContactCapture, setIsUpdatingContactCapture] =
    useState(false);

  // Card data state - initialize from Redux currentCard or fallback to props
  const [cardData, setCardData] = useState(() => {
    const sourceCard = currentCard || card || selectedCard;
    const fullName =
      sourceCard?.first_name && sourceCard?.last_name
        ? `${sourceCard.first_name} ${sourceCard.last_name}`.trim()
        : sourceCard?.profile?.full_name ||
          userProfile?.full_name ||
          user?.name ||
          "";

    return {
      id: sourceCard?.id || "new-card",
      profile: {
        full_name: fullName,
        job_title:
          sourceCard?.job_title ||
          sourceCard?.profile?.job_title ||
          userProfile?.job_title ||
          "",
        company:
          sourceCard?.company ||
          sourceCard?.profile?.company ||
          userProfile?.company ||
          "",
        email:
          sourceCard?.email || sourceCard?.profile?.email || user?.email || "",
        phone: sourceCard?.phone || sourceCard?.profile?.phone || "",
        bio:
          sourceCard?.description ||
          sourceCard?.profile?.bio ||
          userProfile?.bio ||
          "",
        profile_photo_url:
          typeof sourceCard?.card_profile_image === "string"
            ? sourceCard.card_profile_image
            : sourceCard?.profile?.profile_photo_url ||
              userProfile?.avatar_url ||
              "",
        ai_chat_enabled: true, // Default to true
        // Legacy field mapping for compatibility
        fullName: fullName,
        jobTitle:
          sourceCard?.job_title ||
          sourceCard?.profile?.job_title ||
          userProfile?.job_title ||
          "",
        photo:
          typeof sourceCard?.card_profile_image === "string"
            ? sourceCard.card_profile_image
            : sourceCard?.profile?.profile_photo_url ||
              userProfile?.avatar_url ||
              null,
      },
      design: {
        colorScheme: "leo-orange", // Default since not in CardData interface
        fontFamily: "Inter",
        fontSize: "medium",
        fontWeight: sourceCard?.design?.fontWeight || "medium",
        template: sourceCard?.design?.template || "leo-classic",
        theme: sourceCard?.design?.theme || "leo",
        colors: {
          primary: sourceCard?.design?.colors?.primary || "#F26522",
          secondary: sourceCard?.design?.colors?.secondary || "#E85A17",
          background: sourceCard?.design?.colors?.background || "#FFFFFF",
          text: sourceCard?.design?.colors?.text || "#1A1A1A",
        },
        fonts: {
          heading: sourceCard?.design?.fonts?.heading || "Inter",
          body: sourceCard?.design?.fonts?.body || "Inter",
        },
        spacing: sourceCard?.design?.spacing || 50,
        corners: sourceCard?.design?.corners || "rounded",
        shadows: sourceCard?.design?.shadows || "subtle",
        layout: sourceCard?.design?.layout || "standard",
        accentColor: sourceCard?.design?.accentColor || "#F26522",
        typography: sourceCard?.design?.typography || "classic",
        background: sourceCard?.design?.background || "soft",
      },
      links: sourceCard?.links || [],
      settings: {
        ai_chat_enabled:
          sourceCard?.profile?.ai_chat_enabled !== false ? true : false,
      },
    };
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  // Profile link editing state
  const [isEditingProfileLink, setIsEditingProfileLink] = useState(false);
  const [editedProfileLink, setEditedProfileLink] = useState("");
  const [isUpdatingProfileLink, setIsUpdatingProfileLink] = useState(false);
  const [profileLinkError, setProfileLinkError] = useState("");

  // Profile link validation function
  const validateProfileLink = (link: string): string => {
    if (!link.trim()) return "Profile link cannot be empty";

    const sanitized = link.trim().toLowerCase();

    // Check length
    if (sanitized.length < 3)
      return "Profile link must be at least 3 characters";
    if (sanitized.length > 50)
      return "Profile link must be less than 50 characters";

    // Check format - only alphanumeric, hyphens, and underscores
    if (!/^[a-z0-9_-]+$/.test(sanitized)) {
      return "Only letters, numbers, hyphens, and underscores allowed";
    }

    // Check for reserved words
    const reserved = [
      "admin",
      "api",
      "www",
      "app",
      "dashboard",
      "login",
      "signup",
      "profile",
      "settings",
    ];
    if (reserved.includes(sanitized)) return "This profile link is reserved";

    return "";
  };

  // Handle profile link input change with validation
  const handleProfileLinkChange = (value: string) => {
    setEditedProfileLink(value);
    const error = validateProfileLink(value);
    setProfileLinkError(error);
  };

  // Profile link update function
  const handleUpdateProfileLink = async () => {
    if (!currentCard?.id || !editedProfileLink.trim()) return;

    const validationError = validateProfileLink(editedProfileLink);
    if (validationError) {
      setProfileLinkError(validationError);
      return;
    }

    setIsUpdatingProfileLink(true);
    setProfileLinkError("");

    try {
      const sanitizedLink = editedProfileLink.trim().toLowerCase();
      const updatedCardData = {
        card_profile_link: sanitizedLink,
      };

      await dispatch(
        updateCard({ id: currentCard.id, cardData: updatedCardData })
      );

      addToast({
        type: "success",
        title: "Profile link updated successfully!",
        message: "",
      });

      setIsEditingProfileLink(false);
    } catch (error: any) {
      console.error("Error updating profile link:", error);

      // Handle specific backend errors
      const errorMessage = error?.response?.data?.message || error?.message;
      if (
        errorMessage?.includes("already exists") ||
        errorMessage?.includes("unique")
      ) {
        setProfileLinkError("This profile link is already taken");
      } else {
        addToast({
          type: "error",
          title: "Failed to update profile link",
          message: "Please try again.",
        });
      }
    } finally {
      setIsUpdatingProfileLink(false);
    }
  };

  // QR Code generation function
  const generateQRCode = useCallback(async (url: string) => {
    setGeneratingQR(true);
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      addToast({
        type: "error",
        title: "Failed to generate QR code",
        message: "Please try re-generate QR codee",
      });
    } finally {
      setGeneratingQR(false);
    }
  }, []);

  // Download QR code function
  const downloadQRCode = useCallback(() => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement("a");
    link.download = `${cardData.profile.full_name || "card"}-qr-code.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({
      type: "success",
      title: "Success",
      message: "QR code downloaded!",
    });
  }, [qrCodeDataUrl, cardData.profile.full_name]);

  // Generate embed code
  const generateEmbedCode = useCallback((url: string) => {
    const iframeCode = `<iframe src="${url}" width="400" height="600" frameborder="0" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></iframe>`;
    const scriptCode = `<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${url}';
    iframe.width = '400';
    iframe.height = '600';
    iframe.frameBorder = '0';
    iframe.style.borderRadius = '12px';
    iframe.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    document.getElementById('leo-card-embed').appendChild(iframe);
  })();
</script>
<div id="leo-card-embed"></div>`;

    return { iframeCode, scriptCode };
  }, []);

  // Copy embed code to clipboard
  const copyEmbedCode = useCallback((code: string, type: string) => {
    navigator.clipboard.writeText(code);
    addToast({
      type: "success",
      title: "Success",
      message: `${type} code copied to clipboard!`,
    });
  }, []);

  // Handle QR code modal
  const handleShowQRCode = useCallback(
    async (url: string) => {
      await generateQRCode(url);
      setShowQRModal(true);
    },
    [generateQRCode]
  );

  // Handle embed code modal
  const handleShowEmbedCode = useCallback(() => {
    setShowEmbedModal(true);
  }, []);

  // Update local cardData when Redux currentCard changes
  useEffect(() => {
    if (currentCard) {
      const updatedCardData = {
        id: currentCard.id,
        profile: {
          full_name: `${currentCard.first_name || ""} ${
            currentCard.last_name || ""
          }`.trim(),
          job_title: currentCard.job_title || "",
          company: currentCard.company || "",
          email: currentCard.email || "",
          phone: currentCard.phone || "",
          bio: currentCard.description || "",
          profile_photo_url:
            typeof currentCard.card_profile_image === "string"
              ? currentCard.card_profile_image
              : "",
          ai_chat_enabled: true, // Default to true since it's not in CardData interface
          // Legacy field mapping
          fullName: `${currentCard.first_name || ""} ${
            currentCard.last_name || ""
          }`.trim(),
          jobTitle: currentCard.job_title || "",
          photo:
            typeof currentCard.card_profile_image === "string"
              ? currentCard.card_profile_image
              : null,
        },
        design: {
          colorScheme: "leo-orange", // Default since not in CardData interface
          fontFamily: "Inter",
          fontSize: "medium",
          fontWeight: "medium",
          template: "leo-classic",
          theme: "leo",
          colors: {
            primary: "#F26522",
            secondary: "#E85A17",
            background: "#FFFFFF",
            text: "#1A1A1A",
          },
          fonts: {
            heading: "Inter",
            body: "Inter",
          },
          spacing: 50,
          corners: "rounded",
          shadows: "subtle",
          layout: "standard",
          accentColor: "#F26522",
          typography: "classic",
          background: "soft",
        },
        links: currentCard?.custom_links, // Default since not in CardData interface
        settings: {
          ai_chat_enabled: true,
        },
      };
      setCardData(updatedCardData);
      setHasChanges(false);

      // Initialize contact capture settings from currentCard
      setContactCaptureEnabled(currentCard.contact_capture_enabled || false);
      setAllowSkip(currentCard.contact_capture_allow_skip !== false);
      setHeaderMessage(
        currentCard.contact_capture_header_message ||
          "Share your info back with me!"
      );
      if (
        currentCard.contact_capture_fields &&
        Array.isArray(currentCard.contact_capture_fields)
      ) {
        setContactCaptureFields(currentCard.contact_capture_fields);
      }
    }
  }, [currentCard]);

  // Clear errors on mount
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [dispatch, error]);

  // Handle contact capture settings update
  const handleContactCaptureUpdate = async (
    overrides?: Partial<{
      enabled: boolean;
      allowSkip: boolean;
      headerMessage: string;
      fields: typeof contactCaptureFields;
    }>
  ) => {
    if (!cardData.id || cardData.id === "new-card") {
      addToast({
        type: "error",
        title: "Error",
        message: "No card selected to update",
      });
      return;
    }

    setIsUpdatingContactCapture(true);
    try {
      await cardApi.updateContactCapture(cardData.id, {
        contact_capture_enabled: overrides?.enabled ?? contactCaptureEnabled,
        contact_capture_allow_skip: overrides?.allowSkip ?? allowSkip,
        contact_capture_header_message:
          overrides?.headerMessage ?? headerMessage,
        contact_capture_fields: overrides?.fields ?? contactCaptureFields,
      });

      addToast({
        type: "success",
        title: "Success",
        message: "Contact capture settings updated successfully",
      });

      if (cardData.id) {
        dispatch(fetchCardById(cardData.id));
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update contact capture settings",
      });
    } finally {
      setIsUpdatingContactCapture(false);
    }
  };

  // Editable field handler
  const handleFieldChange = (
    fieldName: string,
    key: keyof ContactCaptureField,
    value: string | boolean
  ) => {
    setContactCaptureFields((prev) => {
      const updated = prev.map((field) =>
        field.name === fieldName ? { ...field, [key]: value } : field
      );

      // API ko latest fields bhejna
      handleContactCaptureUpdate({ fields: updated });

      return updated;
    });
  };

  // Add new contact capture field
  const handleAddContactField = () => {
    const newField: ContactCaptureField = {
      name: `custom_field_${Date.now()}`,
      label: "Custom Field",
      type: "text",
      required: false,
      enabled: true,
    };
    setContactCaptureFields((prev) => [...prev, newField]);
  };

  // Remove contact capture field
  const handleRemoveContactField = (fieldName: string) => {
    // setContactCaptureFields((prev) =>
    //   prev.filter((field) => field.name !== fieldName)
    // );

    setContactCaptureFields((prev) => {
      const updated = prev.filter((field) => field.name !== fieldName);

      // API ko latest fields bhejna
      handleContactCaptureUpdate({ fields: updated });

      return updated;
    });
  };

  // Handle save functionality with file upload support
  const handleSave = async (profileImageFile?: File) => {
    if (!cardData.id || cardData.id === "new-card") {
      addToast({
        type: "error",
        title: "Error",
        message: "No card selected to update",
      });
      return;
    }

    try {
      // Split full_name into first_name and last_name for CardData interface
      const nameParts = cardData.profile.full_name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Use updateCardWithFile if there's a profile image file, otherwise use regular updateCard
      if (profileImageFile) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append("first_name", firstName);
        formData.append("last_name", lastName);
        formData.append("job_title", cardData.profile.job_title || "");
        formData.append("company", cardData.profile.company || "");
        formData.append("email", cardData.profile.email || "");
        formData.append("phone", cardData.profile.phone || "");
        formData.append("description", cardData.profile.bio || "");
        formData.append(
          "card_name",
          `${firstName} ${lastName}`.trim() || "Business Card"
        );
        formData.append("card_creation_type", "email");
        formData.append("custom_links", JSON.stringify(cardData.links || []));
        formData.append("card_profile_image", profileImageFile);

        await dispatch(
          updateCardWithFile({
            id: cardData.id,
            formData: formData,
          })
        ).unwrap();
      } else {
        const updatePayload = {
          first_name: firstName,
          last_name: lastName,
          job_title: cardData.profile.job_title,
          company: cardData.profile.company,
          email: cardData.profile.email,
          phone: cardData.profile.phone,
          description: cardData.profile.bio,
          // Add other required fields with defaults
          card_name: `${firstName} ${lastName}`.trim() || "Business Card",
          card_creation_type: "email" as const,
          custom_links: cardData.links,
        };

        await dispatch(
          updateCard({ id: cardData.id, cardData: updatePayload })
        ).unwrap();
      }

      setHasChanges(false);
      addToast({
        type: "success",
        title: "Success",
        message: "Card updated successfully!",
      });
      onSave?.(cardData);
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update card. Please try again.",
      });
    }
  };

  // Update card data handler
  const handleCardDataUpdate = (updates: any) => {
    setCardData((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
    onUpdate?.(updates);
  };

  // Profile update handler - now triggers on blur instead of change
  const handleProfileUpdate = (field: string, value: string) => {
    const newProfile = { ...cardData.profile, [field]: value };
    handleCardDataUpdate({ profile: newProfile });
  };

  // Handle profile field blur - triggers save
  const handleProfileBlur = async (field: string, value: string) => {
    handleProfileUpdate(field, value);
    if (cardData.id !== "new-card") {
      await handleSave(profileImageFile);
    }
  };

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      setHasChanges(true);

      // Update preview URL immediately
      const previewUrl = URL.createObjectURL(file);
      handleProfileUpdate("profile_photo_url", previewUrl);
      handleProfileUpdate("photo", previewUrl);

      // Save with file
      if (cardData.id !== "new-card") {
        await handleSave(file);
      }
    }
  };

  // Design update handler
  const handleDesignUpdate = (field: string, value: any) => {
    let newDesign = { ...cardData.design, [field]: value };

    // Update colors when theme changes
    if (field === "theme") {
      const themeColors = COLOR_THEMES.find((t) => t.id === value);
      if (themeColors) {
        newDesign.colors = {
          ...newDesign.colors,
          primary: themeColors.color,
          secondary: themeColors.color,
        };
        newDesign.accentColor = themeColors.color;
      }
    }

    // Update primary color when accent color changes
    if (field === "accentColor") {
      newDesign.colors = {
        ...newDesign.colors,
        primary: value,
        secondary: value,
      };
    }

    handleCardDataUpdate({ design: newDesign });
  };

  // Links update handler
  const handleLinksUpdate = (newLinks: any[]) => {
    handleCardDataUpdate({ links: newLinks });
  };

  const addLink = (platform: any) => {
    const newLink: LinkItem = {
      id: Date.now().toString(),
      icon: platform.icon,
      name: platform.name,
      url: "",
      platform: platform.id,
    };
    const updatedLinks = [...(cardData.links || []), newLink];
    handleLinksUpdate(updatedLinks);
  };

  // Enhanced device switching with smooth transitions
  const handleDeviceSwitch = (device: string) => {
    setDeviceSwitching(true);
    setTimeout(() => {
      setSelectedDevice(device);
      setDeviceSwitching(false);
    }, 150);
  };

  // Device preview frame configurations
  const getDeviceFrame = () => {
    switch (selectedDevice) {
      case "desktop":
        return {
          width: "1000px",
          height: "700px",
          className: "desktop-frame",
          scale: 0.7,
        };
      case "tablet":
        return {
          width: "600px",
          height: "800px",
          className: "tablet-frame",
          scale: 0.8,
        };
      case "mobile":
      default:
        return {
          width: "375px",
          height: "667px",
          className: "mobile-frame",
          scale: 1,
        };
    }
  };

  // Handle card chat click for preview mode
  const handleChatClick = useCallback(() => {
    addToast({
      type: "success",
      title: "🦁 Leo AI Assistant preview!",
      message:
        "In live mode, visitors can chat with your AI-powered professional assistant.",
      duration: 3000,
      action: {
        label: "Configure AI",
        onClick: () => onModuleChange?.("train"),
      },
    });
  }, [onModuleChange]);

  // Enhanced keyboard handling for preview modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showPreview && event.key === "Escape") {
        setShowPreview(false);
      }
      if (
        showPreview &&
        (event.key === "1" || event.key === "2" || event.key === "3")
      ) {
        const deviceMap = {
          "1": "mobile",
          "2": "tablet",
          "3": "desktop",
        } as const;
        handleDeviceSwitch(deviceMap[event.key as keyof typeof deviceMap]);
      }
    };

    if (showPreview) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [showPreview]);

  // Sync external preview modal control
  useEffect(() => {
    if (showPreviewModal !== undefined) {
      setShowPreview(showPreviewModal);
    }
  }, [showPreviewModal]);

  // Notify parent when preview modal state changes
  useEffect(() => {
    onPreviewModalChange?.(showPreview);
  }, [showPreview, onPreviewModalChange]);

  // Handle navigation to specific tab from parent - Enhanced for cross-module navigation
  useEffect(() => {
    if (navigationToTab && navigationToTab !== activeTab) {
      setActiveTab(navigationToTab);
      onTabNavigated?.();

      addToast({
        type: "success",
        title: `🦁 Navigated to ${navigationToTab} tab!`,
        message: "Ready to configure your card sharing settings",
      });
    }
  }, [navigationToTab, activeTab, onTabNavigated]);

  // Render premium device frame components
  const renderDesktopFrame = (children: React.ReactNode) => (
    <div
      className="desktop-frame relative bg-white rounded-lg shadow-2xl overflow-hidden"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Browser Chrome */}
      <div className="browser-header h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4">
        {/* Traffic Lights */}
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>

        {/* URL Bar */}
        <div className="flex-1 mx-4">
          <div className="bg-white rounded-md px-3 py-1 text-xs text-gray-600 border border-gray-200">
            heyleo.ai/
            {cardData.profile.full_name?.toLowerCase().replace(" ", "-") ||
              "username"}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden bg-gray-50">{children}</div>
    </div>
  );

  const renderTabletFrame = (children: React.ReactNode) => (
    <div
      className="tablet-frame relative bg-black rounded-[20px] p-3 shadow-2xl"
      style={{ width: "100%", height: "100%" }}
    >
      <div className="w-full h-full bg-white rounded-[16px] overflow-hidden">
        {children}
      </div>
    </div>
  );

  const renderMobileFrame = (children: React.ReactNode) => (
    <div
      className="mobile-frame relative bg-black rounded-[25px] p-2 shadow-2xl"
      style={{ width: "100%", height: "100%" }}
    >
      {/* iPhone Notch */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-10"></div>

      <div className="w-full h-full bg-white rounded-[20px] overflow-hidden">
        {children}
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-60"></div>
    </div>
  );

  const renderDeviceFrame = (children: React.ReactNode) => {
    switch (selectedDevice) {
      case "desktop":
        return renderDesktopFrame(children);
      case "tablet":
        return renderTabletFrame(children);
      case "mobile":
      default:
        return renderMobileFrame(children);
    }
  };

  const renderAboutTab = () => (
    <div className="space-y-8">
      {/* Personal Information */}
      <div>
        <h3 className="font-semibold mb-1">Personal Information</h3>
        <p className="text-sm text-text-secondary mb-6">
          Essential details that will appear on your card
        </p>

        <div className="space-y-4">
          <div>
            <Label className="text-sm">Full Name *</Label>
            <Input
              value={cardData.profile.full_name}
              onChange={(e) => handleProfileUpdate("full_name", e.target.value)}
              onBlur={(e) => handleProfileBlur("full_name", e.target.value)}
              placeholder="John Doe"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm">Job Title *</Label>
            <Input
              value={cardData.profile.job_title}
              onChange={(e) => handleProfileUpdate("job_title", e.target.value)}
              onBlur={(e) => handleProfileBlur("job_title", e.target.value)}
              placeholder="Your job title"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm">Company</Label>
            <Input
              value={cardData.profile.company}
              onChange={(e) => handleProfileUpdate("company", e.target.value)}
              onBlur={(e) => handleProfileBlur("company", e.target.value)}
              placeholder="Your company"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Email</Label>
              <Input
                value={cardData.profile.email}
                onChange={(e) => handleProfileUpdate("email", e.target.value)}
                onBlur={(e) => handleProfileBlur("email", e.target.value)}
                placeholder="Your email address"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Phone</Label>
              <Input
                value={cardData.profile.phone}
                onChange={(e) => handleProfileUpdate("phone", e.target.value)}
                onBlur={(e) => handleProfileBlur("phone", e.target.value)}
                placeholder="Your phone number"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm">Bio</Label>
            <Textarea
              value={cardData.profile.bio}
              onChange={(e) => handleProfileUpdate("bio", e.target.value)}
              onBlur={(e) => handleProfileBlur("bio", e.target.value)}
              placeholder="Tell people about yourself..."
              rows={4}
              className="mt-1 resize-none"
            />
            <p className="text-xs text-text-tertiary mt-2">
              {cardData.profile.bio?.length || 0}/500 characters
            </p>
          </div>
        </div>
      </div>

      {/* Profile Photo */}
      <div>
        <h3 className="font-semibold mb-1">Profile Photo</h3>
        <p className="text-sm text-text-secondary mb-6">
          A professional photo makes your card more memorable
        </p>

        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-xl cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-4 text-text-tertiary" />
              <p className="mb-2 text-sm text-text-secondary">
                <span className="font-semibold">Upload your photo</span>
              </p>
              <p className="text-xs text-text-tertiary">
                Drag & drop or click to browse
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        <p className="text-xs text-text-tertiary mt-2">
          Recommended: Square format (1:1) at least 200x200px, Max file size:
          5MB
        </p>
      </div>

      {/* Your Links */}
      <div>
        <h3 className="font-semibold mb-1">Your Links</h3>
        <p className="text-sm text-text-secondary mb-6">
          Add links to your profiles and tools
        </p>

        <div className="mb-6">
          <p className="text-sm mb-4">Popular Platforms</p>
          <div className="grid grid-cols-3 gap-4">
            {POPULAR_PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                onClick={() => addLink(platform)}
                className="flex flex-col items-center p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <span className="text-2xl mb-2">{platform.icon}</span>
                <span className="text-sm font-medium">{platform.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Existing Links Management */}
        {cardData.links && cardData.links.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium mb-4">Your Links</p>
            <div className="space-y-3">
              {cardData.links.map((link, index) => (
                <div
                  key={link.id || index}
                  className="flex items-center space-x-3 p-3 bg-muted rounded-lg border"
                >
                  <span className="text-lg">{link.icon}</span>
                  <div className="flex-1">
                    <Input
                      value={link.name}
                      onChange={(e) => {
                        const updatedLinks = [...cardData.links];
                        updatedLinks[index] = { ...link, name: e.target.value };
                        handleLinksUpdate(updatedLinks);
                      }}
                      placeholder="Link name"
                      className="mb-2 h-8 text-sm"
                    />
                    <Input
                      value={link.url}
                      onChange={(e) => {
                        const updatedLinks = [...cardData.links];
                        updatedLinks[index] = { ...link, url: e.target.value };
                        handleLinksUpdate(updatedLinks);
                      }}
                      placeholder="Enter URL..."
                      className="h-8 text-sm"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updatedLinks = cardData.links.filter(
                        (_, i) => i !== index
                      );
                      handleLinksUpdate(updatedLinks);
                    }}
                    className="text-error hover:text-error"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Link Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            const newLink: LinkItem = {
              id: Date.now().toString(),
              icon: "🔗",
              name: "Custom Link",
              url: "",
              platform: "custom",
            };

            const updatedLinks = [
              ...(Object.keys(cardData.links) || []),
              newLink,
            ];
            handleLinksUpdate(updatedLinks);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Link
        </Button>

        {/* No links message */}
        {(!cardData.links || cardData.links.length === 0) && (
          <div className="text-center py-8 text-text-tertiary">
            <Circle className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No links added yet</p>
            <p className="text-xs">
              Choose popular platforms above to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDesignTab = () => (
    <div className="space-y-8">
      {/* Choose Your Style */}
      <div>
        <h3 className="font-semibold mb-1">Choose Your Style</h3>
        <p className="text-sm text-text-secondary mb-6">
          Select a color theme that matches your brand
        </p>

        <div className="grid grid-cols-3 gap-4">
          {COLOR_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleDesignUpdate("theme", theme.id)}
              className={`p-4 border-2 rounded-xl transition-all ${
                cardData.design.theme === theme.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div
                className="w-full h-12 rounded-lg mb-3"
                style={{ backgroundColor: theme.color }}
              >
                <div className="w-full h-full rounded-lg bg-white flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">🦁</span>
                </div>
              </div>
              <p className="text-sm font-medium">{theme.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Card Layout */}
      <div>
        <h3 className="font-semibold mb-1">Card Layout</h3>
        <p className="text-sm text-text-secondary mb-6">
          How would you like your information to be arranged?
        </p>

        <div className="grid grid-cols-3 gap-4">
          {LAYOUT_OPTIONS.map((layout) => (
            <button
              key={layout.id}
              onClick={() => handleDesignUpdate("layout", layout.id)}
              className={`p-4 border-2 rounded-xl aspect-[3/2] transition-all ${
                cardData.design.layout === layout.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="w-full h-full bg-accent/30 rounded-lg flex items-center justify-center">
                <span className="text-xs text-text-secondary">
                  {layout.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Background Enhancement */}
      <div>
        <h3 className="font-semibold mb-1">Background Enhancement</h3>
        <p className="text-sm text-text-secondary mb-6">
          Add depth and visual interest
        </p>

        <div className="grid grid-cols-4 gap-4">
          {BACKGROUND_ENHANCEMENTS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => handleDesignUpdate("background", bg.id)}
              className={`p-4 border-2 rounded-xl aspect-square transition-all ${
                cardData.design.background === bg.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="w-full h-full bg-accent/30 rounded-lg flex items-center justify-center">
                <span className="text-xs text-text-secondary">{bg.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <h3 className="font-semibold mb-1">Accent Color</h3>
        <p className="text-sm text-text-secondary mb-6">
          Pick buttons, links, and highlights
        </p>

        <div className="flex gap-3">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleDesignUpdate("accentColor", color)}
              className={`w-12 h-12 rounded-full border-2 transition-all ${
                cardData.design.accentColor === color
                  ? "border-white shadow-lg scale-110"
                  : "border-border hover:scale-105"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Typography Style */}
      <div>
        <h3 className="font-semibold mb-1">Typography Style</h3>
        <p className="text-sm text-text-secondary mb-6">
          Choose fonts that match your personality
        </p>

        <div className="space-y-3">
          {TYPOGRAPHY_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => handleDesignUpdate("typography", style.id)}
              className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                cardData.design.typography === style.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{style.name}</p>
                  <p className="text-sm text-text-secondary">
                    {style.description}
                  </p>
                </div>
                {cardData.design.typography === style.id && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content Spacing */}
      <div>
        <h3 className="font-semibold mb-1">Content Spacing</h3>
        <p className="text-sm text-text-secondary mb-6">
          Adjust the breathing room
        </p>

        <div className="space-y-4">
          <Slider
            value={[cardData.design.spacing]}
            onValueChange={([value]) => handleDesignUpdate("spacing", value)}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-text-secondary">
            <span>Tight</span>
            <span>Relaxed</span>
          </div>
        </div>
      </div>

      {/* Ask AI Button */}
      <div className="pt-4">
        <Button
          onClick={() => {
            addToast({
              type: "success",
              title: "🦁 AI styling suggestions coming soon!",
              message: "",
            });
          }}
          className="w-full bg-gradient-to-r from-primary to-primary-hover"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Ask AI
        </Button>
        <p className="text-xs text-text-tertiary text-center mt-2">
          Get AI suggestions for your card's styling
        </p>
      </div>
    </div>
  );

  const renderContactCaptureTab = () => {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold mb-2">Contacts Capture</h2>
          <p className="text-text-secondary">
            Collect visitor information when they view your card
          </p>
        </div>

        {/* Enable Contacts Capture Toggle */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Enable Contacts Capture</h3>
              <p className="text-sm text-text-secondary">
                When enabled, a form will popup as soon as your profile is
                shared
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-text-secondary">Off</span>
              <Switch
                checked={contactCaptureEnabled}
                onCheckedChange={(checked) => {
                  setContactCaptureEnabled(checked);
                  handleContactCaptureUpdate({ enabled: checked });
                }}
              />
              <span className="text-sm text-text-secondary">On</span>
            </div>
          </div>
        </div>

        {/* Enabled State Content */}
        {contactCaptureEnabled && (
          <>
            {/* Contacts Capture Active */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-1">
                    Contacts Capture Active
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Visitors will see a form when they access your card. You'll
                    receive their contact information automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Allow user to Skip */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold mb-1">Allow user to Skip</h3>
                  <p className="text-sm text-text-secondary">
                    Give visitors the option to skip the form if they prefer not
                    to share their information
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-sm ${
                      !allowSkip
                        ? "text-text-primary font-medium"
                        : "text-text-secondary"
                    }`}
                  >
                    Required
                  </span>
                  <Switch
                    checked={allowSkip}
                    onCheckedChange={(checked) => {
                      setAllowSkip(checked);
                      handleContactCaptureUpdate({ allowSkip: checked });
                    }}
                  />
                  <span
                    className={`text-sm ${
                      allowSkip
                        ? "text-text-primary font-medium"
                        : "text-text-secondary"
                    }`}
                  >
                    Optional
                  </span>
                </div>
              </div>

              {/* User-friendly Experience */}
              {allowSkip && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800 mb-1">
                        User-friendly Experience
                      </h4>
                      <p className="text-sm text-green-700">
                        Visitors can choose to skip the form and still access
                        your card. This creates a better user experience while
                        still capturing leads from interested visitors.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Header */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="mb-6">
                <h3 className="font-semibold mb-1">Form Header</h3>
                <p className="text-sm text-text-secondary">
                  Customize the message visitors see at the top of the form
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Header Message</Label>
                  <Input
                    value={headerMessage}
                    onChange={(e) => setHeaderMessage(e.target.value)}
                    onBlur={() => handleContactCaptureUpdate({ headerMessage })}
                    className="mt-2"
                    placeholder="Share your info back with me!"
                    maxLength={200}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-text-tertiary">
                      {headerMessage.length}/200 characters
                    </p>
                    <div className="flex items-center space-x-3">
                      <button
                        className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                        onClick={() => {
                          const fullName = cardData.profile.full_name || "me";
                          const newMessage = `Share your info back with ${fullName}!`;
                          setHeaderMessage(newMessage);
                          handleContactCaptureUpdate({
                            headerMessage: newMessage,
                          });
                        }}
                      >
                        Use my name
                      </button>
                      <button
                        className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                        onClick={() => {
                          const newMessage =
                            "Please share your contact information to connect with me.";
                          setHeaderMessage(newMessage);
                          handleContactCaptureUpdate({
                            headerMessage: newMessage,
                          });
                        }}
                      >
                        Professional
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Fields */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold mb-1">Input Fields</h3>
                  <p className="text-sm text-text-secondary">
                    Configure which information to collect from visitors
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddContactField}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add field
                </Button>
              </div>

              {/* Contact Capture Fields */}
              <div className="space-y-3">
                {contactCaptureFields.map((field, index) => (
                  <div
                    key={field.name}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-border rounded-xl space-y-2 md:space-y-0"
                  >
                    {/* Editable Inputs */}
                    <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1">
                      {/* Label */}
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) =>
                          handleFieldChange(field.name, "label", e.target.value)
                        }
                        className="border rounded-lg px-3 py-1 text-sm w-20"
                      />

                      {/* Required checkbox */}
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) =>
                            handleFieldChange(
                              field.name,
                              "required",
                              e.target.checked
                            )
                          }
                        />
                        Required
                      </label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!["full_name", "email"].includes(field.name) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveContactField(field.name)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Switch
                        checked={field.enabled}
                        onCheckedChange={(checked) =>
                          handleFieldChange(field.name, "enabled", checked)
                        }
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <div className="mt-6 pt-4 border-t border-border">
                <Button
                  onClick={() => handleContactCaptureUpdate()} // explicit call for clarity
                  disabled={isUpdatingContactCapture}
                  className="w-full"
                >
                  {isUpdatingContactCapture
                    ? "Saving..."
                    : "Save Contact Capture Settings"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderShareTab = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Share Your Card</h2>
        <p className="text-text-secondary">
          Choose how you want to share your digital business card with the world
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold">Quick Actions</h3>
          <button
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex gap-2">
            <Button
              className="flex-1 h-12 bg-primary hover:bg-primary-hover text-white font-medium"
              onClick={() => {
                if (currentCard) {
                  const url = `${window.location.origin}/${
                    currentCard.card_profile_link
                      ?.toLowerCase()
                      .replace(/\s+/g, "-") || "username"
                  }`;
                  navigator.clipboard.writeText(url);
                  addToast({
                    type: "success",
                    title: "Link copied to clipboard!",
                    message: "",
                  });
                }
              }}
            >
              <Link2 className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>
          <Button
            variant="outline"
            className="h-12 font-medium"
            onClick={() => {
              if (currentCard) {
                const url = `${window.location.origin}/${
                  currentCard.card_profile_link
                    ?.toLowerCase()
                    .replace(/\s+/g, "-") || "username"
                }`;
                handleShowQRCode(url);
              }
            }}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-1 h-1 bg-current rounded-sm"></div>
                <div className="w-1 h-1 bg-current rounded-sm"></div>
                <div className="w-1 h-1 bg-current rounded-sm"></div>
                <div className="w-1 h-1 bg-current rounded-sm"></div>
              </div>
            </div>
            Get QR Code
          </Button>
        </div>
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-4">
        {/* URL Sharing */}
        <div className="border border-border rounded-xl">
          <button
            className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
            onClick={() =>
              setExpandedSections((prev) => ({
                ...prev,
                urlSharing: !prev.urlSharing,
              }))
            }
          >
            <div className="flex items-center gap-3">
              <Link2 className="w-5 h-5 text-primary" />
              <span className="font-medium">URL Sharing</span>
            </div>
            <motion.div
              animate={{ rotate: expandedSections.urlSharing ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-text-secondary" />
            </motion.div>
          </button>
          <AnimatePresence>
            {expandedSections.urlSharing && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 border-t border-border">
                  <div className="space-y-3">
                    <p className="text-sm text-text-secondary">
                      Share your card with a direct link
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          if (currentCard) {
                            const url = `${window.location.origin}/${
                              currentCard.card_profile_link
                                ?.toLowerCase()
                                .replace(/\s+/g, "-") || "username"
                            }`;
                            navigator.clipboard.writeText(url);
                            addToast({
                              type: "success",
                              title: "Link copied to clipboard!",
                              message: "",
                            });
                          }
                        }}
                      >
                        <Link2 className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                    {currentCard && (
                      <div className="bg-accent/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-text-secondary">
                            Your card URL:
                          </p>
                          <button
                            onClick={() => {
                              setIsEditingProfileLink(!isEditingProfileLink);
                              setEditedProfileLink(
                                currentCard.card_profile_link || ""
                              );
                              setProfileLinkError("");
                            }}
                            className="text-xs text-primary hover:text-primary-hover transition-colors"
                          >
                            {isEditingProfileLink ? "Cancel" : "Edit"}
                          </button>
                        </div>

                        {isEditingProfileLink ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-text-secondary">
                                {window.location.origin}/
                              </span>
                              <Input
                                value={editedProfileLink}
                                onChange={(e) =>
                                  handleProfileLinkChange(e.target.value)
                                }
                                placeholder="your-custom-link"
                                className={`flex-1 h-8 text-sm font-mono ${
                                  profileLinkError
                                    ? "border-red-500 focus:border-red-500"
                                    : ""
                                }`}
                                disabled={isUpdatingProfileLink}
                                maxLength={50}
                              />
                            </div>

                            {/* Validation feedback */}
                            {profileLinkError && (
                              <p className="text-xs text-red-500 mt-1">
                                {profileLinkError}
                              </p>
                            )}

                            {/* Guidelines */}
                            <p className="text-xs text-text-secondary">
                              3-50 characters. Letters, numbers, hyphens, and
                              underscores only.
                            </p>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={handleUpdateProfileLink}
                                disabled={
                                  isUpdatingProfileLink ||
                                  !editedProfileLink.trim() ||
                                  !!profileLinkError
                                }
                                className="h-7 text-xs"
                              >
                                {isUpdatingProfileLink ? (
                                  <>
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-3 h-3 mr-1" />
                                    Save
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setIsEditingProfileLink(false);
                                  setProfileLinkError("");
                                }}
                                disabled={isUpdatingProfileLink}
                                className="h-7 text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm font-mono text-primary break-all">
                            {window.location.origin}/
                            {currentCard.card_profile_link
                              ?.toLowerCase()
                              .replace(/\s+/g, "-") || "username"}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* QR Code */}
        <div className="border border-border rounded-xl">
          <button
            className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
            onClick={() =>
              setExpandedSections((prev) => ({ ...prev, qrCode: !prev.qrCode }))
            }
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-primary flex items-center justify-center">
                <div className="grid grid-cols-3 gap-0.5">
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                </div>
              </div>
              <span className="font-medium">QR Code</span>
            </div>
            <motion.div
              animate={{ rotate: expandedSections.qrCode ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-text-secondary" />
            </motion.div>
          </button>
          <AnimatePresence>
            {expandedSections.qrCode && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 border-t border-border">
                  <div className="space-y-3">
                    <p className="text-sm text-text-secondary">
                      Generate a QR code for easy mobile sharing
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          if (currentCard) {
                            const url = `${window.location.origin}/${
                              currentCard.card_profile_link
                                ?.toLowerCase()
                                .replace(/\s+/g, "-") || "username"
                            }`;
                            handleShowQRCode(url);
                          }
                        }}
                        disabled={generatingQR}
                      >
                        {generatingQR ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <QrCode className="w-4 h-4 mr-2" />
                        )}
                        Generate QR Code
                      </Button>
                    </div>
                    {qrCodeDataUrl && (
                      <div className="bg-accent/30 rounded-lg p-3 text-center">
                        <img
                          src={qrCodeDataUrl}
                          alt="QR Code"
                          className="w-32 h-32 mx-auto mb-2 rounded-lg"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadQRCode}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Embed Code */}
        <div className="border border-border rounded-xl">
          <button
            className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
            onClick={() =>
              setExpandedSections((prev) => ({
                ...prev,
                embedCode: !prev.embedCode,
              }))
            }
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-primary flex items-center justify-center">
                <span className="text-sm font-mono">&lt;/&gt;</span>
              </div>
              <span className="font-medium">Embed Code</span>
            </div>
            <motion.div
              animate={{ rotate: expandedSections.embedCode ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-text-secondary" />
            </motion.div>
          </button>
          <AnimatePresence>
            {expandedSections.embedCode && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 border-t border-border">
                  <div className="space-y-3">
                    <p className="text-sm text-text-secondary">
                      Embed your card on websites and blogs
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={handleShowEmbedCode}
                      >
                        <Code className="w-4 h-4 mr-2" />
                        Get Embed Code
                      </Button>
                    </div>
                    {currentCard && (
                      <div className="space-y-2">
                        <div className="bg-accent/30 rounded-lg p-3">
                          <p className="text-xs text-text-secondary mb-1">
                            iframe Embed:
                          </p>
                          <code className="text-xs font-mono text-primary break-all">
                            {`<iframe src="${window.location.origin}/${
                              currentCard.card_profile_link
                                ?.toLowerCase()
                                .replace(/\s+/g, "-") || "username"
                            }" width="400" height="600" frameborder="0"></iframe>`}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Ready to Share */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-primary">Ready to Share?</h3>
            <p className="text-sm text-text-secondary">
              Your card is ready to make connections
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  if (currentCard) {
                    const url = `${window.location.origin}/${
                      currentCard.card_profile_link
                        ?.toLowerCase()
                        .replace(/\s+/g, "-") || "username"
                    }`;
                    navigator.clipboard.writeText(url);
                    addToast({
                      type: "success",
                      title: "Link copied to clipboard!",
                      message: "",
                    });
                  }
                }}
              >
                <Link2 className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary-hover text-white"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-background">
      <div className="flex flex-1">
        {/* Left Panel - Editor */}
        <div className="w-96 bg-surface border-r border-border overflow-y-auto">
          {/* Tab Navigation */}
          <div className="p-6 pb-0">
            <div className="flex space-x-1 bg-accent p-1 rounded-xl">
              {["About", "Contact Capture", "Share"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-background text-text-primary shadow-sm"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "About" && renderAboutTab()}
            {/* {activeTab === "Design" && renderDesignTab()} */}
            {activeTab === "Contact Capture" && renderContactCaptureTab()}
            {activeTab === "Share" && renderShareTab()}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-background">
          {/* Device Toggle */}
          <div className="h-16 border-b border-border flex items-center justify-between px-6">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="h-4 w-4 text-text-secondary" />
              <span className="text-sm text-text-secondary">Card Preview</span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isUpdating || isLoading}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  hasChanges && !isUpdating && !isLoading
                    ? "bg-primary hover:bg-primary-hover text-white shadow-md"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isUpdating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : hasChanges ? (
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </div>
                ) : (
                  <span>Saved</span>
                )}
              </Button>

              <div className="flex items-center space-x-1 bg-accent p-1 rounded-lg">
                {[
                  { id: "mobile", icon: Smartphone },
                  { id: "tablet", icon: Tablet },
                  { id: "desktop", icon: Monitor },
                ].map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleDeviceSwitch(id)}
                    className={`p-2 rounded-md transition-colors ${
                      selectedDevice === id
                        ? "bg-background text-text-primary shadow-sm"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 p-6 flex items-center justify-center">
            <div
              className="bg-background rounded-2xl shadow-2xl overflow-hidden"
              style={
                getDeviceFrame().width && getDeviceFrame().height
                  ? {
                      width: getDeviceFrame().width,
                      height: getDeviceFrame().height,
                    }
                  : { width: "375px", height: "667px" }
              }
            >
              {renderDeviceFrame(
                <ResponsiveCardRenderer
                  cardData={cardData}
                  device={selectedDevice}
                  onChatClick={handleChatClick}
                  isPreview={true}
                  viewMode="preview"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* End User View Modal - Enhanced Premium Design */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] overflow-hidden"
            style={{ isolation: "isolate" }}
          >
            {/* Dark Blurred Backdrop */}
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-black/80"
              onClick={() => setShowPreview(false)}
            />

            {/* Fixed Header Bar */}
            <motion.div
              initial={{ y: -64, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -64, opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50"
            >
              <div className="flex items-center justify-between px-8 py-4">
                {/* Left: Preview Title */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-bold">🦁</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Preview</h2>
                    <p className="text-sm text-gray-500">
                      See how your card looks across devices
                    </p>
                  </div>
                </div>

                {/* Center: Premium Device Toggles */}
                <div className="flex items-center bg-gray-100/80 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200/60 shadow-lg">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDeviceSwitch("desktop")}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                      selectedDevice === "desktop"
                        ? "bg-white text-gray-900 shadow-lg border border-gray-200/80 transform scale-105"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span>Desktop</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDeviceSwitch("tablet")}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                      selectedDevice === "tablet"
                        ? "bg-white text-gray-900 shadow-lg border border-gray-200/80 transform scale-105"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    <Tablet className="w-4 h-4" />
                    <span>Tablet</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDeviceSwitch("mobile")}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                      selectedDevice === "mobile"
                        ? "bg-white text-gray-900 shadow-lg border border-gray-200/80 transform scale-105"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Mobile</span>
                  </motion.button>
                </div>

                {/* Right: Close Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPreview(false)}
                  className="w-12 h-12 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/60 hover:bg-white/90 text-gray-700 hover:text-gray-900 transition-all duration-200 flex items-center justify-center shadow-lg"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>

            {/* Main Content Area */}
            <div className="h-full pt-20 flex items-center justify-center relative overflow-hidden">
              {/* Animated Background Pattern */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="absolute inset-0 opacity-20"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                    radial-gradient(circle at 20% 80%, rgba(242, 101, 34, 0.15) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                    radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.10) 0%, transparent 50%)
                  `,
                  }}
                ></div>
              </motion.div>

              {/* Device Preview Container with Enhanced Frames */}
              <motion.div
                key={`device-${selectedDevice}`}
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -30 }}
                transition={{
                  duration: 0.5,
                  ease: [0.34, 1.56, 0.64, 1],
                  delay: deviceSwitching ? 0 : 0.1,
                }}
                className="relative z-10 flex flex-col items-center"
              >
                {/* Enhanced Device Frames */}
                {selectedDevice === "desktop" && (
                  <div
                    className="bg-white rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden relative"
                    style={{
                      width: "1000px",
                      height: "700px",
                      maxWidth: "85vw",
                      maxHeight: "75vh",
                    }}
                  >
                    {/* Premium Browser Chrome */}
                    <div className="h-12 bg-gradient-to-b from-gray-100 to-gray-50 border-b border-gray-200 flex items-center px-6">
                      {/* Traffic Lights */}
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                      </div>

                      {/* URL Bar */}
                      <div className="flex-1 mx-6">
                        <div className="bg-white rounded-lg px-4 py-2 text-sm text-gray-600 border border-gray-200 shadow-sm">
                          <span className="text-green-600">🔒</span> heyleo.ai/
                          {cardData.profile.full_name
                            ?.toLowerCase()
                            .replace(/\s+/g, "-") || "username"}
                        </div>
                      </div>

                      {/* Browser Controls */}
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-md bg-gray-200 flex items-center justify-center">
                          <ArrowLeft className="w-3 h-3 text-gray-400" />
                        </div>
                        <div className="w-6 h-6 rounded-md bg-gray-200 flex items-center justify-center">
                          <ArrowLeft className="w-3 h-3 text-gray-400 transform rotate-180" />
                        </div>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="h-[calc(100%-48px)] overflow-hidden bg-gray-50">
                      <EndUserView
                        cardData={cardData}
                        onChatClick={handleChatClick}
                        device="desktop"
                        isPreview={true}
                      />
                    </div>
                  </div>
                )}

                {selectedDevice === "tablet" && (
                  <div
                    className="bg-black rounded-[28px] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative"
                    style={{
                      width: "600px",
                      height: "800px",
                      maxWidth: "70vw",
                      maxHeight: "85vh",
                    }}
                  >
                    {/* iPad Frame */}
                    <div className="w-full h-full bg-white rounded-[20px] overflow-hidden relative">
                      {/* Home Indicator (iPad style) */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full"></div>

                      <EndUserView
                        cardData={cardData}
                        onChatClick={handleChatClick}
                        device="tablet"
                        isPreview={true}
                      />
                    </div>
                  </div>
                )}

                {selectedDevice === "mobile" && (
                  <div
                    className="bg-black rounded-[30px] p-1 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative"
                    style={{
                      width: "375px",
                      height: "667px",
                      maxWidth: "90vw",
                      maxHeight: "80vh",
                    }}
                  >
                    {/* iPhone Dynamic Island */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-10 shadow-lg"></div>

                    <div className="w-full h-full bg-white rounded-[26px] overflow-hidden relative">
                      {/* Home Indicator */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-black/30 rounded-full z-10"></div>

                      <EndUserView
                        cardData={cardData}
                        onChatClick={handleChatClick}
                        device="mobile"
                        isPreview={true}
                      />
                    </div>
                  </div>
                )}

                {/* Device Label with Animation */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="mt-6"
                >
                  <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl border border-gray-200/60 shadow-lg">
                    <p className="text-sm font-semibold text-gray-700 text-center">
                      {selectedDevice === "mobile"
                        ? "iPhone 15 Pro"
                        : selectedDevice === "tablet"
                        ? 'iPad Pro 12.9"'
                        : 'MacBook Pro 16"'}{" "}
                      Preview
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating Context Hint */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              >
                <div className="bg-black/90 backdrop-blur-sm text-white px-8 py-4 rounded-2xl shadow-xl border border-white/10">
                  <p className="text-sm font-medium text-center">
                    This is exactly how visitors will experience your digital
                    business card
                  </p>
                </div>
              </motion.div>

              {/* Keyboard Shortcut Hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.3 }}
                className="absolute top-32 right-8"
              >
                <div className="bg-white/80 backdrop-blur-sm text-gray-600 px-4 py-2 rounded-lg shadow-lg border border-gray-200/60">
                  <p className="text-xs font-medium">
                    Press{" "}
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">
                      ESC
                    </kbd>{" "}
                    to close
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">QR Code</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center">
                {generatingQR ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : qrCodeDataUrl ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <img
                        src={qrCodeDataUrl}
                        alt="QR Code"
                        className="w-64 h-64 border border-gray-200 rounded-lg"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      Scan this QR code to view the card
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={downloadQRCode}
                        className="flex-1 bg-primary hover:bg-primary-hover text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (currentCard) {
                            const url = `${window.location.origin}/${
                              currentCard.card_profile_link
                                ?.toLowerCase()
                                .replace(/\s+/g, "-") || "username"
                            }`;
                            navigator.clipboard.writeText(url);
                            addToast({
                              type: "success",
                              title: "Link copied to clipboard!",
                              message: "",
                            });
                          }
                        }}
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Failed to generate QR code
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Embed Code Modal */}
      <AnimatePresence>
        {showEmbedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEmbedModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Embed Code
                </h3>
                <button
                  onClick={() => setShowEmbedModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {currentCard &&
                  (() => {
                    const url = `${window.location.origin}/${
                      currentCard.card_profile_link
                        ?.toLowerCase()
                        .replace(/\s+/g, "-") || "username"
                    }`;
                    const { iframeCode, scriptCode } = generateEmbedCode(url);

                    return (
                      <>
                        {/* iframe Embed */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">
                              iframe Embed
                            </h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                copyEmbedCode(iframeCode, "iframe")
                              }
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <code className="text-sm text-gray-800 break-all">
                              {iframeCode}
                            </code>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            Simple iframe embed - paste this directly into your
                            HTML
                          </p>
                        </div>

                        {/* Script Embed */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">
                              Script Embed
                            </h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                copyEmbedCode(scriptCode, "script")
                              }
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <code className="text-sm text-gray-800 break-all whitespace-pre-wrap">
                              {scriptCode}
                            </code>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            JavaScript embed - creates a container with ID
                            "leo-card-embed"
                          </p>
                        </div>

                        {/* Preview */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">
                            Preview
                          </h4>
                          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="text-center text-gray-600 text-sm">
                              <div className="w-full h-32 bg-white border border-gray-200 rounded flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-8 h-8 bg-primary/20 rounded-full mx-auto mb-2"></div>
                                  <div className="text-xs text-gray-500">
                                    Card Preview
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    400x600px
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
