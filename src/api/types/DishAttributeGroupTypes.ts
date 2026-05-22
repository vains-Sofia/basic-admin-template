import type { AuditFields, PageableRequest } from '@/api/types/SharedTypes.ts'

export interface DishAttributeGroupRequest {
	dishId: number
	groupId: number
	required?: boolean
	sort?: number
}

export interface DishAttributeGroupPageRequest extends PageableRequest {
	dishId?: number
	groupId?: number
}

export interface FindDishAttributeGroupResponse extends AuditFields {
	id: number
	dishId: number
	groupId: number
	required: boolean
	sort: number
}
