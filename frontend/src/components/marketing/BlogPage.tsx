import React, { useState } from "react";
import {
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Tag,
  User,
  Share2,
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { useNavigate } from "react-router-dom";

interface BlogPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onNavigateToHome?: () => void;
  onNavigateToPricing?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToBlog?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToCookies?: () => void;
  onNavigateToPreLaunch?: () => void;
}

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  featured?: boolean;
  slug?: string;
}

interface BlogCategory {
  id: string;
  name: string;
  count: number;
}

export function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentView, setCurrentView] = useState<"homepage" | "post">(
    "homepage"
  );
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const navigate = useNavigate();

  const categories: BlogCategory[] = [
    { id: "all", name: "All", count: 12 },
    { id: "networking", name: "Networking", count: 5 },
    { id: "ai-insights", name: "AI Insights", count: 4 },
    { id: "product-updates", name: "Product Updates", count: 3 },
  ];

  const featuredPost: BlogPost = {
    id: 1,
    title: "The Future of Professional Networking is Here",
    excerpt:
      "How AI-powered digital business cards are revolutionizing the way we connect, build relationships, and grow our professional networks in an increasingly digital world.",
    author: "Sarah Chen",
    authorRole: "Head of Product",
    date: "March 15, 2024",
    readTime: "8 min read",
    category: "AI Insights",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop&crop=center",
    featured: true,
    slug: "future-of-professional-networking",
  };

  const posts: BlogPost[] = [
    {
      id: 2,
      title: "5 Ways to Master Digital Networking",
      excerpt:
        "Proven strategies for maximizing your digital business card effectiveness and building meaningful professional relationships.",
      author: "Marcus Rodriguez",
      authorRole: "Sales Director",
      date: "March 12, 2024",
      readTime: "6 min read",
      category: "Networking",
      image:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=450&fit=crop&crop=center",
      slug: "master-digital-networking",
    },
    {
      id: 3,
      title: "Meeting Intelligence: AI That Actually Helps",
      excerpt:
        "Learn how our AI assistant transforms meeting preparation and follow-up, making every interaction more meaningful.",
      author: "Jennifer Kim",
      authorRole: "Executive Coach",
      date: "March 10, 2024",
      readTime: "5 min read",
      category: "AI Insights",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop&crop=center",
      slug: "meeting-intelligence-ai",
    },
    {
      id: 4,
      title: "Introducing Smart Contact Management",
      excerpt:
        "Our biggest update yet brings enhanced contact organization, automated follow-ups, and intelligent relationship insights.",
      author: "David Thompson",
      authorRole: "Engineering Lead",
      date: "March 8, 2024",
      readTime: "4 min read",
      category: "Product Updates",
      image:
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=450&fit=crop&crop=center",
      slug: "smart-contact-management",
    },
    {
      id: 5,
      title: "The Psychology of Digital First Impressions",
      excerpt:
        "Understanding how people form impressions online and optimizing your digital presence for maximum professional impact.",
      author: "Emily Rodriguez",
      authorRole: "UX Researcher",
      date: "March 5, 2024",
      readTime: "7 min read",
      category: "Networking",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=450&fit=crop&crop=center",
      slug: "psychology-digital-first-impressions",
    },
    {
      id: 6,
      title: "Optimizing Your AI Credit Usage",
      excerpt:
        "Pro tips for managing your AI credits efficiently and maximizing the value of every conversation with your assistant.",
      author: "Alex Chen",
      authorRole: "Customer Success",
      date: "March 3, 2024",
      readTime: "5 min read",
      category: "AI Insights",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop&crop=center",
      slug: "optimizing-ai-credit-usage",
    },
    {
      id: 7,
      title: "Building Your Personal Brand with AI",
      excerpt:
        "Leverage AI to create consistent, engaging content that builds your professional reputation and attracts new opportunities.",
      author: "Michael Park",
      authorRole: "Content Strategist",
      date: "February 28, 2024",
      readTime: "6 min read",
      category: "Networking",
      image:
        "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=450&fit=crop&crop=center",
      slug: "building-personal-brand-ai",
    },
  ];

  const filteredPosts =
    selectedCategory === "all"
      ? posts
      : posts.filter(
          (post) =>
            post.category.toLowerCase().replace(" ", "-") === selectedCategory
        );

  const handlePostClick = (post: BlogPost) => {
    setSelectedPost(post);
    setCurrentView("post");
  };

  const handleBackToBlog = () => {
    setCurrentView("homepage");
    setSelectedPost(null);
  };

  const onNavigateToPreLaunch = () => {
    navigate("/");
  };
  // Blog Homepage Component
  const BlogHomepage = () => (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Sticky Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#EBEBEB] h-20">
        <div className="max-w-[1200px] mx-auto px-6 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Logo */}
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={onNavigateToPreLaunch}
            >
              <div className="w-8 h-8 bg-[#F26522] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🦁</span>
              </div>
              <span className="text-[32px] font-bold text-[#1D1D1F] tracking-tight">
                leo
              </span>
            </div>

            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <span className="text-[16px] font-medium text-[#1D1D1F]">
                Blog
              </span>
              {/* <button 
                onClick={onLogin}
                className="text-[16px] font-medium text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                Sign In
              </button> */}
              <button
                onClick={onNavigateToPreLaunch}
                className="text-[16px] font-medium text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                Pre-Launch
              </button>
            </div>

            {/* Subscribe Button */}
            {/* <Button 
              variant="ghost" 
              onClick={onGetStarted}
              className="text-[#F26522] hover:text-[#E85A17] font-medium"
            >
              Get Started
            </Button> */}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wide mb-4">
              INSIGHTS
            </p>
            <h1 className="text-[48px] font-bold text-[#1D1D1F] mb-6 tracking-tight leading-tight">
              Building the future of networking
            </h1>
          </div>

          {/* Featured Post */}
          <Card
            className="overflow-hidden border border-[#EBEBEB] rounded-[16px] hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => handlePostClick(featuredPost)}
          >
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-8">
              <div className="mb-4">
                <div className="inline-block px-3 py-1 bg-[rgba(242,101,34,0.1)] text-[#F26522] rounded-[12px] border border-[rgba(242,101,34,0.2)] text-[12px] font-semibold uppercase tracking-wide mb-4">
                  {featuredPost.category}
                </div>
                <h2 className="text-[32px] font-bold text-[#1D1D1F] mb-4 leading-tight group-hover:text-[#F26522] transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-[16px] text-[#424245] leading-relaxed">
                  {featuredPost.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#EBEBEB]">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#F26522] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-[14px]">
                      {featuredPost.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-[#1D1D1F] text-[14px]">
                      {featuredPost.author}
                    </p>
                    <p className="text-[#86868B] text-[14px]">
                      {featuredPost.authorRole}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[#86868B] text-[14px]">
                    {featuredPost.date}
                  </p>
                  <p className="text-[#86868B] text-[14px]">
                    {featuredPost.readTime}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Post Grid */}
      <section className="pb-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8">
            {posts.map((post, index) => (
              <Card
                key={post.id}
                className="overflow-hidden border border-[#EBEBEB] rounded-[16px] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group card-stagger"
                onClick={() => handlePostClick(post)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <div className="inline-block px-3 py-1 bg-[rgba(242,101,34,0.1)] text-[#F26522] rounded-[12px] border border-[rgba(242,101,34,0.2)] text-[12px] font-semibold uppercase tracking-wide mb-3">
                      {post.category}
                    </div>
                    <h3 className="text-[20px] font-semibold text-[#1D1D1F] mb-2 leading-tight group-hover:text-[#F26522] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-[16px] text-[#424245] leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#EBEBEB]">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-[#F26522] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-[12px]">
                          {post.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-[#1D1D1F] text-[14px]">
                          {post.author}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[#86868B] text-[14px]">
                        {post.readTime}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Email Subscription */}
      <section className="py-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-gradient-to-br from-[rgba(242,101,34,0.05)] to-[rgba(242,101,34,0.02)] border border-[#EBEBEB] rounded-[16px] p-12 text-center">
            <h2 className="text-[32px] font-bold text-[#1D1D1F] mb-4">
              Stay in the loop
            </h2>
            <p className="text-[20px] text-[#424245] mb-8 max-w-2xl mx-auto">
              Get the latest insights on AI-powered networking delivered to your
              inbox.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                placeholder="Enter your email"
                className="flex-1 h-11 px-4 bg-white border border-[#EBEBEB] rounded-lg"
              />
              <Button className="bg-[#F26522] hover:bg-[#E85A17] text-white px-6 h-11 rounded-lg font-medium">
                Subscribe
              </Button>
            </div>

            <p className="text-[14px] text-[#86868B] mt-4">
              No spam. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#EBEBEB] py-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-[#F26522] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🦁</span>
                </div>
                <span className="text-[20px] font-bold text-[#1D1D1F]">
                  leo
                </span>
              </div>
              <p className="text-[#424245] text-[14px] leading-relaxed">
                AI-powered business cards for modern professionals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#1D1D1F] mb-4 text-[16px]">
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-[#424245] hover:text-[#1D1D1F] transition-colors text-[14px]"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <button
                    // onClick={onNavigateToPricing}
                    className="text-[#424245] hover:text-[#1D1D1F] transition-colors text-[14px]"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <a
                    href="#templates"
                    className="text-[#424245] hover:text-[#1D1D1F] transition-colors text-[14px]"
                  >
                    Templates
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#1D1D1F] mb-4 text-[16px]">
                Company
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    // onClick={onNavigateToAbout}
                    className="text-[#424245] hover:text-[#1D1D1F] transition-colors text-[14px]"
                  >
                    About
                  </button>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-[#424245] hover:text-[#1D1D1F] transition-colors text-[14px]"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#careers"
                    className="text-[#424245] hover:text-[#1D1D1F] transition-colors text-[14px]"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#1D1D1F] mb-4 text-[16px]">
                Resources
              </h4>
              <ul className="space-y-2">
                <li>
                  <span className="text-[#1D1D1F] font-medium text-[14px]">
                    Blog
                  </span>
                </li>
                <li>
                  <a
                    href="#help"
                    className="text-[#424245] hover:text-[#1D1D1F] transition-colors text-[14px]"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#api"
                    className="text-[#424245] hover:text-[#1D1D1F] transition-colors text-[14px]"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#EBEBEB] mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#86868B] text-[14px]">
              © 2024 Leo. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="/privacy"
                className="text-[#86868B] hover:text-[#424245] transition-colors text-[14px]"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="text-[#86868B] hover:text-[#424245] transition-colors text-[14px]"
              >
                Terms
              </a>
              <a
                href="/cookies"
                className="text-[#86868B] hover:text-[#424245] transition-colors text-[14px]"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );

  // Individual Blog Post Component
  const BlogPost = () => {
    if (!selectedPost) return null;

    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        {/* Header */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#EBEBEB] h-20">
          <div className="max-w-[1200px] mx-auto px-6 h-full">
            <div className="flex justify-between items-center h-full">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#F26522] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🦁</span>
                </div>
                <span className="text-[32px] font-bold text-[#1D1D1F] tracking-tight">
                  leo
                </span>
              </div>

              <div className="hidden md:flex items-center space-x-8">
                <button
                  // onClick={onNavigateToHome}
                  className="text-[16px] font-medium text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={handleBackToBlog}
                  className="text-[16px] font-medium text-[#1D1D1F]"
                >
                  Blog
                </button>
              </div>

              <Button
                variant="ghost"
                // onClick={onGetStarted}
                className="text-[#F26522] hover:text-[#E85A17] font-medium"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </nav>

        {/* Back Button */}
        <div className="pt-8 pb-4 px-6">
          <div className="max-w-[720px] mx-auto">
            <button
              onClick={handleBackToBlog}
              className="flex items-center space-x-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors text-[14px] font-medium"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Blog</span>
            </button>
          </div>
        </div>

        {/* Article Hero */}
        <article className="pt-8 pb-20 px-6">
          <div className="max-w-[720px] mx-auto">
            <div className="mb-8">
              <div className="inline-block px-3 py-1 bg-[rgba(242,101,34,0.1)] text-[#F26522] rounded-[12px] border border-[rgba(242,101,34,0.2)] text-[12px] font-semibold uppercase tracking-wide mb-6">
                {selectedPost.category}
              </div>

              <h1 className="text-[48px] font-bold text-[#1D1D1F] mb-6 leading-tight tracking-tight">
                {selectedPost.title}
              </h1>

              <p className="text-[20px] text-[#424245] mb-8 leading-relaxed">
                {selectedPost.excerpt}
              </p>

              <div className="flex items-center justify-between pb-8 border-b border-[#EBEBEB]">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#F26522] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-[16px]">
                      {selectedPost.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1D1D1F] text-[16px]">
                      {selectedPost.author}
                    </p>
                    <p className="text-[#86868B] text-[14px]">
                      {selectedPost.authorRole}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[#86868B] text-[14px]">
                    {selectedPost.date}
                  </p>
                  <p className="text-[#86868B] text-[14px]">
                    {selectedPost.readTime}
                  </p>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="mb-12">
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                className="w-full aspect-[16/9] object-cover rounded-[12px] shadow-sm"
              />
            </div>

            {/* Article Body */}
            <div className="prose prose-lg max-w-none">
              <div className="space-y-8 text-[18px] leading-[1.7] text-[#424245]">
                <p>
                  The landscape of professional networking has undergone a
                  dramatic transformation in recent years. What once required
                  exchanging paper business cards at industry events now happens
                  seamlessly through digital platforms that understand context,
                  remember details, and facilitate meaningful connections.
                </p>

                <p>
                  This shift isn't just about convenience—it's about creating
                  more authentic, lasting professional relationships. When AI
                  handles the logistics of networking, professionals can focus
                  on what matters most: building genuine connections and
                  exploring collaborative opportunities.
                </p>

                <h2 className="text-[32px] font-bold text-[#1D1D1F] mt-12 mb-6 leading-tight">
                  The Evolution of Digital Networking
                </h2>

                <p>
                  Traditional networking often felt transactional. You'd meet
                  someone, exchange cards, and hope to remember why you
                  connected when you found their card weeks later. Digital
                  networking powered by AI changes this entire dynamic.
                </p>

                <blockquote className="border-l-4 border-[#F26522] pl-6 py-4 my-8 bg-[rgba(242,101,34,0.02)]">
                  <p className="text-[24px] font-medium text-[#1D1D1F] italic leading-relaxed">
                    "The future of networking isn't about collecting
                    contacts—it's about nurturing relationships with
                    intelligence and intention."
                  </p>
                </blockquote>

                <p>
                  Modern professionals need tools that understand context. When
                  you meet someone at a conference, your AI assistant should
                  remember not just their contact information, but the
                  conversation you had, the projects they mentioned, and the
                  follow-up actions you discussed.
                </p>

                <h2 className="text-[32px] font-bold text-[#1D1D1F] mt-12 mb-6 leading-tight">
                  Intelligence That Actually Helps
                </h2>

                <p>
                  The key difference between traditional contact management and
                  AI-powered networking lies in contextual intelligence. Instead
                  of storing static information, modern systems learn from your
                  interactions and provide relevant insights when you need them.
                </p>

                <div className="bg-[#F5F5F7] rounded-[8px] p-6 my-8">
                  <pre className="font-mono text-[14px] text-[#424245] overflow-auto">
                    <code>{`// Example: AI-powered contact insights
const contactInsight = {
  person: "Sarah Chen",
  lastMeeting: "TechConf 2024",
  context: "Discussed AI automation for product teams",
  followUp: "Send demo video by Friday",
  interests: ["Product management", "AI tools", "Team efficiency"],
  suggestedActions: [
    "Share case study on AI implementation",
    "Introduce to engineering team lead",
    "Schedule demo call within 2 weeks"
  ]
}`}</code>
                  </pre>
                </div>

                <p>
                  This level of intelligence transforms how you approach
                  professional relationships. Instead of generic follow-ups, you
                  can reference specific conversations, share relevant
                  resources, and make meaningful introductions based on actual
                  interests and needs.
                </p>

                <h2 className="text-[32px] font-bold text-[#1D1D1F] mt-12 mb-6 leading-tight">
                  Building for the Future
                </h2>

                <p>
                  As we look ahead, the most successful professionals will be
                  those who embrace AI-powered networking not as a replacement
                  for human connection, but as an enhancement to it. The
                  technology handles the administrative burden so you can focus
                  on building authentic relationships.
                </p>

                <p>
                  The future of professional networking is here, and it's more
                  human than ever—precisely because AI handles everything else.
                </p>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center justify-between pt-12 mt-12 border-t border-[#EBEBEB]">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <BookmarkPlus className="h-4 w-4" />
                  <span>Save</span>
                </Button>
              </div>

              <Button
                onClick={handleBackToBlog}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <span>More Articles</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        <section className="py-16 bg-white border-t border-[#EBEBEB]">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-[32px] font-bold text-[#1D1D1F] mb-8 text-center">
              Related Articles
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {posts.slice(0, 3).map((post) => (
                <Card
                  key={post.id}
                  className="overflow-hidden border border-[#EBEBEB] rounded-[16px] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                  onClick={() => handlePostClick(post)}
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="inline-block px-3 py-1 bg-[rgba(242,101,34,0.1)] text-[#F26522] rounded-[12px] border border-[rgba(242,101,34,0.2)] text-[12px] font-semibold uppercase tracking-wide mb-3">
                      {post.category}
                    </div>
                    <h3 className="text-[20px] font-semibold text-[#1D1D1F] mb-2 leading-tight group-hover:text-[#F26522] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-[16px] text-[#424245] leading-relaxed line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>
                    <p className="text-[#86868B] text-[14px]">
                      {post.readTime}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-[#EBEBEB] py-12">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-[#F26522] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🦁</span>
                </div>
                <span className="text-[20px] font-bold text-[#1D1D1F]">
                  leo
                </span>
              </div>
              <p className="text-[#424245] text-[14px] mb-6">
                AI-powered business cards for modern professionals.
              </p>
              <div className="flex justify-center space-x-6">
                <a
                  href="/privacy"
                  className="text-[#86868B] hover:text-[#424245] transition-colors text-[14px]"
                >
                  Privacy
                </a>
                <a
                  href="/terms"
                  className="text-[#86868B] hover:text-[#424245] transition-colors text-[14px]"
                >
                  Terms
                </a>
                <button
                  onClick={handleBackToBlog}
                  className="text-[#86868B] hover:text-[#424245] transition-colors text-[14px]"
                >
                  Blog
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  };

  return currentView === "homepage" ? <BlogHomepage /> : <BlogPost />;
}
