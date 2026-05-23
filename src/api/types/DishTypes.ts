import { RecommendEnum, StatusEnum } from '@/api/types/Enums.ts'
import type { AuditFields, PageableRequest } from '@/api/types/SharedTypes.ts'

export interface DishRequest {
	storeId: string
	categoryId: string
	name: string
	image?: string
	images?: string[]
	description?: string
	price: number
	labels?: string[]
	recommend?: RecommendEnum
	cookingTime?: number
	unit?: string
	sort?: number
	status?: StatusEnum
}

export interface DishPageRequest extends PageableRequest {
	keyword?: string
	storeId?: string
	categoryId?: string
}

export interface FindDishResponse extends AuditFields {
	id: string
	storeId: string
	categoryId: string
	name: string
	image: string
	images: string[]
	description: string
	price: number
	labels: string[]
	recommend: RecommendEnum
	cookingTime: number
	unit: string
	sales: number
	sort: number
	status: StatusEnum
}
