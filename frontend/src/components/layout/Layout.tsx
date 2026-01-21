import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { signOut } from "../../store/authSlice";
import { AICreditUsageWidget } from "../AICreditUsageWidget";
import { Navigation } from "../Navigation";

export const Layout: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const userProfile = {
    id: user?.id?.toString(),
    name: user?.name,
    email: user?.email,
  };

  const handleSignOut = async () => {
    await dispatch(signOut());
    navigate("/auth");
  };

  return (
    <div className="min-h-screen max-w-[1440px] mx-auto bg-background animate-fade-in">
      {/* Topbar */}
      <div className="fixed top-0 left-72 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border z-40">
        <div className="h-full px-6 flex items-center justify-end">
          <div className="flex items-center space-x-4">
            <AICreditUsageWidget />
            <div className="flex items-center space-x-3">
              <span>{userProfile?.name}</span>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-surface transition-colors"
              >
                <LogOut className="h-4 w-4 text-text-secondary" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Navigation
        user={user}
        userProfile={userProfile}
        currentPage={location.pathname}
        onNavigate={(page) => {
          const path = page.startsWith("/") ? page : `/${page}`;
          navigate(path);
        }}
      />

      {/* Page Content */}
      <main className="pl-72 pt-16 transition-all duration-300">
        <div className="w-full max-w-[1140px] mx-auto px-6">
          <Outlet /> {/* yahan nested route ka content render hoga */}
        </div>
      </main>
    </div>
  );
};
