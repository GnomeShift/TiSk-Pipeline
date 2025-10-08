package com.gnomeshift.tisk.ticket;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateTicketDTO {
    @NotBlank(message = "Title can't be empty")
    @Size(max = 255, message = "Title length can't exceed 255 characters")
    private String title;

    @Size(max = 5000, message = "Description can't exceed 5000 characters")
    private String description;

    @NotNull(message = "Status can't be null")
    @Enumerated(EnumType.STRING)
    private TicketStatus status = TicketStatus.OPEN;
}
