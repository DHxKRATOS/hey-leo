import React from 'react'
import { BarChart3, Globe, Crown, LinkIcon, TrendingUp, Users, Eye, MousePointer } from 'lucide-react'
import { Card } from '../../ui/card'
import { Label } from '../../ui/label'
import { Switch } from '../../ui/switch'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion'
import { AnalyticsSettings } from '../../../types/buildModule'

interface AnalyticsTabProps {
  analytics: AnalyticsSettings
  userTier: string
  onAnalyticsUpdate: (updates: Partial<AnalyticsSettings>) => void
  expandedSections: string[]
  onExpandedSectionsChange: (sections: string[]) => void
}

export function AnalyticsTab({
  analytics,
  userTier,
  onAnalyticsUpdate,
  expandedSections,
  onExpandedSectionsChange
}: AnalyticsTabProps) {
  return (
    <div className="p-6 space-y-6">
      <Accordion type="multiple" value={expandedSections} onValueChange={onExpandedSectionsChange}>
        
        {/* Overview Stats */}
        <AccordionItem value="overview-stats">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span>Overview Stats</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 text-center bg-card border-border rounded-2xl">
                <div className="text-2xl font-bold text-primary">247</div>
                <div className="text-sm text-muted-foreground">Total Views</div>
                <div className="text-xs text-success mt-1">+12% this week</div>
              </Card>
              <Card className="p-4 text-center bg-card border-border rounded-2xl">
                <div className="text-2xl font-bold text-success">18</div>
                <div className="text-sm text-muted-foreground">Leads Generated</div>
                <div className="text-xs text-success mt-1">+3 this week</div>
              </Card>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 text-center bg-card border-border rounded-2xl">
                <div className="text-2xl font-bold text-info">89</div>
                <div className="text-sm text-muted-foreground">Link Clicks</div>
                <div className="text-xs text-info mt-1">+8% this week</div>
              </Card>
              <Card className="p-4 text-center bg-card border-border rounded-2xl">
                <div className="text-2xl font-bold text-warning">34</div>
                <div className="text-sm text-muted-foreground">QR Scans</div>
                <div className="text-xs text-warning mt-1">+15% this week</div>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Analytics Settings */}
        <AccordionItem value="analytics-settings">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span>Analytics Settings</span>
              <Switch 
                checked={analytics.enabled}
                onCheckedChange={(checked) => onAnalyticsUpdate({ enabled: checked })}
              />
            </div>
          </AccordionTrigger>
          {analytics.enabled && (
            <AccordionContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Track link clicks</Label>
                    <p className="text-xs text-muted-foreground">Monitor which links are clicked</p>
                  </div>
                  <Switch 
                    checked={analytics.track_clicks}
                    onCheckedChange={(checked) => onAnalyticsUpdate({ track_clicks: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Track page views</Label>
                    <p className="text-xs text-muted-foreground">Count total card views</p>
                  </div>
                  <Switch 
                    checked={analytics.track_views}
                    onCheckedChange={(checked) => onAnalyticsUpdate({ track_views: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Device tracking</Label>
                    <p className="text-xs text-muted-foreground">Track device types</p>
                  </div>
                  <Switch 
                    checked={analytics.track_device}
                    onCheckedChange={(checked) => onAnalyticsUpdate({ track_device: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Referrer tracking</Label>
                    <p className="text-xs text-muted-foreground">Track where visitors come from</p>
                  </div>
                  <Switch 
                    checked={analytics.track_referrer}
                    onCheckedChange={(checked) => onAnalyticsUpdate({ track_referrer: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-medium">Location tracking</Label>
                    <Badge variant="outline" className="text-xs gap-1">
                      <Crown className="w-3 h-3" />
                      Pro
                    </Badge>
                  </div>
                  <Switch 
                    checked={analytics.track_location}
                    onCheckedChange={(checked) => onAnalyticsUpdate({ track_location: checked })}
                    disabled={userTier === 'free'}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-medium">Real-time alerts</Label>
                    <Badge variant="outline" className="text-xs gap-1">
                      <Crown className="w-3 h-3" />
                      Executive
                    </Badge>
                  </div>
                  <Switch 
                    checked={analytics.real_time_alerts}
                    onCheckedChange={(checked) => onAnalyticsUpdate({ real_time_alerts: checked })}
                    disabled={userTier !== 'executive'}
                  />
                </div>
              </div>
            </AccordionContent>
          )}
        </AccordionItem>

        {/* Recent Activity */}
        <AccordionItem value="recent-activity">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Recent Activity</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <Card className="p-4 bg-card border-border rounded-2xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <MousePointer className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Link clicks</span>
                  </div>
                  <span className="font-medium">23 this week</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-info" />
                    <span className="text-muted-foreground">Card views</span>
                  </div>
                  <span className="font-medium">47 this week</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-success" />
                    <span className="text-muted-foreground">Form submissions</span>
                  </div>
                  <span className="font-medium">5 this week</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-warning" />
                    <span className="text-muted-foreground">Email signature clicks</span>
                  </div>
                  <span className="font-medium">8 this week</span>
                </div>
              </div>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Top Performing Links */}
        <AccordionItem value="top-links">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <LinkIcon className="h-4 w-4 text-primary" />
              <span>Top Performing Links</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <Card className="p-4 bg-card border-border rounded-2xl">
              <div className="space-y-3">
                {['LinkedIn Profile', 'Website', 'Email Contact', 'Phone Number'].map((link, index) => (
                  <div key={link} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <LinkIcon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{link}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {[15, 8, 5, 3][index]} clicks
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Geographic Data */}
        <AccordionItem value="geographic-data">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-primary" />
              <span>Geographic Data</span>
              <Badge variant="outline" className="text-xs gap-1">
                <Crown className="w-3 h-3" />
                Pro
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <Card className="p-4 bg-card border-border rounded-2xl">
              {userTier !== 'free' ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">United States</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Canada</span>
                    <span className="font-medium">22%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">United Kingdom</span>
                    <span className="font-medium">6%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Other</span>
                    <span className="font-medium">4%</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">Upgrade to Pro to view geographic analytics</p>
                </div>
              )}
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Advanced Analytics */}
        <AccordionItem value="advanced-analytics">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Advanced Analytics</span>
              <Badge variant="outline" className="text-xs gap-1">
                <Crown className="w-3 h-3" />
                Executive
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            {userTier === 'executive' ? (
              <div className="space-y-4">
                <Card className="p-4 bg-card border-border rounded-2xl">
                  <h4 className="font-medium mb-3">Conversion Funnel</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Card Views</span>
                      <span className="font-medium">247</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Link Clicks</span>
                      <span className="font-medium">89 (36%)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Form Submissions</span>
                      <span className="font-medium">18 (7.3%)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Qualified Leads</span>
                      <span className="font-medium">12 (4.9%)</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-card border-border rounded-2xl">
                  <h4 className="font-medium mb-3">Time-based Analytics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Peak viewing hours</span>
                      <span className="font-medium">2-4 PM</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Best performing day</span>
                      <span className="font-medium">Tuesday</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Average session duration</span>
                      <span className="font-medium">2m 34s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Return visitor rate</span>
                      <span className="font-medium">23%</span>
                    </div>
                  </div>
                </Card>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Export analytics data</Label>
                      <p className="text-xs text-muted-foreground">Download detailed reports</p>
                    </div>
                    <Switch 
                      checked={analytics.export_enabled}
                      onCheckedChange={(checked) => onAnalyticsUpdate({ export_enabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">API access</Label>
                      <p className="text-xs text-muted-foreground">Access analytics via REST API</p>
                    </div>
                    <Switch 
                      checked={analytics.api_access}
                      onCheckedChange={(checked) => onAnalyticsUpdate({ api_access: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">White-label reports</Label>
                      <p className="text-xs text-muted-foreground">Remove Leo branding from reports</p>
                    </div>
                    <Switch 
                      checked={analytics.white_label_reports}
                      onCheckedChange={(checked) => onAnalyticsUpdate({ white_label_reports: checked })}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <h4 className="font-medium mb-2">Advanced Analytics</h4>
                <p className="text-sm mb-4">Detailed insights, conversion funnels, and API access</p>
                <Button size="sm" className="gap-2">
                  <Crown className="h-4 w-4" />
                  Upgrade to Executive
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}