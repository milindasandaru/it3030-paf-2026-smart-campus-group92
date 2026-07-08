-- Smart Campus sample dataset
-- Usage:
--   psql -d <database_name> -f database/sample_data.sql
--
-- Notes:
-- - This script is idempotent (safe to re-run).
-- - It extends older schemas with new columns used by the latest backend.
-- - Local user demo password (plain): Password@123

create extension if not exists pgcrypto;

begin;

-- Compatibility columns for latest backend model.
alter table users add column if not exists password varchar(255);
alter table users add column if not exists notification_enabled boolean not null default true;

alter table bookings add column if not exists checked_in boolean not null default false;
alter table bookings add column if not exists checked_in_at timestamptz;

alter table tickets add column if not exists first_response_at timestamptz;
alter table tickets add column if not exists resolved_at timestamptz;

-- Users
insert into users (id, full_name, email, password, role, provider, provider_id, notification_enabled)
values
    ('10000000-0000-0000-0000-000000000001', 'System Admin', 'admin@smartcampus.edu',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'local', null, true),
    ('10000000-0000-0000-0000-000000000002', 'Nimal Perera', 'nimal.lecturer@smartcampus.edu',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'LECTURER', 'google', 'google-lecturer-001', true),
    ('10000000-0000-0000-0000-000000000003', 'Amasha Silva', 'amasha.student@smartcampus.edu',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', 'local', null, true),
    ('10000000-0000-0000-0000-000000000004', 'Ravindu Fernando', 'ravindu.student@smartcampus.edu',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', 'local', null, true),
    ('10000000-0000-0000-0000-000000000005', 'Madhavi Jayasinghe', 'madhavi.staff@smartcampus.edu',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STAFF', 'local', null, true),
    ('10000000-0000-0000-0000-000000000006', 'Tech Ops 01', 'tech1@smartcampus.edu',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'TECHNICIAN', 'local', null, true),
    ('10000000-0000-0000-0000-000000000007', 'Tech Ops 02', 'tech2@smartcampus.edu',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'TECHNICIAN', 'local', null, false),
    ('10000000-0000-0000-0000-000000000008', 'Priya De Alwis', 'priya.lecturer@smartcampus.edu',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'LECTURER', 'local', null, true)
on conflict (email) do update set
    full_name = excluded.full_name,
    role = excluded.role,
    provider = excluded.provider,
    provider_id = excluded.provider_id,
    password = coalesce(excluded.password, users.password),
    notification_enabled = excluded.notification_enabled,
    updated_at = now();

-- Resources
insert into resources (
    id, name, description, location, capacity, type, total_units,
    booking_slot_interval_minutes, min_booking_duration_minutes, max_booking_duration_minutes,
    min_advance_booking_minutes, requires_approval, status
)
values
    ('20000000-0000-0000-0000-000000000001', 'Lecture Hall A1', 'Main lecture hall with projector', 'Block A - L1', 180, 'LECTURE_HALL', null, 30, 60, 240, 60, true, 'ACTIVE'),
    ('20000000-0000-0000-0000-000000000002', 'Computer Lab C2', 'Networking and software engineering lab', 'Block C - L2', 60, 'LAB', null, 30, 60, 180, 60, true, 'ACTIVE'),
    ('20000000-0000-0000-0000-000000000003', 'Study Room S1', 'Quiet study room for groups', 'Library - Floor 2', 8, 'STUDY_ROOM', null, 15, 30, 180, 30, true, 'ACTIVE'),
    ('20000000-0000-0000-0000-000000000004', 'Study Room S2', 'Collaborative room with whiteboard', 'Library - Floor 2', 10, 'STUDY_ROOM', null, 15, 30, 180, 30, true, 'ACTIVE'),
    ('20000000-0000-0000-0000-000000000005', 'ECE Textbook - Signals', 'Textbook copies for borrowing', 'Library Counter', null, 'BOOK', 4, 60, 60, 10080, 30, true, 'ACTIVE'),
    ('20000000-0000-0000-0000-000000000006', 'Civil Lab B1', 'Structural lab currently under repair', 'Block B - L1', 40, 'LAB', null, 30, 60, 180, 60, true, 'OUT_OF_SERVICE'),
    ('20000000-0000-0000-0000-000000000007', 'Seminar Room D3', 'Small seminar room with AV support', 'Block D - L3', 35, 'LECTURE_HALL', null, 30, 60, 180, 60, true, 'ACTIVE'),
    ('20000000-0000-0000-0000-000000000008', 'Digital Library Access', 'Subscription access slot', 'Online', 999, 'DOCUMENT', 100, 60, 60, 720, 10, false, 'AVAILABLE')
on conflict (id) do update set
    name = excluded.name,
    description = excluded.description,
    location = excluded.location,
    capacity = excluded.capacity,
    type = excluded.type,
    total_units = excluded.total_units,
    booking_slot_interval_minutes = excluded.booking_slot_interval_minutes,
    min_booking_duration_minutes = excluded.min_booking_duration_minutes,
    max_booking_duration_minutes = excluded.max_booking_duration_minutes,
    min_advance_booking_minutes = excluded.min_advance_booking_minutes,
    requires_approval = excluded.requires_approval,
    status = excluded.status,
    updated_at = now();

-- Bookings (mix of statuses for dashboards and moderation views)
insert into bookings (
    id, title, start_time, end_time, purpose, attendee_count, status, resource_id, requester_id, checked_in, checked_in_at
)
values
    ('30000000-0000-0000-0000-000000000001', 'Booking request submitted', now() + interval '1 day 09 hours', now() + interval '1 day 11 hours', 'Signals class practical session', 55, 'APPROVED', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', false, null),
    ('30000000-0000-0000-0000-000000000002', 'Booking request submitted', now() + interval '2 days 10 hours', now() + interval '2 days 12 hours', 'Final year discussion', 8, 'PENDING', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', false, null),
    ('30000000-0000-0000-0000-000000000003', 'Booking request submitted', now() + interval '3 days 08 hours', now() + interval '3 days 10 hours', 'Research supervision', 20, 'APPROVED', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', true, now() - interval '2 hours'),
    ('30000000-0000-0000-0000-000000000004', 'Booking request submitted', now() + interval '4 days 13 hours', now() + interval '4 days 14 hours', 'Study group', 6, 'REJECTED', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', false, null),
    ('30000000-0000-0000-0000-000000000005', 'Booking request submitted', now() + interval '5 days 09 hours', now() + interval '5 days 10 hours', 'Borrow textbook copy', 1, 'APPROVED', '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', false, null),
    ('30000000-0000-0000-0000-000000000006', 'Booking request submitted', now() + interval '6 days 15 hours', now() + interval '6 days 17 hours', 'Guest lecture', 30, 'CANCELLED', '20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', false, null),
    ('30000000-0000-0000-0000-000000000007', 'Booking request submitted', now() + interval '7 days 10 hours', now() + interval '7 days 12 hours', 'Assignment consultation', 9, 'PENDING', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', false, null),
    ('30000000-0000-0000-0000-000000000008', 'Booking request submitted', now() + interval '8 days 11 hours', now() + interval '8 days 13 hours', 'Lab makeup session', 35, 'APPROVED', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000008', false, null),
    ('30000000-0000-0000-0000-000000000009', 'Booking request submitted', now() + interval '9 days 09 hours', now() + interval '9 days 10 hours', 'E-library access', 1, 'APPROVED', '20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', false, null),
    ('30000000-0000-0000-0000-000000000010', 'Booking request submitted', now() + interval '10 days 08 hours', now() + interval '10 days 09 hours', 'Group study', 7, 'PENDING', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', false, null)
on conflict (id) do update set
    title = excluded.title,
    start_time = excluded.start_time,
    end_time = excluded.end_time,
    purpose = excluded.purpose,
    attendee_count = excluded.attendee_count,
    status = excluded.status,
    resource_id = excluded.resource_id,
    requester_id = excluded.requester_id,
    checked_in = excluded.checked_in,
    checked_in_at = excluded.checked_in_at,
    updated_at = now();

-- Tickets (includes SLA examples)
insert into tickets (
    id, title, description, category, contact_details, priority, status, resolution_notes,
    resource_id, reporter_id, assignee_id, first_response_at, resolved_at, created_at, updated_at
)
values
    ('40000000-0000-0000-0000-000000000001', 'Projector not working in Hall A1', 'Projector powers on but no HDMI signal.', 'AV', 'admin office ext 221', 'HIGH', 'IN_PROGRESS', null,
     '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006',
     now() - interval '4 hours', null, now() - interval '8 hours', now() - interval '1 hour'),
    ('40000000-0000-0000-0000-000000000002', 'Broken chairs in C2', 'Five chairs have broken legs.', 'Facilities', 'lab supervisor', 'MEDIUM', 'RESOLVED', 'Chairs replaced from maintenance stock.',
     '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000006',
     now() - interval '2 days 6 hours', now() - interval '1 day 4 hours', now() - interval '2 days 10 hours', now() - interval '1 day 3 hours'),
    ('40000000-0000-0000-0000-000000000003', 'AC issue in Seminar D3', 'Room temperature remains high.', 'Electrical', 'security desk', 'LOW', 'OPEN', null,
     '20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000005', null,
     null, null, now() - interval '6 hours', now() - interval '6 hours'),
    ('40000000-0000-0000-0000-000000000004', 'Network outage in Lab C2', 'Intermittent packet loss on lab VLAN.', 'Network', 'ict center', 'CRITICAL', 'CLOSED', 'Core switch module reseated and tested.',
     '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007',
     now() - interval '5 days 5 hours', now() - interval '5 days 1 hour', now() - interval '5 days 6 hours', now() - interval '4 days 23 hours'),
    ('40000000-0000-0000-0000-000000000005', 'Request denied for out-of-service lab', 'Civil Lab B1 should remain blocked until repair.', 'Policy', 'facilities office', 'MEDIUM', 'REJECTED', 'Confirmed resource marked OUT_OF_SERVICE.',
     '20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006',
     now() - interval '1 day 3 hours', null, now() - interval '1 day 5 hours', now() - interval '1 day 2 hours')
on conflict (id) do update set
    title = excluded.title,
    description = excluded.description,
    category = excluded.category,
    contact_details = excluded.contact_details,
    priority = excluded.priority,
    status = excluded.status,
    resolution_notes = excluded.resolution_notes,
    resource_id = excluded.resource_id,
    reporter_id = excluded.reporter_id,
    assignee_id = excluded.assignee_id,
    first_response_at = excluded.first_response_at,
    resolved_at = excluded.resolved_at,
    updated_at = now();

-- Comments
insert into comments (id, message, ticket_id, author_id, created_at, updated_at)
values
    ('50000000-0000-0000-0000-000000000001', 'Assigned to technician for on-site inspection.', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', now() - interval '3 hours', now() - interval '3 hours'),
    ('50000000-0000-0000-0000-000000000002', 'Parts ordered; temporary workaround applied.', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', now() - interval '2 hours', now() - interval '2 hours'),
    ('50000000-0000-0000-0000-000000000003', 'Issue resolved and validated with lecturer.', '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', now() - interval '1 day 3 hours', now() - interval '1 day 3 hours')
on conflict (id) do update set
    message = excluded.message,
    updated_at = now();

-- Notifications
insert into notifications (id, title, message, notification_type, read_flag, recipient_id, created_at, updated_at)
values
    ('60000000-0000-0000-0000-000000000001', 'Booking Approved', 'Your booking for Computer Lab C2 has been approved.', 'BOOKING_APPROVED', false, '10000000-0000-0000-0000-000000000002', now() - interval '30 minutes', now() - interval '30 minutes'),
    ('60000000-0000-0000-0000-000000000002', 'Booking Pending', 'A new booking request requires review.', 'BOOKING_CREATED', false, '10000000-0000-0000-0000-000000000001', now() - interval '45 minutes', now() - interval '45 minutes'),
    ('60000000-0000-0000-0000-000000000003', 'Ticket Assigned', 'Ticket "Projector not working in Hall A1" is assigned to you.', 'TICKET_ASSIGNED', true, '10000000-0000-0000-0000-000000000006', now() - interval '4 hours', now() - interval '4 hours'),
    ('60000000-0000-0000-0000-000000000004', 'Ticket Resolved', 'Your ticket "Broken chairs in C2" has been resolved.', 'TICKET_RESOLVED', false, '10000000-0000-0000-0000-000000000008', now() - interval '1 day 2 hours', now() - interval '1 day 2 hours')
on conflict (id) do update set
    title = excluded.title,
    message = excluded.message,
    notification_type = excluded.notification_type,
    read_flag = excluded.read_flag,
    recipient_id = excluded.recipient_id,
    updated_at = now();

-- Attachments (resource and ticket samples)
insert into attachments (id, file_name, file_url, resource_id, ticket_id, uploaded_by_id)
values
    ('70000000-0000-0000-0000-000000000001', 'lab-network-topology.pdf', 'https://example.edu/files/lab-network-topology.pdf', '20000000-0000-0000-0000-000000000002', null, '10000000-0000-0000-0000-000000000005'),
    ('70000000-0000-0000-0000-000000000002', 'projector-error-photo.jpg', 'https://example.edu/files/projector-error-photo.jpg', null, '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006')
on conflict (id) do update set
    file_name = excluded.file_name,
    file_url = excluded.file_url,
    resource_id = excluded.resource_id,
    ticket_id = excluded.ticket_id,
    uploaded_by_id = excluded.uploaded_by_id,
    updated_at = now();

commit;
