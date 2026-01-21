import {
  ArrowRight,
  Building,
  Calendar,
  Check,
  CreditCard,
  Crown,
  DollarSign,
  Download,
  MessageCircle,
  TrendingUp,
  Upload,
  Zap
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Plan,
  settingsApi,
  Subscription,
  SubscriptionHistory,
} from "../../api/settingsApi";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useToast } from "../ui/toast";

interface UserProfile {
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

interface BillingSectionProps {
  userProfile: UserProfile | null;
  onProfileUpdate: (profile: UserProfile) => void;
}

export function BillingSection({
  userProfile,
  onProfileUpdate,
}: BillingSectionProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">(
    "annual"
  );
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<
    SubscriptionHistory[]
  >([]);
  const { addToast } = useToast();

  // Load billing data on mount
  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setIsLoading(true);
      const [plansResponse, subscriptionResponse, historyResponse] =
        await Promise.all([
          settingsApi.getPlans(),
          settingsApi.getCurrentSubscription(),
          settingsApi.getSubscriptionHistory(),
        ]);

      setAvailablePlans(plansResponse.plans);
      setCurrentSubscription(subscriptionResponse.subscription);
      setSubscriptionHistory(historyResponse.history);

      // Set billing period based on current subscription
      if (subscriptionResponse.subscription) {
        setBillingPeriod(
          subscriptionResponse.subscription.billing_cycle === "yearly"
            ? "annual"
            : "monthly"
        );
      }
    } catch (error) {
      console.error("Error loading billing data:", error);
      addToast({
        type: "error",
        title: "Failed to load billing data",
        message: "Please try refreshing the page",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Preview mode for demonstrating psychological nudges
  const [previewMode, setPreviewMode] = useState(false);
  const [previewScenario, setPreviewScenario] = useState<
    | "starter"
    | "professional-monthly"
    | "professional-annual"
    | "executive-monthly"
    | "executive-annual"
    | "high-usage"
  >("starter");

  const isDebugMode =
    window.location.hostname === "localhost" ||
    window.location.hostname.includes("figma");

  // Billing handlers
  const handleUpgradePlan = async (planId: string) => {
    setIsUpgrading(true);
    try {
      const billingCycle = billingPeriod === "annual" ? "yearly" : "monthly";
      const response = await settingsApi.subscribeToPlan(planId, billingCycle);

      // Reload billing data to get updated information
      await loadBillingData();

      // Update user profile with new plan
      const plan = availablePlans.find((p) => p.id === planId);
      if (userProfile && plan && onProfileUpdate) {
        onProfileUpdate({
          ...userProfile,
          plan: plan.name.toLowerCase(),
        });
      }

      addToast({
        type: "success",
        title: "Plan Updated",
        message: `Successfully upgraded to ${plan?.name} plan!`,
      });
    } catch (error: any) {
      console.error("Error upgrading plan:", error);
      addToast({
        type: "error",
        title: "Upgrade Failed",
        message: error.message || "Failed to upgrade plan. Please try again.",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription || currentSubscription.plan.name === "Starter") {
      addToast({
        type: "warning",
        title: "Cannot Cancel",
        message: "Starter plan cannot be cancelled",
      });
      return;
    }

    setIsCancelling(true);
    try {
      await settingsApi.cancelSubscription();

      // Reload billing data
      await loadBillingData();

      // Update user profile
      if (userProfile && onProfileUpdate) {
        onProfileUpdate({
          ...userProfile,
          plan: "starter",
        });
      }

      addToast({
        type: "success",
        title: "Subscription Cancelled",
        message:
          "Your subscription has been cancelled and you have been moved to the Starter plan",
      });
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      addToast({
        type: "error",
        title: "Cancellation Failed",
        message:
          error.message || "Failed to cancel subscription. Please try again.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // In real app, download actual invoice
    addToast({
      type: "info",
      title: "Invoice Download",
      message: "Invoice download feature will be available soon",
    });
  };

  // Use real data instead of mock data
  const billingData = {
    currentPlan: currentSubscription?.plan?.name || "Starter",
    aiCredits: userProfile?.ai_credits || { used: 150, limit: 1000 },
    nextBillingDate: "2024-02-15",
    paymentMethod: {
      type: "card",
      last4: "4242",
      brand: "Visa",
    },
  };

  // Calculate pricing and savings based on billing period
  const plans = availablePlans.map((plan) => {
    if (plan.price_type === "contact") {
      return {
        ...plan,
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: null,
        regularPrice: undefined,
        interval: "month",
        billedAs: undefined,
        savings: undefined,
        discountPercent: 0,
        isContactUs: true,
        features: plan.features.map(
          (feature) =>
            `${feature.value}  ${feature.name}` || feature.description
        ),
        limits: {
          cards: -1,
          aiCredits: 5000,
          contacts: -1,
          monthlyViews: -1,
          documentsTotal: -1,
          documentsMonthly: 50,
          websiteUrls: 20,
          creditRollover: true,
          maxRollover: 10000,
        },
        support: "Priority",
      };
    }

    const isAnnual = billingPeriod === "annual";
    const monthlyPrice = plan.price * 1.25; // Assuming 25% markup for monthly
    const annualPrice = plan.price;
    const price = isAnnual ? annualPrice : monthlyPrice;
    const regularPrice = monthlyPrice;
    const yearlyValue = monthlyPrice * 12;
    const yearlyAnnualPrice = annualPrice * 12;
    const yearlySavings = yearlyValue - yearlyAnnualPrice;

    return {
      ...plan,
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price,
      regularPrice: isAnnual ? regularPrice : undefined,
      interval: isAnnual ? "month" : "month",
      billedAs: isAnnual
        ? `${(price * 12).toFixed(0)} billed annually`
        : "billed monthly",
      savings:
        isAnnual && annualPrice > 0 ? `Save ${yearlySavings}/year` : undefined,
      discountPercent:
        isAnnual && annualPrice > 0
          ? Math.round(((yearlyValue - yearlyAnnualPrice) / yearlyValue) * 100)
          : 0,
      isContactUs: false,
      features: plan.features.map((f) => f.name || f.description),
      limits: {
        cards: plan.id === "starter" ? 1 : plan.id === "professional" ? 5 : -1,
        aiCredits:
          plan.id === "starter"
            ? 100
            : plan.id === "professional"
            ? 1000
            : 5000,
        contacts: plan.id === "starter" ? 50 : -1,
        monthlyViews: plan.id === "starter" ? 500 : -1,
        documentsTotal: plan.id === "starter" ? 3 : -1,
        documentsMonthly:
          plan.id === "starter" ? 0 : plan.id === "professional" ? 10 : 50,
        websiteUrls:
          plan.id === "starter" ? 1 : plan.id === "professional" ? 5 : 20,
        creditRollover: plan.id === "executive",
        maxRollover: plan.id === "executive" ? 10000 : 0,
      },
      support: plan.id === "executive" ? "Priority" : "Standard",
    };
  });

  // Find current plan
  const currentPlan = plans.find(
    (p) => p.name.toLowerCase() === currentSubscription?.plan.name.toLowerCase()
  );
  const creditUsagePercent = userProfile?.ai_credits
    ? (userProfile.ai_credits.used / userProfile.ai_credits.limit) * 100
    : 0;

  // Legacy plans for fallback (keeping the structure for preview mode)
  const legacyPlans = [
    {
      id: "executive",
      name: "Executive",
      monthlyPrice: null,
      annualPrice: null,
      description: "Scale without limits",
      highlight: "Unused credits roll over (up to 10,000)",
      isContactUs: true,
      features: [
        "Unlimited active cards",
        "Unlimited monthly views",
        "Unlimited contacts storage",
        "5,000 AI credits/month (~500 conversations)",
        "50 documents/month for AI training",
        "20 website URLs training",
        "Unused credits rollover (up to 10,000)",
        "Full data export capabilities",
        "Conversation analytics",
        "Priority email support",
        "Advanced virtual backgrounds",
        "CRM integration (coming soon)",
      ],
      limits: {
        cards: -1,
        aiCredits: 5000,
        contacts: -1,
        monthlyViews: -1,
        documentsTotal: -1,
        documentsMonthly: 50,
        websiteUrls: 20,
        creditRollover: true,
        maxRollover: 10000,
      },
      support: "Priority",
    },
    {
      id: "professional",
      name: "Professional",
      monthlyPrice: 12,
      annualPrice: 9,
      popular: true,
      description: "Everything you need to succeed",
      highlight: "5 cards for different contexts",
      features: [
        "5 active cards",
        "Unlimited monthly views",
        "Unlimited contacts storage",
        "1,000 AI credits/month (~100 conversations)",
        "10 documents/month for AI training",
        "5 website URLs training",
        "Automated follow-up emails",
        "Calendar & Gmail integration",
        "Export contacts (CSV)",
        "Virtual backgrounds",
        "Email signature generator",
        "Standard email support",
      ],
      limits: {
        cards: 5,
        aiCredits: 1000,
        contacts: -1,
        monthlyViews: -1,
        documentsTotal: -1,
        documentsMonthly: 10,
        websiteUrls: 5,
        creditRollover: false,
        maxRollover: 0,
      },
      support: "Standard",
    },
    {
      id: "starter",
      name: "Starter",
      monthlyPrice: 0,
      annualPrice: 0,
      description: "Try before you buy",
      highlight: "Fully functional digital business card",
      features: [
        "1 active card",
        "500 monthly card views",
        "50 contacts storage",
        "100 AI credits/month (~10 conversations)",
        "3 documents total for AI training",
        "1 website URL training",
        "Lead capture forms",
        "Basic QR code",
        "Share via link",
        "Source tracking",
        "Community support",
      ],
      limits: {
        cards: 1,
        aiCredits: 100,
        contacts: 50,
        monthlyViews: 500,
        documentsTotal: 3,
        documentsMonthly: 0,
        websiteUrls: 1,
        creditRollover: false,
        maxRollover: 0,
      },
      support: "Community",
    },
  ];

  // Display variables for preview mode or real data
  const displayPlan = previewMode
    ? previewScenario.split("-")[0]
    : currentPlan?.id || "starter";
  const displayBillingPeriod = previewMode
    ? previewScenario.includes("annual")
      ? "annual"
      : "monthly"
    : billingPeriod;
  const displayCurrentPlan = previewMode
    ? plans.find((p) => p.id === displayPlan) ||
      legacyPlans.find((p) => p.id === displayPlan)
    : currentPlan;
  const displayPlans = previewMode ? legacyPlans : plans;
  const displayCreditUsage =
    previewMode && previewScenario === "high-usage" ? 91 : creditUsagePercent;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-foreground">Billing & Subscription</h3>
        </div>

        {/* Psychological Upgrade Nudge System */}
        <div className="mb-6 space-y-3">
          {/* Free Users - Primary conversion nudge */}
          {displayPlan === "starter" && (
            <div className="relative p-4 bg-gradient-to-r from-primary-light to-orange-100 border border-primary/20 rounded-lg overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl-lg font-medium">
                Limited Time
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2 animate-pulse"></div>
                <div>
                  <h4 className="text-foreground font-medium mb-1">
                    🚀 You're missing out on 87% more connections!
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Professional users see{" "}
                    <strong>5.3x more profile views</strong> and generate{" "}
                    <strong>73% more leads</strong> than free users.
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-success">
                    <span>✓ 2,847 users upgraded this month</span>
                    <span>✓ Save $36/year with annual</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Professional Users - Annual billing + upgrade nudges */}
          {displayPlan === "professional" &&
            displayBillingPeriod === "monthly" && (
              <div className="space-y-3">
                <div className="relative p-4 bg-gradient-to-r from-warning/10 to-orange-100 border border-warning/30 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-warning text-warning-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        💰
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-foreground font-medium mb-1">
                        You're overpaying by $36 per year
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Switch to annual billing and <strong>save 25%</strong> -
                        that's like getting 3 months free!
                        <span className="text-warning font-medium">
                          {" "}
                          Your current monthly rate expires in 23 days.
                        </span>
                      </p>
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="text-success">
                          ✓ Most users choose annual (78%)
                        </span>
                        <span className="text-info">
                          ✓ Cancel anytime with full refund
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        previewMode ? null : setBillingPeriod("annual")
                      }
                      className="bg-warning hover:bg-warning/90 text-warning-foreground shrink-0"
                      disabled={previewMode}
                    >
                      Save $36
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-info rounded-full"></div>
                      <span className="text-info-foreground">
                        <strong>Pro tip:</strong> 67% of Professional users
                        upgrade to Executive within 6 months
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        previewMode ? null : handleUpgradePlan("executive")
                      }
                      className="text-xs text-info hover:text-info-foreground transition-colors underline"
                      disabled={previewMode || isUpgrading}
                    >
                      Future-proof now →
                    </button>
                  </div>
                </div>
              </div>
            )}

          {/* Annual Professional Users - Executive upgrade nudge */}
          {displayPlan === "professional" &&
            displayBillingPeriod === "annual" && (
              <div className="p-4 bg-gradient-to-r from-primary/10 to-orange-100 border border-primary/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-foreground font-medium mb-1">
                      🎯 You're growing faster than expected!
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Your engagement is <strong>in the top 15%</strong> of
                      Professional users.
                      <strong>Executive plan</strong> unlocks unlimited scaling
                      + credit rollover for heavy users like you.
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-primary">
                      <span>✓ No monthly limits</span>
                      <span>✓ Credits roll over</span>
                      <span>✓ Contact for pricing</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      previewMode ? null : handleUpgradePlan("executive")
                    }
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
                    disabled={previewMode || isUpgrading}
                  >
                    Scale Up
                  </Button>
                </div>
              </div>
            )}

          {/* Monthly Executive Users - Annual billing nudge */}
          {displayPlan === "executive" &&
            displayBillingPeriod === "monthly" && (
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-success-foreground">
                      <strong>Executive insight:</strong> Custom pricing
                      available - let's discuss your needs!
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      previewMode ? null : setBillingPeriod("annual")
                    }
                    className="text-xs text-success hover:text-success-foreground transition-colors underline"
                    disabled={previewMode}
                  >
                    Contact sales →
                  </button>
                </div>
              </div>
            )}

          {/* Annual Executive Users - VIP status reinforcement */}
          {displayPlan === "executive" && displayBillingPeriod === "annual" && (
            <div className="p-3 bg-gradient-to-r from-success/10 to-green-50 border border-success/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-success text-success-foreground rounded-full flex items-center justify-center text-sm">
                    👑
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-foreground font-medium mb-1">
                    Welcome to the Executive Circle
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You're among the <strong>top 8% of Leo users</strong> with
                    unlimited access and priority support. Keep scaling without
                    limits. 🚀
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs text-success">
                  <span>✓ Unlimited everything</span>
                  <Badge className="bg-success text-success-foreground text-xs">
                    VIP Status
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* High Usage Nudge - Appears when credits > 80% */}
          {displayPlan === "professional" && displayCreditUsage > 80 && (
            <div className="p-3 bg-gradient-to-r from-warning/10 to-yellow-50 border border-warning/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm">
                  <Zap className="w-4 h-4 text-warning" />
                  <span className="text-warning-foreground">
                    <strong>You're a power user!</strong>{" "}
                    {displayCreditUsage.toFixed(0)}% of monthly credits used.
                    Executive plan = unlimited + rollover.
                  </span>
                </div>
                <button
                  onClick={() =>
                    previewMode ? null : handleUpgradePlan("executive")
                  }
                  className="text-xs text-warning hover:text-warning-foreground transition-colors underline"
                  disabled={previewMode || isUpgrading}
                >
                  Never run out →
                </button>
              </div>
            </div>
          )}

          {/* Preview Mode Indicator */}
          {previewMode && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-xs text-blue-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>
                  Preview Mode: Showing nudges for{" "}
                  <strong>{previewScenario.replace("-", " ")}</strong> scenario
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Current Plan Overview */}
        <Card className="p-6 bg-card border-border mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="text-foreground">Current Plan</h4>
                {displayCurrentPlan?.popular && (
                  <Badge className="bg-primary text-primary-foreground">
                    Popular
                  </Badge>
                )}
                {previewMode && (
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    Preview Mode
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {(previewMode ? displayPlan : currentPlan?.id) ===
                  "starter" && (
                  <Zap className="h-5 w-5 text-muted-foreground" />
                )}
                {(previewMode ? displayPlan : currentPlan?.id) ===
                  "professional" && <Crown className="h-5 w-5 text-primary" />}
                {(previewMode ? displayPlan : currentPlan?.id) ===
                  "executive" && <Building className="h-5 w-5 text-info" />}
                <span className="text-2xl font-bold text-foreground">
                  {previewMode
                    ? plans.find((p) => p.id === displayPlan)?.name || "Starter"
                    : displayCurrentPlan?.name || "Starter"}
                </span>
                {displayCurrentPlan?.price &&
                  displayCurrentPlan.price > 0 &&
                  !displayCurrentPlan.isContactUs && (
                    <span className="text-muted-foreground">
                      ${displayCurrentPlan.price}/{displayCurrentPlan.interval}
                    </span>
                  )}
                {displayCurrentPlan?.isContactUs && (
                  <span className="text-primary">Contact Us</span>
                )}
              </div>
            </div>

            {(previewMode ? displayPlan : billingData.currentPlan) !==
              "executive" && (
              <Button
                onClick={() =>
                  previewMode ? null : handleUpgradePlan("professional")
                }
                disabled={isUpgrading || previewMode}
                className="bg-primary hover:bg-primary-hover text-primary-foreground"
              >
                {isUpgrading ? "Upgrading..." : "Upgrade Plan"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                AI Credits
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg font-semibold text-foreground">
                  {billingData.aiCredits.used.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {billingData.aiCredits.limit.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-1">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    displayCreditUsage > 80 ? "bg-warning" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(displayCreditUsage, 100)}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                ~
                {Math.floor(
                  (previewMode
                    ? (displayCreditUsage / 100) * billingData.aiCredits.limit
                    : billingData.aiCredits.used) / 10
                )}{" "}
                conversations
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                Active Cards
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg font-semibold text-foreground">
                  {userProfile?.cards_count || 0}
                </span>
                <span className="text-sm text-muted-foreground">
                  /
                  {displayCurrentPlan?.limits?.cards === -1
                    ? "∞"
                    : displayCurrentPlan?.limits?.cards}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {displayCurrentPlan?.limits?.monthlyViews === -1
                  ? "Unlimited views"
                  : `${
                      displayCurrentPlan?.limits?.monthlyViews || 0
                    } views/month`}
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Contacts</div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg font-semibold text-foreground">
                  {userProfile?.contacts_count || 0}
                </span>
                <span className="text-sm text-muted-foreground">
                  /
                  {displayCurrentPlan?.limits?.contacts === -1
                    ? "∞"
                    : displayCurrentPlan?.limits?.contacts}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Storage limit</div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                AI Training
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg font-semibold text-foreground">
                  {displayCurrentPlan?.limits?.documentsMonthly === 0
                    ? displayCurrentPlan?.limits?.documentsTotal
                    : displayCurrentPlan?.limits?.documentsMonthly || 0}
                </span>
                <span className="text-sm text-muted-foreground">
                  {displayCurrentPlan?.limits?.documentsMonthly === 0
                    ? "total"
                    : "/month"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Documents + {displayCurrentPlan?.limits?.websiteUrls || 0} URLs
              </div>
            </div>
          </div>

          {/* Next Billing */}
          {billingData.currentPlan !== "starter" && (
            <div className="flex items-center justify-between p-4 bg-info/10 rounded-lg border border-info/20">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-info" />
                <div>
                  <p className="font-medium text-foreground">
                    Next billing date
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {billingData.nextBillingDate}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {displayCurrentPlan?.isContactUs ? (
                  <p className="font-semibold text-primary">Contact Us</p>
                ) : (
                  <p className="font-semibold text-foreground">
                    ${displayCurrentPlan?.price}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {displayCurrentPlan?.isContactUs
                    ? "Custom billing"
                    : "Auto-renewal"}
                </p>
              </div>
            </div>
          )}

          {/* Credit Rollover Notice for Executive Plan */}
          {billingData.currentPlan === "executive" && (
            <div className="flex items-center space-x-3 p-4 bg-success/10 rounded-lg border border-success/20">
              <Zap className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium text-foreground">Credits Roll Over</p>
                <p className="text-sm text-muted-foreground">
                  Unused credits carry forward (up to 10,000 total)
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Available Plans */}
        <Card className="p-6 bg-card border-border mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-foreground">Available Plans</h4>

            {/* Billing Period Toggle */}
            <div className="flex items-center space-x-4">
              {billingPeriod === "annual" && (
                <div className="flex items-center space-x-2 text-sm text-success">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Save up to 30% with annual billing</span>
                </div>
              )}

              <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    billingPeriod === "monthly"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod("annual")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 relative ${
                    billingPeriod === "annual"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Annual
                  <div className="absolute -top-1 -right-1 bg-success text-success-foreground text-xs px-1.5 py-0.5 rounded-full">
                    Save 30%
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-4 border rounded-lg transition-all duration-200 ${
                  plan.id === billingData.currentPlan
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border-hover"
                }`}
              >
                {plan.name === "Professional" && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {plan.id === "Executive" && (
                      <Building className="h-5 w-5 text-info" />
                    )}
                    {plan.id === "Professional" && (
                      <Crown className="h-5 w-5 text-primary" />
                    )}
                    {plan.id === "Starter" && (
                      <Zap className="h-5 w-5 text-muted-foreground" />
                    )}
                    <h5 className="font-semibold text-foreground">
                      {plan.name}
                    </h5>
                  </div>
                  <div className="mb-2">
                    {plan.isContactUs ? (
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <span className="text-lg font-bold text-primary">
                          Contact Us
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <span className="text-2xl font-bold text-foreground">
                          ${plan.price}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-sm text-muted-foreground">
                            /{plan.interval}
                          </span>
                        )}
                        {plan.regularPrice &&
                          plan.regularPrice > plan.price && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${plan.regularPrice}
                            </span>
                          )}
                        {plan.discountPercent > 0 && (
                          <div className="bg-success text-success-foreground text-xs px-1.5 py-0.5 rounded-full font-medium">
                            -{plan.discountPercent}%
                          </div>
                        )}
                      </div>
                    )}
                    {plan.billedAs && plan.price > 0 && !plan.isContactUs && (
                      <div className="text-xs text-muted-foreground mb-1">
                        {plan.billedAs}
                      </div>
                    )}
                    {plan.savings && !plan.isContactUs && (
                      <div className="text-xs text-success font-medium">
                        {plan.savings}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {plan.description}
                  </p>
                  {plan.highlight && (
                    <p className="text-xs text-primary font-medium">
                      {plan.highlight}
                    </p>
                  )}
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <Check className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.name === billingData.currentPlan ? (
                  <Button variant="outline" disabled className="w-full">
                    Current Plan
                  </Button>
                ) : plan.name === "Starter" &&
                  billingData.currentPlan !== "Starter" ? (
                  <Button
                    variant="outline"
                    className="w-full border-warning text-warning hover:bg-warning hover:text-warning-foreground"
                    onClick={() => handleUpgradePlan(plan.id)}
                    disabled={isUpgrading}
                  >
                    Downgrade to Free
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
                      onClick={() => {
                        if (plan.isContactUs) {
                          // Handle contact us for executive plan
                          window.open(
                            "mailto:sales@aleo.ai?subject=Executive Plan Inquiry",
                            "_blank"
                          );
                        } else {
                          handleUpgradePlan(plan.id);
                        }
                      }}
                      disabled={isUpgrading}
                    >
                      {isUpgrading
                        ? "Processing..."
                        : plan.isContactUs
                        ? "Contact Sales"
                        : plan.id === "professional"
                        ? "Start 7-Day Free Trial"
                        : "Upgrade Now"}
                    </Button>
                    {plan.price > 0 && !plan.isContactUs && (
                      <p className="text-xs text-center text-muted-foreground">
                        7-day free trial • Cancel anytime
                        {billingPeriod === "annual" && (
                          <span> • Pay annually</span>
                        )}
                      </p>
                    )}
                    {plan.isContactUs && (
                      <p className="text-xs text-center text-muted-foreground">
                        Custom pricing • Enterprise support
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Payment Method */}
        {billingData.currentPlan !== "starter" && (
          <Card className="p-6 bg-card border-border mb-6">
            <h4 className="text-foreground mb-4">Payment Method</h4>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">
                    {billingData.paymentMethod.brand} ••••{" "}
                    {billingData.paymentMethod.last4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Primary payment method
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
          </Card>
        )}

        {/* Billing History */}
        {billingData.currentPlan !== "starter" && (
          <Card className="p-6 bg-card border-border mb-6">
            <h4 className="text-foreground mb-4">Billing History</h4>
            <div className="space-y-3">
              {subscriptionHistory?.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">
                        {invoice.plan} Plan
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.plan_start_date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        ${invoice.amount || 0}
                      </p>
                      <Badge
                        variant={
                          invoice.status === "paid" ? "default" : "destructive"
                        }
                        className="text-xs"
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* AI Credit Usage Info */}
        <Card className="p-6 bg-card border-border">
          <h4 className="text-foreground mb-4">AI Credit Usage Guide</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">
                  AI response/message
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                1 credit
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <Upload className="h-4 w-4 text-info" />
                <span className="text-sm text-foreground">
                  Document processed
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                5 credits
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <Zap className="h-4 w-4 text-warning" />
                <span className="text-sm text-foreground">Website crawled</span>
              </div>
              <Badge variant="outline" className="text-xs">
                10 credits
              </Badge>
            </div>
          </div>
          <div className="mt-4 p-3 bg-info/10 border border-info/20 rounded-lg">
            <p className="text-sm text-info-foreground">
              <strong>Credits reset monthly</strong> except Executive plan which
              includes rollover up to 10,000 credits.
              {billingPeriod === "annual" && (
                <span className="block mt-1">
                  <strong>Annual billing:</strong> Pay once per year, cancel
                  anytime with prorated refunds.
                </span>
              )}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
