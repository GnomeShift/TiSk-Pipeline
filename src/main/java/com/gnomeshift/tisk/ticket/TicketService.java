package com.gnomeshift.tisk.ticket;

import com.gnomeshift.tisk.user.User;
import com.gnomeshift.tisk.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TicketService {
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketMapper ticketMapper;

    @Transactional(readOnly = true)
    public List<TicketDTO> getAllTickets() {
        return ticketMapper.toDtoList(ticketRepository.findAll());
    }

    @Transactional(readOnly = true)
    public TicketDTO getTicketById(UUID id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ticket with id '" + id + "' not found"));
        return ticketMapper.toDto(ticket);
    }

    @Transactional(readOnly = true)
    public List<TicketDTO> getMyTickets(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User with email '" + email + "' not found"));
        return ticketMapper.toDtoList(ticketRepository.findAllByReporter(user));
    }

    @Transactional
    public TicketDTO createTicket(CreateTicketDTO createTicketDTO) {
        log.info("Creating new ticket with title: {}", createTicketDTO.getTitle());

        User reporter = userRepository.findById(createTicketDTO.getReporterId())
                .orElseThrow(() -> new EntityNotFoundException("User with id '" + createTicketDTO.getReporterId() + "' not found"));

        Ticket ticket = ticketMapper.toEntity(createTicketDTO);
        ticket.setReporter(reporter);
        return ticketMapper.toDto(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketDTO updateTicket(UUID id, UpdateTicketDTO updateTicketDTO) {
        log.info("Updating ticket with id: {}", id);

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ticket with id '" + id + "' not found"));

        ticketMapper.updateTicketFromDto(updateTicketDTO, ticket);

        if (updateTicketDTO.getReporterId() != null) {
            User reporter = userRepository.findById(updateTicketDTO.getReporterId())
                    .orElseThrow(() -> new EntityNotFoundException("User with id '" + id + "' not found"));
            ticket.setAssignee(reporter);
        }

        Ticket savedTicket = ticketRepository.save(ticket);
        log.info("Ticket updated successfully: {}", id);
        return ticketMapper.toDto(savedTicket);
    }

    @Transactional
    public TicketDTO assignTicket(UUID id, UUID assigneeId) {
        log.info("Assigning ticket {} to user {}", id, assigneeId);

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ticket with id '" + id + "' not found"));

        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new EntityNotFoundException("User with id '" + id + "' not found"));

        ticket.setAssignee(assignee);

        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }

        Ticket savedTicket = ticketRepository.save(ticket);
        log.info("Ticket assigned successfully");
        return ticketMapper.toDto(savedTicket);
    }

    @Transactional
    public void deleteTicket(UUID id) {
        log.info("Deleting ticket with id: {}", id);

        ticketRepository.deleteById(id);
        log.info("Ticket deleted successfully: {}", id);
    }
}
