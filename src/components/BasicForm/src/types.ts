import type { FormItemRule, FormProps } from 'element-plus'
import type { Component, Ref } from 'vue'

export type BasicFormModel = object

export type BasicFormFieldType =
  | 'input'
  | 'textarea'
  | 'password'
  | 'number'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'datetime'
  | 'date-range'
  | 'time'
  | 'cascader'
  | 'slot'

export interface BasicFormOption {
  label: string
  value: unknown
  disabled?: boolean
}

export interface BasicFormField<T extends BasicFormModel = BasicFormModel> {
  field: string & (keyof T | string)
  label?: string
  type?: BasicFormFieldType
  component?: Component
  props?: Record<string, unknown>
  options?: BasicFormOption[]
  rules?: FormItemRule | FormItemRule[]
  hidden?: boolean | ((model: T) => boolean)
  disabled?: boolean | ((model: T) => boolean)
  slot?: string
}

export interface BasicFormProps<T extends BasicFormModel = BasicFormModel> {
  model: T
  schema: BasicFormField<T>[]
  rules?: Partial<Record<string, FormItemRule | FormItemRule[]>>
  formProps?: Partial<Omit<FormProps, 'model' | 'rules'>>
  labelWidth?: string | number
  labelPosition?: 'left' | 'right' | 'top'
  inline?: boolean
  disabled?: boolean
  showMessage?: boolean
  statusIcon?: boolean
  validateOnRuleChange?: boolean
  scrollToError?: boolean
}

export interface BasicFormExpose {
  formRef: Ref<unknown>
  validate: () => Promise<boolean>
  submit: () => Promise<boolean>
  validateField: (props?: string | string[]) => Promise<boolean>
  resetFields: (props?: string | string[]) => void
  clearValidate: (props?: string | string[]) => void
  scrollToField: (prop: string) => Promise<void>
}
