import { Bell, CreditCard, Share2, Shield, User } from "lucide-react";
import React, { useState } from "react";
import { useAppSelector } from "../hooks";
import { AffiliateSection } from "./settings/AffiliateSection";
import { BillingSection } from "./settings/BillingSection";
import { NotificationsSection } from "./settings/NotificationsSection";
import { ProfileSection } from "./settings/ProfileSection";
import { SecuritySection } from "./settings/SecuritySection";
import { ToastProvider } from "./ui/toast";

interface User {
  id: string;
  email: string;
  name: string;
}

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");

  const { user } = useAppSelector((state) => state.auth);
  const [userProfile, setUserProfile] = useState({});
  // Settings sections including billing
  const settingsCategories = [
    { id: "profile", label: "Profile", icon: User },
    { id: "billing", label: "Billing & Subscription", icon: CreditCard },
    { id: "affiliate", label: "Affiliate Program", icon: Share2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Login & Security", icon: Shield },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <ProfileSection
            user={user}
            userProfile={userProfile}
            onProfileUpdate={setUserProfile}
          />
        );
      case "billing":
        return (
          <BillingSection
            userProfile={userProfile}
            onProfileUpdate={setUserProfile}
          />
        );
      case "affiliate":
        return <AffiliateSection />;
      case "notifications":
        return <NotificationsSection />;
      case "security":
        return <SecuritySection user={user} />;
      default:
        return (
          <ProfileSection
            user={user}
            userProfile={userProfile}
            onProfileUpdate={setUserProfile}
          />
        );
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border px-8 py-6">
          <div>
            <h1 className="mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your profile, billing, notifications, and security
              preferences
            </p>
          </div>
        </div>

        <div className="flex">
          {/* Premium Sidebar */}
          <div
            className="w-64 bg-card border-r border-border min-h-screen"
            style={{ padding: "24px" }}
          >
            <div>
              <nav className="space-y-1">
                {settingsCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveSection(category.id)}
                      className={`w-full flex items-center space-x-3 text-left transition-all duration-200 ${
                        activeSection === category.id ? "active" : ""
                      }`}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color:
                          activeSection === category.id ? "#F26522" : "#666666",
                        background:
                          activeSection === category.id
                            ? "#FFF7F0"
                            : "transparent",
                        border: "none",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => {
                        if (activeSection !== category.id) {
                          e.currentTarget.style.background = "#F5F5F7";
                          e.currentTarget.style.color = "#333333";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeSection !== category.id) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#666666";
                        }
                      }}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span
                        style={{
                          lineHeight: "1.4",
                          display: "flex",
                          alignItems: "center",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        {category.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">{renderContent()}</div>
        </div>
      </div>
    </ToastProvider>
  );
}
