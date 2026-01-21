import { useState, useEffect } from "react";
import {
  Event,
  EventAttendee,
  NetworkingMatch,
  EventFilter,
  MatchAction,
} from "../types/events";

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [matches, setMatches] = useState<NetworkingMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development
  useEffect(() => {
    // Generate upcoming dates relative to today
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const twoWeeks = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const threeWeeks = new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000);

    const mockEvents: Event[] = [
      // UPCOMING EVENTS
      {
        id: "event-1",
        name: "Web Summit 2025",
        description:
          "The world's largest tech conference bringing together the brightest minds in technology",
        startDate: nextMonth.toISOString().split("T")[0] + "T09:00:00",
        endDate:
          new Date(nextMonth.getTime() + 2 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0] + "T18:00:00",
        location: "San Francisco, CA",
        venue: "Moscone Center",
        bannerImage:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=300&fit=crop",
        organizerId: "org-1",
        attendeeCount: 2847,
        status: "upcoming",
        category: "conference",
        connectionsMade: 0,
        views: 1250,
        messagesSent: 0,
        satisfactionRating: 0,
        rsvpStatus: "attending",
        isBookmarked: true,
        pendingConnections: 3,
        is_featured: true,
        is_trending: true,
        featuredAttendees: [
          {
            id: "att1",
            name: "Sarah Johnson",
            avatar:
              "https://images.unsplash.com/photo-1494790108755-2616b612b601?w=100&h=100&fit=crop&crop=face",
            title: "Product Manager",
          },
          {
            id: "att2",
            name: "Mike Chen",
            avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            title: "Engineer",
          },
          {
            id: "att3",
            name: "Lisa Park",
            avatar:
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
            title: "Designer",
          },
        ],
        agenda: [
          {
            id: "agenda-1",
            title: "Registration & Coffee",
            startTime: "09:00",
            endTime: "10:00",
            location: "Main Lobby",
            type: "break",
          },
          {
            id: "agenda-2",
            title: "Opening Keynote",
            description: "The Future of AI in Business",
            startTime: "10:00",
            endTime: "11:00",
            location: "Main Stage",
            speaker: "Sarah Chen, VP Product at Meta",
            type: "keynote",
          },
          {
            id: "agenda-3",
            title: "Networking Lunch",
            startTime: "12:00",
            endTime: "13:30",
            location: "Expo Hall",
            type: "networking",
            potentialMatches: 23,
          },
        ],
        networkingEnabled: true,
        settings: {
          networkingHours: {
            start: "09:00",
            end: "18:00",
          },
          allowNetworking: true,
          allowChat: true,
          moderationEnabled: true,
          requireApproval: false,
        },
      },
      {
        id: "event-2",
        name: "SaaS Conference 2025",
        description:
          "Building the future of software - Connect with industry leaders and innovators",
        startDate: twoWeeks.toISOString().split("T")[0] + "T08:00:00",
        endDate:
          new Date(twoWeeks.getTime() + 2 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0] + "T19:00:00",
        location: "Austin, TX",
        venue: "Austin Convention Center",
        organizerId: "org-2",
        attendeeCount: 1250,
        status: "upcoming",
        category: "conference",
        connectionsMade: 0,
        views: 850,
        messagesSent: 0,
        satisfactionRating: 0,
        rsvpStatus: "maybe",
        isBookmarked: false,
        pendingConnections: 1,
        is_featured: false,
        is_trending: false,
        featuredAttendees: [
          {
            id: "att4",
            name: "Alex Rodriguez",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            title: "CEO",
          },
          {
            id: "att5",
            name: "Emma Wilson",
            avatar:
              "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
            title: "CTO",
          },
        ],
        agenda: [],
        networkingEnabled: true,
        settings: {
          networkingHours: {
            start: "08:00",
            end: "19:00",
          },
          allowNetworking: true,
          allowChat: true,
          moderationEnabled: true,
          requireApproval: false,
        },
      },
      {
        id: "event-3",
        name: "AI & Machine Learning Meetup",
        description:
          "Monthly gathering for AI enthusiasts, researchers, and practitioners to share insights",
        startDate: nextWeek.toISOString().split("T")[0] + "T18:00:00",
        endDate: nextWeek.toISOString().split("T")[0] + "T21:00:00",
        location: "Online & Seattle, WA",
        venue: "Hybrid Event",
        organizerId: "org-3",
        attendeeCount: 156,
        status: "upcoming",
        category: "meetup",
        connectionsMade: 0,
        views: 420,
        messagesSent: 0,
        satisfactionRating: 0,
        rsvpStatus: "attending",
        isBookmarked: true,
        pendingConnections: 0,
        is_featured: false,
        is_trending: true,
        featuredAttendees: [
          {
            id: "att6",
            name: "David Liu",
            avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            title: "ML Engineer",
          },
          {
            id: "att7",
            name: "Emma Watson",
            avatar:
              "https://images.unsplash.com/photo-1494790108755-2616b612b601?w=100&h=100&fit=crop&crop=face",
            title: "Data Scientist",
          },
        ],
        agenda: [],
        networkingEnabled: true,
        settings: {
          networkingHours: {
            start: "18:00",
            end: "21:00",
          },
          allowNetworking: true,
          allowChat: true,
          moderationEnabled: true,
          requireApproval: false,
        },
      },
      {
        id: "event-4",
        name: "Product Management Workshop",
        description:
          "Hands-on workshop covering modern PM methodologies and frameworks",
        startDate: threeWeeks.toISOString().split("T")[0] + "T09:00:00",
        endDate: threeWeeks.toISOString().split("T")[0] + "T17:00:00",
        location: "New York, NY",
        venue: "WeWork 42nd Street",
        organizerId: "org-4",
        attendeeCount: 45,
        status: "upcoming",
        category: "workshop",
        connectionsMade: 0,
        views: 180,
        messagesSent: 0,
        satisfactionRating: 0,
        rsvpStatus: "attending",
        isBookmarked: false,
        pendingConnections: 0,
        is_featured: false,
        is_trending: false,
        featuredAttendees: [
          {
            id: "att8",
            name: "Product Pete",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            title: "Senior PM",
          },
          {
            id: "att9",
            name: "Strategy Sam",
            avatar:
              "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
            title: "Head of Product",
          },
        ],
        agenda: [],
        networkingEnabled: true,
        settings: {
          networkingHours: {
            start: "09:00",
            end: "17:00",
          },
          allowNetworking: true,
          allowChat: true,
          moderationEnabled: true,
          requireApproval: false,
        },
      },

      // COMPLETED EVENTS
      {
        id: "event-5",
        name: "TechCrunch Disrupt 2024",
        description:
          "The premier startup conference bringing together entrepreneurs, investors, and tech leaders",
        startDate: "2024-10-15T09:00:00",
        endDate: "2024-10-17T18:00:00",
        location: "San Francisco, CA",
        venue: "Moscone Center South",
        organizerId: "org-5",
        attendeeCount: 3200,
        status: "completed",
        category: "conference",
        connectionsMade: 87,
        views: 2100,
        messagesSent: 156,
        satisfactionRating: 4.9,
        rsvpStatus: "attended",
        isBookmarked: true,
        pendingConnections: 0,
        is_featured: true,
        is_trending: false,
        featuredAttendees: [
          {
            id: "att10",
            name: "Startup Sally",
            avatar:
              "https://images.unsplash.com/photo-1494790108755-2616b612b601?w=100&h=100&fit=crop&crop=face",
            title: "Founder",
          },
          {
            id: "att11",
            name: "Investor Ian",
            avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            title: "VC Partner",
          },
          {
            id: "att12",
            name: "Tech Tina",
            avatar:
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
            title: "CTO",
          },
        ],
        agenda: [],
        networkingEnabled: true,
        settings: {
          networkingHours: {
            start: "09:00",
            end: "18:00",
          },
          allowNetworking: true,
          allowChat: true,
          moderationEnabled: true,
          requireApproval: false,
        },
      },
      {
        id: "event-6",
        name: "Design Systems Summit",
        description:
          "Annual gathering for design system practitioners and enthusiasts",
        startDate: "2024-09-20T09:00:00",
        endDate: "2024-09-20T17:00:00",
        location: "Online",
        venue: "Virtual Event",
        organizerId: "org-6",
        attendeeCount: 890,
        status: "completed",
        category: "conference",
        connectionsMade: 34,
        views: 650,
        messagesSent: 78,
        satisfactionRating: 4.7,
        rsvpStatus: "attended",
        isBookmarked: false,
        pendingConnections: 0,
        is_featured: false,
        is_trending: false,
        featuredAttendees: [
          {
            id: "att13",
            name: "Design Dan",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            title: "Design Lead",
          },
          {
            id: "att14",
            name: "System Sara",
            avatar:
              "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
            title: "Design Systems Lead",
          },
        ],
        agenda: [],
        networkingEnabled: true,
        settings: {
          networkingHours: {
            start: "09:00",
            end: "17:00",
          },
          allowNetworking: true,
          allowChat: true,
          moderationEnabled: true,
          requireApproval: false,
        },
      },
      {
        id: "event-7",
        name: "Blockchain Developer Meetup",
        description:
          "Local meetup for blockchain developers and crypto enthusiasts",
        startDate: "2024-11-10T19:00:00",
        endDate: "2024-11-10T22:00:00",
        location: "Miami, FL",
        venue: "The LAB Miami",
        organizerId: "org-7",
        attendeeCount: 67,
        status: "completed",
        category: "meetup",
        connectionsMade: 12,
        views: 120,
        messagesSent: 25,
        satisfactionRating: 4.5,
        rsvpStatus: "attended",
        isBookmarked: false,
        pendingConnections: 0,
        is_featured: false,
        is_trending: false,
        featuredAttendees: [
          {
            id: "att15",
            name: "Crypto Chris",
            avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            title: "Blockchain Dev",
          },
          {
            id: "att16",
            name: "DeFi Dave",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            title: "Smart Contract Engineer",
          },
        ],
        agenda: [],
        networkingEnabled: true,
        settings: {
          networkingHours: {
            start: "19:00",
            end: "22:00",
          },
          allowNetworking: true,
          allowChat: true,
          moderationEnabled: true,
          requireApproval: false,
        },
      },
      {
        id: "event-8",
        name: "Women in Tech Leadership",
        description:
          "Empowering the next generation of women leaders in technology",
        startDate: "2024-08-15T14:00:00",
        endDate: "2024-08-15T18:00:00",
        location: "Chicago, IL",
        venue: "Microsoft Technology Center",
        organizerId: "org-8",
        attendeeCount: 234,
        status: "completed",
        category: "networking",
        connectionsMade: 45,
        views: 380,
        messagesSent: 92,
        satisfactionRating: 4.8,
        rsvpStatus: "attended",
        isBookmarked: true,
        pendingConnections: 0,
        is_featured: true,
        is_trending: false,
        featuredAttendees: [
          {
            id: "att17",
            name: "Leader Lisa",
            avatar:
              "https://images.unsplash.com/photo-1494790108755-2616b612b601?w=100&h=100&fit=crop&crop=face",
            title: "VP Engineering",
          },
          {
            id: "att18",
            name: "Mentor Mary",
            avatar:
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
            title: "Tech Director",
          },
        ],
        agenda: [],
        networkingEnabled: true,
        settings: {
          networkingHours: {
            start: "14:00",
            end: "18:00",
          },
          allowNetworking: true,
          allowChat: true,
          moderationEnabled: true,
          requireApproval: false,
        },
      },

      // MORE UPCOMING EVENTS
      {
        id: "event-9",
        name: "Startup Pitch Competition",
        description:
          "Watch the next generation of startups pitch to top investors and compete for funding",
        startDate:
          new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0] + "T18:00:00",
        endDate:
          new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0] + "T21:00:00",
        location: "San Francisco, CA",
        venue: "Union Square Ventures",
        organizerId: "org-9",
        attendeeCount: 89,
        status: "upcoming",
        category: "networking",
        connectionsMade: 0,
        views: 340,
        messagesSent: 0,
        satisfactionRating: 0,
        rsvpStatus: "maybe",
        isBookmarked: false,
        pendingConnections: 0,
        is_featured: true,
        is_trending: true,
        featuredAttendees: [
          {
            id: "att19",
            name: "Investor Iris",
            avatar:
              "https://images.unsplash.com/photo-1494790108755-2616b612b601?w=100&h=100&fit=crop&crop=face",
            title: "VC Partner",
          },
          {
            id: "att20",
            name: "Startup Steve",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            title: "Founder & CEO",
          },
        ],
        agenda: [],
        networkingEnabled: true,
        settings: {
          networkingHours: {
            start: "18:00",
            end: "21:00",
          },
          allowNetworking: true,
          allowChat: true,
          moderationEnabled: true,
          requireApproval: false,
        },
      },
      {
        id: "event-10",
        name: "Remote Work Summit 2025",
        description:
          "The future of distributed teams - best practices, tools, and culture",
        startDate:
          new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0] + "T10:00:00",
        endDate:
          new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0] + "T16:00:00",
        location: "Online",
        venue: "Virtual Conference Platform",
        organizerId: "org-10",
        attendeeCount: 567,
        status: "upcoming",
        category: "webinar",
        connectionsMade: 0,
        views: 890,
        messagesSent: 0,
        satisfactionRating: 0,
        rsvpStatus: "attending",
        isBookmarked: true,
        pendingConnections: 2,
        is_featured: false,
        is_trending: false,
        featuredAttendees: [
          {
            id: "att21",
            name: "Remote Rob",
            avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            title: "Remote Work Expert",
          },
          {
            id: "att22",
            name: "Digital Dana",
            avatar:
              "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
            title: "Team Lead",
          },
        ],
        agenda: [
          {
            id: "agenda-4",
            title: "Opening: The State of Remote Work",
            startTime: "10:00",
            endTime: "10:30",
            location: "Main Stage",
            type: "keynote",
          },
          {
            id: "agenda-5",
            title: "Building Remote Culture",
            startTime: "11:00",
            endTime: "11:45",
            location: "Breakout Room 1",
            type: "session",
          },
          {
            id: "agenda-6",
            title: "Virtual Networking Session",
            startTime: "14:00",
            endTime: "15:00",
            location: "Networking Hub",
            type: "networking",
            potentialMatches: 45,
          },
        ],
        networkingEnabled: true,
        settings: {
          networkingHours: {
            start: "10:00",
            end: "16:00",
          },
          allowNetworking: true,
          allowChat: true,
          moderationEnabled: true,
          requireApproval: false,
        },
      },

      // ADDITIONAL UPCOMING EVENTS FOR VARIETY
      {
        id: "event-11",
        name: "DevOps & Cloud Summit",
        description:
          "Master modern infrastructure, CI/CD, and cloud-native technologies with industry experts",
        startDate:
          new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0] + "T09:00:00",
        endDate:
          new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0] + "T17:00:00",
        location: "Denver, CO",
        venue: "Colorado Convention Center",
        organizerId: "org-11",
        attendeeCount: 1450,
        status: "upcoming",
        category: "conference",
        connectionsMade: 0,
        views: 980,
        messagesSent: 0,
        satisfactionRating: 0,
        rsvpStatus: "attending",
        isBookmarked: false,
        pendingConnections: 5,
        is_featured: false,
        is_trending: true,
        featuredAttendees: [
          {
            id: "att23",
            name: "DevOps Dan",
            avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            title: "Site Reliability Engineer",
          },
          {
            id: "att24",
            name: "Cloud Clara",
            avatar:
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
            title: "Cloud Architect",
          },
          {
            id: "att25",
            name: "Kubernetes Kate",
            avatar:
              "https://images.unsplash.com/photo-1494790108755-2616b612b601?w=100&h=100&fit=crop&crop=face",
            title: "Platform Engineer",
          },
        ],
        agenda: [
          {
            id: "agenda-7",
            title: "Welcome & Continental Breakfast",
            startTime: "09:00",
            endTime: "09:30",
            location: "Main Lobby",
            type: "break",
          },
          {
            id: "agenda-8",
            title: "The Future of Cloud Infrastructure",
            description: "Serverless, edge computing, and beyond",
            startTime: "09:30",
            endTime: "10:30",
            location: "Main Auditorium",
            speaker: "Alex Kumar, Principal Engineer at AWS",
            type: "keynote",
          },
          {
            id: "agenda-9",
            title: "Hands-on: Kubernetes Workshop",
            startTime: "11:00",
            endTime: "12:30",
            location: "Lab Room A",
            type: "workshop",
          },
        ],
        networkingEnabled: true,
        settings: {
          networkingHours: {
            start: "09:00",
            end: "17:00",
          },
          allowNetworking: true,
          allowChat: true,
          moderationEnabled: true,
          requireApproval: false,
        },
      },
      {
        id: "event-12",
        name: "UX/UI Design Bootcamp",
        description:
          "Intensive 3-day bootcamp covering design thinking, prototyping, and user research",
        startDate:
          new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0] + "T09:00:00",
        endDate:
          new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0] + "T17:00:00",
        location: "Los Angeles, CA",
        venue: "Design Center LA",
        organizerId: "org-12",
        attendeeCount: 78,
        status: "upcoming",
        category: "workshop",
        connectionsMade: 0,
        views: 456,
        messagesSent: 0,
        satisfactionRating: 0,
        rsvpStatus: "maybe",
        isBookmarked: true,
        pendingConnections: 1,
        is_featured: true,
        is_trending: false,
        featuredAttendees: [
          {
            id: "att26",
            name: "Design Diana",
            avatar:
              "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
            title: "UX Director",
          },
          {
            id: "att27",
            name: "Prototype Paul",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            title: "Senior Designer",
          },
        ],
        agenda: [],
        networkingEnabled: true,
        settings: {
          networkingHours: {
            start: "09:00",
            end: "17:00",
          },
          allowNetworking: true,
          allowChat: true,
          moderationEnabled: true,
          requireApproval: false,
        },
      },
      {
        id: "event-13",
        name: "Fintech Innovation Forum",
        description:
          "Exploring the future of finance through blockchain, DeFi, and digital payments",
        startDate:
          new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0] + "T10:00:00",
        endDate:
          new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0] + "T18:00:00",
        location: "New York, NY",
        venue: "Financial District Conference Center",
        organizerId: "org-13",
        attendeeCount: 634,
        status: "upcoming",
        category: "conference",
        connectionsMade: 0,
        views: 1240,
        messagesSent: 0,
        satisfactionRating: 0,
        rsvpStatus: "attending",
        isBookmarked: false,
        pendingConnections: 8,
        is_featured: true,
        is_trending: true,
        featuredAttendees: [
          {
            id: "att28",
            name: "Fintech Fred",
            avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            title: "Fintech CEO",
          },
          {
            id: "att29",
            name: "Crypto Carol",
            avatar:
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
            title: "Blockchain Lead",
          },
          {
            id: "att30",
            name: "Banking Bob",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            title: "VP Innovation",
          },
        ],
        agenda: [],
        networkingEnabled: true,
        settings: {
          networkingHours: {
            start: "10:00",
            end: "18:00",
          },
          allowNetworking: true,
          allowChat: true,
          moderationEnabled: true,
          requireApproval: false,
        },
      },
      {
        id: "event-14",
        name: "Sustainable Tech Meetup",
        description:
          "Local meetup focused on green technology, renewable energy, and sustainable development",
        startDate:
          new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0] + "T18:30:00",
        endDate:
          new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0] + "T21:00:00",
        location: "Portland, OR",
        venue: "Green Building Collective",
        organizerId: "org-14",
        attendeeCount: 92,
        status: "upcoming",
        category: "meetup",
        connectionsMade: 0,
        views: 287,
        messagesSent: 0,
        satisfactionRating: 0,
        rsvpStatus: "attending",
        isBookmarked: true,
        pendingConnections: 0,
        is_featured: false,
        is_trending: false,
        featuredAttendees: [
          {
            id: "att31",
            name: "Solar Sam",
            avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            title: "Renewable Energy Engineer",
          },
          {
            id: "att32",
            name: "Green Grace",
            avatar:
              "https://images.unsplash.com/photo-1494790108755-2616b612b601?w=100&h=100&fit=crop&crop=face",
            title: "Sustainability Director",
          },
        ],
        agenda: [],
        networkingEnabled: true,
        settings: {
          networkingHours: {
            start: "18:30",
            end: "21:00",
          },
          allowNetworking: true,
          allowChat: true,
          moderationEnabled: true,
          requireApproval: false,
        },
      },
      {
        id: "event-15",
        name: "Mobile App Development Webinar",
        description:
          "Building cross-platform mobile apps with React Native and Flutter",
        startDate:
          new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0] + "T14:00:00",
        endDate:
          new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0] + "T16:30:00",
        location: "Online",
        venue: "Zoom Webinar",
        organizerId: "org-15",
        attendeeCount: 345,
        status: "upcoming",
        category: "webinar",
        connectionsMade: 0,
        views: 678,
        messagesSent: 0,
        satisfactionRating: 0,
        rsvpStatus: "maybe",
        isBookmarked: false,
        pendingConnections: 2,
        is_featured: false,
        is_trending: false,
        featuredAttendees: [
          {
            id: "att33",
            name: "Mobile Mike",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            title: "Mobile Tech Lead",
          },
          {
            id: "att34",
            name: "Flutter Fiona",
            avatar:
              "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
            title: "Senior Mobile Developer",
          },
        ],
        agenda: [
          {
            id: "agenda-10",
            title: "Introduction to Cross-Platform Development",
            startTime: "14:00",
            endTime: "14:30",
            location: "Main Room",
            type: "presentation",
          },
          {
            id: "agenda-11",
            title: "React Native vs Flutter: Pros and Cons",
            startTime: "14:30",
            endTime: "15:15",
            location: "Main Room",
            type: "session",
          },
          {
            id: "agenda-12",
            title: "Live Demo: Building Your First App",
            startTime: "15:15",
            endTime: "16:00",
            location: "Main Room",
            type: "demo",
          },
        ],
        networkingEnabled: true,
        settings: {
          networkingHours: {
            start: "14:00",
            end: "16:30",
          },
          allowNetworking: true,
          allowChat: true,
          moderationEnabled: true,
          requireApproval: false,
        },
      },
      {
        id: "event-16",
        name: "Data Science & Analytics Conference",
        description:
          "Latest trends in data science, machine learning, and business analytics",
        startDate: "2025-02-22T09:00:00",
        endDate: "2025-02-23T17:00:00",
        location: "Boston, MA",
        venue: "Boston Convention & Exhibition Center",
        organizerId: "org-16",
        attendeeCount: 1890,
        status: "upcoming",
        category: "conference",
        connectionsMade: 0,
        views: 1567,
        messagesSent: 0,
        satisfactionRating: 0,
        rsvpStatus: "attending",
        isBookmarked: true,
        pendingConnections: 12,
        is_featured: true,
        is_trending: true,
        featuredAttendees: [
          {
            id: "att35",
            name: "Data Dave",
            avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            title: "Chief Data Officer",
          },
          {
            id: "att36",
            name: "Analytics Amy",
            avatar:
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
            title: "Senior Data Scientist",
          },
          {
            id: "att37",
            name: "ML Mark",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            title: "Machine Learning Engineer",
          },
        ],
        agenda: [
          {
            id: "agenda-13",
            title: "Registration & Welcome Coffee",
            startTime: "09:00",
            endTime: "09:30",
            location: "Main Foyer",
            type: "break",
          },
          {
            id: "agenda-14",
            title: "The Future of AI and Data",
            description:
              "Keynote on emerging trends in artificial intelligence and data science",
            startTime: "09:30",
            endTime: "10:30",
            location: "Grand Ballroom",
            speaker: "Dr. Sarah Mitchell, Head of AI at Google",
            type: "keynote",
          },
        ],
        networkingEnabled: true,
        settings: {
          networkingHours: {
            start: "09:00",
            end: "17:00",
          },
          allowNetworking: true,
          allowChat: true,
          moderationEnabled: true,
          requireApproval: false,
        },
      },
      {
        id: "event-17",
        name: "Cybersecurity & Privacy Summit",
        description:
          "Protecting digital assets in the age of AI - Latest threats, defenses, and compliance strategies",
        startDate: "2025-04-05T08:30:00",
        endDate: "2025-04-05T17:30:00",
        location: "Washington, DC",
        venue: "Ronald Reagan Building",
        organizerId: "org-17",
        attendeeCount: 756,
        status: "upcoming",
        category: "conference",
        connectionsMade: 0,
        views: 1120,
        messagesSent: 0,
        satisfactionRating: 0,
        rsvpStatus: "maybe",
        isBookmarked: false,
        pendingConnections: 4,
        is_featured: true,
        is_trending: true,
        featuredAttendees: [
          {
            id: "att38",
            name: "Security Sarah",
            avatar:
              "https://images.unsplash.com/photo-1494790108755-2616b612b601?w=100&h=100&fit=crop&crop=face",
            title: "CISO",
          },
          {
            id: "att39",
            name: "Privacy Paul",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            title: "Security Architect",
          },
          {
            id: "att40",
            name: "Compliance Carol",
            avatar:
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
            title: "Risk Manager",
          },
        ],
        agenda: [
          {
            id: "agenda-15",
            title: "Registration & Security Badge Pickup",
            startTime: "08:30",
            endTime: "09:00",
            location: "Main Entrance",
            type: "break",
          },
          {
            id: "agenda-16",
            title: "State of Cybersecurity 2025",
            description: "Annual threat landscape report and predictions",
            startTime: "09:00",
            endTime: "10:00",
            location: "Auditorium A",
            speaker: "James Patterson, Director of Cybersecurity at NSA",
            type: "keynote",
          },
        ],
        networkingEnabled: true,
        settings: {
          networkingHours: {
            start: "08:30",
            end: "17:30",
          },
          allowNetworking: true,
          allowChat: true,
          moderationEnabled: true,
          requireApproval: true,
        },
      },
      {
        id: "event-18",
        name: "Founders Breakfast Club",
        description:
          "Monthly gathering for startup founders to share experiences, challenges, and wins over coffee",
        startDate: "2025-01-16T08:00:00",
        endDate: "2025-01-16T09:30:00",
        location: "San Francisco, CA",
        venue: "Blue Bottle Coffee HQ",
        organizerId: "org-18",
        attendeeCount: 24,
        status: "upcoming",
        category: "meetup",
        connectionsMade: 0,
        views: 156,
        messagesSent: 0,
        satisfactionRating: 0,
        rsvpStatus: "attending",
        isBookmarked: true,
        pendingConnections: 0,
        is_featured: false,
        is_trending: false,
        featuredAttendees: [
          {
            id: "att41",
            name: "Startup Stan",
            avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            title: "Founder & CEO",
          },
          {
            id: "att42",
            name: "Entrepreneur Emma",
            avatar:
              "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
            title: "Co-Founder",
          },
        ],
        agenda: [],
        networkingEnabled: true,
        settings: {
          networkingHours: {
            start: "08:00",
            end: "09:30",
          },
          allowNetworking: true,
          allowChat: true,
          moderationEnabled: false,
          requireApproval: false,
        },
      },
      {
        id: "event-19",
        name: "VR/AR Development Workshop",
        description:
          "Hands-on workshop building immersive experiences with Unity, WebXR, and spatial computing",
        startDate: "2025-03-12T10:00:00",
        endDate: "2025-03-12T18:00:00",
        location: "Seattle, WA",
        venue: "Microsoft Mixed Reality Lab",
        organizerId: "org-19",
        attendeeCount: 32,
        status: "upcoming",
        category: "workshop",
        connectionsMade: 0,
        views: 287,
        messagesSent: 0,
        satisfactionRating: 0,
        rsvpStatus: "attending",
        isBookmarked: false,
        pendingConnections: 1,
        is_featured: false,
        is_trending: true,
        featuredAttendees: [
          {
            id: "att43",
            name: "VR Victor",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            title: "XR Developer",
          },
          {
            id: "att44",
            name: "Metaverse Maya",
            avatar:
              "https://images.unsplash.com/photo-1494790108755-2616b612b601?w=100&h=100&fit=crop&crop=face",
            title: "AR/VR Designer",
          },
        ],
        agenda: [
          {
            id: "agenda-17",
            title: "Welcome & VR Headset Setup",
            startTime: "10:00",
            endTime: "10:30",
            location: "Main Lab",
            type: "setup",
          },
          {
            id: "agenda-18",
            title: "Introduction to Spatial Computing",
            startTime: "10:30",
            endTime: "11:30",
            location: "Main Lab",
            type: "presentation",
          },
          {
            id: "agenda-19",
            title: "Hands-on: Building Your First VR Scene",
            startTime: "11:30",
            endTime: "13:00",
            location: "Main Lab",
            type: "workshop",
          },
          {
            id: "agenda-20",
            title: "Lunch & VR Experience Demos",
            startTime: "13:00",
            endTime: "14:00",
            location: "Experience Zone",
            type: "break",
          },
        ],
        networkingEnabled: true,
        settings: {
          networkingHours: {
            start: "10:00",
            end: "18:00",
          },
          allowNetworking: true,
          allowChat: true,
          moderationEnabled: true,
          requireApproval: false,
        },
      },
    ];

    setEvents(mockEvents);
  }, []);

  const selectEvent = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    setCurrentEvent(event || null);
  };

  const clearEvent = () => {
    setCurrentEvent(null);
  };

  const performNetworkingAction = async (
    targetUserId: string,
    action: MatchAction
  ) => {
    setLoading(true);
    try {
      // Mock API call

      if (action === "connect" || action === "super_connect") {
        // Simulate creating a potential match
        const newMatch: NetworkingMatch = {
          id: `match-${Date.now()}`,
          eventId: currentEvent?.id || "",
          user1Id: "current-user",
          user2Id: targetUserId,
          status: "pending",
          createdAt: new Date().toISOString(),
        };
        setMatches((prev) => [...prev, newMatch]);
      }
    } catch (err) {
      setError("Failed to perform networking action");
    } finally {
      setLoading(false);
    }
  };

  return {
    events,
    currentEvent,
    attendees,
    matches,
    loading,
    error,
    selectEvent,
    clearEvent,
    performNetworkingAction,
  };
}

