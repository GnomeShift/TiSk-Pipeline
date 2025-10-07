package com.gnomeshift.tisk.ticket;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;

    @Transactional(readOnly = true)
    public List<TicketDTO> getAllTickets() {
        return ticketRepository.findAll().stream().map(TicketDTO::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TicketDTO getTicketById(UUID id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ticket with id '" + id + "' not found"));
        return TicketDTO.fromEntity(ticket);
    }

    @Transactional
    public TicketDTO createTicket(CreateTicketDTO createTicketDTO) {
        Ticket ticket = new Ticket();
        ticket.setTitle(createTicketDTO.getTitle());
        ticket.setDescription(createTicketDTO.getDescription());
        ticket.setStatus(createTicketDTO.getStatus());
        return TicketDTO.fromEntity(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketDTO updateTicket(UUID id, TicketDTO ticketDTO) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ticket with id '" + id + "' not found"));
        ticket.setTitle(ticketDTO.getTitle());
        ticket.setDescription(ticketDTO.getDescription());
        ticket.setStatus(ticketDTO.getStatus());
        return TicketDTO.fromEntity(ticketRepository.save(ticket));
    }

    @Transactional
    public void deleteTicket(UUID id) {
        if (!ticketRepository.existsById(id)) {
            throw new EntityNotFoundException("Ticket with id '" + id + "' doesn't exist");
        }
        ticketRepository.deleteById(id);
    }
}
