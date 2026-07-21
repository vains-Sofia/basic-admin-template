import { request } from '../http'
import type {
  SaveUserData,
  UserItem,
  UserPageResult,
  UserQuery,
  UserStatus,
} from '../types/UserTypes'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'
let mockUsers: UserItem[] = [
  {
    id: 1,
    username: 'admin',
    displayName: '系统管理员',
    email: 'admin@example.com',
    role: '管理员',
    status: 'enabled',
    createdAt: '2026-07-01 09:00',
  },
  {
    id: 2,
    username: 'editor',
    displayName: '内容编辑',
    email: 'editor@example.com',
    role: '编辑',
    status: 'enabled',
    createdAt: '2026-07-05 14:20',
  },
  {
    id: 3,
    username: 'auditor',
    displayName: '审计用户',
    email: 'audit@example.com',
    role: '审计员',
    status: 'disabled',
    createdAt: '2026-07-10 11:35',
  },
]

const delay = () => new Promise((resolve) => window.setTimeout(resolve, 250))

export async function getUsers(params: UserQuery): Promise<UserPageResult> {
  if (!useMock)
    return request<UserPageResult>({
      url: '/users',
      method: 'GET',
      params,
      skipGlobalLoading: true,
      skipErrorMessage: true,
    })
  await delay()

  const keyword = params.keyword.trim().toLowerCase()
  const filtered = mockUsers.filter((user) => {
    const matchesKeyword =
      !keyword ||
      [user.username, user.displayName, user.email].some((value) =>
        value.toLowerCase().includes(keyword),
      )
    return matchesKeyword && (!params.status || user.status === params.status)
  })
  const start = (params.page - 1) * params.pageSize
  return {
    list: structuredClone(filtered.slice(start, start + params.pageSize)),
    total: filtered.length,
  }
}

export async function createUser(data: SaveUserData): Promise<void> {
  if (!useMock) return request<void>({ url: '/users', method: 'POST', data })
  await delay()
  mockUsers.unshift({
    ...data,
    id: Date.now(),
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  })
}

export async function updateUser(id: number, data: SaveUserData): Promise<void> {
  if (!useMock) return request<void>({ url: `/users/${id}`, method: 'PUT', data })
  await delay()
  mockUsers = mockUsers.map((user) => (user.id === id ? { ...user, ...data } : user))
}

export async function updateUserStatus(id: number, status: UserStatus): Promise<void> {
  if (!useMock)
    return request<void>({ url: `/users/${id}/status`, method: 'PATCH', data: { status } })
  await delay()
  mockUsers = mockUsers.map((user) => (user.id === id ? { ...user, status } : user))
}

export async function deleteUser(id: number): Promise<void> {
  if (!useMock) return request<void>({ url: `/users/${id}`, method: 'DELETE' })
  await delay()
  mockUsers = mockUsers.filter((user) => user.id !== id)
}
