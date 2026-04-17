package com.smartcampus.hub.repository;

import com.smartcampus.hub.entity.Booking;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

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
            @Param("resourceId") UUID resourceId,
            @Param("startTime") OffsetDateTime startTime,
            @Param("endTime") OffsetDateTime endTime,
            @Param("excludeId") UUID excludeId);
}
