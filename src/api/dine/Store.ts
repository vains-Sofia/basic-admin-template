import { http } from '@/utils/request.ts'
import type { Pageable } from '@/api/types/SharedTypes.ts'
import type { FindStoreResponse, StorePageRequest, StoreRequest } from '@/api/types/StoreTypes.ts'

/** 分页查询门店 */
export const pageStore = (params?: StorePageRequest) => {
	return http.request<Pageable<FindStoreResponse>>('get', '/store/page', params)
}

/** 查询全部门店 */
export const allStore = () => {
	return http.request<FindStoreResponse[]>('get', '/store/all')
}

/** 创建门店 */
export const createStore = (data: StoreRequest) => {
	return http.post<FindStoreResponse>('/store', data)
}

/** 修改门店 */
export const updateStore = (id: string | number, data: StoreRequest) => {
	return http.put<FindStoreResponse>(`/store/${id}`, data)
}

/** 删除门店 */
export const deleteStore = (id: string | number) => {
	return http.request<any>('delete', `/store/${id}`)
}
