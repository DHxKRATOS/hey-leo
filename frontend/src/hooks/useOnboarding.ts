import { useState } from "react";
import { User, UserProfile } from "../types";

interface UseOnboardingProps {
  user: User | null;
  userProfile: UserProfile | null;
  demoMode: boolean;
  handleSignUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<void>;
  setUserProfile: (profile: UserProfile) => void;
  setAuthSuccess: (message: string) => void;
  onNavigateAfterOnboarding?: (action: "edit-card" | "cards") => void;
}

export function useOnboarding({
  user,
  userProfile,
  demoMode,
  handleSignUp,
  setUserProfile,
  setAuthSuccess,
  onNavigateAfterOnboarding,
}: UseOnboardingProps) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [socialSignUpData, setSocialSignUpData] = useState<any>(null);

  // Handle onboarding completion
  const handleOnboardingComplete = (
    userData: any,
    action?: "edit-card" | "cards"
  ) => {
    // Update user profile with onboarding data if needed
    if (userData && setUserProfile && userProfile) {
      const updatedProfile = {
        ...userProfile,
        name:
          `${userData.profile.firstName} ${userData.profile.lastName}` ||
          userProfile.name,
        // Add any other profile updates from onboarding data
      };
      setUserProfile(updatedProfile);
    }

    // Mark onboarding as completed
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);

    // Show success message
    setAuthSuccess("Welcome to Leo! Your account is ready to go.");

    // Navigate to the appropriate area based on the action
    if (onNavigateAfterOnboarding && action) {
      onNavigateAfterOnboarding(action);
    }
  };

  // Custom signup handler that triggers onboarding
  const handleSignUpWithOnboarding = async (
    email: string,
    password: string,
    name: string
  ) => {
    try {
      await handleSignUp(email, password, name);
      // After successful signup, trigger onboarding
      setShowOnboarding(true);
      setHasCompletedOnboarding(false);
    } catch (error) {
      // Error handling is already done in handleSignUp
      throw error;
    }
  };

  // Check if user should see onboarding
  const shouldShowOnboarding =
    user &&
    !demoMode &&
    !hasCompletedOnboarding &&
    (showOnboarding ||
      // Check if this is a newly created user (you could add more sophisticated logic here)
      (userProfile &&
        userProfile.cards_count === 0 &&
        !hasCompletedOnboarding));

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    setHasCompletedOnboarding(true);
    setSocialSignUpData(null);
  };

  // New handler for social signup with data
  const handleSocialSignUpWithOnboarding = async (
    provider: "google" | "linkedin",
    importedData: any
  ) => {
    try {
      // Create account with minimal info
      const displayName = `${importedData.firstName} ${importedData.lastName}`;
      await handleSignUp(
        importedData.email,
        "temp-password-" + Date.now(),
        displayName
      );

      // Store the imported data for onboarding
      setSocialSignUpData({
        provider,
        importedData,
      });

      // After successful signup, trigger onboarding
      setShowOnboarding(true);
      setHasCompletedOnboarding(false);
    } catch (error) {
      // Error handling is already done in handleSignUp
      throw error;
    }
  };

  return {
    hasCompletedOnboarding,
    showOnboarding,
    shouldShowOnboarding,
    socialSignUpData,
    handleOnboardingComplete,
    handleSignUpWithOnboarding,
    handleSocialSignUpWithOnboarding,
    handleCloseOnboarding,
  };
}
