package com.gnomeshift.tisk.ticket;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Validated
@Slf4j
public class TicketController {
    private final TicketService ticketService;

    @GetMapping
    public ResponseEntity<List<TicketDTO>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDTO> getTicketById(@PathVariable UUID id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketDTO>> getMyTickets(Authentication authentication) {
        return ResponseEntity.ok(ticketService.getMyTickets(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<TicketDTO> createTicket(@Valid @RequestBody CreateTicketDTO createTicketDTO) {
        TicketDTO createdTicket = ticketService.createTicket(createTicketDTO);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .location(URI.create("/api/tickets/" + createdTicket.getId()))
                .body(createdTicket);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT') or #id == authentication.principal.id")
    public ResponseEntity<TicketDTO> updateTicket(@PathVariable UUID id, @Valid @RequestBody UpdateTicketDTO updateTicketDTO) {
        return ResponseEntity.ok(ticketService.updateTicket(id, updateTicketDTO));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT')")
    public ResponseEntity<TicketDTO> assignTicket(@PathVariable UUID id, @RequestParam UUID assigneeId) {
        return ResponseEntity.ok(ticketService.assignTicket(id, assigneeId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTicket(@PathVariable UUID id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }
}
