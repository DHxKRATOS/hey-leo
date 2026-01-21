import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  User,
  Settings,
  Palette,
  Save,
  Plus,
  Trash2,
  Upload,
  ImageIcon,
  Type,
  Sparkles,
  Crown,
  Phone,
  Mail,
  Globe,
  Linkedin,
  Twitter,
  Instagram,
  Github,
  MapPin,
  Calendar,
  Target
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { ResponsiveCardRenderer } from '../ResponsiveCardRenderer'
import { toast } from 'sonner@2.0.3'

interface User {
  id: string
  email: string
  name: string
}

interface CardData {
  id: string
  name: string
  type: string
  status: string
  profile: {
    full_name: string
    job_title: string
    company: string
    location: string
    bio: string
    profile_photo_url: string
    cover_image_url: string
    company_logo_url: string
  }
  links: Array<{
    id: string
    platform: string
    url: string
    label: string
    is_visible: boolean
  }>
  fields: Array<{
    id: string
    label: string
    value: string
    type: string
    is_visible: boolean
  }>
  design: {
    template: string
    theme: string
    colors: {
      primary: string
      secondary: string
      background: string
      text: string
      accent?: string
    }
    fonts: {
      heading: string
      body: string
    }
    layout: string
    spacing: string
    corners: string
    shadows: string
  }
}

interface EnhancedBuildModuleProps {
  card: CardData
  onUpdate: (updates: Partial<CardData>) => void
  user: User
  userTier?: 'free' | 'professional' | 'executive'
  isEventMode?: boolean
  eventName?: string
}

