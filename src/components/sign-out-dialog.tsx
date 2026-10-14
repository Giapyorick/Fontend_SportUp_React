import { useState } from 'react'
import { useNavigate, useLocation, useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { logoutApi } from '@/api/auth-api'
import { useAuthStore } from '@/stores/auth-store'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const navigate = useNavigate()
  const location = useLocation()
  const { auth } = useAuthStore()

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      // 1. Gọi API Backend thu hồi RefreshToken & Xóa Cookie
      await logoutApi()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Logout API Error:', error)
    } finally {
      // 2. Xóa AccessToken trong localStorage & Zustand Store
      localStorage.removeItem('accessToken')
      auth.reset()

      // 3. Đánh giá lại Route Guard của TanStack Router
      await router.invalidate()

      toast.success('Logged out successfully.')
      setIsLoading(false)
      onOpenChange(false)

      // 4. Lưu lại vị trí đường dẫn hiện tại và chuyển hướng sang /sign-in
      const currentPath = location.href
      await navigate({
        to: '/sign-in',
        search: { redirect: currentPath },
        replace: true,
      })
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      destructive
      isLoading={isLoading}
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
