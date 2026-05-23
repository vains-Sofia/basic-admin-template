import type { TableInfoRequest } from '@/api/types/TableInfoTypes.ts'

interface FormItemProps extends Omit<TableInfoRequest, 'storeId'> {
    id?: string
    storeId?: string
    [key: string]: any
}

interface FormProps {
    formInline?: FormItemProps
}

export type { FormItemProps, FormProps }
