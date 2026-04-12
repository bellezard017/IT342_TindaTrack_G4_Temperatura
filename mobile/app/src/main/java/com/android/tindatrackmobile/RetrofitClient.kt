package com.android.tindatrackmobile

import android.content.Context
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {

    // ── YOUR BACKEND URL ──
    // Emulator  → "http://10.0.2.2:8080/api/"
    // Real device on same WiFi → use your PC's IPv4 from ipconfig
    private const val BASE_URL = "http://192.168.1.4:8080/api/"

    private var token: String? = null

    fun setToken(t: String?) { token = t }

    private val authInterceptor = Interceptor { chain ->
        val request = chain.request().newBuilder().apply {
            token?.let { addHeader("Authorization", "Bearer $it") }
        }.build()
        chain.proceed(request)
    }

    private val logging = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val client = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(logging)
        .build()

    val api: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }

    // ── Token helpers ──
    fun saveToken(context: Context, t: String) {
        context.getSharedPreferences("tinda_prefs", Context.MODE_PRIVATE)
            .edit().putString("token", t).apply()
        token = t
    }

    fun loadToken(context: Context): String? {
        val t = context.getSharedPreferences("tinda_prefs", Context.MODE_PRIVATE)
            .getString("token", null)
        token = t
        return t
    }

    // ── User helpers ──
    fun saveUser(context: Context, user: UserDto) {
        context.getSharedPreferences("tinda_prefs", Context.MODE_PRIVATE)
            .edit()
            .putString("user_name",       user.name)
            .putString("user_email",      user.email)
            .putString("user_role",       user.role)
            .putString("user_store_name", user.storeName)
            .putString("user_store_code", user.storeCode)
            .apply()
    }

    fun loadUser(context: Context): UserDto {
        val p = context.getSharedPreferences("tinda_prefs", Context.MODE_PRIVATE)
        return UserDto(
            id        = null,
            name      = p.getString("user_name",       null),
            email     = p.getString("user_email",      null),
            role      = p.getString("user_role",       null),
            storeName = p.getString("user_store_name", null),
            storeCode = p.getString("user_store_code", null)
        )
    }

    fun clearSession(context: Context) {
        context.getSharedPreferences("tinda_prefs", Context.MODE_PRIVATE)
            .edit().clear().apply()
        token = null
    }

    fun getBaseUrl() = BASE_URL
}
