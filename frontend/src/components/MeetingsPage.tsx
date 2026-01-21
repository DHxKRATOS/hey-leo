import React, { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Users,
  ExternalLink,
  Settings,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Copy,
  Bot,
  CheckCircle,
  UserPlus,
  Lightbulb,
  History,
  Users2,
  Brain,
  Share2,
  Target,
  MessageCircle,
  Grid3X3,
  ChevronDown,
  X,
  Globe,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { AddContactModal } from "./AddContactModal";
import { MeetingSettingsPanel } from "./meetings/MeetingSettingsPanel";
import { User as UserType, Meeting, Contact } from "../types";
import {
  formatTime,
  formatTimeRange,
  formatDate,
  formatTimeAgo,
  groupMeetingsByDate,
  isFutureMeeting,
  isAttendeeInContacts,
  generateAIPrepData,
  shareAIPrepData,
} from "../utils/meetingHelpers";
import { getLocationIcon, renderLocationIcon } from "../utils/meetingConstants";
import {
  createMockMeetings,
  createMockContacts,
} from "../utils/meetingMockData";

type CalendarView = "day" | "week" | "month" | "year" | "schedule" | "5days";

interface MeetingsPageProps {
  user: UserType;
}

interface ViewOption {
  id: CalendarView;
  label: string;
  shortcut: string;
  icon?: React.ReactNode;
}

const viewOptions: ViewOption[] = [
  { id: "day", label: "Day", shortcut: "D" },
  { id: "week", label: "Week", shortcut: "W" },
  { id: "month", label: "Month", shortcut: "M" },
  { id: "year", label: "Year", shortcut: "Y" },
  { id: "schedule", label: "Schedule", shortcut: "A" },
  { id: "5days", label: "5 days", shortcut: "X" },
];

function CalendarViewSelector({
  currentView,
  onViewChange,
}: {
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentViewOption = viewOptions.find(
    (option) => option.id === currentView
  );

  return (
    <div className="flex items-center space-x-2">
      {/* Main View Dropdown */}
      <div className="relative">
        <Button
          variant="outline"
          className="h-10 px-4 flex items-center space-x-2 bg-background border-border hover:bg-accent"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span className="font-medium">{currentViewOption?.label}</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>

        {isDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="absolute top-12 left-0 z-50 w-48 bg-card border border-border rounded-lg shadow-lg py-2">
              {viewOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onViewChange(option.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left flex items-center justify-between hover:bg-accent transition-colors ${
                    currentView === option.id
                      ? "bg-primary/10 text-primary"
                      : "text-foreground"
                  }`}
                >
                  <span>{option.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {option.shortcut}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DayView({
  meetings,
  onMeetingClick,
  selectedMeeting,
}: {
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  selectedMeeting: Meeting | null;
}) {
  const today = new Date();
  const todayMeetings = meetings.filter(
    (meeting) => meeting.startTime.toDateString() === today.toDateString()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          {today.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h2>
        <Badge variant="outline" className="text-sm">
          {todayMeetings.length} meetings
        </Badge>
      </div>

      {todayMeetings.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-2">
            No meetings today
          </h3>
          <p className="text-sm text-muted-foreground">
            Your calendar is clear for today
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {todayMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onClick={() => onMeetingClick(meeting)}
              isSelected={selectedMeeting?.id === meeting.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WeekView({
  meetings,
  onMeetingClick,
  selectedMeeting,
}: {
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  selectedMeeting: Meeting | null;
}) {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6));

  const weekMeetings = meetings.filter(
    (meeting) =>
      meeting.startTime >= startOfWeek && meeting.startTime <= endOfWeek
  );

  const groupedMeetings = groupMeetingsByDate(weekMeetings);
  const sortedDays = Object.keys(groupedMeetings).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Week of{" "}
          {startOfWeek.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
          })}
        </h2>
        <Badge variant="outline" className="text-sm">
          {weekMeetings.length} meetings this week
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {Array.from({ length: 7 }, (_, i) => {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + i);
          const dateKey = date.toISOString().split("T")[0];
          const dayMeetings = groupedMeetings[dateKey] || [];

          return (
            <Card key={i} className="p-4 min-h-32">
              <div className="font-medium text-sm text-foreground mb-2">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="text-lg font-semibold text-muted-foreground mb-2">
                {date.getDate()}
              </div>
              <div className="space-y-2">
                {dayMeetings.slice(0, 2).map((meeting) => (
                  <div
                    key={meeting.id}
                    onClick={() => onMeetingClick(meeting)}
                    className={`text-xs p-2 rounded cursor-pointer transition-colors ${
                      selectedMeeting?.id === meeting.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent hover:bg-accent/80"
                    }`}
                  >
                    <div className="font-medium truncate">{meeting.title}</div>
                    <div className="text-xs opacity-80">
                      {formatTime(meeting.startTime)}
                    </div>
                  </div>
                ))}
                {dayMeetings.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayMeetings.length - 2} more
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function MonthView({
  meetings,
  onMeetingClick,
  selectedMeeting,
}: {
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  selectedMeeting: Meeting | null;
}) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);

  const monthMeetings = meetings.filter(
    (meeting) =>
      meeting.startTime.getMonth() === currentMonth &&
      meeting.startTime.getFullYear() === currentYear
  );

  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());

  const endDate = new Date(lastDay);
  endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

  const days = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const groupedMeetings = groupMeetingsByDate(monthMeetings);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <Badge variant="outline" className="text-sm">
          {monthMeetings.length} meetings this month
        </Badge>
      </div>

      {/* Calendar Grid */}
      <Card className="p-4">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center font-medium text-sm text-muted-foreground p-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dateKey = day.toISOString().split("T")[0];
            const dayMeetings = groupedMeetings[dateKey] || [];
            const isCurrentMonth = day.getMonth() === currentMonth;
            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`min-h-24 p-2 rounded border transition-colors ${
                  isCurrentMonth
                    ? "bg-card border-border"
                    : "bg-muted/50 border-muted"
                } ${isToday ? "ring-2 ring-primary bg-primary/5" : ""}`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                  } ${isToday ? "text-primary font-bold" : ""}`}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayMeetings.slice(0, 3).map((meeting) => (
                    <div
                      key={meeting.id}
                      onClick={() => onMeetingClick(meeting)}
                      className={`text-xs p-1 rounded cursor-pointer truncate transition-colors ${
                        selectedMeeting?.id === meeting.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent hover:bg-accent/80"
                      }`}
                      title={meeting.title}
                    >
                      {meeting.title}
                    </div>
                  ))}
                  {dayMeetings.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayMeetings.length - 3}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function YearView({ meetings }: { meetings: Meeting[] }) {
  const currentYear = new Date().getFullYear();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const meetingsByMonth = Array.from({ length: 12 }, (_, monthIndex) => {
    return meetings.filter(
      (meeting) =>
        meeting.startTime.getFullYear() === currentYear &&
        meeting.startTime.getMonth() === monthIndex
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{currentYear}</h2>
        <Badge variant="outline" className="text-sm">
          {meetings.length} meetings this year
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {monthNames.map((monthName, index) => {
          const monthMeetings = meetingsByMonth[index];
          return (
            <Card key={index} className="p-4">
              <h3 className="font-medium text-foreground mb-2">{monthName}</h3>
              <div className="text-2xl font-bold text-muted-foreground mb-2">
                {monthMeetings.length}
              </div>
              <div className="text-sm text-muted-foreground">
                {monthMeetings.length === 1 ? "meeting" : "meetings"}
              </div>
              {monthMeetings.length > 0 && (
                <Progress
                  value={
                    (monthMeetings.length /
                      Math.max(...meetingsByMonth.map((m) => m.length))) *
                    100
                  }
                  className="mt-3 h-1"
                />
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ScheduleView({
  meetings,
  onMeetingClick,
  selectedMeeting,
}: {
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  selectedMeeting: Meeting | null;
}) {
  const groupedMeetings = groupMeetingsByDate(meetings);
  const sortedDateKeys = Object.keys(groupedMeetings).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Schedule</h2>
        <Badge variant="outline" className="text-sm">
          {meetings.length} total meetings
        </Badge>
      </div>

      {sortedDateKeys.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No meetings scheduled
          </h3>
          <p className="text-muted-foreground">Your calendar is clear</p>
        </Card>
      ) : (
        sortedDateKeys.map((dateKey) => {
          const dateObj = new Date(dateKey);
          const dayMeetings = groupedMeetings[dateKey];

          return (
            <div key={dateKey} className="space-y-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-semibold text-foreground">
                  {formatDate(dateObj)}
                </h3>
                <div className="text-sm text-muted-foreground">
                  {dateObj.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>

              <div className="grid gap-3">
                {dayMeetings.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onClick={() => onMeetingClick(meeting)}
                    isSelected={selectedMeeting?.id === meeting.id}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function FiveDaysView({
  meetings,
  onMeetingClick,
  selectedMeeting,
}: {
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  selectedMeeting: Meeting | null;
}) {
  const today = new Date();
  const fiveDaysFromNow = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);

  const fiveDayMeetings = meetings.filter(
    (meeting) =>
      meeting.startTime >= today && meeting.startTime <= fiveDaysFromNow
  );

  const groupedMeetings = groupMeetingsByDate(fiveDayMeetings);
  const sortedDays = Object.keys(groupedMeetings).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Next 5 Days</h2>
        <Badge variant="outline" className="text-sm">
          {fiveDayMeetings.length} upcoming meetings
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }, (_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const dateKey = date.toISOString().split("T")[0];
          const dayMeetings = groupedMeetings[dateKey] || [];

          return (
            <Card key={i} className="p-4 min-h-32">
              <div className="font-medium text-sm text-foreground mb-1">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="text-lg font-semibold text-muted-foreground mb-3">
                {date.getDate()}
              </div>
              <div className="space-y-2">
                {dayMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    onClick={() => onMeetingClick(meeting)}
                    className={`text-xs p-2 rounded cursor-pointer transition-colors ${
                      selectedMeeting?.id === meeting.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent hover:bg-accent/80"
                    }`}
                  >
                    <div className="font-medium truncate">{meeting.title}</div>
                    <div className="text-xs opacity-80">
                      {formatTime(meeting.startTime)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function MeetingCard({
  meeting,
  onClick,
  isSelected,
}: {
  meeting: Meeting;
  onClick: () => void;
  isSelected: boolean;
}) {
  return (
    <Card
      className={`p-4 hover:shadow-sm transition-all duration-200 cursor-pointer border hover:border-border group ${
        isSelected ? "bg-primary/5 border-primary/20" : "bg-card border-border"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className="text-sm font-medium text-muted-foreground min-w-24">
          {formatTime(meeting.startTime)}
        </div>

        <div className="flex-1 space-y-1">
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
            {meeting.title}
          </h3>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              {renderLocationIcon(meeting.locationType, "h-4 w-4")}
              <span>{meeting.location}</span>
            </div>

            <div className="flex items-center space-x-1">
              {meeting.attendees.length === 1 ? (
                <User className="h-4 w-4" />
              ) : (
                <Users className="h-4 w-4" />
              )}
              <span>{meeting.attendees.length} attendees</span>
            </div>

            {meeting.aiPrepHistory && meeting.aiPrepHistory.length > 0 && (
              <div className="flex items-center space-x-1">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-primary">AI Prepped</span>
              </div>
            )}

            {isFutureMeeting(meeting) && (
              <div className="flex items-center space-x-1">
                <Brain className="h-4 w-4 text-success" />
                <span className="text-success">Prep Available</span>
              </div>
            )}
          </div>

          {meeting.relatedCardId && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-sm text-primary font-medium">
                Related to: {meeting.relatedCardName}
              </span>
            </div>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          {Math.round(
            (meeting.endTime.getTime() - meeting.startTime.getTime()) /
              (1000 * 60)
          )}
          m
        </div>
      </div>
    </Card>
  );
}

export function MeetingsPage({ user }: MeetingsPageProps) {
  // Ensure user prop is valid to prevent rendering issues
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Loading Meetings
          </h2>
          <p className="text-muted-foreground">
            Please wait while we prepare your meeting data...
          </p>
        </div>
      </div>
    );
  }

  const [isCalendarConnected, setIsCalendarConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isGeneratingPrep, setIsGeneratingPrep] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [selectedAttendeeForAdd, setSelectedAttendeeForAdd] =
    useState<any>(null);
  const [currentView, setCurrentView] = useState<CalendarView>("day");

  // Mock data with safe fallbacks
  const existingContacts = React.useMemo(() => {
    try {
      return createMockContacts();
    } catch (error) {
      console.warn("Error creating mock contacts:", error);
      return [];
    }
  }, []);

  const mockMeetings = React.useMemo(() => {
    if (!isCalendarConnected || !user) return [];
    try {
      return createMockMeetings(user);
    } catch (error) {
      console.warn("Error creating mock meetings:", error);
      return [];
    }
  }, [isCalendarConnected, user]);

  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setActiveTab("details");
  };

  const handleCloseMeetingDetail = () => {
    setSelectedMeeting(null);
  };

  const handleConnectCalendar = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsCalendarConnected(true);
    setIsLoading(false);
  };

  const handleAddAttendeeToContacts = (attendee: any) => {
    setSelectedAttendeeForAdd(attendee);
    setShowAddContactModal(true);
  };

  const handleSaveContact = (contactData: any) => {
    setShowAddContactModal(false);
    setSelectedAttendeeForAdd(null);
  };

  const handleGenerateAIPrep = async (meeting: Meeting) => {
    if (!isFutureMeeting(meeting)) return;

    setIsGeneratingPrep(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const aiPrep = generateAIPrepData(meeting, user);

    if (selectedMeeting) {
      const updatedMeeting = {
        ...selectedMeeting,
        aiPrepHistory: [aiPrep, ...(selectedMeeting.aiPrepHistory || [])],
      };
      setSelectedMeeting(updatedMeeting);
    }

    setIsGeneratingPrep(false);
  };

  const handleSharePrep = (meeting: Meeting) => {
    shareAIPrepData(meeting);
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) return;

      const keyMap: Record<string, CalendarView> = {
        d: "day",
        w: "week",
        m: "month",
        y: "year",
        a: "schedule",
        x: "5days",
      };

      const view = keyMap[event.key.toLowerCase()];
      if (view) {
        event.preventDefault();
        setCurrentView(view);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const renderCalendarView = () => {
    switch (currentView) {
      case "day":
        return (
          <DayView
            meetings={mockMeetings}
            onMeetingClick={handleMeetingClick}
            selectedMeeting={selectedMeeting}
          />
        );
      case "week":
        return (
          <WeekView
            meetings={mockMeetings}
            onMeetingClick={handleMeetingClick}
            selectedMeeting={selectedMeeting}
          />
        );
      case "month":
        return (
          <MonthView
            meetings={mockMeetings}
            onMeetingClick={handleMeetingClick}
            selectedMeeting={selectedMeeting}
          />
        );
      case "year":
        return <YearView meetings={mockMeetings} />;
      case "schedule":
        return (
          <ScheduleView
            meetings={mockMeetings}
            onMeetingClick={handleMeetingClick}
            selectedMeeting={selectedMeeting}
          />
        );
      case "5days":
        return (
          <FiveDaysView
            meetings={mockMeetings}
            onMeetingClick={handleMeetingClick}
            selectedMeeting={selectedMeeting}
          />
        );
      default:
        return (
          <DayView
            meetings={mockMeetings}
            onMeetingClick={handleMeetingClick}
            selectedMeeting={selectedMeeting}
          />
        );
    }
  };

  if (!isCalendarConnected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b border-border px-8 py-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="mb-2">Meetings</h1>
            <p className="text-muted-foreground">
              Stay prepared for every connection
            </p>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <Card className="p-8 text-center">
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    Connect your calendar
                  </h2>
                  <p className="text-muted-foreground">
                    See meetings & let AI help prep for better conversations
                  </p>
                </div>

                <Button
                  onClick={handleConnectCalendar}
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-3"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Connect Google Calendar
                    </>
                  )}
                </Button>

                <div className="pt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>AI-powered meeting preparation</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Contact context from your cards</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Smart reminders and insights</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="mb-2">Meetings</h1>
            <p className="text-muted-foreground">
              Stay prepared for every connection
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <CalendarViewSelector
              currentView={currentView}
              onViewChange={setCurrentView}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="p-2"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar Views */}
            <div className="lg:col-span-2">{renderCalendarView()}</div>

            {/* Meeting Detail Panel */}
            {selectedMeeting && (
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-foreground truncate">
                        {selectedMeeting.title}
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCloseMeetingDetail}
                        className="p-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {formatDate(selectedMeeting.startTime)} •{" "}
                      {formatTimeRange(
                        selectedMeeting.startTime,
                        selectedMeeting.endTime
                      )}
                    </div>
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full p-1 m-4 mb-0">
                      <TabsTrigger value="details" className="flex-1 text-xs">
                        Details
                      </TabsTrigger>
                      <TabsTrigger value="attendees" className="flex-1 text-xs">
                        People
                      </TabsTrigger>
                      <TabsTrigger value="prep" className="flex-1 text-xs">
                        AI Prep
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="p-6 pt-4">
                      <div className="space-y-4">
                        {/* Location */}
                        <div className="flex items-start space-x-3">
                          {renderLocationIcon(
                            selectedMeeting.locationType,
                            "h-5 w-5 mt-0.5 text-muted-foreground"
                          )}
                          <div>
                            <div className="font-medium text-foreground">
                              Location
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {selectedMeeting.location}
                            </div>
                          </div>
                        </div>

                        {/* Duration */}
                        <div className="flex items-start space-x-3">
                          <Clock className="h-5 w-5 mt-0.5 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-foreground">
                              Duration
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {Math.round(
                                (selectedMeeting.endTime.getTime() -
                                  selectedMeeting.startTime.getTime()) /
                                  (1000 * 60)
                              )}{" "}
                              minutes
                            </div>
                          </div>
                        </div>

                        {/* Related Card */}
                        {selectedMeeting.relatedCardId && (
                          <div className="flex items-start space-x-3">
                            <div className="w-5 h-5 bg-primary rounded mt-0.5 flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                Related Card
                              </div>
                              <div className="text-sm text-primary">
                                {selectedMeeting.relatedCardName}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Meeting Link */}
                        {selectedMeeting.locationType === "video" && (
                          <Button className="w-full mt-4" variant="outline">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Join Meeting
                          </Button>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="attendees" className="p-6 pt-4">
                      <div className="space-y-3">
                        {selectedMeeting.attendees
                          .filter((attendee) => attendee.email !== user.email)
                          .map((attendee, index) => {
                            const isInContacts = isAttendeeInContacts(
                              attendee,
                              existingContacts
                            );
                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-accent rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary">
                                      {(attendee.name || attendee.email)
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-foreground text-sm">
                                      {attendee.name || attendee.email}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {attendee.company || attendee.email}
                                    </div>
                                  </div>
                                </div>

                                {isInContacts ? (
                                  <Badge variant="outline" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Contact
                                  </Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleAddAttendeeToContacts(attendee)
                                    }
                                    className="text-xs px-2"
                                  >
                                    <UserPlus className="h-3 w-3 mr-1" />
                                    Add
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </TabsContent>

                    <TabsContent value="prep" className="p-6 pt-4">
                      <div className="space-y-6">
                        {/* AI Prep Generation */}
                        {isFutureMeeting(selectedMeeting) && (
                          <div className="text-center">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Brain className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-2">
                              AI Meeting Prep
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Get AI-powered insights, talking points, and
                              attendee context to make this meeting more
                              effective.
                            </p>
                            <Button
                              onClick={() =>
                                handleGenerateAIPrep(selectedMeeting)
                              }
                              disabled={isGeneratingPrep}
                              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
                            >
                              {isGeneratingPrep ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Generate AI Prep
                                </>
                              )}
                            </Button>
                          </div>
                        )}

                        {/* AI Prep History */}
                        {selectedMeeting.aiPrepHistory &&
                          selectedMeeting.aiPrepHistory.length > 0 && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-foreground">
                                  Meeting Preparation
                                </h4>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleSharePrep(selectedMeeting)
                                    }
                                    className="text-xs px-2"
                                  >
                                    <Share2 className="h-3 w-3 mr-1" />
                                    Share
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      navigator.clipboard.writeText(
                                        JSON.stringify(
                                          selectedMeeting.aiPrepHistory[0],
                                          null,
                                          2
                                        )
                                      )
                                    }
                                    className="text-xs px-2"
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy
                                  </Button>
                                </div>
                              </div>

                              {selectedMeeting.aiPrepHistory
                                .slice(0, 1)
                                .map((prep, index) => (
                                  <div key={index} className="space-y-4">
                                    {/* Key Insights */}
                                    <div>
                                      <h5 className="font-medium text-foreground mb-2 flex items-center">
                                        <Lightbulb className="h-4 w-4 mr-2 text-primary" />
                                        Key Insights
                                      </h5>
                                      <div className="space-y-2">
                                        {prep.insights.map((insight, i) => (
                                          <div
                                            key={i}
                                            className="text-sm text-muted-foreground flex items-start space-x-2"
                                          >
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                                            <span>{insight}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Talking Points */}
                                    <div>
                                      <h5 className="font-medium text-foreground mb-2 flex items-center">
                                        <MessageCircle className="h-4 w-4 mr-2 text-success" />
                                        Suggested Talking Points
                                      </h5>
                                      <div className="space-y-2">
                                        {prep.talkingPoints.map((point, i) => (
                                          <div
                                            key={i}
                                            className="text-sm text-muted-foreground flex items-start space-x-2"
                                          >
                                            <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0" />
                                            <span>{point}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Questions to Ask */}
                                    <div>
                                      <h5 className="font-medium text-foreground mb-2 flex items-center">
                                        <Target className="h-4 w-4 mr-2 text-warning" />
                                        Questions to Ask
                                      </h5>
                                      <div className="space-y-2">
                                        {prep.questions.map((question, i) => (
                                          <div
                                            key={i}
                                            className="text-sm text-muted-foreground flex items-start space-x-2"
                                          >
                                            <div className="w-1.5 h-1.5 bg-warning rounded-full mt-2 flex-shrink-0" />
                                            <span>{question}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Attendee Context */}
                                    {prep.attendeeContext &&
                                      prep.attendeeContext.length > 0 && (
                                        <div>
                                          <h5 className="font-medium text-foreground mb-2 flex items-center">
                                            <Users2 className="h-4 w-4 mr-2 text-info" />
                                            Attendee Context
                                          </h5>
                                          <div className="space-y-3">
                                            {prep.attendeeContext.map(
                                              (attendee, i) => (
                                                <Card key={i} className="p-3">
                                                  <div className="font-medium text-foreground text-sm mb-2">
                                                    {attendee.name}
                                                  </div>
                                                  <div className="space-y-1">
                                                    {attendee.insights.map(
                                                      (insight, j) => (
                                                        <div
                                                          key={j}
                                                          className="text-xs text-muted-foreground flex items-start space-x-2"
                                                        >
                                                          <div className="w-1 h-1 bg-info rounded-full mt-1.5 flex-shrink-0" />
                                                          <span>{insight}</span>
                                                        </div>
                                                      )
                                                    )}
                                                  </div>
                                                </Card>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                                      Generated {formatTimeAgo(prep.preparedAt)}{" "}
                                      • AI-powered insights
                                    </div>
                                  </div>
                                ))}

                              {selectedMeeting.aiPrepHistory.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full mt-2"
                                >
                                  <History className="h-4 w-4 mr-2" />
                                  View Previous Preps (
                                  {selectedMeeting.aiPrepHistory.length - 1})
                                </Button>
                              )}
                            </div>
                          )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <MeetingSettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          user={user}
        />
      )}

      {/* Add Contact Modal */}
      {showAddContactModal && selectedAttendeeForAdd && (
        <AddContactModal
          isOpen={showAddContactModal}
          onClose={() => setShowAddContactModal(false)}
          onSave={handleSaveContact}
          prefillData={{
            name: selectedAttendeeForAdd.name || "",
            email: selectedAttendeeForAdd.email || "",
            company: selectedAttendeeForAdd.company || "",
            job_title: selectedAttendeeForAdd.title || "",
            source: "meeting",
          }}
        />
      )}
    </div>
  );
}
