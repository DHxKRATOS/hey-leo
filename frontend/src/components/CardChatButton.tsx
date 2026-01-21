import React, { useState } from 'react'
import { motion } from 'motion/react'
import { MessageCircle, Sparkles, Send, Mic, MicOff, User, Bot, X, Minimize2, Maximize2 } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Textarea } from './ui/textarea'
import { Avatar } from './ui/avatar'
import { ScrollArea } from './ui/scroll-area'

interface CardChatButtonProps {
  cardOwner: {
    name: string
    title?: string
    company?: string
    avatar?: string
  }
  variant?: 'primary' | 'minimal' | 'floating'
  size?: 'sm' | 'md' | 'lg'
  position?: 'inline' | 'floating'
  theme?: 'light' | 'dark' | 'auto'
  showLabel?: boolean
  className?: string
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  intent?: string
}

export function CardChatButton({
  cardOwner,
  variant = 'primary',
  size = 'md',
  position = 'inline',
  theme = 'auto',
  showLabel = true,
  className = ''
}: CardChatButtonProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hi! I'm ${cardOwner.name}'s AI assistant. I can help you connect with them, schedule meetings, or answer questions about their work. What would you like to know?`,
      timestamp: new Date(),
      intent: 'welcome'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  // AI responses based on common business card interactions
  const aiResponses = {
    contact: [
      "I'd be happy to help you connect with {name}! You can reach them via the contact options on their card, or I can help schedule a meeting.",
      "Let me help you get in touch with {name}. What's the best way for them to contact you?",
      "I can facilitate an introduction! What would you like to discuss with {name}?"
    ],
    meeting: [
      "I'd love to help schedule a meeting with {name}! What time works best for you?",
      "Let me check {name}'s availability. What type of meeting are you interested in?",
      "I can help coordinate a meeting. Would you prefer a video call, phone call, or in-person meeting?"
    ],
    services: [
      "I can tell you more about {name}'s expertise in {title}. What specific services are you interested in?",
      "As a {title} at {company}, {name} specializes in several areas. What would you like to know more about?",
      "I'd be happy to share details about how {name} can help your business. What are your main objectives?"
    ],
    general: [
      "That's a great question! Let me provide you with some information about {name}'s background and expertise.",
      "I'm here to help you learn more about {name} and their work. What specific area interests you most?",
      "I can share insights about {name}'s experience and how they might be able to assist you."
    ]
  }

  const determineIntent = (message: string): string => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('contact') || lowerMessage.includes('reach') || lowerMessage.includes('email') || lowerMessage.includes('phone')) {
      return 'contact'
    }
    if (lowerMessage.includes('meeting') || lowerMessage.includes('schedule') || lowerMessage.includes('appointment') || lowerMessage.includes('call')) {
      return 'meeting'
    }
    if (lowerMessage.includes('service') || lowerMessage.includes('work') || lowerMessage.includes('help') || lowerMessage.includes('consulting')) {
      return 'services'
    }
    return 'general'
  }

  const generateAIResponse = (userMessage: string): string => {
    const intent = determineIntent(userMessage)
    const responses = aiResponses[intent] || aiResponses.general
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    
    return randomResponse
      .replace('{name}', cardOwner.name)
      .replace('{title}', cardOwner.title || 'professional')
      .replace('{company}', cardOwner.company || 'their organization')
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate AI processing delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(inputMessage),
        timestamp: new Date(),
        intent: determineIntent(inputMessage)
      }
      
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 px-3 text-sm'
      case 'lg':
        return 'h-12 px-6 text-base'
      default:
        return 'h-10 px-4 text-sm'
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-background/80 border border-border text-foreground hover:bg-background'
      case 'floating':
        return 'bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg'
      default:
        return 'bg-primary hover:bg-primary-hover text-primary-foreground'
    }
  }

  // Main chat button
  const ChatButton = () => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      <Button
        onClick={() => setIsChatOpen(true)}
        className={`${getSizeClasses()} ${getVariantClasses()} rounded-2xl relative overflow-hidden`}
      >
        <div className="flex items-center space-x-2">
          <div className="relative">
            <MessageCircle className="w-4 h-4" />
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          {showLabel && <span>Chat with AI</span>}
        </div>
        
        {/* Sparkle effect */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <Sparkles className="absolute top-1 right-2 w-3 h-3 text-white/50" />
        </motion.div>
      </Button>
    </motion.div>
  )

  // Chat interface
  const ChatInterface = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: isMinimized ? 0.3 : 1, 
        y: 0 
      }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className={`fixed ${
        position === 'floating' 
          ? 'bottom-20 right-6 w-80 h-96' 
          : 'inset-4 max-w-md mx-auto'
      } z-50`}
    >
      <Card className="h-full flex flex-col bg-surface/95 backdrop-blur-xl border shadow-2xl rounded-3xl overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-primary to-primary-hover p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                {cardOwner.avatar ? (
                  <img
                    src={cardOwner.avatar}
                    alt={cardOwner.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{cardOwner.name}'s AI Assistant</h3>
                <p className="text-xs text-white/80">Online • Ready to help</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 p-1 h-auto"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsChatOpen(false)}
                className="text-white hover:bg-white/20 p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4 space-y-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex space-x-2 max-w-xs ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center">
                        {message.type === 'user' ? (
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className={`rounded-2xl p-3 text-sm ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}>
                        <p className="leading-relaxed">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex space-x-2 max-w-xs">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-muted rounded-2xl p-3">
                        <div className="flex space-x-1">
                          <motion.div
                            className="w-2 h-2 bg-muted-foreground rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-muted-foreground rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-muted-foreground rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="border-t border-border p-4">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about scheduling, services, or connecting..."
                    className="resize-none border-border rounded-2xl bg-background pr-12"
                    rows={1}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsVoiceMode(!isVoiceMode)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-auto"
                  >
                    {isVoiceMode ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="rounded-2xl bg-primary hover:bg-primary-hover"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex space-x-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInputMessage("I'd like to schedule a meeting")}
                  className="text-xs rounded-full"
                >
                  Schedule Meeting
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInputMessage("What services do you offer?")}
                  className="text-xs rounded-full"
                >
                  Learn More
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInputMessage("How can I contact them?")}
                  className="text-xs rounded-full"
                >
                  Contact Info
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </motion.div>
  )

  return (
    <>
      <ChatButton />
      {isChatOpen && <ChatInterface />}
    </>
  )
}