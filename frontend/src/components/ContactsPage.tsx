import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Mail, 
  Phone, 
  MessageCircle, 
  MoreHorizontal,
  Star, 
  Tag, 
  Calendar, 
  ExternalLink, 
  Edit3, 
  Trash2,
  Archive,
  UserPlus, 
  Send, 
  FileText, 
  Zap, 
  Building, 
  MapPin,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Target,
  Activity,
  Snowflake,
  Undo2,
  CheckCircle2,
  Globe,
  Smartphone,
  Monitor,
  QrCode,
  Link as LinkIcon,
  Bot,
  UserCheck,
  Merge,
  RefreshCw,
  Copy,
  ArrowLeft,
  ChevronRight,
  Share2,
  Mic,
  MicOff,
  History,
  Calendar as CalendarIcon,
  Briefcase,
  MapPinIcon,
  MessageSquare,
  Lightbulb,
  ArrowUpDown,
  Eye,
  EyeOff,
  Settings,
  Columns
} from 'lucide-react'
import { getSupabaseClient } from '../utils/supabase/client'
import { projectId } from '../utils/supabase/info'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Card } from './ui/card'
import { Progress } from './ui/progress'
import { Checkbox } from './ui/checkbox'
import { Textarea } from './ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Separator } from './ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

import { AddContactModal } from './AddContactModal'
import { ContactDetailModal } from './ContactDetailModal'

const supabase = getSupabaseClient()

interface User {
  id: string
  email: string
  name: string
}

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
  last_contact?: string
  notes?: string
  tags: string[]
  interactions_count?: number
  card_name?: string
  
  // Complete Contact Field Structure
  address?: string
  city?: string
  state?: string
  country?: string
  website?: string
  linkedin_url?: string
  
  // Enhanced context fields
  context?: {
    where_met?: string
    what_discussed?: string
    why_important?: string
    meeting_date?: string
    last_meeting?: string
    next_meeting?: string
  }
  
  // Enriched data (paid plans)
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
  
  // Engagement metrics
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
  
  // Capture details
  capture_details?: {
    device_type: 'mobile' | 'desktop' | 'tablet'
    location_data?: string
    referrer?: string
    session_id?: string
    ip_address?: string
  }

  // Meeting history
  meeting_history?: {
    date: string
    type: 'in-person' | 'video' | 'phone' | 'email'
    duration?: number
    notes?: string
    outcome?: string
  }[]
}

interface ContactsPageProps {
  user: User
  userPlan?: 'starter' | 'professional' | 'executive'
  navigationContext?: {
    type: 'personal' | 'company' | 'event'
    id?: string
    name?: string
  }
}

type SortDirection = 'asc' | 'desc' | null
// Expanded Sortable Columns - Added job_title, city, country
type SortField = 'first_name' | 'last_name' | 'email' | 'phone' | 'company' | 'company_website' | 'job_title' | 'location' | 'city' | 'country' | 'linkedin' | 'source' | 'captured_at' | 'last_contact'

