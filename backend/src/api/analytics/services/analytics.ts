"use strict";

/**
 * analytics service
 */

module.exports = {
  // Track analytics event with enhanced data processing
  async trackEvent(eventData) {
    try {
      const {
        cardId,
        eventType,
        source = "other",
        deviceType = "other",
        userAgent,
        ipAddress,
        referrer,
        sessionId,
        metadata = {},
      } = eventData;

      // Parse user agent for browser and OS info
      const browserInfo = this.parseUserAgent(userAgent);

      // Get geographic info from IP (simplified - in production use a service like MaxMind)
      const geoInfo = await this.getGeoFromIP(ipAddress);

      // Create analytics entry
      const analyticsEntry = await strapi.entityService.create(
        "api::analytics.analytic",
        {
          data: {
            card: cardId,
            event_type: eventType,
            source,
            device_type: deviceType,
            browser: browserInfo.browser,
            os: browserInfo.os,
            country: geoInfo.country,
            city: geoInfo.city,
            ip_address: ipAddress,
            user_agent: userAgent,
            referrer,
            session_id: sessionId,
            metadata,
            timestamp: new Date(),
          },
        }
      );

      return analyticsEntry;
    } catch (error) {
      strapi.log.error("Analytics service trackEvent error:", error);
      throw error;
    }
  },

  // Get aggregated analytics for date range
  async getAggregatedAnalytics(filters) {
    try {
      const {
        cardIds,
        startDate,
        endDate,
        groupBy = "day",
        eventTypes = [
          "view",
          "unique_view",
          "conversation",
          "lead",
          "link_click",
        ],
      } = filters;

      const whereClause: any = {
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
        event_type: { $in: eventTypes },
      };

      if (cardIds && cardIds.length > 0) {
        whereClause.card = { $in: cardIds };
      }

      const analytics = await strapi.db
        .query("api::analytics.analytic")
        .findMany({
          where: whereClause,
          orderBy: { timestamp: "asc" },
        });

      return this.processAnalyticsData(analytics, groupBy, startDate, endDate);
    } catch (error) {
      strapi.log.error(
        "Analytics service getAggregatedAnalytics error:",
        error
      );
      throw error;
    }
  },

  // Get real-time analytics summary
  async getRealtimeSummary(cardIds, hours = 24) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000);

      const whereClause: any = {
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      if (cardIds && cardIds.length > 0) {
        whereClause.card = { $in: cardIds };
      }

      const analytics = await strapi.db
        .query("api::analytics.analytic")
        .findMany({
          where: whereClause,
        });

      const summary = {
        totalEvents: analytics.length,
        views: analytics.filter((a) => a.event_type === "view").length,
        uniqueViews: analytics.filter((a) => a.event_type === "unique_view")
          .length,
        conversations: analytics.filter((a) => a.event_type === "conversation")
          .length,
        leads: analytics.filter((a) => a.event_type === "lead").length,
        linkClicks: analytics.filter((a) => a.event_type === "link_click")
          .length,
        topSources: this.getTopSources(analytics),
        topDevices: this.getTopDevices(analytics),
        hourlyBreakdown: this.getHourlyBreakdown(analytics, hours),
      };

      return summary;
    } catch (error) {
      strapi.log.error("Analytics service getRealtimeSummary error:", error);
      throw error;
    }
  },

  // Helper method to parse user agent
  parseUserAgent(userAgent) {
    if (!userAgent) return { browser: "Unknown", os: "Unknown" };

    let browser = "Unknown";
    let os = "Unknown";

    // Simple browser detection
    if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";
    else if (userAgent.includes("Opera")) browser = "Opera";

    // Simple OS detection
    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac OS")) os = "macOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iOS")) os = "iOS";

    return { browser, os };
  },

  // Helper method to get geographic info from IP
  async getGeoFromIP(ipAddress) {
    // Simplified geo detection - in production, use a proper service
    // For now, return default values
    return {
      country: "Unknown",
      city: "Unknown",
    };
  },

  // Helper method to process analytics data
  processAnalyticsData(analytics, groupBy, startDate, endDate) {
    const timeSeriesData = [];
    const sourceData = {};
    const deviceData = {};
    const countryData = {};

    // Initialize time series
    const current = new Date(startDate);
    while (current <= endDate) {
      const key =
        groupBy === "day"
          ? current.toISOString().split("T")[0]
          : groupBy === "month"
            ? `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`
            : `${current.getFullYear()}-W${this.getWeekNumber(current)}`;

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
      } else if (groupBy === "month") {
        current.setMonth(current.getMonth() + 1);
      } else {
        current.setDate(current.getDate() + 7);
      }
    }

    // Process events
    analytics.forEach((event) => {
      const eventDate = new Date(event.timestamp);
      const key =
        groupBy === "day"
          ? eventDate.toISOString().split("T")[0]
          : groupBy === "month"
            ? `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, "0")}`
            : `${eventDate.getFullYear()}-W${this.getWeekNumber(eventDate)}`;

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

      // Aggregate other data
      sourceData[event.source] = (sourceData[event.source] || 0) + 1;
      deviceData[event.device_type] = (deviceData[event.device_type] || 0) + 1;
      if (event.country && event.country !== "Unknown") {
        countryData[event.country] = (countryData[event.country] || 0) + 1;
      }
    });

    return {
      timeSeries: timeSeriesData,
      sources: Object.entries(sourceData)
        .map(([name, value]) => ({ name, value }))
        .sort((a: any, b: any) => b.value - a.value),
      devices: Object.entries(deviceData)
        .map(([name, value]) => ({ name, value }))
        .sort((a: any, b: any) => b.value - a.value),
      countries: Object.entries(countryData)
        .map(([name, value]) => ({ name, value }))
        .sort((a: any, b: any) => b.value - a.value),
      totalEvents: analytics.length,
    };
  },

  // Helper method to get top sources
  getTopSources(analytics) {
    const sources = {};
    analytics.forEach((event) => {
      sources[event.source] = (sources[event.source] || 0) + 1;
    });
    return Object.entries(sources)
      .map(([name, count]) => ({ name, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);
  },

  // Helper method to get top devices
  getTopDevices(analytics) {
    const devices = {};
    analytics.forEach((event) => {
      devices[event.device_type] = (devices[event.device_type] || 0) + 1;
    });
    return Object.entries(devices)
      .map(([name, count]) => ({ name, count }))
      .sort((a: any, b: any) => b.count - a.count);
  },

  // Helper method to get hourly breakdown
  getHourlyBreakdown(analytics, hours) {
    const hourlyData = Array.from({ length: hours }, (_, i) => ({
      hour: i,
      events: 0,
    }));

    analytics.forEach((event) => {
      const eventHour = new Date(event.timestamp).getHours();
      const hourIndex = eventHour % hours;
      hourlyData[hourIndex].events++;
    });

    return hourlyData;
  },

  // Helper method to get week number
  getWeekNumber(date) {
    const d: any = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart: any = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  },
};
