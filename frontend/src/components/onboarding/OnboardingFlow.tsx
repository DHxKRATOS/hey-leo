import {
  Bot,
  Calendar,
  Camera,
  Check,
  CheckCircle,
  Chrome,
  Copy,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { cardApi, type OnboardingCardData } from "../../api/cardApi";
import { useAppSelector } from "../../hooks";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: (userData: any, action?: "edit-card" | "dashboard") => void;
  onClose: () => void;
  socialImportData?: {
    provider: "google" | "linkedin";
    importedData: any;
  } | null;
}

interface UserData {
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

type OnboardingStep =
  | "welcome"
  | "confirm-data"
  | "professional-identity"
  | "bio-builder"
  | "contact-preferences"
  | "card-preview"
  | "card-edit";

const STRAPI_URL = "http://localhost:1337";

export function OnboardingFlow({
  isOpen,
  onComplete,
  onClose,
  socialImportData,
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");

  // Initialize userData with social import data if available
  const initializeUserData = (): UserData => {
    if (socialImportData) {
      const { provider, importedData } = socialImportData;
      return {
        provider,
        profile: {
          firstName: importedData.firstName || "",
          lastName: importedData.lastName || "",
          email: importedData.email || "",
          phone: importedData.phone || "",
          jobTitle: importedData.jobTitle || "",
          company: importedData.company || "",
          bio: importedData.bio || "",
          photo: importedData.photo || "",
          location: importedData.location || "",
        },
        contacts: {
          email: true,
          phone: !!importedData.phone,
          linkedin: provider === "linkedin",
          calendar: false,
        },
        preferences: {
          aiGenerated: !importedData.bio, // Use AI if no bio imported
          bioPrompt: "",
        },
      };
    }

    return {
      provider: "email",
      profile: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        jobTitle: "",
        company: "",
        bio: "",
        photo: "",
        location: "",
      },
      contacts: {
        email: true,
        phone: false,
        linkedin: false,
        calendar: false,
      },
      preferences: {
        aiGenerated: true,
        bioPrompt: "",
      },
    };
  };

  const [userData, setUserData] = useState<UserData>(initializeUserData);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [generatedBio, setGeneratedBio] = useState("");
  const [linkedinConnecting, setLinkedinConnecting] = useState(false);
  const [createdCard, setCreatedCard] = useState<any>(null);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [editingCard, setEditingCard] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Progress calculation based on current step and provider
  const getProgress = () => {
    const stepMap: Record<OnboardingStep, number> = {
      welcome: 0,
      "confirm-data": userData.provider === "linkedin" ? 80 : 25,
      "professional-identity": 40,
      "bio-builder": 60,
      "contact-preferences": 80,
      "card-preview": 100,
      "card-edit": 100,
    };
    return stepMap[currentStep] || 0;
  };

  useEffect(() => {
    setProgress(getProgress());
  }, [currentStep, userData.provider]);

  // Set initial step based on social import data
  useEffect(() => {
    if (socialImportData) {
      const { provider } = socialImportData;
      if (provider === "linkedin") {
        setCurrentStep("confirm-data");
      } else if (provider === "google") {
        setCurrentStep("professional-identity");
      }
    }
  }, [socialImportData]);

  const handleSocialSignUp = async (provider: "google" | "linkedin") => {
    window.location.href = `${STRAPI_URL}/api/connect/${provider}`;
  };

  const handleEmailSignUp = () => {
    const mockData = {
      firstName: "",
      lastName: "",
      email: user?.email,
      photo: "",
      company: "",
    };

    setUserData((prev) => ({
      ...prev,
      provider: "email",
      profile: {
        ...prev.profile,
        ...mockData,
      },
    }));
    setCurrentStep("professional-identity");
  };

  // Navigation handlers
  const handleNext = async () => {
    const stepOrder: OnboardingStep[] = [
      "welcome",
      "confirm-data",
      "professional-identity",
      "bio-builder",
      "contact-preferences",
      "card-preview",
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];

      // If moving from contact-preferences to card-preview, create the card first
      if (
        currentStep === "contact-preferences" &&
        nextStep === "card-preview" &&
        isAuthenticated &&
        !createdCard
      ) {
        await createCardBeforePreview();
      }

      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    const flowMap: Record<
      string,
      Partial<Record<OnboardingStep, OnboardingStep>>
    > = {
      linkedin: {
        "confirm-data": "welcome",
        "professional-identity": "confirm-data",
        "bio-builder": "professional-identity",
        "contact-preferences": "bio-builder",
        "card-preview": "contact-preferences",
        "card-edit": "card-preview",
      },
      google: {
        "professional-identity": "welcome",
        "bio-builder": "professional-identity",
        "contact-preferences": "bio-builder",
        "card-preview": "contact-preferences",
        "card-edit": "card-preview",
      },
      email: {
        "confirm-data": "welcome",
        "professional-identity": "confirm-data",
        "bio-builder": "professional-identity",
        "contact-preferences": "bio-builder",
        "card-preview": "contact-preferences",
        "card-edit": "card-preview",
      },
    };

    const currentFlow = flowMap[userData.provider];
    const previousStep = currentFlow?.[currentStep];
    if (previousStep) {
      setCurrentStep(previousStep);
    }
  };

  // AI Bio Generation
  const handleGenerateBio = async () => {
    setIsLoading(true);

    // Simulate AI bio generation
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const bio = `${userData.profile.jobTitle} at ${
      userData.profile.company
    } with expertise in driving growth and building high-performing teams. ${
      userData.preferences.bioPrompt ||
      "Passionate about innovation and helping businesses scale through strategic partnerships and data-driven solutions."
    }`;

    setGeneratedBio(bio);
    setUserData((prev) => ({
      ...prev,
      profile: { ...prev.profile, bio },
    }));

    setIsLoading(false);
  };

  // LinkedIn Connect & Import for Google users
  const handleLinkedInConnect = async () => {
    setLinkedinConnecting(true);

    // Simulate LinkedIn OAuth and bio import
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock LinkedIn bio import
    const linkedinBio = `Results-driven ${
      userData.profile.jobTitle || "professional"
    } with extensive experience in ${
      userData.profile.company
        ? `driving growth at ${userData.profile.company}`
        : "scaling businesses"
    }. Proven track record of building high-performing teams and delivering measurable results through strategic partnerships and innovative solutions. Passionate about leveraging data-driven insights to optimize business performance and create sustainable competitive advantages.`;

    setUserData((prev) => ({
      ...prev,
      profile: { ...prev.profile, bio: linkedinBio },
      contacts: { ...prev.contacts, linkedin: true },
      preferences: { ...prev.preferences, aiGenerated: false },
    }));

    setLinkedinConnecting(false);
  };

  // Card link functionality
  const createCardBeforePreview = async () => {
    if (!isAuthenticated || createdCard) return;

    setIsCreatingCard(true);
    try {
      const onboardingData: OnboardingCardData = userData;
      const response = await cardApi.createFromOnboarding(onboardingData);
      setCreatedCard(response.card);
    } catch (error) {
      console.error("Failed to create card during onboarding:", error);
    } finally {
      setIsCreatingCard(false);
    }
  };

  const copyCardLink = () => {
    const url = `${window.location.origin}/${
      createdCard.card_profile_link?.toLowerCase().replace(/\s+/g, "-") ||
      "username"
    }`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleComplete = async (action?: "edit-card" | "dashboard") => {
    setIsLoading(true);
   
    try {
      // If card wasn't created yet (shouldn't happen in normal flow), create it now
      if (isAuthenticated && !createdCard) {
        await createCardBeforePreview();
      }

      onComplete(
        {
          ...userData,
          createdCard: createdCard,
        },
        action
      );
    } catch (error) {
      onComplete(userData, action);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCard = () => {
    setCurrentStep("card-edit");
  };

  const handleSaveCardEdit = async (updatedCardData: any) => {
    if (!createdCard?.id) return;

    setEditingCard(true);
    try {
      const response = await cardApi.update(createdCard.id, updatedCardData);
      setCreatedCard(response.card);

      // Update userData to reflect the changes
      setUserData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          firstName:
            updatedCardData.card_name?.split(" ")[0] || prev.profile.firstName,
          lastName:
            updatedCardData.card_name?.split(" ").slice(1).join(" ") ||
            prev.profile.lastName,
          jobTitle: updatedCardData.job_title || prev.profile.jobTitle,
          company: updatedCardData.company || prev.profile.company,
          bio: updatedCardData.description || prev.profile.bio,
          email: updatedCardData.email || prev.profile.email,
          phone: updatedCardData.phone || prev.profile.phone,
        },
      }));

      setCurrentStep("card-preview");
    } catch (error) {
      console.error("Failed to update card:", error);
    } finally {
      setEditingCard(false);
    }
  };

