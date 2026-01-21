import React from 'react'
import { Target, QrCode, Clock, Mail, Monitor, Crown, Plus, X, Check } from 'lucide-react'
import { Card } from '../../ui/card'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { Switch } from '../../ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion'
import { 
  LeadCaptureSettings, 
  FollowUpSettings, 
  QRCodeSettings, 
  EmailSignatureSettings, 
  VirtualBackgroundSettings 
} from '../../../types/buildModule'
import { EMAIL_SIGNATURE_STYLES, VIRTUAL_BACKGROUND_STYLES, MEETING_PLATFORMS } from '../../../utils/buildModuleConstants'

interface FeaturesTabProps {
  leadCapture: LeadCaptureSettings
  followUp: FollowUpSettings
  qrCode: QRCodeSettings
  emailSignature: EmailSignatureSettings
  virtualBackground: VirtualBackgroundSettings
  userTier: string
  onLeadCaptureUpdate: (updates: Partial<LeadCaptureSettings>) => void
  onFollowUpUpdate: (updates: Partial<FollowUpSettings>) => void
  onQRCodeUpdate: (updates: Partial<QRCodeSettings>) => void
  onEmailSignatureUpdate: (updates: Partial<EmailSignatureSettings>) => void
  onVirtualBackgroundUpdate: (updates: Partial<VirtualBackgroundSettings>) => void
  onAddLeadCaptureField: () => void
  onUpdateLeadCaptureField: (fieldId: string, updates: any) => void
  onRemoveLeadCaptureField: (fieldId: string) => void
  expandedSections: string[]
  onExpandedSectionsChange: (sections: string[]) => void
}

