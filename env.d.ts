/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * 基础路径
   */
  readonly VITE_BASE_PATH: string
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_USE_MOCK: 'true' | 'false'
  readonly VITE_API_PROXY_TARGET?: string
  readonly VITE_OAUTH2_ENABLED: 'true' | 'false'
  readonly VITE_OAUTH2_CLIENT_ID?: string
  readonly VITE_OAUTH2_AUTHORIZATION_URL?: string
  readonly VITE_OAUTH2_TOKEN_URL?: string
  readonly VITE_OAUTH2_USERINFO_URL?: string
  readonly VITE_OAUTH2_SCOPE?: string
  readonly VITE_OAUTH2_REDIRECT_URI?: string
  readonly VITE_OAUTH2_ROLES_CLAIM?: string
  readonly VITE_OAUTH2_PERMISSIONS_CLAIM?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
