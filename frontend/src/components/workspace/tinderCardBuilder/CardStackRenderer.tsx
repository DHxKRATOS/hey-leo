import React from 'react'
import { motion, PanInfo, AnimatePresence } from 'motion/react'
import { 
  MapPin, 
  ExternalLink, 
  X, 
  Star, 
  Heart 
} from 'lucide-react'
import { CardChatButton } from '../../CardChatButton'
import { Button } from '../../ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip'
import { tinderCardTemplates } from '../../../utils/tinderCardBuilderConstants'
import { getPlatformIcon, handleLinkClick } from '../../../utils/tinderCardBuilderHelpers'
import { Card, CardTemplate } from '../../../types/tinderCardBuilder'

interface CardStackRendererProps {
  card: Card
  cardZoom: number
  cardRotation: number
  showCardStack: boolean
  isSwipeable: boolean
  isDragging: boolean
  selectedTemplatePreview: string | null
  soundEnabled: boolean
  audioContextRef: React.MutableRefObject<AudioContext | null>
  stackContainerRef: React.RefObject<HTMLDivElement>
  cardPreviewRef: React.RefObject<HTMLDivElement>
  onDragStart: () => void
  onDragEnd: (event: any, info: PanInfo) => void
  onLinkClick: (link: any, e: React.MouseEvent) => void
  playSound: (type: 'like' | 'pass' | 'swipe') => void
}

