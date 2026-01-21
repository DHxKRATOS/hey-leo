import React from 'react'
import {
  Calendar,
  Bell,
  Bot,
  Shield,
  RefreshCw,
  X
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Separator } from '../ui/separator'
import { formatTimeAgo } from '../../utils/meetingHelpers'
import { SETTINGS_DATA } from '../../utils/meetingConstants'

interface MeetingSettingsPanelProps {
  showSettings: boolean
  onClose: () => void
}

export function MeetingSettingsPanel({ showSettings, onClose }: MeetingSettingsPanelProps) {
  if (!showSettings) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Settings Panel */}
      <div className="absolute right-0 top-0 h-full w-80 bg-card border-l border-border z-50 animate-slide-in-right shadow-xl">
        {/* Settings Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="font-semibold text-foreground">Meeting Settings</h2>
              <p className="text-sm text-muted-foreground">Manage calendar and AI preferences</p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Calendar Sync */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Calendar Sync</h3>
                <p className="text-sm text-muted-foreground">Manage your calendar connection</p>
              </div>
            </div>
            
            <Card className="p-4 bg-card border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Status:</span>
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 text-success animate-pulse" />
                  <span className="text-sm font-medium text-success">Connected</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                Last sync: {formatTimeAgo(SETTINGS_DATA.calendarSync.lastSync)}
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Disconnect Calendar
                </Button>
              </div>
            </Card>
          </div>

          {/* Notifications */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Bell className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Notifications</h3>
                <p className="text-sm text-muted-foreground">Customize your alerts</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <div className="text-sm font-medium text-foreground">Email reminders</div>
                  <div className="text-xs text-muted-foreground">Get email alerts before meetings</div>
                </div>
                <div className="w-10 h-6 bg-primary rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <div className="text-sm font-medium text-foreground">Desktop notifications</div>
                  <div className="text-xs text-muted-foreground">Show browser notifications</div>
                </div>
                <div className="w-10 h-6 bg-primary rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <div className="text-sm font-medium text-foreground">AI prep ready</div>
                  <div className="text-xs text-muted-foreground">Notify when prep is complete</div>
                </div>
                <div className="w-10 h-6 bg-primary rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Prep Settings */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">AI Prep</h3>
                <p className="text-sm text-muted-foreground">Configure intelligent preparation</p>
              </div>
            </div>
            
            <Card className="p-4 bg-card border border-border">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Auto-generate prep</div>
                    <div className="text-xs text-muted-foreground">Automatically prepare for meetings</div>
                  </div>
                  <div className="w-10 h-6 bg-primary rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Prep timing:</span>
                    <span className="text-sm font-medium text-foreground">2 hours before</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    How early to generate meeting insights
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Include contact history</div>
                    <div className="text-xs text-muted-foreground">Use HeyLeo contact data</div>
                  </div>
                  <div className="w-10 h-6 bg-primary rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Card interactions</div>
                    <div className="text-xs text-muted-foreground">Include card view data</div>
                  </div>
                  <div className="w-10 h-6 bg-primary rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Privacy Settings */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Privacy</h3>
                <p className="text-sm text-muted-foreground">Control your data usage</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <div className="text-sm font-medium text-foreground">Anonymize insights</div>
                  <div className="text-xs text-muted-foreground">Remove personal identifiers</div>
                </div>
                <div className="w-10 h-6 bg-primary rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <div className="text-sm font-medium text-foreground">Retain prep data</div>
                  <div className="text-xs text-muted-foreground">Save for future reference</div>
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
  )
}