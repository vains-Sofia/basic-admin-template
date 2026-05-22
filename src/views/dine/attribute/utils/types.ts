import type { FindAttributeGroupResponse } from '@/api/types/AttributeGroupTypes.ts'
import type { AttributeOptionRequest } from '@/api/types/AttributeOptionTypes.ts'

interface FormItemProps extends AttributeOptionRequest {
	[key: string]: any
}

interface FormProps {
	formInline?: FormItemProps
	groupId?: string
	sort?: number
	allTypes?: FindAttributeGroupResponse[]
}

export type { FormItemProps, FormProps }
