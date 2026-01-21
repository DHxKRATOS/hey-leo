import React from 'react'
import { ArrowRight, Sparkles, Bot, MessageCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { DigitalBusinessCard } from './about/DigitalBusinessCard'
import { aiCoFounders, idealCTO, founderContacts } from '../../utils/aboutPageConstants'

interface AboutPageProps {
  onGetStarted: () => void
  onLogin: () => void
  onNavigateToHome: () => void
  onNavigateToPricing?: () => void
  onNavigateToBlog?: () => void
}

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2"
              // onClick={onNavigateToHome} 
              style={{ cursor: 'pointer' }}>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">🦁</span>
              </div>
              <span className="text-2xl font-bold text-foreground tracking-tight">leo</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button
                // onClick={onNavigateToHome}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </button>
              <span className="text-foreground font-medium">About</span>
              <button
                // onClick={onNavigateToPricing}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </button>
              <button
                // onClick={onNavigateToBlog}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </button>
              <button
                // onClick={onLogin}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </button>
              <Button
                // onClick={onGetStarted} 
                className="bg-primary hover:bg-primary-hover text-primary-foreground">
                Join Beta
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                //  onClick={onGetStarted} 
                size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                Join Beta
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-12">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 mb-4">
              🦁 Experience Leo Through Our Digital Business Cards
            </Badge>
            <h1
              className="mb-6"
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family)',
                lineHeight: 'var(--leading-3xl)',
                letterSpacing: 'var(--tracking-tight)'
              }}
            >
              Meet Our Team
            </h1>
            <p
              className="max-w-3xl mx-auto mb-8"
              style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-family)',
                lineHeight: 'var(--leading-lg)'
              }}
            >
              Every card below is a live demonstration of Leo's digital business card platform.
              <strong> Click "Ask AI" on any card to experience our intelligent assistants</strong> - each one has been trained for different purposes.
            </p>

            {/* Feature Highlights */}
            <div className="flex justify-center items-center space-x-8 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-gray-700">AI Chat</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-success" />
                </div>
                <span className="text-sm font-medium text-gray-700">Live Demo</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-info/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-info" />
                </div>
                <span className="text-sm font-medium text-gray-700">Interactive</span>
              </div>
            </div>

            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  color: '#C2410C',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                Try the AI chat on each card to see Leo's capabilities in action
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="mb-4"
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family)',
                lineHeight: 'var(--leading-2xl)',
                letterSpacing: 'var(--tracking-tight)'
              }}
            >
              Founder & CEO
            </h2>
            <p
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-family)'
              }}
            >
              Experience executive-level networking • AI trained for professional connections
            </p>
          </div>

          <div className="flex justify-center">
            <DigitalBusinessCard
              name="Vipin Thomas"
              role="Founder & CEO"
              company="leo"
              location="San Francisco, CA"
              bio="Serial entrepreneur passionate about transforming professional networking through AI. Previously built and scaled multiple tech startups, obsessed with creating tools that feel magical yet practical."
              profileImage="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"
              status="online"
              skills={['Product Strategy', 'AI Innovation', 'Entrepreneurship', 'Team Building']}
              contacts={founderContacts}
              achievements="Led leo to 10,000+ beta users, featured in TechCrunch for AI innovation in networking"
              purpose="networking"
            />
          </div>
        </div>
      </section>

      {/* Co-founder Recruitment Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-surface/30 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-warning/10 text-warning border-warning/20 px-3 py-1 mb-4">
              🔍 We're Actively Hiring
            </Badge>
            <h2
              className="mb-4"
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family)',
                lineHeight: 'var(--leading-2xl)',
                letterSpacing: 'var(--tracking-tight)'
              }}
            >
              Co-founder & CTO Position
            </h2>
            <p
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-family)'
              }}
            >
              Experience recruitment redefined • AI trained to help you apply and learn about the role
            </p>
          </div>

          <div className="flex justify-center">
            <DigitalBusinessCard
              name="Your Name Here"
              role="Co-founder & CTO"
              company="leo"
              location="San Francisco or Remote"
              bio="The technical visionary we're seeking to architect the future of professional networking. Someone who understands that great technology serves human connection."
              status="hiring"
              skills={['Full-Stack Engineering', 'AI/ML Systems', 'Product Architecture', 'Team Leadership']}
              contacts={idealCTO.contacts}
              achievements="Join us in building the future of AI-powered professional networking"
              requirements={idealCTO.requirements}
              benefits={idealCTO.benefits}
              purpose="recruitment"
            />
          </div>
        </div>
      </section>

      {/* AI Co-founders Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-info/10 text-info border-info/20 px-3 py-1 mb-4">
              🤖 Our AI Team
            </Badge>
            <h2
              className="mb-4"
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family)',
                lineHeight: 'var(--leading-2xl)',
                letterSpacing: 'var(--tracking-tight)'
              }}
            >
              AI Co-founders
            </h2>
            <p
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-family)'
              }}
            >
              Meet the AI tools powering Leo • Each trained to showcase their unique contributions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {aiCoFounders.map((cofounder, index) => (
              <div key={cofounder.id} className="flex justify-center">
                <DigitalBusinessCard
                  name={cofounder.name}
                  role={cofounder.role}
                  company={cofounder.company}
                  location={cofounder.location}
                  bio={cofounder.bio}
                  status="ai"
                  skills={cofounder.skills}
                  contacts={cofounder.contacts}
                  achievements={cofounder.achievements}
                  purpose="ai-showcase"
                  isAI={true}
                />
              </div>
            ))}
          </div>

          {/* Bottom Message */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-surface border border-border rounded-full shadow-sm">
              <span className="text-lg">🦁</span>
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                Building the future together • Human + AI collaboration
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Demonstration Explanation */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-light/20 via-background to-primary-light/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="mb-6"
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family)',
                lineHeight: 'var(--leading-2xl)',
                letterSpacing: 'var(--tracking-tight)'
              }}
            >
              What You Just Experienced
            </h2>
            <p
              className="mb-8"
              style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-family)',
                lineHeight: 'var(--leading-lg)'
              }}
            >
              Every interaction above demonstrates Leo's core capabilities.
              This is exactly what you get when you create your own digital business card.
            </p>
          </div>

          {/* What Users Get */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3
                    className="mb-2"
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family)'
                    }}
                  >
                    AI Assistant for Every Card
                  </h3>
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-family)',
                      lineHeight: 'var(--leading-sm)'
                    }}
                  >
                    Your card gets a trained AI that answers questions 24/7, schedules meetings, and represents you professionally
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3
                    className="mb-2"
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family)'
                    }}
                  >
                    Purpose-Built for Your Needs
                  </h3>
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-family)',
                      lineHeight: 'var(--leading-sm)'
                    }}
                  >
                    Whether for networking, recruitment, or showcasing expertise - your AI adapts to your specific goals
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-info/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-info" />
                </div>
                <div>
                  <h3
                    className="mb-2"
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family)'
                    }}
                  >
                    Professional Design System
                  </h3>
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-family)',
                      lineHeight: 'var(--leading-sm)'
                    }}
                  >
                    Beautiful templates, expandable details, and premium design that makes the right impression
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3
                    className="mb-2"
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family)'
                    }}
                  >
                    Instant Sharing & Networking
                  </h3>
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-family)',
                      lineHeight: 'var(--leading-sm)'
                    }}
                  >
                    QR codes, contact saving, social sharing, and real-time status - everything needed for modern networking
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              // onClick={onGetStarted}
              size="lg"
              className="px-8 py-3 text-base hover-lift"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-primary-foreground)',
                fontFamily: 'var(--font-family)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              Create Your AI-Powered Business Card
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p
              className="mt-4"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-tertiary)',
                fontFamily: 'var(--font-family)'
              }}
            >
              🚀 Join 12,000+ professionals already networking smarter with Leo
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4"
                // onClick={onNavigateToHome}
                style={{ cursor: 'pointer' }}>
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">🦁</span>
                </div>
                <span className="text-xl font-bold text-text-primary">leo</span>
              </div>
              <p className="text-text-secondary text-sm">
                AI-powered business cards and personal assistant for modern professionals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-text-primary mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><a href="#features" className="hover:text-text-primary transition-colors">Features</a></li>
                <li><button
                  // onClick={onNavigateToPricing}
                  className="hover:text-text-primary transition-colors">Pricing</button></li>
                <li><a href="#roadmap" className="hover:text-text-primary transition-colors">Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-text-primary mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><span className="text-text-primary">About</span></li>
                <li><a href="#contact" className="hover:text-text-primary transition-colors">Contact</a></li>
                <li><a href="#careers" className="hover:text-text-primary transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-text-primary mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><button
                  // onClick={onNavigateToBlog}
                  className="hover:text-text-primary transition-colors">Blog</button></li>
                <li><a href="#help" className="hover:text-text-primary transition-colors">Help Center</a></li>
                <li><a href="#api" className="hover:text-text-primary transition-colors">API Docs</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-text-tertiary text-sm">
              © 2024 leo. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#privacy" className="text-text-tertiary hover:text-text-secondary transition-colors text-sm">Privacy</a>
              <a href="#terms" className="text-text-tertiary hover:text-text-secondary transition-colors text-sm">Terms</a>
              <a href="#cookies" className="text-text-tertiary hover:text-text-secondary transition-colors text-sm">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}