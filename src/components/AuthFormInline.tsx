import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, Zap, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password, name)
        toast.success('Tài khoản đã được tạo thành công!')
      } else {
        await signIn(email, password)
        toast.success('Đăng nhập thành công!')
      }
      navigate('/')
    } catch (error: any) {
      toast.error(error.message || 'Đã xảy ra lỗi')
    } finally {
      setLoading(false)
    }
  }

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #7c3aed 50%, #0f172a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
  }

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '28rem',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '1rem',
    padding: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  }

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
    justifyContent: 'center'
  }

  const logoIconStyle: React.CSSProperties = {
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    borderRadius: '0.5rem'
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white',
    margin: 0
  }

  const subtitleStyle: React.CSSProperties = {
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: '2rem'
  }

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  }

  const inputGroupStyle: React.CSSProperties = {
    position: 'relative'
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    paddingLeft: '2.5rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '0.5rem',
    color: 'white',
    fontSize: '1rem',
    outline: 'none'
  }

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    width: '1.25rem',
    height: '1.25rem'
  }

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: 'white',
    fontWeight: '600',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    fontSize: '1rem'
  }

  const toggleButtonStyle: React.CSSProperties = {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer'
  }

  const linkStyle: React.CSSProperties = {
    color: '#60a5fa',
    textDecoration: 'none',
    fontWeight: '600',
    marginLeft: '0.5rem',
    cursor: 'pointer'
  }

  const textCenterStyle: React.CSSProperties = {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#d1d5db'
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={logoStyle}>
          <div style={logoIconStyle}>
            <Zap style={{ width: '2rem', height: '2rem', color: 'white' }} />
          </div>
          <h1 style={titleStyle}>ProductivityHub</h1>
        </div>
        <p style={subtitleStyle}>
          {isSignUp ? 'Tạo tài khoản của bạn' : 'Chào mừng trở lại'}
        </p>

        <form onSubmit={handleSubmit} style={formStyle}>
          {isSignUp && (
            <div style={inputGroupStyle}>
              <User style={iconStyle} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Họ và tên"
                style={inputStyle}
                required
                minLength={2}
              />
            </div>
          )}
          
          <div style={inputGroupStyle}>
            <Mail style={iconStyle} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Địa chỉ email"
              style={inputStyle}
              required
            />
          </div>

          <div style={inputGroupStyle}>
            <Lock style={iconStyle} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              style={{...inputStyle, paddingRight: '3rem'}}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={toggleButtonStyle}
            >
              {showPassword ? <EyeOff style={{width: '1.25rem', height: '1.25rem'}} /> : <Eye style={{width: '1.25rem', height: '1.25rem'}} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.5 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1.02)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {loading ? 'Đang xử lý...' : (isSignUp ? 'Tạo tài khoản' : 'Đăng nhập')}
          </button>
        </form>

        <div style={textCenterStyle}>
          <p>
            {isSignUp ? 'Đã có tài khoản?' : "Chưa có tài khoản?"}
            <span
              onClick={() => setIsSignUp(!isSignUp)}
              style={linkStyle}
            >
              {isSignUp ? 'Đăng nhập' : 'Đăng ký'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthForm
