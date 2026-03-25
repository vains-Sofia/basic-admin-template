/**
 * 文件预签名入参
 */
export interface FilePreSignedRequest {
	/**
	 * 文件名，格式：文件名.UUID.后缀名
	 * 对应 @NotBlank
	 */
	name: string;

	/**
	 * 文件所在的存储桶，默认 basic-cloud
	 */
	bucket?: string;

	/**
	 * 文件预签名过期时间（秒），默认 604800 秒（7 天）
	 */
	expireTimes?: number;
}

/**
 * 文件预签名响应
 */
export interface FilePreSignedResponse {
	/**
	 * 文件唯一标识
	 */
	name: string;

	/**
	 * 文件访问地址
	 */
	url: string;

	/**
	 * 文件所在的存储桶
	 */
	bucket: string;
}
