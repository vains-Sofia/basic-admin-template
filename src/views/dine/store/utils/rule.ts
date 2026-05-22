import { reactive } from 'vue'
import type { FormRules } from 'element-plus'

export const formRules = reactive(<FormRules>{
	name: [{ required: true, message: '门店名称不能为空', trigger: 'blur' }],
	status: [{ required: true, message: '门店状态不能为空', trigger: 'change' }],
})
