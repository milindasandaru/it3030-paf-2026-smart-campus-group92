-- PostgreSQL setup prerequisite:
-- create extension if not exists pgcrypto;

create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    full_name varchar(120) not null,
    email varchar(180) not null unique,
    role varchar(32) not null,
    provider varchar(32),
    provider_id varchar(128),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists resources (
    id uuid primary key default gen_random_uuid(),
    name varchar(150) not null,
    description text,
    location varchar(150) not null,
    capacity integer,
    type varchar(32) not null default 'LECTURE_HALL',
    total_units integer,
    booking_slot_interval_minutes integer,
    min_booking_duration_minutes integer,
    max_booking_duration_minutes integer,
    min_advance_booking_minutes integer,
    requires_approval boolean not null default true,
    status varchar(32) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists bookings (
    id uuid primary key default gen_random_uuid(),
    title varchar(150) not null,
    start_time timestamptz not null,
    end_time timestamptz not null,
    purpose text,
    attendee_count integer,
    status varchar(32) not null,
    resource_id uuid not null references resources(id) on delete cascade,
    requester_id uuid not null references users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint booking_time_range check (end_time > start_time)
);

create index if not exists idx_bookings_resource_time on bookings (resource_id, start_time, end_time);

create table if not exists tickets (
    id uuid primary key default gen_random_uuid(),
    title varchar(150) not null,
    description text not null,
    category varchar(64) not null default 'GENERAL',
    contact_details varchar(255),
    priority varchar(32) not null,
    status varchar(32) not null,
    resolution_notes text,
    resource_id uuid references resources(id),
    reporter_id uuid not null references users(id),
    assignee_id uuid references users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint ticket_status_check check (status in ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED'))
);

create index if not exists idx_tickets_status on tickets (status);
create index if not exists idx_tickets_reporter on tickets (reporter_id);
create index if not exists idx_tickets_assignee on tickets (assignee_id);

create table if not exists comments (
    id uuid primary key default gen_random_uuid(),
    message text not null,
    ticket_id uuid not null references tickets(id) on delete cascade,
    author_id uuid not null references users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_comments_ticket_id on comments (ticket_id);

create table if not exists notifications (
    id uuid primary key default gen_random_uuid(),
    title varchar(160) not null,
    message text not null,
    notification_type varchar(32) not null,
    read_flag boolean not null default false,
    recipient_id uuid not null references users(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists attachments (
    id uuid primary key default gen_random_uuid(),
    file_name varchar(255) not null,
    file_url varchar(512) not null,
    resource_id uuid references resources(id) on delete cascade,
    ticket_id uuid references tickets(id) on delete cascade,
    uploaded_by_id uuid not null references users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint attachment_owner_check check (resource_id is not null or ticket_id is not null)
);
