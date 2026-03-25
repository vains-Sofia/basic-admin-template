import type { FindSysDictTypeResponse, SysDictItemRequest } from '@/api/types/DictTypes.ts'

interface FormItemProps extends SysDictItemRequest {
	[key: string]: any
}

interface FormProps {
	formInline?: FormItemProps,
	typeCode?: string,
	sortOrder?: number,
	allTypes?: FindSysDictTypeResponse[]
}

export type { FormItemProps, FormProps }
