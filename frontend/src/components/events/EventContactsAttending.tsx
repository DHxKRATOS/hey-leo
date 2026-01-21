import React, { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { 
  Users, 
  MessageCircle, 
  UserPlus, 
  Eye, 
  Building, 
  MapPin,
  Mail,
  Phone,
  ChevronRight,
  Sparkles,
  Star,
  Activity
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Separator } from '../ui/separator'
import { Event } from '../../types/events'

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company: string
  job_title?: string
  location?: string
  source: 'qr' | 'link' | 'email' | 'ai_chat' | 'social' | 'referral' | 'direct'
  status: 'new' | 'contacted' | 'archived'
  captured_at: string
  last_interaction?: string
  notes?: string
  tags: string[]
  interactions_count?: number
  card_name?: string
  
  // Engagement metrics
  engagement_metrics?: {
    card_views: number
    time_on_card: number
    links_clicked: number
    return_visits: number
  }
}

interface EventContactsAttendingProps {
  event: Event
  contacts?: Contact[]
  onContactSelect?: (contact: Contact) => void
  onMessageContact?: (contact: Contact) => void
  compact?: boolean
}

export function EventContactsAttending({ 
  event, 
  contacts = [], 
  onContactSelect, 
  onMessageContact,
  compact = false 
}: EventContactsAttendingProps) {
  const [showAllContacts, setShowAllContacts] = useState(false)

  // Create mock contacts for demo (in real app, this would come from props)
  const demoContacts: Contact[] = [
    {
      id: 'contact-1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@techcorp.com',
      phone: '+1-555-0123',
      company: 'TechCorp Solutions',
      job_title: 'Senior Product Manager',
      location: 'San Francisco, CA',
      source: 'qr',
      status: 'contacted',
      captured_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      last_interaction: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      notes: 'Met at previous event. Very interested in our AI solutions.',
      tags: ['Event Lead', 'Priority', 'AI Interest'],
      interactions_count: 8,
      card_name: 'Professional Card',
      engagement_metrics: {
        card_views: 12,
        time_on_card: 285,
        links_clicked: 6,
        return_visits: 4
      }
    },
    {
      id: 'contact-2',
      name: 'Michael Chen',
      email: 'michael.chen@startup.io',
      company: 'StartupHub',
      job_title: 'CTO',
      location: 'San Francisco, CA',
      source: 'link',
      status: 'contacted',
      captured_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      last_interaction: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      notes: 'Looking for partnership opportunities. High potential.',
      tags: ['Partnership', 'CTO', 'Startup'],
      interactions_count: 15,
      card_name: 'Networking Card',
      engagement_metrics: {
        card_views: 18,
        time_on_card: 420,
        links_clicked: 9,
        return_visits: 6
      }
    },
    {
      id: 'contact-3',
      name: 'Emily Rodriguez',
      email: 'emily.r@creativestudio.com',
      company: 'Creative Studio',
      job_title: 'Marketing Director',
      location: 'Los Angeles, CA',
      source: 'ai_chat',
      status: 'new',
      captured_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      last_interaction: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      notes: 'Highly engaged with AI assistant. Potential collaboration.',
      tags: ['AI Engaged', 'Creative', 'Marketing'],
      interactions_count: 12,
      card_name: 'Creative Card',
      engagement_metrics: {
        card_views: 15,
        time_on_card: 380,
        links_clicked: 8,
        return_visits: 5
      }
    }
  ]

  // Match contacts with event attendees (simplified matching logic)
  const attendingContacts = useMemo(() => {
    const contactsToUse = contacts.length > 0 ? contacts : demoContacts
    
    // In a real app, this would match based on email addresses or user IDs
    // For now, we'll simulate some contacts attending this event based on event type
    let simulatedAttendingCount = 0
    
    // Different events have different likelihood of contacts attending
    switch (event.category) {
      case 'conference':
        simulatedAttendingCount = Math.min(2, contactsToUse.length)
        break
      case 'meetup':
        simulatedAttendingCount = Math.min(1, contactsToUse.length)
        break
      case 'workshop':
        simulatedAttendingCount = Math.min(1, contactsToUse.length)
        break
      default:
        simulatedAttendingCount = Math.min(1, contactsToUse.length)
    }
    
    // Add some randomness - some events might have no mutual contacts
    if (Math.random() < 0.3) simulatedAttendingCount = 0
    
    const simulatedAttending = contactsToUse.slice(0, simulatedAttendingCount)
    
    return simulatedAttending.map(contact => ({
      ...contact,
      // Add event-specific data
      eventAttendeeId: `${event.id}-${contact.id}`,
      attendeeStatus: Math.random() > 0.7 ? 'maybe' : 'confirmed' as 'confirmed' | 'maybe' | 'not_going',
      commonConnections: Math.floor(Math.random() * 15) + 1,
      sharedInterests: ['AI', 'Product', 'Networking', 'Design', 'Business'].slice(0, Math.floor(Math.random() * 3) + 1)
    }))
  }, [contacts, event.id, event.category, demoContacts])

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-cyan-500'
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const getStatusBadge = (status: 'confirmed' | 'maybe' | 'not_going') => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Attending</Badge>
      case 'maybe':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Maybe</Badge>
      case 'not_going':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Not Going</Badge>
    }
  }

  const getEngagementLevel = (contact: any) => {
    if (!contact.engagement_metrics) return 'low'
    const { card_views, time_on_card, return_visits } = contact.engagement_metrics
    const score = (card_views * 2) + (time_on_card / 60) + (return_visits * 3)
    
    if (score > 50) return 'high'
    if (score > 20) return 'medium'
    return 'low'
  }

  const getEngagementIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <Star className="w-3 h-3 text-amber-500" />
      case 'medium':
        return <Activity className="w-3 h-3 text-blue-500" />
      default:
        return <Eye className="w-3 h-3 text-gray-400" />
    }
  }

  if (attendingContacts.length === 0) {
    return null
  }

  const displayContacts = compact ? attendingContacts.slice(0, 2) : attendingContacts
  const hasMore = attendingContacts.length > (compact ? 2 : 5)

  return (
    <TooltipProvider>
      <Card className="p-6 rounded-2xl shadow-sm bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Your Contacts Attending</h3>
              <p className="text-sm text-muted-foreground">
                {attendingContacts.length} contact{attendingContacts.length !== 1 ? 's' : ''} attending this event
              </p>
            </div>
          </div>
          
          {attendingContacts.length > 2 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Contacts Attending {event.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {attendingContacts.map((contact, index) => (
                    <ContactCard 
                      key={contact.id}
                      contact={contact}
                      onContactSelect={onContactSelect}
                      onMessageContact={onMessageContact}
                      detailed
                    />
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="space-y-3">
          {displayContacts.map((contact, index) => (
            <ContactCard 
              key={contact.id}
              contact={contact}
              onContactSelect={onContactSelect}
              onMessageContact={onMessageContact}
              compact={compact}
            />
          ))}
          
          {hasMore && !compact && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="pt-2 border-t border-border/50"
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-muted-foreground hover:text-primary"
                onClick={() => setShowAllContacts(true)}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                View {attendingContacts.length - displayContacts.length} more contacts
              </Button>
            </motion.div>
          )}
        </div>
      </Card>
    </TooltipProvider>
  )
}

// Separate component for individual contact cards
interface ContactCardProps {
  contact: any
  onContactSelect?: (contact: any) => void
  onMessageContact?: (contact: any) => void
  compact?: boolean
  detailed?: boolean
}

function ContactCard({ 
  contact, 
  onContactSelect, 
  onMessageContact, 
  compact = false,
  detailed = false 
}: ContactCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-cyan-500'
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const getStatusBadge = (status: 'confirmed' | 'maybe' | 'not_going') => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Attending</Badge>
      case 'maybe':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Maybe</Badge>
      case 'not_going':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Not Going</Badge>
    }
  }

  const getEngagementLevel = (contact: any) => {
    if (!contact.engagement_metrics) return 'low'
    const { card_views, time_on_card, return_visits } = contact.engagement_metrics
    const score = (card_views * 2) + (time_on_card / 60) + (return_visits * 3)
    
    if (score > 50) return 'high'
    if (score > 20) return 'medium'
    return 'low'
  }

  const getEngagementIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <Star className="w-3 h-3 text-amber-500" />
      case 'medium':
        return <Activity className="w-3 h-3 text-blue-500" />
      default:
        return <Eye className="w-3 h-3 text-gray-400" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-surface border border-border rounded-xl p-4 hover:bg-surface-hover transition-colors ${
        onContactSelect ? 'cursor-pointer' : ''
      }`}
      onClick={() => onContactSelect?.(contact)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Avatar className="w-10 h-10">
            <AvatarImage src={`https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1494790108755-2616b612b2c5' : '1472099645785-5658abf4ff4e'}?w=100&h=100&fit=crop&crop=face`} />
            <AvatarFallback className={`${getAvatarColor(contact.name)} text-white text-sm font-medium`}>
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-foreground truncate">{contact.name}</h4>
              {getEngagementIcon(getEngagementLevel(contact))}
              {getStatusBadge(contact.attendeeStatus)}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Building className="w-3 h-3" />
                <span className="truncate">{contact.job_title} at {contact.company}</span>
              </div>
              
              {contact.commonConnections && (
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{contact.commonConnections} mutual</span>
                </div>
              )}
            </div>

            {detailed && (
              <>
                <div className="mt-2 text-sm text-muted-foreground">
                  {contact.location && (
                    <div className="flex items-center space-x-1 mb-1">
                      <MapPin className="w-3 h-3" />
                      <span>{contact.location}</span>
                    </div>
                  )}
                  
                  {contact.email && (
                    <div className="flex items-center space-x-1 mb-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                </div>

                {contact.sharedInterests && contact.sharedInterests.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {contact.sharedInterests.map((interest: string) => (
                        <Badge key={interest} variant="outline" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {contact.notes && (
                  <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground italic">"{contact.notes}"</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {!compact && (
          <div className="flex items-center space-x-2 ml-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMessageContact?.(contact)
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send Message</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={(e) => {
                    e.stopPropagation()
                    onContactSelect?.(contact)
                  }}
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Profile</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </motion.div>
  )
}