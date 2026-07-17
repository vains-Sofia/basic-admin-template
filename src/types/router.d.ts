import 'vue-router'

export {}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    order?: number
    hidden?: boolean
    requiresAuth?: boolean
    roles?: string[]
    permissions?: string[]
    keepAlive?: boolean
    affix?: boolean
  }
}
