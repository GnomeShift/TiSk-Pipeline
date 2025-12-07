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
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found with id " + id));
        return ticketMapper.toDto(ticket);
    }

    @Transactional(readOnly = true)
    public List<TicketDTO> getMyTickets(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
        return ticketMapper.toDtoList(ticketRepository.findAllByReporter(user));
    }

    @Transactional
    public TicketDTO createTicket(CreateTicketDTO createTicketDTO) {
        log.info("Creating new ticket with title: {}", createTicketDTO.getTitle());

        User reporter = userRepository.findById(createTicketDTO.getReporterId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + createTicketDTO.getReporterId()));

        Ticket ticket = ticketMapper.toEntity(createTicketDTO);
        ticket.setReporter(reporter);
        Ticket savedTicket = ticketRepository.save(ticket);
        log.info("Ticket created successfully with id: {}", savedTicket.getId());
        return ticketMapper.toDto(savedTicket);
    }

    @Transactional
    public TicketDTO updateTicket(UUID id, UpdateTicketDTO updateTicketDTO) {
        log.info("Updating ticket with id: {}", id);

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found with id: " + id));

        ticketMapper.updateTicketFromDto(updateTicketDTO, ticket);

        if (updateTicketDTO.getReporterId() != null) {
            User reporter = userRepository.findById(updateTicketDTO.getReporterId())
                    .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + updateTicketDTO.getReporterId()));
            ticket.setReporter(reporter);
        }

        Ticket savedTicket = ticketRepository.save(ticket);
        log.info("Ticket updated successfully: {}", id);
        return ticketMapper.toDto(savedTicket);
    }

    @Transactional
    public TicketDTO assignTicket(UUID id, UUID assigneeId) {
        log.info("Assigning ticket {} to user {}", id, assigneeId);

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found with id: " + id));

        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        ticket.setAssignee(assignee);

        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }

        Ticket savedTicket = ticketRepository.save(ticket);
        log.info("Ticket assigned successfully: {}", id);
        return ticketMapper.toDto(savedTicket);
    }

    @Transactional
    public void deleteTicket(UUID id) {
        log.info("Deleting ticket with id: {}", id);

        if (!ticketRepository.existsById(id)) {
            throw new EntityNotFoundException("Ticket not found with id: " + id);
        }

        ticketRepository.deleteById(id);
        log.info("Ticket deleted successfully: {}", id);
    }
}
