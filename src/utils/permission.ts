export function hasRole(requiredRoles: string[] | undefined, userRoles: string[]): boolean {
  return !requiredRoles?.length || requiredRoles.some((role) => userRoles.includes(role))
}

export function hasPermission(required: string | string[], userPermissions: string[]): boolean {
  if (userPermissions.includes('*')) return true
  const permissions = Array.isArray(required) ? required : [required]
  return permissions.every((permission) => userPermissions.includes(permission))
}
