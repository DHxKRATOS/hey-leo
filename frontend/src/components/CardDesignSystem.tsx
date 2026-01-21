import React, { useState, useRef, useEffect } from 'react'
import { 
  Palette, 
  Type, 
  Layout, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Eye,
  Download,
  Share2,
  Copy,
  Sparkles,
  Wand2,
  Grid3X3,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Image as ImageIcon,
  Gradient,
  Layers,
  Zap,
  RefreshCw,
  Check,
  X,
  ChevronDown,
  Maximize2,
  Settings,
  Save,
  Undo,
  Redo
} from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Slider } from './ui/slider'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

interface DesignSystemProps {
  cardData: {
    profile: {
      full_name: string
      job_title: string
      company: string
      location: string
      bio: string
      profile_photo_url: string
    }
    links: Array<{
      id: string
      platform: string
      url: string
      label: string
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
  onDesignUpdate: (design: any) => void
  onExport: (format: 'png' | 'pdf' | 'svg') => void
  onShare: () => void
}

export function CardDesignSystem({ cardData, onDesignUpdate, onExport, onShare }: DesignSystemProps) {
  const [activeTab, setActiveTab] = useState('templates')
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [isGenerating, setIsGenerating] = useState(false)
  const [designHistory, setDesignHistory] = useState([cardData.design])
  const [historyIndex, setHistoryIndex] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Professional Templates with Leo branding
  const templates = [
    {
      id: 'leo-modern',
      name: 'Leo Modern',
      preview: '/templates/leo-modern.png',
      category: 'Professional',
      colors: { primary: '#F26522', secondary: '#FFF4F0', background: '#FFFFFF', text: '#1A1A1A' }
    },
    {
      id: 'leo-minimal',
      name: 'Leo Minimal', 
      preview: '/templates/leo-minimal.png',
      category: 'Minimal',
      colors: { primary: '#F26522', secondary: '#F7F7F7', background: '#FAFAFA', text: '#1A1A1A' }
    },
    {
      id: 'leo-executive',
      name: 'Leo Executive',
      preview: '/templates/leo-executive.png', 
      category: 'Executive',
      colors: { primary: '#F26522', secondary: '#1A1A1A', background: '#FFFFFF', text: '#1A1A1A' }
    },
    {
      id: 'leo-creative',
      name: 'Leo Creative',
      preview: '/templates/leo-creative.png',
      category: 'Creative',
      colors: { primary: '#F26522', secondary: '#E85A17', background: '#FAFAFA', text: '#1A1A1A' }
    },
    {
      id: 'leo-gradient',
      name: 'Leo Gradient',
      preview: '/templates/leo-gradient.png',
      category: 'Modern',
      colors: { primary: '#F26522', secondary: '#FF6B35', background: '#FFFFFF', text: '#1A1A1A' }
    },
    {
      id: 'leo-classic',
      name: 'Leo Classic',
      preview: '/templates/leo-classic.png',
      category: 'Traditional',
      colors: { primary: '#F26522', secondary: '#6B6B6B', background: '#FFFFFF', text: '#1A1A1A' }
    }
  ]

  // Color Palettes - Leo-inspired
  const colorPalettes = [
    {
      name: 'Leo Orange',
      colors: { primary: '#F26522', secondary: '#FFF4F0', background: '#FFFFFF', text: '#1A1A1A', accent: '#E85A17' }
    },
    {
      name: 'Leo Warm',
      colors: { primary: '#F26522', secondary: '#FEF2EC', background: '#FAFAFA', text: '#1A1A1A', accent: '#D2501C' }
    },
    {
      name: 'Executive Black',
      colors: { primary: '#1A1A1A', secondary: '#F7F7F7', background: '#FFFFFF', text: '#1A1A1A', accent: '#F26522' }
    },
    {
      name: 'Professional Blue',
      colors: { primary: '#2563EB', secondary: '#EFF6FF', background: '#FFFFFF', text: '#1A1A1A', accent: '#1D4ED8' }
    },
    {
      name: 'Creative Purple',
      colors: { primary: '#7C3AED', secondary: '#F3F4F6', background: '#FFFFFF', text: '#1A1A1A', accent: '#5B21B6' }
    },
    {
      name: 'Nature Green',
      colors: { primary: '#059669', secondary: '#ECFDF5', background: '#FFFFFF', text: '#1A1A1A', accent: '#047857' }
    }
  ]

  // Typography Options
  const fontPairings = [
    { name: 'Leo Default', heading: 'Inter', body: 'Inter', category: 'Modern' },
    { name: 'Professional', heading: 'Roboto', body: 'Open Sans', category: 'Business' },
    { name: 'Executive', heading: 'Playfair Display', body: 'Source Sans Pro', category: 'Elegant' },
    { name: 'Creative', heading: 'Montserrat', body: 'Lato', category: 'Creative' },
    { name: 'Tech Startup', heading: 'Space Grotesk', body: 'Inter', category: 'Modern' },
    { name: 'Classic', heading: 'Crimson Text', body: 'Lora', category: 'Traditional' }
  ]

  // Layout Options
  const layoutOptions = [
    { id: 'center', name: 'Centered', icon: <AlignCenter className="h-4 w-4" />, description: 'Classic centered layout' },
    { id: 'left', name: 'Left Aligned', icon: <AlignLeft className="h-4 w-4" />, description: 'Modern left alignment' },
    { id: 'asymmetric', name: 'Asymmetric', icon: <Grid3X3 className="h-4 w-4" />, description: 'Creative asymmetric design' },
    { id: 'split', name: 'Split View', icon: <Layers className="h-4 w-4" />, description: 'Two-column layout' }
  ]

  // AI Design Generation
  const generateAIDesign = async () => {
    setIsGenerating(true)
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate design based on profile data
    const aiSuggestion = {
      template: templates[Math.floor(Math.random() * templates.length)].id,
      colors: colorPalettes[Math.floor(Math.random() * colorPalettes.length)].colors,
      fonts: fontPairings[Math.floor(Math.random() * fontPairings.length)],
      layout: layoutOptions[Math.floor(Math.random() * layoutOptions.length)].id,
      spacing: 'comfortable',
      corners: 'rounded',
      shadows: 'subtle'
    }
    
    updateDesign(aiSuggestion)
    setIsGenerating(false)
  }

  // Design Update with History
  const updateDesign = (newDesign: any) => {
    const updatedDesign = { ...cardData.design, ...newDesign }
    
    // Add to history
    const newHistory = designHistory.slice(0, historyIndex + 1)
    newHistory.push(updatedDesign)
    setDesignHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    
    onDesignUpdate(updatedDesign)
  }

  // Undo/Redo functionality
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      onDesignUpdate(designHistory[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < designHistory.length - 1) {
      setHistoryIndex(historyIndex + 1) 
      onDesignUpdate(designHistory[historyIndex + 1])
    }
  }

  // Device-specific preview sizing
  const getPreviewSize = () => {
    switch (previewDevice) {
      case 'mobile': return { width: '320px', height: '568px', scale: 0.8 }
      case 'tablet': return { width: '768px', height: '1024px', scale: 0.4 }
      case 'desktop': return { width: '1200px', height: '800px', scale: 0.3 }
      default: return { width: '320px', height: '568px', scale: 0.8 }
    }
  }

  // Real-time Card Preview Component
  const CardPreview = () => {
    const { width, height, scale } = getPreviewSize()
    const design = cardData.design

    return (
      <div className="flex flex-col items-center space-y-4">
        {/* Device Selector */}
        <div className="flex bg-muted rounded-xl p-1">
          {[
            { id: 'mobile', icon: <Smartphone className="h-4 w-4" />, label: 'Mobile' },
            { id: 'tablet', icon: <Tablet className="h-4 w-4" />, label: 'Tablet' },
            { id: 'desktop', icon: <Monitor className="h-4 w-4" />, label: 'Desktop' }
          ].map((device) => (
            <button
              key={device.id}
              onClick={() => setPreviewDevice(device.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                previewDevice === device.id
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {device.icon}
              <span className="text-sm font-medium">{device.label}</span>
            </button>
          ))}
        </div>

        {/* Preview Container */}
        <div 
          className="bg-card border-2 border-border rounded-2xl shadow-lg overflow-hidden transition-all duration-300"
          style={{ 
            width, 
            height, 
            transform: `scale(${scale})`,
            transformOrigin: 'top center'
          }}
        >
          {/* Dynamic Card Content Based on Design */}
          <div 
            className="h-full p-6 overflow-hidden"
            style={{
              backgroundColor: design.colors.background,
              color: design.colors.text,
              fontFamily: design.fonts.body
            }}
          >
            {/* Header Section */}
            <div 
              className="h-20 -mx-6 -mt-6 mb-6 flex items-end px-6 pb-4"
              style={{
                background: `linear-gradient(135deg, ${design.colors.primary}, ${design.colors.primary}dd)`
              }}
            >
              <h1 
                className="text-white font-bold text-xl"
                style={{ fontFamily: design.fonts.heading }}
              >
                {cardData.profile.full_name || 'Your Name'}
              </h1>
            </div>

            {/* Profile Section */}
            <div className="space-y-4">
              {/* Profile Photo */}
              <div className="flex justify-center -mt-16 mb-8">
                <div 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden"
                  style={{ borderColor: design.colors.background }}
                >
                  {cardData.profile.profile_photo_url ? (
                    <img 
                      src={cardData.profile.profile_photo_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center text-2xl font-bold"
                      style={{ 
                        backgroundColor: `${design.colors.primary}20`,
                        color: design.colors.primary
                      }}
                    >
                      {cardData.profile.full_name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="text-center space-y-2">
                <p className="text-muted-foreground font-medium">
                  {cardData.profile.job_title || 'Job Title'}
                </p>
                {cardData.profile.company && (
                  <p className="text-sm text-muted-foreground">
                    {cardData.profile.company}
                  </p>
                )}
                {cardData.profile.location && (
                  <p className="text-sm text-muted-foreground">
                    {cardData.profile.location}
                  </p>
                )}
              </div>

              {/* Bio */}
              {cardData.profile.bio && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {cardData.profile.bio}
                  </p>
                </div>
              )}

              {/* Links */}
              <div className="space-y-2">
                {cardData.links
                  .filter(link => link.is_visible && link.url)
                  .slice(0, 4)
                  .map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-3 rounded-lg border transition-colors hover:shadow-md"
                      style={{ 
                        borderColor: `${design.colors.primary}20`,
                        backgroundColor: `${design.colors.primary}05`
                      }}
                    >
                      <span className="font-medium">{link.label}</span>
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: design.colors.primary }}
                      />
                    </div>
                  ))}
              </div>

              {/* CTA Button */}
              <button
                className="w-full py-3 px-4 rounded-lg font-medium transition-all hover:shadow-md"
                style={{
                  backgroundColor: design.colors.primary,
                  color: '#FFFFFF'
                }}
              >
                Get in Touch
              </button>
            </div>
          </div>
        </div>

        {/* Preview Actions */}
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => onExport('png')}>
            <Download className="h-4 w-4 mr-2" />
            Export PNG
          </Button>
          <Button size="sm" variant="outline" onClick={onShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Full Preview
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-background">
      {/* Design Controls Sidebar */}
      <div className="w-80 bg-surface border-r border-border overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Card Designer</h2>
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={undo}
                disabled={historyIndex === 0}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={redo}
                disabled={historyIndex === designHistory.length - 1}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* AI Design Generator */}
          <Button
            onClick={generateAIDesign}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-primary to-primary-hover text-primary-foreground hover:shadow-lg"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Generate AI Design'}
          </Button>
        </div>

        {/* Design Tabs */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
              <TabsTrigger value="colors" className="text-xs">Colors</TabsTrigger>
              <TabsTrigger value="typography" className="text-xs">Fonts</TabsTrigger>
              <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
            </TabsList>

            {/* Templates Tab */}
            <TabsContent value="templates" className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {templates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`relative overflow-hidden cursor-pointer border-2 transition-all hover:shadow-md ${
                      cardData.design.template === template.id 
                        ? 'border-primary shadow-lg' 
                        : 'border-border hover:border-border-hover'
                    }`}
                    onClick={() => updateDesign({ 
                      template: template.id,
                      colors: template.colors
                    })}
                  >

                    <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <div className="text-center">
                        <div 
                          className="w-8 h-8 rounded-full mx-auto mb-2"
                          style={{ backgroundColor: template.colors.primary }}
                        />
                        <div className="space-y-1">
                          <div className="h-2 bg-muted rounded w-16 mx-auto" />
                          <div className="h-1 bg-muted rounded w-12 mx-auto" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <p className="text-xs text-muted-foreground">{template.category}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors" className="mt-6 space-y-6">
              {/* Color Palettes */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Color Palettes</Label>
                <div className="space-y-3">
                  {colorPalettes.map((palette) => (
                    <Card
                      key={palette.name}
                      className={`p-3 cursor-pointer transition-all border-2 ${
                        cardData.design.colors.primary === palette.colors.primary
                          ? 'border-primary'
                          : 'border-border hover:border-border-hover'
                      }`}
                      onClick={() => updateDesign({ colors: palette.colors })}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{palette.name}</span>
                        <div className="flex space-x-1">
                          {Object.values(palette.colors).slice(0, 4).map((color, i) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded-full border border-border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Custom Colors</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={cardData.design.colors.primary}
                      onChange={(e) => updateDesign({ 
                        colors: { ...cardData.design.colors, primary: e.target.value }
                      })}
                      className="w-12 h-10 border border-border rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <Label className="text-xs">Primary Color</Label>
                      <Input
                        value={cardData.design.colors.primary}
                        onChange={(e) => updateDesign({ 
                          colors: { ...cardData.design.colors, primary: e.target.value }
                        })}
                        className="h-8 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Typography Tab */}
            <TabsContent value="typography" className="mt-6 space-y-6">
              <div className="space-y-4">
                {fontPairings.map((pairing) => (
                  <Card
                    key={pairing.name}
                    className={`p-4 cursor-pointer transition-all border-2 ${
                      cardData.design.fonts.heading === pairing.heading
                        ? 'border-primary'
                        : 'border-border hover:border-border-hover'
                    }`}
                    onClick={() => updateDesign({ 
                      fonts: { heading: pairing.heading, body: pairing.body }
                    })}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{pairing.name}</h4>
                        <Badge variant="outline" className="text-xs">{pairing.category}</Badge>
                      </div>
                      <div className="space-y-1">
                        <p 
                          className="text-lg font-semibold"
                          style={{ fontFamily: pairing.heading }}
                        >
                          Heading Font
                        </p>
                        <p 
                          className="text-sm text-muted-foreground"
                          style={{ fontFamily: pairing.body }}
                        >
                          Body text font for descriptions and content
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="mt-6 space-y-6">
              <div className="space-y-4">
                {layoutOptions.map((layout) => (
                  <Card
                    key={layout.id}
                    className={`p-4 cursor-pointer transition-all border-2 ${
                      cardData.design.layout === layout.id
                        ? 'border-primary'
                        : 'border-border hover:border-border-hover'
                    }`}
                    onClick={() => updateDesign({ layout: layout.id })}
                  >
                    <div className="flex items-center space-x-3">
                      {layout.icon}
                      <div>
                        <h4 className="font-medium text-sm">{layout.name}</h4>
                        <p className="text-xs text-muted-foreground">{layout.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Advanced Layout Controls */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Corner Radius</Label>
                  <Slider
                    value={[cardData.design.corners === 'sharp' ? 0 : cardData.design.corners === 'rounded' ? 50 : 100]}
                    onValueChange={([value]) => {
                      const corners = value === 0 ? 'sharp' : value === 50 ? 'rounded' : 'round'
                      updateDesign({ corners })
                    }}
                    max={100}
                    step={25}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Shadow Intensity</Label>
                  <Slider
                    value={[cardData.design.shadows === 'none' ? 0 : cardData.design.shadows === 'subtle' ? 50 : 100]}
                    onValueChange={([value]) => {
                      const shadows = value === 0 ? 'none' : value === 50 ? 'subtle' : 'strong'
                      updateDesign({ shadows })
                    }}
                    max={100}
                    step={50}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-8 flex items-center justify-center bg-muted/30">
        <CardPreview />
      </div>
    </div>
  )
}