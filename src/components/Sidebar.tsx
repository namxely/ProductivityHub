import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  StickyNote, 
  Clock, 
  BarChart3, 
  Settings, 
  LogOut,
  Zap
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Sidebar = () => {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/auth')
      toast.success('Đăng xuất thành công')
    } catch (error) {
      toast.error('Lỗi khi đăng xuất')
    }
  }

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Trang chủ' },
    { path: '/tasks', icon: CheckSquare, label: 'Công việc' },
    { path: '/calendar', icon: Calendar, label: 'Lịch' },
    { path: '/notes', icon: StickyNote, label: 'Ghi chú' },
    { path: '/time-tracking', icon: Clock, label: 'Theo dõi thời gian' },
    { path: '/analytics', icon: BarChart3, label: 'Thống kê' },
    { path: '/settings', icon: Settings, label: 'Cài đặt' },
  ]

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        width: '16rem',
        height: '100vh',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '1.5rem',
        position: 'relative'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          padding: '0.5rem',
          background: 'linear-gradient(to right, #3b82f6, #9333ea)',
          borderRadius: '0.5rem'
        }}>
          <Zap style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
        </div>
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: 'white'
        }}>ProductivityHub</h1>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'all 0.2s',
              ...(isActive ? {
                background: 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))',
                color: 'white',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              } : {
                color: 'rgba(209, 213, 219, 1)',
                ':hover': {
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.1)'
                }
              })
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.color = 'white'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.color = 'rgba(209, 213, 219, 1)'
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <item.icon style={{ width: '1.25rem', height: '1.25rem' }} />
            <span style={{ fontWeight: '500' }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{
        position: 'absolute',
        bottom: '1.5rem',
        left: '1.5rem',
        right: '1.5rem'
      }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            width: '100%',
            borderRadius: '0.5rem',
            color: 'rgba(209, 213, 219, 1)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'white'
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(209, 213, 219, 1)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <LogOut style={{ width: '1.25rem', height: '1.25rem' }} />
          <span>Đăng xuất</span>
        </motion.button>
      </div>
    </motion.div>
  )
}

export default Sidebar