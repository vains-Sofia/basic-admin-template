import { PermissionTypeEnum } from '@/api/types/Enums.ts'

/**
 * 动态路由数据模型
 */
export interface DynamicRouter {
	/** 唯一数据id */
	id?: number;

	/**
	 * 路由名称
	 * 必须唯一并且和当前路由 `component` 对应页面里 `defineOptions` 包起来的 `name` 保持一致
	 */
	name?: string;

	/** 路由路径 */
	path?: string;

	/**
	 * 组件路径
	 * 如果传 `component`，那么 `path` 可随意填写；
	 * 如果不传，则 `component` 会与 `path` 保持一致
	 */
	component?: string;

	/** 路由重定向地址 */
	redirect?: string;

	/** 当前路由元数据 */
	meta?: DynamicRouterMeta;

	/** 路由子节点 */
	children?: DynamicRouter[];
}

/**
 * 动态路由元数据模型
 */
export interface DynamicRouterMeta {
	/**
	 * 菜单名称
	 * 若使用国际化写法，需在根目录的 `locales` 文件夹下对应添加
	 */
	title?: string;

	/** 菜单图标 */
	icon?: string;

	/** 右侧图标 */
	extraIcon?: string;

	/** 是否显示该菜单 */
	showLink?: boolean;

	/** 是否显示父级菜单 */
	showParent?: boolean;

	/**
	 * 是否缓存该路由页面
	 * 开启后会保存页面整体状态，刷新后清空
	 */
	keepAlive?: boolean;

	/** 当路由是内嵌 iframe 时使用此字段指定链接地址 */
	frameSrc?: string;

	/** 内嵌 iframe 时的加载状态显示方式 */
	frameLoading?: string;

	/** 是否在标签栏中隐藏此路由对应的标签页 */
	hiddenTag?: boolean;

	/** 是否固定标签页，固定后不可关闭 */
	fixedTag?: boolean;

	/** 用于指定菜单高亮的路径 */
	activePath?: string;

	/** 菜单的排序序号，数字越小越靠前 */
	rank?: number;

	/** 路由动画配置 */
	transition?: DynamicRouterTransition;

	/** 展示菜单需要的权限列表 */
	auths?: string[];
}

/**
 * 路由动画配置模型
 */
export interface DynamicRouterTransition {
	/** 当前路由动画效果 */
	name?: string;

	/** 页面进入时的动画效果配置 */
	enterTransition?: string;

	/** 页面离开时的动画效果配置 */
	leaveTransition?: string;
}

/**
 * 查询权限信息入参
 */
export interface FindPermissionRequest {
	/** 权限名 */
	name?: string;

	/** 权限码 */
	permission?: string;

	/** 路径 */
	path?: string;

	/** 菜单类型 */
	permissionType?: PermissionTypeEnum;
}

/**
 * 权限信息响应
 * 包含权限的详细信息，包括路由、菜单和接口权限等配置
 */
export interface FindPermissionResponse {
	/** 主键id */
	id?: string;

	/** 路由名称 */
	name?: string;

	/** 菜单名称（兼容国际化、非国际化） */
	title?: string;

	/** 权限码，例如 system:user:create */
	permission?: string;

	/** API路径或前端路由路径 */
	path?: string;

	/** HTTP请求方式，例如 GET、POST、PUT、DELETE */
	requestMethod?: string;

	/** 权限类型，包括菜单、按钮、接口等 */
	permissionType?: PermissionTypeEnum;

	/** 所属模块名字 */
	moduleName?: string;

	/** 权限描述 */
	description?: string;

	/** 是否需要鉴权 */
	needAuthentication?: boolean;

	/** 父节点id，用于权限树结构 */
	parentId?: number;

	/** 前端路由对应的组件文件路径 */
	component?: string;

	/** 路由重定向 */
	redirect?: string;

	/** 菜单图标 */
	icon?: string;

	/** 右侧图标 */
	extraIcon?: string;

	/** 页面进场动画 */
	enterTransition?: string;

	/** 页面离场动画 */
	leaveTransition?: string;

	/** 内嵌iframe链接地址 */
	frameSrc?: string;

	/** iframe加载动画控制 */
	frameLoading?: string;

	/** 是否缓存页面 */
	keepAlive?: boolean;

	/** 是否显示该菜单 */
	showLink?: boolean;

	/** 隐藏标签页 */
	hiddenTag?: boolean;

	/** 固定标签页 */
	fixedTag?: boolean;

	/** 是否显示父级菜单 */
	showParent?: boolean;

	/** 菜单排序权重 */
	rank?: number;

	/** 指定激活菜单的 path */
	activePath?: string;

	/** 创建人名称 */
	createName?: string;

	/** 修改人名称 */
	updateName?: string;

	/** 创建时间 (ISO 8601) */
	createTime?: string;

	/** 修改时间 (ISO 8601) */
	updateTime?: string;

	/** 子节点 */
	children?: FindPermissionResponse[];
}

/**
 * 保存或修改权限信息入参
 */
export interface SavePermissionRequest {
	/** 主键id（修改时必传） */
	id?: string;

	/** 权限名 */
	name: string;

	/**
	 * 菜单名称（兼容国际化、非国际化）
	 * 如果用国际化的写法必须在根目录的 locales 文件夹下对应添加
	 */
	title: string;

	/** 权限码 */
	permission?: string;

	/** 路径 */
	path: string;

	/** HTTP请求方式 */
	requestMethod?: string;

	/** 菜单类型 */
	permissionType: PermissionTypeEnum;

	/** 所属模块名字 */
	moduleName?: string;

	/** 描述 */
	description?: string;

	/** 是否需要鉴权 */
	needAuthentication?: boolean;

	/** 父节点id */
	parentId?: string;

	/** 组件路径 */
	component?: string;

	/** 路由重定向 */
	redirect?: string;

	/** 菜单图标 */
	icon?: string;

	/** 右侧图标 */
	extraIcon?: string;

	/** 页面进场动画 */
	enterTransition?: string;

	/** 页面离场动画 */
	leaveTransition?: string;

	/** iframe 链接地址 */
	frameSrc?: string;

	/** iframe 加载动画控制 */
	frameLoading?: string;

	/** 是否缓存页面 */
	keepAlive?: boolean;

	/** 是否显示该菜单 */
	showLink?: boolean;

	/** 隐藏标签页 */
	hiddenTag?: boolean;

	/** 固定标签页 */
	fixedTag?: boolean;

	/** 是否显示父级菜单 */
	showParent?: boolean;

	/** 菜单排序 */
	rank?: number;

	/** 指定激活菜单的 path，用于高亮显示当前激活的菜单项 */
	activePath?: string;
}
