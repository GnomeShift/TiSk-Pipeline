package com.gnomeshift.tisk.auth;

import com.gnomeshift.tisk.user.User;
import com.gnomeshift.tisk.user.UserRole;
import com.gnomeshift.tisk.user.UserStatus;
import io.jsonwebtoken.MalformedJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("JwtService Tests")
class JwtServiceTest {
    @Mock
    private JwtProperties jwtProperties;

    private JwtService jwtService;
    private User testUser;

    private static final String TEST_SECRET = "262c8ee99412123fd46e7819303171a997a9f0c10e97ff82c83a83bd7b8976a8";
    private static final long ACCESS_TOKEN_EXPIRATION = 3600000L; // 1 hour
    private static final long REFRESH_TOKEN_EXPIRATION = 86400000L; // 24 hours

    @BeforeEach
    void setUp() {
        when(jwtProperties.getSecret()).thenReturn(TEST_SECRET);
        lenient().when(jwtProperties.getAccessTokenExpiration()).thenReturn(ACCESS_TOKEN_EXPIRATION);
        lenient().when(jwtProperties.getRefreshTokenExpiration()).thenReturn(REFRESH_TOKEN_EXPIRATION);

        jwtService = new JwtService(jwtProperties);
        ReflectionTestUtils.invokeMethod(jwtService, "init");

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
    }

    @Nested
    @DisplayName("Token generation Tests")
    class TokenGenerationTests {
        @Test
        @DisplayName("Generate valid access token")
        void shouldGenerateValidAccessToken() {
            String token = jwtService.generateAccessToken(testUser);

            assertThat(token).isNotNull().isNotEmpty();
            assertThat(token.split("\\.")).hasSize(3);
        }

        @Test
        @DisplayName("Generate valid refresh token")
        void shouldGenerateValidRefreshToken() {
            String token = jwtService.generateRefreshToken(testUser);

            assertThat(token).isNotNull().isNotEmpty();
            assertThat(token.split("\\.")).hasSize(3);
        }

        @Test
        @DisplayName("Generate different tokens for access and refresh")
        void shouldGenerateDifferentTokens() {
            String accessToken = jwtService.generateAccessToken(testUser);
            String refreshToken = jwtService.generateRefreshToken(testUser);

            assertThat(accessToken).isNotEqualTo(refreshToken);
        }
    }

    @Nested
    @DisplayName("Token extraction Tests")
    class TokenExtractionTests {

        @Test
        @DisplayName("Extract email from token")
        void shouldExtractEmailFromToken() {
            String token = jwtService.generateAccessToken(testUser);

            String extractedEmail = jwtService.extractEmail(token);

            assertThat(extractedEmail).isEqualTo(testUser.getEmail());
        }

        @Test
        @DisplayName("Throw exception for malformed token")
        void shouldThrowExceptionForMalformedToken() {
            String malformedToken = "invalid.token.here";

            assertThatThrownBy(() -> jwtService.extractEmail(malformedToken))
                    .isInstanceOf(MalformedJwtException.class);
        }
    }

    @Nested
    @DisplayName("Token validation Tests")
    class TokenValidationTests {
        @Test
        @DisplayName("Return true for valid token")
        void shouldReturnTrueForValidToken() {
            String token = jwtService.generateAccessToken(testUser);

            boolean isValid = jwtService.isTokenValid(token, testUser);

            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("Return false for token with wrong user")
        void shouldReturnFalseForTokenWithWrongUser() {
            String token = jwtService.generateAccessToken(testUser);

            User otherUser = User.builder()
                    .id(UUID.randomUUID())
                    .email("other@example.com")
                    .password("password")
                    .role(UserRole.USER)
                    .status(UserStatus.ACTIVE)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            boolean isValid = jwtService.isTokenValid(token, otherUser);

            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Return false for expired token")
        void shouldReturnFalseForExpiredToken() {
            when(jwtProperties.getAccessTokenExpiration()).thenReturn(-1000L);
            JwtService svc = new JwtService(jwtProperties);
            ReflectionTestUtils.invokeMethod(svc, "init");

            String token = svc.generateAccessToken(testUser);

            assertThat(svc.isTokenValid(token, testUser)).isFalse();
        }
    }
}
