import React, { useState, useEffect } from "react";
import { DesktopCard } from "./endUserView/DesktopCard";
import { TabletCard } from "./endUserView/TabletCard";
import { MobileCard } from "./endUserView/MobileCard";
import { createEventHandlers } from "../utils/endUserViewHelpers";
import { mockCardData } from "../utils/endUserViewConstants";
import { useResponsiveDevice, DeviceType } from "../hooks/useResponsiveDevice";

interface EndUserViewProps {
  cardData?: any;
  device?: any;
  isPreview?: boolean;
  onChatClick?: () => void;
  user?: any;
  userProfile?: any;
  isModal?: boolean;
  forceDevice?: boolean; // New prop to force a specific device view
}

export function EndUserView({
  cardData,
  device,
  isPreview = false,
  onChatClick,
  user,
  userProfile,
  isModal = false,
  forceDevice = false,
}: EndUserViewProps) {
  // Use responsive device detection
  const { device: responsiveDevice } = useResponsiveDevice();

  // State for manual device override (when user clicks device toggle)
  const [manualDeviceOverride, setManualDeviceOverride] =
    useState<DeviceType | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine which device view to show
  const getActiveDevice = (): DeviceType => {
    // If forceDevice is true and device prop is provided, use that
    if (forceDevice && device) {
      return device;
    }

    // If user manually selected a device (via toggle), use that
    if (manualDeviceOverride) {
      return manualDeviceOverride;
    }

    // If device prop is provided (for preview mode), use that
    if (device) {
      return device;
    }

    // Otherwise, use responsive detection
    return responsiveDevice;
  };

  const activeDevice = getActiveDevice();

  // Reset manual override when screen size changes significantly
  useEffect(() => {
    if (!forceDevice && !device && manualDeviceOverride !== responsiveDevice) {
      // Only reset if the responsive device is different and we're not in a forced mode
      const timer = setTimeout(() => {
        if (!isPreview && !isModal) {
          setManualDeviceOverride(null);
        }
      }, 1000); // Small delay to avoid flickering during resize

      return () => clearTimeout(timer);
    }
  }, [
    responsiveDevice,
    manualDeviceOverride,
    forceDevice,
    device,
    isPreview,
    isModal,
  ]);

  const eventHandlers = createEventHandlers();

  if (!mounted) {
    return null;
  }

  // Use provided cardData or fallback to mock data
  const displayData = cardData || mockCardData;

  // Ensure displayData has required properties with fallbacks
  const safeDisplayData = {
    ...displayData,
    stats: displayData?.stats || { views: 0, connections: 0, aiChats: 0 },
    socialLinks: displayData?.socialLinks || displayData?.links || [],
    fullName:
      displayData?.profile?.full_name ||
      displayData?.fullName ||
      "Professional User",
    jobTitle:
      displayData?.profile?.job_title ||
      displayData?.jobTitle ||
      "Professional Title",
    company: displayData?.profile?.company || displayData?.company || "",
    bio:
      displayData?.profile?.bio ||
      displayData?.bio ||
      "Professional bio information.",
    profilePhoto:
      displayData?.profile?.profile_photo_url ||
      displayData?.profilePhoto ||
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  };

  return (
    <div
      className={`${isModal ? "h-full" : "min-h-screen"} bg-gray-50`}
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif',
      }}
    >
      {/* Header - only show if not in modal and not preview */}
      {!isModal && !isPreview && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-xl bg-white/80">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">🦁</span>
                  </div>
                  <div>
                    <h1 className="font-bold text-lg text-gray-900">
                      End User View
                    </h1>
                    <p className="text-xs text-gray-500">
                      See how visitors experience your card
                    </p>
                  </div>
                </div>
              </div>

              {/* Device Toggle */}
              {/* <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
                {(["desktop", "tablet", "mobile"] as const).map(
                  (deviceOption) => (
                    <button
                      key={deviceOption}
                      onClick={() => setManualDeviceOverride(deviceOption)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                        activeDevice === deviceOption
                          ? "bg-white shadow-sm text-primary font-semibold"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {deviceOption}
                      {!forceDevice &&
                        !device &&
                        responsiveDevice === deviceOption &&
                        !manualDeviceOverride && (
                          <span className="ml-1 text-xs opacity-60">•</span>
                        )}
                    </button>
                  )
                )}
              </div> */}
            </div>
          </div>
        </div>
      )}

      {/* Device Toggle for Modal - only show if modal and not preview */}
      {isModal && !isPreview && (
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
              {(["desktop", "tablet", "mobile"] as const).map(
                (deviceOption) => (
                  <button
                    key={deviceOption}
                    onClick={() => setManualDeviceOverride(deviceOption)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                      activeDevice === deviceOption
                        ? "bg-white shadow-sm text-primary font-semibold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {deviceOption}
                    {!forceDevice &&
                      !device &&
                      responsiveDevice === deviceOption &&
                      !manualDeviceOverride && (
                        <span className="ml-1 text-xs opacity-60">•</span>
                      )}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Card Display */}
      <div
        className={`${isModal ? "py-8" : "py-12"} ${
          activeDevice === "mobile" ? "p-0" : "px-6"
        }`}
        style={{
          background:
            activeDevice === "mobile"
              ? "#FFFFFF"
              : "linear-gradient(135deg, #F5F7FA 0%, #C3CFE2 100%)",
        }}
      >
        {activeDevice === "desktop" && (
          <DesktopCard
            cardData={safeDisplayData}
            onAskAI={onChatClick || eventHandlers.handleAskAI}
            onShare={eventHandlers.handleShare}
            onDownload={eventHandlers.handleDownload}
            onSocialClick={eventHandlers.handleSocialClick}
          />
        )}
        {activeDevice === "tablet" && (
          <TabletCard
            cardData={safeDisplayData}
            onAskAI={onChatClick || eventHandlers.handleAskAI}
            onShare={eventHandlers.handleShare}
            onDownload={eventHandlers.handleDownload}
            onSocialClick={eventHandlers.handleSocialClick}
          />
        )}
        {activeDevice === "mobile" && (
          <MobileCard
            cardData={safeDisplayData}
            onAskAI={onChatClick || eventHandlers.handleAskAI}
            onShare={eventHandlers.handleShare}
            onDownload={eventHandlers.handleDownload}
            onSocialClick={eventHandlers.handleSocialClick}
          />
        )}
      </div>

      {/* Stats Footer - only show if not in modal and not mobile */}
      {!isModal && activeDevice !== "mobile" && (
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>
                  Views: {safeDisplayData.stats?.views?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>
                  Connections: {safeDisplayData.stats?.connections || "0"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span>AI Chats: {safeDisplayData.stats?.aiChats || "0"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
