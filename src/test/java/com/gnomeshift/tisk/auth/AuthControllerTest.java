package com.gnomeshift.tisk.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnomeshift.tisk.security.SecurityConfig;
import com.gnomeshift.tisk.user.UserDTO;
import com.gnomeshift.tisk.user.UserRole;
import com.gnomeshift.tisk.user.UserStatus;
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

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("AuthController Tests")
class AuthControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private AuthenticationProvider authenticationProvider;

    private RegisterDTO registerDTO;
    private LoginDTO loginDTO;
    private AuthResponseDTO authResponse;

    @BeforeEach
    void setUp() {
        registerDTO = new RegisterDTO();
        registerDTO.setEmail("test@example.com");
        registerDTO.setPassword("Password123");
        registerDTO.setFirstName("Test");
        registerDTO.setLastName("User");
        registerDTO.setLogin("testuser");

        loginDTO = new LoginDTO();
        loginDTO.setEmail("test@example.com");
        loginDTO.setPassword("Password123");

        UserDTO userDTO = UserDTO.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .login("testuser")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();

        authResponse = AuthResponseDTO.builder()
                .accessToken("accessToken")
                .refreshToken("refreshToken")
                .tokenType("Bearer")
                .expiresIn(3600000L)
                .user(userDTO)
                .build();
    }

    @Nested
    @DisplayName("Register Tests")
    class RegisterTests {
        @Test
        @DisplayName("Register user successfully")
        void shouldRegisterUser() throws Exception {
            when(authService.register(any(RegisterDTO.class))).thenReturn(authResponse);

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(registerDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.accessToken").value("accessToken"))
                    .andExpect(jsonPath("$.refreshToken").value("refreshToken"))
                    .andExpect(jsonPath("$.tokenType").value("Bearer"));
        }

        @Test
        @DisplayName("Return bad request for invalid email")
        void shouldReturnBadRequestForInvalidEmail() throws Exception {
            registerDTO.setEmail("invalidEmail");

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(registerDTO)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Return bad request for weak password")
        void shouldReturnBadRequestForWeakPassword() throws Exception {
            registerDTO.setPassword("weak");

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(registerDTO)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Return bad request for missing first name")
        void shouldReturnBadRequestForMissingFirstName() throws Exception {
            registerDTO.setFirstName(null);

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(registerDTO)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Login Tests")
    class LoginTests {
        @Test
        @DisplayName("Login user successfully")
        void shouldLoginUser() throws Exception {
            when(authService.login(any(LoginDTO.class))).thenReturn(authResponse);

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginDTO)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Return bad request for missing email")
        void shouldReturnBadRequestForMissingEmail() throws Exception {
            loginDTO.setEmail(null);

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginDTO)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Refresh token Tests")
    class RefreshTokenTests {
        @Test
        @DisplayName("Refresh token successfully")
        void shouldRefreshToken() throws Exception {
            RefreshTokenDTO refreshTokenDTO = new RefreshTokenDTO("validRefreshToken");
            when(authService.refreshToken(any(RefreshTokenDTO.class))).thenReturn(authResponse);

            mockMvc.perform(post("/api/auth/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(refreshTokenDTO)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").value("accessToken"));
        }

        @Test
        @DisplayName("Return bad request for missing refresh token")
        void shouldReturnBadRequestForMissingRefreshToken() throws Exception {
            RefreshTokenDTO refreshTokenDTO = new RefreshTokenDTO();

            mockMvc.perform(post("/api/auth/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(refreshTokenDTO)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Change password Tests")
    class ChangePasswordTests {
        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Change password successfully")
        void shouldChangePassword() throws Exception {
            ChangePasswordDTO changePasswordDTO = new ChangePasswordDTO();
            changePasswordDTO.setCurrentPassword("OldPassword123");
            changePasswordDTO.setNewPassword("NewPassword123");
            changePasswordDTO.setConfirmPassword("NewPassword123");

            mockMvc.perform(post("/api/auth/change-password")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(changePasswordDTO)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Return internal server error when not authenticated")
        void shouldReturnUnauthorizedWhenNotAuthenticated() throws Exception {
            ChangePasswordDTO changePasswordDTO = new ChangePasswordDTO();
            changePasswordDTO.setCurrentPassword("OldPassword123");
            changePasswordDTO.setNewPassword("NewPassword123");
            changePasswordDTO.setConfirmPassword("NewPassword123");

            mockMvc.perform(post("/api/auth/change-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(changePasswordDTO)))
                    .andExpect(status().isInternalServerError());
        }
    }
}
