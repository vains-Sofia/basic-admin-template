import { http } from '@/utils/request.ts'
import type { Pageable } from '@/api/types/SharedTypes.ts'
import type {
    FindTableInfoResponse,
    TableInfoPageRequest,
    TableInfoRequest,
} from '@/api/types/TableInfoTypes.ts'

/** 分页查询桌台 */
export const pageTable = (params?: TableInfoPageRequest) => {
    return http.request<Pageable<FindTableInfoResponse>>('get', '/table/info/page', params)
}

/** 查询全部桌台 */
export const allTable = () => {
    return http.request<FindTableInfoResponse[]>('get', '/table/info/all')
}

/** 创建桌台 */
export const createTable = (data: TableInfoRequest) => {
    return http.post<FindTableInfoResponse>('/table/info', data)
}

/** 修改桌台 */
export const updateTable = (id: string | number, data: TableInfoRequest) => {
    return http.put<FindTableInfoResponse>(`/table/info/${id}`, data)
}

/** 删除桌台 */
export const deleteTable = (id: string | number) => {
    return http.request<any>('delete', `/table/info/${id}`)
}
