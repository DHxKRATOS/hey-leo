import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  User, 
  Palette, 
  Link, 
  Users, 
  Share2, 
  Monitor, 
  Tablet, 
  Smartphone,
  Check,
  Lightbulb,
  Star,
  Circle,
  Eye,
  ZoomIn,
  X,
  ArrowLeft,
  ChevronDown
} from 'lucide-react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Switch } from '../ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { ResponsiveCardRenderer } from '../ResponsiveCardRenderer'
import { AboutTab } from './buildModule/AboutTab'
import { LinksTab } from './buildModule/LinksTab'
import { ShareTab } from './buildModule/ShareTab'
import { toast } from 'sonner@2.0.3'

interface MobileResponsiveCardBuilderProps {
  card: any
  onUpdate: (updates: any) => void
  user: any
  userProfile: any
  onModuleChange?: (module: 'build' | 'train' | 'improve') => void
}

// Color themes for MVP
const COLOR_THEMES = [
  {
    id: 'professional',
    name: 'Professional',
    primary: '#2563EB',
    secondary: '#1D4ED8',
    background: '#FFFFFF',
    text: '#1A1A1A',
    accent: '#EFF6FF',
    preview: 'linear-gradient(135deg, #2563EB, #6B7280)'
  },
  {
    id: 'modern',
    name: 'Modern',
    primary: '#1A1A1A',
    secondary: '#374151',
    background: '#FFFFFF',
    text: '#1A1A1A',
    accent: '#F9FAFB',
    preview: 'linear-gradient(135deg, #1A1A1A, #FFFFFF)'
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    primary: '#F26522',
    secondary: '#E85A17',
    background: '#FFFFFF',
    text: '#1A1A1A',
    accent: '#FFF4F0',
    preview: 'linear-gradient(135deg, #F26522, #F59E0B)'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    primary: '#6B7280',
    secondary: '#9CA3AF',
    background: '#FFFFFF',
    text: '#1A1A1A',
    accent: '#F9FAFB',
    preview: 'linear-gradient(135deg, #6B7280, #E5E7EB)'
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    primary: '#F59E0B',
    secondary: '#D97706',
    background: '#1A1A1A',
    text: '#FFFFFF',
    accent: '#374151',
    preview: 'linear-gradient(135deg, #1A1A1A, #F59E0B)'
  }
]

// Font styles for MVP
const FONT_STYLES = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Serif headings with clean body text',
    heading: 'Playfair Display',
    body: 'Inter'
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'All sans-serif for clean look',
    heading: 'Inter',
    body: 'Inter'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Display font with sans body',
    heading: 'Space Grotesk',
    body: 'Inter'
  }
]

