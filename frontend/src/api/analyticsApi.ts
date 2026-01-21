import api from "./axiosConfig";
import publicApi from "./publicApiConfig";

export interface AnalyticsEvent {
  cardId: string;
  eventType: 'view' | 'unique_view' | 'conversation' | 'lead' | 'link_click' | 'qr_scan' | 'share';
  source?: 'qr_code' | 'direct_link' | 'email_signature' | 'ai_chat' | 'social_media' | 'website' | 'other';
  deviceType?: 'mobile' | 'desktop' | 'tablet' | 'other';
  metadata?: Record<string, any>;
}

export interface TimeSeriesData {
  date: string;
  views: number;
  uniqueViews: number;
  conversations: number;
  leads: number;
  linkClicks: number;
}

export interface SourceData {
  name: string;
  value: number;
  color?: string;
}

export interface DeviceData {
  name: string;
  value: number;
  color?: string;
}

export interface AnalyticsOverview {
  totalViews: number;
  totalUniqueViews: number;
  totalConversations: number;
  totalLeads: number;
  totalLinkClicks: number;
  totalContacts?: number;
  conversionRate: number;
  engagementRate: number;
  viewsTrend: number;
  leadsTrend: number;
}

export interface CardAnalyticsData {
  timeSeries: TimeSeriesData[];
  sources: SourceData[];
  devices: DeviceData[];
  countries: Array<{ name: string; value: number }>;
  totalEvents: number;
}

export interface UserAnalyticsData {
  overview: AnalyticsOverview;
  timeSeries?: TimeSeriesData[];
  sources?: SourceData[];
  devices?: DeviceData[];
  countries?: Array<{ name: string; value: number; count?: number }>;
  cards: Array<{
    id: string;
    name: string;
    views: number;
    leads: number;
    analytics: number;
  }>;
}

