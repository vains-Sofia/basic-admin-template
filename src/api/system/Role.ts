import { http } from '@/utils/request.ts'
import type { Pageable } from '@/api/types/ModelTypes.ts'
import type {
	FindRolePageRequest,
	FindRoleResponse,
	SaveRoleRequest,
	UpdateRolePermissionsRequest,
} from '@/api/types/RoleTypes.ts'

/** 获取系统管理-角色管理列表 */
export const getRoleList = (params?: FindRolePageRequest) => {
	return http.request<Pageable<FindRoleResponse>>('get', '/role/findByPage', params)
}

/** 添加角色信息 */
export const insertRole = (data?: SaveRoleRequest) => {
	return http.post<string>('/role/insertRole', data)
}

/** 修改角色信息 */
export const updateRole = (data?: SaveRoleRequest) => {
	return http.put<string>('/role/updateRole', data)
}

/** 删除角色信息 */
export const removeRoleById = (id?: string) => {
	return http.request<string>('delete', `/role/removeById/${id}`)
}

/** 角色管理-权限-菜单权限-修改角色 id 查对应菜单 */
export const updateRolePermissions = (data?: UpdateRolePermissionsRequest) => {
	return http.put<string>(`/role/updateRolePermissions`, data)
}

/** 系统管理-用户管理-获取所有角色列表 */
export const getAllRoleList = () => {
	return http.request<Array<FindRoleResponse>>('get', '/role/findRoles')
}
