import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { 
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Eye,
  Code,
  Settings,
  Ruler,
  Wifi,
  Battery,
  Signal,
  MoreHorizontal,
  RefreshCw,
  Download,
  Share2,
  Play,
  Pause,
  SkipForward,
  Volume2,
  Search,
  Home,
  ArrowLeft,
  Maximize2,
  Minimize2,
  X,
  ExternalLink,
  Info,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Separator } from '../ui/separator'
import { Switch } from '../ui/switch'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { ResponsiveCardRenderer } from '../ResponsiveCardRenderer'
import { toast } from 'sonner@2.0.3'

interface DevicePreviewModeProps {
  cardData: any
  onUpdate?: (updates: any) => void
  className?: string
}

interface DeviceSpec {
  id: string
  name: string
  category: 'desktop' | 'tablet' | 'mobile'
  width: number
  height: number
  devicePixelRatio: number
  viewport: { width: number; height: number }
  userAgent: string
  features: string[]
  icon: React.ReactNode
  frameColor: string
  statusBar: boolean
}

const deviceSpecs: DeviceSpec[] = [
  // Desktop
  {
    id: 'macbook-pro-16',
    name: 'MacBook Pro 16"',
    category: 'desktop',
    width: 1728,
    height: 1117,
    devicePixelRatio: 2,
    viewport: { width: 1728, height: 1117 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    features: ['Retina Display', 'Touch Bar', 'Force Touch'],
    icon: <Monitor className="w-4 h-4" />,
    frameColor: '#E5E7EB',
    statusBar: false
  },
  {
    id: 'imac-24',
    name: 'iMac 24"',
    category: 'desktop',
    width: 1920,
    height: 1080,
    devicePixelRatio: 2,
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    features: ['4.5K Retina Display', 'M1 Chip', 'True Tone'],
    icon: <Monitor className="w-4 h-4" />,
    frameColor: '#F3F4F6',
    statusBar: false
  },
  
  // Tablet
  {
    id: 'ipad-pro-12',
    name: 'iPad Pro 12.9"',
    category: 'tablet',
    width: 1024,
    height: 1366,
    devicePixelRatio: 2,
    viewport: { width: 1024, height: 1366 },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    features: ['Liquid Retina XDR', 'ProMotion', 'Apple Pencil'],
    icon: <Tablet className="w-4 h-4" />,
    frameColor: '#1F2937',
    statusBar: true
  },
  {
    id: 'ipad-air',
    name: 'iPad Air',
    category: 'tablet',
    width: 820,
    height: 1180,
    devicePixelRatio: 2,
    viewport: { width: 820, height: 1180 },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    features: ['Liquid Retina', 'M1 Chip', 'Touch ID'],
    icon: <Tablet className="w-4 h-4" />,
    frameColor: '#374151',
    statusBar: true
  },
  
  // Mobile
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    category: 'mobile',
    width: 393,
    height: 852,
    devicePixelRatio: 3,
    viewport: { width: 393, height: 852 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    features: ['Dynamic Island', 'ProMotion', 'A17 Pro', 'Action Button'],
    icon: <Smartphone className="w-4 h-4" />,
    frameColor: '#1F2937',
    statusBar: true
  },
  {
    id: 'iphone-15',
    name: 'iPhone 15',
    category: 'mobile',
    width: 393,
    height: 852,
    devicePixelRatio: 3,
    viewport: { width: 393, height: 852 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    features: ['Dynamic Island', 'A16 Bionic', 'USB-C'],
    icon: <Smartphone className="w-4 h-4" />,
    frameColor: '#EC4899',
    statusBar: true
  },
  {
    id: 'samsung-s24',
    name: 'Samsung Galaxy S24',
    category: 'mobile',
    width: 384,
    height: 854,
    devicePixelRatio: 3,
    viewport: { width: 384, height: 854 },
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36',
    features: ['Dynamic AMOLED 2X', 'Snapdragon 8 Gen 3', '120Hz'],
    icon: <Smartphone className="w-4 h-4" />,
    frameColor: '#6366F1',
    statusBar: true
  }
]

export function DevicePreviewMode({ cardData, onUpdate, className = '' }: DevicePreviewModeProps) {
  const [selectedDevices, setSelectedDevices] = useState([
    'macbook-pro-16',
    'ipad-pro-12', 
    'iphone-15-pro'
  ])
  const [viewMode, setViewMode] = useState<'side-by-side' | 'stacked' | 'overlay'>('side-by-side')
  const [showDevTools, setShowDevTools] = useState(true)
  const zoomLevel = 100
  const [showGrid, setShowGrid] = useState(false)
  const [showRulers, setShowRulers] = useState(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [activeDevice, setActiveDevice] = useState('iphone-15-pro')
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    paintTime: 0,
    interactionDelay: 0,
    score: 95
  })
  const [interactionTest, setInteractionTest] = useState(false)
  const [networkCondition, setNetworkCondition] = useState('fast-3g')

  const containerRef = useRef<HTMLDivElement>(null)

  // Simulate performance metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceMetrics({
        renderTime: Math.random() * 50 + 10,
        paintTime: Math.random() * 30 + 5,
        interactionDelay: Math.random() * 20 + 2,
        score: Math.floor(Math.random() * 10) + 90
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleDeviceSelect = (deviceId: string) => {
    if (selectedDevices.includes(deviceId)) {
      setSelectedDevices(prev => prev.filter(id => id !== deviceId))
    } else {
      setSelectedDevices(prev => [...prev, deviceId].slice(0, 3)) // Max 3 devices
    }
  }



  const getDeviceFrame = (device: DeviceSpec) => {
    const scale = zoomLevel / 100
    const isLandscape = orientation === 'landscape' && device.category !== 'desktop'
    const width = isLandscape ? device.height : device.width
    const height = isLandscape ? device.width : device.height
    
    return {
      width: width * scale,
      height: height * scale,
      transform: `scale(${scale})`,
      transformOrigin: 'top left'
    }
  }

  const renderStatusBar = (device: DeviceSpec) => {
    if (!device.statusBar) return null

    return (
      <div className="h-11 bg-black flex items-center justify-between px-6 text-white text-sm relative z-10">
        <div className="flex items-center space-x-1">
          <span style={{fontSize: '15px', fontWeight: '600', lineHeight: '24px'}}>9:41</span>
        </div>
        <div className="flex items-center space-x-1">
          <Signal className="w-4 h-4" />
          <Wifi className="w-4 h-4" />
          <Battery className="w-6 h-3" />
        </div>
      </div>
    )
  }

  const renderDevice = (device: DeviceSpec, index: number) => {
    const frameStyle = getDeviceFrame(device)
    const isActive = activeDevice === device.id

    return (
      <motion.div
        key={device.id}
        className={`relative ${
          viewMode === 'side-by-side' ? 'flex-1' : 'w-full'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        {/* Device Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveDevice(device.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-surface hover:bg-surface-hover'
                }`}
              >
                {device.icon}
                <span style={{fontSize: '13px', lineHeight: '20px', fontWeight: '500'}}>{device.name}</span>
              </button>
              <Badge variant="outline" style={{fontSize: '11px', lineHeight: '16px'}}>
                {device.viewport.width}×{device.viewport.height}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              {device.category !== 'desktop' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait')}
                  className="p-2"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toast.success('Screenshot captured! 📸')}
                className="p-2"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Device Frame */}
        <div 
          className="relative bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl mx-auto"
          style={{
            width: frameStyle.width + 'px',
            height: frameStyle.height + 'px',
            backgroundColor: device.frameColor,
            maxWidth: '100%'
          }}
        >
          {/* Device Screen */}
          <div className="absolute inset-2 bg-black rounded-2xl overflow-hidden">
            {renderStatusBar(device)}
            
            {/* Card Content */}
            <div className="flex-1 bg-background overflow-hidden relative">
              <ResponsiveCardRenderer
                cardData={cardData}
                viewMode="live"
                device={device.category === 'desktop' ? 'desktop' : device.category === 'tablet' ? 'tablet' : 'mobile'}
                showChat={true}
                className="h-full"
              />
              
              {/* Grid Overlay */}
              {showGrid && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(242,101,34,0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(242,101,34,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}
                />
              )}
              
              {/* Interaction Test Overlay */}
              {interactionTest && isActive && (
                <motion.div
                  className="absolute inset-0 bg-primary/10 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="bg-surface/95 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg">
                    <Activity className="w-8 h-8 mx-auto mb-3 text-primary animate-pulse" />
                    <h3 style={{fontSize: '17px', lineHeight: '28px', fontWeight: '600'}}>Testing Interactions</h3>
                    <p className="text-muted-foreground" style={{fontSize: '13px', lineHeight: '20px'}}>
                      Simulating user interactions and measuring response times
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Device Details Tooltip */}
          {isActive && (
            <motion.div
              className="absolute -top-2 -right-2 bg-surface border border-border rounded-xl p-3 shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="space-y-1 text-center">
                <p style={{fontSize: '11px', lineHeight: '16px', fontWeight: '500'}}>
                  {device.devicePixelRatio}× DPR
                </p>
                <div className="flex space-x-1">
                  {device.features.slice(0, 2).map((feature, i) => (
                    <Badge key={i} variant="outline" style={{fontSize: '10px', padding: '2px 6px'}}>
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Device Specs */}
        <div className="mt-4 text-center space-y-1">
          <p style={{fontSize: '11px', lineHeight: '16px'}} className="text-muted-foreground">
            Viewport: {device.viewport.width} × {device.viewport.height}
          </p>
          <p style={{fontSize: '11px', lineHeight: '16px'}} className="text-muted-foreground">
            Scale: {zoomLevel}% • DPR: {device.devicePixelRatio}×
          </p>
        </div>
      </motion.div>
    )
  }

  const renderPerformancePanel = () => (
    <Card className="p-4 rounded-2xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 style={{fontSize: '17px', lineHeight: '28px', fontWeight: '600'}}>Performance</h3>
          <Badge 
            variant={performanceMetrics.score >= 90 ? 'default' : 'secondary'}
            className={performanceMetrics.score >= 90 ? 'bg-success text-success-foreground' : ''}
          >
            Score: {performanceMetrics.score}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p style={{fontSize: '11px', lineHeight: '16px'}} className="text-muted-foreground">Render Time</p>
            <p style={{fontSize: '15px', lineHeight: '24px', fontWeight: '600'}}>
              {performanceMetrics.renderTime.toFixed(1)}ms
            </p>
          </div>
          <div className="space-y-1">
            <p style={{fontSize: '11px', lineHeight: '16px'}} className="text-muted-foreground">Paint Time</p>
            <p style={{fontSize: '15px', lineHeight: '24px', fontWeight: '600'}}>
              {performanceMetrics.paintTime.toFixed(1)}ms
            </p>
          </div>
          <div className="space-y-1">
            <p style={{fontSize: '11px', lineHeight: '16px'}} className="text-muted-foreground">Interaction</p>
            <p style={{fontSize: '15px', lineHeight: '24px', fontWeight: '600'}}>
              {performanceMetrics.interactionDelay.toFixed(1)}ms
            </p>
          </div>
          <div className="space-y-1">
            <p style={{fontSize: '11px', lineHeight: '16px'}} className="text-muted-foreground">Network</p>
            <p style={{fontSize: '13px', lineHeight: '20px', fontWeight: '500'}} className="capitalize">
              {networkCondition.replace('-', ' ')}
            </p>
          </div>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => setInteractionTest(!interactionTest)}
          className={`w-full ${interactionTest ? 'bg-primary/10 border-primary/30' : ''}`}
        >
          <Activity className="w-4 h-4 mr-2" />
          {interactionTest ? 'Stop Test' : 'Test Interactions'}
        </Button>
      </div>
    </Card>
  )

  const renderBreakpointInfo = () => (
    <Card className="p-4 rounded-2xl">
      <div className="space-y-4">
        <h3 style={{fontSize: '17px', lineHeight: '28px', fontWeight: '600'}}>Responsive Breakpoints</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span style={{fontSize: '13px', lineHeight: '20px'}} className="text-muted-foreground">Mobile</span>
            <Badge variant="outline" style={{fontSize: '11px', lineHeight: '16px'}}>320px+</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span style={{fontSize: '13px', lineHeight: '20px'}} className="text-muted-foreground">Tablet</span>
            <Badge variant="outline" style={{fontSize: '11px', lineHeight: '16px'}}>768px+</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span style={{fontSize: '13px', lineHeight: '20px'}} className="text-muted-foreground">Desktop</span>
            <Badge variant="outline" style={{fontSize: '11px', lineHeight: '16px'}}>1200px+</Badge>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h4 style={{fontSize: '15px', lineHeight: '24px', fontWeight: '600'}}>Design Tokens</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Primary:</span>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-primary"></div>
                <span style={{fontSize: '11px', lineHeight: '16px'}}>#F26522</span>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Radius:</span>
              <span style={{fontSize: '11px', lineHeight: '16px'}}> 20px</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )

  return (
    <div className={`h-full bg-background ${className}`}>
      {/* Header */}
      <div className="bg-surface/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 style={{fontSize: '21px', lineHeight: '32px', fontWeight: '700', letterSpacing: '-0.02em'}}>
                Device Preview Mode
              </h1>
              <p className="text-muted-foreground" style={{fontSize: '13px', lineHeight: '20px'}}>
                Test your Leo card across all devices
              </p>
            </div>
            
            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
              <Code className="w-3 h-3 mr-1" />
              Developer Mode
            </Badge>
          </div>

          <div className="flex items-center space-x-3">
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="side-by-side">Side by Side</SelectItem>
                <SelectItem value="stacked">Stacked</SelectItem>
                <SelectItem value="overlay">Overlay</SelectItem>
              </SelectContent>
            </Select>



            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDevTools(!showDevTools)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Dev Tools
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Device Selection Sidebar */}
        <div className="w-80 bg-surface/50 backdrop-blur-sm border-r border-border/50 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 style={{fontSize: '17px', lineHeight: '28px', fontWeight: '600'}} className="mb-4">
                Select Devices
              </h3>
              <div className="space-y-2">
                {deviceSpecs.map((device) => (
                  <Card
                    key={device.id}
                    className={`p-3 cursor-pointer transition-all hover:shadow-md rounded-2xl ${
                      selectedDevices.includes(device.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-border-hover'
                    }`}
                    onClick={() => handleDeviceSelect(device.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {device.icon}
                        <div>
                          <p style={{fontSize: '13px', lineHeight: '20px', fontWeight: '500'}}>
                            {device.name}
                          </p>
                          <p className="text-muted-foreground" style={{fontSize: '11px', lineHeight: '16px'}}>
                            {device.viewport.width}×{device.viewport.height}
                          </p>
                        </div>
                      </div>
                      {selectedDevices.includes(device.id) && (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 style={{fontSize: '17px', lineHeight: '28px', fontWeight: '600'}} className="mb-4">
                Testing Options
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span style={{fontSize: '13px', lineHeight: '20px'}}>Show Grid</span>
                  <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                </div>
                <div className="flex items-center justify-between">
                  <span style={{fontSize: '13px', lineHeight: '20px'}}>Show Rulers</span>
                  <Switch checked={showRulers} onCheckedChange={setShowRulers} />
                </div>
                
                <div className="space-y-2">
                  <label style={{fontSize: '13px', lineHeight: '20px', fontWeight: '500'}}>
                    Network Condition
                  </label>
                  <Select value={networkCondition} onValueChange={setNetworkCondition}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast-3g">Fast 3G</SelectItem>
                      <SelectItem value="slow-3g">Slow 3G</SelectItem>
                      <SelectItem value="2g">2G</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {showDevTools && (
              <>
                <Separator />
                {renderPerformancePanel()}
                <Separator />
                {renderBreakpointInfo()}
              </>
            )}
          </div>
        </div>

        {/* Device Preview Area */}
        <div className="flex-1 p-8 overflow-auto">
          <div 
            ref={containerRef}
            className={`
              ${viewMode === 'side-by-side' ? 'flex space-x-8' : 'space-y-8'}
              ${viewMode === 'side-by-side' ? 'justify-center' : ''}
            `}
          >
            {selectedDevices.map((deviceId, index) => {
              const device = deviceSpecs.find(d => d.id === deviceId)
              return device ? renderDevice(device, index) : null
            })}
          </div>

          {selectedDevices.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Monitor className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 style={{fontSize: '17px', lineHeight: '28px', fontWeight: '600'}}>
                    No Devices Selected
                  </h3>
                  <p className="text-muted-foreground" style={{fontSize: '13px', lineHeight: '20px'}}>
                    Choose devices from the sidebar to preview your card
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quality Assurance Panel */}
        {showDevTools && (
          <div className="w-64 bg-surface/50 backdrop-blur-sm border-l border-border/50 p-6 space-y-6">
            <div>
              <h3 style={{fontSize: '17px', lineHeight: '28px', fontWeight: '600'}} className="mb-4">
                QA Checklist
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span style={{fontSize: '13px', lineHeight: '20px'}}>Mobile Responsive</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span style={{fontSize: '13px', lineHeight: '20px'}}>Leo Design System</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span style={{fontSize: '13px', lineHeight: '20px'}}>Cross-Platform</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span style={{fontSize: '13px', lineHeight: '20px'}}>Performance</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 style={{fontSize: '17px', lineHeight: '28px', fontWeight: '600'}} className="mb-4">
                Export Options
              </h3>
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => toast.success('Screenshots captured for all devices! 📸')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  All Screenshots
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => toast.success('Performance report generated! 📊')}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Performance Report
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => toast.success('QA report exported! ✅')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  QA Report
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h3 style={{fontSize: '17px', lineHeight: '28px', fontWeight: '600'}} className="mb-4">
                Test Results
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{fontSize: '11px', lineHeight: '16px'}} className="text-muted-foreground">
                    Accessibility
                  </span>
                  <Badge variant="outline" className="bg-success/10 text-success">98%</Badge>
                </div>
                <div className="flex justify-between">
                  <span style={{fontSize: '11px', lineHeight: '16px'}} className="text-muted-foreground">
                    Performance
                  </span>
                  <Badge variant="outline" className="bg-primary/10 text-primary">95%</Badge>
                </div>
                <div className="flex justify-between">
                  <span style={{fontSize: '11px', lineHeight: '16px'}} className="text-muted-foreground">
                    Compatibility
                  </span>
                  <Badge variant="outline" className="bg-success/10 text-success">100%</Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}