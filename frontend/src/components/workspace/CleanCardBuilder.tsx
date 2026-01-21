import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  User,
  Palette,
  Link,
  Users,
  Mail,
  Share2,
  Monitor,
  Tablet,
  Smartphone,
  Upload,
  Plus,
  X,
  Save,
  Eye,
  EyeOff,
  Copy,
  ExternalLink
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Switch } from '../ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Separator } from '../ui/separator'
import { toast } from 'sonner@2.0.3'

interface CleanCardBuilderProps {
  card: any
  onUpdate: (card: any) => void
  user: any
  userProfile: any
}

// Module navigation items
const MODULE_ITEMS = [
  { id: 'build', label: 'Build', active: true },
  { id: 'train', label: 'Train', active: false },
  { id: 'test', label: 'Test', active: false },
  { id: 'improve', label: 'Improve', active: false }
]

// Editor tabs
const EDITOR_TABS = [
  { id: 'about', label: 'About', icon: User },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'links', label: 'Links', icon: Link },
  { id: 'lead-capture', label: 'Lead Capture', icon: Users },
  { id: 'follow-up', label: 'Follow Up Email', icon: Mail },
  { id: 'share', label: 'Share', icon: Share2 }
]

// Device preview options
const DEVICE_OPTIONS = [
  { id: 'desktop', label: 'Desktop', icon: Monitor },
  { id: 'tablet', label: 'Tablet', icon: Tablet },
  { id: 'mobile', label: 'Mobile', icon: Smartphone }
]

// Color scheme presets
const COLOR_SCHEMES = [
  { id: 'leo-orange', name: 'Leo Orange', primary: '#F26522', background: '#FFFFFF' },
  { id: 'navy-blue', name: 'Navy Blue', primary: '#1E40AF', background: '#FFFFFF' },
  { id: 'forest-green', name: 'Forest Green', primary: '#059669', background: '#FFFFFF' },
  { id: 'royal-purple', name: 'Royal Purple', primary: '#7C3AED', background: '#FFFFFF' },
  { id: 'crimson-red', name: 'Crimson Red', primary: '#DC2626', background: '#FFFFFF' },
  { id: 'golden-yellow', name: 'Golden Yellow', primary: '#D97706', background: '#FFFFFF' },
  { id: 'slate-gray', name: 'Slate Gray', primary: '#475569', background: '#FFFFFF' },
  { id: 'midnight-black', name: 'Midnight', primary: '#FFFFFF', background: '#1A1A1A' }
]

// Popular platforms for links
const POPULAR_PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'twitter', name: 'Twitter', icon: '🐦' },
  { id: 'instagram', name: 'Instagram', icon: '📷' },
  { id: 'facebook', name: 'Facebook', icon: '👥' },
  { id: 'github', name: 'GitHub', icon: '💻' },
  { id: 'website', name: 'Website', icon: '🌐' },
  { id: 'email', name: 'Email', icon: '✉️' },
  { id: 'phone', name: 'Phone', icon: '📞' }
]

