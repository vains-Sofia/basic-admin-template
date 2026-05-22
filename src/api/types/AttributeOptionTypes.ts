import type { AuditFields, PageableRequest } from '@/api/types/SharedTypes.ts'
import type { StatusEnum } from '@/api/types/Enums.ts'

export interface AttributeOptionRequest {
	groupId: number
	name: string
	priceAdjustment?: number
	sort?: number
	status?: StatusEnum
}

export interface AttributeOptionPageRequest extends PageableRequest {
	keyword?: string
	groupId?: number
}

export interface FindAttributeOptionResponse extends AuditFields {
	id: string
	groupId: number
	name: string
	priceAdjustment: number
	sort: number
	status: StatusEnum
}
