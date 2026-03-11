package com.tindatrack.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {

    private static final String STRONG_PASSWORD_PATTERN =
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[a-zA-Z\\d@$!%*?&]{8,}$";

    private Pattern pattern;

    @Override
    public void initialize(StrongPassword annotation) {
        pattern = Pattern.compile(STRONG_PASSWORD_PATTERN);
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return false;
        }

        boolean isValid = pattern.matcher(value).matches();

        if (!isValid) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                    "Password must contain: " +
                    "At least 8 characters, " +
                    "Uppercase letters (A-Z), " +
                    "Lowercase letters (a-z), " +
                    "Numbers (0-9), " +
                    "Special characters (!@#$%^&*)"
            ).addConstraintViolation();
        }

        return isValid;
    }
}
