import React from 'react'
import { MessageSquare, Sparkles, Zap, FileText, TrendingUp, Clock, Users, ExternalLink } from 'lucide-react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { getSourceIcon, getSourceLabel, getDeviceIcon, formatDuration } from '../../utils/contactHelpers'

interface ContactDetailsTabProps {
  contact: any
  userPlan?: 'starter' | 'professional' | 'executive'
}

export function ContactDetailsTab({ contact, userPlan = 'starter' }: ContactDetailsTabProps) {
  const SourceIcon = getSourceIcon(contact.source)
  const DeviceIcon = getDeviceIcon(contact.capture_details?.device_type || 'desktop')

  return (
    <div className="space-y-8">
      {/* Notes - Replacing Context */}
      {contact.notes && (
        <Card className="p-8 rounded-2xl border-border bg-surface shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Notes</h3>
              <p className="text-sm text-text-secondary">Your notes about this contact</p>
            </div>
          </div>
          
          <div className="p-4 bg-accent/50 rounded-xl border border-border">
            <p className="text-sm text-text-primary whitespace-pre-wrap">{contact.notes}</p>
          </div>
        </Card>
      )}

      {/* Enriched Data */}
      {contact.enriched_data && userPlan !== 'starter' && (
        <Card className="p-8 rounded-2xl border-primary/20 bg-primary-light/30 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary">AI-Enhanced Information</h3>
              <p className="text-sm text-text-secondary">Automatically enriched with public data</p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-lg">
              Auto-enhanced
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {contact.enriched_data.company_info && (
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-4">Company Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-border">
                    <span className="text-sm text-text-secondary">Company Size</span>
                    <span className="text-sm font-medium text-text-primary">{contact.enriched_data.company_info.size}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-border">
                    <span className="text-sm text-text-secondary">Industry</span>
                    <span className="text-sm font-medium text-text-primary">{contact.enriched_data.company_info.industry}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-border">
                    <span className="text-sm text-text-secondary">Founded</span>
                    <span className="text-sm font-medium text-text-primary">{contact.enriched_data.company_info.founded}</span>
                  </div>
                </div>
              </div>
            )}
            
            {contact.enriched_data.social_links && (
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-4">Social Profiles</h4>
                <div className="space-y-3">
                  {contact.enriched_data.social_links.linkedin && (
                    <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
                      <div className="flex items-center space-x-2">
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-text-primary">LinkedIn</span>
                      </div>
                      <Badge className="bg-success/10 text-success border-success/20 text-xs">Found</Badge>
                    </div>
                  )}
                  {contact.enriched_data.social_links.twitter && (
                    <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
                      <div className="flex items-center space-x-2">
                        <ExternalLink className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-text-primary">Twitter</span>
                      </div>
                      <Badge className="bg-success/10 text-success border-success/20 text-xs">Found</Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Source Information */}
      <Card className="p-8 rounded-2xl border-border bg-surface shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-info" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Capture Information</h3>
            <p className="text-sm text-text-secondary">How this contact was acquired</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-3">Source Method</h4>
              <div className="flex items-center space-x-3 p-4 bg-accent/50 rounded-xl border border-border">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <SourceIcon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-text-primary">
                  {getSourceLabel(contact.source)}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-3">Original Card</h4>
              <div className="flex items-center space-x-3 p-4 bg-accent/50 rounded-xl border border-border">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-success" />
                </div>
                <span className="text-sm font-medium text-text-primary">{contact.card_name || 'Unknown Card'}</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-3">Captured</h4>
              <div className="flex items-center space-x-3 p-4 bg-accent/50 rounded-xl border border-border">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-warning" />
                </div>
                <span className="text-sm font-medium text-text-primary">
                  {new Date(contact.captured_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {contact.capture_details && (
              <>
                <div>
                  <h4 className="text-sm font-medium text-text-secondary mb-3">Device Type</h4>
                  <div className="flex items-center space-x-3 p-4 bg-accent/50 rounded-xl border border-border">
                    <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                      <DeviceIcon className="h-4 w-4 text-info" />
                    </div>
                    <span className="text-sm font-medium text-text-primary capitalize">
                      {contact.capture_details.device_type}
                    </span>
                  </div>
                </div>

                {contact.capture_details.referrer && (
                  <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-3">Referrer</h4>
                    <div className="flex items-center space-x-3 p-4 bg-accent/50 rounded-xl border border-border">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <ExternalLink className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-text-primary">{contact.capture_details.referrer}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-3">Total Interactions</h4>
              <div className="flex items-center space-x-3 p-4 bg-accent/50 rounded-xl border border-border">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-text-primary">
                  {contact.interactions_count || 0} interactions
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Engagement Metrics */}
      {contact.engagement_metrics && (
        <Card className="p-8 rounded-2xl border-border bg-surface shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Engagement Metrics</h3>
              <p className="text-sm text-text-secondary">How they interacted with your card</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">{contact.engagement_metrics.card_views}</div>
              <div className="text-sm text-blue-600 font-medium">Card Views</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatDuration(contact.engagement_metrics.time_on_card)}
              </div>
              <div className="text-sm text-green-600 font-medium">Time on Card</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="text-2xl font-bold text-purple-600 mb-1">{contact.engagement_metrics.links_clicked}</div>
              <div className="text-sm text-purple-600 font-medium">Links Clicked</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="text-2xl font-bold text-orange-600 mb-1">{contact.engagement_metrics.return_visits}</div>
              <div className="text-sm text-orange-600 font-medium">Return Visits</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}