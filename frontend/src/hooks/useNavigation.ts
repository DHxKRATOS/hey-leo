import { useState } from 'react'

export type AppPage = 'cards' | 'templates' | 'workspace' | 'contacts' | 'analytics' | 'billing' | 'settings'
export type WorkspaceModule = 'build' | 'train' | 'improve'
// Simplified for MVP - removed context switching
export function useNavigation() {
  const [currentPage, setCurrentPage] = useState<AppPage>('cards')
  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [workspaceModule, setWorkspaceModule] = useState<WorkspaceModule>('build')
  const [settingsSection, setSettingsSection] = useState<string>('profile')

  const handleNavigate = (page: AppPage, section?: string) => {
    setCurrentPage(page)
    
    // Handle settings section navigation
    if (page === 'settings' && section) {
      setSettingsSection(section)
    } else if (page === 'settings' && !section) {
      setSettingsSection('profile')
    }
    
    // Reset workspace state when navigating away
    if (page !== 'workspace') {
      setSelectedCard(null)
      setSelectedTemplate(null)
      setWorkspaceModule('build')
    }
  }

  const navigateToWorkspace = (card?: any, template?: any, module: WorkspaceModule = 'build') => {
    setSelectedCard(card)
    setSelectedTemplate(template)
    setWorkspaceModule(module)
    setCurrentPage('workspace')
  }

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template)
    navigateToWorkspace(null, template, 'build')
  }

  const handleStartBlank = () => {
    setSelectedTemplate(null)
    navigateToWorkspace(null, null, 'build')
  }

  const resetNavigation = () => {
    setCurrentPage('cards')
    setSelectedCard(null)
    setSelectedTemplate(null)
    setWorkspaceModule('build')
  }

  // Simplified context for MVP
  const navigationContext = { type: 'personal' as const }
  
  const setEventContext = (eventId?: string, eventName?: string) => {
    // Removed for MVP
  }

  const setCompanyContext = (companyId?: string, companyName?: string) => {
    // Removed for MVP
  }

  const setPersonalContext = () => {
    // Already default for MVP
  }

  const getContextLabel = () => {
    return 'Personal Workspace'
  }

  return {
    currentPage,
    selectedCard,
    selectedTemplate,
    workspaceModule,
    settingsSection,
    navigationContext,
    setWorkspaceModule,
    navigateToWorkspace,
    handleTemplateSelect,
    handleStartBlank,
    resetNavigation,
    handleNavigate,
    setEventContext,
    setCompanyContext,
    setPersonalContext,
    getContextLabel
  }
}