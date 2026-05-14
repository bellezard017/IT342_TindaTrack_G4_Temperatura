package com.android.tindatrackmobile.ui

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.util.AttributeSet
import android.view.View
import kotlin.math.max

class SimpleLineChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    var dataPoints: List<Float> = emptyList()
        set(value) {
            field = value
            invalidate()
        }

    var labels: List<String> = emptyList()
        set(value) {
            field = value
            invalidate()
        }

    private val gridPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.rgb(235, 238, 242)
        strokeWidth = 1f
    }

    private val linePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.rgb(231, 119, 95)
        strokeWidth = 5f
        style = Paint.Style.STROKE
    }

    private val pointPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.rgb(231, 119, 95)
        style = Paint.Style.FILL
    }

    private val labelPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.rgb(102, 112, 133)
        textSize = 22f
        textAlign = Paint.Align.CENTER
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val left = 42f
        val top = 16f
        val right = width - 10f
        val bottom = height - 34f
        val chartWidth = right - left
        val chartHeight = bottom - top

        for (i in 0..4) {
            val y = top + chartHeight / 4f * i
            canvas.drawLine(left, y, right, y, gridPaint)
        }

        val points = if (dataPoints.isEmpty()) List(7) { 0f } else dataPoints
        val maxValue = max(1f, points.maxOrNull() ?: 1f)
        val step = if (points.size <= 1) chartWidth else chartWidth / (points.size - 1)
        val path = Path()

        points.forEachIndexed { index, value ->
            val x = left + step * index
            val y = bottom - (value / maxValue) * chartHeight
            if (index == 0) path.moveTo(x, y) else path.lineTo(x, y)
            canvas.drawCircle(x, y, 5f, pointPaint)
            labels.getOrNull(index)?.let { canvas.drawText(it.takeLast(5), x, height - 8f, labelPaint) }
        }

        canvas.drawPath(path, linePaint)
    }
}
