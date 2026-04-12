package com.android.tindatrackmobile

import android.content.Intent
import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.android.tindatrackmobile.ui.SimpleLineChartView
import com.google.android.material.button.MaterialButton
import java.text.SimpleDateFormat
import java.util.*

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

        // Guard: must be logged in
        if (RetrofitClient.loadToken(this).isNullOrEmpty()) {
            startActivity(Intent(this, LoginActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK))
            return
        }

        setContentView(R.layout.activity_main)

        bindViews()
        setupRecyclers()
        populateDate()
        populateDemoData()
    }

    private fun bindViews() {
        tvDate         = findViewById(R.id.tvDate)
        tvTodaySales   = findViewById(R.id.tvTodaySales)
        tvTransactions = findViewById(R.id.tvTransactions)
        tvItemsSold    = findViewById(R.id.tvItemsSold)
        lineChart      = findViewById(R.id.lineChart)
        rvRecentSales  = findViewById(R.id.rvRecentSales)
        rvTopSelling   = findViewById(R.id.rvTopSelling)

        // + Sale button (hook up to your sale flow)
        findViewById<MaterialButton>(R.id.btnAddSale).setOnClickListener {
            // TODO: open AddSaleActivity
        }
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
        val sdf = SimpleDateFormat("EEEE, MMMM d, yyyy", Locale.ENGLISH)
        tvDate.text = sdf.format(Date())
    }

    /**
     * Populate with demo / placeholder data matching the Figma screenshots.
     * Replace these with real API calls to your backend.
     */
    private fun populateDemoData() {
        // Stats
        tvTodaySales.text   = "₱0.00"
        tvTransactions.text = "0"
        tvItemsSold.text    = "0"

        // Chart — 7-day revenue (all zeros = flat line like in Figma)
        lineChart.dataPoints = listOf(0f, 0f, 0f, 0f, 0f, 0f, 0f)
        lineChart.labels     = listOf("Apr 06","Apr 07","Apr 08","Apr 09","Apr 10","Apr 11","Apr 12")

        // Recent Sales
        salesAdapter.update(listOf(
            SaleItem("Coca-Cola 1.5L",        "Feb 28, 2026 10:30 AM", "₱325.00", "Qty: 5"),
            SaleItem("Lucky Me Pancit Canton", "Feb 28, 2026 11:15 AM", "₱150.00", "Qty: 10"),
            SaleItem("Marlboro Red",           "Feb 28, 2026 12:00 PM", "₱450.00", "Qty: 3"),
            SaleItem("Century Tuna",           "Feb 28, 2026 1:20 PM",  "₱360.00", "Qty: 8"),
            SaleItem("Alaska Condensada",      "Feb 27, 2026 9:45 AM",  "₱220.00", "Qty: 4")
        ))

        // Top Selling
        topAdapter.update(listOf(
            TopSellingItem(1, "Marlboro Red",        "3 units sold",  "₱450.00"),
            TopSellingItem(2, "Century Tuna",        "8 units sold",  "₱360.00"),
            TopSellingItem(3, "Coca-Cola 1.5L",      "5 units sold",  "₱325.00"),
            TopSellingItem(4, "Alaska Condensada",   "4 units sold",  "₱220.00"),
            TopSellingItem(5, "Lucky Me Pancit Canton","10 units sold","₱150.00")
        ))
    }
}
