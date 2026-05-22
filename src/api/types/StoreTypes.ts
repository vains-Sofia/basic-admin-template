import type { AuditFields, PageableRequest } from '@/api/types/SharedTypes.ts'
import type { StatusEnum } from '@/api/types/Enums.ts'

export interface StoreRequest {
	name: string
	logo?: string
	status?: StatusEnum
	address?: string
	longitude?: number
	latitude?: number
	albums?: string[]
	businessHours?: string
	description?: string
}

export interface StorePageRequest extends PageableRequest {
	keyword?: string
	status?: StatusEnum
}

export interface FindStoreResponse extends AuditFields {
	id: string
	name: string
	logo: string
	status: StatusEnum
	address: string
	longitude: number
	latitude: number
	albums: string[]
	businessHours: string
	description: string
}
