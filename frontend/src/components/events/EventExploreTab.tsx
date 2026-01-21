import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  Search,
  Filter,
  Grid,
  List,
  ChevronRight,
  Star,
  Eye,
  MessageCircle,
  UserPlus,
  Share2,
  MoreHorizontal,
  Sparkles,
  Heart,
  Bookmark,
  Globe,
  Zap,
  Award,
  Target,
  Compass,
  Navigation,
  Flame
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Separator } from '../ui/separator'
import { EventContactsAttending } from './EventContactsAttending'
import { ContactAttendanceIndicator } from './ContactAttendanceIndicator'

interface EventExploreTabProps {
  onEventSelect: (eventId: string, eventName: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
  contacts?: any[]
}

export function EventExploreTab({ 
  onEventSelect, 
  searchQuery, 
  setSearchQuery, 
  viewMode, 
  setViewMode,
  contacts = []
}: EventExploreTabProps) {
  const [exploreFilter, setExploreFilter] = useState('trending')
  const [locationFilter, setLocationFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set())
  const [bookmarkedEvents, setBookmarkedEvents] = useState<Set<string>>(new Set())

  // Mock data for exploration - in real app this would come from Supabase
  const exploreEvents = [
    {
      id: 'explore-1',
      name: 'TechCrunch Disrupt 2024',
      description: 'The premier startup conference bringing together entrepreneurs, investors, and tech leaders',
      startDate: '2024-05-15T09:00:00',
      endDate: '2024-05-17T18:00:00',
      location: 'San Francisco, CA',
      attendeeCount: 2847,
      category: 'conference',
      is_featured: true,
      is_trending: true,
      creator: {
        name: 'TechCrunch Team',
        avatar: '/api/placeholder/32/32',
        verified: true,
        company: 'TechCrunch'
      },
      price: 'Paid',
      priceAmount: 299,
      tags: ['Startups', 'Venture Capital', 'Innovation'],
      rating: 4.8,
      ratingCount: 156,
      featuredAttendees: [
        { name: 'Sarah Chen', avatar: '/api/placeholder/24/24' },
        { name: 'Mike Rodriguez', avatar: '/api/placeholder/24/24' },
        { name: 'Anna Kim', avatar: '/api/placeholder/24/24' }
      ],
      distance: '2.3 miles',
      likes: 1247,
      bookmarks: 534
    },
    {
      id: 'explore-2',
      name: 'AI & Machine Learning Meetup',
      description: 'Monthly gathering for AI enthusiasts, researchers, and practitioners',
      startDate: '2024-04-20T18:00:00',
      endDate: '2024-04-20T21:00:00',
      location: 'Online & Seattle, WA',
      attendeeCount: 156,
      category: 'meetup',
      is_featured: false,
      is_trending: true,
      creator: {
        name: 'Alex Thompson',
        avatar: '/api/placeholder/32/32',
        verified: false,
        company: 'Microsoft'
      },
      price: 'Free',
      tags: ['AI', 'Machine Learning', 'Deep Learning'],
      rating: 4.6,
      ratingCount: 23,
      featuredAttendees: [
        { name: 'David Liu', avatar: '/api/placeholder/24/24' },
        { name: 'Emma Watson', avatar: '/api/placeholder/24/24' }
      ],
      distance: '5.7 miles',
      likes: 89,
      bookmarks: 45
    },
    {
      id: 'explore-3',
      name: 'Women in Tech Leadership Summit',
      description: 'Empowering the next generation of women leaders in technology',
      startDate: '2024-06-08T09:00:00',
      endDate: '2024-06-08T17:00:00',
      location: 'Austin, TX',
      attendeeCount: 342,
      category: 'conference',
      is_featured: true,
      is_trending: false,
      creator: {
        name: 'Women in Tech Austin',
        avatar: '/api/placeholder/32/32',
        verified: true,
        company: 'WIT Austin'
      },
      price: 'Paid',
      priceAmount: 150,
      tags: ['Leadership', 'Diversity', 'Career Development'],
      rating: 4.9,
      ratingCount: 67,
      featuredAttendees: [
        { name: 'Maria Santos', avatar: '/api/placeholder/24/24' },
        { name: 'Lisa Chang', avatar: '/api/placeholder/24/24' },
        { name: 'Rachel Green', avatar: '/api/placeholder/24/24' }
      ],
      distance: '1,247 miles',
      likes: 456,
      bookmarks: 178
    },
    {
      id: 'explore-4',
      name: 'Blockchain & Web3 Workshop',
      description: 'Hands-on workshop covering DeFi, NFTs, and smart contract development',
      startDate: '2024-04-25T14:00:00',
      endDate: '2024-04-25T18:00:00',
      location: 'New York, NY',
      attendeeCount: 78,
      category: 'workshop',
      is_featured: false,
      is_trending: true,
      creator: {
        name: 'Crypto Academy',
        avatar: '/api/placeholder/32/32',
        verified: true,
        company: 'Blockchain Institute'
      },
      price: 'Paid',
      priceAmount: 75,
      tags: ['Blockchain', 'Web3', 'DeFi'],
      rating: 4.7,
      ratingCount: 12,
      featuredAttendees: [
        { name: 'John Crypto', avatar: '/api/placeholder/24/24' },
        { name: 'Blockchain Bob', avatar: '/api/placeholder/24/24' }
      ],
      distance: '2,931 miles',
      likes: 67,
      bookmarks: 23
    },
    {
      id: 'explore-5',
      name: 'Product Management Networking',
      description: 'Connect with fellow product managers and share best practices',
      startDate: '2024-05-02T19:00:00',
      endDate: '2024-05-02T22:00:00',
      location: 'Los Angeles, CA',
      attendeeCount: 124,
      category: 'networking',
      is_featured: false,
      is_trending: false,
      creator: {
        name: 'PM Connect LA',
        avatar: '/api/placeholder/32/32',
        verified: false,
        company: 'Independent'
      },
      price: 'Free',
      tags: ['Product Management', 'Strategy', 'Growth'],
      rating: 4.5,
      ratingCount: 31,
      featuredAttendees: [
        { name: 'Product Pete', avatar: '/api/placeholder/24/24' },
        { name: 'Strategy Sam', avatar: '/api/placeholder/24/24' }
      ],
      distance: '347 miles',
      likes: 78,
      bookmarks: 34
    },
    {
      id: 'explore-6',
      name: 'Design Thinking Bootcamp',
      description: 'Intensive 2-day bootcamp on human-centered design methodologies',
      startDate: '2024-05-20T09:00:00',
      endDate: '2024-05-21T17:00:00',
      location: 'Chicago, IL',
      attendeeCount: 45,
      category: 'workshop',
      is_featured: true,
      is_trending: false,
      creator: {
        name: 'Design Academy',
        avatar: '/api/placeholder/32/32',
        verified: true,
        company: 'IDEO'
      },
      price: 'Paid',
      priceAmount: 450,
      tags: ['Design Thinking', 'UX', 'Innovation'],
      rating: 4.9,
      ratingCount: 89,
      featuredAttendees: [
        { name: 'Design Dan', avatar: '/api/placeholder/24/24' },
        { name: 'UX Uma', avatar: '/api/placeholder/24/24' },
        { name: 'Creative Chris', avatar: '/api/placeholder/24/24' }
      ],
      distance: '1,745 miles',
      likes: 234,
      bookmarks: 156
    }
  ]

  const filterOptions = [
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'featured', label: 'Featured', icon: Star },
    { value: 'nearby', label: 'Nearby', icon: Navigation },
    { value: 'popular', label: 'Most Popular', icon: Flame },
    { value: 'newest', label: 'Newest', icon: Sparkles },
    { value: 'free', label: 'Free Events', icon: Heart }
  ]

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'conference', label: 'Conferences' },
    { value: 'networking', label: 'Networking' },
    { value: 'workshop', label: 'Workshops' },
    { value: 'webinar', label: 'Webinars' },
    { value: 'meetup', label: 'Meetups' }
  ]

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'nearby', label: 'Nearby (50 miles)' },
    { value: 'online', label: 'Online Only' },
    { value: 'us', label: 'United States' },
    { value: 'global', label: 'Global' }
  ]

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Filter events based on selected criteria
  const filterEvents = () => {
    let filtered = exploreEvents

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter)
    }

    // Apply explore filter
    switch (exploreFilter) {
      case 'trending':
        filtered = filtered.filter(event => event.is_trending)
        break
      case 'featured':
        filtered = filtered.filter(event => event.is_featured)
        break
      case 'free':
        filtered = filtered.filter(event => event.price === 'Free')
        break
      case 'popular':
        filtered = filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0))
        break
      case 'newest':
        filtered = filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        break
    }

    return filtered
  }

  const filteredEvents = filterEvents()

  const handleLike = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setLikedEvents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
      } else {
        newSet.add(eventId)
      }
      return newSet
    })
  }

  const handleBookmark = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setBookmarkedEvents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
      } else {
        newSet.add(eventId)
      }
      return newSet
    })
  }

  const renderEventCard = (event: any) => {
    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)
    const isMultiDay = startDate.toDateString() !== endDate.toDateString()
    const isLiked = likedEvents.has(event.id)
    const isBookmarked = bookmarkedEvents.has(event.id)
    
    return (
      <motion.div
        key={event.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="group"
      >
        <Card 
          className="p-0 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border hover:border-primary/30 overflow-hidden bg-gradient-to-br from-surface to-surface/80"
          onClick={() => onEventSelect(event.id, event.name)}
        >
          {/* Card Header with Gradient */}
          <div className="relative p-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {event.name}
                  </h3>
                  {event.is_featured && (
                    <Badge className="bg-gradient-to-r from-primary to-primary-hover text-white">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  )}
                  {event.is_trending && (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                  {event.description}
                </p>

                {/* Event Creator */}
                <div className="flex items-center space-x-2 mb-3">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={event.creator.avatar} />
                    <AvatarFallback className="text-xs">
                      {event.creator.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-text-secondary">by</span>
                  <span className="text-sm font-medium text-foreground">
                    {event.creator.name}
                  </span>
                  {event.creator.verified && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      <Award className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`opacity-0 group-hover:opacity-100 transition-all ${isLiked ? 'text-red-500' : ''}`}
                      onClick={(e) => handleLike(event.id, e)}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isLiked ? 'Unlike' : 'Like'} event</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`opacity-0 group-hover:opacity-100 transition-all ${isBookmarked ? 'text-primary' : ''}`}
                      onClick={(e) => handleBookmark(event.id, e)}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isBookmarked ? 'Remove bookmark' : 'Bookmark'} event</TooltipContent>
                </Tooltip>
                
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 pt-0 space-y-4">
            {/* Date and Time */}
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">
                {isMultiDay 
                  ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                  : startDate.toLocaleDateString()
                }
              </span>
              <span className="text-text-secondary">
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-text-secondary" />
              <span className="text-text-secondary flex-1">{event.location}</span>
              {event.distance && (
                <span className="text-xs text-text-tertiary">
                  {event.distance}
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="flex items-center space-x-2 flex-wrap">
              {event.tags.slice(0, 3).map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {event.tags.length > 3 && (
                <span className="text-xs text-text-tertiary">
                  +{event.tags.length - 3} more
                </span>
              )}
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-text-secondary" />
                  <span className="font-medium text-foreground">
                    {event.attendeeCount}
                  </span>
                  <span className="text-text-secondary">attending</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium text-foreground">
                    {event.rating}
                  </span>
                  <span className="text-text-secondary">
                    ({event.ratingCount})
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge 
                  variant={event.price === 'Free' ? "outline" : "secondary"}
                  className={event.price === 'Free' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                >
                  {event.price === 'Free' ? 'Free' : `$${event.priceAmount}`}
                </Badge>
              </div>
            </div>

            {/* Contacts Attending Indicator */}
            {contacts.length > 0 && (
              <div className="pt-3 border-t border-border/50">
                <ContactAttendanceIndicator 
                  contacts={contacts}
                  eventId={event.id}
                  compact={true}
                />
              </div>
            )}

            {/* Social Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-text-secondary">{event.likes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Bookmark className="w-4 h-4 text-primary" />
                  <span className="text-sm text-text-secondary">{event.bookmarks}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {event.featuredAttendees?.slice(0, 3).map((attendee: any, index: number) => (
                    <Avatar key={index} className="w-6 h-6 border-2 border-background">
                      <AvatarImage src={attendee.avatar} />
                      <AvatarFallback className="text-xs">
                        {attendee.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {event.attendeeCount > 3 && (
                    <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-xs font-medium text-text-secondary">
                        +{event.attendeeCount - 3}
                      </span>
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-text-secondary" />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 rounded-2xl animate-pulse">
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Enhanced Filters */}
        <div className="space-y-4">
          {/* Primary Filter Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {filterOptions.map((option) => {
              const Icon = option.icon
              return (
                <Button
                  key={option.value}
                  variant={exploreFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExploreFilter(option.value)}
                  className={`flex items-center space-x-2 whitespace-nowrap ${
                    exploreFilter === option.value 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'hover:bg-primary/10 hover:border-primary/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{option.label}</span>
                </Button>
              )
            })}
          </div>

          {/* Secondary Filters */}
          <div className="flex items-center space-x-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-48">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Discovery Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-primary">
                  {exploreEvents.length}
                </p>
                <p className="text-primary text-sm">Total Events</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-orange-900">
                  {exploreEvents.filter(e => e.is_trending).length}
                </p>
                <p className="text-orange-700 text-sm">Trending</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-900">
                  {exploreEvents.filter(e => e.price === 'Free').length}
                </p>
                <p className="text-green-700 text-sm">Free Events</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-purple-900">
                  {exploreEvents.filter(e => e.is_featured).length}
                </p>
                <p className="text-purple-700 text-sm">Featured</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">
              {filteredEvents.length} events found
            </h3>
            <p className="text-sm text-text-secondary">
              Discover amazing events created by the Leo community
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex bg-muted/50 rounded-xl p-1">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? "default" : "ghost"}
                onClick={() => setViewMode('grid')}
                className="rounded-lg"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? "default" : "ghost"}
                onClick={() => setViewMode('list')}
                className="rounded-lg"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mx-auto">
                <Compass className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  No Events Found
                </h3>
                <p className="text-text-secondary max-w-md mx-auto">
                  Try adjusting your filters or search terms to discover more events
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('')
                  setCategoryFilter('all')
                  setLocationFilter('all')
                  setExploreFilter('trending')
                }}
              >
                <Zap className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </motion.div>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            <AnimatePresence mode="popLayout">
              {filteredEvents.map(event => renderEventCard(event))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}