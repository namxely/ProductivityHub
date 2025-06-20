import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Calendar,
  BarChart3,
  Plus,
  Trash2,
  Timer
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

interface TimeEntry {
  _id: string
  title: string
  description: string
  duration: number // in seconds
  startTime: string
  endTime: string
  project: string
  tags: string[]
  createdAt: string
}

const TimeTracking = () => {
  const { user } = useAuth()
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isTracking, setIsTracking] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const [currentSession, setCurrentSession] = useState({
    title: '',
    description: '',
    project: 'General'
  })

  const [newEntry, setNewEntry] = useState({
    title: '',
    description: '',
    project: 'General',
    duration: 60, // minutes
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (user) {
      fetchTimeEntries()
    }
  }, [user])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setCurrentTime(Math.floor((Date.now() - startTime.getTime()) / 1000))
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTracking, startTime])

  const fetchTimeEntries = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('http://localhost:5000/api/time-entries', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTimeEntries(data)
      } else {
        throw new Error('Không thể tải dữ liệu thời gian')
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
      toast.error('Không thể tải dữ liệu thời gian')
    } finally {
      setLoading(false)
    }
  }

  const startTracking = () => {
    if (!currentSession.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề công việc')
      return
    }

    setIsTracking(true)
    setStartTime(new Date())
    setCurrentTime(0)
    toast.success('Bắt đầu theo dõi thời gian')
  }

  const pauseTracking = () => {
    setIsTracking(false)
    toast.info('Tạm dừng theo dõi thời gian')
  }

  const resumeTracking = () => {
    if (startTime) {
      const pausedDuration = currentTime
      setStartTime(new Date(Date.now() - pausedDuration * 1000))
      setIsTracking(true)
      toast.success('Tiếp tục theo dõi thời gian')
    }
  }

  const stopTracking = async () => {
    if (!startTime || currentTime === 0) return

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const endTime = new Date()
      const entryData = {
        title: currentSession.title,
        description: currentSession.description,
        project: currentSession.project,
        duration: currentTime,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      }

      const response = await fetch('http://localhost:5000/api/time-entries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entryData)
      })

      if (response.ok) {
        const newEntry = await response.json()
        setTimeEntries([newEntry, ...timeEntries])
        
        // Reset tracking state
        setIsTracking(false)
        setCurrentTime(0)
        setStartTime(null)
        setCurrentSession({
          title: '',
          description: '',
          project: 'General'
        })
        
        toast.success('Đã lưu thời gian làm việc')
      } else {
        throw new Error('Không thể lưu dữ liệu')
      }
    } catch (error) {
      console.error('Lỗi khi lưu:', error)
      toast.error('Không thể lưu dữ liệu thời gian')
    }
  }

  const addManualEntry = async () => {
    if (!newEntry.title.trim()) {
      toast.error('Tiêu đề là bắt buộc')
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const startTime = new Date(newEntry.date)
      const endTime = new Date(startTime.getTime() + newEntry.duration * 60 * 1000)

      const entryData = {
        title: newEntry.title,
        description: newEntry.description,
        project: newEntry.project,
        duration: newEntry.duration * 60, // convert to seconds
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      }

      const response = await fetch('http://localhost:5000/api/time-entries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entryData)
      })

      if (response.ok) {
        const savedEntry = await response.json()
        setTimeEntries([savedEntry, ...timeEntries])
        setNewEntry({
          title: '',
          description: '',
          project: 'General',
          duration: 60,
          date: new Date().toISOString().split('T')[0]
        })
        setShowAddForm(false)
        toast.success('Đã thêm bản ghi thời gian')
      } else {
        throw new Error('Không thể thêm bản ghi')
      }
    } catch (error) {
      console.error('Lỗi khi thêm:', error)
      toast.error('Không thể thêm bản ghi thời gian')
    }
  }

  const deleteEntry = async (entryId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bản ghi này?')) return

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(`http://localhost:5000/api/time-entries/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setTimeEntries(timeEntries.filter(entry => entry._id !== entryId))
        toast.success('Đã xóa bản ghi')
      } else {
        throw new Error('Không thể xóa bản ghi')
      }
    } catch (error) {
      console.error('Lỗi khi xóa:', error)
      toast.error('Không thể xóa bản ghi')
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getTotalTimeToday = () => {
    const today = new Date().toISOString().split('T')[0]
    return timeEntries
      .filter(entry => entry.startTime.split('T')[0] === today)
      .reduce((total, entry) => total + entry.duration, 0)
  }

  const getTotalTimeThisWeek = () => {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    
    return timeEntries
      .filter(entry => new Date(entry.startTime) >= weekStart)
      .reduce((total, entry) => total + entry.duration, 0)
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '18px',
        color: '#666'
      }}>
        Đang tải dữ liệu...
      </div>
    )
  }

  return (
    <div style={{ 
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '32px', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>
            Theo Dõi Thời Gian
          </h1>
          <p style={{ 
            margin: 0, 
            color: '#666', 
            fontSize: '16px' 
          }}>
            Quản lý và theo dõi thời gian làm việc
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)'
          }}
        >
          <Plus size={20} />
          Thêm Thủ Công
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={24} style={{ color: 'white' }} />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#6b7280' }}>Hôm nay</h3>
          </div>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
            {formatDuration(getTotalTimeToday())}
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={24} style={{ color: 'white' }} />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#6b7280' }}>Tuần này</h3>
          </div>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
            {formatDuration(getTotalTimeThisWeek())}
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 size={24} style={{ color: 'white' }} />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#6b7280' }}>Tổng bản ghi</h3>
          </div>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
            {timeEntries.length}
          </p>
        </div>
      </div>

      {/* Timer */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '48px',
          fontWeight: '700',
          color: isTracking ? '#10b981' : '#6b7280',
          marginBottom: '24px',
          fontFamily: 'monospace'
        }}>
          {formatTime(currentTime)}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <input
            type="text"
            placeholder="Tiêu đề công việc..."
            value={currentSession.title}
            onChange={(e) => setCurrentSession({...currentSession, title: e.target.value})}
            style={{
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#10b981'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          <input
            type="text"
            placeholder="Mô tả (tùy chọn)..."
            value={currentSession.description}
            onChange={(e) => setCurrentSession({...currentSession, description: e.target.value})}
            style={{
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#10b981'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          <select
            value={currentSession.project}
            onChange={(e) => setCurrentSession({...currentSession, project: e.target.value})}
            style={{
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '16px',
              outline: 'none',
              backgroundColor: 'white'
            }}
          >
            <option value="General">Chung</option>
            <option value="Work">Công việc</option>
            <option value="Personal">Cá nhân</option>
            <option value="Learning">Học tập</option>
            <option value="Meeting">Họp</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          {!isTracking && currentTime === 0 && (
            <button
              onClick={startTracking}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              <Play size={20} />
              Bắt đầu
            </button>
          )}

          {!isTracking && currentTime > 0 && (
            <button
              onClick={resumeTracking}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              <Play size={20} />
              Tiếp tục
            </button>
          )}

          {isTracking && (
            <button
              onClick={pauseTracking}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              <Pause size={20} />
              Tạm dừng
            </button>
          )}

          {currentTime > 0 && (
            <button
              onClick={stopTracking}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              <Square size={20} />
              Dừng & Lưu
            </button>
          )}
        </div>
      </div>

      {/* Time Entries List */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h2 style={{
          margin: '0 0 24px 0',
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          Lịch sử thời gian
        </h2>

        {timeEntries.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#6b7280'
          }}>
            <Timer size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>
              Chưa có bản ghi thời gian
            </h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Bắt đầu theo dõi thời gian hoặc thêm bản ghi thủ công
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {timeEntries.map((entry) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid rgba(0, 0, 0, 0.05)'
                }}
              >
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    margin: '0 0 4px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    {entry.title}
                  </h4>
                  <p style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    {entry.description}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontSize: '12px',
                    color: '#9ca3af'
                  }}>
                    <span>{entry.project}</span>
                    <span>{new Date(entry.startTime).toLocaleDateString('vi-VN')}</span>
                    <span>
                      {new Date(entry.startTime).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {new Date(entry.endTime).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#10b981'
                  }}>
                    {formatDuration(entry.duration)}
                  </div>
                  <button
                    onClick={() => deleteEntry(entry._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ef4444',
                      padding: '8px'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Manual Entry Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '24px'
            }}
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '32px',
                width: '100%',
                maxWidth: '500px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h2 style={{
                margin: '0 0 24px 0',
                fontSize: '24px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                Thêm Bản Ghi Thủ Công
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                    placeholder="Nhập tiêu đề..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Mô tả
                  </label>
                  <textarea
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                    placeholder="Nhập mô tả..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>
                      Dự án
                    </label>
                    <select
                      value={newEntry.project}
                      onChange={(e) => setNewEntry({...newEntry, project: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="General">Chung</option>
                      <option value="Work">Công việc</option>
                      <option value="Personal">Cá nhân</option>
                      <option value="Learning">Học tập</option>
                      <option value="Meeting">Họp</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>
                      Thời gian (phút)
                    </label>
                    <input
                      type="number"
                      value={newEntry.duration}
                      onChange={(e) => setNewEntry({...newEntry, duration: parseInt(e.target.value) || 0})}
                      min="1"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Ngày
                  </label>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '24px'
              }}>
                <button
                  onClick={() => setShowAddForm(false)}
                  style={{
                    padding: '12px 24px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={addManualEntry}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  Thêm Bản Ghi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TimeTracking
