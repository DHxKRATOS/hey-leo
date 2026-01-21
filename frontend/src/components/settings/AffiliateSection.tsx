import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Users,
  TrendingUp,
  Copy,
  ExternalLink,
  Calendar,
  BarChart3,
  CheckCircle,
  Clock,
  Share2,
  Loader2,
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useToast } from "../ui/toast";
import { settingsApi, AffiliateStats } from "../../api/settingsApi";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AffiliateSectionProps {
  user: User;
}

export function AffiliateSection() {
  const [copySuccess, setCopySuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [affiliateData, setAffiliateData] = useState<AffiliateStats | null>(
    null
  );
  const { addToast } = useToast();

  // Load affiliate data on mount
  useEffect(() => {
    loadAffiliateData();
  }, []);

  const loadAffiliateData = async () => {
    try {
      setIsLoading(true);
      const data = await settingsApi.getAffiliateStats();
      setAffiliateData(data);
    } catch (error) {
      console.error("Error loading affiliate data:", error);
      addToast({
        type: "error",
        title: "Failed to load affiliate data",
        message: "Please try refreshing the page",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const referralLink = affiliateData
    ? `https://heyleo.ai/ref/${affiliateData.referralCode}`
    : "";

  const handleCopyLink = async () => {
    if (!referralLink) return;

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess("link");
      setTimeout(() => setCopySuccess(""), 2000);
      addToast({
        type: "success",
        title: "Link Copied",
        message: "Referral link copied to clipboard",
      });
    } catch (err) {
      console.error("Failed to copy link");
      addToast({
        type: "error",
        title: "Copy Failed",
        message: "Failed to copy link to clipboard",
      });
    }
  };

  const handleCopyCode = async () => {
    if (!affiliateData) return;

    try {
      await navigator.clipboard.writeText(affiliateData.referralCode);
      setCopySuccess("code");
      setTimeout(() => setCopySuccess(""), 2000);
      addToast({
        type: "success",
        title: "Code Copied",
        message: "Referral code copied to clipboard",
      });
    } catch (err) {
      console.error("Failed to copy code");
      addToast({
        type: "error",
        title: "Copy Failed",
        message: "Failed to copy code to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-foreground mb-6">Affiliate Program</h3>
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Loading affiliate data...
              </span>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!affiliateData) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-foreground mb-6">Affiliate Program</h3>
          <Card className="p-6 bg-card border-border">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Failed to load affiliate data
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-foreground mb-2">Affiliate Program</h3>
        <p className="text-muted-foreground">
          Earn {affiliateData.commissionRate}% lifetime commission by referring
          new users to Leo
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Earnings */}
        <Card className="p-6 bg-surface border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 rounded-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                ${affiliateData.totalEarnings}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Earnings
              </div>
            </div>
          </div>
        </Card>

        {/* Monthly Earnings */}
        <Card className="p-6 bg-surface border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 rounded-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                ${affiliateData.monthlyEarnings}
              </div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </div>
          </div>
        </Card>

        {/* Active Referrals */}
        <Card className="p-6 bg-surface border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 rounded-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {affiliateData.activeReferrals}
              </div>
              <div className="text-sm text-muted-foreground">
                Active Referrals
              </div>
            </div>
          </div>
        </Card>

        {/* Conversion Rate */}
        <Card className="p-6 bg-surface border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 rounded-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {affiliateData.conversionRate}%
              </div>
              <div className="text-sm text-muted-foreground">
                Conversion Rate
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Referral Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Referral Link */}
        <Card className="p-6 bg-surface border border-border shadow-sm rounded-2xl">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Your Referral Link
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <span className="flex-1 text-sm text-foreground font-mono break-all">
                {referralLink}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="flex-shrink-0 rounded-lg"
              >
                <Copy className="h-4 w-4 mr-1" />
                {copySuccess === "link" ? "Copied!" : "Copy"}
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-lg"
                onClick={() =>
                  window.open(
                    `mailto:?subject=Check out Leo&body=I've been using Leo for my digital business cards and thought you'd love it too! Check it out: ${referralLink}`,
                    "_blank"
                  )
                }
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share via Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-lg"
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?text=Check out Leo - AI-powered digital business cards that actually work! ${referralLink}`,
                    "_blank"
                  )
                }
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Share on X
              </Button>
            </div>
          </div>
        </Card>

        {/* Referral Code */}
        <Card className="p-6 bg-surface border border-border shadow-sm rounded-2xl">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Your Referral Code
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <span className="flex-1 text-2xl font-bold text-foreground tracking-wider">
                {affiliateData.referralCode.toUpperCase()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="flex-shrink-0 rounded-lg"
              >
                <Copy className="h-4 w-4 mr-1" />
                {copySuccess === "code" ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Your referrals can also use this code during signup to get
              credited to your account.
            </p>
          </div>
        </Card>
      </div>

      {/* Program Details */}
      <Card className="p-6 bg-surface border border-border shadow-sm rounded-2xl">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Program Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">
              {affiliateData.commissionRate}% Commission
            </h4>
            <p className="text-sm text-muted-foreground">
              Earn 20% of every subscription payment from your referrals - for
              life!
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">
              Monthly Payouts
            </h4>
            <p className="text-sm text-muted-foreground">
              Receive your earnings every month via PayPal or bank transfer.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">No Minimum</h4>
            <p className="text-sm text-muted-foreground">
              No minimum threshold - get paid for every successful referral.
            </p>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6 bg-surface border border-border shadow-sm rounded-2xl">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Recent Activity
        </h3>
        {affiliateData.recentReferrals.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No referrals yet</p>
            <p className="text-sm text-muted-foreground">
              Start sharing your referral link to see your first referrals here!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {affiliateData.recentReferrals.map(
              (referral: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {referral.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {referral.date}
                    </p>
                  </div>
                  <Badge variant="success" className={""}>
                    +${referral.commission}
                  </Badge>
                </div>
              )
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
