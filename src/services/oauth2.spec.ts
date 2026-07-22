// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  completeOAuth2Login,
  getPendingOAuth2ReturnPath,
  mapOAuth2UserInfo,
  sanitizeReturnPath,
} from './oauth2'

afterEach(() => {
  sessionStorage.clear()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('OAuth2 PKCE helpers', () => {
  it('only accepts local application return paths', () => {
    expect(sanitizeReturnPath('/system/users?page=2#results')).toBe('/system/users?page=2#results')
    expect(sanitizeReturnPath('//attacker.example/path')).toBe('/dashboard')
    expect(sanitizeReturnPath('https://attacker.example/path')).toBe('/dashboard')
    expect(sanitizeReturnPath('/oauth2/callback?code=secret')).toBe('/dashboard')
    expect(sanitizeReturnPath('/login')).toBe('/dashboard')
  })

  it('maps standard UserInfo and configurable nested claims', () => {
    expect(
      mapOAuth2UserInfo(
        {
          sub: 'user-42',
          preferred_username: 'alice',
          name: 'Alice',
          realm_access: { roles: ['admin'] },
          authorization: { permissions: 'dashboard:view users:view' },
        },
        'realm_access.roles',
        'authorization.permissions',
      ),
    ).toEqual({
      id: 'user-42',
      username: 'alice',
      displayName: 'Alice',
      roles: ['admin'],
      permissions: ['dashboard:view', 'users:view'],
    })
  })

  it('accepts the existing API response envelope for user information', () => {
    expect(
      mapOAuth2UserInfo({
        code: 0,
        data: {
          id: 7,
          username: 'operator',
          displayName: 'Operator',
          roles: ['editor'],
          permissions: ['dashboard:view'],
        },
      }),
    ).toMatchObject({ id: 7, username: 'operator', displayName: 'Operator' })
  })

  it('rejects user information without a stable identifier', () => {
    expect(() => mapOAuth2UserInfo({ name: 'Anonymous' })).toThrow('缺少 sub 或 id')
  })

  it('keeps the original business return path while the user signs in locally', () => {
    sessionStorage.setItem(
      'oauth2-pkce-transaction',
      JSON.stringify({
        state: 'state',
        codeVerifier: 'verifier',
        returnPath: '/system/users?page=3',
        createdAt: Date.now(),
      }),
    )

    expect(getPendingOAuth2ReturnPath()).toBe('/system/users?page=3')
  })

  it('exchanges the code once and loads UserInfo with the access token', async () => {
    vi.stubEnv('VITE_OAUTH2_CLIENT_ID', 'spa-client')
    vi.stubEnv('VITE_OAUTH2_AUTHORIZATION_URL', 'https://identity.example/authorize')
    vi.stubEnv('VITE_OAUTH2_TOKEN_URL', 'https://identity.example/token')
    vi.stubEnv('VITE_OAUTH2_USERINFO_URL', 'https://identity.example/userinfo')
    sessionStorage.setItem(
      'oauth2-pkce-transaction',
      JSON.stringify({
        state: 'expected-state',
        codeVerifier: 'expected-verifier',
        returnPath: '/system/users?page=2',
        createdAt: Date.now(),
      }),
    )
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'access-token', token_type: 'Bearer' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sub: 'user-7',
            preferred_username: 'operator',
            name: 'Operator',
            roles: ['admin'],
            permissions: ['*'],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )

    const result = await completeOAuth2Login({
      code: 'authorization-code',
      state: 'expected-state',
    })

    expect(result).toMatchObject({ token: 'access-token', returnPath: '/system/users?page=2' })
    const tokenRequest = fetchMock.mock.calls[0]
    expect(tokenRequest?.[0]).toBe('https://identity.example/token')
    const tokenBody = tokenRequest?.[1]?.body as URLSearchParams
    expect(tokenBody.get('grant_type')).toBe('authorization_code')
    expect(tokenBody.get('code')).toBe('authorization-code')
    expect(tokenBody.get('code_verifier')).toBe('expected-verifier')
    expect(tokenBody.get('client_id')).toBe('spa-client')
    expect(fetchMock.mock.calls[1]?.[1]?.headers).toMatchObject({
      Authorization: 'Bearer access-token',
    })
    expect(sessionStorage.getItem('oauth2-pkce-transaction')).toBeNull()
  })
})
