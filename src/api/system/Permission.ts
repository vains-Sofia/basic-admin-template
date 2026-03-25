import { http } from '@/utils/request'
import type {
	DynamicRouter,
	FindPermissionRequest,
	FindPermissionResponse,
	SavePermissionRequest,
} from '@/api/types/PermissionTypes'

/** 获取动态路由 */
export const getAsyncRoutes = () => {
	return http.request<Array<DynamicRouter>>('get', '/permission/findUserRouters')
}

/** 获取系统管理-菜单管理列表 */
export const getMenuList = (params?: FindPermissionRequest) => {
	return http.request<Array<FindPermissionResponse>>(
		'get',
		'/permission/findPermissions',
		params,
	)
}

/** 添加权限信息 */
export const insertPermission = (data?: SavePermissionRequest) => {
	return http.post<string>('/permission/insertPermission', data)
}

/** 修改权限信息 */
export const updatePermission = (data?: SavePermissionRequest) => {
	return http.put<string>('/permission/updatePermission', data)
}

/** 批量修改权限信息 */
export const batchUpdatePermissions = (data?: Array<SavePermissionRequest>) => {
	return http.put<string>('/permission/batchUpdatePermissions', data)
}

/** 删除权限信息 */
export const removePermissionById = (id?: string) => {
	return http.request<string>('delete', `/permission/removeById/${id}`)
}

/** 获取角色管理-权限-菜单权限-根据角色 id 查对应菜单 */
export const getRoleMenuIds = (roleId?: string) => {
	return http.request<Array<string>>(
		'get',
		`/permission/findPermissionIdsByRoleId/${roleId}`,
	)
}