export const analyticsApi = {
  // Track analytics event (public endpoint - uses API token)
  trackEvent: async (eventData: AnalyticsEvent): Promise<{ success: boolean; message: string; id: string }> => {
    const response = await publicApi.post("/analytics/track", {
      cardId: eventData.cardId,
      eventType: eventData.eventType,
      source: eventData.source || 'other',
      deviceType: eventData.deviceType || 'other',
      metadata: eventData.metadata || {},
    });
    return response.data;
  },

  // Get analytics for a specific card (user-specific - uses JWT)
  getCardAnalytics: async (
    cardId: string, 
    dateRange: string = '30d', 
    groupBy: string = 'day'
  ): Promise<{
    success: boolean;
    data: CardAnalyticsData;
    card: { id: string; name: string; total_views: number; total_leads: number };
  }> => {
    const response = await api.get(`/analytics/cards/${cardId}`, {
      params: { dateRange, groupBy }
    });
    return response.data;
  },

  // Get user analytics overview (user-specific - uses JWT)
  getUserAnalytics: async (dateRange: string = '30d'): Promise<{
    success: boolean;
    data: UserAnalyticsData;
    cards: Array<{ id: string; card_name: string; card_views: number; card_leads: number }>;
  }> => {
    const response = await api.get("/analytics/user/overview", {
      params: { dateRange }
    });
    return response.data;
  },

  // Helper function to detect device type
  getDeviceType: (): 'mobile' | 'desktop' | 'tablet' => {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  },

  // Helper function to track page view
  trackPageView: async (cardId: string, source?: string) => {
    try {
      await analyticsApi.trackEvent({
        cardId,
        eventType: 'view',
        source: source as any || 'direct_link',
        deviceType: analyticsApi.getDeviceType(),
        metadata: {
          url: window.location.href,
          referrer: document.referrer,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  },

  // Helper function to track lead conversion
  trackLead: async (cardId: string, leadData?: Record<string, any>) => {
    try {
      await analyticsApi.trackEvent({
        cardId,
        eventType: 'lead',
        deviceType: analyticsApi.getDeviceType(),
        metadata: {
          leadData,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.error('Failed to track lead:', error);
    }
  },

  // Helper function to track link click
  trackLinkClick: async (cardId: string, linkUrl: string, linkType?: string) => {
    try {
      await analyticsApi.trackEvent({
        cardId,
        eventType: 'link_click',
        deviceType: analyticsApi.getDeviceType(),
        metadata: {
          linkUrl,
          linkType,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.error('Failed to track link click:', error);
    }
  },

  // Helper function to track conversation start
  trackConversation: async (cardId: string, conversationType?: string) => {
    try {
      await analyticsApi.trackEvent({
        cardId,
        eventType: 'conversation',
        deviceType: analyticsApi.getDeviceType(),
        metadata: {
          conversationType,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.error('Failed to track conversation:', error);
    }
  },

  // Process analytics data for charts
  processDataForCharts: (data: CardAnalyticsData) => {
    // Add colors to source data
    const sourceColors = {
      'qr_code': '#F26522',
      'direct_link': '#10B981',
      'email_signature': '#3B82F6',
      'ai_chat': '#F59E0B',
      'social_media': '#EC4899',
      'website': '#8B5CF6',
      'other': '#6B7280'
    };

    const sourcesWithColors = data.sources.map(source => ({
      ...source,
      color: sourceColors[source.name as keyof typeof sourceColors] || sourceColors.other
    }));

    // Add colors to device data
    const deviceColors = {
      'mobile': '#F26522',
      'desktop': '#4CAF50',
      'tablet': '#2196F3',
      'other': '#6B7280'
    };

    const devicesWithColors = data.devices.map(device => ({
      ...device,
      color: deviceColors[device.name as keyof typeof deviceColors] || deviceColors.other
    }));

    return {
      ...data,
      sources: sourcesWithColors,
      devices: devicesWithColors
    };
  },

  // Generate mock data for development/testing
  generateMockData: (dateRange: string = '30d', selectedCard: string = 'all') => {
    const getDaysCount = (range: string) => {
      switch (range) {
        case '7d': return 7;
        case '30d': return 30;
        case '90d': return 90;
        case '1y': return 365;
        default: return 30;
      }
    };

    const daysCount = getDaysCount(dateRange);
    const timeSeries = Array.from({ length: daysCount }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (daysCount - 1 - i));
      
      let multiplier = 1;
      if (selectedCard === 'card1') multiplier = 1.2;
      else if (selectedCard === 'card2') multiplier = 0.8;
      else if (selectedCard === 'card3') multiplier = 0.6;
      
      return {
        date: date.toISOString().split('T')[0],
        views: Math.floor((Math.random() * 50 + 10) * multiplier),
        uniqueViews: Math.floor((Math.random() * 30 + 5) * multiplier),
        conversations: Math.floor((Math.random() * 15 + 2) * multiplier),
        leads: Math.floor((Math.random() * 8 + 1) * multiplier),
        linkClicks: Math.floor((Math.random() * 25 + 5) * multiplier)
      };
    });

    const sources = [
      { name: 'qr_code', value: 35, color: '#F26522' },
      { name: 'direct_link', value: 28, color: '#10B981' },
      { name: 'email_signature', value: 20, color: '#3B82F6' },
      { name: 'ai_chat', value: 12, color: '#F59E0B' },
      { name: 'social_media', value: 5, color: '#EC4899' }
    ];

    const devices = [
      { name: 'mobile', value: 60, color: '#F26522' },
      { name: 'desktop', value: 35, color: '#4CAF50' },
      { name: 'tablet', value: 5, color: '#2196F3' }
    ];

    return {
      timeSeries,
      sources,
      devices,
      countries: [
        { name: 'United States', value: 45 },
        { name: 'Canada', value: 20 },
        { name: 'United Kingdom', value: 15 },
        { name: 'Germany', value: 10 },
        { name: 'Other', value: 10 }
      ],
      totalEvents: timeSeries.reduce((sum, day) => sum + day.views + day.conversations + day.leads + day.linkClicks, 0)
    };
  }
};
