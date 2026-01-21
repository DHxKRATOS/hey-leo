import React, { useState } from 'react'
import { motion } from 'motion/react'
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  Crown,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  FileText,
  Globe
} from 'lucide-react'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Card } from './ui/card'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

interface AICreditUsageWidgetProps {
  userPlan?: 'starter' | 'professional' | 'executive'
  onUpgrade?: () => void
}

export function AICreditUsageWidget({ 
  userPlan = 'starter', 
  onUpgrade 
}: AICreditUsageWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Mock credit data based on plan
  const creditLimits = {
    starter: 50,
    professional: 500,
    executive: 2000
  }

  const usedCredits = {
    starter: 37,
    professional: 283,
    executive: 756
  }

  const currentLimit = creditLimits[userPlan]
  const currentUsed = usedCredits[userPlan]
  const usagePercentage = (currentUsed / currentLimit) * 100
  const creditsRemaining = currentLimit - currentUsed

  // Reset date (monthly cycle)
  const resetDate = new Date()
  resetDate.setMonth(resetDate.getMonth() + 1, 1)
  const daysUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  // Get status color and icon
  const getStatusInfo = () => {
    if (usagePercentage >= 90) {
      return {
        color: 'text-error',
        bgColor: 'bg-error/10',
        borderColor: 'border-error/20',
        icon: AlertCircle,
        status: 'Critical'
      }
    }
    if (usagePercentage >= 75) {
      return {
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        borderColor: 'border-warning/20',
        icon: TrendingUp,
        status: 'High Usage'
      }
    }
    return {
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
      icon: Zap,
      status: 'Healthy'
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${statusInfo.bgColor} ${statusInfo.borderColor} hover:bg-opacity-80`}>
          <div className="flex items-center space-x-2">
            <Zap className={`w-4 h-4 ${statusInfo.color}`} />
            <div className="text-left">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-text-primary">
                  {creditsRemaining}
                </span>
                <span className="text-xs text-text-secondary">left</span>
              </div>
              <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    usagePercentage >= 90 ? 'bg-error' :
                    usagePercentage >= 75 ? 'bg-warning' : 'bg-success'
                  }`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>
          </div>
          {isOpen ? 
            <ChevronUp className="w-4 h-4 text-text-secondary" /> : 
            <ChevronDown className="w-4 h-4 text-text-secondary" />
          }
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-text-primary">AI Credits</h3>
              </div>
              <Badge variant="outline" className="text-xs">
                {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan
              </Badge>
            </div>

            {/* AI Credit Usage Guide */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-text-primary mb-3">AI Credit Usage Guide</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-3 h-3 text-text-secondary" />
                    <span className="text-text-secondary">AI response/message</span>
                  </div>
                  <span className="text-text-primary font-medium">1 credit</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-3 h-3 text-text-secondary" />
                    <span className="text-text-secondary">Document processed</span>
                  </div>
                  <span className="text-text-primary font-medium">5 credits</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-3 h-3 text-text-secondary" />
                    <span className="text-text-secondary">Website crawled</span>
                  </div>
                  <span className="text-text-primary font-medium">10 credits</span>
                </div>
              </div>
            </div>

            {/* Usage Overview */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">Usage this month</span>
                  <span className="text-sm font-medium text-text-primary">
                    {currentUsed} / {currentLimit}
                  </span>
                </div>
                <Progress 
                  value={usagePercentage} 
                  className="h-2"
                />
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className={statusInfo.color}>
                    {statusInfo.status}
                  </span>
                  <span className="text-text-tertiary">
                    {usagePercentage.toFixed(1)}% used
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <RefreshCw className="w-3 h-3 text-text-secondary" />
                    <span className="text-xs font-medium text-text-secondary">Resets in</span>
                  </div>
                  <span className="text-sm font-semibold text-text-primary">
                    {daysUntilReset} days
                  </span>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="w-3 h-3 text-text-secondary" />
                    <span className="text-xs font-medium text-text-secondary">Daily avg</span>
                  </div>
                  <span className="text-sm font-semibold text-text-primary">
                    {Math.round(currentUsed / 30)} credits
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border space-y-2">
                {usagePercentage >= 80 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-warning/10 border border-warning/20 rounded-lg"
                  >
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-warning">Running low on credits</p>
                        <p className="text-xs text-text-secondary mt-1">
                          Upgrade your plan to get more AI credits and continue using all features.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {userPlan !== 'executive' && (
                  <Button
                    variant="leo-primary"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => {
                      onUpgrade?.()
                      setIsOpen(false)
                    }}
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade Plan
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  )
}