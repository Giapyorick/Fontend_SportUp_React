import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const BASE_URL =
  import.meta.env.VITE_API_URL || 'https://sportupdb.runasp.net/api'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Bắt buộc gửi/nhận RefreshToken Cookie
})

interface QueueItem {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

let isRefreshing = false
let failedQueue: QueueItem[] = []

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

// Request Interceptor: Gắn AccessToken vào Header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// Response Interceptor: Xử lý khi bị lỗi 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      const requestUrl = (originalRequest.url || '').toLowerCase()

      // Nếu chính API Refresh Token hoặc Login bị 401 -> Xóa Token & chuyển về trang Login
      if (
        requestUrl.includes('/auth/refresh-token') ||
        requestUrl.includes('/auth/login')
      ) {
        localStorage.removeItem('accessToken')
        window.location.href = '/sign-in'
        return Promise.reject(error)
      }

      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      isRefreshing = true

      try {
        // Chú ý: Dùng endpoint /Auth/refresh-token chuẩn viết hoa
        const res = await api.post('/Auth/refresh-token')

        // Bọc fallback lấy token từ res.data.accessToken hoặc res.data.token
        const newAccessToken = res.data?.accessToken || res.data?.token

        if (!newAccessToken) {
          throw new Error(
            'No access token returned from refresh token endpoint'
          )
        }

        localStorage.setItem('accessToken', newAccessToken)
        api.defaults.headers.common['Authorization'] =
          `Bearer ${newAccessToken}`

        processQueue(null, newAccessToken)
        isRefreshing = false

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        isRefreshing = false
        localStorage.removeItem('accessToken')
        window.location.href = '/sign-in'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
