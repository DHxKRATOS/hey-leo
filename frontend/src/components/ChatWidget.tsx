import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Avatar } from './ui/avatar'

interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

interface ChatWidgetProps {
  cardOwner: {
    name: string
    title?: string
    company?: string
    avatar?: string
  }
  variant?: 'floating' | 'inline' | 'modal'
  size?: 'sm' | 'md' | 'lg'
  theme?: 'light' | 'dark' | 'auto'
  position?: 'bottom-right' | 'bottom-left' | 'center'
  isPublicCard?: boolean
  initialOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  className?: string
}

export function ChatWidget({ 
  cardOwner, 
  variant = 'floating', 
  size = 'md',
  theme = 'auto',
  position = 'bottom-right',
  isPublicCard = false,
  initialOpen = false,
  onToggle,
  className = ''
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        content: `Hi! I'm ${cardOwner.name}'s AI assistant. ${cardOwner.title ? `${cardOwner.name} is ${cardOwner.title}${cardOwner.company ? ` at ${cardOwner.company}` : ''}. ` : ''}How can I help you today?`,
        sender: 'assistant',
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length, cardOwner])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response (in real app, this would call your AI service)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputValue, cardOwner),
        sender: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000) // Random delay for realism
  }

  const generateAIResponse = (userInput: string, owner: any): string => {
    const input = userInput.toLowerCase()
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return `Hello! Nice to meet you. I can help you learn more about ${owner.name} and their work${owner.company ? ` at ${owner.company}` : ''}. What would you like to know?`
    }
    
    if (input.includes('contact') || input.includes('reach') || input.includes('email') || input.includes('phone')) {
      return `You can connect with ${owner.name} through the contact options on their card. Would you like me to help you schedule a meeting or learn more about their expertise?`
    }
    
    if (input.includes('schedule') || input.includes('meeting') || input.includes('call') || input.includes('appointment')) {
      return `I'd be happy to help you schedule time with ${owner.name}. You can use the calendar link on their card to book a convenient time, or I can provide more information about their availability and expertise areas.`
    }
    
    if (input.includes('experience') || input.includes('background') || input.includes('work') || input.includes('career')) {
      return `${owner.name} has extensive experience in their field${owner.title ? ` as ${owner.title}` : ''}${owner.company ? ` at ${owner.company}` : ''}. They're passionate about helping others and building meaningful professional connections. What specific area interests you most?`
    }
    
    if (input.includes('services') || input.includes('help') || input.includes('offer') || input.includes('expertise')) {
      return `${owner.name} offers professional expertise and is always excited to connect with like-minded individuals. They can provide insights, collaboration opportunities, and valuable industry connections. How can they best assist you?`
    }
    
    if (input.includes('company') || input.includes('business') || input.includes('organization')) {
      return `${owner.company ? `${owner.name} works at ${owner.company}, where they` : `${owner.name}`} bring${owner.company ? '' : 's'} valuable expertise to their role${owner.title ? ` as ${owner.title}` : ''}. Would you like to know more about their work or discuss potential collaboration opportunities?`
    }
    
    // Default response
    return `That's a great question! ${owner.name} would be the best person to provide detailed insights about that. I'd recommend reaching out directly through their contact information on the card, or you can ask me anything else about ${owner.name}'s background and expertise.`
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleChat = () => {
    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)
    if (newIsOpen) {
      setIsMinimized(false)
    }
    onToggle?.(newIsOpen)
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  // Floating Chat Button
  if (variant === 'floating' && !isOpen) {
    return (
      <div className={`fixed ${position === 'bottom-right' ? 'bottom-6 right-6' : position === 'bottom-left' ? 'bottom-6 left-6' : 'bottom-6 right-1/2 transform translate-x-1/2'} z-50 ${className}`}>
        <Button
          onClick={toggleChat}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          aria-label={`Chat with ${cardOwner.name}'s AI assistant`}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        
        {/* Tooltip */}
        <div className="absolute bottom-16 right-0 mb-2 px-3 py-2 bg-card text-card-foreground rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
          <div className="text-sm font-medium">Chat with {cardOwner.name}</div>
          <div className="text-xs text-muted-foreground">Ask me anything!</div>
        </div>
      </div>
    )
  }

  // Chat Window
  const chatWindow = (
    <Card className={`
      ${variant === 'floating' ? `fixed ${position === 'bottom-right' ? 'bottom-6 right-6' : position === 'bottom-left' ? 'bottom-6 left-6' : 'bottom-6 right-1/2 transform translate-x-1/2'} z-50` : ''}
      ${variant === 'inline' ? 'relative' : ''}
      ${size === 'sm' ? 'w-80 h-96' : size === 'md' ? 'w-96 h-[500px]' : 'w-[450px] h-[600px]'}
      ${isMinimized ? 'h-16' : ''}
      bg-card border border-border shadow-2xl transition-all duration-300
      ${className}
    `}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-8 w-8">
              {cardOwner.avatar ? (
                <img src={cardOwner.avatar} alt={cardOwner.name} />
              ) : (
                <div className="bg-primary text-primary-foreground flex items-center justify-center h-full w-full">
                  <Bot className="h-4 w-4" />
                </div>
              )}
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-foreground truncate">
              {cardOwner.name}'s AI Assistant
            </div>
            <div className="text-xs text-muted-foreground truncate">
              Online • Responds instantly
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMinimize}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleChat}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    {message.sender === 'assistant' ? (
                      <div className="bg-primary text-primary-foreground flex items-center justify-center h-full w-full">
                        <Bot className="h-3 w-3" />
                      </div>
                    ) : (
                      <div className="bg-secondary text-secondary-foreground flex items-center justify-center h-full w-full">
                        <User className="h-3 w-3" />
                      </div>
                    )}
                  </Avatar>
                  <div
                    className={`px-3 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-card-foreground border border-border'
                    }`}
                  >
                    <div className="text-sm leading-relaxed">{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.sender === 'user' 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[85%]">
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <div className="bg-primary text-primary-foreground flex items-center justify-center h-full w-full">
                      <Bot className="h-3 w-3" />
                    </div>
                  </Avatar>
                  <div className="px-3 py-2 rounded-lg bg-card text-card-foreground border border-border">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-card rounded-b-lg">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask ${cardOwner.name}'s AI assistant...`}
                className="flex-1 text-sm"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                size="sm"
                className="h-9 w-9 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Powered by Leo AI • Press Enter to send
            </div>
          </div>
        </>
      )}
    </Card>
  )

  return chatWindow
}