import React, { useState, useEffect } from 'react'
import { coursesAPI } from '../utils/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiBook } from 'react-icons/fi'

const DEPTS = ['Computer Science','Information Technology','Electronics','Mechanical','Civil','Business Administration','Mathematics','Physics']
const EMPTY = { name:'', code:'', department:'Computer Science', capacity:30, credits:3, prerequisite_id:'', time_slot:'', description:'' }

const CourseModal = ({ course, courses, onSave, onClose }) => {
  const [form, setForm] = useState(course ? {
    name: course.name, code: course.code, department: course.department,
    capacity: course.capacity, credits: course.credits,
    prerequisite_id: course.prerequisite_id || '', time_slot: course.time_slot || '', description: course.description || ''
  } : EMPTY)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, prerequisite_id: form.prerequisite_id || null }
      if (course?.id) { await coursesAPI.update(course.id, payload); toast.success('Course updated!') }
      else { await coursesAPI.create(payload); toast.success('Course created!') }
      onSave()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">{course?.id ? 'Edit Course' : 'Add New Course'}</h2>
            <p className="text-sm text-white/40 mt-0.5">{course?.id ? 'Update course details' : 'Fill in the details below'}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Course Name</label>
            <input className="input" required placeholder="e.g. Data Structures" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Course Code</label>
              <input className="input" required placeholder="e.g. CS301" value={form.code} onChange={e => set('code', e.target.value)} />
            </div>
            <div>
              <label className="label">Credits</label>
              <input type="number" className="input" required min={1} max={6} value={form.credits} onChange={e => set('credits', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Department</label>
              <select className="input" value={form.department} onChange={e => set('department', e.target.value)}>
                {DEPTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Seat Capacity</label>
              <input type="number" className="input" required min={1} value={form.capacity} onChange={e => set('capacity', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Time Slot</label>
            <input className="input" placeholder="e.g. MWF 9:00-10:00 AM" value={form.time_slot} onChange={e => set('time_slot', e.target.value)} />
          </div>
          <div>
            <label className="label">Prerequisite Course</label>
            <select className="input" value={form.prerequisite_id || ''} onChange={e => set('prerequisite_id', e.target.value || '')}>
              <option value="">None</option>
              {courses.filter(c => c.id !== course?.id).map(c => (
                <option key={c.id} value={c.id}>{c.code} â€” {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} placeholder="Brief course description..." value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 justify-center">
              {saving ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /> : <FiSave size={15} />}
              {course?.id ? 'Save Changes' : 'Create Course'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    coursesAPI.getAll().then(r => setCourses(r.data.courses || [])).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleDelete = async id => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return
    try { await coursesAPI.delete(id); toast.success('Course deleted'); load() }
    catch (err) { toast.error(err.message) }
  }

  return (
    <div className="min-h-screen bg-app">
      <div className="page animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Manage Courses</h1>
            <p className="text-white/40 mt-1">{courses.length} course{courses.length !== 1 ? 's' : ''} available</p>
          </div>
          <button onClick={() => setModal('add')} className="btn-primary flex items-center gap-2">
            <FiPlus /> Add Course
          </button>
        </div>

        <div className="card-glass p-0 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin border-4 border-violet-500 border-t-transparent rounded-full w-10 h-10" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <FiBook className="text-5xl text-white/10 mx-auto mb-4" />
              <p className="text-white/40 font-medium">No courses yet</p>
              <p className="text-white/20 text-sm mt-1">Click "Add Course" to create the first one</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Code','Course Name','Department','Capacity','Credits','Time Slot','Prerequisite','Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3.5"><span className="badge badge-purple">{c.code}</span></td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-white text-sm">{c.name}</p>
                        {c.description && <p className="text-xs text-white/30 mt-0.5 truncate max-w-[180px]">{c.description}</p>}
                      </td>
                      <td className="px-4 py-3.5 text-white/60 text-sm">{c.department}</td>
                      <td className="px-4 py-3.5 text-center text-white/60 text-sm">{c.capacity}</td>
                      <td className="px-4 py-3.5 text-center"><span className="badge badge-blue">{c.credits} cr</span></td>
                      <td className="px-4 py-3.5 text-white/50 text-sm">{c.time_slot || <span className="text-white/20">â€”</span>}</td>
                      <td className="px-4 py-3.5">
                        {c.prerequisite_code
                          ? <span className="badge badge-yellow">{c.prerequisite_code}</span>
                          : <span className="text-white/20 text-sm">None</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-2">
                          <button onClick={() => setModal(c)}
                            className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 flex items-center justify-center transition-all border border-blue-500/20">
                            <FiEdit2 size={13} />
                          </button>
                          <button onClick={() => handleDelete(c.id)}
                            className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all border border-red-500/20">
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {modal && (
          <CourseModal
            course={modal === 'add' ? null : modal}
            courses={courses}
            onSave={() => { setModal(null); load() }}
            onClose={() => setModal(null)}
          />
        )}
      </div>
    </div>
  )
}

