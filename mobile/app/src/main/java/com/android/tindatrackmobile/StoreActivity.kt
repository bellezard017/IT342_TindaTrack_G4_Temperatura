package com.android.tindatrackmobile

import android.content.Intent
import android.os.Bundle
import android.os.Environment
import android.view.Gravity
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.android.material.button.MaterialButton
import kotlinx.coroutines.launch
import java.io.File

class StoreActivity : AppCompatActivity() {

    private lateinit var content: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (RetrofitClient.loadToken(this).isNullOrEmpty()) {
            goToLogin()
            return
        }
        buildUi()
        loadStore()
    }

    private fun buildUi() {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(color(R.color.screen_bg))
        }
        root.addView(titleBar("Store"))

        val scroll = ScrollView(this)
        content = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(16), dp(16), dp(90))
        }
        val header = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        header.addView(sectionTitle("Store Management", "Manage your store settings and staff"), LinearLayout.LayoutParams(0, -2, 1f))
        header.addView(MaterialButton(this).apply {
            text = "Export"
            setOnClickListener { exportSalesCsv() }
        })
        content.addView(header)
        scroll.addView(content)
        root.addView(scroll, LinearLayout.LayoutParams(-1, 0, 1f))
        root.addView(navBar("Store"))
        setContentView(root)
    }

    private fun loadStore() {
        lifecycleScope.launch {
            try {
                val userResponse = RetrofitClient.api.getMe()
                val teamResponse = RetrofitClient.api.getStoreTeam()
                val activityResponse = RetrofitClient.api.getStoreActivity()
                val user = userResponse.body() ?: RetrofitClient.loadUser(this@StoreActivity)
                RetrofitClient.saveUser(this@StoreActivity, user)
                val team = teamResponse.body().orEmpty()
                val activity = activityResponse.body().orEmpty()

                content.addView(card("Store Information\nStore Name\n${user.storeName ?: "Not set"}\nStore Code\n${user.storeCode ?: "Not set"}\nOwner\n${team.firstOrNull { it.role.equals("OWNER", true) }?.name ?: user.name.orEmpty()}", ""))
                content.addView(card("Staff Members", "${team.count { it.role.equals("STAFF", true) }} staff"))
                content.addView(card("Total Members", team.size.toString()))
                content.addView(sectionTitle("Activity History", "All store activity from Supabase/backend"))

                if (activity.isEmpty()) {
                    content.addView(emptyText("No activity yet."))
                } else {
                    activity.forEach {
                        content.addView(card("${it.label ?: "Activity"}\nBy: ${it.userName ?: "Unknown"}\n${it.createdAt ?: ""}", it.type ?: ""))
                    }
                }
            } catch (_: Exception) {
                Toast.makeText(this@StoreActivity, "Backend is unreachable.", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun exportSalesCsv() {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.api.exportSales()
                val body = response.body()
                if (!response.isSuccessful || body == null) {
                    Toast.makeText(this@StoreActivity, "Export failed.", Toast.LENGTH_SHORT).show()
                    return@launch
                }
                val dir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS) ?: filesDir
                val file = File(dir, "tindatrack-sales.csv")
                file.writeBytes(body.bytes())
                Toast.makeText(this@StoreActivity, "Export saved: ${file.name}", Toast.LENGTH_LONG).show()
            } catch (_: Exception) {
                Toast.makeText(this@StoreActivity, "Backend is unreachable.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun goToLogin() {
        startActivity(Intent(this, LoginActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK))
    }
}
