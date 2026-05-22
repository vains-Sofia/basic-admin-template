import type { AuditFields, PageableRequest } from '@/api/types/SharedTypes.ts'
import type { StatusEnum } from '@/api/types/Enums.ts'

export interface TableBindingRequest {
	tableId: number
	userId?: number
	status?: StatusEnum
	bindTime?: string
	unbindTime?: string
}

export interface TableBindingPageRequest extends PageableRequest {
	tableId?: number
	userId?: number
	status?: StatusEnum
}

export interface FindTableBindingResponse extends AuditFields {
	id: number
	tableId: number
	userId: number
	status: StatusEnum
	bindTime: string
	unbindTime: string
}
