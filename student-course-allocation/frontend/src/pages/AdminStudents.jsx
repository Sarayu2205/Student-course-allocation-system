import React, { useState, useEffect } from 'react'
import { adminAPI } from '../utils/api'
import { FiUsers, FiSearch, FiMail } from 'react-icons/fi'

const DEPT_COLORS = ['badge-purple','badge-blue','badge-green','badge-yellow','badge-red','badge-blue']

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminAPI.getStudents().then(r => setStudents(r.data.students || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const depts = [...new Set(students.map(s => s.department))]
  const deptColorMap = Object.fromEntries(depts.map((d, i) => [d, DEPT_COLORS[i % DEPT_COLORS.length]]))

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="min-h-screen bg-app flex items-center justify-center">
      <div className="animate-spin border-4 border-violet-500 border-t-transparent rounded-full w-12 h-12" />
    </div>
  )

  return (
    <div className="min-h-screen bg-app">
      <div className="page animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Registered Students</h1>
          <p className="text-white/40 mt-1">{students.length} students enrolled</p>
        </div>

        {/* Dept summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {depts.map(dept => (
            <div key={dept} className="card-glass p-4 text-center hover:-translate-y-1 transition-transform">
              <p className="text-2xl font-bold text-white">{students.filter(s => s.department === dept).length}</p>
              <p className="text-xs text-white/40 mt-1 leading-tight">{dept}</p>
            </div>
          ))}
        </div>

        <div className="card-glass">
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
              <input className="input pl-10" placeholder="Search by name, email or department..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <span className="text-sm text-white/30 whitespace-nowrap">{filtered.length} results</span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <FiUsers className="text-5xl text-white/10 mx-auto mb-3" />
              <p className="text-white/30 font-medium">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {['#','Student','Email','Department','Role'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3.5 text-white/30 text-sm">{i + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                            <span className="text-white font-bold text-sm">{s.name?.[0]?.toUpperCase()}</span>
                          </div>
                          <span className="font-medium text-white text-sm">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-white/50 text-sm">
                          <FiMail size={12} className="text-white/30" />{s.email}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={deptColorMap[s.department] || 'badge badge-purple'}>{s.department}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={s.role === 'admin' ? 'badge badge-yellow' : 'badge badge-purple'}>{s.role}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

