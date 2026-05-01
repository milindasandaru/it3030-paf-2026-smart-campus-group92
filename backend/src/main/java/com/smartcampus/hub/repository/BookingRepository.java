package com.smartcampus.hub.repository;

import com.smartcampus.hub.entity.Booking;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

    interface TopResourceView {
        String getResourceName();

        Long getBookingCount();
    }

    interface HourCountView {
        Integer getHourOfDay();

        Long getBookingCount();
    }

    interface DateCountView {
        String getBookingDate();

        Long getBookingCount();
    }

        boolean existsByResourceIdAndStatusIn(UUID resourceId, Collection<BookingStatus> statuses);

    @Query(
            """
            select count(b) > 0
            from Booking b
            where b.requester.id = :requesterId
              and b.resource.id = :resourceId
              and b.startTime = :startTime
              and b.endTime = :endTime
              and b.status in :statuses
              and (:excludeId is null or b.id <> :excludeId)
            """)
    boolean existsExactBooking(
            @Param("requesterId") UUID requesterId,
            @Param("resourceId") UUID resourceId,
            @Param("startTime") OffsetDateTime startTime,
            @Param("endTime") OffsetDateTime endTime,
            @Param("statuses") Collection<BookingStatus> statuses,
            @Param("excludeId") UUID excludeId);

    @Query(
            """
            select count(b) > 0
            from Booking b
            where b.resource.id = :resourceId
              and b.startTime < :endTime
              and b.endTime > :startTime
              and (:excludeId is null or b.id <> :excludeId)
            """)
    boolean existsConflict(
            @Param("resourceId") Long resourceId,
            @Param("startTime") OffsetDateTime startTime,
            @Param("endTime") OffsetDateTime endTime,
            @Param("excludeId") UUID excludeId);

    @Query(
            """
            select count(b)
            from Booking b
            where b.resource.id = :resourceId
              and b.startTime < :endTime
              and b.endTime > :startTime
              and b.status in :statuses
                                                        and (:excludeId is null or b.id <> :excludeId)
            """)
    long countOverlapping(
            @Param("resourceId") UUID resourceId,
            @Param("startTime") OffsetDateTime startTime,
            @Param("endTime") OffsetDateTime endTime,
                                                @Param("statuses") Collection<BookingStatus> statuses,
                                                @Param("excludeId") UUID excludeId);

    @Query(
            value =
                    """
            select r.name as resourceName, count(b.id) as bookingCount
            from bookings b
            join resources r on r.id = b.resource_id
            group by r.name
            order by bookingCount desc
            limit 10
            """,
            nativeQuery = true)
    List<TopResourceView> findTopResources();

    @Query(
            value =
                    """
            select extract(hour from b.start_time)::int as hourOfDay, count(b.id) as bookingCount
            from bookings b
            group by hourOfDay
            order by bookingCount desc
            """,
            nativeQuery = true)
    List<HourCountView> findPeakHours();

    @Query(
            value =
                    """
            select to_char(date_trunc('day', b.start_time), 'YYYY-MM-DD') as bookingDate, count(b.id) as bookingCount
            from bookings b
            group by bookingDate
            order by bookingDate asc
            """,
            nativeQuery = true)
    List<DateCountView> findBookingTrends();

    @Query(
            """
            select b
            from Booking b
            join fetch b.resource r
            join fetch b.requester u
            where b.startTime >= :from
              and b.startTime <= :to
            order by b.startTime asc
            """)
    List<Booking> findForReport(
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to);

    @Query(
            """
            select b
            from Booking b
            join fetch b.resource r
            join fetch b.requester u
            where b.startTime >= :from
              and b.startTime <= :to
              and r.id = :resourceId
            order by b.startTime asc
            """)
    List<Booking> findForReportByResource(
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to,
            @Param("resourceId") UUID resourceId);
}
