package com.android.tindatrackmobile

import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.POST
import retrofit2.http.PUT

interface ApiService {

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @GET("auth/me")
    suspend fun getMe(): Response<UserDto>

    @GET("dashboard")
    suspend fun getDashboard(): Response<DashboardResponse>

    @GET("sales")
    suspend fun getSales(): Response<List<SaleResponse>>

    @POST("sales")
    suspend fun createSale(@Body request: SaleRequest): Response<SaleResponse>

    @PUT("sales/{id}")
    suspend fun updateSale(@Path("id") id: Long, @Body request: SaleRequest): Response<SaleResponse>

    @DELETE("sales/{id}")
    suspend fun deleteSale(@Path("id") id: Long): Response<Unit>

    @GET("sales/export")
    suspend fun exportSales(): Response<ResponseBody>

    @POST("store/setup")
    suspend fun setupStore(@Body request: StoreSetupRequest): Response<UserDto>

    @POST("store/join")
    suspend fun joinStore(@Body request: StoreJoinRequest): Response<UserDto>

    @GET("store/team")
    suspend fun getStoreTeam(): Response<List<UserDto>>

    @GET("store/activity")
    suspend fun getStoreActivity(): Response<List<ActivityLogDto>>
}
