import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  ChevronRight,
  Star,
  CheckCircle,
  AlertCircle,
  Eye,
  MessageCircle,
  UserPlus,
  UserCheck,
  Share2,
  MoreHorizontal,
  Sparkles,
  Compass,
  Globe,
  Bookmark
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Separator } from '../ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Progress } from '../ui/progress'
import { useEvents } from '../../hooks/useEvents'
import { EventExploreTab } from './EventExploreTab'
import { ContactAttendanceIndicator } from './ContactAttendanceIndicator'

interface EventsPageProps {
  onNavigate: (page: string) => void
  onEventSelect: (eventId: string, eventName: string) => void
  navigationContext?: any
  contacts?: any[]
}

export function EventsPage({ onNavigate, onEventSelect, navigationContext, contacts = [] }: EventsPageProps) {
  const { events, loading } = useEvents()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('date')
  const [filterCategory, setFilterCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('upcoming')

  // Separate events into upcoming and completed
  const now = new Date()
  const upcomingEvents = events.filter(event => new Date(event.endDate) >= now)
  const completedEvents = events.filter(event => new Date(event.endDate) < now)

  // Filter and search events
  const filterEvents = (eventList: any[]) => {
    return eventList.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = filterCategory === 'all' || event.category === filterCategory
      return matchesSearch && matchesCategory
    }).sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        case 'attendees':
          return (b.attendeeCount || 0) - (a.attendeeCount || 0)
        default:
          return 0
      }
    })
  }

  const filteredUpcomingEvents = filterEvents(upcomingEvents)
  const filteredCompletedEvents = filterEvents(completedEvents)

  // Event categories for filtering
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'conference', label: 'Conferences' },
    { value: 'networking', label: 'Networking' },
    { value: 'workshop', label: 'Workshops' },
    { value: 'webinar', label: 'Webinars' },
    { value: 'meetup', label: 'Meetups' }
  ]

  // Function to check if any contacts are attending an event
  const getAttendingContacts = (eventId: string) => {
    if (!contacts || contacts.length === 0) return []
    
    // Simulate which contacts are attending this event
    // In a real app, this would query actual event attendance data
    const eventSeed = eventId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    return contacts.filter((_, index) => {
      // Use event seed and contact index to create consistent "random" attendance
      const contactSeed = eventSeed + index
      const attendanceRate = 0.35 // 35% chance of attendance for psychological impact
      return (contactSeed % 100) < (attendanceRate * 100)
    }).slice(0, 3) // Limit to first 3 attending contacts
  }

  const renderEventCard = (event: any, isCompleted = false) => {
    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)
    const isMultiDay = startDate.toDateString() !== endDate.toDateString()
    const attendingContacts = getAttendingContacts(event.id)
    
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
          className={`p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border ${
            isCompleted 
              ? 'bg-muted/30 border-border' 
              : attendingContacts.length > 0
                ? 'bg-gradient-to-br from-primary/5 via-blue-50/30 to-surface hover:from-primary/10 hover:to-blue-50/50 border-primary/20 hover:border-primary/40 ring-1 ring-primary/10 hover:ring-2 hover:ring-primary/20 hover:shadow-xl hover:shadow-primary/10'
                : 'bg-surface hover:bg-card-hover border-border hover:border-primary/30'
          }`}
          onClick={() => onEventSelect(event.id, event.name)}
        >
          {/* Event Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className={`font-semibold group-hover:text-primary transition-colors ${
                  isCompleted ? 'text-muted-foreground' : 'text-foreground'
                }`}>
                  {event.name}
                </h3>
                {isCompleted && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
                {event.is_featured && (
                  <Badge className="bg-gradient-to-r from-primary to-primary-hover text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {!isCompleted && attendingContacts.length >= 2 && (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                      <Users className="w-3 h-3 mr-1" />
                      Friends Going
                    </Badge>
                  </motion.div>
                )}
              </div>
              
              {event.description && (
                <p className={`text-sm mb-3 line-clamp-2 ${
                  isCompleted ? 'text-muted-foreground' : 'text-text-secondary'
                }`}>
                  {event.description}
                </p>
              )}

              {/* Contact Attendance Indicator */}
              {!isCompleted && attendingContacts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                >
                  <ContactAttendanceIndicator
                    contacts={attendingContacts}
                    eventId={event.id}
                    compact={true}
                    className="mb-3"
                  />
                </motion.div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            {/* Date and Time */}
            <div className="flex items-center space-x-2">
              <CalendarDays className={`w-4 h-4 ${isCompleted ? 'text-muted-foreground' : 'text-primary'}`} />
              <span className={`font-medium ${isCompleted ? 'text-muted-foreground' : 'text-foreground'}`}>
                {isMultiDay 
                  ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                  : startDate.toLocaleDateString()
                }
              </span>
              <span className={`${isCompleted ? 'text-muted-foreground' : 'text-text-secondary'}`}>
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {isMultiDay && ` - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </span>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-center space-x-2">
                <MapPin className={`w-4 h-4 ${isCompleted ? 'text-muted-foreground' : 'text-text-secondary'}`} />
                <span className={`${isCompleted ? 'text-muted-foreground' : 'text-text-secondary'}`}>
                  {event.location}
                </span>
              </div>
            )}

            {/* Attendees and Activity */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className={`w-4 h-4 ${isCompleted ? 'text-muted-foreground' : 'text-text-secondary'}`} />
                  <span className={`font-medium ${isCompleted ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {event.attendeeCount || 0}
                  </span>
                  <span className={`${isCompleted ? 'text-muted-foreground' : 'text-text-secondary'}`}>
                    attendees
                  </span>
                </div>

                {isCompleted && event.connectionsMade && (
                  <div className="flex items-center space-x-2">
                    <UserPlus className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-700">
                      {event.connectionsMade}
                    </span>
                    <span className="text-text-secondary">connections</span>
                  </div>
                )}

                {!isCompleted && event.rsvpStatus && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {event.rsvpStatus === 'attending' ? 'Attending' : 'Maybe'}
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {event.category && (
                  <Badge variant="secondary" className="text-xs">
                    {event.category}
                  </Badge>
                )}
                <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${
                  isCompleted ? 'text-muted-foreground' : 'text-text-secondary'
                }`} />
              </div>
            </div>

            {/* Progress for ongoing events */}
            {!isCompleted && event.agenda && event.agenda.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-secondary">Event Progress</span>
                  <span className="text-xs font-medium text-primary">
                    {Math.round(((event.completedSessions || 0) / event.agenda.length) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={((event.completedSessions || 0) / event.agenda.length) * 100} 
                  className="h-1.5"
                />
              </div>
            )}
          </div>

          {/* Action Bar for Upcoming Events */}
          {!isCompleted && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" className="h-8">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View event details</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" className="h-8">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Network
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Start networking with attendees</TooltipContent>
                </Tooltip>
              </div>

              <div className="flex -space-x-2">
                {event.featuredAttendees?.slice(0, 3).map((attendee: any, index: number) => (
                  <Avatar key={index} className="w-6 h-6 border-2 border-background">
                    <AvatarImage src={attendee.avatar} />
                    <AvatarFallback className="text-xs">
                      {attendee.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {(event.attendeeCount || 0) > 3 && (
                  <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs font-medium text-text-secondary">
                      +{(event.attendeeCount || 0) - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    )
  }

  const renderEventList = (eventList: any[], isCompleted = false) => {
    if (eventList.length === 0) {
      return (
        <div className="text-center py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mx-auto">
              <CalendarDays className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                {isCompleted ? 'No Past Events' : 'No Upcoming Events'}
              </h3>
              <p className="text-text-secondary max-w-md mx-auto">
                {isCompleted 
                  ? 'You haven\'t attended any events yet. Join networking events from the Explore tab to start building connections!'
                  : 'No events scheduled yet. Create your first event or join existing ones to start networking!'
                }
              </p>
            </div>
            {!isCompleted && (
              <Button onClick={() => {/* TODO: Navigate to create event */}}>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            )}
          </motion.div>
        </div>
      )
    }

    return (
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
        : 'space-y-4'
      }>
        <AnimatePresence mode="popLayout">
          {eventList.map(event => renderEventCard(event, isCompleted))}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-gradient-to-br from-background via-muted/20 to-background">
        {/* Enhanced Header */}
        <div className="bg-surface/90 backdrop-blur-2xl border-b border-border/50 px-6 py-6 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-2xl bg-gradient-to-r from-primary via-primary-hover to-primary bg-clip-text text-transparent">
                {navigationContext?.type === 'event' ? navigationContext.name : 'leo Events'} 🎯
              </h1>
              <p className="text-text-secondary mt-1">
                {activeTab === 'explore' 
                  ? 'Discover amazing events created by the Leo community' 
                  : activeTab === 'upcoming'
                  ? 'View and manage your upcoming events'
                  : 'Review your past events and connections made'
                }
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {activeTab === 'explore' ? (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => {/* TODO: Toggle bookmarks view */}}
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    <Bookmark className="w-4 h-4 mr-2" />
                    My Bookmarks
                  </Button>
                  <Button 
                    onClick={() => {/* TODO: Navigate to create event */}}
                    className="bg-primary hover:bg-primary-hover shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => {/* TODO: Navigate to create event */}}
                  className="bg-primary hover:bg-primary-hover shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              )}
            </div>
          </div>

          {/* Search and Filters - Only show for non-explore tabs */}
          {activeTab !== 'explore' && (
            <div className="flex items-center space-x-4 mt-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
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

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="attendees">Sort by Attendees</SelectItem>
                </SelectContent>
              </Select>

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
          )}

          {/* Global Search for Explore tab */}
          {activeTab === 'explore' && (
            <div className="flex items-center space-x-4 mt-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <Input
                  placeholder="Search events, creators, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
              
              <Button 
                variant="outline"
                onClick={() => {/* TODO: Advanced filters */}}
                className="whitespace-nowrap"
              >
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 max-w-2xl bg-muted/30 rounded-2xl p-1">
                <TabsTrigger value="upcoming" className="rounded-xl data-[state=active]:shadow-sm">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Upcoming ({filteredUpcomingEvents.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="rounded-xl data-[state=active]:shadow-sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Past ({filteredCompletedEvents.length})
                </TabsTrigger>
                <TabsTrigger value="explore" className="rounded-xl data-[state=active]:shadow-sm">
                  <Compass className="w-4 h-4 mr-2" />
                  Explore
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-6">
                {/* Quick Stats for Upcoming Events */}
                {filteredUpcomingEvents.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-blue-900">
                            {filteredUpcomingEvents.length}
                          </p>
                          <p className="text-blue-700 text-sm">Upcoming Events</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-900">
                            {filteredUpcomingEvents.reduce((sum, event) => sum + (event.attendeeCount || 0), 0)}
                          </p>
                          <p className="text-green-700 text-sm">Total Attendees</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-purple-900">
                            {filteredUpcomingEvents.filter(e => e.rsvpStatus === 'attending').length}
                          </p>
                          <p className="text-purple-700 text-sm">Attending</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                          <UserCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-orange-900">
                            {filteredUpcomingEvents.filter(e => getAttendingContacts(e.id).length > 0).length}
                          </p>
                          <p className="text-orange-700 text-sm">Friends Going</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {renderEventList(filteredUpcomingEvents, false)}
              </TabsContent>

              <TabsContent value="completed" className="space-y-6">
                {/* Quick Stats for Past Events */}
                {filteredCompletedEvents.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-500 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {filteredCompletedEvents.length}
                          </p>
                          <p className="text-gray-700 text-sm">Past Events</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                          <UserPlus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-orange-900">
                            {filteredCompletedEvents.reduce((sum, event) => sum + (event.connectionsMade || 0), 0)}
                          </p>
                          <p className="text-orange-700 text-sm">Connections Made</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-indigo-900">
                            {Math.round(filteredCompletedEvents.reduce((sum, event) => sum + (event.satisfactionRating || 0), 0) / filteredCompletedEvents.length * 10) / 10 || 0}
                          </p>
                          <p className="text-indigo-700 text-sm">Avg. Rating</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {renderEventList(filteredCompletedEvents, true)}
              </TabsContent>

              <TabsContent value="explore" className="space-y-6">
                <EventExploreTab
                  onEventSelect={onEventSelect}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  contacts={contacts}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}