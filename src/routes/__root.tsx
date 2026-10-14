import { type QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from '@/components/ui/sonner'
import { NavigationProgress } from '@/components/navigation-progress'
import { GeneralError } from '@/features/errors/general-error'
import { NotFoundError } from '@/features/errors/not-found-error'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: ({ location }) => {
    // 1. Kiểm tra AccessToken trong LocalStorage
    const token = localStorage.getItem('accessToken')

    // 2. Danh sách các route công khai không cần đăng nhập
    const isPublicRoute =
      location.pathname === '/sign-in' ||
      location.pathname === '/sign-up' ||
      location.pathname === '/forgot-password'

    // 3. Nếu chưa đăng nhập mà cố vào route bảo mật -> Chuyển hướng về /sign-in
    if (!token && !isPublicRoute) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }

    // 4. Nếu đã đăng nhập mà cố truy cập lại trang Login/Register -> Cho thẳng vào Dashboard
    if (token && isPublicRoute) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: () => {
    return (
      <>
        <NavigationProgress />
        <Outlet />
        <Toaster duration={5000} />
        {import.meta.env.MODE === 'development' && (
          <>
            <ReactQueryDevtools buttonPosition='bottom-left' />
            <TanStackRouterDevtools position='bottom-right' />
          </>
        )}
      </>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})
