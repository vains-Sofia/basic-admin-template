import type { DishRequest } from '@/api/types/DishTypes.ts'

interface FormItemProps extends DishRequest {
	id?: string
	[key: string]: any
}

interface FormProps {
	formInline?: FormItemProps
}

export type { FormItemProps, FormProps }
