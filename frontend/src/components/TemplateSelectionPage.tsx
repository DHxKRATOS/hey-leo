import React from 'react'
import { ArrowLeft, Sparkles, User, Building2, Briefcase, Palette, Zap, Crown } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'

interface TemplateSelectionPageProps {
  onBack: () => void
  onTemplateSelect: (templateId: string) => void
  onStartBlank: () => void
}

interface Template {
  id: string
  name: string
  description: string
  preview: string
  category: 'professional' | 'creative' | 'executive'
  isPremium: boolean
  color: string
}

const templates: Template[] = [
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    description: 'Clean, minimalist design perfect for any industry',
    preview: 'MP',
    category: 'professional',
    isPremium: false,
    color: '#F26522'
  },
  {
    id: 'executive-premium',
    name: 'Executive Premium',
    description: 'Sophisticated layout for senior professionals',
    preview: 'EP',
    category: 'executive',
    isPremium: true,
    color: '#1A1A1A'
  },
  {
    id: 'creative-studio',
    name: 'Creative Studio',
    description: 'Bold and colorful for creative professionals',
    preview: 'CS',
    category: 'creative',
    isPremium: false,
    color: '#7C3AED'
  },
  {
    id: 'tech-innovator',
    name: 'Tech Innovator',
    description: 'Modern tech-focused design with clean lines',
    preview: 'TI',
    category: 'professional',
    isPremium: false,
    color: '#0EA5E9'
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    description: 'Premium design with elegant gold accents',
    preview: 'LG',
    category: 'executive',
    isPremium: true,
    color: '#EAB308'
  },
  {
    id: 'startup-founder',
    name: 'Startup Founder',
    description: 'Dynamic layout perfect for entrepreneurs',
    preview: 'SF',
    category: 'professional',
    isPremium: false,
    color: '#10B981'
  }
]

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'professional':
      return <Briefcase className="h-4 w-4" />
    case 'creative':
      return <Palette className="h-4 w-4" />
    case 'executive':
      return <Crown className="h-4 w-4" />
    default:
      return <User className="h-4 w-4" />
  }
}

export function TemplateSelectionPage({ onBack, onTemplateSelect, onStartBlank }: TemplateSelectionPageProps) {
  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Create New Card</h1>
              <p className="text-text-secondary">Choose a professional template to get started</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={onStartBlank}
            className="border-dashed border-2 hover:border-primary hover:text-primary"
          >
            <Zap className="h-4 w-4 mr-2" />
            Start Blank
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="group relative overflow-hidden border-2 hover:border-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer bg-card"
              onClick={() => onTemplateSelect(template.id)}
            >
              {/* Premium Badge */}
              {template.isPremium && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge 
                    variant="secondary"
                    className="bg-warning/10 text-warning border-warning/20"
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                </div>
              )}

              {/* Template Preview */}
              <div className="aspect-[3/2] p-6 flex items-center justify-center bg-gradient-to-br from-surface to-muted/20">
                <div 
                  className="w-32 h-20 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg"
                  style={{ backgroundColor: template.color }}
                >
                  {template.preview}
                </div>
              </div>

              {/* Template Info */}
              <div className="p-6 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
                    {template.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-text-tertiary">
                    {getCategoryIcon(template.category)}
                    <span className="text-xs capitalize">{template.category}</span>
                  </div>
                </div>
                
                <p className="text-sm text-text-secondary mb-4">
                  {template.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: template.color }}
                    />
                    <span className="text-xs text-text-tertiary">
                      Customizable colors
                    </span>
                  </div>
                  
                  <Button
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary hover:bg-primary-hover text-primary-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      onTemplateSelect(template.id)
                    }}
                  >
                    Use Template
                  </Button>
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-light rounded-full text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">All templates are fully customizable</span>
          </div>
          
          <p className="mt-4 text-text-secondary text-sm max-w-md mx-auto">
            Start with any template and customize colors, fonts, layouts, and content to match your brand perfectly.
          </p>
        </div>
      </div>
    </div>
  )
}