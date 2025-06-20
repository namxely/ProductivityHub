import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckSquare, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Target,
  Plus
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalTasks: number
  completedTasks: number
  todayTasks: number
  totalTimeToday: number
  weeklyProgress: number
}

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    todayTasks: 0,
    totalTimeToday: 0,
    weeklyProgress: 0
  })
  const [recentTasks, setRecentTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.log('Không có token, user chưa đăng nhập')
        setLoading(false)
        return
      }

      console.log('Đang tải dữ liệu dashboard...')

      // Fetch tasks
      const tasksResponse = await fetch('http://localhost:5000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // Fetch notes
      const notesResponse = await fetch('http://localhost:5000/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // Fetch time entries
      const timeResponse = await fetch('http://localhost:5000/api/time-entries', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (tasksResponse.ok) {
        const tasks = await tasksResponse.json()
        console.log('Tải tasks thành công:', tasks.length, 'tasks')
        
        const today = new Date().toISOString().split('T')[0]
        
        const totalTasks = tasks.length
        const completedTasks = tasks.filter((task: any) => task.completed).length
        const todayTasks = tasks.filter((task: any) => 
          task.dueDate && task.dueDate.split('T')[0] === today
        ).length

        // Calculate weekly progress
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)

        const weekTasks = tasks.filter((task: any) => {
          if (!task.dueDate) return false
          const taskDate = new Date(task.dueDate)
          return taskDate >= weekStart && taskDate <= weekEnd
        })

        const weeklyCompleted = weekTasks.filter((task: any) => task.completed).length
        const weeklyProgress = weekTasks.length > 0 ? (weeklyCompleted / weekTasks.length) * 100 : 0

        // Calculate total time today from time entries
        let totalTimeToday = 0
        if (timeResponse.ok) {
          const timeEntries = await timeResponse.json()
          const todayEntries = timeEntries.filter((entry: any) => 
            entry.startTime.split('T')[0] === today
          )
          totalTimeToday = todayEntries.reduce((total: number, entry: any) => total + entry.duration, 0)
        }

        setStats({
          totalTasks,
          completedTasks,
          todayTasks,
          totalTimeToday,
          weeklyProgress
        })

        // Get recent tasks (last 5)
        const recentTasks = tasks.slice(0, 5)
        setRecentTasks(recentTasks)
      } else {
        const errorText = await tasksResponse.text()
        console.error('API Error:', tasksResponse.status, errorText)
        if (tasksResponse.status === 401) {
          toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại')
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')
        } else {
          toast.error('Không thể kết nối đến server backend')
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error)
      if (error instanceof Error && error.message.includes('fetch')) {
        toast.error('Không thể kết nối đến server backend. Vui lòng kiểm tra xem server có đang chạy không.')
      } else {
        toast.error('Có lỗi xảy ra khi tải dữ liệu dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Tổng công việc',
      value: stats.totalTasks,
      icon: CheckSquare,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/20'
    },
    {
      title: 'Đã hoàn thành',
      value: stats.completedTasks,
      icon: Target,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/20'
    },
    {
      title: 'Đến hạn hôm nay',
      value: stats.todayTasks,
      icon: Calendar,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/20'
    },
    {
      title: 'Thời gian hôm nay',
      value: `${Math.floor(stats.totalTimeToday / 60)}h ${stats.totalTimeToday % 60}m`,
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/20'
    }
  ]

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
          }}>Trang chủ</h1>
          <p style={{
            color: 'rgba(209, 213, 219, 1)'
          }}>Chào mừng trở lại! Đây là tổng quan năng suất của bạn.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
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
          Thêm công việc nhanh
        </motion.button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                background: card.bgColor.includes('blue') ? 'rgba(59, 130, 246, 0.2)' :
                           card.bgColor.includes('green') ? 'rgba(34, 197, 94, 0.2)' :
                           card.bgColor.includes('orange') ? 'rgba(249, 115, 22, 0.2)' :
                           'rgba(147, 51, 234, 0.2)'
              }}>
                <card.icon style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
              <TrendingUp style={{ width: '1rem', height: '1rem', color: '#4ade80' }} />
            </div>
            <h3 style={{
              color: 'rgba(209, 213, 219, 1)',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.25rem'
            }}>{card.title}</h3>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'white'
            }}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem'
          }}>Tiến trình tuần</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: 'rgba(209, 213, 219, 1)' }}>Hoàn thành công việc</span>
              <span style={{ color: 'white', fontWeight: '600' }}>{Math.round(stats.weeklyProgress)}%</span>
            </div>
            <div style={{
              width: '100%',
              background: 'rgba(55, 65, 81, 1)',
              borderRadius: '9999px',
              height: '0.75rem'
            }}>
              <div 
                style={{
                  background: 'linear-gradient(to right, #3b82f6, #9333ea)',
                  height: '0.75rem',
                  borderRadius: '9999px',
                  transition: 'all 0.3s',
                  width: `${stats.weeklyProgress}%`
                }}
              ></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem'
          }}>Công việc gần đây</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div key={task.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.5rem'
                }}>
                  <div style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    borderRadius: '50%',
                    background: task.priority === 'high' ? '#f87171' :
                               task.priority === 'medium' ? '#fbbf24' : '#4ade80'
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '0.875rem',
                      color: task.completed ? 'rgba(156, 163, 175, 1)' : 'white',
                      textDecoration: task.completed ? 'line-through' : 'none'
                    }}>
                      {task.title}
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'rgba(156, 163, 175, 1)'
                    }}>{task.category}</p>
                  </div>
                  {task.completed && <CheckSquare style={{ width: '1rem', height: '1rem', color: '#4ade80' }} />}
                </div>
              ))
            ) : (
              <p style={{
                color: 'rgba(156, 163, 175, 1)',
                textAlign: 'center',
                padding: '1rem 0'
              }}>Chưa có công việc nào. Tạo công việc đầu tiên của bạn!</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard