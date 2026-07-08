package com.smartcampus.hub.repository;

import com.smartcampus.hub.entity.Ticket;
import com.smartcampus.hub.util.TicketStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {

    interface TicketStatusView {
        String getStatus();

        Long getTicketCount();
    }

	List<Ticket> findByStatus(TicketStatus status);

	List<Ticket> findByReporterId(UUID reporterId);

	List<Ticket> findByAssigneeId(UUID assigneeId);

    @Query(
            value =
                    """
            select status as status, count(id) as ticketCount
            from tickets
            group by status
            order by ticketCount desc
            """,
            nativeQuery = true)
    List<TicketStatusView> countByStatus();
}
