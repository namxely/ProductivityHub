import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  Calendar,
  Flag,
  Trash2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category: string
  due_date: string | null
  created_at: string
  updated_at: string
  user_id: string
}

const Tasks = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'General',
    due_date: ''
  })

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user])

  useEffect(() => {
    filterTasks()
  }, [tasks, searchTerm, filter])

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      } else {
        toast.error('Không thể tải danh sách công việc')
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách công việc')
    } finally {
      setLoading(false)
    }
  }

  const filterTasks = () => {
    let filtered = tasks

    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    switch (filter) {
      case 'completed':
        filtered = filtered.filter(task => task.completed)
        break
      case 'pending':
        filtered = filtered.filter(task => !task.completed)
        break
      case 'high':
        filtered = filtered.filter(task => task.priority === 'high')
        break
      case 'medium':
        filtered = filtered.filter(task => task.priority === 'medium')
        break
      case 'low':
        filtered = filtered.filter(task => task.priority === 'low')
        break
      default:
        break
    }

    setFilteredTasks(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.title.trim()) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
      })

      if (response.ok) {
        const data = await response.json()
        setTasks([...tasks, data])
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          category: 'General',
          due_date: ''
        })
        setShowAddForm(false)
        toast.success('Công việc đã được tạo thành công!')
      } else {
        toast.error('Không thể tạo công việc')
      }
    } catch (error) {
      toast.error('Lỗi khi tạo công việc')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const task = tasks.find(t => t.id === taskId)
      if (!task) return

      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...task, completed: !task.completed })
      })

      if (response.ok) {
        const updatedTask = await response.json()
        setTasks(tasks.map(t => t.id === taskId ? updatedTask : t))
        toast.success(updatedTask.completed ? 'Công việc đã hoàn thành!' : 'Công việc được đánh dấu chưa hoàn thành')
      } else {
        toast.error('Không thể cập nhật công việc')
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật công việc')
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== taskId))
        toast.success('Công việc đã được xóa!')
      } else {
        toast.error('Không thể xóa công việc')
      }
    } catch (error) {
      toast.error('Lỗi khi xóa công việc')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444'
      case 'medium': return '#f59e0b'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high': return 'rgba(239, 68, 68, 0.2)'
      case 'medium': return 'rgba(245, 158, 11, 0.2)'
      case 'low': return 'rgba(16, 185, 129, 0.2)'
      default: return 'rgba(107, 114, 128, 0.2)'
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '16rem'
      }}>
        <div style={{
          width: '2rem',
          height: '2rem',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderTop: '2px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem'
          }}>Công việc</h1>
          <p style={{
            color: 'rgba(209, 213, 219, 1)'
          }}>
            {filteredTasks.length} công việc
            {filter !== 'all' && ` (${filter})`}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'linear-gradient(to right, #3b82f6, #9333ea)',
            color: 'white',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #7c3aed)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to right, #3b82f6, #9333ea)'
          }}
        >
          <Plus style={{ width: '1rem', height: '1rem' }} />
          Thêm công việc
        </motion.button>
      </div>

      {/* Search and Filter */}
      <div style={{
        display: 'flex',
        flexDirection: window.innerWidth < 640 ? 'column' : 'row',
        gap: '1rem'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '1.25rem',
            height: '1.25rem',
            color: 'rgba(156, 163, 175, 1)'
          }} />
          <input
            type="text"
            placeholder="Tìm kiếm công việc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '2.5rem',
              paddingRight: '1rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem'
            }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <Filter style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '1.25rem',
            height: '1.25rem',
            color: 'rgba(156, 163, 175, 1)'
          }} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              appearance: 'none',
              paddingLeft: '2.5rem',
              paddingRight: '2rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            <option value="all" style={{ background: '#1f2937', color: 'white' }}>Tất cả</option>
            <option value="pending" style={{ background: '#1f2937', color: 'white' }}>Chưa hoàn thành</option>
            <option value="completed" style={{ background: '#1f2937', color: 'white' }}>Đã hoàn thành</option>
            <option value="high" style={{ background: '#1f2937', color: 'white' }}>Ưu tiên cao</option>
            <option value="medium" style={{ background: '#1f2937', color: 'white' }}>Ưu tiên trung bình</option>
            <option value="low" style={{ background: '#1f2937', color: 'white' }}>Ưu tiên thấp</option>
          </select>
        </div>
      </div>

      {/* Add Task Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '1rem'
            }}>Thêm công việc mới</h3>
            <form onSubmit={handleSubmit} style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
              gap: '1rem'
            }}>
              <input
                type="text"
                placeholder="Tiêu đề công việc"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              />
              <input
                type="text"
                placeholder="Mô tả"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              />
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <option value="low" style={{ background: '#1f2937', color: 'white' }}>Ưu tiên thấp</option>
                <option value="medium" style={{ background: '#1f2937', color: 'white' }}>Ưu tiên trung bình</option>
                <option value="high" style={{ background: '#1f2937', color: 'white' }}>Ưu tiên cao</option>
              </select>
              <input
                type="text"
                placeholder="Danh mục"
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              />
              <input
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              />
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                gridColumn: window.innerWidth < 768 ? '1' : '1 / -1'
              }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    background: submitting ? 'rgba(107, 114, 128, 0.5)' : 'linear-gradient(to right, #3b82f6, #9333ea)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  {submitting ? 'Đang tạo...' : 'Tạo công việc'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: 'white',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      <div style={{
        display: 'grid',
        gap: '1rem'
      }}>
        <AnimatePresence>
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              layout
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px)',
                borderRadius: '0.75rem',
                padding: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                opacity: task.completed ? 0.7 : 1
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem'
              }}>
                <button
                  onClick={() => toggleTask(task.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: task.completed ? '#4ade80' : 'rgba(156, 163, 175, 1)',
                    padding: '0.25rem',
                    marginTop: '0.125rem'
                  }}
                >
                  {task.completed ? (
                    <CheckSquare style={{ width: '1.25rem', height: '1.25rem' }} />
                  ) : (
                    <Square style={{ width: '1.25rem', height: '1.25rem' }} />
                  )}
                </button>
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: task.completed ? 'rgba(156, 163, 175, 1)' : 'white',
                      textDecoration: task.completed ? 'line-through' : 'none',
                      margin: 0
                    }}>
                      {task.title}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.125rem 0.5rem',
                      background: getPriorityBg(task.priority),
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      color: getPriorityColor(task.priority),
                      fontWeight: '500'
                    }}>
                      <Flag style={{ width: '0.75rem', height: '0.75rem' }} />
                      {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                    </div>
                  </div>
                  
                  {task.description && (
                    <p style={{
                      fontSize: '0.875rem',
                      color: task.completed ? 'rgba(156, 163, 175, 1)' : 'rgba(209, 213, 219, 1)',
                      marginBottom: '0.5rem',
                      textDecoration: task.completed ? 'line-through' : 'none'
                    }}>
                      {task.description}
                    </p>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontSize: '0.75rem',
                    color: 'rgba(156, 163, 175, 1)'
                  }}>
                    <span>{task.category}</span>
                    {task.due_date && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <Calendar style={{ width: '0.75rem', height: '0.75rem' }} />
                        {new Date(task.due_date).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(156, 163, 175, 1)',
                    padding: '0.25rem',
                    borderRadius: '0.25rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ef4444'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(156, 163, 175, 1)'
                  }}
                >
                  <Trash2 style={{ width: '1rem', height: '1rem' }} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredTasks.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem 0',
            color: 'rgba(156, 163, 175, 1)'
          }}>
            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
              {searchTerm || filter !== 'all' ? 'Không tìm thấy công việc nào' : 'Chưa có công việc nào'}
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              {searchTerm || filter !== 'all' ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm' : 'Hãy tạo công việc đầu tiên của bạn!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Tasks
