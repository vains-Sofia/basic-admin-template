export type OAuth2TokenResult = {
	/** `token` */
	access_token: string
	/** 用于调用刷新`accessToken`的接口时所需的`token` */
	refresh_token?: string
	/** `accessToken`的过期时间 */
	expires_in: number
	/** oidc id token */
	id_token?: string
	/** 客户端权限 */
	scope?: string
	/** token类型 */
	token_type: string
}
