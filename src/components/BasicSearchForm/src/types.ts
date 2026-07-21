import type { BasicFormField, BasicFormModel, BasicFormProps } from '@/components/BasicForm'

export interface BasicSearchFormProps<T extends BasicFormModel = BasicFormModel>
  extends Omit<BasicFormProps<T>, 'inline'> {
  collapseThreshold?: number
  expanded?: boolean
  showExpand?: boolean
  showSearch?: boolean
  showReset?: boolean
  searchText?: string
  resetText?: string
  expandText?: string
  collapseText?: string
  loading?: boolean
  searchOnReset?: boolean
}

export type BasicSearchField<T extends BasicFormModel = BasicFormModel> = BasicFormField<T>
