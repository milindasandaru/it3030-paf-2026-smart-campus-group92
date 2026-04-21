export type ResourceStatus = 'ACTIVE' | 'OUT_OF_SERVICE' | 'MAINTENANCE';
export type ResourceType =
  | 'LECTURE_HALL'
  | 'LAB'
  | 'MEETING_ROOM'
  | 'EQUIPMENT'
  | 'PROJECTOR'
  | 'CAMERA'
  | 'OTHER';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Resource {
  id: number;
  name: string;
  type: ResourceType;
  description?: string | null;
  location: string;
  capacity: number;
  status: ResourceStatus;
  availabilityWindows?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface Booking {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  resourceId: number;
  resourceName: string;
  requesterId: string;
  requesterName: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  resourceName?: string | null;
  reporterName: string;
  assigneeName?: string | null;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notificationType: 'INFO' | 'BOOKING' | 'TICKET' | 'ALERT';
  readFlag: boolean;
  createdAt: string;
}
