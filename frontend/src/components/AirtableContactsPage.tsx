import {
  Activity,
  ArrowUpDown,
  Bot,
  Columns,
  Copy,
  Download,
  Edit3,
  Filter,
  Globe,
  Grid3X3,
  Link as LinkIcon,
  Mail,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Plus,
  QrCode,
  Search,
  SortAsc,
  SortDesc,
  TableIcon,
  Tag,
  Target,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  bulkDeleteContacts,
  deleteContact,
  fetchContacts,
} from "../store/contactSlice";
import { AddContactModal } from "./AddContactModal";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { exportContactsToExcel } from "../utils/exportContacts";

interface User {
  id: string;
  email: string;
  name: string;
}

interface Contact {
  id: string;
  card_id: string;
  card_owner_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company: string;
  company_website?: string;
  job_title?: string;
  location?: string;
  linkedin?: string;
  source:
    | "qr"
    | "link"
    | "email"
    | "ai_chat"
    | "social"
    | "referral"
    | "direct";
  status: "new" | "contacted" | "archived";
  last_contact: string;
  last_interaction?: string;
  notes?: string;
  tags: string[];
  interactions_count?: number;
  card_name?: string;

  // Complete Contact Field Structure
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  linkedin_url?: string;
}

interface AirtableContactsPageProps {
  user: User;
  userPlan?: "starter" | "professional" | "executive";
  navigationContext?: {
    type: "personal" | "company" | "event";
    id?: string;
    name?: string;
  };
}

type ViewMode = "table" | "gallery";
type SortDirection = "asc" | "desc" | null;
type SortField =
  | "first_name"
  | "last_name"
  | "email"
  | "phone"
  | "company"
  | "job_title"
  | "location"
  | "source"
  | "last_contact";