export function useEventNetworking(eventId: string) {
  const [discoveryQueue, setDiscoveryQueue] = useState<EventAttendee[]>([]);
  const [filters, setFilters] = useState<EventFilter>({
    industries: [],
    interests: [],
    lookingFor: [],
    companyStage: "all",
  });
  const [currentAttendeeIndex, setCurrentAttendeeIndex] = useState(0);

  // Mock attendees data
  useEffect(() => {
    const mockAttendees: EventAttendee[] = [
      {
        id: "attendee-1",
        userId: "user-1",
        eventId,
        profile: {
          name: "John Davis",
          title: "CEO",
          company: "StartupAI",
          industry: "Technology",
          interests: ["AI", "B2B", "Series A"],
          lookingFor: ["Partnerships", "Investors"],
          companyStage: "startup",
          profilePhoto:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          bio: "Building the future of AI-powered productivity tools",
          isVisible: true,
        },
        networkingPreferences: {
          visibility: "visible",
          showPhoto: true,
          showCompany: true,
          allowSuperConnects: true,
          blockedUsers: [],
        },
        status: "networking",
        joinedAt: "2025-03-15T08:00:00Z",
        lastActive: new Date().toISOString(),
      },
      {
        id: "attendee-2",
        userId: "user-2",
        eventId,
        profile: {
          name: "Sarah Chen",
          title: "Product Designer",
          company: "Meta",
          industry: "Technology",
          interests: ["Design", "AI", "UX"],
          lookingFor: ["Collaborations", "Talent"],
          companyStage: "enterprise",
          profilePhoto:
            "https://images.unsplash.com/photo-1494790108755-2616b612b2c5?w=150&h=150&fit=crop&crop=face",
          bio: "Passionate about creating intuitive user experiences",
          isVisible: true,
        },
        networkingPreferences: {
          visibility: "visible",
          showPhoto: true,
          showCompany: true,
          allowSuperConnects: true,
          blockedUsers: [],
        },
        status: "networking",
        joinedAt: "2025-03-15T08:30:00Z",
        lastActive: new Date().toISOString(),
      },
    ];

    setDiscoveryQueue(mockAttendees);
  }, [eventId]);

  const applyFilters = (newFilters: Partial<EventFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // Reset to first attendee when filters change
    setCurrentAttendeeIndex(0);
  };

  const nextAttendee = () => {
    setCurrentAttendeeIndex((prev) =>
      prev < discoveryQueue.length - 1 ? prev + 1 : prev
    );
  };

  const getCurrentAttendee = () => {
    return discoveryQueue[currentAttendeeIndex] || null;
  };

  const getRemainingCount = () => {
    return discoveryQueue.length - currentAttendeeIndex - 1;
  };

  return {
    discoveryQueue,
    filters,
    currentAttendeeIndex,
    currentAttendee: getCurrentAttendee(),
    remainingCount: getRemainingCount(),
    applyFilters,
    nextAttendee,
  };
}
