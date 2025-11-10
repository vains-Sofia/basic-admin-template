import { http } from '@/utils/request.ts'

/**
 * 表单登录
 * @param data 请求体
 * @param oauth2Login 是否OAuth2登录
 * @param loginType 登录方式
 */
export const formLogin = (data: any, oauth2Login: boolean, loginType: string) => {
	// 请求头
	const headers = {
		'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
		'X-Admin-Platform-Login': 'Admin-Platform-Login',
	}
	if (oauth2Login) {
		headers['X-Admin-Platform-Login'] = ''
	}

	// 请求路径
	let url = '/auth/login'
	if (loginType === 'email' || loginType === 'qrcode') {
		url = `${url}/${loginType}`
	}

	return http.post(url, data, { headers })
}
