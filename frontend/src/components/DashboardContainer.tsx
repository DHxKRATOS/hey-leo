import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { getProfile } from "../store/authSlice";
import { CardWorkspace } from "./CardWorkspace";
import { Dashboard } from "./Dashboard";
import { fetchCardById } from "../store/cardSlice";

export const DashboardContainer: React.FC = () => {
  const [currentPage, setCurrentPage] = useState("");
  const [selectedCard, setSelectedCard] = useState({});
  const [activeModule, setActiveModule] = useState("build");
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!user && !isLoading) {
      dispatch(getProfile());
    }
  }, [user, isLoading, dispatch]);

  const handleNavigateToWorkspace = (
    card?: any,
    template?: any,
    module?: "build" | "train" | "improve"
  ) => {
    setSelectedCard(card);
    setCurrentPage(template);
    dispatch(fetchCardById(card.id));
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Create userProfile from user data with proper types
  const userProfile = {
    id: user?.user?.id?.toString(),
    name: user?.user?.name,
    email: user.user?.email,
    avatar_url: user?.user?.avatar?.url || user.avatar_url,
    subscription: user?.user?.subscription,
    preferences: user?.user?.preferences,
    plan: user?.user?.subscription?.plan?.name || "Free",
    cards_count: 0,
    contacts_count: 0,
    qr_scans: 0,
  };

  const dashboardUser = {
    ...user,
    id: user?.id?.toString(),
  };

  const renderPage = () => {
    switch (currentPage) {
      case "workspace":
        return (
          <CardWorkspace
            selectedCard={selectedCard}
            activeModule={activeModule}
            user={user}
            userProfile={userProfile}
            onModuleChange={function (
              module: "build" | "train" | "improve"
            ): void {
              setActiveModule(module);
            }}
            onBack={function (): void {
              setCurrentPage("");
            }}
          />
        );

      default:
        return (
          <Dashboard
            user={dashboardUser}
            userProfile={userProfile}
            onNavigateToWorkspace={handleNavigateToWorkspace}
          />
        );
    }
  };

  return <>{renderPage()}</>;
};
