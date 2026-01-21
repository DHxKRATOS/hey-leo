import React from 'react'
import { Bot } from 'lucide-react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { getIntentLabel } from '../../utils/contactHelpers'

interface ContactConversationsTabProps {
  contact: any
}

export function ContactConversationsTab({ contact }: ContactConversationsTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <Bot className="h-5 w-5 mr-2 text-primary" />
        AI Chat History
      </h3>
      
      {contact.ai_interaction_metrics?.chat_initiated ? (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div className="flex justify-end">
            <div className="max-w-[80%]">
              <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                <p className="text-sm">Hi! I saw your business card and I'm interested in learning more about your AI solutions.</p>
              </div>
              <div className="mt-1 text-xs text-muted-foreground text-right">4h ago</div>
            </div>
          </div>

          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">AI Assistant</span>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">Thanks for your interest! I'd be happy to help you learn more about our AI-powered networking solutions. What specific challenges are you looking to solve?</p>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">4h ago</div>
            </div>
          </div>

          {/* Show intent signals */}
          {contact.ai_interaction_metrics.intent_signals && contact.ai_interaction_metrics.intent_signals.length > 0 && (
            <Card className="p-4 bg-accent">
              <h4 className="font-medium text-foreground mb-2">Detected Intent</h4>
              <div className="flex flex-wrap gap-2">
                {contact.ai_interaction_metrics.intent_signals.map((signal: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {getIntentLabel(signal)}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium text-foreground mb-2">No AI Conversations</h4>
          <p className="text-sm text-muted-foreground">
            This contact hasn't initiated any AI conversations yet.
          </p>
        </Card>
      )}
    </div>
  )
}