export function CleanCardBuilder({ card, onUpdate, user, userProfile }: CleanCardBuilderProps) {
  const [activeModule, setActiveModule] = useState('build')
  const [activeTab, setActiveTab] = useState('about')
  const [selectedDevice, setSelectedDevice] = useState('mobile')
  const [autoSave, setAutoSave] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date>(new Date())

  // Card data state
  const [cardData, setCardData] = useState({
    profile: {
      fullName: card?.profile?.full_name || userProfile?.full_name || '',
      jobTitle: card?.profile?.job_title || userProfile?.job_title || '',
      company: card?.profile?.company || userProfile?.company || '',
      bio: card?.profile?.bio || userProfile?.bio || '',
      photo: card?.profile?.photo || userProfile?.avatar_url || null
    },
    design: {
      colorScheme: card?.design?.colorScheme || 'leo-orange',
      fontFamily: card?.design?.fontFamily || 'Inter',
      fontSize: card?.design?.fontSize || 'medium',
      fontWeight: card?.design?.fontWeight || 'medium'
    },
    links: card?.links || [],
    leadCapture: {
      enabled: card?.leadCapture?.enabled || false,
      fields: card?.leadCapture?.fields || ['name', 'email'],
      timing: card?.leadCapture?.timing || 'immediate',
      message: card?.leadCapture?.message || 'Get in touch!'
    },
    followUp: {
      enabled: card?.followUp?.enabled || false,
      subject: card?.followUp?.subject || 'Thanks for connecting!',
      message: card?.followUp?.message || 'It was great meeting you...'
    },
    sharing: {
      url: card?.sharing?.url || '',
      qrEnabled: card?.sharing?.qrEnabled || true,
      trackingEnabled: card?.sharing?.trackingEnabled || true
    }
  })

  // Auto-save functionality
  useEffect(() => {
    if (autoSave) {
      const timer = setTimeout(() => {
        handleSave()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cardData, autoSave])

  const handleSave = () => {
    onUpdate({
      ...card,
      profile: cardData.profile,
      design: cardData.design,
      links: cardData.links,
      leadCapture: cardData.leadCapture,
      followUp: cardData.followUp,
      sharing: cardData.sharing,
      updated_at: new Date().toISOString()
    })
    setLastSaved(new Date())
  }

  const updateCardData = (section: string, data: any) => {
    setCardData(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], ...data }
    }))
  }

  const addLink = (platform: string) => {
    const newLink = {
      id: Date.now().toString(),
      platform,
      url: '',
      visible: true,
      order: cardData.links.length
    }
    updateCardData('links', [...cardData.links, newLink])
  }

  const updateLink = (id: string, data: any) => {
    const updatedLinks = cardData.links.map((link: any) => 
      link.id === id ? { ...link, ...data } : link
    )
    updateCardData('links', updatedLinks)
  }

  const removeLink = (id: string) => {
    const updatedLinks = cardData.links.filter((link: any) => link.id !== id)
    updateCardData('links', updatedLinks)
  }

  const generateQRCode = () => {
    // QR code generation logic
    toast.success('QR code generated successfully!')
  }

  const copyShareLink = () => {
    if (cardData.sharing.url) {
      navigator.clipboard.writeText(cardData.sharing.url)
      toast.success('Link copied to clipboard!')
    }
  }

  const getDevicePreviewSize = () => {
    switch (selectedDevice) {
      case 'mobile':
        return { width: '375px', height: '667px' }
      case 'tablet':
        return { width: '768px', height: '1024px' }
      case 'desktop':
        return { width: '1200px', height: '800px' }
      default:
        return { width: '375px', height: '667px' }
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Navigation - Module Selector */}
      <div className="h-12 bg-surface border-b border-border flex items-center px-6">
        <div className="flex bg-muted rounded-lg p-1">
          {MODULE_ITEMS.map((module) => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`
                px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200
                ${activeModule === module.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }
              `}
            >
              {module.label}
            </button>
          ))}
        </div>
        
        {/* Auto-save indicator */}
        <div className="ml-auto flex items-center text-xs text-text-tertiary">
          <div className="w-2 h-2 rounded-full bg-success mr-2" />
          All changes saved
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Editor Panel */}
        <div className="w-96 bg-surface border-r border-border flex flex-col">
          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b border-border p-4">
              <TabsList className="grid w-full grid-cols-3 gap-1">
                {EDITOR_TABS.slice(0, 3).map((tab) => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsList className="grid w-full grid-cols-3 gap-1 mt-1">
                {EDITOR_TABS.slice(3).map((tab) => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* About Tab */}
              <TabsContent value="about" className="mt-0 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Profile Information</h3>
                  
                  {/* Profile Photo */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-2 block">Profile Photo</Label>
                    <div className="relative">
                      <div className="w-30 h-30 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                        {cardData.profile.photo ? (
                          <img 
                            src={cardData.profile.photo} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-6 h-6 mx-auto mb-1 text-text-tertiary" />
                            <p className="text-xs text-text-tertiary">Upload photo</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName" className="text-sm font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="fullName"
                        value={cardData.profile.fullName}
                        onChange={(e) => updateCardData('profile', { fullName: e.target.value })}
                        placeholder="e.g., Sarah Johnson"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="jobTitle" className="text-sm font-medium">
                        Job Title *
                      </Label>
                      <Input
                        id="jobTitle"
                        value={cardData.profile.jobTitle}
                        onChange={(e) => updateCardData('profile', { jobTitle: e.target.value })}
                        placeholder="e.g., Senior Product Manager"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="company" className="text-sm font-medium">
                        Company
                      </Label>
                      <Input
                        id="company"
                        value={cardData.profile.company}
                        onChange={(e) => updateCardData('profile', { company: e.target.value })}
                        placeholder="e.g., TechCorp Inc."
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bio" className="text-sm font-medium">
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        value={cardData.profile.bio}
                        onChange={(e) => updateCardData('profile', { bio: e.target.value })}
                        placeholder="Tell people about yourself..."
                        rows={3}
                        maxLength={500}
                        className="mt-1 resize-none"
                      />
                      <p className="text-xs text-text-tertiary mt-1">
                        {cardData.profile.bio.length}/500 characters
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Design Tab */}
              <TabsContent value="design" className="mt-0 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Color Scheme</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {COLOR_SCHEMES.map((scheme) => (
                      <motion.button
                        key={scheme.id}
                        onClick={() => updateCardData('design', { colorScheme: scheme.id })}
                        className={`
                          relative p-3 rounded-lg border-2 transition-all
                          ${cardData.design.colorScheme === scheme.id
                            ? 'border-primary shadow-md'
                            : 'border-border hover:border-border-hover'
                          }
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div 
                          className="w-8 h-8 rounded-full mx-auto mb-2"
                          style={{ backgroundColor: scheme.primary }}
                        />
                        <p className="text-xs font-medium">{scheme.name}</p>
                        {cardData.design.colorScheme === scheme.id && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-4">Typography</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Font Family</Label>
                      <Select 
                        value={cardData.design.fontFamily} 
                        onValueChange={(value) => updateCardData('design', { fontFamily: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                          <SelectItem value="Georgia">Georgia</SelectItem>
                          <SelectItem value="Times">Times</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Size</Label>
                        <Select 
                          value={cardData.design.fontSize} 
                          onValueChange={(value) => updateCardData('design', { fontSize: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Weight</Label>
                        <Select 
                          value={cardData.design.fontWeight} 
                          onValueChange={(value) => updateCardData('design', { fontWeight: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="bold">Bold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Links Tab */}
              <TabsContent value="links" className="mt-0 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Popular Platforms</h3>
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {POPULAR_PLATFORMS.map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => addLink(platform.id)}
                        className="flex flex-col items-center p-3 rounded-lg border border-border hover:border-border-hover hover:bg-surface-hover transition-colors"
                      >
                        <span className="text-lg mb-1">{platform.icon}</span>
                        <span className="text-xs font-medium">{platform.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    {cardData.links.map((link: any) => (
                      <div key={link.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {POPULAR_PLATFORMS.find(p => p.id === link.platform)?.icon || '🔗'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <Input
                              value={link.url}
                              onChange={(e) => updateLink(link.id, { url: e.target.value })}
                              placeholder="Enter URL..."
                              className="text-sm"
                            />
                          </div>
                        </div>
                        <Switch
                          checked={link.visible}
                          onCheckedChange={(checked) => updateLink(link.id, { visible: checked })}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLink(link.id)}
                          className="p-1"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {cardData.links.length === 0 && (
                      <p className="text-center text-text-tertiary text-sm py-8">
                        No links added yet. Select a platform above to get started.
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Lead Capture Tab */}
              <TabsContent value="lead-capture" className="mt-0 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Lead Capture Form</h3>
                    <Switch
                      checked={cardData.leadCapture.enabled}
                      onCheckedChange={(checked) => updateCardData('leadCapture', { enabled: checked })}
                    />
                  </div>
                  
                  {cardData.leadCapture.enabled && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Form Fields</Label>
                        <div className="mt-2 space-y-2">
                          {['name', 'email', 'company', 'phone', 'message'].map((field) => (
                            <div key={field} className="flex items-center justify-between">
                              <span className="text-sm capitalize">{field}</span>
                              <Switch
                                checked={cardData.leadCapture.fields.includes(field)}
                                onCheckedChange={(checked) => {
                                  const fields = checked 
                                    ? [...cardData.leadCapture.fields, field]
                                    : cardData.leadCapture.fields.filter((f: string) => f !== field)
                                  updateCardData('leadCapture', { fields })
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Trigger Timing</Label>
                        <Select 
                          value={cardData.leadCapture.timing} 
                          onValueChange={(value) => updateCardData('leadCapture', { timing: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="after-5s">After 5 seconds</SelectItem>
                            <SelectItem value="on-exit">On exit intent</SelectItem>
                            <SelectItem value="after-scroll">After scrolling</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="captureMessage" className="text-sm font-medium">
                          Call-to-Action Message
                        </Label>
                        <Input
                          id="captureMessage"
                          value={cardData.leadCapture.message}
                          onChange={(e) => updateCardData('leadCapture', { message: e.target.value })}
                          placeholder="e.g., Get in touch!"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Follow Up Email Tab */}
              <TabsContent value="follow-up" className="mt-0 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Auto Follow-Up Email</h3>
                    <Switch
                      checked={cardData.followUp.enabled}
                      onCheckedChange={(checked) => updateCardData('followUp', { enabled: checked })}
                    />
                  </div>
                  
                  {cardData.followUp.enabled && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="emailSubject" className="text-sm font-medium">
                          Email Subject
                        </Label>
                        <Input
                          id="emailSubject"
                          value={cardData.followUp.subject}
                          onChange={(e) => updateCardData('followUp', { subject: e.target.value })}
                          placeholder="e.g., Thanks for connecting!"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="emailMessage" className="text-sm font-medium">
                          Email Message
                        </Label>
                        <Textarea
                          id="emailMessage"
                          value={cardData.followUp.message}
                          onChange={(e) => updateCardData('followUp', { message: e.target.value })}
                          placeholder="Write your follow-up message..."
                          rows={6}
                          className="mt-1 resize-none"
                        />
                      </div>
                      
                      <div className="p-3 bg-primary-light rounded-lg">
                        <p className="text-xs text-primary font-medium mb-1">Available Variables:</p>
                        <div className="flex flex-wrap gap-2">
                          {['{{name}}', '{{email}}', '{{company}}'].map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Share Tab */}
              <TabsContent value="share" className="mt-0 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">QR Code</h3>
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <div className="w-32 h-32 bg-surface border-2 border-dashed border-border rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-text-tertiary rounded-sm mx-auto mb-2" />
                        <p className="text-xs text-text-tertiary">QR Code Preview</p>
                      </div>
                    </div>
                    <Button onClick={generateQRCode} className="w-full">
                      Generate QR Code
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-4">Share Link</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Card URL</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={cardData.sharing.url || `https://leo.cards/${user?.id}`}
                          readOnly
                          className="flex-1"
                        />
                        <Button variant="outline" onClick={copyShareLink}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Analytics Tracking</p>
                        <p className="text-xs text-text-tertiary">Track views and interactions</p>
                      </div>
                      <Switch
                        checked={cardData.sharing.trackingEnabled}
                        onCheckedChange={(checked) => updateCardData('sharing', { trackingEnabled: checked })}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right Preview Panel */}
        <div className="flex-1 bg-background p-8">
          {/* Device Selector */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex bg-surface border border-border rounded-lg p-1">
              {DEVICE_OPTIONS.map((device) => (
                <button
                  key={device.id}
                  onClick={() => setSelectedDevice(device.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                    ${selectedDevice === device.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }
                  `}
                >
                  <device.icon className="w-4 h-4" />
                  {device.label}
                </button>
              ))}
            </div>
          </div>

          {/* Device Preview */}
          <div className="flex items-center justify-center">
            <motion.div
              className="bg-surface border-2 border-border rounded-2xl shadow-lg p-6 overflow-hidden"
              style={getDevicePreviewSize()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Card Preview Content */}
              <div 
                className="h-full rounded-xl shadow-md overflow-hidden"
                style={{ 
                  backgroundColor: COLOR_SCHEMES.find(c => c.id === cardData.design.colorScheme)?.background || '#FFFFFF'
                }}
              >
                {/* Profile Section */}
                <div className="p-6 text-center">
                  {cardData.profile.photo ? (
                    <img 
                      src={cardData.profile.photo}
                      alt={cardData.profile.fullName}
                      className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                      <User className="w-8 h-8 text-text-tertiary" />
                    </div>
                  )}
                  
                  <h1 
                    className="text-lg font-bold mb-1"
                    style={{ 
                      color: COLOR_SCHEMES.find(c => c.id === cardData.design.colorScheme)?.primary || '#F26522',
                      fontFamily: cardData.design.fontFamily
                    }}
                  >
                    {cardData.profile.fullName || 'Your Name'}
                  </h1>
                  
                  <p className="text-sm text-text-secondary mb-2">
                    {cardData.profile.jobTitle || 'Your Job Title'}
                  </p>
                  
                  {cardData.profile.company && (
                    <p className="text-xs text-text-tertiary">
                      {cardData.profile.company}
                    </p>
                  )}
                  
                  {cardData.profile.bio && (
                    <p className="text-xs text-text-secondary mt-4 leading-relaxed">
                      {cardData.profile.bio}
                    </p>
                  )}
                </div>
                
                {/* Links Section */}
                {cardData.links.length > 0 && (
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-2 gap-2">
                      {cardData.links.filter((link: any) => link.visible && link.url).map((link: any) => (
                        <button
                          key={link.id}
                          className="flex items-center gap-2 p-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors"
                          style={{ 
                            color: COLOR_SCHEMES.find(c => c.id === cardData.design.colorScheme)?.primary || '#F26522'
                          }}
                        >
                          <span className="text-xs">
                            {POPULAR_PLATFORMS.find(p => p.id === link.platform)?.icon || '🔗'}
                          </span>
                          <span className="flex-1 text-left truncate">
                            {POPULAR_PLATFORMS.find(p => p.id === link.platform)?.name || 'Link'}
                          </span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}