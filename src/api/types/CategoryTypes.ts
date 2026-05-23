import type { AuditFields, PageableRequest } from '@/api/types/SharedTypes'
import type { StatusEnum } from '@/api/types/Enums'

export interface CategoryRequest {
	storeId: string
	name: string
	sort?: number
	status?: StatusEnum
}

export interface CategoryPageRequest extends PageableRequest {
	keyword?: string
	storeId?: string
}

export interface FindCategoryResponse extends AuditFields {
	id: string
	storeId: string
	name: string
	sort: number
	status: StatusEnum
}
