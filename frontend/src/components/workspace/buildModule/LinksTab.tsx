import React, { useState } from 'react'
import { Link, Plus, X, GripVertical, ExternalLink, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react'
import { Card } from '../../ui/card'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Switch } from '../../ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion'
import { toast } from 'sonner@2.0.3'

interface LinkData {
  id: string
  platform: string
  url: string
  label: string
  icon?: string
  is_visible: boolean
  order: number
}

interface LinksTabProps {
  links: LinkData[]
  onLinksUpdate: (links: LinkData[]) => void
  userTier: string
  expandedSections: string[]
  onExpandedSectionsChange: (sections: string[]) => void
}

// Professional Links - Refined for business networking
const PROFESSIONAL_LINKS = [
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/in/username', category: 'essential' },
  { id: 'calendar', name: 'Calendar Booking', icon: '📅', placeholder: 'https://calendly.com/yourusername', category: 'essential' },
  { id: 'website', name: 'Portfolio/Website', icon: '🌐', placeholder: 'https://yourwebsite.com', category: 'essential' },
  { id: 'email', name: 'Email', icon: '✉️', placeholder: 'your@email.com', category: 'essential' },
  { id: 'phone', name: 'Phone', icon: '📞', placeholder: '+1 (555) 123-4567', category: 'contact' }
]

// Professional Resources
const PROFESSIONAL_RESOURCES = [
  { id: 'portfolio', name: 'Portfolio', icon: '🎨', placeholder: 'https://yourportfolio.com' },
  { id: 'case-studies', name: 'Case Studies', icon: '📊', placeholder: 'https://yourwork.com/cases' },
  { id: 'testimonials', name: 'Testimonials', icon: '⭐', placeholder: 'https://testimonials.com' },
  { id: 'resume', name: 'Resume/CV', icon: '📄', placeholder: 'https://drive.google.com/resume' },
  { id: 'media-kit', name: 'Media Kit', icon: '📦', placeholder: 'https://mediakit.com' },
  { id: 'speaking', name: 'Speaking Topics', icon: '🎤', placeholder: 'https://speaking.com' }
]

