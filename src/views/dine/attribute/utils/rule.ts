import { reactive } from 'vue'
import type { FormRules } from 'element-plus'

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
	name: [{ required: true, message: '属性名称不能为空', trigger: 'blur' }],
	groupId: [{ required: true, message: '属性组必选', trigger: 'blur' }],
})
