import type { AuditFields, PageableRequest } from '@/api/types/SharedTypes.ts'
import type { TableStatusEnum } from '@/api/types/Enums.ts'

export interface TableInfoRequest {
	storeId: string
	name: string
	code?: string
	capacity?: number
	tableStatus?: TableStatusEnum
}

export interface TableInfoPageRequest extends PageableRequest {
	keyword?: string
	storeId?: string
	tableStatus?: TableStatusEnum
}

export interface FindTableInfoResponse extends AuditFields {
	id: string
	storeId: string
	storeName: string
	name: string
	code: string
	capacity: number
	tableStatus: TableStatusEnum
}
