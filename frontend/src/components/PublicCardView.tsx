import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Share2,
  MessageCircle,
  Download,
  QrCode,
  MapPin,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Github,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { mockBackend } from "../utils/mockBackendService";
import { toast } from "sonner@2.0.3";

interface PublicCardViewProps {
  cardId: string;
}

export function PublicCardView({ cardId }: PublicCardViewProps) {
  const [cardData, setCardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
    phone: "",
    company: "",
  });
  const [submittingContact, setSubmittingContact] = useState(false);

  useEffect(() => {
    fetchCardData();
  }, [cardId]);

  const fetchCardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use mock backend - no external API calls
      const result = await mockBackend.getPublicCard(cardId);

      if (!result) {
        setError("Card not found or is not publicly available");
        return;
      }

      setCardData(result.card);

      // Track view analytics
      await mockBackend.trackAnalytics(cardId, "view", {
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer: document.referrer,
      });
    } catch (err) {
      console.error("❌ Failed to fetch card data:", err);
      setError("Failed to load card. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (link: any) => {
    // Track link click analytics
    await mockBackend.trackAnalytics(cardId, "link_click", {
      platform: link.platform,
      url: link.url,
      timestamp: new Date().toISOString(),
    });

    // Open link
    if (link.platform === "email") {
      window.location.href = link.url;
    } else if (link.platform === "phone") {
      window.location.href = link.url;
    } else {
      window.open(link.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contactForm.name || !contactForm.email) {
      toast.error("Please fill in your name and email");
      return;
    }

    try {
      setSubmittingContact(true);

      // Use mock backend - no external API calls
      const result = await mockBackend.submitContact({
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message,
        phone: contactForm.phone,
        company: contactForm.company,
        card_id: cardId,
        source: "public_card",
      });

      if (result.success) {
        toast.success("Thanks for reaching out! Your message has been sent.");
        setShowContactForm(false);
        setContactForm({
          name: "",
          email: "",
          message: "",
          phone: "",
          company: "",
        });
      } else {
        throw new Error("Failed to submit contact form");
      }
    } catch (error) {
      console.error("❌ Contact submission failed:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSubmittingContact(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${cardData?.profile?.full_name} - Professional Profile`,
      text: `Check out ${cardData?.profile?.full_name}'s professional profile`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }

      // Track share analytics
      await mockBackend.trackAnalytics(cardId, "share", {
        method: navigator.share ? "native" : "clipboard",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Share failed:", error);
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      } catch (clipboardError) {
        toast.error("Failed to share card");
      }
    }
  };

  const getLinkIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "linkedin":
        return <Linkedin className="w-4 h-4" />;
      case "github":
        return <Github className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      case "phone":
        return <Phone className="w-4 h-4" />;
      case "website":
        return <Globe className="w-4 h-4" />;
      case "calendar":
        return <Calendar className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/20 via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading card...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/20 via-background to-muted/20 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🦁</div>
          <h2 className="text-xl font-semibold mb-2">Card Not Found</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </Card>
      </div>
    );
  }

  const profile = cardData?.profile || {};
  const links = cardData?.links || [];
  const design = cardData?.design || {};
  const colors = design.colors || {};

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-muted/20 via-background to-muted/20"
      style={{
        backgroundColor: colors.background || "#FAFAFA",
      }}
    >
      {/* Header Actions */}
      <div className="fixed top-4 right-4 z-50 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="bg-background/80 backdrop-blur-sm"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>

        {cardData?.settings?.ai_chat_enabled && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("🦁 AI Chat coming soon!")}
            className="bg-background/80 backdrop-blur-sm"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Button>
        )}
      </div>

      {/* Main Card Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className="relative overflow-hidden shadow-2xl"
            style={{
              backgroundColor: colors.background || "#FFFFFF",
              borderColor: colors.primary || "#F26522",
            }}
          >
            {/* Cover Image */}
            {profile.cover_image_url && (
              <div
                className="h-32 md:h-48 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${profile.cover_image_url})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}

            {/* Profile Section */}
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                {/* Profile Photo */}
                {profile.profile_photo_url && (
                  <div className="relative">
                    <img
                      src={profile.profile_photo_url}
                      alt={profile.full_name}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-background shadow-lg"
                    />
                    <div
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: colors.primary || "#F26522" }}
                    >
                      🦁
                    </div>
                  </div>
                )}

                {/* Profile Info */}
                <div className="flex-1 space-y-2">
                  <h1
                    className="text-2xl md:text-3xl font-bold"
                    style={{ color: colors.text || "#1A1A1A" }}
                  >
                    {profile.full_name}
                  </h1>

                  {profile.job_title && (
                    <p
                      className="text-lg md:text-xl"
                      style={{ color: colors.primary || "#F26522" }}
                    >
                      {profile.job_title}
                    </p>
                  )}

                  {profile.company && (
                    <p className="text-muted-foreground">{profile.company}</p>
                  )}

                  {profile.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {profile.location}
                    </div>
                  )}
                </div>

                {/* Company Logo */}
                {profile.company_logo_url && (
                  <img
                    src={profile.company_logo_url}
                    alt={profile.company}
                    className="w-16 h-16 object-contain"
                  />
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mt-6">
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: colors.text || "#1A1A1A" }}
                  >
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Links Grid */}
              {links.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">
                    Connect With Me
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {links
                      .filter((link) => link.is_visible || link.visible)
                      .map((link) => (
                        <Button
                          key={link.id}
                          variant="outline"
                          className="justify-start h-auto p-4 hover-lift"
                          onClick={() => handleLinkClick(link)}
                          style={
                            {
                              borderColor: colors.primary || "#F26522",
                              "--hover-bg": colors.accent || "#FFF4F0",
                            } as React.CSSProperties
                          }
                        >
                          <div className="flex items-center space-x-3 w-full">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                              style={{
                                backgroundColor: colors.primary || "#F26522",
                              }}
                            >
                              {getLinkIcon(link.platform)}
                            </div>
                            <div className="text-left flex-1">
                              <div className="font-medium">{link.label}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {link.platform === "email"
                                  ? link.url.replace("mailto:", "")
                                  : link.platform === "phone"
                                  ? link.url.replace("tel:", "")
                                  : link.url.replace(/^https?:\/\//, "")}
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </Button>
                      ))}
                  </div>
                </div>
              )}

              {/* Contact Button */}
              <div className="mt-8 flex justify-center">
                <Dialog
                  open={showContactForm}
                  onOpenChange={setShowContactForm}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="w-full md:w-auto"
                      style={{
                        backgroundColor: colors.primary || "#F26522",
                        color: "#FFFFFF",
                      }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Get In Touch
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Send a Message</DialogTitle>
                      <DialogDescription>
                        Reach out to {profile.full_name} directly
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            value={contactForm.name}
                            onChange={(e) =>
                              setContactForm((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={contactForm.email}
                            onChange={(e) =>
                              setContactForm((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={contactForm.phone}
                            onChange={(e) =>
                              setContactForm((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="company">Company</Label>
                          <Input
                            id="company"
                            value={contactForm.company}
                            onChange={(e) =>
                              setContactForm((prev) => ({
                                ...prev,
                                company: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          rows={3}
                          value={contactForm.message}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              message: e.target.value,
                            }))
                          }
                          placeholder="Hi! I'd love to connect..."
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowContactForm(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={submittingContact}
                          className="flex-1"
                          style={{
                            backgroundColor: colors.primary || "#F26522",
                            color: "#FFFFFF",
                          }}
                        >
                          {submittingContact ? "Sending..." : "Send Message"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <span className="text-2xl">🦁</span>
            <span className="text-sm">
              Powered by <strong>leo</strong> - Create your own professional
              card
            </span>
          </div>
          <Button
            variant="link"
            onClick={() => window.open("https://leo.cards", "_blank")}
            className="mt-2 text-primary"
          >
            Get Your Leo Card
          </Button>
        </div>
      </div>
    </div>
  );
}
