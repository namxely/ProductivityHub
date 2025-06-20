import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, Zap, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const AuthFormStyled = () => {
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

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Zap style={{ width: '2rem', height: '2rem', color: 'white' }} />
          </div>
          <h1 className="auth-title">ProductivityHub</h1>
        </div>
        <p className="auth-subtitle">
          {isSignUp ? 'Tạo tài khoản của bạn' : 'Chào mừng trở lại'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="input-group">
              <User className="input-icon" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Họ và tên"
                className="input-field"
                required
                minLength={2}
              />
            </div>
          )}
          
          <div className="input-group">
            <Mail className="input-icon" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Địa chỉ email"
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              className="input-field"
              style={{paddingRight: '3rem'}}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-password"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Đang xử lý...' : (isSignUp ? 'Tạo tài khoản' : 'Đăng nhập')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isSignUp ? 'Đã có tài khoản?' : "Chưa có tài khoản?"}
            <span
              onClick={() => setIsSignUp(!isSignUp)}
              className="auth-link"
            >
              {isSignUp ? 'Đăng nhập' : 'Đăng ký'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthFormStyled
