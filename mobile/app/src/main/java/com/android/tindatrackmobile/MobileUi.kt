package com.android.tindatrackmobile

import android.app.Activity
import android.content.Intent
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import android.widget.ImageView
import android.widget.TextView
import androidx.core.content.ContextCompat

fun Activity.dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

fun Activity.color(id: Int): Int = ContextCompat.getColor(this, id)

fun Activity.titleBar(title: String): View =
    TextView(this).apply {
        text = title
        textSize = 18f
        setTypeface(typeface, android.graphics.Typeface.BOLD)
        gravity = Gravity.CENTER
        setTextColor(color(R.color.text_primary))
        setBackgroundColor(color(R.color.white))
        setPadding(0, dp(16), 0, dp(16))
        elevation = dp(2).toFloat()
    }

fun Activity.sectionTitle(title: String, subtitle: String): LinearLayout =
    LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL
        setPadding(0, 0, 0, dp(12))
        addView(TextView(context).apply {
            text = title
            textSize = 20f
            setTypeface(typeface, android.graphics.Typeface.BOLD)
            setTextColor(color(R.color.text_primary))
        })
        addView(TextView(context).apply {
            text = subtitle
            textSize = 13f
            setTextColor(color(R.color.text_secondary))
        })
    }

fun Activity.card(body: String, trailing: String): LinearLayout =
    LinearLayout(this).apply {
        orientation = LinearLayout.HORIZONTAL
        gravity = Gravity.CENTER_VERTICAL
        setBackgroundColor(color(R.color.white))
        setPadding(dp(16), dp(14), dp(16), dp(14))
        val params = LinearLayout.LayoutParams(-1, -2)
        params.setMargins(0, 0, 0, dp(12))
        layoutParams = params
        addView(TextView(context).apply {
            text = body
            textSize = 15f
            setTextColor(color(R.color.text_primary))
        }, LinearLayout.LayoutParams(0, -2, 1f))
        if (trailing.isNotBlank()) {
            addView(TextView(context).apply {
                text = trailing
                textSize = 16f
                setTypeface(typeface, android.graphics.Typeface.BOLD)
                setTextColor(color(R.color.coral))
            })
        }
    }

fun Activity.emptyText(message: String): TextView =
    TextView(this).apply {
        text = message
        textSize = 14f
        setTextColor(color(R.color.text_secondary))
        setPadding(0, dp(16), 0, dp(16))
    }

fun Activity.navBar(active: String): LinearLayout =
    LinearLayout(this).apply {
        orientation = LinearLayout.HORIZONTAL
        setBackgroundColor(color(R.color.white))
        elevation = dp(8).toFloat()
        listOf(
            NavItem("Home", R.drawable.ic_nav_home, MainActivity::class.java),
            NavItem("Sales", R.drawable.ic_nav_sales, SalesActivity::class.java),
            NavItem("Store", R.drawable.ic_nav_store, StoreActivity::class.java),
            NavItem("Profile", R.drawable.ic_nav_profile, ProfileActivity::class.java)
        ).forEach { item ->
            val isActive = item.label == active
            addView(LinearLayout(context).apply {
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.CENTER
                setOnClickListener {
                    if (!isActive) {
                        startActivity(Intent(this@navBar, item.target))
                    }
                }
                addView(ImageView(context).apply {
                    setImageResource(item.icon)
                    setColorFilter(color(if (isActive) R.color.coral else R.color.nav_unselected))
                }, LinearLayout.LayoutParams(dp(24), dp(24)))
                addView(TextView(context).apply {
                    text = item.label
                    gravity = Gravity.CENTER
                    textSize = 11f
                    setTextColor(color(if (isActive) R.color.coral else R.color.nav_unselected))
                    setTypeface(typeface, if (isActive) android.graphics.Typeface.BOLD else android.graphics.Typeface.NORMAL)
                    setPadding(0, dp(4), 0, 0)
                })
            }, LinearLayout.LayoutParams(0, dp(70), 1f))
        }
    }

private data class NavItem(
    val label: String,
    val icon: Int,
    val target: Class<out Activity>
)
