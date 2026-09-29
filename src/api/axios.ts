import axios from 'axios'

// Nếu có biến môi trường thì dùng, nếu không thì mặc định trỏ về /api (tương thích cả khi deploy qua Vercel proxy)
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export default axios.create({
  baseURL: BASE_URL,
})
