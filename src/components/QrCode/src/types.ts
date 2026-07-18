import type { CornerDotType, CornerSquareType, DotType, FileExtension } from 'qr-code-styling'

export interface QrCodeProps {
  data: string
  size?: number
  image?: string
  imageSize?: number
  dotsType?: DotType
  cornersSquareType?: CornerSquareType
  cornersDotType?: CornerDotType
  background?: string
  dotsColor?: string
  showDownload?: boolean
  expired?: boolean
  onRefresh?: () => void
  loading?: boolean
  loadingText?: string
  transition?: boolean
}

export interface QrCodeExpose {
  download: (fileName?: string, extension?: FileExtension) => Promise<void>
}

export type { CornerDotType, CornerSquareType, DotType, FileExtension }
