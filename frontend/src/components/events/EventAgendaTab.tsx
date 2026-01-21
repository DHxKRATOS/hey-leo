import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Clock,
  MapPin,
  Users,
  Play,
  Pause,
  Calendar,
  Video,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Share2,
  Download,
  BookOpen,
  FileText,
  ExternalLink,
  Star,
  MessageCircle,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Coffee,
  Award,
  Target,
  Presentation,
  Network,
  Timer
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Separator } from '../ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { toast } from 'sonner@2.0.3'

interface EventAgendaTabProps {
  event: any
}

export function EventAgendaTab({ event }: EventAgendaTabProps) {
  const [selectedDay, setSelectedDay] = useState(0)
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline')
  const [selectedSession, setSelectedSession] = useState<string | null>(null)

  // Mock agenda data (in real app, this would come from the event object)
  const agenda = event.agenda || [
    {
      day: 0,
      date: '2024-03-15',
      title: 'Day 1 - Opening & Keynotes',
      sessions: [
        {
          id: 'session-1',
          title: 'Registration & Welcome Coffee',
          description: 'Check-in, networking, and welcome refreshments',
          start_time: '08:00',
          end_time: '09:00',
          duration: 60,
          type: 'networking',
          location: 'Main Lobby',
          speaker: null,
          attendee_count: 150,
          is_live: false,
          is_recorded: false,
          resources: []
        },
        {
          id: 'session-2',
          title: 'Opening Keynote: The Future of Professional Networking',
          description: 'An inspiring look at how AI and digital platforms are transforming how we connect professionally.',
          start_time: '09:00',
          end_time: '10:00',
          duration: 60,
          type: 'keynote',
          location: 'Main Auditorium',
          speaker: {
            name: 'Dr. Sarah Johnson',
            title: 'CEO, NetworkAI',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b601?w=100&h=100&fit=crop&crop=face',
            bio: 'Leading expert in AI-powered networking solutions with 15+ years in tech.',
            company: 'NetworkAI'
          },
          attendee_count: 200,
          is_live: false,
          is_recorded: true,
          resources: [
            { type: 'slides', title: 'Keynote Slides', url: '#' },
            { type: 'recording', title: 'Session Recording', url: '#' }
          ]
        },
        {
          id: 'session-3',
          title: 'Panel: Building Authentic Professional Relationships',
          description: 'Industry leaders share insights on creating meaningful connections in the digital age.',
          start_time: '10:30',
          end_time: '11:30',
          duration: 60,
          type: 'panel',
          location: 'Conference Room A',
          speakers: [
            {
              name: 'Alex Chen',
              title: 'VP of Growth, TechCorp',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
            },
            {
              name: 'Maria Rodriguez',
              title: 'Founder, ConnectPro',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
            }
          ],
          attendee_count: 85,
          is_live: false,
          is_recorded: true,
          resources: []
        },
        {
          id: 'session-4',
          title: 'Networking Lunch',
          description: 'Structured networking session with industry professionals over lunch.',
          start_time: '12:00',
          end_time: '13:30',
          duration: 90,
          type: 'networking',
          location: 'Garden Terrace',
          speaker: null,
          attendee_count: 120,
          is_live: false,
          is_recorded: false,
          resources: []
        },
        {
          id: 'session-5',
          title: 'Workshop: Mastering Digital First Impressions',
          description: 'Hands-on workshop for creating compelling digital business cards and profiles.',
          start_time: '14:00',
          end_time: '15:30',
          duration: 90,
          type: 'workshop',
          location: 'Workshop Room 1',
          speaker: {
            name: 'Jordan Kim',
            title: 'Design Director, Leo',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            bio: 'Expert in digital design and personal branding with a focus on professional networking.',
            company: 'Leo'
          },
          attendee_count: 45,
          is_live: false,
          is_recorded: false,
          resources: [
            { type: 'worksheet', title: 'Design Worksheet', url: '#' },
            { type: 'template', title: 'Card Templates', url: '#' }
          ]
        }
      ]
    }
  ]

  const currentDay = agenda && agenda.length > 0 ? agenda[selectedDay] : null
  const now = new Date()
  const eventDate = new Date(event.startDate || event.start_date)
  const isEventDay = eventDate.toDateString() === now.toDateString()

  // Calculate session status
  const getSessionStatus = (session: any) => {
    if (!isEventDay) return 'scheduled'
    
    const sessionStart = new Date(`${eventDate.toDateString()} ${session.start_time}`)
    const sessionEnd = new Date(`${eventDate.toDateString()} ${session.end_time}`)
    
    if (now < sessionStart) return 'upcoming'
    if (now >= sessionStart && now <= sessionEnd) return 'live'
    return 'completed'
  }

  const getSessionTypeIcon = (type: string) => {
    const icons = {
      keynote: Presentation,
      panel: Users,
      workshop: BookOpen,
      networking: Network,
      break: Coffee
    }
    return icons[type] || Info
  }

  const getSessionTypeColor = (type: string) => {
    const colors = {
      keynote: 'bg-purple-100 text-purple-700 border-purple-200',
      panel: 'bg-blue-100 text-blue-700 border-blue-200',
      workshop: 'bg-green-100 text-green-700 border-green-200',
      networking: 'bg-orange-100 text-orange-700 border-orange-200',
      break: 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock, label: 'Upcoming' },
      live: { color: 'bg-red-100 text-red-700 border-red-200 animate-pulse', icon: Zap, label: 'Live Now' },
      completed: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Completed' },
      scheduled: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Calendar, label: 'Scheduled' }
    }
    
    const badge = badges[status]
    const IconComponent = badge.icon
    
    return (
      <Badge variant="outline" className={badge.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {badge.label}
      </Badge>
    )
  }

  const renderSessionCard = (session: any, index: number) => {
    const status = getSessionStatus(session)
    const TypeIcon = getSessionTypeIcon(session.type)
    const typeColor = getSessionTypeColor(session.type)
    const isClickable = status === 'live' || (session.resources && session.resources.length > 0)

    return (
      <motion.div
        key={session.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="relative"
      >
        {/* Timeline Line (for timeline view) */}
        {viewMode === 'timeline' && (
          <div className="absolute left-6 top-20 bottom-0 w-px bg-border z-0" />
        )}
        
        <Card 
          className={`p-6 rounded-2xl shadow-sm transition-all duration-300 relative z-10 ${
            isClickable ? 'hover:shadow-md cursor-pointer hover:border-primary/30' : ''
          } ${status === 'live' ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}
          onClick={isClickable ? () => setSelectedSession(session.id) : undefined}
        >
          <div className="flex items-start space-x-4">
            {/* Timeline Dot and Time (for timeline view) */}
            {viewMode === 'timeline' && (
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${typeColor} border-2`}>
                  <TypeIcon className="w-5 h-5" />
                </div>
                <div className="text-center mt-2">
                  <p className="font-medium text-sm">{session.start_time}</p>
                  <p className="text-xs text-text-secondary">{session.duration}min</p>
                </div>
              </div>
            )}

            {/* Session Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {session.title}
                    </h3>
                    {getStatusBadge(status)}
                    {viewMode === 'list' && (
                      <Badge variant="outline" className={typeColor}>
                        <TypeIcon className="w-3 h-3 mr-1" />
                        {session.type}
                      </Badge>
                    )}
                  </div>
                  
                  {session.description && (
                    <p className="text-text-secondary mb-3 leading-relaxed">
                      {session.description}
                    </p>
                  )}
                </div>
                
                {status === 'live' && (
                  <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white ml-4">
                    <Play className="w-3 h-3 mr-1" />
                    Join Live
                  </Button>
                )}
              </div>

              {/* Session Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {viewMode === 'list' && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-text-secondary" />
                    <span className="text-sm text-text-secondary">
                      {session.start_time} - {session.end_time} ({session.duration}min)
                    </span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm text-text-secondary">{session.location}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm text-text-secondary">
                    {session.attendee_count} attendees
                  </span>
                </div>
              </div>

              {/* Speaker(s) */}
              {session.speaker && (
                <div className="flex items-center space-x-3 mb-4 p-3 bg-muted/30 rounded-xl">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={session.speaker.avatar} />
                    <AvatarFallback>{session.speaker.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{session.speaker.name}</p>
                    <p className="text-sm text-text-secondary">
                      {session.speaker.title} at {session.speaker.company}
                    </p>
                  </div>
                </div>
              )}

              {session.speakers && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-text-secondary mb-2">Panel Speakers:</p>
                  <div className="flex -space-x-2">
                    {session.speakers.map((speaker: any, idx: number) => (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <Avatar className="w-8 h-8 border-2 border-background hover:z-10 hover:scale-110 transition-transform">
                            <AvatarImage src={speaker.avatar} />
                            <AvatarFallback>{speaker.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div>
                            <p className="font-medium">{speaker.name}</p>
                            <p className="text-xs">{speaker.title}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources and Actions */}
              {((session.resources && session.resources.length > 0) || status === 'live' || session.is_recorded) && (
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center space-x-2">
                    {(session.resources || []).map((resource: any, idx: number) => (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="outline" className="h-8">
                            <FileText className="w-3 h-3 mr-1" />
                            {resource.type}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{resource.title}</TooltipContent>
                      </Tooltip>
                    ))}
                    
                    {session.is_recorded && status === 'completed' && (
                      <Button size="sm" variant="outline" className="h-8">
                        <Play className="w-3 h-3 mr-1" />
                        Recording
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {status === 'upcoming' && (
                      <Button size="sm" variant="outline" className="h-8">
                        <Calendar className="w-3 h-3 mr-1" />
                        Add to Calendar
                      </Button>
                    )}
                    
                    <Button size="sm" variant="ghost" className="h-8">
                      <Share2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Agenda Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-xl">Event Agenda</h2>
            <p className="text-text-secondary">
              {agenda?.length || 0} day{(agenda?.length || 0) > 1 ? 's' : ''} • {currentDay?.sessions?.length || 0} sessions
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Day Selector */}
            {(agenda?.length || 0) > 1 && (
              <Select value={selectedDay.toString()} onValueChange={(value) => setSelectedDay(parseInt(value))}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(agenda || []).map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* View Mode Toggle */}
            <div className="flex bg-muted/50 rounded-xl p-1">
              <Button
                size="sm"
                variant={viewMode === 'timeline' ? "default" : "ghost"}
                onClick={() => setViewMode('timeline')}
                className="rounded-lg"
              >
                <Timer className="w-4 h-4 mr-2" />
                Timeline
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? "default" : "ghost"}
                onClick={() => setViewMode('list')}
                className="rounded-lg"
              >
                <FileText className="w-4 h-4 mr-2" />
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Day Overview */}
        {currentDay && (
          <Card className="p-6 rounded-2xl shadow-sm bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{currentDay.title}</h3>
                <p className="text-text-secondary">
                  {new Date(currentDay.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="font-semibold text-primary">{currentDay?.sessions?.length || 0}</p>
                  <p className="text-sm text-text-secondary">Sessions</p>
                </div>
                
                <div className="text-center">
                  <p className="font-semibold text-primary">
                    {(currentDay?.sessions || []).reduce((total, session) => total + session.duration, 0)}min
                  </p>
                  <p className="text-sm text-text-secondary">Total Duration</p>
                </div>
                
                <div className="text-center">
                  <p className="font-semibold text-primary">
                    {(currentDay?.sessions?.length > 0) ? Math.max(...currentDay.sessions.map(s => s.attendee_count)) : 0}
                  </p>
                  <p className="text-sm text-text-secondary">Max Attendance</p>
                </div>
              </div>
            </div>

            {/* Progress Bar for Ongoing Events */}
            {isEventDay && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Event Progress</span>
                  <span className="text-sm text-primary">
                    {(currentDay?.sessions || []).filter(s => getSessionStatus(s) === 'completed').length} / {currentDay?.sessions?.length || 0} completed
                  </span>
                </div>
                <Progress 
                  value={((currentDay?.sessions || []).filter(s => getSessionStatus(s) === 'completed').length / Math.max(1, currentDay?.sessions?.length || 1)) * 100}
                  className="h-2"
                />
              </div>
            )}
          </Card>
        )}

        {/* Sessions */}
        {currentDay && currentDay.sessions && currentDay.sessions.length > 0 ? (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {currentDay.sessions.map((session, index) => renderSessionCard(session, index))}
            </AnimatePresence>
          </div>
        ) : (
          <Card className="p-8 rounded-2xl shadow-sm text-center">
            <div className="space-y-4">
              <Calendar className="w-12 h-12 text-text-tertiary mx-auto" />
              <div>
                <h3 className="font-semibold text-text-primary">No Agenda Available</h3>
                <p className="text-text-secondary">
                  The event agenda will be available closer to the event date.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Session Detail Modal */}
        {selectedSession && (
          <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Session Details</DialogTitle>
              </DialogHeader>
              {/* Session detail content would go here */}
              <div className="py-4">
                <p>Detailed session information, resources, and live controls would be displayed here.</p>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  )
}