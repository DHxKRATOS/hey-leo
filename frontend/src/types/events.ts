export interface Event {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  location: string
  venue: string
  bannerImage?: string
  organizerId: string
  attendeeCount: number
  status: 'upcoming' | 'active' | 'completed'
  category: 'conference' | 'meetup' | 'workshop' | 'webinar' | 'networking'
  agenda: EventAgendaItem[]
  networkingEnabled: boolean
  settings: EventSettings
  
  // Event analytics and engagement
  connectionsMade?: number
  views?: number
  messagesSent?: number
  satisfactionRating?: number
  
  // User-specific properties
  rsvpStatus?: 'attending' | 'maybe' | 'not_attending' | 'attended'
  isBookmarked?: boolean
  pendingConnections?: number
  
  // Featured properties
  is_featured?: boolean
  featuredAttendees?: {
    id: string
    name: string
    avatar?: string
    title?: string
  }[]
  
  // Additional session tracking
  completedSessions?: number
}

export interface EventAgendaItem {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  location: string
  speaker?: string
  type: 'keynote' | 'session' | 'break' | 'networking' | 'meal'
  trackId?: string
  potentialMatches?: number
}

export interface EventSettings {
  networkingHours: {
    start: string
    end: string
  }
  allowNetworking: boolean
  allowChat: boolean
  moderationEnabled: boolean
  requireApproval: boolean
}

export interface EventAttendee {
  id: string
  userId: string
  eventId: string
  profile: AttendeeProfile
  networkingPreferences: NetworkingPreferences
  status: 'registered' | 'checked_in' | 'networking' | 'offline'
  joinedAt: string
  lastActive?: string
}

export interface AttendeeProfile {
  name: string
  title: string
  company: string
  industry: string
  interests: string[]
  lookingFor: string[]
  companyStage: 'startup' | 'growth' | 'enterprise'
  profilePhoto?: string
  bio?: string
  isVisible: boolean
}

export interface NetworkingPreferences {
  visibility: 'visible' | 'matched_only' | 'invisible'
  showPhoto: boolean
  showCompany: boolean
  allowSuperConnects: boolean
  blockedUsers: string[]
}

export interface NetworkingMatch {
  id: string
  eventId: string
  user1Id: string
  user2Id: string
  status: 'pending' | 'mutual' | 'expired'
  createdAt: string
  matchedAt?: string
  chatId?: string
}

export interface EventChat {
  id: string
  eventId: string
  matchId: string
  participants: string[]
  messages: ChatMessage[]
  createdAt: string
  lastMessageAt?: string
}

export interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  content: string
  type: 'text' | 'card_share' | 'meeting_request'
  timestamp: string
  metadata?: any
}

export interface NetworkingAction {
  userId: string
  targetUserId: string
  action: 'skip' | 'connect' | 'super_connect'
  timestamp: string
}

export interface EventFilter {
  industries: string[]
  interests: string[]
  lookingFor: string[]
  companyStage: 'all' | 'startup' | 'growth' | 'enterprise'
}

export type EventTab = 'agenda' | 'networking'
export type NetworkingView = 'discover' | 'matches' | 'chat'
export type MatchAction = 'skip' | 'connect' | 'super_connect'