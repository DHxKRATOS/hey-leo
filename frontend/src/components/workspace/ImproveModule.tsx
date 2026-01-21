import { ArrowRight, MessageSquare, Plus, Search, User } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner@2.0.3";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { fetchCardById } from "../../store/cardSlice";

interface ImproveModuleProps {
  userId?: string;
  className?: string;
}

interface Conversation {
  id: string;
  timestamp: Date;
  question: string;
  answer: string;
  confidence: number;
  rating?: "good" | "needs-work";
  userAgent?: string;
  source?: string;
  responseTime?: number;
  // New user attribution fields
  user?: {
    name: string;
    email?: string;
    isAnonymous?: boolean;
  };
}

interface ConversationFilter {
  confidenceRange: [number, number];
  dateRange: string;
  quality: string;
  searchQuery: string;
  hasUnanswered: boolean;
}

export function ImproveModule({ userId, className = "" }: ImproveModuleProps) {
  const { currentCard } = useAppSelector((state) => state.cards);
  const dispatch = useAppDispatch();
  // Conversation data

  const [conversations, setConversations] = useState<Conversation[]>([
    // {
    //   id: "1",
    //   timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    //   question: "Do you offer payment plans for your consulting services?",
    //   answer:
    //     "Yes, we offer flexible payment plans for our consulting services. We can work with you to create a payment schedule that fits your budget, including monthly installments or milestone-based payments.",
    //   confidence: 0.85,
    //   rating: undefined,
    //   source: "QR Code",
    //   responseTime: 1.2,
    //   user: {
    //     name: "John Doe",
    //     email: "john@example.com",
    //   },
    // },
    // {
    //   id: "2",
    //   timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    //   question: "What is your experience with e-commerce projects?",
    //   answer:
    //     "I have extensive experience with e-commerce projects, having worked on over 50 online stores using platforms like Shopify, WooCommerce, and custom solutions. I specialize in conversion optimization and user experience design.",
    //   confidence: 0.92,
    //   rating: "good",
    //   source: "Direct Link",
    //   responseTime: 0.8,
    //   user: {
    //     name: "Sarah Chen",
    //     email: "sarah.chen@company.com",
    //   },
    // },
    // {
    //   id: "3",
    //   timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    //   question: "Can you help with mobile app development?",
    //   answer:
    //     "While my primary expertise is in web development, I can certainly help with mobile app strategy and connect you with trusted mobile developers in my network.",
    //   confidence: 0.65,
    //   rating: "needs-work",
    //   source: "Social Media",
    //   responseTime: 2.1,
    //   user: {
    //     name: "Anonymous",
    //     isAnonymous: true,
    //   },
    // },
    // {
    //   id: "4",
    //   timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    //   question: "What are your rates for web design projects?",
    //   answer:
    //     "My web design project rates vary depending on scope and complexity. For a basic business website, rates start at $2,500. For more complex e-commerce or custom applications, rates typically range from $5,000-$15,000. I always provide detailed quotes after understanding your specific needs.",
    //   confidence: 0.78,
    //   rating: undefined,
    //   source: "Email",
    //   responseTime: 1.5,
    //   user: {
    //     name: "Michael Rodriguez",
    //     email: "mrodriguez@startup.com",
    //   },
    // },
    // {
    //   id: "5",
    //   timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    //   question: "Do you work with startups?",
    //   answer:
    //     "Yes, I love working with startups! I understand the unique challenges and budget constraints that startups face. I offer flexible pricing options and can often work on equity arrangements for early-stage companies with promising potential.",
    //   confidence: 0.89,
    //   rating: "good",
    //   source: "QR Code",
    //   responseTime: 1.0,
    //   user: {
    //     name: "Anonymous",
    //     isAnonymous: true,
    //   },
    // },
  ]);

  // State
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isImproveModalOpen, setIsImproveModalOpen] = useState(false);
  const [improveForm, setImproveForm] = useState({
    originalQuestion: "",
    originalAnswer: "",
    improvedAnswer: "",
  });

  // Filters
  const [filters, setFilters] = useState<ConversationFilter>({
    confidenceRange: [0, 100],
    dateRange: "all",
    quality: "all",
    searchQuery: "",
    hasUnanswered: false,
  });

  React.useEffect(() => {
    if (currentCard?.id) {
      dispatch(fetchCardById(currentCard.id));
    }
  }, [currentCard?.id]);

  React.useEffect(() => {
    if (currentCard) {
      setConversations(currentCard?.training_qa_pairs);
    }
  }, [currentCard?.training_qa_pairs]);

  // Analytics data
  const weeklyStats = {
    totalConversations: 47,
    averageConfidence: 0.82,
    responseAccuracy: 0.94,
    qasAdded: 12,
  };

  // Filter conversations
  const filteredConversations = conversations;
  // .filter((conv) => {
  //   const confidencePercent = conv.confidence * 100;
  //   const matchesConfidence =
  //     confidencePercent >= filters.confidenceRange[0] &&
  //     confidencePercent <= filters.confidenceRange[1];

  //   const matchesQuality =
  //     filters.quality === "all" ||
  //     (filters.quality === "good" && conv.rating === "good") ||
  //     (filters.quality === "needs-work" && conv.rating === "needs-work") ||
  //     (filters.quality === "unrated" && !conv.rating);

  //   const matchesSearch =
  //     !filters.searchQuery ||
  //     conv.question.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
  //     conv.answer.toLowerCase().includes(filters.searchQuery.toLowerCase());

  //   return matchesConfidence && matchesQuality && matchesSearch;
  // });

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-success bg-success/10";
    if (confidence >= 0.7) return "text-warning bg-warning/10";
    return "text-error bg-error/10";
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  const handleRateResponse = (
    conversationId: string,
    rating: "good" | "needs-work"
  ) => {
    // In a real app, this would update the conversation rating
    toast.success(
      `Response marked as ${rating === "good" ? "good" : "needs work"}`
    );
  };

  const openDetailModal = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsDetailModalOpen(true);
  };

  const openImproveModal = (conversation: Conversation) => {
    setImproveForm({
      originalQuestion: conversation.question,
      originalAnswer: conversation.answer,
      improvedAnswer: conversation.answer,
    });
    setIsImproveModalOpen(true);
  };

  const saveImprovedAnswer = () => {
    if (!improveForm.improvedAnswer.trim()) {
      toast.error("Please provide an improved answer");
      return;
    }

    // In a real app, this would save to the training data
    toast.success("Added to Q&A training!");
    setIsImproveModalOpen(false);
    setImproveForm({
      originalQuestion: "",
      originalAnswer: "",
      improvedAnswer: "",
    });
  };

  // User avatar generation functions
  const getInitials = (name: string): string => {
    if (!name || name === "Anonymous") return "?";

    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string): string => {
    if (!name || name === "Anonymous") return "#E5E5E5";

    // Predefined professional color palette
    const colors = [
      "#F26522", // Leo Orange
      "#4CAF50", // Green
      "#2196F3", // Blue
      "#9C27B0", // Purple
      "#FF5722", // Deep Orange
      "#607D8B", // Blue Grey
      "#795548", // Brown
      "#E91E63", // Pink
      "#009688", // Teal
      "#FF9800", // Amber
    ];

    // Simple hash function for consistent color assignment
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const UserAvatar = ({
    user,
    className = "",
  }: {
    user?: Conversation["user"];
    className?: string;
  }) => {
    if (!user || user.isAnonymous) {
      // Anonymous user avatar
      return (
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${className}`}
          style={{ backgroundColor: "#E5E5E5" }}
          title="Asked anonymously"
          role="img"
          aria-label="Anonymous user"
        >
          <User className="w-4 h-4" style={{ color: "#999999" }} />
        </div>
      );
    }

    // Identified user avatar
    const initials = getInitials(user.name);
    const bgColor = getAvatarColor(user.name);

    return (
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${className}`}
        style={{
          backgroundColor: bgColor,
          fontSize: "14px",
          fontWeight: "600",
        }}
        title={`Asked by ${user.name}`}
        role="img"
        aria-label={`Asked by ${user.name}`}
      >
        {initials}
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col bg-background relative ${className}`}>
      {/* Leo Platform Branding - Workspace Module */}
      <div className="fixed bottom-4 left-4 z-30 pointer-events-none">
        <div className="bg-surface/80 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 shadow-sm">
          <p className="text-xs text-text-tertiary font-medium flex items-center gap-1.5">
            <span className="text-primary">🦁</span>
            Improve • <span className="text-primary font-semibold">leo</span>
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="shrink-0 px-8 py-6 border-b border-border bg-surface">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">
              Visitor Conversations
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Learn from real interactions
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <Select
              value={filters.dateRange}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, dateRange: value }))
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <Input
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    searchQuery: e.target.value,
                  }))
                }
                placeholder="Search conversations..."
                className="pl-9 w-64"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar Filters */}
        <div className="w-80 border-r border-border bg-surface p-6 space-y-6">
          {/* Analytics Summary */}
          <div>
            <h3 className="font-medium text-text-primary mb-4">This Week</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-text-primary">
                    {weeklyStats.totalConversations}
                  </div>
                  <div className="text-xs text-text-secondary">
                    Conversations
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-text-primary">
                    {Math.round(weeklyStats.averageConfidence * 100)}%
                  </div>
                  <div className="text-xs text-text-secondary">
                    Avg Confidence
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-text-primary">
                    {Math.round(weeklyStats.responseAccuracy * 100)}%
                  </div>
                  <div className="text-xs text-text-secondary">
                    Response Accuracy
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-text-primary">
                    {weeklyStats.qasAdded}
                  </div>
                  <div className="text-xs text-text-secondary">Q&As Added</div>
                </div>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Filter Controls */}
          {/* <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Confidence Level</Label>
              <Slider
                value={filters.confidenceRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, confidenceRange: value as [number, number] }))}
                min={0}
                max={100}
                step={5}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-text-tertiary">
                <span>{filters.confidenceRange[0]}%</span>
                <span>{filters.confidenceRange[1]}%</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Response Quality</Label>
              <Select 
                value={filters.quality} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, quality: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All responses</SelectItem>
                  <SelectItem value="good">Good responses</SelectItem>
                  <SelectItem value="needs-work">Needs improvement</SelectItem>
                  <SelectItem value="unrated">Unrated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="unanswered"
                checked={filters.hasUnanswered}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasUnanswered: checked as boolean }))}
              />
              <Label htmlFor="unanswered" className="text-sm">
                Show unanswered only
              </Label>
            </div>
          </div> */}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <ScrollArea className="h-full">
            <div className="p-6">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-text-tertiary opacity-50" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    No Conversations Yet
                  </h3>
                  <p className="text-text-secondary">
                    Once visitors start chatting, you'll see their questions
                    here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredConversations.map((conversation) => (
                    <Card
                      key={conversation.id}
                      className="p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {/* User Attribution Header */}
                          <div className="flex items-center gap-2 mb-3">
                            <UserAvatar user={conversation.user} />
                            <span
                              className={`text-sm font-regular ${
                                conversation.user?.isAnonymous
                                  ? "text-gray-600"
                                  : "text-text-primary"
                              }`}
                              style={{
                                fontSize: "14px",
                                color: conversation.user?.isAnonymous
                                  ? "#666666"
                                  : "#222222",
                              }}
                            >
                              {conversation.user?.isAnonymous
                                ? "Anonymous"
                                : conversation.user?.name || "Anonymous"}
                            </span>
                            <span className="text-sm text-text-tertiary">
                              {/* {getTimeAgo(conversation.timestamp)} */}
                            </span>
                          </div>

                          {/* Confidence and Source Badges */}
                          {/* <div className="flex items-center gap-3 mb-3">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getConfidenceColor(
                                conversation.confidence
                              )}`}
                            >
                              Confidence:{" "}
                              {Math.round(conversation.confidence * 100)}%
                            </Badge>
                            {conversation.source && (
                              <Badge variant="outline" className="text-xs">
                                {conversation.source}
                              </Badge>
                            )}
                          </div> */}

                          <div className="space-y-3">
                            <div>
                              <p className="font-medium text-text-primary mb-1">
                                Q:
                              </p>
                              <p className="text-text-primary">
                                {conversation.question}
                              </p>
                            </div>

                            <div>
                              <p className="font-medium text-text-primary mb-1">
                                A:
                              </p>
                              <p className="text-text-secondary line-clamp-2">
                                {conversation.answer.length > 150
                                  ? `${conversation.answer.substring(
                                      0,
                                      150
                                    )}...`
                                  : conversation.answer}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailModal(conversation)}
                          className="ml-4"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-end mt-6 pt-4 border-t border-border">
                        <Button
                          variant="leo-primary"
                          size="sm"
                          onClick={() => openImproveModal(conversation)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add to Q&A
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Conversation Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Conversation Details</DialogTitle>
          </DialogHeader>

          {selectedConversation && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {/* <Badge
                  variant="secondary"
                  className={getConfidenceColor(
                    selectedConversation.confidence
                  )}
                >
                  Confidence:{" "}
                  {Math.round(selectedConversation.confidence * 100)}%
                </Badge> */}
                <span className="text-sm text-text-tertiary">
                  {/* {selectedConversation.timestamp.toLocaleString()} */}
                </span>
                {selectedConversation.responseTime && (
                  <span className="text-sm text-text-tertiary">
                    Response time: {selectedConversation.responseTime}s
                  </span>
                )}
              </div>

              <div className="grid gap-6">
                <div>
                  <h4 className="font-medium text-text-primary mb-2">
                    Question:
                  </h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-text-primary">
                      {selectedConversation.question}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-text-primary mb-2">
                    AI Response:
                  </h4>
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-text-primary">
                      {selectedConversation.answer}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="leo-primary"
                  onClick={() => openImproveModal(selectedConversation)}
                >
                  Improve This Answer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Improve Answer Modal */}
      <Dialog open={isImproveModalOpen} onOpenChange={setIsImproveModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Improve This Answer</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Original Question:</Label>
              <Input
                value={improveForm.originalQuestion}
                onChange={(e) =>
                  setImproveForm((prev) => ({
                    ...prev,
                    originalQuestion: e.target.value,
                  }))
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Original Answer:</Label>
              <Textarea
                value={improveForm.originalAnswer}
                onChange={(e) =>
                  setImproveForm((prev) => ({
                    ...prev,
                    originalAnswer: e.target.value,
                  }))
                }
                rows={4}
                className="mt-1 resize-none"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">
                Your Improved Answer:
              </Label>
              <Textarea
                value={improveForm.improvedAnswer}
                onChange={(e) =>
                  setImproveForm((prev) => ({
                    ...prev,
                    improvedAnswer: e.target.value,
                  }))
                }
                placeholder="Write a better response based on your expertise..."
                rows={6}
                className="mt-1 resize-none"
              />
            </div>

            <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
              <p className="text-sm text-info">
                This will be added to your Q&A training data to improve future
                responses.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="leo-primary"
                onClick={saveImprovedAnswer}
                className="flex-1"
              >
                Save to Training
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsImproveModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
