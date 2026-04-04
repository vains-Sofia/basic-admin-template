import axios, {
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
} from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/Auth'
import type { OAuth2TokenResult } from '@/api/types/LoginTypes.ts'

// =======================
// 定义通用 API 响应格式
// =======================
export interface ApiResponse<T = any> {
	code: number
	message: string
	data: T
}

// =======================
// 自定义请求配置
// =======================
export interface RequestConfig<T> extends AxiosRequestConfig<T> {
	/** 是否跳过统一响应格式解析，直接返回原始数据 */
	rawResponse?: boolean
}

// =======================
// 创建 Axios 实例
// =======================
const service: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL || '/api',
	timeout: 15000,
	headers: {
		'Content-Type': 'application/json',
		'X-Requested-With': 'XMLHttpRequest',
	},
})

// =======================
// 请求拦截器
// =======================
service.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		/** 请求白名单，放置一些不需要`token`的接口（通过设置请求白名单，防止`token`过期后再请求造成的死循环问题） */
		const whiteList = [
			'/refresh',
			'/login',
			'/check/login',
			'/oauth2/token',
			'/oauth2/authorize',
			'/oauth2/consent/parameters',
			'/oauth2/device_verification',
		]
		const isWhiteUrl = whiteList.some((url) => config.url?.endsWith(url))
		if (isWhiteUrl) {
			return config
		}
		const minioBaseUrl = import.meta.env.VITE_MINIO_BASE_URL
		if (config.url?.startsWith(minioBaseUrl)) {
			return config
		}

		const authStore = useAuthStore()

		const token = `${authStore.accessToken?.token_type} ${authStore.accessToken?.access_token}`
		if (token) {
			config.headers.Authorization = `${token}`
		}
		return config
	},
	(error) => Promise.reject(error),
)

// ==================== 刷新核心 ====================
let isRefreshing = false
let requestsQueue: ((newToken: any) => void)[] = []

// 清空队列（优雅失败）
function clearQueue(callback: any) {
	requestsQueue.forEach((cb) => cb(callback))
	requestsQueue = [] // 清空
}

// =======================
// 响应拦截器
// =======================
service.interceptors.response.use(
	(response: AxiosResponse) => response,
	async (error) => {
		const { response, config } = error

		if (config?.url?.endsWith('/token/logout')) {
			return Promise.reject(error)
		}

		const authStore = useAuthStore()
		// 如果是刷新接口 401 → 直接登出
		if (config?.url === '/token/refresh') {
			clearQueue(false)
			// 登出
			router.push({ path: '/login' }).then(() =>
				ElMessage({
					showClose: true,
					message: response?.data?.message || '刷新token失败，请重新登录！',
					type: 'error',
				}),
			)
			return Promise.reject(error)
		}

		if (response.status === 401) {
			// ============== 401 刷新逻辑 ==============
			if (!isRefreshing) {
				isRefreshing = true

				try {
					// 1. 刷新 Token
					const res = await http.post<OAuth2TokenResult>(
						'/token/refresh',
						{
							refreshToken: authStore.accessToken?.refresh_token,
						},
						{ rawResponse: true },
					)

					authStore.accessToken = res

					// 2. 刷新成功 → 执行队列
					clearQueue(res)

					// 3. 重发当前请求
					config.headers.Authorization = `${res.token_type} ${res.access_token}`
					return service(config)
				} catch (e) {
					// 刷新失败 → 登出
					clearQueue(false)
					return Promise.reject(e)
				} finally {
					isRefreshing = false
				}
			} else {
				// 正在刷新 → 加入队列
				return new Promise((resolve, reject) => {
					requestsQueue.push((res) => {
						if (res && res.access_token) {
							config.headers.Authorization = `${res.token_type} ${res.access_token}`
							resolve(service(config))
						} else {
							reject(error)
						}
					})
				})
			}
		} else {
			if (response) {
				console.error(response)
				processErrorResponse(response)
			} else {
				ElMessage({
					showClose: true,
					message: '网络错误或服务器未响应',
					type: 'error',
				})
			}
			return Promise.reject(error)
		}
	},
)

// =======================
// 核心请求方法
// =======================
const request = async <T = any>(config: RequestConfig<T>): Promise<T> => {
	const { rawResponse = false, ...axiosConfig } = config
	const response = await service.request<ApiResponse<T>>(axiosConfig)

	if (!config.url?.endsWith('/token/logout')) {
		processErrorResponse(response, rawResponse)
	}

	// 如果是特殊接口，不走统一 ApiResponse 格式解析
	if (rawResponse) {
		return response.data as T
	}

	// 按统一格式解析
	const res = response.data
	if (res.code && res.code !== 200) {
		return Promise.reject(res)
	}
	return res.data
}

// =======================
// 快捷方法封装
// =======================
const http = {
	request: <T = any>(method: string, url: string, params?: any, config?: RequestConfig<T>) =>
		request<T>({
			url,
			method,
			params,
			...config,
		}),

	get: <T = any>(url: string, params?: any, config?: RequestConfig<T>) =>
		request<T>({
			url,
			method: 'GET',
			params,
			...config,
		}),

	post: <T = any>(url: string, data?: any, config?: RequestConfig<T>) =>
		request<T>({
			url,
			method: 'POST',
			data,
			...config,
		}),

	put: <T = any>(url: string, data?: any, config?: RequestConfig<T>) =>
		request<T>({
			url,
			method: 'PUT',
			data,
			...config,
		}),

	delete: <T = any>(url: string, params?: any, config?: RequestConfig<T>) =>
		request<T>({
			url,
			method: 'DELETE',
			params,
			...config,
		}),
}

/**
 * 处理异常响应
 * @param response 响应对象
 * @param rawResponse 是否保持原始响应
 */
const processErrorResponse = (response: AxiosResponse, rawResponse: boolean = false) => {
	let message = undefined
	let { status } = response
	if (status === 200) {
		if (response.data && response.data.code && response.data.code !== 200 && !rawResponse) {
			status = response.data.code
			message = response.data.message
		} else {
			// 不处理
			return
		}
	} else if (response.data && !rawResponse) {
		if (response.data.code) {
			status = response.data.code
		}
		if (response.data.message) {
			message = response.data.message
		}
	}
	switch (status) {
		case 401:
			if (window.location.pathname !== '/login') {
				router.push('/login').then(() =>
					ElMessage({
						showClose: true,
						message: message || '登录失效，请重新登录',
						type: 'error',
					}),
				)
			} else {
				ElMessage({
					showClose: true,
					message: message || '登录失效，请重新登录',
					type: 'error',
				})
			}
			break
		case 403:
			ElMessage({
				showClose: true,
				message: message || '权限不足，拒绝访问',
				type: 'error',
			})
			break
		case 404:
			ElMessage({
				showClose: true,
				message: message || '接口不存在',
				type: 'error',
			})
			break
		case 500:
			ElMessage({
				showClose: true,
				message: message || '服务器错误',
				type: 'error',
			})
			break
		default:
			ElMessage({
				showClose: true,
				message: message || '未知错误',
				type: 'error',
			})
	}
}

export { http }
