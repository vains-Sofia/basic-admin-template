import axios from 'axios'

export interface NormalizedError {
  message: string
  status?: number
  code?: string | number
  original: unknown
  canceled: boolean
  network: boolean
}

export function getErrorMessage(error: unknown, fallback = '操作失败，请稍后重试'): string {
  if (typeof error === 'string' && error.trim()) return error
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }
  return fallback
}

export function normalizeError(error: unknown, fallback?: string): NormalizedError {
  const canceled = axios.isCancel(error)
  const response = axios.isAxiosError(error) ? error.response : undefined
  return {
    message: getErrorMessage(error, fallback),
    status: response?.status,
    code: response?.data?.code ?? (axios.isAxiosError(error) ? error.code : undefined),
    original: error,
    canceled,
    network: !canceled && axios.isAxiosError(error) && !response,
  }
}
