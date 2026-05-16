package com.android.tindatrackmobile

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object OfflineStore {
    private const val PREFS = "tinda_offline_prefs"
    private const val KEY_SALES = "sales"
    private const val KEY_ACTIVITIES = "activities"
    private const val OFFLINE_TOKEN = "offline-token"
    private val gson = Gson()

    fun createOwnerSession(context: Context, name: String, email: String, storeName: String) {
        val storeCode = storeName
            .filter { it.isLetterOrDigit() }
            .take(4)
            .uppercase()
            .padEnd(4, 'X') + "01"
        val user = UserDto(
            id = 1L,
            name = name,
            email = email,
            role = "OWNER",
            storeId = 1L,
            storeName = storeName,
            storeCode = storeCode
        )
        RetrofitClient.saveToken(context, OFFLINE_TOKEN)
        RetrofitClient.saveUser(context, user)
        addActivity(context, "STORE", "Created store $storeName", user.name, null)
    }

    fun createStaffSession(context: Context, name: String, email: String, storeCode: String) {
        val user = UserDto(
            id = 2L,
            name = name,
            email = email,
            role = "STAFF",
            storeId = 1L,
            storeName = "Offline Store",
            storeCode = storeCode
        )
        RetrofitClient.saveToken(context, OFFLINE_TOKEN)
        RetrofitClient.saveUser(context, user)
        addActivity(context, "STAFF", "Joined store $storeCode", user.name, null)
    }

    fun createLoginSession(context: Context, email: String) {
        val savedUser = RetrofitClient.loadUser(context)
        val user = if (!savedUser.email.isNullOrBlank()) {
            savedUser
        } else {
            val name = email.substringBefore("@").replaceFirstChar {
                if (it.isLowerCase()) it.titlecase(Locale.getDefault()) else it.toString()
            }
            UserDto(
                id = 1L,
                name = name,
                email = email,
                role = "OWNER",
                storeId = 1L,
                storeName = "Offline Store",
                storeCode = "OFFL01"
            )
        }
        RetrofitClient.saveToken(context, OFFLINE_TOKEN)
        RetrofitClient.saveUser(context, user)
    }

    fun setupStore(context: Context, user: UserDto, value: String): UserDto {
        val updated = if (user.role.equals("OWNER", true)) {
            user.copy(storeId = user.storeId ?: 1L, storeName = value, storeCode = user.storeCode ?: "OFFL01")
        } else {
            user.copy(storeId = user.storeId ?: 1L, storeName = user.storeName ?: "Offline Store", storeCode = value)
        }
        RetrofitClient.saveUser(context, updated)
        addActivity(context, "STORE", "Updated store setup", updated.name, null)
        return updated
    }

    fun addSale(context: Context, request: SaleRequest): SaleResponse {
        val sales = getSales(context).toMutableList()
        val sale = SaleResponse(
            id = (sales.maxOfOrNull { it.id ?: 0L } ?: 0L) + 1L,
            date = SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH).format(Date()),
            name = request.name,
            category = request.category,
            quantity = request.quantity,
            price = request.price,
            total = request.quantity * request.price,
            createdBy = RetrofitClient.loadUser(context).name ?: "Offline user"
        )
        sales.add(0, sale)
        saveSales(context, sales)
        addActivity(context, "SALE", "Recorded sale: ${request.name}", sale.createdBy, sale.total)
        return sale
    }

    fun getSales(context: Context): List<SaleResponse> {
        val json = prefs(context).getString(KEY_SALES, null) ?: return emptyList()
        val type = object : TypeToken<List<SaleResponse>>() {}.type
        return runCatching { gson.fromJson<List<SaleResponse>>(json, type) }.getOrDefault(emptyList())
    }

    fun getDashboard(context: Context): DashboardResponse {
        val sales = getSales(context)
        val total = sales.sumOf { it.total ?: ((it.quantity ?: 0) * (it.price ?: 0.0)) }
        val itemsSold = sales.sumOf { it.quantity ?: 0 }
        val topItems = sales
            .groupBy { it.name ?: "Unnamed item" }
            .map { (name, rows) ->
                val sold = rows.sumOf { it.quantity ?: 0 }
                val amount = rows.sumOf { it.total ?: ((it.quantity ?: 0) * (it.price ?: 0.0)) }
                name to (sold to amount)
            }
            .sortedByDescending { it.second.second }
            .take(5)
            .mapIndexed { index, item ->
                TopItemResponse(index + 1, item.first, item.second.first, item.second.second)
            }
        val chartData = sales
            .groupBy { it.date ?: "" }
            .toSortedMap()
            .map { (date, rows) -> ChartDataPoint(date, rows.sumOf { it.total ?: 0.0 }) }

        return DashboardResponse(total, sales.size, itemsSold, sales.take(5), topItems, chartData)
    }

    fun getTeam(context: Context): List<UserDto> = listOf(RetrofitClient.loadUser(context))

    fun getActivity(context: Context): List<ActivityLogDto> {
        val json = prefs(context).getString(KEY_ACTIVITIES, null) ?: return emptyList()
        val type = object : TypeToken<List<ActivityLogDto>>() {}.type
        return runCatching { gson.fromJson<List<ActivityLogDto>>(json, type) }.getOrDefault(emptyList())
    }

    fun exportSalesCsv(context: Context): ByteArray {
        val header = "Date,Name,Category,Quantity,Price,Total,Created By"
        val rows = getSales(context).map {
            listOf(
                it.date.orEmpty(),
                it.name.orEmpty(),
                it.category.orEmpty(),
                (it.quantity ?: 0).toString(),
                (it.price ?: 0.0).toString(),
                (it.total ?: 0.0).toString(),
                it.createdBy.orEmpty()
            ).joinToString(",") { value -> "\"${value.replace("\"", "\"\"")}\"" }
        }
        return (listOf(header) + rows).joinToString("\n").toByteArray()
    }

    private fun saveSales(context: Context, sales: List<SaleResponse>) {
        prefs(context).edit().putString(KEY_SALES, gson.toJson(sales)).apply()
    }

    private fun addActivity(context: Context, type: String, label: String, userName: String?, amount: Double?) {
        val activities = getActivity(context).toMutableList()
        activities.add(
            0,
            ActivityLogDto(
                id = (activities.maxOfOrNull { it.id ?: 0L } ?: 0L) + 1L,
                storeId = RetrofitClient.loadUser(context).storeId ?: 1L,
                type = type,
                label = label,
                userId = null,
                userName = userName ?: "Offline user",
                amount = amount,
                createdAt = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.ENGLISH).format(Date())
            )
        )
        prefs(context).edit().putString(KEY_ACTIVITIES, gson.toJson(activities)).apply()
    }

    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
}
