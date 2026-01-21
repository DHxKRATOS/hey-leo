import React from 'react'
import { motion } from 'motion/react'
import { Users, UserCheck } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

interface Contact {
  id: string
  name: string
  email: string
  company: string
  job_title?: string
}

interface ContactAttendanceIndicatorProps {
  contacts: Contact[]
  eventId: string
  compact?: boolean
  showNames?: boolean
  className?: string
}

export function ContactAttendanceIndicator({ 
  contacts, 
  eventId, 
  compact = false,
  showNames = false,
  className = ""
}: ContactAttendanceIndicatorProps) {
  // Simulate which contacts are attending this event
  // In a real app, this would be determined by actual event attendance data
  const attendingContacts = React.useMemo(() => {
    // Simulate attendance based on event ID for consistency
    const eventSeed = eventId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    return contacts.filter((_, index) => {
      // Use event seed and contact index to create consistent "random" attendance
      const contactSeed = eventSeed + index
      const attendanceRate = 0.4 // 40% chance of attendance
      return (contactSeed % 100) < (attendanceRate * 100)
    }).slice(0, 3) // Limit to first 3 attending contacts
  }, [contacts, eventId])

  if (attendingContacts.length === 0) {
    return null
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-cyan-500'
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center space-x-2 cursor-pointer hover:bg-primary/5 rounded-lg p-1 transition-colors ${className}`}>
          <div className="flex -space-x-1">
            {attendingContacts.slice(0, 2).map((contact, index) => (
              <Tooltip key={contact.id}>
                <TooltipTrigger asChild>
                  <Avatar className="w-5 h-5 border border-background cursor-pointer">
                    <AvatarImage src={`https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1494790108755-2616b612b2c5' : '1472099645785-5658abf4ff4e'}?w=50&h=50&fit=crop&crop=face`} />
                    <AvatarFallback className={`text-xs ${getAvatarColor(contact.name)} text-white`}>
                      {getInitials(contact.name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.job_title} at {contact.company}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
            {attendingContacts.length > 2 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-5 h-5 rounded-full bg-primary/10 border border-background flex items-center justify-center cursor-pointer">
                    <span className="text-xs font-medium text-primary">
                      +{Math.min(attendingContacts.length - 2, 9)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div>
                    <p className="font-medium mb-1">{attendingContacts.length - 2} more contacts attending</p>
                    {attendingContacts.slice(2).map(contact => (
                      <p key={contact.id} className="text-xs text-muted-foreground">
                        {contact.name}
                      </p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <Badge variant="outline" className="text-xs bg-gradient-to-r from-primary/10 to-blue-500/10 text-primary border-primary/30 font-medium">
            <UserCheck className="w-3 h-3 mr-1" />
            {attendingContacts.length === 1 ? '1 friend' : `${attendingContacts.length} friends`} going
          </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <p className="font-medium text-sm">Your contacts attending:</p>
              {attendingContacts.map(contact => (
                <div key={contact.id} className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full ${getAvatarColor(contact.name)} flex items-center justify-center`}>
                    <span className="text-xs text-white font-medium">
                      {getInitials(contact.name)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.job_title}</p>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                Great networking opportunity! 🎯
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-3 bg-primary/5 border border-primary/20 rounded-xl ${className}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Your Contacts Attending
            </span>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            {attendingContacts.length}
          </Badge>
        </div>

        <div className="space-y-2">
          {attendingContacts.map((contact, index) => (
            <div key={contact.id} className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={`https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1494790108755-2616b612b2c5' : '1472099645785-5658abf4ff4e'}?w=50&h=50&fit=crop&crop=face`} />
                <AvatarFallback className={`text-xs ${getAvatarColor(contact.name)} text-white`}>
                  {getInitials(contact.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {contact.name}
                </p>
                {showNames && (
                  <p className="text-xs text-muted-foreground truncate">
                    {contact.job_title} at {contact.company}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </TooltipProvider>
  )
}