import React, { useState, useMemo } from 'react'
import { 
  Brain, 
  History, 
  CheckCircle, 
  Lightbulb, 
  Video, 
  Phone, 
  Coffee, 
  Mail,
  Calendar,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  ArrowRight,
  Plus,
  Sparkles,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Progress } from '../ui/progress'
import { MEETING_TYPE_ICONS } from '../../utils/contactConstants'
import { formatTimeAgo } from '../../utils/contactHelpers'

interface ContactMeetingsTabProps {
  contact: any
  meetingPrepData: any
  preparingMeeting: boolean
  onGeneratePrep: () => void
}

export function ContactMeetingsTab({ 
  contact, 
  meetingPrepData, 
  preparingMeeting, 
  onGeneratePrep 
}: ContactMeetingsTabProps) {
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null)
  const [activeSubTab, setActiveSubTab] = useState('upcoming')

  // Enhanced meeting data to showcase module capabilities
  const meetingData = useMemo(() => {
    const now = new Date()
    
    // Upcoming meetings
    const upcomingMeetings = [
      {
        id: 'upcoming-1',
        title: `Quarterly Review with ${contact.name}`,
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        startTime: '2:00 PM',
        endTime: '3:00 PM',
        type: 'video',
        platform: 'Google Meet',
        location: 'https://meet.google.com/abc-defg-hij',
        status: 'confirmed',
        attendees: [contact.name, 'You', 'Sarah Johnson (PM)'],
        description: 'Review Q4 performance and discuss Q1 2025 objectives',
        aiPrepStatus: 'ready',
        prepInsights: 8,
        priority: 'high',
        tags: ['Strategic', 'Quarterly Review'],
        contextSummary: 'Follow-up from last month\'s partnership discussion. Key decision point for Q1 expansion.',
        suggestedTopics: ['Q4 Results Review', 'Q1 Roadmap Alignment', 'Budget Planning', 'Team Expansion']
      },
      {
        id: 'upcoming-2',
        title: 'Project Kickoff Meeting',
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        startTime: '10:30 AM',
        endTime: '11:30 AM',
        type: 'video',
        platform: 'Zoom',
        location: 'https://zoom.us/j/123456789',
        status: 'confirmed',
        attendees: [contact.name, 'You', 'Technical Team (3)'],
        description: 'Kick off new AI integration project with technical requirements review',
        aiPrepStatus: 'pending',
        priority: 'medium',
        tags: ['Project Kickoff', 'Technical'],
        contextSummary: 'New project based on their AI integration needs discussed in previous calls.'
      },
      {
        id: 'upcoming-3',
        title: 'Coffee Chat - Partnership Follow-up',
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        startTime: '11:00 AM',
        endTime: '12:00 PM',
        type: 'in-person',
        platform: 'Physical Meeting',
        location: 'Starbucks, Downtown Branch',
        status: 'tentative',
        attendees: [contact.name, 'You'],
        description: 'Informal catch-up and partnership expansion discussion',
        aiPrepStatus: 'not-started',
        priority: 'low',
        tags: ['Networking', 'Partnership'],
        contextSummary: 'Casual follow-up to maintain relationship and explore new opportunities.'
      }
    ]

    // Past meetings with rich history
    const pastMeetings = [
      {
        id: 'past-1',
        title: 'Initial Partnership Discussion',
        date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        startTime: '3:00 PM',
        endTime: '4:00 PM',
        type: 'video',
        platform: 'Google Meet',
        duration: 58,
        attendees: [contact.name, 'You', 'Alex Kumar (BD)'],
        outcome: 'Agreed to explore strategic partnership - Q1 timeline',
        actionItems: [
          'Send partnership framework document',
          'Schedule technical integration meeting',
          'Review legal requirements for partnership'
        ],
        notes: 'Excellent initial discussion. They showed strong interest in our AI platform. Key concerns around integration complexity and timeline.',
        rating: 5,
        followUpScheduled: true,
        recordingAvailable: true,
        transcriptSummary: 'Discussed mutual benefits, integration possibilities, and revenue sharing models.',
        mood: 'positive',
        engagementLevel: 'high'
      },
      {
        id: 'past-2',
        title: 'Technical Deep Dive Session',
        date: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
        startTime: '1:00 PM',
        endTime: '2:30 PM',
        type: 'video',
        platform: 'Zoom',
        duration: 87,
        attendees: [contact.name, 'You', 'Engineering Team (4)', 'Sarah Chen (PM)'],
        outcome: 'Technical feasibility confirmed - moving to pilot phase',
        actionItems: [
          'Set up development environment access',
          'Create API documentation',
          'Schedule weekly technical sync',
          'Prepare pilot project timeline'
        ],
        notes: 'Deep technical discussion went very well. Their engineering team is highly capable and aligned with our architecture.',
        rating: 5,
        followUpScheduled: true,
        recordingAvailable: true,
        transcriptSummary: 'Covered API specifications, security requirements, scalability concerns, and integration timeline.',
        mood: 'positive',
        engagementLevel: 'high',
        technologies: ['REST API', 'OAuth 2.0', 'WebSocket', 'GraphQL']
      },
      {
        id: 'past-3',
        title: 'Quarterly Business Review',
        date: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
        startTime: '2:00 PM',
        endTime: '3:00 PM',
        type: 'phone',
        platform: 'Phone Call',
        duration: 45,
        attendees: [contact.name, 'You'],
        outcome: 'Q3 targets exceeded - planning Q4 expansion',
        actionItems: [
          'Increase team size by 2 developers',
          'Expand to European markets',
          'Launch mobile application beta'
        ],
        notes: 'Great progress review. They are very happy with current results and ready to scale.',
        rating: 4,
        followUpScheduled: true,
        mood: 'positive',
        engagementLevel: 'medium',
        metrics: {
          revenue: '+35%',
          users: '+150%',
          satisfaction: '4.8/5'
        }
      },
      {
        id: 'past-4',
        title: 'Product Demo & Feedback Session',
        date: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        startTime: '11:00 AM',
        endTime: '12:00 PM',
        type: 'video',
        platform: 'Microsoft Teams',
        duration: 52,
        attendees: [contact.name, 'You', 'Product Team (3)'],
        outcome: 'Positive feedback received - minor UI adjustments needed',
        actionItems: [
          'Implement dashboard customization',
          'Add export functionality',
          'Improve mobile responsiveness',
          'Schedule user training session'
        ],
        notes: 'They love the core functionality but requested some UI improvements for better user experience.',
        rating: 4,
        followUpScheduled: true,
        recordingAvailable: true,
        mood: 'positive',
        engagementLevel: 'high',
        feedback: {
          overall: 4.5,
          usability: 4.0,
          features: 5.0,
          performance: 4.2
        }
      },
      {
        id: 'past-5',
        title: 'Contract Negotiation Call',
        date: new Date(now.getTime() - 42 * 24 * 60 * 60 * 1000),
        startTime: '4:00 PM',
        endTime: '5:30 PM',
        type: 'video',
        platform: 'Google Meet',
        duration: 85,
        attendees: [contact.name, 'You', 'Legal Team (2)', 'Business Development'],
        outcome: 'Contract terms agreed - final review pending',
        actionItems: [
          'Legal team to review final contract',
          'Set up billing integration',
          'Prepare onboarding materials',
          'Schedule contract signing meeting'
        ],
        notes: 'Smooth negotiation process. Both parties satisfied with final terms and pricing structure.',
        rating: 4,
        followUpScheduled: true,
        mood: 'neutral',
        engagementLevel: 'medium',
        contractValue: '$250K ARR',
        terms: '2-year commitment with annual review'
      }
    ]

    return { upcomingMeetings, pastMeetings }
  }, [contact.name])

  const getMeetingIcon = (type: string) => {
    const IconComponent = MEETING_TYPE_ICONS[type as keyof typeof MEETING_TYPE_ICONS] || Coffee
    return IconComponent
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-success bg-success/10 border-success/20'
      case 'tentative': return 'text-warning bg-warning/10 border-warning/20'
      case 'pending': return 'text-info bg-info/10 border-info/20'
      default: return 'text-text-secondary bg-accent border-border'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-error bg-error/10 border-error/20'
      case 'medium': return 'text-warning bg-warning/10 border-warning/20'
      case 'low': return 'text-info bg-info/10 border-info/20'
      default: return 'text-text-secondary bg-accent border-border'
    }
  }

  const getAIPrepStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-success bg-success/10 border-success/20'
      case 'pending': return 'text-warning bg-warning/10 border-warning/20'
      case 'not-started': return 'text-text-secondary bg-accent border-border'
      default: return 'text-text-secondary bg-accent border-border'
    }
  }

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'positive': return 'text-success'
      case 'neutral': return 'text-warning'
      case 'negative': return 'text-error'
      default: return 'text-text-secondary'
    }
  }

  const renderUpcomingMeetings = () => (
    <div className="space-y-6">
      {meetingData.upcomingMeetings.map((meeting) => (
        <Card key={meeting.id} className="p-6 rounded-2xl border-border bg-surface shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                {React.createElement(getMeetingIcon(meeting.type), { className: "h-6 w-6 text-primary" })}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-text-primary mb-2">{meeting.title}</h4>
                <div className="flex items-center space-x-4 text-sm text-text-secondary mb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{meeting.date.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{meeting.startTime} - {meeting.endTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{meeting.platform}</span>
                  </div>
                </div>
                <p className="text-sm text-text-secondary mb-3">{meeting.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge className={`text-xs px-2 py-1 rounded-lg ${getStatusColor(meeting.status)}`}>
                {meeting.status}
              </Badge>
              {meeting.priority && (
                <Badge className={`text-xs px-2 py-1 rounded-lg ${getPriorityColor(meeting.priority)}`}>
                  {meeting.priority} priority
                </Badge>
              )}
            </div>
          </div>

          {/* AI Prep Status */}
          <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl border border-border mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h5 className="text-sm font-medium text-text-primary">AI Meeting Prep</h5>
                <p className="text-xs text-text-secondary">
                  {meeting.aiPrepStatus === 'ready' && `${meeting.prepInsights} insights ready`}
                  {meeting.aiPrepStatus === 'pending' && 'Generating insights...'}
                  {meeting.aiPrepStatus === 'not-started' && 'Click to generate prep'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`text-xs px-2 py-1 rounded-lg ${getAIPrepStatusColor(meeting.aiPrepStatus)}`}>
                {meeting.aiPrepStatus === 'ready' && 'Ready'}
                {meeting.aiPrepStatus === 'pending' && 'Preparing'}
                {meeting.aiPrepStatus === 'not-started' && 'Not Started'}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={onGeneratePrep}
                disabled={preparingMeeting}
                className="h-8 px-3 rounded-lg"
              >
                {preparingMeeting ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
                ) : (
                  <Zap className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Meeting Context */}
          {meeting.contextSummary && (
            <div className="p-4 bg-primary-light/20 rounded-xl border border-primary/10 mb-4">
              <h5 className="text-sm font-medium text-primary mb-2 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Meeting Context
              </h5>
              <p className="text-sm text-text-primary">{meeting.contextSummary}</p>
            </div>
          )}

          {/* Suggested Topics */}
          {meeting.suggestedTopics && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-text-secondary mb-2">Suggested Discussion Topics</h5>
              <div className="flex flex-wrap gap-2">
                {meeting.suggestedTopics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="text-xs px-2 py-1 rounded-lg">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Attendees */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-text-secondary" />
              <span className="text-sm text-text-secondary">
                {meeting.attendees.join(', ')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {meeting.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  const renderPastMeetings = () => (
    <div className="space-y-6">
      {meetingData.pastMeetings.map((meeting) => (
        <Card key={meeting.id} className="p-6 rounded-2xl border-border bg-surface shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                {React.createElement(getMeetingIcon(meeting.type), { className: "h-6 w-6 text-success" })}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-text-primary">{meeting.title}</h4>
                  {meeting.rating && (
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < meeting.rating ? 'text-warning fill-warning' : 'text-text-tertiary'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  {meeting.mood && (
                    <Badge className={`text-xs px-2 py-1 rounded-lg ${getMoodColor(meeting.mood)}`}>
                      {meeting.mood}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-text-secondary mb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{meeting.date.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{meeting.duration}min via {meeting.platform}</span>
                  </div>
                  {meeting.recordingAvailable && (
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      <Video className="h-3 w-3 mr-1" />
                      Recording
                    </Badge>
                  )}
                </div>

                {meeting.outcome && (
                  <div className="p-3 bg-success/5 rounded-lg border border-success/10 mb-3">
                    <h5 className="text-sm font-medium text-success mb-1 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Meeting Outcome
                    </h5>
                    <p className="text-sm text-text-primary">{meeting.outcome}</p>
                  </div>
                )}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedMeeting(expandedMeeting === meeting.id ? null : meeting.id)}
              className="h-8 w-8 p-0"
            >
              {expandedMeeting === meeting.id ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Expanded Details */}
          {expandedMeeting === meeting.id && (
            <div className="space-y-4 animate-fade-in">
              {/* Notes */}
              {meeting.notes && (
                <div>
                  <h5 className="text-sm font-medium text-text-secondary mb-2">Meeting Notes</h5>
                  <p className="text-sm text-text-primary p-3 bg-accent/50 rounded-lg">{meeting.notes}</p>
                </div>
              )}

              {/* Action Items */}
              {meeting.actionItems && meeting.actionItems.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-text-secondary mb-2">Action Items</h5>
                  <div className="space-y-2">
                    {meeting.actionItems.map((item, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-text-primary">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metrics (if available) */}
              {meeting.metrics && (
                <div>
                  <h5 className="text-sm font-medium text-text-secondary mb-2">Key Metrics Discussed</h5>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(meeting.metrics).map(([key, value]) => (
                      <div key={key} className="text-center p-3 bg-accent/30 rounded-lg">
                        <div className="text-lg font-semibold text-primary">{value}</div>
                        <div className="text-xs text-text-secondary capitalize">{key}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies (if available) */}
              {meeting.technologies && (
                <div>
                  <h5 className="text-sm font-medium text-text-secondary mb-2">Technologies Discussed</h5>
                  <div className="flex flex-wrap gap-2">
                    {meeting.technologies.map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Attendees */}
              <div>
                <h5 className="text-sm font-medium text-text-secondary mb-2">Attendees</h5>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-text-secondary" />
                  <span className="text-sm text-text-primary">
                    {meeting.attendees.join(', ')}
                  </span>
                </div>
              </div>

              {/* Follow-up Status */}
              {meeting.followUpScheduled && (
                <div className="flex items-center space-x-2 p-3 bg-info/5 rounded-lg border border-info/10">
                  <ArrowRight className="h-4 w-4 text-info" />
                  <span className="text-sm text-info font-medium">Follow-up meeting scheduled</span>
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  )

  const renderMeetingInsights = () => (
    <div className="space-y-6">
      {/* Meeting Analytics */}
      <Card className="p-6 rounded-2xl border-border bg-surface shadow-sm">
        <h4 className="font-semibold text-text-primary mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-primary" />
          Meeting Analytics with {contact.name}
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
            <div className="text-sm text-blue-600 font-medium">Total Meetings</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="text-2xl font-bold text-green-600 mb-1">45min</div>
            <div className="text-sm text-green-600 font-medium">Avg Duration</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="text-2xl font-bold text-purple-600 mb-1">4.6</div>
            <div className="text-sm text-purple-600 font-medium">Avg Rating</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div className="text-2xl font-bold text-orange-600 mb-1">92%</div>
            <div className="text-sm text-orange-600 font-medium">On-time Rate</div>
          </div>
        </div>

        {/* Relationship Progression */}
        <div className="space-y-4">
          <h5 className="font-medium text-text-primary">Relationship Progression</h5>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Initial Contact</span>
                <span className="text-text-secondary">Strategic Partner</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <Badge className="bg-success/10 text-success border-success/20 px-3 py-1 rounded-lg">
              Growing
            </Badge>
          </div>
        </div>
      </Card>

      {/* AI Meeting Suggestions */}
      <Card className="p-6 rounded-2xl border-primary/20 bg-primary-light/30 shadow-sm">
        <h4 className="font-semibold text-primary mb-4 flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          AI Meeting Suggestions
        </h4>
        
        <div className="space-y-4">
          <div className="p-4 bg-surface rounded-xl border border-border">
            <div className="flex items-start justify-between mb-2">
              <h5 className="font-medium text-text-primary">Quarterly Strategy Alignment</h5>
              <Badge className="bg-success/10 text-success border-success/20 text-xs">
                Recommended
              </Badge>
            </div>
            <p className="text-sm text-text-secondary mb-3">
              Based on your meeting history, it's time for a quarterly strategy review. Last one was 3 months ago.
            </p>
            <div className="flex items-center space-x-2">
              <Button size="sm" className="h-8 px-3 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground">
                Schedule Meeting
              </Button>
              <span className="text-xs text-text-tertiary">Suggested: Next week</span>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-xl border border-border">
            <div className="flex items-start justify-between mb-2">
              <h5 className="font-medium text-text-primary">Technical Deep Dive Follow-up</h5>
              <Badge className="bg-warning/10 text-warning border-warning/20 text-xs">
                Overdue
              </Badge>
            </div>
            <p className="text-sm text-text-secondary mb-3">
              Follow-up needed on technical integration discussed 2 weeks ago. Action items pending.
            </p>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" className="h-8 px-3 rounded-lg">
                Schedule Follow-up
              </Button>
              <span className="text-xs text-text-tertiary">Priority: High</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Meeting Best Practices */}
      <Card className="p-6 rounded-2xl border-border bg-surface shadow-sm">
        <h4 className="font-semibold text-text-primary mb-4 flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-warning" />
          Meeting Optimization Tips
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-text-primary">Perfect Meeting Length</h5>
              <p className="text-sm text-text-secondary">
                Your {meetingData.pastMeetings[0]?.duration}min average is ideal for {contact.name} - maintain this duration.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-info mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-text-primary">Meeting Frequency</h5>
              <p className="text-sm text-text-secondary">
                Consider bi-weekly check-ins to maintain momentum on your partnership initiatives.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-text-primary">AI Prep Usage</h5>
              <p className="text-sm text-text-secondary">
                Use AI meeting prep for every call - it increases success rate by 40% based on your history.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Meeting Management</h3>
          <p className="text-sm text-text-secondary">
            Complete meeting history and AI-powered insights for {contact.name}
          </p>
        </div>
        <Button
          onClick={onGeneratePrep}
          disabled={preparingMeeting}
          className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl"
        >
          {preparingMeeting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Brain className="h-4 w-4 mr-2" />
          )}
          Generate AI Prep
        </Button>
      </div>

      {/* Enhanced AI Meeting Prep Results */}
      {meetingPrepData && (
        <Card className="p-6 border-primary/20 bg-primary-light/30 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-primary">AI Meeting Preparation</h4>
              <p className="text-sm text-text-secondary">Smart insights based on your relationship history</p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-lg">
              Ready
            </Badge>
          </div>
          
          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-text-primary mb-2">Meeting Summary</h5>
              <p className="text-sm text-text-secondary bg-surface/50 p-3 rounded-lg">
                {meetingPrepData.summary}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-text-primary mb-2">Key Talking Points</h5>
                <ul className="space-y-1">
                  {meetingPrepData.talkingPoints.map((point: string, index: number) => (
                    <li key={index} className="text-sm text-text-secondary flex items-start space-x-2">
                      <CheckCircle className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-medium text-text-primary mb-2">Suggested Questions</h5>
                <ul className="space-y-1">
                  {meetingPrepData.questions.map((question: string, index: number) => (
                    <li key={index} className="text-sm text-text-secondary flex items-start space-x-2">
                      <Lightbulb className="h-3 w-3 text-warning mt-0.5 flex-shrink-0" />
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Meeting Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-accent/50 p-1 rounded-xl h-12">
          <TabsTrigger 
            value="upcoming"
            className="rounded-lg h-10 font-medium text-sm data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-sm"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Upcoming (3)
          </TabsTrigger>
          <TabsTrigger 
            value="past"
            className="rounded-lg h-10 font-medium text-sm data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-sm"
          >
            <History className="h-4 w-4 mr-2" />
            History (5)
          </TabsTrigger>
          <TabsTrigger 
            value="insights"
            className="rounded-lg h-10 font-medium text-sm data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-sm"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {renderUpcomingMeetings()}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {renderPastMeetings()}
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          {renderMeetingInsights()}
        </TabsContent>
      </Tabs>
    </div>
  )
}