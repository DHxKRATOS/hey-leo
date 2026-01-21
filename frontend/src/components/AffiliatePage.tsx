import React, { useState } from 'react'
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Copy, 
  ExternalLink, 
  Calendar,
  ArrowLeft,
  BarChart3,
  CheckCircle,
  Clock,
  Share2
} from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

interface User {
  id: string
  email: string
  name: string
}

interface AffiliatePageProps {
  user: User
  onBack: () => void
}

export function AffiliatePage({ user, onBack }: AffiliatePageProps) {
  const [copySuccess, setCopySuccess] = useState('')
  
  // Mock affiliate data - in real app, this would come from API
  const affiliateData = {
    referralCode: 'demo123',
    totalEarnings: 0,
    monthlyEarnings: 0,
    pendingPayouts: 0,
    activeReferrals: 0,
    totalReferrals: 0,
    conversionRate: 0,
    commissionRate: 20,
    nextPayoutDate: '2024-02-01',
    recentReferrals: [],
    monthlyStats: []
  }
  
  const referralLink = `https://heyleo.ai/ref/${affiliateData.referralCode}`
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopySuccess('link')
      setTimeout(() => setCopySuccess(''), 2000)
    } catch (err) {
      console.error('Failed to copy link')
    }
  }
  
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(affiliateData.referralCode)
      setCopySuccess('code')
      setTimeout(() => setCopySuccess(''), 2000)
    } catch (err) {
      console.error('Failed to copy code')
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="mb-2">Affiliate Program</h1>
            <p className="text-muted-foreground">
              Earn 20% lifetime commission by referring new users to HeyLeo
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Earnings */}
          <Card className="p-6 bg-card border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">${affiliateData.totalEarnings}</div>
                <div className="text-sm text-muted-foreground">Total Earnings</div>
              </div>
            </div>
          </Card>
          
          {/* Monthly Earnings */}
          <Card className="p-6 bg-card border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">${affiliateData.monthlyEarnings}</div>
                <div className="text-sm text-muted-foreground">This Month</div>
              </div>
            </div>
          </Card>
          
          {/* Active Referrals */}
          <Card className="p-6 bg-card border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">{affiliateData.activeReferrals}</div>
                <div className="text-sm text-muted-foreground">Active Referrals</div>
              </div>
            </div>
          </Card>
          
          {/* Conversion Rate */}
          <Card className="p-6 bg-card border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">{affiliateData.conversionRate}%</div>
                <div className="text-sm text-muted-foreground">Conversion Rate</div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Referral Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Referral Link */}
          <Card className="p-6 bg-card border border-border shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Referral Link</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                <span className="flex-1 text-sm text-foreground font-mono break-all">
                  {referralLink}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copySuccess === 'link' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(`mailto:?subject=Check out HeyLeo&body=I've been using HeyLeo for my digital business cards and thought you'd love it too! Check it out: ${referralLink}`, '_blank')}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share via Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out HeyLeo - AI-powered digital business cards that actually work! ${referralLink}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Share on X
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Referral Code */}
          <Card className="p-6 bg-card border border-border shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Referral Code</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                <span className="flex-1 text-2xl font-bold text-foreground tracking-wider">
                  {affiliateData.referralCode.toUpperCase()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copySuccess === 'code' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Your referrals can also use this code during signup to get credited to your account.
              </p>
            </div>
          </Card>
        </div>
        
        {/* Program Details */}
        <Card className="p-6 bg-card border border-border shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Program Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">20% Commission</h3>
              <p className="text-sm text-muted-foreground">
                Earn 20% of every subscription payment from your referrals - for life!
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Monthly Payouts</h3>
              <p className="text-sm text-muted-foreground">
                Receive your earnings every month via PayPal or bank transfer.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No Minimum</h3>
              <p className="text-sm text-muted-foreground">
                No minimum threshold - get paid for every successful referral.
              </p>
            </div>
          </div>
        </Card>
        
        {/* Recent Activity */}
        <Card className="p-6 bg-card border border-border shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
          {affiliateData.recentReferrals.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No referrals yet</p>
              <p className="text-sm text-muted-foreground">
                Start sharing your referral link to see your first referrals here!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {affiliateData.recentReferrals.map((referral: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{referral.email}</p>
                    <p className="text-sm text-muted-foreground">{referral.date}</p>
                  </div>
                  <Badge className="bg-success/10 text-success">
                    +${referral.commission}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}