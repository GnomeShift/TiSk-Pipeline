package com.gnomeshift.tisk.ticket;


import com.gnomeshift.tisk.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    List<Ticket> findAllByReporter(User reporter);
}
