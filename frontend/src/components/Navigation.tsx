import React, { useState } from 'react'
import {
  Home,
  Settings,
  Users,
  BarChart3,
  User,
  Globe,
  ExternalLink,
  DollarSign
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { Separator } from './ui/separator'
import { useNavigate } from 'react-router-dom'

type Page = '/dashboard' | '/workspace' | '/templates' | '/contacts' | '/analytics' | '/settings'

interface NavigationProps {
  user: any
  userProfile: any
  currentPage: any
  onNavigate: (page: Page, section?: string) => void
  // onSignOut: () => void
  // navigationContext?: 'personal' | 'company' | 'event' // Made optional for MVP
  // onSetEventContext?: (eventId?: string) => void
  // onSetPersonalContext?: () => void
}

export function Navigation({
  user,
  userProfile,
  // onSignOut,
  currentPage,
  onNavigate,
  // navigationContext = 'personal', // Default for MVP
  // onSetEventContext,
  // onSetPersonalContext
}: NavigationProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const navigate = useNavigate()
  const isDemoMode = !user && userProfile
  const isDebugMode = window.location.hostname === 'localhost' || window.location.hostname.includes('figma')

  // Generate demo card URLs for external testing
  const baseUrl = window.location.origin
  const demoCardUrls = {
    query: `${baseUrl}/?card=demo-card-123`,
    short: `${baseUrl}/c/demo-card-123`,
    username: `${baseUrl}/@sarah/business-card`
  }

  const openExternalCard = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const navigationItems = [
    {
      id: '/dashboard' as Page,
      label: 'Cards',
      icon: <Home className="h-4 w-4" />,
      badge: null
    },
    {
      id: '/contacts' as Page,
      label: 'Contacts',
      icon: <Users className="h-4 w-4" />,
      badge: null
    },
    {
      id: '/analytics' as Page,
      label: 'Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      badge: null
    },
    {
      id: '/settings' as Page,
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      badge: null
    }
  ]

  return (
    <TooltipProvider>
      <div className="fixed left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border cursor-pointer" onClick={() => navigate("/")}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-md">
              <span className="font-bold text-primary-foreground text-lg">🦁</span>
            </div>
            <div className="flex-1">
              <h1 className="font-bold text-lg text-sidebar-foreground tracking-tight">leo</h1>
              <p className="text-xs text-sidebar-foreground/60">AI Business Cards</p>
            </div>
          </div>
        </div>

        {/* Simplified context for MVP */}
        <div className="px-6 py-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-2 text-sidebar-foreground/80">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">Personal Workspace</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={currentPage === item.id ? "secondary" : "ghost"}
                  className={`w-full justify-start h-10 ${currentPage === item.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                  onClick={() => onNavigate(item.id)}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {item.label}
                {item.badge && ` (${item.badge})`}
              </TooltipContent>
            </Tooltip>
          ))}

          {/* External Card View Option (Development Only) */}
          {isDemoMode && isDebugMode && (
            <>
              <Separator className="my-4" />
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-sidebar-foreground">External View</span>
                    <Badge variant="outline" className="text-xs">Dev</Badge>
                  </div>
                  <p className="text-xs text-sidebar-foreground/60 mt-1">
                    Test how visitors see your card
                  </p>
                </div>

                <div className="space-y-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-8 text-xs text-sidebar-foreground hover:bg-sidebar-accent"
                        onClick={() => openExternalCard(demoCardUrls.query)}
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Query Format
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      Open ?card=demo-card-123
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-8 text-xs text-sidebar-foreground hover:bg-sidebar-accent"
                        onClick={() => openExternalCard(demoCardUrls.short)}
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Short URL
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      Open /c/demo-card-123
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-8 text-xs text-sidebar-foreground hover:bg-sidebar-accent"
                        onClick={() => openExternalCard(demoCardUrls.username)}
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Username URL
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      Open /@sarah/business-card
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </>
          )}
        </nav>

        {/* Subtle Affiliate Widget */}
        <div className="p-4 border-t border-sidebar-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20 cursor-pointer hover:from-primary/10 hover:to-primary/15 transition-all duration-200"
                onClick={() => onNavigate('settings', 'affiliate')}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-sidebar-foreground">Earn with Leo</h3>
                    <p className="text-xs text-sidebar-foreground/60">20% lifetime commission</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs h-7 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    onNavigate('settings', 'affiliate')
                  }}
                >
                  Start Earning →
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              Access the Affiliate Program in Settings
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}