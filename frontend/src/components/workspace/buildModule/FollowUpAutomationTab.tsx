import React, { useState, useEffect } from 'react'
import { Clock, Mail, MessageCircle, Phone, Plus, Trash2, Settings, Zap, Target, Calendar, Users, BarChart3, Bell, Send, CheckCircle, AlertCircle, Edit3, Copy, Smartphone } from 'lucide-react'
import { Card } from '../../ui/card'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Switch } from '../../ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion'
import { toast } from 'sonner@2.0.3'

interface FollowUpRule {
  id: string
  name: string
  enabled: boolean
  trigger: 'immediate' | 'time_delay' | 'behavior' | 'custom'
  delay: {
    value: number
    unit: 'minutes' | 'hours' | 'days' | 'weeks'
  }
  conditions: {
    type: 'card_viewed' | 'link_clicked' | 'contact_added' | 'time_spent' | 'device_type' | 'location' | 'referrer'
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'
    value: string
  }[]
  channels: {
    email: {
      enabled: boolean
      template: string
      subject: string
      timing: 'immediate' | 'business_hours' | 'custom'
      customTime?: string
    }
    imessage: {
      enabled: boolean
      template: string
      timing: 'immediate' | 'business_hours' | 'custom'
      customTime?: string
    }
    whatsapp: {
      enabled: boolean
      template: string
      timing: 'immediate' | 'business_hours' | 'custom'
      customTime?: string
    }
  }
  personalization: {
    useContactName: boolean
    useCompanyName: boolean
    useReferralSource: boolean
    useLocationData: boolean
    customVariables: { key: string, value: string }[]
  }
}

interface FollowUpStats {
  totalSent: number
  emailsSent: number
  imessagesSent: number
  whatsappSent: number
  responseRate: number
  conversionRate: number
  avgResponseTime: string
}

interface FollowUpAutomationTabProps {
  profileData: any
  onSave?: (data: any) => void
}

