import React, { useState, useRef } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'motion/react'
import { Heart, X, Star, Filter, RotateCcw, Sparkles } from 'lucide-react'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Card } from '../../ui/card'
import { Event, MatchAction } from '../../../types/events'
import { useEventNetworking } from '../../../hooks/useEvents'
import { NetworkingFilters } from './NetworkingFilters'
import { toast } from 'sonner@2.0.3'

interface AttendeeDiscoveryProps {
  event: Event
}

export function AttendeeDiscovery({ event }: AttendeeDiscoveryProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [superConnectsLeft] = useState(5) // Mock data
  const { 
    currentAttendee, 
    remainingCount, 
    filters, 
    applyFilters, 
    nextAttendee 
  } = useEventNetworking(event.id)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-150, 150], [-30, 30])
  const opacity = useTransform(x, [-150, -50, 0, 50, 150], [0, 1, 1, 1, 0])
  
  const constraintsRef = useRef(null)

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100
    
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0) {
        // Swiped right - Connect
        handleAction('connect')
      } else {
        // Swiped left - Skip
        handleAction('skip')
      }
    }
  }

  const handleAction = (action: MatchAction) => {
    if (!currentAttendee) return

    // Animate card out
    x.set(action === 'skip' ? -500 : 500)
    
    setTimeout(() => {
      nextAttendee()
      x.set(0)
      
      // Show feedback
      if (action === 'connect') {
        toast.success('Networking interest sent!', {
          description: 'You\'ll be notified if they\'re interested too'
        })
      } else if (action === 'super_connect') {
        toast.success('Super Connect sent!', {
          description: 'Your profile will be highlighted to them'
        })
      }
    }, 300)
  }

  if (!currentAttendee && remainingCount === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          You've seen everyone!
        </h3>
        <p className="text-text-secondary mb-6">
          Check back later for new attendees or adjust your filters to see more people
        </p>
        <div className="flex justify-center space-x-3">
          <Button variant="outline" onClick={() => setShowFilters(true)}>
            <Filter className="h-4 w-4 mr-2" />
            Adjust Filters
          </Button>
          <Button onClick={() => window.location.reload()}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Discovery
          </Button>
        </div>
      </div>
    )
  }

  if (!currentAttendee) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse space-y-4">
          <div className="w-80 h-96 bg-muted rounded-3xl mx-auto"></div>
          <div className="flex justify-center space-x-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-12 h-12 bg-muted rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">
            Discover Attendees
          </h3>
          <p className="text-sm text-text-secondary">
            {remainingCount + 1} people in your queue
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowFilters(true)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Card Stack */}
      <div className="relative h-[500px] flex items-center justify-center" ref={constraintsRef}>
        {/* Current Card */}
        <motion.div
          drag="x"
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{ x, rotate, opacity }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          whileTap={{ scale: 0.95 }}
        >
          <Card className="w-full h-full p-6 bg-surface border-2 border-border rounded-3xl shadow-xl overflow-hidden">
            {/* Profile Image */}
            <div className="relative mb-4">
              <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl overflow-hidden">
                {currentAttendee.profile.profilePhoto ? (
                  <img
                    src={currentAttendee.profile.profilePhoto}
                    alt={currentAttendee.profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                      {currentAttendee.profile.name.charAt(0)}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Status Indicator */}
              {currentAttendee.status === 'networking' && (
                <div className="absolute top-3 right-3">
                  <div className="flex items-center space-x-1 bg-success text-success-foreground px-2 py-1 rounded-full text-xs font-medium">
                    <div className="w-2 h-2 bg-success-foreground rounded-full" />
                    <span>Online</span>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {currentAttendee.profile.name}
                </h3>
                <p className="text-text-secondary">
                  {currentAttendee.profile.title} at {currentAttendee.profile.company}
                </p>
              </div>

              {/* Industry & Stage */}
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {currentAttendee.profile.industry}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {currentAttendee.profile.companyStage}
                </Badge>
              </div>

              {/* Interest Tags */}
              <div>
                <div className="text-sm font-medium text-foreground mb-2">Interests</div>
                <div className="flex flex-wrap gap-2">
                  {currentAttendee.profile.interests.slice(0, 3).map((interest, index) => (
                    <Badge key={index} className="bg-primary/10 text-primary text-xs">
                      🏷️ {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Looking For */}
              <div>
                <div className="text-sm font-medium text-foreground mb-2">Looking For</div>
                <div className="flex flex-wrap gap-2">
                  {currentAttendee.profile.lookingFor.slice(0, 2).map((item, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Bio */}
              {currentAttendee.profile.bio && (
                <div>
                  <p className="text-sm text-text-secondary line-clamp-2">
                    {currentAttendee.profile.bio}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Next Card (Background) */}
        {remainingCount > 0 && (
          <div className="absolute inset-0 -z-10 transform scale-95 opacity-50">
            <Card className="w-full h-full bg-muted/50 rounded-3xl" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-4 mt-6">
        <Button
          variant="outline"
          size="lg"
          className="w-14 h-14 rounded-full p-0 border-2 border-muted-foreground/20 hover:border-error hover:bg-error hover:text-error-foreground"
          onClick={() => handleAction('skip')}
        >
          <X className="h-6 w-6" />
        </Button>

        <Button
          size="lg"
          className="w-16 h-16 rounded-full p-0 bg-primary hover:bg-primary-hover"
          onClick={() => handleAction('connect')}
        >
          <Heart className="h-7 w-7" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-14 h-14 rounded-full p-0 border-2 border-warning hover:border-warning hover:bg-warning hover:text-warning-foreground relative"
          onClick={() => handleAction('super_connect')}
          disabled={superConnectsLeft === 0}
        >
          <Star className="h-6 w-6" />
          {superConnectsLeft > 0 && (
            <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 text-xs bg-warning text-warning-foreground">
              {superConnectsLeft}
            </Badge>
          )}
        </Button>
      </div>

      {/* Action Labels */}
      <div className="flex items-center justify-center space-x-8 mt-3">
        <span className="text-xs text-text-tertiary">Skip</span>
        <span className="text-xs text-text-tertiary">Connect</span>
        <span className="text-xs text-text-tertiary">
          Super ({superConnectsLeft} left)
        </span>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center mt-6">
        <div className="flex space-x-1">
          {Array.from({ length: Math.min(5, remainingCount + 1) }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === 0 ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Networking Filters Modal */}
      {showFilters && (
        <NetworkingFilters
          filters={filters}
          onApplyFilters={applyFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  )
}