export interface User {
  id: string
  email: string
  name: string
}

export interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company: string
  job_title?: string
  location?: string
}

export interface Meeting {
  id: string
  title: string
  startTime: Date
  endTime: Date
  location: string
  locationType?: 'zoom' | 'google-meet' | 'teams' | 'physical' | 'other' | string
  attendees: {
    email: string
    name?: string
    isOrganizer?: boolean
    linkedToContact?: boolean
    company?: string
    title?: string
    lastInteraction?: Date
    cardViews?: number
    relationshipLevel?: 'new' | 'warm' | 'close'
  }[]
  relatedCardId?: string
  relatedCardName?: string
  description?: string
  calendarId?: string
  meetingUrl?: string
  aiPrepHistory?: {
    preparedAt: Date
    insights: string[]
    talkingPoints: string[]
    questions: string[]
    attendeeContext: {
      name: string
      insights: string[]
      sharedConnections: string[]
      recentActivity: string[]
    }[]
  }[]
}

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar_url?: string
  company?: string
  job_title?: string
  bio?: string
  location?: string
  website?: string
  linkedin_url?: string
  twitter_url?: string
  created_at: string
  updated_at: string
}

export interface Card {
  id: string
  name: string
  template_id: string
  user_id: string
  is_active: boolean
  profile_data: {
    name: string
    title: string
    company: string
    bio: string
    email: string
    phone?: string
    website?: string
    linkedin?: string
    twitter?: string
    avatar_url?: string
  }
  design_data: {
    template: string
    gradient: string
    layout: 'left' | 'center' | 'right'
    colors: {
      primary: string
      secondary: string
      accent: string
    }
  }
  content_blocks: ContentBlock[]
  created_at: string
  updated_at: string
}

export interface ContentBlock {
  id: string
  type: 'contact' | 'social' | 'custom' | 'bio' | 'cta'
  title: string
  content: any
  order: number
  is_visible: boolean
}

export interface Template {
  id: string
  name: string
  category: 'business' | 'personal' | 'creative'
  preview_url: string
  is_premium: boolean
  design_config: {
    gradient: string
    layout: 'left' | 'center' | 'right'
    colors: {
      primary: string
      secondary: string
      accent: string
    }
  }
}

export interface Analytics {
  card_id: string
  total_views: number
  unique_visitors: number
  click_through_rate: number
  top_traffic_sources: {
    source: string
    visits: number
    percentage: number
  }[]
  engagement_metrics: {
    avg_time_on_card: number
    bounce_rate: number
    conversion_rate: number
  }
  recent_activity: {
    date: string
    views: number
    clicks: number
  }[]
}