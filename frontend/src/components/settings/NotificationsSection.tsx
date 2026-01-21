import React, { useState, useEffect } from 'react'
import { Loader2, Bell } from 'lucide-react'
import { Switch } from '../ui/switch'
import { Card } from '../ui/card'
import { useToast } from '../ui/toast'
import { settingsApi, NotificationPreferences } from '../../api/settingsApi'

export function NotificationsSection() {
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useToast()
  
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    newLeadCaptured: true,
    weeklyAnalytics: true,
    email: true,
    push: true,
    marketing: false
  })

  // Load notification preferences on mount
  useEffect(() => {
    loadNotificationPreferences()
  }, [])

  const loadNotificationPreferences = async () => {
    try {
      setIsLoading(true)
      const preferences = await settingsApi.getNotificationPreferences()
      setNotifications(preferences)
    } catch (error) {
      console.error('Error loading notification preferences:', error)
      addToast({
        type: 'error',
        title: 'Failed to load preferences',
        message: 'Please try refreshing the page'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationChange = async (key: string, value: boolean) => {
    // Optimistically update the UI
    setNotifications(prev => ({ ...prev, [key]: value }))
    
    // Save the change immediately to the backend
    try {
      await settingsApi.updateNotificationPreferences({ [key]: value })
      addToast({
        type: 'success',
        title: 'Preference Updated',
        message: `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} preference updated successfully`
      })
    } catch (error) {
      console.error('Error updating notification preference:', error)
      // Revert the optimistic update on error
      setNotifications(prev => ({ ...prev, [key]: !value }))
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update preference. Please try again.'
      })
    }
  }


  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-foreground mb-6">Notifications</h3>
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading preferences...</span>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-foreground mb-6">Notifications</h3>
        
        <Card className="p-6 bg-card border-border">
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-foreground font-semibold">Notification Preferences</h4>
                <p className="text-sm text-muted-foreground">Choose how you want to be notified</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Email Notifications */}
              <div>
                <h5 className="text-foreground mb-4 font-medium">Email Notifications</h5>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">General email notifications</p>
                      <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">New lead captured</p>
                      <p className="text-sm text-muted-foreground">Get notified when someone fills out your contact form</p>
                    </div>
                    <Switch
                      checked={notifications.newLeadCaptured}
                      onCheckedChange={(checked) => handleNotificationChange('newLeadCaptured', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Weekly analytics summary</p>
                      <p className="text-sm text-muted-foreground">Performance summary every Monday</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyAnalytics}
                      onCheckedChange={(checked) => handleNotificationChange('weeklyAnalytics', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Marketing communications</p>
                      <p className="text-sm text-muted-foreground">Product updates, tips, and promotional content</p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Push Notifications */}
              <div>
                <h5 className="text-foreground mb-4 font-medium">Push Notifications</h5>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Browser push notifications</p>
                      <p className="text-sm text-muted-foreground">Receive real-time notifications in your browser</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                Preferences are saved automatically when changed
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}