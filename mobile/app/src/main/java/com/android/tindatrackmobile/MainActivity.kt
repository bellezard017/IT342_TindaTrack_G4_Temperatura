package com.android.tindatrackmobile

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.android.tindatrackmobile.ui.SimpleLineChartView
import com.google.android.material.button.MaterialButton
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private lateinit var tvDate: TextView
    private lateinit var tvTodaySales: TextView
    private lateinit var tvTransactions: TextView
    private lateinit var tvItemsSold: TextView
    private lateinit var lineChart: SimpleLineChartView
    private lateinit var rvRecentSales: RecyclerView
    private lateinit var rvTopSelling: RecyclerView
    private lateinit var salesAdapter: RecentSalesAdapter
    private lateinit var topAdapter: TopSellingAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (RetrofitClient.loadToken(this).isNullOrEmpty()) {
            goToLogin()
            return
        }

        setContentView(R.layout.activity_main)
        bindViews()
        setupRecyclers()
        populateDate()
        loadProfileThenDashboard()
    }

    private fun bindViews() {
        tvDate = findViewById(R.id.tvDate)
        tvTodaySales = findViewById(R.id.tvTodaySales)
        tvTransactions = findViewById(R.id.tvTransactions)
        tvItemsSold = findViewById(R.id.tvItemsSold)
        lineChart = findViewById(R.id.lineChart)
        rvRecentSales = findViewById(R.id.rvRecentSales)
        rvTopSelling = findViewById(R.id.rvTopSelling)

        findViewById<MaterialButton>(R.id.btnAddSale).setOnClickListener { showAddSaleDialog() }
        findViewById<View>(R.id.navHome).setOnClickListener { loadDashboard() }
        findViewById<View>(R.id.navSales).setOnClickListener { startActivity(Intent(this, SalesActivity::class.java)) }
        findViewById<View>(R.id.navStore).setOnClickListener { startActivity(Intent(this, StoreActivity::class.java)) }
        findViewById<View>(R.id.navProfile).setOnClickListener { startActivity(Intent(this, ProfileActivity::class.java)) }
    }

    private fun setupRecyclers() {
        salesAdapter = RecentSalesAdapter(emptyList())
        rvRecentSales.layoutManager = LinearLayoutManager(this)
        rvRecentSales.adapter = salesAdapter
        rvRecentSales.isNestedScrollingEnabled = false

        topAdapter = TopSellingAdapter(emptyList())
        rvTopSelling.layoutManager = LinearLayoutManager(this)
        rvTopSelling.adapter = topAdapter
        rvTopSelling.isNestedScrollingEnabled = false
    }

    private fun populateDate() {
        tvDate.text = SimpleDateFormat("EEEE, MMMM d, yyyy", Locale.ENGLISH).format(Date())
    }

    private fun loadProfileThenDashboard() {
        lifecycleScope.launch {
            try {
                val me = RetrofitClient.api.getMe()
                if (me.code() == 401 || me.code() == 403) {
                    RetrofitClient.clearSession(this@MainActivity)
                    goToLogin()
                    return@launch
                }
                me.body()?.let {
                    RetrofitClient.saveUser(this@MainActivity, it)
                    if (it.storeId == null) {
                        promptStoreSetup(it)
                        return@launch
                    }
                }
            } catch (_: Exception) {
                val saved = RetrofitClient.loadUser(this@MainActivity)
                if (saved.storeId == null && !saved.role.isNullOrBlank()) {
                    promptStoreSetup(saved)
                    return@launch
                }
            }
            loadDashboard()
        }
    }

    private fun promptStoreSetup(user: UserDto) {
        val input = EditText(this).apply {
            hint = if (user.role.equals("OWNER", true)) "Store name" else "Store code"
            setSingleLine(true)
        }
        AlertDialog.Builder(this)
            .setTitle(if (user.role.equals("OWNER", true)) "Create Your Store" else "Join a Store")
            .setMessage(
                if (user.role.equals("OWNER", true)) {
                    "Add your store name first so this account can open the correct dashboard."
                } else {
                    "Enter the store code first so this account can open the correct dashboard."
                }
            )
            .setView(input)
            .setCancelable(false)
            .setPositiveButton("Continue", null)
            .setNegativeButton("Logout") { _, _ ->
                RetrofitClient.clearSession(this)
                goToLogin()
            }
            .create()
            .apply {
                setOnShowListener {
                    getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
                        val value = input.text.toString().trim()
                        if (value.isBlank()) {
                            input.error = "Required"
                            return@setOnClickListener
                        }
                        setupStoreForUser(user, value)
                        dismiss()
                    }
                }
            }
            .show()
    }

    private fun setupStoreForUser(user: UserDto, value: String) {
        lifecycleScope.launch {
            try {
                val response = if (user.role.equals("OWNER", true)) {
                    RetrofitClient.api.setupStore(StoreSetupRequest(value))
                } else {
                    RetrofitClient.api.joinStore(StoreJoinRequest(value.uppercase()))
                }
                val updated = response.body()
                if (response.isSuccessful && updated != null) {
                    RetrofitClient.saveUser(this@MainActivity, updated)
                    loadDashboard()
                } else {
                    Toast.makeText(this@MainActivity, "Could not finish store setup.", Toast.LENGTH_SHORT).show()
                    promptStoreSetup(user)
                }
            } catch (_: Exception) {
                val updated = OfflineStore.setupStore(this@MainActivity, user, value)
                RetrofitClient.saveUser(this@MainActivity, updated)
                Toast.makeText(this@MainActivity, "Saved store setup offline.", Toast.LENGTH_SHORT).show()
                loadDashboard()
            }
        }
    }

    private fun loadDashboard() {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.api.getDashboard()
                if (response.code() == 401 || response.code() == 403) {
                    RetrofitClient.clearSession(this@MainActivity)
                    goToLogin()
                    return@launch
                }
                val dashboard = response.body()
                if (response.isSuccessful && dashboard != null) {
                    tvTodaySales.text = money(dashboard.totalDailySales)
                    tvTransactions.text = (dashboard.transactionCount ?: 0).toString()
                    tvItemsSold.text = (dashboard.itemsSold ?: 0).toString()
                    salesAdapter.update(dashboard.recentSales.orEmpty().map { it.toSaleItem() })
                    topAdapter.update(dashboard.topItems.orEmpty().map { it.toTopSellingItem() })
                    lineChart.dataPoints = dashboard.chartData.orEmpty().map { (it.revenue ?: 0.0).toFloat() }
                    lineChart.labels = dashboard.chartData.orEmpty().map { it.date.orEmpty() }
                } else {
                    Toast.makeText(this@MainActivity, "Unable to load dashboard.", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                val dashboard = OfflineStore.getDashboard(this@MainActivity)
                tvTodaySales.text = money(dashboard.totalDailySales)
                tvTransactions.text = (dashboard.transactionCount ?: 0).toString()
                tvItemsSold.text = (dashboard.itemsSold ?: 0).toString()
                salesAdapter.update(dashboard.recentSales.orEmpty().map { it.toSaleItem() })
                topAdapter.update(dashboard.topItems.orEmpty().map { it.toTopSellingItem() })
                lineChart.dataPoints = dashboard.chartData.orEmpty().map { (it.revenue ?: 0.0).toFloat() }
                lineChart.labels = dashboard.chartData.orEmpty().map { it.date.orEmpty() }
                Toast.makeText(this@MainActivity, "Showing offline dashboard.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun showAddSaleDialog() {
        val form = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 16, 48, 0)
        }
        val name = EditText(this).apply { hint = "Item name" }
        val category = EditText(this).apply { hint = "Category" }
        val quantity = EditText(this).apply {
            hint = "Quantity"
            inputType = android.text.InputType.TYPE_CLASS_NUMBER
        }
        val price = EditText(this).apply {
            hint = "Price"
            inputType = android.text.InputType.TYPE_CLASS_NUMBER or android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL
        }
        listOf(name, category, quantity, price).forEach { form.addView(it) }

        AlertDialog.Builder(this)
            .setTitle("Add Sale")
            .setView(form)
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Save", null)
            .create()
            .apply {
                setOnShowListener {
                    getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
                        val request = SaleRequest(
                            name = name.text.toString().trim(),
                            category = category.text.toString().trim(),
                            quantity = quantity.text.toString().toIntOrNull() ?: 0,
                            price = price.text.toString().toDoubleOrNull() ?: 0.0
                        )
                        if (request.name.isBlank() || request.category.isBlank() || request.quantity < 1 || request.price <= 0.0) {
                            Toast.makeText(this@MainActivity, "Complete all sale fields.", Toast.LENGTH_SHORT).show()
                            return@setOnClickListener
                        }
                        saveSale(request)
                        dismiss()
                    }
                }
            }
            .show()
    }

    private fun saveSale(request: SaleRequest) {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.api.createSale(request)
                if (response.isSuccessful) {
                    Toast.makeText(this@MainActivity, "Sale recorded.", Toast.LENGTH_SHORT).show()
                    loadDashboard()
                } else {
                    Toast.makeText(this@MainActivity, "Could not save sale.", Toast.LENGTH_SHORT).show()
                }
            } catch (_: Exception) {
                OfflineStore.addSale(this@MainActivity, request)
                Toast.makeText(this@MainActivity, "Sale recorded offline.", Toast.LENGTH_SHORT).show()
                loadDashboard()
            }
        }
    }

    private fun goToLogin() {
        startActivity(
            Intent(this, LoginActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
        )
    }
}
