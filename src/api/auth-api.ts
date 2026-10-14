import api from './axios'

export type LoginDto = {
  username: string
  password: string
}

export type AuthResponseDto = {
  accessToken: string
  username: string
  fullName: string
  role: string
  expiresAt: string
}

export const loginApi = async (data: LoginDto): Promise<AuthResponseDto> => {
     // eslint-disable-next-line no-console
  console.log('1. [API Call] Calling /auth/login with data:', data)
  try {
    const response = await api.post<AuthResponseDto>('/auth/login', data)
     // eslint-disable-next-line no-console
    console.log('2. [API Success] Response from Backend:', response)
    return response.data
  } catch (error) {
     // eslint-disable-next-line no-console
    console.error('2. [API Error] Failed to login:', error)
    throw error
  }
}

export const logoutApi = async () => {
  const response = await api.post('/auth/logout')
  return response.data
}