// Additional Social Platforms
const SOCIAL_PLATFORMS = [
  { id: 'twitter', name: 'Twitter', icon: '🐦', placeholder: 'https://twitter.com/username' },
  { id: 'instagram', name: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/username' },
  { id: 'facebook', name: 'Facebook', icon: '👥', placeholder: 'https://facebook.com/username' },
  { id: 'github', name: 'GitHub', icon: '💻', placeholder: 'https://github.com/username' },
  { id: 'youtube', name: 'YouTube', icon: '📺', placeholder: 'https://youtube.com/@username' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', placeholder: 'https://tiktok.com/@username' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', placeholder: '+1 (555) 123-4567' },
  { id: 'telegram', name: 'Telegram', icon: '✈️', placeholder: 'https://t.me/username' }
]

// Icon options for custom links
const CUSTOM_LINK_ICONS = [
  { id: 'link', icon: '🔗', name: 'Link' },
  { id: 'document', icon: '📄', name: 'Document' },
  { id: 'calendar', icon: '📅', name: 'Calendar' },
  { id: 'location', icon: '📍', name: 'Location' },
  { id: 'portfolio', icon: '🎨', name: 'Portfolio' },
  { id: 'shop', icon: '🛒', name: 'Shop' },
  { id: 'blog', icon: '📝', name: 'Blog' },
  { id: 'podcast', icon: '🎙️', name: 'Podcast' },
  { id: 'video', icon: '🎥', name: 'Video' },
  { id: 'music', icon: '🎵', name: 'Music' },
  { id: 'book', icon: '📚', name: 'Book' },
  { id: 'download', icon: '⬇️', name: 'Download' }
]

export function LinksTab({
  links,
  onLinksUpdate,
  userTier,
  expandedSections,
  onExpandedSectionsChange
}: LinksTabProps) {
  const [newCustomLink, setNewCustomLink] = useState({
    label: '',
    url: '',
    icon: 'link'
  })
  const [draggedLinkId, setDraggedLinkId] = useState<string | null>(null)
  const [linkDisplayStyle, setLinkDisplayStyle] = useState('buttons')
  const [linkOpenBehavior, setLinkOpenBehavior] = useState('new-tab')
  const [trackClicks, setTrackClicks] = useState(true)

  // Validate URL format
  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return false
    
    // Email validation
    if (url.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(url)
    }
    
    // Phone validation
    if (url.startsWith('+') || /^\d/.test(url)) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      return phoneRegex.test(url.replace(/[\s\-\(\)]/g, ''))
    }
    
    // URL validation
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      return ['http:', 'https:'].includes(urlObj.protocol)
    } catch {
      return false
    }
  }

  // Add a predefined platform link
  const addPlatformLink = (platform: any) => {
    const newLink: LinkData = {
      id: `link-${Date.now()}`,
      platform: platform.id,
      url: '',
      label: platform.name,
      icon: platform.icon,
      is_visible: true,
      order: links.length
    }

    onLinksUpdate([...links, newLink])
    toast.success(`${platform.name} link added!`)
  }

  // Add a custom link
  const addCustomLink = () => {
    if (!newCustomLink.label.trim() || !newCustomLink.url.trim()) {
      toast.error('Please fill in both label and URL')
      return
    }

    if (!isValidUrl(newCustomLink.url)) {
      toast.error('Please enter a valid URL')
      return
    }

    const selectedIcon = CUSTOM_LINK_ICONS.find(icon => icon.id === newCustomLink.icon)
    
    const newLink: LinkData = {
      id: `custom-link-${Date.now()}`,
      platform: 'custom',
      url: newCustomLink.url,
      label: newCustomLink.label,
      icon: selectedIcon?.icon || '🔗',
      is_visible: true,
      order: links.length
    }

    onLinksUpdate([...links, newLink])
    setNewCustomLink({ label: '', url: '', icon: 'link' })
    toast.success('Custom link added!')
  }

  // Update a link
  const updateLink = (id: string, updates: Partial<LinkData>) => {
    const updatedLinks = links.map(link => 
      link.id === id ? { ...link, ...updates } : link
    )
    onLinksUpdate(updatedLinks)
  }

  // Remove a link
  const removeLink = (id: string) => {
    const updatedLinks = links.filter(link => link.id !== id)
      .map((link, index) => ({ ...link, order: index }))
    onLinksUpdate(updatedLinks)
    toast.success('Link removed')
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, linkId: string) => {
    setDraggedLinkId(linkId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetLinkId: string) => {
    e.preventDefault()
    
    if (!draggedLinkId || draggedLinkId === targetLinkId) {
      setDraggedLinkId(null)
      return
    }

    const draggedIndex = links.findIndex(link => link.id === draggedLinkId)
    const targetIndex = links.findIndex(link => link.id === targetLinkId)
    
    if (draggedIndex === -1 || targetIndex === -1) return

    const newLinks = [...links]
    const [draggedLink] = newLinks.splice(draggedIndex, 1)
    newLinks.splice(targetIndex, 0, draggedLink)
    
    // Update order values
    const reorderedLinks = newLinks.map((link, index) => ({ ...link, order: index }))
    
    onLinksUpdate(reorderedLinks)
    setDraggedLinkId(null)
    toast.success('Links reordered')
  }

  const getPlatformInfo = (platformId: string) => {
    return [...PROFESSIONAL_LINKS, ...PROFESSIONAL_RESOURCES, ...SOCIAL_PLATFORMS].find(p => p.id === platformId)
  }

  return (
    <div className="p-6 space-y-6">
      <Accordion type="multiple" value={expandedSections} onValueChange={onExpandedSectionsChange}>
        
        {/* Professional Networks */}
        <AccordionItem value="professional-networks">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <Link className="h-4 w-4 text-primary" />
              <span>Professional Networks</span>
              <Badge variant="outline" className="text-xs">Essential</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {PROFESSIONAL_LINKS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => addPlatformLink(platform)}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all group hover:shadow-md ${
                    platform.category === 'essential' 
                      ? 'border-primary/30 bg-primary/5 hover:border-primary' 
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                    {platform.icon}
                  </span>
                  <span className="text-xs font-medium text-center">{platform.name}</span>
                  {platform.category === 'essential' && (
                    <Badge variant="outline" className="mt-1 text-xs">Required</Badge>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-primary font-medium">
              LinkedIn is required for professionals - Add calendar booking for easy meeting scheduling
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* Professional Resources */}
        <AccordionItem value="professional-resources">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <span>📚</span>
              <span>Professional Resources</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {PROFESSIONAL_RESOURCES.map((resource) => (
                <button
                  key={resource.id}
                  onClick={() => addPlatformLink(resource)}
                  className="flex flex-col items-center p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <span className="text-xl mb-2 group-hover:scale-110 transition-transform">
                    {resource.icon}
                  </span>
                  <span className="text-xs font-medium text-center">{resource.name}</span>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Social Platforms */}
        <AccordionItem value="social-platforms">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <span>📱</span>
              <span>Social Platforms</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {SOCIAL_PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => addPlatformLink(platform)}
                  className="flex flex-col items-center p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <span className="text-xl mb-1 group-hover:scale-110 transition-transform">
                    {platform.icon}
                  </span>
                  <span className="text-xs font-medium text-center">{platform.name}</span>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Link Display Options */}
        <AccordionItem value="link-styling">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <span>🎨</span>
              <span>Link Appearance</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            {/* Display Style */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Display Style</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'buttons', name: 'Buttons', description: 'Full-width buttons' },
                  { id: 'list', name: 'List', description: 'Simple list format' },
                  { id: 'icons', name: 'Icons Only', description: 'Icon grid layout' }
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setLinkDisplayStyle(style.id)}
                    className={`p-3 border text-center transition-all ${
                      linkDisplayStyle === style.id
                        ? 'border-primary bg-primary-light'
                        : 'border-border hover:border-border-hover'
                    }`}
                    style={{
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-xs)',
                      fontFamily: 'var(--font-family)'
                    }}
                  >
                    <div className="font-medium">{style.name}</div>
                    <div className="text-muted-foreground text-xs">{style.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Open Behavior */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Open Links In</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'new-tab', name: 'New Tab', description: 'Opens in new browser tab' },
                  { id: 'same-tab', name: 'Same Tab', description: 'Opens in current tab' }
                ].map((behavior) => (
                  <button
                    key={behavior.id}
                    onClick={() => setLinkOpenBehavior(behavior.id)}
                    className={`p-3 border text-left transition-all ${
                      linkOpenBehavior === behavior.id
                        ? 'border-primary bg-primary-light'
                        : 'border-border hover:border-border-hover'
                    }`}
                    style={{
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-xs)',
                      fontFamily: 'var(--font-family)'
                    }}
                  >
                    <div className="font-medium">{behavior.name}</div>
                    <div className="text-muted-foreground text-xs">{behavior.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Analytics Toggle */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="text-sm font-medium">Track Link Clicks</Label>
                <p className="text-xs text-muted-foreground">Get analytics on link performance</p>
              </div>
              <Switch
                checked={trackClicks}
                onCheckedChange={setTrackClicks}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Custom Link */}
        <AccordionItem value="custom-link">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <Plus className="h-4 w-4 text-primary" />
              <span>Custom Link</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <Card className="p-4 border-primary/20 bg-primary/5">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Custom Label</Label>
                  <Input
                    value={newCustomLink.label}
                    onChange={(e) => setNewCustomLink(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g., My Portfolio, Book a Call, Download Resume"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">URL</Label>
                  <Input
                    value={newCustomLink.url}
                    onChange={(e) => setNewCustomLink(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com or email@domain.com"
                    className="mt-1"
                  />
                  <div className="flex items-center mt-1">
                    {newCustomLink.url && (
                      <>
                        {isValidUrl(newCustomLink.url) ? (
                          <div className="flex items-center text-xs text-success">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Valid URL
                          </div>
                        ) : (
                          <div className="flex items-center text-xs text-error">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Invalid URL format
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Icon</Label>
                  <Select 
                    value={newCustomLink.icon} 
                    onValueChange={(value) => setNewCustomLink(prev => ({ ...prev, icon: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CUSTOM_LINK_ICONS.map((icon) => (
                        <SelectItem key={icon.id} value={icon.id}>
                          <div className="flex items-center space-x-2">
                            <span>{icon.icon}</span>
                            <span>{icon.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={addCustomLink} 
                  className="w-full" 
                  disabled={!newCustomLink.label.trim() || !newCustomLink.url.trim() || !isValidUrl(newCustomLink.url)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Link
                </Button>
              </div>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Your Links */}
        <AccordionItem value="your-links">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-primary" />
                <span>Your Links</span>
              </div>
              <Badge variant="outline" className="mr-2">
                {links.length} links
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            {links.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Link className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No links added yet</p>
                <p className="text-xs">Add platforms or custom links to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {links
                  .sort((a, b) => a.order - b.order)
                  .map((link) => {
                    const platformInfo = getPlatformInfo(link.platform)
                    const displayIcon = link.platform === 'custom' ? link.icon : platformInfo?.icon
                    
                    return (
                      <div
                        key={link.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, link.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, link.id)}
                        className={`flex items-center space-x-3 p-3 bg-muted rounded-lg border transition-all cursor-move hover:shadow-md ${
                          draggedLinkId === link.id ? 'opacity-50' : ''
                        }`}
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        
                        <div className="w-8 h-8 bg-background rounded-lg flex items-center justify-center text-lg">
                          {displayIcon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{link.label}</span>
                            {link.platform === 'custom' && (
                              <Badge variant="outline" className="text-xs">Custom</Badge>
                            )}
                          </div>
                          <Input
                            value={link.url}
                            onChange={(e) => updateLink(link.id, { url: e.target.value })}
                            placeholder={platformInfo?.placeholder || 'Enter URL...'}
                            className="text-xs h-8"
                          />
                          {link.url && !isValidUrl(link.url) && (
                            <div className="flex items-center text-xs text-error mt-1">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Invalid URL format
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={link.is_visible}
                            onCheckedChange={(checked) => updateLink(link.id, { is_visible: checked })}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLink(link.id)}
                            className="p-1 text-muted-foreground hover:text-error"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Link Tips */}
        <AccordionItem value="link-tips">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <span>💡</span>
              <span>Link Tips & Best Practices</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Use custom links for specific actions like "Book a Call" or "Download Resume"</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Keep link labels short and clear (2-3 words max)</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Test your links before publishing to ensure they work correctly</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Drag and drop to reorder links - the order matters for user experience</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Use the visibility toggle to temporarily hide links without deleting them</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}