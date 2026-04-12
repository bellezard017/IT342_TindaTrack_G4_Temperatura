package com.android.tindatrackmobile

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import com.google.gson.Gson
import kotlinx.coroutines.launch

class OwnerRegisterActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_owner_register)

        val btnBack      = findViewById<ImageView>(R.id.btnBack)
        val tilName      = findViewById<TextInputLayout>(R.id.tilName)
        val tilEmail     = findViewById<TextInputLayout>(R.id.tilEmail)
        val tilStoreName = findViewById<TextInputLayout>(R.id.tilStoreName)
        val tilPassword  = findViewById<TextInputLayout>(R.id.tilPassword)
        val tilConfirm   = findViewById<TextInputLayout>(R.id.tilConfirmPassword)
        val etName       = findViewById<TextInputEditText>(R.id.etName)
        val etEmail      = findViewById<TextInputEditText>(R.id.etEmail)
        val etStoreName  = findViewById<TextInputEditText>(R.id.etStoreName)
        val etPassword   = findViewById<TextInputEditText>(R.id.etPassword)
        val etConfirm    = findViewById<TextInputEditText>(R.id.etConfirmPassword)
        val btnCreate    = findViewById<MaterialButton>(R.id.btnCreateStore)
        val btnGoogle    = findViewById<MaterialButton>(R.id.btnGoogle)
        val tvError      = findViewById<TextView>(R.id.tvError)

        btnBack.setOnClickListener { finish() }

        btnCreate.setOnClickListener {
            // Clear all errors
            listOf(tilName, tilEmail, tilStoreName, tilPassword, tilConfirm)
                .forEach { it.error = null }
            tvError.visibility = View.GONE

            val name      = etName.text.toString().trim()
            val email     = etEmail.text.toString().trim()
            val storeName = etStoreName.text.toString().trim()
            val password  = etPassword.text.toString()
            val confirm   = etConfirm.text.toString()

            // Validate
            if (name.isEmpty())      { tilName.error = "Full name is required"; return@setOnClickListener }
            if (email.isEmpty())     { tilEmail.error = "Email is required"; return@setOnClickListener }
            if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                tilEmail.error = "Enter a valid email"; return@setOnClickListener }
            if (storeName.isEmpty()) { tilStoreName.error = "Store name is required"; return@setOnClickListener }
            if (password.length < 8) { tilPassword.error = "Min 8 characters"; return@setOnClickListener }
            if (password != confirm) { tilConfirm.error = "Passwords do not match"; return@setOnClickListener }

            btnCreate.isEnabled = false
            btnCreate.text = "Creating store…"

            lifecycleScope.launch {
                try {
                    // Single /api/auth/register endpoint, role = OWNER
                    val resp = RetrofitClient.api.register(
                        RegisterRequest(
                            name            = name,
                            email           = email,
                            password        = password,
                            confirmPassword = confirm,
                            role            = "OWNER",
                            storeName       = storeName
                        )
                    )
                    if (resp.isSuccessful) {
                        val body = resp.body()!!
                        RetrofitClient.saveToken(this@OwnerRegisterActivity, body.token)
                        RetrofitClient.saveUser(this@OwnerRegisterActivity, body.user)
                        startActivity(
                            Intent(this@OwnerRegisterActivity, MainActivity::class.java)
                                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                        )
                    } else {
                        val errBody = resp.errorBody()?.string()
                        val errMsg = parseError(errBody)
                        tvError.text = errMsg
                        tvError.visibility = View.VISIBLE
                    }
                } catch (e: Exception) {
                    tvError.text = "Network error. Is your backend running?"
                    tvError.visibility = View.VISIBLE
                } finally {
                    btnCreate.isEnabled = true
                    btnCreate.text = getString(R.string.create_store)
                }
            }
        }

        btnGoogle.setOnClickListener {
            val url = "${RetrofitClient.getBaseUrl()}auth/oauth/google/login"
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
        }
    }

    private fun parseError(errBody: String?): String {
        if (errBody.isNullOrEmpty()) return "Registration failed."
        return try {
            val parsed = Gson().fromJson(errBody, ApiError::class.java)
            parsed.error?.message ?: parsed.message ?: "Registration failed."
        } catch (e: Exception) { "Registration failed." }
    }
}