export function AirtableContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  // const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [filterSource, setFilterSource] = useState("all");
  const [sortField, setSortField] = useState<SortField>("last_contact");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Detail Panel State
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    checkbox: true,
    name: true,
    email: true,
    company: true,
    job_title: true,
    phone: true,
    location: true,
    source: true,
    tags: true,
    last_contact: true,
    actions: true,
  });

  // Column widths (for resizing)
  const [columnWidths, setColumnWidths] = useState({
    checkbox: 32,
    name: 200,
    email: 200,
    company: 180,
    job_title: 180,
    phone: 140,
    location: 150,
    source: 120,
    tags: 150,
    last_contact: 120,
    actions: 80,
  });

  // Editing state
  const [editingCell, setEditingCell] = useState<{
    contactId: string;
    field: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");

  const dispatch = useAppDispatch();
  const { contacts: contactsData, isLoading } = useAppSelector(
    (state) => state.contacts
  );

  useEffect(() => {
    dispatch(fetchContacts());
  }, []);

  useEffect(() => {
    setContacts(contactsData);
  }, [contactsData]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle row selection
  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const selectAllContacts = () => {
    if (selectedContacts.length === filteredAndSortedContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(
        filteredAndSortedContacts.map((contact) => contact.id)
      );
    }
  };

  // Handle cell editing
  const startEditing = (
    contactId: string,
    field: string,
    currentValue: string
  ) => {
    setEditingCell({ contactId, field });
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (!editingCell) return;

    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === editingCell.contactId
          ? { ...contact, [editingCell.field]: editValue }
          : contact
      )
    );

    setEditingCell(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  // Get all unique tags from existing contacts
  const getAllTags = () => {
    const tagSet = new Set<string>();
    contacts?.forEach((contact) => {
      contact?.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  };

  // Filter and sort contacts
  const filteredAndSortedContacts = contacts
    .filter((contact) => {
      const matchesSearch =
        contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesSource =
        filterSource === "all" || contact.source === filterSource;

      return matchesSearch && matchesSource;
    })
    .sort((a, b) => {
      if (!sortDirection) return 0;

      let aValue: any = "";
      let bValue: any = "";

      switch (sortField) {
        case "first_name":
          aValue = a.first_name;
          bValue = b.first_name;
          break;
        case "last_name":
          aValue = a.last_name;
          bValue = b.last_name;
          break;
        case "email":
          aValue = a.email;
          bValue = b.email;
          break;
        case "company":
          aValue = a.company;
          bValue = b.company;
          break;
        case "job_title":
          aValue = a.job_title || "";
          bValue = b.job_title || "";
          break;
        case "last_contact":
          aValue = new Date(a.last_contact).getTime();
          bValue = new Date(b.last_contact).getTime();
          break;
        default:
          return 0;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Handle contact click - open detail panel
  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setShowDetailPanel(true);
  };

  // Generate avatar with enhanced gradients and sizing
  const generateAvatar = (contact: Contact) => {
    const initials = (
      contact.first_name.charAt(0) + contact.last_name.charAt(0)
    ).toUpperCase();
    const gradients = [
      "linear-gradient(135deg, #FF6B9D, #C44569)", // Pink
      "linear-gradient(135deg, #667EEA, #764BA2)", // Purple
      "linear-gradient(135deg, #F26522, #E14D2A)", // Leo Orange
      "linear-gradient(135deg, #4FACFE, #00F2FE)", // Blue
      "linear-gradient(135deg, #34C759, #28A745)", // Green
      "linear-gradient(135deg, #8B5CF6, #7C3AED)", // Purple Alt
      "linear-gradient(135deg, #EC4899, #DB2777)", // Pink Alt
      "linear-gradient(135deg, #F59E0B, #D97706)", // Orange Alt
    ];

    // fallback: if id missing, random index
    const index = contact?.id
      ? Number(contact.id) % gradients.length
      : Math.floor(Math.random() * gradients.length);

    return (
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-base shadow-md"
        style={{
          background: gradients[index],
        }}
      >
        {initials}
      </div>
    );
  };

  // Format source
  const formatSource = (source: string) => {
    switch (source) {
      case "qr":
        return "QR Code";
      case "link":
        return "Link";
      case "email":
        return "Email";
      case "ai_chat":
        return "AI Chat";
      case "social":
        return "Social";
      case "referral":
        return "Referral";
      case "direct":
        return "Direct";
      default:
        return source;
    }
  };

  // Get source icon
  const getSourceIcon = (source: string) => {
    switch (source) {
      case "card_scan":
        return <QrCode className="h-3 w-3" />;
      case "website":
        return <LinkIcon className="h-3 w-3" />;
      case "email":
        return <Mail className="h-3 w-3" />;
      case "ai_chat":
        return <Bot className="h-3 w-3" />;
      case "social":
        return <Globe className="h-3 w-3" />;
      case "referral":
        return <UserCheck className="h-3 w-3" />;
      case "direct":
        return <Target className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "-";

    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Render editable cell
  const renderEditableCell = (
    contact: Contact,
    field: string,
    value: string,
    className: string = ""
  ) => {
    const isEditing =
      editingCell?.contactId === contact.id && editingCell?.field === field;

    if (isEditing) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveEdit();
            if (e.key === "Escape") cancelEdit();
          }}
          className="w-full px-0 py-0 border-none focus:outline-none focus:ring-1 focus:ring-[#F26522] rounded-sm bg-white"
          autoFocus
        />
      );
    }

    return (
      <span
        className={`cursor-pointer hover:bg-[#F9FAFB] px-1 py-1 rounded ${className}`}
        onClick={() => startEditing(contact.id, field, value)}
        title="Click to edit"
      >
        {value || "-"}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="bg-white px-8 py-6 border-b border-[#E5E7EB]">
          <div className="animate-pulse">
            <div className="h-8 bg-[#F3F4F6] rounded w-32 mb-2"></div>
            <div className="h-4 bg-[#F3F4F6] rounded w-48"></div>
          </div>
        </div>
        <div className="animate-pulse p-8">
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-white border border-[#E5E7EB] rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Fixed Header Section */}
      <div className="bg-white px-4 sm:px-8 py-6 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] sm:text-[28px] font-bold text-[#111827] mb-1">
              Contacts
            </h1>
            <p className="text-[12px] sm:text-[14px] text-[#6B7280]">
              Manage your professional network
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-[#F26522] hover:bg-[#E85A17] text-white px-4 sm:px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Contact</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Enhanced Controls Bar */}
      <div className="sticky top-0 z-40 bg-white px-4 sm:px-8 py-4 border-b border-[#E5E7EB]">
        <div className="flex items-center space-x-2">
          {/* Enhanced Search Bar */}
          <div className="relative flex-grow max-w-none sm:max-w-[400px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] h-4 w-4" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-[#F3F4F6] border-transparent focus:border-[#F26522] focus:ring-[#F26522] focus:shadow-[0_0_0_3px_rgba(242,101,34,0.1)] text-sm transition-all duration-200"
              style={{ height: "40px" }}
            />
          </div>

          {/* Mobile: Show only essential controls */}
          <div className="flex sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-3 bg-white border-[#E5E7EB] hover:border-[#F26522] transition-all duration-200"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-md">
                <DropdownMenuItem onClick={() => setFilterSource("all")}>
                  All Sources
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterSource("qr")}>
                  QR Code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterSource("link")}>
                  Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterSource("email")}>
                  Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterSource("ai_chat")}>
                  AI Chat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterSource("social")}>
                  Social
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop: Enhanced controls with gaps */}
          <div className="hidden sm:flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex border border-[#E5E7EB] rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                  viewMode === "table"
                    ? "bg-[#F26522] text-white"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                <TableIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("gallery")}
                className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                  viewMode === "gallery"
                    ? "bg-[#F26522] text-white"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 bg-white border-[#E5E7EB] hover:border-[#F26522] transition-all duration-200"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {filterSource !== "all" && (
                    <Badge variant="secondary" className="ml-2 px-1">
                      1
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 rounded-md">
                <DropdownMenuItem onClick={() => setFilterSource("all")}>
                  All Sources
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterSource("qr")}>
                  QR Code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterSource("link")}>
                  Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterSource("email")}>
                  Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterSource("ai_chat")}>
                  AI Chat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterSource("social")}>
                  Social
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Dropdown */}
            <Select
              value={`${sortField}-${sortDirection}`}
              onValueChange={(value) => {
                const [field, direction] = value.split("-") as [
                  SortField,
                  SortDirection
                ];
                setSortField(field);
                setSortDirection(direction);
              }}
            >
              <SelectTrigger className="w-48 h-10 bg-white border-[#E5E7EB] hover:border-[#F26522] transition-all duration-200 rounded-md">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent className="rounded-md">
                <SelectItem value="first_name-asc">Name A→Z</SelectItem>
                <SelectItem value="first_name-desc">Name Z→A</SelectItem>
                <SelectItem value="company-asc">Company A→Z</SelectItem>
                <SelectItem value="company-desc">Company Z→A</SelectItem>
                <SelectItem value="last_contact-desc">Newest First</SelectItem>
                <SelectItem value="last_contact-asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>

            {/* Column Settings */}
            <Popover
              open={showColumnSettings}
              onOpenChange={setShowColumnSettings}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 bg-white border-[#E5E7EB] hover:border-[#F26522] transition-all duration-200"
                >
                  <Columns className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 rounded-md" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Show/Hide Columns</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(visibleColumns).map(([key, visible]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={visible}
                          onCheckedChange={(checked) =>
                            setVisibleColumns((prev) => ({
                              ...prev,
                              [key]: checked,
                            }))
                          }
                        />
                        <label htmlFor={key} className="text-sm capitalize">
                          {key.replace("_", " ")}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Export Button */}
            <Button
              variant="outline"
              size="sm"
              className="h-10 bg-white border-[#E5E7EB] hover:border-[#F26522] transition-all duration-200"
              onClick={() => {
                const contactsToExport =
                  selectedContacts.length > 0 ? selectedContacts : contactsData;
                exportContactsToExcel(contactsToExport, "contacts.xlsx");
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Floating Bar */}
      {selectedContacts.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in-up">
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-6 py-4">
            <div className="flex items-center space-x-6">
              {/* Selection Count */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#F26522] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {selectedContacts.length}
                  </span>
                </div>
                <span className="text-[14px] font-medium text-[#374151]">
                  {selectedContacts.length} contact
                  {selectedContacts.length !== 1 ? "s" : ""} selected
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {/* Add Tags */}
                {/* <Button
                  variant="outline"
                  size="sm"
                  className="h-9 bg-white border-[#E5E7EB] hover:border-[#F26522] transition-all duration-200"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Add Tags
                </Button> */}

                {/* Export Selected */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 bg-white border-[#E5E7EB] hover:border-[#F26522] transition-all duration-200"
                  onClick={() => {
                    const contactsToExport: any =
                      selectedContacts.length > 0
                        ? contactsData.filter((c) =>
                            selectedContacts.includes(c.id)
                          )
                        : contactsData;
                    exportContactsToExcel(contactsToExport, "contacts.xlsx");
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>

                {/* Delete */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 bg-white border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
                  onClick={() => {
                    dispatch(bulkDeleteContacts(selectedContacts));
                    setSelectedContacts([]);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedContacts([])}
                className="ml-2 p-2 text-[#6B7280] hover:text-[#374151] hover:bg-[#F9FAFB] rounded-lg transition-all duration-200"
                title="Clear selection"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="sm:hidden bg-white">
        <div className="p-4 space-y-4">
          {filteredAndSortedContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white border border-[#E5E7EB] rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleContactClick(contact)}
            >
              <div className="flex items-start space-x-3">
                {generateAvatar(contact)}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#111827] mb-1">
                    {contact.first_name} {contact.last_name}
                  </h3>
                  <p className="text-sm text-[#6B7280] mb-1">
                    {contact.company}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mb-2">{contact.email}</p>
                  <div className="flex items-center space-x-2">
                    {getSourceIcon(contact.source)}
                    <span className="text-xs text-[#6B7280]">
                      {formatSource(contact.source)}
                    </span>
                    <span className="text-xs text-[#9CA3AF]">•</span>
                    <span className="text-xs text-[#9CA3AF]">
                      {formatTimeAgo(contact.last_interaction)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Container with Shadow and Rounded Corners */}
      <div className="hidden sm:block bg-white mx-4 sm:mx-8 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        {viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Premium Table Header */}
              <thead>
                <tr
                  className="bg-[#F5F5F7] border-b-2 border-[#E5E7EB]"
                  style={{ height: "44px" }}
                >
                  {/* Checkbox Column */}
                  {visibleColumns.checkbox && (
                    <th className="w-8 px-5 text-left">
                      <Checkbox
                        checked={
                          selectedContacts.length ===
                          filteredAndSortedContacts.length
                        }
                        onCheckedChange={selectAllContacts}
                      />
                    </th>
                  )}

                  {/* Name Column - Primary */}
                  {visibleColumns.name && (
                    <th
                      className="px-5 text-left cursor-pointer hover:bg-[#EBEBED] transition-colors group"
                      style={{ width: columnWidths.name }}
                      onClick={() => handleSort("first_name")}
                    >
                      <div className="flex items-center space-x-1">
                        <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px]">
                          Name
                        </span>
                        <div className="flex items-center opacity-30 group-hover:opacity-100 transition-opacity">
                          {sortField === "first_name" &&
                            (sortDirection === "asc" ? (
                              <SortAsc className="h-3 w-3 text-[#F26522] opacity-100" />
                            ) : (
                              <SortDesc className="h-3 w-3 text-[#F26522] opacity-100" />
                            ))}
                          {sortField !== "first_name" && (
                            <ArrowUpDown className="h-3 w-3 text-[#6B7280]" />
                          )}
                        </div>
                      </div>
                    </th>
                  )}

                  {/* Email Column */}
                  {visibleColumns.email && (
                    <th
                      className="px-5 text-left cursor-pointer hover:bg-[#EBEBED] transition-colors group"
                      style={{ width: columnWidths.email }}
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center space-x-1">
                        <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px]">
                          Email
                        </span>
                        <div className="flex items-center opacity-30 group-hover:opacity-100 transition-opacity">
                          {sortField === "email" &&
                            (sortDirection === "asc" ? (
                              <SortAsc className="h-3 w-3 text-[#F26522] opacity-100" />
                            ) : (
                              <SortDesc className="h-3 w-3 text-[#F26522] opacity-100" />
                            ))}
                          {sortField !== "email" && (
                            <ArrowUpDown className="h-3 w-3 text-[#6B7280]" />
                          )}
                        </div>
                      </div>
                    </th>
                  )}

                  {/* Company Column */}
                  {visibleColumns.company && (
                    <th
                      className="px-5 text-left cursor-pointer hover:bg-[#EBEBED] transition-colors group"
                      style={{ width: columnWidths.company }}
                      onClick={() => handleSort("company")}
                    >
                      <div className="flex items-center space-x-1">
                        <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px]">
                          Company
                        </span>
                        <div className="flex items-center opacity-30 group-hover:opacity-100 transition-opacity">
                          {sortField === "company" &&
                            (sortDirection === "asc" ? (
                              <SortAsc className="h-3 w-3 text-[#F26522] opacity-100" />
                            ) : (
                              <SortDesc className="h-3 w-3 text-[#F26522] opacity-100" />
                            ))}
                          {sortField !== "company" && (
                            <ArrowUpDown className="h-3 w-3 text-[#6B7280]" />
                          )}
                        </div>
                      </div>
                    </th>
                  )}

                  {/* Job Title Column */}
                  {visibleColumns.job_title && (
                    <th
                      className="px-5 text-left cursor-pointer hover:bg-[#EBEBED] transition-colors group"
                      style={{ width: columnWidths.job_title }}
                      onClick={() => handleSort("job_title")}
                    >
                      <div className="flex items-center space-x-1">
                        <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px]">
                          Title
                        </span>
                        <div className="flex items-center opacity-30 group-hover:opacity-100 transition-opacity">
                          {sortField === "job_title" &&
                            (sortDirection === "asc" ? (
                              <SortAsc className="h-3 w-3 text-[#F26522] opacity-100" />
                            ) : (
                              <SortDesc className="h-3 w-3 text-[#F26522] opacity-100" />
                            ))}
                          {sortField !== "job_title" && (
                            <ArrowUpDown className="h-3 w-3 text-[#6B7280]" />
                          )}
                        </div>
                      </div>
                    </th>
                  )}

                  {/* Phone Column */}
                  {visibleColumns.phone && (
                    <th
                      className="px-5 text-left"
                      style={{ width: columnWidths.phone }}
                    >
                      <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px]">
                        Phone
                      </span>
                    </th>
                  )}

                  {/* Location Column */}
                  {visibleColumns.location && (
                    <th
                      className="px-5 text-left cursor-pointer hover:bg-[#EBEBED] transition-colors group"
                      style={{ width: columnWidths.location }}
                      onClick={() => handleSort("location")}
                    >
                      <div className="flex items-center space-x-1">
                        <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px]">
                          Location
                        </span>
                        <div className="flex items-center opacity-30 group-hover:opacity-100 transition-opacity">
                          {sortField === "location" &&
                            (sortDirection === "asc" ? (
                              <SortAsc className="h-3 w-3 text-[#F26522] opacity-100" />
                            ) : (
                              <SortDesc className="h-3 w-3 text-[#F26522] opacity-100" />
                            ))}
                          {sortField !== "location" && (
                            <ArrowUpDown className="h-3 w-3 text-[#6B7280]" />
                          )}
                        </div>
                      </div>
                    </th>
                  )}

                  {/* Source Column */}
                  {visibleColumns.source && (
                    <th
                      className="px-5 text-left cursor-pointer hover:bg-[#EBEBED] transition-colors group"
                      style={{ width: columnWidths.source }}
                      onClick={() => handleSort("source")}
                    >
                      <div className="flex items-center space-x-1">
                        <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px]">
                          Source
                        </span>
                        <div className="flex items-center opacity-30 group-hover:opacity-100 transition-opacity">
                          {sortField === "source" &&
                            (sortDirection === "asc" ? (
                              <SortAsc className="h-3 w-3 text-[#F26522] opacity-100" />
                            ) : (
                              <SortDesc className="h-3 w-3 text-[#F26522] opacity-100" />
                            ))}
                          {sortField !== "source" && (
                            <ArrowUpDown className="h-3 w-3 text-[#6B7280]" />
                          )}
                        </div>
                      </div>
                    </th>
                  )}

                  {/* Tags Column */}
                  {visibleColumns.tags && (
                    <th
                      className="px-5 text-left"
                      style={{ width: columnWidths.tags }}
                    >
                      <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px]">
                        Tags
                      </span>
                    </th>
                  )}

                  {/* Last Contact Column */}
                  {visibleColumns.last_contact && (
                    <th
                      className="px-5 text-left cursor-pointer hover:bg-[#EBEBED] transition-colors group"
                      style={{ width: columnWidths.last_contact }}
                      onClick={() => handleSort("last_contact")}
                    >
                      <div className="flex items-center space-x-1">
                        <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px]">
                          Last Contact
                        </span>
                        <div className="flex items-center opacity-30 group-hover:opacity-100 transition-opacity">
                          {sortField === "last_contact" &&
                            (sortDirection === "asc" ? (
                              <SortAsc className="h-3 w-3 text-[#F26522] opacity-100" />
                            ) : (
                              <SortDesc className="h-3 w-3 text-[#F26522] opacity-100" />
                            ))}
                          {sortField !== "last_contact" && (
                            <ArrowUpDown className="h-3 w-3 text-[#6B7280]" />
                          )}
                        </div>
                      </div>
                    </th>
                  )}

                  {/* Actions Column */}
                  {visibleColumns.actions && (
                    <th
                      className="px-5 text-left"
                      style={{ width: columnWidths.actions }}
                    >
                      <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px]">
                        Actions
                      </span>
                    </th>
                  )}
                </tr>
              </thead>

              {/* Premium Table Body */}
              <tbody>
                {filteredAndSortedContacts.map((contact, index) => {
                  const isSelected = selectedContacts.includes(contact.id);
                  return (
                    <tr
                      key={contact.id}
                      className={`border-b border-[#F3F4F6] hover:bg-[#FAFAFA] hover:shadow-[0_1px_3px_rgba(0,0,0,0.02)] cursor-pointer transition-all duration-200 group ${
                        isSelected
                          ? "bg-[#FFF7F0] border-l-[3px] border-l-[#F26522]"
                          : ""
                      }`}
                      style={{ height: "64px" }}
                      onClick={() => handleContactClick(contact)}
                    >
                      {/* Checkbox */}
                      {visibleColumns.checkbox && (
                        <td
                          className="px-5 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              toggleContactSelection(contact.id)
                            }
                          />
                        </td>
                      )}

                      {/* Name - Primary Column */}
                      {visibleColumns.name && (
                        <td className="px-5 py-4">
                          <div className="flex items-center space-x-4">
                            {generateAvatar(contact)}
                            <div>
                              <div className="text-[15px] font-semibold text-[#1D1D1F] mb-0.5">
                                {contact.first_name} {contact.last_name}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Email */}
                      {visibleColumns.email && (
                        <td className="px-5 py-4">
                          <span className="text-[14px] text-[#6B7280] hover:underline cursor-pointer">
                            {contact.email}
                          </span>
                        </td>
                      )}

                      {/* Company */}
                      {visibleColumns.company && (
                        <td className="px-5 py-4">
                          <span className="text-[14px] font-medium text-[#374151]">
                            {contact.company}
                          </span>
                        </td>
                      )}

                      {/* Job Title */}
                      {visibleColumns.job_title && (
                        <td className="px-5 py-4">
                          <span className="text-[14px] font-medium text-[#374151]">
                            {contact.job_title || "-"}
                          </span>
                        </td>
                      )}

                      {/* Phone */}
                      {visibleColumns.phone && (
                        <td className="px-5 py-4">
                          <span className="text-[14px] text-[#6B7280]">
                            {contact.phone || "-"}
                          </span>
                        </td>
                      )}

                      {/* Location */}
                      {visibleColumns.location && (
                        <td className="px-5 py-4">
                          <span className="text-[14px] text-[#6B7280]">
                            {contact.city || contact.state || contact.country
                              ? `${contact.city || ""}${
                                  contact.state ? ", " + contact.state : ""
                                }${
                                  contact.country ? ", " + contact.country : ""
                                }`
                              : "-"}
                          </span>
                        </td>
                      )}

                      {/* Source */}
                      {visibleColumns.source && (
                        <td className="px-5 py-4">
                          <div className="flex items-center space-x-2">
                            {getSourceIcon(contact.source)}
                            <span className="text-[14px] text-[#374151]">
                              {formatSource(contact.source)}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* Tags */}
                      {visibleColumns.tags && (
                        <td className="px-5 py-4">
                          <div className="flex items-center space-x-1">
                            {contact?.tags?.slice(0, 2).map((tag, tagIndex) => (
                              <Badge
                                key={tagIndex}
                                variant="secondary"
                                className="text-xs px-2 py-1 h-5 bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] rounded-full"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {contact?.tags?.length > 2 && (
                              <Badge
                                variant="outline"
                                className="text-xs px-2 py-1 h-5 rounded-full"
                              >
                                +{contact?.tags?.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Last Contact */}
                      {visibleColumns.last_contact && (
                        <td className="px-5 py-4">
                          <span className="text-[14px] text-[#374151]">
                            {formatTimeAgo(contact.last_contact)}
                          </span>
                        </td>
                      )}

                      {/* Actions */}
                      {visibleColumns.actions && (
                        <td
                          className="px-5 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-md hover:bg-[#F5F5F7] transition-colors"
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "6px",
                                  }}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="rounded-md"
                              >
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedContact(contact); // state me contact set karo
                                    setShowAddModal(true);
                                  }}
                                >
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem> */}
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() =>
                                    dispatch(deleteContact(contact.id))
                                  }
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Desktop Gallery View */
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedContacts.map((contact) => {
                const isSelected = selectedContacts.includes(contact.id);
                return (
                  <div
                    key={contact.id}
                    className={`bg-white border rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group ${
                      isSelected
                        ? "border-[#F26522] shadow-lg ring-2 ring-[#F26522]/20"
                        : "border-[#E5E7EB] hover:border-[#D1D5DB]"
                    }`}
                    onClick={() => handleContactClick(contact)}
                  >
                    {/* Selection Checkbox */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() =>
                            toggleContactSelection(contact.id)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem> */}
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Contact Avatar and Name */}
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto mb-3">
                        <div
                          className={`w-16 h-16 rounded-full ${
                            [
                              "bg-gradient-to-br from-[#FF6B9D] to-[#C44569]",
                              "bg-gradient-to-br from-[#667EEA] to-[#764BA2]",
                              "bg-gradient-to-br from-[#F26522] to-[#E14D2A]",
                              "bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8]",
                              "bg-gradient-to-br from-[#10B981] to-[#059669]",
                              "bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]",
                              "bg-gradient-to-br from-[#EC4899] to-[#DB2777]",
                              "bg-gradient-to-br from-[#F59E0B] to-[#D97706]",
                            ][
                              contact.id
                              // .split("")
                              // .reduce(
                              //   (acc, char) => acc + char.charCodeAt(0),
                              //   0
                              // ) % 8
                            ]
                          } flex items-center justify-center text-white font-semibold text-xl`}
                        >
                          {(
                            contact.first_name.charAt(0) +
                            contact.last_name.charAt(0)
                          ).toUpperCase()}
                        </div>
                      </div>
                      <h3 className="font-semibold text-[#111827] text-lg mb-1">
                        {contact.first_name} {contact.last_name}
                      </h3>
                      <p className="text-[#F26522] text-sm font-medium mb-1">
                        {contact.job_title}
                      </p>
                      <p className="text-[#6B7280] text-sm">
                        {contact.company}
                      </p>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                      {contact.location && (
                        <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{contact.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {contact.tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.slice(0, 3).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs px-2 py-1 bg-[#F3F4F6] text-[#374151]"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {contact.tags.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs px-2 py-1"
                            >
                              +{contact.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer with Source and Last Contact */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#F3F4F6]">
                      <div className="flex items-center space-x-1">
                        {getSourceIcon(contact.source)}
                        <span className="text-xs text-[#9CA3AF]">
                          {formatSource(contact.source)}
                        </span>
                      </div>
                      <span className="text-xs text-[#9CA3AF]">
                        {formatTimeAgo(contact.last_interaction)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Contact Detail Slide-out Panel */}
      {showDetailPanel && selectedContact && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[1000]"
            onClick={() => setShowDetailPanel(false)}
          />

          {/* Panel */}
          <div
            className="fixed right-0 top-0 h-screen w-full sm:w-[500px] bg-white z-[1001] overflow-hidden animate-slide-in-right"
            style={{
              boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
              animation: "slideInRight 300ms ease-out",
            }}
          >
            {/* Panel Header */}
            <div className="h-[60px] bg-white border-b border-[#E5E7EB] px-[24px] py-0 flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-[#111827]">
                Contact Details
              </h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailPanel(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div
              className="p-[24px] overflow-y-auto"
              style={{ height: "calc(100vh - 60px)" }}
            >
              {/* Contact Card Section */}
              <div
                className="rounded-[12px] p-[24px] mb-[24px] text-center"
                style={{
                  background:
                    "linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)",
                }}
              >
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <div
                    className={`w-16 h-16 rounded-full ${
                      [
                        "bg-gradient-to-br from-[#FF6B9D] to-[#C44569]",
                        "bg-gradient-to-br from-[#667EEA] to-[#764BA2]",
                        "bg-gradient-to-br from-[#F26522] to-[#E14D2A]",
                        "bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8]",
                        "bg-gradient-to-br from-[#10B981] to-[#059669]",
                        "bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]",
                        "bg-gradient-to-br from-[#EC4899] to-[#DB2777]",
                        "bg-gradient-to-br from-[#F59E0B] to-[#D97706]",
                      ][
                        selectedContact.id
                        // .split("")
                        // .reduce((acc, char) => acc + char.charCodeAt(0), 0) %
                        // 8
                      ]
                    } flex items-center justify-center text-white font-bold text-xl`}
                  >
                    {(
                      selectedContact.first_name.charAt(0) +
                      selectedContact.last_name.charAt(0)
                    ).toUpperCase()}
                  </div>
                </div>
                <h3 className="text-[20px] font-bold text-[#111827] mb-1 text-center">
                  {selectedContact.first_name} {selectedContact.last_name}
                </h3>
                <p className="text-[14px] text-[#F26522] mb-1 text-center">
                  {selectedContact.job_title}
                </p>
                <p className="text-[14px] text-[#6B7280] mb-4 text-center">
                  {selectedContact.company}
                </p>

                {/* Quick Actions */}
                <div className="flex justify-center space-x-3">
                  <Button size="sm" variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>

              {/* Information Sections */}
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h4
                    className="text-[12px] uppercase font-semibold text-[#9CA3AF] tracking-wide mb-3"
                    style={{ margin: "24px 0 12px 0" }}
                  >
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[12px] text-[#6B7280] uppercase tracking-wide block">
                        Email
                      </label>
                      <p className="text-[14px] text-[#111827] font-medium select-text">
                        {selectedContact.email}
                      </p>
                    </div>
                    {selectedContact.phone && (
                      <div>
                        <label className="text-[12px] text-[#6B7280] uppercase tracking-wide block">
                          Phone
                        </label>
                        <p className="text-[14px] text-[#111827] font-medium select-text">
                          {selectedContact.phone}
                        </p>
                      </div>
                    )}
                    {selectedContact.location && (
                      <div>
                        <label className="text-[12px] text-[#6B7280] uppercase tracking-wide block">
                          Location
                        </label>
                        <p className="text-[14px] text-[#111827] font-medium select-text">
                          {selectedContact.location}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Details */}
                <div>
                  <h4
                    className="text-[12px] uppercase font-semibold text-[#9CA3AF] tracking-wide mb-3"
                    style={{ margin: "24px 0 12px 0" }}
                  >
                    Company Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[12px] text-[#6B7280] uppercase tracking-wide block">
                        Company
                      </label>
                      <p className="text-[14px] text-[#111827] font-medium select-text">
                        {selectedContact.company}
                      </p>
                    </div>
                    {selectedContact.job_title && (
                      <div>
                        <label className="text-[12px] text-[#6B7280] uppercase tracking-wide block">
                          Job Title
                        </label>
                        <p className="text-[14px] text-[#111827] font-medium select-text">
                          {selectedContact.job_title}
                        </p>
                      </div>
                    )}
                    {selectedContact.company_website && (
                      <div>
                        <label className="text-[12px] text-[#6B7280] uppercase tracking-wide block">
                          Website
                        </label>
                        <a
                          href={selectedContact.company_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[14px] text-[#F26522] hover:underline select-text"
                        >
                          {selectedContact.company_website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                {selectedContact.location && (
                  <div>
                    <h4
                      className="text-[12px] uppercase font-semibold text-[#9CA3AF] tracking-wide mb-3"
                      style={{ margin: "24px 0 12px 0" }}
                    >
                      Location
                    </h4>
                    <p className="text-[14px] text-[#111827] font-medium select-text">
                      {selectedContact.location}
                    </p>
                  </div>
                )}

                {/* Tags & Categories */}
                <div>
                  <h4
                    className="text-[12px] uppercase font-semibold text-[#9CA3AF] tracking-wide mb-3"
                    style={{ margin: "24px 0 12px 0" }}
                  >
                    Tags & Categories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedContact.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs px-3 py-1 bg-[#F3F4F6] text-[#374151]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedContact.notes && (
                  <div>
                    <h4
                      className="text-[12px] uppercase font-semibold text-[#9CA3AF] tracking-wide mb-3"
                      style={{ margin: "24px 0 12px 0" }}
                    >
                      Notes
                    </h4>
                    <div className="bg-[#F9FAFB] rounded-lg p-4">
                      <textarea
                        className="w-full bg-transparent border-none focus:outline-none text-[14px] text-[#374151] leading-relaxed resize-none"
                        rows={3}
                        defaultValue={selectedContact.notes}
                      />
                    </div>
                  </div>
                )}

                {/* Activity History */}
                <div>
                  <h4
                    className="text-[12px] uppercase font-semibold text-[#9CA3AF] tracking-wide mb-3"
                    style={{ margin: "24px 0 12px 0" }}
                  >
                    Activity History
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-[#F9FAFB] rounded-lg">
                      <div className="w-8 h-8 bg-[#F26522] rounded-full flex items-center justify-center">
                        <QrCode className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-medium text-[#111827]">
                          Contact captured
                        </p>
                        <p className="text-[12px] text-[#6B7280]">
                          via {formatSource(selectedContact.source)} •{" "}
                          {formatTimeAgo(selectedContact.last_contact)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-[#F9FAFB] rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-medium text-[#111827]">
                          Last interaction
                        </p>
                        <p className="text-[12px] text-[#6B7280]">
                          {selectedContact.interactions_count} interactions •{" "}
                          {formatTimeAgo(selectedContact.last_interaction)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedContact({});
        }}
        contact={selectedContact ?? {}}
        existingTags={getAllTags()}
      />
    </div>
  );
}
