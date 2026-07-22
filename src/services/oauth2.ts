import type { LoginResult, UserProfile } from '@/api/types/AuthTypes'
import { DEFAULT_ROUTE, LOGIN_ROUTE, OAUTH2_CALLBACK_ROUTE } from '@/config/app'
import { getOAuth2Config, type OAuth2Config } from '@/config/oauth2'

const TRANSACTION_KEY = 'oauth2-pkce-transaction'
const TRANSACTION_MAX_AGE_MS = 10 * 60 * 1000

interface OAuth2Transaction {
  state: string
  codeVerifier: string
  returnPath: string
  createdAt: number
}

interface OAuth2TokenResponse {
  access_token?: unknown
  token_type?: unknown
  error?: unknown
  error_description?: unknown
}

export interface OAuth2CallbackParams {
  code?: string
  state?: string
  error?: string
  errorDescription?: string
}

export interface OAuth2LoginResult extends LoginResult {
  returnPath: string
}

let redirectPromise: Promise<never> | undefined

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function createRandomValue(byteLength: number): string {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  return toBase64Url(bytes)
}

async function createCodeChallenge(codeVerifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
  return toBase64Url(new Uint8Array(digest))
}

function assertValidConfig(config: OAuth2Config): void {
  const missing = [
    ['VITE_OAUTH2_CLIENT_ID', config.clientId],
    ['VITE_OAUTH2_AUTHORIZATION_URL', config.authorizationUrl],
    ['VITE_OAUTH2_TOKEN_URL', config.tokenUrl],
    ['VITE_OAUTH2_USERINFO_URL', config.userInfoUrl],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name)

  if (missing.length) throw new Error(`OAuth2 配置不完整：${missing.join('、')}`)
}

export function sanitizeReturnPath(value?: string): string {
  if (!value?.startsWith('/') || value.startsWith('//')) return DEFAULT_ROUTE

  const base = new URL('https://oauth2.local')
  const target = new URL(value, base)
  const path = `${target.pathname}${target.search}${target.hash}`
  if (target.origin !== base.origin) return DEFAULT_ROUTE
  if (target.pathname === LOGIN_ROUTE || target.pathname === OAUTH2_CALLBACK_ROUTE) {
    return DEFAULT_ROUTE
  }
  return path
}

function readTransaction(): OAuth2Transaction | null {
  const raw = sessionStorage.getItem(TRANSACTION_KEY)
  if (!raw) return null

  try {
    const transaction = JSON.parse(raw) as Partial<OAuth2Transaction>
    if (
      typeof transaction.state !== 'string' ||
      typeof transaction.codeVerifier !== 'string' ||
      typeof transaction.returnPath !== 'string' ||
      typeof transaction.createdAt !== 'number'
    ) {
      return null
    }
    return transaction as OAuth2Transaction
  } catch {
    return null
  }
}

export function getPendingOAuth2ReturnPath(): string {
  const transaction = readTransaction()
  if (!transaction || Date.now() - transaction.createdAt > TRANSACTION_MAX_AGE_MS) {
    return DEFAULT_ROUTE
  }
  return sanitizeReturnPath(transaction.returnPath)
}

export async function redirectToOAuth2(returnPath?: string): Promise<never> {
  if (redirectPromise) return redirectPromise

  redirectPromise = (async () => {
    const config = getOAuth2Config()
    assertValidConfig(config)

    const state = createRandomValue(32)
    const codeVerifier = createRandomValue(64)
    const codeChallenge = await createCodeChallenge(codeVerifier)
    const transaction: OAuth2Transaction = {
      state,
      codeVerifier,
      returnPath: sanitizeReturnPath(returnPath ?? getPendingOAuth2ReturnPath()),
      createdAt: Date.now(),
    }
    sessionStorage.setItem(TRANSACTION_KEY, JSON.stringify(transaction))

    const authorizationUrl = new URL(config.authorizationUrl)
    authorizationUrl.searchParams.set('response_type', 'code')
    authorizationUrl.searchParams.set('client_id', config.clientId)
    authorizationUrl.searchParams.set('redirect_uri', config.redirectUri)
    authorizationUrl.searchParams.set('state', state)
    authorizationUrl.searchParams.set('code_challenge', codeChallenge)
    authorizationUrl.searchParams.set('code_challenge_method', 'S256')
    if (config.scope) authorizationUrl.searchParams.set('scope', config.scope)

    window.location.assign(authorizationUrl.toString())
    return new Promise<never>(() => undefined)
  })()

  try {
    return await redirectPromise
  } catch (error) {
    redirectPromise = undefined
    throw error
  }
}

