package com.gnomeshift.tisk.ticket;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTicketDTO {
    @Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    private String title;

    @Size(min = 1, max = 5000, message = "Description must be between 1 and 5000 characters")
    private String description;

    private TicketStatus status;
    private TicketPriority priority;
    private UUID reporterId;
}
