import React from 'react'
import { Activity, Eye, MessageCircle, FileText } from 'lucide-react'
import { Card } from '../ui/card'
import { formatTimeAgo } from '../../utils/contactHelpers'

interface ContactActivityTabProps {
  contact: any
}

export function ContactActivityTab({ contact }: ContactActivityTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <Activity className="h-5 w-5 mr-2 text-primary" />
        Activity Timeline
      </h3>
      
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Eye className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Viewed business card</h4>
                <span className="text-sm text-muted-foreground">2h ago</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Spent {contact.engagement_metrics ? Math.floor(contact.engagement_metrics.time_on_card / 60) : 2} minutes on your {contact.card_name}
              </p>
            </div>
          </div>
        </Card>

        {contact.ai_interaction_metrics?.chat_initiated && (
          <Card className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">Started AI conversation</h4>
                  <span className="text-sm text-muted-foreground">4h ago</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Sent {contact.ai_interaction_metrics.messages_sent} messages about {contact.ai_interaction_metrics.intent_signals?.[0]?.replace('_', ' ') || 'general inquiries'}
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Completed contact form</h4>
                <span className="text-sm text-muted-foreground">
                  {formatTimeAgo(contact.captured_at)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Provided contact information via {contact.source === 'qr' ? 'QR code scan' : contact.source}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}