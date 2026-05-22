import type { StoreRequest } from '@/api/types/StoreTypes.ts'

interface FormItemProps extends StoreRequest {
	id?: string
	[key: string]: any
}

interface FormProps {
	formInline?: FormItemProps
}

export type { FormItemProps, FormProps }
