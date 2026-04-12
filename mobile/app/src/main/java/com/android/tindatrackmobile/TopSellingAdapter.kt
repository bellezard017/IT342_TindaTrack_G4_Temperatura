package com.android.tindatrackmobile

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class TopSellingAdapter(private var items: List<TopSellingItem>) :
    RecyclerView.Adapter<TopSellingAdapter.VH>() {

    inner class VH(view: View) : RecyclerView.ViewHolder(view) {
        val tvRank    : TextView = view.findViewById(R.id.tvRank)
        val tvName    : TextView = view.findViewById(R.id.tvItemName)
        val tvUnits   : TextView = view.findViewById(R.id.tvUnits)
        val tvRevenue : TextView = view.findViewById(R.id.tvRevenue)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH =
        VH(LayoutInflater.from(parent.context)
            .inflate(R.layout.item_top_selling, parent, false))

    override fun getItemCount() = items.size

    override fun onBindViewHolder(holder: VH, position: Int) {
        val item = items[position]
        holder.tvRank.text    = item.rank.toString()
        holder.tvName.text    = item.name
        holder.tvUnits.text   = item.units
        holder.tvRevenue.text = item.revenue
    }

    fun update(newItems: List<TopSellingItem>) {
        items = newItems
        notifyDataSetChanged()
    }
}
