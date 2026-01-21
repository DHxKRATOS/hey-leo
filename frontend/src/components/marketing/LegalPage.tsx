import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'cookies'
  onBack: () => void
  onGetStarted: () => void
  onLogin: () => void
  onNavigateToHome?: () => void
  onNavigateToPricing?: () => void
  onNavigateToBlog?: () => void
  onNavigateToPrivacy?: () => void
  onNavigateToTerms?: () => void
  onNavigateToCookies?: () => void
}

export function LegalPage({ 
  type, 
  onBack, 
  onGetStarted, 
  onLogin, 
  onNavigateToHome,
  onNavigateToPricing,
  onNavigateToBlog,
  onNavigateToPrivacy,
  onNavigateToTerms,
  onNavigateToCookies 
}: LegalPageProps) {
  const getContent = () => {
    switch (type) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          lastUpdated: 'March 1, 2024',
          content: [
            {
              section: 'Information We Collect',
              content: 'We collect information you provide directly to us, such as when you create an account, update your profile, or contact us. This includes your name, email address, professional information, and any content you upload to train your AI assistant.'
            },
            {
              section: 'How We Use Your Information',
              content: 'We use the information we collect to provide, maintain, and improve our services, including training your personal AI assistant, generating responses to visitors, and providing customer support.'
            },
            {
              section: 'Data Security',
              content: 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is encrypted both in transit and at rest.'
            },
            {
              section: 'Data Retention',
              content: 'We retain your personal information for as long as your account is active or as needed to provide you services. You can request deletion of your data at any time through your account settings.'
            },
            {
              section: 'Third-Party Services',
              content: 'We may use third-party services to help us operate our business and administer activities on our behalf. These third parties are bound by confidentiality agreements and are prohibited from using your personal information for any other purpose.'
            },
            {
              section: 'Your Rights',
              content: 'You have the right to access, update, or delete your personal information. You can also object to certain processing of your data and request data portability. Contact us to exercise these rights.'
            },
            {
              section: 'Contact Us',
              content: 'If you have any questions about this Privacy Policy, please contact us at privacy@heyleo.ai or through our support channels.'
            }
          ]
        }
      case 'terms':
        return {
          title: 'Terms of Service',
          lastUpdated: 'March 1, 2024',
          content: [
            {
              section: 'Acceptance of Terms',
              content: 'By accessing and using leo\'s services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
            },
            {
              section: 'Description of Service',
              content: 'leo provides AI-powered digital business cards and personal assistant services to help professionals network more effectively. Our services include AI conversation capabilities, contact management, and meeting preparation tools.'
            },
            {
              section: 'User Accounts',
              content: 'You must create an account to use our services. You are responsible for safeguarding your password and all activities that occur under your account. You must notify us immediately of any unauthorized uses of your account.'
            },
            {
              section: 'Acceptable Use',
              content: 'You agree not to use the service for any unlawful purposes or to conduct any unlawful activity, including but not limited to fraud, embezzlement, money laundering, or insider trading. You will not upload harmful, offensive, or inappropriate content.'
            },
            {
              section: 'Intellectual Property',
              content: 'The service and its original content, features, and functionality are owned by leo and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.'
            },
            {
              section: 'Payment Terms',
              content: 'Paid plans are billed in advance on a monthly or annual basis. All fees are non-refundable except as expressly stated in these terms. We reserve the right to change our pricing with 30 days notice.'
            },
            {
              section: 'Termination',
              content: 'We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever including breach of terms.'
            },
            {
              section: 'Limitation of Liability',
              content: 'In no event shall leo be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.'
            }
          ]
        }
      case 'cookies':
        return {
          title: 'Cookie Policy',
          lastUpdated: 'March 1, 2024',
          content: [
            {
              section: 'What Are Cookies',
              content: 'Cookies are small text files that are stored on your computer or mobile device when you visit our website. They help us remember your preferences and understand how you use our service.'
            },
            {
              section: 'How We Use Cookies',
              content: 'We use cookies to provide and improve our services, authenticate users, remember preferences, analyze usage patterns, and provide personalized content and advertisements.'
            },
            {
              section: 'Types of Cookies We Use',
              content: 'Essential cookies (required for basic functionality), Performance cookies (help us understand usage), Functional cookies (remember your preferences), and Marketing cookies (deliver relevant advertisements).'
            },
            {
              section: 'Third-Party Cookies',
              content: 'We may use third-party services like Google Analytics, which may set their own cookies. These services have their own privacy policies and cookie policies that govern their use of cookies.'
            },
            {
              section: 'Managing Cookies',
              content: 'You can control and manage cookies through your browser settings. However, disabling certain cookies may limit your ability to use some features of our service.'
            },
            {
              section: 'Cookie Consent',
              content: 'By using our website, you consent to our use of cookies as described in this policy. You can withdraw your consent at any time by changing your browser settings or contacting us.'
            },
            {
              section: 'Updates to This Policy',
              content: 'We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "last updated" date.'
            }
          ]
        }
    }
  }

  const { title, lastUpdated, content } = getContent()

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">🦁</span>
              </div>
              <span className="text-2xl font-bold text-text-primary tracking-tight">leo</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={onNavigateToHome}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Home
              </button>
              <a href="#product" className="text-text-secondary hover:text-text-primary transition-colors">Product</a>
              <button 
                onClick={onNavigateToPricing}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={onNavigateToBlog}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Blog
              </button>
              <button 
                onClick={onLogin}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Login
              </button>
              <Button onClick={onGetStarted} className="bg-primary hover:bg-primary-hover text-primary-foreground">
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-8 hover:bg-surface-hover"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-text-primary mb-4">{title}</h1>
            <p className="text-text-secondary">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* Content */}
          <Card className="p-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-text-secondary mb-8 leading-relaxed">
                This {title.toLowerCase()} explains how leo ("we," "our," or "us") collects, uses, and protects your information when you use our AI-powered digital business card and personal assistant services.
              </p>

              <div className="space-y-8">
                {content.map((section, index) => (
                  <div key={index}>
                    <h2 className="text-2xl font-semibold text-text-primary mb-4">
                      {index + 1}. {section.section}
                    </h2>
                    <p className="text-text-secondary leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Contact Information */}
              <div className="mt-12 p-6 bg-muted rounded-lg">
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Questions or Concerns?
                </h3>
                <p className="text-text-secondary mb-4">
                  If you have any questions about this {title.toLowerCase()} or our practices, please contact us:
                </p>
                <div className="space-y-2 text-sm text-text-secondary">
                  <p>Email: legal@heyleo.ai</p>
                  <p>Address: leo Inc., 123 Innovation Drive, San Francisco, CA 94105</p>
                  <p>Phone: +1 (555) 123-4567</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
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
                <li><a href="/#features" className="hover:text-text-primary transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-text-primary transition-colors">Pricing</a></li>
                <li><a href="#roadmap" className="hover:text-text-primary transition-colors">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><a href="#about" className="hover:text-text-primary transition-colors">About</a></li>
                <li><a href="#contact" className="hover:text-text-primary transition-colors">Contact</a></li>
                <li><a href="#affiliate" className="hover:text-text-primary transition-colors">Affiliate</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><a href="/blog" className="hover:text-text-primary transition-colors">Blog</a></li>
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
              <button 
                onClick={onNavigateToPrivacy}
                className="text-text-tertiary hover:text-text-secondary transition-colors text-sm"
              >
                Privacy
              </button>
              <button 
                onClick={onNavigateToTerms}
                className="text-text-tertiary hover:text-text-secondary transition-colors text-sm"
              >
                Terms
              </button>
              <button 
                onClick={onNavigateToCookies}
                className="text-text-tertiary hover:text-text-secondary transition-colors text-sm"
              >
                Cookies
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}