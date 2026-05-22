import { http } from '@/utils/request.ts'
import type { Pageable } from '@/api/types/SharedTypes.ts'
import type { FindAttributeGroupResponse } from '@/api/types/AttributeGroupTypes.ts'
import type {
	AttributeOptionRequest,
	FindAttributeOptionResponse,
} from '@/api/types/AttributeOptionTypes.ts'

/**
 * 分页查询字典类型
 */
export const allGroup = () => {
	return http.request<FindAttributeGroupResponse[]>('get', '/attribute/group/all')
}

/**
 * 分页查询字典类型
 */
export const pageGroup = (params: any) => {
	return http.request<Pageable<FindAttributeGroupResponse>>(
		'get',
		'/attribute/group/page',
		params,
	)
}

/**
 * 创建字典类型
 */
export const createGroup = (data: any) => {
	return http.post<FindAttributeGroupResponse>('/attribute/group', data)
}

/**
 * 修改字典类型
 */
export const updateGroup = (id: string, data: any) => {
	return http.put<FindAttributeGroupResponse>(`/attribute/group/${id}`, data)
}

/**
 * 删除字典类型
 */
export const deleteGroup = (id: string) => {
	return http.request<any>('delete', `/attribute/group/${id}`)
}

/**
 * 分页查询字典项
 */
export const pageOption = (params: any) => {
	return http.request<Pageable<FindAttributeOptionResponse>>(
		'get',
		'/attribute/option/page',
		params,
	)
}

/**
 * 创建字典类型
 */
export const createOption = (data: AttributeOptionRequest) => {
	return http.post<FindAttributeOptionResponse>('/attribute/option', data)
}

/**
 * 修改字典类型
 */
export const updateOption = (id: string, data: any) => {
	return http.put<FindAttributeOptionResponse>(`/attribute/option/${id}`, data)
}

/**
 * 删除字典类型
 */
export const deleteOption = (id: string) => {
	return http.request<any>('delete', `/attribute/option/${id}`)
}

/**
 * 根据字典类型获取字典项
 */
export const groupOptions = (groupId: string) => {
	return http.request<FindAttributeOptionResponse[]>('get', `/dict/item/group/${groupId}`)
}
