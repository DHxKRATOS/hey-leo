import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useAppSelector } from "../hooks";
import {
  ArrowRight,
  Badge,
  BarChart3,
  Brain,
  Clock,
  Globe,
  Play,
  Sparkles,
  Target,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { Card } from "./ui/card";
import { ResponsiveCardRenderer } from "./ResponsiveCardRenderer";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const demoCardData = {
    id: "demo-founder-card",
    profile: {
      full_name: "Alex Chen",
      job_title: "Founder & CEO",
      company: "HeyLeo",
      location: "San Francisco, CA",
      bio: "Passionate about AI and helping professionals connect more meaningfully. Building HeyLeo to make networking effortless.",
      profile_photo_url:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      cover_image_url:
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop",
      ai_chat_enabled: true,
    },
    links: [
      {
        id: "1",
        platform: "linkedin",
        url: "https://linkedin.com/in/alexchen",
        label: "Connect on LinkedIn",
        is_visible: true,
      },
      {
        id: "2",
        platform: "email",
        url: "mailto:alex@heyleocard.com",
        label: "Send Email",
        is_visible: true,
      },
      {
        id: "3",
        platform: "website",
        url: "https://heyleocard.com",
        label: "Visit Website",
        is_visible: true,
      },
      {
        id: "4",
        platform: "calendar",
        url: "https://calendly.com/alexchen",
        label: "Schedule Meeting",
        is_visible: true,
      },
    ],
    design: {
      template: "professional",
      theme: "leo_orange",
      colors: {
        primary: "#F26522",
        secondary: "#E85A17",
        background: "#FFFFFF",
        text: "#1A1A1A",
        accent: "#F26522",
      },
      fonts: {
        heading: "Inter",
        body: "Inter",
      },
      layout: "center",
      spacing: "default",
      corners: "rounded",
      shadows: "subtle",
    },
    settings: {
      ai_chat_enabled: true,
    },
    selectedTheme: "professional",
    accentColor: "#F26522",
    selectedFont: "modern",
    contentSpacing: "default",
  };

  const handleNavigateToPreLaunch = () => {
    navigate("/prelaunach");
  };

  const handleNavigateToPricing = () => {
    navigate("/pricing");
  };

  const handleNavigateToBlog = () => {
    navigate("/blog");
  };

  const handleNavigateToAbout = () => {
    navigate("/about");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🦁</div>
              <span className="text-xl font-bold text-text-primary tracking-tight">
                HeyLeo
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={handleNavigateToPreLaunch}
                className="text-text-secondary hover:text-primary transition-colors relative group text-sm font-medium"
              >
                <span className="relative">
                  Pre-Launch Site
                  <span className="absolute -top-1 -right-6 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                </span>
              </button>
              <button
                onClick={handleNavigateToPricing}
                className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
              >
                Pricing
              </button>
              <button
                onClick={handleNavigateToAbout}
                className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
              >
                About
              </button>
              <button
                onClick={handleNavigateToBlog}
                className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
              >
                Blog
              </button>
            </nav>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Button onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate("/auth")}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate("/auth")}>Get Started</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
              Your business card,{" "}
              <span className="text-primary">with a brain.</span>
            </h1>
            <p className="text-xl md:text-2xl text-text-secondary mb-8 leading-relaxed">
              Meet the world's first AI business card that can now think and
              talk for you. Welcome to networking that never sleeps.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-primary hover:bg-primary-hover text-white text-lg px-8 py-4 h-auto"
              >
                Create Your AI Card - Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 h-auto"
              >
                <Play className="mr-2 h-5 w-5" />
                See It In Action ↓
              </Button>
            </div>

            {/* Hero Visual - Actual Business Card */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-border">
              <div className="max-w-sm mx-auto">
                <ResponsiveCardRenderer
                  cardData={demoCardData}
                  device="mobile"
                  viewMode="preview"
                  showChat={true}
                  isPreview={true}
                  className="shadow-xl hover:shadow-2xl transition-all duration-300"
                />
              </div>

              {/* Interactive Demo Indicator */}
              <div className="text-center mt-6">
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Live Interactive Demo
                </Badge>
                <p className="text-sm text-text-secondary mt-2">
                  Try clicking the AI chat button above ↑
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              The old way is broken.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-error" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                You meet someone great.
              </h3>
              <p className="text-text-secondary">
                Then lose their card. Or forget to follow up. Or can't remember
                what you talked about.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Your contact info changes.
              </h3>
              <p className="text-text-secondary">
                Now 500 printed cards are worthless. Plus, no one carries
                business cards anymore.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-error" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                You miss connections.
              </h3>
              <p className="text-text-secondary">
                While you're in meetings, potential clients can't learn about
                you or reach out.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              A business card that works as hard as you do.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Always On
              </h3>
              <p className="text-text-secondary">
                Your AI assistant talks to visitors 24/7. Answer questions, book
                meetings, and capture leads while you sleep.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Never Forgets
              </h3>
              <p className="text-text-secondary">
                Every conversation is remembered. Every lead is scored. Every
                follow-up happens automatically.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-info/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-info" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Always Current
              </h3>
              <p className="text-text-secondary">
                Update once, everywhere instantly. No more outdated cards
                floating around.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Three steps to your smartest business card ever.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                1
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Create in minutes
              </h3>
              <p className="text-text-secondary">
                Add your info, pick a style. Your card looks stunning on every
                device.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                2
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Train your AI
              </h3>
              <p className="text-text-secondary">
                Upload documents or answer questions. Your AI learns to
                represent you perfectly.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                3
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Share anywhere
              </h3>
              <p className="text-text-secondary">
                One link for everything. QR code for events. Works everywhere
                people are.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Everything you need. Nothing you don't.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <Brain className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-text-primary mb-2">
                AI That Sounds Like You
              </h3>
              <p className="text-sm text-text-secondary">
                Train it with your content. It answers questions exactly how you
                would.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <Users className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-text-primary mb-2">
                Smart Contact Management
              </h3>
              <p className="text-sm text-text-secondary">
                Every person who views your card is captured. See who's
                interested in real-time.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <BarChart3 className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-text-primary mb-2">
                Analytics That Matter
              </h3>
              <p className="text-sm text-text-secondary">
                Know who viewed your card, what they asked, and when to follow
                up.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <Link className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-text-primary mb-2">
                One Link, Everywhere
              </h3>
              <p className="text-sm text-text-secondary">
                Email signatures, social profiles, QR codes—your card works
                anywhere.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Start free, upgrade when you're ready
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Get your AI business card up and running in minutes. No credit card
            required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-primary hover:bg-primary-hover text-white text-lg px-8 py-4 h-auto"
            >
              Start Free Today
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleNavigateToPricing}
              className="text-lg px-8 py-4 h-auto"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Questions? We've got answers.
            </h2>
          </div>

          <div className="space-y-4">
            {/* {faqItems.map((item, index) => (
            <Card key={index} className="p-6">
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="font-semibold text-text-primary pr-4">{item.question}</h3>
                {openFAQ === index ? (
                  <ChevronUp className="h-5 w-5 text-text-secondary flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-text-secondary flex-shrink-0" />
                )}
              </button>
              {openFAQ === index && (
                <p className="mt-4 text-text-secondary leading-relaxed">{item.answer}</p>
              )}
            </Card>
          ))} */}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Ready to make networking effortless?
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Join thousands of professionals who never miss a connection.
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-primary hover:bg-primary-hover text-white text-lg px-12 py-4 h-auto mb-4"
          >
            Create Your AI Card - Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-sm text-text-secondary">
            No credit card required. Set up in 3 minutes.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-2xl">🦁</div>
                <span className="text-xl font-bold text-text-primary">
                  HeyLeo
                </span>
              </div>
              <p className="text-text-secondary text-sm">
                The world's first AI business card
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-text-primary mb-4">Product</h4>
              <div className="space-y-2">
                <button
                  // onClick={onNavigateToPricing}
                  className="block text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Features
                </button>
                <button
                  // onClick={onNavigateToPricing}
                  className="block text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Pricing
                </button>
                <button className="block text-sm text-text-secondary hover:text-text-primary transition-colors">
                  Examples
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-text-primary mb-4">Company</h4>
              <div className="space-y-2">
                <button
                  // onClick={onNavigateToAbout}
                  className="block text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  About
                </button>
                <button
                  // onClick={onNavigateToBlog}
                  className="block text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Blog
                </button>
                <button className="block text-sm text-text-secondary hover:text-text-primary transition-colors">
                  Support
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-text-primary mb-4">Connect</h4>
              <div className="space-y-2">
                <button className="block text-sm text-text-secondary hover:text-text-primary transition-colors">
                  Twitter
                </button>
                <button className="block text-sm text-text-secondary hover:text-text-primary transition-colors">
                  LinkedIn
                </button>
                <button className="block text-sm text-text-secondary hover:text-text-primary transition-colors">
                  Contact
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center">
            <p className="text-sm text-text-secondary">
              © 2024 HeyLeo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
