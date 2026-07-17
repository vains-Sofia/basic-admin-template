import { request } from '../http'
import type { EmailLoginData, LoginData, LoginResult } from '../types/AuthTypes'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

export async function login(data: LoginData): Promise<LoginResult> {
  if (!useMock) {
    return request<LoginResult>({ url: '/auth/login', method: 'POST', data })
  }

  await new Promise((resolve) => window.setTimeout(resolve, 350))

  const accounts: Record<string, { password: string; result: LoginResult }> = {
    admin: {
      password: 'admin123',
      result: {
        token: 'mock-admin-token',
        profile: {
          id: 1,
          username: 'admin',
          displayName: '系统管理员',
          roles: ['admin'],
          permissions: ['*'],
        },
      },
    },
    editor: {
      password: 'editor123',
      result: {
        token: 'mock-editor-token',
        profile: {
          id: 2,
          username: 'editor',
          displayName: '内容编辑',
          roles: ['editor'],
          permissions: ['dashboard:view'],
        },
      },
    },
  }

  const account = accounts[data.username]
  if (!account || account.password !== data.password) throw new Error('用户名或密码错误')

  return structuredClone(account.result)
}

export async function logout(): Promise<void> {
  if (useMock) return
  await request<void>({ url: '/auth/logout', method: 'POST' })
}

export async function sendEmailCode(email: string): Promise<void> {
  if (!useMock) {
    await request<void>({ url: '/auth/email/code', method: 'POST', data: { email } })
    return
  }

  await new Promise((resolve) => window.setTimeout(resolve, 350))
}

export async function loginByEmail(data: EmailLoginData): Promise<LoginResult> {
  if (!useMock) {
    return request<LoginResult>({ url: '/auth/email/login', method: 'POST', data })
  }

  await new Promise((resolve) => window.setTimeout(resolve, 350))
  if (data.email !== 'admin@example.com' || data.code !== '123456') {
    throw new Error('邮箱或验证码错误')
  }

  return {
    token: 'mock-admin-token',
    profile: {
      id: 1,
      username: 'admin',
      displayName: '系统管理员',
      roles: ['admin'],
      permissions: ['*'],
    },
  }
}
