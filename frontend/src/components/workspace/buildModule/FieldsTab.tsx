import React from 'react'
import { LinkIcon, FileText, Plus, Trash2, Edit3, X, Check } from 'lucide-react'
import { Card } from '../../ui/card'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { Switch } from '../../ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion'
import { ContactLink, CustomField } from '../../../types/buildModule'
import { POPULAR_PLATFORMS } from '../../../utils/buildModuleConstants'

interface FieldsTabProps {
  contactLinks: ContactLink[]
  customFields: CustomField[]
  userTier: string
  onAddContactLink: (platform?: string) => void
  onUpdateContactLink: (id: string, updates: Partial<ContactLink>) => void
  onRemoveContactLink: (id: string) => void
  onAddCustomField: (type?: any) => void
  onUpdateCustomField: (id: string, updates: Partial<CustomField>) => void
  onRemoveCustomField: (id: string) => void
  expandedSections: string[]
  onExpandedSectionsChange: (sections: string[]) => void
}

export function FieldsTab({
  contactLinks,
  customFields,
  userTier,
  onAddContactLink,
  onUpdateContactLink,
  onRemoveContactLink,
  onAddCustomField,
  onUpdateCustomField,
  onRemoveCustomField,
  expandedSections,
  onExpandedSectionsChange
}: FieldsTabProps) {
  return (
    <div className="p-6 space-y-6">
      <Accordion type="multiple" value={expandedSections} onValueChange={onExpandedSectionsChange}>
        
        {/* Social & Professional Links */}
        <AccordionItem value="social-links">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <LinkIcon className="h-4 w-4 text-primary" />
              <span>Social & Professional Links</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            {/* Quick Add Buttons */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Quick Add Popular Platforms</Label>
              <div className="grid grid-cols-3 gap-2">
                {POPULAR_PLATFORMS.map((platform) => (
                  <Button
                    key={platform.platform}
                    variant="outline"
                    size="sm"
                    onClick={() => onAddContactLink(platform.platform)}
                    className="justify-start gap-2 text-xs"
                    disabled={contactLinks.some(link => link.platform === platform.platform)}
                  >
                    <span>{platform.icon}</span>
                    {platform.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Existing Links */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Your Links</Label>
                <Button size="sm" variant="outline" onClick={() => onAddContactLink()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Custom Link
                </Button>
              </div>
              
              <div className="space-y-3">
                {contactLinks.map((link, index) => (
                  <div key={link.id} className="p-4 bg-muted/50 rounded-lg space-y-3">
                    {/* Link Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-surface rounded-lg flex items-center justify-center">
                          <span className="text-sm">{link.icon}</span>
                        </div>
                        <div>
                          <Input
                            value={link.label}
                            onChange={(e) => onUpdateContactLink(link.id, { label: e.target.value })}
                            className="font-medium text-sm h-8"
                            placeholder="Link label"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={link.is_visible}
                          onCheckedChange={(checked) => onUpdateContactLink(link.id, { is_visible: checked })}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveContactLink(link.id)}
                          className="p-1 h-8 w-8 text-muted-foreground hover:text-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Link Details */}
                    <div className="space-y-2">
                      <Input
                        value={link.url}
                        onChange={(e) => onUpdateContactLink(link.id, { url: e.target.value })}
                        placeholder="URL or contact info"
                        className="text-sm"
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={link.category}
                          onValueChange={(value: 'social' | 'professional' | 'communication' | 'other') => 
                            onUpdateContactLink(link.id, { category: value })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="social">Social</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="communication">Communication</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={link.click_action}
                          onValueChange={(value: 'open_link' | 'copy_text' | 'call' | 'email' | 'message') => 
                            onUpdateContactLink(link.id, { click_action: value })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open_link">Open Link</SelectItem>
                            <SelectItem value="copy_text">Copy Text</SelectItem>
                            <SelectItem value="call">Call</SelectItem>
                            <SelectItem value="email">Send Email</SelectItem>
                            <SelectItem value="message">Send Message</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
                
                {contactLinks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <LinkIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No links added yet</p>
                    <p className="text-xs mt-1">Add social and professional links to help people connect with you</p>
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Custom Fields */}
        <AccordionItem value="custom-fields">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Custom Fields</span>
              {userTier !== 'free' && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Check className="w-3 h-3" />
                  Pro
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            {/* Field Type Buttons */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Add Custom Field</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'text', label: 'Text' },
                  { type: 'email', label: 'Email' },
                  { type: 'phone', label: 'Phone' },
                  { type: 'url', label: 'URL' },
                  { type: 'date', label: 'Date' },
                  { type: 'textarea', label: 'Long Text' }
                ].map((fieldType) => (
                  <Button
                    key={fieldType.type}
                    variant="outline"
                    size="sm"
                    onClick={() => onAddCustomField(fieldType.type)}
                    className="justify-start gap-2 text-xs"
                    disabled={userTier === 'free'}
                  >
                    <Edit3 className="h-4 w-4" />
                    {fieldType.label}
                  </Button>
                ))}
              </div>
              {userTier === 'free' && (
                <p className="text-xs text-muted-foreground mt-2">Upgrade to Pro to add custom fields</p>
              )}
            </div>

            {/* Existing Custom Fields */}
            {customFields.length > 0 && (
              <div className="space-y-3">
                {customFields.map((field) => (
                  <div key={field.id} className="p-4 bg-muted/50 rounded-lg space-y-3">
                    {/* Field Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Input
                          value={field.label}
                          onChange={(e) => onUpdateCustomField(field.id, { label: e.target.value })}
                          className="font-medium text-sm h-8 w-32"
                          placeholder="Field label"
                        />
                        <Badge variant="outline" className="text-xs">
                          {field.type}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={field.is_visible}
                          onCheckedChange={(checked) => onUpdateCustomField(field.id, { is_visible: checked })}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveCustomField(field.id)}
                          className="p-1 h-8 w-8 text-muted-foreground hover:text-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Field Value Input */}
                    <div>
                      {field.type === 'textarea' ? (
                        <Textarea
                          value={field.value}
                          onChange={(e) => onUpdateCustomField(field.id, { value: e.target.value })}
                          placeholder="Field value"
                          className="text-sm"
                          rows={2}
                        />
                      ) : (
                        <Input
                          value={field.value}
                          onChange={(e) => onUpdateCustomField(field.id, { value: e.target.value })}
                          placeholder="Field value"
                          className="text-sm"
                          type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'url' ? 'url' : field.type === 'date' ? 'date' : 'text'}
                        />
                      )}
                    </div>

                    {/* Field Options */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={field.is_required}
                          onCheckedChange={(checked) => onUpdateCustomField(field.id, { is_required: checked })}
                        />
                        <Label className="text-xs">Required</Label>
                      </div>
                      <Select
                        value={field.display_format}
                        onValueChange={(value: 'inline' | 'block' | 'icon_only') => 
                          onUpdateCustomField(field.id, { display_format: value })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inline">Inline</SelectItem>
                          <SelectItem value="block">Block</SelectItem>
                          <SelectItem value="icon_only">Icon Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {customFields.length === 0 && userTier !== 'free' && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No custom fields added yet</p>
                <p className="text-xs mt-1">Add custom fields to capture additional information</p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}