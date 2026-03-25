import type { PageableRequest } from '@/api/types/ModelTypes.ts'
import { GenderEnum } from '@/api/types/Enums.ts'

/**
 * 查询基础用户信息响应
 */
export interface FindBasicUserResponse {
	/** 主键id */
	id?: string

	/** 账号 */
	username?: string

	/** 用户名、昵称 */
	nickname?: string

	/** 用户个人资料页面的 URL。 */
	profile?: string

	/**
	 * 用户个人资料图片的 URL。
	 * 此 URL 必须指向图像文件（例如，PNG、JPEG 或 GIF 图像文件），而不是指向包含图像的网页。
	 */
	picture?: string

	/**
	 * 用户的首选电子邮件地址。
	 * 其值必须符合 RFC 5322 addr-spec 语法。
	 */
	email?: string

	/** 邮箱是否验证过 */
	emailVerified?: boolean

	/** 用户性别 */
	gender?: GenderEnum

	/** 出生日期 (ISO 8601 YYYY-MM-DD) */
	birthdate?: string

	/** 手机号 */
	phoneNumber?: string

	/** 手机号是否已验证 */
	phoneNumberVerified?: boolean

	/** 用户的首选邮政地址 */
	address?: string

	/** 是否已删除 */
	deleted?: boolean

	/** 用户来源 */
	accountPlatform?: OAuth2AccountPlatformEnum

	/** 创建人名称 */
	createName?: string

	/** 修改人名称 */
	updateName?: string

	/** 创建时间 */
	createTime?: string

	/** 修改时间 */
	updateTime?: string
}

/**
 * OAuth2 账户平台来源枚举
 */
export enum OAuth2AccountPlatformEnum {
	SYSTEM = 'SYSTEM',
	GITHUB = 'GITHUB',
	GITEE = 'GITEE',
	WECHAT = 'WECHAT',
}
/**
 * 保存或修改用户入参
 */
export interface SaveBasicUserRequest {
	/** 用户id（修改时必传） */
	id?: string

	/** 昵称 */
	nickname: string

	/** 账号 */
	username: string

	/** 密码（修改时无效） */
	password?: string

	/** 邮箱地址 */
	email: string

	/**
	 * 用户个人资料图片的 URL。
	 * 此 URL 必须指向图像文件（例如 PNG、JPEG 或 GIF），而不是包含图像的网页。
	 */
	picture?: string

	/** 用户性别 */
	gender?: GenderEnum

	/** 出生日期 (ISO 8601 YYYY-MM-DD) */
	birthdate?: string

	/** 用户地址 */
	address?: string

	/** 手机号 */
	phoneNumber?: string

	/** 用户来源（默认为 system） */
	accountPlatform?: OAuth2AccountPlatformEnum
}

/**
 * 更新用户角色入参
 */
export interface UpdateUserRolesRequest {
	/** 用户id */
	userId: string

	/** 角色id列表 */
	roleIds?: string[]
}

/**
 * 重置密码入参
 */
export interface ResetPasswordRequest {
	/** 用户id */
	userId: string

	/** 新的密码 */
	password: string
}

/**
 * 分页查询用户入参
 */
export interface FindBasicUserPageRequest extends PageableRequest {
	/** 用户名、昵称 */
	nickname?: string

	/** 用户的首选电子邮件地址 */
	email?: string

	/** 用户性别 */
	gender?: GenderEnum
}

export interface BasicGrantedAuthority {
	/**
	 * 主键id
	 */
	id?: number;

	/**
	 * 权限码
	 */
	authority: string;

	/**
	 * 路径
	 */
	path?: string;

	/**
	 * 权限码
	 */
	permission?: string;

	/**
	 * 请求方式
	 */
	requestMethod?: string;

	/**
	 * 是否需要鉴权
	 */
	needAuthentication?: boolean;

	/**
	 * 权限类型
	 */
	permissionType: number;
}

export type UserInfo = {
	/**
	 * 用户账号，发行方的最终用户标识符。
	 */
	sub: string;

	/**
	 * 昵称
	 */
	nickname: string;

	/**
	 * 用户个人资料页面的 URL。
	 */
	profile: string;

	/**
	 * 用户个人资料图片的 URL。
	 */
	picture: string;

	/**
	 * 用户的首选电子邮件地址。
	 */
	email: string;

	/**
	 * 邮箱是否已验证
	 */
	emailVerified: boolean;

	/**
	 * 用户的性别
	 */
	gender: GenderEnum;

	/**
	 * 出生日期，ISO 8601 格式：YYYY-MM-DD
	 */
	birthdate: string;

	/**
	 * 手机号
	 */
	phoneNumber: string;

	/**
	 * 手机号是否已验证
	 */
	phoneNumberVerified: boolean;

	/**
	 * 用户的首选邮政地址。
	 */
	address: string;

	/**
	 * 用户信息最后更新时间。以时间戳表示。
	 */
	updatedAt: number;

	// -----------扩展信息-----------

	/**
	 * 自增id
	 */
	id: number;

	/**
	 * 账号
	 */
	account: string;

	/**
	 * 账号来源类型
	 */
	accountPlatform: string;

	/**
	 * 检查过，即是否已确认绑定
	 */
	bindBasicUserChecked: boolean;

	/**
	 * 用户角色
	 */
	roles: Array<string>;

	/**
	 * 用户角色
	 */
	authorities: Array<BasicGrantedAuthority>;
};
