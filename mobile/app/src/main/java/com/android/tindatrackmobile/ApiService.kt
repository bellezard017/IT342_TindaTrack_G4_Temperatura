package com.android.tindatrackmobile

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface ApiService {

    // POST /api/auth/login
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    // POST /api/auth/register  — single endpoint, matches your Spring Boot backend
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    // GET /api/auth/me  — requires Bearer token in header
    @GET("auth/me")
    suspend fun getMe(): Response<UserDto>
}
