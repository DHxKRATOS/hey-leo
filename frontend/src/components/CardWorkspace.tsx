import {
  ArrowLeft,
  Eye,
  MessageCircle,
  Settings,
  Share2,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner@2.0.3";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ImproveModule } from "./workspace/ImproveModule";
import { StreamlinedBuildModule } from "./workspace/StreamlinedBuildModule";
import { TrainModule } from "./workspace/TrainModule";

interface CardWorkspaceProps {
  selectedCard: any;
  selectedTemplate?: any;
  activeModule: "build" | "train" | "improve";
  user: any;
  userProfile: any;
  onModuleChange: (module: "build" | "train" | "improve") => void;
  onBack: () => void;
  isEventMode?: boolean;
  eventName?: string;
}

export function CardWorkspace({
  selectedCard,
  selectedTemplate,
  activeModule,
  user,
  userProfile,
  onModuleChange,
  onBack,
  isEventMode = false,
  eventName,
}: CardWorkspaceProps) {
  const [cardData, setCardData] = useState(selectedCard);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [navigationToTab, setNavigationToTab] = useState<string | null>(null);

  // Sync card data when selectedCard changes
  useEffect(() => {
    if (selectedCard && selectedCard.id !== cardData?.id) {
      setCardData(selectedCard);
      setHasChanges(false);
    }
  }, [selectedCard]);

  // Initialize card data when template is selected
  useEffect(() => {
    if (
      selectedTemplate &&
      selectedTemplate.id !== cardData?.design?.template
    ) {
      setCardData((prev) => ({
        ...prev,
        design: {
          ...prev.design,
          template: selectedTemplate.id,
        },
      }));
      setHasChanges(true);
    }
  }, [selectedTemplate, cardData?.design?.template]);

  const handleCardUpdate = (updates: any) => {
    try {
      setCardData((prev) => {
        return {
          ...prev,
          ...updates,
          // Ensure design object is preserved
          design: {
            ...prev.design,
            ...updates.design,
          },
          // Ensure profile object is preserved
          profile: {
            ...prev.profile,
            ...updates.profile,
          },
          // Ensure settings object is preserved and synced
          settings: {
            ...prev.settings,
            ...updates.settings,
            // Sync AI Chat state between profile and settings
            ai_chat_enabled:
              updates.profile?.ai_chat_enabled !== undefined
                ? updates.profile.ai_chat_enabled
                : prev.settings?.ai_chat_enabled,
          },
        };
      });
      setHasChanges(true);
      toast.success("Card updated! ✨");
    } catch (error) {
      toast.error("Failed to update card");
    }
  };

  const handlePreview = () => {
    // Directly trigger the beautiful preview modal
    setShowPreviewModal(true);
    toast.success("🦁 Opening beautiful preview!", {
      description: "Switch between desktop, mobile & tablet views",
    });
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case "build":
        return <Sparkles className="w-4 h-4" />;
      case "train":
        return <Wand2 className="w-4 h-4" />;
      case "improve":
        return <Zap className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getModuleDescription = (module: string) => {
    switch (module) {
      case "build":
        return isEventMode
          ? `Design your ${eventName} card`
          : "Design your stunning business card";
      case "train":
        return "Train your AI assistant with knowledge";
      case "improve":
        return "Analyze performance and optimize";
      default:
        return "Card workspace";
    }
  };

  // Check if Train/Improve modules should be accessible - AI Chat should be enabled by default
  const isAiChatEnabled = cardData?.profile?.ai_chat_enabled !== false; // Default to true unless explicitly false
  const canAccessTrainModule = isAiChatEnabled;
  const canAccessImproveModule = isAiChatEnabled;

  const handleModuleChange = (module: "build" | "train" | "improve") => {
    // Check AI chat requirement for Train/Improve modules
    if ((module === "train" || module === "improve") && !isAiChatEnabled) {
      toast.error("Please enable AI Chat in the About tab first", {
        duration: 5000,
        action: {
          label: "Go to About",
          onClick: () => onModuleChange("build"),
        },
      });
      return;
    }

    onModuleChange(module);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Enhanced Workspace Header */}
      <div className="bg-surface/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="hover:bg-muted"
              aria-label="Go back to previous page"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {cardData?.name || "My leo Card"}
                {isEventMode && eventName && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {eventName}
                  </Badge>
                )}
                {hasChanges && (
                  <span
                    className="ml-2 text-yellow-500 text-sm"
                    aria-label="Card has unsaved changes"
                  >
                    •
                  </span>
                )}
              </h1>
              <p className="text-sm text-muted-foreground">
                {getModuleDescription(activeModule)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Preview & Share Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // If not in build module, switch to build first, then navigate to Share
                  if (activeModule !== "build") {
                    onModuleChange("build");
                    // Set navigation after a brief delay to ensure Build module is rendered
                    setTimeout(() => {
                      setNavigationToTab("Share");
                    }, 100);
                  } else {
                    // Already in build module, navigate directly to Share tab
                    setNavigationToTab("Share");
                  }
                }}
                className="hover:bg-muted"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                className="hover:bg-muted"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>

            {/* AI Chat Status Indicator */}
            {isAiChatEnabled && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-success/10 border border-success/20 animate-pulse">
                <MessageCircle className="w-4 h-4 text-success" />
                <span className="text-sm text-success font-medium">
                  🦁 AI Chat Active
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Module Navigation */}
        <div className="mt-4">
          <Tabs value={activeModule} onValueChange={handleModuleChange}>
            <TabsList
              className="grid w-full max-w-md grid-cols-3 bg-muted/50 rounded-2xl p-1"
              role="tablist"
              aria-label="Card workspace modules"
            >
              <TabsTrigger
                value="build"
                className="rounded-xl data-[state=active]:bg-primary-surface data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20"
                role="tab"
                aria-controls="build-panel"
              >
                <div className="flex items-center space-x-2">
                  {getModuleIcon("build")}
                  <span>Build</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="train"
                className={`rounded-xl data-[state=active]:bg-primary-surface data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 ${
                  !canAccessTrainModule ? "opacity-50 cursor-not-allowed" : ""
                }`}
                role="tab"
                aria-controls="train-panel"
                disabled={!canAccessTrainModule}
              >
                <div className="flex items-center space-x-2">
                  {getModuleIcon("train")}
                  <span>Train</span>
                  {!canAccessTrainModule && (
                    <div className="w-1 h-1 bg-muted-foreground rounded-full opacity-50" />
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="improve"
                className={`rounded-xl data-[state=active]:bg-primary-surface data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 ${
                  !canAccessImproveModule ? "opacity-50 cursor-not-allowed" : ""
                }`}
                role="tab"
                aria-controls="improve-panel"
                disabled={!canAccessImproveModule}
              >
                <div className="flex items-center space-x-2">
                  {getModuleIcon("improve")}
                  <span>Improve</span>
                  {!canAccessImproveModule && (
                    <div className="w-1 h-1 bg-muted-foreground rounded-full opacity-50" />
                  )}
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Workspace Content */}
      <div className="flex-1 relative">
        <Tabs
          value={activeModule}
          onValueChange={handleModuleChange}
          className="h-full"
        >
          {/* Build Module - Using Streamlined Version */}
          <TabsContent
            value="build"
            className="h-full m-0"
            role="tabpanel"
            id="build-panel"
            aria-labelledby="build-tab"
          >
            <StreamlinedBuildModule
              card={cardData}
              onUpdate={handleCardUpdate}
              user={user}
              userProfile={userProfile}
              onModuleChange={onModuleChange}
              showPreviewModal={showPreviewModal}
              onPreviewModalChange={setShowPreviewModal}
              navigationToTab={navigationToTab}
              onTabNavigated={() => setNavigationToTab(null)}
            />
          </TabsContent>

          {/* Train Module */}
          <TabsContent
            value="train"
            className="h-full m-0"
            role="tabpanel"
            id="train-panel"
            aria-labelledby="train-tab"
          >
            {canAccessTrainModule ? (
              <TrainModule
                userId={user?.id}
                onSave={(trainingData) => {
                  handleCardUpdate({
                    ai_config: {
                      ...cardData.ai_config,
                      ...trainingData,
                    },
                  });
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <Card className="p-8 max-w-md text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Wand2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    AI Chat Required
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Enable AI Chat in the About tab to access the Train module
                  </p>
                  <Button
                    variant="leo-primary"
                    onClick={() => onModuleChange("build")}
                  >
                    Go to About Tab
                  </Button>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Improve Module */}
          <TabsContent
            value="improve"
            className="h-full m-0"
            role="tabpanel"
            id="improve-panel"
            aria-labelledby="improve-tab"
          >
            {canAccessImproveModule ? (
              <ImproveModule cardId={cardData?.id} timeRange="30d" />
            ) : (
              <div className="h-full flex items-center justify-center">
                <Card className="p-8 max-w-md text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Zap className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    AI Chat Required
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Enable AI Chat in the About tab to access the Improve module
                  </p>
                  <Button
                    variant="leo-primary"
                    onClick={() => onModuleChange("build")}
                  >
                    Go to About Tab
                  </Button>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Stats Footer */}
      <div className="bg-surface/80 backdrop-blur-sm border-t border-border/50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-muted-foreground font-medium">
                leo Design System
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-sm text-muted-foreground font-medium">
                Mobile Optimized
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isAiChatEnabled
                    ? "bg-purple-500 animate-pulse"
                    : "bg-gray-400"
                }`}
              />
              <span className="text-sm text-muted-foreground font-medium">
                {isAiChatEnabled ? "🦁 AI Powered" : "AI Disabled"}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Views: {cardData?.analytics?.views || 0}</span>
              <span>Shares: {cardData?.analytics?.shares || 0}</span>
              <span>Connects: {cardData?.analytics?.interactions || 0}</span>
            </div>

            <Badge variant="outline" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              leo v2.0
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
