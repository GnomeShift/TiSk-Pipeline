package com.gnomeshift.tisk.user;

import com.gnomeshift.tisk.auth.AuthService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final AuthService authService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userMapper.toDtoList(userRepository.findAll());
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        return userMapper.toDto(user);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
        return userMapper.toDto(user);
    }

    public UserDTO createUser(CreateUserDTO createUserDTO) {
        log.info("Creating new user with email: {}", createUserDTO.getEmail());

        if (userRepository.existsByEmail(createUserDTO.getEmail())) {
            throw new ValidationException("Email already exists");
        }

        if (createUserDTO.getLogin() != null &&
                userRepository.existsByLogin(createUserDTO.getLogin())) {
            throw new ValidationException("Login already exists");
        }

        User user = userMapper.toEntity(createUserDTO);
        user.setPassword(passwordEncoder.encode(createUserDTO.getPassword()));

        if (user.getLogin() == null) {
            user.setLogin(authService.generateLogin(createUserDTO.getFirstName(), createUserDTO.getLastName()));
        }

        User savedUser = userRepository.save(user);
        log.info("User created successfully with id: {}", savedUser.getId());
        return userMapper.toDto(savedUser);
    }

    public UserDTO updateUser(UUID id, UpdateUserDTO updateUserDTO) {
        log.info("Updating user with id: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        if (updateUserDTO.getEmail() != null &&
                !updateUserDTO.getEmail().equals(user.getEmail()) &&
                userRepository.existsByEmail(updateUserDTO.getEmail())) {
            throw new ValidationException("Email already exists");
        }

        if (updateUserDTO.getLogin() != null && !updateUserDTO.getLogin().equals(user.getLogin()) &&
                userRepository.existsByLogin(updateUserDTO.getLogin())) {
            throw new ValidationException("Login already exists");
        }

        userMapper.updateUserFromDto(updateUserDTO, user);

        User savedUser = userRepository.save(user);
        log.info("User updated successfully: {}", id);
        return userMapper.toDto(savedUser);
    }

    public void deleteUser(UUID id) {
        log.info("Deleting user with id: {}", id);

        if (!userRepository.existsById(id)) {
            throw new EntityNotFoundException("User not found with id: " + id);
        }

        userRepository.deleteById(id);
        log.info("User deleted successfully: {}", id);
    }

    public void changeUserStatus(UUID id, UserStatus status) {
        log.info("Changing user status for id: {} to {}", id, status);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        user.setStatus(status);
        userRepository.save(user);
        log.info("User status changed successfully: {}", id);
    }
}
