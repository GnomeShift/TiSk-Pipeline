package com.gnomeshift.tisk.auth;

import com.gnomeshift.tisk.user.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserMapper userMapper;

    @Mock
    private JwtProperties jwtProperties;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private RegisterDTO registerDTO;
    private LoginDTO loginDTO;
    private UserDTO userDTO;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .password("encodedPassword")
                .firstName("Test")
                .lastName("User")
                .login("testuser")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        registerDTO = new RegisterDTO();
        registerDTO.setEmail("newuser@example.com");
        registerDTO.setPassword("Password123");
        registerDTO.setFirstName("New");
        registerDTO.setLastName("User");
        registerDTO.setLogin("newuser");

        loginDTO = new LoginDTO();
        loginDTO.setEmail("test@example.com");
        loginDTO.setPassword("Password123");

        userDTO = UserDTO.builder()
                .id(testUser.getId())
                .email(testUser.getEmail())
                .firstName(testUser.getFirstName())
                .lastName(testUser.getLastName())
                .login(testUser.getLogin())
                .role(testUser.getRole())
                .status(testUser.getStatus())
                .build();
    }

    @Nested
    @DisplayName("Registration Tests")
    class RegistrationTests {
        @Test
        @DisplayName("Successfully register new user")
        void shouldRegisterNewUser() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userRepository.existsByLogin(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(jwtService.generateAccessToken(any(User.class))).thenReturn("accessToken");
            when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refreshToken");
            when(jwtProperties.getAccessTokenExpiration()).thenReturn(3600000L);
            when(userMapper.toDto(any(User.class))).thenReturn(userDTO);

            AuthResponseDTO response = authService.register(registerDTO);

            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("accessToken");
            assertThat(response.getRefreshToken()).isEqualTo("refreshToken");
            assertThat(response.getTokenType()).isEqualTo("Bearer");
            assertThat(response.getUser()).isEqualTo(userDTO);

            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Throw exception when email already exists")
        void shouldThrowExceptionWhenEmailExists() {
            when(userRepository.existsByEmail(anyString())).thenReturn(true);

            assertThatThrownBy(() -> authService.register(registerDTO))
                    .isInstanceOf(ValidationException.class)
                    .hasMessage("Email already registered");

            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Throw exception when login already exists")
        void shouldThrowExceptionWhenLoginExists() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userRepository.existsByLogin(anyString())).thenReturn(true);

            assertThatThrownBy(() -> authService.register(registerDTO))
                    .isInstanceOf(ValidationException.class)
                    .hasMessage("Login already taken");

            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Generate login when not provided")
        void shouldGenerateLoginWhenNotProvided() {
            registerDTO.setLogin(null);
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userRepository.existsByLogin(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(jwtService.generateAccessToken(any(User.class))).thenReturn("accessToken");
            when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refreshToken");
            when(jwtProperties.getAccessTokenExpiration()).thenReturn(3600000L);
            when(userMapper.toDto(any(User.class))).thenReturn(userDTO);

            authService.register(registerDTO);

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());

            User savedUser = userCaptor.getValue();
            assertThat(savedUser.getLogin()).isNotNull();
        }
    }

    @Nested
    @DisplayName("Login Tests")
    class LoginTests {
        @Test
        @DisplayName("Successfully login user")
        void shouldLoginUser() {
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(new UsernamePasswordAuthenticationToken(testUser, null));
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
            when(jwtService.generateAccessToken(any(User.class))).thenReturn("accessToken");
            when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refreshToken");
            when(jwtProperties.getAccessTokenExpiration()).thenReturn(3600000L);
            when(userMapper.toDto(any(User.class))).thenReturn(userDTO);
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            AuthResponseDTO response = authService.login(loginDTO);

            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("accessToken");
            assertThat(response.getRefreshToken()).isEqualTo("refreshToken");
        }

        @Test
        @DisplayName("Throw exception for invalid credentials")
        void shouldThrowExceptionForInvalidCredentials() {
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenThrow(new BadCredentialsException("Bad credentials"));

            assertThatThrownBy(() -> authService.login(loginDTO))
                    .isInstanceOf(BadCredentialsException.class)
                    .hasMessage("Invalid credentials");
        }

        @Test
        @DisplayName("Throw exception when user not found")
        void shouldThrowExceptionWhenUserNotFound() {
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(new UsernamePasswordAuthenticationToken(testUser, null));
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(loginDTO))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessage("User not found");
        }

        @Test
        @DisplayName("Throw exception when user isn't active")
        void shouldThrowExceptionWhenUserNotActive() {
            testUser.setStatus(UserStatus.INACTIVE);
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(new UsernamePasswordAuthenticationToken(testUser, null));
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));

            assertThatThrownBy(() -> authService.login(loginDTO))
                    .isInstanceOf(ValidationException.class)
                    .hasMessage("User account isn't active");
        }
    }

    @Nested
    @DisplayName("Refresh token Tests")
    class RefreshTokenTests {
        @Test
        @DisplayName("Successfully refresh token")
        void shouldRefreshToken() {
            RefreshTokenDTO refreshTokenDTO = new RefreshTokenDTO("validRefreshToken");

            when(jwtService.extractEmail(anyString())).thenReturn("test@example.com");
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
            when(jwtService.isTokenValid(anyString(), any(User.class))).thenReturn(true);
            when(jwtService.generateAccessToken(any(User.class))).thenReturn("newAccessToken");
            when(jwtProperties.getAccessTokenExpiration()).thenReturn(3600000L);
            when(userMapper.toDto(any(User.class))).thenReturn(userDTO);

            AuthResponseDTO response = authService.refreshToken(refreshTokenDTO);

            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("newAccessToken");
            assertThat(response.getRefreshToken()).isEqualTo("validRefreshToken");
        }

        @Test
        @DisplayName("Throw exception for invalid refresh token")
        void shouldThrowExceptionForInvalidRefreshToken() {
            RefreshTokenDTO refreshTokenDTO = new RefreshTokenDTO("invalidRefreshToken");

            when(jwtService.extractEmail(anyString())).thenReturn("test@example.com");
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
            when(jwtService.isTokenValid(anyString(), any(User.class))).thenReturn(false);

            assertThatThrownBy(() -> authService.refreshToken(refreshTokenDTO))
                    .isInstanceOf(BadCredentialsException.class)
                    .hasMessage("Invalid refresh token");
        }
    }

    @Nested
    @DisplayName("Change Password Tests")
    class ChangePasswordTests {
        @Test
        @DisplayName("Successfully change password")
        void shouldChangePassword() {
            ChangePasswordDTO changePasswordDTO = new ChangePasswordDTO();
            changePasswordDTO.setCurrentPassword("oldPassword");
            changePasswordDTO.setNewPassword("NewPassword123");
            changePasswordDTO.setConfirmPassword("NewPassword123");

            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
            when(passwordEncoder.encode(anyString())).thenReturn("newEncodedPassword");
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            assertThatCode(() -> authService.changePassword("test@example.com", changePasswordDTO))
                    .doesNotThrowAnyException();

            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Throw exception when passwords don't match")
        void shouldThrowExceptionWhenPasswordsDontMatch() {
            ChangePasswordDTO changePasswordDTO = new ChangePasswordDTO();
            changePasswordDTO.setCurrentPassword("oldPassword");
            changePasswordDTO.setNewPassword("NewPassword123");
            changePasswordDTO.setConfirmPassword("DifferentPassword123");

            assertThatThrownBy(() -> authService.changePassword("test@example.com", changePasswordDTO))
                    .isInstanceOf(ValidationException.class)
                    .hasMessage("Passwords don't match");
        }

        @Test
        @DisplayName("Throw exception when current password is incorrect")
        void shouldThrowExceptionWhenCurrentPasswordIncorrect() {
            ChangePasswordDTO changePasswordDTO = new ChangePasswordDTO();
            changePasswordDTO.setCurrentPassword("wrongPassword");
            changePasswordDTO.setNewPassword("NewPassword123");
            changePasswordDTO.setConfirmPassword("NewPassword123");

            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

            assertThatThrownBy(() -> authService.changePassword("test@example.com", changePasswordDTO))
                    .isInstanceOf(ValidationException.class)
                    .hasMessage("Current password incorrect");
        }
    }

    @Nested
    @DisplayName("Generate login Tests")
    class GenerateLoginTests {
        @Test
        @DisplayName("Generate login from name")
        void shouldGenerateLoginFromName() {
            when(userRepository.existsByLogin(anyString())).thenReturn(false);

            String login = authService.generateLogin("Test", "User");

            assertThat(login).isEqualTo("tuser");
        }

        @Test
        @DisplayName("Add counter when login exists")
        void shouldAddCounterWhenLoginExists() {
            when(userRepository.existsByLogin("tuser")).thenReturn(true);
            when(userRepository.existsByLogin("tuser1")).thenReturn(false);

            String login = authService.generateLogin("Test", "User");

            assertThat(login).isEqualTo("tuser1");
        }
    }
}
