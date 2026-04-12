package com.android.tindatrackmobile

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class RecentSalesAdapter(private var items: List<SaleItem>) :
    RecyclerView.Adapter<RecentSalesAdapter.VH>() {

    inner class VH(view: View) : RecyclerView.ViewHolder(view) {
        val tvName  : TextView = view.findViewById(R.id.tvItemName)
        val tvDate  : TextView = view.findViewById(R.id.tvItemDate)
        val tvPrice : TextView = view.findViewById(R.id.tvItemPrice)
        val tvQty   : TextView = view.findViewById(R.id.tvItemQty)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH =
        VH(LayoutInflater.from(parent.context)
            .inflate(R.layout.item_recent_sale, parent, false))

    override fun getItemCount() = items.size

    override fun onBindViewHolder(holder: VH, position: Int) {
        val item = items[position]
        holder.tvName.text  = item.name
        holder.tvDate.text  = item.date
        holder.tvPrice.text = item.price
        holder.tvQty.text   = item.qty

        // Divider: hide for last item
        holder.itemView.findViewById<View?>(R.id.divider)
            ?.visibility = if (position == items.size - 1) View.GONE else View.VISIBLE
    }

    fun update(newItems: List<SaleItem>) {
        items = newItems
        notifyDataSetChanged()
    }
}