export function ContactsPage({ user, userPlan = 'starter', navigationContext }: ContactsPageProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Enhanced Filter System
  const [filterSource, setFilterSource] = useState('all')
  const [filterDateAdded, setFilterDateAdded] = useState('all')
  const [advancedFilterField, setAdvancedFilterField] = useState('all')
  const [advancedFilterTerm, setAdvancedFilterTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  
  const [sortField, setSortField] = useState<SortField>('captured_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showContactDetail, setShowContactDetail] = useState(false)

  // New state for Column Visibility Toggle
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState({
    first_name: true,
    last_name: true,
    email: true,
    phone: true,
    company: true,
    job_title: false,
    website: false,
    city: false,
    state: false,
    country: false,
    linkedin: false,
    address: false,
    notes: false,
    captured_at: false,
    source: false
  })

  // New state for Contact Detail Slide-Panel
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  const [detailPanelContact, setDetailPanelContact] = useState<Contact | null>(null)
  const [detailPanelContactIndex, setDetailPanelContactIndex] = useState(0)

  // Create enhanced demo contacts with ALL new fields
  const createDefaultContacts = (): Contact[] => {
    const now = new Date()
    return [
      {
        id: 'contact-1',
        card_id: 'default-card-1',
        card_owner_id: user.id,
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@techcorp.com',
        phone: '+1-555-0123',
        company: 'TechCorp Solutions',
        company_website: 'https://techcorp.com',
        job_title: 'Senior Product Manager',
        location: 'San Francisco, CA',
        address: '123 Market Street, Suite 400',
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
        website: 'https://sarahjohnson.dev',
        linkedin_url: 'https://linkedin.com/in/sarahjohnson',
        source: 'qr',
        status: 'new',
        captured_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        last_interaction: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        notes: 'Met at TechConf 2024. Very interested in our AI solutions.',
        tags: ['Event Contact', 'Priority', 'AI Interested'],
        interactions_count: 3,
        card_name: 'Professional Card',
        context: {
          where_met: 'TechConf 2024, AI Solutions booth',
          what_discussed: 'AI automation for product teams, demo request, pricing inquiry',
          why_important: 'Key decision maker for AI tools, potential partnership opportunity',
          meeting_date: '2024-01-15',
          last_meeting: '2024-01-15T14:30:00Z',
          next_meeting: '2024-01-22T15:00:00Z'
        },
        enriched_data: {
          profile_photo: 'https://images.unsplash.com/photo-1494790108755-2616b9eab64a?w=100&h=100&fit=crop&crop=face',
          company_info: {
            size: '200-500 employees',
            industry: 'Technology',
            founded: '2018'
          },
          social_links: {
            linkedin: 'https://linkedin.com/in/sarahjohnson',
            twitter: 'https://twitter.com/sarahjtech'
          },
          location_verified: 'San Francisco, CA'
        },
        enriched_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        engagement_metrics: {
          card_views: 5,
          time_on_card: 135,
          links_clicked: 3,
          return_visits: 2
        },
        ai_interaction_metrics: {
          chat_initiated: true,
          messages_sent: 8,
          intent_signals: ['pricing_inquiry', 'demo_request']
        },
        form_completion_metrics: {
          fields_filled: 6,
          total_fields: 6,
          data_quality_score: 0.95
        },
        capture_details: {
          device_type: 'mobile',
          location_data: 'TechConf 2024, San Francisco',
          referrer: 'event-booth-qr',
          session_id: 'sess_abc123def456',
          ip_address: '192.168.1.100'
        }
      },
      {
        id: 'contact-2',
        card_id: 'default-card-2',
        card_owner_id: user.id,
        first_name: 'Michael',
        last_name: 'Chen',
        email: 'michael.chen@startup.io',
        phone: '+1-555-0124',
        company: 'StartupHub',
        company_website: 'https://startuphub.io',
        job_title: 'CTO',
        location: 'New York, NY',
        address: '456 Broadway, Floor 12',
        city: 'New York',
        state: 'NY',
        country: 'United States',
        website: 'https://michaelchen.tech',
        linkedin_url: 'https://linkedin.com/in/michaelchen',
        source: 'link',
        status: 'contacted',
        captured_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        last_interaction: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        notes: 'Follow up needed. Interested in partnership opportunities.',
        tags: ['Digital Contact', 'Partnership', 'CTO'],
        interactions_count: 5,
        card_name: 'Networking Card',
        context: {
          where_met: 'LinkedIn message, mutual connection referral',
          what_discussed: 'Technical partnership, API integration, startup ecosystem',
          why_important: 'Key technical decision maker, strong startup network',
          meeting_date: '2024-01-14',
          last_meeting: '2024-01-14T16:00:00Z'
        },
        enriched_data: {
          profile_photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          company_info: {
            size: '10-50 employees',
            industry: 'Technology',
            founded: '2022'
          },
          social_links: {
            linkedin: 'https://linkedin.com/in/michaelchen',
            twitter: 'https://twitter.com/mchen_tech'
          },
          location_verified: 'New York, NY'
        },
        enriched_at: new Date(now.getTime() - 20 * 60 * 60 * 1000).toISOString(),
        engagement_metrics: {
          card_views: 8,
          time_on_card: 240,
          links_clicked: 6,
          return_visits: 3
        },
        ai_interaction_metrics: {
          chat_initiated: false,
          messages_sent: 0,
          intent_signals: []
        },
        form_completion_metrics: {
          fields_filled: 5,
          total_fields: 6,
          data_quality_score: 0.83
        },
        capture_details: {
          device_type: 'desktop',
          location_data: 'New York, NY',
          referrer: 'email-signature',
          session_id: 'sess_def456ghi789',
          ip_address: '10.0.0.50'
        }
      },
      {
        id: 'contact-3',
        card_id: 'default-card-1',
        card_owner_id: user.id,
        first_name: 'Emily',
        last_name: 'Rodriguez',
        email: 'emily.r@creativestudio.com',
        phone: '+1-555-0125',
        company: 'Creative Studio',
        company_website: 'https://creativestudio.com',
        job_title: 'Marketing Director',
        location: 'Los Angeles, CA',
        address: '789 Sunset Boulevard',
        city: 'Los Angeles',
        state: 'CA',
        country: 'United States',
        website: 'https://emilyrodriguez.design',
        linkedin_url: 'https://linkedin.com/in/emilyrodriguez',
        source: 'ai_chat',
        status: 'contacted',
        captured_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        last_interaction: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        notes: 'Very engaged with AI chat. Potential client for design services.',
        tags: ['AI Engaged', 'Creative', 'Marketing'],
        interactions_count: 8,
        card_name: 'Professional Card',
        context: {
          where_met: 'Website AI chat, found through Google search',
          what_discussed: 'Creative AI tools, marketing automation, team productivity',
          why_important: 'Marketing leader at growing agency, creative collaboration potential',
          meeting_date: '2024-01-13'
        },
        engagement_metrics: {
          card_views: 12,
          time_on_card: 420,
          links_clicked: 9,
          return_visits: 5
        },
        ai_interaction_metrics: {
          chat_initiated: true,
          messages_sent: 15,
          intent_signals: ['service_inquiry', 'portfolio_request']
        },
        form_completion_metrics: {
          fields_filled: 6,
          total_fields: 6,
          data_quality_score: 0.92
        },
        capture_details: {
          device_type: 'desktop',
          location_data: 'Los Angeles, CA',
          referrer: 'google-ads',
          session_id: 'sess_ghi789jkl012',
          ip_address: '172.16.0.25'
        }
      }
    ]
  }

  useEffect(() => {
    const contactsData = createDefaultContacts()
    setContacts(contactsData)
    setLoading(false)
  }, [])

  // Sorting function
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Enhanced Filter System: Date filtering logic
  const getDateFilteredContacts = (contacts: Contact[], dateFilter: string) => {
    if (dateFilter === 'all') return contacts
    
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    
    return contacts.filter(contact => {
      const capturedDate = new Date(contact.captured_at)
      switch (dateFilter) {
        case 'today':
          return capturedDate >= oneDayAgo
        case 'last_7_days':
          return capturedDate >= sevenDaysAgo
        case 'last_30_days':
          return capturedDate >= thirtyDaysAgo
        case 'last_90_days':
          return capturedDate >= ninetyDaysAgo
        default:
          return true
      }
    })
  }

  // Enhanced search across ALL fields
  const filteredAndSortedContacts = contacts
    .filter(contact => {
      // Enhanced search across ALL fields
      const matchesSearch = contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.website?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.linkedin_url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesSource = filterSource === 'all' || contact.source === filterSource

      return matchesSearch && matchesSource
    })
    .sort((a, b) => {
      if (!sortDirection) return 0

      let aValue: any = ''
      let bValue: any = ''

      switch (sortField) {
        case 'first_name':
          aValue = a.first_name
          bValue = b.first_name
          break
        case 'last_name':
          aValue = a.last_name
          bValue = b.last_name
          break
        case 'email':
          aValue = a.email
          bValue = b.email
          break
        case 'phone':
          aValue = a.phone || ''
          bValue = b.phone || ''
          break
        case 'company':
          aValue = a.company
          bValue = b.company
          break
        case 'job_title':
          aValue = a.job_title || ''
          bValue = b.job_title || ''
          break
        case 'captured_at':
          aValue = new Date(a.captured_at).getTime()
          bValue = new Date(b.captured_at).getTime()
          break
        default:
          return 0
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // Handle contact selection
  const handleContactClick = (contact: Contact, index: number) => {
    setDetailPanelContact(contact)
    setDetailPanelContactIndex(index)
    setShowDetailPanel(true)
  }

  // Navigate between contacts in detail panel
  const navigateDetailPanel = (direction: 'prev' | 'next') => {
    const currentIndex = detailPanelContactIndex
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    
    if (newIndex < 0) newIndex = filteredAndSortedContacts.length - 1
    if (newIndex >= filteredAndSortedContacts.length) newIndex = 0
    
    setDetailPanelContactIndex(newIndex)
    setDetailPanelContact(filteredAndSortedContacts[newIndex])
  }

  // Add new contact handler
  const handleAddContact = (newContactData: any) => {
    const newContact: Contact = {
      ...newContactData,
      id: `contact-${Date.now()}`,
      card_owner_id: user.id,
      captured_at: new Date().toISOString(),
      source: 'direct' as const,
      status: 'new' as const,
      interactions_count: 0,
      tags: newContactData.tags || [],
      card_name: 'Manual Entry'
    }
    
    setContacts(prev => [newContact, ...prev])
  }

  // Collect existing tags for modal
  const existingTags = Array.from(new Set(contacts.flatMap(contact => contact.tags)))

  // Generate avatar with gradient background
  const generateAvatar = (contact: Contact) => {
    const initials = (contact.first_name.charAt(0) + contact.last_name.charAt(0)).toUpperCase()
    const gradients = [
      'bg-gradient-to-br from-[#FF6B9D] to-[#C44569]', // Pink
      'bg-gradient-to-br from-[#667EEA] to-[#764BA2]', // Purple
      'bg-gradient-to-br from-[#F26522] to-[#E14D2A]', // Orange
      'bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8]', // Blue  
      'bg-gradient-to-br from-[#10B981] to-[#059669]', // Green
      'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]', // Indigo
      'bg-gradient-to-br from-[#EC4899] to-[#DB2777]', // Rose
      'bg-gradient-to-br from-[#F59E0B] to-[#D97706]', // Yellow
    ]
    
    // Use contact ID to consistently assign same gradient
    const gradientIndex = contact.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length
    
    return (
      <div className={`w-12 h-12 rounded-full ${gradients[gradientIndex]} flex items-center justify-center text-white font-semibold text-lg shadow-md`}>
        {initials}
      </div>
    )
  }

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return formatDate(dateString)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatSource = (source: string) => {
    switch (source) {
      case 'qr': return 'QR Code'
      case 'link': return 'Link'
      case 'email': return 'Email' 
      case 'ai_chat': return 'AI Chat'
      case 'social': return 'Social'
      case 'referral': return 'Referral'
      case 'direct': return 'Direct'
      default: return source
    }
  }

  // Get source icon
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'qr': return <QrCode className="h-3 w-3" />
      case 'link': return <LinkIcon className="h-3 w-3" />
      case 'email': return <Mail className="h-3 w-3" />
      case 'ai_chat': return <Bot className="h-3 w-3" />
      case 'social': return <Globe className="h-3 w-3" />
      case 'referral': return <UserCheck className="h-3 w-3" />
      case 'direct': return <Target className="h-3 w-3" />
      default: return <Activity className="h-3 w-3" />
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Contacts</h1>
            <p className="text-text-secondary text-sm">
              {filteredAndSortedContacts.length} contacts
              {navigationContext && navigationContext.type !== 'personal' && 
                ` for ${navigationContext.name || navigationContext.type}`
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className="flex items-center space-x-2 text-sm font-medium"
            >
              <Columns className="h-4 w-4" />
              <span>Columns</span>
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>Add Contact</span>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-4 w-4" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="qr">QR Code</SelectItem>
              <SelectItem value="link">Link</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="ai_chat">AI Chat</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Column Settings Panel */}
      {showColumnSettings && (
        <Card className="mb-6 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Column Visibility</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowColumnSettings(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(visibleColumns).map(([key, visible]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={visible}
                  onCheckedChange={(checked) =>
                    setVisibleColumns(prev => ({ ...prev, [key]: checked }))
                  }
                />
                <label htmlFor={key} className="text-sm capitalize">
                  {key.replace('_', ' ')}
                </label>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Contacts Table */}
      <Card className="overflow-hidden">
        <div className="bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#F5F5F7] hover:bg-transparent">
                <TableHead className="w-12 px-6 py-4"></TableHead>
                <TableHead 
                  className={`px-6 py-4 cursor-pointer hover:bg-muted/30 transition-colors ${sortField === 'first_name' ? 'text-primary' : ''}`}
                  onClick={() => handleSort('first_name')}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-[15px]">Name</span>
                    <ArrowUpDown className={`h-3 w-3 transition-opacity ${sortField === 'first_name' ? 'opacity-100 text-primary' : 'opacity-30'}`} />
                  </div>
                </TableHead>
                <TableHead 
                  className={`px-6 py-4 cursor-pointer hover:bg-muted/30 transition-colors ${sortField === 'company' ? 'text-primary' : ''}`}
                  onClick={() => handleSort('company')}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-[15px]">Company</span>
                    <ArrowUpDown className={`h-3 w-3 transition-opacity ${sortField === 'company' ? 'opacity-100 text-primary' : 'opacity-30'}`} />
                  </div>
                </TableHead>
                <TableHead className="px-6 py-4">
                  <span className="font-medium text-[15px]">Contact</span>
                </TableHead>
                <TableHead 
                  className={`px-6 py-4 cursor-pointer hover:bg-muted/30 transition-colors ${sortField === 'last_contact' ? 'text-primary' : ''}`}
                  onClick={() => handleSort('last_contact')}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-[15px]">Last Contact</span>
                    <ArrowUpDown className={`h-3 w-3 transition-opacity ${sortField === 'last_contact' ? 'opacity-100 text-primary' : 'opacity-30'}`} />
                  </div>
                </TableHead>
                <TableHead className="px-6 py-4">
                  <span className="font-medium text-[15px]">Source & Activity</span>
                </TableHead>
                <TableHead className="w-20 px-6 py-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedContacts.map((contact, index) => (
                <TableRow
                  key={contact.id}
                  className="border-b border-[#F5F5F7] hover:bg-[#FAFAFA] cursor-pointer transition-all duration-200 hover:transform hover:translate-x-1 group"
                  onClick={() => handleContactClick(contact, index)}
                  style={{ minHeight: '72px' }}
                >
                  {/* Avatar Column */}
                  <TableCell className="px-6 py-4">
                    {contact.enriched_data?.profile_photo ? (
                      <img 
                        src={contact.enriched_data.profile_photo}
                        alt={`${contact.first_name} ${contact.last_name}`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      generateAvatar(contact)
                    )}
                  </TableCell>

                  {/* Name & Title Column */}
                  <TableCell className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="font-semibold text-[16px] text-[#1D1D1F] leading-tight">
                        {contact.first_name} {contact.last_name}
                      </div>
                      {contact.job_title && (
                        <div className="font-medium text-[14px] text-[#333333] leading-tight">
                          {contact.job_title}
                        </div>
                      )}
                      {contact.location && (
                        <div className="text-[14px] text-[#999999] leading-tight flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{contact.location}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Company Column */}
                  <TableCell className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="font-medium text-[14px] text-[#1D1D1F] leading-tight">
                        {contact.company}
                      </div>
                      {contact.company_website && (
                        <div className="text-[14px] text-[#666666] leading-tight">
                          {contact.company_website.replace(/^https?:\/\//, '')}
                        </div>
                      )}
                      {contact.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {contact.tags.slice(0, 2).map((tag, tagIndex) => {
                            const tagColors = {
                              'Priority': 'bg-[rgba(255,59,48,0.1)] text-[#FF3B30] border-[rgba(255,59,48,0.2)]',
                              'Event Contact': 'bg-[rgba(242,101,34,0.1)] text-[#F26522] border-[rgba(242,101,34,0.2)]',
                              'AI Interested': 'bg-[rgba(52,199,89,0.1)] text-[#34C759] border-[rgba(52,199,89,0.2)]',
                              'Partnership': 'bg-[rgba(52,199,89,0.1)] text-[#34C759] border-[rgba(52,199,89,0.2)]',
                              'CTO': 'bg-[rgba(52,199,89,0.1)] text-[#34C759] border-[rgba(52,199,89,0.2)]',
                              'AI Engaged': 'bg-[rgba(242,101,34,0.1)] text-[#F26522] border-[rgba(242,101,34,0.2)]',
                              'Creative': 'bg-[rgba(52,199,89,0.1)] text-[#34C759] border-[rgba(52,199,89,0.2)]',
                              'Marketing': 'bg-[rgba(52,199,89,0.1)] text-[#34C759] border-[rgba(52,199,89,0.2)]'
                            }
                            const defaultColor = 'bg-[rgba(242,101,34,0.1)] text-[#F26522] border-[rgba(242,101,34,0.2)]'
                            return (
                              <span
                                key={tagIndex}
                                className={`px-3 py-1 rounded-full text-[13px] font-medium border ${tagColors[tag as keyof typeof tagColors] || defaultColor}`}
                              >
                                {tag}
                              </span>
                            )
                          })}
                          {contact.tags.length > 2 && (
                            <span className="px-3 py-1 rounded-full text-[13px] font-medium bg-[#F5F5F7] text-[#666666] border border-[#E5E5E7]">
                              +{contact.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Contact Info Column */}
                  <TableCell className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="text-[14px] text-[#666666] leading-tight">
                        {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="text-[14px] text-[#666666] leading-tight">
                          {contact.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Last Contact Column */}
                  <TableCell className="px-6 py-4">
                    <div className="space-y-1">
                      {contact.last_contact ? (
                        <>
                          <div className="text-[14px] text-[#1D1D1F] font-medium leading-tight">
                            {new Date(contact.last_contact).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-[13px] text-[#999999] leading-tight">
                            {formatTimeAgo(contact.last_contact)}
                          </div>
                        </>
                      ) : (
                        <div className="text-[14px] text-[#999999] leading-tight">
                          No contact yet
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Source & Activity Column */}
                  <TableCell className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 px-2 py-1 bg-[#F5F5F7] rounded-xl">
                          {getSourceIcon(contact.source)}
                          <span className="text-[12px] text-[#666666] font-medium">
                            {formatSource(contact.source)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-[13px] text-[#999999]">
                        <span>{formatTimeAgo(contact.captured_at)}</span>
                        <div className="w-1 h-1 bg-[#CCCCCC] rounded-full"></div>
                        <div className="flex items-center space-x-1">
                          <Activity className="h-3 w-3" />
                          <span>{contact.interactions_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        className="w-9 h-9 rounded-lg border border-[#E5E5E7] bg-white flex items-center justify-center hover:border-primary hover:bg-[#FFF7F0] transition-all duration-200 hover:transform hover:-translate-y-0.5 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle email action
                        }}
                      >
                        <Mail className="h-4 w-4 text-[#666666]" />
                      </button>
                      <button
                        className="w-9 h-9 rounded-lg border border-[#E5E5E7] bg-white flex items-center justify-center hover:border-primary hover:bg-[#FFF7F0] transition-all duration-200 hover:transform hover:-translate-y-0.5 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle more options
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4 text-[#666666]" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Empty State */}
      {filteredAndSortedContacts.length === 0 && (
        <div className="text-center py-12">
          <UserPlus className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No contacts found</h3>
          <p className="text-text-secondary mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Start building your network by adding contacts'}
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      )}

      {/* Contact Detail Slide Panel */}
      {showDetailPanel && detailPanelContact && (
        <div className="fixed inset-y-0 right-0 w-[480px] bg-background border-l border-border shadow-xl z-50 overflow-auto">
          <div className="p-6">
            {/* Panel Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Contact Details</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDetailPanel('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-text-secondary">
                  {detailPanelContactIndex + 1} of {filteredAndSortedContacts.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDetailPanel('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailPanel(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold">
                  {detailPanelContact.first_name} {detailPanelContact.last_name}
                </h3>
                <p className="text-text-secondary">{detailPanelContact.job_title}</p>
                <p className="text-text-secondary">{detailPanelContact.company}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Contact</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-text-secondary" />
                      <span>{detailPanelContact.email}</span>
                    </div>
                    {detailPanelContact.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-text-secondary" />
                        <span>{detailPanelContact.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Location</h4>
                  <div className="space-y-2 text-sm">
                    {detailPanelContact.city && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-text-secondary" />
                        <span>{detailPanelContact.city}, {detailPanelContact.state}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {detailPanelContact.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm text-text-secondary">{detailPanelContact.notes}</p>
                </div>
              )}

              {detailPanelContact.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {detailPanelContact.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onContactAdded={handleAddContact}
        userPlan={userPlan}
        existingTags={existingTags}
      />

      {/* Contact Detail Modal (legacy) */}
      <ContactDetailModal
        contact={selectedContact}
        isOpen={showContactDetail}
        onClose={() => {
          setShowContactDetail(false)
          setSelectedContact(null)
        }}
        onSave={(updatedContact) => {
          // Handle updating contact
          setShowContactDetail(false)
          setSelectedContact(null)
        }}
        userPlan={userPlan}
      />
    </div>
  )
}