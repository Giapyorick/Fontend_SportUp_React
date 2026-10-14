import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

// 1. Kiểm tra & đảm bảo BASE_URL luôn trỏ đúng domain RunASP.net
const rawApiUrl = import.meta.env.VITE_API_URL

const BASE_URL =
  !rawApiUrl || rawApiUrl.startsWith('/') || rawApiUrl.trim() === ''
    ? 'https://sportupdb.runasp.net/api'
    : rawApiUrl

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Bắt buộc để gửi & nhận RefreshToken Cookie
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

// 2. Request Interceptor: Gắn AccessToken sạch vào Header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let token = localStorage.getItem('accessToken')

    if (token && token !== 'undefined' && token !== 'null') {
      // Làm sạch token (loại bỏ tiền tố Bearer thừa nếu có)
      token = token.replace(/^Bearer\s+/i, '').trim()
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// 3. Response Interceptor: Tự động refresh token khi 401
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

      // Nếu chính API Refresh Token hoặc Login bị 401 -> Xóa Token & chuyển về /sign-in
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
        // Gọi API refresh-token với endpoint chuẩn /Auth/refresh-token
        const res = await api.post('/Auth/refresh-token')

        const rawToken = res.data?.accessToken || res.data?.token
        const newAccessToken =
          typeof rawToken === 'string'
            ? rawToken.replace(/^Bearer\s+/i, '').trim()
            : null

        if (!newAccessToken) {
          throw new Error('No access token returned from refresh token endpoint')
        }

        localStorage.setItem('accessToken', newAccessToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`

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