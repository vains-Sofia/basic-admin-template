// 虽然字段很少 但是抽离出来 后续有扩展字段需求就很方便了

import type { SaveRoleRequest } from '@/api/types/RoleTypes.ts'
import type { FindPermissionResponse } from '@/api/types/PermissionTypes.ts'

interface FormProps {
	formInline: SaveRoleRequest
}

interface RoleMenuItemProps {
	roleId: string
	allMenus: Array<FindPermissionResponse>
}

interface RoleMenuProps {
	formInline: RoleMenuItemProps
}

export type { FormProps, RoleMenuProps, RoleMenuItemProps }