  const handleGoToDashboard = () => {
    handleComplete("dashboard");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-border fixed top-0 z-10">
        <div
          className="h-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-lg">
          {/* Welcome/Sign-up Screen */}
          {currentStep === "welcome" && !socialImportData && (
            <div className="w-full max-w-[480px] mx-auto">
              <Card className="p-12 bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200">
                <div className="text-center space-y-6">
                  {/* Leo Logo */}
                  <div className="mx-auto w-16 h-16 bg-primary-light rounded-xl flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground text-lg">
                        🦁
                      </span>
                    </div>
                  </div>

                  {/* Title Block */}
                  <div className="space-y-2">
                    <h1 className="text-foreground">
                      Create your AI-powered business card in minutes
                    </h1>
                    <p className="text-muted-foreground">
                      Join thousands of professionals building meaningful
                      connections with intelligent digital cards
                    </p>
                  </div>

                  {/* Social Sign-up Buttons */}
                  <div className="space-y-3">
                    {/* Google Button */}
                    <Button
                      onClick={() => handleSocialSignUp("google")}
                      // disabled={isLoading}
                      disabled={true}
                      variant="outline"
                      className="w-full h-12 bg-surface hover:bg-surface-hover border border-border text-foreground font-medium transition-all duration-200"
                    >
                      <div className="w-5 h-5 mr-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <Chrome className="h-3 w-3 text-white" />
                      </div>
                      Continue with Google
                    </Button>

                    {/* LinkedIn Button */}
                    <Button
                      onClick={() => handleSocialSignUp("linkedin")}
                      // disabled={isLoading}
                      disabled={true}
                      variant="outline"
                      className="w-full h-12 bg-surface hover:bg-surface-hover border border-border text-foreground font-medium transition-all duration-200"
                    >
                      <div className="w-5 h-5 mr-3 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">in</span>
                      </div>
                      Continue with LinkedIn
                    </Button>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                      <div className="flex-1 border-t border-border"></div>
                      <span className="px-4 text-sm text-muted-foreground">
                        or
                      </span>
                      <div className="flex-1 border-t border-border"></div>
                    </div>

                    {/* Email Button */}
                    <Button
                      onClick={handleEmailSignUp}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full h-12 bg-surface hover:bg-surface-hover border border-border text-foreground font-medium transition-all duration-200"
                    >
                      <Mail className="h-4 w-4 mr-3" />
                      Continue with Email
                    </Button>
                  </div>

                  {/* Legal Text */}
                  <p className="text-xs text-muted-foreground">
                    By continuing, you agree to our{" "}
                    <span className="text-primary hover:underline cursor-pointer font-medium">
                      Terms
                    </span>{" "}
                    &{" "}
                    <span className="text-primary hover:underline cursor-pointer font-medium">
                      Privacy Policy
                    </span>
                  </p>

                  {/* Loading State */}
                  {isLoading && (
                    <div className="flex items-center justify-center space-x-2 text-primary">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                      <span className="text-sm font-medium">Connecting...</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* LinkedIn: Confirm Imported Data */}
          {currentStep === "confirm-data" &&
            userData.provider === "linkedin" && (
              <div className="w-full max-w-[480px] mx-auto">
                <Card className="p-8 bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                      <h1 className="text-foreground">
                        Almost done! Confirm your details
                      </h1>
                      <p className="text-muted-foreground">
                        We've imported your information from LinkedIn
                      </p>
                      {/* Import Success Indicator */}
                      <div className="inline-flex items-center space-x-2 px-3 py-1 bg-success/10 border border-success/20 rounded-full">
                        <CheckCircle className="h-3 w-3 text-success" />
                        <span className="text-xs font-medium text-success">
                          {socialImportData?.importedData
                            ? Object.values(
                                socialImportData.importedData
                              ).filter((v) => v && typeof v === "string").length
                            : 0}{" "}
                          fields imported
                        </span>
                      </div>
                    </div>

                    {/* Profile Summary */}
                    <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                      <div className="relative">
                        <img
                          src={userData.profile.photo}
                          alt="Profile"
                          className="w-16 h-16 rounded-full border-2 border-card object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">
                          {userData.profile.firstName}{" "}
                          {userData.profile.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {userData.profile.jobTitle} at{" "}
                          {userData.profile.company}
                        </div>
                      </div>
                    </div>

                    {/* Editable Fields */}
                    <div className="space-y-4">
                      {/* First Name */}
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <div className="relative">
                          <Input
                            id="firstName"
                            value={userData.profile.firstName}
                            onChange={(e) =>
                              setUserData((prev) => ({
                                ...prev,
                                profile: {
                                  ...prev.profile,
                                  firstName: e.target.value,
                                },
                              }))
                            }
                            className="pr-8"
                          />
                          <Check className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-success" />
                        </div>
                      </div>

                      {/* Last Name */}
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <div className="relative">
                          <Input
                            id="lastName"
                            value={userData.profile.lastName}
                            onChange={(e) =>
                              setUserData((prev) => ({
                                ...prev,
                                profile: {
                                  ...prev.profile,
                                  lastName: e.target.value,
                                },
                              }))
                            }
                            className="pr-8"
                          />
                          <Check className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-success" />
                        </div>
                      </div>

                      {/* Professional Title */}
                      <div>
                        <Label htmlFor="jobTitle">Professional Title</Label>
                        <div className="relative">
                          <Input
                            id="jobTitle"
                            value={userData.profile.jobTitle}
                            onChange={(e) =>
                              setUserData((prev) => ({
                                ...prev,
                                profile: {
                                  ...prev.profile,
                                  jobTitle: e.target.value,
                                },
                              }))
                            }
                            className="pr-8"
                          />
                          <Check className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-success" />
                        </div>
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={handleBack}>
                        Back
                      </Button>
                      <Button
                        onClick={handleNext}
                        className="bg-primary hover:bg-primary-hover text-primary-foreground"
                      >
                        Confirm & Continue
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

          {/* Google/Email: Professional Identity */}
          {currentStep === "professional-identity" &&
            userData.provider !== "linkedin" && (
              <div className="w-full max-w-[480px] mx-auto">
                <Card className="p-8 bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                      <h1 className="text-foreground">
                        Tell us about your role
                      </h1>
                      <p className="text-muted-foreground">
                        Help us create your professional profile
                      </p>
                    </div>

                    {/* Profile Photo */}
                    <div className="flex justify-center">
                      <div className="relative">
                        {userData.profile.photo ? (
                          <img
                            src={userData.profile.photo}
                            alt="Profile"
                            className="w-24 h-24 rounded-full border-4 border-card object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full border-2 border-dashed border-border bg-muted flex items-center justify-center">
                            <Camera className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute -bottom-2 -right-2 h-8 w-8 p-0 rounded-full bg-surface hover:bg-surface-hover"
                        >
                          <Camera className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                      {/* Name Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={userData.profile.firstName}
                            onChange={(e) =>
                              setUserData((prev) => ({
                                ...prev,
                                profile: {
                                  ...prev.profile,
                                  firstName: e.target.value,
                                },
                              }))
                            }
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={userData.profile.lastName}
                            onChange={(e) =>
                              setUserData((prev) => ({
                                ...prev,
                                profile: {
                                  ...prev.profile,
                                  lastName: e.target.value,
                                },
                              }))
                            }
                            placeholder="Smith"
                          />
                        </div>
                      </div>

                      {/* Job Title */}
                      <div>
                        <Label htmlFor="jobTitle">Job Title *</Label>
                        <Input
                          id="jobTitle"
                          value={userData.profile.jobTitle}
                          onChange={(e) =>
                            setUserData((prev) => ({
                              ...prev,
                              profile: {
                                ...prev.profile,
                                jobTitle: e.target.value,
                              },
                            }))
                          }
                          placeholder="e.g. Marketing Manager"
                        />
                      </div>

                      {/* Company */}
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <div className="relative">
                          <Input
                            id="company"
                            value={userData.profile.company}
                            onChange={(e) =>
                              setUserData((prev) => ({
                                ...prev,
                                profile: {
                                  ...prev.profile,
                                  company: e.target.value,
                                },
                              }))
                            }
                            placeholder="TechCorp"
                          />
                          {userData.provider === "google" &&
                            userData.profile.company && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <Badge variant="outline" className="text-xs">
                                  Auto-detected ✓
                                </Badge>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={handleBack}>
                        Back
                      </Button>
                      <Button
                        onClick={handleNext}
                        disabled={
                          !userData.profile.firstName ||
                          !userData.profile.lastName ||
                          !userData.profile.jobTitle
                        }
                        className="bg-primary hover:bg-primary-hover text-primary-foreground"
                      >
                        Continue →
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

          {/* Bio Builder */}
          {currentStep === "bio-builder" && (
            <div className="w-full max-w-[480px] mx-auto">
              <Card className="p-8 bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-2">
                    <h1 className="text-foreground">Add a professional bio</h1>
                    <p className="text-muted-foreground">
                      Help people understand who you are and what you do
                    </p>
                  </div>

                  {/* Bio Options */}
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {/* Write Own */}
                      <div
                        className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-border-hover cursor-pointer transition-colors"
                        onClick={() =>
                          setUserData((prev) => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              aiGenerated: false,
                            },
                          }))
                        }
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            !userData.preferences.aiGenerated
                              ? "bg-primary border-primary"
                              : "border-border"
                          } flex items-center justify-center`}
                        >
                          {!userData.preferences.aiGenerated && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="text-foreground font-medium">
                          Write my own
                        </span>
                      </div>

                      {/* Generate with AI */}
                      <div
                        className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-border-hover cursor-pointer transition-colors"
                        onClick={() =>
                          setUserData((prev) => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              aiGenerated: true,
                            },
                          }))
                        }
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            userData.preferences.aiGenerated
                              ? "bg-primary border-primary"
                              : "border-border"
                          } flex items-center justify-center`}
                        >
                          {userData.preferences.aiGenerated && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="text-foreground font-medium flex items-center">
                          Generate with AI
                          <Badge variant="outline" className="ml-2 text-xs">
                            Recommended
                          </Badge>
                        </span>
                      </div>

                      {/* LinkedIn Import/Connect */}
                      <div
                        className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-border-hover cursor-pointer transition-colors"
                        onClick={() => {
                          if (
                            userData.provider === "linkedin" &&
                            userData.profile.bio
                          ) {
                            // Already have LinkedIn data, just select it
                            setUserData((prev) => ({
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                aiGenerated: false,
                              },
                            }));
                          } else if (
                            userData.contacts.linkedin &&
                            userData.profile.bio
                          ) {
                            // Connected during this session, select the imported bio
                            setUserData((prev) => ({
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                aiGenerated: false,
                              },
                            }));
                          } else {
                            // Need to connect LinkedIn first
                            handleLinkedInConnect();
                          }
                        }}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            (userData.provider === "linkedin" ||
                              userData.contacts.linkedin) &&
                            userData.profile.bio &&
                            !userData.preferences.aiGenerated
                              ? "bg-primary border-primary"
                              : "border-border"
                          } flex items-center justify-center`}
                        >
                          {(userData.provider === "linkedin" ||
                            userData.contacts.linkedin) &&
                            userData.profile.bio &&
                            !userData.preferences.aiGenerated && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                        </div>
                        <span className="font-medium flex items-center text-foreground">
                          {userData.provider === "linkedin" ? (
                            <>
                              Import from LinkedIn
                              <Badge variant="outline" className="ml-2 text-xs">
                                Available
                              </Badge>
                            </>
                          ) : userData.contacts.linkedin ? (
                            <>
                              Use LinkedIn Bio
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs text-success border-success"
                              >
                                Connected
                              </Badge>
                            </>
                          ) : (
                            <>
                              Connect & Import LinkedIn
                              {linkedinConnecting && (
                                <div className="ml-2 animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent"></div>
                              )}
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* AI Generation */}
                    {userData.preferences.aiGenerated && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="bioPrompt">
                            Tell us what you do:
                          </Label>
                          <Textarea
                            id="bioPrompt"
                            placeholder="I help B2B companies scale their sales teams through strategic partnerships and data-driven insights..."
                            value={userData.preferences.bioPrompt}
                            onChange={(e) =>
                              setUserData((prev) => ({
                                ...prev,
                                preferences: {
                                  ...prev.preferences,
                                  bioPrompt: e.target.value,
                                },
                              }))
                            }
                            rows={3}
                            className="mt-2"
                          />
                        </div>

                        {/* Generated Bio Display */}
                        {generatedBio && (
                          <div className="p-4 bg-muted rounded-lg border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-foreground flex items-center">
                                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                                AI Generated Bio
                              </span>
                              <Badge variant="outline" className="text-xs">
                                Ready
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {generatedBio}
                            </p>
                          </div>
                        )}

                        {/* Generate Button */}
                        {!generatedBio && (
                          <Button
                            onClick={handleGenerateBio}
                            disabled={
                              isLoading || !userData.preferences.bioPrompt
                            }
                            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
                          >
                            {isLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2"></div>
                                Generating Bio...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate Bio →
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Manual Bio or LinkedIn Import */}
                    {!userData.preferences.aiGenerated && (
                      <div>
                        {(userData.provider === "linkedin" ||
                          userData.contacts.linkedin) &&
                        userData.profile.bio ? (
                          <div>
                            <Label>LinkedIn Bio</Label>
                            <div className="p-4 bg-muted rounded-lg border border-border mt-2">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-foreground flex items-center">
                                  <span className="text-blue-600 text-xs font-bold mr-2">
                                    in
                                  </span>
                                  {userData.provider === "linkedin"
                                    ? "Imported from LinkedIn"
                                    : "Connected & Imported"}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-xs text-success border-success"
                                >
                                  Connected
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {userData.profile.bio}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() =>
                                setUserData((prev) => ({
                                  ...prev,
                                  profile: { ...prev.profile, bio: "" },
                                }))
                              }
                            >
                              Edit Bio
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Label htmlFor="manualBio">Your Bio</Label>
                            <Textarea
                              id="manualBio"
                              placeholder="Write a brief description about yourself and what you do..."
                              value={userData.profile.bio}
                              onChange={(e) =>
                                setUserData((prev) => ({
                                  ...prev,
                                  profile: {
                                    ...prev.profile,
                                    bio: e.target.value,
                                  },
                                }))
                              }
                              rows={4}
                              className="mt-2"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* LinkedIn Connection Status */}
                  {linkedinConnecting && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            Connecting to LinkedIn...
                          </p>
                          <p className="text-xs text-blue-700">
                            Importing your professional bio and profile
                            information
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={linkedinConnecting}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={
                        (!userData.profile.bio && !generatedBio) ||
                        linkedinConnecting
                      }
                      className="bg-primary hover:bg-primary-hover text-primary-foreground"
                    >
                      Continue →
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Contact Preferences */}
          {currentStep === "contact-preferences" && (
            <div className="w-full max-w-[480px] mx-auto">
              <Card className="p-8 bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-2">
                    <h1 className="text-foreground">
                      How can people reach you?
                    </h1>
                    <p className="text-muted-foreground">
                      Choose which contact methods to include on your card
                    </p>
                  </div>

                  {/* Contact Options */}
                  <div className="space-y-4">
                    {/* Email */}
                    <div className="flex items-center space-x-4 p-4 bg-success/5 border border-success/20 rounded-lg">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">Email</div>
                        <div className="text-sm text-muted-foreground">
                          {userData.profile.email}
                        </div>
                        {userData.provider !== "email" && (
                          <div className="text-xs text-success">
                            From {userData.provider}
                          </div>
                        )}
                      </div>
                      <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:border-border-hover transition-colors">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                        <Phone className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">Phone</div>
                        {userData.contacts.phone && userData.profile.phone ? (
                          <div className="text-sm text-muted-foreground">
                            {userData.profile.phone}
                          </div>
                        ) : (
                          <Input
                            placeholder="Add phone number"
                            value={userData.profile.phone}
                            onChange={(e) => {
                              const value = e.target.value;

                              const phoneRegex = /^[0-9]{0,10}$/;
                              if (!phoneRegex.test(value)) return;

                              setUserData((prev) => ({
                                ...prev,
                                profile: {
                                  ...prev.profile,
                                  phone: value,
                                },
                                contacts: {
                                  ...prev.contacts,
                                  phone: !value,
                                },
                              }));
                            }}
                            className="mt-2"
                          />
                        )}
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                          userData.contacts.phone
                            ? "bg-success border-success"
                            : "border-border bg-background hover:border-border-hover"
                        }`}
                        onClick={() =>
                          setUserData((prev) => ({
                            ...prev,
                            contacts: {
                              ...prev.contacts,
                              phone: !prev.contacts.phone,
                            },
                          }))
                        }
                      >
                        {userData.contacts.phone && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>

                    {/* LinkedIn */}
                    <div className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:border-border-hover transition-colors">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">in</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">
                          LinkedIn
                        </div>
                        {userData.provider === "linkedin" ||
                        userData.contacts.linkedin ? (
                          <div>
                            <div className="text-sm text-muted-foreground">
                              linkedin.com/in/
                              {userData.profile.firstName.toLowerCase()}
                              {userData.profile.lastName.toLowerCase()}
                            </div>
                            <div className="text-xs text-success">
                              {userData.provider === "linkedin"
                                ? "Connected via signup"
                                : "Connected for bio import"}
                            </div>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" className="mt-2">
                            Connect LinkedIn
                          </Button>
                        )}
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                          userData.contacts.linkedin
                            ? "bg-success border-success"
                            : "border-border bg-background hover:border-border-hover"
                        }`}
                        onClick={() =>
                          setUserData((prev) => ({
                            ...prev,
                            contacts: {
                              ...prev.contacts,
                              linkedin: !prev.contacts.linkedin,
                            },
                          }))
                        }
                      >
                        {userData.contacts.linkedin && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Calendar */}
                    <div className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:border-border-hover transition-colors">
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">
                          Calendar
                        </div>
                        <Button variant="outline" size="sm" className="mt-2">
                          Connect calendar
                        </Button>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                          userData.contacts.calendar
                            ? "bg-success border-success"
                            : "border-border bg-background hover:border-border-hover"
                        }`}
                        onClick={() =>
                          setUserData((prev) => ({
                            ...prev,
                            contacts: {
                              ...prev.contacts,
                              calendar: !prev.contacts.calendar,
                            },
                          }))
                        }
                      >
                        {userData.contacts.calendar && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handleBack}>
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="bg-primary hover:bg-primary-hover text-primary-foreground"
                    >
                      Continue →
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Card Preview & Launch */}
          {currentStep === "card-preview" && (
            <div className="w-full max-w-[480px] mx-auto">
              <Card className="p-8 bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-2">
                    <h1 className="text-foreground flex items-center justify-center">
                      {isCreatingCard
                        ? "Creating your card..."
                        : "Your card is ready! 🎉"}
                    </h1>
                    <p className="text-muted-foreground">
                      {isCreatingCard
                        ? "Please wait while we set up your AI-powered business card"
                        : "Your AI-powered business card is live and ready to share"}
                    </p>
                  </div>

                  {/* Card Preview */}
                  {!isCreatingCard && (
                    <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-xl p-6 text-white relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex items-center space-x-4 mb-4">
                          <img
                            src={
                              createdCard?.avatar?.url
                                ? `${STRAPI_URL}${createdCard.avatar.url}`
                                : userData.profile.photo ||
                                  `https://ui-avatars.com/api/?name=${userData.profile.firstName}+${userData.profile.lastName}&background=F26522&color=fff&size=80`
                            }
                            alt="Profile"
                            className="w-16 h-16 rounded-full border-2 border-white/20 object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-lg">
                              {createdCard?.name ||
                                `${userData.profile.firstName} ${userData.profile.lastName}`}
                            </h3>
                            <p className="text-sm text-white/80">
                              {createdCard?.jobTitle ||
                                userData.profile.jobTitle}{" "}
                              at{" "}
                              {createdCard?.company || userData.profile.company}
                            </p>
                          </div>
                        </div>

                        {(createdCard?.bio || userData.profile.bio) && (
                          <p className="text-sm text-white/90 mb-4 leading-relaxed">
                            {createdCard?.bio || userData.profile.bio}
                          </p>
                        )}

                        <div className="flex space-x-3">
                          {(createdCard?.contactMethods?.email ||
                            userData.contacts.email) && (
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                              <Mail className="h-4 w-4" />
                            </div>
                          )}
                          {(createdCard?.contactMethods?.phone ||
                            userData.contacts.phone) && (
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                              <Phone className="h-4 w-4" />
                            </div>
                          )}
                          {(createdCard?.contactMethods?.linkedin ||
                            userData.contacts.linkedin) && (
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                in
                              </span>
                            </div>
                          )}
                          {(createdCard?.contactMethods?.calendar ||
                            userData.contacts.calendar) && (
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                              <Calendar className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Training Summary */}
                  {!isCreatingCard && (
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Bot className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">
                          Your AI has been trained on:
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {(userData.provider === "linkedin" ||
                          userData.contacts.linkedin) && (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-success" />
                            <span>
                              Your LinkedIn profile and professional bio
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-success" />
                          <span>
                            Professional experience in{" "}
                            {(
                              createdCard?.jobTitle || userData.profile.jobTitle
                            )?.toLowerCase()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-success" />
                          <span>
                            Common questions for{" "}
                            {createdCard?.company || userData.profile.company}{" "}
                            professionals
                          </span>
                        </div>
                        {(createdCard?.bio || userData.profile.bio) && (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-success" />
                            <span>
                              Personal bio and professional background
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Card Link */}
                  {!isCreatingCard && (
                    <div className="space-y-3">
                      <div>
                        <Label>Your link:</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm text-muted-foreground font-mono">
                            {window.location.origin}/
                            {createdCard.card_profile_link
                              ?.toLowerCase()
                              .replace(/\s+/g, "-") || "username"}
                          </div>
                          <Button
                            onClick={copyCardLink}
                            variant="outline"
                            size="sm"
                            className={`px-3 ${
                              copiedLink
                                ? "bg-success text-white border-success"
                                : ""
                            }`}
                          >
                            {copiedLink ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy Link
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Final Actions */}
                  {!isCreatingCard && (
                    <div className="flex space-x-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={handleEditCard}
                        className="flex-1"
                        disabled={isLoading}
                      >
                        Edit Card
                      </Button>
                      <Button
                        onClick={handleGoToDashboard}
                        className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground"
                        disabled={isLoading}
                      >
                        {isLoading ? "Loading..." : "Go to Dashboard"}
                      </Button>
                    </div>
                  )}

                  {/* Loading state for card creation */}
                  {isCreatingCard && (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Card Edit Step */}
          {currentStep === "card-edit" && (
            <div className="w-full max-w-[480px] mx-auto">
              <Card className="p-8 bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-2">
                    <h1 className="text-foreground flex items-center justify-center">
                      Edit Your Card
                    </h1>
                    <p className="text-muted-foreground">
                      Make changes to your business card details
                    </p>
                  </div>

                  {/* Edit Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Full Name</Label>
                      <Input
                        id="edit-name"
                        defaultValue={
                          createdCard?.card_name ||
                          `${userData.profile.firstName} ${userData.profile.lastName}`
                        }
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-job-title">Job Title</Label>
                      <Input
                        id="edit-job-title"
                        defaultValue={
                          createdCard?.job_title || userData.profile.jobTitle
                        }
                        placeholder="Enter your job title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-company">Company</Label>
                      <Input
                        id="edit-company"
                        defaultValue={
                          createdCard?.company || userData.profile.company
                        }
                        placeholder="Enter your company"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        defaultValue={
                          createdCard?.email || userData.profile.email
                        }
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone</Label>
                      <Input
                        id="edit-phone"
                        type="tel"
                        defaultValue={
                          createdCard?.phone || userData.profile.phone
                        }
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-bio">Bio</Label>
                      <Textarea
                        id="edit-bio"
                        defaultValue={
                          createdCard?.description || userData.profile.bio
                        }
                        placeholder="Enter your bio"
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1"
                      disabled={editingCard}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        const form = document.getElementById(
                          "card-edit-form"
                        ) as HTMLFormElement;
                        if (form) {
                          const formData = new FormData(form);
                          const updatedData = {
                            card_name: (
                              document.getElementById(
                                "edit-name"
                              ) as HTMLInputElement
                            )?.value,
                            job_title: (
                              document.getElementById(
                                "edit-job-title"
                              ) as HTMLInputElement
                            )?.value,
                            company: (
                              document.getElementById(
                                "edit-company"
                              ) as HTMLInputElement
                            )?.value,
                            email: (
                              document.getElementById(
                                "edit-email"
                              ) as HTMLInputElement
                            )?.value,
                            phone: (
                              document.getElementById(
                                "edit-phone"
                              ) as HTMLInputElement
                            )?.value,
                            description: (
                              document.getElementById(
                                "edit-bio"
                              ) as HTMLTextAreaElement
                            )?.value,
                          };
                          handleSaveCardEdit(updatedData);
                        }
                      }}
                      className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground"
                      disabled={editingCard}
                    >
                      {editingCard ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
