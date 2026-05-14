package com.android.tindatrackmobile

import android.content.Intent
import android.os.Bundle
import android.view.Gravity
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.android.material.button.MaterialButton
import kotlinx.coroutines.launch

class ProfileActivity : AppCompatActivity() {

    private lateinit var content: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (RetrofitClient.loadToken(this).isNullOrEmpty()) {
            goToLogin()
            return
        }
        buildUi()
        loadProfile()
    }

    private fun buildUi() {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(color(R.color.screen_bg))
        }
        root.addView(titleBar("Profile"))

        val scroll = ScrollView(this)
        content = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_HORIZONTAL
            setPadding(dp(16), dp(16), dp(16), dp(90))
        }
        content.addView(sectionTitle("Profile", "View and manage your account information"))
        scroll.addView(content)
        root.addView(scroll, LinearLayout.LayoutParams(-1, 0, 1f))
        root.addView(navBar("Profile"))
        setContentView(root)
    }

    private fun loadProfile() {
        lifecycleScope.launch {
            val user = try {
                val response = RetrofitClient.api.getMe()
                response.body()?.also { RetrofitClient.saveUser(this@ProfileActivity, it) }
            } catch (_: Exception) {
                Toast.makeText(this@ProfileActivity, "Showing saved profile. Backend is unreachable.", Toast.LENGTH_SHORT).show()
                null
            } ?: RetrofitClient.loadUser(this@ProfileActivity)

            content.addView(card("${user.name ?: "User"}\n${user.role ?: "Role not set"}", ""))
            content.addView(card("Email", user.email ?: "Not set"))
            content.addView(card("Role", user.role?.lowercase()?.replaceFirstChar { it.uppercase() } ?: "Not set"))
            content.addView(card("Store", user.storeName ?: "Not set"))
            content.addView(card("Phone", user.phone ?: "Not set"))
            content.addView(card("Address", user.address ?: "Not set"))
            content.addView(MaterialButton(this@ProfileActivity).apply {
                text = "Logout"
                setOnClickListener {
                    RetrofitClient.clearSession(this@ProfileActivity)
                    goToLogin()
                }
            })
        }
    }

    private fun goToLogin() {
        startActivity(Intent(this, LoginActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK))
    }
}
