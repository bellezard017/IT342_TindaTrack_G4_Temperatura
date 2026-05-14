package com.android.tindatrackmobile

import android.content.Intent
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.android.material.button.MaterialButton
import kotlinx.coroutines.launch

class SalesActivity : AppCompatActivity() {

    private lateinit var list: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (RetrofitClient.loadToken(this).isNullOrEmpty()) {
            goToLogin()
            return
        }
        buildUi()
        loadSales()
    }

    private fun buildUi() {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(color(R.color.screen_bg))
        }
        root.addView(titleBar("Sales"))

        val scroll = ScrollView(this).apply { isFillViewport = true }
        list = LinearLayout(this@SalesActivity).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(16), dp(16), dp(90))
        }

        val header = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        header.addView(sectionTitle("Sales Records", "View and manage transactions"), LinearLayout.LayoutParams(0, -2, 1f))
        header.addView(MaterialButton(this).apply {
            text = "Export"
            setOnClickListener { exportSales() }
        })
        list.addView(header)
        scroll.addView(list)
        root.addView(scroll, LinearLayout.LayoutParams(-1, 0, 1f))
        root.addView(navBar("Sales"))
        setContentView(root)
    }

    private fun loadSales() {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.api.getSales()
                if (!response.isSuccessful) {
                    Toast.makeText(this@SalesActivity, "Unable to load sales.", Toast.LENGTH_SHORT).show()
                    return@launch
                }
                val sales = response.body().orEmpty()
                if (sales.isEmpty()) {
                    list.addView(emptyText("No sales yet. Add one from Home."))
                } else {
                    sales.forEach { sale ->
                        list.addView(card("${sale.name ?: "Unnamed item"}\n${sale.category ?: "Uncategorized"}\n${sale.date ?: ""}\nQty: ${sale.quantity ?: 0} x ${money(sale.price)}", money(sale.total)))
                    }
                }
            } catch (_: Exception) {
                Toast.makeText(this@SalesActivity, "Backend is unreachable.", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun exportSales() {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.api.exportSales()
                if (response.isSuccessful) {
                    Toast.makeText(this@SalesActivity, "Export is available from the Store tab.", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this@SalesActivity, "Export failed.", Toast.LENGTH_SHORT).show()
                }
            } catch (_: Exception) {
                Toast.makeText(this@SalesActivity, "Backend is unreachable.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun goToLogin() {
        startActivity(Intent(this, LoginActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK))
    }
}
