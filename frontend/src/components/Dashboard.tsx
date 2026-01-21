import {
  Building,
  Clock,
  Copy,
  Edit3,
  Eye,
  Filter,
  Grid,
  List,
  MessageCircle,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Share2,
  Sparkles,
  Star,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

import { cardApi, type CardData } from "../api/cardApi";
import { NewCardModal } from "./NewCardModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface User {
  id: string;
  email: string;
  name: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: string;
  cards_count: number;
  contacts_count: number;
}

interface Card {
  id: string;
  user_id: string;
  name: string;
  type: string;
  status: "draft" | "active" | "paused";
  profile: {
    full_name: string;
    job_title: string;
    company: string;
    bio: string;
    profile_photo_url: string;
    cover_image_url: string;
  };
  analytics: {
    views: number;
    unique_views: number;
    conversations: number;
    leads: number;
    conversion_rate?: number;
    monthly_views?: number;
    weekly_change?: number;
    link_clicks?: number;
  };
  ai_config: {
    enabled: boolean;
    training_status: string;
    confidence_threshold: number;
    personality: string;
  };
  created_at: string;
  updated_at: string;
  shared_count?: number;
  qr_scans?: number;
}

interface DashboardProps {
  user: User;
  userProfile: UserProfile | null;
  onNavigateToWorkspace: (
    card?: any,
    template?: any,
    module?: "build" | "train" | "improve"
  ) => void;
  onNavigate?: (page: any) => void;
  navigationContext?: {
    type: "personal" | "company" | "event";
    id?: string;
    name?: string;
  };
}

