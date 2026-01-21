export interface CardDesign {
  template: string
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
    accent?: string
  }
  fonts: {
    heading: string
    body: string
  }
  layout: string
  spacing: string
  corners: string
  shadows: string
}

export interface ProfileData {
  full_name: string
  job_title: string
  company: string
  location: string
  bio: string
  profile_photo_url: string
  cover_image_url: string
  company_logo_url: string
  phone: string
  email: string
  website: string
  tagline: string
  industry: string
  experience_years: number
  achievements: string[]
  skills: string[]
  languages: string[]
  certifications: string[]
  education: string
  availability_status: 'available' | 'busy' | 'away'
  timezone: string
}

export interface ContactLink {
  id: string
  platform: string
  url: string
  label: string
  is_visible: boolean
  icon?: string
  category: 'social' | 'professional' | 'communication' | 'other'
  priority: number
  click_action: 'open_link' | 'copy_text' | 'call' | 'email' | 'message'
  custom_styling?: {
    background_color?: string
    text_color?: string
    border_color?: string
  }
}

export interface CustomField {
  id: string
  label: string
  value: string
  type: 'text' | 'email' | 'phone' | 'url' | 'date' | 'number' | 'textarea'
  is_visible: boolean
  is_required: boolean
  validation_rules?: {
    min_length?: number
    max_length?: number
    pattern?: string
  }
  display_format?: 'inline' | 'block' | 'icon_only'
  category: string
}

export interface LeadCaptureField {
  id: string
  label: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox'
  required: boolean
  options?: string[]
  placeholder?: string
}

export interface LeadCaptureSettings {
  enabled: boolean
  title: string
  description: string
  fields: LeadCaptureField[]
  redirect_url: string
  email_notifications: boolean
  thank_you_message: string
  auto_response_enabled: boolean
  auto_response_template: string
  webhook_url?: string
  integration_settings?: {
    crm_integration: boolean
    slack_webhook?: string
    zapier_webhook?: string
  }
  form_styling: {
    background_color: string
    text_color: string
    button_color: string
    border_radius: number
  }
  conditional_logic?: {
    field_id: string
    condition: 'equals' | 'contains' | 'not_empty'
    value: string
    action: 'show' | 'hide' | 'require'
    target_field_id: string
  }[]
}

export interface FollowUpEmail {
  id: string
  delay_hours: number
  subject: string
  template: string
  condition?: string
}

export interface FollowUpSettings {
  enabled: boolean
  email_template: string
  delay_hours: number
  subject: string
  auto_send: boolean
  personalization_tokens: string[]
  sequence_enabled: boolean
  sequence_emails: FollowUpEmail[]
  ai_personalization: boolean
  send_time_optimization: boolean
  tracking_enabled: boolean
  unsubscribe_link: boolean
}

export interface QRCodeSettings {
  enabled: boolean
  logo_enabled: boolean
  color: string
  background_color: string
  size: 'small' | 'medium' | 'large' | 'custom'
  custom_size?: number
  corner_style: 'square' | 'rounded' | 'extra_rounded'
  dot_style: 'square' | 'rounded' | 'classy' | 'classy_rounded'
  download_tracking: boolean
  custom_url?: string
  dynamic_qr: boolean
  expiration_date?: string
  password_protected: boolean
  analytics_enabled: boolean
  batch_generation: boolean
  white_labeling: boolean
}

export interface EmailSignatureVersion {
  id: string
  name: string
  use_case: string
  template: string
}

export interface EmailSignatureSettings {
  enabled: boolean
  style: 'minimal' | 'professional' | 'creative' | 'executive' | 'modern'
  include_photo: boolean
  include_qr: boolean
  include_social: boolean
  include_logo: boolean
  banner_enabled: boolean
  banner_image_url?: string
  legal_disclaimer: string
  custom_html_enabled: boolean
  custom_html?: string
  responsive_design: boolean
  multiple_versions: EmailSignatureVersion[]
  auto_generation: boolean
  outlook_format: boolean
  gmail_format: boolean
  apple_mail_format: boolean
}

export interface VirtualBackgroundSettings {
  enabled: boolean
  style: 'gradient' | 'pattern' | 'abstract' | 'minimal' | 'corporate' | 'creative'
  blur_intensity: 'none' | 'light' | 'medium' | 'strong'
  include_logo: boolean
  logo_position: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'center'
  resolution: '720p' | '1080p' | '1440p' | '4k'
  format: 'jpg' | 'png' | 'svg'
  branded_elements: boolean
  animation_enabled: boolean
  custom_branding: {
    tagline?: string
    website_url?: string
    contact_info?: string
  }
  meeting_platforms: ('zoom' | 'teams' | 'google_meet' | 'webex' | 'other')[]
  batch_export: boolean
  seasonal_variants: boolean
}

export interface CustomEvent {
  id: string
  name: string
  trigger: string
  parameters: Record<string, any>
}

export interface GoalTracking {
  id: string
  name: string
  type: 'contact_form' | 'link_click' | 'email_capture' | 'phone_call'
  target_value: number
}

export interface AnalyticsSettings {
  enabled: boolean
  track_clicks: boolean
  track_views: boolean
  track_location: boolean
  track_device: boolean
  track_referrer: boolean
  real_time_alerts: boolean
  custom_events: CustomEvent[]
  goal_tracking: GoalTracking[]
  data_retention_days: number
  export_enabled: boolean
  dashboard_sharing: boolean
  white_label_reports: boolean
  api_access: boolean
  webhook_notifications: boolean
}

export interface BuildModuleProps {
  card: any
  onUpdate: (updates: Partial<any>) => void
  user: any
  onBack: () => void
  userTier?: 'free' | 'professional' | 'executive'
}

export type BuildTab = 'display' | 'information' | 'fields' | 'features' | 'sharing' | 'analytics'
export type PreviewDevice = 'mobile' | 'tablet' | 'desktop'
export type PreviewMode = 'design' | 'live'