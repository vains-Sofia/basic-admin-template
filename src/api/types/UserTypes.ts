import type { PageResult } from './CommonTypes'

export type UserStatus = 'enabled' | 'disabled'

export interface UserItem {
  id: number
  username: string
  displayName: string
  email: string
  role: string
  status: UserStatus
  createdAt: string
}

export interface UserQuery {
  keyword: string
  status: '' | UserStatus
  page: number
  pageSize: number
}

export interface SaveUserData {
  username: string
  displayName: string
  email: string
  role: string
  status: UserStatus
}

export type UserPageResult = PageResult<UserItem>
