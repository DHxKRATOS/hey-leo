import { Calendar, ChevronDown, ChevronUp, ExternalLink, Facebook, Github, Globe, Instagram, Linkedin, Mail, Monitor, Phone, Send, Smartphone, Tablet, Twitter, Youtube } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createEventHandlers } from '../utils/endUserViewHelpers'
import { ChatWidget } from './ChatWidget'
import { DesktopCard } from './endUserView/DesktopCard'
import { MobileCard } from './endUserView/MobileCard'
import { TabletCard } from './endUserView/TabletCard'
import { Button } from './ui/button'

interface ResponsiveCardRendererProps {
  cardData: {
    id: string
    profile: {
      full_name: string
      job_title: string
      company: string
      location: string
      bio: string
      profile_photo_url: string
      cover_image_url: string
      ai_chat_enabled?: boolean
    }
    links: Array<{
      id: string
      platform: string
      url: string
      label: string
      is_visible: boolean
    }>
    design: {
      template: string
      theme: string
      colors: {
        primary: string
        secondary: string
        background: string
        text: string
        accent?: string
      }
      fonts: {
        heading: string
        body: string
      }
      layout: string
      spacing: string
      corners: string
      shadows: string
    }
    settings?: {
      ai_chat_enabled?: boolean
    }
    // Enhanced design properties for responsive system
    selectedTheme?: string
    selectedLayout?: string
    accentColor?: string
    backgroundStyle?: string
    selectedFont?: string
    contentSpacing?: string
    layoutOrientation?: 'portrait' | 'landscape' | 'square'
    responsiveLayout?: {
      desktop: 'wide' | 'square' | 'tall'
      tablet: 'balanced' | 'wide' | 'tall'
      mobile: 'compact' | 'standard' | 'detailed'
    }
  }
  viewMode?: 'preview' | 'live' | 'export'
  device?: 'mobile' | 'tablet' | 'desktop'
  onShare?: () => void
  onExport?: (format: 'png' | 'pdf' | 'svg') => void
  showChat?: boolean
  onChatClick?: () => void
  isPreview?: boolean
  className?: string
  showDeviceControls?: boolean
  enableInteractivePreview?: boolean
}

const ResponsiveCardRenderer = React.memo(function ResponsiveCardRenderer({ 
  cardData, 
  viewMode = 'preview', 
  device = 'mobile',
  onShare,
  onExport,
  showChat = true,
  onChatClick,
  isPreview = false,
  className = "",
  showDeviceControls = false,
  enableInteractivePreview = false
}: ResponsiveCardRendererProps) {
  const [currentDevice, setCurrentDevice] = useState(device)
  const [isLoading, setIsLoading] = useState(false)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [showAllLinks, setShowAllLinks] = useState(false)
  const [hoveredElement, setHoveredElement] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Animation states
  const [loadingSequence, setLoadingSequence] = useState(0)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [aiChatHovered, setAiChatHovered] = useState(false)
  const [chatWidgetOpen, setChatWidgetOpen] = useState(false)

  // AI Chat Detection - Show when explicitly enabled
  const isAiChatEnabled = cardData.profile?.ai_chat_enabled === true && showChat !== false

  // REAL PROFESSIONAL PROFILE DATA - Replace demo content
  const realProfileData = {
    full_name: "Sarah Chen",
    job_title: "Senior Product Manager",
    company: "Stripe",
    location: "San Francisco, CA",
    bio: "Building the future of online payments and financial infrastructure. Passionate about creating products that enable economic growth worldwide.",
    profile_photo_url: "https://images.unsplash.com/photo-1494790108755-2616b74bce32?w=400&h=400&fit=crop&crop=face",
    cover_image_url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop"
  }

  // Memoize profile data to prevent unnecessary re-renders
  const profile = useMemo(() => ({
    full_name: cardData.profile.full_name || realProfileData.full_name,
    job_title: cardData.profile.job_title || realProfileData.job_title,
    company: cardData.profile.company || realProfileData.company,
    location: cardData.profile.location || realProfileData.location,
    bio: cardData.profile.bio || realProfileData.bio,
    profile_photo_url: cardData.profile.profile_photo_url || realProfileData.profile_photo_url,
    cover_image_url: cardData.profile.cover_image_url || realProfileData.cover_image_url
  }), [
    cardData.profile.full_name,
    cardData.profile.job_title,
    cardData.profile.company,
    cardData.profile.location,
    cardData.profile.bio,
    cardData.profile.profile_photo_url,
    cardData.profile.cover_image_url
  ])

  // REALISTIC PROFESSIONAL SOCIAL LINKS
  const realSocialLinks = [
    { id: '1', platform: 'linkedin', url: 'https://linkedin.com/in/sarahchen', label: 'Connect on LinkedIn', is_visible: true },
    { id: '2', platform: 'email', url: 'mailto:sarah.chen@stripe.com', label: 'Work Email', is_visible: true },
    { id: '3', platform: 'phone', url: 'tel:+14155551234', label: 'Call Mobile', is_visible: true },
    { id: '4', platform: 'website', url: 'https://sarahchen.dev', label: 'Personal Website', is_visible: true },
    { id: '5', platform: 'github', url: 'https://github.com/sarahchen', label: 'GitHub Profile', is_visible: true },
    { id: '6', platform: 'calendar', url: 'https://calendly.com/sarahchen', label: 'Schedule Meeting', is_visible: true },
    { id: '7', platform: 'twitter', url: 'https://twitter.com/sarahchen', label: 'Follow on Twitter', is_visible: true },
    { id: '8', platform: 'instagram', url: 'https://instagram.com/sarahchen', label: 'Instagram', is_visible: true }
  ]

  // Memoize display links to prevent unnecessary re-renders
  const displayLinks = useMemo(() => 
    cardData.links && cardData.links.length > 0 ? cardData.links : realSocialLinks,
    [cardData.links]
  )

  // Responsive Device Configurations with Enhanced 80/20 Design System
  const deviceConfigs = {
    mobile: {
      // Mobile: 375x667px (iPhone), vertical emphasis, thumb-friendly
      container: 'w-full max-w-sm mx-auto',
      cardContainer: 'w-full',
      cardDimensions: 'min-h-[600px]',
      cardLayout: 'flex flex-col',
      padding: 'p-6',
      spacing: 'space-y-4',
      
      // Typography scaling for mobile
      typography: {
        name: 'text-2xl font-bold leading-tight tracking-tight',
        title: 'text-base font-medium leading-relaxed',
        company: 'text-sm font-normal leading-normal text-text-secondary',
        location: 'text-sm font-normal leading-normal text-text-tertiary',
        bio: 'text-sm font-normal leading-relaxed text-text-secondary',
        button: 'text-sm font-medium'
      },
      
      // Element sizing
      photoSize: 'w-24 h-24',
      coverHeight: 'h-32',
      buttonHeight: 'h-12',
      iconSize: 'w-4 h-4',
      buttonSpacing: 'space-y-3',
      linkGrid: 'grid grid-cols-4 gap-3',
      
      // Mobile-specific features
      showExpandedLinks: false,
      compactMode: true,
      singleColumn: true
    },
    
    tablet: {
      // Tablet: 768-1199px, balanced proportions, touch-optimized
      container: 'w-full max-w-lg mx-auto',
      cardContainer: 'w-full',
      cardDimensions: 'min-h-[750px]',
      cardLayout: 'flex flex-col',
      padding: 'p-8',
      spacing: 'space-y-6',
      
      // Enhanced typography for tablet
      typography: {
        name: 'text-3xl font-bold leading-tight tracking-tight',
        title: 'text-lg font-medium leading-relaxed',
        company: 'text-base font-normal leading-normal text-text-secondary',
        location: 'text-base font-normal leading-normal text-text-tertiary',
        bio: 'text-base font-normal leading-relaxed text-text-secondary max-w-md',
        button: 'text-base font-medium'
      },
      
      // Larger elements for tablet
      photoSize: 'w-28 h-28',
      coverHeight: 'h-40',
      buttonHeight: 'h-14',
      iconSize: 'w-5 h-5',
      buttonSpacing: 'space-y-4',
      linkGrid: 'grid grid-cols-6 gap-4',
      
      showExpandedLinks: true,
      compactMode: false,
      singleColumn: true
    },
    
    desktop: {
      // Desktop: 1200px+, horizontal emphasis, generous spacing
      container: 'w-full max-w-4xl mx-auto',
      cardContainer: 'w-full max-w-5xl mx-auto',
      cardDimensions: 'h-[500px]', // Fixed height for desktop landscape
      cardLayout: 'flex flex-row items-center', // Horizontal layout
      padding: 'p-10',
      spacing: 'space-x-12', // Horizontal spacing
      
      // Large typography for desktop impact
      typography: {
        name: 'text-4xl font-bold leading-tight tracking-tight',
        title: 'text-xl font-medium leading-relaxed',
        company: 'text-lg font-normal leading-normal text-text-secondary',
        location: 'text-lg font-normal leading-normal text-text-tertiary',
        bio: 'text-lg font-normal leading-relaxed text-text-secondary max-w-lg',
        button: 'text-lg font-medium'
      },
      
      // Prominent elements for desktop
      photoSize: 'w-32 h-32',
      coverHeight: 'h-48',
      buttonHeight: 'h-16',
      iconSize: 'w-6 h-6',
      buttonSpacing: 'space-x-4 flex flex-row', // Horizontal button layout
      linkGrid: 'flex flex-wrap gap-4',
      
      showExpandedLinks: true,
      compactMode: false,
      singleColumn: false,
      
      // Desktop-specific layout options
      profileSection: 'flex-shrink-0',
      contentSection: 'flex-1 flex flex-col justify-center',
      horizontalAlignment: true
    }
  }

  // Memoize device config to prevent unnecessary re-renders
  const config = useMemo(() => deviceConfigs[currentDevice], [currentDevice])

  // Enhanced loading sequence animation - only trigger on device change or initial load
  useEffect(() => {
    if (viewMode === 'preview') {
      setIsVisible(false)
      const sequence = async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        setIsVisible(true)
        
        // Staggered loading animation
        for (let i = 0; i <= 7; i++) {
          setLoadingSequence(i)
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      sequence()
    }
  }, [viewMode, currentDevice]) // Removed cardData dependency to prevent unnecessary animations

  // Parallax scroll effect for desktop
  useEffect(() => {
    const handleScroll = () => {
      if (cardRef.current && currentDevice === 'desktop') {
        const rect = cardRef.current.getBoundingClientRect()
        const scrollProgress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / window.innerHeight))
        setScrollY(scrollProgress * 20)
      }
    }

    if (viewMode === 'preview' && currentDevice === 'desktop') {
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [viewMode, currentDevice])

  // Leo Design System color theming with responsive enhancements
  const getDynamicTheme = () => {
    const { primary, secondary, background, text } = cardData.design.colors
    
    // Enhanced Leo branding with responsive color depth
    const leoOrange = cardData.accentColor || '#F26522'
    const leoOrangeHover = '#E85A17'
    const leoOrangeLight = '#FFF4F0'
    
    // Device-specific color adjustments
    const deviceColorModifiers = {
      mobile: { opacity: 1, saturation: 1 },
      tablet: { opacity: 0.95, saturation: 1.1 },
      desktop: { opacity: 0.9, saturation: 1.2 } // Richer colors on desktop
    }
    
    const modifier = deviceColorModifiers[currentDevice]
    
    return {
      primary: leoOrange,
      secondary,
      background: background || '#FFFFFF',
      text: text || '#1A1A1A',
      leoOrange,
      leoOrangeHover,
      leoOrangeLight,
      primaryLight: leoOrangeLight,
      primaryDark: leoOrangeHover,
      modifier
    }
  }

  // Memoize theme to prevent unnecessary re-calculations
  const theme = useMemo(() => getDynamicTheme(), [
    cardData.design.colors,
    cardData.accentColor,
    currentDevice
  ])

  // Enhanced responsive background system
  const getResponsiveBackgroundStyle = () => {
    const template = cardData.design.template || cardData.selectedTheme || 'leo-professional'
    const backgroundStyle = cardData.backgroundStyle || 'gradient'
    
    // Device-specific gradient intensity
    const gradientIntensity = {
      mobile: '0.8',
      tablet: '0.9', 
      desktop: '1.0'
    }
    
    const intensity = gradientIntensity[currentDevice]
    
    const responsiveBackgrounds = {
      // Professional themes
      'professional': {
        mobile: `linear-gradient(180deg, ${theme.background}${Math.round(parseFloat(intensity) * 255).toString(16)} 0%, ${theme.primaryLight} 100%)`,
        tablet: `linear-gradient(135deg, ${theme.background} 0%, ${theme.primaryLight} 70%, ${theme.leoOrange}20 100%)`,
        desktop: `linear-gradient(90deg, ${theme.background} 0%, ${theme.primaryLight} 50%, ${theme.leoOrange}10 100%)`
      },
      
      // Modern themes  
      'modern': {
        mobile: `linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)`,
        tablet: `linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 60%, ${theme.primaryLight} 100%)`,
        desktop: `linear-gradient(90deg, #FFFFFF 0%, #F8FAFC 40%, ${theme.primaryLight} 100%)`
      },
      
      // Warm themes
      'warm': {
        mobile: `linear-gradient(180deg, ${theme.primaryLight} 0%, #FED7AA 100%)`,
        tablet: `linear-gradient(135deg, ${theme.primaryLight} 0%, #FED7AA 50%, ${theme.leoOrange}30 100%)`,
        desktop: `linear-gradient(90deg, ${theme.primaryLight} 0%, #FED7AA 60%, ${theme.leoOrange}20 100%)`
      },
      
      // Premium themes
      'premium': {
        mobile: `linear-gradient(180deg, #F9FAFB 0%, #E5E7EB 100%)`,
        tablet: `linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 60%, #D1D5DB 100%)`,
        desktop: `linear-gradient(90deg, #F9FAFB 0%, #F3F4F6 50%, #E5E7EB 100%)`
      },
      
      // Creative themes
      'creative': {
        mobile: `linear-gradient(180deg, #FAF5FF 0%, #F3E8FF 100%)`,
        tablet: `linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 60%, #E9D5FF 100%)`,
        desktop: `linear-gradient(90deg, #FAF5FF 0%, #F3E8FF 50%, #E9D5FF 100%)`
      }
    }
    
    const themeBackgrounds = responsiveBackgrounds[template as keyof typeof responsiveBackgrounds] || responsiveBackgrounds.professional
    
    return {
      background: themeBackgrounds[currentDevice],
      position: 'relative' as const,
      overflow: 'hidden' as const,
      transition: 'all 0.3s ease'
    }
  }

  // Enhanced responsive typography system
  const getResponsiveTypography = (element: keyof typeof config.typography) => {
    const baseClasses = config.typography[element]
    const fontFamily = cardData.selectedFont || 'modern'
    
    // Font family mapping
    const fontFamilies = {
      modern: 'font-inter', // Use Inter font class
      classic: 'font-georgia',
      'sans-serif': 'font-helvetica', 
      serif: 'font-times',
      display: 'font-poppins',
      monospace: 'font-mono'
    }
    
    const fontClass = fontFamilies[fontFamily as keyof typeof fontFamilies] || ''
    
    return `${baseClasses} ${fontClass}`.trim()
  }

  // Device-specific spacing system
  const getResponsiveSpacing = () => {
    const spacing = cardData.contentSpacing || 'default'
    
    const spacingConfigs = {
      mobile: {
        compact: 'space-y-2',
        default: 'space-y-4', 
        spacious: 'space-y-6'
      },
      tablet: {
        compact: 'space-y-3',
        default: 'space-y-6',
        spacious: 'space-y-8'
      },
      desktop: {
        compact: 'space-x-8',  // Horizontal for desktop
        default: 'space-x-12',
        spacious: 'space-x-16'
      }
    }
    
    return spacingConfigs[currentDevice][spacing as keyof typeof spacingConfigs[typeof currentDevice]] || config.spacing
  }

  // Enhanced platform icons with proper sizing
  const getPlatformIcon = (platform: string) => {
    const iconMap = {
      email: <Mail className={config.iconSize} />,
      phone: <Phone className={config.iconSize} />,
      linkedin: <Linkedin className={config.iconSize} />,
      instagram: <Instagram className={config.iconSize} />,
      github: <Github className={config.iconSize} />,
      website: <Globe className={config.iconSize} />,
      calendar: <Calendar className={config.iconSize} />,
      twitter: <Twitter className={config.iconSize} />,
      facebook: <Facebook className={config.iconSize} />,
      youtube: <Youtube className={config.iconSize} />,
      telegram: <Send className={config.iconSize} />
    }
    
    return iconMap[platform.toLowerCase() as keyof typeof iconMap] || <ExternalLink className={config.iconSize} />
  }

  const handleImageError = (imageId: string) => {
    setImageErrors(prev => new Set([...prev, imageId]))
  }

  const handleExport = async (format: 'png' | 'pdf' | 'svg') => {
    if (!cardRef.current || !onExport) return

    setIsLoading(true)
    
    try {
      await onExport(format)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'SC'
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  // Enhanced link rendering with responsive behavior
  const renderSocialLinks = () => {
    const visibleLinks = showAllLinks ? displayLinks : displayLinks.slice(0, currentDevice === 'mobile' ? 4 : currentDevice === 'tablet' ? 6 : 8)
    const hasMoreLinks = displayLinks.length > visibleLinks.length

    return (
      <div className={`w-full ${currentDevice === 'desktop' ? 'mt-6' : 'mt-4'}`}>
        <div className={config.linkGrid}>
          {visibleLinks.filter(link => link.is_visible).map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center justify-center ${config.buttonHeight} ${
                currentDevice === 'desktop' ? 'px-6 py-3' : 'p-3'
              } bg-surface hover:bg-primary hover:text-primary-foreground border border-border hover:border-primary rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md`}
              onMouseEnter={() => setHoveredLink(link.id)}
              onMouseLeave={() => setHoveredLink(null)}
              title={link.label}
            >
              {getPlatformIcon(link.platform)}
              {currentDevice === 'desktop' && (
                <span className="ml-2 text-sm font-medium group-hover:text-primary-foreground">
                  {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                </span>
              )}
            </a>
          ))}
        </div>
        
        {hasMoreLinks && currentDevice !== 'desktop' && (
          <button
            onClick={() => setShowAllLinks(!showAllLinks)}
            className="flex items-center justify-center gap-2 w-full mt-4 py-3 text-text-secondary hover:text-text-primary transition-colors"
          >
            {showAllLinks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {showAllLinks ? 'Show less' : `See ${displayLinks.length - visibleLinks.length} more`}
            </span>
          </button>
        )}
      </div>
    )
  }

  // Device Controls for Preview Mode
  const renderDeviceControls = () => {
    if (!showDeviceControls) return null

    return (
      <div className="flex items-center justify-center space-x-2 mb-6 p-3 bg-surface rounded-xl border border-border">
        <Button
          variant={currentDevice === 'mobile' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentDevice('mobile')}
          className="flex items-center gap-2"
        >
          <Smartphone className="w-4 h-4" />
          Mobile
        </Button>
        <Button
          variant={currentDevice === 'tablet' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentDevice('tablet')}
          className="flex items-center gap-2"
        >
          <Tablet className="w-4 h-4" />
          Tablet
        </Button>
        <Button
          variant={currentDevice === 'desktop' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentDevice('desktop')}
          className="flex items-center gap-2"
        >
          <Monitor className="w-4 h-4" />
          Desktop
        </Button>
      </div>
    )
  }

  // Main responsive card renderer using End User View components
  const renderResponsiveCard = () => {
    const eventHandlers = createEventHandlers()

    return (
      <div className={`${className} ${
        isVisible ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4'
      }`} style={{ transition: isPreview ? 'none' : 'all 0.7s ease' }}>
        {showDeviceControls && renderDeviceControls()}
        
        {/* Card Display using End User View components */}
        <div 
          className="p-0"
          style={{
            background: 'transparent',
            borderRadius: '0',
            minHeight: 'auto',
            transition: 'none' // Remove transition to prevent flickering
          }}
        >
          {currentDevice === 'desktop' && (
            <DesktopCard 
              onAskAI={eventHandlers.handleAskAI}
              onShare={eventHandlers.handleShare}
              onDownload={eventHandlers.handleDownload}
              onSocialClick={eventHandlers.handleSocialClick}
            />
          )}
          {currentDevice === 'tablet' && (
            <TabletCard 
              onAskAI={eventHandlers.handleAskAI}
              onShare={eventHandlers.handleShare}
              onDownload={eventHandlers.handleDownload}
              onSocialClick={eventHandlers.handleSocialClick}
            />
          )}
          {currentDevice === 'mobile' && (
            <MobileCard 
              onAskAI={eventHandlers.handleAskAI}
              onShare={eventHandlers.handleShare}
              onDownload={eventHandlers.handleDownload}
              onSocialClick={eventHandlers.handleSocialClick}
            />
          )}
        </div>

        {/* Chat Widget for Live Mode */}
        {chatWidgetOpen && isAiChatEnabled && viewMode === 'live' && (
          <ChatWidget
            cardOwner={{
              name: profile.full_name,
              title: profile.job_title,
              company: profile.company,
              avatar: profile.profile_photo_url
            }}
            variant="floating"
            size={currentDevice === 'desktop' ? 'lg' : 'md'}
            theme="auto"
            position="bottom-right"
            isPublicCard={false}
            onClose={() => setChatWidgetOpen(false)}
          />
        )}
      </div>
    )
  }

  return renderResponsiveCard()
})

export { ResponsiveCardRenderer }
