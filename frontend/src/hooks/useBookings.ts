import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchUsers } from '../api/authApi';
import {
  approveBooking,
  cancelBooking,
  checkInBooking,
  getBookings,
  rejectBooking,
} from '../api/bookingsApi';
import { fetchResources } from '../api/resourcesApi';
import type { Booking, BookingUiFilters, Resource, UserRole, UserSummary } from '../api/types';
import { useAuth } from './useAuth';

export interface BookingView extends Booking {
  resource?: Resource;
  requester?: UserSummary;
}

function isManagementRole(role: UserRole | undefined): boolean {
  return role === 'ADMIN' || role === 'TECHNICIAN';
}

export function useBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [filters, setFilters] = useState<BookingUiFilters>({
    status: 'ALL',
    resourceType: 'ALL',
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const canModerate = isManagementRole(user?.role);
  const canCreateBooking = Boolean(user && !canModerate);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingsData, resourcesData, usersData] = await Promise.all([
        getBookings(),
        fetchResources(),
        fetchUsers(),
      ]);
      setBookings(bookingsData);
      setResources(resourcesData);
      setUsers(usersData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const resourceById = useMemo(() => {
    const map = new Map<string, Resource>();
    resources.forEach((resource) => map.set(resource.id, resource));
    return map;
  }, [resources]);

  const userById = useMemo(() => {
    const map = new Map<string, UserSummary>();
    users.forEach((item) => map.set(item.userId, item));
    return map;
  }, [users]);

  const visibleBookings: BookingView[] = useMemo(() => {
    const ownedOrAll = bookings.filter((booking) => {
      if (canModerate) {
        return true;
      }
      return booking.userId === user?.userId;
    });

    return ownedOrAll
      .map((booking) => ({
        ...booking,
        resource: resourceById.get(booking.resourceId),
        requester: userById.get(booking.userId),
      }))
      .filter((booking) => {
        if (filters.status && filters.status !== 'ALL' && booking.status !== filters.status) {
          return false;
        }

        if (
          filters.resourceType &&
          filters.resourceType !== 'ALL' &&
          booking.resource?.type !== filters.resourceType
        ) {
          return false;
        }

        if (filters.fromDate) {
          const from = new Date(`${filters.fromDate}T00:00:00`);
          if (new Date(booking.startTime) < from) {
            return false;
          }
        }

        if (filters.toDate) {
          const to = new Date(`${filters.toDate}T23:59:59`);
          if (new Date(booking.startTime) > to) {
            return false;
          }
        }

        if (filters.search) {
          const query = filters.search.toLowerCase();
          const haystack = [
            booking.resource?.name ?? '',
            booking.requester?.fullName ?? '',
            booking.purpose ?? '',
          ]
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(query)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [bookings, canModerate, filters, resourceById, user?.userId, userById]);

  const canCancelBooking = useCallback(
    (booking: Booking) => {
      if (!user) {
        return false;
      }
      if (booking.status === 'CANCELLED' || booking.status === 'REJECTED') {
        return false;
      }
      return canModerate || booking.userId === user.userId;
    },
    [canModerate, user],
  );

  const runAction = useCallback(
    async (action: () => Promise<Booking>, successText: string) => {
      setActionLoading(true);
      try {
        await action();
        await reload();
        setToast(successText);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Booking action failed');
      } finally {
        setActionLoading(false);
      }
    },
    [reload],
  );

  const approve = useCallback(
    async (id: string) => {
      if (!user?.userId) {
        return;
      }
      await runAction(() => approveBooking(id, user.userId), 'Booking approved');
    },
    [runAction, user?.userId],
  );

  const reject = useCallback(
    async (id: string) => {
      if (!user?.userId) {
        return;
      }
      await runAction(() => rejectBooking(id, user.userId), 'Booking rejected');
    },
    [runAction, user?.userId],
  );

  const cancel = useCallback(
    async (id: string) => {
      if (!user?.userId) {
        return;
      }
      await runAction(() => cancelBooking(id, user.userId), 'Booking cancelled');
    },
    [runAction, user?.userId],
  );

  const checkIn = useCallback(
    async (id: string) => {
      await runAction(() => checkInBooking(id), 'Booking checked in');
    },
    [runAction],
  );

  const setFilter = useCallback((next: Partial<BookingUiFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  }, []);

  return {
    loading,
    actionLoading,
    error,
    toast,
    filters,
    resources,
    visibleBookings,
    canModerate,
    canCreateBooking,
    setFilter,
    approve,
    reject,
    cancel,
    checkIn,
    canCancelBooking,
    reload,
  };
}
