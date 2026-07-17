import axios, { type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

import type { ApiResponse } from './types/CommonTypes'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15_000,
})

http.interceptors.request.use((config) => {
  const persistedUser = localStorage.getItem('admin-user')

  if (persistedUser) {
    try {
      const token = (JSON.parse(persistedUser) as { token?: string }).token
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {
      localStorage.removeItem('admin-user')
    }
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: { response?: { status?: number; data?: { message?: string } }; message?: string }) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }

    ElMessage.error(error.response?.data?.message ?? error.message ?? '请求失败，请稍后重试')
    return Promise.reject(error)
  },
)

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await http.request<ApiResponse<T>>(config)
  const payload = response.data

  if (payload.code !== 0) {
    ElMessage.error(payload.message || '请求失败')
    throw new Error(payload.message || 'Request failed')
  }

  return payload.data
}
