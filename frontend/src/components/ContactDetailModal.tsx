import React, { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ContactProfilePanel } from './contacts/ContactProfilePanel'
import { ContactShareModal } from './contacts/ContactShareModal'

import { ContactDetailsTab } from './contacts/ContactDetailsTab'

import { ContactActivityTab } from './contacts/ContactActivityTab'
import { ContactConversationsTab } from './contacts/ContactConversationsTab'
import { ContactNotesTab } from './contacts/ContactNotesTab'

interface Contact {
  id: string
  card_id: string
  card_owner_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  company: string
  company_website?: string
  job_title?: string
  location?: string
  linkedin?: string
  source: 'qr' | 'link' | 'email' | 'ai_chat' | 'social' | 'referral' | 'direct'
  status: 'new' | 'contacted' | 'archived'
  captured_at: string
  last_interaction?: string
  notes?: string
  tags: string[]
  interactions_count?: number
  card_name?: string
  context?: {
    where_met?: string
    what_discussed?: string
    why_important?: string
    meeting_date?: string
    last_meeting?: string
    next_meeting?: string
  }
  enriched_data?: {
    profile_photo?: string
    company_info?: {
      size: string
      industry: string
      founded: string
    }
    social_links?: {
      linkedin?: string
      twitter?: string
    }
    location_verified?: string
  }
  enriched_at?: string
  engagement_metrics?: {
    card_views: number
    time_on_card: number
    links_clicked: number
    return_visits: number
  }
  ai_interaction_metrics?: {
    chat_initiated: boolean
    messages_sent: number
    intent_signals: string[]
  }
  form_completion_metrics?: {
    fields_filled: number
    total_fields: number
    data_quality_score: number
  }
  capture_details?: {
    device_type: 'mobile' | 'desktop' | 'tablet'
    location_data?: string
    referrer?: string
    session_id?: string
    ip_address?: string
  }
  meeting_history?: {
    date: string
    type: 'in-person' | 'video' | 'phone' | 'email'
    duration?: number
    notes?: string
    outcome?: string
  }[]
}

interface ContactDetailModalProps {
  contact: Contact | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (contact: Contact) => void
  onSendMessage?: (contact: Contact) => void
  onAddToCampaign?: (contact: Contact) => void
  onExport?: (contact: Contact) => void
  userPlan?: 'starter' | 'professional' | 'executive'
}

export function ContactDetailModal({ 
  contact, 
  isOpen, 
  onClose, 
  onEdit, 
  onSendMessage, 
  onAddToCampaign, 
  onExport,
  userPlan = 'starter'
}: ContactDetailModalProps) {
  const [activeTab, setActiveTab] = useState('details')
  const [showShareModal, setShowShareModal] = useState(false)


  if (!contact || !isOpen) return null



  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-6">
        <div 
          className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-surface">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Contact Details</h2>
              <p className="text-sm text-text-secondary mt-1">
                Complete profile and interaction history
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-lg hover:bg-surface-hover"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Modal Content */}
          <div className="flex h-[calc(90vh-88px)]">
            {/* Left Panel - Contact Profile */}
            <div className="w-80 bg-accent/50 border-r border-border flex-shrink-0">
              <ContactProfilePanel
                contact={contact}
                userPlan={userPlan}
                onClose={onClose}
                onShare={() => setShowShareModal(true)}
                onEdit={() => onEdit?.(contact)}
                onSendMessage={() => onSendMessage?.(contact)}
              />
            </div>

            {/* Right Panel - Tabbed Content */}
            <div className="flex-1 flex flex-col bg-background">
              {/* Tab Navigation */}
              <div className="border-b border-border bg-surface px-8 py-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-accent/50 p-1 rounded-xl h-12">
                    <TabsTrigger 
                      value="details"
                      className="rounded-lg h-10 font-medium text-sm data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-sm"
                    >
                      Details
                    </TabsTrigger>
                    <TabsTrigger 
                      value="activity"
                      className="rounded-lg h-10 font-medium text-sm data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-sm"
                    >
                      Activity
                    </TabsTrigger>
                    <TabsTrigger 
                      value="conversations"
                      className="rounded-lg h-10 font-medium text-sm data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-sm"
                    >
                      Conversations
                    </TabsTrigger>
                    <TabsTrigger 
                      value="notes"
                      className="rounded-lg h-10 font-medium text-sm data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-sm"
                    >
                      Notes
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                  <TabsContent value="details" className="p-8 space-y-8 h-full m-0">
                    <ContactDetailsTab contact={contact} userPlan={userPlan} />
                  </TabsContent>



                  <TabsContent value="activity" className="p-8 h-full m-0">
                    <ContactActivityTab contact={contact} />
                  </TabsContent>

                  <TabsContent value="conversations" className="p-8 h-full m-0">
                    <ContactConversationsTab contact={contact} />
                  </TabsContent>

                  <TabsContent value="notes" className="p-8 h-full m-0">
                    <ContactNotesTab contact={contact} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Share Modal */}
      <ContactShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        contact={contact}
      />
    </>
  )
}