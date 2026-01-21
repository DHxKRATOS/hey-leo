import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  User,
  Mail,
  Phone,
  Calendar,
  Globe,
  Instagram,
  Linkedin,
  Github,
  Briefcase,
  Camera,
  MessageCircle,
  MapPin,
  Building,
  Stethoscope,
  Code,
  Palette,
  Target,
  Users,
  Star,
  Home,
  Eye,
  Smartphone,
  Monitor,
  CheckCircle,
  ExternalLink,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface User {
  id: string;
  email: string;
  name: string;
}

interface TemplateSelectionModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
  onStartBlank: () => void;
}

interface Template {
  id: string;
  name: string;
  description: string;
  industry: string;
  bestFor: string[];
  gradient: string;
  profileName: string;
  profileTitle: string;
  profileCompany: string;
  bio: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  icons: Array<{
    icon: React.ReactNode;
    color: string;
    label: string;
    value: string;
  }>;
  textColor: string;
  layout: "center" | "left" | "right";
  features: string[];
  includes: string[];
  profileImage: string;
}

const templates: Template[] = [
  {
    id: "executive-elegance",
    name: "Executive Elegance",
    description: "Professional leadership presence",
    industry: "Executive",
    bestFor: ["CEOs", "Executives", "Business Leaders", "Directors"],
    gradient: "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900",
    profileName: "Michael Harrison",
    profileTitle: "Chief Executive Officer",
    profileCompany: "Fortune 500 Corp",
    bio: "Leading digital transformation across global enterprises with 20+ years of strategic leadership experience. Passionate about innovation and building high-performing teams.",
    email: "michael.harrison@fortune500.com",
    phone: "+1 (555) 123-4567",
    website: "fortune500corp.com",
    location: "New York, NY",
    icons: [
      {
        icon: <Linkedin className="h-4 w-4" />,
        color: "text-blue-400",
        label: "LinkedIn",
        value: "linkedin.com/in/michaelharrison",
      },
      {
        icon: <Mail className="h-4 w-4" />,
        color: "text-white",
        label: "Email",
        value: "michael.harrison@fortune500.com",
      },
      {
        icon: <Calendar className="h-4 w-4" />,
        color: "text-green-400",
        label: "Schedule",
        value: "calendly.com/michaelharrison",
      },
      {
        icon: <Phone className="h-4 w-4" />,
        color: "text-blue-300",
        label: "Phone",
        value: "+1 (555) 123-4567",
      },
    ],
    textColor: "text-white",
    layout: "center",
    features: [
      "Trust-building design",
      "Corporate aesthetic",
      "LinkedIn integrated",
      "Executive branding",
    ],
    includes: [
      "Professional gradient",
      "Executive bio section",
      "Contact form",
      "AI assistant",
      "Social links",
    ],
    profileImage: "MH",
  },
  {
    id: "creative-professional",
    name: "Creative Professional",
    description: "Bold and artistic expression",
    industry: "Design",
    bestFor: ["Designers", "Artists", "Creative Directors", "Brand Managers"],
    gradient: "bg-gradient-to-br from-purple-500 via-pink-500 to-red-500",
    profileName: "Sofia Martinez",
    profileTitle: "Creative Director",
    profileCompany: "Design Studio Pro",
    bio: "Bringing brands to life through innovative design and strategic thinking. Specializing in digital experiences that connect and inspire audiences worldwide.",
    email: "sofia@designstudiopro.com",
    phone: "+1 (555) 234-5678",
    website: "sofiamartinez.design",
    location: "Los Angeles, CA",
    icons: [
      {
        icon: <Instagram className="h-4 w-4" />,
        color: "text-pink-200",
        label: "Instagram",
        value: "@sofiamartinezdesign",
      },
      {
        icon: <Globe className="h-4 w-4" />,
        color: "text-white",
        label: "Portfolio",
        value: "sofiamartinez.design",
      },
      {
        icon: <Mail className="h-4 w-4" />,
        color: "text-purple-200",
        label: "Email",
        value: "sofia@designstudiopro.com",
      },
      {
        icon: <Linkedin className="h-4 w-4" />,
        color: "text-blue-200",
        label: "LinkedIn",
        value: "linkedin.com/in/sofiamartinez",
      },
    ],
    textColor: "text-white",
    layout: "left",
    features: [
      "Visual portfolio focus",
      "Creative layouts",
      "Social media integration",
      "Brand personality",
    ],
    includes: [
      "Vibrant gradient design",
      "Portfolio showcase",
      "Social media links",
      "Creative bio section",
      "Contact integration",
    ],
    profileImage: "SM",
  },
  {
    id: "sales-dynamo",
    name: "Sales Dynamo",
    description: "Energetic and results-driven",
    industry: "Sales",
    bestFor: [
      "Sales Professionals",
      "Account Managers",
      "Business Development",
      "Relationship Managers",
    ],
    gradient: "bg-gradient-to-br from-orange-400 via-red-500 to-pink-500",
    profileName: "James Wilson",
    profileTitle: "VP of Sales",
    profileCompany: "Revenue Growth Inc",
    bio: "Helping B2B companies accelerate revenue growth through strategic partnerships and innovative sales methodologies. Always ready to connect and explore opportunities.",
    email: "james@revenuegrowth.com",
    phone: "+1 (555) 345-6789",
    website: "revenuegrowth.com",
    location: "Austin, TX",
    icons: [
      {
        icon: <Calendar className="h-4 w-4" />,
        color: "text-yellow-200",
        label: "Book Meeting",
        value: "calendly.com/jameswilson",
      },
      {
        icon: <Phone className="h-4 w-4" />,
        color: "text-white",
        label: "Call Now",
        value: "+1 (555) 345-6789",
      },
      {
        icon: <Linkedin className="h-4 w-4" />,
        color: "text-blue-200",
        label: "LinkedIn",
        value: "linkedin.com/in/jameswilson",
      },
      {
        icon: <MessageCircle className="h-4 w-4" />,
        color: "text-green-200",
        label: "WhatsApp",
        value: "+1 (555) 345-6789",
      },
    ],
    textColor: "text-white",
    layout: "center",
    features: [
      "Meeting booking focus",
      "Contact optimization",
      "Conversion-driven",
      "Relationship building",
    ],
    includes: [
      "Energetic gradient",
      "Calendar integration",
      "Multiple contact methods",
      "Sales-focused layout",
      "AI chat assistant",
    ],
    profileImage: "JW",
  },
  {
    id: "consultant-expert",
    name: "Consultant Expert",
    description: "Trustworthy and professional",
    industry: "Consulting",
    bestFor: ["Consultants", "Advisors", "Coaches", "Strategy Professionals"],
    gradient: "bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600",
    profileName: "Dr. Sarah Chen",
    profileTitle: "Strategy Consultant",
    profileCompany: "Chen Advisory Group",
    bio: "Transforming businesses through data-driven insights and strategic planning. Helping organizations navigate complex challenges and unlock growth potential.",
    email: "sarah@chenadvisory.com",
    phone: "+1 (555) 456-7890",
    website: "chenadvisory.com",
    location: "San Francisco, CA",
    icons: [
      {
        icon: <Linkedin className="h-4 w-4" />,
        color: "text-blue-200",
        label: "LinkedIn",
        value: "linkedin.com/in/sarahchen",
      },
      {
        icon: <Calendar className="h-4 w-4" />,
        color: "text-green-200",
        label: "Consultation",
        value: "calendly.com/sarahchen",
      },
      {
        icon: <Mail className="h-4 w-4" />,
        color: "text-white",
        label: "Email",
        value: "sarah@chenadvisory.com",
      },
      {
        icon: <Globe className="h-4 w-4" />,
        color: "text-teal-200",
        label: "Website",
        value: "chenadvisory.com",
      },
    ],
    textColor: "text-white",
    layout: "center",
    features: [
      "Trust-building design",
      "Expertise showcase",
      "Consultation booking",
      "Professional credibility",
    ],
    includes: [
      "Professional gradient",
      "Expertise highlights",
      "Booking system",
      "Testimonials section",
      "Case study links",
    ],
    profileImage: "SC",
  },
  {
    id: "real-estate-pro",
    name: "Real Estate Pro",
    description: "Sophisticated and trustworthy",
    industry: "Real Estate",
    bestFor: ["Realtors", "Property Agents", "Brokers", "Property Managers"],
    gradient: "bg-gradient-to-br from-gray-900 via-gray-800 to-black",
    profileName: "David Park",
    profileTitle: "Senior Realtor",
    profileCompany: "Premier Properties",
    bio: "Your trusted partner in finding the perfect home with personalized service and deep market knowledge. Specializing in luxury residential properties.",
    email: "david@premierproperties.com",
    phone: "+1 (555) 567-8901",
    website: "premierproperties.com",
    location: "Miami, FL",
    icons: [
      {
        icon: <Phone className="h-4 w-4" />,
        color: "text-green-400",
        label: "Call Direct",
        value: "+1 (555) 567-8901",
      },
      {
        icon: <MessageCircle className="h-4 w-4" />,
        color: "text-blue-400",
        label: "Text/WhatsApp",
        value: "+1 (555) 567-8901",
      },
      {
        icon: <Globe className="h-4 w-4" />,
        color: "text-white",
        label: "Listings",
        value: "premierproperties.com/listings",
      },
      {
        icon: <Mail className="h-4 w-4" />,
        color: "text-gray-300",
        label: "Email",
        value: "david@premierproperties.com",
      },
    ],
    textColor: "text-white",
    layout: "left",
    features: [
      "Contact emphasis",
      "Trust building",
      "Property showcase",
      "Local expertise",
    ],
    includes: [
      "Sophisticated design",
      "Property gallery",
      "Market insights",
      "Contact prioritization",
      "Testimonials",
    ],
    profileImage: "DP",
  },
  {
    id: "healthcare-professional",
    name: "Healthcare Professional",
    description: "Clean and caring approach",
    industry: "Healthcare",
    bestFor: [
      "Doctors",
      "Therapists",
      "Healthcare Providers",
      "Medical Professionals",
    ],
    gradient: "bg-gradient-to-br from-blue-50 via-white to-blue-100",
    profileName: "Dr. Lisa Chen",
    profileTitle: "Family Medicine Physician",
    profileCompany: "HealthCare Partners",
    bio: "Providing compassionate, comprehensive care for patients and families. Committed to your health and wellbeing with personalized treatment and preventive care.",
    email: "dr.chen@healthcarepartners.com",
    phone: "+1 (555) 678-9012",
    website: "healthcarepartners.com",
    location: "Seattle, WA",
    icons: [
      {
        icon: <Phone className="h-4 w-4" />,
        color: "text-blue-600",
        label: "Appointment",
        value: "+1 (555) 678-9012",
      },
      {
        icon: <Mail className="h-4 w-4" />,
        color: "text-blue-500",
        label: "Email",
        value: "dr.chen@healthcarepartners.com",
      },
      {
        icon: <Calendar className="h-4 w-4" />,
        color: "text-green-600",
        label: "Schedule",
        value: "healthcarepartners.com/schedule",
      },
      {
        icon: <Globe className="h-4 w-4" />,
        color: "text-blue-700",
        label: "Practice Info",
        value: "healthcarepartners.com",
      },
    ],
    textColor: "text-gray-800",
    layout: "center",
    features: [
      "Clean medical design",
      "Appointment booking",
      "Professional credentials",
      "Patient-focused",
    ],
    includes: [
      "Clean medical aesthetic",
      "Appointment scheduling",
      "Credentials display",
      "Patient resources",
      "Insurance info",
    ],
    profileImage: "LC",
  },
  {
    id: "tech-innovator",
    name: "Tech Innovator",
    description: "Modern developer aesthetic",
    industry: "Technology",
    bestFor: [
      "Developers",
      "Engineers",
      "Tech Professionals",
      "Startup Founders",
    ],
    gradient: "bg-gradient-to-br from-gray-900 via-blue-900 to-black",
    profileName: "Alex Kumar",
    profileTitle: "Full Stack Developer",
    profileCompany: "TechStart Inc.",
    bio: "Building scalable applications and elegant solutions for the modern web. Passionate about open source, clean code architecture, and emerging technologies.",
    email: "alex@techstart.dev",
    phone: "+1 (555) 789-0123",
    website: "alexkumar.dev",
    location: "San Jose, CA",
    icons: [
      {
        icon: <Github className="h-4 w-4" />,
        color: "text-white",
        label: "GitHub",
        value: "github.com/alexkumar",
      },
      {
        icon: <Linkedin className="h-4 w-4" />,
        color: "text-blue-400",
        label: "LinkedIn",
        value: "linkedin.com/in/alexkumar",
      },
      {
        icon: <Globe className="h-4 w-4" />,
        color: "text-green-400",
        label: "Portfolio",
        value: "alexkumar.dev",
      },
      {
        icon: <Mail className="h-4 w-4" />,
        color: "text-gray-300",
        label: "Email",
        value: "alex@techstart.dev",
      },
    ],
    textColor: "text-white",
    layout: "right",
    features: [
      "Developer portfolio",
      "Code showcase",
      "Tech stack display",
      "Open source focus",
    ],
    includes: [
      "Dark developer theme",
      "GitHub integration",
      "Project showcase",
      "Tech stack display",
      "Code samples",
    ],
    profileImage: "AK",
  },
  {
    id: "freelance-creator",
    name: "Freelance Creator",
    description: "Artistic and vibrant portfolio",
    industry: "Photography",
    bestFor: ["Photographers", "Freelancers", "Content Creators", "Artists"],
    gradient: "bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600",
    profileName: "Maria Santos",
    profileTitle: "Wedding Photographer",
    profileCompany: "Santos Photography",
    bio: "Capturing your most precious moments with artistic vision and passion. Specializing in weddings, portraits, and lifestyle photography that tells your story.",
    email: "maria@santosphotography.com",
    phone: "+1 (555) 890-1234",
    website: "santosphotography.com",
    location: "Los Angeles, CA",
    icons: [
      {
        icon: <Instagram className="h-4 w-4" />,
        color: "text-pink-200",
        label: "Instagram",
        value: "@santosphotography",
      },
      {
        icon: <Globe className="h-4 w-4" />,
        color: "text-white",
        label: "Portfolio",
        value: "santosphotography.com",
      },
      {
        icon: <Mail className="h-4 w-4" />,
        color: "text-purple-200",
        label: "Email",
        value: "maria@santosphotography.com",
      },
      {
        icon: <Calendar className="h-4 w-4" />,
        color: "text-yellow-200",
        label: "Book Session",
        value: "calendly.com/mariasantos",
      },
    ],
    textColor: "text-white",
    layout: "center",
    features: [
      "Visual portfolio",
      "Artistic showcase",
      "Booking system",
      "Social integration",
    ],
    includes: [
      "Artistic gradient",
      "Photo gallery",
      "Session booking",
      "Social media integration",
      "Client testimonials",
    ],
    profileImage: "MS",
  },
];

