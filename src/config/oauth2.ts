import { OAUTH2_CALLBACK_ROUTE } from './app'

export interface OAuth2Config {
  enabled: boolean
  clientId: string
  authorizationUrl: string
  tokenUrl: string
  userInfoUrl: string
  scope: string
  redirectUri: string
  rolesClaim: string
  permissionsClaim: string
}

function getDefaultRedirectUri(): string {
  const basePath = import.meta.env.BASE_URL.replace(/\/?$/, '/')
  return new URL(`${basePath}${OAUTH2_CALLBACK_ROUTE.slice(1)}`, window.location.origin).toString()
}

export function getOAuth2Config(): OAuth2Config {
  const configuredRedirectUri = import.meta.env.VITE_OAUTH2_REDIRECT_URI?.trim()

  return {
    enabled: import.meta.env.VITE_OAUTH2_ENABLED === 'true',
    clientId: import.meta.env.VITE_OAUTH2_CLIENT_ID?.trim() ?? '',
    authorizationUrl: import.meta.env.VITE_OAUTH2_AUTHORIZATION_URL?.trim() ?? '',
    tokenUrl: import.meta.env.VITE_OAUTH2_TOKEN_URL?.trim() ?? '',
    userInfoUrl: import.meta.env.VITE_OAUTH2_USERINFO_URL?.trim() ?? '',
    scope: import.meta.env.VITE_OAUTH2_SCOPE?.trim() ?? '',
    redirectUri: configuredRedirectUri
      ? new URL(configuredRedirectUri, window.location.origin).toString()
      : getDefaultRedirectUri(),
    rolesClaim: import.meta.env.VITE_OAUTH2_ROLES_CLAIM?.trim() || 'roles',
    permissionsClaim: import.meta.env.VITE_OAUTH2_PERMISSIONS_CLAIM?.trim() || 'permissions',
  }
}

export function isOAuth2Enabled(): boolean {
  return import.meta.env.VITE_OAUTH2_ENABLED === 'true'
}