export function CardStackRenderer({
  card,
  cardZoom,
  cardRotation,
  showCardStack,
  isSwipeable,
  isDragging,
  selectedTemplatePreview,
  soundEnabled,
  audioContextRef,
  stackContainerRef,
  cardPreviewRef,
  onDragStart,
  onDragEnd,
  onLinkClick,
  playSound
}: CardStackRendererProps) {
  const currentTemplate = tinderCardTemplates.find(t => t.id === card?.design?.template) || tinderCardTemplates[0]
  const isLightBackground = ['modern-professional', 'minimal-zen', 'glassmorphism-elite'].includes(currentTemplate.id)
  const textColor = isLightBackground ? '#1A1A1A' : '#FFFFFF'
  const mutedTextColor = isLightBackground ? '#6B6B6B' : 'rgba(255,255,255,0.8)'

  return (
    <div ref={stackContainerRef} className="relative h-full flex items-center justify-center">
      {/* Enhanced background cards for sophisticated stack effect */}
      {showCardStack && [1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute w-72 h-96 rounded-3xl shadow-xl"
          initial={{ 
            scale: 1 - i * 0.08, 
            y: i * 12, 
            opacity: 0.4 - i * 0.1,
            rotateY: i * 2
          }}
          animate={{ 
            scale: 1 - i * 0.08, 
            y: i * 12, 
            opacity: 0.4 - i * 0.1,
            rotateY: i * 2
          }}
          style={{ 
            zIndex: -i,
            background: `linear-gradient(135deg, 
              hsl(${(i * 60) % 360}, 60%, 85%) 0%, 
              hsl(${(i * 60 + 30) % 360}, 50%, 75%) 100%)`
          }}
        />
      ))}

      {/* Main enhanced card */}
      <motion.div
        ref={cardPreviewRef}
        className="relative w-72 h-96 overflow-hidden cursor-pointer"
        style={{
          ...currentTemplate.style,
          transform: `${currentTemplate.style.transform || ''} scale(${cardZoom}) rotateY(${cardRotation}deg)`,
          zIndex: 10
        }}
        drag={isSwipeable ? true : false}
        dragConstraints={{ left: -100, right: 100, top: -60, bottom: 60 }}
        dragElastic={0.2}
        whileDrag={{ 
          scale: 1.05, 
          rotate: isDragging ? (Math.random() - 0.5) * 8 : 0,
          cursor: 'grabbing',
          boxShadow: '0 40px 80px rgba(0,0,0,0.25), 0 20px 40px rgba(0,0,0,0.15)'
        }}
        whileHover={{ 
          scale: isSwipeable ? 1.02 : 1,
          boxShadow: '0 35px 70px rgba(0,0,0,0.2), 0 15px 30px rgba(0,0,0,0.1)'
        }}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        animate={{
          rotateY: cardRotation
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
      >
        {/* Card content */}
        <div 
          className="h-full p-8 flex flex-col relative z-10" 
          style={{ 
            background: selectedTemplatePreview === currentTemplate.id 
              ? 'linear-gradient(135deg, rgba(242,101,34,0.1) 0%, rgba(242,101,34,0.05) 100%)'
              : currentTemplate.preview,
            fontFamily: card?.design?.fonts?.body || 'Inter',
            backdropFilter: currentTemplate.id === 'glassmorphism-elite' ? 'blur(20px)' : 'none'
          }}
        >
          {/* Profile section */}
          <div className="text-center mb-6">
            <motion.div 
              className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden shadow-xl"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {card?.profile?.profile_photo_url ? (
                <img
                  src={card?.profile?.profile_photo_url}
                  alt={card?.profile?.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white shadow-inner font-semibold text-2xl"
                >
                  {card?.profile?.full_name?.charAt(0) || 'U'}
                </div>
              )}
            </motion.div>
            
            <motion.h1 
              className="font-semibold mb-2" 
              style={{ 
                fontFamily: card?.design?.fonts?.heading || 'Inter',
                color: textColor,
                fontSize: '24px',
                lineHeight: '32px',
                letterSpacing: '-0.02em'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {card?.profile?.full_name || 'Your Name'}
            </motion.h1>
            
            <motion.p 
              className="opacity-90 mb-1 font-medium" 
              style={{
                color: textColor,
                fontSize: '16px',
                lineHeight: '24px'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {card?.profile?.job_title || 'Your Title'}
            </motion.p>
            
            {card?.profile?.company && (
              <motion.p 
                className="opacity-70" 
                style={{
                  color: textColor,
                  fontSize: '14px',
                  lineHeight: '20px'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {card?.profile?.company}
              </motion.p>
            )}

            {card?.profile?.location && (
              <motion.p 
                className="opacity-60 flex items-center justify-center gap-1 mt-1" 
                style={{
                  color: textColor,
                  fontSize: '13px',
                  lineHeight: '20px'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <MapPin className="h-3 w-3" />
                {card?.profile?.location}
              </motion.p>
            )}
          </div>

          {/* Bio section */}
          {card?.profile?.bio && (
            <motion.p 
              className="text-center mb-6 opacity-80 leading-relaxed" 
              style={{
                color: textColor,
                fontSize: '13px',
                lineHeight: '20px'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {card?.profile?.bio}
            </motion.p>
          )}

          {/* Links section */}
          <div className="flex-1 flex flex-col space-y-3">
            <AnimatePresence>
              {card?.links?.filter(link => link.is_visible && link.url).slice(0, 3).map((link, index) => (
                <motion.button
                  key={link.id}
                  className="flex items-center space-x-3 p-3 rounded-xl backdrop-blur-sm transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/50 group"
                  style={{
                    backgroundColor: isLightBackground 
                      ? 'rgba(0,0,0,0.08)' 
                      : 'rgba(255,255,255,0.2)',
                    border: `1px solid ${isLightBackground ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.3)'}`,
                    cursor: 'pointer'
                  }}
                  initial={{ opacity: 0, x: -30, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 30, scale: 0.9 }}
                  transition={{ delay: 0.6 + index * 0.1, type: "spring", stiffness: 300 }}
                  onClick={(e) => onLinkClick(link, e)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: card?.design?.colors?.primary || '#F26522' }}
                  >
                    <span className="text-white text-sm">
                      {getPlatformIcon(link.platform)}
                    </span>
                  </div>
                  <span 
                    className="font-medium flex-1 text-left group-hover:translate-x-1 transition-transform" 
                    style={{
                      color: textColor,
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    {link.label}
                  </span>
                  <ExternalLink 
                    className="h-4 w-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" 
                    style={{ color: textColor }}
                  />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {/* AI Chat Button */}
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <CardChatButton
              cardOwner={{
                name: card?.profile?.full_name || 'Your Name',
                title: card?.profile?.job_title,
                company: card?.profile?.company,
                avatar: card?.profile?.profile_photo_url
              }}
              variant="minimal"
              size="sm"
              position="inline"
              theme="auto"
              showLabel={true}
              className={`w-full transition-all hover:scale-[1.02] ${
                isLightBackground 
                  ? 'bg-white/50 border-black/20 text-gray-800 hover:bg-white/70 backdrop-blur-sm' 
                  : 'bg-white/15 border-white/30 text-white hover:bg-white/25 backdrop-blur-sm'
              }`}
            />
          </motion.div>

          {/* Leo branding */}
          <motion.div 
            className="text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div 
              className="inline-flex items-center space-x-2 px-3 py-2 rounded-full backdrop-blur-sm"
              style={{ 
                backgroundColor: isLightBackground ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)',
                border: `1px solid ${isLightBackground ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}`
              }}
            >
              <span className="text-lg">🦁</span>
              <span 
                className="font-medium" 
                style={{
                  color: mutedTextColor,
                  fontSize: '12px'
                }}
              >
                Powered by Leo
              </span>
            </div>
          </motion.div>
        </div>

        {/* Swipe indicators */}
        <AnimatePresence>
          {isSwipeable && isDragging && (
            <>
              <motion.div 
                className="absolute top-8 left-8 w-20 h-20 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-2xl shadow-2xl"
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 0.9, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0, rotate: 180 }}
                style={{ zIndex: 30 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                ❌
              </motion.div>
              <motion.div 
                className="absolute top-8 right-8 w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-2xl shadow-2xl"
                initial={{ opacity: 0, scale: 0, rotate: 180 }}
                animate={{ opacity: 0.9, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0, rotate: -180 }}
                style={{ zIndex: 30 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                ✓
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Enhanced floating action buttons */}
      <motion.div 
        className="absolute bottom-8 flex space-x-6 z-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                className="w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center text-red-500 hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-200/50 group"
                whileHover={{ scale: 1.15, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playSound('pass')
                  // toast handled in parent component
                }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <X className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>Pass on this design</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-primary-hover shadow-2xl flex items-center justify-center text-white hover:shadow-3xl focus:outline-none focus:ring-4 focus:ring-primary/30 group"
                whileHover={{ scale: 1.15, y: -8 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playSound('like')
                  // toast handled in parent component
                }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Star className="w-10 h-10 group-hover:scale-110 group-hover:rotate-12 transition-all" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>Super like this design!</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                className="w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center text-green-500 hover:bg-green-50 focus:outline-none focus:ring-4 focus:ring-green-200/50 group"
                whileHover={{ scale: 1.15, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playSound('like')
                  // toast handled in parent component
                }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Heart className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>Like this design</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    </div>
  )
}