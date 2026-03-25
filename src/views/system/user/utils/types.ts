import type { SaveBasicUserRequest } from '@/api/types/UserTypes.ts'
import type { FindRoleResponse } from '@/api/types/RoleTypes.ts'

interface FormItemProps extends SaveBasicUserRequest {
	[key: string]: any
}

interface FormProps {
	formInline?: FormItemProps
}

interface RoleFormItemProps {
	userId: string
	userRoles: Array<string>
	allRoles: Array<FindRoleResponse>
}
interface RoleFormProps {
	formInline: RoleFormItemProps
}

export type { FormItemProps, FormProps, RoleFormItemProps, RoleFormProps }
