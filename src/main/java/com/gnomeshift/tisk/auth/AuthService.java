package com.gnomeshift.tisk.auth;

import com.gnomeshift.tisk.user.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final JwtProperties jwtProperties;

    public AuthResponseDTO register(RegisterDTO registerDTO) {
        log.info("Registering new user with email: {}", registerDTO.getEmail());

        if (userRepository.existsByEmail(registerDTO.getEmail())) {
            throw new ValidationException("Email already registered");
        }

        if (registerDTO.getLogin() != null && userRepository.existsByLogin(registerDTO.getLogin())) {
            throw new ValidationException("Username already taken");
        }

        User user = User.builder()
                .email(registerDTO.getEmail())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .firstName(registerDTO.getFirstName())
                .lastName(registerDTO.getLastName())
                .login(registerDTO.getLogin() != null ?
                        registerDTO.getLogin() : generateLogin(registerDTO.getFirstName(), registerDTO.getLastName()))
                .phoneNumber(registerDTO.getPhoneNumber())
                .department(registerDTO.getDepartment())
                .position(registerDTO.getPosition())
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with id: {}", savedUser.getId());

        String accessToken = jwtService.generateAccessToken(savedUser);
        String refreshToken = jwtService.generateRefreshToken(savedUser);

        savedUser.setLastLoginAt(LocalDateTime.now());
        userRepository.save(savedUser);

        return AuthResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getAccessTokenExpiration())
                .user(userMapper.toDto(savedUser))
                .build();
    }

    public AuthResponseDTO login(LoginDTO loginDTO) {
        log.info("User login attempt with email: {}", loginDTO.getEmail());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDTO.getEmail(), loginDTO.getPassword())
            );
        }
        catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid credentials");
        }

        User user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ValidationException("User account isn't active");
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        log.info("User logged in successfully: {}", user.getId());

        return AuthResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getAccessTokenExpiration())
                .user(userMapper.toDto(user))
                .build();
    }

    public AuthResponseDTO refreshToken(RefreshTokenDTO refreshTokenDTO) {
        log.info("Refreshing access token...");
        String userEmail = jwtService.extractEmail(refreshTokenDTO.getRefreshToken());

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!jwtService.isTokenValid(refreshTokenDTO.getRefreshToken(), user)) {
            throw new BadCredentialsException("Invalid refresh token");
        }

        String newAccessToken = jwtService.generateAccessToken(user);
        log.info("Access token refreshed for user: {}", user.getId());

        return AuthResponseDTO.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshTokenDTO.getRefreshToken())
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getAccessTokenExpiration())
                .user(userMapper.toDto(user))
                .build();
    }

    public void changePassword(String email, ChangePasswordDTO changePasswordDTO) {
        log.info("Changing password for user: {}", email);

        if (!changePasswordDTO.getNewPassword().equals(changePasswordDTO.getConfirmPassword())) {
            throw new ValidationException("Passwords don't match");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!passwordEncoder.matches(changePasswordDTO.getCurrentPassword(), user.getPassword())) {
            throw new ValidationException("Current password incorrect");
        }

        user.setPassword(passwordEncoder.encode(changePasswordDTO.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed successfully for user: {}", user.getId());
    }

    public String generateLogin(String firstName, String lastName) {
        String base = (firstName.charAt(0) + lastName).toLowerCase().replaceAll("[^a-z0-9]", "");
        String login = base;
        int counter = 1;

        while (userRepository.existsByLogin(login)) {
            login = base + counter;
            counter++;
        }
        return login;
    }
}
