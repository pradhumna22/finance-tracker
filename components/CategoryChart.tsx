'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899']

export default function CategoryChart({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) return <div className="text-center text-gray-500 py-8">No expense data this month</div>

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v: unknown) => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '₹0'} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
