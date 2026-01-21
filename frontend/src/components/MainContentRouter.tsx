import React from 'react'
import { Dashboard } from './Dashboard'
import { TemplateSelectionPage } from './TemplateSelectionPage'
import { CardWorkspace } from './CardWorkspace'
import { AirtableContactsPage } from './AirtableContactsPage'
import { AnalyticsPage } from './AnalyticsPage'
import { BillingPage } from './BillingPage'
import { SettingsPage } from './SettingsPage'

import { AppPage, WorkspaceModule } from '../hooks/useNavigation'

interface MainContentRouterProps {
  currentPage: AppPage
  selectedCard: any
  selectedTemplate: any
  workspaceModule: WorkspaceModule
  settingsSection?: string
  user: any
  userProfile: any
  onNavigateToWorkspace: (card?: any, template?: any, module?: WorkspaceModule) => void
  onTemplateSelect: (template: any) => void
  onStartBlank: () => void
  onModuleChange: (module: WorkspaceModule) => void
  onBack: () => void
  onNavigate: (page: AppPage) => void
  setUserProfile: (profile: any) => void
  navigationContext?: {
    type: 'personal' | 'company' | 'event'
    id?: string
    name?: string
  }
  onSetEventContext?: (eventId: string, eventName: string) => void
}

export function MainContentRouter({
  currentPage,
  selectedCard,
  selectedTemplate,
  workspaceModule,
  settingsSection,
  user,
  userProfile,
  onNavigateToWorkspace,
  onTemplateSelect,
  onStartBlank,
  onModuleChange,
  onBack,
  onNavigate,
  setUserProfile,
  navigationContext,
  onSetEventContext
}: MainContentRouterProps) {
  const renderPage = () => {
    switch (currentPage) {
      case 'cards':
        return (
          <Dashboard 
            user={user}
            userProfile={userProfile}
            onNavigateToWorkspace={onNavigateToWorkspace}
            onNavigate={onNavigate}
            navigationContext={navigationContext}
          />
        )

      case 'templates':
        return (
          <TemplateSelectionPage
            onBack={onBack}
            onTemplateSelect={onTemplateSelect}
            onStartBlank={onStartBlank}
          />
        )

      case 'workspace':
        return (
          <CardWorkspace
            selectedCard={selectedCard}
            selectedTemplate={selectedTemplate}
            activeModule={workspaceModule}
            user={user}
            userProfile={userProfile}
            onModuleChange={onModuleChange}
            onBack={onBack}
          />
        )

      case 'contacts':
        return (
          <AirtableContactsPage 
            user={user}
            navigationContext={navigationContext}
          />
        )

      case 'analytics':
        return (
          <AnalyticsPage 
            user={user}
            navigationContext={navigationContext}
          />
        )

      case 'billing':
        return <BillingPage />

      case 'settings':
        return (
          <SettingsPage 
            user={user}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            initialSection={settingsSection}
          />
        )

      default:
        return (
          <Dashboard 
            user={user}
            userProfile={userProfile}
            onNavigateToWorkspace={onNavigateToWorkspace}
            onNavigate={onNavigate}
            navigationContext={navigationContext}
          />
        )
    }
  }

  return (
    <div className="relative">
      {renderPage()}
    </div>
  )
}