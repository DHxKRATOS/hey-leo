import React, { useState } from 'react'
import { 
  Bug, 
  User, 
  Settings, 
  Eye, 
  ExternalLink, 
  Smartphone, 
  QrCode,
  Copy,
  CheckCircle,
  Globe,
  Share2,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface DebugPanelProps {
  user: any
  userProfile: any
  currentPage: string
  hasCompletedOnboarding: boolean
  shouldShowOnboarding: boolean
  selectedCard?: any
  selectedTemplate?: any
}

export function DebugPanel({
  user,
  userProfile,
  currentPage,
  hasCompletedOnboarding,
  shouldShowOnboarding,
  selectedCard,
  selectedTemplate
}: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [customCardId, setCustomCardId] = useState('demo-card-123')

  // Generate demo card URLs
  const baseUrl = window.location.origin
  const demoCardUrls = {
    query: `${baseUrl}/?card=${customCardId}`,
    short: `${baseUrl}/c/${customCardId}`,
    username: `${baseUrl}/@sarah/business-card`
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const openExternalCard = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const navigateToExternalCard = (url: string) => {
    window.location.href = url
  }

  const generateQRCode = (url: string) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
    window.open(qrUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 right-4 z-50 bg-surface border border-border rounded-xl shadow-lg max-w-sm overflow-hidden">
        {/* Header */}
        <div 
          className="bg-primary-light p-3 cursor-pointer flex items-center justify-between"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Bug className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm text-primary">Leo Debug Panel</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-primary" />
          ) : (
            <ChevronUp className="h-4 w-4 text-primary" />
          )}
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            
            {/* External Card Testing Section */}
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">External Card View</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Test the public card view that visitors see
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Custom Card ID Input */}
                <div>
                  <Label htmlFor="cardId" className="text-xs">Card ID</Label>
                  <Input
                    id="cardId"
                    value={customCardId}
                    onChange={(e) => setCustomCardId(e.target.value)}
                    placeholder="Enter card ID"
                    className="h-7 text-xs"
                  />
                </div>

                {/* URL Format Testing */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Test URL Formats:</Label>
                  
                  {/* Query Parameter Format */}
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openExternalCard(demoCardUrls.query)}
                      className="flex-1 h-7 text-xs"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Query (?card=)
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(demoCardUrls.query, 'query')}
                          className="h-7 w-7 p-0"
                        >
                          {copied === 'query' ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy URL</TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Short URL Format */}
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openExternalCard(demoCardUrls.short)}
                      className="flex-1 h-7 text-xs"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Short (/c/)
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(demoCardUrls.short, 'short')}
                          className="h-7 w-7 p-0"
                        >
                          {copied === 'short' ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy URL</TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Username Format */}
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openExternalCard(demoCardUrls.username)}
                      className="flex-1 h-7 text-xs"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Username (/@)
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(demoCardUrls.username, 'username')}
                          className="h-7 w-7 p-0"
                        >
                          {copied === 'username' ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy URL</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex space-x-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigateToExternalCard(demoCardUrls.query)}
                        className="flex-1 h-7 text-xs"
                      >
                        <Smartphone className="h-3 w-3 mr-1" />
                        Navigate
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Navigate to external view</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateQRCode(demoCardUrls.short)}
                        className="flex-1 h-7 text-xs"
                      >
                        <QrCode className="h-3 w-3 mr-1" />
                        QR Code
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Generate QR code</TooltipContent>
                  </Tooltip>
                </div>

                {/* Test Features Note */}
                <div className="text-xs text-text-secondary bg-background/50 p-2 rounded border border-border/50">
                  <div className="font-medium mb-1">Test Features:</div>
                  <ul className="text-xs space-y-0.5">
                    <li>• AI Chat Widget (Leo AI)</li>
                    <li>• Contact Form Submission</li>
                    <li>• Social Sharing & vCard Download</li>
                    <li>• Analytics Tracking</li>
                    <li>• Mobile Responsive Design</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* System State */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-text-secondary" />
                <span className="font-medium text-sm">System State</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">User:</span>
                    <Badge variant={user ? "default" : "secondary"} className="text-xs">
                      {user ? "Auth" : "Demo"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Page:</span>
                    <Badge variant="outline" className="text-xs">
                      {currentPage}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Onboarding:</span>
                    <Badge variant={hasCompletedOnboarding ? "default" : "secondary"} className="text-xs">
                      {hasCompletedOnboarding ? "Done" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Profile:</span>
                    <Badge variant={userProfile ? "default" : "secondary"} className="text-xs">
                      {userProfile ? "Set" : "Empty"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* User Info */}
            {(user || userProfile) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-text-secondary" />
                    <span className="font-medium text-sm">User Info</span>
                  </div>
                  
                  <div className="text-xs space-y-1">
                    {user && (
                      <div>
                        <span className="text-text-secondary">Email:</span>{' '}
                        <span className="font-mono">{user.email}</span>
                      </div>
                    )}
                    {userProfile && (
                      <div>
                        <span className="text-text-secondary">Name:</span>{' '}
                        <span>{userProfile.full_name || 'Not set'}</span>
                      </div>
                    )}
                    {selectedCard && (
                      <div>
                        <span className="text-text-secondary">Card:</span>{' '}
                        <span className="font-mono">{selectedCard.id}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Environment Info */}
            <Separator />
            <div className="text-xs text-text-tertiary space-y-1">
              <div>Environment: Development</div>
              <div>Version: Leo v2.0</div>
              <div>Build: {new Date().toLocaleDateString()}</div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}