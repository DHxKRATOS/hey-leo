import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  User,
  Palette,
  Link,
  Users,
  Share2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  X,
} from "lucide-react";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { ResponsiveCardRenderer } from "../ResponsiveCardRenderer";
import { EndUserView } from "../EndUserView";
import { toast } from "sonner@2.0.3";

// Import the enhanced tab components
import { AboutTab } from "./buildModule/AboutTab";
import { LinksTab } from "./buildModule/LinksTab";
import { ShareTab } from "./buildModule/ShareTab";
import { DisplayTab } from "./buildModule/DisplayTab";

import {
  ProfileData,
  DesignSettings,
  LinkData,
  AnalyticsSettings,
} from "../../types/buildModule";

interface BuildModuleProps {
  card: any;
  onUpdate: (updates: any) => void;
  user: any;
  userProfile: any;
  onModuleChange?: (module: "build" | "train" | "improve") => void;
}

// Color scheme presets
const COLOR_SCHEMES = [
  {
    id: "leo-orange",
    name: "Leo Orange",
    primary: "#F26522",
    background: "#FFFFFF",
  },
  {
    id: "navy-blue",
    name: "Navy Blue",
    primary: "#1E40AF",
    background: "#FFFFFF",
  },
  {
    id: "forest-green",
    name: "Forest Green",
    primary: "#059669",
    background: "#FFFFFF",
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    primary: "#7C3AED",
    background: "#FFFFFF",
  },
  {
    id: "crimson-red",
    name: "Crimson Red",
    primary: "#DC2626",
    background: "#FFFFFF",
  },
  {
    id: "golden-yellow",
    name: "Golden Yellow",
    primary: "#D97706",
    background: "#FFFFFF",
  },
  {
    id: "slate-gray",
    name: "Slate Gray",
    primary: "#475569",
    background: "#FFFFFF",
  },
  {
    id: "midnight-black",
    name: "Midnight",
    primary: "#FFFFFF",
    background: "#1A1A1A",
  },
];

// Popular platforms for links
const POPULAR_PLATFORMS = [
  { id: "linkedin", name: "LinkedIn", icon: "💼" },
  { id: "twitter", name: "Twitter", icon: "🐦" },
  { id: "instagram", name: "Instagram", icon: "📷" },
  { id: "facebook", name: "Facebook", icon: "👥" },
  { id: "github", name: "GitHub", icon: "💻" },
  { id: "website", name: "Website", icon: "🌐" },
  { id: "email", name: "Email", icon: "✉️" },
  { id: "phone", name: "Phone", icon: "📞" },
];

