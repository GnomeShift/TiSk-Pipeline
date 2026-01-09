package com.gnomeshift.tisk.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnomeshift.tisk.auth.AuthResponseDTO;
import com.gnomeshift.tisk.auth.LoginDTO;
import com.gnomeshift.tisk.ticket.CreateTicketDTO;
import com.gnomeshift.tisk.ticket.TicketPriority;
import com.gnomeshift.tisk.user.User;
import com.gnomeshift.tisk.user.UserRepository;
import com.gnomeshift.tisk.user.UserRole;
import com.gnomeshift.tisk.user.UserStatus;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Ticket integration Tests")
class TicketIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private String accessToken;

    @BeforeEach
    void setUp() throws Exception {
        // Create test user
        testUser = User.builder()
                .email("integration@example.com")
                .password(passwordEncoder.encode("Password123"))
                .firstName("Integration")
                .lastName("Test")
                .login("integrationtest")
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        testUser = userRepository.save(testUser);

        // Login
        LoginDTO loginDTO = new LoginDTO("integration@example.com", "Password123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponseDTO authResponse = objectMapper.readValue(
                result.getResponse().getContentAsString(),
                AuthResponseDTO.class
        );
        accessToken = authResponse.getAccessToken();
    }

    @Test
    @DisplayName("Complete full ticket lifecycle")
    void shouldCompleteFullTicketLifecycle() throws Exception {
        // Create ticket
        CreateTicketDTO createTicketDTO = new CreateTicketDTO();
        createTicketDTO.setTitle("Integration Test Ticket");
        createTicketDTO.setDescription("This is an integration test");
        createTicketDTO.setPriority(TicketPriority.HIGH);
        createTicketDTO.setReporterId(testUser.getId());

        MvcResult createResult = mockMvc.perform(post("/api/tickets")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createTicketDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Integration Test Ticket"))
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andReturn();

        // Extract ticket ID
        String ticketId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

        // Get ticket
        mockMvc.perform(get("/api/tickets/{id}", ticketId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Integration Test Ticket"));

        // Assign ticket
        mockMvc.perform(patch("/api/tickets/{id}/assign", ticketId)
                        .header("Authorization", "Bearer " + accessToken)
                        .param("assigneeId", testUser.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        // Delete ticket
        mockMvc.perform(delete("/api/tickets/{id}", ticketId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNoContent());

        // Verify deletion
        mockMvc.perform(get("/api/tickets/{id}", ticketId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNotFound());
    }
}
