export interface PageResult<T> {
  list: T[]
  total: number
}

export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}
