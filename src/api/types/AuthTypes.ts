export interface LoginData {
  username: string
  password: string
}

export interface UserProfile {
  id: number
  username: string
  displayName: string
  roles: string[]
  permissions: string[]
}

export interface LoginResult {
  token: string
  profile: UserProfile
}
