import { reactive } from 'vue'
import type { FormRules } from 'element-plus'

export const formRules = reactive(<FormRules>{
	storeId: [{ required: true, message: '请选择所属门店', trigger: 'change' }],
	categoryId: [{ required: true, message: '请选择菜单分类', trigger: 'change' }],
	name: [{ required: true, message: '菜品名称不能为空', trigger: 'blur' }],
	price: [{ required: true, message: '请输入菜品价格', trigger: 'blur' }],
	recommend: [{ required: true, message: '请选择推荐状态', trigger: 'change' }],
	status: [{ required: true, message: '请选择菜品状态', trigger: 'change' }],
})
