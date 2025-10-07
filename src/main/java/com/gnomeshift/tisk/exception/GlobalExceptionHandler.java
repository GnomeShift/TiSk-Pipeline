package com.gnomeshift.tisk.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ExceptionDetails> resourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        ExceptionDetails details = new ExceptionDetails(LocalDateTime.now(), ex.getMessage(), request.getDescription(false));
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(details);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ExceptionDetails> validationExceptions(MethodArgumentNotValidException ex, WebRequest request) {
        ExceptionDetails details = new ExceptionDetails(LocalDateTime.now(), ex.getBindingResult().getAllErrors().getFirst()
                .getDefaultMessage(), request.getDescription(false));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(details);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ExceptionDetails> genericException(RuntimeException ex, WebRequest request) {
        ExceptionDetails details = new ExceptionDetails(LocalDateTime.now(), ex.getMessage(), request.getDescription(false));
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(details);
    }
}
