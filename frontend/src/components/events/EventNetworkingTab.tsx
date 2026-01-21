import React, { useState, useRef } from 'react'
import { motion, PanInfo, AnimatePresence, useMotionValue, useTransform } from 'motion/react'
import { 
  Heart,
  X,
  Star,
  MessageCircle,
  Users,
  Filter,
  Search,
  MapPin,
  Briefcase,
  Award,
  ExternalLink,
  Phone,
  Mail,
  Linkedin,
  Github,
  Globe,
  Coffee,
  Zap,
  Target,
  Network,
  UserPlus,
  Volume2,
  VolumeX,
  Settings,
  Shuffle,
  RotateCcw,
  Info,
  CheckCircle,
  Clock,
  TrendingUp,
  Sparkles
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Switch } from '../ui/switch'
import { Slider } from '../ui/slider'
import { Progress } from '../ui/progress'
import { Separator } from '../ui/separator'
// Components to be created - removing imports for now
import { toast } from 'sonner@2.0.3'

interface EventNetworkingTabProps {
  event: any
}

export function EventNetworkingTab({ event }: EventNetworkingTabProps) {
  const [activeTab, setActiveTab] = useState('discover')
  const [currentAttendeeIndex, setCurrentAttendeeIndex] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoAdvance, setAutoAdvance] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [networkingFilters, setNetworkingFilters] = useState({
    industry: 'all',
    seniority: 'all',
    interests: [],
    location: 'all',
    availability: 'all'
  })

  const audioContextRef = useRef<AudioContext | null>(null)
  const cardStackRef = useRef<HTMLDivElement>(null)

  // Mock attendees data (in real app, this would come from the event)
  const attendees = event.attendees || [
    {
      id: 'attendee-1',
      name: 'Sarah Chen',
      title: 'Senior Product Manager',
      company: 'TechFlow',
      location: 'San Francisco, CA',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b601?w=400&h=400&fit=crop&crop=face',
      bio: 'Passionate about building products that solve real problems. Love connecting with fellow PMs and entrepreneurs.',
      industry: 'Technology',
      seniority: 'Senior',
      interests: ['Product Strategy', 'AI/ML', 'User Experience', 'Startups'],
      links: [
        { platform: 'linkedin', url: 'https://linkedin.com/in/sarahchen' },
        { platform: 'email', url: 'sarah@techflow.com' }
      ],
      mutual_connections: 3,
      compatibility_score: 92,
      availability: 'Available for coffee chat',
      is_online: true,
      last_seen: new Date()
    },
    {
      id: 'attendee-2', 
      name: 'Marcus Rodriguez',
      title: 'Founder & CEO',
      company: 'GreenTech Solutions',
      location: 'Austin, TX',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      bio: 'Building sustainable tech solutions. Always interested in discussing climate tech, fundraising, and startup challenges.',
      industry: 'CleanTech',
      seniority: 'Executive',
      interests: ['Climate Tech', 'Fundraising', 'Sustainability', 'Leadership'],
      links: [
        { platform: 'linkedin', url: 'https://linkedin.com/in/marcusrodriguez' },
        { platform: 'website', url: 'https://greentech-solutions.com' }
      ],
      mutual_connections: 7,
      compatibility_score: 87,
      availability: 'Open to partnerships',
      is_online: false,
      last_seen: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: 'attendee-3',
      name: 'Dr. Emily Watson',
      title: 'Head of AI Research',
      company: 'InnovateAI Lab',
      location: 'Boston, MA',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      bio: 'PhD in Machine Learning. Researching ethical AI and its applications in healthcare. Love mentoring young researchers.',
      industry: 'AI/Research',
      seniority: 'Executive',
      interests: ['Machine Learning', 'Healthcare AI', 'Ethics', 'Mentoring'],
      links: [
        { platform: 'linkedin', url: 'https://linkedin.com/in/emilywatson' },
        { platform: 'github', url: 'https://github.com/emilywatson' }
      ],
      mutual_connections: 12,
      compatibility_score: 95,
      availability: 'Looking for collaborators',
      is_online: true,
      last_seen: new Date()
    }
  ]

  const [matches, setMatches] = useState([])
  const [passed, setPassed] = useState([])

  // Initialize audio context for sound effects
  React.useEffect(() => {
    if (soundEnabled && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.warn('Audio context not supported')
      }
    }
  }, [soundEnabled])

  const playSound = (type: 'like' | 'pass' | 'match' | 'message') => {
    if (!soundEnabled || !audioContextRef.current) return
    
    try {
      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      const frequencies = {
        like: 523, // C5
        pass: 220, // A3
        match: 659, // E5
        message: 440 // A4
      }
      
      oscillator.frequency.value = frequencies[type]
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.3)
    } catch (error) {
      console.warn('Sound playback failed:', error)
    }
  }

  const handleSwipe = (direction: 'left' | 'right' | 'up', attendee: any) => {
    if (direction === 'right' || direction === 'up') {
      // Like or Super Like
      setMatches(prev => [...prev, { ...attendee, matched_at: new Date(), type: direction === 'up' ? 'super' : 'like' }])
      playSound(direction === 'up' ? 'match' : 'like')
      
      toast.success(
        direction === 'up' 
          ? `⭐ Super liked ${attendee.name}! You really want to connect!` 
          : `💚 Liked ${attendee.name}! Hope they like you back!`
      )
    } else {
      // Pass
      setPassed(prev => [...prev, attendee.id])
      playSound('pass')
      toast.error(`👎 Passed on ${attendee.name}. Next!`)
    }
    
    // Advance to next attendee
    setCurrentAttendeeIndex(prev => prev + 1)
  }

  const handleChat = (attendeeId: string) => {
    setSelectedMatch(attendeeId)
    playSound('message')
  }

  const filteredAttendees = attendees.filter(attendee => {
    if (passed.includes(attendee.id)) return false
    if (matches.some(m => m.id === attendee.id)) return false
    
    // Apply filters
    if (networkingFilters.industry !== 'all' && attendee.industry !== networkingFilters.industry) return false
    if (networkingFilters.seniority !== 'all' && attendee.seniority !== networkingFilters.seniority) return false
    if (networkingFilters.location !== 'all' && !attendee.location.includes(networkingFilters.location)) return false
    
    return true
  })

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Networking Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-xl flex items-center space-x-2">
              <Network className="w-6 h-6 text-primary" />
              <span>Event Networking</span>
            </h2>
            <p className="text-text-secondary">
              Discover and connect with {attendees.length} attendees • {matches.length} matches made
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Stats */}
            <div className="flex items-center space-x-4 bg-muted/30 rounded-2xl px-4 py-2">
              <div className="text-center">
                <p className="font-semibold text-green-600">{matches.length}</p>
                <p className="text-xs text-text-secondary">Matches</p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-center">
                <p className="font-semibold text-blue-600">{filteredAttendees.length}</p>
                <p className="text-xs text-text-secondary">Remaining</p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-center">
                <p className="font-semibold text-orange-600">{attendees.filter(a => a.is_online).length}</p>
                <p className="text-xs text-text-secondary">Online</p>
              </div>
            </div>

            {/* Settings */}
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={soundEnabled ? 'bg-green-50 border-green-200 text-green-700' : ''}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle sound effects</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={showFilters ? 'bg-primary/10 border-primary/30 text-primary' : ''}
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Filter attendees</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 rounded-2xl bg-muted/30">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-primary" />
                  Filter Attendees
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary mb-2 block">Industry</label>
                    <Select value={networkingFilters.industry} onValueChange={(value) => 
                      setNetworkingFilters(prev => ({ ...prev, industry: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="All Industries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Industries</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="CleanTech">CleanTech</SelectItem>
                        <SelectItem value="AI/Research">AI/Research</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-secondary mb-2 block">Seniority</label>
                    <Select value={networkingFilters.seniority} onValueChange={(value) => 
                      setNetworkingFilters(prev => ({ ...prev, seniority: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="Entry">Entry Level</SelectItem>
                        <SelectItem value="Mid">Mid Level</SelectItem>
                        <SelectItem value="Senior">Senior Level</SelectItem>
                        <SelectItem value="Executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-secondary mb-2 block">Location</label>
                    <Select value={networkingFilters.location} onValueChange={(value) => 
                      setNetworkingFilters(prev => ({ ...prev, location: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="San Francisco">San Francisco</SelectItem>
                        <SelectItem value="Austin">Austin</SelectItem>
                        <SelectItem value="Boston">Boston</SelectItem>
                        <SelectItem value="New York">New York</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-secondary mb-2 block">Availability</label>
                    <Select value={networkingFilters.availability} onValueChange={(value) => 
                      setNetworkingFilters(prev => ({ ...prev, availability: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="coffee">Coffee Chats</SelectItem>
                        <SelectItem value="partnerships">Partnerships</SelectItem>
                        <SelectItem value="collaboration">Collaboration</SelectItem>
                        <SelectItem value="hiring">Hiring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-text-secondary">
                    {filteredAttendees.length} attendees match your filters
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setNetworkingFilters({
                      industry: 'all',
                      seniority: 'all',
                      interests: [],
                      location: 'all',
                      availability: 'all'
                    })}
                  >
                    Reset Filters
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Networking Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg bg-muted/30 rounded-2xl p-1">
            <TabsTrigger value="discover" className="rounded-xl data-[state=active]:shadow-sm">
              <Target className="w-4 h-4 mr-2" />
              Discover ({filteredAttendees.length})
            </TabsTrigger>
            <TabsTrigger value="matches" className="rounded-xl data-[state=active]:shadow-sm">
              <Heart className="w-4 h-4 mr-2" />
              Matches ({matches.length})
            </TabsTrigger>
            <TabsTrigger value="chat" className="rounded-xl data-[state=active]:shadow-sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
              {matches.filter(m => m.unread_messages > 0).length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white scale-75">
                  {matches.filter(m => m.unread_messages > 0).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Discovery Tab - Tinder-style Swiping */}
          <TabsContent value="discover">
            <div className="text-center py-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Attendee Discovery</h3>
                  <p className="text-text-secondary max-w-md mx-auto">
                    Tinder-style swiping to discover and connect with {filteredAttendees.length} attendees at this event.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                  {filteredAttendees.slice(0, 6).map((attendee, index) => (
                    <Card key={attendee.id} className="p-4 rounded-xl hover:shadow-md transition-all">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={attendee.avatar} />
                          <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{attendee.name}</h4>
                          <p className="text-sm text-text-secondary truncate">{attendee.title}</p>
                          <p className="text-xs text-text-secondary">{attendee.company}</p>
                        </div>
                      </div>
                      <p className="text-sm text-text-secondary line-clamp-2 mb-3">{attendee.bio}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {attendee.interests?.slice(0, 2).map((interest, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                            <X className="w-3 h-3" />
                          </Button>
                          <Button size="sm" className="h-7 w-7 p-0 bg-primary">
                            <Heart className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches">
            <div className="text-center py-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500/20 to-red-500/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Your Matches</h3>
                  <p className="text-text-secondary max-w-md mx-auto">
                    {matches.length === 0 
                      ? 'No matches yet! Start swiping to connect with attendees.'
                      : `You have ${matches.length} matches. Start conversations to build professional relationships.`
                    }
                  </p>
                </div>
                {matches.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                    {matches.map((match) => (
                      <Card key={match.id} className="p-4 rounded-xl hover:shadow-md transition-all">
                        <div className="flex items-center space-x-3 mb-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={match.avatar} />
                            <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{match.name}</h4>
                            <p className="text-sm text-text-secondary truncate">{match.title}</p>
                            <p className="text-xs text-text-secondary">{match.company}</p>
                          </div>
                          {match.type === 'super' && (
                            <Star className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            Matched {new Date(match.matched_at).toLocaleDateString()}
                          </Badge>
                          <Button size="sm" onClick={() => handleChat(match.id)}>
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Chat
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <div className="text-center py-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/10 rounded-2xl flex items-center justify-center mx-auto">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Event Chat</h3>
                  <p className="text-text-secondary max-w-md mx-auto">
                    {matches.length === 0 
                      ? 'No conversations yet. Start by making matches in the Discovery tab!'
                      : 'Start meaningful conversations with your professional matches.'
                    }
                  </p>
                </div>
                {matches.length > 0 && selectedMatch && (
                  <Card className="max-w-2xl mx-auto p-6 rounded-xl">
                    <div className="flex items-center space-x-3 mb-4 pb-4 border-b">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={matches.find(m => m.id === selectedMatch)?.avatar} />
                        <AvatarFallback>
                          {matches.find(m => m.id === selectedMatch)?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">
                          {matches.find(m => m.id === selectedMatch)?.name}
                        </h4>
                        <p className="text-sm text-text-secondary">
                          {matches.find(m => m.id === selectedMatch)?.title}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4 mb-4">
                      <div className="text-center text-text-secondary text-sm">
                        Chat functionality coming soon! 💬
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input 
                        placeholder="Type your message..." 
                        className="flex-1"
                        disabled
                      />
                      <Button disabled>
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                )}
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Networking Tips */}
        {activeTab === 'discover' && filteredAttendees.length === 0 && (
          <Card className="p-8 text-center rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-hover rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">All Done! 🎉</h3>
                <p className="text-text-secondary max-w-md mx-auto">
                  You've viewed all available attendees. Check your matches or adjust your filters to discover more connections.
                </p>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Button onClick={() => setShowFilters(true)} variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Adjust Filters
                </Button>
                <Button onClick={() => setActiveTab('matches')}>
                  <Heart className="w-4 h-4 mr-2" />
                  View Matches
                </Button>
              </div>
            </motion.div>
          </Card>
        )}

        {/* Progress Indicator */}
        {filteredAttendees.length > 0 && activeTab === 'discover' && (
          <Card className="p-4 rounded-xl bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Discovery Progress</span>
              <span className="text-sm text-primary">
                {currentAttendeeIndex} / {attendees.length} viewed
              </span>
            </div>
            <Progress 
              value={(currentAttendeeIndex / attendees.length) * 100} 
              className="h-2"
            />
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}