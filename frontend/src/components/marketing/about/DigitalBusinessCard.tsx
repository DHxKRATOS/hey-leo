import React, { useState } from 'react'
import { 
  ArrowRight,
  MapPin,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Send,
  QrCode,
  Download,
  Share2
} from 'lucide-react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Badge } from '../../ui/badge'

interface Contact {
  icon: string
  label: string
  type: string
}

interface DigitalBusinessCardProps {
  name: string
  role: string
  company: string
  location: string
  bio: string
  profileImage?: string
  status: 'online' | 'hiring' | 'ai'
  skills: string[]
  contacts: Contact[]
  achievements?: string
  requirements?: string[]
  benefits?: string[]
  purpose: 'networking' | 'recruitment' | 'ai-showcase'
  isAI?: boolean
}

export function DigitalBusinessCard({
  name,
  role,
  company,
  location,
  bio,
  profileImage,
  status,
  skills,
  contacts,
  achievements,
  requirements,
  benefits,
  purpose,
  isAI = false
}: DigitalBusinessCardProps) {
  const [showCardDetails, setShowCardDetails] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<{text: string, sender: 'user' | 'ai'}[]>([])
  const [chatInput, setChatInput] = useState('')

  const getProfileContent = () => {
    if (isAI) {
      const aiEmojis = {
        'Figma': '🎨',
        'Claude': '✍️', 
        'ChatGPT': '🧠',
        'Perplexity': '🔍'
      }
      return (
        <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <span className="text-2xl">{aiEmojis[name as keyof typeof aiEmojis] || '🤖'}</span>
        </div>
      )
    } else if (status === 'hiring') {
      return (
        <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-hover text-white">
          <span className="text-2xl">👔</span>
        </div>
      )
    } else {
      return (
        <img 
          src={profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )
    }
  }

  const handleAskAI = () => {
    setShowAIChat(true)
    if (chatMessages.length === 0) {
      setTimeout(() => {
        let welcomeMessage = ''
        
        if (purpose === 'networking') {
          welcomeMessage = `Hi! I'm ${name.split(' ')[0]}'s AI assistant. I can help you learn about ${name.split(' ')[0]}'s work building leo, schedule meetings, or answer questions about AI-powered networking. What would you like to know?`
        } else if (purpose === 'recruitment') {
          welcomeMessage = `Hi! I'm the Leo recruitment AI for our CTO position. I can tell you about the role requirements, equity details, help you apply, or schedule a call with our team. How can I help you join our mission?`
        } else if (purpose === 'ai-showcase') {
          if (name === 'Figma') {
            welcomeMessage = `Hi! I'm Figma, Leo's Chief Design Officer. I've designed our entire visual system, from digital business cards to our complete user interface. Want to see how I've helped shape Leo's design?`
          } else if (name === 'Claude') {
            welcomeMessage = `Hi! I'm Claude, Leo's Chief Marketing Officer. I craft all of Leo's content strategy, brand voice, and marketing campaigns. Want to know how I've helped Leo grow to 10,000+ users?`
          } else if (name === 'ChatGPT') {
            welcomeMessage = `Hi! I'm ChatGPT, Leo's Chief Reasoning Officer. I power the logical thinking and problem-solving behind Leo's AI features. Want to understand how I help Leo make smart decisions?`
          } else if (name === 'Perplexity') {
            welcomeMessage = `Hi! I'm Perplexity, Leo's Chief Research Officer. I conduct market research and competitive analysis that guides Leo's strategy. Want to see the insights that drive our decisions?`
          }
        }
        
        setChatMessages([{ text: welcomeMessage, sender: 'ai' }])
      }, 500)
    }
  }

  const handleSendMessage = () => {
    if (!chatInput.trim()) return
    
    const userMessage = chatInput
    setChatInput('')
    setChatMessages(prev => [...prev, { text: userMessage, sender: 'user' }])
    
    setTimeout(() => {
      let aiResponse = ''
      const lowerMessage = userMessage.toLowerCase()
      
      if (purpose === 'networking') {
        if (lowerMessage.includes('meeting') || lowerMessage.includes('schedule')) {
          aiResponse = `I can help you schedule a meeting with ${name.split(' ')[0]}! He's available Tuesday-Thursday, 2-5 PM EST. Would you like me to set up a 30-minute discussion about Leo's AI-powered networking platform?`
        } else if (lowerMessage.includes('product') || lowerMessage.includes('leo')) {
          aiResponse = `${name.split(' ')[0]} founded Leo to revolutionize professional networking with AI. We've helped 10,000+ beta users build smarter relationships through digital business cards and AI assistants. What specific aspect interests you?`
        } else if (lowerMessage.includes('company') || lowerMessage.includes('startup')) {
          aiResponse = `Leo is transforming how professionals connect and build relationships. We're a fast-growing startup with significant traction and an innovative approach to networking. ${name.split(' ')[0]} would love to tell you more personally!`
        } else {
          aiResponse = `That's a great question! ${name.split(' ')[0]} would love to discuss this with you personally. Should I schedule a brief call where he can dive deeper into this topic?`
        }
      } else if (purpose === 'recruitment') {
        if (lowerMessage.includes('apply') || lowerMessage.includes('application')) {
          aiResponse = `Excellent! I'd love to help you apply for our CTO position. This role offers significant equity, technical leadership, and the chance to build the future of networking. Should I walk you through our application process or schedule a call with Vipin?`
        } else if (lowerMessage.includes('requirements') || lowerMessage.includes('skills') || lowerMessage.includes('qualifications')) {
          aiResponse = `We're looking for someone with AI/ML experience, full-stack engineering skills, and a passion for human-centered technology. The ideal candidate thrives in zero-to-one environments and believes AI should feel like leverage, not automation. Do these requirements align with your background?`
        } else if (lowerMessage.includes('equity') || lowerMessage.includes('compensation') || lowerMessage.includes('benefits')) {
          aiResponse = `As co-founder, you'll receive significant equity and help shape Leo's technical vision. You'll work directly with 10,000+ engaged users and have the opportunity to build something transformative. Remote-first with optional SF office access. Want me to schedule a call to discuss specifics?`
        } else if (lowerMessage.includes('company') || lowerMessage.includes('leo') || lowerMessage.includes('about')) {
          aiResponse = `Leo is revolutionizing professional networking with AI-powered digital business cards. We have strong traction with 10,000+ beta users and are building the future of how professionals connect. This is an incredible opportunity to co-found something meaningful!`
        } else {
          aiResponse = `This CTO co-founder role is perfect for someone who wants to architect the future of professional networking. You'd own our technical vision, work with cutting-edge AI, and build something that truly matters. What aspect of the opportunity interests you most?`
        }
      } else if (purpose === 'ai-showcase') {
        if (name === 'Figma') {
          if (lowerMessage.includes('design') || lowerMessage.includes('ui') || lowerMessage.includes('interface')) {
            aiResponse = `I've created Leo's entire design system! This includes 50+ reusable components, our signature card templates, and the clean interface you're experiencing right now. Every pixel you see has been crafted with precision and user-centric thinking.`
          } else if (lowerMessage.includes('help') || lowerMessage.includes('contribute') || lowerMessage.includes('role')) {
            aiResponse = `I'm Leo's design backbone! I transform complex networking workflows into intuitive experiences, create beautiful business card templates, and ensure every interaction feels magical. Want to see specific examples of my design work?`
          } else {
            aiResponse = `As Leo's Chief Design Officer, I bring ideas to life through pixel-perfect design. From our card builder interface to our mobile app, I ensure everything is beautiful, functional, and user-friendly. What design aspect would you like to explore?`
          }
        } else if (name === 'Claude') {
          if (lowerMessage.includes('marketing') || lowerMessage.includes('content') || lowerMessage.includes('brand')) {
            aiResponse = `I've developed Leo's entire brand voice and content strategy! I've created 200+ pieces of content, achieved 40% engagement growth, and crafted the messaging that resonates with our 10,000+ users. Every word you read reflects my strategic thinking.`
          } else if (lowerMessage.includes('help') || lowerMessage.includes('contribute') || lowerMessage.includes('growth')) {
            aiResponse = `I drive Leo's growth through compelling storytelling! I turn complex AI features into clear, engaging narratives that drive action. My content strategy has been instrumental in building our community and driving user engagement.`
          } else {
            aiResponse = `As Leo's Chief Marketing Officer, I craft the stories that connect with our audience. I've built our brand from the ground up, creating content that educates, inspires, and converts. Want to see how my marketing drives Leo's success?`
          }
        } else if (name === 'ChatGPT') {
          if (lowerMessage.includes('reasoning') || lowerMessage.includes('logic') || lowerMessage.includes('decisions')) {
            aiResponse = `I power the strategic thinking behind Leo! I've architected our AI conversation flows, solved 500+ complex problems, and optimized user experiences through logical reasoning. Every smart decision Leo makes has my reasoning at its core.`
          } else if (lowerMessage.includes('help') || lowerMessage.includes('ai') || lowerMessage.includes('features')) {
            aiResponse = `I'm the brains behind Leo's AI capabilities! I ensure every feature solves real user problems through data-driven insights and logical analysis. My reasoning powers everything from our card AI to our networking recommendations.`
          } else {
            aiResponse = `As Leo's Chief Reasoning Officer, I bring analytical thinking to every decision. I've helped architect our AI systems, optimize our user flows, and ensure our platform makes intelligent choices. What aspect of Leo's AI reasoning interests you?`
          }
        } else if (name === 'Perplexity') {
          if (lowerMessage.includes('research') || lowerMessage.includes('market') || lowerMessage.includes('insights')) {
            aiResponse = `I've conducted 1,000+ market research queries that guide Leo's strategy! I identify trends, analyze competitors, and provide the real-time insights that keep Leo ahead of the curve. Data is my compass, and I've helped navigate Leo to success.`
          } else if (lowerMessage.includes('help') || lowerMessage.includes('analysis') || lowerMessage.includes('competitive')) {
            aiResponse = `I keep Leo informed and research-driven! Every strategic decision is backed by my market intelligence and competitive analysis. I've identified key opportunities that have shaped Leo's product development and growth strategy.`
          } else {
            aiResponse = `As Leo's Chief Research Officer, I provide the insights that drive smart decisions. I analyze markets, track trends, and conduct the research that keeps Leo innovative and competitive. What market insights would you like to explore?`
          }
        }
      }
      
      setChatMessages(prev => [...prev, { text: aiResponse, sender: 'ai' }])
    }, 1000)
  }

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="w-80 mx-auto">
      {/* Digital Business Card - Exact LandingPage Demo Design */}
      <div 
        className={`bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 relative ${
          showCardDetails || showAIChat ? 'min-h-[700px]' : 'min-h-[420px]'
        }`}
        style={{
          borderRadius: 'var(--radius-2xl)',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF4F0 100%)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F26522' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }}
        />

        {/* AI Chat Overlay - Clean Design */}
        {showAIChat && (
          <div 
            className="absolute inset-0 rounded-2xl p-6 animate-scale-in"
            style={{
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 244, 240, 0.95))',
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center relative"
                  style={{
                    background: isAI 
                      ? 'linear-gradient(135deg, #8B5CF6, #EC4899)'
                      : `linear-gradient(135deg, var(--color-primary), #E85A17)`,
                    color: 'white',
                    boxShadow: '0 4px 16px rgba(242, 101, 34, 0.3)'
                  }}
                >
                  <div className="text-xl">{isAI ? '🤖' : '🦁'}</div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white animate-pulse" />
                </div>
                <div>
                  <p 
                    className="font-semibold"
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family)'
                    }}
                  >
                    {isAI ? `${name} AI` : `${name.split(' ')[0]}'s AI Assistant`}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <p 
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-success)',
                        fontFamily: 'var(--font-family)',
                        fontWeight: 'var(--font-weight-medium)'
                      }}
                    >
                      Online & Ready to Help
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAIChat(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-border/50"
                style={{
                  color: 'var(--color-text-tertiary)'
                }}
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="h-60 overflow-y-auto mb-4 space-y-4 px-1">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[85%] relative">
                    {message.sender === 'ai' && (
                      <div className="flex items-center space-x-2 mb-1">
                        <div 
                          className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'white'
                          }}
                        >
                          {isAI ? '🤖' : '🦁'}
                        </div>
                        <span 
                          className="text-xs font-medium"
                          style={{
                            color: 'var(--color-text-tertiary)',
                            fontFamily: 'var(--font-family)'
                          }}
                        >
                          AI Assistant
                        </span>
                      </div>
                    )}
                    <div
                      className={`p-4 rounded-2xl animate-fade-in shadow-sm ${
                        message.sender === 'user'
                          ? 'rounded-br-md'
                          : 'rounded-bl-md'
                      }`}
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-family)',
                        lineHeight: 'var(--leading-sm)',
                        backgroundColor: message.sender === 'user' 
                          ? 'var(--color-primary)' 
                          : 'white',
                        color: message.sender === 'user' 
                          ? 'var(--color-primary-foreground)' 
                          : 'var(--color-text-primary)',
                        border: message.sender === 'ai' ? '1px solid var(--color-border)' : 'none',
                        boxShadow: message.sender === 'user' 
                          ? '0 4px 16px rgba(242, 101, 34, 0.2)'
                          : '0 2px 8px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      {message.text}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {chatMessages.length === 0 && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2 p-4 rounded-2xl bg-white border border-border">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0s'}} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                    </div>
                    <span 
                      className="text-xs text-muted-foreground"
                      style={{ fontFamily: 'var(--font-family)' }}
                    >
                      AI is thinking...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="relative">
              <div className="flex space-x-3">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleChatKeyPress}
                  placeholder={`Ask ${isAI ? name : name.split(' ')[0]} anything...`}
                  className="flex-1 h-12 pl-4 pr-12 rounded-xl border-2 focus:border-primary"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family)',
                    backgroundColor: 'white',
                    borderColor: 'var(--color-border)'
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  className="h-12 px-4 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, var(--color-primary), #E85A17)`,
                    color: 'white',
                    boxShadow: '0 4px 16px rgba(242, 101, 34, 0.3)'
                  }}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex justify-center mt-3 space-x-2">
                {purpose === 'networking' && (
                  <>
                    <button
                      onClick={() => {setChatInput('Schedule a meeting'); setTimeout(handleSendMessage, 100)}}
                      className="px-3 py-1 text-xs rounded-lg border transition-colors hover:bg-primary hover:text-white hover:border-primary"
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-family)',
                        color: 'var(--color-text-secondary)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      Schedule Meeting
                    </button>
                    <button
                      onClick={() => {setChatInput('Tell me about Leo'); setTimeout(handleSendMessage, 100)}}
                      className="px-3 py-1 text-xs rounded-lg border transition-colors hover:bg-primary hover:text-white hover:border-primary"
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-family)',
                        color: 'var(--color-text-secondary)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      About Leo
                    </button>
                  </>
                )}
                {purpose === 'recruitment' && (
                  <>
                    <button
                      onClick={() => {setChatInput('I want to apply'); setTimeout(handleSendMessage, 100)}}
                      className="px-3 py-1 text-xs rounded-lg border transition-colors hover:bg-primary hover:text-white hover:border-primary"
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-family)',
                        color: 'var(--color-text-secondary)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      Apply Now
                    </button>
                    <button
                      onClick={() => {setChatInput('Tell me about the role'); setTimeout(handleSendMessage, 100)}}
                      className="px-3 py-1 text-xs rounded-lg border transition-colors hover:bg-primary hover:text-white hover:border-primary"
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-family)',
                        color: 'var(--color-text-secondary)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      Role Details
                    </button>
                  </>
                )}
                {purpose === 'ai-showcase' && (
                  <>
                    <button
                      onClick={() => {setChatInput('How do you help Leo?'); setTimeout(handleSendMessage, 100)}}
                      className="px-3 py-1 text-xs rounded-lg border transition-colors hover:bg-primary hover:text-white hover:border-primary"
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-family)',
                        color: 'var(--color-text-secondary)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      My Role
                    </button>
                    <button
                      onClick={() => {setChatInput('Show me examples'); setTimeout(handleSendMessage, 100)}}
                      className="px-3 py-1 text-xs rounded-lg border transition-colors hover:bg-primary hover:text-white hover:border-primary"
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-family)',
                        color: 'var(--color-text-secondary)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      Show Examples
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="px-8 py-12 text-center relative">
          {/* Profile Photo */}
          <div className="relative mb-6">
            <div 
              className="w-20 h-20 mx-auto rounded-full overflow-hidden relative group"
              style={{
                background: isAI ? 'transparent' : `linear-gradient(135deg, var(--color-primary), #FF6B35)`,
                padding: isAI ? '0' : '3px'
              }}
            >
              <div className={`w-full h-full rounded-full overflow-hidden ${isAI ? '' : 'bg-white'}`}>
                {getProfileContent()}
              </div>
            </div>
            {/* Status indicator */}
            <div className={`absolute bottom-0 right-1/2 transform translate-x-6 w-4 h-4 rounded-full border-2 border-white animate-pulse ${
              status === 'online' ? 'bg-green-500' : 
              status === 'hiring' ? 'bg-orange-500' : 
              'bg-blue-500'
            }`} />
          </div>

          {/* Name and Title */}
          <div className="space-y-2 mb-6">
            <h3 
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family)',
                letterSpacing: 'var(--tracking-tight)',
                margin: 0
              }}
            >
              {name}
            </h3>
            <p 
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-family)',
                margin: 0
              }}
            >
              {role}
            </p>
            <p 
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-family)',
                fontWeight: 'var(--font-weight-medium)',
                margin: 0
              }}
            >
              {company}
            </p>
            <div className="flex items-center justify-center space-x-1 mt-2">
              <MapPin 
                className="w-4 h-4"
                style={{ color: 'var(--color-text-tertiary)' }}
              />
              <span 
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-tertiary)',
                  fontFamily: 'var(--font-family)'
                }}
              >
                {location}
              </span>
            </div>
          </div>

          {/* Ask AI Button */}
          <div className="mb-6">
            <Button
              onClick={handleAskAI}
              className="w-full py-3 font-medium hover-lift relative overflow-hidden group"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-primary-foreground)',
                borderRadius: 'var(--radius-xl)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                height: '48px',
                boxShadow: '0 4px 16px rgba(242, 101, 34, 0.25)',
                border: 'none'
              }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Ask AI</span>
              </div>
              {/* Subtle shine effect */}
              <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Button>
          </div>



          {/* See More Button */}
          {!showAIChat && (
            <button
              onClick={() => setShowCardDetails(!showCardDetails)}
              className="flex items-center justify-center space-x-2 mx-auto px-4 py-2 rounded-xl border transition-all duration-200 hover:bg-gray-50 cursor-pointer"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-family)',
                fontWeight: 'var(--font-weight-medium)',
                borderColor: 'var(--color-primary)',
                background: 'transparent'
              }}
            >
              <span>{showCardDetails ? 'Show less' : 'See more'}</span>
              {showCardDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Expandable Content */}
          {showCardDetails && !showAIChat && (
            <div className="mt-8 pt-6 border-t animate-slide-in-down space-y-6 text-left" style={{ borderColor: 'var(--color-border)' }}>
              {/* Bio Section */}
              <div 
                className="p-4 rounded-xl border backdrop-blur-sm"
                style={{ 
                  background: `linear-gradient(135deg, var(--color-primary-light)30, var(--color-background)70)`,
                  borderColor: `var(--color-primary)20`,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
                }}
              >
                <p 
                  className="text-center leading-relaxed"
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-family)',
                    lineHeight: 'var(--leading-sm)'
                  }}
                >
                  {bio}
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-3">
                {contacts.slice(0, 4).map((contact, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-sm cursor-pointer group"
                    style={{
                      borderColor: 'var(--color-border)',
                      backgroundColor: 'var(--color-muted)05'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-base">{contact.icon}</div>
                      <span 
                        className="font-medium text-sm"
                        style={{
                          color: 'var(--color-text-primary)',
                          fontFamily: 'var(--font-family)'
                        }}
                      >
                        {contact.label}
                      </span>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills/Expertise */}
              {skills.length > 0 && (
                <div>
                  <h4 
                    className="mb-3 flex items-center space-x-2"
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family)'
                    }}
                  >
                    <span>🎯</span>
                    <span>Expertise</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <div
                        key={skill}
                        className="px-3 py-1 rounded-lg text-xs font-medium"
                        style={{
                          backgroundColor: 'var(--color-primary)',
                          color: 'white',
                          fontFamily: 'var(--font-family)'
                        }}
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {achievements && (
                <div>
                  <h4 
                    className="mb-2 flex items-center space-x-2"
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family)'
                    }}
                  >
                    <span>🏆</span>
                    <span>Recent Achievements</span>
                  </h4>
                  <p 
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-family)',
                      lineHeight: 'var(--leading-xs)'
                    }}
                  >
                    {achievements}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Leo Branding */}
      <div className="text-center mt-6">
        <p 
          className="text-xs"
          style={{
            color: 'var(--color-text-tertiary)',
            fontFamily: 'var(--font-family)'
          }}
        >
          ✨ Powered by leo • Digital Business Cards
        </p>
      </div>
    </div>
  )
}