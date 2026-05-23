import { http } from '@/utils/request.ts'
import type { Pageable } from '@/api/types/SharedTypes.ts'
import type { DishPageRequest, DishRequest, FindDishResponse } from '@/api/types/DishTypes.ts'

/** 分页查询菜品 */
export const pageDish = (params?: DishPageRequest) => {
	return http.request<Pageable<FindDishResponse>>('get', '/dish/page', params)
}

/** 查询全部菜品 */
export const allDish = () => {
	return http.request<FindDishResponse[]>('get', '/dish/all')
}

/** 创建菜品 */
export const createDish = (data: DishRequest) => {
	return http.post<FindDishResponse>('/dish', data)
}

/** 修改菜品 */
export const updateDish = (id: string | number, data: DishRequest) => {
	return http.put<FindDishResponse>(`/dish/${id}`, data)
}

/** 删除菜品 */
export const deleteDish = (id: string | number) => {
	return http.request<any>('delete', `/dish/${id}`)
}
