import React, { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Settings, 
  MoreHorizontal, 
  Plus, 
  MessageCircle, 
  Calendar,
  Mail,
  Phone,
  TrendingUp,
  Users,
  Target,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  ExternalLink,
  Zap,
  Sparkles,
  Bot,
  Search,
  Paperclip,
  Smile,
  ArrowLeft
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'

interface User {
  id: string
  email: string
  name: string
}

interface AIAssistantProps {
  user: User
  onClose: () => void
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatHistory {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  isActive?: boolean
}

export function AIAssistant({ user, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m your HeyLeo AI Assistant. I can help you analyze your card performance, generate insights from your contacts, and optimize your networking strategy. What would you like to know?',
      timestamp: new Date()
    }
  ])
  
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [activeChat, setActiveChat] = useState<string>('current')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock chat history data
  const [chatHistory] = useState<ChatHistory[]>([
    {
      id: 'current',
      title: 'Current Chat',
      lastMessage: 'Hi! I\'m your HeyLeo AI Assistant...',
      timestamp: new Date(),
      isActive: true
    },
    {
      id: '1',
      title: 'Who are my hottest leads?',
      lastMessage: 'Based on your data, here are your top 5 prospects...',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: '2',
      title: 'Card performance analysis',
      lastMessage: 'Your Executive card is performing 23% better...',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      id: '3',
      title: 'Weekly performance review',
      lastMessage: 'This week you gained 12 new contacts...',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    }
  ])

  // Mock integration status
  const [integrations] = useState({
    gmail: {
      connected: true,
      email: 'demo@heyleo.ai',
      status: 'active'
    },
    calendar: {
      connected: false,
      email: '',
      status: 'disconnected'
    }
  })

  // Mock AI usage stats
  const [aiStats] = useState({
    creditsUsed: 153,
    creditsTotal: 1000,
    resetsIn: 12 // days
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Based on your card analytics, I can see some interesting patterns. Your Executive card has a 15% higher conversion rate than your other cards.',
        'I\'ve analyzed your recent contacts and identified 3 high-potential leads who haven\'t been contacted in the last 30 days.',
        'Your networking activity has increased 23% this month! The Creative Professional template is performing particularly well.',
        'I notice you have several contacts from the tech industry. Would you like me to suggest some personalized follow-up strategies?',
        'Your AI assistant has processed 847 interactions this month. Here are the key insights from your networking data.'
      ]

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const groupChatsByDate = (chats: ChatHistory[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    return {
      today: chats.filter(chat => chat.timestamp >= today),
      yesterday: chats.filter(chat => chat.timestamp >= yesterday && chat.timestamp < today),
      lastWeek: chats.filter(chat => chat.timestamp >= lastWeek && chat.timestamp < yesterday),
      older: chats.filter(chat => chat.timestamp < lastWeek)
    }
  }

  const handleStartNewChat = () => {
    setActiveChat('new-' + Date.now())
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: 'Hi! I\'m your HeyLeo AI Assistant. I can help you analyze your card performance, generate insights from your contacts, and optimize your networking strategy. What would you like to know?',
        timestamp: new Date()
      }
    ])
  }

  const groupedChats = groupChatsByDate(chatHistory)

  return (
    <div className="h-screen bg-background flex relative">
      {/* Settings Panel Overlay - Now slides from RIGHT */}
      {showSettings && (
        <>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setShowSettings(false)}
          />
          
          {/* Settings Panel - Changed to slide from right */}
          <div className="absolute right-0 top-0 h-full w-80 bg-card border-l border-border z-50 animate-slide-in-right shadow-xl">
            {/* Settings Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div>
                  <h2 className="font-semibold text-foreground">AI Assistant Settings</h2>
                  <p className="text-sm text-muted-foreground">Manage connections and preferences</p>
                </div>
              </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Gmail Integration */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Gmail Integration</h3>
                    <p className="text-sm text-muted-foreground">Connect your email for smart insights</p>
                  </div>
                </div>
                
                <Card className="p-4 bg-card border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium text-success">Connected</span>
                    </div>
                  </div>
                  <div className="text-sm text-foreground font-medium mb-4">
                    {integrations.gmail.email}
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Disconnect Gmail
                  </Button>
                </Card>
              </div>

              {/* Calendar Integration */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Google Calendar</h3>
                    <p className="text-sm text-muted-foreground">Sync meetings and availability</p>
                  </div>
                </div>
                
                <Card className="p-4 bg-card border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Not Connected</span>
                    </div>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Connect Calendar
                  </Button>
                </Card>
              </div>

              {/* AI Credits */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">AI Credits</h3>
                    <p className="text-sm text-muted-foreground">Your monthly usage allowance</p>
                  </div>
                </div>
                
                <Card className="p-4 bg-card border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Usage this month:</span>
                    <span className="text-sm font-medium text-foreground">
                      {aiStats.creditsUsed}/{aiStats.creditsTotal}
                    </span>
                  </div>
                  <Progress 
                    value={(aiStats.creditsUsed / aiStats.creditsTotal) * 100} 
                    className="mb-3"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Resets in {aiStats.resetsIn} days</span>
                    <span>{Math.round((aiStats.creditsUsed / aiStats.creditsTotal) * 100)}% used</span>
                  </div>
                </Card>
              </div>

              {/* Preferences Section */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Settings className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Preferences</h3>
                    <p className="text-sm text-muted-foreground">Customize your AI experience</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-foreground">Smart notifications</div>
                      <div className="text-xs text-muted-foreground">Get notified about important insights</div>
                    </div>
                    <div className="w-10 h-6 bg-primary rounded-full relative">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-foreground">Auto-suggestions</div>
                      <div className="text-xs text-muted-foreground">Show conversation starters</div>
                    </div>
                    <div className="w-10 h-6 bg-primary rounded-full relative">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Chat History Sidebar */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Chats</h2>
            <Button 
              onClick={handleStartNewChat}
              size="sm" 
              className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {/* Today */}
          {groupedChats.today.length > 0 && (
            <div className="p-3">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-3">Today</div>
              <div className="space-y-1">
                {groupedChats.today.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setActiveChat(chat.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      chat.isActive || activeChat === chat.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <h4 className="text-sm font-medium text-foreground truncate mb-1">
                      {chat.title}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yesterday */}
          {groupedChats.yesterday.length > 0 && (
            <div className="p-3">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-3">Yesterday</div>
              <div className="space-y-1">
                {groupedChats.yesterday.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setActiveChat(chat.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      activeChat === chat.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <h4 className="text-sm font-medium text-foreground truncate mb-1">
                      {chat.title}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last 7 days */}
          {groupedChats.lastWeek.length > 0 && (
            <div className="p-3">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-3">Last 7 days</div>
              <div className="space-y-1">
                {groupedChats.lastWeek.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setActiveChat(chat.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      activeChat === chat.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <h4 className="text-sm font-medium text-foreground truncate mb-1">
                      {chat.title}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area - Apple Style */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header - Minimal Apple Style */}
        <div className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">AI Assistant</h3>
              <div className="flex items-center space-x-3 mt-0.5">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3 text-success" />
                  <span className="text-xs text-muted-foreground">Gmail connected</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-error/10 hover:text-error transition-colors duration-200"
              onClick={onClose}
              title="Close AI Assistant"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                {message.type === 'assistant' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">🦁 Leo</span>
                  </div>
                )}
                
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-4'
                      : 'bg-card border border-border mr-4'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                
                <div className={`mt-1 text-xs text-muted-foreground px-2 ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%]">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">HeyLeo AI</span>
                </div>
                <div className="bg-card border border-border px-4 py-3 rounded-2xl shadow-sm mr-4">
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

        {/* Input Area - Apple Style */}
        <div className="bg-card/80 backdrop-blur-sm border-t border-border p-4">
          {/* Quick Actions */}
          <div className="flex space-x-2 mb-3 overflow-x-auto pb-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue('Who are my hottest leads?')}
              className="text-xs whitespace-nowrap hover:border-primary/20 hover:bg-primary/5"
            >
              <Target className="h-3 w-3 mr-1" />
              Hot Leads
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue('Analyze my card performance')}
              className="text-xs whitespace-nowrap hover:border-primary/20 hover:bg-primary/5"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Performance
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue('Suggest follow-up actions')}
              className="text-xs whitespace-nowrap hover:border-primary/20 hover:bg-primary/5"
            >
              <Users className="h-3 w-3 mr-1" />
              Follow-ups
            </Button>
          </div>

          {/* Message Input */}
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your networking..."
                className="bg-card border-border rounded-full pl-4 pr-12 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none min-h-[44px]"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-accent"
                >
                  <Smile className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-full h-11 w-11 p-0 shadow-md hover:shadow-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}