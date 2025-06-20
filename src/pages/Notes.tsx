import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2,
  Save,
  X,
  FileText,
  Calendar,
  BookOpen,
  Heart,
  Bookmark
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

interface Note {
  _id: string
  title: string
  content: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

const Notes = () => {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'General',
    tags: [] as string[]
  })

  useEffect(() => {
    if (user) {
      fetchNotes()
    }
  }, [user])

  useEffect(() => {
    filterNotes()
  }, [notes, searchTerm])

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('http://localhost:5000/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      } else {
        throw new Error('Không thể tải ghi chú')
      }
    } catch (error) {
      console.error('Lỗi khi tải ghi chú:', error)
      toast.error('Không thể tải danh sách ghi chú')
    } finally {
      setLoading(false)
    }
  }

  const filterNotes = () => {
    let filtered = notes

    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredNotes(filtered)
  }

  const addNote = async () => {
    if (!newNote.title.trim()) {
      toast.error('Tiêu đề ghi chú là bắt buộc')
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('http://localhost:5000/api/notes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newNote)
      })

      if (response.ok) {
        const data = await response.json()
        setNotes([data, ...notes])
        setNewNote({
          title: '',
          content: '',
          category: 'General',
          tags: []
        })
        setShowAddForm(false)
        toast.success('Đã thêm ghi chú thành công')
      } else {
        throw new Error('Không thể thêm ghi chú')
      }
    } catch (error) {
      console.error('Lỗi khi thêm ghi chú:', error)
      toast.error('Không thể thêm ghi chú')
    }
  }

  const updateNote = async (note: Note) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(`http://localhost:5000/api/notes/${note._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(note)
      })

      if (response.ok) {
        const updatedNote = await response.json()
        setNotes(notes.map(n => n._id === note._id ? updatedNote : n))
        setEditingNote(null)
        toast.success('Đã cập nhật ghi chú')
      } else {
        throw new Error('Không thể cập nhật ghi chú')
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật ghi chú:', error)
      toast.error('Không thể cập nhật ghi chú')
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa ghi chú này?')) return

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setNotes(notes.filter(n => n._id !== noteId))
        toast.success('Đã xóa ghi chú')
      } else {
        throw new Error('Không thể xóa ghi chú')
      }
    } catch (error) {
      console.error('Lỗi khi xóa ghi chú:', error)
      toast.error('Không thể xóa ghi chú')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'General': '#3b82f6',
      'Work': '#8b5cf6',
      'Personal': '#ec4899',
      'Ideas': '#f59e0b',
      'Study': '#10b981'
    }
    return colors[category as keyof typeof colors] || '#9ca3af'
  }

  const getCategoryGradient = (category: string) => {
    const gradients = {
      'General': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      'Work': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      'Personal': 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      'Ideas': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'Study': 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    }
    return gradients[category as keyof typeof gradients] || 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
  }

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
        textarea {
          color: #ffffff !important;
        }
        textarea::placeholder {
          color: rgba(255, 255, 255, 0.9) !important;
          font-weight: 500;
        }
      `}</style>
      <div style={{ 
        padding: '32px',
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
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
            background: 'linear-gradient(135deg, #ec4899 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Ghi Chú
          </h1>
          <p style={{ 
            margin: 0, 
            color: 'rgba(255, 255, 255, 0.8)', 
            fontSize: '20px',
            fontWeight: '500'
          }}>
            Lưu trữ ý tưởng và kiến thức của bạn
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #3b82f6 100%)',
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
            boxShadow: '0 8px 32px rgba(236, 72, 153, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(236, 72, 153, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(236, 72, 153, 0.4)'
          }}
        >
          <Plus size={24} />
          Thêm ghi chú
        </button>
      </div>

      {/* Stats */}
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
              <p style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Tổng ghi chú</p>
              <p style={{ margin: 0, fontSize: '42px', fontWeight: '800', color: 'white' }}>{filteredNotes.length}</p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={32} style={{ color: 'white' }} />
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
              <p style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Được yêu thích</p>
              <p style={{ margin: 0, fontSize: '42px', fontWeight: '800', color: '#ec4899' }}>0</p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Heart size={32} style={{ color: 'white' }} />
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
              <p style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Danh mục</p>
              <p style={{ margin: 0, fontSize: '42px', fontWeight: '800', color: '#a855f7' }}>{new Set(notes.map(n => n.category)).size}</p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bookmark size={32} style={{ color: 'white' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{
        position: 'relative',
        marginBottom: '32px'
      }}>
        <Search size={24} style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'rgba(255, 255, 255, 0.6)'
        }} />
                  <input
            type="text"
            placeholder="Tìm kiếm ghi chú theo tiêu đề, nội dung hoặc tag..."
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
              transition: 'all 0.3s ease',
              boxSizing: 'border-box'
            }}
                      onFocus={(e) => {
              e.target.style.borderColor = 'rgba(236, 72, 153, 0.8)'
              e.target.style.boxShadow = '0 0 0 4px rgba(236, 72, 153, 0.2)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
              e.target.style.boxShadow = 'none'
            }}
        />
      </div>

      {/* Add Note Form */}
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
              Tạo ghi chú mới
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <input
                type="text"
                placeholder="Tiêu đề ghi chú"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
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
                value={newNote.category}
                onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
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
                <option value="General" style={{ background: '#1f2937', color: 'white' }}>General</option>
                <option value="Work" style={{ background: '#1f2937', color: 'white' }}>Work</option>
                <option value="Personal" style={{ background: '#1f2937', color: 'white' }}>Personal</option>
                <option value="Ideas" style={{ background: '#1f2937', color: 'white' }}>Ideas</option>
                <option value="Study" style={{ background: '#1f2937', color: 'white' }}>Study</option>
              </select>
            </div>
            <textarea
              placeholder="Nội dung ghi chú..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              rows={6}
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
                onClick={addNote}
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
                Tạo ghi chú
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

      {/* Notes Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px'
      }}>
        <AnimatePresence>
          {filteredNotes.map((note) => (
            <motion.div
              key={note._id}
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
                transition: 'all 0.3s ease',
                height: 'fit-content'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              {editingNote?._id === note._id ? (
                // Edit Mode
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <input
                    type="text"
                    value={editingNote.title}
                    onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
                    style={{
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '20px',
                      fontWeight: '700',
                      outline: 'none'
                    }}
                  />
                  <textarea
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                    rows={8}
                    style={{
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '16px',
                      fontWeight: '500',
                      outline: 'none',
                      resize: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => updateNote(editingNote)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#10b981',
                        border: '2px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)'
                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'
                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <Save size={18} />
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingNote(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: 'rgba(107, 114, 128, 0.2)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(107, 114, 128, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(107, 114, 128, 0.2)'
                      }}
                    >
                      <X size={18} />
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '24px',
                      fontWeight: '700',
                      color: 'white',
                      lineHeight: '1.3',
                      flex: 1,
                      marginRight: '16px'
                    }}>
                      {note.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setEditingNote(note)}
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
                        <Edit3 size={18} style={{ color: '#3b82f6' }} />
                      </button>
                      <button
                        onClick={() => deleteNote(note._id)}
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
                        <Trash2 size={18} style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  </div>

                  <p style={{
                    margin: '0 0 24px 0',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    flex: 1
                  }}>
                    {note.content.length > 200 
                      ? note.content.substring(0, 200) + '...' 
                      : note.content}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white',
                      background: getCategoryGradient(note.category),
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      textAlign: 'center'
                    }}>
                      {note.category}
                    </span>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} />
                        {formatDate(note.updatedAt)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} />
                        {note.content.length} ký tự
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {filteredNotes.length === 0 && (
          <div style={{
            gridColumn: '1 / -1',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '64px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <BookOpen size={80} style={{ color: 'rgba(255, 255, 255, 0.4)', margin: '0 auto 24px' }} />
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '32px',
              fontWeight: '700',
              color: 'white'
            }}>
              {searchTerm ? 'Không tìm thấy ghi chú nào' : 'Chưa có ghi chú nào'}
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
              {searchTerm
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc tạo ghi chú mới'
                : 'Bắt đầu ghi lại những ý tưởng tuyệt vời của bạn'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddForm(true)}
                style={{
                  padding: '20px 40px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #3b82f6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '20px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(236, 72, 153, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(236, 72, 153, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(236, 72, 153, 0.4)'
                }}
              >
                Tạo ghi chú đầu tiên
              </button>
            )}
          </div>
        )}
      </div>
      </div>
    </>
  )
}

export default Notes
