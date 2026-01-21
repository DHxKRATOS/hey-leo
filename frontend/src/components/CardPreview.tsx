import React, { useState, useEffect } from 'react'
import { DesktopCard } from './endUserView/DesktopCard'
import { TabletCard } from './endUserView/TabletCard'
import { MobileCard } from './endUserView/MobileCard'
import { createEventHandlers } from '../utils/endUserViewHelpers'
import { Smartphone, Tablet, Monitor } from 'lucide-react'
import { Button } from './ui/button'

interface Card {
  id: string
  name: string
  profile: {
    full_name: string
    job_title: string
    company: string
    location: string
    bio: string
    profile_photo_url: string
    ai_chat_enabled?: boolean
  }
  links: Array<{
    id: string
    platform: string
    url: string
    label: string
    is_visible: boolean
  }>
  ai_config?: {
    enabled: boolean
  }
  settings?: {
    ai_chat_enabled?: boolean
  }
}

interface CardPreviewProps {
  card: Card
  showDeviceControls?: boolean
  defaultDevice?: 'desktop' | 'tablet' | 'mobile'
}

export function CardPreview({ card, showDeviceControls = true, defaultDevice = 'desktop' }: CardPreviewProps) {
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>(defaultDevice)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const eventHandlers = createEventHandlers()

  if (!mounted) {
    return null
  }

  const renderDeviceControls = () => {
    if (!showDeviceControls) return null

    return (
      <div className="flex items-center justify-center space-x-2 mb-6 p-2 bg-muted/50 rounded-xl border border-border">
        <Button
          variant={deviceView === 'desktop' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDeviceView('desktop')}
          className="flex items-center gap-2 h-8"
        >
          <Monitor className="w-3 h-3" />
          <span className="text-xs">Desktop</span>
        </Button>
        <Button
          variant={deviceView === 'tablet' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDeviceView('tablet')}
          className="flex items-center gap-2 h-8"
        >
          <Tablet className="w-3 h-3" />
          <span className="text-xs">Tablet</span>
        </Button>
        <Button
          variant={deviceView === 'mobile' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDeviceView('mobile')}
          className="flex items-center gap-2 h-8"
        >
          <Smartphone className="w-3 h-3" />
          <span className="text-xs">Mobile</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {renderDeviceControls()}
      
      {/* Card Display */}
      <div 
        className={`transition-all duration-300 ${deviceView === 'mobile' ? 'p-0' : 'px-6 py-8'}`}
        style={{
          background: deviceView === 'mobile' 
            ? '#FFFFFF' 
            : 'linear-gradient(135deg, #F5F7FA 0%, #C3CFE2 100%)',
          borderRadius: deviceView === 'mobile' ? '0' : '1rem',
          minHeight: deviceView === 'mobile' ? '500px' : 'auto'
        }}
      >
        {deviceView === 'desktop' && (
          <DesktopCard 
            onAskAI={eventHandlers.handleAskAI}
            onShare={eventHandlers.handleShare}
            onDownload={eventHandlers.handleDownload}
            onSocialClick={eventHandlers.handleSocialClick}
          />
        )}
        {deviceView === 'tablet' && (
          <TabletCard 
            onAskAI={eventHandlers.handleAskAI}
            onShare={eventHandlers.handleShare}
            onDownload={eventHandlers.handleDownload}
            onSocialClick={eventHandlers.handleSocialClick}
          />
        )}
        {deviceView === 'mobile' && (
          <MobileCard 
            onAskAI={eventHandlers.handleAskAI}
            onShare={eventHandlers.handleShare}
            onDownload={eventHandlers.handleDownload}
            onSocialClick={eventHandlers.handleSocialClick}
          />
        )}
      </div>
    </div>
  )
}