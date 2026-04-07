    package com.tindatrack.backend.dto;

    import com.tindatrack.backend.validation.StrongPassword;
    import jakarta.validation.constraints.Email;
    import jakarta.validation.constraints.NotBlank;
    import lombok.Getter;
    import lombok.Setter;

    @Getter
    @Setter
    public class RegisterRequest {

        @NotBlank(message = "Full name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        private String email;

        @NotBlank(message = "Password is required")
        @StrongPassword
        private String password;

        private String confirmPassword;

        @NotBlank(message = "Role is required")
        private String role;

        private String storeName;

        private String storeCode;
    }