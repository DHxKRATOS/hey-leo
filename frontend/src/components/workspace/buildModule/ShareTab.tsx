import React, { useState } from 'react'
import { Share2, Copy, QrCode, Download, Eye, Crown, Settings, Link as LinkIcon, ArrowUpRight, Code, ExternalLink } from 'lucide-react'
import { Card } from '../../ui/card'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Switch } from '../../ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion'
import { Textarea } from '../../ui/textarea'
import { Separator } from '../../ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible'
import { toast } from 'sonner@2.0.3'

interface ShareTabProps {
  cardUrl: string
  userTier: string
  expandedSections: string[]
  onExpandedSectionsChange: (sections: string[]) => void
}

export function ShareTab({
  cardUrl,
  userTier,
  expandedSections,
  onExpandedSectionsChange
}: ShareTabProps) {
  // URL Sharing state
  const [customSlug, setCustomSlug] = useState('')
  const [utmParams, setUtmParams] = useState({
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: ''
  })
  const [shortenUrl, setShortenUrl] = useState(false)
  const [isAdvancedUtmOpen, setIsAdvancedUtmOpen] = useState(false)

  // QR Code state
  const [qrSettings, setQrSettings] = useState({
    size: 'medium',
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    includeLogo: false,
    logoPosition: 'center',
    errorCorrection: 'medium'
  })

  // Embed settings state
  const [embedSettings, setEmbedSettings] = useState({
    width: '400',
    height: '600',
    showBorder: true,
    borderRadius: '12',
    customCss: '',
    responsive: true
  })

  // QR Code sizes
  const QR_SIZES = [
    { id: 'small', name: 'Small (200px)', value: 200 },
    { id: 'medium', name: 'Medium (400px)', value: 400 },
    { id: 'large', name: 'Large (600px)', value: 600 },
    { id: 'xlarge', name: 'Extra Large (800px)', value: 800 }
  ]

  // Helper functions
  const generateFullUrl = () => {
    let fullUrl = cardUrl
    
    if (customSlug && userTier !== 'free') {
      fullUrl = `https://leo.cards/${customSlug}`
    }
    
    if (shortenUrl) {
      fullUrl = `https://leo.cards/s/${Math.random().toString(36).substr(2, 8)}`
    }
    
    // Add UTM parameters
    const hasUtmParams = Object.values(utmParams).some(value => value.trim())
    if (hasUtmParams) {
      const params = new URLSearchParams()
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value.trim()) params.append(`utm_${key}`, value)
      })
      fullUrl += `?${params.toString()}`
    }
    
    return fullUrl
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadQRCode = (format: string) => {
    // Simulate QR code download
    toast.success(`QR code downloaded as ${format.toUpperCase()}!`)
  }

  const generateEmbedCode = () => {
    const url = generateFullUrl()
    const width = embedSettings.responsive ? '100%' : `${embedSettings.width}px`
    const height = `${embedSettings.height}px`
    
    let embedCode = `<iframe 
  src="${url}?embed=true" 
  width="${width}" 
  height="${height}" 
  frameborder="0"${embedSettings.showBorder ? '' : ' style="border: none;"'}
  ${embedSettings.responsive ? 'style="max-width: 100%; border-radius: ' + embedSettings.borderRadius + 'px;"' : `style="border-radius: ${embedSettings.borderRadius}px;"`}
  title="Digital Business Card"
></iframe>`

    if (embedSettings.responsive) {
      embedCode = `<div style="position: relative; width: 100%; max-width: ${embedSettings.width}px;">
  ${embedCode}
</div>`
    }

    return embedCode
  }

  const openPreview = () => {
    window.open(generateFullUrl(), '_blank', 'width=400,height=600,scrollbars=yes,resizable=yes')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Share Your Card</h2>
        <p className="text-sm text-text-secondary">
          Choose how you want to share your digital business card with the world
        </p>
      </div>

      <Accordion type="multiple" value={expandedSections} onValueChange={onExpandedSectionsChange}>
        
        {/* Quick Actions */}
        <Card className="p-4 rounded-2xl border-border bg-surface shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary">Quick Actions</h3>
            <Button onClick={openPreview} variant="outline" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => copyToClipboard(generateFullUrl())}
              className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl h-12 gap-3"
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
            <Button 
              onClick={() => downloadQRCode('png')}
              variant="outline"
              className="rounded-xl h-12 gap-3"
            >
              <QrCode className="h-4 w-4" />
              Get QR Code
            </Button>
          </div>
        </Card>

        {/* URL Sharing */}
        <AccordionItem value="url-sharing">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <LinkIcon className="h-4 w-4 text-primary" />
              <span>URL Sharing</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            {/* Card URL Display */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Your Card URL</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={generateFullUrl()}
                  readOnly
                  className="flex-1 bg-accent/50 border-border rounded-xl"
                />
                <Button 
                  onClick={() => copyToClipboard(generateFullUrl())} 
                  variant="outline"
                  className="rounded-xl"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Custom Slug */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Custom Slug</Label>
                {userTier === 'free' && (
                  <Badge variant="outline" className="text-xs gap-1 rounded-lg">
                    <Crown className="w-3 h-3" />
                    Pro
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-text-secondary whitespace-nowrap px-3 py-2 bg-accent rounded-xl">leo.cards/</span>
                <Input
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="your-name"
                  disabled={userTier === 'free'}
                  className="flex-1 rounded-xl"
                />
              </div>
              <p className="text-xs text-text-tertiary mt-2">
                Create a memorable, branded link for your card
              </p>
            </div>

            {/* URL Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-accent/30 rounded-xl">
                <div>
                  <Label className="text-sm font-medium">URL Shortener</Label>
                  <p className="text-xs text-text-secondary">Generate a shortened link</p>
                </div>
                <Switch
                  checked={shortenUrl}
                  onCheckedChange={setShortenUrl}
                />
              </div>
            </div>

            {/* UTM Parameters */}
            <Collapsible open={isAdvancedUtmOpen} onOpenChange={setIsAdvancedUtmOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between rounded-xl">
                  <span>UTM Tracking Parameters</span>
                  <Settings className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">UTM Source</Label>
                    <Input
                      value={utmParams.source}
                      onChange={(e) => setUtmParams(prev => ({ ...prev, source: e.target.value }))}
                      placeholder="e.g., linkedin"
                      className="mt-1 text-sm rounded-lg"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">UTM Medium</Label>
                    <Input
                      value={utmParams.medium}
                      onChange={(e) => setUtmParams(prev => ({ ...prev, medium: e.target.value }))}
                      placeholder="e.g., social"
                      className="mt-1 text-sm rounded-lg"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">UTM Campaign</Label>
                    <Input
                      value={utmParams.campaign}
                      onChange={(e) => setUtmParams(prev => ({ ...prev, campaign: e.target.value }))}
                      placeholder="e.g., conference2024"
                      className="mt-1 text-sm rounded-lg"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">UTM Term</Label>
                    <Input
                      value={utmParams.term}
                      onChange={(e) => setUtmParams(prev => ({ ...prev, term: e.target.value }))}
                      placeholder="e.g., networking"
                      className="mt-1 text-sm rounded-lg"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </AccordionContent>
        </AccordionItem>

        {/* QR Code */}
        <AccordionItem value="qr-code">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <QrCode className="h-4 w-4 text-primary" />
              <span>QR Code</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6">
            {/* QR Code Preview */}
            <div className="flex justify-center">
              <div className="w-56 h-56 bg-background border-2 border-border rounded-2xl flex items-center justify-center p-4 shadow-sm">
                <div className="w-48 h-48 bg-white rounded-xl border-2 border-gray-200 grid grid-cols-12 gap-px p-3">
                  {[...Array(144)].map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                      style={{ backgroundColor: Math.random() > 0.5 ? qrSettings.foregroundColor : qrSettings.backgroundColor }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Download Options */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Download Options</Label>
              <div className="grid grid-cols-4 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => downloadQRCode('png')} 
                  className="rounded-lg h-10 text-xs gap-2"
                >
                  <Download className="w-3 h-3" />
                  PNG
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => downloadQRCode('svg')} 
                  className="rounded-lg h-10 text-xs gap-2"
                >
                  <Download className="w-3 h-3" />
                  SVG
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => downloadQRCode('jpg')} 
                  className="rounded-lg h-10 text-xs gap-2"
                >
                  <Download className="w-3 h-3" />
                  JPG
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => downloadQRCode('pdf')} 
                  className="rounded-lg h-10 text-xs gap-2"
                >
                  <Download className="w-3 h-3" />
                  PDF
                </Button>
              </div>
            </div>

            {/* QR Customization */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Size</Label>
                <Select value={qrSettings.size} onValueChange={(value) => setQrSettings(prev => ({ ...prev, size: value }))}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QR_SIZES.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Foreground Color</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={qrSettings.foregroundColor}
                      onChange={(e) => setQrSettings(prev => ({ ...prev, foregroundColor: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                    />
                    <Input
                      value={qrSettings.foregroundColor}
                      onChange={(e) => setQrSettings(prev => ({ ...prev, foregroundColor: e.target.value }))}
                      className="flex-1 rounded-lg"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Background Color</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={qrSettings.backgroundColor}
                      onChange={(e) => setQrSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                    />
                    <Input
                      value={qrSettings.backgroundColor}
                      onChange={(e) => setQrSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="flex-1 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-accent/30 rounded-xl">
                <div>
                  <Label className="text-sm font-medium">Include Leo Logo</Label>
                  <p className="text-xs text-text-secondary">Add Leo branding to the center</p>
                </div>
                <Switch
                  checked={qrSettings.includeLogo}
                  onCheckedChange={(checked) => setQrSettings(prev => ({ ...prev, includeLogo: checked }))}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Embed Code */}
        <AccordionItem value="embed-code">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <Code className="h-4 w-4 text-primary" />
              <span>Embed Code</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6">
            {/* Embed Preview */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Live Preview</Label>
              <div className="bg-accent/50 rounded-2xl p-4 border-2 border-dashed border-border">
                <div className="bg-background rounded-xl shadow-lg overflow-hidden" style={{ 
                  width: embedSettings.responsive ? '100%' : `${embedSettings.width}px`,
                  height: `${Math.min(parseInt(embedSettings.height), 300)}px`,
                  maxWidth: '100%'
                }}>
                  <div className="h-full flex items-center justify-center text-text-secondary">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                        <span className="text-primary text-xl">🦁</span>
                      </div>
                      <p className="text-sm font-medium">Card Preview</p>
                      <p className="text-xs text-text-tertiary">Your card will appear here</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Embed Settings */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Width (px)</Label>
                  <Input
                    value={embedSettings.width}
                    onChange={(e) => setEmbedSettings(prev => ({ ...prev, width: e.target.value }))}
                    placeholder="400"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Height (px)</Label>
                  <Input
                    value={embedSettings.height}
                    onChange={(e) => setEmbedSettings(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="600"
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Border Radius (px)</Label>
                <Input
                  value={embedSettings.borderRadius}
                  onChange={(e) => setEmbedSettings(prev => ({ ...prev, borderRadius: e.target.value }))}
                  placeholder="12"
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-accent/30 rounded-xl">
                  <div>
                    <Label className="text-sm font-medium">Responsive</Label>
                    <p className="text-xs text-text-secondary">Adapt to container width</p>
                  </div>
                  <Switch
                    checked={embedSettings.responsive}
                    onCheckedChange={(checked) => setEmbedSettings(prev => ({ ...prev, responsive: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-accent/30 rounded-xl">
                  <div>
                    <Label className="text-sm font-medium">Show Border</Label>
                    <p className="text-xs text-text-secondary">Add iframe border</p>
                  </div>
                  <Switch
                    checked={embedSettings.showBorder}
                    onCheckedChange={(checked) => setEmbedSettings(prev => ({ ...prev, showBorder: checked }))}
                  />
                </div>
              </div>
            </div>

            {/* Generated Code */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Embed Code</Label>
              <div className="relative">
                <Textarea
                  value={generateEmbedCode()}
                  readOnly
                  className="font-mono text-xs rounded-xl bg-accent/50 min-h-[120px] resize-none"
                />
                <Button
                  onClick={() => copyToClipboard(generateEmbedCode())}
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 gap-2 rounded-lg"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </Button>
              </div>
            </div>

            {/* Implementation Guide */}
            <Card className="p-4 bg-info/5 border-info/20 rounded-xl">
              <h4 className="text-sm font-semibold text-info mb-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                How to Use
              </h4>
              <div className="space-y-2 text-xs text-info/80">
                <p>• Paste the embed code into your website's HTML</p>
                <p>• The card will automatically load and be interactive</p>
                <p>• Works with WordPress, Wix, Squarespace, and custom sites</p>
                <p>• Mobile-responsive and SEO-friendly</p>
              </div>
            </Card>
          </AccordionContent>
        </AccordionItem>


      </Accordion>

      {/* Action Bar */}
      <Card className="p-4 bg-primary-light/20 border-primary/10 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-primary">Ready to Share?</h3>
            <p className="text-sm text-text-secondary">Your card is ready to make connections</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => copyToClipboard(generateFullUrl())}
              variant="outline"
              className="gap-2 rounded-xl"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </Button>
            <Button
              onClick={openPreview}
              className="bg-primary hover:bg-primary-hover text-primary-foreground gap-2 rounded-xl"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}