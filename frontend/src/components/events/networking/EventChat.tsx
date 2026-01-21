import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send, Paperclip, MoreVertical, Calendar, CreditCard, Phone, Video } from 'lucide-react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { Badge } from '../../ui/badge'
import { Card } from '../../ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu'

interface EventChatProps {
  matchId: string
  onBack: () => void
}

export function EventChat({ matchId, onBack }: EventChatProps) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      id: '1',
      senderId: 'other',
      content: 'Hi! I saw you\'re working on AI productivity tools.',
      timestamp: '2:30 PM',
      type: 'text'
    },
    {
      id: '2',
      senderId: 'me',
      content: 'Absolutely! Would love to discuss potential integration with Meta\'s platforms',
      timestamp: '2:32 PM',
      type: 'text'
    },
    {
      id: '3',
      senderId: 'other',
      content: 'Let\'s meet at the networking lunch tomorrow?',
      timestamp: '2:33 PM',
      type: 'text'
    }
  ])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock user data
  const otherUser = {
    name: 'Sarah Chen',
    title: 'Product Designer',
    company: 'Meta',
    profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b2c5?w=150&h=150&fit=crop&crop=face',
    isOnline: true
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text' as const
    }

    setMessages(prev => [...prev, newMessage])
    setMessage('')
  }

  const handleScheduleMeeting = () => {
    const meetingMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      content: 'Let\'s schedule a 30-minute chat during the networking lunch',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'meeting_request' as const
    }
    setMessages(prev => [...prev, meetingMessage])
  }

  const handleShareCard = () => {
    const cardMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      content: 'Here\'s my business card!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'card_share' as const
    }
    setMessages(prev => [...prev, cardMessage])
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Chat Header */}
      <div className="bg-surface border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser.profilePhoto} alt={otherUser.name} />
                <AvatarFallback>{otherUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              {otherUser.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success border-2 border-surface rounded-full" />
              )}
            </div>

            <div>
              <h3 className="font-medium text-foreground">{otherUser.name}</h3>
              <p className="text-sm text-text-secondary">
                {otherUser.title} at {otherUser.company}
              </p>
            </div>

            {otherUser.isOnline && (
              <Badge variant="outline" className="text-xs">
                <div className="w-2 h-2 bg-success rounded-full mr-1" />
                Online
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="p-2">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Video className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShareCard}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Share Business Card
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleScheduleMeeting}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md ${msg.senderId === 'me' ? 'order-1' : 'order-2'}`}>
              {msg.type === 'text' && (
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    msg.senderId === 'me'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              )}

              {msg.type === 'card_share' && (
                <Card className="p-3 bg-primary-light border border-primary/20">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Business Card Shared</span>
                  </div>
                  <p className="text-xs text-primary/70 mt-1">{msg.content}</p>
                </Card>
              )}

              {msg.type === 'meeting_request' && (
                <Card className="p-3 bg-info/10 border border-info/20">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-info" />
                    <span className="text-sm font-medium text-info">Meeting Request</span>
                  </div>
                  <p className="text-xs text-info/70 mt-1">{msg.content}</p>
                  <div className="flex space-x-2 mt-2">
                    <Button size="sm" variant="outline" className="text-xs h-6">
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-6">
                      Propose Alternative
                    </Button>
                  </div>
                </Card>
              )}

              <div className={`text-xs text-text-tertiary mt-1 ${
                msg.senderId === 'me' ? 'text-right' : 'text-left'
              }`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 bg-muted/30">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareCard}
            className="text-xs gap-1"
          >
            <CreditCard className="h-3 w-3" />
            Share Card
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleScheduleMeeting}
            className="text-xs gap-1"
          >
            <Calendar className="h-3 w-3" />
            Schedule Meet
          </Button>
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-surface border-t border-border p-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="p-2">
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-2"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}