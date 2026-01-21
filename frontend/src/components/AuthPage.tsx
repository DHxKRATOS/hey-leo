import React, { useState } from 'react'
import { ArrowLeft, Eye, EyeOff, Github, Linkedin, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { Alert, AlertDescription } from './ui/alert'
import { OnboardingFlow } from './onboarding/OnboardingFlow'
import { oauthService, OAuthUser } from '../services/oauthService'

interface AuthPageProps {
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (email: string, password: string, name: string) => Promise<void>
  onSocialSignUp: (provider: 'linkedin' | 'google', userData?: any) => Promise<void>
  onShowOnboardingReview?: () => void
  onBack?: () => void
  onNavigateToTerms?: () => void
  onNavigateToPrivacy?: () => void
}

export function AuthPage({
  onSignIn,
  onSignUp,
  onSocialSignUp,
  // onShowOnboardingReview,
  onBack,
  onNavigateToTerms,
  onNavigateToPrivacy
}: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [isOnboardingFlowOpen, setIsOnboardingFlowOpen] = useState(false)
  const isDebugMode = window.location.hostname === 'localhost' || window.location.hostname.includes('figma')

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    // Email validation
    if (!email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }

    // Name validation for sign up
    if (isSignUp) {
      if (!name) {
        errors.name = 'Full name is required'
      } else if (name.trim().length < 2) {
        errors.name = 'Please enter your full name'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setValidationErrors({})

    if (!validateForm()) {
      return
    }

    // Check network connectivity
    if (!navigator.onLine) {
      setError('No internet connection. Please check your network and try again.')
      return
    }

    setIsLoading(true)

    try {
      if (isSignUp) {
        await onSignUp(email.trim(), password, name.trim())
      } else {
        await onSignIn(email.trim(), password)
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialAuth = async (provider: 'linkedin' | 'google') => {
    setError(null)
    setValidationErrors({})

    // Check network connectivity
    if (!navigator.onLine) {
      setError('No internet connection. Please check your network and try again.')
      return
    }

    setIsLoading(true)

    try {
      let user: OAuthUser
      
      if (provider === 'google') {
        user = await oauthService.signInWithGoogle()
      } else {
        user = await oauthService.signInWithLinkedIn()
      }

      // Pass the OAuth user data to the parent component
      await onSocialSignUp(provider, user)
    } catch (err: any) {
      console.error(`${provider} auth error:`, err)
      setError(err.message || `Failed to sign in with ${provider}. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTermsClick = () => {
    if (onNavigateToTerms) {
      onNavigateToTerms()
    } else {
      // Fallback for legacy behavior
      window.open('/terms', '_blank', 'noopener,noreferrer')
    }
  }

  const handlePrivacyClick = () => {
    if (onNavigateToPrivacy) {
      onNavigateToPrivacy()
    } else {
      // Fallback for legacy behavior
      window.open('/privacy', '_blank', 'noopener,noreferrer')
    }
  }

  const handleOnboardingFlow = () => {
    setIsOnboardingFlowOpen(true)
  }

  return (
    <div className="min-h-screen max-w-[1440px] mx-auto bg-background animate-fade-in flex">
      {/* Left Side - Benefits */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-center px-12 bg-gradient-to-br from-primary/5 to-primary/10">
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="absolute top-6 left-6 hover:bg-surface-hover"
            aria-label="Go back to home page"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        )}

        <div className="max-w-md">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">🦁</span>
            </div>
            <span className="text-3xl font-bold text-text-primary tracking-tight">Leo</span>
          </div>

          <h2 className="text-3xl font-bold text-text-primary mb-6 leading-tight">
            Your AI Assistant That Works 24/7
          </h2>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <h4 className="font-semibold text-text-primary mb-1">
                  AI Business Card
                </h4>
                <p className="text-text-secondary">
                  Answer visitor questions instantly while you sleep. Never miss a lead again.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <h4 className="font-semibold text-text-primary mb-1">
                  Personal AI Assistant
                </h4>
                <p className="text-text-secondary">
                  Get prepped for every meeting with context and talking points.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <h4 className="font-semibold text-text-primary mb-1">
                  One Link, Everything
                </h4>
                <p className="text-text-secondary">
                  Share your professional profile, let AI handle the rest.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-surface/50 rounded-lg border border-border">
            <p className="text-sm text-text-secondary italic">
              "My AI qualifies leads while I sleep. I've never had so many quality conversations with prospects."
            </p>
            <div className="flex items-center mt-3 space-x-2">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-semibold">SC</span>
              </div>
              <div className="text-xs">
                <span className="font-semibold text-text-primary">Sarah Chen</span>
                <span className="text-text-tertiary">, Sales Director</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20">
        {/* Mobile back button */}
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="lg:hidden self-start mb-8 hover:bg-surface-hover"
            aria-label="Go back to home page"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}

        <div className="w-full max-w-sm mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">🦁</span>
            </div>
            <span className="text-2xl font-bold text-text-primary tracking-tight">Leo</span>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">
              {isSignUp ? 'Request Beta Access' : 'Welcome back'}
            </h1>
            <p className="text-text-secondary text-sm">
              {isSignUp
                ? 'Join our private beta and be among the first to experience Leo'
                : 'Sign in to your Leo account'
              }
            </p>
          </div>

          {error && (
            <Alert className="mb-6 border-error/20 bg-error/5">
              <AlertCircle className="h-4 w-4 text-error" />
              <AlertDescription className="text-error">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Social Auth */}
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              onClick={() => handleSocialAuth('linkedin')}
              // disabled={isLoading}
              disabled={true}
              className="w-full justify-center hover-lift"
              aria-label="Continue with LinkedIn"
            >
              <Linkedin className="w-4 h-4 mr-2" />
              Continue with LinkedIn
            </Button>

            <Button
              variant="outline"
              onClick={() => handleSocialAuth('google')}
              // disabled={isLoading}
              disabled={true}
              className="w-full justify-center hover-lift"
              aria-label="Continue with Google"
            >
              <Mail className="w-4 h-4 mr-2" />
              Continue with Google
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-text-tertiary">or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {isSignUp && (
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (validationErrors.name) {
                      setValidationErrors(prev => ({ ...prev, name: '' }))
                    }
                  }}
                  required
                  className={`mt-1 ${validationErrors.name ? 'border-error focus:border-error' : ''}`}
                  placeholder="John Doe"
                  aria-invalid={!!validationErrors.name}
                  aria-describedby={validationErrors.name ? 'name-error' : undefined}
                />
                {validationErrors.name && (
                  <p id="name-error" className="text-sm text-error mt-1" role="alert">
                    {validationErrors.name}
                  </p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (validationErrors.email) {
                    setValidationErrors(prev => ({ ...prev, email: '' }))
                  }
                }}
                required
                className={`mt-1 ${validationErrors.email ? 'border-error focus:border-error' : ''}`}
                placeholder="john@company.com"
                aria-invalid={!!validationErrors.email}
                aria-describedby={validationErrors.email ? 'email-error' : undefined}
              />
              {validationErrors.email && (
                <p id="email-error" className="text-sm text-error mt-1" role="alert">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (validationErrors.password) {
                      setValidationErrors(prev => ({ ...prev, password: '' }))
                    }
                  }}
                  required
                  className={`pr-10 ${validationErrors.password ? 'border-error focus:border-error' : ''}`}
                  placeholder="Enter your password"
                  aria-invalid={!!validationErrors.password}
                  aria-describedby={validationErrors.password ? 'password-error' : 'password-requirements'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-tertiary hover:text-text-secondary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p id="password-error" className="text-sm text-error mt-1" role="alert">
                  {validationErrors.password}
                </p>
              )}
              {isSignUp && !validationErrors.password && (
                <p id="password-requirements" className="text-xs text-text-tertiary mt-1">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground hover-lift"
              disabled={isLoading}
              aria-label={isLoading ? 'Please wait...' : (isSignUp ? 'Request Beta Access' : 'Sign In')}
            >
              {isLoading ? 'Please wait...' : (isSignUp ? 'Request Beta Access' : 'Sign In')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setValidationErrors({})
                setEmail('')
                setPassword('')
                setName('')
              }}
              className="text-text-secondary hover:text-text-primary transition-colors text-sm underline"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'New to Leo? Request beta access'}
            </button>
          </div>

          {/* Onboarding Review for Debug Mode */}
          {isDebugMode && (
            <div className="mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={handleOnboardingFlow}
                className="w-full text-sm hover-lift"
                aria-label="Preview onboarding flow (debug mode only)"
              >
                🔍 Preview Onboarding Flow
              </Button>
            </div>
          )}
          <OnboardingFlow isOpen={isOnboardingFlowOpen} onComplete={function (userData: any, action?: 'edit-card' | 'dashboard'): void {
            throw new Error('Function not implemented.')
          }} onClose={() => setIsOnboardingFlowOpen(false)} />
          <div className="mt-8 text-center">
            <p className="text-xs text-text-tertiary">
              By continuing, you agree to our{' '}
              <button
                onClick={handleTermsClick}
                className="text-primary hover:text-primary-hover underline"
                aria-label="Read Terms of Service"
              >
                Terms of Service
              </button>
              {' '}and{' '}
              <button
                onClick={handlePrivacyClick}
                className="text-primary hover:text-primary-hover underline"
                aria-label="Read Privacy Policy"
              >
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}