export function EnhancedBuildModule({ 
  card, 
  onUpdate, 
  user, 
  userTier = 'free',
  isEventMode = false,
  eventName
}: EnhancedBuildModuleProps) {
  const [activeTab, setActiveTab] = useState('information')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Form states
  const [newLink, setNewLink] = useState({ platform: '', url: '', label: '' })
  const [newField, setNewField] = useState({ label: '', value: '', type: 'text' })

  // Template options
  const templates = [
    { id: 'leo-classic', name: 'Leo Classic', description: 'Clean and professional' },
    { id: 'leo-modern', name: 'Leo Modern', description: 'Contemporary design' },
    { id: 'leo-creative', name: 'Leo Creative', description: 'Bold and expressive' },
    { id: 'leo-minimal', name: 'Leo Minimal', description: 'Simple and elegant' },
    { id: 'leo-corporate', name: 'Leo Corporate', description: 'Business focused' },
    { id: 'leo-startup', name: 'Leo Startup', description: 'Dynamic and fresh' }
  ]

  const colorPalettes = [
    { name: 'Leo Orange', primary: '#F26522', secondary: '#E85A17', background: '#FFFFFF' },
    { name: 'Professional Blue', primary: '#2563EB', secondary: '#1D4ED8', background: '#FFFFFF' },
    { name: 'Creative Purple', primary: '#7C3AED', secondary: '#6D28D9', background: '#FFFFFF' },
    { name: 'Success Green', primary: '#059669', secondary: '#047857', background: '#FFFFFF' },
    { name: 'Elegant Black', primary: '#1F2937', secondary: '#111827', background: '#FFFFFF' },
    { name: 'Warm Red', primary: '#DC2626', secondary: '#B91C1C', background: '#FFFFFF' }
  ]

  const fontPairings = [
    { name: 'Inter (Default)', heading: 'Inter', body: 'Inter' },
    { name: 'Helvetica Neue', heading: 'Helvetica Neue', body: 'Helvetica Neue' },
    { name: 'SF Pro Display', heading: 'SF Pro Display', body: 'SF Pro Text' },
    { name: 'Roboto', heading: 'Roboto', body: 'Roboto' },
    { name: 'Poppins', heading: 'Poppins', body: 'Poppins' },
    { name: 'Montserrat', heading: 'Montserrat', body: 'Open Sans' }
  ]

  const socialPlatforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/username' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
    { id: 'github', name: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
    { id: 'website', name: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com' },
    { id: 'email', name: 'Email', icon: Mail, placeholder: 'your@email.com' },
    { id: 'phone', name: 'Phone', icon: Phone, placeholder: '+1 (555) 123-4567' }
  ]

  const fieldTypes = [
    { id: 'text', name: 'Text', icon: Type },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'phone', name: 'Phone', icon: Phone },
    { id: 'url', name: 'URL', icon: Globe },
    { id: 'location', name: 'Location', icon: MapPin },
    { id: 'date', name: 'Date', icon: Calendar }
  ]

  // Auto-save functionality
  useEffect(() => {
    if (hasChanges) {
      const timer = setTimeout(() => {
        handleAutoSave()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [card, hasChanges])

  const handleAutoSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate(card)
      setLastSaved(new Date())
      setHasChanges(false)
      toast.success('Auto-saved! 💾')
    } catch (error) {
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCardUpdate = (updates: Partial<CardData>) => {
    onUpdate({ ...card, ...updates })
    setHasChanges(true)
  }

  const handleProfileUpdate = (field: keyof CardData['profile'], value: string) => {
    handleCardUpdate({
      profile: { ...card.profile, [field]: value }
    })
  }

  const handleDesignUpdate = (updates: Partial<CardData['design']>) => {
    handleCardUpdate({
      design: { ...card.design, ...updates }
    })
  }

  const handleAddLink = () => {
    if (!newLink.platform || !newLink.url) {
      toast.error('Please fill in all link fields')
      return
    }

    const link = {
      id: `link-${Date.now()}`,
      platform: newLink.platform,
      url: newLink.url,
      label: newLink.label || newLink.platform,
      is_visible: true
    }

    handleCardUpdate({
      links: [...(card.links || []), link]
    })

    setNewLink({ platform: '', url: '', label: '' })
    toast.success('Link added! 🔗')
  }

  const handleRemoveLink = (linkId: string) => {
    handleCardUpdate({
      links: card.links?.filter(link => link.id !== linkId) || []
    })
    toast.success('Link removed')
  }

  const handleAddField = () => {
    if (!newField.label || !newField.value) {
      toast.error('Please fill in all field details')
      return
    }

    const field = {
      id: `field-${Date.now()}`,
      label: newField.label,
      value: newField.value,
      type: newField.type,
      is_visible: true
    }

    handleCardUpdate({
      fields: [...(card.fields || []), field]
    })

    setNewField({ label: '', value: '', type: 'text' })
    toast.success('Field added! ✨')
  }

  const handleRemoveField = (fieldId: string) => {
    handleCardUpdate({
      fields: card.fields?.filter(field => field.id !== fieldId) || []
    })
    toast.success('Field removed')
  }

  const getPlatformIcon = (platform: string) => {
    const platformData = socialPlatforms.find(p => p.id === platform.toLowerCase())
    return platformData?.icon || Globe
  }

  // Tab configuration - Simplified to remove advanced features
  const buildTabs = [
    {
      id: 'information',
      label: 'Information',
      icon: <User className="w-4 h-4" />,
      description: 'Profile details and contact info'
    },
    {
      id: 'display',
      label: 'Design',
      icon: <Palette className="w-4 h-4" />,
      description: 'Design and visual styling'
    },
    {
      id: 'fields',
      label: 'Fields',
      icon: <Settings className="w-4 h-4" />,
      description: 'Custom fields and data'
    }
  ]

  const renderInformationTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Profile Information</h3>
        <p className="text-sm text-muted-foreground">
          Your professional details that appear on your business card
        </p>
      </div>

      {/* Profile Photo */}
      <Card className="p-6 bg-card border-border">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Profile Photo</h4>
            {userTier !== 'free' && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                <Crown className="w-3 h-3 mr-1" />
                Pro Feature
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden">
              {card.profile.profile_photo_url ? (
                <img
                  src={card.profile.profile_photo_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 text-primary mx-auto mb-1" />
                  <span className="text-xs text-primary font-medium">Upload</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                disabled={userTier === 'free'}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
              <p className="text-xs text-muted-foreground">
                Recommended: 400x400px, JPG or PNG format
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Basic Information */}
      <Card className="p-6 bg-card border-border">
        <div className="space-y-6">
          <h4 className="font-medium text-foreground">Basic Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground font-medium">Full Name *</Label>
              <Input
                value={card.profile.full_name}
                onChange={(e) => handleProfileUpdate('full_name', e.target.value)}
                placeholder="Your full name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-foreground font-medium">Job Title *</Label>
              <Input
                value={card.profile.job_title}
                onChange={(e) => handleProfileUpdate('job_title', e.target.value)}
                placeholder="Your job title"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-foreground font-medium">Company</Label>
              <Input
                value={card.profile.company}
                onChange={(e) => handleProfileUpdate('company', e.target.value)}
                placeholder="Your company"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-foreground font-medium">Location</Label>
              <Input
                value={card.profile.location}
                onChange={(e) => handleProfileUpdate('location', e.target.value)}
                placeholder="City, Country"
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-foreground font-medium">Bio</Label>
            <Textarea
              value={card.profile.bio}
              onChange={(e) => handleProfileUpdate('bio', e.target.value)}
              placeholder="Tell people about yourself..."
              rows={4}
              className="mt-1 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {card.profile.bio?.length || 0}/500 characters
            </p>
          </div>
        </div>
      </Card>

      {/* Contact Links */}
      <Card className="p-6 bg-card border-border">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Contact Links</h4>
            <Badge variant="outline">
              {card.links?.length || 0} links
            </Badge>
          </div>
          
          {/* Existing Links */}
          <div className="space-y-3">
            {card.links?.map((link) => {
              const PlatformIcon = getPlatformIcon(link.platform)
              return (
                <div key={link.id} className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <PlatformIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{link.label}</p>
                    <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveLink(link.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )
            })}
          </div>
          
          {/* Add New Link */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-4">
            <h5 className="font-medium text-foreground">Add New Link</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select
                value={newLink.platform}
                onValueChange={(value) => setNewLink(prev => ({ ...prev, platform: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  {socialPlatforms.map((platform) => {
                    const Icon = platform.icon
                    return (
                      <SelectItem key={platform.id} value={platform.id}>
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4" />
                          <span>{platform.name}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              
              <Input
                value={newLink.url}
                onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                placeholder="URL or contact info"
              />
              
              <Input
                value={newLink.label}
                onChange={(e) => setNewLink(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Label (optional)"
              />
            </div>
            
            <Button onClick={handleAddLink} size="sm" className="w-full">
              <Plus className="w-3 h-3 mr-2" />
              Add Link
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderFieldsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Custom Fields</h3>
        <p className="text-sm text-muted-foreground">
          Add custom fields to capture specific information
        </p>
      </div>

      {/* Existing Fields */}
      {card.fields && card.fields.length > 0 && (
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">Current Fields</h4>
              <Badge variant="outline">
                {card.fields.length} fields
              </Badge>
            </div>
            
            <div className="space-y-3">
              {card.fields.map((field) => {
                const TypeIcon = fieldTypes.find(t => t.id === field.type)?.icon || Type
                return (
                  <div key={field.id} className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <TypeIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{field.label}</p>
                      <p className="text-sm text-muted-foreground">{field.value}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {field.type}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveField(field.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Add New Field */}
      <Card className="p-6 bg-card border-border">
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Add Custom Field</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Field Type</Label>
              <Select
                value={newField.type}
                onValueChange={(value) => setNewField(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4" />
                          <span>{type.name}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Field Label</Label>
              <Input
                value={newField.label}
                onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., Portfolio URL"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Field Value</Label>
              <Input
                value={newField.value}
                onChange={(e) => setNewField(prev => ({ ...prev, value: e.target.value }))}
                placeholder="e.g., https://portfolio.com"
                className="mt-1"
              />
            </div>
          </div>
          
          <Button onClick={handleAddField} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
        </div>
      </Card>

      {/* Field Management Tips */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <h4 className="font-medium text-foreground">Field Tips</h4>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Use fields for specific contact methods or additional info</li>
            <li>• Keep field labels clear and concise</li>
            <li>• Consider your audience when choosing field types</li>
            <li>• Fields appear in the order they're added to your card</li>
          </ul>
        </div>
      </Card>
    </div>
  )

  const renderDisplayTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Design & Display</h3>
        <p className="text-sm text-muted-foreground">
          Customize the visual appearance of your business card
        </p>
      </div>

      {/* Template Selection */}
      <Card className="p-6 bg-card border-border">
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Card Template</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  card.design.template === template.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleDesignUpdate({ template: template.id })}
              >
                <div className="aspect-[3/2] bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">{template.name}</span>
                </div>
                <p className="font-medium text-foreground text-sm">{template.name}</p>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Color Palette */}
      <Card className="p-6 bg-card border-border">
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Color Palette</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {colorPalettes.map((palette) => (
              <div
                key={palette.name}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  card.design.colors.primary === palette.primary
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleDesignUpdate({
                  colors: {
                    ...card.design.colors,
                    primary: palette.primary,
                    secondary: palette.secondary,
                    background: palette.background
                  }
                })}
              >
                <div className="flex space-x-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: palette.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: palette.secondary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full border" 
                    style={{ backgroundColor: palette.background }}
                  />
                </div>
                <p className="text-sm font-medium text-foreground">{palette.name}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Typography */}
      <Card className="p-6 bg-card border-border">
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Typography</h4>
          <div className="space-y-3">
            {fontPairings.map((font) => (
              <div
                key={font.name}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  card.design.fonts.heading === font.heading
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleDesignUpdate({
                  fonts: { heading: font.heading, body: font.body }
                })}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground" style={{ fontFamily: font.heading }}>
                      {font.name}
                    </p>
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: font.body }}>
                      Sample text with this font pairing
                    </p>
                  </div>
                  {card.design.fonts.heading === font.heading && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )

  return (
    <TooltipProvider>
      <div className="h-full bg-background">
        {/* Header */}
        <div className="border-b border-border bg-surface px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Build Your Card</h1>
                  <p className="text-sm text-muted-foreground">
                    {isEventMode && eventName 
                      ? `Creating card for ${eventName}` 
                      : 'Design and customize your business card'
                    }
                  </p>
                </div>
              </div>
              
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                <Crown className="w-3 h-3 mr-1" />
                {userTier === 'free' ? 'Free' : userTier === 'professional' ? 'Pro' : 'Executive'}
              </Badge>
            </div>

            {/* Save Status */}
            <div className="flex items-center space-x-4">
              {isSaving && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              )}
              
              {lastSaved && !hasChanges && !isSaving && (
                <div className="flex items-center space-x-2 text-sm text-success">
                  <Save className="w-4 h-4" />
                  Saved {lastSaved.toLocaleTimeString()}
                </div>
              )}

              {hasChanges && !isSaving && (
                <div className="text-sm text-warning">
                  Unsaved changes
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-200px)]">
          {/* Editor Panel */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="border-b border-border bg-surface px-8 py-4">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  {buildTabs.map((tab) => (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id}
                      className="flex items-center space-x-2"
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-4xl">
                  <TabsContent value="information" className="mt-0">
                    {renderInformationTab()}
                  </TabsContent>
                  
                  <TabsContent value="display" className="mt-0">
                    {renderDisplayTab()}
                  </TabsContent>
                  
                  <TabsContent value="fields" className="mt-0">
                    {renderFieldsTab()}
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="w-96 border-l border-border bg-surface flex flex-col">
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold text-foreground mb-2">Live Preview</h3>
              <p className="text-sm text-muted-foreground">
                See how your card looks in real-time
              </p>
            </div>
            
            <div className="flex-1 p-6 flex items-center justify-center">
              <div className="w-full max-w-sm">
                <ResponsiveCardRenderer 
                  card={card}
                  device="mobile"
                  className="shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}