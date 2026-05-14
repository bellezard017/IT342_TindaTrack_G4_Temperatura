package com.android.tindatrackmobile

import java.text.NumberFormat
import java.util.Locale

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val confirmPassword: String,
    val role: String,
    val storeName: String? = null,
    val storeCode: String? = null
)

data class AuthResponse(
    val token: String,
    val user: UserDto
)

data class UserDto(
    val id: Long?,
    val name: String?,
    val email: String?,
    val role: String?,
    val storeId: Long?,
    val storeName: String?,
    val storeCode: String?,
    val phone: String? = null,
    val address: String? = null,
    val avatarUrl: String? = null,
    val googleId: String? = null,
    val isOAuthUser: Boolean? = null
)

data class ApiError(
    val error: ApiErrorDetail?,
    val message: String?
)

data class ApiErrorDetail(
    val message: String?
)

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

data class DashboardResponse(
    val totalDailySales: Double?,
    val transactionCount: Int?,
    val itemsSold: Int?,
    val recentSales: List<SaleResponse>?,
    val topItems: List<TopItemResponse>?,
    val chartData: List<ChartDataPoint>?
)

data class SaleRequest(
    val name: String,
    val category: String,
    val quantity: Int,
    val price: Double
)

data class SaleResponse(
    val id: Long?,
    val date: String?,
    val name: String?,
    val category: String?,
    val quantity: Int?,
    val price: Double?,
    val total: Double?,
    val createdBy: String?
)

data class TopItemResponse(
    val rank: Int?,
    val name: String?,
    val sold: Int?,
    val amount: Double?
)

data class ChartDataPoint(
    val date: String?,
    val revenue: Double?
)

data class StoreSetupRequest(val storeName: String)
data class StoreJoinRequest(val storeCode: String)

data class ActivityLogDto(
    val id: Long?,
    val storeId: Long?,
    val type: String?,
    val label: String?,
    val userId: String?,
    val userName: String?,
    val amount: Double?,
    val createdAt: String?
)

fun money(value: Double?): String {
    val formatter = NumberFormat.getCurrencyInstance(Locale("en", "PH"))
    return formatter.format(value ?: 0.0)
}

fun SaleResponse.toSaleItem(): SaleItem =
    SaleItem(
        name = name ?: "Unnamed item",
        date = date ?: "",
        price = money(total),
        qty = "Qty: ${quantity ?: 0}"
    )

fun TopItemResponse.toTopSellingItem(): TopSellingItem =
    TopSellingItem(
        rank = rank ?: 0,
        name = name ?: "Unnamed item",
        units = "${sold ?: 0} units sold",
        revenue = money(amount)
    )
