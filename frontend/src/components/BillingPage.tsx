// This component has been deprecated and merged into SettingsPage
// All billing functionality is now handled in SettingsPage with unified navigation
// This file is kept for backward compatibility but should not be used

import React from "react";

interface BillingPageProps {
  onBack: () => void;
}

export function BillingPage({ onBack }: BillingPageProps) {
  // Redirect to settings with billing section
  React.useEffect(() => {
    onBack(); // Go back and let router handle billing navigation
  }, [onBack]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="bg-card rounded-xl border border-border p-8">
          <h2 className="text-foreground mb-4">Redirecting...</h2>
          <p className="text-muted-foreground">
            Taking you to the unified billing experience.
          </p>
        </div>
      </div>
    </div>
  );
}
