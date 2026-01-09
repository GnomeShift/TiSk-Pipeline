package com.gnomeshift.tisk.user;

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

@WebMvcTest(UserController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("UserController Tests")
class UserControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private AuthenticationProvider authenticationProvider;

    private UserDTO testUserDTO;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testUserDTO = UserDTO.builder()
                .id(testUserId)
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .login("testuser")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .department("IT")
                .position("Developer")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("Get all users Tests")
    class GetAllUsersTests {
        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Return all users for admin")
        void shouldReturnAllUsersForAdmin() throws Exception {
            when(userService.getAllUsers()).thenReturn(List.of(testUserDTO));

            mockMvc.perform(get("/api/users"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].email").value("test@example.com"));
        }

        @Test
        @WithMockUser(roles = "SUPPORT")
        @DisplayName("Return all users for support")
        void shouldReturnAllUsersForSupport() throws Exception {
            when(userService.getAllUsers()).thenReturn(List.of(testUserDTO));

            mockMvc.perform(get("/api/users"))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(roles = "USER")
        @DisplayName("Return forbidden for regular user")
        void shouldReturnForbiddenForRegularUser() throws Exception {
            mockMvc.perform(get("/api/users"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Return unauthorized for unauthenticated user")
        void shouldReturnUnauthorizedForUnauthenticatedUser() throws Exception {
            mockMvc.perform(get("/api/users"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("Get user by ID Tests")
    class GetUserByIdTests {
        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Return user by id for admin")
        void shouldReturnUserByIdForAdmin() throws Exception {
            when(userService.getUserById(any(UUID.class))).thenReturn(testUserDTO);

            mockMvc.perform(get("/api/users/{id}", testUserId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email").value("test@example.com"));
        }

        @Test
        @WithMockUser(roles = "SUPPORT")
        @DisplayName("Return user by id for support")
        void shouldReturnUserByIdForSupport() throws Exception {
            when(userService.getUserById(any(UUID.class))).thenReturn(testUserDTO);

            mockMvc.perform(get("/api/users/{id}", testUserId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email").value("test@example.com"));
        }
    }

    @Nested
    @DisplayName("Create user Tests")
    class CreateUserTests {
        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Create user for admin")
        void shouldCreateUserForAdmin() throws Exception {
            CreateUserDTO createUserDTO = new CreateUserDTO();
            createUserDTO.setEmail("newuser@example.com");
            createUserDTO.setPassword("Password123");
            createUserDTO.setFirstName("New");
            createUserDTO.setLastName("User");
            createUserDTO.setLogin("newuser");
            createUserDTO.setRole(UserRole.USER);

            when(userService.createUser(any(CreateUserDTO.class))).thenReturn(testUserDTO);

            mockMvc.perform(post("/api/users")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createUserDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(header().exists("Location"));
        }

        @Test
        @WithMockUser(roles = "USER")
        @DisplayName("Return forbidden for regular user")
        void shouldReturnForbiddenForRegularUser() throws Exception {
            CreateUserDTO createUserDTO = new CreateUserDTO();
            createUserDTO.setEmail("newuser@example.com");
            createUserDTO.setPassword("Password123");
            createUserDTO.setFirstName("New");
            createUserDTO.setLastName("User");
            createUserDTO.setLogin("newuser");
            createUserDTO.setRole(UserRole.USER);

            mockMvc.perform(post("/api/users")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createUserDTO)))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("Update user Tests")
    class UpdateUserTests {
        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Update user for admin")
        void shouldUpdateUserForAdmin() throws Exception {
            UpdateUserDTO updateUserDTO = new UpdateUserDTO();
            updateUserDTO.setFirstName("Updated");

            when(userService.updateUser(any(UUID.class), any(UpdateUserDTO.class))).thenReturn(testUserDTO);

            mockMvc.perform(patch("/api/users/{id}", testUserId)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateUserDTO)))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Delete user Tests")
    class DeleteUserTests {
        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Delete user for admin")
        void shouldDeleteUserForAdmin() throws Exception {
            doNothing().when(userService).deleteUser(any(UUID.class));

            mockMvc.perform(delete("/api/users/{id}", testUserId)
                            .with(csrf()))
                    .andExpect(status().isNoContent());
        }

        @Test
        @WithMockUser(roles = "USER")
        @DisplayName("Return forbidden for regular user")
        void shouldReturnForbiddenForRegularUser() throws Exception {
            mockMvc.perform(delete("/api/users/{id}", testUserId)
                            .with(csrf()))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("Change user status Tests")
    class ChangeUserStatusTests {
        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Change user status for admin")
        void shouldChangeUserStatusForAdmin() throws Exception {
            doNothing().when(userService).changeUserStatus(any(UUID.class), any(UserStatus.class));

            mockMvc.perform(patch("/api/users/{id}/status", testUserId)
                            .with(csrf())
                            .param("status", "SUSPENDED"))
                    .andExpect(status().isNoContent());
        }
    }

    @Nested
    @DisplayName("Get current user Tests")
    class GetCurrentUserTests {
        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Return current user")
        void shouldReturnCurrentUser() throws Exception {
            when(userService.getUserByEmail("test@example.com")).thenReturn(testUserDTO);

            mockMvc.perform(get("/api/users/me"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email").value("test@example.com"));
        }
    }
}
