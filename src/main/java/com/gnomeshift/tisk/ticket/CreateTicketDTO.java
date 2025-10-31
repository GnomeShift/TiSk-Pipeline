package com.gnomeshift.tisk.ticket;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTicketDTO {
    @NotBlank(message = "Title required")
    @Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    private String title;

    @NotBlank(message = "Description required")
    @Size(min = 1, max = 5000, message = "Description must be between 1 and 5000 characters")
    private String description;

    @NotNull(message = "Status required")
    @Enumerated(EnumType.STRING)
    private TicketStatus status = TicketStatus.OPEN;

    @NotNull(message = "Priority required")
    @Enumerated(EnumType.STRING)
    private TicketPriority priority;

    private UUID reporterId;
}