export function MobileResponsiveCardBuilder({ 
  card, 
  onUpdate, 
  user, 
  userProfile,
  onModuleChange 
}: MobileResponsiveCardBuilderProps) {
  const [activeTab, setActiveTab] = useState('about')
  const [selectedDevice, setSelectedDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [hasChanges, setHasChanges] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic-info', 'ai-assistant'])
  const [designScore, setDesignScore] = useState(75)
  const [showPreview, setShowPreview] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Card data state with AI Chat enabled by default
  const [cardData, setCardData] = useState({
    profile: {
      full_name: card?.profile?.full_name || userProfile?.full_name || '',
      job_title: card?.profile?.job_title || userProfile?.job_title || '',
      company: card?.profile?.company || userProfile?.company || '',
      location: card?.profile?.location || userProfile?.location || '',
      bio: card?.profile?.bio || userProfile?.bio || '',
      profile_photo_url: card?.profile?.profile_photo_url || userProfile?.avatar_url || '',
      cover_image_url: card?.profile?.cover_image_url || '',
      company_logo_url: card?.profile?.company_logo_url || '',
      ai_chat_enabled: card?.profile?.ai_chat_enabled !== false ? true : false,
      fullName: card?.profile?.full_name || userProfile?.full_name || '',
      jobTitle: card?.profile?.job_title || userProfile?.job_title || '',
      photo: card?.profile?.profile_photo_url || userProfile?.avatar_url || null
    },
    design: {
      colorTheme: card?.design?.colorTheme || 'vibrant',
      fontStyle: card?.design?.fontStyle || 'modern',
      template: card?.design?.template || 'leo-classic',
      theme: card?.design?.theme || 'leo-signature',
      colors: COLOR_THEMES.find(t => t.id === (card?.design?.colorTheme || 'vibrant')) || COLOR_THEMES[2],
      fonts: FONT_STYLES.find(f => f.id === (card?.design?.fontStyle || 'modern')) || FONT_STYLES[1],
      spacing: card?.design?.spacing || 'comfortable',
      corners: card?.design?.corners || 'rounded',
      shadows: card?.design?.shadows || 'subtle',
      layout: card?.design?.layout || 'center'
    },
    links: card?.links || [],
    leadCapture: {
      enabled: card?.leadCapture?.enabled || false,
      fields: card?.leadCapture?.fields || ['name', 'email'],
      timing: card?.leadCapture?.timing || 'immediate',
      message: card?.leadCapture?.message || 'Get in touch!'
    },
    sharing: {
      url: card?.sharing?.url || '',
      qrEnabled: card?.sharing?.qrEnabled || true,
      trackingEnabled: card?.sharing?.trackingEnabled || true
    },
    settings: {
      ai_chat_enabled: card?.profile?.ai_chat_enabled !== false ? true : false
    }
  })

  // Calculate design score based on completion
  useEffect(() => {
    let score = 50 // Base score
    
    if (cardData.profile.full_name) score += 15
    if (cardData.profile.job_title) score += 15
    if (cardData.profile.profile_photo_url) score += 10
    if (cardData.profile.bio) score += 5
    if (cardData.links.length > 0) score += 5
    
    setDesignScore(Math.min(score, 100))
  }, [cardData])

  // Auto-save functionality
  useEffect(() => {
    if (hasChanges) {
      const timer = setTimeout(() => {
        handleSave()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cardData, hasChanges])

  const handleSave = () => {
    onUpdate({
      ...card,
      profile: cardData.profile,
      design: cardData.design,
      links: cardData.links,
      leadCapture: cardData.leadCapture,
      sharing: cardData.sharing,
      settings: cardData.settings,
      updated_at: new Date().toISOString()
    })
    setHasChanges(false)
  }

  const updateCardData = (section: string, data: any) => {
    setCardData(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], ...data }
    }))
    setHasChanges(true)
  }

  const handleProfileUpdate = (updates: any) => {
    const profileUpdates = {
      ...updates,
      fullName: updates.full_name || updates.fullName || cardData.profile.fullName,
      jobTitle: updates.job_title || updates.jobTitle || cardData.profile.jobTitle,
      photo: updates.profile_photo_url || updates.photo || cardData.profile.photo
    }
    
    updateCardData('profile', profileUpdates)
    
    if (updates.ai_chat_enabled !== undefined) {
      updateCardData('settings', { ai_chat_enabled: updates.ai_chat_enabled })
    }
  }

  const handleLinksUpdate = (links: any[]) => {
    updateCardData('links', links)
  }

  const handleAddArrayItem = (field: string, value: string) => {
    const currentArray = (cardData.profile[field as keyof typeof cardData.profile] as string[]) || []
    const updatedArray = [...currentArray, value]
    handleProfileUpdate({ [field]: updatedArray })
  }

  const handleRemoveArrayItem = (field: string, index: number) => {
    const currentArray = (cardData.profile[field as keyof typeof cardData.profile] as string[]) || []
    const updatedArray = currentArray.filter((_, i) => i !== index)
    handleProfileUpdate({ [field]: updatedArray })
  }

  const handleColorThemeChange = (themeId: string) => {
    const theme = COLOR_THEMES.find(t => t.id === themeId)
    if (theme) {
      updateCardData('design', {
        colorTheme: themeId,
        colors: theme
      })
      toast.success('Color theme updated!')
    }
  }

  const handleFontStyleChange = (styleId: string) => {
    const style = FONT_STYLES.find(f => f.id === styleId)
    if (style) {
      updateCardData('design', {
        fontStyle: styleId,
        fonts: style
      })
      toast.success('Font style updated!')
    }
  }

  const handleChatClick = () => {
    toast.success('🦁 Leo AI Assistant preview!', {
      description: 'In live mode, visitors can chat with your AI-powered professional assistant.',
      duration: 3000,
      action: {
        label: 'Configure AI',
        onClick: () => onModuleChange?.('train')
      }
    })
  }

  const getTabProgress = (tab: string) => {
    switch (tab) {
      case 'about':
        return cardData.profile.full_name && cardData.profile.job_title ? 'complete' : 'partial'
      case 'design':
        return 'complete'
      case 'links':
        return cardData.links.length > 0 ? 'complete' : 'empty'
      case 'lead-capture':
        return cardData.leadCapture.enabled ? 'complete' : 'empty'
      case 'share':
        return 'complete'
      default:
        return 'empty'
    }
  }

  const getProgressDot = (tab: string) => {
    const progress = getTabProgress(tab)
    const isActive = activeTab === tab
    
    if (isActive) {
      return <div className="w-2 h-2 bg-primary rounded-full" />
    }
    
    switch (progress) {
      case 'complete':
        return <div className="w-2 h-2 bg-success rounded-full" />
      case 'partial':
        return <div className="w-2 h-2 bg-warning rounded-full" />
      default:
        return <div className="w-2 h-2 border border-border rounded-full" />
    }
  }

  const getUserTier = () => {
    return userProfile?.subscription_tier || 'free'
  }

  const generateCardUrl = () => {
    return `https://leo.cards/${card?.id || 'preview'}`
  }

  const handleTrainModuleAccess = () => {
    if (cardData.profile.ai_chat_enabled) {
      onModuleChange?.('train')
    } else {
      toast.error('Please enable AI Chat first')
    }
  }

  const handleImproveModuleAccess = () => {
    if (cardData.profile.ai_chat_enabled) {
      onModuleChange?.('improve')
    } else {
      toast.error('Please enable AI Chat first')
    }
  }

  const TabContent = ({ tab }: { tab: string }) => {
    switch (tab) {
      case 'about':
        return (
          <AboutTab
            profile={cardData.profile}
            userTier={getUserTier()}
            onProfileUpdate={handleProfileUpdate}
            onAddArrayItem={handleAddArrayItem}
            onRemoveArrayItem={handleRemoveArrayItem}
            expandedSections={expandedSections}
            onExpandedSectionsChange={setExpandedSections}
            onTrainModuleAccess={handleTrainModuleAccess}
            onImproveModuleAccess={handleImproveModuleAccess}
          />
        )
      
      case 'design':
        return (
          <div className="p-6 space-y-6">
            {/* Design Quality Indicator */}
            <div className="p-4 border-b bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Design Score:</span>
                <span className="text-lg font-bold text-primary">{designScore}%</span>
              </div>
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(designScore / 20) ? 'text-primary fill-current' : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              {designScore < 100 && (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Lightbulb className="w-3 h-3" />
                  <span>Add a profile photo (+10%)</span>
                </div>
              )}
            </div>

            {/* Color Themes */}
            <div>
              <h3 className="font-semibold mb-4">Choose Your Style</h3>
              <div className="space-y-3">
                {COLOR_THEMES.map((theme) => (
                  <div
                    key={theme.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      cardData.design.colorTheme === theme.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-border-hover'
                    }`}
                    onClick={() => handleColorThemeChange(theme.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          cardData.design.colorTheme === theme.id
                            ? 'border-primary bg-primary'
                            : 'border-border'
                        }`}
                      >
                        {cardData.design.colorTheme === theme.id && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                      <span className="font-medium">{theme.name}</span>
                    </div>
                    <div className="ml-auto flex items-center space-x-2">
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ background: theme.preview }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Font Styles */}
            <div>
              <h3 className="font-semibold mb-4">Font Style</h3>
              <div className="space-y-3">
                {FONT_STYLES.map((style) => (
                  <div
                    key={style.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      cardData.design.fontStyle === style.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-border-hover'
                    }`}
                    onClick={() => handleFontStyleChange(style.id)}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        cardData.design.fontStyle === style.id
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}
                    >
                      {cardData.design.fontStyle === style.id && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">{style.name}</span>
                      <p className="text-xs text-muted-foreground">{style.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      
      case 'links':
        return (
          <LinksTab
            links={cardData.links}
            userTier={getUserTier()}
            onLinksUpdate={handleLinksUpdate}
            expandedSections={expandedSections}
            onExpandedSectionsChange={setExpandedSections}
          />
        )
      
      case 'lead-capture':
        return (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Lead Capture</h3>
              <p className="text-sm text-muted-foreground">
                Configure how visitors can connect with you through your card
              </p>
            </div>

            <Card className="p-6 bg-surface border-border rounded-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Lead Capture</h4>
                    <p className="text-sm text-muted-foreground">Allow visitors to share their contact information</p>
                  </div>
                  <Switch
                    checked={cardData.leadCapture.enabled}
                    onCheckedChange={(enabled) => updateCardData('leadCapture', { enabled })}
                  />
                </div>

                {cardData.leadCapture.enabled && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div>
                      <Label className="text-sm font-medium">Contact Message</Label>
                      <Textarea
                        value={cardData.leadCapture.message}
                        onChange={(e) => updateCardData('leadCapture', { message: e.target.value })}
                        placeholder="Get in touch!"
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Capture Timing</Label>
                      <Select
                        value={cardData.leadCapture.timing}
                        onValueChange={(timing) => updateCardData('leadCapture', { timing })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="after-interaction">After Interaction</SelectItem>
                          <SelectItem value="on-exit">On Exit Intent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )
      
      case 'share':
        return (
          <ShareTab
            cardUrl={generateCardUrl()}
            userTier={getUserTier()}
            expandedSections={expandedSections}
            onExpandedSectionsChange={setExpandedSections}
          />
        )
      
      default:
        return null
    }
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Mobile Header */}
        <div className="h-16 bg-surface border-b flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Professional Card</span>
          </div>
          <Button variant="ghost" size="sm">
            <span className="text-lg">⋮</span>
          </Button>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="border-b bg-surface p-2">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: 'about', label: 'About', icon: User },
              { id: 'design', label: 'Design', icon: Palette },
              { id: 'links', label: 'Links', icon: Link },
              { id: 'lead-capture', label: 'Lead', icon: Users },
              { id: 'share', label: 'Share', icon: Share2 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-surface text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4 mb-1" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-2 pt-2">
            {['about', 'design', 'links', 'lead-capture', 'share'].map((tab) => (
              <div key={tab} className="transition-all">
                {getProgressDot(tab)}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <TabContent tab={activeTab} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Preview Button */}
        <div className="p-4 border-t bg-surface">
          <Sheet open={showPreview} onOpenChange={setShowPreview}>
            <SheetTrigger asChild>
              <Button className="w-full" onClick={() => setShowPreview(true)}>
                <Eye className="w-4 h-4 mr-2" />
                👁 Preview Card
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh]">
              <SheetHeader>
                <SheetTitle>Card Preview</SheetTitle>
                <SheetDescription>
                  See how your card looks across devices
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-4 flex flex-col h-full">
                {/* Device toggle */}
                <div className="flex justify-center space-x-2 mb-4">
                  <Button
                    variant={selectedDevice === 'mobile' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedDevice('mobile')}
                  >
                    <Smartphone className="h-4 w-4 mr-1" />
                    📱
                  </Button>
                  <Button
                    variant={selectedDevice === 'desktop' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedDevice('desktop')}
                  >
                    <Monitor className="h-4 w-4 mr-1" />
                    💻
                  </Button>
                </div>
                
                {/* Preview */}
                <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-lg overflow-hidden">
                  <div className="w-full h-full max-w-sm">
                    <ResponsiveCardRenderer
                      cardData={cardData}
                      deviceType="mobile"
                      onChatClick={handleChatClick}
                    />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    )
  }

  // Desktop Layout (same as StreamlinedBuildModule)
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Auto-save indicator */}
      <div className="h-12 bg-surface border-b flex items-center px-6">
        <div className="ml-auto flex items-center text-xs text-muted-foreground">
          <div className={`w-2 h-2 rounded-full mr-2 ${hasChanges ? 'bg-warning animate-pulse' : 'bg-success'}`} />
          {hasChanges ? 'Saving changes...' : 'All changes saved'}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Editor Panel */}
        <div className="w-96 bg-surface border-r flex flex-col">
          {/* Fixed Tab Navigation */}
          <div className="border-b p-4">
            <div className="space-y-3">
              {/* Primary tabs */}
              <div className="flex space-x-1">
                {[
                  { id: 'about', label: 'About', icon: User },
                  { id: 'design', label: 'Design', icon: Palette },
                  { id: 'links', label: 'Links', icon: Link }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary-surface text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mb-1" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Secondary tabs */}
              <div className="flex space-x-1">
                {[
                  { id: 'lead-capture', label: 'Lead Capture', icon: Users },
                  { id: 'share', label: 'Share', icon: Share2 }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary-surface text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mb-1" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Progress dots */}
              <div className="flex justify-center space-x-2 pt-2">
                {['about', 'design', 'links', 'lead-capture', 'share'].map((tab) => (
                  <div key={tab} className="transition-all">
                    {getProgressDot(tab)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <TabContent tab={activeTab} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="flex-1 bg-background flex flex-col">
          {/* Enhanced Preview Header */}
          <div className="h-16 border-b flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <h2 className="font-semibold">Preview</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant={selectedDevice === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedDevice('mobile')}
                  className="h-8 px-3"
                >
                  <Smartphone className="h-4 w-4 mr-1" />
                  📱
                </Button>
                <Button
                  variant={selectedDevice === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedDevice('desktop')}
                  className="h-8 px-3"
                >
                  <Monitor className="h-4 w-4 mr-1" />
                  💻
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select defaultValue="100">
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="75">75%</SelectItem>
                  <SelectItem value="100">100%</SelectItem>
                  <SelectItem value="125">125%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 p-6 flex items-center justify-center bg-muted/20">
            <motion.div
              className="bg-background rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
              style={{
                width: selectedDevice === 'mobile' ? '375px' : '1200px',
                height: selectedDevice === 'mobile' ? '667px' : '800px'
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <ResponsiveCardRenderer
                cardData={cardData}
                deviceType={selectedDevice}
                onChatClick={handleChatClick}
              />
            </motion.div>
          </div>

          {/* Interaction Hints */}
          <div className="border-t p-4 bg-surface/50">
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>Click to test interactions</span>
              </div>
              <div className="flex items-center space-x-1">
                <ZoomIn className="w-3 h-3" />
                <span>Hover to magnify</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}