async function readJsonResponse(response: Response, fallbackMessage: string): Promise<unknown> {
  const payload = await response.json().catch(() => null)
  if (response.ok) return payload

  const oauthError = payload as OAuth2TokenResponse | null
  const message =
    (typeof oauthError?.error_description === 'string' && oauthError.error_description) ||
    (typeof oauthError?.error === 'string' && oauthError.error) ||
    fallbackMessage
  throw new Error(message)
}

async function exchangeAuthorizationCode(
  code: string,
  codeVerifier: string,
  config: OAuth2Config,
): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    code,
    redirect_uri: config.redirectUri,
    code_verifier: codeVerifier,
  })
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    credentials: 'omit',
    cache: 'no-store',
  })
  const tokenResponse = (await readJsonResponse(
    response,
    'OAuth2 授权码换取访问令牌失败',
  )) as OAuth2TokenResponse

  if (typeof tokenResponse.access_token !== 'string' || !tokenResponse.access_token) {
    throw new Error('OAuth2 令牌响应中缺少 access_token')
  }
  if (
    typeof tokenResponse.token_type === 'string' &&
    tokenResponse.token_type.toLowerCase() !== 'bearer'
  ) {
    throw new Error(`不支持的 OAuth2 token_type：${tokenResponse.token_type}`)
  }
  return tokenResponse.access_token
}

function getClaim(source: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (!value || typeof value !== 'object') return undefined
    return (value as Record<string, unknown>)[key]
  }, source)
}

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && Boolean(item))
  }
  if (typeof value === 'string') return value.split(/[\s,]+/).filter(Boolean)
  return []
}

export function mapOAuth2UserInfo(
  payload: Record<string, unknown>,
  rolesClaim = 'roles',
  permissionsClaim = 'permissions',
): UserProfile {
  const source =
    typeof payload.data === 'object' && payload.data !== null
      ? (payload.data as Record<string, unknown>)
      : payload
  const id = source.sub ?? source.id
  if (typeof id !== 'string' && typeof id !== 'number') {
    throw new Error('OAuth2 用户信息中缺少 sub 或 id')
  }

  const username = source.preferred_username ?? source.username ?? source.email ?? id
  const displayName = source.name ?? source.displayName ?? username
  return {
    id,
    username: String(username),
    displayName: String(displayName),
    roles: toStringList(getClaim(source, rolesClaim)),
    permissions: toStringList(getClaim(source, permissionsClaim)),
  }
}

async function fetchUserProfile(accessToken: string, config: OAuth2Config): Promise<UserProfile> {
  const response = await fetch(config.userInfoUrl, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
    credentials: 'omit',
    cache: 'no-store',
  })
  const payload = await readJsonResponse(response, 'OAuth2 用户信息获取失败')
  if (!payload || typeof payload !== 'object') throw new Error('OAuth2 用户信息响应格式无效')
  return mapOAuth2UserInfo(
    payload as Record<string, unknown>,
    config.rolesClaim,
    config.permissionsClaim,
  )
}

export async function completeOAuth2Login(
  params: OAuth2CallbackParams,
): Promise<OAuth2LoginResult> {
  const transaction = readTransaction()
  sessionStorage.removeItem(TRANSACTION_KEY)

  if (params.error) {
    throw new Error(params.errorDescription || `OAuth2 授权失败：${params.error}`)
  }
  if (!transaction) throw new Error('OAuth2 登录会话不存在或已失效，请重新登录')
  if (Date.now() - transaction.createdAt > TRANSACTION_MAX_AGE_MS) {
    throw new Error('OAuth2 登录会话已过期，请重新登录')
  }
  if (!params.state || params.state !== transaction.state) {
    throw new Error('OAuth2 state 校验失败，请重新登录')
  }
  if (!params.code) throw new Error('OAuth2 回调中缺少授权码')

  const config = getOAuth2Config()
  assertValidConfig(config)
  const token = await exchangeAuthorizationCode(params.code, transaction.codeVerifier, config)
  const profile = await fetchUserProfile(token, config)
  return { token, profile, returnPath: sanitizeReturnPath(transaction.returnPath) }
}
