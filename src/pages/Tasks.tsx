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
  Trash2,
  Clock,
  Edit3,
  MoreHorizontal
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
        throw new Error('Không thể tải công việc')
      }
    } catch (error) {
      console.error('Lỗi khi tải công việc:', error)
      toast.error('Không thể tải danh sách công việc')
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
    }

    setFilteredTasks(filtered)
  }

  const addTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Tiêu đề công việc là bắt buộc')
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newTask,
          dueDate: newTask.due_date || null
        })
      })

      if (response.ok) {
        const data = await response.json()
        setTasks([data, ...tasks])
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          category: 'General',
          due_date: ''
        })
        setShowAddForm(false)
        toast.success('Đã thêm công việc thành công')
        fetchTasks()
      } else {
        throw new Error('Không thể thêm công việc')
      }
    } catch (error) {
      console.error('Lỗi khi thêm công việc:', error)
      toast.error('Không thể thêm công việc')
    }
  }

  const toggleTask = async (task: Task) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(`http://localhost:5000/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...task,
          completed: !task.completed
        })
      })

      if (response.ok) {
        setTasks(tasks.map(t => 
          t.id === task.id ? { ...t, completed: !t.completed } : t
        ))
        
        toast.success(task.completed ? 'Đánh dấu chưa hoàn thành' : 'Công việc đã hoàn thành!')
      } else {
        throw new Error('Không thể cập nhật công việc')
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật công việc:', error)
      toast.error('Không thể cập nhật công việc')
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
        toast.success('Đã xóa công việc thành công')
      } else {
        throw new Error('Không thể xóa công việc')
      }
    } catch (error) {
      console.error('Lỗi khi xóa công việc:', error)
      toast.error('Không thể xóa công việc')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#f87171'
      case 'medium': return '#fbbf24'
      case 'low': return '#4ade80'
      default: return '#9ca3af'
    }
  }

  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case 'high': return 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)'
      case 'medium': return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
      case 'low': return 'linear-gradient(135deg, #4ade80 0%, #10b981 100%)'
      default: return 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
    }
  }

  const getStats = () => {
    const total = tasks.length
    const completed = tasks.filter(t => t.completed).length
    const pending = total - completed
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    
    return { total, completed, pending, completionRate }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid white',
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
    <>
      <style>{`
        input::placeholder {
          color: rgba(255, 255, 255, 0.9) !important;
          font-weight: 500;
        }
        input {
          color: #ffffff !important;
        }
        select {
          color: #ffffff !important;
        }
        select option {
          color: #ffffff !important;
          background: #1f2937 !important;
        }
      `}</style>
      <div style={{ 
        padding: '32px',
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
        minHeight: '100vh'
      }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px'
      }}>
        <div>
          <h1 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '48px', 
            fontWeight: '800',
            background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Công việc
          </h1>
          <p style={{ 
            margin: 0, 
            color: 'rgba(255, 255, 255, 0.8)', 
            fontSize: '20px',
            fontWeight: '500'
          }}>
            Quản lý và theo dõi tiến độ công việc
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '16px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: '700',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(59, 130, 246, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.4)'
          }}
        >
          <Plus size={24} />
          Thêm công việc
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Tổng công việc</p>
              <p style={{ margin: 0, fontSize: '42px', fontWeight: '800', color: 'white' }}>{stats.total}</p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckSquare size={32} style={{ color: 'white' }} />
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Đã hoàn thành</p>
              <p style={{ margin: 0, fontSize: '42px', fontWeight: '800', color: '#4ade80' }}>{stats.completed}</p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckSquare size={32} style={{ color: 'white' }} />
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Chờ xử lý</p>
              <p style={{ margin: 0, fontSize: '42px', fontWeight: '800', color: '#fbbf24' }}>{stats.pending}</p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={32} style={{ color: 'white' }} />
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Hiệu suất</p>
              <p style={{ margin: 0, fontSize: '42px', fontWeight: '800', color: '#a855f7' }}>{stats.completionRate}%</p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Flag size={32} style={{ color: 'white' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{
        display: 'flex',
        gap: '24px',
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={24} style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255, 255, 255, 0.6)'
          }} />
          <input
            type="text"
            placeholder="Tìm kiếm công việc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '64px',
              paddingRight: '24px',
              paddingTop: '20px',
              paddingBottom: '20px',
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '16px',
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: '600',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(59, 130, 246, 0.8)'
              e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.2)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>
        <div style={{ position: 'relative', minWidth: '220px' }}>
          <Filter size={24} style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255, 255, 255, 0.6)'
          }} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '64px',
              paddingRight: '48px',
              paddingTop: '20px',
              paddingBottom: '20px',
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '16px',
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: '600',
              outline: 'none',
              appearance: 'none',
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
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              marginBottom: '32px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h3 style={{ 
              margin: '0 0 24px 0', 
              fontSize: '28px', 
              fontWeight: '700', 
              color: 'white',
              textAlign: 'center'
            }}>
              Thêm công việc mới
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <input
                type="text"
                placeholder="Tiêu đề công việc"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                style={{
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: '600',
                  outline: 'none'
                }}
              />
              <input
                type="text"
                placeholder="Danh mục"
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                style={{
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: '600',
                  outline: 'none'
                }}
              />
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                style={{
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: '600',
                  outline: 'none'
                }}
              >
                <option value="low" style={{ background: '#1f2937', color: 'white' }}>Ưu tiên thấp</option>
                <option value="medium" style={{ background: '#1f2937', color: 'white' }}>Ưu tiên trung bình</option>
                <option value="high" style={{ background: '#1f2937', color: 'white' }}>Ưu tiên cao</option>
              </select>
              <input
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                style={{
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: '600',
                  outline: 'none'
                }}
              />
            </div>
            <textarea
              placeholder="Mô tả (tùy chọn)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              rows={4}
              style={{
                width: '100%',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: '600',
                outline: 'none',
                resize: 'none',
                marginBottom: '24px',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={addTask}
                style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)'
                }}
              >
                Thêm công việc
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: '16px 32px',
                  background: 'rgba(107, 114, 128, 0.3)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(107, 114, 128, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(107, 114, 128, 0.3)'
                }}
              >
                Hủy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <AnimatePresence>
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                <button
                  onClick={() => toggleTask(task)}
                  style={{
                    marginTop: '8px',
                    padding: '8px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {task.completed ? (
                    <CheckSquare size={32} style={{ color: '#4ade80' }} />
                  ) : (
                    <Square size={32} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                  )}
                </button>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        margin: '0 0 12px 0',
                        fontSize: '24px',
                        fontWeight: '700',
                        color: task.completed ? 'rgba(255, 255, 255, 0.5)' : 'white',
                        textDecoration: task.completed ? 'line-through' : 'none'
                      }}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p style={{
                          margin: '0 0 20px 0',
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '18px',
                          lineHeight: '1.6'
                        }}>
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginLeft: '24px' }}>
                      <button
                        style={{
                          padding: '12px',
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '2px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)'
                          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'
                          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        <Edit3 size={20} style={{ color: '#3b82f6' }} />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        style={{
                          padding: '12px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '2px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
                        }}
                      >
                        <Trash2 size={20} style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white',
                      background: getPriorityGradient(task.priority),
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      <Flag size={16} />
                      {task.priority}
                    </span>
                    <span style={{
                      padding: '8px 16px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}>
                      {task.category}
                    </span>
                    {task.due_date && (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '16px',
                        fontWeight: '500'
                      }}>
                        <Calendar size={16} />
                        {new Date(task.due_date).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}>
                      <Clock size={16} />
                      {new Date(task.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '64px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <CheckSquare size={80} style={{ color: 'rgba(255, 255, 255, 0.4)', margin: '0 auto 24px' }} />
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '32px',
              fontWeight: '700',
              color: 'white'
            }}>
              {searchTerm || filter !== 'all' ? 'Không có công việc nào phù hợp' : 'Chưa có công việc nào'}
            </h3>
            <p style={{
              margin: '0 0 32px 0',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '20px',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: '1.6'
            }}>
              {searchTerm || filter !== 'all' 
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Tạo công việc đầu tiên của bạn để bắt đầu quản lý hiệu quả'}
            </p>
            {!searchTerm && filter === 'all' && (
              <button
                onClick={() => setShowAddForm(true)}
                style={{
                  padding: '20px 40px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '20px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(59, 130, 246, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.4)'
                }}
              >
                Tạo công việc đầu tiên
              </button>
            )}
          </div>
        )}
      </div>
      </div>
    </>
  )
}

export default Tasks