export function TemplateSelectionModal({
  user,
  isOpen,
  onClose,
  onSelectTemplate,
  onStartBlank,
}: TemplateSelectionModalProps) {
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (previewTemplate) {
          setPreviewTemplate(null);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, previewTemplate, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
  };

  const handleSelectTemplate = (templateId: string) => {
    onSelectTemplate(templateId);
    onClose();
  };

  const handleStartBlank = () => {
    onStartBlank();
    onClose();
  };

  const handleClosePreview = () => {
    setPreviewTemplate(null);
  };

  const renderTemplateCard = (template: Template) => (
    <div key={template.id} className="group">
      {" "}
      {/* FIXED: Added group class here */}
      {/* Template Preview Card */}
      <Card
        className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-border hover:border-primary/50 cursor-pointer"
        style={{ aspectRatio: "280/340" }}
      >
        {/* Card Preview */}
        <div className={`h-full w-full ${template.gradient} relative`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white/30 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-10 h-10 border border-white/20 rounded"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/10 rounded-full"></div>
          </div>

          {/* Card Content */}
          <div
            className={`relative h-full p-5 flex flex-col ${
              template.layout === "center"
                ? "text-center items-center justify-center"
                : template.layout === "left"
                ? "text-left items-start justify-center"
                : "text-right items-end justify-center"
            }`}
          >
            {/* Profile Photo with Initials */}
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 border-2 border-white/30">
              <span
                className={`text-sm font-bold ${template.textColor} opacity-90`}
              >
                {template.profileImage}
              </span>
            </div>

            {/* Name and Title */}
            <div className="mb-3">
              <h3 className={`font-bold text-base mb-1 ${template.textColor}`}>
                {template.profileName}
              </h3>
              <p className={`text-xs opacity-90 ${template.textColor}`}>
                {template.profileTitle}
              </p>
              <p className={`text-xs opacity-75 ${template.textColor}`}>
                {template.profileCompany}
              </p>
            </div>

            {/* Bio */}
            <p
              className={`text-xs opacity-80 mb-4 leading-relaxed max-w-44 ${template.textColor}`}
            >
              {template.bio.substring(0, 70)}...
            </p>

            {/* Social Icons */}
            <div className="flex space-x-2">
              {template.icons.slice(0, 3).map((iconItem, index) => (
                <div
                  key={index}
                  className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <div className={iconItem.color}>{iconItem.icon}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hover Overlay with Buttons - FIXED: Improved z-index and interaction */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-10">
            <div className="space-y-3">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePreview(template);
                }}
                className="bg-white/95 hover:bg-white text-gray-800 shadow-lg min-w-[120px] text-sm h-10 font-semibold backdrop-blur-sm border border-white/20"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectTemplate(template.id);
                }}
                className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg min-w-[120px] text-sm h-10 font-semibold"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Select
              </Button>
            </div>
          </div>

          {/* Shine Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-shine"></div>
          </div>
        </div>
      </Card>
      {/* Template Info */}
      <div className="mt-3 text-center">
        <h4 className="font-semibold text-foreground text-sm mb-1">
          {template.name}
        </h4>
        <p className="text-xs text-muted-foreground mb-1">
          {template.description}
        </p>
        <Badge variant="secondary" className="text-xs">
          {template.industry}
        </Badge>
      </div>
    </div>
  );

  const renderLivePreview = (template: Template) => {
    const isDesktop = viewMode === "desktop";
    const containerClass = isDesktop ? "w-96 h-[500px]" : "w-80 h-[600px]";

    return (
      <div
        className={`${containerClass} mx-auto transition-all duration-300 relative`}
      >
        {/* Device Frame */}
        <div
          className={`w-full h-full ${
            isDesktop
              ? "bg-gray-100 rounded-lg p-2"
              : "bg-black rounded-[3rem] p-2"
          } shadow-2xl`}
        >
          {/* Screen */}
          <div
            className={`w-full h-full bg-white rounded-lg overflow-hidden relative ${
              isDesktop ? "" : "rounded-[2.5rem]"
            }`}
          >
            {/* Mobile Notch */}
            {!isDesktop && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>
            )}

            {/* Card Content */}
            <div
              className={`h-full ${template.gradient} relative overflow-hidden`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-8 right-8 w-24 h-24 border-2 border-white/30 rounded-full"></div>
                <div className="absolute bottom-8 left-8 w-16 h-16 border border-white/20 rounded"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full"></div>
              </div>

              {/* Profile Section */}
              <div className="relative p-8 text-center">
                {/* Profile Photo */}
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
                  <span
                    className={`text-xl font-bold ${template.textColor} opacity-90`}
                  >
                    {template.profileImage}
                  </span>
                </div>

                {/* Name and Info */}
                <h1 className={`text-2xl font-bold mb-2 ${template.textColor}`}>
                  {template.profileName}
                </h1>
                <p className={`text-lg opacity-90 mb-1 ${template.textColor}`}>
                  {template.profileTitle}
                </p>
                <p className={`text-sm opacity-75 mb-1 ${template.textColor}`}>
                  {template.profileCompany}
                </p>
                <div className="flex items-center justify-center space-x-1 mt-2 text-sm opacity-70">
                  <MapPin className="h-4 w-4" />
                  <span className={template.textColor}>
                    {template.location} 🌍
                  </span>
                </div>
              </div>

              {/* Bio Section */}
              <div className="px-8 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <p
                    className={`text-sm leading-relaxed ${template.textColor} opacity-80`}
                  >
                    {template.bio}
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="px-8 mb-6">
                <div className="flex space-x-3">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary-hover text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                    size="sm"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat with AI
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                    size="sm"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </div>
              </div>

              {/* Social Links */}
              <div className="px-8 mb-6">
                <div className="flex justify-center space-x-4">
                  {template.icons.slice(0, 5).map((iconItem, index) => (
                    <div
                      key={index}
                      className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-200 cursor-pointer group"
                    >
                      <div
                        className={`${iconItem.color} group-hover:scale-110 transition-transform`}
                      >
                        {iconItem.icon}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <div className="inline-flex items-center space-x-1 text-xs opacity-60 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className={template.textColor}>Powered by HeyLeo</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Main Modal */}
      {!previewTemplate ? (
        <div className="bg-card rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
          {/* Modal Header */}
          <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Choose a Template
              </h2>
              <p className="text-muted-foreground text-sm">
                Select a professionally designed template or start from scratch
              </p>
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center space-x-3">
              {/* Create Blank - Prominent Position */}
              <Button
                onClick={handleStartBlank}
                variant="outline"
                className="border-2 border-dashed border-primary/50 hover:border-primary hover:bg-primary/5 text-primary hover:text-primary font-semibold px-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Blank
              </Button>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Template Gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {templates.map((template) => renderTemplateCard(template))}
            </div>

            {/* Bottom Help Text */}
            <div className="text-center mt-8 pt-6 border-t border-border">
              <p className="text-muted-foreground text-sm mb-2">
                Need something unique? Start with a blank card for complete
                creative freedom.
              </p>
              <Button
                variant="ghost"
                onClick={handleStartBlank}
                className="text-primary hover:text-primary-hover hover:bg-primary/5"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start from scratch
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Enhanced Split-Screen Preview Modal */
        <div className="bg-card rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex animate-in fade-in-0 zoom-in-95 duration-300">
          {/* Left Side - Device Frame Preview */}
          <div className="flex-1 min-w-0 flex flex-col bg-muted/30">
            {/* Preview Header */}
            <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClosePreview}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Templates
                </Button>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {previewTemplate.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Template Preview
                  </p>
                </div>
              </div>

              {/* Device Toggle - FIXED: Better styling and interaction */}
              <div className="flex items-center space-x-2">
                <div className="bg-muted rounded-lg p-1 flex border border-border">
                  <Button
                    variant={viewMode === "desktop" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setViewMode("desktop");
                    }}
                    className={`h-8 px-3 text-xs transition-all duration-200 ${
                      viewMode === "desktop"
                        ? "bg-card shadow-sm text-foreground border border-border"
                        : "hover:bg-card/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Monitor className="h-3 w-3 mr-1" />
                    Desktop
                  </Button>
                  <Button
                    variant={viewMode === "mobile" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setViewMode("mobile");
                    }}
                    className={`h-8 px-3 text-xs transition-all duration-200 ${
                      viewMode === "mobile"
                        ? "bg-card shadow-sm text-foreground border border-border"
                        : "hover:bg-card/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Smartphone className="h-3 w-3 mr-1" />
                    Mobile
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 p-8 flex items-center justify-center overflow-y-auto">
              {renderLivePreview(previewTemplate)}
            </div>
          </div>

          {/* Right Side - Template Details */}
          <div className="w-80 bg-card border-l border-border flex flex-col">
            {/* Details Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">
                  {previewTemplate.name}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                {previewTemplate.description}
              </p>

              {/* Industry Badge */}
              <Badge variant="secondary" className="mb-4">
                {previewTemplate.industry}
              </Badge>
            </div>

            {/* Scrollable Details Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Perfect For */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                  Perfect for:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {previewTemplate.bestFor.map((item, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Key Features */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Key Features:
                </h3>
                <ul className="space-y-2">
                  {previewTemplate.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start space-x-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What's Included */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  What's Included:
                </h3>
                <ul className="space-y-2">
                  {previewTemplate.includes.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center space-x-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Additional Features */}
              <div className="bg-accent rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2 text-sm">
                  Also Includes:
                </h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-success" />
                    <span>Mobile-responsive design</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-success" />
                    <span>AI assistant integration</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-success" />
                    <span>Analytics tracking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-success" />
                    <span>Customizable colors & content</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-success" />
                    <span>Social media integration</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-border space-y-3">
              <Button
                onClick={() => handleSelectTemplate(previewTemplate.id)}
                className="w-full bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 font-semibold"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Use This Template
              </Button>
              <Button
                variant="outline"
                onClick={handleClosePreview}
                className="w-full"
              >
                Back to Gallery
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
