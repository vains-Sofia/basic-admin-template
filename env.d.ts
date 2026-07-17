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
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