export function BuildModule({
  card,
  onUpdate,
  user,
  userProfile,
  onModuleChange,
}: BuildModuleProps) {
  const [activeTab, setActiveTab] = useState("about");
  const [selectedDevice, setSelectedDevice] = useState("mobile");
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "basic-info",
    "ai-assistant",
  ]);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [showPreview, setShowPreview] = useState(false);

  // FORCE AI CHAT TO BE TRUE BY DEFAULT - This is Leo's star feature and should ALWAYS be enabled
  const getDefaultAiChatState = (currentValue: any): boolean => {
    // If it's explicitly set to false by the user, respect that
    // Otherwise, ALWAYS default to true (Leo's signature feature)
    if (currentValue === false) {
      return false;
    }
    // Default to TRUE for Leo's star feature
    return true;
  };

  // CLEANED UP Card data state - AI Chat GUARANTEED enabled by default
  const [cardData, setCardData] = useState({
    profile: {
      // Essential fields only
      full_name: card?.profile?.full_name || userProfile?.full_name || "",
      job_title: card?.profile?.job_title || userProfile?.job_title || "",
      company: card?.profile?.company || userProfile?.company || "",
      location: card?.profile?.location || userProfile?.location || "",
      bio: card?.profile?.bio || userProfile?.bio || "",
      profile_photo_url:
        card?.profile?.profile_photo_url || userProfile?.avatar_url || "",
      cover_image_url: card?.profile?.cover_image_url || "",
      company_logo_url: card?.profile?.company_logo_url || "",
      // AI Chat is GUARANTEED TRUE by default - Leo's signature feature
      ai_chat_enabled: getDefaultAiChatState(card?.profile?.ai_chat_enabled),
      // Legacy field mapping for compatibility
      fullName: card?.profile?.full_name || userProfile?.full_name || "",
      jobTitle: card?.profile?.job_title || userProfile?.job_title || "",
      photo:
        card?.profile?.profile_photo_url || userProfile?.avatar_url || null,
    },
    design: {
      colorScheme: card?.design?.colorScheme || "leo-orange",
      fontFamily: card?.design?.fontFamily || "Inter",
      fontSize: card?.design?.fontSize || "medium",
      fontWeight: card?.design?.fontWeight || "medium",
      template: card?.design?.template || "leo-classic",
      theme: card?.design?.theme || "leo-signature",
      colors: {
        primary: card?.design?.colors?.primary || "#F26522",
        secondary: card?.design?.colors?.secondary || "#E85A17",
        background: card?.design?.colors?.background || "#FFFFFF",
        text: card?.design?.colors?.text || "#1A1A1A",
      },
      fonts: {
        heading: card?.design?.fonts?.heading || "Inter",
        body: card?.design?.fonts?.body || "Inter",
      },
      spacing: card?.design?.spacing || "comfortable",
      corners: card?.design?.corners || "rounded",
      shadows: card?.design?.shadows || "subtle",
      layout: card?.design?.layout || "center",
    },
    links: card?.links || [],
    leadCapture: {
      enabled: card?.leadCapture?.enabled || false,
      fields: card?.leadCapture?.fields || ["name", "email"],
      timing: card?.leadCapture?.timing || "immediate",
      message: card?.leadCapture?.message || "Get in touch!",
    },
    sharing: {
      url: card?.sharing?.url || "",
      qrEnabled: card?.sharing?.qrEnabled || true,
      trackingEnabled: card?.sharing?.trackingEnabled || true,
    },
    settings: {
      ai_chat_enabled: getDefaultAiChatState(card?.profile?.ai_chat_enabled),
    },
  });

  // FORCE AI CHAT TO TRUE ON COMPONENT MOUNT - Leo's star feature
  useEffect(() => {
    // If AI Chat is not explicitly set to false, force it to true
    if (cardData.profile.ai_chat_enabled !== false) {
      // Update both profile and settings to ensure consistency
      if (
        !cardData.profile.ai_chat_enabled ||
        !cardData.settings.ai_chat_enabled
      ) {
        setCardData((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            ai_chat_enabled: true,
          },
          settings: {
            ...prev.settings,
            ai_chat_enabled: true,
          },
        }));
        setHasChanges(true);
      }
    }
  }, []); // Only run on mount

  // Auto-save functionality - only depend on hasChanges to prevent excessive re-renders
  useEffect(() => {
    if (hasChanges) {
      const timer = setTimeout(() => {
        handleSave();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasChanges]);

  const handleSave = useCallback(() => {
    onUpdate({
      ...card,
      profile: cardData.profile,
      design: cardData.design,
      links: cardData.links,
      leadCapture: cardData.leadCapture,
      sharing: cardData.sharing,
      settings: cardData.settings,
      updated_at: new Date().toISOString(),
    });
    setLastSaved(new Date());
    setHasChanges(false);
  }, [cardData, card, onUpdate]);

  const updateCardData = useCallback((section: string, data: any) => {
    setCardData((prev) => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], ...data },
    }));
    setHasChanges(true);
  }, []);

  const addLink = (platform: string) => {
    const newLink = {
      id: Date.now().toString(),
      platform,
      url: "",
      visible: true,
      order: cardData.links.length,
      label: POPULAR_PLATFORMS.find((p) => p.id === platform)?.name || platform,
      is_visible: true,
    };
    updateCardData("links", [...cardData.links, newLink]);
  };

  const updateLink = (id: string, data: any) => {
    const updatedLinks = cardData.links.map((link: any) =>
      link.id === id ? { ...link, ...data } : link
    );
    updateCardData("links", updatedLinks);
  };

  const removeLink = (id: string) => {
    const updatedLinks = cardData.links.filter((link: any) => link.id !== id);
    updateCardData("links", updatedLinks);
  };

  const generateQRCode = () => {
    toast.success("QR code generated successfully!");
  };

  const copyShareLink = () => {
    if (cardData.sharing.url) {
      navigator.clipboard.writeText(cardData.sharing.url);
      toast.success("Link copied to clipboard!");
    }
  };

  const getUserTier = () => {
    return userProfile?.subscription_tier || "free";
  };

  const generateCardUrl = () => {
    return `https://leo.cards/${card?.id || "preview"}`;
  };

  const handleTrainModuleAccess = () => {
    if (cardData.profile.ai_chat_enabled) {
      onModuleChange?.("train");
      toast.success("🚀 Navigating to Train module...", {
        duration: 2000,
      });
    } else {
      toast.error("Please enable AI Chat first to access Train module");
    }
  };

  const handleImproveModuleAccess = () => {
    if (cardData.profile.ai_chat_enabled) {
      onModuleChange?.("improve");
      toast.success("📊 Navigating to Improve module...", {
        duration: 2000,
      });
    } else {
      toast.error("Please enable AI Chat first to access Improve module");
    }
  };

  // Enhanced profile update handler to work with AboutTab
  const handleProfileUpdate = useCallback(
    (updates: any) => {
      // Update both the cleaned structure and legacy fields for compatibility
      const profileUpdates = {
        ...updates,
        // Maintain legacy field mapping
        fullName:
          updates.full_name || updates.fullName || cardData.profile.fullName,
        jobTitle:
          updates.job_title || updates.jobTitle || cardData.profile.jobTitle,
        photo:
          updates.profile_photo_url || updates.photo || cardData.profile.photo,
      };

      updateCardData("profile", profileUpdates);

      // Also update settings for AI chat if needed to maintain consistency
      if (updates.ai_chat_enabled !== undefined) {
        updateCardData("settings", {
          ai_chat_enabled: updates.ai_chat_enabled,
        });
      }
    },
    [
      cardData.profile.fullName,
      cardData.profile.jobTitle,
      cardData.profile.photo,
      updateCardData,
    ]
  );

  // Enhanced links update handler
  const handleLinksUpdate = useCallback(
    (links: any[]) => {
      updateCardData("links", links);
    },
    [updateCardData]
  );

  const handleAddArrayItem = (field: string, value: string) => {
    const currentArray =
      (cardData.profile[field as keyof typeof cardData.profile] as string[]) ||
      [];
    const updatedArray = [...currentArray, value];
    handleProfileUpdate({ [field]: updatedArray });
  };

  const handleRemoveArrayItem = (field: string, index: number) => {
    const currentArray =
      (cardData.profile[field as keyof typeof cardData.profile] as string[]) ||
      [];
    const updatedArray = currentArray.filter((_, i) => i !== index);
    handleProfileUpdate({ [field]: updatedArray });
  };

  const getDevicePreviewSize = () => {
    switch (selectedDevice) {
      case "mobile":
        return { width: "375px", height: "667px" };
      case "tablet":
        return { width: "768px", height: "1024px" };
      case "desktop":
        return { width: "1200px", height: "800px" };
      default:
        return { width: "375px", height: "667px" };
    }
  };

  // Handle card chat click for preview mode
  const handleChatClick = useCallback(() => {
    toast.success("🦁 Leo AI Assistant preview!", {
      description:
        "In live mode, visitors can chat with your AI-powered professional assistant.",
      duration: 3000,
      action: {
        label: "Configure AI",
        onClick: () => onModuleChange?.("train"),
      },
    });
  }, [onModuleChange]);

  // Memoize card data for stable reference to prevent unnecessary re-renders
  const stableCardData = useMemo(
    () => ({
      id: card?.id || "preview",
      profile: cardData.profile,
      design: cardData.design,
      links: cardData.links,
      leadCapture: cardData.leadCapture,
      sharing: cardData.sharing,
      settings: cardData.settings,
    }),
    [
      card?.id,
      cardData.profile.full_name,
      cardData.profile.job_title,
      cardData.profile.company,
      cardData.profile.location,
      cardData.profile.bio,
      cardData.profile.profile_photo_url,
      cardData.profile.cover_image_url,
      cardData.profile.ai_chat_enabled,
      cardData.design.colorScheme,
      cardData.design.template,
      cardData.design.theme,
      cardData.design.colors.primary,
      cardData.design.colors.background,
      cardData.links.length,
      JSON.stringify(cardData.links),
      cardData.leadCapture.enabled,
      cardData.sharing.qrEnabled,
    ]
  );

  return (
    <div className="h-screen flex flex-col bg-background relative border-2 border-primary/20 shadow-sm shadow-primary/10">
      {/* Leo Platform Branding - Build Module Active */}
      <div className="fixed bottom-4 left-4 z-30 pointer-events-none">
        <div className="bg-surface/90 backdrop-blur-sm border-2 border-primary/30 rounded-lg px-3 py-2 shadow-md shadow-primary/20">
          <p className="text-xs font-medium flex items-center gap-1.5">
            <span className="text-primary text-sm">🦁</span>
            <span className="text-primary font-bold">Build</span> •{" "}
            <span className="text-primary font-semibold">leo</span>
          </p>
        </div>
      </div>

      {/* Auto-save indicator with Leo Design System */}
      <div
        className="h-12 bg-surface border-b border-b-primary/20 flex items-center px-6"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <div
          className="ml-auto flex items-center"
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--text-tertiary)",
            fontFamily: "var(--font-family)",
          }}
        >
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              hasChanges ? "bg-warning animate-pulse" : "bg-success"
            }`}
          />
          {hasChanges ? "Saving changes..." : "All changes saved"}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Editor Panel */}
        <div
          className="w-96 bg-surface border-r border-l-2 border-l-primary/30 flex flex-col"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          {/* Tab Navigation */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            <div
              className="border-b border-b-primary/15 p-4 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"
              style={{ borderColor: "var(--color-border)" }}
            >
              <TabsList className="grid w-full grid-cols-3 gap-1">
                <TabsTrigger
                  value="about"
                  className="flex items-center gap-1.5"
                  style={{
                    fontSize: "var(--text-xs)",
                    fontFamily: "var(--font-family)",
                  }}
                >
                  <User className="w-3.5 h-3.5" />
                  About
                </TabsTrigger>
                <TabsTrigger
                  value="design"
                  className="flex items-center gap-1.5"
                  style={{
                    fontSize: "var(--text-xs)",
                    fontFamily: "var(--font-family)",
                  }}
                >
                  <Palette className="w-3.5 h-3.5" />
                  Design
                </TabsTrigger>
                <TabsTrigger
                  value="links"
                  className="flex items-center gap-1.5"
                  style={{
                    fontSize: "var(--text-xs)",
                    fontFamily: "var(--font-family)",
                  }}
                >
                  <Link className="w-3.5 h-3.5" />
                  Links
                </TabsTrigger>
              </TabsList>
              <div className="flex gap-2 mt-1">
                <div className="flex-1">
                  <TabsList className="grid w-full grid-cols-2 gap-1">
                    <TabsTrigger
                      value="lead-capture"
                      className="flex items-center gap-1.5"
                      style={{
                        fontSize: "var(--text-xs)",
                        fontFamily: "var(--font-family)",
                      }}
                    >
                      <Users className="w-3.5 h-3.5" />
                      Contacts
                    </TabsTrigger>
                    <TabsTrigger
                      value="share"
                      className="flex items-center gap-1.5"
                      style={{
                        fontSize: "var(--text-xs)",
                        fontFamily: "var(--font-family)",
                      }}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Preview Button - Highly Visible */}
                <Button
                  onClick={() => {
                    setShowPreview(true);
                    toast.success("Opening card preview...", {
                      duration: 1500,
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 h-9 px-4 border-2 border-primary text-primary bg-primary/5 hover:bg-primary/10 hover:border-primary font-semibold shadow-md transition-all duration-200 relative"
                  style={{
                    fontSize: "12px",
                    fontFamily: "var(--font-family)",
                    minWidth: "90px",
                  }}
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                </Button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {/* About Tab */}
              <TabsContent value="about" className="mt-0 h-full">
                <AboutTab
                  profile={cardData.profile}
                  userTier={getUserTier()}
                  onProfileUpdate={handleProfileUpdate}
                  onAddArrayItem={handleAddArrayItem}
                  onRemoveArrayItem={handleRemoveArrayItem}
                  expandedSections={expandedSections}
                  onExpandedSectionsChange={setExpandedSections}
                  onTrainModuleAccess={handleTrainModuleAccess}
                  onImproveModuleAccess={handleImproveModuleAccess}
                />
              </TabsContent>

              {/* Enhanced Design Tab */}
              <TabsContent value="design" className="mt-0 p-6 space-y-6">
                <DisplayTab
                  design={cardData.design}
                  onDesignUpdate={(updates) =>
                    updateCardData("design", updates)
                  }
                  userTier={getUserTier()}
                />
              </TabsContent>

              {/* Enhanced Links Tab */}
              <TabsContent value="links" className="mt-0 h-full">
                <LinksTab
                  links={cardData.links}
                  userTier={getUserTier()}
                  onLinksUpdate={handleLinksUpdate}
                  expandedSections={expandedSections}
                  onExpandedSectionsChange={setExpandedSections}
                />
              </TabsContent>

              {/* Lead Capture Tab */}
              <TabsContent value="lead-capture" className="mt-0 p-6 space-y-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      Lead Capture
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Configure how visitors can connect with you through your
                      card
                    </p>
                  </div>

                  <Card className="p-6 bg-surface border-border rounded-2xl">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-text-primary">
                            Enable Lead Capture
                          </h4>
                          <p className="text-sm text-text-secondary">
                            Allow visitors to share their contact information
                          </p>
                        </div>
                        <Switch
                          checked={cardData.leadCapture.enabled}
                          onCheckedChange={(enabled) =>
                            updateCardData("leadCapture", { enabled })
                          }
                        />
                      </div>

                      {cardData.leadCapture.enabled && (
                        <div className="space-y-4 pt-4 border-t border-border">
                          <div>
                            <Label className="text-sm font-medium text-text-primary">
                              Contact Message
                            </Label>
                            <Textarea
                              value={cardData.leadCapture.message}
                              onChange={(e) =>
                                updateCardData("leadCapture", {
                                  message: e.target.value,
                                })
                              }
                              placeholder="Get in touch!"
                              className="mt-1"
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-text-primary">
                              Capture Timing
                            </Label>
                            <Select
                              value={cardData.leadCapture.timing}
                              onValueChange={(timing) =>
                                updateCardData("leadCapture", { timing })
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="immediate">
                                  Immediate
                                </SelectItem>
                                <SelectItem value="after-interaction">
                                  After Interaction
                                </SelectItem>
                                <SelectItem value="on-exit">
                                  On Exit Intent
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Share Tab */}
              <TabsContent value="share" className="mt-0 h-full">
                <ShareTab
                  cardUrl={generateCardUrl()}
                  userTier={getUserTier()}
                  expandedSections={expandedSections}
                  onExpandedSectionsChange={setExpandedSections}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right Preview Panel */}
        <div className="flex-1 bg-background flex flex-col">
          {/* Device Toggle Header */}
          <div
            className="h-16 border-b flex items-center justify-between px-6"
            style={{ borderColor: "var(--color-border)" }}
          >
            <h2 className="text-lg font-semibold text-text-primary">
              Card Preview
            </h2>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 p-1 bg-accent rounded-lg">
                <Button
                  variant={selectedDevice === "mobile" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedDevice("mobile")}
                  className="h-8 px-3"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedDevice === "tablet" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedDevice("tablet")}
                  className="h-8 px-3"
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedDevice === "desktop" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedDevice("desktop")}
                  className="h-8 px-3"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 p-6 flex items-center justify-center bg-muted/20">
            <div
              className="bg-background rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
              style={getDevicePreviewSize()}
            >
              <ResponsiveCardRenderer
                cardData={stableCardData}
                device={selectedDevice}
                onChatClick={handleChatClick}
                isPreview={true}
                viewMode="preview"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal - Enhanced */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-7xl max-h-[95vh] p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-md">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-text-primary">
                    End User Preview
                  </DialogTitle>
                  <p className="text-sm text-text-secondary">
                    Experience your card exactly as visitors will see it
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
                className="h-10 w-10 p-0 rounded-full hover:bg-surface"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden h-[calc(95vh-120px)]">
            <EndUserView user={user} userProfile={userProfile} isModal={true} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
