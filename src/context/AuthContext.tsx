import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { jwtDecode } from 'jwt-decode'
import api from '../api/axios'

// Cấu trúc JWT Claims mặc định của ASP.NET Core
interface JwtPayload {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string
  exp: number
}

export interface User {
  id: string
  username: string
  role: string
}

// THÊM export trước AuthContextType để các file khác (hooks, components) có thể import
export interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<User>
  logout: () => Promise<void>
}

// THÊM export cho AuthContext để hook useAuth ở file khác có thể đọc Context
export const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

// Hàm đọc user từ localStorage
const getInitialUser = (): User | null => {
  const token = localStorage.getItem('accessToken')
  if (!token) return null

  try {
    const decoded = jwtDecode<JwtPayload>(token)
    if (decoded.exp * 1000 > Date.now()) {
      return {
        id: decoded[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ],
        username:
          decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        role: decoded[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ],
      }
    }
    localStorage.removeItem('accessToken')
    return null
  } catch {
    localStorage.removeItem('accessToken')
    return null
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getInitialUser)

  const login = async (username: string, password: string): Promise<User> => {
    const res = await api.post<{ accessToken: string }>('/auth/login', {
      username,
      password,
    })
    const { accessToken } = res.data

    localStorage.setItem('accessToken', accessToken)
    const decoded = jwtDecode<JwtPayload>(accessToken)

    const userData: User = {
      id: decoded[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ],
      username:
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      role: decoded[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ],
    }

    setUser(userData)
    return userData
  }

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout')
    } catch (e: unknown) {
      // eslint-disable-next-line no-console
      console.error('Logout error:', e)
    } finally {
      localStorage.removeItem('accessToken')
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
