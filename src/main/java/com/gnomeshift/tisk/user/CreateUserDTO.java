package com.gnomeshift.tisk.user;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserDTO {
    @NotBlank(message = "Email required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
            message = "Password must contain at least one uppercase letter, one lowercase letter and one digit")
    private String password;

    @NotBlank(message = "First name required")
    @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    private String firstName;

    @NotBlank(message = "Last name required")
    @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    private String lastName;

    @NotBlank(message = "Login required")
    @Size(min = 3, max = 50, message = "Login must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Login can only contain letters, numbers and underscores")
    private String login;

    @Pattern(regexp = "^$|^\\+?[1-9]\\d{0,10}$", message = "Invalid phone number format")
    private String phoneNumber;

    private String department;
    private String position;

    @NotNull(message = "Role required")
    private UserRole role = UserRole.USER;
}
