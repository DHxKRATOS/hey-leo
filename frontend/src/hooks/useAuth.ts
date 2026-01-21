import { useState, useEffect } from 'react'
import { getSupabaseClient } from '../utils/supabase/client'
import { mockBackend } from '../utils/mockBackendService'
import { User, UserProfile } from '../types'

// Get mock client (no real Supabase calls)
const supabase = getSupabaseClient()

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSuccess, setAuthSuccess] = useState<string | null>(null)
  const [creatingDemo, setCreatingDemo] = useState(false)
  const [demoMode, setDemoMode] = useState(false)

  const createMockProfile = (userId: string, email: string, name: string): UserProfile => ({
    id: userId,
    email,
    name,
    plan: 'free',
    cards_count: 2,
    contacts_count: 15,
    ai_credits: {
      used: 234,
      limit: 1000
    }
  })

  const fetchUserProfile = async (accessToken: string, userData?: any) => {
    try {
      // Always use mock backend - no external calls
      const profile = await mockBackend.getUserProfile(accessToken)
      if (profile) {
        const enhancedProfile = {
          ...profile,
          name: profile.full_name,
          plan: profile.subscription_tier,
          ai_credits: profile.ai_credits
        }
        setUserProfile(enhancedProfile)
        return
      }

      const currentUser = userData || user
      if (currentUser) {
        const fallbackProfile = createMockProfile(currentUser.id, currentUser.email, currentUser.name)
        setUserProfile(fallbackProfile)
      }
    } catch (error) {
      const currentUser = userData || user
      if (currentUser) {
        const fallbackProfile = createMockProfile(currentUser.id, currentUser.email, currentUser.name)
        setUserProfile(fallbackProfile)
      }
    }
  }

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        return
      }
      
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!.split('@')[0]
        }
        setUser(userData)
        await fetchUserProfile(session.access_token, userData)
      }
    } catch (error) {
      // This is expected behavior for mock client, don't treat as error
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (email: string, password: string) => {
    try {
      setAuthError(null)
      setAuthSuccess(null)
      
      // Use mock client - no real Supabase calls
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      })
      
      if (error) {
        // Provide user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email or password is incorrect. Please check your credentials or create a new account.')
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email address before signing in.')
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Too many sign-in attempts. Please wait a moment and try again.')
        } else if (error.message.includes('User not found')) {
          throw new Error('No account found with this email address. Please create a new account.')
        }
        
        throw new Error(error.message)
      }
      
      if (!data.user) {
        throw new Error('Sign in failed. Please try again.')
      }
      
      // Success will be handled by the auth state change listener
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
      setAuthError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const handleSignUp = async (email: string, password: string, name: string) => {
    try {
      setAuthError(null)
      setAuthSuccess(null)
      
      if (!email || !password || !name) {
        throw new Error('Please fill in all fields')
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long')
      }
      
      // Use mock client only - no external API calls
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { name }
        }
      })
      
      if (error) {
        // Provide user-friendly error messages
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.')
        }
        if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.')
        }
        if (error.message.includes('Password should be at least 6 characters')) {
          throw new Error('Password must be at least 6 characters long.')
        }
        throw new Error(error.message)
      }
      
      if (data.user) {
        setAuthSuccess('Account created successfully! Welcome to Leo!')
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Account creation failed'
      setAuthError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const handleDemoMode = async () => {
    try {
      setCreatingDemo(true)
      setAuthError(null)
      setAuthSuccess(null)
      
      const demoUser = {
        id: 'demo-' + Date.now(),
        email: 'taylor.morgan@creative-studio.co',
        name: 'Taylor Morgan'
      }
      
      const demoProfile = createMockProfile(demoUser.id, demoUser.email, demoUser.name)
      
      setDemoMode(true)
      setUser(demoUser)
      setUserProfile(demoProfile)
      setAuthSuccess('Demo mode activated! You can now explore Leo.')
      
    } catch (error) {
      setAuthError('Failed to enter demo mode. Please try creating a regular account.')
    } finally {
      setCreatingDemo(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setAuthSuccess(null)
      
      if (demoMode) {
        setUser(null)
        setUserProfile(null)
        setDemoMode(false)
      } else {
        await supabase.auth.signOut()
      }
    } catch (error) {
      // Reset state even if mock client throws
      setUser(null)
      setUserProfile(null)
      setDemoMode(false)
    }
  }

  useEffect(() => {
    checkAuth()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!.split('@')[0]
        }
        setUser(userData)
        setAuthError(null)
        setAuthSuccess('Successfully signed in!')
        await fetchUserProfile(session.access_token, userData)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setUserProfile(null)
        setAuthError(null)
        setAuthSuccess(null)
        setDemoMode(false)
      }
    })

    return () => subscription.unsubscribe()
  }, []) // Removed dependencies to prevent infinite loops

  return {
    user,
    userProfile,
    loading,
    authError,
    authSuccess,
    creatingDemo,
    demoMode,
    setUserProfile,
    setAuthError,
    setAuthSuccess,
    handleSignIn,
    handleSignUp,
    handleDemoMode,
    handleSignOut
  }
}