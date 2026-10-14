import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { jwtDecode } from 'jwt-decode'
import api from '../api/axios'

// Cấu trúc JWT Payload hỗ trợ cả 2 dạng Claims (Long SOAP Claims & Short JWT Claims)
interface JwtPayload {
  // Long claims
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string
  // Short claims fallback
  sub?: string
  name?: string
  username?: string
  role?: string
  exp: number
}

export interface User {
  id: string
  username: string
  role: string
}

export interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<User>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

// Hàm parse Token an toàn với Fallback
const parseUserFromToken = (token: string): User | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token)

    // Kiểm tra Token đã hết hạn chưa
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('accessToken')
      return null
    }

    const id =
      decoded[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ] ||
      decoded.sub ||
      ''

    const username =
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      decoded.username ||
      decoded.name ||
      ''

    const role =
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      decoded.role ||
      'User'

    return { id, username, role }
  } catch {
    localStorage.removeItem('accessToken')
    return null
  }
}

// Hàm đọc user ban đầu từ localStorage
const getInitialUser = (): User | null => {
  const token = localStorage.getItem('accessToken')
  if (!token) return null
  return parseUserFromToken(token)
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getInitialUser)

  const login = async (username: string, password: string): Promise<User> => {
    // 1. Đổi sang endpoint /Auth/login chuẩn hoa/thường của .NET
    const res = await api.post<{ accessToken?: string; token?: string }>(
      '/Auth/login',
      { username, password }
    )

    // Fallback lấy token theo cả res.data.accessToken lẫn res.data.token
    const accessToken = res.data?.accessToken || res.data?.token

    if (!accessToken) {
      throw new Error('No access token returned from server')
    }

    // 2. BẮT BUỘC: Lưu token vào localStorage
    localStorage.setItem('accessToken', accessToken)

    // 3. BẮT BUỘC: Gắn tức thì Authorization Header cho instance Axios
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

    // 4. Decode user data
    const userData = parseUserFromToken(accessToken)

    if (!userData) {
      throw new Error('Failed to decode user token')
    }

    setUser(userData)
    return userData
  }

  const logout = async (): Promise<void> => {
    try {
      await api.post('/Auth/logout')
    } catch (e: unknown) {
      // eslint-disable-next-line no-console
      console.error('Logout error:', e)
    } finally {
      localStorage.removeItem('accessToken')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      window.location.href = '/sign-in'
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
