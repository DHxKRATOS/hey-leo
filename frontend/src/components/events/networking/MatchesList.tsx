import React, { useState } from 'react'
import { MessageCircle, Eye, Clock, Check, User } from 'lucide-react'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Card } from '../../ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { Event } from '../../../types/events'

interface MatchesListProps {
  event: Event
  onNavigate: (page: any) => void
}

export function MatchesList({ event, onNavigate }: MatchesListProps) {
  // Mock matches data
  const [matches] = useState([
    {
      id: 'match-1',
      user: {
        id: 'user-1',
        name: 'Sarah Chen',
        title: 'Product Designer',
        company: 'Meta',
        profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b2c5?w=150&h=150&fit=crop&crop=face',
        lastMessage: 'Looking forward to discussing AI partnerships!'
      },
      matchedAt: '2 hours ago',
      hasUnreadMessages: true,
      isOnline: true
    },
    {
      id: 'match-2',
      user: {
        id: 'user-2',
        name: 'John Davis',
        title: 'CEO',
        company: 'StartupAI',
        profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        lastMessage: 'Great to connect!'
      },
      matchedAt: '1 day ago',
      hasUnreadMessages: false,
      isOnline: true
    },
    {
      id: 'match-3',
      user: {
        id: 'user-3',
        name: 'Emily Rodriguez',
        title: 'VP Engineering',
        company: 'TechFlow',
        profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        lastMessage: null
      },
      matchedAt: '3 hours ago',
      hasUnreadMessages: false,
      isOnline: false
    }
  ])

  const handleChatAll = () => {
    // Open group chat or chat list view
    onNavigate('event-chat-list')
  }

  const handleChatUser = (matchId: string) => {
    // Open individual chat
    onNavigate(`event-chat-${matchId}`)
  }

  const handleViewProfile = (userId: string) => {
    // Open full profile view
    onNavigate(`event-profile-${userId}`)
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No matches yet
        </h3>
        <p className="text-text-secondary mb-6">
          Start swiping on attendees to find your networking matches
        </p>
        <Button onClick={() => onNavigate('discover')}>
          Start Networking
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Your Matches ({matches.length})
          </h3>
          <p className="text-text-secondary">
            People who are interested in connecting with you
          </p>
        </div>
        <Button variant="outline" onClick={handleChatAll} className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Chat All
        </Button>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {matches.map((match) => (
          <Card key={match.id} className="p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={match.user.profilePhoto} alt={match.user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {match.user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {match.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-surface rounded-full" />
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-foreground truncate">
                      {match.user.name}
                    </h4>
                    {match.isOnline && (
                      <Badge variant="outline" className="text-xs">
                        <div className="w-2 h-2 bg-success rounded-full mr-1" />
                        Online
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-text-secondary mb-2 truncate">
                    {match.user.title} at {match.user.company}
                  </p>

                  {match.user.lastMessage ? (
                    <p className={`text-sm truncate ${
                      match.hasUnreadMessages ? 'font-medium text-foreground' : 'text-text-secondary'
                    }`}>
                      {match.user.lastMessage}
                    </p>
                  ) : (
                    <p className="text-sm text-text-tertiary italic">
                      Start the conversation
                    </p>
                  )}
                </div>

                {/* Match Time */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center space-x-1 text-xs text-text-secondary mb-2">
                    <Clock className="h-3 w-3" />
                    <span>Matched {match.matchedAt}</span>
                  </div>
                  {match.hasUnreadMessages && (
                    <div className="w-3 h-3 bg-primary rounded-full ml-auto" />
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewProfile(match.user.id)}
                  className="gap-1"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleChatUser(match.id)}
                  className="gap-1"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Match Tips */}
      <Card className="p-4 bg-primary-light border border-primary/20">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-medium text-primary mb-1">
              Networking Tips
            </h4>
            <ul className="text-sm text-primary/80 space-y-1">
              <li>• Start with a personalized message referencing their interests</li>
              <li>• Suggest meeting at specific event sessions you're both attending</li>
              <li>• Share your business card after establishing a connection</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}