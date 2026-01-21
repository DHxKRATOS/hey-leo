import React, { useState } from 'react'
import competitorImage from 'figma:asset/095247c4019eb10859c01b6b268e4c642b3c1681.png'
import { 
  Crown,
  Sparkles,
  Zap,
  Layers,
  Brush,
  Palette,
  CheckCircle,
  Star,
  Gradient,
  Diamond,
  Wand2
} from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

interface LeoCardDesignLayoutsProps {
  currentLayout: string
  onLayoutChange: (layout: string) => void
  userTier?: 'free' | 'professional' | 'executive'
}

export function LeoCardDesignLayouts({ currentLayout, onLayoutChange, userTier = 'free' }: LeoCardDesignLayoutsProps) {
  const [hoveredLayout, setHoveredLayout] = useState<string | null>(null)

  // Leo's Unique Creative Design Layouts
  const leoDesignLayouts = [
    {
      id: 'leo-classic',
      name: 'Leo Classic',
      description: 'Clean, professional with Leo orange accents',
      category: 'Essential',
      isPro: false,
      preview: {
        bg: 'linear-gradient(135deg, #FFFFFF 0%, #FFF4F0 100%)',
        accentColor: '#F26522',
        shape: 'rounded-2xl',
        layout: 'centered'
      },
      features: ['Centered layout', 'Leo orange header', 'Clean typography', 'Mobile optimized']
    },
    {
      id: 'leo-gradient-wave',
      name: 'Leo Wave',
      description: 'Dynamic gradient waves with Leo branding',
      category: 'Creative',
      isPro: true,
      preview: {
        bg: 'linear-gradient(135deg, #F26522 0%, #E85A17 50%, #D2501C 100%)',
        accentColor: '#FFFFFF',
        shape: 'rounded-3xl',
        layout: 'wave-pattern'
      },
      features: ['Gradient waves', 'Dynamic animations', 'Bold typography', 'Premium feel']
    },
    {
      id: 'leo-minimal-zen',
      name: 'Leo Zen',
      description: 'Ultra-minimal with perfect spacing',
      category: 'Minimal',
      isPro: true,
      preview: {
        bg: 'linear-gradient(180deg, #FAFAFA 0%, #F7F7F7 100%)',
        accentColor: '#F26522',
        shape: 'rounded-xl',
        layout: 'minimal-zen'
      },
      features: ['Zen spacing', 'Minimal elements', 'Focus on content', 'Apple-inspired']
    },
    {
      id: 'leo-executive-split',
      name: 'Leo Executive',
      description: 'Split layout for C-level professionals',
      category: 'Executive',
      isPro: true,
      preview: {
        bg: 'linear-gradient(90deg, #1A1A1A 0%, #2A2A2A 50%, #FFFFFF 50%, #FAFAFA 100%)',
        accentColor: '#F26522',
        shape: 'rounded-2xl',
        layout: 'split-executive'
      },
      features: ['Split design', 'Dark/light contrast', 'Executive feel', 'Bold presence']
    },
    {
      id: 'leo-creative-asymmetric',
      name: 'Leo Asymmetric',
      description: 'Creative asymmetric layout for designers',
      category: 'Creative',
      isPro: true,
      preview: {
        bg: 'linear-gradient(45deg, #FFF4F0 0%, #FFFFFF 30%, #F26522 30%, #E85A17 100%)',
        accentColor: '#FFFFFF',
        shape: 'rounded-2xl',
        layout: 'asymmetric-creative'
      },
      features: ['Asymmetric design', 'Creative blocks', 'Designer-friendly', 'Visual impact']
    },
    {
      id: 'leo-tech-geometric',
      name: 'Leo Geometric',
      description: 'Modern geometric patterns for tech professionals',
      category: 'Tech',
      isPro: true,
      preview: {
        bg: 'linear-gradient(135deg, #FFFFFF 0%, #FFF4F0 25%, #F26522 25%, #F26522 26%, #FFFFFF 26%, #FFFFFF 100%)',
        accentColor: '#F26522',
        shape: 'rounded-2xl',
        layout: 'geometric-tech'
      },
      features: ['Geometric patterns', 'Tech aesthetic', 'Clean lines', 'Modern feel']
    },
    {
      id: 'leo-startup-bold',
      name: 'Leo Startup',
      description: 'Bold, energetic for startup founders',
      category: 'Startup',
      isPro: true,
      preview: {
        bg: 'radial-gradient(circle at 30% 20%, #F26522 0%, #E85A17 25%, #D2501C 50%, #FFFFFF 51%, #FAFAFA 100%)',
        accentColor: '#F26522',
        shape: 'rounded-3xl',
        layout: 'startup-bold'
      },
      features: ['Bold gradients', 'Startup energy', 'Radial design', 'Eye-catching']
    },
    {
      id: 'leo-consultant-elegant',
      name: 'Leo Elegant',
      description: 'Sophisticated elegance for consultants',
      category: 'Professional',
      isPro: true,
      preview: {
        bg: 'linear-gradient(180deg, #F7F7F7 0%, #FFFFFF 20%, #FFF4F0 80%, #F26522 100%)',
        accentColor: '#1A1A1A',
        shape: 'rounded-2xl',
        layout: 'elegant-consultant'
      },
      features: ['Elegant gradients', 'Sophisticated', 'Professional', 'Refined details']
    }
  ]

  // Color palette for Leo cards
  const leoColorPalette = [
    { name: 'Leo Orange', color: '#F26522', selected: true },
    { name: 'Deep Orange', color: '#E85A17' },
    { name: 'Warm Orange', color: '#FF6B35' },
    { name: 'Professional Blue', color: '#2563EB' },
    { name: 'Creative Purple', color: '#7C3AED' },
    { name: 'Success Green', color: '#059669' },
    { name: 'Executive Black', color: '#1A1A1A' },
    { name: 'Elegant Gray', color: '#6B6B6B' },
    { name: 'Coral', color: '#FF5722' },
    { name: 'Teal', color: '#14B8A6' },
    { name: 'Indigo', color: '#4F46E5' },
    { name: 'Rose', color: '#E11D48' }
  ]

  // Font options for Leo cards
  const leoFontOptions = [
    { name: 'Inter', label: 'Inter (Default)', category: 'Modern', selected: true },
    { name: 'SF Pro Display', label: 'SF Pro Display', category: 'Apple-style' },
    { name: 'Roboto', label: 'Roboto', category: 'Google' },
    { name: 'Montserrat', label: 'Montserrat', category: 'Geometric' },
    { name: 'Playfair Display', label: 'Playfair Display', category: 'Elegant' },
    { name: 'Space Grotesk', label: 'Space Grotesk', category: 'Tech' },
    { name: 'Crimson Text', label: 'Crimson Text', category: 'Classic' },
    { name: 'Work Sans', label: 'Work Sans', category: 'Professional' }
  ]

  const canUseLayout = (layout: any) => {
    if (!layout.isPro) return true
    return userTier === 'professional' || userTier === 'executive'
  }

  const getLayoutPreview = (layout: any) => {
    const isSelected = currentLayout === layout.id
    const isHovered = hoveredLayout === layout.id
    const canUse = canUseLayout(layout)

    return (
      <div 
        className={`relative aspect-[3/4] ${layout.preview.shape} border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
          isSelected 
            ? 'border-primary shadow-lg scale-105' 
            : canUse 
              ? 'border-border hover:border-primary/50 hover:shadow-md' 
              : 'border-border opacity-60 cursor-not-allowed'
        }`}
        style={{ background: layout.preview.bg }}
        onMouseEnter={() => setHoveredLayout(layout.id)}
        onMouseLeave={() => setHoveredLayout(null)}
        onClick={() => canUse && onLayoutChange(layout.id)}
      >
        {/* Pro Badge */}
        {layout.isPro && (
          <div className="absolute top-2 right-2 z-10">
            <Badge 
              className={`text-xs px-2 py-1 ${
                canUse ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground text-white'
              }`}
            >
              {canUse ? (
                <><Crown className="w-3 h-3 mr-1" /> PRO</>
              ) : (
                'PRO'
              )}
            </Badge>
          </div>
        )}

        {/* Layout Preview Content */}
        <div className="absolute inset-4 flex flex-col justify-between">
          {/* Header area */}
          <div className="space-y-1">
            <div 
              className="h-2 rounded-full"
              style={{ 
                backgroundColor: layout.preview.accentColor,
                opacity: 0.8,
                width: '60%'
              }}
            />
            <div 
              className="h-1 rounded-full"
              style={{ 
                backgroundColor: layout.preview.accentColor,
                opacity: 0.5,
                width: '40%'
              }}
            />
          </div>

          {/* Profile area */}
          <div className="flex items-center space-x-2">
            <div 
              className="w-6 h-6 rounded-full border-2"
              style={{ 
                backgroundColor: layout.preview.accentColor,
                borderColor: layout.preview.accentColor,
                opacity: 0.9
              }}
            />
            <div className="space-y-1 flex-1">
              <div 
                className="h-1 rounded-full"
                style={{ 
                  backgroundColor: layout.preview.accentColor,
                  opacity: 0.7,
                  width: '70%'
                }}
              />
              <div 
                className="h-1 rounded-full"
                style={{ 
                  backgroundColor: layout.preview.accentColor,
                  opacity: 0.5,
                  width: '50%'
                }}
              />
            </div>
          </div>

          {/* Links area */}
          <div className="space-y-1">
            {[60, 45, 55].map((width, i) => (
              <div 
                key={i}
                className="h-1 rounded-full"
                style={{ 
                  backgroundColor: layout.preview.accentColor,
                  opacity: 0.4,
                  width: `${width}%`
                }}
              />
            ))}
          </div>

          {/* CTA Button */}
          <div 
            className="h-3 rounded-md"
            style={{ 
              backgroundColor: layout.preview.accentColor,
              opacity: 0.8
            }}
          />
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {/* Hover overlay */}
        {isHovered && canUse && !isSelected && (
          <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center opacity-80">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
        )}

        {/* Lock overlay for non-pro users */}
        {layout.isPro && !canUse && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="text-center">
              <Crown className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground font-medium">Pro Only</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-foreground">Choose Your Leo Design</h3>
        <p className="text-muted-foreground">
          Professionally crafted layouts that make you stand out
        </p>
      </div>

      {/* Competitor Reference (for context) */}
      <Card className="p-4 bg-muted/30 border-dashed">
        <div className="flex items-center space-x-3 mb-3">
          <Brush className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Competitor Reference</span>
        </div>
        <img 
          src={competitorImage} 
          alt="Competitor design reference" 
          className="w-full max-w-md mx-auto rounded-lg border border-border"
        />
        <p className="text-xs text-muted-foreground text-center mt-2">
          Leo's unique designs inspired by market leaders but distinctly branded
        </p>
      </Card>

      {/* Leo Design Layouts Grid */}
      <div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {leoDesignLayouts.map((layout) => (
            <div key={layout.id} className="space-y-3">
              {getLayoutPreview(layout)}
              
              {/* Layout Info */}
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center space-x-2">
                  <h4 className="font-semibold text-sm text-foreground">{layout.name}</h4>
                  {layout.isPro && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      PRO
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {layout.description}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {layout.category}
                </Badge>
              </div>

              {/* Feature list on hover */}
              {hoveredLayout === layout.id && (
                <Card className="absolute z-10 p-3 bg-card border shadow-lg rounded-lg mt-2 space-y-2 max-w-48">
                  <h5 className="font-medium text-sm">{layout.name} Features</h5>
                  <ul className="space-y-1">
                    {layout.features.map((feature, i) => (
                      <li key={i} className="flex items-center space-x-2 text-xs">
                        <CheckCircle className="w-3 h-3 text-success" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-8" />

      {/* Color Palette Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Palette className="w-5 h-5 text-primary" />
          <h4 className="font-semibold">Leo Color Palette</h4>
        </div>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-3">
          {leoColorPalette.map((colorOption) => (
            <button
              key={colorOption.name}
              className={`w-12 h-12 rounded-xl border-3 transition-all hover:scale-110 ${
                colorOption.selected 
                  ? 'border-foreground shadow-lg' 
                  : 'border-border hover:border-muted-foreground'
              }`}
              style={{ backgroundColor: colorOption.color }}
              title={colorOption.name}
            >
              {colorOption.selected && (
                <CheckCircle className="w-4 h-4 text-white mx-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      <Separator className="my-8" />

      {/* Font Selection */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <span className="text-xl">Aa</span>
          <h4 className="font-semibold">Typography</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {leoFontOptions.map((font) => (
            <Card 
              key={font.name}
              className={`p-4 cursor-pointer transition-all border-2 ${
                font.selected 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium" style={{ fontFamily: font.name }}>
                    {font.label}
                  </h5>
                  <p className="text-sm text-muted-foreground">{font.category}</p>
                </div>
                {font.selected && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-lg" style={{ fontFamily: font.name }}>
                  John Smith
                </p>
                <p className="text-sm text-muted-foreground" style={{ fontFamily: font.name }}>
                  Senior Product Manager
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Upgrade CTA for free users */}
      {userTier === 'free' && (
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Crown className="w-6 h-6 text-primary" />
                <h4 className="text-xl font-bold text-foreground">Unlock Pro Designs</h4>
              </div>
              <p className="text-muted-foreground">
                Get access to all premium layouts, advanced customization, and exclusive features
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>8 Premium Layouts</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wand2 className="w-4 h-4 text-primary" />
                <span>AI Design Assistant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-primary" />
                <span>Priority Support</span>
              </div>
            </div>
            
            <Button className="bg-primary hover:bg-primary-hover text-primary-foreground px-8">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}