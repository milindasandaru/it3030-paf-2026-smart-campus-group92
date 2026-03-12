export type ResourceStatus = 'AVAILABLE' | 'RESERVED' | 'OUT_OF_SERVICE';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Resource {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  status: ResourceStatus;
}

export interface Booking {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  resourceId: string;
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
