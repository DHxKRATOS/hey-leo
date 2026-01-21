import React, { useState, useEffect } from "react";
import {
  Check,
  ArrowRight,
  Crown,
  Building,
  Zap,
  Star,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useToast } from "../ui/toast";
import { settingsApi, Plan, Subscription } from "../../api/settingsApi";
import { useAppSelector } from "../../hooks";
import { useNavigate } from "react-router-dom";

interface PricingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onNavigateToBlog?: () => void;
}

export function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">(
    "annual"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);
  const { user, isAuthenticated } = useAppSelector((state) => state?.auth);
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Load plans and subscription data on mount and when user changes
  useEffect(() => {
    loadPricingData();
  }, [user]); // Add user dependency to reload when auth state changes

  const loadPricingData = async () => {
    try {
      setIsLoading(true);
      const [plansResponse, subscriptionResponse] = await Promise.all([
        settingsApi.getPlans(),
        user
          ? settingsApi.getCurrentSubscription()
          : Promise.resolve({ subscription: null }),
      ]);

      setAvailablePlans(plansResponse.plans);
      setCurrentSubscription(subscriptionResponse.subscription);

      // Set billing period based on current subscription
      if (subscriptionResponse.subscription) {
        setBillingPeriod(
          subscriptionResponse.subscription.billing_cycle === "yearly"
            ? "annual"
            : "monthly"
        );
      }
    } catch (error) {
      console.error("Error loading pricing data:", error);
      // Fallback to static plans if API fails
      setAvailablePlans([
        {
          id: "starter",
          name: "Starter",
          description: "Try before you buy",
          price: 0,
          price_type: "fixed",
          features: [
            { name: "1 active card", description: "1 active card", value: "1" },
            {
              name: "500 monthly card views",
              description: "500 monthly card views",
              value: "500",
            },
            {
              name: "50 contacts storage",
              description: "50 contacts storage",
              value: "50",
            },
          ],
        },
        {
          id: "professional",
          name: "Professional",
          description: "Everything you need to succeed",
          price: 9,
          price_type: "fixed",
          features: [
            {
              name: "5 active cards",
              description: "5 active cards",
              value: "5",
            },
            {
              name: "Unlimited monthly views",
              description: "Unlimited monthly views",
              value: "unlimited",
            },
            {
              name: "Unlimited contacts storage",
              description: "Unlimited contacts storage",
              value: "unlimited",
            },
          ],
        },
        {
          id: "executive",
          name: "Executive",
          description: "Scale without limits",
          price: 0,
          price_type: "contact",
          features: [
            {
              name: "Unlimited active cards",
              description: "Unlimited active cards",
              value: "unlimited",
            },
            {
              name: "Unlimited monthly views",
              description: "Unlimited monthly views",
              value: "unlimited",
            },
            {
              name: "Priority support",
              description: "Priority support",
              value: "priority",
            },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onNavigateToHome = () => {
    navigate("/");
  };

  const onGetStarted = () => {
    navigate("/");
  };

  const onLogin = () => {
    navigate("/auth");
  };

  const onNavigateToBlog = () => {
    window.location.href = `${window.location.origin}/blogs/`;
  };
  // Handle subscription upgrade
  const handleUpgradePlan = async (planId: string) => {
    if (!isAuthenticated) {
      onLogin();
      return;
    }

    setIsUpgrading(true);
    try {
      const billingCycle = billingPeriod === "annual" ? "yearly" : "monthly";
      await settingsApi.subscribeToPlan(planId, billingCycle);

      // Reload pricing data to get updated information
      await loadPricingData();

      const plan = availablePlans.find((p) => p.id === planId);
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

  // Map API plans to display format
  const mapPlanToDisplayFormat = (plan: Plan) => {
    const getIcon = (planId: string) => {
      switch (planId) {
        case "executive":
          return Building;
        case "professional":
          return Crown;
        case "starter":
          return Zap;
        default:
          return Zap;
      }
    };

    const getFeaturesList = (features: Plan["features"]) => {
      return features.map(
        (feature) => `${feature.value}  ${feature.name}` || feature.description
      );
    };

    return {
      id: plan.id,
      name: plan.name,
      monthlyPrice: plan.price_type === "contact" ? null : plan.price * 1.25, // Assuming 25% markup for monthly
      annualPrice: plan.price_type === "contact" ? null : plan.price,
      popular: plan.id === "professional",
      description: plan.description,
      highlight:
        plan.id === "executive"
          ? "Unused credits roll over (up to 10,000)"
          : plan.id === "professional"
          ? "5 cards for different contexts"
          : "Fully functional digital business card",
      icon: getIcon(plan.id),
      isContactUs: plan.price_type === "contact",
      features: getFeaturesList(plan.features),
    };
  };

  const plans = availablePlans.map(mapPlanToDisplayFormat);

  const processedPlans = plans.map((plan) => {
    if (plan.isContactUs) {
      return {
        ...plan,
        price: null,
        savings: undefined,
        billedAs: undefined,
        discountPercent: 0,
      };
    }

    const isAnnual = billingPeriod === "annual";
    const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    const yearlyValue = plan.monthlyPrice * 12;
    const yearlyAnnualPrice = plan.annualPrice * 12;
    const yearlySavings = yearlyValue - yearlyAnnualPrice;
    const discountPercent =
      plan.annualPrice > 0
        ? Math.round(((yearlyValue - yearlyAnnualPrice) / yearlyValue) * 100)
        : 0;

    return {
      ...plan,
      price,
      savings:
        isAnnual && plan.annualPrice > 0
          ? `Save ${yearlySavings}/year`
          : undefined,
      billedAs:
        isAnnual && plan.annualPrice > 0
          ? `${yearlyAnnualPrice} billed annually`
          : undefined,
      discountPercent,
    };
  });

  const faq = [
    {
      question: "What counts as an AI credit?",
      answer:
        "Each AI response uses 1 credit, processing a document uses 5 credits, and crawling a website uses 10 credits. Credits reset monthly except Executive plan which includes rollover.",
    },
    {
      question: "Can I change plans anytime?",
      answer:
        "Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, and downgrades take effect at your next billing cycle.",
    },
    {
      question: "What happens to my data if I cancel?",
      answer:
        "Your data remains accessible for 30 days after cancellation. You can export all your data before deletion. We never sell or share your personal information.",
    },
    {
      question: "Is there a setup fee?",
      answer:
        "No setup fees ever. You only pay for your chosen plan, and you can start with our free Starter plan to try leo risk-free.",
    },
    {
      question: "Do you offer custom plans?",
      answer:
        "Yes! For teams of 25+ or specific enterprise requirements, we offer custom plans with dedicated support, custom integrations, and flexible pricing.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={onNavigateToHome}
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  🦁
                </span>
              </div>
              <span className="text-2xl font-bold text-foreground tracking-tight">
                leo
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={onNavigateToHome}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </button>
              <button
                onClick={onNavigateToBlog}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </button>
              {!isAuthenticated && (
                <>
                  <button
                    onClick={onLogin}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Login
                  </button>
                  <Button
                    onClick={onGetStarted}
                    className="bg-primary hover:bg-primary-hover text-primary-foreground"
                  >
                    Get Started Free
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
              🚀 Beta Pricing - Early Access
            </Badge>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-6 tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Special beta pricing for early adopters. Request access to join our
            private beta.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <div className="bg-muted p-1 rounded-lg inline-flex">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  billingPeriod === "monthly"
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("annual")}
                className={`px-4 py-2 rounded-md font-medium transition-all relative ${
                  billingPeriod === "annual"
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Annual
                <Badge className="absolute -top-2 -right-2 bg-success text-success-foreground text-xs">
                  Save 30%
                </Badge>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {processedPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative p-8 hover-lift ${
                  plan.popular ? "border-primary shadow-lg" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <plan.icon className="w-6 h-6 text-primary" />
                    <h3 className="text-2xl font-bold text-foreground">
                      {plan.name}
                    </h3>
                  </div>

                  <div className="mb-4">
                    {plan.isContactUs ? (
                      <div className="flex items-baseline justify-center space-x-2">
                        <span className="text-2xl font-bold text-primary">
                          Contact Us
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-center space-x-2">
                        <span className="text-4xl font-bold text-foreground">
                          ${plan.price}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-muted-foreground">/month</span>
                        )}
                        {plan.discountPercent > 0 && (
                          <Badge className="bg-success text-success-foreground text-xs">
                            -{plan.discountPercent}%
                          </Badge>
                        )}
                      </div>
                    )}
                    {plan.billedAs && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {plan.billedAs}
                      </p>
                    )}
                    {plan.savings && (
                      <p className="text-sm text-success font-medium mt-1">
                        {plan.savings}
                      </p>
                    )}
                  </div>

                  <p className="text-muted-foreground mb-2">
                    {plan.description}
                  </p>
                  {plan.highlight && (
                    <p className="text-sm text-primary font-medium">
                      {plan.highlight}
                    </p>
                  )}
                </div>

                <div className="mb-8">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => {
                      if (plan.id === "starter") {
                        onGetStarted();
                      } else if (plan.isContactUs) {
                        // Handle contact us for executive plan
                        window.open(
                          "mailto:sales@aleo.ai?subject=Executive Plan Inquiry",
                          "_blank"
                        );
                      } else {
                        handleUpgradePlan(plan.id);
                      }
                    }}
                    disabled={
                      isUpgrading || currentSubscription?.plan.id === plan.id
                    }
                  >
                    {currentSubscription?.plan.id === plan.id
                      ? "Current Plan"
                      : isUpgrading
                      ? "Processing..."
                      : plan.isContactUs
                      ? "Contact Sales"
                      : plan.id === "starter"
                      ? "Get Started Free"
                      : "Start Free Trial"}
                    {currentSubscription?.plan.id !== plan.id && (
                      <ArrowRight className="w-4 h-4 ml-2" />
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground/70 mt-2">
                    {plan.isContactUs
                      ? "Custom pricing • Enterprise support"
                      : plan.price > 0
                      ? "Beta access required • Limited spots"
                      : "Free tier available in beta"}
                  </p>
                </div>

                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Compare Plans
            </h2>
            <p className="text-lg text-muted-foreground">
              See what's included in each plan
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Loading comparison...
              </span>
            </div>
          )}

          {!isLoading && (
            <div className="overflow-x-auto">
              <table className="w-full border border-border rounded-lg bg-surface">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold text-foreground">
                      Features
                    </th>
                    <th className="text-center p-4 font-semibold text-foreground">
                      Executive
                      <div className="text-sm font-normal text-primary mt-1">
                        Contact Us
                      </div>
                    </th>
                    <th className="text-center p-4 font-semibold text-foreground">
                      Professional
                      <div className="text-sm font-normal text-muted-foreground mt-1">
                        $9/mo (annual)
                      </div>
                    </th>
                    <th className="text-center p-4 font-semibold text-foreground">
                      Starter
                      <div className="text-sm font-normal text-muted-foreground mt-1">
                        Free
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-4 font-medium text-foreground">
                      Active Cards
                    </td>
                    <td className="text-center p-4 text-muted-foreground">
                      Unlimited
                    </td>
                    <td className="text-center p-4 text-muted-foreground">5</td>
                    <td className="text-center p-4 text-muted-foreground">1</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 font-medium text-foreground">
                      AI Credits/month
                    </td>
                    <td className="text-center p-4 text-muted-foreground">
                      5,000
                    </td>
                    <td className="text-center p-4 text-muted-foreground">
                      1,000
                    </td>
                    <td className="text-center p-4 text-muted-foreground">
                      100
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 font-medium text-foreground">
                      Contact Storage
                    </td>
                    <td className="text-center p-4 text-muted-foreground">
                      Unlimited
                    </td>
                    <td className="text-center p-4 text-muted-foreground">
                      Unlimited
                    </td>
                    <td className="text-center p-4 text-muted-foreground">
                      50
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 font-medium text-foreground">
                      Credit Rollover
                    </td>
                    <td className="text-center p-4 text-muted-foreground">
                      <Check className="w-4 h-4 text-success mx-auto" />
                    </td>
                    <td className="text-center p-4 text-muted-foreground">-</td>
                    <td className="text-center p-4 text-muted-foreground">-</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 font-medium text-foreground">
                      Priority Support
                    </td>
                    <td className="text-center p-4 text-muted-foreground">
                      <Check className="w-4 h-4 text-success mx-auto" />
                    </td>
                    <td className="text-center p-4 text-muted-foreground">-</td>
                    <td className="text-center p-4 text-muted-foreground">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about leo pricing
            </p>
          </div>

          <div className="space-y-6">
            {faq.map((item, index) => (
              <Card key={index} className="p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  {item.question}
                </h3>
                <p className="text-muted-foreground">{item.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-surface border-t border-border">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Ready to Join the Beta?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Be among the first to experience leo with exclusive beta pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              // onClick={onGetStarted}
              size="lg"
              className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-3 hover-lift"
            >
              Request Beta Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3 hover-lift"
            >
              Schedule Demo
            </Button>
          </div>
          <p className="text-muted-foreground/70 mt-4">
            Limited beta spots available • Early adopter pricing
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    🦁
                  </span>
                </div>
                <span className="text-xl font-bold text-foreground">leo</span>
              </div>
              <p className="text-muted-foreground text-sm">
                AI-powered business cards and personal assistant for modern
                professionals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="/#features"
                    className="hover:text-foreground transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="/pricing"
                    className="hover:text-foreground transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#roadmap"
                    className="hover:text-foreground transition-colors"
                  >
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#about"
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#affiliate"
                    className="hover:text-foreground transition-colors"
                  >
                    Affiliate
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="/blog"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#help"
                    className="hover:text-foreground transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#api"
                    className="hover:text-foreground transition-colors"
                  >
                    API Docs
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground/70 text-sm">
              © 2024 Leo. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="/privacy"
                className="text-muted-foreground/70 hover:text-muted-foreground transition-colors text-sm"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="text-muted-foreground/70 hover:text-muted-foreground transition-colors text-sm"
              >
                Terms
              </a>
              <a
                href="/cookies"
                className="text-muted-foreground/70 hover:text-muted-foreground transition-colors text-sm"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