export function FeaturesTab({
  leadCapture,
  followUp,
  qrCode,
  emailSignature,
  virtualBackground,
  userTier,
  onLeadCaptureUpdate,
  onFollowUpUpdate,
  onQRCodeUpdate,
  onEmailSignatureUpdate,
  onVirtualBackgroundUpdate,
  onAddLeadCaptureField,
  onUpdateLeadCaptureField,
  onRemoveLeadCaptureField,
  expandedSections,
  onExpandedSectionsChange
}: FeaturesTabProps) {
  return (
    <div className="p-6 space-y-6">
      <Accordion type="multiple" value={expandedSections} onValueChange={onExpandedSectionsChange}>
        
        {/* Lead Capture */}
        <AccordionItem value="lead-capture">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-primary" />
              <span>Lead Capture Form</span>
              <Switch 
                checked={leadCapture.enabled}
                onCheckedChange={(checked) => onLeadCaptureUpdate({ enabled: checked })}
              />
            </div>
          </AccordionTrigger>
          {leadCapture.enabled && (
            <AccordionContent className="space-y-6">
              {/* Form Basic Settings */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Form Title</Label>
                  <Input
                    value={leadCapture.title}
                    onChange={(e) => onLeadCaptureUpdate({ title: e.target.value })}
                    placeholder="Form title"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Description</Label>
                  <Textarea
                    value={leadCapture.description}
                    onChange={(e) => onLeadCaptureUpdate({ description: e.target.value })}
                    placeholder="Form description"
                    rows={2}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Thank You Message</Label>
                  <Textarea
                    value={leadCapture.thank_you_message}
                    onChange={(e) => onLeadCaptureUpdate({ thank_you_message: e.target.value })}
                    placeholder="Message shown after form submission"
                    rows={2}
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Form Fields</Label>
                  <Button size="sm" variant="outline" onClick={onAddLeadCaptureField} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Field
                  </Button>
                </div>
                <div className="space-y-3">
                  {leadCapture.fields.map((field) => (
                    <div key={field.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <Input
                          value={field.label}
                          onChange={(e) => onUpdateLeadCaptureField(field.id, { label: e.target.value })}
                          className="flex-1 mr-2 h-8 text-sm"
                          placeholder="Field label"
                        />
                        <Select
                          value={field.type}
                          onValueChange={(value) => onUpdateLeadCaptureField(field.id, { type: value })}
                        >
                          <SelectTrigger className="w-24 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="textarea">Textarea</SelectItem>
                            <SelectItem value="select">Select</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center space-x-2 ml-2">
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) => onUpdateLeadCaptureField(field.id, { required: checked })}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onRemoveLeadCaptureField(field.id)}
                            className="p-1 h-6 w-6"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Input
                        value={field.placeholder || ''}
                        onChange={(e) => onUpdateLeadCaptureField(field.id, { placeholder: e.target.value })}
                        placeholder="Placeholder text"
                        className="text-xs h-7"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={leadCapture.email_notifications}
                    onCheckedChange={(checked) => onLeadCaptureUpdate({ email_notifications: checked })}
                  />
                  <Label className="text-sm">Email notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={leadCapture.auto_response_enabled}
                    onCheckedChange={(checked) => onLeadCaptureUpdate({ auto_response_enabled: checked })}
                  />
                  <Label className="text-sm">Auto-response email</Label>
                </div>
                {leadCapture.auto_response_enabled && (
                  <Textarea
                    value={leadCapture.auto_response_template}
                    onChange={(e) => onLeadCaptureUpdate({ auto_response_template: e.target.value })}
                    placeholder="Auto-response email template"
                    rows={3}
                  />
                )}
              </div>
            </AccordionContent>
          )}
        </AccordionItem>

        {/* QR Code */}
        <AccordionItem value="qr-code">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <QrCode className="h-4 w-4 text-primary" />
              <span>QR Code</span>
              <Switch 
                checked={qrCode.enabled}
                onCheckedChange={(checked) => onQRCodeUpdate({ enabled: checked })}
              />
            </div>
          </AccordionTrigger>
          {qrCode.enabled && (
            <AccordionContent className="space-y-6">
              {/* QR Code Preview */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Preview</Label>
                <div className="flex justify-center p-4 bg-white rounded-lg border">
                  <div className={`bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${
                    qrCode.size === 'small' ? 'w-24 h-24' : 
                    qrCode.size === 'large' ? 'w-40 h-40' : 'w-32 h-32'
                  }`} style={{ borderColor: qrCode.color }}>
                    <QrCode className="h-8 w-8" style={{ color: qrCode.color }} />
                  </div>
                </div>
              </div>

              {/* QR Code Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Size</Label>
                  <Select
                    value={qrCode.size}
                    onValueChange={(value: 'small' | 'medium' | 'large' | 'custom') => 
                      onQRCodeUpdate({ size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (150px)</SelectItem>
                      <SelectItem value="medium">Medium (250px)</SelectItem>
                      <SelectItem value="large">Large (400px)</SelectItem>
                      <SelectItem value="custom">Custom Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Corner Style</Label>
                  <Select
                    value={qrCode.corner_style}
                    onValueChange={(value: 'square' | 'rounded' | 'extra_rounded') => 
                      onQRCodeUpdate({ corner_style: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="extra_rounded">Extra Rounded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Size Input */}
              {qrCode.size === 'custom' && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Custom Size (px)</Label>
                  <Input
                    type="number"
                    value={qrCode.custom_size || 250}
                    onChange={(e) => onQRCodeUpdate({ custom_size: parseInt(e.target.value) || 250 })}
                    min="100"
                    max="1000"
                  />
                </div>
              )}

              {/* Color Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">QR Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={qrCode.color}
                      onChange={(e) => onQRCodeUpdate({ color: e.target.value })}
                      className="w-12 h-8"
                    />
                    <Input
                      value={qrCode.color}
                      onChange={(e) => onQRCodeUpdate({ color: e.target.value })}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Background Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={qrCode.background_color}
                      onChange={(e) => onQRCodeUpdate({ background_color: e.target.value })}
                      className="w-12 h-8"
                    />
                    <Input
                      value={qrCode.background_color}
                      onChange={(e) => onQRCodeUpdate({ background_color: e.target.value })}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced QR Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={qrCode.logo_enabled}
                    onCheckedChange={(checked) => onQRCodeUpdate({ logo_enabled: checked })}
                  />
                  <Label className="text-sm">Include Leo logo in center</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={qrCode.download_tracking}
                    onCheckedChange={(checked) => onQRCodeUpdate({ download_tracking: checked })}
                  />
                  <Label className="text-sm">Track QR code scans</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={qrCode.dynamic_qr}
                    onCheckedChange={(checked) => onQRCodeUpdate({ dynamic_qr: checked })}
                    disabled={userTier === 'free'}
                  />
                  <Label className="text-sm">Dynamic QR (editable destination)</Label>
                  {userTier === 'free' && (
                    <Badge variant="outline" className="text-xs">Pro</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={qrCode.password_protected}
                    onCheckedChange={(checked) => onQRCodeUpdate({ password_protected: checked })}
                    disabled={userTier !== 'executive'}
                  />
                  <Label className="text-sm">Password protection</Label>
                  {userTier !== 'executive' && (
                    <Badge variant="outline" className="text-xs">Executive</Badge>
                  )}
                </div>
              </div>
            </AccordionContent>
          )}
        </AccordionItem>

        {/* Follow-up Automation */}
        <AccordionItem value="follow-up">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Follow-up Automation</span>
              <Badge variant="outline" className="text-xs gap-1">
                <Crown className="w-3 h-3" />
                Pro
              </Badge>
              <Switch 
                checked={followUp.enabled}
                onCheckedChange={(checked) => onFollowUpUpdate({ enabled: checked })}
                disabled={userTier === 'free'}
              />
            </div>
          </AccordionTrigger>
          {followUp.enabled && userTier !== 'free' && (
            <AccordionContent className="space-y-6">
              {/* Basic Follow-up Settings */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Email Subject</Label>
                  <Input
                    value={followUp.subject}
                    onChange={(e) => onFollowUpUpdate({ subject: e.target.value })}
                    placeholder="Follow-up email subject"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Delay (hours)</Label>
                  <Input
                    type="number"
                    value={followUp.delay_hours}
                    onChange={(e) => onFollowUpUpdate({ delay_hours: parseInt(e.target.value) || 0 })}
                    min="1"
                    max="168"
                    placeholder="Hours to wait before sending"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Email Template</Label>
                  <Textarea
                    value={followUp.email_template}
                    onChange={(e) => onFollowUpUpdate({ email_template: e.target.value })}
                    placeholder="Follow-up email content"
                    rows={4}
                  />
                  <div className="mt-2">
                    <Label className="text-xs text-muted-foreground">Available tokens:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {followUp.personalization_tokens.map((token) => (
                        <Badge key={token} variant="outline" className="text-xs cursor-pointer"
                          onClick={() => {
                            onFollowUpUpdate({
                              email_template: followUp.email_template + ` ${token}`
                            })
                          }}
                        >
                          {token}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Follow-up Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={followUp.auto_send}
                    onCheckedChange={(checked) => onFollowUpUpdate({ auto_send: checked })}
                  />
                  <Label className="text-sm">Auto-send emails</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={followUp.sequence_enabled}
                    onCheckedChange={(checked) => onFollowUpUpdate({ sequence_enabled: checked })}
                    disabled={userTier !== 'executive'}
                  />
                  <Label className="text-sm">Email sequence (multiple follow-ups)</Label>
                  {userTier !== 'executive' && (
                    <Badge variant="outline" className="text-xs">Executive</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={followUp.ai_personalization}
                    onCheckedChange={(checked) => onFollowUpUpdate({ ai_personalization: checked })}
                    disabled={userTier !== 'executive'}
                  />
                  <Label className="text-sm">AI personalization</Label>
                  {userTier !== 'executive' && (
                    <Badge variant="outline" className="text-xs">Executive</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={followUp.tracking_enabled}
                    onCheckedChange={(checked) => onFollowUpUpdate({ tracking_enabled: checked })}
                  />
                  <Label className="text-sm">Email open tracking</Label>
                </div>
              </div>
            </AccordionContent>
          )}
          {userTier === 'free' && (
            <AccordionContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <h4 className="font-medium mb-2">Follow-up Automation</h4>
                <p className="text-sm mb-4">Automatically follow up with leads via personalized emails</p>
                <Button size="sm" className="gap-2">
                  <Crown className="h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </div>
            </AccordionContent>
          )}
        </AccordionItem>

        {/* Email Signature */}
        <AccordionItem value="email-signature">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>Email Signature</span>
              <Switch 
                checked={emailSignature.enabled}
                onCheckedChange={(checked) => onEmailSignatureUpdate({ enabled: checked })}
              />
            </div>
          </AccordionTrigger>
          {emailSignature.enabled && (
            <AccordionContent className="space-y-6">
              {/* Style Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Signature Style</Label>
                <div className="grid grid-cols-1 gap-3">
                  {EMAIL_SIGNATURE_STYLES.map((style) => (
                    <div
                      key={style.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        emailSignature.style === style.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-border-hover'
                      }`}
                      onClick={() => onEmailSignatureUpdate({ style: style.id as any })}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-sm">{style.name}</span>
                          <p className="text-xs text-muted-foreground">{style.description}</p>
                        </div>
                        {emailSignature.style === style.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signature Elements */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Include Elements</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={emailSignature.include_photo}
                      onCheckedChange={(checked) => onEmailSignatureUpdate({ include_photo: checked })}
                    />
                    <Label className="text-sm">Profile photo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={emailSignature.include_qr}
                      onCheckedChange={(checked) => onEmailSignatureUpdate({ include_qr: checked })}
                    />
                    <Label className="text-sm">QR code</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={emailSignature.include_social}
                      onCheckedChange={(checked) => onEmailSignatureUpdate({ include_social: checked })}
                    />
                    <Label className="text-sm">Social links</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={emailSignature.include_logo}
                      onCheckedChange={(checked) => onEmailSignatureUpdate({ include_logo: checked })}
                    />
                    <Label className="text-sm">Company logo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={emailSignature.banner_enabled}
                      onCheckedChange={(checked) => onEmailSignatureUpdate({ banner_enabled: checked })}
                      disabled={userTier === 'free'}
                    />
                    <Label className="text-sm">Promotional banner</Label>
                    {userTier === 'free' && (
                      <Badge variant="outline" className="text-xs">Pro</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Legal Disclaimer */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Legal Disclaimer (Optional)</Label>
                <Textarea
                  value={emailSignature.legal_disclaimer}
                  onChange={(e) => onEmailSignatureUpdate({ legal_disclaimer: e.target.value })}
                  placeholder="Add legal disclaimer or confidentiality notice..."
                  rows={2}
                />
              </div>

              {/* Email Client Formats */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Email Client Formats</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={emailSignature.outlook_format}
                      onCheckedChange={(checked) => onEmailSignatureUpdate({ outlook_format: checked })}
                    />
                    <Label className="text-sm">Microsoft Outlook compatible</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={emailSignature.gmail_format}
                      onCheckedChange={(checked) => onEmailSignatureUpdate({ gmail_format: checked })}
                    />
                    <Label className="text-sm">Gmail compatible</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={emailSignature.apple_mail_format}
                      onCheckedChange={(checked) => onEmailSignatureUpdate({ apple_mail_format: checked })}
                    />
                    <Label className="text-sm">Apple Mail compatible</Label>
                  </div>
                </div>
              </div>
            </AccordionContent>
          )}
        </AccordionItem>

        {/* Virtual Background */}
        <AccordionItem value="virtual-background">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <Monitor className="h-4 w-4 text-primary" />
              <span>Virtual Background</span>
              <Badge variant="outline" className="text-xs gap-1">
                <Crown className="w-3 h-3" />
                Pro
              </Badge>
              <Switch 
                checked={virtualBackground.enabled}
                onCheckedChange={(checked) => onVirtualBackgroundUpdate({ enabled: checked })}
                disabled={userTier === 'free'}
              />
            </div>
          </AccordionTrigger>
          {virtualBackground.enabled && userTier !== 'free' && (
            <AccordionContent className="space-y-6">
              {/* Background Style */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Background Style</Label>
                <div className="grid grid-cols-2 gap-3">
                  {VIRTUAL_BACKGROUND_STYLES.map((style) => (
                    <div
                      key={style.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        virtualBackground.style === style.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-border-hover'
                      }`}
                      onClick={() => onVirtualBackgroundUpdate({ style: style.id as any })}
                    >
                      <div className="text-center">
                        <span className="font-medium text-sm block">{style.name}</span>
                        <p className="text-xs text-muted-foreground">{style.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Background Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Resolution</Label>
                  <Select
                    value={virtualBackground.resolution}
                    onValueChange={(value: '720p' | '1080p' | '1440p' | '4k') => 
                      onVirtualBackgroundUpdate({ resolution: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p (HD)</SelectItem>
                      <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                      <SelectItem value="1440p">1440p (2K)</SelectItem>
                      <SelectItem value="4k">4K (Ultra HD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">File Format</Label>
                  <Select
                    value={virtualBackground.format}
                    onValueChange={(value: 'jpg' | 'png' | 'svg') => 
                      onVirtualBackgroundUpdate({ format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jpg">JPG (smaller file)</SelectItem>
                      <SelectItem value="png">PNG (transparency)</SelectItem>
                      <SelectItem value="svg">SVG (vector)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Logo Settings */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Switch 
                    checked={virtualBackground.include_logo}
                    onCheckedChange={(checked) => onVirtualBackgroundUpdate({ include_logo: checked })}
                  />
                  <Label className="text-sm font-medium">Include Logo</Label>
                </div>
                {virtualBackground.include_logo && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Logo Position</Label>
                    <Select
                      value={virtualBackground.logo_position}
                      onValueChange={(value: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'center') => 
                        onVirtualBackgroundUpdate({ logo_position: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top_left">Top Left</SelectItem>
                        <SelectItem value="top_right">Top Right</SelectItem>
                        <SelectItem value="bottom_left">Bottom Left</SelectItem>
                        <SelectItem value="bottom_right">Bottom Right</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Meeting Platforms */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Optimized for Platforms</Label>
                <div className="grid grid-cols-2 gap-2">
                  {MEETING_PLATFORMS.map((platform) => (
                    <div key={platform.id} className="flex items-center space-x-2">
                      <Switch 
                        checked={virtualBackground.meeting_platforms.includes(platform.id as any)}
                        onCheckedChange={(checked) => {
                          const platforms = checked 
                            ? [...virtualBackground.meeting_platforms, platform.id as any]
                            : virtualBackground.meeting_platforms.filter(p => p !== platform.id)
                          onVirtualBackgroundUpdate({ meeting_platforms: platforms })
                        }}
                      />
                      <Label className="text-sm">{platform.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={virtualBackground.branded_elements}
                    onCheckedChange={(checked) => onVirtualBackgroundUpdate({ branded_elements: checked })}
                  />
                  <Label className="text-sm">Include branded elements</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={virtualBackground.animation_enabled}
                    onCheckedChange={(checked) => onVirtualBackgroundUpdate({ animation_enabled: checked })}
                    disabled={userTier !== 'executive'}
                  />
                  <Label className="text-sm">Subtle animations</Label>
                  {userTier !== 'executive' && (
                    <Badge variant="outline" className="text-xs">Executive</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={virtualBackground.batch_export}
                    onCheckedChange={(checked) => onVirtualBackgroundUpdate({ batch_export: checked })}
                    disabled={userTier !== 'executive'}
                  />
                  <Label className="text-sm">Batch export multiple resolutions</Label>
                  {userTier !== 'executive' && (
                    <Badge variant="outline" className="text-xs">Executive</Badge>
                  )}
                </div>
              </div>
            </AccordionContent>
          )}
          {userTier === 'free' && (
            <AccordionContent>
              <div className="text-center py-8 text-muted-foreground">
                <Monitor className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <h4 className="font-medium mb-2">Virtual Backgrounds</h4>
                <p className="text-sm mb-4">Professional virtual backgrounds for video calls</p>
                <Button size="sm" className="gap-2">
                  <Crown className="h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </div>
            </AccordionContent>
          )}
        </AccordionItem>
      </Accordion>
    </div>
  )
}