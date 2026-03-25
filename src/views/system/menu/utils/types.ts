import type { SavePermissionRequest } from '@/api/types/PermissionTypes.ts'

interface FormItemProps extends SavePermissionRequest {
	[key: string]: any
}

interface FormProps {
	formInline?: FormItemProps
	rank?: number
	parentId?: string
	higherMenuOptions?: []
}

export type { FormItemProps, FormProps }