export function Dashboard({
  user,
  onNavigateToWorkspace,
  navigationContext,
}: DashboardProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("last_modified");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showNewCardModal, setShowNewCardModal] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const response = await cardApi.getAll();

        // Transform backend cards to frontend format
        const transformedCards = response.cards.map(
          cardApi.transformToFrontend
        );
        setCards(transformedCards);
      } catch (error) {
        console.error("Failed to fetch cards:", error);
        // Fallback to demo cards if API fails
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  const createNewCard = async (cardData: {
    name: string;
    description: string;
    type: string;
  }) => {
    try {
      // Create card via API
      const newCardData: Partial<CardData> = {
        card_creation_type: cardData?.type,
        card_name: cardData.name,
        first_name:
          user?.user?.name?.split(" ")[0] ||
          user?.name?.split(" ")[0] ||
          "User",
        last_name:
          user?.user?.name?.split(" ").slice(1).join(" ") ||
          user?.name?.split(" ").slice(1).join(" ") ||
          "",
        description: cardData?.description,
        email: user?.user?.email || user?.email,
        status: "draft",
        card_type: cardData.type as "business" | "personal" | "networking",
      };

      const response = await cardApi.create(newCardData);
      const transformedCard = cardApi.transformToFrontend(response.card);

      setCards([transformedCard, ...cards]);
      onNavigateToWorkspace(transformedCard, undefined, "build");
    } catch (error) {
      console.error("Failed to create card:", error);
      // Fallback to local creation if API fails
      const newCard = {};

      setCards([newCard, ...cards]);
      onNavigateToWorkspace(newCard, undefined, "build");
    }
  };

  const deleteCard = async (cardId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this card? This action cannot be undone."
      )
    )
      return;

    try {
      await cardApi.delete(cardId);
      setCards(cards.filter((c) => c.id !== cardId));
    } catch (error) {
      console.error("Failed to delete card:", error);
      // Still remove from UI if API fails
      setCards(cards.filter((c) => c.id !== cardId));
    }
  };

  const toggleCardStatus = async (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const newStatus = card.status === "active" ? "paused" : "active";

    try {
      await cardApi.update(cardId, { status: newStatus });
      setCards(
        cards.map((c) => (c.id === cardId ? { ...c, status: newStatus } : c))
      );
    } catch (error) {
      console.error("Failed to update card status:", error);
      // Still update UI if API fails
      setCards(
        cards.map((c) => (c.id === cardId ? { ...c, status: newStatus } : c))
      );
    }
  };

  const copyShareLink = (cardId: string) => {
    const shareUrl = `${window.location.origin}?card=${cardId}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Share link copied to clipboard!");
  };

  const duplicateCard = async (cardId: string) => {
    const originalCard = cards.find((c) => c.id === cardId);
    if (originalCard) {
      await createNewCard({
        name: `${originalCard.name} (Copy)`,
        description: originalCard.profile.bio,
        type: originalCard.type,
      });
    }
  };

  const filteredAndSortedCards = cards
    .filter((card) => {
      const matchesSearch =
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card?.profile?.full_name
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase()) ||
        card?.profile?.company
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || card.status === filterStatus;
      const matchesType = filterType === "all" || card.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "views":
          return b.analytics.views - a.analytics.views;
        case "leads":
          return b.analytics.leads - a.analytics.leads;
        case "conversion":
          return (
            (b.analytics.conversion_rate || 0) -
            (a.analytics.conversion_rate || 0)
          );
        case "created":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        default:
          return (
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
      }
    });

  const getTotalStats = () => {
    return cards.reduce(
      (acc, card) => ({
        totalViews: acc.totalViews + card.analytics.views,
        totalUniqueViews:
          acc.totalUniqueViews + (card.analytics.unique_views || 0),
        totalConversations:
          acc.totalConversations + card.analytics.conversations,
        totalLeads: acc.totalLeads + card.analytics.leads,
        totalLinkClicks:
          acc.totalLinkClicks + (card.analytics.link_clicks || 0),
      }),
      {
        totalViews: 0,
        totalUniqueViews: 0,
        totalConversations: 0,
        totalLeads: 0,
        totalLinkClicks: 0,
      }
    );
  };

  const stats = getTotalStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success border-success/20";
      case "draft":
        return "bg-text-tertiary/10 text-text-secondary border-text-tertiary/20";
      case "paused":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-text-tertiary/10 text-text-secondary border-text-tertiary/20";
    }
  };

  const getCardAccentColor = (type: string, status: string) => {
    if (status === "active") return "border-t-primary";
    if (type === "business") return "border-t-blue-600";
    if (type === "personal") return "border-t-green-600";
    if (type === "networking") return "border-t-purple-600";
    return "border-t-border";
  };

  const getCardPreviewStyle = (type: string, status: string) => {
    const baseStyle =
      "border-b border-border relative overflow-hidden group/preview";

    if (status === "draft") {
      return `${baseStyle} bg-gradient-to-br from-text-tertiary via-text-secondary to-text-primary`;
    }

    switch (type) {
      case "business":
        return `${baseStyle} bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700`;
      case "personal":
        return `${baseStyle} bg-gradient-to-br from-green-500 via-green-600 to-green-700`;
      case "networking":
        return `${baseStyle} bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700`;
      default:
        return `${baseStyle} bg-gradient-to-br from-primary via-primary-hover to-primary-active`;
    }
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case "business":
        return <Building className="h-4 w-4 text-white/80" />;
      case "personal":
        return <Star className="h-4 w-4 text-white/80" />;
      case "networking":
        return <Users className="h-4 w-4 text-white/80" />;
      default:
        return <Building className="h-4 w-4 text-white/80" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Enhanced Leo Design System styling */}
      <div className="bg-surface border-b border-border px-8 py-6 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Page Title with Leo emoji and enhanced typography */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">🦁</div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                {navigationContext?.type === "event"
                  ? `${navigationContext.name} Cards`
                  : "My Cards"}
              </h1>
            </div>
            <p className="text-text-secondary text-sm">
              {navigationContext?.type === "event"
                ? "Create and manage your event-specific digital business cards"
                : "Create and manage your AI-powered digital business cards"}
            </p>
          </div>

          {/* Right Actions - Enhanced Leo styling with streamlined New Card */}
          <div className="flex items-center space-x-3">
            {/* New Card Button - Opens modal for card details */}
            <Button
              onClick={() => setShowNewCardModal(true)}
              className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-md hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 rounded-lg px-6 py-2 text-sm font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              {navigationContext?.type === "event"
                ? "New Event Card"
                : "New Card"}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Compact Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Cards */}
          <Card className="metric-card-compact card-stagger group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Grid className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="metric-number-compact animate-count-up">
                  {cards.length}
                </div>
                <div className="metric-label-compact">Total Cards</div>
              </div>
            </div>
            <div className="w-full h-1 bg-muted rounded-full mt-3 group-hover:bg-blue-200 transition-colors duration-200">
              <div className="w-full h-1 bg-blue-500 rounded-full"></div>
            </div>
          </Card>

          {/* Total Views */}
          <Card className="metric-card-compact card-stagger group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="metric-number-compact animate-count-up">
                  {stats.totalViews.toLocaleString()}
                </div>
                <div className="metric-label-compact">Total Views</div>
              </div>
            </div>
            <div className="w-full h-1 bg-muted rounded-full mt-3 group-hover:bg-green-200 transition-colors duration-200">
              <div className="w-full h-1 bg-green-500 rounded-full"></div>
            </div>
          </Card>

          {/* Conversations */}
          <Card className="metric-card-compact card-stagger group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="metric-number-compact animate-count-up">
                  {stats.totalConversations}
                </div>
                <div className="metric-label-compact">AI Conversations</div>
              </div>
            </div>
            <div className="w-full h-1 bg-muted rounded-full mt-3 group-hover:bg-purple-200 transition-colors duration-200">
              <div className="w-full h-1 bg-purple-500 rounded-full"></div>
            </div>
          </Card>

          {/* Leads Generated */}
          <Card className="metric-card-compact card-stagger group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="metric-number-compact animate-count-up">
                  {stats.totalLeads}
                </div>
                <div className="metric-label-compact">Contacts Captured</div>
              </div>
            </div>
            <div className="w-full h-1 bg-muted rounded-full mt-3 group-hover:bg-primary/20 transition-colors duration-200">
              <div className="w-full h-1 bg-primary rounded-full"></div>
            </div>
          </Card>
        </div>

        {/* Enhanced Search, Filters, and View Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <Input
                placeholder="Search cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-surface border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-lg text-sm"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`${
                showFilters
                  ? "bg-primary/10 text-primary border-primary/20"
                  : ""
              } rounded-lg`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            {showFilters && (
              <div className="flex items-center space-x-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="paused">Paused</option>
                </select>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                >
                  <option value="all">All Types</option>
                  <option value="business">Business</option>
                  <option value="personal">Personal</option>
                  <option value="networking">Networking</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                >
                  <option value="last_modified">Last Modified</option>
                  <option value="name">Name A-Z</option>
                  <option value="views">Most Views</option>
                  <option value="leads">Most Leads</option>
                  <option value="conversion">Best Conversion</option>
                  <option value="created">Date Created</option>
                </select>
              </div>
            )}
          </div>

          {/* Enhanced View Toggle */}
          <div className="flex items-center space-x-2">
            <div className="bg-muted rounded-lg p-1 flex">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`h-8 px-3 ${
                  viewMode === "grid"
                    ? "bg-surface shadow-sm"
                    : "hover:bg-surface/50"
                } rounded-md`}
              >
                <Grid className="h-4 w-4 mr-1" />
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={`h-8 px-3 ${
                  viewMode === "list"
                    ? "bg-surface shadow-sm"
                    : "hover:bg-surface/50"
                } rounded-md`}
              >
                <List className="h-4 w-4 mr-1" />
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Cards Display with Leo Design System principles */}
        {viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCards.map((card) => (
              <Card
                key={card.id}
                className={`bg-surface border border-subtle shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden ${getCardAccentColor(
                  card.type,
                  card.status
                )} border-t-4 group cursor-pointer`}
                style={{
                  borderRadius: "16px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                }}
                onClick={() =>
                  onNavigateToWorkspace(card, "workspace", "build")
                }
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10"></div>

                {/* Enhanced Card Preview Area */}
                <div
                  className={`h-40 ${getCardPreviewStyle(
                    card.type,
                    card.status
                  )}`}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white/30 rounded-full"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border border-white/20 rounded"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/10 rounded-full"></div>
                  </div>

                  {/* Business Card Layout */}
                  <div className="relative h-full p-4 flex flex-col justify-between text-xs">
                    {/* Top Section - Logo/Icon Area */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          {getCardIcon(card.type)}
                        </div>
                        <div className="text-white/80 font-medium text-xs">
                          {card.profile.company}
                        </div>
                      </div>

                      {card.ai_config.enabled && (
                        <div className="flex items-center space-x-1">
                          <Sparkles className="h-3 w-3 text-white/60" />
                          <span className="text-white/60 text-xs">AI</span>
                        </div>
                      )}
                    </div>

                    {/* Middle Section - Name and Title */}
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="text-white font-semibold text-sm mb-1 truncate">
                        {card.profile.full_name}
                      </div>
                      <div className="text-white/80 text-xs truncate">
                        {card.profile.job_title}
                      </div>
                    </div>

                    {/* Bottom Section - Contact Info */}
                    <div className="space-y-1">
                      <div className="text-white/60 text-xs">🦁 Leo Card</div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Card Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-text-primary truncate">
                      {card.name}
                    </h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="p-1 hover:bg-muted rounded-md transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4 text-text-secondary" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToWorkspace(card, "workspace", "build");
                          }}
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Card
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            copyShareLink(card.id);
                          }}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateCard(card.id);
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCardStatus(card.id);
                          }}
                        >
                          {card.status === "active" ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCard(card.id);
                          }}
                          className="text-error hover:text-error-foreground hover:bg-error"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Enhanced Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-text-primary">
                        {card.analytics.views}
                      </div>
                      <div className="text-xs text-text-secondary">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-text-primary">
                        {card.analytics.leads}
                      </div>
                      <div className="text-xs text-text-secondary">Leads</div>
                    </div>
                  </div>

                  {/* Enhanced Performance Bar with Animation */}
                  <div className="w-full bg-muted rounded-full h-2 mb-3 overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-primary to-primary-hover rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.min(
                          (card.analytics.conversion_rate || 0) * 10,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>

                  {/* Enhanced Footer */}
                  <div className="flex items-center justify-between text-xs text-text-tertiary">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {getTimeAgo(card.updated_at)}
                    </span>
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {card.analytics.conversations}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {card.shared_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredAndSortedCards.map((card) => (
              <Card
                key={card.id}
                className="p-4 bg-surface border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer rounded-2xl"
                onClick={() => onNavigateToWorkspace(card, undefined, "build")}
              >
                <div className="flex items-center space-x-4">
                  {/* Card Preview Thumbnail */}
                  <div
                    className={`w-16 h-10 rounded-lg ${getCardPreviewStyle(
                      card.type,
                      card.status
                    )} flex-shrink-0`}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      {getCardIcon(card.type)}
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-text-primary truncate">
                        {card.name}
                      </h3>
                      <Badge
                        className={`${getStatusColor(
                          card.status
                        )} text-xs px-2 py-1 font-medium rounded-lg border`}
                      >
                        {card.status}
                      </Badge>
                      {card.ai_config.enabled && (
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary truncate">
                      {card.profile.full_name} • {card.profile.job_title} •{" "}
                      {card.profile.company}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-6 text-sm text-text-secondary">
                    <div className="text-center">
                      <div className="font-semibold text-text-primary">
                        {card.analytics.views}
                      </div>
                      <div className="text-xs">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-text-primary">
                        {card.analytics.conversations}
                      </div>
                      <div className="text-xs">Chats</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-text-primary">
                        {card.analytics.leads}
                      </div>
                      <div className="text-xs">Leads</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToWorkspace(card, undefined, "build");
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="p-2 hover:bg-muted rounded-md transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4 text-text-secondary" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            copyShareLink(card.id);
                          }}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateCard(card.id);
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCardStatus(card.id);
                          }}
                        >
                          {card.status === "active" ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCard(card.id);
                          }}
                          className="text-error hover:text-error-foreground hover:bg-error"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredAndSortedCards.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {searchTerm || filterStatus !== "all" || filterType !== "all"
                ? "No cards match your filters"
                : "Create your first Leo card"}
            </h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              {searchTerm || filterStatus !== "all" || filterType !== "all"
                ? "Try adjusting your search terms or filters to find what you're looking for."
                : "Get started by creating your first AI-powered digital business card that works 24/7 to grow your network."}
            </p>
            <div className="flex items-center justify-center space-x-3">
              <Button
                onClick={() => setShowNewCardModal(true)}
                className="bg-primary hover:bg-primary-hover text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Card
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* New Card Modal */}
      <NewCardModal
        isOpen={showNewCardModal}
        onClose={() => setShowNewCardModal(false)}
        onCreate={createNewCard}
      />
    </div>
  );
}
