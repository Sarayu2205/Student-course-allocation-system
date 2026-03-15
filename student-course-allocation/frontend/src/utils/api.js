import axios from 'axios'

// In production (Vercel), VITE_API_URL = your Render/Railway backend URL
// In dev, requests go to /api which Vite proxies to localhost:5000
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({ baseURL, timeout: 15000 })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    const msg = err.response?.data?.error || err.message || 'Request failed'
    return Promise.reject(new Error(msg))
  }
)

export const authAPI = {
  register: d => api.post('/register', d),
  login:    d => api.post('/login', d),
  me:       () => api.get('/me'),
}

export const coursesAPI = {
  getAll: ()       => api.get('/courses'),
  create: d        => api.post('/courses', d),
  update: (id, d)  => api.put(`/courses/${id}`, d),
  delete: id       => api.delete(`/courses/${id}`),
}

export const prefsAPI = {
  submit: d        => api.post('/submit-preferences', d),
  get:    semester => api.get('/preferences', { params: { semester } }),
}

export const allocAPI = {
  run:     semester => api.post('/run-allocation', { semester }),
  result:  semester => api.get('/allocation-result', { params: { semester } }),
  reports: semester => api.get('/admin/reports', { params: { semester } }),
}

export const adminAPI = {
  getStudents: () => api.get('/admin/students'),
}

export const chatAPI = {
  send: message => api.post('/chat', { message }),
}

export const notifAPI = {
  get:      ()  => api.get('/notifications'),
  readAll:  ()  => api.post('/notifications/read-all'),
  readOne:  id  => api.post(`/notifications/${id}/read`),
}

export default api
