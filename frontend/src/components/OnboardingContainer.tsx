import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { OnboardingFlow } from './onboarding/OnboardingFlow'

export const OnboardingContainer: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Get social import data from navigation state
  const socialImportData = location.state?.socialImportData || null

  const handleComplete = (userData: any, action?: 'edit-card' | 'dashboard') => {
    // After completing onboarding, redirect to dashboard
    navigate('/dashboard', { replace: true })
  }

  const handleClose = () => {
    // If user closes onboarding, redirect to dashboard
    navigate('/dashboard', { replace: true })
  }

  return (
    <OnboardingFlow
      isOpen={true}
      onComplete={handleComplete}
      onClose={handleClose}
      socialImportData={socialImportData}
    />
  )
}
