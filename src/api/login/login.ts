import { http } from '@/utils/request.ts'
import type { OAuth2TokenResult } from '@/api/types/LoginTypes.ts'

/**
 * 表单登录
 * @param data 请求体
 * @param loginType 登录方式
 */
export const formLogin = (loginType: string, data: any) => {
	// 请求头
	const headers = {
		'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
	}

	// 请求路径
	let url = '/login'
	if (loginType !== 'account') {
		url = `${url}/${loginType}`
	}

	return http.post<OAuth2TokenResult>(url, data, { headers, rawResponse: true })
}
