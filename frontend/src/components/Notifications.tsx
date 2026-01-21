import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  X, 
  AlertCircle, 
  Info, 
  Loader2, 
  Bug, 
  User, 
  Settings,
  ExternalLink,
  Globe,
  Sparkles,
  Eye,
  QrCode
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Separator } from './ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface SuccessNotificationProps {
  message: string
  onDismiss?: () => void
}

export function SuccessNotification({ message, onDismiss }: SuccessNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      if (onDismiss) {
        setTimeout(onDismiss, 300) // Allow for fade out animation
      }
    }, 4000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="fixed bottom-4 right-4 z-50 bg-success text-success-foreground p-4 rounded-xl shadow-lg border border-success/20 backdrop-blur-sm"
        style={{ minWidth: '320px', maxWidth: '400px' }}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{message}</p>
          </div>
          {onDismiss && (
            <button
              onClick={() => {
                setIsVisible(false)
                setTimeout(onDismiss, 300)
              }}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

interface ErrorNotificationProps {
  message: string
  onDismiss: () => void
}

export function ErrorNotification({ message, onDismiss }: ErrorNotificationProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="fixed bottom-4 right-4 z-50 bg-error text-error-foreground p-4 rounded-xl shadow-lg border border-error/20 backdrop-blur-sm"
        style={{ minWidth: '320px', maxWidth: '400px' }}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{message}</p>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

interface LoadingSpinnerProps {
  authError: string | null
}

export function LoadingSpinner({ authError }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-4"
      >
        <div className="w-16 h-16 mx-auto">
          <div className="w-full h-full rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">Loading Leo...</h3>
          <p className="text-text-secondary">
            {authError ? 'Retrying connection...' : 'Initializing your AI-powered business cards'}
          </p>
        </div>
        
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </motion.div>
    </div>
  )
}

interface DemoButtonProps {
  onClick: () => void
  loading: boolean
}

export function DemoButton({ onClick, loading }: DemoButtonProps) {
  const [showExternalOptions, setShowExternalOptions] = useState(false)

  // Generate demo card URLs
  const baseUrl = window.location.origin
  const demoCardUrls = {
    query: `${baseUrl}/?card=demo-card-123`,
    short: `${baseUrl}/c/demo-card-123`,
    username: `${baseUrl}/@sarah/business-card`
  }

  const openExternalCard = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 left-6 z-50 space-y-3">
        {/* External Card Options */}
        <AnimatePresence>
          {showExternalOptions && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-surface border border-border rounded-xl shadow-lg p-4 mb-3"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Test External Card View</span>
                </div>
                
                <div className="text-xs text-text-secondary mb-3">
                  Experience how visitors see your digital business card
                </div>
                
                <div className="grid gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openExternalCard(demoCardUrls.query)}
                    className="justify-start h-8 text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Query Format (?card=id)
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openExternalCard(demoCardUrls.short)}
                    className="justify-start h-8 text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Short URL (/c/id)
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openExternalCard(demoCardUrls.username)}
                    className="justify-start h-8 text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Username (/@user/card)
                  </Button>
                </div>
                
                <Separator />
                
                <div className="text-xs text-text-tertiary space-y-1">
                  <div className="font-medium">Features to test:</div>
                  <ul className="space-y-0.5 ml-2">
                    <li>• AI Chat Widget (Leo AI)</li>
                    <li>• Contact Form & vCard Download</li>
                    <li>• Social Sharing & QR Codes</li>
                    <li>• Mobile Responsive Design</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Demo Button Group */}
        <div className="flex space-x-2">
          {/* External Card Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setShowExternalOptions(!showExternalOptions)}
                variant={showExternalOptions ? "default" : "secondary"}
                size="sm"
                className={`transition-all duration-200 ${
                  showExternalOptions 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'hover:shadow-md'
                }`}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {showExternalOptions ? 'Hide external card options' : 'Test external card view'}
            </TooltipContent>
          </Tooltip>

          {/* Main Demo Button */}
          <Button
            onClick={onClick}
            disabled={loading}
            className="bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Demo...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>Try Demo Mode</span>
              </div>
            )}
          </Button>
        </div>

        {/* Quick Access Info */}
        {!showExternalOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-text-tertiary bg-surface/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50"
          >
            <div className="flex items-center space-x-1">
              <Info className="h-3 w-3" />
              <span>Click the eye icon to test external card view</span>
            </div>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  )
}

interface DebugPanelProps {
  authError: string | null
}

export function DebugPanel({ authError }: DebugPanelProps) {
  return (
    <div className="fixed bottom-4 right-4 z-40 bg-surface border border-border rounded-xl shadow-lg p-4 max-w-sm">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Bug className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Debug Panel</span>
          <Badge variant="secondary" className="text-xs">
            Dev
          </Badge>
        </div>
        
        {authError && (
          <div className="text-xs text-error bg-error/10 p-2 rounded border border-error/20">
            <div className="font-medium mb-1">Auth Error:</div>
            <div className="font-mono">{authError}</div>
          </div>
        )}
        
        <div className="text-xs text-text-secondary space-y-1">
          <div>Environment: Development</div>
          <div>Version: Leo v2.0</div>
          <div>Host: {window.location.hostname}</div>
        </div>
        
        <div className="text-xs text-text-tertiary">
          This panel only appears in development mode
        </div>
      </div>
    </div>
  )
}