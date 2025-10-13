package com.gnomeshift.tisk.exception;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@AllArgsConstructor
@Data
public class ExceptionDetails {
    private LocalDateTime timestamp;
    private String message;
    private String details;
}
