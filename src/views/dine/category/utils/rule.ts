import { reactive } from 'vue'
import type { FormRules } from 'element-plus'

export const formRules = reactive(<FormRules>{
	storeId: [{ required: true, message: '请选择所属门店', trigger: 'change' }],
	name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
})
