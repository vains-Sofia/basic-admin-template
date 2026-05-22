import type { AuditFields, PageableRequest } from '@/api/types/SharedTypes'
import type { StatusEnum } from '@/api/types/Enums'

export interface CategoryRequest {
	storeId: number
	name: string
	sort?: number
	status?: StatusEnum
}

export interface CategoryPageRequest extends PageableRequest {
	keyword?: string
	storeId?: number
}

export interface FindCategoryResponse extends AuditFields {
	id: number
	storeId: number
	name: string
	sort: number
	status: StatusEnum
}
