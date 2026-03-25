import { http } from '@/utils/request.ts'
import type { FilePreSignedRequest, FilePreSignedResponse } from '@/api/types/CommonTypes.ts'

/** 文件上传预签名 */
export const uploadPreSigned = (data?: FilePreSignedRequest) => {
	return http.put<FilePreSignedResponse>(`/file/pre/signed`, data)
};

/** 使用预签名地址上传 */
export const uploadByPreSignedUrl = (
	preSignedUrl: string,
	data: object,
	fileType: string
) => {
	return http.put<any>(
		preSignedUrl,
		data,
		{
			headers: {
				"Content-Type": fileType
			},
			rawResponse: true
		}
	);
};

/** 获取登录验证码 */
export const getEmailCaptcha = (email: string) => {
	return http.request<string>('get', '/captcha/getEmailCaptcha', { email })
};
