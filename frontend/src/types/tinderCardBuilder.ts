export interface TinderInspiredCardBuilderProps {
  card: any
  onUpdate: (updates: any) => void
  user: any
  userTier?: 'free' | 'professional' | 'executive'
  isEventMode?: boolean
  eventName?: string
}

export interface ColorPalette {
  name: string
  colors: string[]
  gradient: string
  description: string
  category: string
  premium: boolean
}

export interface FontCombination {
  name: string
  heading: string
  body: string
  description: string
  preview: {
    heading: string
    body: string
  }
  personality: string
  category: string
  premium: boolean
}

export interface CardTemplate {
  id: string
  name: string
  description: string
  preview: string
  category: string
  premium: boolean
  style: {
    borderRadius: string
    boxShadow: string
    transform?: string
    background: string
    backdropFilter?: string
    border?: string
    position?: string
    backgroundSize?: string
    animation?: string
  }
}

export interface AIPersona {
  id: string
  name: string
  description: string
  avatar: string
  tone: string
  specialties: string[]
}

export interface CTAButton {
  id: string
  label: string
  icon: string
  color: string
}

export interface CustomFieldType {
  id: string
  label: string
  icon: string
  description: string
}

export interface OnboardingStep {
  title: string
  description: string
  target: string
  action: string
}

export interface CardDesign {
  template?: string
  colors?: {
    primary: string
    secondary: string
    background: string
    text: string
  }
  fonts?: {
    heading: string
    body: string
  }
}

export interface CardProfile {
  full_name?: string
  job_title?: string
  company?: string
  location?: string
  bio?: string
  profile_photo_url?: string
  industry?: string
}

export interface CardLink {
  id: string
  label: string
  url: string
  platform: string
  is_visible: boolean
  order?: number
}

export interface CardCTA {
  id: string
  type: string
  label: string
  action: string
  is_visible: boolean
  position: {
    x: number
    y: number
  }
  style: {
    color: string
    size: string
  }
}

export interface CustomField {
  id: string
  type: string
  label: string
  value: string
  is_visible: boolean
  order: number
}

export interface Card {
  id?: string
  name?: string
  design?: CardDesign
  profile?: CardProfile
  links?: CardLink[]
  ctas?: CardCTA[]
  custom_fields?: CustomField[]
  status?: string
  published_at?: string
  updated_at?: string
}