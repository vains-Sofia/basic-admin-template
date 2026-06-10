const HTTP_URL_PATTERN = /^https?:\/\//i

function normalizeBaseUrl() {
	return (import.meta.env.VITE_MINIO_BASE_URL || '').replace(/\/+$/, '')
}

export function stripMinioBaseUrl(value?: string | null) {
	if (!value) return value ?? ''

	const baseUrl = normalizeBaseUrl()
	const trimmedValue = value.trim()

	if (!baseUrl) return trimmedValue

	if (trimmedValue === baseUrl) return ''
	if (trimmedValue.startsWith(`${baseUrl}/`)) {
		return trimmedValue.slice(baseUrl.length + 1)
	}

	return trimmedValue
}

export function buildMinioUrl(value?: string | null) {
	if (!value) return ''

	const trimmedValue = value.trim()
	if (!trimmedValue || trimmedValue.startsWith('blob:') || HTTP_URL_PATTERN.test(trimmedValue)) {
		return trimmedValue
	}

	const baseUrl = normalizeBaseUrl()
	if (!baseUrl) return trimmedValue

	return `${baseUrl}/${trimmedValue.replace(/^\/+/, '')}`
}

export function buildMinioObjectPath(bucket: string, name: string) {
	return `${bucket.replace(/^\/+|\/+$/g, '')}/${name.replace(/^\/+/, '')}`
}
