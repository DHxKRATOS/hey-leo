import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Share2,
  Heart,
  MessageCircle,
  UserPlus,
  Star,
  Bookmark,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  Download,
  Settings,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Target,
  Network,
  CalendarDays,
  Eye,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { EventAgendaTab } from "./EventAgendaTab";
import { EventNetworkingTab } from "./EventNetworkingTab";
import { EventContactsAttending } from "./EventContactsAttending";
import { useEvents } from "../../hooks/useEvents";
import { toast } from "sonner@2.0.3";

interface EventDetailPageProps {
  eventId: string;
  onBack: () => void;
  onNavigate: (page: string) => void;
  contacts?: any[];
}

export function EventDetailPage({
  eventId,
  onBack,
  onNavigate,
  contacts = [],
}: EventDetailPageProps) {
  const { events, loading } = useEvents();
  const [activeTab, setActiveTab] = useState("overview");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<
    "attending" | "maybe" | "not_attending" | "attended" | null
  >(null);
  const [showRSVPDialog, setShowRSVPDialog] = useState(false);

  // Find the current event
  const event = events.find((e) => e.id === eventId);

  useEffect(() => {
    if (event) {
      setRsvpStatus(event.rsvpStatus || null);
      setIsBookmarked(event.isBookmarked || false);
    }
  }, [event]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-32 animate-pulse" />
            <div className="h-3 bg-muted rounded w-24 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto" />
          <div>
            <h3 className="font-semibold">Event Not Found</h3>
            <p className="text-muted-foreground">
              The event you're looking for doesn't exist.
            </p>
          </div>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isMultiDay = startDate.toDateString() !== endDate.toDateString();
  const isPastEvent = endDate < new Date();
  const isOngoing = startDate <= new Date() && endDate >= new Date();

  const handleRSVP = (
    status: "attending" | "maybe" | "not_attending" | "attended"
  ) => {
    setRsvpStatus(status);
    setShowRSVPDialog(false);

    const statusMessages = {
      attending: "✅ You're attending! We'll send you event updates.",
      maybe: "🤔 Marked as maybe. We'll remind you closer to the date.",
      not_attending: "❌ RSVP updated. You can change this anytime.",
      attended: "🎉 Marked as attended. Thanks for joining!",
    };

    toast.success(statusMessages[status]);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(
      isBookmarked ? "Removed from bookmarks" : "Added to bookmarks! 🔖"
    );
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Event link copied to clipboard! 🔗");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const getStatusBadge = () => {
    if (isPastEvent) {
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-200"
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }

    if (isOngoing) {
      return (
        <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white animate-pulse">
          <Zap className="w-3 h-3 mr-1" />
          Live Now
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="bg-blue-50 text-blue-700 border-blue-200"
      >
        <Calendar className="w-3 h-3 mr-1" />
        Upcoming
      </Badge>
    );
  };

  const getRSVPBadge = () => {
    if (!rsvpStatus) return null;

    const badgeConfig = {
      attending: {
        color: "bg-green-50 text-green-700 border-green-200",
        label: "Attending",
      },
      maybe: {
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        label: "Maybe",
      },
      not_attending: {
        color: "bg-red-50 text-red-700 border-red-200",
        label: "Not Attending",
      },
      attended: {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        label: "Attended",
      },
    };

    const config = badgeConfig[rsvpStatus as keyof typeof badgeConfig];
    if (!config) return null;

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-gradient-to-br from-background via-muted/20 to-background">
        {/* Enhanced Header */}
        <div className="bg-surface/90 backdrop-blur-2xl border-b border-border/50 px-6 py-6 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="rounded-xl hover:bg-muted/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h1 className="font-semibold text-2xl">{event.name}</h1>
                  {getStatusBadge()}
                  {getRSVPBadge()}
                </div>
                <div className="flex items-center space-x-4 text-text-secondary">
                  <div className="flex items-center space-x-1">
                    <CalendarDays className="w-4 h-4" />
                    <span>
                      {isMultiDay
                        ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                        : startDate.toLocaleDateString()}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{event.attendeeCount || 0} attendees</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBookmark}
                    className={`rounded-xl ${
                      isBookmarked
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : ""
                    }`}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        isBookmarked ? "fill-current" : ""
                      }`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isBookmarked ? "Remove bookmark" : "Bookmark event"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="rounded-xl"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share event</TooltipContent>
              </Tooltip>

              {!isPastEvent && (
                <Dialog open={showRSVPDialog} onOpenChange={setShowRSVPDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary-hover shadow-lg hover:shadow-xl transition-all rounded-xl">
                      <UserPlus className="w-4 h-4 mr-2" />
                      {rsvpStatus ? "Update RSVP" : "RSVP"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>RSVP to {event.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <p className="text-text-secondary">
                        Will you be attending this event?
                      </p>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full justify-start h-auto p-4 hover:bg-green-50 hover:border-green-200"
                          onClick={() => handleRSVP("attending")}
                        >
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div className="text-left">
                              <div className="font-medium">
                                Yes, I'll be there
                              </div>
                              <div className="text-sm text-text-secondary">
                                Count me in!
                              </div>
                            </div>
                          </div>
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full justify-start h-auto p-4 hover:bg-yellow-50 hover:border-yellow-200"
                          onClick={() => handleRSVP("maybe")}
                        >
                          <div className="flex items-center space-x-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            <div className="text-left">
                              <div className="font-medium">Maybe</div>
                              <div className="text-sm text-text-secondary">
                                I'm not sure yet
                              </div>
                            </div>
                          </div>
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full justify-start h-auto p-4 hover:bg-red-50 hover:border-red-200"
                          onClick={() => handleRSVP("not_attending")}
                        >
                          <div className="flex items-center space-x-3">
                            <X className="w-5 h-5 text-red-600" />
                            <div className="text-left">
                              <div className="font-medium">Can't make it</div>
                              <div className="text-sm text-text-secondary">
                                Maybe next time
                              </div>
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-3 max-w-lg bg-muted/30 rounded-2xl p-1">
                <TabsTrigger
                  value="overview"
                  className="rounded-xl data-[state=active]:shadow-sm"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="agenda"
                  className="rounded-xl data-[state=active]:shadow-sm"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Agenda
                </TabsTrigger>
                <TabsTrigger
                  value="networking"
                  className="rounded-xl data-[state=active]:shadow-sm"
                >
                  <Network className="w-4 h-4 mr-2" />
                  Networking
                  {(event.pendingConnections || 0) > 0 && (
                    <Badge className="ml-2 bg-primary text-white scale-75">
                      {event.pendingConnections}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Event Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Event Hero Card */}
                    <Card className="p-6 rounded-2xl shadow-sm bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                      <div className="space-y-4">
                        {event.bannerImage && (
                          <div className="w-full h-48 rounded-xl overflow-hidden bg-muted">
                            <img
                              src={event.bannerImage}
                              alt={event.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div>
                          <h2 className="font-semibold text-xl mb-2">
                            {event.name}
                          </h2>
                          {event.description && (
                            <p className="text-text-secondary leading-relaxed">
                              {event.description}
                            </p>
                          )}
                        </div>

                        {/* Event Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <CalendarDays className="w-4 h-4 text-primary" />
                              <div>
                                <p className="font-medium">Date</p>
                                <p className="text-sm text-text-secondary">
                                  {isMultiDay
                                    ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                                    : startDate.toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-primary" />
                              <div>
                                <p className="font-medium">Time</p>
                                <p className="text-sm text-text-secondary">
                                  {startDate.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  {isMultiDay &&
                                    ` - ${endDate.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}`}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {event.location && (
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <div>
                                  <p className="font-medium">Location</p>
                                  <p className="text-sm text-text-secondary">
                                    {event.location}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-primary" />
                              <div>
                                <p className="font-medium">Attendees</p>
                                <p className="text-sm text-text-secondary">
                                  {event.attendeeCount || 0} registered
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Contacts Attending Section */}
                    <EventContactsAttending
                      event={event}
                      contacts={contacts}
                      onContactSelect={(contact) => {
                        // In a real app, this would navigate to contact detail
                      }}
                      onMessageContact={(contact) => {
                        // In a real app, this would open message composer
                      }}
                    />

                    {/* Event Stats */}
                    {(isPastEvent || isOngoing) && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-4 text-center bg-blue-50 border-blue-200">
                          <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                          <p className="font-semibold text-blue-900">
                            {event.views || 0}
                          </p>
                          <p className="text-blue-700 text-sm">Views</p>
                        </Card>

                        <Card className="p-4 text-center bg-green-50 border-green-200">
                          <UserPlus className="w-6 h-6 text-green-600 mx-auto mb-2" />
                          <p className="font-semibold text-green-900">
                            {event.connectionsMade || 0}
                          </p>
                          <p className="text-green-700 text-sm">Connections</p>
                        </Card>

                        <Card className="p-4 text-center bg-purple-50 border-purple-200">
                          <MessageCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                          <p className="font-semibold text-purple-900">
                            {event.messagesSent || 0}
                          </p>
                          <p className="text-purple-700 text-sm">Messages</p>
                        </Card>

                        <Card className="p-4 text-center bg-orange-50 border-orange-200">
                          <Star className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                          <p className="font-semibold text-orange-900">
                            {event.satisfactionRating
                              ? `${event.satisfactionRating}/5`
                              : "N/A"}
                          </p>
                          <p className="text-orange-700 text-sm">Rating</p>
                        </Card>
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Event Organizer */}
                    {event.organizer && (
                      <Card className="p-6 rounded-2xl shadow-sm">
                        <h3 className="font-semibold mb-4">Event Organizer</h3>
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={event.organizer.avatar} />
                            <AvatarFallback>
                              {event.organizer.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {event.organizer.name}
                            </p>
                            <p className="text-sm text-text-secondary">
                              {event.organizer.title}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {event.organizer.email && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Contact
                            </Button>
                          )}
                          {event.organizer.website && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                            >
                              <Globe className="w-4 h-4 mr-2" />
                              Website
                            </Button>
                          )}
                        </div>
                      </Card>
                    )}

                    {/* Quick Actions */}
                    <Card className="p-6 rounded-2xl shadow-sm">
                      <h3 className="font-semibold mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Add to Calendar
                        </Button>

                        {event.networkingEnabled && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setActiveTab("networking")}
                          >
                            <Network className="w-4 h-4 mr-2" />
                            Start Networking
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Event Chat
                        </Button>
                      </div>
                    </Card>

                    {/* Recent Attendees */}
                    {event.featuredAttendees &&
                      event.featuredAttendees.length > 0 && (
                        <Card className="p-6 rounded-2xl shadow-sm">
                          <h3 className="font-semibold mb-4">
                            Recent Attendees
                          </h3>
                          <div className="space-y-3">
                            {event.featuredAttendees
                              .slice(0, 5)
                              .map((attendee: any) => (
                                <div
                                  key={attendee.id}
                                  className="flex items-center space-x-3"
                                >
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={attendee.avatar} />
                                    <AvatarFallback>
                                      {attendee.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">
                                      {attendee.name}
                                    </p>
                                    <p className="text-xs text-text-secondary truncate">
                                      {attendee.title}
                                    </p>
                                  </div>
                                </div>
                              ))}

                            {(event.attendeeCount || 0) > 5 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-text-secondary hover:text-primary"
                                onClick={() => setActiveTab("networking")}
                              >
                                View all {event.attendeeCount} attendees
                              </Button>
                            )}
                          </div>
                        </Card>
                      )}
                  </div>
                </div>
              </TabsContent>

              {/* Agenda Tab */}
              <TabsContent value="agenda">
                <EventAgendaTab event={event} />
              </TabsContent>

              {/* Networking Tab */}
              <TabsContent value="networking">
                <EventNetworkingTab event={event} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
