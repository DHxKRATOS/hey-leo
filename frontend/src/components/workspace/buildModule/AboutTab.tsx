import {
  Award,
  Bot,
  Briefcase,
  Camera,
  MessageCircle,
  Sparkles,
  Star,
  UploadCloud,
  User,
} from "lucide-react";
import React from "react";
import { toast } from "sonner@2.0.3";
import { ProfileData } from "../../../types/buildModule";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { Textarea } from "../../ui/textarea";

interface AboutTabProps {
  profile: ProfileData & { ai_chat_enabled?: boolean };
  userTier: string;
  onProfileUpdate: (
    updates: Partial<ProfileData & { ai_chat_enabled?: boolean }>
  ) => void;
  onAddArrayItem: (field: keyof ProfileData, value: string) => void;
  onRemoveArrayItem: (field: keyof ProfileData, index: number) => void;
  expandedSections: string[];
  onExpandedSectionsChange: (sections: string[]) => void;
  onTrainModuleAccess?: () => void;
  onImproveModuleAccess?: () => void;
}

export function AboutTab({
  profile,
  userTier,
  onProfileUpdate,
  onAddArrayItem,
  onRemoveArrayItem,
  expandedSections,
  onExpandedSectionsChange,
  onTrainModuleAccess,
  onImproveModuleAccess,
}: AboutTabProps) {
  // AI Chat is ENABLED BY DEFAULT - Leo's star feature - GUARANTEED TRUE
  const isAiChatEnabled = profile.ai_chat_enabled === false ? false : true; // Only false if EXPLICITLY set to false

  // FORCE AI chat to be enabled by default for new profiles
  React.useEffect(() => {
    // Force to true by default UNLESS explicitly set to false
    if (
      profile.ai_chat_enabled === undefined ||
      profile.ai_chat_enabled === null
    ) {
      onProfileUpdate({ ai_chat_enabled: true });
    }
  }, [profile.ai_chat_enabled, onProfileUpdate]);

  const handleAiChatToggle = (enabled: boolean) => {
    onProfileUpdate({ ai_chat_enabled: enabled });

    if (enabled) {
      toast.success(
        "🦁 AI Chat activated! Set up your AI personality and knowledge",
        {
          duration: 6000,
          action: {
            label: "Go to Train Module →",
            onClick: () => {
              onTrainModuleAccess?.();
            },
          },
        }
      );
    } else {
      toast.success("AI Chat disabled - Visitors won't see the chat button");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Accordion
        type="multiple"
        value={expandedSections}
        onValueChange={onExpandedSectionsChange}
      >
        {/* Profile Photos */}
        <AccordionItem value="photos">
          <AccordionTrigger
            className="text-base font-semibold"
            style={{
              fontSize: "var(--text-base)",
              fontWeight: "var(--font-weight-semibold)",
              fontFamily: "var(--font-family)",
            }}
          >
            <div className="flex items-center space-x-2">
              <Camera className="h-4 w-4 text-primary" />
              <span>Profile Photos</span>
              {userTier !== "free" && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Star className="w-3 h-3" />
                  Pro
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            {/* Profile Photo */}
            <div>
              <Label
                className="text-sm font-medium mb-2 block"
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-weight-medium)",
                  fontFamily: "var(--font-family)",
                }}
              >
                Profile Photo
              </Label>
              <div className="flex items-center space-x-4">
                <div
                  className="w-20 h-20 bg-primary-light flex items-center justify-center overflow-hidden border-2 border-dashed border-primary/30"
                  style={{ borderRadius: "var(--radius-2xl)" }}
                >
                  {profile.profile_photo_url ? (
                    <img
                      src={profile.profile_photo_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Camera className="h-6 w-6 text-primary mx-auto mb-1" />
                      <span
                        className="text-primary font-medium"
                        style={{
                          fontSize: "var(--text-xs)",
                          fontWeight: "var(--font-weight-medium)",
                          fontFamily: "var(--font-family)",
                        }}
                      >
                        Upload
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Upload Photo
                  </Button>
                  <Input
                    value={profile.profile_photo_url}
                    onChange={(e) =>
                      onProfileUpdate({ profile_photo_url: e.target.value })
                    }
                    placeholder="Or paste image URL"
                    className="text-xs"
                    style={{
                      fontSize: "var(--text-xs)",
                      fontFamily: "var(--font-family)",
                    }}
                  />
                  <p
                    className="text-muted-foreground"
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--text-tertiary)",
                      fontFamily: "var(--font-family)",
                    }}
                  >
                    Recommended: 400x400px minimum, square aspect ratio
                  </p>
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <Label
                className="text-sm font-medium mb-2 block"
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-weight-medium)",
                  fontFamily: "var(--font-family)",
                }}
              >
                Cover Image
              </Label>
              <div className="space-y-2">
                <div
                  className="w-full h-24 bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden"
                  style={{ borderRadius: "var(--radius-lg)" }}
                >
                  {profile.cover_image_url ? (
                    <img
                      src={profile.cover_image_url}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Camera className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                      <span
                        className="text-muted-foreground"
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--text-tertiary)",
                          fontFamily: "var(--font-family)",
                        }}
                      >
                        Cover Image
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  Upload Cover
                </Button>
                <Input
                  value={profile.cover_image_url}
                  onChange={(e) =>
                    onProfileUpdate({ cover_image_url: e.target.value })
                  }
                  placeholder="Or paste cover image URL"
                  className="text-xs"
                  style={{
                    fontSize: "var(--text-xs)",
                    fontFamily: "var(--font-family)",
                  }}
                />
              </div>
            </div>

            {/* Company Logo */}
            <div>
              <Label
                className="text-sm font-medium mb-2 block"
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-weight-medium)",
                  fontFamily: "var(--font-family)",
                }}
              >
                Company Logo
              </Label>
              <div className="flex items-center space-x-4">
                <div
                  className="w-16 h-16 bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden"
                  style={{ borderRadius: "var(--radius-lg)" }}
                >
                  {profile.company_logo_url ? (
                    <img
                      src={profile.company_logo_url}
                      alt="Company Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Briefcase className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Upload Logo
                  </Button>
                  <Input
                    value={profile.company_logo_url}
                    onChange={(e) =>
                      onProfileUpdate({ company_logo_url: e.target.value })
                    }
                    placeholder="Company logo URL"
                    className="text-xs"
                    style={{
                      fontSize: "var(--text-xs)",
                      fontFamily: "var(--font-family)",
                    }}
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Basic Information - CLEANED UP */}
        <AccordionItem value="basic-info">
          <AccordionTrigger
            className="text-base font-semibold"
            style={{
              fontSize: "var(--text-base)",
              fontWeight: "var(--font-weight-semibold)",
              fontFamily: "var(--font-family)",
            }}
          >
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-primary" />
              <span>Basic Information</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label
                  className="text-sm font-medium mb-1 block"
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--font-weight-medium)",
                    fontFamily: "var(--font-family)",
                  }}
                >
                  Full Name *
                </Label>
                <Input
                  value={profile.full_name}
                  onChange={(e) =>
                    onProfileUpdate({ full_name: e.target.value })
                  }
                  placeholder="Your full name"
                  style={{ fontFamily: "var(--font-family)" }}
                />
              </div>

              <div>
                <Label
                  className="text-sm font-medium mb-1 block"
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--font-weight-medium)",
                    fontFamily: "var(--font-family)",
                  }}
                >
                  Job Title *
                </Label>
                <Input
                  value={profile.job_title}
                  onChange={(e) =>
                    onProfileUpdate({ job_title: e.target.value })
                  }
                  placeholder="Your job title"
                  style={{ fontFamily: "var(--font-family)" }}
                />
              </div>

              <div>
                <Label
                  className="text-sm font-medium mb-1 block"
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--font-weight-medium)",
                    fontFamily: "var(--font-family)",
                  }}
                >
                  Company
                </Label>
                <Input
                  value={profile.company}
                  onChange={(e) => onProfileUpdate({ company: e.target.value })}
                  placeholder="Your company"
                  style={{ fontFamily: "var(--font-family)" }}
                />
              </div>

              <div>
                <Label
                  className="text-sm font-medium mb-1 block"
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--font-weight-medium)",
                    fontFamily: "var(--font-family)",
                  }}
                >
                  Location
                </Label>
                <Input
                  value={profile.location}
                  onChange={(e) =>
                    onProfileUpdate({ location: e.target.value })
                  }
                  placeholder="City, Country"
                  style={{ fontFamily: "var(--font-family)" }}
                />
              </div>

              <div>
                <Label
                  className="text-sm font-medium mb-1 block"
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--font-weight-medium)",
                    fontFamily: "var(--font-family)",
                  }}
                >
                  Bio
                </Label>
                <Textarea
                  value={profile.bio}
                  onChange={(e) => onProfileUpdate({ bio: e.target.value })}
                  rows={4}
                  placeholder="Tell people about yourself..."
                  maxLength={500}
                  style={{
                    fontFamily: "var(--font-family)",
                    resize: "none",
                  }}
                />
                <p
                  className="mt-1"
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-tertiary)",
                    fontFamily: "var(--font-family)",
                  }}
                >
                  {profile.bio?.length || 0}/500 characters
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* AI Assistant - ENABLED BY DEFAULT BUT TOGGLEABLE */}
        <AccordionItem value="ai-assistant">
          <AccordionTrigger
            className="text-base font-semibold"
            style={{
              fontSize: "var(--text-base)",
              fontWeight: "var(--font-weight-semibold)",
              fontFamily: "var(--font-family)",
            }}
          >
            <div className="flex items-center space-x-2">
              <Bot className="h-4 w-4 text-primary" />
              <span>AI Assistant</span>
              <Badge variant="outline" className="text-xs gap-1">
                <Sparkles className="w-3 h-3" />⭐ Featured
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            {/* AI ASSISTANT TOGGLE - ENABLED BY DEFAULT BUT USER CAN DISABLE */}
            <div
              className="flex items-center justify-between p-4 border"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary-light), var(--color-primary-surface))",
                borderColor: "var(--color-primary)",
                borderRadius: "var(--radius-lg)",
                borderWidth: "1px",
              }}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <Label
                    className="font-semibold text-primary"
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: "var(--font-weight-semibold)",
                      fontFamily: "var(--font-family)",
                    }}
                  >
                    Enable AI Chat on your card
                  </Label>
                </div>
                <p
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-family)",
                  }}
                >
                  Let visitors chat with your AI assistant 24/7 - Leo's star
                  feature! Enabled by default.
                </p>
              </div>

              {/* TOGGLEABLE SWITCH - ENABLED BY DEFAULT */}
              <div className="ml-4 flex items-center space-x-2">
                <Switch
                  checked={isAiChatEnabled} // Default to enabled, but allow user control
                  onCheckedChange={handleAiChatToggle} // Allow toggling
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                {isAiChatEnabled && (
                  <div className="flex flex-col items-center">
                    <div
                      className="w-2 h-2 rounded-full bg-success animate-pulse"
                      style={{ background: "var(--color-success)" }}
                    />
                    <span
                      className="text-success font-medium"
                      style={{
                        fontSize: "var(--text-xs)",
                        fontWeight: "var(--font-weight-medium)",
                        fontFamily: "var(--font-family)",
                        color: "var(--color-success)",
                      }}
                    >
                      ACTIVE
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Assistant Features - Show when enabled */}
            {isAiChatEnabled && (
              <div className="space-y-3">
                <div
                  className="flex items-center justify-between p-3 border"
                  style={{
                    background: "var(--color-success-light, #dcfce7)",
                    borderColor: "var(--color-success)",
                    borderRadius: "var(--radius-lg)",
                    borderWidth: "1px",
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span
                      className="text-success font-medium"
                      style={{
                        fontSize: "var(--text-sm)",
                        fontWeight: "var(--font-weight-medium)",
                        fontFamily: "var(--font-family)",
                      }}
                    >
                      AI Chat is active - Set up your AI below
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onTrainModuleAccess?.();
                    }}
                    className="text-success hover:text-success/80 text-xs underline font-medium transition-colors"
                  >
                    Go to Train →
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onTrainModuleAccess?.();
                    }}
                    className="h-auto flex-col gap-2 p-4 hover:bg-primary/10 hover:border-primary hover:scale-105 transition-all duration-200 hover:shadow-md"
                    style={{
                      fontFamily: "var(--font-family)",
                      borderColor: "var(--color-primary)",
                      background: "var(--color-primary-light)",
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-primary" />
                    <div className="text-center">
                      <div
                        className="font-medium text-primary"
                        style={{
                          fontSize: "var(--text-sm)",
                          fontWeight: "var(--font-weight-medium)",
                        }}
                      >
                        Train AI →
                      </div>
                      <div
                        className="text-muted-foreground"
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        Add knowledge & personality
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      onImproveModuleAccess?.();
                    }}
                    className="h-auto flex-col gap-2 p-4 hover:bg-primary/10 hover:border-primary hover:scale-105 transition-all duration-200 hover:shadow-md"
                    style={{
                      fontFamily: "var(--font-family)",
                      borderColor: "var(--color-primary)",
                      background: "var(--color-primary-light)",
                    }}
                  >
                    <Award className="w-5 h-5 text-primary" />
                    <div className="text-center">
                      <div
                        className="font-medium text-primary"
                        style={{
                          fontSize: "var(--text-sm)",
                          fontWeight: "var(--font-weight-medium)",
                        }}
                      >
                        Improve AI →
                      </div>
                      <div
                        className="text-muted-foreground"
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        Review & optimize responses
                      </div>
                    </div>
                  </Button>
                </div>

                <div
                  className="p-4 border"
                  style={{
                    background: "var(--color-info-light, #dbeafe)",
                    borderColor: "var(--color-info)",
                    borderRadius: "var(--radius-lg)",
                    borderWidth: "1px",
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className="p-2 rounded-full"
                      style={{
                        background: "var(--color-info)",
                        color: "white",
                      }}
                    >
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4
                          className="font-semibold"
                          style={{
                            fontSize: "var(--text-sm)",
                            fontWeight: "var(--font-weight-semibold)",
                            fontFamily: "var(--font-family)",
                            color: "var(--color-info)",
                          }}
                        >
                          🦁 Leo's AI Assistant Features:
                        </h4>
                        <button
                          onClick={() => {
                            onImproveModuleAccess?.();
                          }}
                          className="text-xs text-info hover:text-info/80 underline font-medium transition-colors"
                        >
                          See Analytics →
                        </button>
                      </div>
                      <ul
                        className="space-y-1"
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--color-info)",
                          fontFamily: "var(--font-family)",
                        }}
                      >
                        <li>
                          • Answer questions about your services and experience
                        </li>
                        <li>• Schedule meetings automatically</li>
                        <li>• Provide personalized responses in your voice</li>
                        <li>• Capture leads and contact information</li>
                        <li>• Available 24/7 for your visitors</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Show help message when disabled */}
            {!isAiChatEnabled && (
              <div
                className="p-4 border"
                style={{
                  background: "var(--color-muted)",
                  borderColor: "var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  borderWidth: "1px",
                }}
              >
                <div className="text-center">
                  <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p
                    className="text-muted-foreground"
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-family)",
                    }}
                  >
                    AI Chat is disabled. Toggle it on to activate Leo's AI
                    Assistant and access Train & Improve modules.
                  </p>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
