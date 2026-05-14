package com.android.tindatrackmobile

import android.content.Context
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {

    // Emulator: http://10.0.2.2:8080/api/
    // Real device on the same WiFi: use your PC IPv4 from ipconfig.
    private const val BASE_URL = "http://192.168.1.4:8080/api/"

    private var token: String? = null

    fun setToken(t: String?) {
        token = t
    }

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

    fun saveToken(context: Context, t: String) {
        context.getSharedPreferences("tinda_prefs", Context.MODE_PRIVATE)
            .edit()
            .putString("token", t)
            .apply()
        token = t
    }

    fun loadToken(context: Context): String? {
        val t = context.getSharedPreferences("tinda_prefs", Context.MODE_PRIVATE)
            .getString("token", null)
        token = t
        return t
    }

    fun saveUser(context: Context, user: UserDto) {
        context.getSharedPreferences("tinda_prefs", Context.MODE_PRIVATE)
            .edit()
            .putString("user_name", user.name)
            .putString("user_email", user.email)
            .putString("user_role", user.role)
            .putLong("user_store_id", user.storeId ?: 0L)
            .putString("user_store_name", user.storeName)
            .putString("user_store_code", user.storeCode)
            .putString("user_phone", user.phone)
            .putString("user_address", user.address)
            .putString("user_avatar_url", user.avatarUrl)
            .apply()
    }

    fun loadUser(context: Context): UserDto {
        val prefs = context.getSharedPreferences("tinda_prefs", Context.MODE_PRIVATE)
        return UserDto(
            id = null,
            name = prefs.getString("user_name", null),
            email = prefs.getString("user_email", null),
            role = prefs.getString("user_role", null),
            storeId = prefs.getLong("user_store_id", 0L).takeIf { it != 0L },
            storeName = prefs.getString("user_store_name", null),
            storeCode = prefs.getString("user_store_code", null),
            phone = prefs.getString("user_phone", null),
            address = prefs.getString("user_address", null),
            avatarUrl = prefs.getString("user_avatar_url", null)
        )
    }

    fun clearSession(context: Context) {
        context.getSharedPreferences("tinda_prefs", Context.MODE_PRIVATE)
            .edit()
            .clear()
            .apply()
        token = null
    }

    fun getBaseUrl() = BASE_URL
}
