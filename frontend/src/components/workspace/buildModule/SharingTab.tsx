import React from 'react'
import { Share2, Copy, Download, QrCode, Mail, Monitor, Globe, Crown, User, ExternalLink } from 'lucide-react'
import { Card } from '../../ui/card'
import { Label } from '../../ui/label'
import { Switch } from '../../ui/switch'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion'
import { AnalyticsSettings } from '../../../types/buildModule'

interface SharingTabProps {
  analytics: AnalyticsSettings
  userTier: string
  onExport: (format: string) => void
  onShare: () => void
  isExporting: boolean
  expandedSections: string[]
  onExpandedSectionsChange: (sections: string[]) => void
  onAnalyticsUpdate: (updates: Partial<AnalyticsSettings>) => void
}

export function SharingTab({
  analytics,
  userTier,
  onExport,
  onShare,
  isExporting,
  expandedSections,
  onExpandedSectionsChange,
  onAnalyticsUpdate
}: SharingTabProps) {
  return (
    <div className="p-6 space-y-6">
      <Accordion type="multiple" value={expandedSections} onValueChange={onExpandedSectionsChange}>
        
        {/* Quick Share */}
        <AccordionItem value="quick-share">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <Share2 className="h-4 w-4 text-primary" />
              <span>Quick Share</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="space-y-3">
              <Button 
                onClick={onShare}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <Copy className="h-4 w-4" />
                Copy Share Link
              </Button>
              <Button 
                onClick={() => onExport('qr')}
                className="w-full justify-start gap-3"
                variant="outline"
                disabled={isExporting}
              >
                <QrCode className="h-4 w-4" />
                Generate QR Code
              </Button>
              <Button 
                onClick={() => onExport('vcard')}
                className="w-full justify-start gap-3"
                variant="outline"
                disabled={isExporting}
              >
                <User className="h-4 w-4" />
                Download vCard
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Export Options */}
        <AccordionItem value="export-options">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <Download className="h-4 w-4 text-primary" />
              <span>Export Options</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => onExport('png')}
                variant="outline"
                disabled={isExporting}
                className="justify-start gap-2"
              >
                <Download className="h-4 w-4" />
                PNG Image
              </Button>
              <Button 
                onClick={() => onExport('pdf')}
                variant="outline"
                disabled={isExporting}
                className="justify-start gap-2"
              >
                <Download className="h-4 w-4" />
                PDF Document
              </Button>
              <Button 
                onClick={() => onExport('svg')}
                variant="outline"
                disabled={isExporting}
                className="justify-start gap-2"
              >
                <Download className="h-4 w-4" />
                SVG Vector
              </Button>
              <Button 
                onClick={() => onExport('email-signature')}
                variant="outline"
                disabled={isExporting}
                className="justify-start gap-2"
              >
                <Mail className="h-4 w-4" />
                Email Signature
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Advanced Export */}
        <AccordionItem value="advanced-export">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <Crown className="h-4 w-4 text-primary" />
              <span>Advanced Export</span>
              <Badge variant="outline" className="text-xs gap-1">
                <Crown className="w-3 h-3" />
                Pro
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="space-y-3">
              <Button 
                onClick={() => onExport('virtual-background')}
                variant="outline"
                disabled={isExporting || userTier === 'free'}
                className="w-full justify-start gap-3"
              >
                <Monitor className="h-4 w-4" />
                Virtual Background (4K)
              </Button>
              <Button 
                variant="outline"
                disabled={isExporting || userTier === 'free'}
                className="w-full justify-start gap-3"
              >
                <Globe className="h-4 w-4" />
                Custom Domain Setup
              </Button>
              <Button 
                variant="outline"
                disabled={isExporting || userTier === 'free'}
                className="w-full justify-start gap-3"
              >
                <QrCode className="h-4 w-4" />
                Branded QR Codes
              </Button>
              <Button 
                onClick={() => onExport('excel')}
                variant="outline"
                disabled={isExporting || userTier === 'free'}
                className="w-full justify-start gap-3"
              >
                <ExternalLink className="h-4 w-4" />
                Analytics Report (Excel)
              </Button>
            </div>
            {userTier === 'free' && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">Upgrade to Pro for advanced export options</p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Sharing Settings */}
        <AccordionItem value="sharing-settings">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-primary" />
              <span>Sharing Settings</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Public card visibility</Label>
                  <p className="text-xs text-muted-foreground">Allow anyone with link to view</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Download protection</Label>
                  <p className="text-xs text-muted-foreground">Prevent unauthorized downloads</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Analytics tracking</Label>
                  <p className="text-xs text-muted-foreground">Track views and interactions</p>
                </div>
                <Switch 
                  checked={analytics.enabled}
                  onCheckedChange={(checked) => onAnalyticsUpdate({ enabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Social media sharing</Label>
                  <p className="text-xs text-muted-foreground">Enable sharing on social platforms</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Email notifications</Label>
                  <p className="text-xs text-muted-foreground">Get notified when someone views your card</p>
                </div>
                <Switch />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Integration Settings */}
        <AccordionItem value="integration-settings">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <ExternalLink className="h-4 w-4 text-primary" />
              <span>Integration Settings</span>
              <Badge variant="outline" className="text-xs gap-1">
                <Crown className="w-3 h-3" />
                Pro
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            {userTier !== 'free' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">CRM integration</Label>
                    <p className="text-xs text-muted-foreground">Sync contacts with your CRM</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Slack notifications</Label>
                    <p className="text-xs text-muted-foreground">Send alerts to Slack channels</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Zapier webhooks</Label>
                    <p className="text-xs text-muted-foreground">Trigger automation workflows</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">API access</Label>
                    <p className="text-xs text-muted-foreground">Access via REST API</p>
                  </div>
                  <Switch disabled={userTier !== 'executive'} />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ExternalLink className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <h4 className="font-medium mb-2">Integration Settings</h4>
                <p className="text-sm mb-4">Connect your card with external services and tools</p>
                <Button size="sm" className="gap-2">
                  <Crown className="h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}