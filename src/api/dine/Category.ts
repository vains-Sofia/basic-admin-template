import { http } from '@/utils/request.ts'
import type { Pageable } from '@/api/types/SharedTypes.ts'
import type {
	CategoryPageRequest,
	CategoryRequest,
	FindCategoryResponse,
} from '@/api/types/CategoryTypes.ts'

/** 分页查询菜单分类 */
export const pageCategory = (params?: CategoryPageRequest) => {
	return http.request<Pageable<FindCategoryResponse>>('get', '/category/page', params)
}

/** 查询全部菜单分类 */
export const allCategory = () => {
	return http.request<FindCategoryResponse[]>('get', '/category/all')
}

/** 创建菜单分类 */
export const createCategory = (data: CategoryRequest) => {
	return http.post<FindCategoryResponse>('/category', data)
}

/** 修改菜单分类 */
export const updateCategory = (id: string | number, data: CategoryRequest) => {
	return http.put<FindCategoryResponse>(`/category/${id}`, data)
}

/** 删除菜单分类 */
export const deleteCategory = (id: string | number) => {
	return http.request<any>('delete', `/category/${id}`)
}
