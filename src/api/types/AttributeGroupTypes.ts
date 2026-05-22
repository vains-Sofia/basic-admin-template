import { SelectTypeEnum, type StatusEnum } from '@/api/types/Enums.ts'
import type { AuditFields, PageableRequest } from '@/api/types/SharedTypes.ts'

export interface AttributeGroupRequest {
	storeId: number
	name: string
	selectType?: SelectTypeEnum
	sort?: number
	status?: StatusEnum
}

export interface AttributeGroupPageRequest extends PageableRequest {
	keyword?: string
	storeId?: number
}

export interface FindAttributeGroupResponse extends AuditFields {
	id: string
	storeId: string
	name: string
	selectType: SelectTypeEnum
	sort: number
	status: StatusEnum
}
