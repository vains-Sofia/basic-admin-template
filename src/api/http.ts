import axios, { type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

import { finishRequest, startRequest } from '@/services/request-status'

import type { ApiResponse } from './types/CommonTypes'

export interface RequestConfig extends AxiosRequestConfig {
  skipGlobalLoading?: boolean
  skipErrorMessage?: boolean
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15_000,
})

const loadingRequests = new WeakSet<object>()

http.interceptors.request.use((config) => {
  const requestConfig = config as RequestConfig
  if (!requestConfig.skipGlobalLoading) {
    startRequest()
    loadingRequests.add(config)
  }

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
  (response) => {
    if (loadingRequests.has(response.config)) {
      loadingRequests.delete(response.config)
      finishRequest()
    }
    return response
  },
  (error: unknown) => {
    const config = axios.isAxiosError(error) ? (error.config as RequestConfig | undefined) : undefined
    if (config && loadingRequests.has(config)) {
      loadingRequests.delete(config)
      finishRequest()
    }

    if (axios.isCancel(error)) return Promise.reject(error)

    const response = axios.isAxiosError(error) ? error.response : undefined
    if (response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }

    if (!config?.skipErrorMessage) {
      const responseData = response?.data as { message?: string } | undefined
      ElMessage.error(
        responseData?.message ??
          (error instanceof Error ? error.message : undefined) ??
          '请求失败，请稍后重试',
      )
    }

    return Promise.reject(error)
  },
)

export async function request<T>(config: RequestConfig): Promise<T> {
  const response = await http.request<ApiResponse<T>>(config)
  const payload = response.data

  if (payload.code !== 200) {
    if (!config.skipErrorMessage) ElMessage.error(payload.message || '请求失败')
    throw new Error(payload.message || 'Request failed')
  }

  return payload.data
}
