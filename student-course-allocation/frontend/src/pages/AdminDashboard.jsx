import React, { useState, useEffect } from 'react'
import { allocAPI } from '../utils/api'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { FiUsers, FiBook, FiCheckCircle, FiPlay, FiAlertCircle } from 'react-icons/fi'

const COLORS = ['#7c3aed', '#f59e0b', '#ef4444', '#10b981']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 p-3 text-sm" style={{ background: '#1a1535' }}>
      <p className="text-white font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState({ stats: [], unallocated: [], allocations: [], total_students: 0 })
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState(false)
  const semester = 'Fall 2024'

  const loadData = () => {
    setLoading(true)
    allocAPI.reports(semester).then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { loadData() }, [])

  const handleRun = async () => {
    if (!window.confirm(`Run ML allocation for ${semester}? This will overwrite existing results.`)) return
    setRunning(true)
    try {
      const r = await allocAPI.run(semester)
      toast.success(`Done! ${r.data.result.allocations_made} seats filled.`)
      loadData()
    } catch (err) { toast.error(err.message) }
    finally { setRunning(false) }
  }

  const totalAllocated = data.stats.reduce((s, c) => s + (c.allocated || 0), 0)
  const totalCapacity  = data.stats.reduce((s, c) => s + (c.capacity || 0), 0)
  const utilization    = totalCapacity > 0 ? ((totalAllocated / totalCapacity) * 100).toFixed(1) : 0

  const pieData = [
    { name: 'Allocated',   value: totalAllocated },
    { name: 'Waitlisted',  value: data.stats.reduce((s, c) => s + (c.waitlisted || 0), 0) },
    { name: 'Unallocated', value: data.unallocated?.length || 0 },
  ].filter(d => d.value > 0)

  const statCards = [
    { icon: FiUsers,       label: 'Total Students', value: data.total_students, grad: 'from-violet-600 to-indigo-600', glow: 'shadow-violet-500/30' },
    { icon: FiBook,        label: 'Total Courses',  value: data.stats.length,   grad: 'from-pink-600 to-rose-600',    glow: 'shadow-pink-500/30' },
    { icon: FiCheckCircle, label: 'Seats Filled',   value: totalAllocated,      grad: 'from-emerald-600 to-teal-600', glow: 'shadow-emerald-500/30' },
    { icon: FiAlertCircle, label: 'Unallocated',    value: data.unallocated?.length || 0, grad: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/30' },
  ]

  return (
    <div className="min-h-screen bg-app">
      <div className="page animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/40 mt-1">Semester: {semester}</p>
          </div>
          <button onClick={handleRun} disabled={running} className="btn-primary flex items-center gap-2 py-3 px-6">
            {running ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" /> : <FiPlay />}
            {running ? 'Running...' : 'Run ML Allocation'}
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ icon: Icon, label, value, grad, glow }) => (
            <div key={label} className={`stat-card shadow-lg ${glow}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${grad} flex-shrink-0`}>
                <Icon className="text-xl text-white" />
              </div>
              <div>
                <p className="text-xs text-white/40 font-medium">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="card-glass lg:col-span-2">
            <h2 className="text-lg font-bold text-white mb-4">Course Demand vs Capacity</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.stats} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                <Bar dataKey="capacity"  fill="rgba(124,58,237,0.3)" name="Capacity"   radius={[4,4,0,0]} />
                <Bar dataKey="allocated" fill="#7c3aed"               name="Allocated"  radius={[4,4,0,0]} />
                <Bar dataKey="waitlisted" fill="#f59e0b"              name="Waitlisted" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-glass">
            <h2 className="text-lg font-bold text-white mb-4">Allocation Overview</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" outerRadius={85} dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-60 text-white/20 text-sm">
                Run allocation to see data
              </div>
            )}
          </div>
        </div>

        {/* Course stats table */}
        <div className="card-glass mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Course Statistics</h2>
            <span className="text-sm text-white/40">Overall utilization: <span className="text-violet-400 font-semibold">{utilization}%</span></span>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin border-4 border-violet-500 border-t-transparent rounded-full w-8 h-8" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Course','Code','Capacity','Allocated','Waitlisted','Utilization'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.stats.map(s => {
                    const util = s.capacity > 0 ? Math.round((s.allocated / s.capacity) * 100) : 0
                    return (
                      <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3.5 font-medium text-white text-sm">{s.name}</td>
                        <td className="px-4 py-3.5"><span className="badge badge-purple">{s.code}</span></td>
                        <td className="px-4 py-3.5 text-white/60 text-sm">{s.capacity}</td>
                        <td className="px-4 py-3.5"><span className="badge badge-green">{s.allocated || 0}</span></td>
                        <td className="px-4 py-3.5"><span className="badge badge-yellow">{s.waitlisted || 0}</span></td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <div className="progress-bar flex-1">
                              <div className="progress-fill" style={{ width: `${util}%` }} />
                            </div>
                            <span className="text-xs text-white/50 w-9">{util}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {data.stats.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-10 text-white/20">No data yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Unallocated students */}
        {data.unallocated?.length > 0 && (
          <div className="card-glass">
            <h2 className="text-lg font-bold text-white mb-4">
              Unallocated Students <span className="text-red-400">({data.unallocated.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.unallocated.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-red-500/20"
                  style={{ background: 'rgba(239,68,68,0.08)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(239,68,68,0.2)' }}>
                    <span className="text-red-400 font-bold text-sm">{s.name?.[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">{s.name}</p>
                    <p className="text-xs text-white/40">{s.department}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

