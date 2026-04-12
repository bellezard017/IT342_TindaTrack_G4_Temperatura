package com.android.tindatrackmobile

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import com.google.gson.Gson
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var tilEmail: TextInputLayout
    private lateinit var tilPassword: TextInputLayout
    private lateinit var etEmail: TextInputEditText
    private lateinit var etPassword: TextInputEditText
    private lateinit var btnLogin: MaterialButton
    private lateinit var btnGoogle: MaterialButton
    private lateinit var tvError: TextView
    private lateinit var tvRegister: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Already logged in? Skip straight to home
        if (!RetrofitClient.loadToken(this).isNullOrEmpty()) {
            goToMain(); return
        }

        setContentView(R.layout.activity_login)

        tilEmail    = findViewById(R.id.tilEmail)
        tilPassword = findViewById(R.id.tilPassword)
        etEmail     = findViewById(R.id.etEmail)
        etPassword  = findViewById(R.id.etPassword)
        btnLogin    = findViewById(R.id.btnLogin)
        btnGoogle   = findViewById(R.id.btnGoogle)
        tvError     = findViewById(R.id.tvError)
        tvRegister  = findViewById(R.id.tvRegister)

        btnLogin.setOnClickListener { doLogin() }

        tvRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        btnGoogle.setOnClickListener {
            val url = "${RetrofitClient.getBaseUrl()}auth/oauth/google/login"
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
        }
    }

    private fun doLogin() {
        val email    = etEmail.text.toString().trim()
        val password = etPassword.text.toString()

        tilEmail.error    = null
        tilPassword.error = null
        tvError.visibility = View.GONE

        if (email.isEmpty()) { tilEmail.error = "Email is required"; return }
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            tilEmail.error = "Enter a valid email"; return
        }
        if (password.isEmpty()) { tilPassword.error = "Password is required"; return }

        setLoading(true)

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.api.login(LoginRequest(email, password))
                if (response.isSuccessful) {
                    val body = response.body()!!
                    RetrofitClient.saveToken(this@LoginActivity, body.token)
                    RetrofitClient.saveUser(this@LoginActivity, body.user)
                    goToMain()
                } else {
                    val errJson = response.errorBody()?.string()
                    val errMsg = try {
                        Gson().fromJson(errJson, ApiError::class.java)
                            ?.error?.message ?: "Login failed. Check your credentials."
                    } catch (e: Exception) { "Login failed. Check your credentials." }
                    showError(errMsg)
                }
            } catch (e: Exception) {
                showError("Network error. Please check your connection.")
            } finally {
                setLoading(false)
            }
        }
    }

    private fun showError(msg: String) {
        tvError.text = msg
        tvError.visibility = View.VISIBLE
    }

    private fun setLoading(loading: Boolean) {
        btnLogin.isEnabled = !loading
        btnLogin.text = if (loading) "Signing in…" else getString(R.string.login)
    }

    private fun goToMain() {
        startActivity(Intent(this, MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK))
    }
}
