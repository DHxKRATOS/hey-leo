import React from 'react'
import { Sparkles, Heart, Palette, Type, Layout, AlignCenter, AlignLeft, Grid3x3, Layers, Check } from 'lucide-react'
import { Card } from '../../ui/card'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Slider } from '../../ui/slider'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion'
import { LeoCardDesignLayouts } from '../../LeoCardDesignLayouts'
import { CardDesignTemplates } from '../../CardDesignTemplates'
import { CardDesign } from '../../../types/buildModule'
import { COLOR_PALETTES, FONT_OPTIONS, LAYOUT_OPTIONS, SPACING_OPTIONS } from '../../../utils/buildModuleConstants'

interface DisplayTabProps {
  design: CardDesign
  userTier: string
  onDesignUpdate: (updates: Partial<CardDesign>) => void
  onLayoutChange: (layoutId: string) => void
  onTemplateSelect: (template: any) => void
  expandedSections: string[]
  onExpandedSectionsChange: (sections: string[]) => void
}

export function DisplayTab({
  design,
  userTier,
  onDesignUpdate,
  onLayoutChange,
  onTemplateSelect,
  expandedSections,
  onExpandedSectionsChange
}: DisplayTabProps) {
  return (
    <div className="p-6 space-y-6">
      <Accordion type="multiple" value={expandedSections} onValueChange={onExpandedSectionsChange}>
        
        {/* Leo Design Layouts */}
        <AccordionItem value="leo-layouts">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Leo Design Layouts</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <LeoCardDesignLayouts
              currentLayout={design.template || 'leo-classic'}
              onLayoutChange={onLayoutChange}
              userTier={userTier}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Tinder-Style Templates */}
        <AccordionItem value="tinder-templates">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Tinder-Style Templates</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <CardDesignTemplates
              selectedTemplate={design.template}
              onTemplateSelect={onTemplateSelect}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Color System */}
        <AccordionItem value="colors">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <Palette className="h-4 w-4 text-primary" />
              <span>Color System</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6">
            {/* Quick Color Palettes */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Quick Palettes</Label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_PALETTES.map((palette) => (
                  <button
                    key={palette.name}
                    onClick={() => onDesignUpdate({
                      colors: { ...design.colors, primary: palette.primary, secondary: palette.secondary }
                    })}
                    className={`relative h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                      design.colors.primary === palette.primary ? 'border-primary shadow-md' : 'border-border'
                    }`}
                    style={{ 
                      background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})` 
                    }}
                    title={palette.name}
                  >
                    {design.colors.primary === palette.primary && (
                      <Check className="h-4 w-4 text-white absolute inset-0 m-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Primary Color</Label>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
                    style={{ backgroundColor: design.colors.primary }}
                  />
                  <Input
                    type="color"
                    value={design.colors.primary}
                    onChange={(e) => onDesignUpdate({
                      colors: { ...design.colors, primary: e.target.value }
                    })}
                    className="w-24 h-12"
                  />
                  <Input
                    value={design.colors.primary}
                    onChange={(e) => onDesignUpdate({
                      colors: { ...design.colors, primary: e.target.value }
                    })}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Secondary Color</Label>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
                    style={{ backgroundColor: design.colors.secondary }}
                  />
                  <Input
                    type="color"
                    value={design.colors.secondary}
                    onChange={(e) => onDesignUpdate({
                      colors: { ...design.colors, secondary: e.target.value }
                    })}
                    className="w-24 h-12"
                  />
                  <Input
                    value={design.colors.secondary}
                    onChange={(e) => onDesignUpdate({
                      colors: { ...design.colors, secondary: e.target.value }
                    })}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Typography */}
        <AccordionItem value="typography">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <Type className="h-4 w-4 text-primary" />
              <span>Typography</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Font Family</Label>
              <Select
                value={design.fonts.heading}
                onValueChange={(value) => onDesignUpdate({
                  fonts: { heading: value, body: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map(font => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Preview */}
            <Card className="p-4 bg-muted/50">
              <div style={{ fontFamily: design.fonts.heading }}>
                <h3 className="text-xl font-bold mb-2">Your Name</h3>
                <p className="text-sm text-muted-foreground">Your Title</p>
                <p className="text-xs mt-2 opacity-70">Sample text to preview your font choice</p>
              </div>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Layout Options */}
        <AccordionItem value="layout">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <Layout className="h-4 w-4 text-primary" />
              <span>Layout & Spacing</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6">
            {/* Layout Styles */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Layout Style</Label>
              <div className="grid grid-cols-2 gap-3">
                {LAYOUT_OPTIONS.map((layout) => (
                  <button
                    key={layout.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-left hover:shadow-md ${
                      design.layout === layout.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-border-hover'
                    }`}
                    onClick={() => onDesignUpdate({ layout: layout.id })}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {layout.id === 'center' && <AlignCenter className="h-4 w-4" />}
                      {layout.id === 'left' && <AlignLeft className="h-4 w-4" />}
                      {layout.id === 'asymmetric' && <Grid3x3 className="h-4 w-4" />}
                      {layout.id === 'split' && <Layers className="h-4 w-4" />}
                      <span className="font-medium text-sm">{layout.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{layout.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Spacing Control */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Content Spacing</Label>
              <div className="space-y-3">
                {SPACING_OPTIONS.map((spacing) => (
                  <div
                    key={spacing.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      design.spacing === spacing.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-border-hover'
                    }`}
                    onClick={() => onDesignUpdate({ spacing: spacing.id })}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-sm">{spacing.label}</span>
                        <p className="text-xs text-muted-foreground">{spacing.description}</p>
                      </div>
                      {design.spacing === spacing.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Corner Radius */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Corner Radius</Label>
              <Slider
                value={[design.corners === 'sharp' ? 0 : design.corners === 'rounded' ? 50 : 100]}
                onValueChange={([value]) => {
                  const corners = value === 0 ? 'sharp' : value <= 50 ? 'rounded' : 'round'
                  onDesignUpdate({ corners })
                }}
                max={100}
                step={25}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Sharp</span>
                <span>Rounded</span>
                <span>Round</span>
              </div>
            </div>

            {/* Shadow Intensity */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Shadow Intensity</Label>
              <Slider
                value={[design.shadows === 'none' ? 0 : design.shadows === 'subtle' ? 50 : 100]}
                onValueChange={([value]) => {
                  const shadows = value === 0 ? 'none' : value <= 50 ? 'subtle' : 'strong'
                  onDesignUpdate({ shadows })
                }}
                max={100}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>None</span>
                <span>Subtle</span>
                <span>Strong</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}