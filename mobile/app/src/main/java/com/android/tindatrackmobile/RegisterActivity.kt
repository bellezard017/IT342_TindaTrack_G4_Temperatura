package com.android.tindatrackmobile

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class RegisterActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        // Back to login
        findViewById<android.view.View>(R.id.btnBackToLogin).setOnClickListener {
            finish()
        }

        // Store Owner
        findViewById<android.view.View>(R.id.cardOwner).setOnClickListener {
            startActivity(Intent(this, OwnerRegisterActivity::class.java))
        }

        // Staff Member
        findViewById<android.view.View>(R.id.cardStaff).setOnClickListener {
            startActivity(Intent(this, StaffRegisterActivity::class.java))
        }
    }
}
