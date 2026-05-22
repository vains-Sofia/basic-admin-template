import type { AuditFields, PageableRequest } from '@/api/types/SharedTypes.ts'

export interface DishAttributeOptionRequest {
	dishId: number
	optionId: number
	isAvailable?: boolean
	priceAdjustmentOverride?: number
}

export interface DishAttributeOptionPageRequest extends PageableRequest {
	dishId?: number
	optionId?: number
}

export interface FindDishAttributeOptionResponse extends AuditFields {
	id: number
	dishId: number
	optionId: number
	isAvailable: boolean
	priceAdjustmentOverride: number
}
