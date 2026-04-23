package com.smartcampus.hub.repository;

import com.smartcampus.hub.entity.Booking;
import com.smartcampus.hub.util.BookingStatus;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

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
              and b.status in :statuses
              and (:excludeId is null or b.id <> :excludeId)
            """)
    boolean existsOverlapping(
            @Param("resourceId") UUID resourceId,
            @Param("startTime") OffsetDateTime startTime,
            @Param("endTime") OffsetDateTime endTime,
            @Param("statuses") Collection<BookingStatus> statuses,
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
}
