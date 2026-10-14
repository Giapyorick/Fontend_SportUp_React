import { useState, type FormEvent } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ApiErrorResponse {
  message?: string
}

export const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        setError(
          err.response?.data?.message ||
            (err.message === 'Network Error'
              ? 'Không thể kết nối đến máy chủ.'
              : 'Đăng nhập thất bại.')
        )
      } else {
        setError('Đã xảy ra lỗi không mong muốn.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '100px auto',
        padding: '20px',
        border: '1px solid #ccc',
      }}
    >
      <h2>Đăng Nhập Admin</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor='username'>Tài khoản:</label>
          <input
            id='username'
            type='text'
            style={{ width: '100%', padding: '8px' }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete='username'
            required
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor='password'>Mật khẩu:</label>
          <input
            id='password'
            type='password'
            style={{ width: '100%', padding: '8px' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete='current-password'
            required
          />
        </div>

        <button
          type='submit'
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  )
}

export default Login
