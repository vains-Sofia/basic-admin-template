import type { CategoryRequest } from '@/api/types/CategoryTypes.ts'

interface FormItemProps extends Omit<CategoryRequest, 'storeId'> {
	id?: string
	storeId?: string
	[key: string]: any
}

interface FormProps {
	formInline?: FormItemProps
}

export type { FormItemProps, FormProps }
