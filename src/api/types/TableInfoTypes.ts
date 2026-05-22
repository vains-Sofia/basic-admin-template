import type { AuditFields, PageableRequest } from '@/api/types/SharedTypes.ts'
import type { TableStatusEnum } from '@/api/types/Enums.ts'

export interface TableInfoRequest {
	storeId: number
	name: string
	code?: string
	capacity?: number
	tableStatus?: TableStatusEnum
}

export interface TableInfoPageRequest extends PageableRequest {
	keyword?: string
	storeId?: number
	tableStatus?: TableStatusEnum
}

export interface FindTableInfoResponse extends AuditFields {
	id: number
	storeId: number
	name: string
	code: string
	capacity: number
	tableStatus: TableStatusEnum
}
