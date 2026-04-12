package com.android.tindatrackmobile

// ── AUTH REQUESTS ──

data class LoginRequest(
    val email: String,
    val password: String
)

/**
 * Matches your Spring Boot RegisterRequest.java
 * Single endpoint: POST /api/auth/register
 *
 * Fields:
 *   name          → user's full name
 *   email         → user's email
 *   password      → user's password
 *   role          → "OWNER" or "STAFF"
 *   storeName     → filled in when role = OWNER
 *   storeCode     → filled in when role = STAFF (to join existing store)
 */
data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val confirmPassword: String,  // backend validates this matches password
    val role: String,             // "OWNER" or "STAFF"
    val storeName: String? = null,
    val storeCode: String? = null
)

// ── RESPONSES ──

data class AuthResponse(
    val token: String,
    val user: UserDto
)

data class UserDto(
    val id: String?,
    val name: String?,
    val email: String?,
    val role: String?,
    val storeName: String?,
    val storeCode: String?
)

// ── ERROR ──

data class ApiError(
    val error: ApiErrorDetail?,
    val message: String?       // some Spring Boot errors return flat "message"
)

data class ApiErrorDetail(
    val message: String?
)

// ── HOME DASHBOARD ──

data class SaleItem(
    val name: String,
    val date: String,
    val price: String,
    val qty: String
)

data class TopSellingItem(
    val rank: Int,
    val name: String,
    val units: String,
    val revenue: String
)
