export type ImageCropperModelValue = string | File

export type ImageCropperMimeType = 'image/png' | 'image/jpeg' | 'image/webp'

export interface ImageCropperProps {
  modelValue?: ImageCropperModelValue
  width?: number
  height?: number
  quality?: number
  aspectRatio?: number
  mimeType?: ImageCropperMimeType
  preserveResolution?: boolean
}
