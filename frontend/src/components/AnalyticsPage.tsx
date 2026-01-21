import { Eye, Globe, MessageCircle, Target, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { analyticsApi, UserAnalyticsData } from "../api/analyticsApi";
import { cardApi } from "../api/cardApi";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

// Transform backend analytics data to UI format
const transformAnalyticsData = (backendData: any) => {
  if (!backendData) {
    return {
      last30Days: [],
      sourceData: [],
      deviceData: [],
      geographicData: [],
    };
  }

  return {
    last30Days: backendData.timeSeries || [],
    sourceData: (backendData.sources || []).map((source: any) => ({
      name:
        source.name === "qr_code"
          ? "QR Code"
          : source.name === "direct_link"
          ? "Direct Link"
          : source.name === "email_signature"
          ? "Email Signature"
          : source.name === "ai_chat"
          ? "AI Chat"
          : source.name === "social_media"
          ? "Social Media"
          : source.name === "website"
          ? "Website"
          : source.name.charAt(0).toUpperCase() + source.name.slice(1),
      value: source.value,
      color: source.color || "#6B7280",
    })),
    deviceData: (backendData.devices || []).map((device: any) => ({
      name: device.name.charAt(0).toUpperCase() + device.name.slice(1),
      value: device.value,
      color: device.color || "#6B7280",
    })),
    geographicData: (backendData.countries || []).map((country: any) => ({
      country: country.name,
      visitors: country.count || Math.floor(country.value * 10),
      percentage: country.value,
    })),
  };
};

// Country code mapping function
const getCountryCode = (country: string): string => {
  const codeMap: { [key: string]: string } = {
    "United States": "US",
    Canada: "CA",
    "United Kingdom": "GB",
    Germany: "DE",
    France: "FR",
    Japan: "JP",
    Australia: "AU",
    Brazil: "BR",
    India: "IN",
    China: "CN",
    "South Korea": "KR",
    Netherlands: "NL",
    Sweden: "SE",
    Norway: "NO",
    Denmark: "DK",
    Finland: "FI",
    Spain: "ES",
    Italy: "IT",
    Switzerland: "CH",
    Austria: "AT",
    Belgium: "BE",
    Portugal: "PT",
    Ireland: "IE",
    Others: "🌍",
  };

  return codeMap[country] || "🌍";
};

// Helper function to generate fallback time series from overview data (used only as fallback)
const generateTimeSeriesFromOverview = (overview: any, dateRange: string) => {
  const getDaysCount = (range: string) => {
    switch (range) {
      case "7d":
        return 7;
      case "30d":
        return 30;
      case "90d":
        return 90;
      case "1y":
        return 365;
      default:
        return 30;
    }
  };

  const daysCount = getDaysCount(dateRange);
  return Array.from({ length: daysCount }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (daysCount - 1 - i));

    return {
      date: date.toISOString().split("T")[0],
      views: 0,
      uniqueViews: 0,
      conversations: 0,
      leads: 0,
      linkClicks: 0,
    };
  });
};

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d");
  const [selectedCard, setSelectedCard] = useState("all");
  const [hoveredSourceIndex, setHoveredSourceIndex] = useState<number | null>(
    null
  );
  const [data, setData] = useState(transformAnalyticsData(null));
  const [isFilteringData, setIsFilteringData] = useState(false);
  const [userCards, setUserCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<UserAnalyticsData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Fetch user cards on component mount
  useEffect(() => {
    const fetchUserCards = async () => {
      try {
        const response = await cardApi.getAll();
        setUserCards(response.cards || []);
      } catch (error) {
        console.error("Failed to fetch user cards:", error);
        setUserCards([]);
      }
    };

    fetchUserCards();
  }, []);

  // Initial data fetch on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (selectedCard === "all") {
          // Fetch user overview analytics
          const response = await analyticsApi.getUserAnalytics(dateRange);
          setAnalyticsData(response.data);

          // Generate time series data from overview
          const timeSeriesData = generateTimeSeriesFromOverview(
            response.data.overview,
            dateRange
          );

          // Use real backend analytics data
          const backendAnalytics = {
            timeSeries: response.data.timeSeries || timeSeriesData,
            sources: response.data.sources || [],
            devices: response.data.devices || [],
            countries: response.data.countries || [],
          };

          const transformedData = transformAnalyticsData(backendAnalytics);
          setData(transformedData);
        } else {
          // Fetch specific card analytics
          const cardId = selectedCard;
          const response = await analyticsApi.getCardAnalytics(
            cardId,
            dateRange
          );

          // Transform card analytics response to match expected structure
          const cardAnalyticsData = {
            overview: {
              totalViews: response.card?.total_views || 0,
              totalUniqueViews:
                response.data.timeSeries?.reduce(
                  (sum, day) => sum + day.uniqueViews,
                  0
                ) || 0,
              totalConversations:
                response.data.timeSeries?.reduce(
                  (sum, day) => sum + day.conversations,
                  0
                ) || 0,
              totalLeads:
                response.data.timeSeries?.reduce(
                  (sum, day) => sum + day.leads,
                  0
                ) || 0,
              totalLinkClicks:
                response.data.timeSeries?.reduce(
                  (sum, day) => sum + day.linkClicks,
                  0
                ) || 0,
              totalContacts: response.card?.total_leads || 0,
              conversionRate: 0,
              engagementRate: 0,
              viewsTrend: 0,
              leadsTrend: 0,
            },
            timeSeries: response.data.timeSeries || [],
            sources: response.data.sources || [],
            devices: response.data.devices || [],
            countries: response.data.countries || [],
            cards: [
              {
                id: response.card?.id || cardId,
                name: response.card?.name || "Selected Card",
                views: response.card?.total_views || 0,
                leads: response.card?.total_leads || 0,
                analytics: response.data.totalEvents || 0,
              },
            ],
          };

          // Calculate conversion and engagement rates
          const totalViews = cardAnalyticsData.overview.totalViews;
          const totalLeads = cardAnalyticsData.overview.totalLeads;
          const totalConversations =
            cardAnalyticsData.overview.totalConversations;
          const totalLinkClicks = cardAnalyticsData.overview.totalLinkClicks;

          cardAnalyticsData.overview.conversionRate =
            totalViews > 0 ? (totalLeads / totalViews) * 100 : 0;
          cardAnalyticsData.overview.engagementRate =
            totalViews > 0
              ? ((totalConversations + totalLinkClicks) / totalViews) * 100
              : 0;

          setAnalyticsData(cardAnalyticsData);

          // Use real backend analytics data for specific card
          const backendAnalytics = {
            timeSeries: response.data.timeSeries || [],
            sources: response.data.sources || [],
            devices: response.data.devices || [],
            countries: response.data.countries || [],
          };

          // Transform backend data for UI
          const transformedData = transformAnalyticsData(backendAnalytics);
          setData(transformedData);
        }
      } catch (error) {
        setError("Failed to load analytics data.");
        // Fallback to empty data
        setAnalyticsData(generateFallbackData(dateRange, selectedCard));
        setData(transformAnalyticsData(null));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fallback data generation for when API fails
  const generateFallbackData = (
    dateRange: string = "30d",
    selectedCard: string = "all"
  ): UserAnalyticsData => {
    const mockViews = Math.floor(Math.random() * 1000 + 500);
    const mockLeads = Math.floor(Math.random() * 50 + 10);

    return {
      overview: {
        totalViews: mockViews,
        totalUniqueViews: Math.floor(mockViews * 0.7),
        totalConversations: Math.floor(mockViews * 0.1),
        totalLeads: mockLeads,
        totalLinkClicks: Math.floor(mockViews * 0.15),
        conversionRate: (mockLeads / mockViews) * 100,
        engagementRate: 25,
        viewsTrend: Math.random() * 20 - 10,
        leadsTrend: Math.random() * 30 - 15,
      },
      cards: userCards.map((card) => ({
        id: card.id,
        name: card.card_name || "Untitled Card",
        views: card.card_views || 0,
        leads: card.card_leads || 0,
        analytics: Math.floor(Math.random() * 100),
      })),
    };
  };
  // Handle filter changes with loading state
  useEffect(() => {
    if (!isLoading) {
      setIsFilteringData(true);
      const timer = setTimeout(() => {
        setIsFilteringData(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [dateRange, selectedCard, isLoading]);

  // Force re-fetch when filters change
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (selectedCard === "all") {
          // Fetch user overview analytics
          const response = await analyticsApi.getUserAnalytics(dateRange);
          setAnalyticsData(response.data);

          // Generate time series data from overview
          const timeSeriesData = generateTimeSeriesFromOverview(
            response.data.overview,
            dateRange
          );

          // Use real backend analytics data
          const backendAnalytics = {
            timeSeries: response.data.timeSeries || timeSeriesData,
            sources: response.data.sources || [],
            devices: response.data.devices || [],
            countries: response.data.countries || [],
          };

          const transformedData = transformAnalyticsData(backendAnalytics);
          setData(transformedData);
        } else {
          // Fetch specific card analytics
          const cardId = selectedCard;
          const response = await analyticsApi.getCardAnalytics(
            cardId,
            dateRange
          );

          // Transform card analytics response to match expected structure
          const cardAnalyticsData = {
            overview: {
              totalViews: response.card?.total_views || 0,
              totalUniqueViews:
                response.data.timeSeries?.reduce(
                  (sum, day) => sum + day.uniqueViews,
                  0
                ) || 0,
              totalConversations:
                response.data.timeSeries?.reduce(
                  (sum, day) => sum + day.conversations,
                  0
                ) || 0,
              totalLeads:
                response.data.timeSeries?.reduce(
                  (sum, day) => sum + day.leads,
                  0
                ) || 0,
              totalLinkClicks:
                response.data.timeSeries?.reduce(
                  (sum, day) => sum + day.linkClicks,
                  0
                ) || 0,
              totalContacts: response.card?.total_leads || 0,
              conversionRate: 0,
              engagementRate: 0,
              viewsTrend: 0,
              leadsTrend: 0,
            },
            timeSeries: response.data.timeSeries || [],
            sources: response.data.sources || [],
            devices: response.data.devices || [],
            countries: response.data.countries || [],
            cards: [
              {
                id: response.card?.id || cardId,
                name: response.card?.name || "Selected Card",
                views: response.card?.total_views || 0,
                leads: response.card?.total_leads || 0,
                analytics: response.data.totalEvents || 0,
              },
            ],
          };

          // Calculate conversion and engagement rates
          const totalViews = cardAnalyticsData.overview.totalViews;
          const totalLeads = cardAnalyticsData.overview.totalLeads;
          const totalConversations =
            cardAnalyticsData.overview.totalConversations;
          const totalLinkClicks = cardAnalyticsData.overview.totalLinkClicks;

          cardAnalyticsData.overview.conversionRate =
            totalViews > 0 ? (totalLeads / totalViews) * 100 : 0;
          cardAnalyticsData.overview.engagementRate =
            totalViews > 0
              ? ((totalConversations + totalLinkClicks) / totalViews) * 100
              : 0;

          setAnalyticsData(cardAnalyticsData);

          // Use real backend analytics data for specific card
          const backendAnalytics = {
            timeSeries: response.data.timeSeries || [],
            sources: response.data.sources || [],
            devices: response.data.devices || [],
            countries: response.data.countries || [],
          };

          // Transform backend data for UI - ensure all chart sections get data
          const transformedData = transformAnalyticsData(backendAnalytics);

          // If no time series data from backend, generate fallback from card metrics
          if (
            !transformedData.last30Days ||
            transformedData.last30Days.length === 0
          ) {
            const fallbackTimeSeries = generateTimeSeriesFromOverview(
              cardAnalyticsData.overview,
              dateRange
            );
            transformedData.last30Days = fallbackTimeSeries;
          }

          // Ensure sources data is properly formatted for charts
          if (
            transformedData.sourceData.length === 0 &&
            response.data.sources &&
            response.data.sources.length > 0
          ) {
            transformedData.sourceData = response.data.sources.map(
              (source: any) => ({
                name:
                  source.name === "qr_code"
                    ? "QR Code"
                    : source.name === "direct_link"
                    ? "Direct Link"
                    : source.name === "email_signature"
                    ? "Email Signature"
                    : source.name === "ai_chat"
                    ? "AI Chat"
                    : source.name === "social_media"
                    ? "Social Media"
                    : source.name === "website"
                    ? "Website"
                    : source.name.charAt(0).toUpperCase() +
                      source.name.slice(1),
                value: source.value,
                color: source.color || "#6B7280",
              })
            );
          }

          // Ensure device data is properly formatted
          if (
            transformedData.deviceData.length === 0 &&
            response.data.devices &&
            response.data.devices.length > 0
          ) {
            transformedData.deviceData = response.data.devices.map(
              (device: any) => ({
                name:
                  device.name.charAt(0).toUpperCase() + device.name.slice(1),
                value: device.value,
                color: device.color || "#6B7280",
              })
            );
          }

          // Ensure geographic data is properly formatted
          if (
            transformedData.geographicData.length === 0 &&
            response.data.countries &&
            response.data.countries.length > 0
          ) {
            transformedData.geographicData = response.data.countries.map(
              (country: any) => ({
                country: country.name,
                visitors: country.count || Math.floor(country.value * 10),
                percentage: country.value,
              })
            );
          }

          setData(transformedData);
        }
      } catch (error) {
        setError("Failed to load analytics data.");
        // Fallback to empty data
        setAnalyticsData(generateFallbackData(dateRange, selectedCard));
        setData(transformAnalyticsData(null));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange, selectedCard]);

  // Calculate metrics from backend data or fallback to UI data
  const totalViews =
    analyticsData?.overview?.totalViews ??
    data.last30Days.reduce((sum, day) => sum + day.views, 0);
  const totalUniqueViews =
    analyticsData?.overview?.totalUniqueViews ??
    data.last30Days.reduce((sum, day) => sum + day.uniqueViews, 0);
  const totalConversations =
    analyticsData?.overview?.totalConversations ??
    data.last30Days.reduce((sum, day) => sum + day.conversations, 0);
  const totalLeads =
    analyticsData?.overview?.totalLeads ??
    data.last30Days.reduce((sum, day) => sum + day.leads, 0);
  const totalLinkClicks =
    analyticsData?.overview?.totalLinkClicks ??
    data.last30Days.reduce((sum, day) => sum + day.linkClicks, 0);
  const totalContacts = analyticsData?.overview?.totalContacts ?? totalLeads;

  // Calculate total visits for Traffic Sources center
  const totalVisits = data.sourceData.reduce(
    (sum, source) => sum + Math.floor(source.value * 10),
    0
  );

  const conversionRate =
    analyticsData?.overview?.conversionRate?.toFixed(1) ??
    (totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) : "0");
  const engagementRate =
    analyticsData?.overview?.engagementRate?.toFixed(1) ??
    (totalViews > 0
      ? (((totalConversations + totalLinkClicks) / totalViews) * 100).toFixed(1)
      : "0");

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-8 bg-background min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg text-muted-foreground">
            Loading analytics...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Analytics
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Track your networking performance and insights
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>

          {/* Card Filter */}
          <select
            value={selectedCard}
            onChange={(e) => setSelectedCard(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          >
            <option value="all">All Cards</option>
            {userCards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.card_name || "Untitled Card"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-5 h-5 text-yellow-600 mr-2">⚠️</div>
            <span className="text-yellow-800 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Unified Analytics Dashboard */}
      <div className="space-y-8">
        {/* Filter Status Indicator */}
        {(dateRange !== "30d" || selectedCard !== "all") && (
          <div className="flex items-center justify-center">
            <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm text-primary font-medium">
                Showing data for{" "}
                {selectedCard === "all"
                  ? "All Cards"
                  : userCards.find((c) => c.id === selectedCard)?.card_name ||
                    "Selected Card"}{" "}
                -{" "}
                {dateRange === "7d"
                  ? "Last 7 days"
                  : dateRange === "30d"
                  ? "Last 30 days"
                  : dateRange === "90d"
                  ? "Last 3 months"
                  : "Last year"}
              </span>
            </div>
          </div>
        )}

        {/* Key Metrics Overview */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-300 ${
            isFilteringData ? "opacity-70 scale-95" : "opacity-100 scale-100"
          }`}
        >
          <Card className="p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Views
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {isFilteringData ? "..." : totalViews.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-info" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Unique Visitors
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {isFilteringData ? "..." : totalUniqueViews.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-success" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  AI Conversations
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {isFilteringData ? "..." : totalConversations}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Contacts Captured
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {isFilteringData ? "..." : totalLeads}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-warning" />
              </div>
            </div>
          </Card>
        </div>

        {/* Traffic Overview & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2 hover:shadow-lg transition-all duration-200 border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Traffic Overview
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                  <span className="text-sm text-muted-foreground">
                    Views: {totalViews} this week
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-success rounded-full mr-2"></div>
                  <span className="text-sm text-muted-foreground">
                    Chats: {totalConversations} this week
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-info rounded-full mr-2"></div>
                  <span className="text-sm text-muted-foreground">
                    Contacts: {totalLeads} this week
                  </span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.last30Days}>
                <defs>
                  <linearGradient
                    id="viewsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="rgb(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="rgb(var(--primary))"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                  <linearGradient
                    id="conversationsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="rgb(var(--success))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="rgb(var(--success))"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                  <linearGradient
                    id="contactsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="rgb(var(--info))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="rgb(var(--info))"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(var(--border))"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  stroke="rgb(var(--muted-foreground))"
                />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                  contentStyle={{
                    backgroundColor: "rgb(var(--card))",
                    border: "1px solid rgb(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stackId="1"
                  stroke="rgb(var(--primary))"
                  strokeWidth={2}
                  fill="url(#viewsGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="conversations"
                  stackId="1"
                  stroke="rgb(var(--success))"
                  strokeWidth={2}
                  fill="url(#conversationsGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stackId="1"
                  stroke="rgb(var(--info))"
                  strokeWidth={2}
                  fill="url(#contactsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-200 border-border">
            <h3 className="text-lg font-semibold mb-6 text-foreground">
              Key Performance
            </h3>

            {/* Top Metric - Conversion Rate */}
            <div className="mb-6">
              <div className="text-3xl font-bold text-foreground mb-2">
                {conversionRate}% conversion rate
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <div
                  className="h-2 bg-primary rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      parseFloat(conversionRate.toString()) * 8,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="text-sm text-muted-foreground">
                1 in {Math.round(100 / parseFloat(conversionRate.toString()))}{" "}
                visitors become contacts
              </div>
            </div>

            {/* Quick Stats */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-lg">📊</span>
                <span className="text-sm font-medium text-muted-foreground">
                  Quick Stats
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm font-medium text-foreground">
                    {engagementRate}% engaged
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm font-medium text-foreground">
                    23.5% came back
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm font-medium text-foreground">
                    2m 34s avg time
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Traffic Sources & Geographic Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Traffic Sources Widget */}
          <div
            className="bg-surface border border-border/50 rounded-2xl p-7 transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-1"
            style={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              backgroundImage:
                "linear-gradient(135deg, rgba(242,101,34,0.01) 0%, rgba(242,101,34,0.005) 100%)",
            }}
          >
            <h3
              className="text-lg font-bold text-foreground mb-6"
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#1D1D1F",
                lineHeight: "1.2",
              }}
            >
              Traffic Sources
            </h3>

            <div className="flex items-center">
              {/* Enhanced Donut Chart */}
              <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height={220}>
                  <RechartsPieChart>
                    <defs>
                      {data.sourceData.map((_, index) => (
                        <filter key={`glow-${index}`} id={`glow-${index}`}>
                          <feGaussianBlur
                            stdDeviation="3"
                            result="coloredBlur"
                          />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      ))}
                    </defs>
                    <Pie
                      data={data.sourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      onMouseEnter={(_, index) => setHoveredSourceIndex(index)}
                      onMouseLeave={() => setHoveredSourceIndex(null)}
                    >
                      {data.sourceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="#FFFFFF"
                          strokeWidth={3}
                          filter={
                            hoveredSourceIndex === index
                              ? `url(#glow-${index})`
                              : undefined
                          }
                          style={{
                            transform:
                              hoveredSourceIndex === index
                                ? "scale(1.05)"
                                : "scale(1)",
                            transformOrigin: "center",
                            transition: "all 200ms ease-out",
                            opacity:
                              hoveredSourceIndex !== null &&
                              hoveredSourceIndex !== index
                                ? 0.7
                                : 1,
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          return (
                            <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-lg">
                              <p className="text-sm font-medium text-foreground">
                                {payload[0].name}: {payload[0].value}%
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {Math.floor(payload[0].value * 10)} visits
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>

                {/* Center Total Visits */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div
                    className="text-3xl font-bold text-foreground"
                    style={{
                      fontSize: "28px",
                      fontWeight: "700",
                      color: "#1D1D1F",
                      lineHeight: "1",
                    }}
                  >
                    {totalVisits.toLocaleString()}
                  </div>
                  <div
                    className="text-sm font-medium text-muted-foreground mt-1"
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#6B7280",
                    }}
                  >
                    Total Visits
                  </div>
                </div>
              </div>

              {/* Enhanced Legend */}
              <div className="ml-6 space-y-3 flex-shrink-0">
                {data.sourceData.map((source, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between cursor-pointer transition-all duration-200 ease-out hover:bg-surface-hover rounded-lg p-2 -m-2"
                    onMouseEnter={() => setHoveredSourceIndex(index)}
                    onMouseLeave={() => setHoveredSourceIndex(null)}
                    style={{
                      transform:
                        hoveredSourceIndex === index
                          ? "translateX(2px)"
                          : "translateX(0)",
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full transition-all duration-200 ease-out"
                        style={{
                          backgroundColor: source.color,
                          transform:
                            hoveredSourceIndex === index
                              ? "scale(1.2)"
                              : "scale(1)",
                          boxShadow:
                            hoveredSourceIndex === index
                              ? `0 0 8px ${source.color}40`
                              : "none",
                        }}
                      />
                      <span
                        className="font-medium text-foreground transition-colors duration-200"
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color:
                            hoveredSourceIndex === index
                              ? source.color
                              : "#374151",
                        }}
                      >
                        {source.name}
                      </span>
                    </div>
                    <div className="text-right ml-4">
                      <div
                        className="font-bold text-foreground transition-colors duration-200"
                        style={{
                          fontSize: "15px",
                          fontWeight: "700",
                          color:
                            hoveredSourceIndex === index
                              ? source.color
                              : "#1D1D1F",
                        }}
                      >
                        {source.value}%
                      </div>
                      <div
                        className="text-xs text-muted-foreground"
                        style={{
                          fontSize: "12px",
                          fontWeight: "400",
                          color: "#6B7280",
                        }}
                      >
                        {Math.floor(source.value * 10)} visits
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Geographic Distribution Widget */}
          <div
            className="bg-surface border border-border/50 rounded-2xl p-7 transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-1"
            style={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              backgroundImage:
                "linear-gradient(135deg, rgba(242,101,34,0.01) 0%, rgba(242,101,34,0.005) 100%)",
            }}
          >
            <h3
              className="text-lg font-bold text-foreground mb-6"
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#1D1D1F",
                lineHeight: "1.2",
              }}
            >
              Geographic Distribution
            </h3>

            <div className="space-y-2">
              {data.geographicData.map((location, index) => (
                <div
                  key={index}
                  className="group flex items-center justify-between p-4 rounded-xl transition-all duration-200 ease-out hover:bg-surface-hover hover:-translate-y-0.5 hover:shadow-sm"
                  style={{
                    height: "56px",
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="flex items-center space-x-4">
                    {/* Country Code Badge */}
                    <div
                      className="w-8 h-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded flex items-center justify-center transition-transform duration-200 group-hover:scale-110 border border-primary/20"
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {location.country === "Others" ? (
                        <Globe className="w-3 h-3 text-primary" />
                      ) : (
                        <span className="text-primary">
                          {getCountryCode(location.country)}
                        </span>
                      )}
                    </div>

                    {/* Country Name */}
                    <span
                      className="font-semibold text-foreground transition-colors duration-200 group-hover:text-primary"
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      {location.country}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Visit Count and Percentage */}
                    <div className="text-right">
                      <div
                        className="font-bold text-foreground"
                        style={{
                          fontSize: "18px",
                          fontWeight: "700",
                          color: "#1D1D1F",
                        }}
                      >
                        {location.visitors}
                      </div>
                      <div
                        className="text-sm text-muted-foreground"
                        style={{
                          fontSize: "14px",
                          fontWeight: "400",
                          color: "#6B7280",
                        }}
                      >
                        {location.percentage}%
                      </div>
                    </div>

                    {/* Enhanced Progress Bar */}
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${location.percentage}%`,
                          background:
                            "linear-gradient(90deg, #F26522 0%, #FF8A3D 100%)",
                          animationDelay: `${index * 100}ms`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Engagement & AI Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-all duration-200 border-border">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              AI Performance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Response Accuracy
                </span>
                <span className="font-bold text-success">94%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Avg Response Time
                </span>
                <span className="font-bold text-foreground">1.2s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Conversations
                </span>
                <span className="font-bold text-primary">
                  {totalConversations}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Avg Confidence
                </span>
                <span className="font-bold text-success">91%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2 hover:shadow-lg transition-all duration-200 border-border">
            <h3 className="text-lg font-semibold mb-6 text-foreground">
              Most Asked Questions
            </h3>
            <div className="space-y-3">
              {[
                {
                  question: "What services do you offer?",
                  count: 45,
                  confidence: 95,
                },
                {
                  question: "How can I contact you?",
                  count: 38,
                  confidence: 98,
                },
                { question: "What are your rates?", count: 32, confidence: 87 },
                {
                  question: "Do you work remotely?",
                  count: 28,
                  confidence: 92,
                },
                {
                  question: "What's your availability?",
                  count: 24,
                  confidence: 89,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">
                      {item.question}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-muted-foreground">
                        Asked {item.count} times
                      </span>
                      <Badge
                        variant={item.confidence > 90 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {item.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
