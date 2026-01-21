"use strict";

const analyticsAuthUtils = require("../../../middlewares/auth");

module.exports = {
  // Track analytics event (public endpoint - uses API token)
  async track(ctx) {
    try {
      const { cardId, eventType, source, deviceType, metadata } =
        ctx.request.body;

      if (!cardId || !eventType) {
        return ctx.badRequest("cardId and eventType are required");
      }

      // Get user agent and IP for additional tracking
      const userAgent = ctx.request.headers["user-agent"] || "";
      const ipAddress =
        ctx.request.ip || ctx.request.headers["x-forwarded-for"] || "";

      // Create analytics entry
      const analyticsEntry = await strapi.entityService.create(
        "api::analytics.analytic",
        {
          data: {
            card: cardId,
            event_type: eventType,
            source: source || "other",
            device_type: deviceType || "other",
            ip_address: ipAddress,
            user_agent: userAgent,
            metadata: metadata || {},
            timestamp: new Date(),
          },
        }
      );

      // Update card counters based on event type
      if (eventType === "view") {
        await strapi.entityService.update("api::card.card", cardId, {
          data: {
            card_views: await this.incrementCardCounter(cardId, "card_views"),
          },
        });
      } else if (eventType === "lead") {
        await strapi.entityService.update("api::card.card", cardId, {
          data: {
            card_leads: await this.incrementCardCounter(cardId, "card_leads"),
          },
        });
      }

      ctx.body = {
        success: true,
        message: "Analytics event tracked successfully",
        id: analyticsEntry.id,
      };
    } catch (error) {
      strapi.log.error("Analytics tracking error:", error);
      ctx.internalServerError("Failed to track analytics event");
    }
  },

  // Get analytics data for a specific card (user-specific - uses JWT)
  async getCardAnalytics(ctx) {
    try {
      const { cardId } = ctx.params;
      const { dateRange = "30d", groupBy = "day" } = ctx.query;
      const userId = ctx.state.user.id;

      // Verify card belongs to user
      const card: any = await strapi.entityService.findOne(
        "api::card.card",
        cardId,
        {
          populate: ["user"],
        }
      );

      if (!card || card?.user?.id !== userId) {
        return ctx.forbidden("Access denied to this card");
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();

      switch (dateRange) {
        case "7d":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(endDate.getDate() - 90);
          break;
        case "1y":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Get analytics data
      const analytics = await strapi.db
        .query("api::analytics.analytic")
        .findMany({
          where: {
            card: cardId,
            timestamp: {
              $gte: startDate,
              $lte: endDate,
            },
          },
          orderBy: { timestamp: "asc" },
        });

      // Process and group data
      const processedData = this.processAnalyticsData(
        analytics,
        groupBy,
        startDate,
        endDate
      );

      ctx.body = {
        success: true,
        data: processedData,
        card: {
          id: card.id,
          name: card.card_name,
          total_views: card.card_views || 0,
          total_leads: card.card_leads || 0,
        },
      };
    } catch (error) {
      strapi.log.error("Get card analytics error:", error);
      ctx.internalServerError("Failed to get card analytics");
    }
  },

  // Get user analytics overview (user-specific - uses JWT)
  async getUserAnalytics(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { dateRange = "30d" } = ctx.query;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();

      switch (dateRange) {
        case "7d":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(endDate.getDate() - 90);
          break;
        case "1y":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Get user's cards with real metrics
      const userCards: any = await strapi.entityService.findMany(
        "api::card.card",
        {
          filters: { user: userId },
          fields: ["id", "card_name", "card_views", "card_leads"],
        }
      );

      const cardIds = userCards.map((card) => card.id);

      // Get real contacts data for the user
      const contacts = await strapi.db.query("api::contact.contact").findMany({
        where: {
          user: userId,
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
        select: ["id", "source", "country", "city", "createdAt"],
      });

      // Get all user contacts for total count
      const totalContacts = await strapi.db.query("api::contact.contact").count({
        where: { user: userId },
      });

      // Get analytics data for all user cards
      let analytics = await strapi.db
        .query("api::analytics.analytic")
        .findMany({
          where: {
            card: { $in: cardIds },
            timestamp: {
              $gte: startDate,
              $lte: endDate,
            },
          },
          orderBy: { timestamp: "asc" },
        });

      // Calculate real metrics from cards and contacts
      const totalViews = userCards.reduce((sum, card) => sum + (card.card_views || 0), 0);
      const totalLeads = userCards.reduce((sum, card) => sum + (card.card_leads || 0), 0);
      const uniqueVisitors = await this.calculateUniqueVisitors(cardIds, startDate, endDate);
      const aiConversations = 0; // Set to 0 as requested
      const contactsCaptured = contacts.length;

      // Process data for overview with real metrics
      const overviewData = this.processUserOverviewDataWithRealMetrics(
        analytics,
        userCards,
        contacts,
        startDate,
        endDate,
        {
          totalViews,
          totalLeads,
          uniqueVisitors,
          aiConversations,
          contactsCaptured,
          totalContacts
        }
      );

      ctx.body = {
        success: true,
        data: overviewData,
        cards: userCards,
      };
    } catch (error) {
      strapi.log.error("Get user analytics error:", error);
      ctx.internalServerError("Failed to get user analytics");
    }
  },

  // Helper method to increment card counters
  async incrementCardCounter(cardId, field) {
    const card = await strapi.entityService.findOne("api::card.card", cardId, {
      fields: [field],
    });
    return (card[field] || 0) + 1;
  },

  // Helper method to process analytics data
  processAnalyticsData(analytics, groupBy, startDate, endDate) {
    const timeSeriesData = [];
    const sourceData: Record<string, number> = {};
    const deviceData: Record<string, number> = {};
    const eventTypeData: Record<string, number> = {};

    // Initialize time series based on groupBy
    const current = new Date(startDate);
    while (current <= endDate) {
      const key =
        groupBy === "day"
          ? current.toISOString().split("T")[0]
          : `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;

      timeSeriesData.push({
        date: key,
        views: 0,
        uniqueViews: 0,
        conversations: 0,
        leads: 0,
        linkClicks: 0,
      });

      if (groupBy === "day") {
        current.setDate(current.getDate() + 1);
      } else {
        current.setMonth(current.getMonth() + 1);
      }
    }

    // Process analytics events
    analytics.forEach((event) => {
      const eventDate = new Date(event.timestamp);
      const key =
        groupBy === "day"
          ? eventDate.toISOString().split("T")[0]
          : `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, "0")}`;

      // Find corresponding time series entry
      const timeEntry = timeSeriesData.find((entry) => entry.date === key);
      if (timeEntry) {
        switch (event.event_type) {
          case "view":
            timeEntry.views++;
            break;
          case "unique_view":
            timeEntry.uniqueViews++;
            break;
          case "conversation":
            timeEntry.conversations++;
            break;
          case "lead":
            timeEntry.leads++;
            break;
          case "link_click":
            timeEntry.linkClicks++;
            break;
        }
      }

      // Aggregate source data
      sourceData[event.source] = (sourceData[event.source] || 0) + 1;

      // Aggregate device data
      deviceData[event.device_type] = (deviceData[event.device_type] || 0) + 1;

      // Aggregate event type data
      eventTypeData[event.event_type] =
        (eventTypeData[event.event_type] || 0) + 1;
    });

    // Add colors and enhanced data for frontend
    const sourceColors = {
      'qr_code': '#F26522',
      'direct_link': '#10B981', 
      'email_signature': '#3B82F6',
      'ai_chat': '#F59E0B',
      'social_media': '#EC4899',
      'website': '#8B5CF6',
      'other': '#6B7280'
    };

    const deviceColors = {
      'mobile': '#F26522',
      'desktop': '#4CAF50', 
      'tablet': '#2196F3',
      'other': '#6B7280'
    };

    // Calculate percentages for sources and devices
    const totalSourceEvents = Object.values(sourceData).reduce((sum: number, count: number) => sum + count, 0);
    const totalDeviceEvents = Object.values(deviceData).reduce((sum: number, count: number) => sum + count, 0);

    return {
      timeSeries: timeSeriesData,
      sources: Object.entries(sourceData).map(([name, value]) => ({
        name,
        value: totalSourceEvents > 0 ? Math.round((Number(value) / totalSourceEvents) * 100) : 0,
        count: Number(value),
        color: sourceColors[name] || sourceColors.other
      })),
      devices: Object.entries(deviceData).map(([name, value]) => ({
        name,
        value: totalDeviceEvents > 0 ? Math.round((Number(value) / totalDeviceEvents) * 100) : 0,
        count: Number(value),
        color: deviceColors[name] || deviceColors.other
      })),
      countries: this.generateGeographicData(analytics),
      eventTypes: Object.entries(eventTypeData).map(([name, value]) => ({
        name,
        value,
      })),
      totalEvents: analytics.length,
    };
  },

  // Helper method to generate geographic data (legacy - now uses contacts)
  generateGeographicData(analytics) {
    const countryData: Record<string, number> = {};
    
    // Process analytics to extract country data
    analytics.forEach((event) => {
      const country = event.country || 'Unknown';
      countryData[country] = (countryData[country] || 0) + 1;
    });

    // Convert to array with percentages
    const totalEvents = analytics.length;
    const countries = Object.entries(countryData)
      .map(([name, count]) => ({
        name,
        value: totalEvents > 0 ? Math.round((Number(count) / totalEvents) * 100) : 0,
        count: Number(count)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 countries

    return countries;
  },

  // Helper method to generate sample analytics data when no real data exists
  generateSampleAnalyticsData(dateRange, cardIds) {
    const getDaysCount = (range) => {
      switch (range) {
        case '7d': return 7;
        case '30d': return 30;
        case '90d': return 90;
        case '1y': return 365;
        default: return 30;
      }
    };

    const daysCount = getDaysCount(dateRange);
    const sampleData = [];
    
    for (let i = 0; i < daysCount; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (daysCount - 1 - i));
      
      // Generate sample events for each day
      const dailyViews = Math.floor(Math.random() * 50 + 10);
      const dailyConversations = Math.floor(Math.random() * 15 + 2);
      const dailyLeads = Math.floor(Math.random() * 8 + 1);
      
      for (let j = 0; j < dailyViews; j++) {
        sampleData.push({
          card: cardIds[Math.floor(Math.random() * cardIds.length)] || 1,
          event_type: 'view',
          source: ['qr_code', 'direct_link', 'email_signature', 'ai_chat', 'social_media'][Math.floor(Math.random() * 5)],
          device_type: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
          country: ['United States', 'Canada', 'United Kingdom', 'Germany', 'France'][Math.floor(Math.random() * 5)],
          timestamp: date.toISOString()
        });
      }
      
      for (let j = 0; j < dailyConversations; j++) {
        sampleData.push({
          card: cardIds[Math.floor(Math.random() * cardIds.length)] || 1,
          event_type: 'conversation',
          source: 'ai_chat',
          device_type: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
          country: ['United States', 'Canada', 'United Kingdom', 'Germany', 'France'][Math.floor(Math.random() * 5)],
          timestamp: date.toISOString()
        });
      }
      
      for (let j = 0; j < dailyLeads; j++) {
        sampleData.push({
          card: cardIds[Math.floor(Math.random() * cardIds.length)] || 1,
          event_type: 'lead',
          source: ['qr_code', 'direct_link', 'email_signature'][Math.floor(Math.random() * 3)],
          device_type: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
          country: ['United States', 'Canada', 'United Kingdom', 'Germany', 'France'][Math.floor(Math.random() * 5)],
          timestamp: date.toISOString()
        });
      }
    }
    
    return sampleData;
  },

  // Helper method to calculate unique visitors
  async calculateUniqueVisitors(cardIds, startDate, endDate) {
    if (cardIds.length === 0) return 0;
    
    const uniqueIPs = await strapi.db.query("api::analytics.analytic").findMany({
      where: {
        card: { $in: cardIds },
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
        event_type: "view"
      },
      select: ["ip_address"],
    });

    const uniqueIPSet = new Set(uniqueIPs.map(entry => entry.ip_address).filter(ip => ip));
    return uniqueIPSet.size;
  },

  // Helper method to process user overview data with real metrics
  processUserOverviewDataWithRealMetrics(analytics, cards, contacts, startDate, endDate, realMetrics) {
    // Calculate analytics-based metrics
    const analyticsViews = analytics.filter((a) => a.event_type === "view").length;
    const totalConversations = analytics.filter(
      (a) => a.event_type === "conversation"
    ).length;
    const analyticsLeads = analytics.filter((a) => a.event_type === "lead").length;
    const totalLinkClicks = analytics.filter(
      (a) => a.event_type === "link_click"
    ).length;

    // Use real metrics from cards and contacts
    const totalViews = realMetrics.totalViews;
    const totalLeads = realMetrics.totalLeads;
    const uniqueVisitors = realMetrics.uniqueVisitors;
    const aiConversations = realMetrics.aiConversations;
    const contactsCaptured = realMetrics.contactsCaptured;

    // Calculate trends based on contact creation dates
    const midPoint = new Date((startDate.getTime() + endDate.getTime()) / 2);
    const firstHalfContacts = contacts.filter((c) => new Date(c.createdAt) < midPoint);
    const secondHalfContacts = contacts.filter((c) => new Date(c.createdAt) >= midPoint);
    
    const contactsTrend = firstHalfContacts.length > 0
      ? ((secondHalfContacts.length - firstHalfContacts.length) / firstHalfContacts.length) * 100
      : secondHalfContacts.length > 0 ? 100 : 0;

    // Calculate views trend from analytics if available
    const firstHalfViews = analytics.filter(
      (a) => a.event_type === "view" && new Date(a.timestamp) < midPoint
    ).length;
    const secondHalfViews = analytics.filter(
      (a) => a.event_type === "view" && new Date(a.timestamp) >= midPoint
    ).length;
    const viewsTrend = firstHalfViews > 0
      ? ((secondHalfViews - firstHalfViews) / firstHalfViews) * 100
      : secondHalfViews > 0 ? 100 : 0;

    // Process traffic sources from contacts
    const trafficSources = this.processTrafficSourcesFromContacts(contacts);
    
    // Process geographic data from contacts
    const geographicData = this.processGeographicDataFromContacts(contacts);

    // Generate time series data
    const timeSeries = this.generateTimeSeriesFromContacts(contacts, startDate, endDate);

    return {
      overview: {
        totalViews,
        totalUniqueViews: uniqueVisitors,
        totalConversations: aiConversations,
        totalLeads: contactsCaptured,
        totalLinkClicks,
        totalContacts: realMetrics.totalContacts,
        conversionRate: totalViews > 0 ? (contactsCaptured / totalViews) * 100 : 0,
        engagementRate: totalViews > 0 ? ((aiConversations + totalLinkClicks) / totalViews) * 100 : 0,
        viewsTrend,
        leadsTrend: contactsTrend,
      },
      timeSeries,
      sources: trafficSources,
      devices: this.processDeviceDataFromAnalytics(analytics),
      countries: geographicData,
      cards: cards.map((card) => ({
        id: card.id,
        name: card.card_name,
        views: card.card_views || 0,
        leads: card.card_leads || 0,
        analytics: analytics.filter((a) => a.card === card.id).length,
      })),
    };
  },

  // Helper method to process traffic sources from contacts
  processTrafficSourcesFromContacts(contacts) {
    const sourceData = {};
    
    contacts.forEach((contact) => {
      const source = contact.source || 'other';
      sourceData[source] = (sourceData[source] || 0) + 1;
    });

    const sourceColors = {
      'qr': '#F26522',
      'link': '#10B981', 
      'email': '#3B82F6',
      'ai_chat': '#F59E0B',
      'social': '#EC4899',
      'referral': '#8B5CF6',
      'direct': '#6B7280',
      'manual': '#9CA3AF',
      'other': '#6B7280'
    };

    const totalContacts = contacts.length;
    
    return Object.entries(sourceData).map(([name, count]) => ({
      name: this.formatSourceName(name),
      value: totalContacts > 0 ? Math.round((Number(count) / totalContacts) * 100) : 0,
      count: Number(count),
      color: sourceColors[name] || sourceColors.other
    }));
  },

  // Helper method to process geographic data from contacts
  processGeographicDataFromContacts(contacts) {
    const countryData = {};
    
    contacts.forEach((contact) => {
      const country = contact.country || 'Unknown';
      countryData[country] = (countryData[country] || 0) + 1;
    });

    const totalContacts = contacts.length;
    
    return Object.entries(countryData)
      .map(([name, count]) => ({
        name,
        value: totalContacts > 0 ? Math.round((Number(count) / totalContacts) * 100) : 0,
        count: Number(count)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  },

  // Helper method to process device data from analytics
  processDeviceDataFromAnalytics(analytics) {
    const deviceData = {};
    
    analytics.forEach((event) => {
      const device = event.device_type || 'other';
      deviceData[device] = (deviceData[device] || 0) + 1;
    });

    const deviceColors = {
      'mobile': '#F26522',
      'desktop': '#4CAF50', 
      'tablet': '#2196F3',
      'other': '#6B7280'
    };

    const totalEvents = analytics.length;
    
    return Object.entries(deviceData).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: totalEvents > 0 ? Math.round((Number(count) / totalEvents) * 100) : 0,
      count: Number(count),
      color: deviceColors[name] || deviceColors.other
    }));
  },

  // Helper method to generate time series from contacts
  generateTimeSeriesFromContacts(contacts, startDate, endDate) {
    const timeSeriesData = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dateKey = current.toISOString().split('T')[0];
      const dayContacts = contacts.filter(contact => {
        const contactDate = new Date(contact.createdAt).toISOString().split('T')[0];
        return contactDate === dateKey;
      });
      
      timeSeriesData.push({
        date: dateKey,
        views: 0, // Will be populated from analytics if available
        uniqueViews: 0,
        conversations: 0,
        leads: dayContacts.length,
        linkClicks: 0,
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return timeSeriesData;
  },

  // Helper method to format source names
  formatSourceName(source) {
    const sourceMap = {
      'qr': 'QR Code',
      'link': 'Direct Link',
      'email': 'Email',
      'ai_chat': 'AI Chat',
      'social': 'Social Media',
      'referral': 'Referral',
      'direct': 'Direct',
      'manual': 'Manual',
      'other': 'Other'
    };
    
    return sourceMap[source] || source.charAt(0).toUpperCase() + source.slice(1);
  },

  // Legacy method for backward compatibility
  processUserOverviewData(analytics, cards, startDate, endDate) {
    return this.processUserOverviewDataWithRealMetrics(analytics, cards, [], startDate, endDate, {
      totalViews: cards.reduce((sum, card) => sum + (card.card_views || 0), 0),
      totalLeads: cards.reduce((sum, card) => sum + (card.card_leads || 0), 0),
      uniqueVisitors: 0,
      aiConversations: 0,
      contactsCaptured: 0,
      totalContacts: 0
    });
  },
};