export function FollowUpAutomationTab({ profileData, onSave }: FollowUpAutomationTabProps) {
  const [followUpRules, setFollowUpRules] = useState<FollowUpRule[]>([])
  const [isEnabled, setIsEnabled] = useState(false)
  const [selectedRule, setSelectedRule] = useState<string | null>(null)
  const [stats, setStats] = useState<FollowUpStats>({
    totalSent: 0,
    emailsSent: 0,
    imessagesSent: 0,
    whatsappSent: 0,
    responseRate: 0,
    conversionRate: 0,
    avgResponseTime: '0m'
  })
  const [globalSettings, setGlobalSettings] = useState({
    timezone: 'America/New_York',
    businessHours: {
      start: '09:00',
      end: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    respectDND: true,
    maxFollowUps: 3,
    unsubscribeLink: true
  })

  // Default rule template
  const createDefaultRule = (): FollowUpRule => ({
    id: Math.random().toString(36).substr(2, 9),
    name: 'Welcome Follow-up',
    enabled: true,
    trigger: 'time_delay',
    delay: { value: 1, unit: 'hours' },
    conditions: [],
    channels: {
      email: {
        enabled: true,
        template: `Hi {name},\n\nThanks for checking out my digital business card! I wanted to personally follow up and see if you have any questions.\n\nFeel free to reach out if you'd like to connect or discuss potential opportunities.\n\nBest regards,\n{senderName}`,
        subject: 'Great meeting you!',
        timing: 'business_hours'
      },
      imessage: {
        enabled: false,
        template: `Hi {name}! Thanks for checking out my Leo card. Would love to connect further! 📱`,
        timing: 'business_hours'
      },
      whatsapp: {
        enabled: false,
        template: `Hi {name}! 👋 Thanks for viewing my digital business card. I'd love to connect and explore potential opportunities together!`,
        timing: 'business_hours'
      }
    },
    personalization: {
      useContactName: true,
      useCompanyName: true,
      useReferralSource: false,
      useLocationData: false,
      customVariables: []
    }
  })

  // Load existing rules
  useEffect(() => {
    // Load from saved data or create default rule
    if (profileData?.followUpRules) {
      setFollowUpRules(profileData.followUpRules)
      setIsEnabled(profileData.followUpEnabled || false)
    } else {
      const defaultRule = createDefaultRule()
      setFollowUpRules([defaultRule])
      setSelectedRule(defaultRule.id)
    }
  }, [profileData])

  const handleSave = () => {
    const data = {
      followUpEnabled: isEnabled,
      followUpRules,
      globalSettings
    }
    onSave?.(data)
    toast.success('Follow-up automation settings saved!')
  }

  const addNewRule = () => {
    const newRule = createDefaultRule()
    newRule.name = `Follow-up Rule ${followUpRules.length + 1}`
    setFollowUpRules([...followUpRules, newRule])
    setSelectedRule(newRule.id)
  }

  const updateRule = (ruleId: string, updates: Partial<FollowUpRule>) => {
    setFollowUpRules(rules => 
      rules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    )
  }

  const deleteRule = (ruleId: string) => {
    setFollowUpRules(rules => rules.filter(rule => rule.id !== ruleId))
    if (selectedRule === ruleId) {
      setSelectedRule(followUpRules[0]?.id || null)
    }
  }

  const duplicateRule = (ruleId: string) => {
    const rule = followUpRules.find(r => r.id === ruleId)
    if (rule) {
      const newRule = { 
        ...rule, 
        id: Math.random().toString(36).substr(2, 9),
        name: `${rule.name} (Copy)`
      }
      setFollowUpRules([...followUpRules, newRule])
    }
  }

  const selectedRuleData = followUpRules.find(rule => rule.id === selectedRule)

  const triggerOptions = [
    { value: 'immediate', label: 'Immediately after card view' },
    { value: 'time_delay', label: 'Time delay after view' },
    { value: 'behavior', label: 'Based on user behavior' },
    { value: 'custom', label: 'Custom conditions' }
  ]

  const conditionTypes = [
    { value: 'card_viewed', label: 'Card Viewed' },
    { value: 'link_clicked', label: 'Link Clicked' },
    { value: 'contact_added', label: 'Contact Added' },
    { value: 'time_spent', label: 'Time Spent on Card' },
    { value: 'device_type', label: 'Device Type' },
    { value: 'location', label: 'Geographic Location' },
    { value: 'referrer', label: 'Referral Source' }
  ]

  return (
    <div 
      className="p-6"
      style={{ 
        backgroundColor: 'var(--color-background)',
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family)'
            }}
          >
            Follow-up Automation
          </h3>
          <p 
            className="mt-1"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-family)'
            }}
          >
            Automatically nurture leads with intelligent multi-channel follow-ups
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Label 
            htmlFor="automation-enabled" 
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family)',
              color: 'var(--color-text-primary)'
            }}
          >
            Enable Automation
          </Label>
          <Switch
            id="automation-enabled"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
        </div>
      </div>

      {!isEnabled && (
        <Card 
          className="p-6 border-2 border-dashed"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-muted)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div className="text-center space-y-3">
            <Zap 
              className="h-12 w-12 mx-auto" 
              style={{ color: 'var(--color-primary)' }}
            />
            <h4 
              style={{
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-base)',
                fontFamily: 'var(--font-family)'
              }}
            >
              Activate Smart Follow-ups
            </h4>
            <p 
              className="max-w-md mx-auto"
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family)'
              }}
            >
              Turn on automation to send personalized follow-up messages via email, iMessage, and WhatsApp based on visitor behavior.
            </p>
            <Button onClick={() => setIsEnabled(true)} className="mt-4">
              <Zap className="h-4 w-4 mr-2" />
              Enable Automation
            </Button>
          </div>
        </Card>
      )}

      {isEnabled && (
        <>
          {/* Stats Overview */}
          <Card 
            className="p-6"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <h4 
              className="mb-4 flex items-center gap-2"
              style={{
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-base)',
                fontFamily: 'var(--font-family)'
              }}
            >
              <BarChart3 
                className="h-5 w-5" 
                style={{ color: 'var(--color-primary)' }}
              />
              Automation Performance
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div 
                  style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  {stats.totalSent}
                </div>
                <div 
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  Total Sent
                </div>
              </div>
              <div className="text-center">
                <div 
                  style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-success)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  {stats.responseRate}%
                </div>
                <div 
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  Response Rate
                </div>
              </div>
              <div className="text-center">
                <div 
                  style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-primary)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  {stats.conversionRate}%
                </div>
                <div 
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  Conversion Rate
                </div>
              </div>
              <div className="text-center">
                <div 
                  style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-info)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  {stats.avgResponseTime}
                </div>
                <div 
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  Avg Response
                </div>
              </div>
            </div>
            <div 
              className="flex justify-center gap-6 mt-4 pt-4 border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-2">
                <Mail 
                  className="h-4 w-4" 
                  style={{ color: 'var(--color-info)' }}
                />
                <span 
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  Email: {stats.emailsSent}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone 
                  className="h-4 w-4" 
                  style={{ color: 'var(--color-success)' }}
                />
                <span 
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  iMessage: {stats.imessagesSent}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle 
                  className="h-4 w-4" 
                  style={{ color: 'var(--color-primary)' }}
                />
                <span 
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  WhatsApp: {stats.whatsappSent}
                </span>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ gap: 'var(--space-6)' }}>
            {/* Rules List */}
            <Card 
              className="p-6"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 
                  style={{
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-base)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  Follow-up Rules
                </h4>
                <Button onClick={addNewRule} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {followUpRules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-3 cursor-pointer transition-colors`}
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      border: `1px solid ${selectedRule === rule.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: selectedRule === rule.id ? 'var(--color-primary-light)' : 'transparent'
                    }}
                    onClick={() => setSelectedRule(rule.id)}
                    onMouseEnter={(e) => {
                      if (selectedRule !== rule.id) {
                        e.currentTarget.style.backgroundColor = 'var(--color-muted)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedRule !== rule.id) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: rule.enabled ? 'var(--color-success)' : 'var(--color-text-tertiary)'
                          }}
                        />
                        <span 
                          style={{
                            fontWeight: 'var(--font-weight-medium)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-primary)',
                            fontFamily: 'var(--font-family)'
                          }}
                        >
                          {rule.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateRule(rule.id)
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteRule(rule.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div 
                      className="mt-1"
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-secondary)',
                        fontFamily: 'var(--font-family)'
                      }}
                    >
                      {rule.trigger === 'time_delay' && `${rule.delay.value} ${rule.delay.unit} delay`}
                      {rule.trigger === 'immediate' && 'Immediate'}
                      {rule.trigger === 'behavior' && 'Behavior-based'}
                      {rule.trigger === 'custom' && 'Custom conditions'}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {rule.channels.email.enabled && (
                        <Badge 
                          variant="outline" 
                          style={{
                            fontSize: 'var(--text-xs)',
                            fontFamily: 'var(--font-family)'
                          }}
                        >
                          Email
                        </Badge>
                      )}
                      {rule.channels.imessage.enabled && (
                        <Badge 
                          variant="outline" 
                          style={{
                            fontSize: 'var(--text-xs)',
                            fontFamily: 'var(--font-family)'
                          }}
                        >
                          iMessage
                        </Badge>
                      )}
                      {rule.channels.whatsapp.enabled && (
                        <Badge 
                          variant="outline" 
                          style={{
                            fontSize: 'var(--text-xs)',
                            fontFamily: 'var(--font-family)'
                          }}
                        >
                          WhatsApp
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Rule Configuration */}
            <div className="lg:col-span-2">
              {selectedRuleData ? (
                <Card 
                  className="p-6"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Input
                        value={selectedRuleData.name}
                        onChange={(e) => updateRule(selectedRule!, { name: e.target.value })}
                        className="border-none p-0 h-auto bg-transparent"
                        style={{
                          fontWeight: 'var(--font-weight-semibold)',
                          fontSize: 'var(--text-lg)',
                          fontFamily: 'var(--font-family)',
                          color: 'var(--color-text-primary)'
                        }}
                      />
                      <Switch
                        checked={selectedRuleData.enabled}
                        onCheckedChange={(enabled) => updateRule(selectedRule!, { enabled })}
                      />
                    </div>
                  </div>

                  <Tabs 
                    defaultValue="trigger" 
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-6)'
                    }}
                  >
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="trigger">Trigger</TabsTrigger>
                      <TabsTrigger value="channels">Channels</TabsTrigger>
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="timing">Timing</TabsTrigger>
                    </TabsList>

                    <TabsContent 
                      value="trigger" 
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-4)'
                      }}
                    >
                      <div>
                        <Label 
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-weight-medium)',
                            color: 'var(--color-text-primary)',
                            fontFamily: 'var(--font-family)'
                          }}
                        >
                          Trigger Type
                        </Label>
                        <Select
                          value={selectedRuleData.trigger}
                          onValueChange={(trigger: any) => updateRule(selectedRule!, { trigger })}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {triggerOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedRuleData.trigger === 'time_delay' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label 
                              style={{
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-weight-medium)',
                                color: 'var(--color-text-primary)',
                                fontFamily: 'var(--font-family)'
                              }}
                            >
                              Delay Amount
                            </Label>
                            <Input
                              type="number"
                              value={selectedRuleData.delay.value}
                              onChange={(e) => updateRule(selectedRule!, {
                                delay: { ...selectedRuleData.delay, value: parseInt(e.target.value) || 0 }
                              })}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label 
                              style={{
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-weight-medium)',
                                color: 'var(--color-text-primary)',
                                fontFamily: 'var(--font-family)'
                              }}
                            >
                              Time Unit
                            </Label>
                            <Select
                              value={selectedRuleData.delay.unit}
                              onValueChange={(unit: any) => updateRule(selectedRule!, {
                                delay: { ...selectedRuleData.delay, unit }
                              })}
                            >
                              <SelectTrigger className="mt-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="minutes">Minutes</SelectItem>
                                <SelectItem value="hours">Hours</SelectItem>
                                <SelectItem value="days">Days</SelectItem>
                                <SelectItem value="weeks">Weeks</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {selectedRuleData.conditions.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium text-text-primary">Conditions</Label>
                          <div className="space-y-2 mt-2">
                            {selectedRuleData.conditions.map((condition, index) => (
                              <div key={index} className="flex gap-2 items-center p-3 border border-border rounded-lg">
                                <Select value={condition.type}>
                                  <SelectTrigger className="flex-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {conditionTypes.map(type => (
                                      <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Select value={condition.operator}>
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="equals">Equals</SelectItem>
                                    <SelectItem value="not_equals">Not Equals</SelectItem>
                                    <SelectItem value="greater_than">Greater Than</SelectItem>
                                    <SelectItem value="less_than">Less Than</SelectItem>
                                    <SelectItem value="contains">Contains</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  value={condition.value}
                                  className="flex-1"
                                  placeholder="Value"
                                />
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newCondition = {
                            type: 'card_viewed' as const,
                            operator: 'equals' as const,
                            value: ''
                          }
                          updateRule(selectedRule!, {
                            conditions: [...selectedRuleData.conditions, newCondition]
                          })
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Condition
                      </Button>
                    </TabsContent>

                    <TabsContent 
                      value="channels" 
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-4)'
                      }}
                    >
                      <div className="space-y-4">
                        {/* Email Channel */}
                        <Card 
                          className="p-4"
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)'
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Mail 
                                className="h-5 w-5" 
                                style={{ color: 'var(--color-info)' }}
                              />
                              <span 
                                style={{
                                  fontWeight: 'var(--font-weight-medium)',
                                  color: 'var(--color-text-primary)',
                                  fontSize: 'var(--text-base)',
                                  fontFamily: 'var(--font-family)'
                                }}
                              >
                                Email
                              </span>
                            </div>
                            <Switch
                              checked={selectedRuleData.channels.email.enabled}
                              onCheckedChange={(enabled) => updateRule(selectedRule!, {
                                channels: {
                                  ...selectedRuleData.channels,
                                  email: { ...selectedRuleData.channels.email, enabled }
                                }
                              })}
                            />
                          </div>
                          {selectedRuleData.channels.email.enabled && (
                            <div className="space-y-3">
                              <div>
                                <Label 
                                  style={{
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 'var(--font-weight-medium)',
                                    color: 'var(--color-text-primary)',
                                    fontFamily: 'var(--font-family)'
                                  }}
                                >
                                  Email Subject
                                </Label>
                                <Input
                                  value={selectedRuleData.channels.email.subject}
                                  onChange={(e) => updateRule(selectedRule!, {
                                    channels: {
                                      ...selectedRuleData.channels,
                                      email: { ...selectedRuleData.channels.email, subject: e.target.value }
                                    }
                                  })}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label 
                                  style={{
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 'var(--font-weight-medium)',
                                    color: 'var(--color-text-primary)',
                                    fontFamily: 'var(--font-family)'
                                  }}
                                >
                                  Send Timing
                                </Label>
                                <Select
                                  value={selectedRuleData.channels.email.timing}
                                  onValueChange={(timing: any) => updateRule(selectedRule!, {
                                    channels: {
                                      ...selectedRuleData.channels,
                                      email: { ...selectedRuleData.channels.email, timing }
                                    }
                                  })}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="immediate">Immediate</SelectItem>
                                    <SelectItem value="business_hours">Business Hours Only</SelectItem>
                                    <SelectItem value="custom">Custom Time</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </Card>

                        {/* iMessage Channel */}
                        <Card className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-5 w-5 text-success" />
                              <span className="font-medium text-text-primary">iMessage</span>
                              <Badge variant="outline" className="text-xs">iOS</Badge>
                            </div>
                            <Switch
                              checked={selectedRuleData.channels.imessage.enabled}
                              onCheckedChange={(enabled) => updateRule(selectedRule!, {
                                channels: {
                                  ...selectedRuleData.channels,
                                  imessage: { ...selectedRuleData.channels.imessage, enabled }
                                }
                              })}
                            />
                          </div>
                          {selectedRuleData.channels.imessage.enabled && (
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm">Send Timing</Label>
                                <Select
                                  value={selectedRuleData.channels.imessage.timing}
                                  onValueChange={(timing: any) => updateRule(selectedRule!, {
                                    channels: {
                                      ...selectedRuleData.channels,
                                      imessage: { ...selectedRuleData.channels.imessage, timing }
                                    }
                                  })}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="immediate">Immediate</SelectItem>
                                    <SelectItem value="business_hours">Business Hours Only</SelectItem>
                                    <SelectItem value="custom">Custom Time</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="p-3 bg-info/10 rounded-lg">
                                <p className="text-xs text-text-secondary">
                                  iMessage integration requires user's Apple ID and consent. Messages will be sent via Apple's Business Chat API.
                                </p>
                              </div>
                            </div>
                          )}
                        </Card>

                        {/* WhatsApp Channel */}
                        <Card className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <MessageCircle className="h-5 w-5 text-primary" />
                              <span className="font-medium text-text-primary">WhatsApp</span>
                              <Badge variant="outline" className="text-xs">Global</Badge>
                            </div>
                            <Switch
                              checked={selectedRuleData.channels.whatsapp.enabled}
                              onCheckedChange={(enabled) => updateRule(selectedRule!, {
                                channels: {
                                  ...selectedRuleData.channels,
                                  whatsapp: { ...selectedRuleData.channels.whatsapp, enabled }
                                }
                              })}
                            />
                          </div>
                          {selectedRuleData.channels.whatsapp.enabled && (
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm">Send Timing</Label>
                                <Select
                                  value={selectedRuleData.channels.whatsapp.timing}
                                  onValueChange={(timing: any) => updateRule(selectedRule!, {
                                    channels: {
                                      ...selectedRuleData.channels,
                                      whatsapp: { ...selectedRuleData.channels.whatsapp, timing }
                                    }
                                  })}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="immediate">Immediate</SelectItem>
                                    <SelectItem value="business_hours">Business Hours Only</SelectItem>
                                    <SelectItem value="custom">Custom Time</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="p-3 bg-success/10 rounded-lg">
                                <p className="text-xs text-text-secondary">
                                  WhatsApp Business API integration. Messages comply with WhatsApp's business messaging policies.
                                </p>
                              </div>
                            </div>
                          )}
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="content" className="space-y-4">
                      <Accordion type="single" collapsible className="space-y-2">
                        {selectedRuleData.channels.email.enabled && (
                          <AccordionItem value="email">
                            <AccordionTrigger className="text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email Template
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-3">
                              <Textarea
                                value={selectedRuleData.channels.email.template}
                                onChange={(e) => updateRule(selectedRule!, {
                                  channels: {
                                    ...selectedRuleData.channels,
                                    email: { ...selectedRuleData.channels.email, template: e.target.value }
                                  }
                                })}
                                rows={6}
                                placeholder="Enter your email template..."
                              />
                              <div 
                                style={{
                                  fontSize: 'var(--text-xs)',
                                  color: 'var(--color-text-secondary)',
                                  fontFamily: 'var(--font-family)'
                                }}
                              >
                                Available variables: {'{name}'}, {'{company}'}, {'{senderName}'}, {'{cardUrl}'}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        )}

                        {selectedRuleData.channels.imessage.enabled && (
                          <AccordionItem value="imessage">
                            <AccordionTrigger className="text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <Smartphone className="h-4 w-4" />
                                iMessage Template
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-3">
                              <Textarea
                                value={selectedRuleData.channels.imessage.template}
                                onChange={(e) => updateRule(selectedRule!, {
                                  channels: {
                                    ...selectedRuleData.channels,
                                    imessage: { ...selectedRuleData.channels.imessage, template: e.target.value }
                                  }
                                })}
                                rows={3}
                                placeholder="Enter your iMessage template..."
                              />
                              <div className="text-xs text-text-secondary">
                                Keep messages under 160 characters for optimal delivery. Emojis are supported! 📱
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        )}

                        {selectedRuleData.channels.whatsapp.enabled && (
                          <AccordionItem value="whatsapp">
                            <AccordionTrigger className="text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" />
                                WhatsApp Template
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-3">
                              <Textarea
                                value={selectedRuleData.channels.whatsapp.template}
                                onChange={(e) => updateRule(selectedRule!, {
                                  channels: {
                                    ...selectedRuleData.channels,
                                    whatsapp: { ...selectedRuleData.channels.whatsapp, template: e.target.value }
                                  }
                                })}
                                rows={4}
                                placeholder="Enter your WhatsApp template..."
                              />
                              <div className="text-xs text-text-secondary">
                                WhatsApp supports rich formatting and emojis. Follow WhatsApp business messaging guidelines.
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        )}
                      </Accordion>

                      <Card className="p-4 bg-muted/50">
                        <h5 className="font-medium text-text-primary mb-3">Personalization Settings</h5>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedRuleData.personalization.useContactName}
                              onChange={(e) => updateRule(selectedRule!, {
                                personalization: {
                                  ...selectedRuleData.personalization,
                                  useContactName: e.target.checked
                                }
                              })}
                              className="rounded border-border"
                            />
                            <span className="text-sm">Use contact name</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedRuleData.personalization.useCompanyName}
                              onChange={(e) => updateRule(selectedRule!, {
                                personalization: {
                                  ...selectedRuleData.personalization,
                                  useCompanyName: e.target.checked
                                }
                              })}
                              className="rounded border-border"
                            />
                            <span className="text-sm">Use company name</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedRuleData.personalization.useReferralSource}
                              onChange={(e) => updateRule(selectedRule!, {
                                personalization: {
                                  ...selectedRuleData.personalization,
                                  useReferralSource: e.target.checked
                                }
                              })}
                              className="rounded border-border"
                            />
                            <span className="text-sm">Use referral source</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedRuleData.personalization.useLocationData}
                              onChange={(e) => updateRule(selectedRule!, {
                                personalization: {
                                  ...selectedRuleData.personalization,
                                  useLocationData: e.target.checked
                                }
                              })}
                              className="rounded border-border"
                            />
                            <span className="text-sm">Use location data</span>
                          </label>
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="timing" className="space-y-4">
                      <Card className="p-4">
                        <h5 className="font-medium text-text-primary mb-4">Global Timing Settings</h5>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm">Timezone</Label>
                            <Select value={globalSettings.timezone} onValueChange={(timezone) => 
                              setGlobalSettings({...globalSettings, timezone})
                            }>
                              <SelectTrigger className="mt-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                <SelectItem value="Europe/London">GMT</SelectItem>
                                <SelectItem value="Europe/Paris">CET</SelectItem>
                                <SelectItem value="Asia/Tokyo">JST</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">Business Hours Start</Label>
                              <Input
                                type="time"
                                value={globalSettings.businessHours.start}
                                onChange={(e) => setGlobalSettings({
                                  ...globalSettings,
                                  businessHours: { ...globalSettings.businessHours, start: e.target.value }
                                })}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Business Hours End</Label>
                              <Input
                                type="time"
                                value={globalSettings.businessHours.end}
                                onChange={(e) => setGlobalSettings({
                                  ...globalSettings,
                                  businessHours: { ...globalSettings.businessHours, end: e.target.value }
                                })}
                                className="mt-2"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">Max Follow-ups per Contact</Label>
                              <Input
                                type="number"
                                value={globalSettings.maxFollowUps}
                                onChange={(e) => setGlobalSettings({
                                  ...globalSettings,
                                  maxFollowUps: parseInt(e.target.value) || 3
                                })}
                                className="mt-2"
                              />
                            </div>
                            <div className="space-y-3 mt-2">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={globalSettings.respectDND}
                                  onChange={(e) => setGlobalSettings({
                                    ...globalSettings,
                                    respectDND: e.target.checked
                                  })}
                                  className="rounded border-border"
                                />
                                <span className="text-sm">Respect Do Not Disturb</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={globalSettings.unsubscribeLink}
                                  onChange={(e) => setGlobalSettings({
                                    ...globalSettings,
                                    unsubscribeLink: e.target.checked
                                  })}
                                  className="rounded border-border"
                                />
                                <span className="text-sm">Include unsubscribe link</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </Card>
              ) : (
                <Card 
                  className="p-12 text-center"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  <Target 
                    className="h-12 w-12 mx-auto mb-4" 
                    style={{ color: 'var(--color-text-tertiary)' }}
                  />
                  <h4 
                    className="mb-2"
                    style={{
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--text-base)',
                      fontFamily: 'var(--font-family)'
                    }}
                  >
                    Select a Follow-up Rule
                  </h4>
                  <p 
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family)'
                    }}
                  >
                    Choose a rule from the left panel to configure its settings, channels, and timing.
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div 
            className="flex justify-end pt-4 border-t"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <Button 
              onClick={handleSave} 
              className="px-8"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-primary-foreground)',
                fontFamily: 'var(--font-family)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Automation Settings
            </Button>
          </div>
        </>
      )}
    </div>
  )
}