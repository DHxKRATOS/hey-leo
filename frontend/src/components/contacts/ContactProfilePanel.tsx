import React from 'react'
import { MapPinIcon, CalendarIcon, MessageSquare, Clock, Sparkles, Building, Globe, Mail, Phone, MapPin, ArrowLeft, Brain } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card } from '../ui/card'
import { getInitials, getAvatarColor, getPriorityColor, getPriorityIcon } from '../../utils/contactHelpers'

interface ContactProfilePanelProps {
  contact: any
  userPlan?: 'starter' | 'professional' | 'executive'
  onClose: () => void
  onShare: () => void
  onEdit: () => void
  onSendMessage: () => void
}

export function ContactProfilePanel({ 
  contact, 
  userPlan = 'starter', 
  onClose, 
  onShare, 
  onEdit, 
  onSendMessage 
}: ContactProfilePanelProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="mb-6 h-8 px-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contacts
        </Button>

        {/* Avatar and Basic Info */}
        <div className="text-center mb-6">
          {contact.enriched_data?.profile_photo ? (
            <div className="relative mb-4">
              <img
                src={contact.enriched_data.profile_photo}
                alt={contact.name}
                className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-border"
              />
              {userPlan !== 'starter' && (
                <div className="absolute -bottom-1 -right-1">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-1 rounded-lg">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Enhanced
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className={`w-20 h-20 ${getAvatarColor(contact.name)} rounded-full flex items-center justify-center text-white text-xl font-semibold mx-auto mb-4 shadow-md`}>
              {getInitials(contact.name)}
            </div>
          )}
          
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-text-primary">{contact.name}</h2>
            {contact.job_title && (
              <p className="text-sm text-text-secondary font-medium">{contact.job_title}</p>
            )}
            <p className="text-sm text-text-tertiary">{contact.company}</p>
          </div>
        </div>

        {/* Zero-Click Recall - Context Summary */}
        {contact.context && (Object.keys(contact.context).some(key => contact.context[key])) && (
          <Card className="p-4 mb-6 bg-primary-light border-primary/20 rounded-xl">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                <Brain className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm font-semibold text-primary">Quick Recall</span>
            </div>
            
            <div className="space-y-2">
              {contact.context.where_met && (
                <div className="flex items-start space-x-2">
                  <MapPinIcon className="h-3 w-3 text-text-secondary mt-1 flex-shrink-0" />
                  <p className="text-xs text-text-secondary">
                    <span className="font-medium">Met:</span> {contact.context.where_met}
                  </p>
                </div>
              )}
              
              {contact.context.meeting_date && (
                <div className="flex items-start space-x-2">
                  <CalendarIcon className="h-3 w-3 text-text-secondary mt-1 flex-shrink-0" />
                  <p className="text-xs text-text-secondary">
                    <span className="font-medium">When:</span> {new Date(contact.context.meeting_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              {contact.context.what_discussed && (
                <div className="flex items-start space-x-2">
                  <MessageSquare className="h-3 w-3 text-text-secondary mt-1 flex-shrink-0" />
                  <p className="text-xs text-text-secondary">
                    <span className="font-medium">Discussed:</span> {contact.context.what_discussed}
                  </p>
                </div>
              )}
              
              {contact.context.next_meeting && (
                <div className="flex items-start space-x-2">
                  <Clock className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                  <p className="text-xs text-primary font-medium">
                    Next meeting: {new Date(contact.context.next_meeting).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Priority Badge */}
        {contact.context?.priority_level && (
          <div className="mb-4">
            <Badge className={`w-full justify-center py-2 rounded-lg font-medium ${getPriorityColor(contact.context.priority_level)}`}>
              {getPriorityIcon(contact.context.priority_level) && 
                React.createElement(getPriorityIcon(contact.context.priority_level)!, { className: "h-3 w-3 mr-1" })
              }
              <span className="capitalize">{contact.context.priority_level} Priority</span>
            </Badge>
          </div>
        )}

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-medium text-text-tertiary mb-2 uppercase tracking-wide">Tags</h4>
            <div className="flex flex-wrap gap-1">
              {contact.tags.map((tag: string, index: number) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs px-2 py-1 rounded-lg bg-surface border-border"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className="p-6 border-b border-border">
        <h4 className="text-xs font-medium text-text-tertiary mb-3 uppercase tracking-wide">Contact Information</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-surface-hover transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm text-text-primary font-medium">{contact.email}</span>
          </div>
          
          {contact.phone && (
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-surface-hover transition-colors">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <Phone className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm text-text-primary font-medium">{contact.phone}</span>
            </div>
          )}
          
          {contact.location && (
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-surface-hover transition-colors">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-orange-600" />
              </div>
              <span className="text-sm text-text-primary font-medium">{contact.location}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-surface-hover transition-colors">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Building className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-sm text-text-primary font-medium">{contact.company}</span>
          </div>
          
          {contact.website && (
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-surface-hover transition-colors">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Globe className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-sm text-text-primary font-medium">{contact.website}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 space-y-3 flex-1 flex flex-col justify-end">
        <Button 
          onClick={onShare}
          className="w-full bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl h-12 font-medium shadow-sm"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          Share Contact
        </Button>
        
        <Button 
          onClick={onEdit}
          variant="outline" 
          className="w-full border-border hover:bg-surface-hover rounded-xl h-12 font-medium"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Contact
        </Button>
        
        <Button 
          onClick={onSendMessage}
          variant="outline" 
          className="w-full border-border hover:bg-surface-hover rounded-xl h-12 font-medium"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Send Message
        </Button>
      </div>
    </div>
  )
}