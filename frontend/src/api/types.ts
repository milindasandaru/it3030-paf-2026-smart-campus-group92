export type ResourceStatus = 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
export type ResourceType =
  | 'LAB'
  | 'LECTURE_HALL'
  | 'MEETING_ROOM'
  | 'PROJECTOR'
  | 'CAMERA'
  | 'STUDY_AREA'
  | 'OTHER';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'CLOSED';
export type UserRole = 'ADMIN' | 'LECTURER' | 'STUDENT' | 'STAFF' | 'TECHNICIAN';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  description?: string | null;
  location: string;
  capacity: number;
  availabilityWindows?: string | null;
  totalUnits?: number | null;
  bookingSlotIntervalMinutes?: number | null;
  minBookingDurationMinutes?: number | null;
  maxBookingDurationMinutes?: number | null;
  minAdvanceBookingMinutes?: number | null;
  status: ResourceStatus;
}

export interface ResourceQueryFilters {
  type?: ResourceType;
  capacityMin?: number;
  capacityMax?: number;
  location?: string;
  status?: ResourceStatus;
  search?: string;
}

export interface ResourceUpsertRequest {
  name: string;
  description?: string;
  location: string;
  capacity: number;
  type: ResourceType;
  availabilityWindows?: string;
  bookingSlotIntervalMinutes?: number;
  minBookingDurationMinutes?: number;
  maxBookingDurationMinutes?: number;
  minAdvanceBookingMinutes?: number;
  totalUnits?: number;
  status: ResourceStatus;
}

export interface Booking {
  id: string;
  title?: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  rejectionReason?: string | null;
  resourceId: string;
  resourceName?: string | null;
  requesterId: string;
  requesterName?: string | null;
  attendeeCount?: number | null;
  purpose?: string | null;
  checkedIn: boolean;
  checkedInAt?: string | null;
  qrPayload?: string | null;
}

export interface BookingCreateRequest {
  title: string;
  resourceId: number;
  requesterId: string;
  startTime: string;
  endTime: string;
  attendeeCount?: number;
  purpose?: string;
}

export interface BookingQueryFilters {
  actorUserId?: string;
  resourceId?: string;
  date?: string;
  status?: BookingStatus;
  resourceType?: ResourceType;
  fromDate?: string;
  toDate?: string;
}

export interface BookingUiFilters {
  status?: BookingStatus | 'ALL';
  resourceType?: ResourceType | 'ALL';
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export interface UserSummary {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  provider?: string | null;
  notificationEnabled?: boolean;
}

export interface CreateUserPayload {
  email: string;
  fullName: string;
  role: UserRole;
  password: string;
  notificationEnabled?: boolean;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  contactDetails?: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  resolutionNotes?: string | null;
  resourceId?: string | null;
  resourceName?: string | null;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  assigneeId?: string | null;
  assigneeName?: string | null;
  firstResponseAt?: string | null;
  resolvedAt?: string | null;
  firstResponseMinutes?: number | null;
  resolutionMinutes?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketQueryFilters {
  status?: TicketStatus | 'ALL';
  priority?: TicketPriority | 'ALL';
  resourceId?: string | 'ALL';
  search?: string;
}

export interface TicketComment {
  id: string;
  message: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedById: string;
  uploadedByName: string;
  createdAt: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  category: string;
  contactDetails?: string;
  priority: TicketPriority;
  resourceId?: number;
  reporterId: string;
}

export interface UpdateTicketDetailsRequest {
  title: string;
  description: string;
  category: string;
  contactDetails?: string;
  priority: TicketPriority;
  resourceId?: number;
  actorUserId: string;
}

export interface AssignTicketRequest {
  assigneeId: string;
  actorUserId: string;
}

export interface TicketActionRequest {
  actorUserId: string;
}

export interface ResolveTicketRequest {
  actorUserId: string;
  resolutionNotes: string;
}

export interface RejectTicketRequest {
  actorUserId: string;
  rejectionReason: string;
}

export interface CreateCommentRequest {
  message: string;
  authorId: string;
}

export interface UpdateCommentRequest {
  message: string;
  actorUserId: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  message: string;
  type:
    | 'BOOKING_CREATED'
    | 'BOOKING_APPROVED'
    | 'BOOKING_REJECTED'
    | 'TICKET_CREATED'
    | 'TICKET_ASSIGNED'
    | 'TICKET_IN_PROGRESS'
    | 'TICKET_RESOLVED'
    | 'TICKET_REJECTED'
    | 'TICKET_CLOSED';
  read: boolean;
  createdAt: string;
}

export interface NotificationCreateRequest {
  userId: string;
  message: string;
  type: NotificationItem['type'];
}
