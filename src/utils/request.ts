import axios, {
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
} from 'axios'

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
// Token 处理
// =======================
let authToken: string | null = localStorage.getItem('token')

export const setToken = (token: string | null) => {
	authToken = token
	if (token) {
		localStorage.setItem('token', token)
	} else {
		localStorage.removeItem('token')
	}
}

const getToken = () => authToken

// =======================
// 请求拦截器
// =======================
service.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		/** 请求白名单，放置一些不需要`token`的接口（通过设置请求白名单，防止`token`过期后再请求造成的死循环问题） */
		const whiteList = [
			'/refresh-token',
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

		const token = getToken()
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	(error) => Promise.reject(error),
)

// =======================
// 响应拦截器
// =======================
service.interceptors.response.use(
	(response: AxiosResponse) => response,
	(error) => {
		if (error.response) {
			console.error(error.response)
			processErrorResponse(error.response)
		} else {
			ElMessage({
				showClose: true,
				message: '网络错误或服务器未响应',
				type: 'error',
			})
		}
		return Promise.reject(error)
	},
)

// =======================
// 核心请求方法
// =======================
const request = async <T = any>(config: RequestConfig<T>): Promise<T> => {
	const { rawResponse = false, ...axiosConfig } = config
	const response = await service.request<ApiResponse<T>>(axiosConfig)

	processErrorResponse(response, rawResponse)

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
	} else if (response.data && response.data.message && !rawResponse) {
		status = response.data.code
		message = response.data.message
	}
	switch (status) {
		case 401:
			if (window.location.pathname !== '/login') {
				window.location.pathname = '/login'
			}
			ElMessage({
				showClose: true,
				message: message || '登录失效，请重新登录',
				type: 'error',
			})
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
