import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Sparkles,
  Crown,
  Settings,
  RotateCcw,
  RefreshCw,
  Wand2,
  Download,
  Share2,
  Eye,
  Monitor,
  Smartphone,
  Tablet,
  FlipHorizontal,
  Layers,
  HelpCircle,
  Volume2,
  VolumeX,
  Accessibility,
  MousePointer,
  TestTube,
  QrCode,
  ImageIcon,
  FileText,
  Users,
  PaintBucket,
  LinkIcon,
  Bot,
  Plus,
  X,
  Check,
  ChevronDown,
  GripVertical,
  ExternalLink,
  Mail,
  Phone,
  Linkedin,
  Instagram,
  Github,
  Globe,
  Calendar,
  Upload,
  Target,
  Award,
  Zap,
  Camera,
  MessageCircle,
  BarChart3,
  Calendar as CalendarIcon,
  Lock,
  Unlock,
  Move
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Separator } from '../ui/separator'
import { Switch } from '../ui/switch'
import { Slider } from '../ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Progress } from '../ui/progress'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { CardChatButton } from '../CardChatButton'
import { DevicePreviewMode } from './DevicePreviewMode'
import { CardStackRenderer } from './tinderCardBuilder/CardStackRenderer'
import { toast } from 'sonner@2.0.3'

// Import constants and helpers
import {
  colorPalettes,
  fontCombinations,
  tinderCardTemplates,
  aiPersonas,
  ctaButtons,
  customFieldTypes,
  onboardingSteps
} from '../../utils/tinderCardBuilderConstants'

import {
  playSound,
  initializeAudioContext,
  handleDragEnd,
  handleExport,
  handleShare,
  handlePublish,
  generateAIDesign,
  getPlatformIcon,
  handleLinkClick,
  handleAddLink,
  handleAddCTA,
  handleAddCustomField,
  handleTemplatePreview,
  handleAutoSave,
  handleUndo,
  handleRedo
} from '../../utils/tinderCardBuilderHelpers'

import { TinderInspiredCardBuilderProps } from '../../types/tinderCardBuilder'

