import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// 1. Route yêu cầu đã Đăng nhập
export const ProtectedRoute: React.FC = () => {
  const { user } = useAuth()
  return user ? <Outlet /> : <Navigate to='/login' replace />
}

interface RoleBasedRouteProps {
  allowedRoles: string[]
}

// 2. Route kiểm tra đúng Role (Admin, Manager, User...)
export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  allowedRoles,
}) => {
  const { user } = useAuth()

  if (!user) return <Navigate to='/login' replace />

  return allowedRoles.includes(user.role) ? (
    <Outlet />
  ) : (
    <Navigate to='/403-unauthorized' replace />
  )
}
