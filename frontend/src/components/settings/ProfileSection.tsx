import { Loader2, Save, Trash2, Upload, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { settingsApi, UserProfile } from "../../api/settingsApi";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { useToast } from "../ui/toast";
import { GiftLeoSection } from "./GiftLeoSection";

interface User {
  id: string;
  email: string;
  name: string;
}

interface UserProfileData {
  id: string;
  email: string;
  name: string;
  plan: string;
  cards_count: number;
  contacts_count: number;
  ai_credits?: {
    used: number;
    limit: number;
  };
}

interface ProfileSectionProps {
  user: User;
  userProfile: UserProfileData | null;
  onProfileUpdate: (profile: UserProfileData) => void;
}

export function ProfileSection({
  user,
  userProfile,
  onProfileUpdate,
}: ProfileSectionProps) {
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullProfile, setFullProfile] = useState<UserProfile | null>(null);
  const { addToast } = useToast();

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatar: null as File | null,
    avatarPreview: null as string | null,
  });

  // Load profile data on mount
  useEffect(() => {
    loadProfile();
  }, []);

  // Update form when user data changes
  useEffect(() => {
    if (fullProfile) {
      const nameParts = fullProfile.name?.split(" ") || [];
      setProfileData((prev) => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: fullProfile.email || "",
        avatarPreview: fullProfile.avatar_url || null,
      }));
    }
  }, [fullProfile]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await settingsApi.getProfile();
      setFullProfile(response.user);
    } catch (error) {
      console.error("Error loading profile:", error);
      addToast({
        type: "error",
        title: "Failed to load profile",
        message: "Please try refreshing the page",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form changes
  const handleProfileChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        addToast({
          type: "error",
          title: "File too large",
          message: "Please select an image smaller than 5MB",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        addToast({
          type: "error",
          title: "Invalid file type",
          message: "Please select an image file",
        });
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfileData((prev) => ({
        ...prev,
        avatar: file,
        avatarPreview: previewUrl,
      }));
    }
  };

  const handleRemoveAvatar = () => {
    if (
      profileData.avatarPreview &&
      profileData.avatarPreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(profileData.avatarPreview);
    }
    setProfileData((prev) => ({
      ...prev,
      avatar: null,
      avatarPreview: null,
    }));
  };

  // Save handlers
  const handleSaveProfile = async () => {
    if (!profileData.firstName.trim()) {
      addToast({
        type: "error",
        title: "Validation Error",
        message: "First name is required",
      });
      return;
    }

    setIsProfileSaving(true);
    try {
      const fullName =
        `${profileData.firstName.trim()} ${profileData.lastName.trim()}`.trim();

      const updateData: any = {
        name: fullName,
      };

      if (profileData.avatar) {
        updateData.avatar = profileData.avatar;
      }

      const response = await settingsApi.updateProfile(updateData);

      // Update local state
      setFullProfile(response.user);

      // Update parent component
      if (userProfile && onProfileUpdate) {
        onProfileUpdate({
          ...userProfile,
          name: response.user.name,
          email: response.user.email,
        });
      }

      addToast({
        type: "success",
        title: "Profile Updated",
        message: "Your profile has been successfully updated",
      });

      // Clean up avatar preview if it was a blob URL
      if (
        profileData.avatarPreview &&
        profileData.avatarPreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(profileData.avatarPreview);
      }

      // Reset avatar file after successful upload
      setProfileData((prev) => ({ ...prev, avatar: null }));
    } catch (error: any) {
      console.error("Error saving profile:", error);
      addToast({
        type: "error",
        title: "Save Failed",
        message: error.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setIsProfileSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-foreground mb-6">Profile</h3>
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Loading profile...
              </span>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-foreground mb-6">Profile</h3>

        <Card className="p-6 bg-card border-border">
          <div className="space-y-6">
            {/* Avatar Section */}
            <div>
              <h4 className="text-foreground mb-4">Avatar</h4>
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20">
                  {profileData.avatarPreview ? (
                    <img
                      src={profileData.avatarPreview}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-light rounded-full flex items-center justify-center">
                      <span className="text-2xl font-semibold text-primary">
                        {profileData?.firstName?.charAt(0)?.toUpperCase() ||
                          fullProfile?.name?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </span>
                    </div>
                  )}
                </Avatar>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <label
                      htmlFor="avatar-upload"
                      className="cursor-pointer inline-flex items-center px-3 py-1.5 border rounded-md text-sm hover:bg-gray-100"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload new photo
                    </label>

                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={handleRemoveAvatar}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Current photo (80px circle)
                  </p>
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Display Name */}
            <div>
              <h4 className="text-foreground mb-4">Display Name</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-foreground">
                    First name
                  </Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) =>
                      handleProfileChange("firstName", e.target.value)
                    }
                    className="mt-1 bg-input-background border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-foreground">
                    Last name
                  </Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) =>
                      handleProfileChange("lastName", e.target.value)
                    }
                    className="mt-1 bg-input-background border-border"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                How it appears on cards
              </p>
            </div>

            <Separator className="bg-border" />

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                className="mt-1 bg-input-background border-border"
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Current email (read-only)
              </p>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSaveProfile}
                disabled={isProfileSaving || isLoading}
                className="bg-primary hover:bg-primary-hover text-primary-foreground"
              >
                {isProfileSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Gift Leo Section - Added below existing Profile sections */}
      <GiftLeoSection />
    </div>
  );
}
