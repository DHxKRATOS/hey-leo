import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks'
import { clearError, signIn, signUp, socialAuth } from '../store/authSlice'
import { AuthPage } from './AuthPage'

export const AuthContainer: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoading, error } = useAppSelector((state) => state.auth)

  // Get the intended destination after login
  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    // Clear any existing errors when component mounts
    if (error) {
      dispatch(clearError())
    }
  }, [dispatch, error])

  const handleSignIn = async (email: string, password: string) => {
    try {
      await dispatch(signIn({ email, password })).unwrap()
      navigate(from, { replace: true })
    } catch (error) {
      // Error is handled by Redux slice
      throw error
    }
  }

  const handleSignUp = async (email: string, password: string, name: string) => {
    try {
      await dispatch(signUp({ email, password, name })).unwrap()
      // Redirect new users to onboarding first
      navigate('/onboarding', { replace: true })
    } catch (error) {
      // Error is handled by Redux slice
      throw error
    }
  }

  const handleSocialSignUp = async (provider: 'linkedin' | 'google', userData?: any) => {
    try {
      // If userData is provided, it means OAuth was successful and we have user info
      if (userData) {
        // Store the token and user data
        localStorage.setItem('token', userData.jwt || '')
        
        // Navigate based on whether user is new or existing
        if (userData.isNewUser) {
          navigate('/onboarding', { 
            replace: true,
            state: {
              socialImportData: {
                provider,
                importedData: userData.socialData,
              },
            }
          })
        } else {
          navigate('/dashboard', { replace: true })
        }
        return
      }

      // Fallback to Redux action if no userData provided
      const result = await dispatch(socialAuth({ provider, userData })).unwrap()
      navigate('/onboarding', { replace: true })
    } catch (error) {
      // Error is handled by Redux slice
      throw error
    }
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleNavigateToTerms = () => {
    navigate('/terms')
  }

  const handleNavigateToPrivacy = () => {
    navigate('/privacy')
  }

  return (
    <AuthPage
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      onSocialSignUp={handleSocialSignUp}
      onBack={handleBack}
      onNavigateToTerms={handleNavigateToTerms}
      onNavigateToPrivacy={handleNavigateToPrivacy}
    />
  )
}