export function TinderInspiredCardBuilder({ 
  card, 
  onUpdate, 
  user, 
  userTier = 'free',
  isEventMode = false,
  eventName
}: TinderInspiredCardBuilderProps) {
  // Early return if card data is not available
  if (!card || !card.design) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="text-center">
          <motion.div 
            className="w-20 h-20 bg-gradient-to-br from-primary to-primary-hover rounded-3xl flex items-center justify-center mx-auto mb-6"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 0.95, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">Preparing Your Leo Studio</h3>
          <p className="text-text-secondary max-w-md">Creating the perfect environment for building your professional digital business card...</p>
        </div>
      </div>
    )
  }

  // Enhanced state management
  const [activeTab, setActiveTab] = useState('profile')
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [isSwipeable, setIsSwipeable] = useState(true)
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const [designHistory, setDesignHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const cardZoom = 1
  const [showCardFlip, setShowCardFlip] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartTime, setDragStartTime] = useState(0)
  const [viewMode, setViewMode] = useState<'builder' | 'preview'>('builder')
  const [cardRotation, setCardRotation] = useState(0)
  const [showCardStack, setShowCardStack] = useState(true)
  const [selectedTemplatePreview, setSelectedTemplatePreview] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [accessibilityMode, setAccessibilityMode] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [isPublishing, setIsPublishing] = useState(false)
  const [ctaDragMode, setCtaDragMode] = useState(false)
  const [selectedCTA, setSelectedCTA] = useState<string | null>(null)
  const [aiPersona, setAiPersona] = useState('professional')
  const [customFieldsOpen, setCustomFieldsOpen] = useState(false)

  const cardPreviewRef = useRef<HTMLDivElement>(null)
  const stackContainerRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Check if user is in developer mode
  const isDevMode = window.location.hostname === 'localhost' || 
                    window.location.hostname.includes('figma') ||
                    window.location.search.includes('dev=true')

  // Initialize audio context
  useEffect(() => {
    initializeAudioContext(soundEnabled, audioContextRef)
  }, [soundEnabled])

  // Auto-save functionality with better UX
  useEffect(() => {
    if (saveStatus === 'unsaved') {
      setSaveStatus('saving')
      const timer = setTimeout(() => {
        handleAutoSave(card, onUpdate, setSaveStatus, soundEnabled, audioContextRef)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [card, onUpdate, setSaveStatus, soundEnabled])

  const handleDesignUpdate = (updates: any) => {
    // Add to design history for undo/redo
    const newHistory = [...designHistory.slice(0, historyIndex + 1), { ...card }]
    setDesignHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)

    const updatedCard = {
      ...card,
      design: { ...card?.design, ...updates },
      updated_at: new Date().toISOString()
    }
    onUpdate(updatedCard)
    setSaveStatus('unsaved')
  }

  // Enhanced drag handling wrapper
  const handleDragStart = () => {
    setIsDragging(true)
    setDragStartTime(Date.now())
  }

  const onDragEnd = (event: any, info: any) => {
    handleDragEnd(
      event, 
      info, 
      dragStartTime,
      isSwipeable,
      soundEnabled,
      audioContextRef,
      setCardRotation,
      setIsDragging
    )
  }

  // Enhanced link click wrapper
  const onLinkClick = (link: any, e: React.MouseEvent) => {
    handleLinkClick(link, e, soundEnabled, audioContextRef)
  }

  // Sound wrapper functions
  const playSoundWrapper = (type: 'like' | 'pass' | 'swipe') => {
    playSound(type, soundEnabled, audioContextRef)
    
    // Handle toasts here since they're not in the helper
    if (type === 'pass') {
      toast.error('Pass! 👎 Let\'s try a different design!')
    } else if (type === 'like') {
      toast.success('Like! 💚 Great design choice!')
    }
  }

  // If in preview mode, show the DevicePreviewMode
  if (viewMode === 'preview' && isDevMode) {
    return <DevicePreviewMode cardData={card} onUpdate={onUpdate} />
  }

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-gradient-to-br from-background via-muted/20 to-background">
        {/* Enhanced Header */}
        <div className="bg-surface/90 backdrop-blur-2xl border-b border-border/50 px-6 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="font-semibold bg-gradient-to-r from-primary via-primary-hover to-primary-active bg-clip-text text-transparent">
                  {card?.name || 'My Leo Card'} ✨
                </h1>
                <p className="text-muted-foreground text-sm">
                  Create your stunning Tinder-style business card
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary shadow-sm">
                  <Crown className="w-3 h-3 mr-1" />
                  {userTier === 'free' ? 'Free' : userTier === 'professional' ? 'Pro' : 'Executive'}
                </Badge>
                
                <Badge variant="outline" className={`shadow-sm ${
                  saveStatus === 'saved' ? 'bg-green-500/10 border-green-500/30 text-green-600' :
                  saveStatus === 'saving' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600' :
                  'bg-red-500/10 border-red-500/30 text-red-600'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-1 ${
                    saveStatus === 'saved' ? 'bg-green-500' :
                    saveStatus === 'saving' ? 'bg-yellow-500 animate-pulse' :
                    'bg-red-500'
                  }`} />
                  {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Enhanced Mode Toggle */}
              <div className="flex items-center space-x-2 bg-muted/50 rounded-2xl p-1 shadow-inner">
                <Button
                  size="sm"
                  variant={viewMode === 'builder' ? "default" : "ghost"}
                  onClick={() => setViewMode('builder')}
                  className="rounded-xl shadow-sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Builder
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'preview' ? "default" : "ghost"}
                  onClick={() => setViewMode('preview')}
                  className="rounded-xl shadow-sm"
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Enhanced controls */}
              <div className="flex items-center space-x-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUndo(historyIndex, designHistory, onUpdate, setHistoryIndex, setSaveStatus)}
                      disabled={historyIndex <= 0}
                      className="p-2 hover:bg-muted/50 rounded-xl"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRedo(historyIndex, designHistory, onUpdate, setHistoryIndex, setSaveStatus)}
                      disabled={historyIndex >= designHistory.length - 1}
                      className="p-2 hover:bg-muted/50 rounded-xl"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Settings */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="ghost" className="p-2 hover:bg-muted/50 rounded-xl">
                    <Settings className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-4" align="end">
                  <div className="space-y-4">
                    <h4 className="font-medium">Builder Settings</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Volume2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Sound Effects</span>
                      </div>
                      <Switch
                        checked={soundEnabled}
                        onCheckedChange={setSoundEnabled}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Accessibility className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">High Contrast</span>
                      </div>
                      <Switch
                        checked={accessibilityMode}
                        onCheckedChange={setAccessibilityMode}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MousePointer className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Swipe Mode</span>
                      </div>
                      <Switch
                        checked={isSwipeable}
                        onCheckedChange={setIsSwipeable}
                      />
                    </div>

                    <Separator />

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowOnboarding(true)}
                      className="w-full justify-start"
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Show Tutorial
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* AI Design Generator */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => generateAIDesign(
                      card,
                      setIsGeneratingAI,
                      handleDesignUpdate,
                      soundEnabled,
                      audioContextRef,
                      colorPalettes,
                      fontCombinations,
                      tinderCardTemplates
                    )}
                    disabled={isGeneratingAI}
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Wand2 className={`w-4 h-4 mr-2 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                    {isGeneratingAI ? 'Creating...' : 'AI Magic'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Generate AI-powered design suggestions</TooltipContent>
              </Tooltip>

              {/* Export & Share */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline" className="shadow-sm hover:shadow-md">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-2">
                  <div className="space-y-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start hover:bg-muted/50"
                      onClick={() => handleExport('png', soundEnabled, audioContextRef)}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Export PNG
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start hover:bg-muted/50"
                      onClick={() => handleExport('pdf', soundEnabled, audioContextRef)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start hover:bg-muted/50"
                      onClick={() => handleExport('vcard', soundEnabled, audioContextRef)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Download vCard
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start hover:bg-muted/50"
                      onClick={() => handleExport('qr', soundEnabled, audioContextRef)}
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      QR Code
                    </Button>
                    {isDevMode && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start hover:bg-muted/50"
                        onClick={() => setViewMode('preview')}
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        Device Testing
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleShare(card?.id, soundEnabled, audioContextRef)} 
                className="shadow-sm hover:shadow-md"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>

              <Button 
                size="sm" 
                onClick={() => handlePublish(card, onUpdate, setIsPublishing, soundEnabled, audioContextRef)}
                disabled={isPublishing}
                className="bg-primary hover:bg-primary-hover shadow-lg hover:shadow-xl transition-all"
              >
                {isPublishing ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Publish
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Enhanced Left Panel - Design Controls */}
          <div className="w-80 bg-surface/60 backdrop-blur-xl border-r border-border/50 overflow-y-auto shadow-xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <div className="border-b border-border/50 p-4 bg-surface/30">
                <TabsList className="grid w-full grid-cols-5 bg-muted/30 rounded-2xl p-1 shadow-inner">
                  <TabsTrigger value="profile" className="rounded-xl data-[state=active]:shadow-sm">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div><Users className="w-4 h-4" /></div>
                      </TooltipTrigger>
                      <TooltipContent>Profile Info</TooltipContent>
                    </Tooltip>
                  </TabsTrigger>
                  <TabsTrigger value="design" className="rounded-xl data-[state=active]:shadow-sm">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div><PaintBucket className="w-4 h-4" /></div>
                      </TooltipTrigger>
                      <TooltipContent>Design & Layout</TooltipContent>
                    </Tooltip>
                  </TabsTrigger>
                  <TabsTrigger value="links" className="rounded-xl data-[state=active]:shadow-sm">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div><LinkIcon className="w-4 h-4" /></div>
                      </TooltipTrigger>
                      <TooltipContent>Links & CTAs</TooltipContent>
                    </Tooltip>
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="rounded-xl data-[state=active]:shadow-sm">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div><Bot className="w-4 h-4" /></div>
                      </TooltipTrigger>
                      <TooltipContent>AI Assistant</TooltipContent>
                    </Tooltip>
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="rounded-xl data-[state=active]:shadow-sm">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div><Settings className="w-4 h-4" /></div>
                      </TooltipTrigger>
                      <TooltipContent>Advanced</TooltipContent>
                    </Tooltip>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6 space-y-8">
                {/* Simplified Profile Tab - just basic structure as example */}
                <TabsContent value="profile" className="space-y-8 mt-0">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-lg">Profile Information</h3>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="ghost" className="p-2">
                            <HelpCircle className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>This information appears on your business card</TooltipContent>
                      </Tooltip>
                    </div>
                    
                    <Card className="p-6 space-y-6 rounded-2xl shadow-sm">
                      {/* Basic profile fields */}
                      <div>
                        <label className="block mb-3 font-medium">Full Name *</label>
                        <input
                          type="text"
                          value={card?.profile?.full_name || ''}
                          onChange={(e) => onUpdate({
                            ...card,
                            profile: { ...card?.profile, full_name: e.target.value }
                          })}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="e.g., Sarah Johnson"
                        />
                      </div>

                      <div>
                        <label className="block mb-3 font-medium">Job Title *</label>
                        <input
                          type="text"
                          value={card?.profile?.job_title || ''}
                          onChange={(e) => onUpdate({
                            ...card,
                            profile: { ...card?.profile, job_title: e.target.value }
                          })}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="e.g., Senior Product Manager"
                        />
                      </div>

                      <div>
                        <label className="block mb-3 font-medium">Company</label>
                        <input
                          type="text"
                          value={card?.profile?.company || ''}
                          onChange={(e) => onUpdate({
                            ...card,
                            profile: { ...card?.profile, company: e.target.value }
                          })}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="e.g., TechCorp Inc."
                        />
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                {/* Other tabs would follow similar simplified pattern... */}
                <TabsContent value="design" className="space-y-8 mt-0">
                  <div>
                    <h3 className="font-semibold mb-6 text-lg">Card Templates</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {tinderCardTemplates.slice(0, 4).map((template) => (
                        <motion.div
                          key={template.id}
                          className={`aspect-[3/4] rounded-2xl border-2 cursor-pointer overflow-hidden relative group ${
                            card?.design?.template === template.id 
                              ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                              : 'border-border hover:border-primary/50 hover:shadow-md'
                          }`}
                          style={{ background: template.preview }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            handleDesignUpdate({ template: template.id })
                            handleTemplatePreview(template.id, setSelectedTemplatePreview)
                            playSound('like', soundEnabled, audioContextRef)
                          }}
                        >
                          <div className="p-4 h-full flex flex-col justify-between relative z-10">
                            <div className="flex items-center justify-between">
                              <div className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm" />
                              <Badge variant="outline" className="text-xs bg-white/20 border-white/30 text-white">
                                {template.category}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="w-full h-1.5 bg-white/30 rounded-full" />
                              <div className="w-3/4 h-1 bg-white/20 rounded-full" />
                            </div>
                          </div>
                          
                          {card?.design?.template === template.id && (
                            <motion.div 
                              className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 400 }}
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Simplified other tabs */}
                <TabsContent value="links" className="space-y-8 mt-0">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-lg">Social Links</h3>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleAddLink(card, onUpdate)} 
                        className="rounded-xl"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Link
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-sm">Links will appear on your card preview above.</p>
                  </div>
                </TabsContent>

                <TabsContent value="ai" className="space-y-8 mt-0">
                  <div>
                    <h3 className="font-semibold mb-6 text-lg">AI Assistant</h3>
                    <Card className="p-6 space-y-6 rounded-2xl shadow-sm">
                      <div className="text-center space-y-4">
                        <motion.div 
                          className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-3xl mx-auto flex items-center justify-center shadow-lg"
                          whileHover={{ scale: 1.05, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Bot className="w-10 h-10 text-white" />
                        </motion.div>
                        
                        <div>
                          <h4 className="font-semibold text-lg mb-2">Leo AI Assistant</h4>
                          <p className="text-muted-foreground">
                            Your 24/7 professional concierge that engages visitors, books meetings, 
                            and represents you with intelligence and personality.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-8 mt-0">
                  <div>
                    <h3 className="font-semibold mb-6 text-lg">Advanced Settings</h3>
                    <Card className="p-4 rounded-xl">
                      <h4 className="font-medium mb-4">Card Animation</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Enable Hover Effects</span>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Swipe Feedback</span>
                          <Switch checked={isSwipeable} onCheckedChange={setIsSwipeable} />
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Enhanced Center - Tinder Card Stack */}
          <div className="flex-1 bg-gradient-to-br from-background via-muted/20 to-background p-8 relative overflow-hidden">
            {/* Device preview selector */}
            <motion.div 
              className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex bg-surface/90 backdrop-blur-xl rounded-2xl p-1 border border-border/50 shadow-lg">
                {[
                  { id: 'mobile', icon: <Smartphone className="w-4 h-4" />, label: 'Mobile' },
                  { id: 'tablet', icon: <Tablet className="w-4 h-4" />, label: 'Tablet' },
                  { id: 'desktop', icon: <Monitor className="w-4 h-4" />, label: 'Desktop' }
                ].map((device) => (
                  <Tooltip key={device.id}>
                    <TooltipTrigger asChild>
                      <motion.button
                        onClick={() => setPreviewDevice(device.id as any)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all font-medium ${
                          previewDevice === device.id
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-surface/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {device.icon}
                        <span className="hidden sm:block">{device.label}</span>
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent>Preview on {device.label}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </motion.div>

            {/* Card controls */}
            <motion.div 
              className="absolute bottom-6 right-6 z-30 flex flex-col space-y-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-12 h-12 p-0 bg-surface/90 backdrop-blur-xl shadow-lg hover:shadow-xl rounded-2xl"
                    onClick={() => setShowCardStack(!showCardStack)}
                  >
                    <Layers className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">Toggle Stack</TooltipContent>
              </Tooltip>
            </motion.div>

            {/* Card stack rendering using the extracted component */}
            <CardStackRenderer
              card={card}
              cardZoom={cardZoom}
              cardRotation={cardRotation}
              showCardStack={showCardStack}
              isSwipeable={isSwipeable}
              isDragging={isDragging}
              selectedTemplatePreview={selectedTemplatePreview}
              soundEnabled={soundEnabled}
              audioContextRef={audioContextRef}
              stackContainerRef={stackContainerRef}
              cardPreviewRef={cardPreviewRef}
              onDragStart={handleDragStart}
              onDragEnd={onDragEnd}
              onLinkClick={onLinkClick}
              playSound={playSoundWrapper}
            />

            {/* Swipe instructions - REMOVED */}
          </div>


        </div>

        {/* Onboarding Dialog (simplified) */}
        <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">
                {onboardingSteps[onboardingStep]?.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-hover rounded-2xl mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              <p className="text-muted-foreground">
                {onboardingSteps[onboardingStep]?.description}
              </p>
              
              <Progress value={(onboardingStep + 1) / onboardingSteps.length * 100} className="w-full" />
            </div>
            
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => setOnboardingStep(Math.max(0, onboardingStep - 1))}
                disabled={onboardingStep === 0}
              >
                Previous
              </Button>
              
              <Button 
                onClick={() => {
                  if (onboardingStep < onboardingSteps.length - 1) {
                    setOnboardingStep(onboardingStep + 1)
                  } else {
                    setShowOnboarding(false)
                  }
                }}
              >
                {onboardingStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}