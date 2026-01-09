package com.gnomeshift.tisk.ticket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnomeshift.tisk.auth.JwtService;
import com.gnomeshift.tisk.security.SecurityConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TicketController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("TicketController Tests")
class TicketControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private TicketService ticketService;

    @MockitoBean
    private AuthenticationProvider authenticationProvider;

    private TicketDTO testTicketDTO;
    private UUID testTicketId;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testTicketId = UUID.randomUUID();
        testUserId = UUID.randomUUID();

        testTicketDTO = TicketDTO.builder()
                .id(testTicketId)
                .title("Test Ticket")
                .description("Test Description")
                .status(TicketStatus.OPEN)
                .priority(TicketPriority.MEDIUM)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("Get all tickets Tests")
    class GetAllTicketsTests {
        @Test
        @WithMockUser
        @DisplayName("Return all tickets")
        void shouldReturnAllTickets() throws Exception {
            when(ticketService.getAllTickets()).thenReturn(List.of(testTicketDTO));

            mockMvc.perform(get("/api/tickets"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].title").value("Test Ticket"));
        }

        @Test
        @DisplayName("Return unauthorized for unauthenticated user")
        void shouldReturnUnauthorizedForUnauthenticatedUser() throws Exception {
            mockMvc.perform(get("/api/tickets"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("Get ticket by ID Tests")
    class GetTicketByIdTests {
        @Test
        @WithMockUser
        @DisplayName("Return ticket by id")
        void shouldReturnTicketById() throws Exception {
            when(ticketService.getTicketById(any(UUID.class))).thenReturn(testTicketDTO);

            mockMvc.perform(get("/api/tickets/{id}", testTicketId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.title").value("Test Ticket"));
        }
    }

    @Nested
    @DisplayName("Get my tickets Tests")
    class GetMyTicketsTests {
        @Test
        @WithMockUser(username = "user@example.com")
        @DisplayName("Return current user's tickets")
        void shouldReturnCurrentUsersTickets() throws Exception {
            when(ticketService.getMyTickets("user@example.com")).thenReturn(List.of(testTicketDTO));

            mockMvc.perform(get("/api/tickets/my"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].title").value("Test Ticket"));
        }
    }

    @Nested
    @DisplayName("Create ticket Tests")
    class CreateTicketTests {
        @Test
        @WithMockUser
        @DisplayName("Create ticket successfully")
        void shouldCreateTicket() throws Exception {
            CreateTicketDTO createTicketDTO = new CreateTicketDTO();
            createTicketDTO.setTitle("New Ticket");
            createTicketDTO.setDescription("New Description");
            createTicketDTO.setPriority(TicketPriority.HIGH);
            createTicketDTO.setReporterId(testUserId);

            when(ticketService.createTicket(any(CreateTicketDTO.class))).thenReturn(testTicketDTO);

            mockMvc.perform(post("/api/tickets")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createTicketDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(header().exists("Location"));
        }

        @Test
        @WithMockUser
        @DisplayName("Return bad request for invalid data")
        void shouldReturnBadRequestForInvalidData() throws Exception {
            CreateTicketDTO createTicketDTO = new CreateTicketDTO();
            // Missing required fields

            mockMvc.perform(post("/api/tickets")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createTicketDTO)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Update ticket Tests")
    class UpdateTicketTests {
        @Test
        @WithMockUser
        @DisplayName("Update ticket successfully")
        void shouldUpdateTicket() throws Exception {
            UpdateTicketDTO updateTicketDTO = new UpdateTicketDTO();
            updateTicketDTO.setTitle("Updated Title");

            when(ticketService.updateTicket(any(UUID.class), any(UpdateTicketDTO.class))).thenReturn(testTicketDTO);

            mockMvc.perform(patch("/api/tickets/{id}", testTicketId)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateTicketDTO)))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Assign ticket Tests")
    class AssignTicketTests {
        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Assign ticket for admin")
        void shouldAssignTicketForAdmin() throws Exception {
            when(ticketService.assignTicket(any(UUID.class), any(UUID.class))).thenReturn(testTicketDTO);

            mockMvc.perform(patch("/api/tickets/{id}/assign", testTicketId)
                            .with(csrf())
                            .param("assigneeId", testUserId.toString()))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(roles = "SUPPORT")
        @DisplayName("Assign ticket for support")
        void shouldAssignTicketForSupport() throws Exception {
            when(ticketService.assignTicket(any(UUID.class), any(UUID.class))).thenReturn(testTicketDTO);

            mockMvc.perform(patch("/api/tickets/{id}/assign", testTicketId)
                            .with(csrf())
                            .param("assigneeId", testUserId.toString()))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(roles = "USER")
        @DisplayName("Return forbidden for regular user")
        void shouldReturnForbiddenForRegularUser() throws Exception {
            mockMvc.perform(patch("/api/tickets/{id}/assign", testTicketId)
                            .with(csrf())
                            .param("assigneeId", testUserId.toString()))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("Delete ticket Tests")
    class DeleteTicketTests {
        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Delete ticket for admin")
        void shouldDeleteTicketForAdmin() throws Exception {
            doNothing().when(ticketService).deleteTicket(any(UUID.class));

            mockMvc.perform(delete("/api/tickets/{id}", testTicketId)
                            .with(csrf()))
                    .andExpect(status().isNoContent());
        }

        @Test
        @WithMockUser(roles = "USER")
        @DisplayName("Return forbidden for regular user")
        void shouldReturnForbiddenForRegularUser() throws Exception {
            mockMvc.perform(delete("/api/tickets/{id}", testTicketId)
                            .with(csrf()))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(roles = "SUPPORT")
        @DisplayName("Return forbidden for support")
        void shouldReturnForbiddenForSupport() throws Exception {
            mockMvc.perform(delete("/api/tickets/{id}", testTicketId)
                            .with(csrf()))
                    .andExpect(status().isForbidden());
        }
    }
}
