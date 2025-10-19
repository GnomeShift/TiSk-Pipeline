package com.gnomeshift.tisk.user;

import com.gnomeshift.tisk.ticket.Ticket;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private UUID id;
    private String email;
    private String login;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String department;
    private String position;
    private List<Ticket> assignedTickets;
    private List<Ticket> reportedTickets;
    private UserRole role;
    private UserStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;
}
