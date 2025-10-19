package com.gnomeshift.tisk.user;

import com.gnomeshift.tisk.ticket.Ticket;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserDTO {
    @Email(message = "Invalid email format")
    private String email;

    @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    private String firstName;

    @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    private String lastName;

    @Size(min = 3, max = 50, message = "Login must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Login can only contain letters, numbers and underscores")
    private String login;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,10}$", message = "Invalid phone number format")
    private String phoneNumber;

    private String department;
    private String position;

    private List<Ticket> assignedTickets;
    private List<Ticket> reportedTickets;

    private UserRole role;
    private UserStatus status;
}
