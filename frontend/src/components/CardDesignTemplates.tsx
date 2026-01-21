import React from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card } from './ui/card'

interface CardTemplate {
  id: string
  name: string
  type: 'gradient' | 'solid' | 'pattern'
  colors: {
    primary: string
    secondary: string
  }
  description: string
  category: string
}

interface CardDesignTemplatesProps {
  selectedTemplate: string
  onTemplateSelect: (template: CardTemplate) => void
  className?: string
}

// Predefined Tinder-style card templates following the color guidelines
const cardTemplates: CardTemplate[] = [
  // Gradient Templates
  {
    id: 'gradient-blue',
    name: 'Ocean Blue',
    type: 'gradient',
    colors: {
      primary: '#2563EB',
      secondary: '#1E40AF'
    },
    description: 'Like Facebook blue but prettier',
    category: 'Gradient'
  },
  {
    id: 'gradient-purple',
    name: 'Royal Purple',
    type: 'gradient',
    colors: {
      primary: '#7C3AED',
      secondary: '#5B21B6'
    },
    description: 'Like Twitch purple',
    category: 'Gradient'
  },
  {
    id: 'gradient-orange',
    name: 'Leo Orange',
    type: 'gradient',
    colors: {
      primary: '#F26522',
      secondary: '#E85A17'
    },
    description: 'Our signature HeyLeo orange',
    category: 'Gradient'
  },
  {
    id: 'gradient-green',
    name: 'Forest Green',
    type: 'gradient',
    colors: {
      primary: '#16A34A',
      secondary: '#15803D'
    },
    description: 'Like WhatsApp green',
    category: 'Gradient'
  },
  
  // Solid Color Templates
  {
    id: 'solid-black',
    name: 'Elegant Black',
    type: 'solid',
    colors: {
      primary: '#1A1A1A',
      secondary: '#1A1A1A'
    },
    description: 'Elegant and professional',
    category: 'Solid'
  },
  {
    id: 'solid-navy',
    name: 'Navy Professional',
    type: 'solid',
    colors: {
      primary: '#1E3A8A',
      secondary: '#1E3A8A'
    },
    description: 'Corporate and trustworthy',
    category: 'Solid'
  },
  
  // Pattern Templates
  {
    id: 'pattern-subtle',
    name: 'Subtle Pattern',
    type: 'pattern',
    colors: {
      primary: '#6366F1',
      secondary: '#4F46E5'
    },
    description: 'Light patterns, bold text',
    category: 'Pattern'
  },
  {
    id: 'pattern-modern',
    name: 'Modern Pattern',
    type: 'pattern',
    colors: {
      primary: '#EF4444',
      secondary: '#DC2626'
    },
    description: 'Contemporary design',
    category: 'Pattern'
  }
]

export function CardDesignTemplates({ 
  selectedTemplate, 
  onTemplateSelect, 
  className = "" 
}: CardDesignTemplatesProps) {
  
  // Generate preview card style
  const getPreviewStyle = (template: CardTemplate) => {
    switch (template.type) {
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary})`
        }
      case 'solid':
        return {
          background: template.colors.primary
        }
      case 'pattern':
        return {
          background: `linear-gradient(135deg, ${template.colors.primary}15, ${template.colors.secondary}15), 
                      repeating-linear-gradient(45deg, transparent, transparent 10px, ${template.colors.primary}08 10px, ${template.colors.primary}08 11px)`
        }
      default:
        return {
          background: template.colors.primary
        }
    }
  }

  // Get text color based on template type
  const getTextColor = (template: CardTemplate) => {
    return template.type === 'pattern' ? 'text-foreground' : 'text-white'
  }

  const PreviewCard = ({ template }: { template: CardTemplate }) => {
    const isSelected = selectedTemplate === template.id
    const textColor = getTextColor(template)
    
    return (
      <div 
        className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
          isSelected ? 'ring-4 ring-primary ring-offset-2' : ''
        }`}
        onClick={() => onTemplateSelect(template)}
      >
        {/* Mini Tinder-style card preview */}
        <div 
          className="w-full aspect-[3/5] relative overflow-hidden flex flex-col justify-between p-6"
          style={{ 
            borderRadius: '24px',
            boxShadow: isSelected 
              ? '0 25px 50px rgba(0, 0, 0, 0.25)' 
              : '0 15px 30px rgba(0, 0, 0, 0.15)',
            ...getPreviewStyle(template)
          }}
        >
          {/* Selected indicator */}
          {isSelected && (
            <div className="absolute top-3 right-3 z-10">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
          )}

          {/* Top - Initials */}
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <span className={`text-sm font-bold ${textColor}`}>SC</span>
            </div>
          </div>

          {/* Middle - Name & Title */}
          <div className="text-center space-y-2">
            <h3 className={`text-lg font-bold ${textColor} leading-tight`}>Sarah Chen</h3>
            <p className={`text-sm ${textColor} opacity-90`}>Product Designer</p>
            <p className={`text-xs ${textColor} opacity-80`}>Meta</p>
          </div>

          {/* Bottom - Contact info preview */}
          <div className="space-y-1">
            <div className="w-12 h-px bg-white/30 mx-auto mb-3"></div>
            <div className={`flex items-center justify-center space-x-2 text-xs ${textColor} opacity-80`}>
              <span>📧</span>
              <span>💼</span>
              <span>📱</span>
            </div>
          </div>

          {/* Leo branding */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className={`text-xs ${textColor} opacity-60`}>🦁</span>
            </div>
          </div>

          {/* Pattern overlay for pattern templates */}
          {template.type === 'pattern' && (
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[0.5px]"></div>
          )}
        </div>
      </div>
    )
  }

  // Group templates by category
  const templatesByCategory = cardTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, CardTemplate[]>)

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Choose Your Card Style</h2>
        <p className="text-muted-foreground">
          Pick a template that matches your professional brand
        </p>
      </div>

      {/* Template Categories */}
      {Object.entries(templatesByCategory).map(([category, templates]) => (
        <div key={category} className="space-y-4">
          {/* Category Header */}
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-foreground">{category} Style</h3>
            <Badge variant="secondary" className="text-xs">
              {templates.length} {templates.length === 1 ? 'Template' : 'Templates'}
            </Badge>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="space-y-3">
                <PreviewCard template={template} />
                
                {/* Template Info */}
                <div className="text-center space-y-1">
                  <h4 className="font-semibold text-sm text-foreground">{template.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Usage Tips */}
      <Card className="p-6 bg-primary-light border-primary/20">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-primary text-lg">💡</span>
            <h4 className="font-semibold text-primary">Design Tips</h4>
          </div>
          <div className="space-y-2 text-sm text-primary/80">
            <p>• <strong>Gradient cards</strong> work great for creative professionals</p>
            <p>• <strong>Solid black</strong> is perfect for executives and lawyers</p>
            <p>• <strong>Pattern cards</strong> help you stand out while staying professional</p>
            <p>• All templates look amazing on mobile and desktop</p>
          </div>
        </div>
      </Card>
    </div>
  )
}